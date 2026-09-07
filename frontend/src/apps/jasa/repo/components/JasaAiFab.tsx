import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

interface JasaAiFabProps {
  onOpen: () => void;
  isPosView?: boolean;
}

export const JasaAiFab: React.FC<JasaAiFabProps> = ({ onOpen, isPosView = false }) => {
  const [posAiEnabled, setPosAiEnabled] = useState(() => {
    const saved = localStorage.getItem('bizora_jasa_pos_ai_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleToggle = (e: any) => {
      const next = e.detail?.enabled !== undefined ? e.detail.enabled : !posAiEnabled;
      setPosAiEnabled(next);
      localStorage.setItem('bizora_jasa_pos_ai_enabled', String(next));
    };
    window.addEventListener('bizora:toggle-jasa-pos-ai', handleToggle);
    return () => window.removeEventListener('bizora:toggle-jasa-pos-ai', handleToggle);
  }, [posAiEnabled]);

  if (isPosView && !posAiEnabled) {
    return null;
  }

  const handleDismissInPos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosAiEnabled(false);
    localStorage.setItem('bizora_jasa_pos_ai_enabled', 'false');
  };

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ease-out select-none ${
        isPosView
          ? 'bottom-5 right-5 lg:bottom-6 lg:right-[400px]'
          : 'bottom-6 right-6'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip on hover */}
      <div
        className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/50 pointer-events-none whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <Sparkles size={13} className="text-sky-300 animate-pulse" />
        <span>AI Diagnosa Servis</span>
        <span className="text-[9px] bg-sky-500/40 text-sky-200 px-1.5 py-0.5 rounded font-bold border border-sky-400/30">
          PRO
        </span>
      </div>

      {/* Small dismiss "x" button when on POS screen */}
      {isPosView && isHovered && (
        <button
          type="button"
          onClick={handleDismissInPos}
          className="absolute -top-1.5 -left-1.5 z-50 w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-600 flex items-center justify-center shadow transition-all duration-150 cursor-pointer"
          title="Sembunyikan AI di Kasir"
        >
          <X size={11} />
        </button>
      )}

      {/* Circular Bubble Button */}
      <button
        type="button"
        onClick={onOpen}
        className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-blue-500/35 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 focus:outline-none cursor-pointer"
        title="Buka AI Diagnosa & Estimasi Biaya Servis"
        aria-label="AI Diagnosa Servis"
      >
        {/* Subtle glowing pulse ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 opacity-30 group-hover:opacity-60 blur-sm transition-opacity duration-300 animate-pulse" />

        {/* Sparkles Icon */}
        <div className="relative flex items-center justify-center">
          <Sparkles size={22} className="text-white drop-shadow" />
        </div>

        {/* Small AI badge overlay */}
        <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.2 bg-slate-900 text-sky-300 border border-sky-400/40 text-[9px] font-black rounded-full shadow-sm tracking-tight leading-tight">
          AI
        </span>
      </button>
    </div>
  );
};
