import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../contexts/I18nContext';
import { PageLoader } from '../../../routes/guards';
import './CategoryStorefront.css';

const FullMenu = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isCashierMode = new URLSearchParams(location.search).get('mode') === 'cashier';
  const isSelfOrderMode = new URLSearchParams(location.search).get('mode') === 'selforder';
  const tableFromUrl = new URLSearchParams(location.search).get('table');
  const tenantIdFromUrl = new URLSearchParams(location.search).get('tenant_id') ||
                          new URLSearchParams(location.search).get('tenant') ||
                          (user?.tenant_id);
  
  const { t, language, toggleLanguage } = useTranslation();
  const [activeCat, setActiveCat] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [cartItems, setCartItems] = useState([]);
  const [settings, setSettings] = useState({ store_name: 'Loading...' });
  const [categories, setCategories] = useState([{ id: 'semua', label: t('storefront.all'), icon: '🍽️', count: 0 }]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, form, success
  const [orderInfo, setOrderInfo] = useState({
    name: '',
    phone: '',
    order_type: 'dine_in',
    table_number: tableFromUrl || '',
    notes: '',
    payment: 'cash_cashier',
    source: isSelfOrderMode ? 'qr_selforder' : 'pos',
  });
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState(null);
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

        // 2. Fetch Categories & Products concurrently
        const [catsRes, productsRes] = await Promise.all([
          api.get(`/kuliner/public/categories${tenantQuery}`),
          api.get(`/kuliner/public/products${tenantQuery}`)
        ]);

        const apiCats = catsRes.data.map(c => ({
          id: c.id.toString(),
          label: c.name,
          icon: c.image_url || '🍽️',
          count: 0 // Will be calculated
        }));

        const apiProducts = productsRes.data.map(p => ({
          id: p.id,
          name: p.name,
          cat: p.category_id.toString(),
          emoji: p.image_url || '🍛',
          bg: 'kl-bg-a', // Default bg
          desc: p.description || '',
          price: p.price,
          discount_price: p.discount_price,
          tag: null,
          tagLabel: null
        }));

        setProducts(apiProducts);

        // Update category counts
        const updatedCats = [
          { id: 'semua', label: t('storefront.all'), icon: '🍽️', count: apiProducts.length },
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

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + ((curr.discount_price || curr.price) * curr.quantity), 0);

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckPromo = async () => {
    if (!promoCode) return;
    setIsCheckingPromo(true);
    setPromoMessage(null);
    try {
      const response = await api.post('/kuliner/public/validate-promo', {
        code: promoCode,
        tenant_id: settings.tenant_id
      });
      setPromoData(response.data.data);
      setPromoMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      console.error('Promo validation failed:', error);
      setPromoMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('fullMenu.invalidPromoCode') 
      });
      setPromoData(null);
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const calculateDiscount = () => {
    if (!promoData) return 0;
    const subtotal = totalCartPrice;
    if (promoData.type === 'discount') {
      const percent = parseInt(promoData.value.replace('%', ''));
      return (subtotal * percent) / 100;
    } else if (promoData.type === 'nominal') {
      const amount = parseInt(promoData.value.replace(/\D/g, ''));
      return Math.min(amount, subtotal);
    }
    return 0;
  };

  const finalTotal = totalCartPrice + 2000 - calculateDiscount();

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
        tenant_id: settings.tenant_id,
        customer_name: orderInfo.name,
        customer_phone: orderInfo.phone,
        order_type: orderInfo.order_type,
        table_number: orderInfo.table_number,
        notes: orderInfo.notes,
        payment_method: orderInfo.payment,
        source: orderInfo.source,
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.discount_price || i.price,
          quantity: i.quantity
        })),
        promo_code: promoData?.code,
        discount_amount: calculateDiscount(),
        total: finalTotal
      };
      const response = await api.post('/kuliner/public/orders', payload);
      setLastOrder(response.data);
      setCheckoutStep('success');
      setCartItems([]);
    } catch (error) {
      console.error('Order failed:', error);
      const msg = error.response?.data?.message || t('fullMenu.orderFail');
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kl-storefront">
      {/* Cart Drawer Overlay */}
      <div className={`kl-cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => { setIsCartOpen(false); if(checkoutStep==='success') setCheckoutStep('cart'); }}>
        <div className="kl-cart-drawer" onClick={e => e.stopPropagation()}>
          <div className="kl-drawer-header">
            <h2>{checkoutStep === 'success' ? t('fullMenu.success') : checkoutStep === 'form' ? t('fullMenu.orderDetails') : t('fullMenu.yourOrder')}</h2>
            <button className="kl-close-btn" onClick={() => { setIsCartOpen(false); if(checkoutStep==='success') setCheckoutStep('cart'); }}>X</button>
          </div>

          <div className="kl-drawer-content">
            {checkoutStep === 'cart' && (
              cartItems.length === 0 ? (
                <div className="kl-empty-cart">
                  <div className="kl-empty-cart-emoji">🍱</div>
                  <p>{t('fullMenu.emptyCartTitle')}<br/>{t('fullMenu.emptyCartDesc')}</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="kl-cart-item">
                    <div className="kl-ci-thumb">{item.emoji}</div>
                    <div className="kl-ci-info">
                      <h4>{item.name}</h4>
                      <p>{formatRp(item.discount_price || item.price)}</p>
                    </div>
                    <div className="kl-ci-actions">
                      <div className="kl-qty-control">
                        <button className="kl-qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                        <span className="kl-qty-val">{item.quantity}</span>
                        <button className="kl-qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                      <button className="kl-remove-btn" onClick={() => removeFromCart(item.id)}>{t('fullMenu.delete')}</button>
                    </div>
                  </div>
                ))
              )
            )}

            {checkoutStep === 'form' && (
              <form id="checkout-form" className="kl-checkout-form" onSubmit={handleOrder}>
                {isSelfOrderMode && tableFromUrl ? (
                  <div className="kl-form-group">
                    <label>{t('fullMenu.yourTable')}</label>
                    <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontWeight: 700 }}>
                      🍽️ Meja {tableFromUrl} ({t('fullMenu.scannedViaQR')})
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="kl-form-group">
                      <label>{t('fullMenu.orderOptions')}</label>
                      <div style={{display: 'flex', gap: '12px'}}>
                        <button type="button" className={`kl-cat-pill ${orderInfo.order_type === 'dine_in' ? 'active' : ''}`} style={{flex: 1, padding: 12}} onClick={() => setOrderInfo({...orderInfo, order_type: 'dine_in'})}>🍽️ {t('fullMenu.dineIn')}</button>
                        <button type="button" className={`kl-cat-pill ${orderInfo.order_type === 'take_away' ? 'active' : ''}`} style={{flex: 1, padding: 12}} onClick={() => setOrderInfo({...orderInfo, order_type: 'take_away'})}>🛍️ {t('fullMenu.takeAway')}</button>
                      </div>
                    </div>

                    {orderInfo.order_type === 'dine_in' && (
                      <div className="kl-form-group">
                        <label>{t('fullMenu.tableNumber')}</label>
                        <input required type="text" value={orderInfo.table_number} onChange={e => setOrderInfo({...orderInfo, table_number: e.target.value})} placeholder={t('fullMenu.tableNumberPlaceholder')} />
                      </div>
                    )}
                  </>
                )}

                <div className="kl-form-group">
                  <label>{t('fullMenu.customerName')}</label>
                  <input required type="text" value={orderInfo.name} onChange={e => setOrderInfo({...orderInfo, name: e.target.value})} placeholder={t('fullMenu.customerNamePlaceholder')} />
                </div>
                <div className="kl-form-group">
                  <label>{t('fullMenu.whatsappNumber')} {isCashierMode ? t('fullMenu.optional') : '*'}</label>
                  <input required={!isCashierMode} type="tel" value={orderInfo.phone} onChange={e => setOrderInfo({...orderInfo, phone: e.target.value})} placeholder="0812..." />
                </div>
                <div className="kl-form-group">
                  <label>{t('fullMenu.notes')} {t('fullMenu.optional')}</label>
                  <input type="text" value={orderInfo.notes} onChange={e => setOrderInfo({...orderInfo, notes: e.target.value})} placeholder={t('fullMenu.notesPlaceholder')} />
                </div>
                <div className="kl-form-group">
                  <label>{t('fullMenu.payment')}</label>
                  <select value={orderInfo.payment} onChange={e => setOrderInfo({...orderInfo, payment: e.target.value})}>
                    <option value="cash_cashier">{t('fullMenu.payAtCashier')}</option>
                    <option value="qr_cashier">{t('fullMenu.qrisAtCashier')}</option>
                  </select>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="kl-empty-cart">
                <div className="kl-empty-cart-emoji">✅</div>
                <h3>{t('fullMenu.orderSentTitle')}</h3>
                <p style={{marginTop: 12, fontSize: 16}}>{t('fullMenu.orderSentDesc')}</p>
                <p style={{marginTop: 8, color: '#888'}}>{t('fullMenu.queueNumber')} <strong>{lastOrder?.order_number}</strong></p>
                <button className="kl-checkout-btn" style={{marginTop: 32}} onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }}>{t('fullMenu.done')}</button>
              </div>
            )}
          </div>

          {cartItems.length > 0 && checkoutStep === 'cart' && (
            <div className="kl-drawer-footer">
              <div className="kl-promo-section" style={{marginBottom: 16, padding: '12px', background: '#f8fafc', borderRadius: '12px'}}>
                <label style={{display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase'}}>{t('fullMenu.havePromoCode')}</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input 
                    type="text" 
                    placeholder={t('fullMenu.promoCodePlaceholder')} 
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    style={{flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase'}}
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckPromo}
                    disabled={isCheckingPromo || !promoCode}
                    style={{padding: '8px 16px', background: '#b48c36', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none'}}
                  >
                    {isCheckingPromo ? '...' : t('fullMenu.check')}
                  </button>
                </div>
                {promoMessage && (
                  <div style={{marginTop: '8px', fontSize: '11px', color: promoMessage.type === 'success' ? '#16a34a' : '#ef4444', fontWeight: 'medium'}}>
                    {promoMessage.text}
                  </div>
                )}
              </div>

              <div className="kl-summary-row">
                <span>{t('fullMenu.subtotal')}</span>
                <span>{formatRp(totalCartPrice)}</span>
              </div>
              <div className="kl-summary-row">
                <span>{t('fullMenu.serviceFee')}</span>
                <span>{formatRp(2000)}</span>
              </div>
              {promoData && (
                <div className="kl-summary-row" style={{color: '#16a34a', fontWeight: 'bold'}}>
                  <span>{t('fullMenu.promo')} ({promoData.code})</span>
                  <span>-{formatRp(calculateDiscount())}</span>
                </div>
              )}
              <div className="kl-summary-row total">
                <span>{t('fullMenu.total')}</span>
                <span>{formatRp(finalTotal)}</span>
              </div>
              <button className="kl-checkout-btn" onClick={() => setCheckoutStep('form')}>{t('fullMenu.proceedToPayment')}</button>
            </div>
          )}

          {checkoutStep === 'form' && (
            <div className="kl-drawer-footer">
              <button type="submit" form="checkout-form" className="kl-checkout-btn" disabled={submitting}>
                {submitting ? t('storefront.reviewFormSubmitting') : (isCashierMode ? `✅ ${t('fullMenu.completeCashierTransaction')}` : t('fullMenu.confirmOrder'))}
              </button>
              <button className="kl-remove-btn" style={{width: '100%', marginTop: 12, textAlign: 'center'}} onClick={() => setCheckoutStep('cart')}>{t('fullMenu.backToCart')}</button>
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
          {'<-'} {isCashierMode ? t('fullMenu.backToAdmin') : t('fullMenu.back')}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 className="kl-page-title" style={{ margin: 0 }}>{settings?.store_name || 'Toko Kuliner'} <em>Menu</em></h1>
          <button
            onClick={toggleLanguage}
            style={{
              padding: '4px 10px', borderRadius: 8, background: '#fff',
              border: '1px solid #e2e8f0', color: '#1e293b', fontSize: 12,
              fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>
        </div>
      </div>

      <div className="kl-toolbar">
        <div className="kl-search-wrap">
          <span className="kl-search-icon">🔍</span>
          <input 
            className="kl-search-input" 
            type="text" 
            placeholder={t('fullMenu.searchMenuPlaceholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="kl-sort-select" 
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="default">{t('fullMenu.sortDefault')}</option>
          <option value="price-asc">{t('fullMenu.sortPriceAsc')}</option>
          <option value="price-desc">{t('fullMenu.sortPriceDesc')}</option>
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
        {loading ? t('fullMenu.loadingMenu') : `${t('fullMenu.showingMenu')} ${filteredMenu.length} ${t('fullMenu.menuCount')}`}
      </div>

      <div className={`kl-menu-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            {t('fullMenu.preparingMenu')}
          </div>
        ) : filteredMenu.map(item => (
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
                  <div className="kl-item-price" style={{marginTop:6}}>
                    {item.discount_price ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                          {formatRp(item.discount_price)}
                        </span>
                        <span style={{ textDecoration: 'line-through', fontSize: '0.75em', color: '#94a3b8' }}>
                          {formatRp(item.price)}
                        </span>
                      </div>
                    ) : (
                      formatRp(item.price)
                    )}
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
          <h4>{cartCount} {t('fullMenu.itemsAdded')}</h4>
          <p>{t('fullMenu.total')}: {formatRp(totalCartPrice)}</p>
        </div>
        <button className="kl-cart-cta" onClick={() => setIsCartOpen(true)}>{t('fullMenu.viewCart')}</button>
      </div>
    </div>
  );
};

export default FullMenu;
