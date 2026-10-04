import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../lib/api';
import {
  Database,
  Package,
  Layers,
  Tag,
  Users,
  Truck,
  Store,
  Printer,
  Archive,
  QrCode,
  Upload,
  Plus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  X
} from '@/constants/icons';
import RetailImportModal from '../../../retail/components/RetailImportModal';

interface MasterStats {
  products: number;
  categories: number;
  units: number;
  customers: number;
  suppliers: number;
  outlets: number;
}

interface ImportEntityConfig {
  title: string;
  entityName: string;
  templateEndpoint: string;
  importEndpoint: string;
  sampleFields: string[];
}

export default function MasterDataPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MasterStats>({
    products: 0,
    categories: 0,
    units: 0,
    customers: 0,
    suppliers: 0,
    outlets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeImportEntity, setActiveImportEntity] = useState<ImportEntityConfig | null>(null);
  const [showImportChooser, setShowImportChooser] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, uRes, custRes, sRes, oRes] = await Promise.all([
        api.get('/retail/products').catch(() => ({ data: [] })),
        api.get('/retail/categories').catch(() => ({ data: [] })),
        api.get('/retail/units').catch(() => ({ data: [] })),
        api.get('/retail/customers').catch(() => ({ data: [] })),
        api.get('/retail/suppliers').catch(() => ({ data: [] })),
        api.get('/retail/outlets').catch(() => ({ data: [] })),
      ]);

      const getCount = (res: any) => {
        const d = res.data;
        if (Array.isArray(d)) return d.length;
        if (Array.isArray(d?.data)) return d.data.length;
        return 0;
      };

      setStats({
        products: getCount(pRes),
        categories: getCount(cRes),
        units: getCount(uRes),
        customers: getCount(custRes),
        suppliers: getCount(sRes),
        outlets: getCount(oRes),
      });
    } catch (e) {
      console.error('Failed to load master data stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const masterCards = [
    {
      id: 'products',
      title: 'Katalog Produk & Barang',
      desc: 'Master SKU, nama produk, harga modal, harga jual, barcode, dan stok awal.',
      count: stats.products,
      unit: 'Produk Terdaftar',
      icon: Package,
      color: 'indigo',
      path: '/seller/products',
      badge: stats.products === 0 ? 'Wajib Diisi' : 'Aktif',
      badgeColor: stats.products === 0 ? 'rose' : 'emerald',
      hasImport: true,
      importConfig: {
        title: 'Import Katalog Produk',
        entityName: 'Produk',
        templateEndpoint: '/retail/products/template',
        importEndpoint: '/retail/products/import',
        sampleFields: ['SKU', 'Nama Produk', 'Kategori', 'Satuan Dasar', 'Harga Modal', 'Harga Jual', 'Stok Awal'],
      },
    },
    {
      id: 'categories',
      title: 'Kategori Produk',
      desc: 'Pengelompokan rak dan divisi barang (cth: Sembako, Minuman, Makanan).',
      count: stats.categories,
      unit: 'Kategori Rak',
      icon: Layers,
      color: 'emerald',
      path: '/seller/categories',
      badge: stats.categories === 0 ? 'Disarankan' : 'Tersedia',
      badgeColor: stats.categories === 0 ? 'amber' : 'slate',
      hasImport: true,
      importConfig: {
        title: 'Import Kategori Produk',
        entityName: 'Kategori',
        templateEndpoint: '/retail/categories/template',
        importEndpoint: '/retail/categories/import',
        sampleFields: ['Nama Kategori'],
      },
    },
    {
      id: 'units',
      title: 'Satuan Barang',
      desc: 'Satuan dasar penjualan dan inventori (Pcs, Botol, Bungkus, Dus, Kg).',
      count: stats.units,
      unit: 'Satuan Terdaftar',
      icon: Tag,
      color: 'amber',
      path: '/seller/units',
      badge: stats.units === 0 ? 'Disarankan' : 'Tersedia',
      badgeColor: stats.units === 0 ? 'amber' : 'slate',
      hasImport: true,
      importConfig: {
        title: 'Import Satuan Barang',
        entityName: 'Satuan',
        templateEndpoint: '/retail/units/template',
        importEndpoint: '/retail/units/import',
        sampleFields: ['Nama Satuan (Pcs, Box, Dus, Kg, Liter, dll)'],
      },
    },
    {
      id: 'customers',
      title: 'Data Pelanggan (CRM)',
      desc: 'Database pelanggan setia, nomor kontak WhatsApp, dan poin loyalitas.',
      count: stats.customers,
      unit: 'Pelanggan',
      icon: Users,
      color: 'blue',
      path: '/seller/customers',
      badge: 'CRM Toko',
      badgeColor: 'blue',
      hasImport: true,
      importConfig: {
        title: 'Import Data Pelanggan',
        entityName: 'Pelanggan',
        templateEndpoint: '/retail/customers/template',
        importEndpoint: '/retail/customers/import',
        sampleFields: ['Nama Pelanggan', 'No HP / WhatsApp', 'Email', 'Alamat', 'Poin'],
      },
    },
    {
      id: 'suppliers',
      title: 'Data Supplier / Pemasok',
      desc: 'Daftar distributor dan vendor penyedia stok barang dagangan Anda.',
      count: stats.suppliers,
      unit: 'Supplier',
      icon: Truck,
      color: 'teal',
      path: '/seller/suppliers',
      badge: 'Mitra Pengadaan',
      badgeColor: 'teal',
      hasImport: true,
      importConfig: {
        title: 'Import Data Supplier',
        entityName: 'Supplier',
        templateEndpoint: '/retail/suppliers/template',
        importEndpoint: '/retail/suppliers/import',
        sampleFields: ['Nama Supplier', 'Kontak (Telepon / WA)', 'Alamat'],
      },
    },
    {
      id: 'outlets',
      title: 'Cabang & Outlet Toko',
      desc: 'Manajemen lokasi toko fisik, gerai, dan titik gudang operasional.',
      count: stats.outlets,
      unit: 'Lokasi Toko',
      icon: Store,
      color: 'sky',
      path: '/seller/outlets',
      badge: 'Multi-Lokasi',
      badgeColor: 'sky',
    },
    {
      id: 'pricelists',
      title: 'Harga Grosir & Member',
      desc: 'Aturan harga bertingkat berdasarkan kuantitas beli atau status membership.',
      count: null,
      unit: 'Daftar Harga Bertingkat',
      icon: Layers,
      color: 'violet',
      path: '/seller/pricelists',
      badge: 'Strategi Harga',
      badgeColor: 'violet',
    },
    {
      id: 'discounts',
      title: 'Kode Diskon & Promo',
      desc: 'Kupon potongan nominal atau persentase transaksi kasir POS.',
      count: null,
      unit: 'Voucher & Promo',
      icon: Tag,
      color: 'rose',
      path: '/seller/discounts',
      badge: 'Marketing',
      badgeColor: 'rose',
    },
    {
      id: 'labels',
      title: 'Cetak Label Barcode',
      desc: 'Generator shelf talker harga rak toko dan stiker barcode thermal.',
      count: null,
      unit: 'Price Tag & Barcode',
      icon: Printer,
      color: 'slate',
      path: '/seller/print-labels',
      badge: 'Price Tag',
      badgeColor: 'slate',
    },
    {
      id: 'batches',
      title: 'Batch & Kadaluwarsa',
      desc: 'Pelacakan nomor batch produksi dan tanggal expiry date obat/makanan.',
      count: null,
      unit: 'Expiry Date Tracking',
      icon: Archive,
      color: 'purple',
      path: '/seller/batches',
      badge: 'Kontrol Mutu',
      badgeColor: 'purple',
    },
    {
      id: 'serials',
      title: 'Serial Number / IMEI',
      desc: 'Pencatatan nomor seri unik per unit barang untuk garansi & elektronik.',
      count: null,
      unit: 'Garansi & IMEI',
      icon: QrCode,
      color: 'cyan',
      path: '/seller/serials',
      badge: 'Unit Unik',
      badgeColor: 'cyan',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <Database size={13} />
              <span>Pusat Konfigurasi Sistem</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Data Master Toko & Operasional
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Fondasi utama seluruh transaksi toko Anda. Konfigurasikan katalog produk, kategori, satuan, pelanggan, dan supplier di sini agar operasional kasir serta manajemen stok berjalan lancar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowImportChooser(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              Import Data Master (Excel)
            </button>
            <button
              onClick={fetchStats}
              title="Segarkan Data"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Quick Setup Checklist */}
      <div className="bg-white dark:bg-[#101828] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Panduan Setup Awal untuk Pengguna Baru
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ikuti urutan langkah di bawah ini untuk menyiapkan toko Anda dari nol:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div 
            onClick={() => navigate('/seller/units')}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Langkah 1</span>
              {stats.units > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Selesai ({stats.units})
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">Setup &rarr;</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Satuan & Kategori</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tentukan satuan dasar barang (Pcs, Box) & divisi rak.</p>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => navigate('/seller/products')}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Langkah 2</span>
              {stats.products > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Selesai ({stats.products})
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">Import &rarr;</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Katalog Produk</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Import massal Excel atau tambahkan produk dan stok awal.</p>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => navigate('/seller/suppliers')}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Langkah 3</span>
              {stats.suppliers > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Selesai ({stats.suppliers})
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">Tambah &rarr;</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Data Supplier</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Daftarkan vendor penyedia barang untuk pencatatan kulakan.</p>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => navigate('/seller/customers')}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Langkah 4</span>
              {stats.customers > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Selesai ({stats.customers})
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">Tambah &rarr;</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Data Pelanggan CRM</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Daftarkan member pelanggan untuk poin & diskon khusus.</p>
          </div>
        </div>
      </div>

      {/* Master Data Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {masterCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="bg-white dark:bg-[#101828] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <Icon size={22} className="stroke-[1.75]" />
                  </div>
                  {card.badge && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {card.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {card.count !== null ? (
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {loading ? '...' : `${card.count} ${card.unit}`}
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {card.unit}
                  </span>
                )}
                
                <div className="flex items-center gap-2">
                  {card.hasImport && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImportEntity(card.importConfig);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-1 cursor-pointer"
                      title={`Import Excel ${card.title}`}
                    >
                      <Upload size={12} className="text-blue-600 dark:text-blue-400" />
                      Import
                    </button>
                  )}
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Buka <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Chooser: Import Data Master ── */}
      {showImportChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Pusat Impor Data Master (Excel & CSV)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih tipe data master yang ingin Anda import ke dalam sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportChooser(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {masterCards.filter(c => c.hasImport).map(c => {
                const CIcon = c.icon;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setShowImportChooser(false);
                      setActiveImportEntity(c.importConfig);
                    }}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <CIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        <Upload size={12} />
                        Mulai Import
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Active Import Modal ── */}
      {activeImportEntity && (
        <RetailImportModal
          isOpen={!!activeImportEntity}
          onClose={() => setActiveImportEntity(null)}
          title={activeImportEntity.title}
          entityName={activeImportEntity.entityName}
          templateEndpoint={activeImportEntity.templateEndpoint}
          importEndpoint={activeImportEntity.importEndpoint}
          onSuccess={fetchStats}
          sampleFields={activeImportEntity.sampleFields}
        />
      )}
    </div>
  );
}
