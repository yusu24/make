import { CreditCard, Package, PieChart, Users, WifiOff, GitBranch, Sparkles, Check } from 'lucide-react'

const MAIN_FEATURES = [
  {
    icon: CreditCard,
    title: 'Kasir POS Multi-Sistem',
    description: 'Mendukung pembayaran Tunai, QRIS Statis/Dinamis, E-Wallet, Kartu Kredit/Debet, hingga Pembayaran Bon / Piutang dengan jatuh tempo.',
    tag: 'Kasir Modern',
  },
  {
    icon: Package,
    title: 'Stok Auto-Sync & Opname Cepat',
    description: 'Stok berkurang otomatis saat ada penjualan. Dilengkapi sistem peringatan stok menipis dan fitur stock opname via Scan QR HP.',
    tag: 'Inventaris Presisi',
  },
  {
    icon: PieChart,
    title: 'Laporan Otomatis Laba/Rugi',
    description: 'Lihat Laporan Laba Rugi bersih, Omzet Harian, Produk Terlaris, dan Margin keuntungan tanpa ribet rumus Excel.',
    tag: 'Keuangan Real-time',
  },
  {
    icon: Users,
    title: 'CRM & Pengingat Bon WhatsApp',
    description: 'Kelola basis data pelanggan setia, sistem poin belanja, serta kirim pengingat jatuh tempo utang bon pelanggan secara otomatis.',
    tag: 'Retensi Pelanggan',
  },
  {
    icon: GitBranch,
    title: 'Multi-Cabang & Hak Akses',
    description: 'Pantau 10+ cabang toko dalam 1 layar HP Owner. Atur hak akses terbatas khusus untuk staf Kasir, Gudang, atau Supervisor.',
    tag: 'Skalabilitas Bisnis',
  },
  {
    icon: WifiOff,
    title: 'Offline Mode (Anti Rontok Sinyal)',
    description: 'Sinyal terputus di area lokasi tambak atau toko? Transaksi kasir tetap berjalan lancar dan otomatis tersinkronisasi saat ada koneksi.',
    tag: 'Handal & Stabil',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Fitur Unggulan Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dirancang Lengkap untuk Menghemat Waktu & Mencegah Kebocoran Modal
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Fokus kembangkan bisnis Anda tanpa terbebani kerumitan pencatatan manual yang rentan kesalahan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MAIN_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="bg-white hover:bg-emerald-50/30 border border-slate-200/80 hover:border-emerald-300 p-7 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-700 gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Siap digunakan tanpa install hardware khusus</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
