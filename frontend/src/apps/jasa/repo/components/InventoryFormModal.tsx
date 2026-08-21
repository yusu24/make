import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { JasaSparepart } from '../types';
import { jasaApi } from '../services/jasaApi';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sparepart?: JasaSparepart | null;
  settings?: any;
  onSuccess: () => void;
  addToast: (type: 'success'|'error', title: string, message: string) => void;
}

export const InventoryFormModal: React.FC<InventoryFormModalProps> = ({ 
  isOpen, 
  onClose, 
  sparepart,
  settings,
  onSuccess,
  addToast 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<JasaSparepart>>({
    item_code: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    unit: 'Pcs',
    min_stock_alert: 5
  });

  useEffect(() => {
    if (sparepart) {
      setFormData(sparepart);
    } else {
      setFormData({
        item_code: `SP-${Math.floor(Math.random() * 10000)}`,
        name: '',
        category: 'Suku Cadang',
        price: 0,
        stock: 0,
        unit: 'Pcs',
        min_stock_alert: 5
      });
    }
  }, [sparepart, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (sparepart?.id) {
        await jasaApi.updateInventory(sparepart.id, formData);
        addToast('success', 'Berhasil', 'Data sparepart berhasil diperbarui.');
      } else {
        await jasaApi.storeInventory(formData);
        addToast('success', 'Berhasil', 'Sparepart baru berhasil ditambahkan.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inventoryCategorySuggestions = settings?.inventory_categories?.length > 0
    ? settings.inventory_categories
    : [
        'Suku Cadang',
        'Oli & Pelumas',
        'Material Khusus',
        'Perlengkapan Cuci',
        'Alat/Tools'
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">
            {sparepart ? 'Edit Sparepart' : 'Tambah Sparepart Baru'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="sparepartForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Kode Barang</label>
                <input 
                  required
                  type="text" 
                  value={formData.item_code}
                  onChange={e => setFormData({...formData, item_code: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <select 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Pilih Kategori...</option>
                  {inventoryCategorySuggestions.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nama Barang</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Oli Mesin 1L"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Harga (Rp)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Satuan</label>
                <input 
                  required
                  type="text" 
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Pcs, Botol, Unit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Stok Saat Ini</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Batas Alert Stok <AlertTriangle className="w-3 h-3 text-amber-500"/>
                </label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.min_stock_alert}
                  onChange={e => setFormData({...formData, min_stock_alert: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="sparepartForm"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

      </div>
    </div>
  );
};
