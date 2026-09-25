import React from 'react';

/**
 * KulinerTableSkeleton
 * Non-blocking, beautiful shimmer rows designed specifically for Kuliner tables.
 * Can be rendered directly inside a <tbody> without breaking HTML table structure,
 * or as a standalone card shimmer when standalone={true}.
 */
export default function KulinerTableSkeleton({ rows = 5, cols = 5, standalone = false }) {
  if (standalone) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse w-full flex items-center px-4 gap-4"
            >
              {[...Array(cols)].map((_, j) => (
                <div
                  key={j}
                  className="h-3 bg-slate-200 dark:bg-slate-700 rounded"
                  style={{ width: `${Math.max(30, 90 - (j * 12))}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {[...Array(rows)].map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800/60 animate-pulse">
          {[...Array(cols)].map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-3.5">
              <div
                className="h-4 bg-slate-200/90 dark:bg-slate-700/60 rounded"
                style={{
                  width: cIdx === 0 ? '45%' : cIdx === cols - 1 ? '60%' : '80%',
                  opacity: 0.95 - (cIdx * 0.05)
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
