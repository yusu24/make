import React from 'react';
import { ChevronDown } from '@/constants/icons';

/**
 * Standard Unified Select Dropdown for Bizora SaaS
 *
 * Standard Specs:
 * - Height: 38px (h-[38px])
 * - Font: 13px font-medium
 * - Radius: 10px (rounded-xl)
 * - Padding: pl-3 pr-8
 */
export default function Select({
  children,
  error = false,
  errorMessage = '',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        <select
          disabled={disabled}
          className={`
            w-full h-[38px] text-[13px] font-medium text-slate-700 dark:text-slate-200
            bg-white dark:bg-slate-900 border rounded-xl
            pl-3 pr-8 transition-colors duration-150 outline-none
            appearance-none cursor-pointer
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' 
              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
            }
            ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-xs text-red-500 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
