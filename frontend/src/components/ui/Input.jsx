import React from 'react';

/**
 * Standard Unified Input Component for Bizora SaaS
 *
 * Standard Specs:
 * - Height: 38px (h-[38px])
 * - Font: 13px font-medium
 * - Radius: 10px (rounded-xl)
 * - Padding: px-3.5 (or pl-9 with left icon)
 */
export default function Input({
  type = 'text',
  icon: Icon = null,
  iconRight: IconRight = null,
  error = false,
  errorMessage = '',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" />}
          </div>
        )}

        <input
          type={type}
          disabled={disabled}
          className={`
            w-full h-[38px] text-[13px] font-medium text-slate-800 dark:text-slate-100
            bg-white dark:bg-slate-900 border rounded-xl
            transition-colors duration-150 outline-none
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${Icon ? 'pl-9' : 'pl-3.5'}
            ${IconRight ? 'pr-9' : 'pr-3.5'}
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' 
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
            }
            ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />

        {IconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            {React.isValidElement(IconRight) ? IconRight : <IconRight className="w-4 h-4" />}
          </div>
        )}
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-xs text-red-500 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
