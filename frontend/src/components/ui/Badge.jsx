import React from 'react';

/**
 * Standard Unified Status Badge Component for Bizora SaaS
 *
 * Standard Specs:
 * - Font: 11.5px font-semibold
 * - Padding: py-0.5 px-2.5
 * - Radius: rounded-lg (default) or rounded-full (pill)
 * - Soft tint background with high readability contrast
 */
export default function Badge({
  children,
  variant = 'blue',
  pill = true,
  dot = false,
  className = '',
  ...props
}) {
  const variantClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    yellow: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    red: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    violet: 'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    gray: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const currentVariant = variantClasses[variant] || variantClasses.blue;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11.5px] font-semibold border
        whitespace-nowrap select-none
        ${pill ? 'rounded-full' : 'rounded-lg'}
        ${currentVariant}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      )}
      {children}
    </span>
  );
}
