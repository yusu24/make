import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export default function CustomerReport() {
  const [data, setData] = useState({ top_customers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/retail/reports')
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Laporan Pelanggan & Loyalitas</h2>
          <p className="page-sub">Analisis kontribusi belanja dan frekuensi kunjungan pelanggan.</p>
        </div>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Loyalitas & Top Spenders</h3>
          </div>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-800 text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
             {data.top_customers.length} Customers Analyzed
          </span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6">Nama Pelanggan</th>
              <th>No. HP</th>
              <th className="text-center">Frekuensi Belanja</th>
              <th className="text-right">Total Kontribusi</th>
              <th className="text-right pr-6">Rata-rata Order</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-800">Menghitung Loyalitas...</td></tr>
            ) : data.top_customers.length === 0 ? (
               <tr><td colSpan="5" style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Belum ada data pelanggan yang melakukan transaksi di POS.</td></tr>
            ) : (
              data.top_customers.map(tc => (
                <tr key={tc.customer_id}>
                  <td className="pl-6">
                    <span className="text-slate-800">{tc.customer?.name || 'Umum'}</span>
                  </td>
                  <td>
                    <span className="text-slate-500">{tc.customer?.contact || '-'}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-gray">{tc.visit_count}x Visit</span>
                  </td>
                  <td className="text-right">
                    <span className="text-primary-600">Rp {Number(tc.total_spent).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right pr-6">
                    <span className="text-slate-600">Rp {Math.round(tc.total_spent / tc.visit_count).toLocaleString('id-ID')}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px dashed var(--border-color)' }}>
        <p style={{ margin: 0, fontSize: 13, color:'var(--text-muted)', textAlign:'center' }}>
          💡 Tip: Gunakan data ini untuk memberikan diskon khusus atau reward kepada Top Spenders Anda agar mereka semakin loyal.
        </p>
      </div>
    </div>
  );
}
