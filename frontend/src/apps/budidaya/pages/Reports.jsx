import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { 
  TrendingUp, TrendingDown, DollarSign, 
  FileText, Download, Filter, PieChart,
  Target, Activity, Package, Check
} from 'lucide-react'

export default function Reports() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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

  return (
    <div className="animate-fade-in page-content">
      {/* Premium Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="premium-icon-badge" style={{ background: '#0f172a' }}>
             <FileText size={28} />
          </div>
          <div>
             <h2 className="page-title">Analisa Keuangan & Performa</h2>
             <p className="page-sub">Evaluasi profitabilitas dan efisiensi unit produksi secara mendalam</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="btn btn-secondary"><Filter size={18} /><span>Filter Periode</span></button>
           <button className="btn btn-primary" style={{ background: '#0f172a' }}><Download size={18} /><span>Export PDF</span></button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="premium-kpi-grid stagger" style={{ marginBottom: 32 }}>
         <div className="premium-card highlight-emerald" style={{ padding: 28 }}>
            <div className="kpi-header" style={{ marginBottom: 20 }}>
               <div className="kpi-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><DollarSign size={24} /></div>
               <div className="kpi-trend positive" style={{ background: '#f0fdf4', color: '#16a34a' }}>+12.5%</div>
            </div>
            <div className="kpi-body">
               <span className="label" style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Total Pendapatan</span>
               <h3 className="value" style={{ fontSize: 28, fontWeight: 950, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Rp {(stats.total_revenue || 0).toLocaleString()}
               </h3>
            </div>
         </div>

         <div className="premium-card highlight-red" style={{ padding: 28 }}>
            <div className="kpi-header" style={{ marginBottom: 20 }}>
               <div className="kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><TrendingDown size={24} /></div>
               <div className="kpi-trend negative" style={{ background: '#fef2f2', color: '#dc2626' }}>-4.2%</div>
            </div>
            <div className="kpi-body">
               <span className="label" style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Total Pengeluaran</span>
               <h3 className="value" style={{ fontSize: 28, fontWeight: 950, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Rp {(stats.total_expenses || 0).toLocaleString()}
               </h3>
            </div>
         </div>

         <div className="premium-card highlight-blue" style={{ padding: 28 }}>
            <div className="kpi-header" style={{ marginBottom: 20 }}>
               <div className="kpi-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}><Target size={24} /></div>
               <div className="kpi-trend neutral" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>Sehat</div>
            </div>
            <div className="kpi-body">
               <span className="label" style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Laba Bersih Estimasi</span>
               <h3 className="value" style={{ fontSize: 28, fontWeight: 950, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Rp {(stats.net_profit || 0).toLocaleString()}
               </h3>
            </div>
         </div>
      </div>

      {/* Analytics & Cost Structure */}
      <div className="grid-2 gap-6">
         <div className="premium-card">
            <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-3">
                  <Activity size={20} color="#10b981" />
                  <h3 className="premium-title-900" style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Efisiensi Teknis & KPI Budidaya</h3>
               </div>
               <span className="badge badge-gray">Live Data</span>
            </div>
            
            <div className="flex flex-col gap-8">
               <div className="kpi-row">
                  <div className="flex justify-between items-end mb-2">
                     <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)' }}>Feed Conversion Ratio (FCR)</span>
                     <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)' }}>1.2 <small style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>/ Target 1.1</small></span>
                  </div>
                  <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: '85%', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
                  </div>
               </div>

               <div className="kpi-row">
                  <div className="flex justify-between items-end mb-2">
                     <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)' }}>Survival Rate (SR)</span>
                     <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)' }}>94.2% <small style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>/ Target 90%</small></span>
                  </div>
                  <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: '94%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                  </div>
               </div>

               <div className="kpi-row">
                  <div className="flex justify-between items-end mb-2">
                     <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)' }}>Avg Daily Gain (ADG)</span>
                     <span style={{ fontSize: 18, fontWeight: 950, color: 'var(--text-primary)' }}>0.35g <small style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6 }}>/ Target 0.4g</small></span>
                  </div>
                  <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: '70%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></div>
                  </div>
               </div>
            </div>
         </div>

         <div className="premium-card">
            <div className="flex items-center gap-3 mb-10">
               <PieChart size={20} color="#3b82f6" />
               <h3 className="premium-title-900" style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Struktur Biaya Operasional</h3>
            </div>
            
            <div className="flex flex-col gap-4">
               {[
                  { label: 'Pakan Pekat', pct: '70%', color: '#10b981' },
                  { label: 'Pengadaan Benih', pct: '15%', color: '#3b82f6' },
                  { label: 'Listrik & Air', pct: '10%', color: '#fbbf24' },
                  { label: 'Suplemen/Lainnya', pct: '5%', color: '#ef4444' }
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
                     <div style={{ width: 10, height: 10, borderRadius: 5, background: item.color }}></div>
                     <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)' }}>{item.label}</span>
                     <span style={{ fontSize: 15, fontWeight: 950, color: 'var(--text-primary)' }}>{item.pct}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <style>{`
         .premium-icon-badge { width: 56px; height: 56px; border-radius: 18px; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
         .kpi-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
         .kpi-trend { font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 40px; }
      `}</style>
    </div>
  )
}
