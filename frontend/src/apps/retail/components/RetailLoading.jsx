import React from 'react';

export default function RetailLoading({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
