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
  return (
    <div className={`flex flex-row flex-nowrap whitespace-nowrap items-center justify-between gap-3 text-xs text-slate-500 w-full overflow-x-auto ${
      bare ? 'pt-3' : 'p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-700'
    }`}>
      <div>
        Menampilkan{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}
        </span>
        -
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{' '}
        dari <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> data
      </div>

      <div className="flex items-center gap-3">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`w-8 h-8 rounded-lg font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                currentPage === pg
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
