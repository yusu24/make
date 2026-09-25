import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@/constants/icons';

const THEME_STYLES = {
  amber: {
    activeBtn: 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 hover:bg-amber-700',
    hoverBtn: 'hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300',
    selectFocus: 'focus:ring-amber-500/20 focus:border-amber-500',
  },
  emerald: {
    activeBtn: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700',
    hoverBtn: 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
    selectFocus: 'focus:ring-emerald-500/20 focus:border-emerald-500',
  },
  teal: {
    activeBtn: 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 hover:bg-teal-700',
    hoverBtn: 'hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300',
    selectFocus: 'focus:ring-teal-500/20 focus:border-teal-500',
  },
  blue: {
    activeBtn: 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700',
    hoverBtn: 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
    selectFocus: 'focus:ring-blue-500/20 focus:border-blue-500',
  },
  indigo: {
    activeBtn: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700',
    hoverBtn: 'hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300',
    selectFocus: 'focus:ring-indigo-500/20 focus:border-indigo-500',
  }
};

/**
 * BizoraPagination - Standard Unified Pagination Component for Bizora SaaS
 *
 * Supports both client-side and server-side pagination with uniform design:
 * - Clean responsive layout with compact typography
 * - Concise page range indicator (e.g., "1-10 / 45")
 * - Page size dropdown without redundant "Baris" label
 * - Numbered page buttons with max window
 * - Accessible Next/Previous controls
 */
export default function BizoraPagination({
  currentPage = 1,
  page,
  setCurrentPage,
  onPageChange,
  pageSize = 10,
  perPage,
  setPageSize,
  onPageSizeChange,
  totalPages,
  lastPage,
  totalItems = 0,
  total,
  startIndex,
  endIndex,
  showSizeSelector = true,
  pageSizeOptions = [5, 10, 25, 50, 100],
  className = '',
  style = {},
  theme,
  color
}) {
  const activePage = Number(page ?? currentPage) || 1;
  const activePageSize = Number(perPage ?? pageSize) || 10;
  const activeTotalItems = Number(total ?? totalItems) || 0;
  const activeTotalPages = Number(lastPage ?? totalPages) || Math.max(1, Math.ceil(activeTotalItems / activePageSize));

  // Auto-detect module theme from URL if not specified
  let resolvedTheme = theme || color;
  if (!resolvedTheme) {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path.includes('/kuliner')) resolvedTheme = 'amber';
    else if (path.includes('/budidaya')) resolvedTheme = 'teal';
    else if (path.includes('/retail')) resolvedTheme = 'emerald';
    else resolvedTheme = 'indigo';
  }
  const themeConfig = THEME_STYLES[resolvedTheme] || THEME_STYLES.indigo;

  const changePage = (newPage) => {
    const clamped = Math.max(1, Math.min(activeTotalPages, newPage));
    if (onPageChange) onPageChange(clamped);
    if (setCurrentPage) setCurrentPage(clamped);
  };

  const changeSize = (newSize) => {
    const parsed = Number(newSize) || 10;
    if (onPageSizeChange) onPageSizeChange(parsed);
    if (setPageSize) setPageSize(parsed);
    changePage(1);
  };

  const calcStart = (startIndex !== undefined && !isNaN(startIndex))
    ? Number(startIndex)
    : (activePage - 1) * activePageSize;
  const calcEnd = (endIndex !== undefined && !isNaN(endIndex))
    ? Number(endIndex)
    : Math.min(calcStart + activePageSize, activeTotalItems);

  const displayStart = activeTotalItems > 0 ? calcStart + 1 : 0;
  const displayEnd = Math.min(calcEnd, activeTotalItems);

  // Generate numbered window (up to 5 pages)
  const pageNumbers = [];
  let startPage = Math.max(1, activePage - 2);
  let endPage = Math.min(activeTotalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div
      className={`bizora-pagination-container flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-2.5 sm:py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 rounded-b-2xl ${className}`}
      style={style}
    >
      {/* Left: Info data (Ringkas y-x / yx) */}
      <div className="text-xs sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <span className="text-slate-800 dark:text-slate-200 font-bold">{displayStart}-{displayEnd}</span> / <span>{activeTotalItems}</span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Page size selector (Tanpa tulisan 'Baris') */}
        {showSizeSelector && (setPageSize || onPageSizeChange) && (
          <select
            value={activePageSize}
            onChange={(e) => changeSize(e.target.value)}
            className={`h-7 sm:h-8 px-2 sm:px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 ${themeConfig.selectFocus} transition-all cursor-pointer mr-1`}
            title="Jumlah per halaman"
            aria-label="Jumlah per halaman"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {/* First & Prev */}
        {activeTotalPages > 5 && (
          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={activePage === 1}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Halaman Pertama"
            aria-label="Halaman Pertama"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => changePage(activePage - 1)}
          disabled={activePage === 1}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Halaman Sebelumnya"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => changePage(1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                1
              </button>
              {startPage > 2 && <span className="text-slate-400 text-xs px-0.5">...</span>}
            </>
          )}

          {pageNumbers.map((num) => {
            const isActive = num === activePage;
            return (
              <button
                key={num}
                type="button"
                onClick={() => changePage(num)}
                className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? themeConfig.activeBtn
                    : `text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${themeConfig.hoverBtn}`
                }`}
              >
                {num}
              </button>
            );
          })}

          {endPage < activeTotalPages && (
            <>
              {endPage < activeTotalPages - 1 && <span className="text-slate-400 text-xs px-0.5">...</span>}
              <button
                type="button"
                onClick={() => changePage(activeTotalPages)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                {activeTotalPages}
              </button>
            </>
          )}
        </div>

        {/* Next & Last */}
        <button
          type="button"
          onClick={() => changePage(activePage + 1)}
          disabled={activePage === activeTotalPages}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Halaman Selanjutnya"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={14} />
        </button>

        {activeTotalPages > 5 && (
          <button
            type="button"
            onClick={() => changePage(activeTotalPages)}
            disabled={activePage === activeTotalPages}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Halaman Terakhir"
            aria-label="Halaman Terakhir"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
