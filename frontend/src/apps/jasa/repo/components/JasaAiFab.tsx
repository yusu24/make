import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X } from '@/constants/icons';

interface JasaAiFabProps {
  onOpen: () => void;
  isPosView?: boolean;
}

export const JasaAiFab: React.FC<JasaAiFabProps> = ({ onOpen, isPosView = false }) => {
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem('bizora_jasa_ai_hidden') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  // Position state (null = use CSS default placement)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('bizora_jasa_ai_pos');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const fabRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragInfo = useRef({ startX: 0, startY: 0, initialLeft: 0, initialTop: 0 });

  useEffect(() => {
    const handleOpenAi = () => {
      setIsHidden(false);
      onOpen();
    };
    const handleToggle = (e: any) => {
      const next = e.detail?.enabled !== undefined ? !e.detail.enabled : !isHidden;
      setIsHidden(next);
      localStorage.setItem('bizora_jasa_ai_hidden', String(next));
    };

    window.addEventListener('bizora:open-jasa-ai', handleOpenAi);
    window.addEventListener('bizora:toggle-jasa-pos-ai', handleToggle);
    return () => {
      window.removeEventListener('bizora:open-jasa-ai', handleOpenAi);
      window.removeEventListener('bizora:toggle-jasa-pos-ai', handleToggle);
    };
  }, [isHidden, onOpen]);

  // Handle pointer down (mouse or touch) for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button[data-dismiss]')) return;

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

    const onPointerMove = (moveEv: PointerEvent) => {
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
          if (curr) localStorage.setItem('bizora_jasa_ai_pos', JSON.stringify(curr));
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

  const handleBubbleClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpen();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(true);
    localStorage.setItem('bizora_jasa_ai_hidden', 'true');
  };

  const handleRestore = () => {
    setIsHidden(false);
    localStorage.setItem('bizora_jasa_ai_hidden', 'false');
  };

  if (isHidden) {
    return (
      <button
        type="button"
        onClick={handleRestore}
        className="fixed bottom-20 md:bottom-6 right-3 z-40 p-2 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white shadow-md backdrop-blur-sm border border-blue-400/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Tampilkan kembali AI Diagnosa"
        aria-label="Tampilkan kembali AI Diagnosa"
      >
        <Sparkles size={16} className="animate-pulse" />
      </button>
    );
  }

  return (
    <div
      ref={fabRef}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed z-40 select-none cursor-grab active:cursor-grabbing touch-none ${
        position ? '' : (
          isPosView
            ? 'bottom-5 right-5 lg:bottom-6 lg:right-[400px]'
            : 'bottom-20 md:bottom-6 right-6'
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
        <Sparkles size={13} className="text-sky-300 animate-pulse" />
        <span>AI Diagnosa Servis</span>
        <span className="text-[9px] bg-sky-500/40 text-sky-200 px-1.5 py-0.5 rounded font-bold border border-sky-400/30">
          PRO
        </span>
      </div>

      {/* Dismiss "X" button - visible everywhere */}
      <button
        type="button"
        data-dismiss="true"
        onClick={handleDismiss}
        className="absolute -top-1 -right-1 z-50 w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-600 flex items-center justify-center shadow transition-all duration-150 cursor-pointer"
        title="Sembunyikan AI Diagnosa"
        aria-label="Sembunyikan AI Diagnosa"
      >
        <X size={11} />
      </button>

      {/* Circular Bubble Button */}
      <button
        type="button"
        onClick={handleBubbleClick}
        className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 text-white shadow-lg shadow-blue-500/35 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-transform duration-150 border border-white/20 focus:outline-none cursor-pointer"
        title="Buka AI Diagnosa & Estimasi Biaya Servis (Bisa digeser)"
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
