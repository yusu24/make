import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import './CategoryStorefront.css';

const FullMenu = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isCashierMode = new URLSearchParams(location.search).get('mode') === 'cashier';
  const tenantIdFromUrl = new URLSearchParams(location.search).get('tenant_id') || 
                          new URLSearchParams(location.search).get('tenant') ||
                          (user?.tenant_id);
  
  const [activeCat, setActiveCat] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [cartItems, setCartItems] = useState([]);
  const [settings, setSettings] = useState({ store_name: 'Loading...' });
  const [categories, setCategories] = useState([{ id: 'semua', label: 'Semua', icon: '🍽️', count: 0 }]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, form, success
  const [orderInfo, setOrderInfo] = useState({ 
    name: '', 
    phone: '', 
    order_type: 'dine_in', 
    table_number: '', 
    notes: '', 
    payment: 'cash_cashier' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = tenantIdFromUrl ? `?tenant_id=${tenantIdFromUrl}` : '';
        
        // 1. Fetch Settings
        const settingsRes = await api.get(`/kuliner/public/settings${query}`);
        if (settingsRes.data) setSettings(prev => ({ ...prev, ...settingsRes.data }));

        const currentTenantId = settingsRes.data?.tenant_id;
        const tenantQuery = currentTenantId ? `?tenant_id=${currentTenantId}` : query;

        // 2. Fetch Categories
        const catsRes = await api.get(`/kuliner/public/categories${tenantQuery}`);
        const apiCats = catsRes.data.map(c => ({
          id: c.id.toString(),
          label: c.name,
          icon: c.image_url || '🍽️',
          count: 0 // Will be calculated
        }));

        // 3. Fetch Products
        const productsRes = await api.get(`/kuliner/public/products${tenantQuery}`);
        const apiProducts = productsRes.data.map(p => ({
          id: p.id,
          name: p.name,
          cat: p.category_id.toString(),
          emoji: p.image_url || '🍛',
          bg: 'kl-bg-a', // Default bg
          desc: p.description || '',
          price: p.price,
          rating: 4.8, // Default
          votes: 12,
          cal: 0,
          tag: null,
          tagLabel: null
        }));

        setProducts(apiProducts);

        // Update category counts
        const updatedCats = [
          { id: 'semua', label: 'Semua', icon: '🍽️', count: apiProducts.length },
          ...apiCats.map(cat => ({
            ...cat,
            count: apiProducts.filter(p => p.cat === cat.id).length
          }))
        ];
        setCategories(updatedCats);

      } catch (error) {
        console.error('Failed to fetch store data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantIdFromUrl]);

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(n));
  };

  const filteredMenu = useMemo(() => {
    let data = [...products].filter(i => {
      const matchesCat = activeCat === 'semua' || i.cat === activeCat;
      const matchesSearch = (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (i.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (sortMode === 'price-asc') data.sort((a, b) => a.price - b.price);
    else if (sortMode === 'price-desc') data.sort((a, b) => b.price - a.price);
    else if (sortMode === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return data;
  }, [activeCat, searchQuery, sortMode, products]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    if (isCashierMode) {
      setOrderInfo(prev => ({ ...prev, name: 'Kasir', payment: 'cash_cashier' }));
    }
  }, [isCashierMode]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customer_name: orderInfo.name,
        customer_phone: orderInfo.phone,
        order_type: orderInfo.order_type,
        table_number: orderInfo.order_type === 'dine_in' ? orderInfo.table_number : null,
        payment_method: orderInfo.payment,
        notes: orderInfo.notes,
        is_staff_order: isCashierMode,
        tenant_id: settings.tenant_id, // Include tenant_id
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      };
      const response = await api.post('/kuliner/public/orders', payload);
      setLastOrder(response.data);
      setCheckoutStep('success');
      setCartItems([]);
    } catch (error) {
      console.error('Order failed:', error);
      const msg = error.response?.data?.message || 'Gagal mengirim pesanan. Silakan coba lagi.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  if (loading) {
    return (
      <div style={{background: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: 24, color: '#b48c36'}}>
        {settings?.store_name || 'Toko'}...
      </div>
    );
  }

  return (
    <div className="kl-storefront">
      {/* Cart Drawer Overlay */}
      <div className={`kl-cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => { setIsCartOpen(false); if(checkoutStep==='success') setCheckoutStep('cart'); }}>
        <div className="kl-cart-drawer" onClick={e => e.stopPropagation()}>
          <div className="kl-drawer-header">
            <h2>{checkoutStep === 'success' ? 'Berhasil!' : checkoutStep === 'form' ? 'Detail Pesanan' : 'Pesanan Anda'}</h2>
            <button className="kl-close-btn" onClick={() => { setIsCartOpen(false); if(checkoutStep==='success') setCheckoutStep('cart'); }}>✕</button>
          </div>

          <div className="kl-drawer-content">
            {checkoutStep === 'cart' && (
              cartItems.length === 0 ? (
                <div className="kl-empty-cart">
                  <div className="kl-empty-cart-emoji">🍱</div>
                  <p>Keranjang Anda masih kosong.<br/>Ayo pilih menu lezat kami!</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="kl-cart-item">
                    <div className="kl-ci-thumb">{item.emoji}</div>
                    <div className="kl-ci-info">
                      <h4>{item.name}</h4>
                      <p>{formatRp(item.price)}</p>
                    </div>
                    <div className="kl-ci-actions">
                      <div className="kl-qty-control">
                        <button className="kl-qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                        <span className="kl-qty-val">{item.quantity}</span>
                        <button className="kl-qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                      <button className="kl-remove-btn" onClick={() => removeFromCart(item.id)}>Hapus</button>
                    </div>
                  </div>
                ))
              )
            )}

            {checkoutStep === 'form' && (
              <form id="checkout-form" className="kl-checkout-form" onSubmit={handleOrder}>
                <div className="kl-form-group">
                  <label>Pilihan Pesanan</label>
                  <div style={{display: 'flex', gap: '12px'}}>
                    <button type="button" className={`kl-cat-pill ${orderInfo.order_type === 'dine_in' ? 'active' : ''}`} style={{flex: 1, padding: 12}} onClick={() => setOrderInfo({...orderInfo, order_type: 'dine_in'})}>🍽️ Makan di Tempat</button>
                    <button type="button" className={`kl-cat-pill ${orderInfo.order_type === 'take_away' ? 'active' : ''}`} style={{flex: 1, padding: 12}} onClick={() => setOrderInfo({...orderInfo, order_type: 'take_away'})}>🛍️ Bawa Pulang</button>
                  </div>
                </div>

                {orderInfo.order_type === 'dine_in' && (
                  <div className="kl-form-group">
                    <label>Nomor Meja</label>
                    <input required type="text" value={orderInfo.table_number} onChange={e => setOrderInfo({...orderInfo, table_number: e.target.value})} placeholder="Contoh: Meja 05" />
                  </div>
                )}

                <div className="kl-form-group">
                  <label>Nama Pemesan</label>
                  <input required type="text" value={orderInfo.name} onChange={e => setOrderInfo({...orderInfo, name: e.target.value})} placeholder="Masukkan nama Anda" />
                </div>
                <div className="kl-form-group">
                  <label>No. WhatsApp {isCashierMode ? '(Opsional)' : '*'}</label>
                  <input required={!isCashierMode} type="tel" value={orderInfo.phone} onChange={e => setOrderInfo({...orderInfo, phone: e.target.value})} placeholder="0812..." />
                </div>
                <div className="kl-form-group">
                  <label>Catatan (Opsional)</label>
                  <input type="text" value={orderInfo.notes} onChange={e => setOrderInfo({...orderInfo, notes: e.target.value})} placeholder="Contoh: Sambal dipisah ya" />
                </div>
                <div className="kl-form-group">
                  <label>Pembayaran</label>
                  <select value={orderInfo.payment} onChange={e => setOrderInfo({...orderInfo, payment: e.target.value})}>
                    <option value="cash_cashier">Bayar di Kasir</option>
                    <option value="qr_cashier">QRIS di Kasir</option>
                  </select>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="kl-empty-cart">
                <div className="kl-empty-cart-emoji">✅</div>
                <h3>Pesanan Terkirim!</h3>
                <p style={{marginTop: 12, fontSize: 16}}>Silakan lanjutkan ke kasir untuk pembayaran.</p>
                <p style={{marginTop: 8, color: '#888'}}>Nomor Antrean: <strong>{lastOrder?.order_number}</strong></p>
                <button className="kl-checkout-btn" style={{marginTop: 32}} onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }}>Selesai</button>
              </div>
            )}
          </div>

          {cartItems.length > 0 && checkoutStep === 'cart' && (
            <div className="kl-drawer-footer">
              <div className="kl-summary-row">
                <span>Subtotal</span>
                <span>{formatRp(totalCartPrice)}</span>
              </div>
              <div className="kl-summary-row total">
                <span>Total</span>
                <span>{formatRp(totalCartPrice + 2000)}</span>
              </div>
              <button className="kl-checkout-btn" onClick={() => setCheckoutStep('form')}>Lanjut ke Pembayaran →</button>
            </div>
          )}

          {checkoutStep === 'form' && (
            <div className="kl-drawer-footer">
              <button type="submit" form="checkout-form" className="kl-checkout-btn" disabled={submitting}>
                {submitting ? 'Mengirim...' : (isCashierMode ? '✅ Selesaikan Transaksi Kasir' : 'Konfirmasi Pesanan')}
              </button>
              <button className="kl-remove-btn" style={{width: '100%', marginTop: 12, textAlign: 'center'}} onClick={() => setCheckoutStep('cart')}>Kembali ke Keranjang</button>
            </div>
          )}
        </div>
      </div>

      {isCashierMode && (
        <div style={{ background: '#b48c36', color: '#fff', padding: '10px 24px', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔔 MODE KASIR AKTIF — Membuat pesanan manual</span>
          <Link to="/kuliner/admin/orders" style={{ color: '#fff', textDecoration: 'underline' }}>Kembali ke Admin Pesanan</Link>
        </div>
      )}

      <div className="kl-page-header">
        <Link to={isCashierMode ? "/kuliner/admin/orders" : `/kuliner${tenantIdFromUrl ? `?tenant_id=${tenantIdFromUrl}` : ''}`} className="kl-back-btn">
          ← {isCashierMode ? "Kembali ke Admin" : "Kembali"}
        </Link>
        <h1 className="kl-page-title">{settings?.store_name || 'Toko Kuliner'} <em>Menu</em></h1>
      </div>

      <div className="kl-toolbar">
        <div className="kl-search-wrap">
          <span className="kl-search-icon">🔍</span>
          <input 
            className="kl-search-input" 
            type="text" 
            placeholder="Cari menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="kl-sort-select" 
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="default">Urutan default</option>
          <option value="price-asc">Harga: Termurah</option>
          <option value="price-desc">Harga: Termahal</option>
          <option value="rating">Rating tertinggi</option>
        </select>
        <div className="kl-view-toggle">
          <button 
            className={`kl-vt-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
          <button 
            className={`kl-vt-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
        </div>
      </div>

      <div className="kl-cats">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`kl-cat-pill ${activeCat === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            <span className="icon">{cat.icon}</span> {cat.label} 
            <span className="kl-count-badge">{cat.count}</span>
          </button>
        ))}
      </div>

      <div className="kl-divider"></div>

      <div className="kl-results-info">
        Menampilkan {filteredMenu.length} menu
      </div>

      <div className={`kl-menu-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {filteredMenu.map(item => (
          <div key={item.id} className="kl-item-card">
            <div className={`kl-thumb ${item.bg}`}>{item.emoji}</div>
            <div className="kl-item-body">
              <div className="kl-item-top">
                <div className="kl-item-name">{item.name}</div>
                {item.tag && (
                  <span className={`kl-item-tag kl-tag-${item.tag}`}>{item.tagLabel}</span>
                )}
              </div>
              <div className="kl-item-desc">{item.desc}</div>
              <div className="kl-item-footer">
                <div>
                  <div className="kl-item-meta">
                    <div className="kl-item-rating"><span>★</span> {item.rating} ({item.votes})</div>
                    <div className="kl-item-cal">{item.cal} kal</div>
                  </div>
                  <div className="kl-item-price" style={{marginTop:6}}>
                    {formatRp(item.price)}
                  </div>
                </div>
                <button 
                  className="kl-add-btn"
                  onClick={() => addToCart(item)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`kl-cart-bar ${cartCount > 0 ? 'visible' : ''}`}>
        <div className="kl-cart-info">
          <h4>{cartCount} item ditambahkan</h4>
          <p>Total: {formatRp(totalCartPrice)}</p>
        </div>
        <button className="kl-cart-cta" onClick={() => setIsCartOpen(true)}>Lihat Keranjang →</button>
      </div>
    </div>
  );
};

export default FullMenu;
