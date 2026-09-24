import React, { useState } from 'react';
import { X, Building2, MapPin, Hash, User, Phone, Check } from '@/constants/icons';
import api from '../../../../../services/api';
import { Warehouse } from '../../types';

interface AddWarehouseModalProps {
  onClose: () => void;
  onSuccess: (savedWarehouse: any) => void;
  warehouseToEdit?: Warehouse | null;
}

export const AddWarehouseModal: React.FC<AddWarehouseModalProps> = ({ onClose, onSuccess, warehouseToEdit }) => {
  const isEdit = !!warehouseToEdit;

  const [formData, setFormData] = useState({
    name: warehouseToEdit?.name || '',
    code: warehouseToEdit?.code || '',
    city: warehouseToEdit?.city || '',
    address: warehouseToEdit?.address || '',
    pic_name: warehouseToEdit?.picName || '',
    pic_phone: warehouseToEdit?.picPhone || '',
    is_default: warehouseToEdit?.isDefault || false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isEdit
        ? await api.put(`/seller/warehouses/${warehouseToEdit!.id}`, formData)
        : await api.post('/seller/warehouses', formData);
      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
      }
    } catch (err: any) {
      console.error('Error saving warehouse:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan gudang. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{isEdit ? 'Edit Gudang' : 'Tambah Gudang Baru'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isEdit ? 'Perbarui data lokasi gudang penyimpanan Anda.' : 'Tambahkan lokasi gudang penyimpanan Anda.'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Nama & Kode Gudang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Nama Gudang <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Gudang Utama JKT"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Kode Gudang</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Contoh: JKT-01"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Lokasi Gudang */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Kota</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Contoh: Jakarta Barat"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Alamat Lengkap</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Detail alamat gudang..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

            {/* Info Penanggung Jawab (PIC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Nama PIC</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="pic_name"
                    value={formData.pic_name}
                    onChange={handleChange}
                    placeholder="Nama penanggung jawab"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">No. HP PIC</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" 
                    name="pic_phone"
                    value={formData.pic_phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Set as Default Checkbox */}
            <div className="mt-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  name="is_default"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-5 h-5 appearance-none border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                />
                <Check className={`w-3.5 h-3.5 text-white absolute pointer-events-none transition-opacity ${formData.is_default ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              <label htmlFor="is_default" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Jadikan sebagai Gudang Utama (Default)
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div 
            className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-end gap-3 shrink-0"
            style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))' }}
          >
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                isEdit ? 'Simpan Perubahan' : 'Simpan Gudang'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
