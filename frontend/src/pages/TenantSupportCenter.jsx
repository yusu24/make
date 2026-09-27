import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Plus, Search, MessageSquare, Tag, AlertCircle, Clock, CheckCircle2,
  HelpCircle, Phone, ChevronRight, X, ExternalLink,
  Shield, Check, RefreshCw, Send, AlertTriangle,
  Building2, Users, FileText, CheckCircle, Info, Sparkles
} from '@/constants/icons';
import { api } from '../lib/api';
import Modal from '../components/Modal';

const CATEGORY_MAP = {
  bug: { label: 'Bug / Kendala Sistem', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50' },
  question: { label: 'Pertanyaan Fitur', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50' },
  feature: { label: 'Usulan / Request Fitur', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50' },
  billing: { label: 'Tagihan & Langganan', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' },
};

const PRIORITY_MAP = {
  high: { label: 'Tinggi (Kritis)', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/60', sla: '< 1 Jam' },
  medium: { label: 'Sedang', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60', sla: '< 4 Jam' },
  low: { label: 'Rendah', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/60', sla: '< 24 Jam' },
};

const TenantSupportCenter = forwardRef(({ hideAction }, ref) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'question',
    priority: 'low',
    description: ''
  });

  useImperativeHandle(ref, () => ({
    openNewTicketModal: () => setIsModalOpen(true)
  }));

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support/tickets', {
        params: { status: filterStatus, search }
      });
      setTickets(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/support/tickets', formData);
      setIsModalOpen(false);
      setFormData({ subject: '', category: 'question', priority: 'low', description: '' });
      fetchTickets();
    } catch (err) {
      alert('Gagal membuat tiket: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    if (!confirm('Apakah kendala pada tiket ini sudah terselesaikan dengan baik?')) return;
    setResolvingId(ticketId);
    try {
      await api.patch(`/support/tickets/${ticketId}/status`, { status: 'resolved' });
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
      fetchTickets();
    } catch (err) {
      alert('Gagal menyelesaikan tiket: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setResolvingId(null);
    }
  };

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open').length;
  const progressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  const filteredTickets = tickets.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = (t.id || '').toLowerCase().includes(q);
      const matchSubject = (t.subject || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchId && !matchSubject && !matchDesc) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Menunggu Respon
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            <Clock size={12} className="text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            Sedang Ditangani
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 md:px-0 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── 1. HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Sistem Operasional Normal & Uptime 99.98%
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Pusat Bantuan & Layanan Tenant
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Tim dukungan teknis Bizora siap membantu kelancaran operasional toko Anda. Hubungi kami melalui tiket kendala resmi atau respon kilat via WhatsApp Helpdesk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Support%20Bizora,%20saya%20tenant%20membutuhkan%20bantuan%20operasional%20toko."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs md:text-sm shadow-md transition-all cursor-pointer"
            >
              <Phone size={16} />
              <span>WhatsApp CS Cepat</span>
            </a>

            {!hideAction && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs md:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Buat Tiket Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. KPI METRICS CARDS (shadcn Card style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tiket */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-all hover:border-indigo-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Riwayat Tiket
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Seluruh tiket kendala</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <MessageSquare size={22} />
          </div>
        </div>

        {/* Menunggu Respon */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-all hover:border-blue-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Menunggu Respon
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {openCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Antrean tim support</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>

        {/* Sedang Ditangani */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-all hover:border-amber-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sedang Ditangani
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {progressCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Dalam proses perbaikan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Tiket Selesai */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-all hover:border-emerald-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tiket Selesai
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {resolvedCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Kendala terselesaikan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* ── 3. DAFTAR TIKET KENDALA ── */}
      <div className="space-y-4">
        {/* Toolbar Search & Filter */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID tiket, subjek kendala, atau pesan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchTickets(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="open">Menunggu Respon (Open)</option>
              <option value="in_progress">Sedang Ditangani (In Progress)</option>
              <option value="resolved">Selesai (Resolved)</option>
            </select>

            {/* Filter Kategori */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="bug">Bug / Kendala Sistem</option>
              <option value="question">Pertanyaan Fitur</option>
              <option value="feature">Usulan Fitur</option>
              <option value="billing">Tagihan & Billing</option>
            </select>

            <button
              onClick={fetchTickets}
              title="Segarkan Tiket"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <span className="text-sm font-semibold">Memuat riwayat tiket bantuan...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={30} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                {tickets.length === 0 ? 'Belum Ada Tiket Bantuan' : 'Tidak Ada Tiket yang Cocok'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                {tickets.length === 0
                  ? 'Jika mengalami kendala operasional, error sistem, atau butuh panduan, silakan buat tiket baru.'
                  : 'Coba ubah kata kunci pencarian atau sesuaikan filter status dan kategori tiket.'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} />
                <span>Buat Tiket Baru Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">ID & Waktu</th>
                    <th className="py-3 px-5">Subjek Kendala</th>
                    <th className="py-3 px-4">Prioritas & SLA</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5">Petugas CS</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredTickets.map((t) => {
                    const cat = CATEGORY_MAP[t.category] || CATEGORY_MAP.question;
                    const priority = PRIORITY_MAP[t.priority] || PRIORITY_MAP.low;
                    const IconComponent = cat.icon;

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        {/* ID & Date */}
                        <td className="py-4 px-5 align-top whitespace-nowrap">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline block">
                            {t.id}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {t.date ? new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari Ini'}
                          </span>
                        </td>

                        {/* Subject & Category */}
                        <td className="py-4 px-5 align-top max-w-md">
                          <div className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                            {t.subject}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cat.color}`}>
                              <IconComponent size={11} />
                              <span>{cat.label}</span>
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${priority.badge}`}>
                            {priority.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">SLA: {priority.sla}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          {getStatusBadge(t.status)}
                        </td>

                        {/* Assigned Agent */}
                        <td className="py-4 px-5 align-top whitespace-nowrap">
                          {t.assigned && t.assigned !== '—' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {t.assigned.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {t.assigned}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum ditugaskan</span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(t);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors font-semibold"
                          >
                            <span>Detail</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. MODAL DETAIL TIKET ── */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Detail Tiket: ${selectedTicket.id}`}
          maxWidth="700px"
        >
          <div className="space-y-5 pt-3">
            {/* Header info */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subjek Kendala</span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedTicket.subject}</h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedTicket.status)}
              </div>
            </div>

            {/* Step Progress Tracker */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">Status Penanganan Tiket</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mb-1 shadow-xs">
                    <Check size={14} />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Dibuat</span>
                  <span className="text-[10px] text-slate-400">{selectedTicket.date || 'Hari Ini'}</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs ${selectedTicket.status !== 'open' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white animate-pulse'}`}>
                    {selectedTicket.status !== 'open' ? <Check size={14} /> : '2'}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Diverifikasi</span>
                  <span className="text-[10px] text-slate-400">Tim Support</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs ${selectedTicket.status === 'resolved' ? 'bg-emerald-500 text-white' : selectedTicket.status === 'in_progress' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedTicket.status === 'resolved' ? <Check size={14} /> : '3'}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Dikerjakan</span>
                  <span className="text-[10px] text-slate-400">{selectedTicket.assigned || 'Specialist'}</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs ${selectedTicket.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedTicket.status === 'resolved' ? <Check size={14} /> : '4'}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Selesai</span>
                  <span className="text-[10px] text-slate-400">{selectedTicket.status === 'resolved' ? 'Confirmed' : 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Deskripsi Kendala yang Dilaporkan</label>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedTicket.description || 'Tidak ada keterangan tambahan.'}
              </div>
            </div>

            {/* Official Support Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Respon & Tindak Lanjut Tim Support</label>
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                {selectedTicket.status === 'resolved' ? (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-800 dark:text-emerald-300">Solusi Berhasil Diterapkan:</strong> Tim support teknis Bizora telah memverifikasi dan menyelesaikan kendala ini. Seluruh integrasi telah kembali normal.
                    </div>
                  </div>
                ) : selectedTicket.status === 'in_progress' ? (
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-800 dark:text-amber-300">Sedang Dalam Penanganan:</strong> Tiket telah dialokasikan ke <strong>{selectedTicket.assigned || 'Spesialis Teknis'}</strong>. Kami sedang melakukan investigasi mendalam dan update status akan diberikan sesegera mungkin.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-800 dark:text-blue-300">Tiket Terdaftar dalam Antrean:</strong> Tiket Anda sedang menunggu review awal oleh customer support. Estimasi waktu respon maksimal 2 jam kerja.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20CS%20Bizora,%20saya%20ingin%20menanyakan%20progres%20tiket%20bantuan%20nomor%20${selectedTicket.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors"
              >
                <Phone size={14} />
                <span>Follow-up via WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                {selectedTicket.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolveTicket(selectedTicket.id)}
                    disabled={resolvingId === selectedTicket.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    <span>{resolvingId === selectedTicket.id ? 'Memproses...' : 'Tandai Selesai'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 5. MODAL BUAT TIKET BARU ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Tiket Bantuan Baru"
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Subjek */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subjek / Judul Kendala <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Stok di Shopee tidak terpotong setelah flash sale"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Kategori Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori Kendala <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_MAP).map(([key, item]) => {
                const isSelected = formData.category === key;
                const IconComponent = item.icon;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setFormData({ ...formData, category: key })}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tingkat Prioritas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tingkat Prioritas & SLA Respon <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRIORITY_MAP).map(([key, item]) => {
                const isSelected = formData.priority === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setFormData({ ...formData, priority: key })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs block font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">SLA {item.sla}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Rincian Kendala & Penjelasan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Ceritakan detail kendala yang dialami, misal: nama marketplace, nomor pesanan, SKU barang, atau langkah sebelum kendala muncul..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-y"
            ></textarea>
          </div>

          {/* Tips info box */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>Tiket yang dilaporkan akan langsung masuk ke dashboard monitoring tim engineering Bizora.</span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Kirim Tiket Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

export default TenantSupportCenter;
