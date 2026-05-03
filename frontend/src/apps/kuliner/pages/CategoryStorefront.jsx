import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import './CategoryStorefront.css';

const CategoryStorefront = () => {
  const location = useLocation();
  const tenant = new URLSearchParams(location.search).get('tenant_id') || 
                 new URLSearchParams(location.search).get('tenant');
  
  const [activeCat, setActiveCat] = useState('Semua');
  const [settings, setSettings] = useState({
    store_name: 'Loading...',
    opening_hours: 'Senin - Minggu',
    hero_title: 'Cita Rasa Kuliner Terbaik',
    hero_subtitle: 'Nikmati kelezatan hidangan istimewa yang kami sajikan dengan bahan pilihan dan cinta.'
  });

  const [categories, setCategories] = useState(['Semua']);
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

        // 2. Fetch Categories
        const catsRes = await api.get(`/kuliner/public/categories${tenantQuery}`);
        if (catsRes.data) {
          setCategories(['Semua', ...catsRes.data.map(c => c.name)]);
        }

        // 3. Fetch Products (Take only first 6 for featured)
        const productsRes = await api.get(`/kuliner/public/products${tenantQuery}`);
        if (productsRes.data) {
          setProducts(productsRes.data.map((p, idx) => ({
            id: p.id,
            name: p.name,
            desc: p.description || '',
            price: 'Rp ' + new Intl.NumberFormat('id-ID').format(p.price || 0),
            category: catsRes.data.find(c => c.id === p.category_id)?.name || 'Lainnya',
            emoji: p.image_url || '🍛',
            class: `kl-mi-${(idx % 6) + 1}`
          })));
        }

        // 4. Fetch Testimonials
        const reviewsRes = await api.get(`/kuliner/public/testimonials${tenantQuery}`);
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          setTestimonials(reviewsRes.data.map(r => ({
            name: r.customer_name,
            initial: r.customer_name.charAt(0).toUpperCase(),
            role: r.customer_role || 'Pelanggan',
            text: r.comment,
            stars: r.rating
          })));
        } else {
          // Fallback placeholders if empty
          setTestimonials([
            { name: 'Budi Santoso', initial: 'B', role: 'Food Enthusiast', text: 'Makanannya benar-benar autentik dan lezat! Sangat direkomendasikan.', stars: 5 },
            { name: 'Siti Aminah', initial: 'S', role: 'Pelanggan Setia', text: 'Porsinya pas, rasanya mantap. Pengiriman juga cepat.', stars: 5 }
          ]);
        }

        // 5. Fetch Best Sellers
        const bestRes = await api.get(`/kuliner/public/best-sellers${tenantQuery}`);
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
      alert('Terima kasih! Testimoni Anda sangat berarti bagi kami. ✨');
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
      alert('Gagal mengirim testimoni. Silakan coba lagi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const [loading, setLoading] = useState(true);

  if (loading) return <div style={{background: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#b48c36'}}>{settings.store_name || 'Loading...'}</div>;

  const filteredItems = activeCat === 'Semua' 
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
              Beranda
            </Link>
          </li>
          <li><Link to={menuUrl}>Daftar Menu</Link></li>
          <li><a href="#testimoni">Testimoni</a></li>
        </ul>
        <Link to={menuUrl} className="kl-nav-cta">Pesan Sekarang</Link>
      </nav>

      <section className="kl-hero">
        <div className="kl-hero-text">
          <div className="kl-badge">
            <div className="kl-badge-dot"></div>
            {settings.operational_days || 'Senin - Minggu'} • {
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
            <Link to={menuUrl} className="kl-btn-primary">Lihat Menu</Link>
            <button className="kl-btn-ghost">Reservasi Meja</button>
          </div>
        </div>

        <div className="kl-hero-visual">
          {bestSellers.daily_food && (
            <div className="kl-mini-card top">
              <div className="kl-mini-emoji">{bestSellers.daily_food.image_url || '🍲'}</div>
              <div className="kl-mini-info">
                <h4>{bestSellers.daily_food.name}</h4>
                <span>Terlaris hari ini</span>
                <span className="kl-stars">★★★★★</span>
              </div>
            </div>
          )}

          <div className="kl-food-card-main">
            <div className="kl-food-img">{bestSellers.monthly?.image_url || '🍛'}</div>
            <div className="kl-food-card-body">
              <span className="kl-food-tag">Unggulan Bulan Ini</span>
              <h3>{bestSellers.monthly?.name || 'Menu Unggulan'}</h3>
              <p>{bestSellers.monthly?.description || 'Nikmati hidangan istimewa kami yang paling digemari pelanggan.'}</p>
              <div className="kl-food-footer">
                <div className="kl-price">
                  {bestSellers.monthly?.price 
                    ? `Rp ${new Intl.NumberFormat('id-ID').format(bestSellers.monthly.price)}` 
                    : 'Harga Spesial'}
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
                <span>Minuman Terlaris</span>
                <span className="kl-stars">Pilihan Favorit 🥤</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="kl-section">
        <div className="kl-section-header">
          <h2>Menu <em>Pilihan</em><br />Kami</h2>
          <Link to={menuUrl} className="kl-see-all">Lihat semua →</Link>
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
                  <div className="kl-item-price">{item.price}</div>
                  <div className="kl-item-rating"><span>★</span> 4.8</div>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400">
              Belum ada menu untuk kategori ini.
            </div>
          )}
        </div>
      </section>

      <div className="kl-banner">
        <div>
          <h2>{(settings.promo_title || 'Promo Spesial Akhir Pekan').split(' ').map((w, i) => i === 1 ? <em key={i}>{w} </em> : w + ' ')}</h2>
          <p>{settings.promo_desc || 'Dapatkan diskon menarik setiap hari.'}</p>
          <button className="kl-btn-primary">Klaim Promo</button>
        </div>
        <div className="kl-banner-right">🎉</div>
      </div>

      <section id="testimoni" className="kl-reviews-section">
        <div className="kl-section-header">
          <h2>Apa Kata <em>Pelanggan</em></h2>
          <p>Testimoni jujur dari mereka yang telah mencicipi kelezatan hidangan kami.</p>
          <button className="kl-btn-ghost mt-4" onClick={() => setShowReviewModal(true)}>+ Tulis Testimoni</button>
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
              <h2 className="text-xl font-black text-slate-800">Tulis Testimoni</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-2xl text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="kl-form-group mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Anda</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Masukkan nama Anda" value={reviewForm.customer_name} onChange={e => setReviewForm({...reviewForm, customer_name: e.target.value})} />
              </div>
              <div className="kl-form-group mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pekerjaan / Status (Opsional)</label>
                <input type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Contoh: Food Enthusiast" value={reviewForm.customer_role} onChange={e => setReviewForm({...reviewForm, customer_role: e.target.value})} />
              </div>
              <div className="kl-form-group mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, rating: s})} className={`text-2xl ${reviewForm.rating >= s ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="kl-form-group mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Komentar</label>
                <textarea required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[100px]" placeholder="Bagaimana pengalaman Anda mencicipi masakan kami?" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
              </div>
              <button type="submit" disabled={submittingReview} className="w-full py-4 bg-[#b48c36] text-white rounded-2xl font-bold shadow-lg shadow-amber-900/20">
                {submittingReview ? 'Mengirim...' : 'Kirim Testimoni ✨'}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="kl-footer">
        <div className="kl-footer-logo">{settings.store_name}</div>
        <p>© 2026 {settings.store_name} · {settings.address && settings.address !== 'Alamat belum diatur' ? settings.address : 'Alamat Toko Belum Diatur'}</p>
        <div className="kl-footer-links">
          {settings.instagram_url && <a href={settings.instagram_url}>Instagram</a>}
          {settings.whatsapp_number && <a href={`https://wa.me/${settings.whatsapp_number}`}>WhatsApp</a>}
          <a href="#">Kontak</a>
        </div>
      </footer>
    </div>
  );
};

export default CategoryStorefront;
