import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
  pageSizeOptions?: number[];
  /** Set when embedding inside an already-padded card — drops the boxed background/border so it doesn't look like a nested panel. */
  bare?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setPageSize,
  setCurrentPage,
  pageSizeOptions = [10, 25, 50],
  bare = false,
}) => {
  const startIdx = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  // Generate numbered window (up to 5 pages)
  const pageNumbers: number[] = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-500 w-full ${
      bare ? 'pt-3' : 'px-3 sm:px-4 py-2.5 sm:py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-700'
    }`}>
      {/* Left: Concise y-x / yx */}
      <div className="text-xs sm:text-[13px] font-semibold text-slate-500 whitespace-nowrap">
        <span className="font-bold text-slate-700 dark:text-slate-200">{startIdx}-{endIdx}</span> / <span>{totalItems}</span>
      </div>

      {/* Right: Controls without 'Baris' label */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer mr-1"
          title="Jumlah per halaman"
          aria-label="Jumlah per halaman"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Halaman Sebelumnya"
            aria-label="Halaman Sebelumnya"
          >
            ‹
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                1
              </button>
              {startPage > 2 && <span className="text-slate-400 text-xs px-0.5">...</span>}
            </>
          )}

          {pageNumbers.map((pg) => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 rounded-lg font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                currentPage === pg
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {pg}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-slate-400 text-xs px-0.5">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Halaman Selanjutnya"
            aria-label="Halaman Selanjutnya"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
