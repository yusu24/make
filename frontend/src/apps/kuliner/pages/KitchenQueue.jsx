import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Bell, Check, ArrowRight } from '@/constants/icons';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import './KulinerDashboard.css';

// Web Audio API Synthesized Chime (Zero External Asset Dependency)
const playKitchenChime = (type = 'new_order') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'new_order') {
      // Pleasant dual-tone bell chime (Ding-Dong: E5 -> G5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } else if (type === 'ready') {
      // Cheerful triplet chime (C6 -> E6 -> G6)
      const now = ctx.currentTime;
      [1046.5, 1318.5, 1567.98].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.25, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    }
  } catch (err) {
    console.warn('Audio alert error:', err);
  }
};

export default function KitchenQueue() {
  const { t } = useTranslation();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Column definitions with localized labels
  const columns = [
    { key: 'waiting', label: t('kulinerOrders.tabNew') || 'Menunggu', statuses: ['pending', 'waiting'], color: '#f59e0b', next: 'cooking' },
    { key: 'cooking', label: t('kulinerOrders.tabProcess') || 'Diproses', statuses: ['processing', 'cooking'], color: '#3b82f6', next: 'ready' },
    { key: 'ready', label: t('kulinerOrders.tabReady') || 'Siap', statuses: ['ready'], color: '#10b981', next: 'served' },
  ];
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const timerRef = useRef(null);
  const prevOrdersRef = useRef([]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/kuliner/admin/kitchen-queue');
      const newOrders = res.data || [];

      // Detect new incoming waiting orders
      if (silent && prevOrdersRef.current.length > 0 && soundEnabled) {
        const prevIds = new Set(prevOrdersRef.current.map((o) => o.id));
        const hasNewOrder = newOrders.some(
          (o) => !prevIds.has(o.id) && ['pending', 'waiting'].includes(o.status)
        );
        if (hasNewOrder) {
          playKitchenChime('new_order');
          toast.success('Pesanan baru masuk ke dapur!');
        }
      }

      prevOrdersRef.current = newOrders;
      setOrders(newOrders);
    } catch {
      // silent — auto-refresh shouldn't spam errors
    } finally {
      setLoading(false);
    }
  }, [soundEnabled, toast]);

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
      if (nextStatus === 'ready' && soundEnabled) {
        playKitchenChime('ready');
      }
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
      <div className="kd-content">
        <div className="flex justify-end items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              playKitchenChime('new_order');
              toast.info('Uji bunyi notifikasi dapur');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Tes Suara Notifikasi"
          >
            <Bell size={14} className="text-[#b48c36]" />
            <span>Tes Audio</span>
          </button>
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
              soundEnabled
                ? 'bg-amber-500/10 text-[#b48c36] border-amber-500/30'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
            title={soundEnabled ? 'Matikan Suara Otomatis' : 'Aktifkan Suara Otomatis'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {columns.map((col) => {
            const list = orders.filter((o) => col.statuses.includes(o.status));
            return (
              <div key={col.key} className="kd-panel" style={{ background: '#f8fafc', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col.label}</span>
                  </div>
                  <span className="kd-badge" style={{ background: '#e2e8f0', color: '#475569' }}>{list.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loading ? (
                    <div className="flex flex-col gap-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 animate-pulse">
                          <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
                          <div className="h-2 bg-slate-100 rounded w-1/3" />
                        </div>
                      ))}
                    </div>
                  ) : list.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 12 }}>
                      Tidak ada pesanan
                    </div>
                  ) : (
                    list.map((o) => (
                      <div
                        key={o.id}
                        style={{
                          background: '#fff', border: `1px solid ${col.color}33`, borderRadius: 14,
                          padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{o.customer_name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>#{o.order_number || o.id} · {o.table_number ? `Meja ${o.table_number}` : o.order_type}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: minutesAgo(o.created_at) > 15 ? '#ef4444' : '#94a3b8' }}>
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
                          {updatingId === o.id ? (
                            'Memproses...'
                          ) : col.key === 'ready' ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Check size={15} /> Tandai Selesai
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              Lanjut ke tahap berikutnya <ArrowRight size={15} />
                            </span>
                          )}
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
