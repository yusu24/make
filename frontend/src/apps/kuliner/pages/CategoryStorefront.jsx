import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { PageLoader } from '../../../routes/guards';
import { useTranslation } from '../../../contexts/I18nContext';
import './CategoryStorefront.css';

const CategoryStorefront = () => {
  const location = useLocation();
  const tenant = new URLSearchParams(location.search).get('tenant_id') || 
                 new URLSearchParams(location.search).get('tenant');
  
  const { t, language, toggleLanguage } = useTranslation();
  const [activeCat, setActiveCat] = useState(t('storefront.all'));
  const [settings, setSettings] = useState({
    store_name: 'Loading...',
    opening_hours: 'Senin - Minggu',
    hero_title: 'Cita Rasa Kuliner Terbaik',
    hero_subtitle: 'Nikmati kelezatan hidangan istimewa yang kami sajikan dengan bahan pilihan dan cinta.',
    hero_image_url: ''
  });

  const [categories, setCategories] = useState([t('storefront.all')]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    comment: '',
    customer_role: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [bestSellers, setBestSellers] = useState({ monthly: null, daily: [] });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = tenant ? `?tenant_id=${tenant}` : '';
        
        // 1. Fetch Settings
        const settingsRes = await api.get(`/kuliner/public/settings${query}`);
        if (settingsRes.data) setSettings(prev => ({ ...prev, ...settingsRes.data }));

        const currentTenantId = settingsRes.data?.tenant_id || tenant;
        const tenantQuery = currentTenantId ? `?tenant_id=${currentTenantId}` : query;

        // 2. Fetch remaining data concurrently
        const [catsRes, productsRes, reviewsRes, bestRes] = await Promise.all([
          api.get(`/kuliner/public/categories${tenantQuery}`),
          api.get(`/kuliner/public/products${tenantQuery}`),
          api.get(`/kuliner/public/testimonials${tenantQuery}`),
          api.get(`/kuliner/public/best-sellers${tenantQuery}`)
        ]);

        if (catsRes.data) {
          setCategories([t('storefront.all'), ...catsRes.data.map(c => c.name)]);
        }

        if (productsRes.data) {
          setProducts(productsRes.data.map((p, idx) => ({
            id: p.id,
            name: p.name,
            desc: p.description || '',
            price: p.price,
            discount_price: p.discount_price,
            category: catsRes.data?.find(c => c.id === p.category_id)?.name || 'Lainnya',
            emoji: p.image_url || '🍛',
            class: `kl-mi-${(idx % 6) + 1}`
          })));
        }

        if (reviewsRes.data && reviewsRes.data.length > 0) {
          setTestimonials(reviewsRes.data.map(r => ({
            name: r.customer_name,
            initial: r.customer_name.charAt(0).toUpperCase(),
            role: r.customer_role || 'Pelanggan',
            text: r.comment,
            stars: r.rating
          })));
        }

        if (bestRes.data) {
          setBestSellers(bestRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch storefront data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenant]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const payload = {
        ...reviewForm,
        tenant_id: settings.tenant_id
      };
      await api.post('/kuliner/public/testimonials', payload);
      alert(t('storefront.reviewSuccess'));
      setShowReviewModal(false);
      setReviewForm({ customer_name: '', rating: 5, comment: '', customer_role: '' });
      
      // Refresh testimonials
      const query = settings.tenant_id ? `?tenant_id=${settings.tenant_id}` : '';
      const reviewsRes = await api.get(`/kuliner/public/testimonials${query}`);
      if (reviewsRes.data) {
        setTestimonials(reviewsRes.data.map(r => ({
          name: r.customer_name,
          initial: r.customer_name.charAt(0).toUpperCase(),
          role: r.customer_role || 'Pelanggan',
          text: r.comment,
          stars: r.rating
        })));
      }
    } catch (error) {
      alert(t('storefront.reviewFail'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const [loading, setLoading] = useState(true);

  if (loading) return <PageLoader />;

  const filteredItems = activeCat === t('storefront.all') 
    ? products.slice(0, 6) 
    : products.filter(p => p.category === activeCat).slice(0, 6);

  const menuUrl = `/kuliner/menu${tenant ? `?tenant_id=${tenant}` : ''}`;

  return (
    <div className="kl-storefront">
      <nav className="kl-nav">
        <Link 
          to={`/kuliner${tenant ? `?tenant_id=${tenant}` : ''}`} 
          className="kl-logo"
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            if (location.pathname === '/kuliner') {
              e.preventDefault();
              window.scrollTo(0, 0);
            }
          }}
        >
          {settings.store_name}
        </Link>
        <ul className="kl-nav-links">
          <li>
            <Link 
              to={`/kuliner${tenant ? `?tenant_id=${tenant}` : ''}`}
              onClick={(e) => {
                if (location.pathname === '/kuliner') {
                  e.preventDefault();
                  window.scrollTo(0, 0);
                }
              }}
            >
              {t('storefront.home')}
            </Link>
          </li>
          <li><Link to={menuUrl}>{t('storefront.menuList')}</Link></li>
          <li><a href="#testimoni">{t('storefront.testimonials')}</a></li>
        </ul>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={toggleLanguage}
            style={{
              padding: '6px 12px', borderRadius: 8, background: 'transparent',
              border: '1px solid #b48c36', color: '#b48c36', fontSize: 13,
              fontWeight: 'bold', cursor: 'pointer',
            }}
          >
            {language === 'id' ? 'ID' : 'EN'}
          </button>
          <Link to={menuUrl} className="kl-nav-cta">{t('storefront.orderNow')}</Link>
        </div>
      </nav>

      <section 
        className={`kl-hero ${settings.hero_image_url ? 'kl-hero-parallax' : ''}`}
        style={settings.hero_image_url ? { backgroundImage: `url(${settings.hero_image_url})` } : {}}
      >
        {settings.hero_image_url && <div className="kl-hero-overlay"></div>}
        <div className="kl-hero-text">
          <div className="kl-badge">
            <div className="kl-badge-dot"></div>
            {settings.operational_days || t('storefront.operationalDays')} • {
              (settings.opening_hours && 
               settings.opening_hours.toLowerCase().trim() !== (settings.operational_days || '').toLowerCase().trim() &&
               settings.opening_hours.toLowerCase().trim() !== 'senin - minggu')
                ? settings.opening_hours 
                : '08:00 - 22:00'
            }
          </div>
          <h1 dangerouslySetInnerHTML={{ 
            __html: (settings.hero_title || 'Cita Rasa Kuliner Terbaik').replace('Terbaik', '<em>Terbaik</em>') 
          }}></h1>
          <p>{settings.hero_subtitle || 'Nikmati kelezatan hidangan istimewa yang kami sajikan dengan bahan pilihan.'}</p>
          <div className="kl-hero-actions">
            <Link to={menuUrl} className="kl-btn-primary">{t('storefront.viewMenu')}</Link>
            {/* Dine-in is already FullMenu.jsx's default order type, so this
                just takes the customer straight to ordering for a table. */}
            <Link to={menuUrl} className="kl-btn-ghost">{t('storefront.reserveTable')}</Link>
          </div>
        </div>

        <div className="kl-hero-visual">
          {bestSellers.daily_food && (
            <div className="kl-mini-card top">
              <div className="kl-mini-emoji">{bestSellers.daily_food.image_url || '🍲'}</div>
              <div className="kl-mini-info">
                <h4>{bestSellers.daily_food.name}</h4>
                <span>{t('storefront.bestSellerToday')}</span>
                <span className="kl-stars">★★★★★</span>
              </div>
            </div>
          )}

          <div className="kl-food-card-main">
            <div className="kl-food-img">{bestSellers.monthly?.image_url || '🍛'}</div>
            <div className="kl-food-card-body">
              <span className="kl-food-tag">{t('storefront.monthlyHighlight')}</span>
              <h3>{bestSellers.monthly?.name || t('storefront.defaultMonthlyName')}</h3>
              <p>{bestSellers.monthly?.description || t('storefront.defaultMonthlyDesc')}</p>
              <div className="kl-food-footer">
                <div className="kl-price">
                  {bestSellers.monthly?.price 
                    ? `Rp ${new Intl.NumberFormat('id-ID').format(bestSellers.monthly.price)}` 
                    : t('storefront.specialPrice')}
                </div>
                <Link to={menuUrl} className="kl-add-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</Link>
              </div>
            </div>
          </div>

          {bestSellers.daily_drink && (
            <div className="kl-mini-card bottom">
              <div className="kl-mini-emoji">{bestSellers.daily_drink.image_url || '🥤'}</div>
              <div className="kl-mini-info">
                <h4>{bestSellers.daily_drink.name}</h4>
                <span>{t('storefront.bestSellingDrink')}</span>
                <span className="kl-stars">{t('storefront.favoriteChoice')} 🥤</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="kl-section">
        <div className="kl-section-header">
          <h2>{t('storefront.ourFeaturedMenu1')} <em>{t('storefront.ourFeaturedMenu2')}</em><br />{t('storefront.ourFeaturedMenu3')}</h2>
          <Link to={menuUrl} className="kl-see-all">{t('storefront.seeAll')}</Link>
        </div>

        <div className="kl-categories">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`kl-cat-btn ${activeCat === cat ? 'active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="kl-menu-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="kl-menu-item">
              <div className={`kl-menu-item-img ${item.class}`}>{item.emoji}</div>
              <div className="kl-menu-item-body">
                <h4>{item.name}</h4>
                <p className="line-clamp-2">{item.desc}</p>
                <div className="kl-menu-item-footer">
                  <div className="kl-item-price">
                    {item.discount_price ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ textDecoration: 'line-through', fontSize: '10px', color: '#94a3b8', marginBottom: '-2px' }}>
                          Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                        </span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                          Rp {new Intl.NumberFormat('id-ID').format(item.discount_price)}
                        </span>
                      </div>
                    ) : (
                      `Rp ${new Intl.NumberFormat('id-ID').format(item.price)}`
                    )}
                  </div>
                  <div className="kl-item-rating"><span>★</span> 4.8</div>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400">
              {t('storefront.emptyMenu')}
            </div>
          )}
        </div>
      </section>

      <div className="kl-banner">
        <div>
          <h2>{(settings.promo_title || 'Promo Spesial Akhir Pekan').split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : w + ' ')}</h2>
          <p>{settings.promo_desc || 'Dapatkan diskon menarik setiap hari.'}</p>
          <Link to={menuUrl} className="kl-btn-primary">Klaim Promo</Link>
        </div>
        <div className="kl-banner-right">🎉</div>
      </div>

      <section id="testimoni" className="kl-reviews-section">
        <div className="kl-section-header">
          <h2>{t('storefront.whatCustomersSay1')} <em>{t('storefront.whatCustomersSay2')}</em> {t('storefront.whatCustomersSay3')}</h2>
          <p>{t('storefront.whatCustomersSayDesc')}</p>
          <button className="kl-btn-ghost mt-4" onClick={() => setShowReviewModal(true)}>{t('storefront.writeTestimonial')}</button>
        </div>
        <div className="kl-reviews-container">
          {testimonials.map((rev, idx) => (
            <div key={idx} className="kl-review-card">
              <div className="kl-review-stars">{'★'.repeat(rev.stars)}{'☆'.repeat(5-rev.stars)}</div>
              <p className="kl-review-text">"{rev.text}"</p>
              <div className="kl-review-user">
                <div className="kl-user-avatar">{rev.initial}</div>
                <div className="kl-user-info">
                  <h4>{rev.name}</h4>
                  <p>{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="kl-cart-overlay active" style={{ zIndex: 2000 }} onClick={() => setShowReviewModal(false)}>
          <div className="kl-cart-drawer active" style={{ maxWidth: '450px', height: 'auto', borderRadius: '32px 32px 0 0', bottom: 0, top: 'auto', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">{t('storefront.reviewFormTitle')}</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-2xl text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="kl-form-group mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('storefront.reviewFormName')}</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder={t('storefront.reviewFormNamePlaceholder')} value={reviewForm.customer_name} onChange={e => setReviewForm({...reviewForm, customer_name: e.target.value})} />
              </div>
              <div className="kl-form-group mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('storefront.reviewFormRole')}</label>
                <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder={t('storefront.reviewFormRolePlaceholder')} value={reviewForm.customer_role} onChange={e => setReviewForm({...reviewForm, customer_role: e.target.value})} />
              </div>
              <div className="kl-form-group mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('storefront.reviewFormRating')}</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, rating: s})} className={`text-2xl ${reviewForm.rating >= s ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="kl-form-group mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('storefront.reviewFormComment')}</label>
                <textarea required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[100px]" placeholder={t('storefront.reviewFormCommentPlaceholder')} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
              </div>
              <button type="submit" disabled={submittingReview} className="w-full py-4 bg-[#b48c36] text-white rounded-2xl font-bold shadow-lg shadow-amber-900/20">
                {submittingReview ? t('storefront.reviewFormSubmitting') : t('storefront.reviewFormSubmit')}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="kl-footer">
        <div className="kl-footer-logo">{settings.store_name}</div>
        <p>© 2026 {settings.store_name} · {settings.address && settings.address !== 'Alamat belum diatur' ? settings.address : t('storefront.addressNotSet')}</p>
        <div className="kl-footer-links">
          {settings.instagram_url && <a href={settings.instagram_url}>Instagram</a>}
          {settings.whatsapp_number && <a href={`https://wa.me/${settings.whatsapp_number}`}>WhatsApp</a>}
        </div>
      </footer>
    </div>
  );
};

export default CategoryStorefront;
