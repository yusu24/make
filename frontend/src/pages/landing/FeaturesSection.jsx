import { Sparkles, Check } from 'lucide-react'

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
          {items.map((feat, i) => (
            <div
              key={feat.title || i}
              className="bg-white hover:bg-emerald-50/30 border border-slate-200/80 hover:border-emerald-300 p-7 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm text-2xl">
                    {feat.icon}
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
          ))}
        </div>

      </div>
    </section>
  )
}
