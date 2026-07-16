import React, { useState, useEffect } from 'react';
import '../retail.css';
import { api } from '../../../lib/api';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

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
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-end items-center gap-6">
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg retail-label" style={{ fontSize: 11, fontWeight: 400, textTransform: 'none' }}>
             {data.top_customers.length} customers analyzed
          </span>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Nama Pelanggan</th>
              <th className="retail-table-header">No. HP</th>
              <th className="text-center retail-table-header">Frekuensi Belanja</th>
              <th className="text-right retail-table-header">Total Kontribusi</th>
              <th className="text-right pr-6 retail-table-header">Rata-rata Order</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <RetailTableLoadingRow colSpan={5} text="Menghitung Loyalitas..." />
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
        </table></div>
      </div>

      <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px dashed var(--border-color)' }}>
        <p style={{ margin: 0, fontSize: 13, color:'var(--text-muted)', textAlign:'center' }}>
          💡 Tip: Gunakan data ini untuk memberikan diskon khusus atau reward kepada Top Spenders Anda agar mereka semakin loyal.
        </p>
      </div>
    </div>
  );
}
