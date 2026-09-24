import React from 'react';

/**
 * Standard Unified Page Header Component for Bizora SaaS
 *
 * Standard Specs:
 * - Title: 20px - 22px font-bold
 * - Subtitle: 13px font-normal text-slate-500
 * - Action slot aligned right with uniform gap
 */
export default function PageHeader({
  title,
  subtitle = null,
  icon: Icon = null,
  actions = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 ${className}`}>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-[22px] font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          {Icon && (
            React.isValidElement(Icon) ? Icon : <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
