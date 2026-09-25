import React from 'react';

const KulinerLoading = ({ message = "Memuat data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[350px] py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default KulinerLoading;
