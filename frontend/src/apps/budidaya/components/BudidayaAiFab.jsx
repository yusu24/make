import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import BudidayaAiModal from './BudidayaAiModal';

export default function BudidayaAiFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Action Button (FAB) for Budidaya */}
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
          <Sparkles size={13} className="text-emerald-400 animate-pulse" />
          <span>Bio-AI Diagnosa</span>
          <span className="text-[9px] bg-emerald-500/40 text-emerald-200 px-1.5 py-0.5 rounded font-bold border border-emerald-400/30">
            PRO
          </span>
        </div>

        {/* Circular Bubble Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/35 hover:shadow-xl hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 focus:outline-none cursor-pointer"
          title="Buka Bio-AI Diagnosa Kesehatan Air, Penyakit & Panen"
          aria-label="Bio-AI Diagnosa"
        >
          {/* Subtle glowing pulse ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 group-hover:opacity-60 blur-sm transition-opacity duration-300 animate-pulse" />

          {/* Sparkles Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles size={22} className="text-white drop-shadow" />
          </div>

          {/* Small AI badge overlay */}
          <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.2 bg-slate-900 text-emerald-300 border border-emerald-400/40 text-[9px] font-black rounded-full shadow-sm tracking-tight leading-tight">
            AI
          </span>
        </button>
      </div>

      {/* Budidaya AI Modal */}
      <BudidayaAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
