import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export default function ProductReport() {
  const [data, setData] = useState({ top_products: [], low_stock: [] });
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
          <h2 className="page-title">Analisis Produk & Inventori</h2>
          <p className="page-sub">Monitoring performa penjualan barang dan manajemen ambang stok.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Produk Paling Laris (Sales Volume)</h3>
          </div>
          <div style={{ padding: 20 }}>
            {loading ? <p>Menganalisa...</p> : (
              <table className="table">
                <thead><tr><th>Nama Barang</th><th>Total Terjual</th><th style={{textAlign:'right'}}>Peringkat</th></tr></thead>
                <tbody>
                  {data.top_products.map((tp, i) => (
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{tp.product?.name}</td>
                      <td>{tp.total_qty} {tp.product?.unit}</td>
                      <td style={{textAlign:'right'}}><span className="badge badge-green">Top {i+1}</span></td>
                    </tr>
                  ))}
                  {data.top_products.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', padding:20, color:'var(--text-muted)'}}>Belum ada data penjualan.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Peringatan Stok di Bawah Batas Minimal</h3>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>Barang berikut telah mencapai atau melewati ambang batas aman yang Anda tentukan.</p>
            {loading ? <p>Mengecek gudang...</p> : (
              <table className="table">
                <thead><tr><th>Nama Barang</th><th>Sisa</th><th>Batas Min.</th><th style={{textAlign:'right'}}>Status</th></tr></thead>
                <tbody>
                  {data.low_stock.map(p => (
                    <tr key={p.id}>
                      <td style={{fontWeight:600}}>{p.name}</td>
                      <td style={{color:'var(--danger-500)', fontWeight:700}}>{p.stock}</td>
                      <td>{p.stock_min}</td>
                      <td style={{textAlign:'right'}}><span className="badge badge-red">Kritis</span></td>
                    </tr>
                  ))}
                   {data.low_stock.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:20, color:'var(--text-muted)'}}>Semua stok aman.</td></tr>}
                </tbody>
              </table>
            )}
            <button className="btn btn-secondary" style={{ width:'100%', marginTop:16 }} onClick={()=>window.location.href='/retail/inventory'}>Lihat Semua Inventori</button>
          </div>
        </div>
      </div>
    </div>
  );
}
