import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import './CategoryStorefront.css';

const CategoryStorefront = () => {
  const [activeCat, setActiveCat] = useState('Semua');
  const [settings, setSettings] = useState({
    store_name: 'Dapur Nusantara',
    opening_hours: 'Buka hari ini · 10:00 – 22:00',
    hero_title: 'Cita Rasa Autentik Nusantara',
    hero_subtitle: 'Nikmati kelezatan masakan tradisional Indonesia yang diracik dengan rempah pilihan dan cinta, langsung dari dapur nenek moyang.',
    promo_title: 'Promo Spesial Akhir Pekan',
    promo_desc: 'Dapatkan diskon 20% untuk semua menu utama setiap Sabtu dan Minggu. Berlaku untuk makan di tempat maupun pesan antar.'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/kuliner/public/settings');
      if (response.data) setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Failed to fetch storefront settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{background: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#b48c36'}}>Dapur Nusantara...</div>;

  const categories = [
    'Semua', 'Nasi & Lauk', 'Sup & Soto', 'Seafood', 'Minuman', 'Dessert'
  ];

  const menuItems = [
    { id: 1, name: 'Nasi Gudeg Jogja', desc: 'Nangka muda dimasak santan kental, disajikan dengan krecek dan ayam opor.', price: 'Rp 32.000', rating: '4.9 (312)', emoji: '🍛', class: 'kl-mi-1' },
    { id: 2, name: 'Gado-Gado Jakarta', desc: 'Sayuran segar dengan bumbu kacang spesial dan lontong.', price: 'Rp 25.000', rating: '4.7 (198)', emoji: '🥗', class: 'kl-mi-2' },
    { id: 3, name: 'Mie Aceh Spesial', desc: 'Mie kuning tebal dengan kuah rempah kari yang kaya dan seafood segar.', price: 'Rp 38.000', rating: '4.8 (247)', emoji: '🍜', class: 'kl-mi-3' },
    { id: 4, name: 'Sate Madura', desc: '10 tusuk sate ayam/kambing dengan bumbu kacang dan kecap manis.', price: 'Rp 30.000', rating: '4.9 (421)', emoji: '🍢', class: 'kl-mi-4' },
    { id: 5, name: 'Udang Saus Padang', desc: 'Udang jumbo segar dengan saus padang pedas manis yang menggugah selera.', price: 'Rp 55.000', rating: '4.8 (156)', emoji: '🦐', class: 'kl-mi-5' },
    { id: 6, name: 'Es Dawet Ayu', desc: 'Minuman tradisional Jawa dengan cendol, santan segar, dan gula aren.', price: 'Rp 15.000', rating: '4.6 (89)', emoji: '🍮', class: 'kl-mi-6' },
  ];

  return (
    <div className="kl-storefront">
      <nav className="kl-nav">
        <div className="kl-logo">{settings.store_name}</div>
        <ul className="kl-nav-links">
          <li><Link to="/kuliner">Menu</Link></li>
          <li><Link to="/kuliner/admin/categories">Admin Kategori</Link></li>
          <li><Link to="/kuliner/admin/settings">Pengaturan</Link></li>
          <li><a href="#">Tentang Kami</a></li>
        </ul>
        <button className="kl-nav-cta">Pesan Sekarang</button>
      </nav>

      <section className="kl-hero">
        <div className="kl-hero-text">
          <div className="kl-badge">
            <div className="kl-badge-dot"></div>
            {settings.opening_hours || 'Buka hari ini · 10:00 – 22:00'}
          </div>
          <h1 dangerouslySetInnerHTML={{ 
            __html: (settings.hero_title || 'Cita Rasa Autentik Nusantara').replace('Autentik', '<em>Autentik</em>') 
          }}></h1>
          <p>{settings.hero_subtitle || 'Nikmati kelezatan masakan tradisional Indonesia yang diracik dengan rempah pilihan dan cinta.'}</p>
          <div className="kl-hero-actions">
            <Link to="/kuliner/menu" className="kl-btn-primary">Lihat Menu</Link>
            <button className="kl-btn-ghost">Reservasi Meja</button>
          </div>
        </div>

        <div className="kl-hero-visual">
          <div className="kl-mini-card top">
            <div className="kl-mini-emoji">🍲</div>
            <div className="kl-mini-info">
              <h4>Soto Betawi</h4>
              <span>Terlaris hari ini</span>
              <span className="kl-stars">★★★★★</span>
            </div>
          </div>

          <div className="kl-food-card-main">
            <div className="kl-food-img">🍛</div>
            <div className="kl-food-card-body">
              <span className="kl-food-tag">Unggulan</span>
              <h3>Rendang Padang</h3>
              <p>Daging sapi empuk dimasak perlahan dengan santan dan 20+ rempah pilihan.</p>
              <div className="kl-food-footer">
                <div className="kl-price">Rp 45.000</div>
                <button className="kl-add-btn">+</button>
              </div>
            </div>
          </div>

          <div className="kl-mini-card bottom">
            <div className="kl-mini-emoji">🛵</div>
            <div className="kl-mini-info">
              <h4>Gratis Ongkir</h4>
              <span>Order di atas 100rb</span>
              <span className="kl-stars">Berlaku hari ini</span>
            </div>
          </div>
        </div>
      </section>

      <section className="kl-section">
        <div className="kl-section-header">
          <h2>Menu <em>Pilihan</em><br />Kami</h2>
          <Link to="/kuliner/menu" className="kl-see-all">Lihat semua →</Link>
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
          {menuItems.map(item => (
            <div key={item.id} className="kl-menu-item">
              <div className={`kl-menu-item-img ${item.class}`}>{item.emoji}</div>
              <div className="kl-menu-item-body">
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
                <div className="kl-menu-item-footer">
                  <div className="kl-item-price">{item.price}</div>
                  <div className="kl-item-rating"><span>★</span> {item.rating}</div>
                </div>
              </div>
            </div>
          ))}
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

      <section className="kl-reviews-section">
        <div className="kl-section-header">
          <h2>Apa Kata <em>Pelanggan</em></h2>
          <p>Testimoni jujur dari mereka yang telah mencicipi kelezatan hidangan kami.</p>
        </div>
        <div className="kl-reviews-container">
          {[
            { name: 'Budi Santoso', initial: 'B', role: 'Food Enthusiast', text: 'Rendangnya benar-benar autentik! Bumbunya meresap sampai ke serat daging terdalam. Sangat direkomendasikan.', stars: 5 },
            { name: 'Siti Aminah', initial: 'S', role: 'Ibu Rumah Tangga', text: 'Anak-anak suka sekali dengan Nasi Gudegnya. Rasanya pas, tidak terlalu manis dan porsinya mengenyangkan.', stars: 5 },
            { name: 'Andi Wijaya', initial: 'A', role: 'Pekerja Kantoran', text: 'Soto Betawinya juara! Kuahnya kental dan gurih. Pas banget buat makan siang bareng teman kantor.', stars: 4 },
            { name: 'Dewi Lestari', initial: 'D', role: 'Traveler', text: 'Tempatnya nyaman, pelayanannya ramah, dan yang paling penting makanannya luar biasa lezat. Pasti balik lagi!', stars: 5 }
          ].map((rev, idx) => (
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

      <footer className="kl-footer">
        <div className="kl-footer-logo">{settings.store_name}</div>
        <p>© 2026 {settings.store_name} · {settings.address || 'Jl. Pemuda No. 45, Surabaya'}</p>
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
