import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'

// Used only if settings.faq_items hasn't loaded / is empty (e.g. API error).
const DEFAULT_FAQS = [
  { q: 'Apakah saya bisa akses Bizora dari beberapa perangkat sekaligus?', a: 'Bisa! Karena berbasis cloud, Anda tinggal login dari HP, tablet, atau laptop kapan saja dan datanya selalu tersinkron real-time antar perangkat — tidak perlu install aplikasi khusus, cukup buka browser. Saat ini Bizora membutuhkan koneksi internet aktif untuk mencatat transaksi.' },
  { q: 'Apakah saya wajib membeli mesin kasir atau printer mahal?', a: 'Tidak perlu! Bizora dapat dijalankan di HP Android, iPhone, Tablet, maupun Laptop yang sudah Anda miliki. Anda cukup menyambungkan ke printer thermal Bluetooth murah (mulai dari Rp 100 ribuan) jika ingin mencetak struk fisik.' },
  { q: 'Bagaimana jika perangkat HP saya rusak atau hilang?', a: 'Seluruh data transaksi dan stok Anda tersimpan aman secara terenkripsi di Cloud server Bizora. Jika HP Anda rusak, Anda tinggal login dengan akun Anda di HP baru, dan seluruh data akan langsung muncul kembali tanpa hilang.' },
  { q: 'Apakah saya bisa mengimpor data barang dari file Excel lama saya?', a: 'Sangat bisa! Bizora menyediakan template impor Excel sederhana. Anda bisa langsung mengunggah ribuan nama produk, harga, dan jumlah stok hanya dalam hitungan detik.' },
  { q: 'Apakah saya bisa mengelola lebih dari 1 jenis bisnis (misal: Toko Retail sekaligus Kolam Ikan)?', a: 'Bisa! Dengan 1 akun Bizora, Anda dapat berpindah antar sektor usaha dengan sangat mudah melalui menu ganti profil bisnis di dashboard.' },
]

export default function FaqSection({ faqs }) {
  const items = faqs?.length ? faqs : DEFAULT_FAQS
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Pertanyaan Umum</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div key={faq.q || i} className="bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden transition-all shadow-sm">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
