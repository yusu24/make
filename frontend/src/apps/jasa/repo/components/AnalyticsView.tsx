import React from 'react';
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
  Users
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
import { Technician, ServiceStats } from '../types';
import { 
  REVENUE_MONTHLY_CHART_DATA, 
  CATEGORY_DISTRIBUTION_DATA, 
  formatRupiah 
} from '../data/mockData';

interface AnalyticsViewProps {
  stats: ServiceStats;
  technicians: Technician[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, technicians }) => {
  // Sort technicians by completed jobs
  const sortedTechs = [...technicians].sort((a, b) => b.completedJobs - a.completedJobs);

  return (
    <div className="space-y-4">
      {/* Controls Bar (Page title is already in Navtop) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium">
            Periode Analisis: <span className="font-semibold text-slate-900">Kuartal Berjalan (Tahun Buku 2026)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs shrink-0">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs">
              Siklus 2026 Q1 - Q3
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
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
    </div>
  );
};
