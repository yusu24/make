import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import '../budidaya.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_ponds: 0,
    active_ponds: 0,
    active_cycles: 0,
    total_revenue: 0,
    revenue_trend: [],
    total_expenses: 0,
    net_profit: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/dashboard/stats')
      setStats(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <div className="w-12 h-12 border-4 border-[#1B4332]/10 border-t-[#1B4332] rounded-full animate-spin"></div>
       <p className="mt-4 text-[#1B4332] font-semibold">Menganalisis Performa Farm...</p>
    </div>
  )

  return (
    <div className="p-6 lg:p-10 space-y-10 w-full overflow-hidden">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1C1A]">Halo, Bpk. Wijaya</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Sistem berjalan optimal. Berikut ringkasan budidaya Anda hari ini.</p>
        </div>
        <button className="bg-[#1B4332] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#1B4332]/10 text-sm shrink-0">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Kolam Baru
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <div className="aquagrow-card p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="kpi-icon-box bg-[#D1FAE5] text-[#059669]">
              <span className="material-symbols-outlined">waves</span>
            </div>
            <span className="bg-[#D1FAE5] text-[#059669] text-[9px] px-2 py-0.5 rounded-full font-black uppercase">AKTIF</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL KOLAM</p>
          <h3 className="text-3xl font-black text-[#1A1C1A] mt-1">{stats.total_ponds || 12}</h3>
          <p className="text-[11px] text-[#059669] font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> 2 Kolam baru
          </p>
        </div>

        <div className="aquagrow-card p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="kpi-icon-box bg-[#FFE4E6] text-[#E11D48]">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="bg-[#FFE4E6] text-[#E11D48] text-[9px] px-2 py-0.5 rounded-full font-black uppercase">PERINGATAN</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BUTUH PERHATIAN</p>
          <h3 className="text-3xl font-black text-[#1A1C1A] mt-1">02</h3>
          <p className="text-[11px] text-[#E11D48] font-bold mt-2">Oksigen Rendah (Kolam B3)</p>
        </div>

        <div className="aquagrow-card p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="kpi-icon-box bg-[#ECFDF5] text-[#10B981]">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JADWAL PAKAN</p>
          <h3 className="text-3xl font-black text-[#1A1C1A] mt-1">16:30</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-2">Pakan Protein Tinggi</p>
        </div>

        <div className="aquagrow-card p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="kpi-icon-box bg-[#E0F2FE] text-[#0EA5E9]">
              <span className="material-symbols-outlined">thermostat</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SUHU AIR RATA-RATA</p>
          <h3 className="text-3xl font-black text-[#1A1C1A] mt-1">28.5°C</h3>
          <p className="text-[11px] text-[#059669] font-bold mt-2">Kondisi Ideal</p>
        </div>
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 aquagrow-card p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#1A1C1A]">Grafik Pertumbuhan Ikan</h3>
              <p className="text-xs text-slate-400 font-medium">Kenaikan berat rata-rata (gram) per minggu</p>
            </div>
            <div className="flex gap-2 p-1 bg-[#F1F5F9] rounded-lg">
               <button className="text-[10px] font-black px-3 py-1 rounded-md bg-white shadow-sm text-[#1B4332]">3B</button>
               <button className="text-[10px] font-black px-3 py-1 rounded-md text-slate-400">6B</button>
            </div>
          </div>
          
          <div className="h-[240px] w-full flex items-end justify-around gap-2 pb-2">
             {[1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="w-12 flex flex-col items-center group h-full justify-end">
                 <div className="w-full bg-[#F1F5F9] rounded-t-lg group-hover:bg-[#1B4332]/20" style={{ height: `${20 + (i * 12)}%` }}></div>
                 <span className="text-[9px] font-bold text-slate-400 mt-3 uppercase">MGG {i}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="aquagrow-card p-6 md:p-8 flex flex-col">
          <h3 className="text-lg font-bold text-[#1A1C1A] mb-6">Notifikasi Cepat</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 bg-[#D1FAE5] rounded-full flex items-center justify-center text-[#059669]"><span className="material-symbols-outlined text-[18px]">water_drop</span></div>
              <div>
                <p className="text-sm font-bold text-[#1A1C1A]">Penggantian Air Selesai</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kolam A1 mencapai level target.</p>
                <p className="text-[9px] text-slate-400 mt-1 uppercase font-black">10 Menit lalu</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 bg-red-50 rounded-xl border-l-4 border-red-500">
              <div className="h-10 w-10 shrink-0 bg-white rounded-full flex items-center justify-center text-red-500"><span className="material-symbols-outlined text-[18px]">bolt</span></div>
              <div>
                <p className="text-sm font-bold text-red-900">Gagal Pompa Udara</p>
                <p className="text-[11px] text-red-700 font-medium">Periksa listrik Kolam B3!</p>
                <p className="text-[9px] text-red-400 mt-1 uppercase font-black">2 Jam lalu</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 bg-[#ECFDF5] rounded-full flex items-center justify-center text-[#10B981]"><span className="material-symbols-outlined text-[18px]">inventory_2</span></div>
              <div>
                <p className="text-sm font-bold text-[#1A1C1A]">Stok Pakan Menipis</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tersisa 5kg untuk Pakan Benih.</p>
                <p className="text-[9px] text-slate-400 mt-1 uppercase font-black">5 Jam lalu</p>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-3 border border-[#1B4332]/20 text-[#1B4332] font-bold rounded-xl text-xs hover:bg-slate-50 transition-all">Kelola Alert</button>
        </div>
      </div>

      {/* Ponds Status */}
      <div className="space-y-6 w-full">
        <h3 className="text-xl font-bold text-[#1A1C1A]">Status Kolam Unggulan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="aquagrow-card flex flex-col sm:flex-row h-auto sm:h-40 w-full">
             <img className="w-full sm:w-40 h-32 sm:h-full object-cover" src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=400&q=80" alt="Pond A1" />
             <div className="p-5 flex-1 flex flex-col justify-between">
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className="text-sm font-bold text-[#1A1C1A]">Kolam A1 - Pembesaran Nila</h4>
                   <p className="text-[11px] text-slate-400 font-medium mt-0.5">Populasi: 2000 Ekor</p>
                 </div>
                 <span className="bg-[#D1FAE5] text-[#059669] text-[9px] px-2 py-0.5 rounded-full font-black uppercase">SEHAT</span>
               </div>
               <div className="flex justify-between pt-4 border-t border-slate-50 mt-4">
                 <div className="text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">pH</p><p className="text-xs font-black text-[#1A1C1A]">7.2</p></div>
                 <div className="text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">O2</p><p className="text-xs font-black text-[#1A1C1A]">6.5</p></div>
                 <div className="text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">Ammonia</p><p className="text-xs font-black text-[#1A1C1A]">0.01</p></div>
               </div>
             </div>
          </div>
          <div className="aquagrow-card flex flex-col sm:flex-row h-auto sm:h-40 w-full border-l-4 border-l-red-500">
             <img className="w-full sm:w-40 h-32 sm:h-full object-cover" src="https://images.unsplash.com/photo-1551631553-62c589083321?w=400&q=80" alt="Pond B3" />
             <div className="p-5 flex-1 flex flex-col justify-between">
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className="text-sm font-bold text-[#1A1C1A]">Kolam B3 - Pemijahan Gurame</h4>
                   <p className="text-[11px] text-slate-400 font-medium mt-0.5">Populasi: 500 Ekor</p>
                 </div>
                 <span className="bg-red-50 text-red-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">PERHATIAN</span>
               </div>
               <div className="flex justify-between pt-4 border-t border-slate-50 mt-4">
                 <div className="text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">pH</p><p className="text-xs font-black text-[#1A1C1A]">6.8</p></div>
                 <div className="text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">O2</p><p className="text-xs font-black text-red-500">3.2</p></div>
                 <div className="text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">Ammonia</p><p className="text-xs font-black text-[#1A1C1A]">0.05</p></div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <footer className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 pb-6">
        <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#1B4332] rounded flex items-center justify-center text-white text-[8px] font-black">A</div><span className="font-bold text-[10px] text-[#1B4332]">AquaGrow v2.4.0</span></div>
        <div className="flex gap-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Support</a></div>
        <div className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">© 2024 AquaGrow.</div>
      </footer>
    </div>
  )
}




