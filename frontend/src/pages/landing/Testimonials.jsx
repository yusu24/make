import { useRef } from 'react'
import { MessageSquare, Quote, CheckCircle2, Star, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Testimonials({
  testimonials, testimonialsLoading,
  submitForm, setSubmitForm, submitting, submitSuccess, onSubmit,
}) {
  const trackRef = useRef(null)

  const scrollByCard = (dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('[data-testi-card]')
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section id="testimoni" className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-10 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Kisah Sukses UMKM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dipercaya Ribuan Pemilik Usaha di Seluruh Indonesia
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Dengar langsung testimoni dari para pelaku usaha retail, kuliner, serta pembudidaya yang telah bertransformasi digital bersama Bizora.
          </p>

          {!testimonialsLoading && testimonials.length > 2 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Sebelumnya"
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Berikutnya"
                className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {testimonialsLoading ? (
          <div className="text-center py-10 text-slate-500 text-sm">Memuat ulasan...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">Belum ada ulasan aktif yang dipublikasikan.</div>
        ) : (
          <div ref={trackRef} className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar scroll-smooth">
            {testimonials.map((testi) => (
              <div
                key={testi.id}
                data-testi-card
                className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] bg-slate-50 border border-slate-200/80 rounded-2xl p-7 relative hover:border-emerald-300 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {Array.from({ length: testi.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-emerald-200" />
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed italic mb-6">"{testi.text}"</p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: testi.avatar_bg || '#e2e8f0', color: testi.avatar_color || '#475569' }}
                  >
                    {testi.avatar_text || '??'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{testi.name}</h4>
                    <p className="text-xs text-emerald-700 font-medium">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 mt-16 relative">

          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 flex items-center justify-center gap-2">
              <span>✍️</span> <span>Bagikan Cerita Sukses Anda</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-lg mx-auto">
              Punya pengalaman menyenangkan menggunakan BIZORA? Bagikan cerita Anda sekarang! Ulasan Anda akan ditinjau oleh Admin sebelum ditayangkan.
            </p>
          </div>

          {submitSuccess ? (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Terima Kasih Banyak!</p>
                <p className="text-xs text-emerald-700 mt-0.5">Ulasan dan rating bintang Anda telah berhasil dikirim ke Admin untuk ditinjau terlebih dahulu.</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                  NAMA LENGKAP
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Apoteker"
                  value={submitForm.name}
                  onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                  JENIS USAHA &amp; KOTA
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemilik Apotek, Jakarta"
                  value={submitForm.role}
                  onChange={(e) => setSubmitForm({ ...submitForm, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                RATING BINTANG
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSubmitForm({ ...submitForm, stars: star })}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    title={`${star} Bintang`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        submitForm.stars >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-600 font-mono">{submitForm.stars} / 5</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                KUTIPAN PENGALAMAN / REVIEW
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tulis ulasan jujur atau cerita sukses Anda menggunakan platform kami..."
                value={submitForm.text}
                onChange={(e) => setSubmitForm({ ...submitForm, text: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#107b5a] hover:bg-[#0c6348] disabled:opacity-60 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span>Mengirim Ulasan...</span>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Kirim Cerita Sukses Anda</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </section>
  )
}
