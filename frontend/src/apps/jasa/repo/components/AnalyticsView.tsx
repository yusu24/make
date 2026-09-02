import React, { useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart as PieIcon,
  ShieldCheck,
  Star,
  Users,
  Printer,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Technician, ServiceStats, JasaInvoice, JasaExpense } from '../types';
import { 
  REVENUE_MONTHLY_CHART_DATA, 
  CATEGORY_DISTRIBUTION_DATA, 
  formatRupiah 
} from '../data/mockData';
import { useAuth } from '../../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import '../../jasa-print.css';
import {
  JasaPrintHeader,
  JasaPrintSectionHeader,
  JasaPrintAppendixHeader,
  JasaPrintExplanationBox,
  JasaPrintFooter,
  formatRp,
  formatDateIndo
} from '../../components/JasaPrintLayout';

interface AnalyticsViewProps {
  stats: ServiceStats;
  technicians: Technician[];
  invoices: JasaInvoice[];
  expenses: JasaExpense[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, technicians, invoices, expenses }) => {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  // Sort technicians by completed jobs
  const sortedTechs = [...technicians].sort((a, b) => b.completedJobs - a.completedJobs);

  // Actual Financial Calculations from Transactions
  const actualRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  
  // Estimate Parts vs Labor Revenue based on 35/65 split of ACTUAL revenue if we can't distinguish items
  const actualLaborRevenue = actualRevenue * 0.65;
  const actualPartsRevenue = actualRevenue * 0.35;

  const actualPartsCost = expenses
    .filter(e => e.category === 'Belanja Suku Cadang (Parts)')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
    
  const actualTechCommission = expenses
    .filter(e => e.description.toLowerCase().includes('komisi') || e.description.toLowerCase().includes('upah'))
    .reduce((sum, e) => sum + (e.amount || 0), 0) || (actualRevenue * 0.30); // fallback to 30% if no explicit commission recorded

  const actualOtherExpenses = expenses
    .filter(e => e.category !== 'Belanja Suku Cadang (Parts)' && !e.description.toLowerCase().includes('komisi') && !e.description.toLowerCase().includes('upah'))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const actualNetProfit = actualRevenue - actualPartsCost - actualTechCommission - actualOtherExpenses;
  const profitMargin = actualRevenue > 0 ? ((actualNetProfit / actualRevenue) * 100).toFixed(1) : '0.0';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Kinerja-Keuangan-Jasa-${new Date().toISOString().split('T')[0]}`,
  });

  const handleExportExcel = () => {
    const headers = ['No', 'Nama Teknisi', 'Spesialisasi', 'SPK Selesai', 'Rating CSAT', 'Status'];
    const rows = sortedTechs.map((t, idx) => [
      idx + 1,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.specialty.replace(/"/g, '""')}"`,
      t.completedJobs,
      t.rating,
      t.currentStatus
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Performa_Teknisi_Jasa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="text-xs text-slate-600 font-medium">
            Periode Analisis: <span className="font-semibold text-slate-900">Kuartal Berjalan (Tahun Buku 2026)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              title="Cetak Laporan Kinerja & Keuangan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              title="Export Kinerja ke Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs shadow-2xs">
              Siklus 2026 Q1 - Q3
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        
        {/* Left 2 Cols: Monthly Revenue vs Target */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Financial Overview</span>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center mt-0.5">
                <TrendingUp className="w-4 h-4 mr-1 text-blue-600" /> Tren Omset Jasa vs Biaya Tenaga Kerja
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total pendapatan kotor layanan dan porsi biaya operasional teknisi</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                Target: 109.4%
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_MONTHLY_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueBento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorLaborBento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(val: number) => formatRupiah(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Omset Jasa" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueBento)" />
                <Area type="monotone" dataKey="laborCost" name="Biaya Teknisi" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorLaborBento)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 mt-1 border-t border-slate-100">
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center text-blue-600"><span className="w-2.5 h-2.5 bg-blue-600 rounded mr-1.5" /> Omset Jasa</span>
              <span className="flex items-center text-emerald-600"><span className="w-2.5 h-2.5 bg-emerald-600 rounded mr-1.5" /> Biaya Teknisi</span>
            </div>
            <span className="text-slate-500 font-medium">Margin Kotor: <strong className="text-slate-900 font-semibold">59.8%</strong></span>
          </div>
        </div>

        {/* Right 1 Col: Category Distribution Donut */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Market Share</span>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center mt-0.5">
              <PieIcon className="w-4 h-4 mr-1 text-purple-600" /> Komposisi Kategori Servis
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Persentase SPK per kategori layanan</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `${val}%`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2.5 border-t border-slate-100">
            {CATEGORY_DISTRIBUTION_DATA.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-[11px] text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-[11px] text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Real-time Profit & Loss Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Real-Time P&L</span>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center mt-0.5">
              <BarChart3 className="w-4 h-4 mr-1.5 text-blue-600" /> Ringkasan Laba Rugi Berdasarkan Transaksi
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">Margin: {profitMargin}%</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Pendapatan</p>
            <p className="text-sm font-bold text-slate-900">{formatRupiah(actualRevenue)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Beban Material (HPP)</p>
            <p className="text-sm font-bold text-rose-600">-{formatRupiah(actualPartsCost)}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Komisi & Operasional</p>
            <p className="text-sm font-bold text-rose-600">-{formatRupiah(actualTechCommission + actualOtherExpenses)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
            <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider mb-1">Laba Bersih</p>
            <p className="text-sm font-bold text-emerald-700">{actualNetProfit >= 0 ? '+' : ''}{formatRupiah(actualNetProfit)}</p>
          </div>
        </div>
      </div>

      {/* Technician Performance Leaderboard & SLA Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* SLA & Quality Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quality Control</span>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center mt-0.5">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Indikator SLA & Kualitas
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600 text-[11px]">Kepatuhan SLA (Target 95%)</span>
                <span className="font-semibold text-emerald-700 text-xs">{stats.slaComplianceRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${stats.slaComplianceRate}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600 text-[11px]">First-Time Fix Rate</span>
                <span className="font-semibold text-blue-700 text-xs">92.3%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '92.3%' }} />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600 text-[11px]">Utilisasi Jam Kerja</span>
                <span className="font-semibold text-indigo-700 text-xs">{stats.technicianUtilizationRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${stats.technicianUtilizationRate}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
              💡 <strong>Rekomendasi Operasional:</strong> Kebutuhan teknisi bersertifikasi HVAC dan Kalibrasi meningkat 25% bulan ini seiring kenaikan kontrak fasilitas gedung.
            </div>
          </div>
        </div>

        {/* Technician Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Hall of Fame</span>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center mt-0.5">
                <Award className="w-4 h-4 mr-1.5 text-amber-500" /> Peringkat Performa Teknisi
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">{technicians.length} Personel Aktif</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 font-semibold uppercase text-[10px] tracking-wider">Teknisi</th>
                  <th className="py-2.5 font-semibold uppercase text-[10px] tracking-wider">Spesialisasi</th>
                  <th className="py-2.5 font-semibold uppercase text-[10px] tracking-wider text-center">SPK Tuntas</th>
                  <th className="py-2.5 font-semibold uppercase text-[10px] tracking-wider text-center">Rating CSAT</th>
                  <th className="py-2.5 font-semibold uppercase text-[10px] tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedTechs.map((tech, idx) => (
                  <tr key={tech.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 flex items-center space-x-2.5">
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-semibold text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-200 text-slate-800' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-900">{tech.name}</span>
                    </td>
                    <td className="py-3 text-slate-500 font-medium">{tech.specialty}</td>
                    <td className="py-3 text-center font-semibold text-slate-900">{tech.completedJobs} SPK</td>
                    <td className="py-3 text-center font-semibold text-amber-600">
                      ★ {tech.rating}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                        tech.currentStatus === 'Tersedia' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        tech.currentStatus === 'Bertugas' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {tech.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE JASA PERFORMANCE & FINANCIAL REPORT              */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Bengkel / Jasa */}
          <JasaPrintHeader
            user={user}
            title="Laporan Kinerja, Pendapatan & Laba Rugi Jasa"
            subtitle="Rekapitulasi Omzet Servis, Penjualan Material, Beban Operasional & Utilisasi Tim"
            periodText="Kuartal Berjalan — Tahun Buku 2026"
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Posisi Keuangan & Profitabilitas Jasa (Berdasarkan Transaksi Riil)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. PENDAPATAN OPERASIONAL JASA (REVENUE)
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pendapatan Jasa & Biaya Tenaga Kerja (Labor Revenue)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(actualLaborRevenue)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pendapatan Penjualan Material & Suku Cadang (Parts Revenue)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(actualPartsRevenue)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '6px 4px', color: '#000000' }}>TOTAL PENDAPATAN OPERASIONAL BRUTO</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>100.0%</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontSize: 11, color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(actualRevenue)}</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    B. BIAYA POKOK PENDAPATAN & OPERASIONAL (EXPENSES)
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Harga Pokok Pembelian Suku Cadang & Bahan</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>-{formatRp(actualPartsCost)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Bagi Hasil & Komisi Upah Teknisi Lapangan</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>-{formatRp(actualTechCommission)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Beban Operasional Tambahan (Transport, Alat, Dll)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>-{formatRp(actualOtherExpenses)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    LABA OPERASIONAL BERSIH (NET OPERATING PROFIT)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    {profitMargin}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {actualNetProfit >= 0 ? '+' : ''}{formatRp(actualNetProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader 
              title="II. Buku Register Produktivitas Tim Teknisi Lapangan" 
              rightText={`Total ${sortedTechs.length} teknisi aktif`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 30, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 140, fontWeight: 600 }}>Nama Teknisi</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 130, fontWeight: 600 }}>Spesialisasi Keahlian</th>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 85, fontWeight: 600 }}>SPK Tuntas</th>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 80, fontWeight: 600 }}>Rating CSAT</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 85, fontWeight: 600 }}>Status Kerja</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Estimasi Omzet (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {sortedTechs.map((tech, idx) => (
                  <tr key={tech.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 4px', fontWeight: 600, color: '#000000' }}>
                      {tech.name}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {tech.specialty}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 600, color: '#000000' }}>
                      {tech.completedJobs} SPK
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>
                      ★ {tech.rating}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {tech.currentStatus}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(tech.completedJobs * 350000)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={6} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Produktivitas:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(sortedTechs.reduce((sum, t) => sum + (t.completedJobs * 350000), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <JasaPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN METODOLOGI KPI & SLA JASA */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <JasaPrintAppendixHeader 
              title="Lampiran: Metodologi KPI, Standar SLA & Bagi Hasil Teknisi"
              subtitle={`Pedoman Target SLA, Utilisasi Teknisi & Formula Profitabilitas — ${user?.tenant_name || 'Layanan Jasa & Servis'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <JasaPrintExplanationBox
                number="1"
                title="Service Level Agreement (SLA Respon & Pengerjaan)"
                desc="Batas waktu maksimum pengerjaan SPK darurat adalah 2 jam sejak tiket dibuat, sedangkan pekerjaan berkala diselesaikan dalam waktu 1x24 jam kalender."
                formula="Tingkat Kepatuhan SLA = (SPK Tepat Waktu ÷ Total SPK Selesai) × 100%"
                variant="default"
              />

              <JasaPrintExplanationBox
                number="2"
                title="Skema Bagi Hasil & Insentif Prestasi Teknisi"
                desc="Teknisi menerima upah pokok dasar ditambah komisi performa 30% - 40% dari total nilai jasa (Labor Cost) pada setiap SPK yang berhasil diselesaikan."
                variant="emerald"
              />

              <JasaPrintExplanationBox
                number="3"
                title="Tingkat Utilisasi Jam Kerja Teknisi (Utilization Rate)"
                desc="Perbandingan antara total jam kerja aktual yang dialokasikan pada SPK di lapangan dibandingkan total jam kerja kerja reguler 40 jam per minggu."
                formula="Utilisasi = (Total Jam SPK ÷ Total Jam Kerja Tersedia) × 100%"
                variant="indigo"
              />

              <JasaPrintExplanationBox
                number="4"
                title="Indeks Kepuasan Pelanggan (Customer Satisfaction - CSAT)"
                desc="Skor evaluasi bintang (skala 1 - 5) yang diberikan pelanggan setelah pengerjaan selesai untuk mengukur kualitas layanan dan kesopanan teknisi."
                variant="rose"
              />

              <JasaPrintExplanationBox
                number="5"
                title="Manajemen Ketersediaan Suku Cadang Kritis (Fast-Moving Parts)"
                desc="Pemeliharaan level safety stock suku cadang yang sering diganti guna mencegah keterlambatan penyelesaian tiket SPK pelanggan."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
