import { useState } from 'react'
import {
  CheckCircle2,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from '@/constants/icons'

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

function SectorInteractiveMock({ slug }) {
  if (slug === 'toko-retail') {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-3 font-mono shadow-lg border border-slate-800 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            KASIR POS • LIVE TICKET
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300">Online</span>
        </div>
        <div className="space-y-1.5 text-slate-300 text-[11.5px]">
          <div className="flex justify-between">
            <span>1x Kopi Arabika 250g</span>
            <span className="text-white font-bold">Rp 45.000</span>
          </div>
          <div className="flex justify-between">
            <span>2x Susu Fresh Milk 1L</span>
            <span className="text-white font-bold">Rp 38.000</span>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-xs sm:text-sm text-emerald-300">
          <span>TOTAL BAYAR</span>
          <span>Rp 83.000 (QRIS)</span>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-500/30 p-2 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Stok gudang &amp; kasir terpotong otomatis</span>
        </div>
      </div>
    )
  }

  if (slug === 'budidaya-hewan' || slug === 'budidaya-tanaman') {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-3 font-mono shadow-lg border border-slate-800 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-teal-400 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            TELEMETRI MONITORING
          </span>
          <span className="px-2 py-0.5 rounded bg-teal-950 border border-teal-500/40 text-[10px] text-teal-300">Optimal</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-800/80 p-2 rounded-xl">
            <p className="text-[10px] text-slate-400">Suhu Air</p>
            <p className="text-teal-300 font-bold text-xs sm:text-sm">28.4°C</p>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl">
            <p className="text-[10px] text-slate-400">Derajat pH</p>
            <p className="text-teal-300 font-bold text-xs sm:text-sm">7.3 Normal</p>
          </div>
        </div>
        <div className="flex justify-between text-slate-300 text-[11px] px-1">
          <span>Survival Rate: <strong className="text-white">94.8%</strong></span>
          <span>FCR: <strong className="text-white">1.15</strong></span>
        </div>
        <div className="bg-teal-950/60 border border-teal-500/30 p-2 rounded-xl text-[11px] text-teal-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Monitoring siklus berjalan hari ke-45</span>
        </div>
      </div>
    )
  }

  if (slug === 'kuliner') {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-3 font-mono shadow-lg border border-slate-800 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-rose-400 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            KITCHEN ORDER #MEJA-04
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-[10px] text-rose-300">Dimasak</span>
        </div>
        <div className="space-y-1 text-slate-300 text-[11.5px]">
          <p className="text-white font-bold">1x Nasi Goreng Spesial Seafood (Pedas)</p>
          <p className="text-slate-400 text-[10.5px]">Catatan: Tanpa timun, extra telur dadar</p>
          <p className="text-white font-bold mt-1">1x Es Jeruk Murni</p>
        </div>
        <div className="bg-rose-950/60 border border-rose-500/30 p-2 rounded-xl text-[11px] text-rose-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Pesanan langsung masuk layar dapur</span>
        </div>
      </div>
    )
  }

  if (slug === 'seller') {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-3 font-mono shadow-lg border border-slate-800 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-sky-400 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            OMNICHANNEL SYNC HUB
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-[10px] text-sky-300">Aktif</span>
        </div>
        <div className="space-y-1.5 text-slate-300 text-[11.5px]">
          <div className="flex justify-between">
            <span>Shopee Indonesia:</span>
            <span className="text-sky-300 font-bold">24 Order Masuk</span>
          </div>
          <div className="flex justify-between">
            <span>Tokopedia:</span>
            <span className="text-sky-300 font-bold">18 Order Masuk</span>
          </div>
        </div>
        <div className="bg-sky-950/60 border border-sky-500/30 p-2 rounded-xl text-[11px] text-sky-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Stok multi-marketplace sinkron 100%</span>
        </div>
      </div>
    )
  }

  // Default / Jasa
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-3 font-mono shadow-lg border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-purple-400 font-bold">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          SPK SERVIS #SPK-089
        </span>
        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-[10px] text-purple-300">Dikerjakan</span>
      </div>
      <div className="space-y-1 text-slate-300 text-[11.5px]">
        <p className="text-white font-bold">Pekerjaan: Servis Rutin &amp; Perbaikan</p>
        <p className="text-slate-400 text-[10.5px]">Teknisi: Agus Supriyadi (On Duty)</p>
      </div>
      <div className="bg-purple-950/60 border border-purple-500/30 p-2 rounded-xl text-[11px] text-purple-300 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Status &amp; biaya tercatat rapi di sistem</span>
      </div>
    </div>
  )
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
              <BarChart2 className="w-4 h-4 text-emerald-600" />
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
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>Spesialisasi Sektor Bisnis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Satu Aplikasi, Dirancang Sesuai Karakteristik Bisnis Anda
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Bukan template seragam biasa. Setiap industri memiliki modul kustomisasi yang dirancang mengikuti alur kerja riil operasional Anda.
          </p>
        </div>

        {/* Sector Tabs Bar */}
        <div className="overflow-x-auto no-scrollbar pt-2 pb-4 mb-10">
          <div className="flex items-center gap-3 w-fit mx-auto">
            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => setExplicitSlug(cat.slug)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25 scale-[1.03]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm shrink-0 shadow-xs"
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

        {/* Active Sector Showcase Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            {/* Left: Headline & Feature List */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200 shadow-xs">
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

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => onOpenSandbox(currentCategory.slug)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer group hover:scale-[1.02]"
                >
                  <span>Coba Sandbox {currentCategory.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Mockup & Impact Stats */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Live Preview Modul
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </h4>

              {/* Dynamic Mockup Screen per Sector */}
              <SectorInteractiveMock slug={currentCategory.slug} />

              <div className="pt-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Dampak Terukur Pada Usaha
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((st) => (
                    <div key={st.label} className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl text-center">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{st.value}</p>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">{st.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                <p>Data tersimpan otomatis di Cloud dengan enkripsi standar enterprise.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
