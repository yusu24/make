import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { 
  ShoppingBag, ShoppingCart, User, Plus, Minus, CreditCard, 
  Banknote, QrCode, CheckCircle2, Printer, History, 
  UserPlus, Timer, ArrowLeft, Trash2, ArrowRight, ChevronDown, RotateCcw, Clock, FileText, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../../components/Modal';
import { PosSkeleton } from '../../../components/Skeleton';
import '../pos.css';

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('%');
  const [usePPN, setUsePPN] = useState(false);
  const [parkedCarts, setParkedCarts] = useState([]);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(null);
  const [focusedProductIndex, setFocusedProductIndex] = useState(-1);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const searchRef = useRef(null);

  const fetchData = async () => {
    try {
      const [pRes, cRes, catRes] = await Promise.all([
        api.get('/retail/products'),
        api.get('/retail/customers'),
        api.get('/retail/categories')
      ]);
      setProducts(pRes.data);
      setCustomers(cRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    const handleKey = (e) => {
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
    };
    const closeDropdown = () => setIsCustomerDropdownOpen(false);

    window.addEventListener('keydown', handleKey);
    document.addEventListener('click', closeDropdown);
    
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
         if (existing.qty >= product.stock) return prev;
         return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  const reduceQty = (id) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(item => item.id !== id);
      return prev.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item);
    });
  }

  const parkCart = () => {
    if (cart.length === 0) return;
    setParkedCarts([{ id: Date.now(), items: [...cart], time: new Date().toLocaleTimeString(), total: subtotal }, ...parkedCarts]);
    setCart([]); setCustomerId(''); setDiscount(0);
  };

  const retrieveCart = (hold) => {
    setCart(hold.items);
    setParkedCarts(prev => prev.filter(h => h.id !== hold.id));
  };

  const finalizeTransaction = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const payload = {
        total_amount: totalAfterDiscount,
        customer_id: customerId || null,
        payment_method: payMethod,
        paid_amount: payAmount,
        change_amount: change,
        discount_amount: discount,
        items: cart.map(item => ({ id: item.id, qty: item.qty, price: item.price_sell }))
      };

      if (payAmount < totalAfterDiscount) {
        alert('Jumlah bayar tidak cukup!');
        setIsProcessing(false);
        return;
      }

      const res = await api.post('/retail/transactions', payload);
      setLastSuccess(res.data);
      setShowPayModal(false); setCart([]); setCustomerId(''); setDiscount(0);
      fetchData(); 
    } catch (e) {
      alert('Error: ' + (e.response?.data?.message || e.message));
    } finally {
      setIsProcessing(false);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price_sell) * item.qty), 0);
  const discountAmount = discountType === '%' ? (subtotal * (discount || 0) / 100) : (discount || 0);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const ppnAmount = usePPN ? (afterDiscount * 0.11) : 0;
  const totalAfterDiscount = Math.max(0, afterDiscount + ppnAmount);
  const change = Math.max(0, payAmount - totalAfterDiscount);
  const filteredProducts = products.filter(p => {
    const mSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const mCat = activeCategory === 'all' || p.category_id === Number(activeCategory);
    return mSearch && mCat;
  });

  const displayedProducts = filteredProducts.slice(0, 24);

  useEffect(() => {
    setFocusedProductIndex(-1);
  }, [search, activeCategory]);

  useEffect(() => {
    const handleArrowKeys = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (showPayModal) return;
      if (!displayedProducts || displayedProducts.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedProductIndex(prev => prev < displayedProducts.length - 1 ? prev + 1 : prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedProductIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedProductIndex(prev => {
           const next = prev + 4;
           return next < displayedProducts.length ? next : displayedProducts.length - 1;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedProductIndex(prev => {
           const next = prev - 4;
           return next >= 0 ? next : 0;
        });
      } else if (e.key === 'Enter') {
        if (focusedProductIndex >= 0 && focusedProductIndex < displayedProducts.length) {
           e.preventDefault();
           addToCart(displayedProducts[focusedProductIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [displayedProducts, focusedProductIndex, showPayModal]);

  if (loading) return <div className="pos-container"><PosSkeleton /></div>;

  return (
    <div className="pos-container">
      {/* ── LEFT: PRODUCTS ── */}
      <div className="pos-left">
        <div className="pos-search-card">
          <div className="pos-search-bar">
            <input 
              ref={searchRef}
              type="text" 
              placeholder="Cari produk (F2)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="pos-category-tabs">
            <button 
              className={`pos-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Semua produk
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`pos-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="pos-grid">
          {loading ? (
             Array(12).fill(0).map((_, i) => (
               <div key={i} className="pos-card" style={{ height: '280px', opacity: 0.5, background: '#fff' }}></div>
             ))
          ) : displayedProducts.map((p, idx) => {
             const catName = categories.find(c => c.id === p.category_id)?.name || 'Produk';
             return (
               <div key={p.id} className="pos-card" onClick={() => addToCart(p)}>
                 <div className="pos-card-img">
                    <img loading="lazy" src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&idx=${p.id}`} alt={p.name} />
                    <div className="pos-card-badge">{catName}</div>
                 </div>
                 <div className="pos-card-body">
                    <h4 className="pos-card-title">{p.name}</h4>
                    <div className="pos-card-sku">{p.sku}</div>
                    <div className="pos-card-price">Rp {Number(p.price_sell).toLocaleString()}</div>
                    <div className="pos-card-stock">Stok: {p.stock}</div>
                    <button className="pos-card-add"><Plus size={18} strokeWidth={3} /></button>
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* ── RIGHT: CART ── */}
      <div className="pos-right">
        <div className="pos-sidebar-header">
           <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#1E293B', margin: 0 }}>Ringkasan Pembayaran</h2>
           <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
             {cart.length} Item
           </span>
        </div>

        <div className="pos-sidebar-body">
           <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '16px', letterSpacing: '0.02em' }}>Item dipilih</h3>
           {cart.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px 0', color: '#CBD5E1' }}>
                <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontWeight: 600 }}>Keranjang masih kosong</p>
             </div>
           ) : (
             <div className="pos-cart-list">
               {cart.map(item => (
                 <div key={item.id} className="pos-cart-item">
                    <div className="pos-item-title">{item.name}</div>
                    <div className="pos-item-footer">
                       <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '2px' }}>Rp {Number(item.price_sell).toLocaleString()} x {item.qty}</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1D4ED8' }}>Rp {(item.price_sell * item.qty).toLocaleString()}</div>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div className="pos-qty-btns">
                             <button onClick={(e) => { e.stopPropagation(); reduceQty(item.id); }} style={{ cursor: 'pointer' }}><Minus size={16} strokeWidth={3} /></button>
                             <span className="pos-qty-val">{item.qty}</span>
                             <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} style={{ cursor: 'pointer' }}><Plus size={16} strokeWidth={3} /></button>
                          </div>
                          <button className="pos-trash-btn" onClick={(e) => { e.stopPropagation(); setCart(cart.filter(i => i.id !== item.id)); }}>
                             <Trash2 size={16} strokeWidth={2} />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="pos-summary">
           <div className="pos-summary-row">
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>Sub total</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Rp {subtotal.toLocaleString()}</span>
           </div>
           
           <div className="pos-summary-row" style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Diskon (F7)</span>
              <div style={{ display: 'flex', gap: '8px', width: '130px' }}>
                 <select 
                   value={discountType} 
                   onChange={e => setDiscountType(e.target.value)} 
                   style={{ padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                 >
                    <option value="%">%</option>
                    <option value="Rp">Rp</option>
                 </select>
                 <input 
                   type="number" 
                   value={discount} 
                   onChange={e => setDiscount(Number(e.target.value))} 
                   style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, outline: 'none' }} 
                 />
              </div>
           </div>

           <div className="pos-summary-row" style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>PPN 11%</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 {usePPN && <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Rp {ppnAmount.toLocaleString()}</span>}
                 <div onClick={() => setUsePPN(!usePPN)} style={{ width: '40px', height: '22px', borderRadius: '20px', background: usePPN ? '#1D4ED8' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: usePPN ? '20px' : '2px', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                 </div>
              </div>
           </div>

           <div className="pos-total-row">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Total pembayaran</div>
              <div className="pos-total-val">Rp {totalAfterDiscount.toLocaleString()}</div>
           </div>

           <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                 className="pos-btn-pay"
                 disabled={cart.length === 0}
                 onClick={() => { setPayAmount(totalAfterDiscount); setNotes(''); setShowPayModal(true); }}
                 style={{ 
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer', 
                    opacity: cart.length === 0 ? 0.6 : 1,
                    flex: 2,
                    margin: 0
                 }}
              >
                 Bayar (F9)
              </button>
              <button 
                 className="pos-btn-clear"
                 disabled={cart.length === 0}
                 onClick={() => setCart([])}
                 style={{ 
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer', 
                    opacity: cart.length === 0 ? 0.6 : 1,
                    flex: 1,
                    padding: '0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                 }}
              >
                 <Trash2 size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} hideHeader maxWidth="550px">
         <div className="pay-modal-content">
            <div className="pay-modal-header">
               <h2>Pembayaran</h2>
               <button className="pay-modal-close" onClick={() => setShowPayModal(false)}>
                  <X size={20} />
               </button>
            </div>

            <div className="pay-modal-body">
               <p className="pay-modal-desc">Silakan pilih metode pembayaran dan masukkan jumlah yang dibayarkan</p>

               <div className="pay-total-banner">
                  <span className="pay-total-label">Total yang harus dibayar:</span>
                  <span className="pay-total-amount">Rp {totalAfterDiscount.toLocaleString()}</span>
               </div>

               <div className="pay-section">
                  <p className="pay-section-label">Metode pembayaran</p>
                  <div className="pay-method-grid-modal">
                     <button 
                        className={`pay-method-card ${payMethod === 'CASH' ? 'active' : ''}`}
                        onClick={() => setPayMethod('CASH')}
                     >
                        <Banknote size={20} />
                        <span>Tunai</span>
                     </button>
                     <button 
                        className={`pay-method-card ${payMethod === 'QRIS' ? 'active' : ''}`}
                        onClick={() => setPayMethod('QRIS')}
                     >
                        <QrCode size={20} />
                        <span>QRIS</span>
                     </button>
                     <button 
                        className={`pay-method-card ${payMethod === 'TRANSFER' ? 'active' : ''}`}
                        onClick={() => setPayMethod('TRANSFER')}
                     >
                        <CreditCard size={20} />
                        <span>Debit</span>
                     </button>
                  </div>
               </div>

               <div className="pay-input-group">
                  <p className="pay-section-label">Jumlah bayar</p>
                  <input 
                     type="text"
                     className={`pay-amount-input ${payAmount < totalAfterDiscount ? 'border-red-500 bg-red-50 text-red-600' : ''}`}
                     value={`Rp ${payAmount.toLocaleString()}`}
                     onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setPayAmount(Number(val));
                     }}
                     onFocus={e => e.target.select()}
                  />
                  {payAmount < totalAfterDiscount && (
                     <p className="text-[11px] text-red-500 font-800 mt-2 uppercase tracking-wide">Jumlah bayar kurang Rp {(totalAfterDiscount - payAmount).toLocaleString()}</p>
                  )}
                  
                  <div className="pay-quick-amounts">
                     {[50000, 100000, 150000, 200000].map(amount => (
                        <button 
                           key={amount}
                           className="pay-quick-btn"
                           onClick={() => setPayAmount(amount)}
                        >
                           Rp {amount.toLocaleString()}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Change/Kembalian */}
               {payAmount > totalAfterDiscount && (
                  <div style={{ marginTop: '16px', padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '14px', fontWeight: 600, color: '#16A34A' }}>Kembalian</span>
                     <span style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A' }}>Rp {(payAmount - totalAfterDiscount).toLocaleString()}</span>
                  </div>
               )}
            </div>

            <div className="pay-modal-footer">
               <button 
                  className="pay-btn-primary"
                  onClick={finalizeTransaction}
                  disabled={isProcessing || payAmount < totalAfterDiscount}
               >
                  <Printer size={18} />
                  Simpan & Cetak resi
               </button>
               <button 
                  className="pay-btn-outline"
                  onClick={finalizeTransaction}
                  disabled={isProcessing || payAmount < totalAfterDiscount}
               >
                  Simpan tanpa cetak resi
               </button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={!!lastSuccess} onClose={() => setLastSuccess(null)} hideHeader maxWidth="400px">
        <div className="text-center py-8">
           <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-200">
              <CheckCircle2 size={48} className="text-white" />
           </div>
           <h3 className="text-3xl font-700 mb-2 tracking-tighter">Berhasil!</h3>
           <p className="text-xs font-900 text-slate-400 uppercase tracking-widest mb-10">{lastSuccess?.invoice_no}</p>

           <div className="bg-slate-50 rounded-[32px] p-8 mb-10 text-left border border-white">
              <div className="flex justify-between items-center pb-6 border-b border-dashed border-slate-200 mb-6">
                 <span className="text-[10px] font-950 text-slate-400 uppercase">Total Lunas</span>
                 <span className="text-2xl font-700 text-purple-600">Rp {Number(totalAfterDiscount).toLocaleString()}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-900">
                  <span className="text-slate-400">METODE</span>
                  <span className="text-slate-900">{payMethod}</span>
                </div>
                <div className="flex justify-between text-xs font-900">
                  <span className="text-slate-400">WAKTU</span>
                  <span className="text-slate-900">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
           </div>

           <div className="flex gap-4">
              <button className="flex-1 h-14 font-950 text-slate-400" onClick={() => setLastSuccess(null)}>Tutup</button>
              <button className="flex-[2] h-14 bg-slate-900 text-white rounded-2xl font-950 flex items-center justify-center gap-3" onClick={() => window.print()}>
                 <Printer size={20} /> CETAK STRUK
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
