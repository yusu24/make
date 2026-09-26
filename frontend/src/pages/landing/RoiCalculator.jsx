import { useState, useMemo } from 'react'
import { Calculator, TrendingUp, Clock, Sparkles, CheckCircle2, Zap } from '@/constants/icons'

const DEFAULT_TITLE = 'Berapa Banyak Waktu & Biaya yang Bisa Anda Hemat Setiap Bulan?'
const DEFAULT_DESC = 'Pencatatan kertas, pembukuan manual yang salah hitung, serta selisih stok yang misterius menguras jam kerja bernilai jutaan rupiah setiap bulannya.'

export default function RoiCalculator({ title, desc }) {
  const [sector, setSector] = useState('retail')
  const [dailyTransactions, setDailyTransactions] = useState(45)
  const [stafCount, setStafCount] = useState(2)

  const hoursSavedPerMonth = useMemo(() => {
    return Math.round((dailyTransactions * 0.12 + stafCount * 4) * 4)
  }, [dailyTransactions, stafCount])

  const moneySavedPerMonth = useMemo(() => {
    return (hoursSavedPerMonth * 25000) + (dailyTransactions * 30 * 1500)
  }, [hoursSavedPerMonth, dailyTransactions])

  // Efficiency percentage calculation (capped between 60% and 94%)
  const efficiencyPercent = useMemo(() => {
    const raw = Math.min(94, Math.max(62, Math.round(55 + (dailyTransactions / 300) * 25 + (stafCount / 15) * 14)))
    return raw
  }, [dailyTransactions, stafCount])

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200/80 relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid lg:grid-cols-12 gap-10 items-center">

          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Simulasi Penghematan ROI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {title || DEFAULT_TITLE}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {desc || DEFAULT_DESC}
            </p>

            <div className="space-y-5 pt-2">
              {/* Sector selector buttons */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                  1. Pilih Jenis Usaha Anda
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'retail', label: 'Retail & Toko', icon: '🛒' },
                    { id: 'kuliner', label: 'Kuliner & Resto', icon: '🍜' },
                    { id: 'budidaya', label: 'Budidaya & Farm', icon: '🐟' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSector(opt.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border ${
                        sector === opt.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Daily Transactions */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Rata-Rata Transaksi / Unit Per Hari</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {dailyTransactions} {sector === 'budidaya' ? 'Kolam / Lahan' : 'Transaksi'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={dailyTransactions}
                  onChange={(e) => setDailyTransactions(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>10 / hari</span>
                  <span>150 / hari</span>
                  <span>300+ / hari</span>
                </div>
              </div>

              {/* Slider 2: Staff Count */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Jumlah Staf / Karyawan Operasional</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {stafCount} Orang
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={stafCount}
                  onChange={(e) => setStafCount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 Orang</span>
                  <span>7 Orang</span>
                  <span>15+ Orang</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Savings Result Box */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 card-hover-lift">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Estimasi Penghematan Otomatis Bizora
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Calculation
              </span>
            </div>

            {/* Savings Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-50/80 to-sky-50/40 p-5 rounded-2xl border border-cyan-200/80 text-center transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-600 font-medium">Jam Kerja Dihemat</p>
                <p className="text-3xl sm:text-4xl font-black text-cyan-800 font-mono mt-1 transition-all">
                  {hoursSavedPerMonth} <span className="text-sm font-bold font-sans">Jam</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Setiap Bulan</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-5 rounded-2xl border border-emerald-200/80 text-center transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-600 font-medium">Potensi Hemat Biaya</p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono mt-1 transition-all">
                  Rp {(moneySavedPerMonth / 1000000).toFixed(1)} <span className="text-sm font-bold font-sans">Jt</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Estimasi Per Bulan</p>
              </div>
            </div>

            {/* Dynamic Efficiency Progress Meter */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Tingkat Peningkatan Efisiensi:
                </span>
                <span className="text-emerald-700 font-mono font-extrabold text-sm">{efficiencyPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${efficiencyPercent}%` }}
                />
              </div>
            </div>

            {/* Summary Explanation */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 mb-0.5">Kesimpulan Efisiensi:</p>
                Dengan mengalihkan rekap transaksi kasir, stok, dan laporan Laba Rugi ke Bizora, Anda menghemat sekitar <strong>{hoursSavedPerMonth} jam</strong> per bulan yang dapat dialokasikan untuk mempercepat ekspansi bisnis!
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
