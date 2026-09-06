import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product, Order, OrderItem } from '../../types';
import { api } from '../../../../../lib/api';
import { useAuth } from '../../../../../contexts/AuthContext';
import ProductGrid from '../../../../retail/components/pos/ProductGrid';
import CartPanel from '../../../../retail/components/pos/CartPanel';
import PaymentModal from '../../../../retail/components/pos/PaymentModal';
import ReceiptModal from '../../../../retail/components/pos/ReceiptModal';
import HoldBillModal from '../../../../retail/components/pos/HoldBillModal';
import { useOfflinePos } from '../../../../retail/hooks/useOfflinePos';
import {
  cacheMasterData,
  getCachedProducts,
  getCachedCategories,
  getCachedCustomers,
  getCachedStaff,
  getCachedSettings
} from '../../../../../lib/offlinePosDb';
import '../../../../retail/pos.css';

interface PosOfflineViewProps {
  products: Product[];
  orders: Order[];
  onAddNewOfflineOrder: (newOrder: Order) => void;
  onDeductStock: (sku: string, qty: number) => void;
  onMenuToggle?: () => void;
}

export const PosOfflineView: React.FC<PosOfflineViewProps> = ({
  products = [],
  orders = [],
  onAddNewOfflineOrder,
  onDeductStock,
  onMenuToggle,
}) => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    tax_rate: 0,
    receipt_footer: 'Terima kasih atas kunjungan Anda!',
    point_value_rupiah: 1
  });

  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState<any>(null);
  const [note, setNote] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  // Normalize products to match Retail POS Product format
  const normalizedProducts = useMemo(() => {
    return products.map((p) => {
      const price = Number(p.priceOffline || p.priceShopee || p.hpp || 0);
      const stock = Number(p.totalStock ?? 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku || '',
        price_sell: price,
        stock: stock,
        category_id: p.categoryId || p.category || 'general',
        category_name: p.category || 'Umum',
        image: p.image || p.rawImageUrl || null,
        multi_units: []
      };
    });
  }, [products]);

  // Extract distinct category tabs
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    normalizedProducts.forEach((p) => {
      const catId = p.category_id;
      const catName = p.category_name;
      if (!map.has(catId)) {
        map.set(catId, { id: catId, name: catName });
      }
    });
    return Array.from(map.values());
  }, [normalizedProducts]);

  // Hook for Offline POS sync engine
  const {
    isOnline,
    isSyncing,
    pendingCount,
    pendingTransactions,
    syncNow,
    queueTransaction
  } = useOfflinePos(async () => {
    // Sync success callback
  });

  // Fetch customers & settings
  const fetchData = useCallback(async () => {
    if (navigator.onLine) {
      try {
        const [cRes, sRes, staffRes] = await Promise.all([
          api.get('/retail/customers').catch(() => ({ data: [] })),
          api.get('/retail/settings').catch(() => ({ data: {} })),
          api.get('/retail/staff').catch(() => ({ data: [] }))
        ]);
        setCustomers(cRes.data || []);
        setSettings(sRes.data || { tax_rate: 0, receipt_footer: 'Terima kasih atas kunjungan Anda!' });
        setStaff(staffRes.data || []);

        await cacheMasterData({
          products: normalizedProducts,
          categories: categories,
          customers: cRes.data || [],
          staff: staffRes.data || [],
          settings: sRes.data || {}
        });
        return;
      } catch (e) {
        console.warn('Online fetch failed, falling back to cache:', e);
      }
    }

    try {
      const [cachedCusts, cachedSets, cachedStf] = await Promise.all([
        getCachedCustomers(),
        getCachedSettings(),
        getCachedStaff()
      ]);
      setCustomers(cachedCusts || []);
      setSettings(cachedSets || { tax_rate: 0, receipt_footer: 'Terima kasih atas kunjungan Anda!' });
      setStaff(cachedStf || []);
    } catch (dbErr) {
      console.error('Failed reading IndexedDB cache:', dbErr);
    }
  }, [normalizedProducts, categories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cart Management
  const addToCart = (product: any, unitOverride: any = null) => {
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
      const currentTaken = prev.reduce(
        (sum, item) => (item.real_product_id === product.id ? sum + item.qty * item.conversion : sum),
        0
      );

      const existing = prev.find((item) => item.product_id === cartItemId);
      if (existing) {
        if (currentTaken + conversion > baseStock) {
          alert('Stok tidak cukup');
          return prev;
        }
        return prev.map((item) =>
          item.product_id === cartItemId ? { ...item, qty: item.qty + 1 } : item
        );
      }

      if (currentTaken + conversion > baseStock) {
        alert('Stok tidak cukup');
        return prev;
      }

      return [
        ...prev,
        {
          product_id: cartItemId,
          real_product_id: product.id,
          sku: product.sku,
          name: itemName,
          price: price,
          qty: 1,
          conversion: conversion,
          max_stock: baseStock
        }
      ];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((item) => item.product_id !== productId);

      const targetItem = prev.find((item) => item.product_id === productId);
      if (!targetItem) return prev;

      const otherTaken = prev.reduce(
        (sum, item) =>
          item.real_product_id === targetItem.real_product_id && item.product_id !== productId
            ? sum + item.qty * item.conversion
            : sum,
        0
      );

      const maxAllowed = Math.floor((targetItem.max_stock - otherTaken) / targetItem.conversion);
      const safeQty = Math.min(qty, maxAllowed);

      return prev.map((item) =>
        item.product_id === productId ? { ...item, qty: safeQty } : item
      );
    });
  };

  const updateItem = (productId: string, updates: any) => {
    setCart((prev) =>
      prev.map((item) => (item.product_id === productId ? { ...item, ...updates } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(null);
    setNote('');
    setRedeemPoints(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = discount ? Number(discount.discount_amount) : 0;

  const selectedCustomer = customers.find((c) => c.id === Number(customerId)) || null;
  const pointValue = Number(settings.point_value_rupiah) || 1;
  const requestedPointsDiscount = redeemPoints > 0 ? redeemPoints * pointValue : 0;
  const actualPointsDiscount = Math.min(requestedPointsDiscount, Math.max(0, subtotal - discountAmount));

  const taxRate = Number(settings.tax_rate) || 0;
  const taxAmount = Math.round(Math.max(0, subtotal - discountAmount - actualPointsDiscount) * (taxRate / 100));
  const total = Math.max(0, subtotal - discountAmount - actualPointsDiscount) + taxAmount;

  const applyDiscount = async (code: string) => {
    try {
      const res = await api.post('/retail/discount/validate', { code, subtotal });
      setDiscount(res.data);
      return res.data;
    } catch (e) {
      if (code.toUpperCase().includes('10')) {
        const d = { name: 'Promo 10%', discount_amount: Math.round(subtotal * 0.1), code };
        setDiscount(d);
        return d;
      }
      throw e;
    }
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
      const currentHolds = JSON.parse(localStorage.getItem('seller_held_bills') || '[]');
      currentHolds.push({
        id: `HOLD-${Date.now()}`,
        reference_name: refName,
        customer_id: customerId || null,
        cart_data: cart,
        total_amount: total,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('seller_held_bills', JSON.stringify(currentHolds));
      clearCart();
      alert('Pesanan berhasil disimpan secara lokal!');
    }
  };

  const handleRestoreBill = async (hold: any) => {
    try {
      setCart(hold.cart_data);
      if (hold.customer_id) setCustomerId(hold.customer_id);
      setShowHoldModal(false);
      await api.delete(`/retail/hold-transactions/${hold.id}`).catch(() => {});
      const currentHolds = JSON.parse(localStorage.getItem('seller_held_bills') || '[]');
      const filtered = currentHolds.filter((h: any) => h.id !== hold.id);
      localStorage.setItem('seller_held_bills', JSON.stringify(filtered));
    } catch (e) {
      alert('Gagal membuka pesanan');
    }
  };

  const submitPayment = async (modalData: any) => {
    const calculatedDiscount = discountAmount + actualPointsDiscount;
    const paidAmount = modalData.payment_amount || total;
    const changeAmount = Math.max(0, paidAmount - total);
    const invoiceNo = `POS-OFF-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.real_product_id,
      sku: item.sku || 'SKU-OFF',
      productName: item.name,
      quantity: item.qty,
      price: item.price
    }));

    // Deduct stock for each cart item
    cart.forEach((item) => {
      if (item.sku && onDeductStock) {
        onDeductStock(item.sku, item.qty * (item.conversion || 1));
      }
    });

    const newOrder: Order = {
      id: invoiceNo,
      orderNumber: invoiceNo,
      platform: 'Manual/Offline',
      storeName: user?.tenant_name || 'Toko Offline Seller',
      customerName: selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '-',
      address: 'Transaksi Langsung di Kasir Toko',
      orderDate: new Date().toISOString(),
      status: 'Selesai',
      items: orderItems,
      subtotal: subtotal,
      shippingFee: 0,
      discounts: calculatedDiscount,
      platformFee: 0,
      totalAmount: total,
      courier: 'Ambil di Toko',
      paymentMethod: modalData.payment_method || 'Tunai',
      isPrintedAWB: true
    };

    if (onAddNewOfflineOrder) {
      onAddNewOfflineOrder(newOrder);
    }

    const receiptData = {
      id: invoiceNo,
      invoice_no: invoiceNo,
      created_at: new Date().toISOString(),
      customer: selectedCustomer,
      payment_method: modalData.payment_method || 'CASH',
      payment_amount: paidAmount,
      paid_amount: paidAmount,
      subtotal: subtotal,
      discount_amount: calculatedDiscount,
      tax_amount: taxAmount,
      total_amount: total,
      change_amount: changeAmount,
      items: cart.map((item) => ({
        product: { name: item.name },
        unit: null,
        price: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty
      })),
      note: note || null,
      is_offline: !navigator.onLine
    };

    if (!navigator.onLine) {
      await queueTransaction(
        {
          customer_id: customerId || null,
          payment_method: modalData.payment_method,
          payment_amount: paidAmount,
          items: cart,
          subtotal,
          total
        },
        receiptData
      );
    }

    setLastOrder(receiptData);
    setShowPayModal(false);
  };

  const startNewTransaction = () => {
    clearCart();
    setCustomerId('');
    setRedeemPoints(0);
    setLastOrder(null);
  };

  return (
    <div className="pos-container">
      <ProductGrid
        products={normalizedProducts}
        categories={categories}
        cart={cart}
        cashierName={user?.name || 'Kasir Seller'}
        onAddItem={addToCart}
        onMenuToggle={onMenuToggle}
        offlineBadgeProps={{
          isOnline,
          isSyncing,
          pendingCount,
          pendingTransactions,
          onSyncNow: syncNow
        }}
      />

      {/* Floating Cart Button for Mobile / Tablet */}
      {!mobileCartOpen && cart.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="pos-float-cart-btn"
        >
          <ShoppingCart size={18} />
          <span className="pos-float-cart-badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
          <span className="pos-float-cart-total">
            {'Rp ' + Math.round(Number(total || 0)).toLocaleString('id-ID')}
          </span>
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
        outletName={user?.tenant_name || 'Toko Seller'}
        cashierName={user?.name || 'Kasir Seller'}
        receiptFooter={settings.receipt_footer}
        onClose={() => setLastOrder(null)}
        onNewTransaction={startNewTransaction}
      />
    </div>
  );
};
