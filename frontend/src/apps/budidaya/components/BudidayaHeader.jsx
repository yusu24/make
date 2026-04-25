import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import '../budidaya.css'

export default function BudidayaHeader({ onMenuToggle }) {
  const { user } = useAuth()
  
  return (
    <header className="flex justify-between items-center w-full px-8 h-20 bg-white/80 backdrop-blur-md border-b border-[#E9F0EC] sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-sm font-semibold text-slate-600">Dashboard Utama</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            className="bg-[#F1F5F9] border-none rounded-full pl-11 pr-6 py-2.5 text-xs focus:ring-2 focus:ring-[#2D6A4F] w-72 transition-all placeholder:text-slate-400 font-medium" 
            placeholder="Cari kolam atau data..." 
            type="text"
          />
        </div>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#E11D48] rounded-full border-2 border-white"></span>
        </button>
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#D8F3DC] shadow-sm cursor-pointer hover:border-[#2D6A4F] transition-all">
          <img 
            src="https://ui-avatars.com/api/?name=Wijaya&background=1B4332&color=fff" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>

  )
}
