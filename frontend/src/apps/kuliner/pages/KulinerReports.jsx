import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from '../../../contexts/I18nContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { Printer, TrendingUp, TrendingDown, DollarSign } from '@/constants/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import ClientPagination from '../components/ClientPagination';
import './KulinerDashboard.css';
import '../kuliner-print.css';
import {
  KulinerPrintHeader,
  KulinerPrintSectionHeader,
  KulinerPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/KulinerPrintLayout';

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

const CustomTooltip = ({ active, payload, label, isBest }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '10px 14px',
        borderRadius: 10,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontSize: 12,
        border: '1px solid #334155',
        lineHeight: 1.4
      }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 12.5, color: '#F8FAFC' }}>{data.name || label}</p>
        <p style={{ margin: '4px 0 2px', color: isBest ? '#34D399' : '#F87171', fontWeight: 600 }}>
          Terjual: <strong>{data.qty_sold} porsi</strong>
        </p>
        <p style={{ margin: 0, color: '#94A3B8' }}>
          Omzet: <strong>{formatRp(data.revenue)}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function KulinerReports() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [loading, setLoading] = useState(true);
  const [margin, setMargin] = useState([]);
  const [best, setBest] = useState([]);
  const [worst, setWorst] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState('');
  
  // Pagination State for Margin Table
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Laba-Margin-Menu-${new Date().toISOString().split('T')[0]}`,
    pageStyle: "@page { size: A4; margin: 1cm !important; }",
  });

  const load = async () => {
    setLoading(true);
    const params = { date_from: dateFrom, date_to: dateTo };
    if (selectedCashier) params.kasir = selectedCashier;
    try {
      const [marginRes, bestRes, worstRes] = await Promise.all([
        api.get('/kuliner/admin/reports/menu-margin', { params }),
        api.get('/kuliner/admin/reports/best-sellers', { params }),
        api.get('/kuliner/admin/reports/worst-sellers', { params }),
      ]);
      setMargin(marginRes.data || []);
      setBest(bestRes.data || []);
      setWorst(worstRes.data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error('Gagal memuat laporan', e);
    } finally {
      setLoading(false);
    }
  };

  const loadCashiers = async () => {
    try {
      const res = await api.get('/kuliner/admin/reports/cashiers');
      setCashiers(res.data || []);
    } catch (e) {
      console.error('Gagal memuat kasir', e);
    }
  };

  useEffect(() => { 
    loadCashiers();
    load(); 
  }, [dateFrom, dateTo, selectedCashier]);

  // Top 5 Best & Worst items (or all if < 5)
  const top5Best = useMemo(() => {
    return best.slice(0, 5).map(item => ({
      ...item,
      shortName: item.name.length > 14 ? item.name.slice(0, 13) + '…' : item.name
    }));
  }, [best]);

  const top5Worst = useMemo(() => {
    return worst.slice(0, 5).map(item => ({
      ...item,
      shortName: item.name.length > 14 ? item.name.slice(0, 13) + '…' : item.name
    }));
  }, [worst]);

  // Total summary calculations
  const totalRevenue = useMemo(() => margin.reduce((acc, m) => acc + (m.revenue || 0), 0), [margin]);
  const totalCogs = useMemo(() => margin.reduce((acc, m) => acc + (m.cogs || 0), 0), [margin]);
  const totalMargin = useMemo(() => margin.reduce((acc, m) => acc + (m.margin || 0), 0), [margin]);
  const avgMarginPct = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0;

  // Pagination for Margin table
  const totalPages = Math.ceil(margin.length / itemsPerPage) || 1;
  const paginatedMargin = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return margin.slice(start, start + itemsPerPage);
  }, [margin, currentPage, itemsPerPage]);

  return (
    <KulinerAdminLayout>
      {/* Topbar Header */}
      <div className="kd-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="kd-page-title">Laba & Margin Menu</h1>
        <button
          onClick={handlePrint}
          className="kd-btn kd-btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13, fontWeight: 600, border: '1px solid #CBD5E1', borderRadius: 8 }}
          title="Cetak atau Simpan sebagai Dokumen PDF"
        >
          <Printer size={16} />
          <span>Export PDF / Cetak</span>
        </button>
      </div>

      <div className="kd-content">
        {/* Filter Panel */}
        <div className="kd-panel" style={{ padding: 16, marginBottom: 20, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="kd-form-group" style={{ marginBottom: 0 }}>
              <label className="kd-form-label" style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                {t('kulinerReports.filterDateFrom') || 'Tanggal Awal'}
              </label>
              <input 
                type="date" 
                className="kd-form-input" 
                style={{ height: 38, border: '1px solid #CBD5E1', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
              />
            </div>
            <div className="kd-form-group" style={{ marginBottom: 0 }}>
              <label className="kd-form-label" style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                {t('kulinerReports.filterDateTo') || 'Tanggal Akhir'}
              </label>
              <input 
                type="date" 
                className="kd-form-input" 
                style={{ height: 38, border: '1px solid #CBD5E1', borderRadius: 8, padding: '0 10px', fontSize: 13 }}
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
              />
            </div>
            <div className="kd-form-group" style={{ marginBottom: 0 }}>
              <label className="kd-form-label" style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                {t('kulinerReports.filterCashier') || 'Kasir'}
              </label>
              <select 
                className="kd-form-select" 
                style={{ height: 38, border: '1px solid #CBD5E1', borderRadius: 8, padding: '0 10px', fontSize: 13, minWidth: 140 }}
                value={selectedCashier} 
                onChange={(e) => setSelectedCashier(e.target.value)}
              >
                <option value="">{t('kulinerReports.filterCashierAll') || 'Semua Kasir'}</option>
                {cashiers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button 
              className="kd-btn kd-btn-primary" 
              onClick={load} 
              disabled={loading}
              style={{ height: 38, padding: '0 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#B45309', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              {loading ? (t('kulinerReports.btnLoading') || 'Memuat...') : (t('kulinerReports.btnApplyFilter') || 'Terapkan Filter')}
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-['Inter']">Total Omzet Menu</p>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight m-0">{formatRp(totalRevenue)}</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-['Inter']">Total HPP Bahan Baku</p>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-slate-600 tracking-tight leading-tight m-0">{formatRp(totalCogs)}</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 font-['Inter']">Total Laba Margin</p>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-emerald-600 tracking-tight leading-tight m-0">{formatRp(totalMargin)}</h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 font-['Inter']">Rata-rata Margin %</p>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-amber-600 tracking-tight leading-tight m-0">{avgMarginPct}%</h3>
          </div>
        </div>

        {/* 📊 DIAGRAM SECTION: Best Seller vs Worst Seller 📊 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Chart 1: Best Seller */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all min-w-0 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-600" />
                  <span>5 Menu Terlaris (Best Seller)</span>
                </h3>
                <p className="text-xs text-slate-500 font-['Inter'] m-0 mt-0.5">Menu dengan volume porsi penjualan tertinggi</p>
              </div>
            </div>

            {top5Best.length === 0 ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
                Belum ada data penjualan
              </div>
            ) : (
              <div style={{ width: '100%', height: 220, minWidth: 0, overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5Best} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 500 }} 
                      angle={-20} 
                      textAnchor="end" 
                      axisLine={{ stroke: '#E2E8F0' }} 
                      tickLine={false} 
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10.5, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip isBest={true} />} />
                    <Bar dataKey="qty_sold" radius={[6, 6, 0, 0]}>
                      {top5Best.map((_, index) => (
                        <Cell 
                          key={`cell-best-${index}`} 
                          fill={index === 0 ? '#059669' : index === 1 ? '#10B981' : '#34D399'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Worst Seller */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all min-w-0 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                  <TrendingDown size={18} className="text-rose-600" />
                  <span>5 Menu Kurang Laku (Evaluasi)</span>
                </h3>
                <p className="text-xs text-slate-500 font-['Inter'] m-0 mt-0.5">Menu dengan penjualan terendah untuk evaluasi</p>
              </div>
            </div>

            {top5Worst.length === 0 ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
                Belum ada data penjualan
              </div>
            ) : (
              <div style={{ width: '100%', height: 220, minWidth: 0, overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5Worst} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 500 }} 
                      angle={-20} 
                      textAnchor="end" 
                      axisLine={{ stroke: '#E2E8F0' }} 
                      tickLine={false} 
                    />
                    <YAxis tick={{ fontSize: 10.5, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip isBest={false} />} />
                    <Bar dataKey="qty_sold" radius={[6, 6, 0, 0]}>
                      {top5Worst.map((_, index) => (
                        <Cell 
                          key={`cell-worst-${index}`} 
                          fill={index === 0 ? '#DC2626' : index === 1 ? '#EF4444' : '#F87171'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Printable Area Wrapper for Table */}
        <div ref={printRef} className="print-area">
          <div className="print-only">
            <KulinerPrintHeader
              user={user}
              title="Laporan Laba & Margin Menu"
              startDate={dateFrom}
              endDate={dateTo}
            />
          </div>

          {/* Rincian Tabel Laba & Margin Menu */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>Rincian Profitabilitas Menu</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748B' }}>Daftar lengkap perbandingan omzet, HPP resep, dan margin keuntungan tiap menu</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                Total {margin.length} Menu
              </span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="kd-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('kulinerReports.tableHeaderMenu') || 'Nama Menu'}
                    </th>
                    <th style={{ padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                      {t('kulinerReports.tableHeaderSold') || 'Terjual (Qty)'}
                    </th>
                    <th style={{ padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                      {t('kulinerReports.tableHeaderRevenue') || 'Total Omset'}
                    </th>
                    <th style={{ padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                      {t('kulinerReports.tableHeaderCogs') || 'Total HPP'}
                    </th>
                    <th style={{ padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                      {t('kulinerReports.tableHeaderProfit') || 'Laba Kotor'}
                    </th>
                    <th style={{ padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                      {t('kulinerReports.tableHeaderMarginPct') || 'Margin %'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {margin.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                        {t('kulinerReports.emptyData') || 'Tidak ada data penjualan pada periode ini.'}
                      </td>
                    </tr>
                  ) : paginatedMargin.map((m) => (
                    <tr key={m.product_id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#0F172A', fontWeight: 400 }}>{m.product_name}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: '#334155', fontWeight: 600, fontSize: 12 }}>{m.qty_sold} porsi</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#0F172A', fontWeight: 600, fontSize: 12 }}>{formatRp(m.revenue)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748B', fontWeight: 600, fontSize: 12 }}>{formatRp(m.cogs)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#059669', fontWeight: 600, fontSize: 12 }}>{formatRp(m.margin)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 400,
                          background: (m.margin_pct || 0) >= 50 ? '#ECFDF5' : '#FEF3C7',
                          color: (m.margin_pct || 0) >= 50 ? '#059669' : '#D97706',
                          border: `1px solid ${(m.margin_pct || 0) >= 50 ? '#A7F3D0' : '#FDE68A'}`
                        }}>
                          {m.margin_pct !== null ? `${m.margin_pct}%` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ClientPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalItems={margin.length}
            />
          </div>

          <div className="print-only" style={{ marginTop: 24 }}>
            <KulinerPrintFooter
              leftTitle="Diverifikasi Oleh:"
              leftSigner="Manajer Keuangan / Owner"
              rightTitle="Dibuat Oleh:"
              rightSigner="Staff Operasional Kasir"
            />
          </div>
        </div>
      </div>
    </KulinerAdminLayout>
  );
}
