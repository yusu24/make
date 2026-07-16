import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import './KulinerDashboard.css';

const TABS = [
  { key: 'pl', label: 'Laba Rugi' },
  { key: 'margin', label: 'Margin Menu' },
  { key: 'best', label: 'Best Seller' },
  { key: 'worst', label: 'Worst Seller' },
];

const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;
const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

export default function KulinerReports() {
  const [tab, setTab] = useState('pl');
  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [loading, setLoading] = useState(true);
  const [pl, setPl] = useState(null);
  const [margin, setMargin] = useState([]);
  const [best, setBest] = useState([]);
  const [worst, setWorst] = useState([]);

  const load = async () => {
    setLoading(true);
    const params = { date_from: dateFrom, date_to: dateTo };
    try {
      const [plRes, marginRes, bestRes, worstRes] = await Promise.all([
        api.get('/kuliner/admin/reports/profit-loss', { params }),
        api.get('/kuliner/admin/reports/menu-margin', { params }),
        api.get('/kuliner/admin/reports/best-sellers', { params }),
        api.get('/kuliner/admin/reports/worst-sellers', { params }),
      ]);
      setPl(plRes.data);
      setMargin(marginRes.data);
      setBest(bestRes.data);
      setWorst(worstRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Laporan Lanjutan</h1>
      </div>
      <div className="kd-content">
        <div className="kd-panel" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="kd-form-group" style={{ marginBottom: 0 }}>
              <label className="kd-form-label">Tanggal Awal</label>
              <input type="date" className="kd-form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="kd-form-group" style={{ marginBottom: 0 }}>
              <label className="kd-form-label">Tanggal Akhir</label>
              <input type="date" className="kd-form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="kd-form-group" style={{ marginBottom: 0 }}>
              <label className="kd-form-label">Kasir</label>
              <select className="kd-form-select" disabled title="Fitur multi-kasir/cabang belum tersedia di aplikasi ini">
                <option>Semua Kasir</option>
              </select>
            </div>
            <button className="kd-btn kd-btn-primary" onClick={load} disabled={loading}>{loading ? 'Memuat...' : 'Terapkan Filter'}</button>
          </div>
        </div>

        <div className="kd-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {TABS.map((t) => (
            <button key={t.key} className={`kd-btn ${tab === t.key ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'pl' && (
          <div className="kd-stats-grid">
            <div className="kd-stat-card">
              <div className="kd-stat-header"><span className="kd-stat-label">Pendapatan</span></div>
              <div className="kd-stat-value">{formatRp(pl?.revenue)}</div>
            </div>
            <div className="kd-stat-card">
              <div className="kd-stat-header"><span className="kd-stat-label">HPP (Cost of Goods)</span></div>
              <div className="kd-stat-value">{formatRp(pl?.cogs)}</div>
            </div>
            <div className="kd-stat-card">
              <div className="kd-stat-header"><span className="kd-stat-label">Laba Kotor</span></div>
              <div className="kd-stat-value">{formatRp(pl?.gross_profit)}</div>
            </div>
            <div className="kd-stat-card">
              <div className="kd-stat-header"><span className="kd-stat-label">Beban Operasional</span></div>
              <div className="kd-stat-value">{formatRp(pl?.expenses)}</div>
            </div>
            <div className="kd-stat-card">
              <div className="kd-stat-header"><span className="kd-stat-label">Laba Bersih</span></div>
              <div className="kd-stat-value" style={{ color: (pl?.net_profit || 0) >= 0 ? '#10b981' : '#ef4444' }}>{formatRp(pl?.net_profit)}</div>
            </div>
            <div className="kd-stat-card">
              <div className="kd-stat-header"><span className="kd-stat-label">Jumlah Pesanan Selesai</span></div>
              <div className="kd-stat-value">{pl?.order_count || 0}</div>
            </div>
          </div>
        )}

        {tab === 'margin' && (
          <div className="kd-panel">
            <div className="kd-table-container" style={{ overflowX: 'auto' }}>
              <table className="kd-table">
                <thead>
                  <tr><th>Menu</th><th>Terjual</th><th>Pendapatan</th><th>HPP</th><th>Margin</th><th>Margin %</th></tr>
                </thead>
                <tbody>
                  {margin.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-slate-400">Tidak ada data pada periode ini.</td></tr>
                  ) : margin.map((m) => (
                    <tr key={m.product_id}>
                      <td>{m.product_name}</td>
                      <td>{m.qty_sold}</td>
                      <td>{formatRp(m.revenue)}</td>
                      <td>{formatRp(m.cogs)}</td>
                      <td style={{ color: m.margin >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{formatRp(m.margin)}</td>
                      <td>{m.margin_pct !== null ? `${m.margin_pct}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(tab === 'best' || tab === 'worst') && (
          <div className="kd-panel">
            <div className="kd-table-container" style={{ overflowX: 'auto' }}>
              <table className="kd-table">
                <thead>
                  <tr><th>Menu</th><th>Qty Terjual</th><th>Pendapatan</th></tr>
                </thead>
                <tbody>
                  {(tab === 'best' ? best : worst).length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-slate-400">Tidak ada data pada periode ini.</td></tr>
                  ) : (tab === 'best' ? best : worst).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.name}</td>
                      <td>{row.qty_sold}</td>
                      <td>{formatRp(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </KulinerAdminLayout>
  );
}
