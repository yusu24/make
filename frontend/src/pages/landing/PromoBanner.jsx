import { Gift, ArrowUpRight } from 'lucide-react'

export default function PromoBanner({ active, loading, text, onClick }) {
  if (loading || !active) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#062c23] border-t border-[#124d3f] shadow-2xl py-3 px-4 sm:px-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-center sm:justify-between gap-3 text-left">

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Gift className="w-4 h-4 animate-bounce" />
          </div>
          <span className="font-semibold text-white truncate">{text}</span>
        </div>

        <button
          onClick={onClick}
          className="bg-[#10b981] hover:bg-[#059669] text-[#03110e] text-xs font-bold px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-emerald-500/20 group"
        >
          <span>Mulai Test Kategori</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

      </div>
    </div>
  )
}
