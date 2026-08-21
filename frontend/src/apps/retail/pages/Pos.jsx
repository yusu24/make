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
import HoldBillModal from '../components/pos/HoldBillModal';
import '../pos.css';

export default function Pos() {
  const { user } = useAuth();
  const { onMenuToggle } = useOutletContext() || {};

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [settings, setSettings] = useState({ tax_rate: 0, receipt_footer: '' });
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [note, setNote] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes, catRes, sRes, staffRes] = await Promise.all([
        api.get('/retail/products'),
        api.get('/retail/customers'),
        api.get('/retail/categories'),
        api.get('/retail/settings'),
        api.get('/retail/staff')
      ]);
      setProducts(pRes.data);
      setCustomers(cRes.data);
      setCategories(catRes.data);
      setSettings(sRes.data);
      setStaff(staffRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addToCart = (product, unitOverride = null) => {
    const baseStock = Number(product.stock) || 0;
    const conversion = unitOverride ? Number(unitOverride.conversion || 1) : 1;
    if (baseStock < conversion) {
       alert('Stok tidak cukup');
       return;
    }
    
    const cartItemId = unitOverride ? `${product.id}-${unitOverride.unit}` : product.id;
    const itemName = unitOverride ? `${product.name} (${unitOverride.unit})` : product.name;
    const price = unitOverride ? Number(unitOverride.price_sell) : Number(product.price_sell);

    setCart((prev) => {
      // Calculate how much base stock is currently taken by this real_product_id across all variations in cart
      const currentTakenBase = prev.reduce((sum, item) => (item.real_product_id === product.id) ? sum + (item.qty * item.conversion) : sum, 0);

      const existing = prev.find((item) => item.product_id === cartItemId);
      if (existing) {
        if (currentTakenBase + conversion > baseStock) {
           alert('Stok tidak cukup');
           return prev;
        }
        return prev.map((item) => item.product_id === cartItemId ? { ...item, qty: item.qty + 1 } : item);
      }

      if (currentTakenBase + conversion > baseStock) {
         alert('Stok tidak cukup');
         return prev;
      }

      return [...prev, { 
         product_id: cartItemId, 
         real_product_id: product.id,
         name: itemName, 
         price: price, 
         qty: 1, 
         conversion: conversion,
         max_stock: baseStock // Keep reference to baseStock
      }];
    });
  };

  const updateQty = (productId, qty) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((item) => item.product_id !== productId);
      
      const targetItem = prev.find(item => item.product_id === productId);
      if (!targetItem) return prev;

      // Calculate base stock used by OTHER items of the same product
      const otherTakenBase = prev.reduce((sum, item) => 
         (item.real_product_id === targetItem.real_product_id && item.product_id !== productId) ? sum + (item.qty * item.conversion) : sum, 0);

      const maxAllowedQty = Math.floor((targetItem.max_stock - otherTakenBase) / targetItem.conversion);
      const safeQty = Math.min(qty, maxAllowedQty);

      return prev.map((item) => item.product_id === productId
        ? { ...item, qty: safeQty }
        : item);
    });
  };

  const updateItem = (productId, updates) => {
    setCart((prev) => prev.map((item) => item.product_id === productId ? { ...item, ...updates } : item));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(null);
    setNote('');
    setRedeemPoints(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = discount ? Number(discount.discount_amount) : 0;

  const selectedCustomer = customers.find(c => c.id === Number(customerId)) || null;
  const pointValue = Number(settings.point_value_rupiah) || 1;
  const requestedPointsDiscount = (redeemPoints > 0) ? (redeemPoints * pointValue) : 0;
  const actualPointsDiscount = Math.min(requestedPointsDiscount, Math.max(0, subtotal - discountAmount));

  const taxRate = Number(settings.tax_rate) || 0;
  const taxAmount = Math.round(Math.max(0, subtotal - discountAmount - actualPointsDiscount) * (taxRate / 100));
  const total = Math.max(0, subtotal - discountAmount - actualPointsDiscount) + taxAmount;

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

  const handleHoldBill = async () => {
    if (cart.length === 0) return;
    const refName = prompt('Masukkan nama/keterangan untuk pesanan ini:');
    if (!refName) return;

    try {
      await api.post('/retail/hold-transactions', {
        reference_name: refName,
        customer_id: customerId || null,
        cart_data: cart,
        total_amount: total
      });
      clearCart();
      alert('Pesanan berhasil disimpan!');
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan pesanan.');
    }
  };

  const handleRestoreBill = async (hold) => {
    try {
      setCart(hold.cart_data);
      if (hold.customer_id) {
        setCustomerId(hold.customer_id);
      }
      setShowHoldModal(false);
      await api.delete(`/retail/hold-transactions/${hold.id}`);
    } catch (e) {
      console.error(e);
      alert('Gagal membuka pesanan');
    }
  };

  const submitPayment = async (modalData) => {
    const payload = {
      customer_id: customerId || null,
      payment_method: modalData.payment_method,
      payment_amount: modalData.payment_amount,
      payment_methods: modalData.payment_methods,
      sales_id: modalData.sales_id,
      redeem_points: redeemPoints || 0,
      discount_code: discount?.code || null,
      note: note || null,
      items: cart.map((item) => {
        // If it's a multi-unit item, extract the unit name from product_id "12-Box" -> "Box"
        const isMultiUnit = typeof item.product_id === 'string' && item.product_id.includes('-');
        const unitName = isMultiUnit ? item.product_id.split('-').slice(1).join('-') : null;
        return { 
          product_id: item.real_product_id, 
          qty: item.qty,
          unit: unitName,
          conversion: item.conversion,
          batch_no: item.batch_no || null,
          serial_number: item.serial_number || null
        };
      }),
    };
    const res = await api.post('/retail/transactions', payload);
    setLastOrder(res.data);
    setShowPayModal(false);
    fetchData();
  };

  const startNewTransaction = () => {
    clearCart();
    setCustomerId('');
    setRedeemPoints(0);
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
          <span className="pos-float-cart-total">{'Rp ' + Math.round(Number(total || 0)).toLocaleString('id-ID')}</span>
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
        onUpdateItem={updateItem}
        onApplyDiscount={applyDiscount}
        onRemoveDiscount={removeDiscount}
        onSetNote={setNote}
        onClearCart={clearCart}
        onCheckout={() => setShowPayModal(true)}
        onHoldBill={handleHoldBill}
        onShowHoldList={() => setShowHoldModal(true)}
        onClose={() => setMobileCartOpen(false)}
        className={mobileCartOpen ? 'open' : ''}
      />

      {showHoldModal && (
        <HoldBillModal 
          onClose={() => setShowHoldModal(false)} 
          onRestore={handleRestoreBill} 
        />
      )}

      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        total={total}
        subtotal={subtotal}
        discount={discount}
        customer={selectedCustomer}
        settings={settings}
        staff={staff}
        redeemPoints={redeemPoints}
        setRedeemPoints={setRedeemPoints}
        pointsDiscountAmount={actualPointsDiscount}
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
