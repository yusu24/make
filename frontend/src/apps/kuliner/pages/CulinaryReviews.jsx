import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../contexts/I18nContext';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import './KulinerDashboard.css';
import { 
  Star, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  EyeOff, 
  Search, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const CulinaryReviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, displayed, pending, complaint
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, low (1-2)
  const [selectedReview, setSelectedReview] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kuliner/admin/testimonials');
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { total: 0, averageRating: '0.0', positiveRate: 0, pending: 0, complaints: 0 };
    }

    const approved = reviews.filter(r => r.is_displayed);
    const avg = approved.length > 0 
      ? approved.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / approved.length 
      : (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total);
    
    const positiveCount = reviews.filter(r => Number(r.rating) >= 4).length;
    const pendingCount = reviews.filter(r => !r.is_displayed).length;
    const complaintCount = reviews.filter(r => Number(r.rating) <= 2).length;

    return {
      total,
      averageRating: avg.toFixed(1),
      positiveRate: Math.round((positiveCount / total) * 100),
      pending: pendingCount,
      complaints: complaintCount
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Search
      const searchMatch = !searchTerm || 
        r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      let statusMatch = true;
      if (statusFilter === 'displayed') statusMatch = Boolean(r.is_displayed);
      if (statusFilter === 'pending') statusMatch = !r.is_displayed;
      if (statusFilter === 'complaint') statusMatch = Number(r.rating) <= 2;

      // Rating
      let ratingMatch = true;
      if (ratingFilter === '5') ratingMatch = Number(r.rating) === 5;
      if (ratingFilter === '4') ratingMatch = Number(r.rating) === 4;
      if (ratingFilter === '3') ratingMatch = Number(r.rating) === 3;
      if (ratingFilter === 'low') ratingMatch = Number(r.rating) <= 2;

      return searchMatch && statusMatch && ratingMatch;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  const toggleDisplay = async (id, currentStatus) => {
    try {
      await api.patch(`/kuliner/admin/testimonials/${id}/status`, {
        is_displayed: !currentStatus
      });
      
      setReviews(reviews.map(r => r.id === id ? { ...r, is_displayed: !currentStatus } : r));
      if (selectedReview && selectedReview.id === id) {
        setSelectedReview(prev => ({ ...prev, is_displayed: !currentStatus }));
      }
    } catch (error) {
      alert('Gagal memperbarui status ulasan.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/kuliner/admin/testimonials/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      if (selectedReview && selectedReview.id === id) {
        setSelectedReview(null);
      }
      setDeleteConfirmId(null);
    } catch (error) {
      alert('Gagal menghapus ulasan.');
    }
  };

  const renderStars = (rating) => {
    const num = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            style={{
              color: star <= num ? '#f59e0b' : '#e2e8f0',
              fill: star <= num ? '#f59e0b' : 'none'
            }}
          />
        ))}
        <span style={{ marginLeft: 5, fontSize: 12, fontWeight: 700, color: num <= 2 ? '#e11d48' : '#475569' }}>
          {Number(rating).toFixed(1)}
        </span>
      </div>
    );
  };

  const getTemplateReply = (review) => {
    if (!review) return '';
    if (Number(review.rating) >= 4) {
      return `Halo Kak ${review.customer_name}, terima kasih banyak atas ulasan positif dan bintang ${review.rating}-nya! Senang sekali bisa menyajikan yang terbaik untuk Anda. Ditunggu kunjungan & pesanan berikutnya ya! 🙏😊`;
    }
    return `Halo Kak ${review.customer_name}, mohon maaf yang sebesar-besarnya atas ketidaknyamanan yang dialami. Masukan Anda sangat berharga bagi kami untuk terus meningkatkan kualitas hidangan & pelayanan. Kami siap menindaklanjuti hal ini segera. Terima kasih! 🙏`;
  };

  const copyReply = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Ulasan & Feedback Pelanggan</h1>
          <p className="text-xs text-slate-500" style={{ marginTop: 2 }}>
            Kelola dan moderasi testimoni dari pembeli dan pengunjung storefront resto.
          </p>
        </div>
      </div>

      <div className="kd-content">
        {/* ── Stat Cards Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
          <div className="kd-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Ulasan</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
            </div>
          </div>

          <div className="kd-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} style={{ fill: '#d97706' }} />
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rata-rata Rating</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {stats.averageRating} <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>/ 5.0</span>
              </div>
            </div>
          </div>

          <div className="kd-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kepuasan Positif</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>{stats.positiveRate}%</div>
            </div>
          </div>

          <div className="kd-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: stats.complaints > 0 ? '#fff1f2' : '#f8fafc', color: stats.complaints > 0 ? '#e11d48' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stats.complaints > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stats.complaints > 0 ? 'Perlu Ditangani' : 'Menunggu Moderasi'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: stats.complaints > 0 ? '#e11d48' : '#0f172a' }}>
                {stats.complaints > 0 ? `${stats.complaints} Keluhan` : `${stats.pending} Ulasan`}
              </div>
            </div>
          </div>
        </div>

        {/* ── Table Panel & Filters ── */}
        <div className="kd-panel" style={{ padding: '18px 20px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari nama pelanggan atau ulasan..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: 9999,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '6.5px 12px',
                  borderRadius: 9999,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  background: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">Semua Status</option>
                <option value="displayed">Dipublikasikan</option>
                <option value="pending">Menunggu Persetujuan</option>
                <option value="complaint">Keluhan Pelanggan (★ 1-2)</option>
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '6.5px 12px',
                  borderRadius: 9999,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  background: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">Semua Rating</option>
                <option value="5">⭐⭐⭐⭐⭐ Bintang 5</option>
                <option value="4">⭐⭐⭐⭐ Bintang 4</option>
                <option value="3">⭐⭐⭐ Bintang 3</option>
                <option value="low">⭐⭐ / ⭐ Bintang 1-2</option>
              </select>

              {(searchTerm || statusFilter !== 'all' || ratingFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setRatingFilter('all');
                    setCurrentPage(1);
                  }}
                  className="kd-btn kd-btn-secondary"
                  style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 11.5 }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ width: 34, height: 34, margin: '0 auto 14px' }}></div>
              <p className="text-slate-400" style={{ fontSize: 13 }}>{t('kulinerCommon.loadingData') || 'Memuat data ulasan...'}</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
                {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all' 
                  ? 'Tidak ada ulasan yang cocok dengan filter' 
                  : 'Belum ada ulasan pelanggan'}
              </h4>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                Ulasan yang dikirimkan pelanggan dari storefront akan otomatis muncul di tabel ini.
              </p>
            </div>
          ) : (
            <>
              <div className="kd-table-container" style={{ overflowX: 'auto' }}>
                <table className="kd-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 44, textAlign: 'center' }}>#</th>
                      <th style={{ minWidth: 190 }}>Pelanggan</th>
                      <th style={{ width: 130 }}>Rating</th>
                      <th style={{ minWidth: 260 }}>Ulasan / Komentar</th>
                      <th style={{ width: 140 }}>Status</th>
                      <th style={{ width: 130, textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReviews.map((review, index) => {
                      const isLowRating = Number(review.rating) <= 2;
                      const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                      return (
                        <tr 
                          key={review.id}
                          style={{
                            background: isLowRating && !review.is_displayed ? '#fff1f2' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* Index */}
                          <td style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                            {globalIndex}
                          </td>

                          {/* Customer */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  background: isLowRating ? '#fecdd3' : '#eff6ff',
                                  color: isLowRating ? '#e11d48' : '#2563eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13.5,
                                  fontWeight: 700,
                                  flexShrink: 0
                                }}
                              >
                                {isLowRating ? '⚠️' : (review.customer_name?.charAt(0).toUpperCase() || 'P')}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                                  {review.customer_name}
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                  {new Date(review.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Rating */}
                          <td>
                            {renderStars(review.rating)}
                          </td>

                          {/* Comment */}
                          <td>
                            <div 
                              style={{ 
                                fontSize: 12.5, 
                                color: isLowRating ? '#9f1239' : '#334155',
                                fontStyle: 'italic',
                                maxHeight: 40,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4
                              }}
                              title={review.comment}
                            >
                              "{review.comment}"
                            </div>
                          </td>

                          {/* Status */}
                          <td>
                            {isLowRating && !review.is_displayed ? (
                              <span 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '2.5px 8px',
                                  borderRadius: 9999,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5'
                                }}
                              >
                                🚨 Keluhan
                              </span>
                            ) : review.is_displayed ? (
                              <span 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '2.5px 8px',
                                  borderRadius: 9999,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  border: '1px solid #86efac'
                                }}
                              >
                                <Check size={11} /> Tayang
                              </span>
                            ) : (
                              <span 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '2.5px 8px',
                                  borderRadius: 9999,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                  border: '1px solid #cbd5e1'
                                }}
                              >
                                ⏳ Tertunda
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {/* Toggle Display */}
                              <button
                                onClick={() => toggleDisplay(review.id, review.is_displayed)}
                                title={review.is_displayed ? 'Sembunyikan dari storefront' : 'Setujui dan tampilkan di storefront'}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: review.is_displayed ? '#f1f5f9' : '#10b981',
                                  color: review.is_displayed ? '#475569' : '#ffffff',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {review.is_displayed ? <EyeOff size={14} /> : <CheckCircle2 size={14} />}
                              </button>

                              {/* View Details / Reply */}
                              <button
                                onClick={() => setSelectedReview(review)}
                                title="Lihat detail ulasan & salin balasan"
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 8,
                                  border: '1px solid #e2e8f0',
                                  background: '#ffffff',
                                  color: '#2563eb',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Eye size={14} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirmId(review.id)}
                                title="Hapus ulasan"
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: '#fee2e2',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: 12, 
                  marginTop: 16, 
                  paddingTop: 14, 
                  borderTop: '1px solid #f1f5f9' 
                }}
              >
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Menampilkan <b>{Math.min(filteredReviews.length, (currentPage - 1) * itemsPerPage + 1)}</b>-<b>{Math.min(filteredReviews.length, currentPage * itemsPerPage)}</b> dari <b>{filteredReviews.length}</b> ulasan
                </div>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: page === currentPage ? 'none' : '1px solid #e2e8f0',
                          background: page === currentPage ? '#2563eb' : '#ffffff',
                          color: page === currentPage ? '#ffffff' : '#475569',
                          fontWeight: page === currentPage ? 700 : 500,
                          fontSize: 11.5,
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Reputation Tip Card ── */}
        <div style={{ marginTop: 20, padding: '18px 22px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 16, color: '#fff', display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>📈</div>
          <div>
            <h4 style={{ fontWeight: 800, color: '#ffffff', fontSize: 14.5, marginBottom: 2 }}>Tips Membangun Reputasi Kuliner</h4>
            <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              Ulasan bintang 4-5 yang disetujui akan langsung tampil di halaman depan storefront resto untuk meyakinkan calon pelanggan baru. Membalas masukan pelanggan dengan cepat dapat menaikkan repeat order hingga 70%.
            </p>
          </div>
        </div>
      </div>

      {/* ── Detail & Balas Modal ── */}
      {selectedReview && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: 16
          }}
          onClick={() => setSelectedReview(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 18,
              maxWidth: 500,
              width: '100%',
              padding: 22,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: Number(selectedReview.rating) <= 2 ? '#fecdd3' : '#eff6ff',
                    color: Number(selectedReview.rating) <= 2 ? '#e11d48' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 800
                  }}
                >
                  {Number(selectedReview.rating) <= 2 ? '⚠️' : (selectedReview.customer_name?.charAt(0).toUpperCase() || 'P')}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', margin: 0 }}>{selectedReview.customer_name}</h3>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {new Date(selectedReview.created_at).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })} WIB
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Rating Stars */}
            <div style={{ marginBottom: 12 }}>
              {renderStars(selectedReview.rating)}
            </div>

            {/* Comment Box */}
            <div 
              style={{
                padding: 14,
                borderRadius: 12,
                background: Number(selectedReview.rating) <= 2 ? '#fff1f2' : '#f8fafc',
                border: Number(selectedReview.rating) <= 2 ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                color: Number(selectedReview.rating) <= 2 ? '#9f1239' : '#1e293b',
                fontSize: 13,
                fontStyle: 'italic',
                lineHeight: 1.5,
                marginBottom: 16
              }}
            >
              "{selectedReview.comment}"
            </div>

            {/* Template Balasan Otomatis */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Template Balasan Cepat
                </span>
                <button
                  onClick={() => copyReply(getTemplateReply(selectedReview))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: copiedTemplate ? '#10b981' : '#2563eb',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {copiedTemplate ? <Check size={13} /> : <Copy size={13} />}
                  {copiedTemplate ? 'Tersalin!' : 'Salin Teks'}
                </button>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f1f5f9', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                {getTemplateReply(selectedReview)}
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => toggleDisplay(selectedReview.id, selectedReview.is_displayed)}
                className="kd-btn"
                style={{
                  padding: '7px 16px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: selectedReview.is_displayed ? '#f1f5f9' : '#10b981',
                  color: selectedReview.is_displayed ? '#475569' : '#ffffff',
                  border: selectedReview.is_displayed ? '1px solid #cbd5e1' : 'none',
                  cursor: 'pointer'
                }}
              >
                {selectedReview.is_displayed ? '🚫 Sembunyikan' : '✅ Setujui & Tampilkan'}
              </button>

              <button
                onClick={() => setSelectedReview(null)}
                className="kd-btn kd-btn-secondary"
                style={{ padding: '7px 16px', borderRadius: 9999, fontSize: 12 }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteConfirmId && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: 16
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 380,
              width: '100%',
              padding: 22,
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={22} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 5 }}>Hapus Ulasan Ini?</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 18 }}>
              Ulasan yang dihapus tidak dapat dipulihkan kembali. Anda yakin ingin melanjutkan?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="kd-btn kd-btn-secondary"
                style={{ padding: '7px 16px', borderRadius: 9999, fontSize: 12 }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 9999,
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryReviews;
