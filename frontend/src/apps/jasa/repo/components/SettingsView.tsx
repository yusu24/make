import React, { useState, useEffect } from 'react';
import { 
  Save, 
  AlertCircle, 
  Briefcase, 
  Tag, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Smartphone, 
  Car, 
  Snowflake, 
  Shirt, 
  Scissors, 
  Wrench,
  Check
} from 'lucide-react';
import { jasaApi } from '../services/jasaApi';
import { useJasa } from '../contexts/JasaContext';
import { JasaCategoryType, getJasaTerms } from '../hooks/useJasaTerms';
import { useAuth } from '../../../../contexts/AuthContext';

interface SettingsViewProps {
  settings: any;
  onRefresh: () => void;
  onLoadDummyData?: (businessType: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Smartphone,
  Car,
  Snowflake,
  Shirt,
  Scissors,
  Needle: Layers,
  Wrench
};

export const CATEGORY_DEFAULTS: Record<JasaCategoryType, {
  businessType: string;
  documentPrefix: string;
  serviceCategories: string;
  technicianSpecialties: string;
  inventoryCategories: string;
}> = {
  elektronik: {
    businessType: 'Servis Elektronik & Gadget',
    documentPrefix: 'ELK',
    serviceCategories: 'Ganti LCD / Touchscreen, Ganti Baterai, Servis Mesin / IC, Software & Flashing, Pembersihan & Perawatan',
    technicianSpecialties: 'Teknisi Handphone, Teknisi Laptop / PC, Teknisi Motherboard / IC, Software Specialist',
    inventoryCategories: 'LCD & Touchscreen, Baterai, Fleksibel & Port Cas, IC / Chipset, Casing & Tombol'
  },
  otomotif: {
    businessType: 'Bengkel Otomotif',
    documentPrefix: 'BKL',
    serviceCategories: 'Servis Ringan / Tune Up, Ganti Oli & Filter, Pengereman, Transmisi & CVT, Overhaul / Turun Mesin',
    technicianSpecialties: 'Mekanik Mesin, Mekanik CVT / Matic, Teknisi Kelistrikan, Montir Servis Cepat',
    inventoryCategories: 'Oli & Pelumas, Kampas Rem, Busi & Koil, V-Belt & Roller, Ban & Velg'
  },
  ac_appliances: {
    businessType: 'Servis AC & Home Appliances',
    documentPrefix: 'AC',
    serviceCategories: 'Cuci AC Regular, Tambah / Isi Freon, Perbaikan Kompresor, Perbaikan Pipa & Las, Bongkar Pasang / Relokasi',
    technicianSpecialties: 'Teknisi AC Split, Teknisi Kulkas & Chiller, Teknisi Mesin Cuci, Teknisi Lapangan',
    inventoryCategories: 'Freon R32 / R410, Pipa Tembaga, Kompresor, Kapasitor & Modul, Perlengkapan Cuci'
  },
  laundry: {
    businessType: 'Laundry & Cuci Sepatu',
    documentPrefix: 'LND',
    serviceCategories: 'Cuci Kering Setrika Kiloan, Cuci Satuan, Deep Clean Sepatu, Dry Cleaning Jas, Cuci Karpet & Bedcover',
    technicianSpecialties: 'Operator Cuci, Ahli Setrika & Finishing, Spesialis Noda, Staff Kasir & Packing',
    inventoryCategories: 'Deterjen Cair, Pewangi & Pelembut, Pembersih Sepatu / Shoes Cleaner, Plastik & Hanger'
  },
  salon_barbershop: {
    businessType: 'Salon, Barbershop & Spa',
    documentPrefix: 'SLN',
    serviceCategories: 'Gentleman Haircut, Hair Treatment & Creambath, Coloring & Highlight, Shaving & Beard Care, Spa & Massage',
    technicianSpecialties: 'Master Barber / Hair Stylist, Colorist, Terapis Creambath, Asisten Salon',
    inventoryCategories: 'Pomade & Wax, Shampo & Tonik, Cat Rambut & Bleaching, Handuk & Cape, Pisau Cukur / Blade'
  },
  tailor: {
    businessType: 'Tailor & Konveksi',
    documentPrefix: 'TLR',
    serviceCategories: 'Jahit Kemeja / Busana Pria, Jahit Gaun / Busana Wanita, Permak & Modifikasi, Jahit Seragam, Pembuatan Pola Khusus',
    technicianSpecialties: 'Pemotong Pola, Penjahit Halus, Penjahit Permak / Obras, Asisten Fitting',
    inventoryCategories: 'Kain & Bahan, Benang Jahit & Obras, Kancing & Ritsleting, Furing & Busa Bahu'
  },
  umum: {
    businessType: 'Jasa & Proyek Umum',
    documentPrefix: 'JSA',
    serviceCategories: 'Instalasi & Pemasangan, Desain & Percetakan, Perbaikan & Perawatan, Konsultasi & Survey',
    technicianSpecialties: 'Tenaga Ahli Lapangan, Teknisi Instalasi, Desainer Grafis, Project Officer',
    inventoryCategories: 'Material Proyek, Alat Kerja & Tools, Bahan Baku, Perlengkapan Safety'
  }
};

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onRefresh, onLoadDummyData }) => {
  const { user } = useAuth();
  const isDemoAccount = user?.email?.startsWith('demo-') || user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.role === 'superadmin';
  const { category, terms, setCategory, openPicker, categoriesList } = useJasa();

  const currentDefaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.umum;

  const [formData, setFormData] = useState({
    businessType: terms.categoryName || currentDefaults.businessType,
    businessName: 'Bizora Service Center',
    businessPhone: '0812-3456-7890',
    businessAddress: 'Jl. Utama No. 88, Kota Niaga',
    businessSlogan: 'Layanan Cepat, Profesional & Bergaransi',
    termTechnician: terms.technicianLabel || 'Teknisi',
    termSparepart: terms.sparepartLabel || 'Sparepart',
    termSpk: terms.workOrderLabel || 'SPK',
    documentPrefix: currentDefaults.documentPrefix || 'SRV',
    qris_image_url: '',
    bank_name: '',
    bank_account_no: '',
    bank_account_name: '',
    serviceCategories: currentDefaults.serviceCategories,
    technicianSpecialties: currentDefaults.technicianSpecialties,
    inventoryCategories: currentDefaults.inventoryCategories
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Sync formData when category changes
  const handleSelectCategory = (catId: JasaCategoryType) => {
    setCategory(catId);
    const catTerms = getJasaTerms(catId);
    const catDefaults = CATEGORY_DEFAULTS[catId] || CATEGORY_DEFAULTS.umum;
    
    setFormData(prev => ({
      ...prev,
      businessType: catTerms.categoryName,
      termTechnician: catTerms.technicianLabel,
      termSparepart: catTerms.sparepartLabel,
      termSpk: catTerms.workOrderLabel,
      documentPrefix: catDefaults.documentPrefix,
      serviceCategories: catDefaults.serviceCategories,
      technicianSpecialties: catDefaults.technicianSpecialties,
      inventoryCategories: catDefaults.inventoryCategories
    }));
  };

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        businessType: settings.businessType || settings.business_type || terms.categoryName || currentDefaults.businessType,
        businessName: settings.businessName || settings.business_name || prev.businessName || 'Bizora Service Center',
        businessPhone: settings.businessPhone || settings.business_phone || prev.businessPhone || '0812-3456-7890',
        businessAddress: settings.businessAddress || settings.business_address || prev.businessAddress || 'Jl. Utama No. 88, Kota Niaga',
        businessSlogan: settings.businessSlogan || settings.business_slogan || prev.businessSlogan || 'Layanan Cepat, Profesional & Bergaransi',
        termTechnician: settings.termTechnician || settings.term_technician || terms.technicianLabel || 'Teknisi',
        termSparepart: settings.termSparepart || settings.term_sparepart || terms.sparepartLabel || 'Sparepart',
        termSpk: settings.termSpk || settings.term_spk || terms.workOrderLabel || 'SPK',
        documentPrefix: settings.documentPrefix || settings.document_prefix || currentDefaults.documentPrefix,
        qris_image_url: settings.qris_image_url || prev.qris_image_url || '',
        bank_name: settings.bank_name || prev.bank_name || '',
        bank_account_no: settings.bank_account_no || prev.bank_account_no || '',
        bank_account_name: settings.bank_account_name || prev.bank_account_name || '',
        serviceCategories: settings.service_categories && settings.service_categories.length > 0 
          ? settings.service_categories.join(', ') 
          : prev.serviceCategories || currentDefaults.serviceCategories,
        technicianSpecialties: settings.technician_specialties && settings.technician_specialties.length > 0 
          ? settings.technician_specialties.join(', ') 
          : prev.technicianSpecialties || currentDefaults.technicianSpecialties,
        inventoryCategories: settings.inventory_categories && settings.inventory_categories.length > 0 
          ? settings.inventory_categories.join(', ') 
          : prev.inventoryCategories || currentDefaults.inventoryCategories
      }));
    }
  }, [settings]);

  // When terms change externally (e.g. from Picker modal or TopBar)
  useEffect(() => {
    const catDefaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.umum;
    setFormData(prev => ({
      ...prev,
      businessType: terms.categoryName,
      termTechnician: terms.technicianLabel,
      termSparepart: terms.sparepartLabel,
      termSpk: terms.workOrderLabel,
      documentPrefix: catDefaults.documentPrefix,
      serviceCategories: catDefaults.serviceCategories,
      technicianSpecialties: catDefaults.technicianSpecialties,
      inventoryCategories: catDefaults.inventoryCategories
    }));
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        category: category,
        service_categories: formData.serviceCategories.split(',').map(s => s.trim()).filter(Boolean),
        technician_specialties: formData.technicianSpecialties.split(',').map(s => s.trim()).filter(Boolean),
        inventory_categories: formData.inventoryCategories.split(',').map(s => s.trim()).filter(Boolean),
      };
      await jasaApi.updateSettings(payload);
      setToast({ type: 'success', message: 'Pengaturan modul jasa berhasil disimpan!' });
      onRefresh();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Settings save error:', err.response?.data || err);
      setToast({ type: 'error', message: 'Gagal menyimpan: ' + (err.response?.data?.message || err.message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActiveIcon = CATEGORY_ICONS[terms.categoryIcon] || Wrench;

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Bidang Usaha Card */}
      {isDemoAccount ? (
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 rounded-2xl shadow-sm border-2 border-indigo-200/80 dark:border-indigo-800/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Mode Demo — Showcase Preset
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Kategori Bidang Industri Jasa
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={openPicker}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Buka Wizard Pemilihan Kategori
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Sistem saat ini disimulasikan untuk <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{terms.categoryName}</strong>. Klik salah satu tombol industri di bawah untuk menguji adaptasi istilah dan alur kerja seketika.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {categoriesList.map((cat) => {
                const IconComp = CATEGORY_ICONS[cat.icon] || Wrench;
                const isSelected = category === cat.id;

                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold line-clamp-1 ${
                      isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {cat.title.split(' ')[0]}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Bidang Industri Terdaftar
                </div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{terms.categoryName}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <Check className="w-3.5 h-3.5" />
                <span>Status: Terverifikasi & Aktif</span>
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem akun Anda telah dikonfigurasi khusus dan terintegrasi untuk bidang usaha <strong className="text-slate-900 font-semibold">{terms.categoryName}</strong>. Seluruh formulir dokumen, kasir POS, katalog tarif, dan data operasional telah diselaraskan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pekerja / Pelaksana</span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {terms.technicianLabel}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objek Servis / Pekerjaan</span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {terms.unitLabel}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Material / Suku Cadang</span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {terms.sparepartLabel}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              💡 Bidang usaha ini terkunci sesuai registrasi paket aktif Anda. Untuk bantuan migrasi database atau penambahan lini bisnis multi-cabang, silakan hubungi tim dukungan Bizora.
            </p>
          </div>
        </div>
      )}
        
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profil Bisnis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Identitas & Profil Usaha</h2>
                <p className="text-xs text-slate-500">Informasi ini akan tercetak pada Kop Surat SPK, Nota Kasir, dan Invoice pelanggan</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bidang: {terms.categoryName}</span>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nama Usaha / Workshop / Toko</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="Contoh: Berkah Laundry Express / Jaya Abadi Motor"
              />
              <p className="text-[11px] text-slate-500">Nama brand yang tampil di kepala faktur / nota.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nomor Telepon / WhatsApp CS</label>
              <input
                type="text"
                value={formData.businessPhone}
                onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="Contoh: 0812-3456-7890"
              />
              <p className="text-[11px] text-slate-500">Kontak resmi yang dapat dihubungi pelanggan.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Alamat Lengkap Usaha / Outlet</label>
              <input
                type="text"
                value={formData.businessAddress}
                onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="Contoh: Jl. Ahmad Yani No. 12, Kebayoran Baru, Jakarta Selatan"
              />
              <p className="text-[11px] text-slate-500">Alamat workshop/outlet untuk cetak dokumen.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slogan / Catatan Footer Nota</label>
              <input
                type="text"
                value={formData.businessSlogan}
                onChange={(e) => setFormData({...formData, businessSlogan: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="Contoh: Layanan Cepat, Profesional & Bergaransi"
              />
              <p className="text-[11px] text-slate-500">Kalimat penutup atau garansi di bagian bawah nota.</p>
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
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Bawaan: {terms.technicianLabel}</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.termTechnician}
                onChange={(e) => setFormData({...formData, termTechnician: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                placeholder={`Misal: ${terms.technicianLabel}...`}
              />
              <p className="text-[11px] text-slate-500">Akan menggantikan kata "{terms.technicianLabel}" di seluruh menu.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Istilah Dokumen Order
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Bawaan: {terms.workOrderLabel}</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.termSpk}
                onChange={(e) => setFormData({...formData, termSpk: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                placeholder={`Misal: ${terms.workOrderLabel}...`}
              />
              <p className="text-[11px] text-slate-500">Singkatan/kata ganti untuk Surat Perintah Kerja.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex justify-between">
                Istilah Material / Barang
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Bawaan: {terms.sparepartLabel}</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.termSparepart}
                onChange={(e) => setFormData({...formData, termSparepart: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                placeholder={`Misal: ${terms.sparepartLabel}...`}
              />
              <p className="text-[11px] text-slate-500">Sebutan untuk barang yang digunakan pada jasa.</p>
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
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Bawaan: {currentDefaults.documentPrefix}</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.documentPrefix}
                onChange={(e) => setFormData({...formData, documentPrefix: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono font-bold uppercase"
                placeholder={`Misal: ${currentDefaults.documentPrefix}...`}
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Contoh: <strong className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{formData.documentPrefix}-202610-001</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Metode Pembayaran & QRIS Penagihan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <span className="text-lg">💳</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Metode Pembayaran & QRIS Penagihan SPK</h2>
              <p className="text-xs text-slate-500">Informasi pembayaran yang tertera pada Invoice SPK dan dicetak untuk pelanggan</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">URL Gambar QRIS Bengkel / Usaha (JPG/PNG)</label>
              <input
                type="text"
                value={formData.qris_image_url}
                onChange={(e) => setFormData({...formData, qris_image_url: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="https://.../qris-bengkel.png"
              />
              <p className="text-xs text-slate-400">Pelanggan dapat scan QRIS ini saat pembayaran DP atau pelunasan SPK servis.</p>
            </div>

            {formData.qris_image_url && (
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl inline-block">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">Preview QRIS:</span>
                <img src={formData.qris_image_url} alt="QRIS Bengkel" className="w-32 h-32 object-contain bg-white rounded-lg border border-purple-200" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Bank</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="BCA / Mandiri / BRI"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.bank_account_no}
                  onChange={(e) => setFormData({...formData, bank_account_no: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Atas Nama Rekening</label>
                <input
                  type="text"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({...formData, bank_account_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Nama Pemilik / PT Bengkel"
                />
              </div>
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
