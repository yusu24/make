import { Link } from 'react-router-dom'
import {
  ArrowRight, Sparkles, Monitor, ShoppingBag, Fish, Sprout,
  UtensilsCrossed, ShieldCheck, Zap, Clock, Gift, ChevronRight, Eye, Building2,
  Globe, Wrench
} from 'lucide-react'

// Visual config per slug — icon + accent color for the sandbox demo buttons.
// Falls back to a generic icon/color for any category admin adds later.
const SLUG_VISUALS = {
  'toko-retail':      { Icon: ShoppingBag,      color: 'bg-blue-600',    sub: 'Sistem POS Kasir & Stok Barang' },
  'budidaya-hewan':    { Icon: Fish,              color: 'bg-teal-500',    sub: 'Monitoring Ternak, Kolam & Pakan' },
  'budidaya-tanaman': { Icon: Sprout,            color: 'bg-emerald-600', sub: 'Monitoring Siklus, Lahan & Pupuk' },
  'kuliner':          { Icon: UtensilsCrossed,  color: 'bg-rose-500',    sub: 'Menu Digital & Manajemen Restoran' },
  'seller':           { Icon: Globe,            color: 'bg-sky-600',     sub: 'Omnichannel & Marketplace Hub' },
  'jasa':             { Icon: Wrench,           color: 'bg-purple-600',  sub: 'Surat Perintah Kerja (SPK) & Teknisi' },
}
const DEFAULT_VISUAL = { Icon: Building2, color: 'bg-slate-600', sub: '' }

export default function Hero({ settings, settingsLoading, categories, categoriesLoading, demoLoading, onOpenSandbox, onScrollToFeatures }) {
  return (
    <section id="beranda" className="relative min-h-[90vh] bg-bizora-gradient pt-10 pb-20 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d3b32]/80 border border-[#185c4f] text-emerald-300 text-xs sm:text-sm font-medium shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Platform Bisnis Digital #1 Indonesia</span>
            </div>

            {settingsLoading ? (
              <div className="space-y-3 py-1" aria-hidden="true">
                <div className="h-10 sm:h-12 w-full max-w-lg rounded-lg bg-white/10 animate-pulse" />
                <div className="h-10 sm:h-12 w-2/3 max-w-sm rounded-lg bg-white/10 animate-pulse" />
              </div>
            ) : (
              <h1
                className="landing-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl font-black text-white leading-[1.18] tracking-tight"
                style={{ color: '#ffffff' }}
              >
                {settings.hero_title}
                {settings.hero_subtitle && <> <span className="text-gradient-emerald">{settings.hero_subtitle}</span></>}
              </h1>
            )}

            {settingsLoading ? (
              <div className="h-6 w-full max-w-2xl rounded bg-white/10 animate-pulse" aria-hidden="true" />
            ) : (
              <p
                className="landing-hero-desc text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed"
                style={{ color: '#cbd5e1' }}
              >
                {settings.hero_desc}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="bg-[#10b981] hover:bg-[#059669] text-[#03110e] text-base font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 flex items-center gap-2 group"
              >
                <span>Daftar Gratis Sekarang</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={onScrollToFeatures}
                className="bg-[#082620] hover:bg-[#0c382f] text-slate-200 border border-[#1a5749] text-base font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-5 h-5 text-emerald-400" />
                <span>Lihat Fitur</span>
              </button>
            </div>

            <div className="pt-6 border-t border-[#0e3b31] flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{categories.length || 4} Sektor Bisnis</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Setup &lt; 5 Menit</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Gratis Selamanya</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {settings.show_sandbox ? (
              <div className="bg-[#06241e]/90 border border-[#134a3d] rounded-2xl p-6 sm:p-7 shadow-2xl bizora-card-glow backdrop-blur-md relative">
                <div className="flex items-start gap-3.5 mb-5">
                  <div className="p-3 bg-[#10b981]/15 text-[#34d399] rounded-xl border border-[#10b981]/30 shrink-0">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Sandbox Instan</h3>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">Coba Sistem Kategori Aktif</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Klik tombol uji coba di bawah untuk langsung masuk dan mengevaluasi modul aktif platform kami tanpa perlu mendaftar terlebih dahulu!
                </p>

                <div className="space-y-3">
                  {categoriesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full bg-[#0a3028] border border-[#155446] rounded-xl p-3.5 flex items-center gap-3.5 animate-pulse"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#155446] shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-32 rounded bg-[#155446]" />
                          <div className="h-2.5 w-44 rounded bg-[#134a3d]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    categories.map((cat) => {
                      const visual = SLUG_VISUALS[cat.slug] || DEFAULT_VISUAL
                      const { Icon } = visual
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => onOpenSandbox(cat.slug)}
                          disabled={demoLoading}
                          className="w-full bg-[#0a3028] hover:bg-[#0e3f35] border border-[#155446] hover:border-emerald-500/50 rounded-xl p-3.5 flex items-center justify-between group transition-all text-left cursor-pointer shadow-sm disabled:opacity-60"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-lg ${visual.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                                Demo {cat.name}
                              </h4>
                              <p className="text-xs text-slate-400">{visual.sub || cat.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      )
                    })
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#0f3d32] text-center flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sandbox aman &amp; terenkripsi</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#06241e]/90 border border-[#134a3d] rounded-2xl p-6 sm:p-7 shadow-2xl bizora-card-glow backdrop-blur-md text-center">
                <div className="text-4xl mb-3.5">⚡</div>
                <h4 className="text-lg font-bold text-white mb-2.5">Keandalan Berkelas Dunia</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Multi-tenant SaaS andal dengan tingkat SLA 99.9% untuk mendigitalisasi usaha Anda secara instan.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
