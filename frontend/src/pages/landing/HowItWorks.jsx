import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, CheckCircle2 } from '@/constants/icons'

// Used only if settings.how_it_works_steps hasn't loaded / is empty (e.g. API error).
const DEFAULT_STEPS = [
  { icon: '📝', title: 'Registrasi Akun Dalam 1 Menit', description: 'Daftar dengan nomor WhatsApp atau Email aktif. Tanpa perlu kartu kredit atau komitmen biaya awal.' },
  { icon: '⚙️', title: 'Pilih Sektor Bisnis Anda', description: 'Pilih apakah bisnis Anda berada di sektor Retail, Kuliner, Budidaya Perikanan/Ternak, Pertanian, atau Jasa.' },
  { icon: '🚀', title: 'Langsung Siap Operasional', description: 'Sistem Bizora otomatis menyesuaikan tampilan modul. Mulai catat transaksi & pantau omzet dari HP!' },
]

export default function HowItWorks({ steps }) {
  const items = steps?.length ? steps : DEFAULT_STEPS

  return (
    <section id="cara-kerja" className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            Kemudahan Akses
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Hanya {items.length} Langkah Mudah Memulai Bizora
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Tidak memerlukan tim IT atau pelatihan rumit. Siapa saja dapat langsung mahir dalam kurun waktu kurang dari 5 menit.
          </p>
        </div>

        {/* Step Cards with Connector Line */}
        <div className="relative">
          {/* Glowing connector line on desktop */}
          <div
            className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 -translate-y-6 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)', opacity: 0.35 }}
          />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {items.map((st, i) => (
              <div
                key={st.title || i}
                className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 relative group hover:border-emerald-400 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl card-hover-lift"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold text-2xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    {st.icon}
                  </div>
                  <span className="text-3xl font-black font-mono text-emerald-600/25 group-hover:text-emerald-600 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-emerald-700 transition-colors">
                  {st.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {st.description}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proses instan tanpa hambatan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/register"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all inline-flex items-center gap-2 group bizora-btn-glow"
          >
            <span>Mulai Registrasi Gratis Sekarang</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  )
}
