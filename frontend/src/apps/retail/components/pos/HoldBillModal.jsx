import React, { useState, useEffect } from 'react';
import { X, Clock, User, ArrowRight, Trash2 } from '@/constants/icons';
import { api } from '../../../../lib/api';
import { useToast } from '../../../../components/Toast';
import { useConfirm } from '../../../../components/ConfirmDialog';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

export default function HoldBillModal({ onClose, onRestore }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHolds = async () => {
    try {
      const res = await api.get('/retail/hold-transactions');
      setHolds(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  const handleDelete = async (hold) => {
    const ok = await confirm(`Hapus pesanan tersimpan "${hold.reference_name}"?`, {
      title: 'Hapus Antrean Bill',
      confirmLabel: 'Ya, Hapus',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/retail/hold-transactions/${hold.id}`);
      setHolds(prev => prev.filter(h => h.id !== hold.id));
      toast.success('Pesanan tersimpan berhasil dihapus');
    } catch (e) {
      toast.error('Gagal menghapus pesanan tersimpan');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Pesanan Tersimpan (Antrean)
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Memuat pesanan...</div>
          ) : holds.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Clock size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada pesanan yang tersimpan.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {holds.map(hold => (
                <div key={hold.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-amber-300 dark:hover:border-amber-600 transition-colors bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 group">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{hold.reference_name}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock size={12}/> {new Date(hold.created_at).toLocaleString('id-ID')}</span>
                      {hold.customer && <span className="flex items-center gap-1"><User size={12}/> {hold.customer.name}</span>}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2">
                      {fmtRp(hold.total_amount)} <span className="text-xs text-slate-400 font-normal">({hold.cart_data?.length || 0} item)</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(hold)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => onRestore(hold)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 cursor-pointer"
                    >
                      Buka <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-end shrink-0"
          style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))' }}
        >
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
