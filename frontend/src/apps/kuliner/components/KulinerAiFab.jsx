import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import KulinerAiModal from './KulinerAiModal';

export default function KulinerAiFab() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [posAiEnabled, setPosAiEnabled] = useState(() => {
    const saved = localStorage.getItem('bizora_kuliner_pos_ai_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isHovered, setIsHovered] = useState(false);

  const isPosPage = pathname === '/kuliner/orders' || pathname.includes('/pos');

  // Listen to custom events
  useEffect(() => {
    const handleOpenAi = () => setIsOpen(true);
    const handleTogglePosAi = (e) => {
      const nextState = e.detail?.enabled !== undefined ? e.detail.enabled : !posAiEnabled;
      setPosAiEnabled(nextState);
      localStorage.setItem('bizora_kuliner_pos_ai_enabled', String(nextState));
    };

    window.addEventListener('bizora:open-kuliner-ai', handleOpenAi);
    window.addEventListener('bizora:toggle-kuliner-pos-ai', handleTogglePosAi);
    return () => {
      window.removeEventListener('bizora:open-kuliner-ai', handleOpenAi);
      window.removeEventListener('bizora:toggle-kuliner-pos-ai', handleTogglePosAi);
    };
  }, [posAiEnabled]);

  // In POS / Orders view, if cashier has disabled the floating AI button, don't show the FAB
  if (isPosPage && !posAiEnabled) {
    return (
      <KulinerAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    );
  }

  const handleDismissInPos = (e) => {
    e.stopPropagation();
    setPosAiEnabled(false);
    localStorage.setItem('bizora_kuliner_pos_ai_enabled', 'false');
    window.dispatchEvent(new CustomEvent('bizora:kuliner-pos-ai-state-changed', { detail: { enabled: false } }));
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div
        className="fixed z-40 bottom-6 right-6 transition-all duration-300 ease-out select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip on hover */}
        <div
          className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/50 pointer-events-none whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <Sparkles size={13} className="text-amber-300 animate-pulse" />
          <span>AI Chef Assistant</span>
          <span className="text-[9px] bg-amber-500/40 text-amber-200 px-1.5 py-0.5 rounded font-bold border border-amber-400/30">
            PRO
          </span>
        </div>

        {/* Small dismiss "x" button when on POS screen */}
        {isPosPage && isHovered && (
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
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/35 hover:shadow-xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 focus:outline-none cursor-pointer"
          title="Buka Asisten AI Kuliner & Resep HPP"
          aria-label="AI Chef Assistant"
        >
          {/* Subtle glowing pulse ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-30 group-hover:opacity-60 blur-sm transition-opacity duration-300 animate-pulse" />

          {/* Sparkles Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles size={22} className="text-white drop-shadow" />
          </div>

          {/* Small AI badge overlay */}
          <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.2 bg-slate-900 text-amber-300 border border-amber-400/40 text-[9px] font-black rounded-full shadow-sm tracking-tight leading-tight">
            AI
          </span>
        </button>
      </div>

      {/* Kuliner AI Modal */}
      <KulinerAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
