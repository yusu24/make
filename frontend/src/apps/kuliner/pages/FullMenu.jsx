import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import './CategoryStorefront.css';

const menuData = [
  { id:1, name:'Rendang Padang', cat:'nasi', emoji:'🍛', bg:'kl-bg-a', desc:'Daging sapi empuk dimasak perlahan dengan 20+ rempah pilihan.', price:45000, rating:4.9, votes:312, cal:520, tag:'fav', tagLabel:'Favorit' },
  { id:2, name:'Nasi Gudeg Jogja', cat:'nasi', emoji:'🍱', bg:'kl-bg-d', desc:'Nangka muda santan kental, krecek, dan ayam opor.', price:32000, rating:4.8, votes:198, cal:480, tag:'fav', tagLabel:'Favorit' },
  { id:3, name:'Nasi Padang Komplit', cat:'nasi', emoji:'🍚', bg:'kl-bg-a', desc:'Nasi dengan pilihan 5 lauk khas Minang plus sambal hijau.', price:38000, rating:4.7, votes:156, cal:610, tag:null, tagLabel:null },
  { id:4, name:'Nasi Liwet Solo', cat:'nasi', emoji:'🫕', bg:'kl-bg-d', desc:'Nasi gurih santan dengan lauk suwir ayam and areh.', price:28000, rating:4.6, votes:89, cal:430, tag:'new', tagLabel:'Baru' },
  { id:5, name:'Nasi Campur Bali', cat:'nasi', emoji:'🍛', bg:'kl-bg-b', desc:'Nasi dengan lauk khas Bali: sate lilit, lawar, dan plecing.', price:42000, rating:4.8, votes:201, cal:550, tag:null, tagLabel:null },
  { id:6, name:'Soto Betawi', cat:'sup', emoji:'🍲', bg:'kl-bg-a', desc:'Kuah santan gurih dengan daging sapi, kentang, dan tomat.', price:30000, rating:4.9, votes:421, cal:390, tag:'hot', tagLabel:'Terlaris' },
  { id:7, name:'Sop Buntut Goreng', cat:'sup', emoji:'🥣', bg:'kl-bg-d', desc:'Buntut sapi empuk disajikan dengan kuah bening harum.', price:55000, rating:4.8, votes:167, cal:470, tag:null, tagLabel:null },
  { id:8, name:'Mie Aceh Spesial', cat:'sup', emoji:'🍜', bg:'kl-bg-c', desc:'Mie kuning tebal dengan kuah kari rempah dan seafood segar.', price:38000, rating:4.8, votes:247, cal:520, tag:'hot', tagLabel:'Terlaris' },
  { id:9, name:'Rawon Surabaya', cat:'sup', emoji:'🍛', bg:'kl-bg-f', desc:'Kuah hitam kluwek khas Jawa Timur dengan daging sapi lembut.', price:35000, rating:4.9, votes:389, cal:410, tag:'fav', tagLabel:'Favorit' },
  { id:10, name:'Udang Saus Padang', cat:'seafood', emoji:'🦐', bg:'kl-bg-e', desc:'Udang jumbo dengan saus padang pedas manis menggugah selera.', price:55000, rating:4.8, votes:156, cal:320, tag:null, tagLabel:null },
  { id:11, name:'Ikan Bakar Jimbaran', cat:'seafood', emoji:'🐟', bg:'kl-bg-g', desc:'Ikan segar dibakar dengan bumbu bali dan sambal matah.', price:65000, rating:4.9, votes:234, cal:290, tag:'fav', tagLabel:'Favorit' },
  { id:12, name:'Cumi Goreng Tepung', cat:'seafood', emoji:'🦑', bg:'kl-bg-e', desc:'Cumi segar dibalut tepung crispy dengan saus tartar spesial.', price:48000, rating:4.7, votes:112, cal:380, tag:'new', tagLabel:'Baru' },
  { id:13, name:'Sate Madura', cat:'jajanan', emoji:'🍢', bg:'kl-bg-a', desc:'10 tusuk sate ayam/kambing dengan bumbu kacang dan kecap.', price:30000, rating:4.9, votes:421, cal:340, tag:'hot', tagLabel:'Terlaris' },
  { id:14, name:'Gado-Gado Jakarta', cat:'jajanan', emoji:'🥗', bg:'kl-bg-b', desc:'Sayuran segar dengan bumbu kacang spesial dan lontong.', price:25000, rating:4.7, votes:198, cal:310, tag:'veg', tagLabel:'Vegetarian' },
  { id:15, name:'Martabak Manis', cat:'jajanan', emoji:'🥞', bg:'kl-bg-h', desc:'Martabak tebal dengan isian cokelat, keju, dan kacang.', price:35000, rating:4.6, votes:143, cal:560, tag:null, tagLabel:null },
  { id:16, name:'Es Dawet Ayu', cat:'minuman', emoji:'🥤', bg:'kl-bg-b', desc:'Cendol, santan segar, dan gula aren khas Banjarnegara.', price:15000, rating:4.6, votes:89, cal:180, tag:null, tagLabel:null },
  { id:17, name:'Jus Alpukat Kental', cat:'minuman', emoji:'🥑', bg:'kl-bg-g', desc:'Alpukat segar dengan susu kental manis dan es batu.', price:18000, rating:4.7, votes:134, cal:220, tag:'fav', tagLabel:'Favorit' },
  { id:18, name:'Teh Tarik Spesial', cat:'minuman', emoji:'☕', bg:'kl-bg-h', desc:'Teh hitam pekat ditarik hingga berbusa dengan susu creamer.', price:12000, rating:4.5, votes:76, cal:140, tag:'new', tagLabel:'Baru' },
];

