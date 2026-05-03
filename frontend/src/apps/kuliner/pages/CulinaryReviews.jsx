import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import './KulinerDashboard.css';

const CulinaryReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    positiveRate: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kuliner/admin/testimonials');
      setReviews(response.data || []);
      
      if (response.data && response.data.length > 0) {
        const approved = response.data.filter(r => r.is_displayed);
        const avg = approved.length > 0 
          ? approved.reduce((acc, r) => acc + r.rating, 0) / approved.length 
          : 0;
        setStats({
          averageRating: avg.toFixed(1),
          totalReviews: response.data.length,
          positiveRate: response.data.length > 0 
            ? Math.round((response.data.filter(r => r.rating >= 4).length / response.data.length) * 100)
            : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisplay = async (id, currentStatus) => {
    try {
      await api.patch(`/kuliner/admin/testimonials/${id}/status`, {
        is_displayed: !currentStatus
      });
      
      setReviews(reviews.map(r => r.id === id ? { ...r, is_displayed: !currentStatus } : r));
      alert(`Ulasan berhasil ${!currentStatus ? 'disetujui dan ditampilkan' : 'disembunyikan'}! ✨`);
    } catch (error) {
      alert('Gagal memperbarui status ulasan.');
    }
  };

  const renderStars = (count) => {
    return '⭐'.repeat(count) + '☆'.repeat(5 - count);
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Ulasan Pelanggan</h1>
          <p className="text-sm text-slate-500 mt-1">Dengarkan suara pelanggan untuk meningkatkan kualitas layanan Anda.</p>
        </div>
        <div className="kd-topbar-actions">
          <div style={{ textAlign: 'right' }}>
            <div className="text-2xl font-black text-slate-800">{stats.averageRating} / 5.0</div>
            <div className="text-[10px] text-amber-500 font-bold tracking-widest">Skor Kepuasan Rata-rata</div>
          </div>
        </div>
      </div>

      <div className="kd-content">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 20px' }}></div>
            <p className="text-slate-400">Memuat ulasan pelanggan...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="kd-panel text-center py-20">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-bold text-slate-800 text-lg">Belum ada ulasan</h3>
            <p className="text-sm text-slate-400">Ulasan dari pelanggan di storefront akan muncul di sini.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: 20 }}>
            {reviews.map(review => {
              const isLowRating = review.rating <= 2;
              return (
                <div 
                  key={review.id} 
                  className="kd-panel shadow-sm hover:shadow-md transition-all" 
                  style={{ 
                    opacity: review.is_displayed ? 1 : 0.8,
                    borderLeft: isLowRating ? '4px solid #ef4444' : (review.is_displayed ? '4px solid #10b981' : '4px solid #cbd5e1'),
                    background: isLowRating ? '#fff1f2' : (review.is_displayed ? '#f0fdf4' : '#ffffff')
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        background: isLowRating ? '#fecdd3' : '#f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: 20, 
                        fontWeight: 'bold', 
                        color: isLowRating ? '#e11d48' : '#b48c36' 
                      }}>
                        {isLowRating ? '⚠️' : review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{review.customer_name}</h3>
                        <div className={`text-xs ${isLowRating ? 'text-red-500' : 'text-amber-500'} font-bold tracking-tight`}>
                          {isLowRating ? '★'.repeat(review.rating) + '☆'.repeat(5-review.rating) : renderStars(review.rating)}
                          <span className="text-slate-400 ml-2 font-normal">| {new Date(review.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLowRating && !review.is_displayed && (
                        <span className="kd-status-badge kd-status-danger animate-pulse">
                          Keluhan Pelanggan 🚨
                        </span>
                      )}
                      <span className={`kd-status-badge ${review.is_displayed ? 'kd-status-active' : 'kd-status-draft'}`}>
                        {review.is_displayed ? 'Dipublikasikan' : 'Menunggu Persetujuan'}
                      </span>
                    </div>
                  </div>

                  <div className={`mt-4 p-4 ${isLowRating ? 'bg-white/50 border border-red-100' : 'bg-slate-50'} rounded-xl italic text-sm ${isLowRating ? 'text-red-700 font-medium' : 'text-slate-600'} leading-relaxed`}>
                    "{review.comment}"
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    {!review.is_displayed ? (
                      <button 
                        onClick={() => toggleDisplay(review.id, false)}
                        className="kd-btn kd-btn-primary" 
                        style={{ padding: '6px 20px', fontSize: 11, background: isLowRating ? '#e11d48' : '#10b981' }}
                      >
                        {isLowRating ? '✅ Selesaikan & Tampilkan' : '✅ Setujui & Tampilkan'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => toggleDisplay(review.id, true)}
                        className="kd-btn kd-btn-secondary" 
                        style={{ padding: '6px 20px', fontSize: 11 }}
                      >
                        🚫 Sembunyikan
                      </button>
                    )}
                    <button className="kd-btn kd-btn-secondary" style={{ padding: '6px 16px', fontSize: 11 }}>Hapus</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 40, padding: 32, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 24, color: '#fff' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ fontSize: 48 }}>📈</div>
            <div>
              <h5 className="font-bold text-white text-lg mb-1">Reputasi Anda Semakin Meningkat!</h5>
              <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">92% pelanggan memberikan ulasan bintang 5 minggu ini. Membalas ulasan negatif dengan sopan dapat meningkatkan kemungkinan pelanggan tersebut kembali hingga 70%.</p>
            </div>
          </div>
        </div>
      </div>
    </KulinerAdminLayout>
  );
};

export default CulinaryReviews;
