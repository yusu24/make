import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import RetailLoading from '../components/RetailLoading';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import PaymentModal from '../components/pos/PaymentModal';
import ReceiptModal from '../components/pos/ReceiptModal';
import '../pos.css';

export default function Pos() {
  const { user } = useAuth();
  const { onMenuToggle } = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({ tax_rate: 0, receipt_footer: '' });
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [note, setNote] = useState('');
  const [customerId, setCustomerId] = useState('');

  const [showPayModal, setShowPayModal] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes, catRes, sRes] = await Promise.all([
        api.get('/retail/products'),
        api.get('/retail/customers'),
        api.get('/retail/categories'),
        api.get('/retail/settings'),
      ]);
      setProducts(pRes.data);
      setCustomers(cRes.data);
      setCategories(catRes.data);
      setSettings(sRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addToCart = (product) => {
    const stock = Number(product.stock) || 0;
    if (stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.qty >= stock) return prev;
        return prev.map((item) => item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, price: Number(product.price_sell), qty: 1, max_stock: stock }];
    });
  };

  const updateQty = (productId, qty) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((item) => item.product_id !== productId);
      return prev.map((item) => item.product_id === productId
        ? { ...item, qty: Math.min(qty, item.max_stock) }
        : item);
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(null);
    setNote('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = discount ? Number(discount.discount_amount) : 0;
  const taxRate = Number(settings.tax_rate) || 0;
  const taxAmount = Math.round(Math.max(0, subtotal - discountAmount) * (taxRate / 100));
  const total = Math.max(0, subtotal - discountAmount) + taxAmount;

  // Auto-drop the discount if the cart no longer meets its minimum purchase requirement.
  useEffect(() => {
    if (discount && subtotal < Number(discount.min_purchase || 0)) {
      setDiscount(null);
    }
  }, [subtotal, discount]);

  const applyDiscount = async (code) => {
    const res = await api.post('/retail/discount/validate', { code, subtotal });
    setDiscount(res.data);
    return res.data;
  };

  const removeDiscount = () => setDiscount(null);

  const submitPayment = async ({ payment_method, payment_amount }) => {
    const payload = {
      customer_id: customerId || null,
      payment_method,
      payment_amount,
      discount_code: discount?.code || null,
      note: note || null,
      items: cart.map((item) => ({ product_id: item.product_id, qty: item.qty })),
    };
    const res = await api.post('/retail/transactions', payload);
    setLastOrder(res.data);
    setShowPayModal(false);
    fetchData();
  };

  const startNewTransaction = () => {
    clearCart();
    setCustomerId('');
    setLastOrder(null);
  };

  if (loading) return <div className="pos-container"><RetailLoading text="Menyiapkan kasir..." /></div>;

  return (
    <div className="pos-container">
      <ProductGrid
        products={products}
        categories={categories}
        cart={cart}
        cashierName={user?.name}
        onAddItem={addToCart}
        onMenuToggle={onMenuToggle}
      />

      {/* Floating cart button — hanya tampil di mobile/tablet saat drawer tertutup */}
      {!mobileCartOpen && cart.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="pos-float-cart-btn"
        >
          <ShoppingCart size={18} />
          <span className="pos-float-cart-badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          <span className="pos-float-cart-total">{'Rp ' + total.toLocaleString('id-ID')}</span>
        </button>
      )}

      {/* Backdrop overlay for mobile cart drawer */}
      <div
        className={`pos-cart-backdrop ${mobileCartOpen ? 'open' : ''}`}
        onClick={() => setMobileCartOpen(false)}
        aria-hidden="true"
      />

      <CartPanel
        items={cart}
        discount={discount}
        note={note}
        taxRate={taxRate}
        subtotal={subtotal}
        discountAmount={discountAmount}
        taxAmount={taxAmount}
        total={total}
        customers={customers}
        customerId={customerId}
        onCustomerChange={setCustomerId}
        onUpdateQty={updateQty}
        onApplyDiscount={applyDiscount}
        onRemoveDiscount={removeDiscount}
        onSetNote={setNote}
        onClearCart={clearCart}
        onCheckout={() => setShowPayModal(true)}
        onClose={() => setMobileCartOpen(false)}
        className={mobileCartOpen ? 'open' : ''}
      />

      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        total={total}
        subtotal={subtotal}
        discount={discount}
        onSubmit={submitPayment}
      />

      <ReceiptModal
        isOpen={!!lastOrder}
        order={lastOrder}
        outletName={user?.tenant_name}
        cashierName={user?.name}
        receiptFooter={settings.receipt_footer}
        onClose={() => setLastOrder(null)}
        onNewTransaction={startNewTransaction}
      />
    </div>
  );
}
