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
  Printer
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
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
import { Technician, ServiceStats } from '../types';
import { 
  REVENUE_MONTHLY_CHART_DATA, 
  CATEGORY_DISTRIBUTION_DATA, 
  formatRupiah 
} from '../data/mockData';
import '../jasa-print.css';
import {
  JasaPrintHeader,
  JasaPrintSectionHeader,
  JasaPrintAppendixHeader,
  JasaPrintExplanationBox,
  JasaPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/JasaPrintLayout';

interface AnalyticsViewProps {
  stats: ServiceStats;
  technicians: Technician[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, technicians }) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Keuangan-Kinerja-Jasa-${new Date().toISOString().split('T')[0]}`,
    pageStyle: "@page { size: A4; margin: 1cm !important; }",
  });

  // Sort technicians by completed jobs
  const sortedTechs = [...technicians].sort((a, b) => b.completedJobs - a.completedJobs);

  const totalRevenueAll = REVENUE_MONTHLY_CHART_DATA.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalLaborAll = REVENUE_MONTHLY_CHART_DATA.reduce((acc, curr) => acc + curr.laborCost, 0);
  const grossServiceProfit = totalRevenueAll - totalLaborAll;

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Business Intelligence</span>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center space-x-2 mt-0.5">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Analitik Operasional Jasa & Kepatuhan SLA</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluasi kinerja keuangan divisi servis, efisiensi waktu respon, utilisasi dan produktivitas teknisi
            </p>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs">
              Siklus 2026 Q1 - Q3
            </span>
            <button
              onClick={() => handlePrint()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monthly Revenue vs Target */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Financial Overview</span>
              <h3 className="text-base font-semibold text-slate-900 flex items-center mt-0.5">
                <TrendingUp className="w-4 h-4 mr-1.5 text-blue-600" /> Tren Omset Jasa vs Biaya Tenaga Kerja
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Total pendapatan kotor layanan dan porsi biaya operasional teknisi</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Target: 109.4%
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
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
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                />
                <Area type="monotone" dataKey="revenue" name="Total Pendapatan Jasa" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenueBento)" />
                <Area type="monotone" dataKey="laborCost" name="Biaya Tenaga Kerja" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorLaborBento)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Margin Laba Jasa</span>
              <span className="text-emerald-700 font-semibold text-base mt-0.5 block">59.8%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Rata-rata Nilai SPK</span>
              <span className="text-blue-700 font-semibold text-base mt-0.5 block">Rp 3.850.000</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Respon Time Tiket</span>
              <span className="text-amber-700 font-semibold text-base mt-0.5 block">42 Menit</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Market Share</span>
            <h3 className="text-base font-semibold text-slate-900 flex items-center mb-0.5 mt-0.5">
              <PieIcon className="w-4 h-4 mr-1.5 text-indigo-600" /> Komposisi Kategori
            </h3>
            <p className="text-xs text-slate-500 mb-4">Persentase order pengerjaan berdasarkan kategori</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '14px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(val) => [`${val}%`, 'Porsi']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
            {CATEGORY_DISTRIBUTION_DATA.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Technician Performance Leaderboard & SLA Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SLA & Quality Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quality Control</span>
            <h3 className="text-base font-semibold text-slate-900 flex items-center mt-0.5">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> Indikator SLA & Kualitas
            </h3>
          </div>

          <div className="space-y-3.5">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600">Kepatuhan SLA (Target 95%)</span>
                <span className="font-semibold text-emerald-700">{stats.slaComplianceRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${stats.slaComplianceRate}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600">First-Time Fix Rate</span>
                <span className="font-semibold text-blue-700">92.3%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92.3%' }} />
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600">Utilisasi Jam Kerja Teknisi</span>
                <span className="font-semibold text-indigo-700">{stats.technicianUtilizationRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${stats.technicianUtilizationRate}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
              💡 <strong>Rekomendasi Operasional:</strong> Kebutuhan teknisi bersertifikasi HVAC dan Kalibrasi meningkat 25% bulan ini seiring kenaikan kontrak fasilitas gedung.
            </div>
          </div>
        </div>

        {/* Technician Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Hall of Fame</span>
              <h3 className="text-base font-semibold text-slate-900 flex items-center mt-0.5">
                <Award className="w-4 h-4 mr-1.5 text-amber-500" /> Peringkat Performa Teknisi
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">{technicians.length} Personel Aktif</span>
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
      {/* PRINT-ONLY FORMAL ACCOUNTING SERVICE REPORT TEMPLATE                     */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Laporan Resmi Jasa */}
          <JasaPrintHeader
            title="Laporan Kinerja & Keuangan Jasa"
            subtitle="Rekapitulasi Omzet Layanan Servis & Biaya Tenaga Kerja Teknisi (Service Revenue Statement)"
            periodText="Siklus 2026 (Januari - September 2026)"
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 22 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Posisi Keuangan Divisi Jasa (Service Financial Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. AKUMULASI PENDAPATAN & BIAYA SERVIS
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pendapatan Kotor Jasa Layanan</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalRevenueAll)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Beban Tenaga Kerja / Upah Teknisi</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalLaborAll)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    LABA KOTOR DIVISI SERVIS (GROSS SERVICE PROFIT)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Margin: {totalRevenueAll > 0 ? ((grossServiceProfit / totalRevenueAll) * 100).toFixed(1) : 0}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(grossServiceProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <JasaPrintSectionHeader 
              title="II. Buku Register Pendapatan Jasa Bulanan (Monthly Service Register)" 
              rightText={`Total ${REVENUE_MONTHLY_CHART_DATA.length} periode pencatatan`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 140, fontWeight: 600 }}>Bulan Transaksi</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 150, fontWeight: 600, whiteSpace: 'nowrap' }}>Pendapatan Jasa (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 150, fontWeight: 600, whiteSpace: 'nowrap' }}>Beban Teknisi (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 150, fontWeight: 600, whiteSpace: 'nowrap' }}>Laba Bersih Layanan (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_MONTHLY_CHART_DATA.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{item.month} 2026</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(item.revenue)}
                    </td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      ({formatRp(item.laborCost)})
                    </td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                      {formatRp(item.revenue - item.laborCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={2} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalRevenueAll)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalLaborAll)})
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(grossServiceProfit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <JasaPrintFooter />

          {/* 4. HALAMAN 2: LAMPIRAN METODOLOGI AKUNTANSI JASA */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <JasaPrintAppendixHeader 
              title="Lampiran: Penjelasan & Metodologi Kinerja Keuangan Jasa"
              subtitle="Keterangan Metodologi Pengakuan Pendapatan Servis & Alokasi Biaya Tenaga Kerja Langsung"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <JasaPrintExplanationBox
                number="1"
                title="Pengakuan Pendapatan Jasa (Service Revenue Recognition)"
                desc="Pendapatan jasa diakui secara proporsional sesuai penyelesaian pekerjaan SPK dan telah diterbitkan berita acara serah terima oleh teknisi."
                formula="Rumus: Omzet Jasa = Tarif Biaya Jasa Dasar + Biaya Jam Kerja Tambahan"
                variant="default"
              />

              <JasaPrintExplanationBox
                number="2"
                title="Biaya Tenaga Kerja Langsung (Direct Labor Cost)"
                desc="Alokasi upah teknisi per jam kerja dan insentif pengerjaan lapangan yang dibebankan langsung ke setiap proyek servis."
                formula="Rumus: Biaya Teknisi = Total Jam Kerja × Standar Tarif Upah per Jam"
                variant="emerald"
              />

              <JasaPrintExplanationBox
                number="3"
                title="Margin Laba Jasa (Gross Service Margin)"
                desc="Tingkat profitabilitas murni layanan setelah menutup seluruh kompensasi teknisi pelaksana sebelum dikurangi beban kantor."
                formula="Rumus: Margin = (Laba Kotor Jasa ÷ Total Pendapatan Jasa) × 100%"
                variant="indigo"
              />

              <JasaPrintExplanationBox
                number="4"
                title="Tingkat Kepatuhan SLA (Service Level Agreement Rate)"
                desc="Persentase pengerjaan SPK yang berhasil diselesaikan tepat waktu sesuai estimasi target durasi layanan."
                variant="rose"
              />

              <JasaPrintExplanationBox
                number="5"
                title="Indeks Kepuasan Klien (Customer Satisfaction / CSAT)"
                desc="Rata-rata penilaian kepuasan pelanggan atas kecepatan respon, keramahan teknisi, dan kualitas hasil perbaikan alat."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
