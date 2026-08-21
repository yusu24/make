import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface ServiceCatalogFormModalProps {
  catalogItem?: any;
  settings?: any;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export const ServiceCatalogFormModal: React.FC<ServiceCatalogFormModalProps> = ({
  catalogItem,
  settings,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Pemeliharaan Berkala (Preventive)',
    description: '',
    basePrice: 0,
    estimatedDurationHours: 1,
    warrantyDays: 0,
    requiredSkillLevel: 'Madya',
    recommendedParts: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (catalogItem) {
      setFormData({
        code: catalogItem.code || '',
        name: catalogItem.name || '',
        category: catalogItem.category || '',
        description: catalogItem.description || '',
        basePrice: catalogItem.basePrice || 0,
        estimatedDurationHours: catalogItem.estimatedDurationHours || 1,
        warrantyDays: catalogItem.warrantyDays || 0,
        requiredSkillLevel: catalogItem.requiredSkillLevel || 'Madya',
        recommendedParts: catalogItem.recommendedParts || []
      });
    }
  }, [catalogItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
      setIsSubmitting(false);
    }
  };

  // Provide some default suggestions if there's no existing category
  const categorySuggestions = settings?.service_categories?.length > 0 
    ? settings.service_categories 
    : [
        'Pemeliharaan Berkala',
        'Perbaikan',
        'Instalasi',
        'Lainnya'
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {catalogItem ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="catalog-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kode Layanan</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                  placeholder="Misal: SRV-001"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Layanan</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Nama layanan / jasa..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kategori Layanan</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="" disabled>Pilih Kategori...</option>
                  {categorySuggestions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Level Skill Teknisi</label>
                <select
                  value={formData.requiredSkillLevel}
                  onChange={(e) => setFormData({...formData, requiredSkillLevel: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Junior">Junior</option>
                  <option value="Madya">Madya</option>
                  <option value="Senior">Senior</option>
                  <option value="Spesialis Ahli">Spesialis Ahli</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Deskripsi</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Penjelasan layanan ini..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tarif Dasar (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Estimasi Waktu (Jam)</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={formData.estimatedDurationHours}
                  onChange={(e) => setFormData({...formData, estimatedDurationHours: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Garansi (Hari)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.warrantyDays}
                  onChange={(e) => setFormData({...formData, warrantyDays: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="catalog-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
          </button>
        </div>
      </div>
    </div>
  );
};
