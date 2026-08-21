import React, { useState, useEffect } from 'react';
import { X, Clock, User, ArrowRight, Trash2 } from 'lucide-react';
import { api } from '../../../../lib/api';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

export default function HoldBillModal({ onClose, onRestore }) {
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHolds = async () => {
    try {
      const res = await api.get('/retail/hold-transactions');
      setHolds(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pesanan tersimpan ini?')) return;
    try {
      await api.delete(`/retail/hold-transactions/${id}`);
      setHolds(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Pesanan Tersimpan
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Memuat pesanan...</div>
          ) : holds.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Clock size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Belum ada pesanan yang tersimpan.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {holds.map(hold => (
                <div key={hold.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-amber-300 transition-colors bg-slate-50 hover:bg-white group">
                  <div>
                    <h3 className="font-bold text-slate-800">{hold.reference_name}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock size={12}/> {new Date(hold.created_at).toLocaleString('id-ID')}</span>
                      {hold.customer && <span className="flex items-center gap-1"><User size={12}/> {hold.customer.name}</span>}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mt-2">
                      {fmtRp(hold.total_amount)} <span className="text-xs text-slate-400 font-normal">({hold.cart_data.length} item)</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(hold.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => onRestore(hold)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm flex items-center gap-2"
                    >
                      Buka <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
