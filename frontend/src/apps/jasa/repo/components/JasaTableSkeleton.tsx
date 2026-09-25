import React from 'react';

/**
 * JasaTableSkeleton
 * Non-blocking, beautiful shimmer rows designed specifically for Jasa / Workshop tables.
 * Can be rendered directly inside a <tbody> without breaking HTML table structure,
 * or as a standalone card shimmer when standalone={true}.
 */
interface JasaTableSkeletonProps {
  rows?: number;
  cols?: number;
  standalone?: boolean;
}

export const JasaTableSkeleton: React.FC<JasaTableSkeletonProps> = ({
  rows = 5,
  cols = 5,
  standalone = false
}) => {
  if (standalone) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-slate-100/80 rounded-xl animate-pulse w-full flex items-center px-4 gap-4"
            >
              {[...Array(cols)].map((_, j) => (
                <div
                  key={j}
                  className="h-3 bg-slate-200 rounded"
                  style={{ width: `${Math.max(30, 90 - j * 12)}%` }}
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
        <tr key={rIdx} className="border-b border-slate-100 animate-pulse">
          {[...Array(cols)].map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-3.5">
              <div
                className="h-4 bg-slate-200/90 rounded-md"
                style={{
                  width: cIdx === 0 ? '55%' : cIdx === cols - 1 ? '50%' : '75%',
                  opacity: 0.95 - cIdx * 0.05
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default JasaTableSkeleton;
