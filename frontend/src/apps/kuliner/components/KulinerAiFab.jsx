import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X } from '@/constants/icons';
import KulinerAiModal from './KulinerAiModal';

export default function KulinerAiFab() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem('bizora_kuliner_ai_hidden') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  // Position state (null = use CSS default placement)
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('bizora_kuliner_ai_pos');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const fabRef = useRef(null);
  const isDragging = useRef(false);
  const dragInfo = useRef({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  const isPosPage = pathname === '/kuliner/orders' || pathname.includes('/pos');

  // Listen to custom events
  useEffect(() => {
    const handleOpenAi = () => {
      setIsHidden(false);
      setIsOpen(true);
    };
    const handleToggleAi = (e) => {
      const next = e.detail?.enabled !== undefined ? !e.detail.enabled : !isHidden;
      setIsHidden(next);
      localStorage.setItem('bizora_kuliner_ai_hidden', String(next));
    };

    window.addEventListener('bizora:open-kuliner-ai', handleOpenAi);
    window.addEventListener('bizora:toggle-kuliner-pos-ai', handleToggleAi);
    return () => {
      window.removeEventListener('bizora:open-kuliner-ai', handleOpenAi);
      window.removeEventListener('bizora:toggle-kuliner-pos-ai', handleToggleAi);
    };
  }, [isHidden]);

  // Handle pointer down (mouse or touch) for dragging
  const handlePointerDown = (e) => {
    if (e.target.closest('button[data-dismiss]')) return;

    const el = fabRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top
    };
    isDragging.current = false;

    const onPointerMove = (moveEv) => {
      const dx = moveEv.clientX - dragInfo.current.startX;
      const dy = moveEv.clientY - dragInfo.current.startY;

      if (Math.hypot(dx, dy) > 5) {
        isDragging.current = true;
      }

      if (isDragging.current) {
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        const nextX = Math.max(10, Math.min(maxX, dragInfo.current.initialLeft + dx));
        const nextY = Math.max(10, Math.min(maxY, dragInfo.current.initialTop + dy));
        setPosition({ x: nextX, y: nextY });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (isDragging.current) {
        setPosition((curr) => {
          if (curr) localStorage.setItem('bizora_kuliner_ai_pos', JSON.stringify(curr));
          return curr;
        });
        setTimeout(() => {
          isDragging.current = false;
        }, 80);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleBubbleClick = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsHidden(true);
    localStorage.setItem('bizora_kuliner_ai_hidden', 'true');
  };

  const handleRestore = () => {
    setIsHidden(false);
    localStorage.setItem('bizora_kuliner_ai_hidden', 'false');
  };

  return (
    <>
      {/* If hidden, show subtle restore tab on screen edge */}
      {isHidden ? (
        <button
          type="button"
          onClick={handleRestore}
          className="fixed bottom-20 md:bottom-6 right-3 z-40 p-2 rounded-full bg-amber-600/90 hover:bg-amber-600 text-white shadow-md backdrop-blur-sm border border-amber-400/40 transition-all hover:scale-105 active:scale-95"
          title="Tampilkan kembali AI Chef"
          aria-label="Tampilkan kembali AI Chef"
        >
          <Sparkles size={16} className="animate-pulse" />
        </button>
      ) : (
        /* Floating Action Button (FAB) */
        <div
          ref={fabRef}
          onPointerDown={handlePointerDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`fixed z-40 select-none cursor-grab active:cursor-grabbing touch-none ${
            position ? '' : (
              isPosPage
                ? 'bottom-5 right-5 lg:bottom-6 lg:right-6'
                : 'bottom-20 md:bottom-6 right-5 md:right-6'
            )
          }`}
          style={position ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' } : undefined}
        >
          {/* Tooltip on hover (desktop) */}
          <div
            className={`hidden md:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/50 pointer-events-none whitespace-nowrap transition-all duration-200 items-center gap-2 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            <Sparkles size={13} className="text-amber-300 animate-pulse" />
            <span>AI Chef Assistant</span>
            <span className="text-[9px] bg-amber-500/40 text-amber-200 px-1.5 py-0.5 rounded font-bold border border-amber-400/30">
              PRO
            </span>
          </div>

          {/* Dismiss "X" button - visible everywhere */}
          <button
            type="button"
            data-dismiss="true"
            onClick={handleDismiss}
            className="absolute -top-1 -right-1 z-50 w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-600 flex items-center justify-center shadow transition-all duration-150 cursor-pointer"
            title="Sembunyikan AI Chef"
            aria-label="Sembunyikan AI Chef"
          >
            <X size={11} />
          </button>

          {/* Circular Bubble Button */}
          <button
            type="button"
            onClick={handleBubbleClick}
            className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/35 hover:shadow-xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-transform duration-150 border border-white/20 focus:outline-none cursor-pointer"
            title="Buka Asisten AI Kuliner & Resep HPP (Bisa digeser)"
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
      )}

      {/* Kuliner AI Modal */}
      <KulinerAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
