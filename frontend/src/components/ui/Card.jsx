import React from 'react';

/**
 * Standard Unified Card Component for Bizora SaaS
 *
 * Standard Specs:
 * - Radius: 16px (rounded-2xl)
 * - Border: 1px subtle border
 * - Shadow: shadow-xs flat/clean
 */
export default function Card({
  children,
  title = null,
  subtitle = null,
  action = null,
  padding = true,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80
        rounded-2xl shadow-xs overflow-hidden
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={padding ? 'p-5' : ''}>
        {children}
      </div>
    </div>
  );
}
