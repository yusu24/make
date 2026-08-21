import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Search, Trash2, ArrowRightLeft } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Skeleton from '../../../components/Skeleton';
import Modal from '../../../components/Modal';

export default function CashTransfers() {
  const { user } = useAuth();
  const toast = useToast();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    transfer_date: new Date().toISOString().split('T')[0],
    from_method: 'Tunai',
    to_method: 'Transfer Bank',
    amount: '',
    note: ''
  });

  // Feature Gating
  const demoEmails = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','seller@demo.com'];
  const isDemo = user?.email?.startsWith('demo-sandbox-') || user?.email?.startsWith('demo-kuliner-') || demoEmails.includes(user?.email);
  const isPro = user?.subscription_plan === 'pro' || isDemo;

  useEffect(() => {
    if (isPro) fetchTransfers();
    else setLoading(false);
  }, [isPro]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/retail/finance/transfers');
      setTransfers(res.data);
    } catch (err) {
      toast.error('Gagal memuat mutasi kas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/retail/finance/transfers', formData);
      toast.success('Mutasi kas berhasil disimpan');
      setIsModalOpen(false);
      setFormData({
        transfer_date: new Date().toISOString().split('T')[0],
        from_method: 'Tunai',
        to_method: 'Transfer Bank',
        amount: '',
        note: ''
      });
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan mutasi kas');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus mutasi kas ini?')) return;
    try {
      await api.delete(`/retail/finance/transfers/${id}`);
      toast.success('Mutasi kas dihapus');
      fetchTransfers();
    } catch (err) {
      toast.error('Gagal menghapus mutasi kas');
    }
  };

  if (!isPro) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center mt-20">
        <ArrowRightLeft size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Fitur Mutasi Kas (Pro)</h2>
        <p className="text-gray-500 mb-6">Upgrade paket Anda ke Pro untuk membuka fitur Mutasi Kas antar metode pembayaran atau rekening bank.</p>
        <button onClick={() => window.location.href='/retail/subscription'} className="btn btn-primary">
          Upgrade Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="flex justify-end items-center mb-6">
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Tambah Mutasi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Tanggal</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Dari Akun</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Ke Akun</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nominal</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Keterangan</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="p-4"><Skeleton width={80} /></td>
                  <td className="p-4"><Skeleton width={120} /></td>
                  <td className="p-4"><Skeleton width={120} /></td>
                  <td className="p-4"><Skeleton width={100} /></td>
                  <td className="p-4"><Skeleton width={150} /></td>
                  <td className="p-4 text-right"><Skeleton width={40} /></td>
                </tr>
              ))
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Belum ada mutasi kas.
                </td>
              </tr>
            ) : (
              transfers.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-sm">{t.transfer_date}</td>
                  <td className="p-4 text-sm font-medium text-red-600">{t.from_method}</td>
                  <td className="p-4 text-sm font-medium text-green-600">{t.to_method}</td>
                  <td className="p-4 text-sm font-medium">Rp {Number(t.amount).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-sm text-gray-500">{t.note || '-'}</td>
                  <td className="p-4 text-sm text-right">
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Mutasi Kas">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" required value={formData.transfer_date} onChange={e => setFormData({...formData, transfer_date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Akun (Sumber)</label>
              <select value={formData.from_method} onChange={e => setFormData({...formData, from_method: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Tunai">Tunai</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Kartu Debit">Kartu Debit</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="QRIS">QRIS</option>
                <option value="E-Wallet">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ke Akun (Tujuan)</label>
              <select value={formData.to_method} onChange={e => setFormData({...formData, to_method: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tunai">Tunai</option>
                <option value="Kartu Debit">Kartu Debit</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="QRIS">QRIS</option>
                <option value="E-Wallet">E-Wallet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
            <input type="number" required min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
            <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" rows="2" placeholder="Cth: Setor tunai hasil shift pagi ke BCA"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Mutasi</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
