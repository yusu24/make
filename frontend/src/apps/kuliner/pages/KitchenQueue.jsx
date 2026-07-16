import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import './KulinerDashboard.css';

const COLUMNS = [
  { key: 'waiting', label: 'Menunggu', statuses: ['pending', 'waiting'], color: '#f59e0b', next: 'cooking' },
  { key: 'cooking', label: 'Diproses', statuses: ['processing', 'cooking'], color: '#3b82f6', next: 'ready' },
  { key: 'ready', label: 'Siap', statuses: ['ready'], color: '#10b981', next: 'served' },
];

export default function KitchenQueue() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const timerRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/kuliner/admin/kitchen-queue');
      setOrders(res.data);
    } catch {
      // silent — auto-refresh shouldn't spam errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(() => load(true), 5000);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const advance = async (order, nextStatus) => {
    setUpdatingId(order.id);
    try {
      await api.patch(`/kuliner/admin/orders/${order.id}/status`, { status: nextStatus });
      toast.success(`Pesanan #${order.order_number || order.id} → ${nextStatus}`);
      load(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status pesanan');
    } finally {
      setUpdatingId(null);
    }
  };

  const minutesAgo = (createdAt) => Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Kitchen Queue</h1>
      </div>
      <div className="kd-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {COLUMNS.map((col) => {
            const colOrders = orders
              .filter((o) => col.statuses.includes(o.status))
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            return (
              <div key={col.key} className="kd-panel" style={{ minHeight: 400 }}>
                <div className="kd-panel-header" style={{ borderBottom: `3px solid ${col.color}` }}>
                  <span className="kd-panel-title">{col.label}</span>
                  <span className="kd-panel-action" style={{ color: col.color, fontWeight: 800 }}>{colOrders.length}</span>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loading ? (
                    <div className="text-center text-slate-400 py-10">Memuat...</div>
                  ) : colOrders.length === 0 ? (
                    <div className="text-center text-slate-400 py-10" style={{ fontSize: 13 }}>Tidak ada pesanan</div>
                  ) : (
                    colOrders.map((o) => (
                      <div
                        key={o.id}
                        style={{
                          background: '#fff', border: `1px solid ${col.color}33`, borderRadius: 14,
                          padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15 }}>{o.customer_name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>#{o.order_number || o.id} · {o.table_number ? `Meja ${o.table_number}` : o.order_type}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: minutesAgo(o.created_at) > 15 ? '#ef4444' : '#94a3b8' }}>
                            {minutesAgo(o.created_at)} mnt
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 12 }}>
                          {(o.items || []).map((it) => (
                            <div key={it.id}>{it.qty}x {it.name}</div>
                          ))}
                        </div>
                        <button
                          className="kd-btn kd-btn-primary"
                          style={{ width: '100%', background: col.color, borderColor: col.color }}
                          disabled={updatingId === o.id}
                          onClick={() => advance(o, col.next)}
                        >
                          {updatingId === o.id ? 'Memproses...' : col.key === 'ready' ? '✓ Tandai Selesai' : '→ Lanjut ke tahap berikutnya'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </KulinerAdminLayout>
  );
}
