import { useState } from 'react'
import { HelpCircle, ChevronDown, Sparkles } from '@/constants/icons'

// Used only if settings.faq_items hasn't loaded / is empty (e.g. API error).
const DEFAULT_FAQS = [
  { q: 'Apakah saya bisa akses Bizora dari beberapa perangkat sekaligus?', a: 'Bisa! Karena berbasis cloud, Anda tinggal login dari HP, tablet, atau laptop kapan saja dan datanya selalu tersinkron real-time antar perangkat — tidak perlu install aplikasi khusus, cukup buka browser.' },
  { q: 'Apakah kasir POS tetap bisa digunakan saat internet mati (Offline)?', a: 'Bisa! Kasir POS Bizora dilengkapi teknologi Offline Resilience Engine. Anda tetap bisa scan barcode, melayani transaksi tunai, mencetak struk belanja, dan memotong stok lokal walau internet atau Wi-Fi terputus. Begitu koneksi online kembali, seluruh transaksi akan tersinkronisasi otomatis ke Cloud.' },
  { q: 'Apakah saya wajib membeli mesin kasir atau printer mahal?', a: 'Tidak perlu! Bizora dapat dijalankan di HP Android, iPhone, Tablet, maupun Laptop yang sudah Anda miliki. Anda cukup menyambungkan ke printer thermal Bluetooth murah (mulai dari Rp 100 ribuan) jika ingin mencetak struk fisik.' },
  { q: 'Bagaimana jika perangkat HP saya rusak atau hilang?', a: 'Seluruh data transaksi dan stok Anda tersimpan aman secara terenkripsi di Cloud server Bizora. Jika HP Anda rusak, Anda tinggal login dengan akun Anda di HP baru, dan seluruh data akan langsung muncul kembali tanpa hilang.' },
  { q: 'Apakah saya bisa mengimpor data barang dari file Excel lama saya?', a: 'Sangat bisa! Bizora menyediakan template impor Excel sederhana. Anda bisa langsung mengunggah ribuan nama produk, harga, dan jumlah stok hanya dalam hitungan detik.' },
  { q: 'Apakah saya bisa mengelola lebih dari 1 jenis bisnis (misal: Toko Retail sekaligus Kolam Ikan)?', a: 'Bisa! Dengan 1 akun Bizora, Anda dapat berpindah antar sektor usaha dengan sangat mudah melalui menu ganti profil bisnis di dashboard.' },
]

export default function FaqSection({ faqs }) {
  const items = faqs?.length ? faqs : DEFAULT_FAQS
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 shadow-xs">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Pertanyaan Umum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
            Temukan jawaban cepat atas pertanyaan seputar fitur, kompatibilitas, dan kemudahan Bizora.
          </p>
        </div>

        <div className="space-y-3.5">
          {items.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div
                key={faq.q || i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-emerald-400 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer gap-4"
                >
                  <span className={isOpen ? 'text-emerald-900' : 'text-slate-800'}>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
