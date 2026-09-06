import React from 'react';

/**
 * FormLabel - Standard Form Field Label for Bizora SaaS
 *
 * Example:
 * <FormLabel required htmlFor="name" helper="Maks 150 karakter">Nama Produk</FormLabel>
 */
export default function FormLabel({
  children,
  required = false,
  htmlFor,
  helper,
  className = '',
  style = {}
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[13px] font-semibold text-slate-700 mb-1.5 ${className}`}
      style={style}
    >
      <span>{children}</span>
      {required && (
        <span className="text-rose-500 ml-1 font-bold" title="Wajib diisi">
          *
        </span>
      )}
      {helper && (
        <span className="text-[11px] font-normal text-slate-400 ml-1.5">
          ({helper})
        </span>
      )}
    </label>
  );
}
