export default function BudidayaSubtypeModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null

  const options = [
    { subtype: 'sapi', emoji: '🐄', label: 'Sapi (Ruminansia)' },
    { subtype: 'ayam', emoji: '🐔', label: 'Ayam (Unggas)' },
    { subtype: 'ikan', emoji: '🐟', label: 'Ikan (Tambak/Kolam)' },
  ]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[#06241e] border border-[#145445] rounded-2xl shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-2">Pilih Jenis Ternak</h3>
        <p className="text-sm text-slate-400 mb-6">
          Silakan pilih tipe simulasi hewan ternak yang ingin Anda coba:
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {options.map((opt) => (
            <button
              key={opt.subtype}
              onClick={() => onSelect(opt.subtype)}
              className="w-full bg-[#0a3028] hover:bg-[#0e3f35] border border-[#155446] hover:border-emerald-500/50 rounded-xl p-3.5 flex items-center gap-3.5 text-left transition-all cursor-pointer"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-sm font-bold text-white">{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#082620] hover:bg-[#0c382f] border border-[#1a5749] text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