const categories = [
  { id: 'semua', label: 'Semua', icon: '🍽️', count: 18 },
  { id: 'nasi', label: 'Nasi & Lauk', icon: '🍚', count: 5 },
  { id: 'sup', label: 'Sup & Soto', icon: '🍲', count: 4 },
  { id: 'seafood', label: 'Seafood', icon: '🦐', count: 3 },
  { id: 'jajanan', label: 'Jajanan', icon: '🍢', count: 3 },
  { id: 'minuman', label: 'Minuman', icon: '🥤', count: 3 },
];

const FullMenu = () => {
  const [activeCat, setActiveCat] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [cartItems, setCartItems] = useState([]);
  const [settings, setSettings] = useState({ store_name: 'Dapur Nusantara' });
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
    const fetchSettings = async () => {
      try {
        const response = await api.get('/kuliner/public/settings');
        if (response.data) setSettings(prev => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + n.toLocaleString('id-ID');
  };

  const filteredMenu = useMemo(() => {
    let data = [...menuData].filter(i => {
      const matchesCat = activeCat === 'semua' || i.cat === activeCat;
      const matchesSearch = (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (i.desc || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (sortMode === 'price-asc') data.sort((a, b) => a.price - b.price);
    else if (sortMode === 'price-desc') data.sort((a, b) => b.price - a.price);
    else if (sortMode === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return data;
  }, [activeCat, searchQuery, sortMode]);

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
      alert('Gagal mengirim pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  if (loading) {
    return (
      <div style={{background: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif', fontSize: 24, color: '#b48c36'}}>
        {settings?.store_name || 'Dapur Nusantara'}...
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
                  <label>No. WhatsApp</label>
                  <input required type="tel" value={orderInfo.phone} onChange={e => setOrderInfo({...orderInfo, phone: e.target.value})} placeholder="0812..." />
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
                {submitting ? 'Mengirim...' : 'Konfirmasi Pesanan'}
              </button>
              <button className="kl-remove-btn" style={{width: '100%', marginTop: 12, textAlign: 'center'}} onClick={() => setCheckoutStep('cart')}>Kembali ke Keranjang</button>
            </div>
          )}
        </div>
      </div>

      <div className="kl-page-header">
        <Link to="/kuliner" className="kl-back-btn">← Kembali</Link>
        <h1 className="kl-page-title">{settings?.store_name || 'Menu'} <em>Lengkap</em></h1>
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
