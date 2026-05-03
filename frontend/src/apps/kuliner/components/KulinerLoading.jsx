import React from 'react';

const KulinerLoading = ({ message = "Memuat data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] py-20">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute w-16 h-16 bg-[#b48c36]/10 rounded-full animate-ping"></div>
        
        {/* Main Spinner */}
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#b48c36] rounded-full animate-spin shadow-sm"></div>
        
        {/* Center Dot */}
        <div className="absolute w-2 h-2 bg-[#b48c36] rounded-full"></div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-[14px] font-medium text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
};

export default KulinerLoading;
