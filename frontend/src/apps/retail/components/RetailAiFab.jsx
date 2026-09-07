import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import RetailAiModal from './RetailAiModal';

export default function RetailAiFab() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [posAiEnabled, setPosAiEnabled] = useState(() => {
    const saved = localStorage.getItem('bizora_pos_ai_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isHovered, setIsHovered] = useState(false);

  const isPosPage = pathname === '/retail/pos' || pathname === '/seller/pos';
  const isRetail = pathname.startsWith('/retail') || isPosPage;

  // Listen to custom event for opening modal or toggling POS visibility
  useEffect(() => {
    const handleOpenAi = () => setIsOpen(true);
    const handleTogglePosAi = (e) => {
      const nextState = e.detail?.enabled !== undefined ? e.detail.enabled : !posAiEnabled;
      setPosAiEnabled(nextState);
      localStorage.setItem('bizora_pos_ai_enabled', String(nextState));
    };

    window.addEventListener('bizora:open-retail-ai', handleOpenAi);
    window.addEventListener('bizora:toggle-pos-ai', handleTogglePosAi);
    return () => {
      window.removeEventListener('bizora:open-retail-ai', handleOpenAi);
      window.removeEventListener('bizora:toggle-pos-ai', handleTogglePosAi);
    };
  }, [posAiEnabled]);

  // Don't render if not retail route
  if (!isRetail) return null;

  // In POS view, if cashier has disabled the floating AI button, don't show the FAB
  if (isPosPage && !posAiEnabled) {
    return (
      <RetailAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    );
  }

  const handleDismissInPos = (e) => {
    e.stopPropagation();
    setPosAiEnabled(false);
    localStorage.setItem('bizora_pos_ai_enabled', 'false');
    window.dispatchEvent(new CustomEvent('bizora:pos-ai-state-changed', { detail: { enabled: false } }));
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div
        className={`fixed z-40 transition-all duration-300 ease-out select-none ${
          isPosPage
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
          <Sparkles size={13} className="text-amber-300 animate-pulse" />
          <span>Retail AI Advisor</span>
          <span className="text-[9px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded font-bold border border-indigo-400/30">
            PRO
          </span>
        </div>

        {/* Small dismiss "x" button when on POS screen */}
        {isPosPage && isHovered && (
          <button
            type="button"
            onClick={handleDismissInPos}
            className="absolute -top-1.5 -left-1.5 z-50 w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-600 flex items-center justify-center shadow transition-all duration-150"
            title="Sembunyikan AI di Kasir"
          >
            <X size={11} />
          </button>
        )}

        {/* Circular Bubble Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/35 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 focus:outline-none"
          title="Buka Retail AI Advisor"
          aria-label="Retail AI Advisor"
        >
          {/* Subtle glowing pulse ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 group-hover:opacity-60 blur-sm transition-opacity duration-300 animate-pulse" />

          {/* Sparkles / Bot Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles size={22} className="text-white drop-shadow" />
          </div>

          {/* Small AI badge overlay */}
          <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.2 bg-slate-900 text-amber-300 border border-amber-400/40 text-[9px] font-black rounded-full shadow-sm tracking-tight leading-tight">
            AI
          </span>
        </button>
      </div>

      {/* Retail AI Advisor Modal */}
      <RetailAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
