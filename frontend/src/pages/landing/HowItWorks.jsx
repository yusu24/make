import { Link } from 'react-router-dom'
import { UserPlus, SlidersHorizontal, Rocket, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Registrasi Akun Dalam 1 Menit',
    description: 'Daftar dengan nomor WhatsApp atau Email aktif. Tanpa perlu kartu kredit atau komitmen biaya awal.',
  },
  {
    num: '02',
    icon: SlidersHorizontal,
    title: 'Pilih Sektor Bisnis Anda',
    description: 'Pilih apakah bisnis Anda berada di sektor Retail, Kuliner, Budidaya Perikanan/Ternak, atau Pertanian.',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Langsung Siap Operasional',
    description: 'Sistem Bizora otomatis menyesuaikan tampilan modul. Mulai catat transaksi & pantau omzet dari HP!',
  },
]

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Kemudahan Akses
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Hanya 3 Langkah Mudah Memulai Bizora
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Tidak memerlukan tim IT atau pelatihan rumit. Siapa saja dapat langsung mahir dalam kurun waktu kurang dari 5 menit.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((st) => {
            const Icon = st.icon
            return (
              <div key={st.num} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 relative group hover:border-emerald-300 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-black font-mono text-emerald-600/30 group-hover:text-emerald-600 transition-colors">
                    {st.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{st.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{st.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/register"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
          >
            <span>Mulai Registrasi Gratis Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
