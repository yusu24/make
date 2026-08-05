import { useState } from 'react'
import { CheckCircle2, TrendingUp, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react'

// Used only when a category hasn't had its headline/badge/features/stats
// filled in yet from the admin "Kategori Bisnis" page.
const FALLBACK_COPY = {
  icon: '🏢',
  color: '#64748b',
  badge: 'Solusi Bisnis',
  headline: 'Kelola Operasional Bisnis Anda dalam Satu Sistem Terpadu',
  features: ['Pencatatan Transaksi Digital', 'Laporan Otomatis Real-time', 'Akses Multi-Perangkat', 'Data Tersimpan Aman di Cloud'],
  stats: [{ value: '100%', label: 'Digital & Real-time' }, { value: '24/7', label: 'Akses Kapan Saja' }],
}

export default function SectorsSection({ categories, categoriesLoading, onOpenSandbox }) {
  const [explicitSlug, setExplicitSlug] = useState(null)

  if (!categoriesLoading && categories.length === 0) return null

  if (categoriesLoading) {
    return (
      <section id="fitur" className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Spesialisasi Sektor Bisnis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Satu Aplikasi, Dirancang untuk Disesuaikan dengan Bisnis Anda
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Setiap sektor bisnis memiliki modul dan alur kerja khusus yang disesuaikan dengan kebutuhan riil lapangan.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-40 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>

          <div className="h-96 bg-slate-50 border border-slate-200/80 rounded-2xl animate-pulse" />
        </div>
      </section>
    )
  }

  const activeSlug = explicitSlug && categories.some(c => c.slug === explicitSlug)
    ? explicitSlug
    : categories[0].slug

  const currentCategory = categories.find(c => c.slug === activeSlug) || categories[0]
  const badge = currentCategory.badge || FALLBACK_COPY.badge
  const headline = currentCategory.headline || FALLBACK_COPY.headline
  const features = currentCategory.features_list?.length ? currentCategory.features_list : FALLBACK_COPY.features
  const stats = currentCategory.stats?.length === 2 ? currentCategory.stats : FALLBACK_COPY.stats

  return (
    <section id="fitur" className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Spesialisasi Sektor Bisnis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Satu Aplikasi, Dirancang untuk Disesuaikan dengan Bisnis Anda
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Setiap sektor bisnis memiliki modul dan alur kerja khusus yang disesuaikan dengan kebutuhan riil lapangan.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar pt-3 pb-4 mb-10">
          <div className="flex items-center gap-3 w-fit mx-auto">
            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => setExplicitSlug(cat.slug)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 scale-105'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm shrink-0"
                    style={{ background: cat.color || FALLBACK_COPY.color }}
                  >
                    {cat.icon || FALLBACK_COPY.icon}
                  </div>
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {badge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {headline}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {currentCategory.description}
              </p>

              <div className="space-y-3 pt-2">
                {features.map((feat) => (
                  <div key={feat} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onOpenSandbox(currentCategory.slug)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Coba Sandbox {currentCategory.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Dampak Pada Bisnis
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((st) => (
                  <div key={st.label} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-center">
                    <p className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">{st.value}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">{st.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <p>Semua data tersimpan otomatis di Cloud dengan enkripsi standar industri. Tanpa risiko kehilangan catatan pembukuan.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
