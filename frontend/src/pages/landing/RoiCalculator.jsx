import { useState } from 'react'
import { Calculator, TrendingUp, Clock, Sparkles } from 'lucide-react'

const DEFAULT_TITLE = 'Berapa Banyak Waktu & Biaya yang Bisa Anda Hemat Setiap Bulan?'
const DEFAULT_DESC = 'Pencatatan kertas, pembukuan manual yang salah hitung, serta selisih stok yang misterius menguras jam kerja bernilai jutaan rupiah setiap bulannya.'

export default function RoiCalculator({ title, desc }) {
  const [sector, setSector] = useState('retail')
  const [dailyTransactions, setDailyTransactions] = useState(45)
  const [stafCount, setStafCount] = useState(2)

  const hoursSavedPerMonth = Math.round((dailyTransactions * 0.12 + stafCount * 4) * 4)
  const moneySavedPerMonth = (hoursSavedPerMonth * 25000) + (dailyTransactions * 30 * 1500)

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid lg:grid-cols-12 gap-10 items-center">

          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Simulasi Penghematan ROI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title || DEFAULT_TITLE}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {desc || DEFAULT_DESC}
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-2">
                  1. Pilih Jenis Usaha Anda
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'retail', label: 'Retail & Toko' },
                    { id: 'kuliner', label: 'Kuliner & Resto' },
                    { id: 'budidaya', label: 'Budidaya / Farm' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSector(opt.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sector === opt.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Rata-Rata Transaksi / Unit Per Hari</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm">
                    {dailyTransactions} {sector === 'budidaya' ? 'Kolam / Lahan' : 'Transaksi'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={dailyTransactions}
                  onChange={(e) => setDailyTransactions(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Jumlah Staf / Karyawan</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm">{stafCount} Orang</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={stafCount}
                  onChange={(e) => setStafCount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-8 shadow-lg space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Estimasi Penghematan Otomatis Bizora
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-50/60 p-5 rounded-xl border border-cyan-100 text-center">
                <Clock className="w-6 h-6 text-cyan-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">Jam Kerja Dihemat</p>
                <p className="text-2xl sm:text-3xl font-black text-cyan-700 font-mono mt-1">{hoursSavedPerMonth} Jam</p>
                <p className="text-[10px] text-slate-500 mt-1">Setiap Bulan</p>
              </div>

              <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-100 text-center">
                <TrendingUp className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">Potensi Hemat Biaya</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-1">
                  Rp {(moneySavedPerMonth / 1000000).toFixed(1)} Jt
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Estimasi Per Bulan</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-emerald-800 mb-1">Kesimpulan Efisiensi:</p>
              Dengan mengalihkan tugas pencatatan stok dan rekap Laba Rugi ke Bizora, Anda menghemat sekitar <strong>{hoursSavedPerMonth} jam</strong> waktu yang dapat Anda alokasikan untuk ekspansi bisnis baru!
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
