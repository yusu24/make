import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { PackageOpen, Calendar, Search } from 'lucide-react';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import '../retail.css';

export default function Consignment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const fetchConsignment = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/reports/consignment', {
        params: { startDate, endDate }
      });
      setData(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignment();
  }, [startDate, endDate]);

  const filteredData = data.map(supplier => {
    const filteredProducts = supplier.products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      supplier.supplier_name.toLowerCase().includes(search.toLowerCase())
    );
    return { ...supplier, products: filteredProducts };
  }).filter(supplier => supplier.products.length > 0);

  const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

  return (
    <div className="retail-page-classic">
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
      </div>
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)', flexWrap: 'wrap' }}>
           <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
             <input 
               placeholder="Cari Supplier / Produk..."
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                 type="date" 
                 className="form-input" 
                 style={{ width: 'auto', margin: 0, padding: '8px 12px' }}
                 value={startDate} 
                 onChange={e => setStartDate(e.target.value)} 
              />
              <span className="text-slate-400">-</span>
              <input 
                 type="date" 
                 className="form-input" 
                 style={{ width: 'auto', margin: 0, padding: '8px 12px' }}
                 value={endDate} 
                 onChange={e => setEndDate(e.target.value)} 
              />
           </div>
        </div>

        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Supplier</th>
                <th className="retail-table-header">Produk</th>
                <th className="retail-table-header">SKU</th>
                <th className="retail-table-header text-center">Terjual</th>
                <th className="retail-table-header text-right">Harga Beli (Modal)</th>
                <th className="pr-6 retail-table-header text-right">Total Tagihan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <RetailTableLoadingRow colSpan={6} text="Memuat laporan konsinyasi..." />
              ) : filteredData.length === 0 ? (
                <tr>
                   <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                      {search ? 'Tidak ada data konsinyasi yang cocok dengan pencarian.' : 'Belum ada data penjualan barang konsinyasi pada periode ini.'}
                   </td>
                </tr>
              ) : (
                filteredData.map(supplier => (
                  <React.Fragment key={supplier.supplier_id}>
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan="5" className="pl-6 py-2 font-bold text-slate-800 text-xs">
                        {supplier.supplier_name}
                      </td>
                      <td className="pr-6 py-2 font-bold text-right text-slate-800 text-xs">
                        {formatRp(supplier.products.reduce((sum, p) => sum + p.total_payable, 0))}
                      </td>
                    </tr>
                    {supplier.products.map(p => (
                      <tr key={p.product_id}>
                        <td className="pl-6"></td>
                        <td>
                          <span className="retail-text-primary font-medium">{p.name}</span>
                        </td>
                        <td>
                          <code className="retail-text-secondary uppercase tracking-wider">{p.sku}</code>
                        </td>
                        <td className="text-center">
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-semibold border border-emerald-100">
                            {p.qty}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="retail-text-secondary text-xs">{formatRp(p.cost_price)}</span>
                        </td>
                        <td className="pr-6 text-right font-semibold text-purple-700">
                          {formatRp(p.total_payable)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
