import { useState } from 'react'
import {
  ShoppingBag, Fish, Sprout, UtensilsCrossed, CheckCircle2,
  TrendingUp, BarChart3, ShieldCheck, ArrowRight, Building2,
} from 'lucide-react'

// Marketing copy per business-category slug — the DB only stores name/icon/color/
// description, so the richer headline/features/stats live here, keyed to match
// the real `business_categories.slug` values. Falls back to a generic version
// for any category an admin adds later that isn't one of the four below.
const SECTOR_COPY = {
  'toko-retail': {
    Icon: ShoppingBag,
    color: 'bg-blue-600',
    badge: 'Solusi Kasir & Stok',
    headline: 'Kasir POS Cepat, Stok Terintegrasi, Bebas Selisih Barang',
    features: [
      'Kasir POS Kas & Digital (QRIS, Tunai, Transfer)',
      'Peringatan Stok Tipis (Reorder Point otomatis)',
      'Dukungan Barcode Scanner & Cetak Struk Thermal',
      'Laporan Laba/Rugi Kategori Barang Harian',
    ],
    stats: [
      { value: '3x', label: 'Proses Transaksi Lebih Cepat' },
      { value: '99.8%', label: 'Akurasi Stok Barang' },
    ],
  },
  'budidaya-hewan': {
    Icon: Fish,
    color: 'bg-teal-500',
    badge: 'Solusi Peternakan & Tambak',
    headline: 'Monitoring Kolam, Kandang & Perhitungan Pakan (FCR) Presisi',
    features: [
      'Pencatatan Pakan Harian & Kalkulasi Otomatis FCR',
      'Monitoring Kualitas Air (pH, Suhu, Salinitas)',
      'Pencatatan Obat, Vaksin & Tingkat Mortalitas',
      'Estimasi Bobot Biomasa & Proyeksi Tanggal Panen',
    ],
    stats: [
      { value: '25%', label: 'Penghematan Biaya Pakan' },
      { value: '2.5x', label: 'Proyeksi Hasil Panen Lebih Terukur' },
    ],
  },
  'budidaya-tanaman': {
    Icon: Sprout,
    color: 'bg-emerald-600',
    badge: 'Solusi Perkebunan & Sawah',
    headline: 'Jadwal Pemupukan, Irigasi, dan Manajemen Lahan Terpadu',
    features: [
      'Pemetaan Blok Lahan & Greenhouse Interaktif',
      'Jadwal Pemupukan NPK/Organik & Aplikasi Pestisida',
      'Catatan Curah Hujan & Kelembaban Lahan',
      'Manajemen Tenaga Kerja Harian Lepas (Pemanen)',
    ],
    stats: [
      { value: '40%', label: 'Efisiensi Efektifitas Pupuk' },
      { value: '100%', label: 'Transparansi Hasil Timbang Lahan' },
    ],
  },
  kuliner: {
    Icon: UtensilsCrossed,
    color: 'bg-rose-500',
    badge: 'Solusi Restoran & Cafe',
    headline: 'Menu QR Digital, Manajemen Meja & Kitchen Display (KDS)',
    features: [
      'Menu Digital Scan QR di Meja Pelanggan',
      'Kitchen Display System (KDS) untuk Tim Dapur',
      'Resep & Otomatisasi Pemotongan Bahan Baku (BOM)',
      'Fitur Split Bill & Manajemen Meja Restoran',
    ],
    stats: [
      { value: '50%', label: 'Memotong Waktu Tunggu Pesanan' },
      { value: '0%', label: 'Risiko Kesalahan Dapur' },
    ],
  },
}

const FALLBACK_COPY = {
  Icon: Building2,
  color: 'bg-slate-600',
  badge: 'Solusi Bisnis',
  headline: 'Kelola Operasional Bisnis Anda dalam Satu Sistem Terpadu',
  features: ['Pencatatan Transaksi Digital', 'Laporan Otomatis Real-time', 'Akses Multi-Perangkat', 'Data Tersimpan Aman di Cloud'],
  stats: [{ value: '100%', label: 'Digital & Real-time' }, { value: '24/7', label: 'Akses Kapan Saja' }],
}

export default function SectorsSection({ categories, onOpenSandbox }) {
  const [explicitSlug, setExplicitSlug] = useState(null)

  if (categories.length === 0) return null

  const activeSlug = explicitSlug && categories.some(c => c.slug === explicitSlug)
    ? explicitSlug
    : categories[0].slug

  const currentCategory = categories.find(c => c.slug === activeSlug) || categories[0]
  const copy = SECTOR_COPY[currentCategory.slug] || FALLBACK_COPY

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

        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 no-scrollbar mb-10">
          {categories.map((cat) => {
            const catCopy = SECTOR_COPY[cat.slug] || FALLBACK_COPY
            const Icon = catCopy.Icon
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
                <div className={`w-7 h-7 rounded-lg ${catCopy.color} flex items-center justify-center text-white text-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {copy.badge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {copy.headline}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {currentCategory.description}
              </p>

              <div className="space-y-3 pt-2">
                {copy.features.map((feat) => (
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
                {copy.stats.map((st) => (
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
