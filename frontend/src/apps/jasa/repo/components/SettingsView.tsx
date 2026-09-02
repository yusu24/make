import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Briefcase, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { jasaApi } from '../services/jasaApi';

interface SettingsViewProps {
  settings: any;
  onRefresh: () => void;
  onLoadDummyData?: (businessType: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onRefresh, onLoadDummyData }) => {
  const [formData, setFormData] = useState({
    businessType: 'Bengkel / Servis',
    termTechnician: 'Teknisi',
    termSparepart: 'Sparepart',
    termSpk: 'SPK',
    documentPrefix: 'SRV',
    serviceCategories: 'Pemeliharaan Berkala, Perbaikan, Instalasi, Lainnya',
    technicianSpecialties: 'Teknisi Umum, Teknisi AC & Listrik, Teknisi Mesin & Otomotif, Ahli Sistem Keamanan, Spesialis IT & Jaringan',
    inventoryCategories: 'Suku Cadang, Oli & Pelumas, Material Khusus, Perlengkapan Cuci, Alat/Tools'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        businessType: settings.businessType,
        termTechnician: settings.termTechnician,
        termSparepart: settings.termSparepart,
        termSpk: settings.termSpk || 'SPK',
        documentPrefix: settings.documentPrefix || 'SRV',
        serviceCategories: settings.service_categories && settings.service_categories.length > 0 
          ? settings.service_categories.join(', ') 
          : 'Pemeliharaan Berkala, Perbaikan, Instalasi, Lainnya',
        technicianSpecialties: settings.technician_specialties && settings.technician_specialties.length > 0 
          ? settings.technician_specialties.join(', ') 
          : 'Teknisi Umum, Teknisi AC & Listrik, Teknisi Mesin & Otomotif, Ahli Sistem Keamanan, Spesialis IT & Jaringan',
        inventoryCategories: settings.inventory_categories && settings.inventory_categories.length > 0 
          ? settings.inventory_categories.join(', ') 
          : 'Suku Cadang, Oli & Pelumas, Material Khusus, Perlengkapan Cuci, Alat/Tools'
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        service_categories: formData.serviceCategories.split(',').map(s => s.trim()).filter(Boolean),
        technician_specialties: formData.technicianSpecialties.split(',').map(s => s.trim()).filter(Boolean),
        inventory_categories: formData.inventoryCategories.split(',').map(s => s.trim()).filter(Boolean),
      };
      await jasaApi.updateSettings(payload);
      setToast({ type: 'success', message: 'Pengaturan berhasil disimpan!' });
      onRefresh(); // Trigger global refresh
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Settings save error:', err.response?.data || err);
      setToast({ type: 'error', message: 'Gagal menyimpan: ' + (err.response?.data?.message || err.message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypes = [
    'Bengkel / Servis',
    'Cleaning Service',
    'Laundry',
    'Salon / Kecantikan',
    'Klinik / Terapis',
    'IT & Software House',
    'Fotografi / Event',
    'Konsultan',
    'Konstruksi / Renovasi',
    'Lainnya'
  ];

  return (
    <div className="space-y-4">

      {toast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profil Bisnis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Profil Bisnis</h2>
          </div>
          <div className="p-6">
            <div className="max-w-md space-y-2">
              <label className="text-sm font-semibold text-slate-700">Jenis Bisnis Jasa</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">
                Jenis bisnis akan mempengaruhi rekomendasi fitur AI dan analitik (BETA).
              </p>
            </div>
          </div>
        </div>

        {/* Kustomisasi Istilah */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Kustomisasi Istilah (Terminologi)</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Istilah Pekerja Lapangan
                <span className="text-xs font-normal text-slate-400">Bawaan: Teknisi</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.termTechnician}
                onChange={(e) => setFormData({...formData, termTechnician: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Misal: Terapis, Karyawan, Fotografer..."
              />
              <p className="text-[11px] text-slate-500">Akan menggantikan kata "Teknisi" di seluruh menu.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Istilah Dokumen Order
                <span className="text-xs font-normal text-slate-400">Bawaan: SPK</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.termSpk}
                onChange={(e) => setFormData({...formData, termSpk: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Misal: Booking, Order, Kontrak..."
              />
              <p className="text-[11px] text-slate-500">Singkatan/kata ganti untuk Surat Perintah Kerja.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Istilah Material / Barang
                <span className="text-xs font-normal text-slate-400">Bawaan: Sparepart</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.termSparepart}
                onChange={(e) => setFormData({...formData, termSparepart: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Misal: Material, Produk, Kosmetik..."
              />
              <p className="text-[11px] text-slate-500">Sebutan untuk barang yang dijual/dipakai di jasa.</p>
            </div>

          </div>
        </div>

        {/* Master Data Kategori */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Standarisasi Master Kategori</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kategori Layanan Jasa</label>
              <textarea
                rows={3}
                value={formData.serviceCategories}
                onChange={(e) => setFormData({...formData, serviceCategories: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                placeholder="Pisahkan dengan koma. Contoh: Cuci Ac, Servis Besar..."
              />
              <p className="text-[11px] text-slate-500">Pilihan dropdown Kategori Layanan.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Spesialisasi Teknisi</label>
              <textarea
                rows={3}
                value={formData.technicianSpecialties}
                onChange={(e) => setFormData({...formData, technicianSpecialties: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                placeholder="Pisahkan dengan koma. Contoh: Montir, IT Support..."
              />
              <p className="text-[11px] text-slate-500">Pilihan dropdown Spesialisasi Pegawai.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kategori Inventory</label>
              <textarea
                rows={3}
                value={formData.inventoryCategories}
                onChange={(e) => setFormData({...formData, inventoryCategories: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                placeholder="Pisahkan dengan koma. Contoh: Oli, Lampu, Busi..."
              />
              <p className="text-[11px] text-slate-500">Pilihan dropdown Kategori Barang/Sparepart.</p>
            </div>
          </div>
        </div>

        {/* Format Dokumen */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Format Dokumen</h2>
          </div>
          <div className="p-6">
            <div className="max-w-md space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Prefix Nomor Tiket / Dokumen Jasa
                <span className="text-xs font-normal text-slate-400">Bawaan: SRV</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.documentPrefix}
                onChange={(e) => setFormData({...formData, documentPrefix: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                placeholder="Misal: SRV, LND, BKL..."
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Contoh: <strong className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{formData.documentPrefix}-202610-001</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Section - Aligned Right */}
        <div className="w-full flex items-center justify-end gap-3 pt-4 pb-2">
          {onLoadDummyData && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Muat ulang data contoh (dummy) untuk tema ${formData.businessType}? Data Anda saat ini yang belum tersimpan mungkin akan tertimpa.`)) {
                  const bt = formData.businessType;
                  const newForm = { ...formData };
                  if (bt.includes('Laundry')) {
                    newForm.termTechnician = 'Staf Laundry';
                    newForm.termSparepart = 'Bahan Cucian';
                    newForm.termSpk = 'Order Laundry';
                    newForm.documentPrefix = 'LND';
                    newForm.serviceCategories = 'Layanan Utama, Layanan Cepat, Perawatan Khusus, Lainnya';
                    newForm.technicianSpecialties = 'Ahli Cuci & Setrika, Spesialis Noda, Driver Antar-Jemput';
                    newForm.inventoryCategories = 'Sabun / Deterjen, Pewangi, Plastik Packing, Peralatan';
                  } else if (bt.includes('Salon')) {
                    newForm.termTechnician = 'Stylist / Kapster';
                    newForm.termSparepart = 'Produk Salon';
                    newForm.termSpk = 'Booking / Reservasi';
                    newForm.documentPrefix = 'SLN';
                    newForm.serviceCategories = 'Haircut, Treatment, Coloring, Styling, Spa';
                    newForm.technicianSpecialties = 'Hair Stylist, Colorist, Nail Artist, MUA, Terapis Pijat';
                    newForm.inventoryCategories = 'Sampo / Kondisioner, Pewarna Rambut, Cream Spa, Alat Styling';
                  } else if (bt.includes('Cleaning Service')) {
                    newForm.termTechnician = 'Cleaner';
                    newForm.termSparepart = 'Alat / Cairan';
                    newForm.termSpk = 'Order Cleaning';
                    newForm.documentPrefix = 'CLN';
                    newForm.serviceCategories = 'Daily Cleaning, Deep Cleaning, Sofa/Karpet, Pest Control';
                    newForm.technicianSpecialties = 'Cleaner Standar, Ahli Deep Clean, Operator Alat Berat, Pembasmi Hama';
                    newForm.inventoryCategories = 'Cairan Pembersih, Alat Pel/Sapu, Mesin Vacuum, Perlengkapan Safety';
                  } else if (bt.includes('Klinik')) {
                    newForm.termTechnician = 'Terapis / Perawat';
                    newForm.termSparepart = 'Bahan Medis';
                    newForm.termSpk = 'Rekam Medis / Reservasi';
                    newForm.documentPrefix = 'MED';
                    newForm.serviceCategories = 'Konsultasi, Rawat Jalan, Tindakan Medis, Fisioterapi';
                    newForm.technicianSpecialties = 'Dokter Umum, Dokter Spesialis, Terapis, Perawat';
                    newForm.inventoryCategories = 'Obat-obatan, Alat Suntik/Medis, Perban & Kasa, APD';
                  } else if (bt.includes('IT')) {
                    newForm.termTechnician = 'Programmer / Teknisi';
                    newForm.termSparepart = 'Hardware / Lisensi';
                    newForm.termSpk = 'Project Ticket';
                    newForm.documentPrefix = 'ITS';
                    newForm.serviceCategories = 'Pembuatan Web, Maintenance Server, Instalasi Jaringan, Perbaikan PC';
                    newForm.technicianSpecialties = 'Web Developer, Network Engineer, System Administrator, IT Support';
                    newForm.inventoryCategories = 'Router/Switch, Kabel Jaringan, Server Part, Lisensi Software';
                  } else if (bt.includes('Fotografi')) {
                    newForm.termTechnician = 'Fotografer / Crew';
                    newForm.termSparepart = 'Properti / Cetak';
                    newForm.termSpk = 'Booking Event';
                    newForm.documentPrefix = 'FTO';
                    newForm.serviceCategories = 'Wedding, Pre-Wedding, Product Shoot, Event / Liputan, Studio Session';
                    newForm.technicianSpecialties = 'Fotografer Utama, Videografer, Editor, Asisten Lighting, Drone Operator';
                    newForm.inventoryCategories = 'Kamera & Lensa, Lighting & Flash, Baterai & Memory, Properti Foto, Album & Cetakan';
                  } else if (bt.includes('Konsultan')) {
                    newForm.termTechnician = 'Konsultan / Auditor';
                    newForm.termSparepart = 'Modul / Dokumen';
                    newForm.termSpk = 'Surat Kontrak';
                    newForm.documentPrefix = 'KNS';
                    newForm.serviceCategories = 'Konsultasi Bisnis, Audit Keuangan, Perencanaan Pajak, Legal & Hukum';
                    newForm.technicianSpecialties = 'Auditor Senior, Konsultan Pajak, Penasihat Hukum, Analis Keuangan';
                    newForm.inventoryCategories = 'ATK & Kertas, Modul Pelatihan, Software Akuntansi, Map & Binder';
                  } else if (bt.includes('Konstruksi')) {
                    newForm.termTechnician = 'Tukang / Mandor';
                    newForm.termSparepart = 'Material Bangunan';
                    newForm.termSpk = 'Kontrak Proyek';
                    newForm.documentPrefix = 'KNS';
                    newForm.serviceCategories = 'Renovasi Rumah, Bangun Baru, Instalasi Pipa, Pengecatan, Desain Interior';
                    newForm.technicianSpecialties = 'Mandor, Tukang Batu, Tukang Kayu, Tukang Listrik, Tukang Pipa / Ledeng';
                    newForm.inventoryCategories = 'Semen & Pasir, Batu Bata / Batako, Pipa & Paralon, Kabel & Lampu, Cat & Thinner';
                  } else {
                    // Bengkel / Servis & Lainnya
                    newForm.termTechnician = 'Teknisi';
                    newForm.termSparepart = 'Sparepart';
                    newForm.termSpk = 'SPK';
                    newForm.documentPrefix = 'SRV';
                    newForm.serviceCategories = 'Pemeliharaan Berkala, Perbaikan, Instalasi, Lainnya';
                    newForm.technicianSpecialties = 'Teknisi Umum, Teknisi AC & Listrik, Teknisi Mesin & Otomotif, Ahli Sistem Keamanan, Spesialis IT & Jaringan';
                    newForm.inventoryCategories = 'Suku Cadang, Oli & Pelumas, Material Khusus, Perlengkapan Cuci, Alat/Tools';
                  }
                  setFormData(newForm);
                  onLoadDummyData(bt);
                }
              }}
              className="px-5 py-2.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-full border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              🔄 Muat Data Dummy
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
