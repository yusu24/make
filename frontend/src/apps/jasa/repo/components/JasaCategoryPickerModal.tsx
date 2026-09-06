import React from 'react';
import { 
  Smartphone, 
  Car, 
  Snowflake, 
  Shirt, 
  Scissors, 
  Layers, 
  Wrench, 
  Check, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useJasa } from '../contexts/JasaContext';
import { JasaCategoryType, JASA_CATEGORIES_LIST } from '../hooks/useJasaTerms';

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Car: Car,
  Snowflake: Snowflake,
  Shirt: Shirt,
  Scissors: Scissors,
  Needle: Layers,
  Wrench: Wrench,
};

export const JasaCategoryPickerModal: React.FC = () => {
  const { category, setCategory, isPickerOpen, closePicker } = useJasa();

  if (!isPickerOpen) return null;

  const hasSavedBefore = Boolean(localStorage.getItem('bizora_jasa_category'));

  const handleSelect = (catId: JasaCategoryType) => {
    setCategory(catId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header Modal */}
        <div className="relative px-5 py-5 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Dynamic Service Engine
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Pilih Bidang Usaha Jasa Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Sistem Bizora akan otomatis menyesuaikan istilah, formulir SPK, kolom input khusus, daftar nota, dan alur kerja sesuai bidang industri usaha Anda.
              </p>
            </div>

            {hasSavedBefore && (
              <button
                onClick={closePicker}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content / Grid Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {JASA_CATEGORIES_LIST.map((item) => {
              const IconComp = ICON_MAP[item.icon] || Wrench;
              const isSelected = category === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group relative flex flex-col p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                      : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:bg-slate-50/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Selected Pill */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      <Check className="w-3 h-3" />
                      Aktif
                    </div>
                  )}

                  {/* Header Card */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-600/30'
                        : `${item.bgLight} ${item.color} ${item.borderLight}`
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="pr-12">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block line-clamp-1">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3.5 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Example badges */}
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
                      Contoh Layanan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.examples.slice(0, 3).map((ex, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 truncate max-w-[200px]"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>

                    {/* Action button */}
                    <button
                      type="button"
                      className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 group-hover:bg-indigo-500 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Kategori Terpilih
                        </>
                      ) : (
                        <>
                          Pilih Bidang Ini
                          <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3.5 sm:px-8 sm:py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 <strong className="text-slate-700 dark:text-slate-300">Catatan:</strong> Anda dapat mengubah pilihan kategori ini kapan saja melalui menu <em>Pengaturan</em> atau klik <em>Badge Kategori</em> di bagian atas.
          </p>
          {hasSavedBefore && (
            <button
              onClick={closePicker}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            >
              Simpan & Lanjutkan
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
