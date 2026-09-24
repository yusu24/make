import React from 'react';
import { Loader2 } from '@/constants/icons';

/**
 * Standard Unified Button Component for Bizora SaaS
 *
 * Sizing:
 * - sm: h-8 (32px), text-xs (12.5px), px-3
 * - md: h-[38px] (38px standard), text-[13.5px], px-4 (Default)
 * - lg: h-11 (44px), text-sm (14px), px-5
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-[12.5px] rounded-lg gap-1.5',
    md: 'h-[38px] px-4 text-[13.5px] rounded-xl gap-2',
    lg: 'h-11 px-5 text-sm rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary: 'btn-primary bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-xs',
    secondary: 'btn-secondary bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-2xs',
    ghost: 'btn-ghost bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent',
    danger: 'btn-danger bg-red-600 hover:bg-red-700 text-white border-transparent shadow-xs',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const currentVariant = variantClasses[variant] || variantClasses.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-semibold whitespace-nowrap
        transition-colors duration-150 cursor-pointer select-none
        ${currentSize}
        ${currentVariant}
        ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!loading && IconRight ? (
        React.isValidElement(IconRight) ? IconRight : <IconRight className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
}
