import React from 'react'

/**
 * BudidayaTableSkeleton
 * Non-blocking, emerald-branded shimmer table skeleton for Budidaya Hewan & Tanaman module.
 * Can be rendered directly inside a <tbody> without breaking HTML table structure,
 * or as a standalone card shimmer when standalone={true}.
 */
export function BudidayaTableSkeleton({
  rows = 5,
  cols = 6,
  standalone = false,
  message = null,
}) {
  // Realistic column width variations for natural table appearance
  const cellWidths = [
    ['70%', '45%', '60%', '85%', '50%', '30%'],
    ['85%', '60%', '75%', '55%', '40%', '30%'],
    ['60%', '40%', '85%', '70%', '65%', '30%'],
    ['75%', '55%', '65%', '90%', '45%', '30%'],
    ['90%', '50%', '80%', '60%', '55%', '30%'],
    ['65%', '45%', '70%', '75%', '60%', '30%'],
  ]

  if (standalone) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Controls Placeholder */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="h-10 w-72 rounded-xl aq-shimmer-subtle" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 rounded-xl aq-shimmer-subtle" />
            <div className="h-10 w-28 rounded-xl aq-shimmer-subtle" />
          </div>
        </div>

        {/* Table Header Placeholder */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center gap-4">
          {[...Array(cols)].map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-3.5 rounded-md aq-shimmer"
              style={{
                width: cIdx === 0 ? '60px' : cIdx === cols - 1 ? '50px' : `${Math.max(60, 120 - cIdx * 12)}px`,
                marginLeft: cIdx === cols - 1 ? 'auto' : 0
              }}
            />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {[...Array(rows)].map((_, rIdx) => {
            const rowWidths = cellWidths[rIdx % cellWidths.length]
            return (
              <div
                key={rIdx}
                className="px-4 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                style={{ animationDelay: `${rIdx * 0.08}s` }}
              >
                {[...Array(cols)].map((_, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      flex: cIdx === 0 ? '0 0 60px' : cIdx === cols - 1 ? '0 0 70px' : '1',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: cIdx === cols - 1 ? 'auto' : 0,
                      justifyContent: cIdx === cols - 1 ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {cIdx === cols - 1 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg aq-shimmer-subtle" />
                        <div className="w-7 h-7 rounded-lg aq-shimmer-subtle" />
                      </div>
                    ) : cIdx === 2 ? (
                      <div className="h-6 w-20 rounded-full aq-shimmer" />
                    ) : (
                      <div
                        className="h-4 rounded-md aq-shimmer"
                        style={{ width: rowWidths[cIdx % rowWidths.length] || '70%' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Footer Pagination Placeholder */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
          <div className="h-4 w-44 rounded-md aq-shimmer-subtle" />
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg aq-shimmer-subtle" />
            <div className="w-8 h-8 rounded-lg aq-shimmer" />
            <div className="w-8 h-8 rounded-lg aq-shimmer-subtle" />
            <div className="w-8 h-8 rounded-lg aq-shimmer-subtle" />
          </div>
        </div>

        {message && (
          <p className="text-center text-xs text-slate-400 py-2 border-t border-slate-100">
            {message}
          </p>
        )}
      </div>
    )
  }

  // Inside <tbody>
  return (
    <>
      {[...Array(rows)].map((_, rIdx) => {
        const rowWidths = cellWidths[rIdx % cellWidths.length]
        return (
          <tr
            key={rIdx}
            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
          >
            {[...Array(cols)].map((_, cIdx) => (
              <td
                key={cIdx}
                className="py-3.5 px-4 align-middle"
              >
                {cIdx === cols - 1 ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-7 h-7 rounded-lg aq-shimmer-subtle" />
                    <div className="w-7 h-7 rounded-lg aq-shimmer-subtle" />
                  </div>
                ) : cIdx === 2 ? (
                  <div className="h-6 w-20 rounded-full aq-shimmer" />
                ) : (
                  <div
                    className="h-4 rounded-md aq-shimmer"
                    style={{
                      width: cIdx === 0 ? '55%' : rowWidths[cIdx % rowWidths.length] || '70%',
                      maxWidth: '180px'
                    }}
                  />
                )}
              </td>
            ))}
          </tr>
        )
      })}
    </>
  )
}
export default BudidayaTableSkeleton
