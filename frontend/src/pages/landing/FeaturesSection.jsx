import { Sparkles, Check, Zap } from '@/constants/icons'

// Used only if settings.features_platform hasn't loaded / is empty (e.g. API error).
const DEFAULT_FEATURES = [
  { icon: '💳', title: 'Kasir POS Fleksibel', tag: 'Kasir Modern', description: 'Mendukung pembayaran Tunai, QRIS, Kartu Debit/Kredit, dan Transfer Bank langsung dari kasir. Piutang pelanggan tercatat rapi lengkap dengan tanggal jatuh tempo.' },
  { icon: '📦', title: 'Stok Auto-Sync & Peringatan Otomatis', tag: 'Inventaris Presisi', description: 'Stok berkurang otomatis saat ada penjualan dan kembali otomatis saat transaksi dibatalkan. Dapat notifikasi begitu stok barang mendekati batas minimum.' },
  { icon: '📊', title: 'Laporan Otomatis Laba/Rugi', tag: 'Keuangan Real-time', description: 'Lihat Laporan Laba Rugi bersih, Omzet Harian, Produk Terlaris, dan Margin keuntungan tanpa ribet rumus Excel.' },
  { icon: '👥', title: 'CRM & Program Loyalitas Pelanggan', tag: 'Retensi Pelanggan', description: 'Kelola basis data pelanggan setia lengkap dengan sistem poin belanja dan tier member (Regular/Silver/Gold) yang terhitung otomatis di setiap transaksi.' },
  { icon: '🛡️', title: 'Hak Akses Granular per Staf', tag: 'Kontrol Tim', description: 'Atur hak akses spesifik untuk setiap staf — Kasir, Gudang, Supervisor, dan peran lainnya — per modul yang boleh diakses, langsung dari dashboard Owner.' },
  { icon: '🔔', title: 'Notifikasi Real-time', tag: 'Selalu Terupdate', description: 'Dapat notifikasi otomatis langsung di dashboard begitu ada hal penting yang perlu ditindaklanjuti — dari stok menipis sampai transaksi masuk.' },
]

export default function FeaturesSection({ features }) {
  const items = features?.length ? features : DEFAULT_FEATURES

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-200/60">
      {/* Soft ambient background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Fitur Unggulan Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dirancang Lengkap untuk Menghemat Waktu &amp; Mencegah Kebocoran Modal
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Fokus kembangkan bisnis Anda tanpa terbebani kerumitan pencatatan manual yang rentan kesalahan hitung.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((feat, i) => (
            <div
              key={feat.title || i}
              className="bg-white hover:bg-emerald-50/20 border border-slate-200/80 hover:border-emerald-400/80 p-8 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between card-hover-lift relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs text-2xl">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50/80 group-hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition-colors">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2.5">
                  {feat.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-700 gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Siap digunakan tanpa install hardware khusus</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
