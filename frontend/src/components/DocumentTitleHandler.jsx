import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  // Public & Authentication
  '/': 'Solusi Manajemen Bisnis Terintegrasi',
  '/login': 'Masuk Akun',
  '/register': 'Daftar Tenant Baru',
  '/error': 'Terjadi Kesalahan',
  '/coming-soon': 'Segera Hadir',
  '/support': 'Pusat Bantuan & Support',

  // SaaS Super Admin
  '/dashboard': 'Dashboard Admin SaaS',
  '/admin/dashboard': 'Dashboard Admin SaaS',
  '/users': 'Manajemen Pengguna',
  '/admin/users': 'Manajemen Pengguna',
  '/categories': 'Kategori Bisnis',
  '/admin/categories': 'Kategori Bisnis',
  '/tenants': 'Manajemen Tenant UMKM',
  '/admin/tenants': 'Manajemen Tenant UMKM',
  '/kyc': 'Verifikasi Identitas & Legalitas',
  '/subscriptions': 'Pelanggan Langganan',
  '/admin/subscriptions': 'Pelanggan Langganan',
  '/subscription-requests': 'Permintaan Upgrade Langganan',
  '/admin/subscription-requests': 'Permintaan Upgrade Langganan',
  '/packages-features': 'Paket & Fitur Platform',
  '/admin/packages-features': 'Paket & Fitur Platform',
  '/finance': 'Laporan Keuangan SaaS',
  '/admin/finance': 'Laporan Keuangan SaaS',
  '/invoice-settings': 'Pengaturan Faktur & Invoice',
  '/admin/invoice-settings': 'Pengaturan Faktur & Invoice',
  '/subscription-reminders': 'Pengingat Jatuh Tempo',
  '/admin/subscription-reminders': 'Pengingat Jatuh Tempo',
  '/support-center': 'Pusat Bantuan & Tiket',
  '/admin/support-center': 'Pusat Bantuan & Tiket',
  '/system-monitoring': 'Monitoring Sistem & Server',
  '/admin/system-monitoring': 'Monitoring Sistem & Server',
  '/content-announcement': 'Konten & Pengumuman',
  '/admin/content-announcement': 'Konten & Pengumuman',
  '/reports-analytics': 'Analitik Performa Platform',
  '/admin/reports-analytics': 'Analitik Performa Platform',
  '/reports-revenue': 'Laporan Pendapatan SaaS',
  '/admin/reports-revenue': 'Laporan Pendapatan SaaS',
  '/reports-tenants': 'Analitik Distribusi Tenant',
  '/admin/reports-tenants': 'Analitik Distribusi Tenant',
  '/admins': 'Daftar Administrator',
  '/admin/admins': 'Daftar Administrator',
  '/saas-roles': 'Hak Akses & Role Admin',
  '/admin/saas-roles': 'Hak Akses & Role Admin',
  '/logs': 'Audit Log & Keamanan',
  '/admin/logs': 'Audit Log & Keamanan',
  '/settings': 'Pengaturan Landing Page',
  '/admin/settings': 'Pengaturan Landing Page',
  '/landing-settings': 'Pengaturan Landing Page',
  '/admin/landing-settings': 'Pengaturan Landing Page',
  '/landing-sectors': 'Sektor Industri Bisnis',
  '/admin/landing-sectors': 'Sektor Industri Bisnis',
  '/landing-features': 'Fitur Unggulan Platform',
  '/admin/landing-features': 'Fitur Unggulan Platform',
  '/landing-howitworks': 'Langkah Cara Kerja',
  '/admin/landing-howitworks': 'Langkah Cara Kerja',
  '/landing-faq': 'FAQ & Pertanyaan Umum',
  '/admin/landing-faq': 'FAQ & Pertanyaan Umum',
  '/landing-testimonials': 'Ulasan & Testimoni Pelanggan',
  '/admin/landing-testimonials': 'Ulasan & Testimoni Pelanggan',
  '/landing-billing': 'Harga Paket & Rekening',
  '/admin/landing-billing': 'Harga Paket & Rekening',
  '/landing-logo': 'Identitas & Logo Platform',
  '/admin/landing-logo': 'Identitas & Logo Platform',
  '/developer-integrations': 'Integrasi API & Developer',
  '/admin/developer-integrations': 'Integrasi API & Developer',
  '/module-docs': 'Dokumentasi Arsitektur Modul',
  '/admin/module-docs': 'Dokumentasi Arsitektur Modul',
  '/backups': 'Backup & Pemulihan Sistem',
  '/admin/backups': 'Backup & Pemulihan Sistem',
  '/doc-dashboard': 'Dashboard Dokumentasi',
  '/admin/doc-dashboard': 'Dashboard Dokumentasi',
  '/doc-center': 'Pusat Dokumentasi Lengkap',
  '/profile': 'Profil Akun Pengguna',

  // Retail Module (/retail/...)
  '/retail': 'Dashboard Retail',
  '/retail/dashboard': 'Dashboard Retail',
  '/retail/guide': 'Buku Panduan Retail',
  '/retail/pos': 'Kasir (POS)',
  '/retail/products': 'Daftar Barang & Produk',
  '/retail/inventory': 'Stok Barang & Gudang',
  '/retail/stock': 'Penerimaan Barang',
  '/retail/categories': 'Kategori Produk',
  '/retail/units': 'Satuan Dasar Produk',
  '/retail/customers': 'Data Pelanggan (CRM)',
  '/retail/suppliers': 'Data Supplier',
  '/retail/outlets': 'Daftar Cabang Toko',
  '/retail/batches': 'Manajemen Batch & Kadaluarsa',
  '/retail/serials': 'Manajemen Serial Number',
  '/retail/stock-transfers': 'Transfer Stok Cabang',
  '/retail/print-labels': 'Cetak Barcode & Label',
  '/retail/purchase-orders': 'Purchase Order (PO)',
  '/retail/stock-movements': 'Riwayat Mutasi Stok',
  '/retail/stock-opname': 'Stock Opname Fisik',
  '/retail/finance-categories': 'Kategori Keuangan',
  '/retail/staff': 'Data Pegawai & Staf',
  '/retail/roles': 'Jabatan & Hak Akses',
  '/retail/subscription': 'Paket Langganan Retail',
  '/retail/support': 'Pusat Bantuan Retail',
  '/retail/profile': 'Profil Toko Retail',
  '/retail/settings': 'Pengaturan Toko Retail',
  '/retail/developer-api': 'Integrasi API & Webhook',
  '/retail/backup': 'Backup Data Toko',
  '/retail/transactions': 'Riwayat Transaksi Retail',
  '/retail/shifts': 'Shift & Laci Kasir',
  '/retail/supplier-returns': 'Retur Pembelian Supplier',
  '/retail/customer-returns': 'Retur Penjualan Pelanggan',
  '/retail/discounts': 'Kode Diskon & Promo',
  '/retail/pricelists': 'Daftar Harga Khusus',
  '/retail/consignment': 'Konsinyasi Barang',
  '/retail/reports/sales': 'Laporan Penjualan',
  '/retail/reports/products': 'Laporan Performa Produk',
  '/retail/reports/margins': 'Laporan Margin & Laba Produk',
  '/retail/reports/customers': 'Laporan Analisis Pelanggan',
  '/retail/reports/shifts': 'Laporan Shift Kasir',
  '/retail/reports/payments': 'Laporan Metode Pembayaran',
  '/retail/reports/consignment': 'Laporan Konsinyasi',
  '/retail/finance/summary': 'Laporan Laba Rugi',
  '/retail/finance/cash': 'Buku Kas Operasional',
  '/retail/finance/transfers': 'Mutasi Antar Kas',
  '/retail/finance/cash-flow': 'Arus Kas (Cash Flow)',
  '/retail/finance/tax-report': 'Laporan Pajak & PPN',
  '/retail/finance/payables': 'Buku Hutang Supplier',
  '/retail/finance/receivables': 'Buku Piutang Pelanggan',

  // Kuliner Module (/kuliner/...)
  '/kuliner': 'Katalog Menu Kuliner',
  '/kuliner/menu': 'Menu Makanan & Minuman',
  '/kuliner/pos': 'Kasir POS Restoran',
  '/kuliner/admin': 'Dashboard Resto',
  '/kuliner/admin/dashboard': 'Dashboard Resto',
  '/kuliner/admin/orders': 'Pesanan Masuk & Kasir',
  '/kuliner/admin/kitchen-queue': 'Antrean Dapur (KDS)',
  '/kuliner/admin/shift': 'Manajemen Shift Kasir',
  '/kuliner/admin/stock-opname': 'Stok Opname Bahan Baku',
  '/kuliner/admin/waste': 'Pencatatan Waste & Basi',
  '/kuliner/admin/purchases': 'Pembelian Bahan Baku (PO)',
  '/kuliner/admin/categories': 'Kategori & Menu Makanan',
  '/kuliner/admin/modifiers': 'Modifier & Varian Menu',
  '/kuliner/admin/addons': 'Add-on & Menu Tambahan',
  '/kuliner/admin/bundles': 'Paket Menu / Bundling',
  '/kuliner/admin/ingredients': 'Daftar Bahan Baku',
  '/kuliner/admin/recipes': 'Resep & HPP Otomatis',
  '/kuliner/admin/suppliers': 'Master Supplier Bahan',
  '/kuliner/admin/finance-categories': 'Kategori Keuangan Kas',
  '/kuliner/admin/tables': 'Manajemen Meja Dine-In',
  '/kuliner/admin/finance-summary': 'Laporan Laba Rugi Resto',
  '/kuliner/admin/expenses': 'Pencatatan Kas & Beban',
  '/kuliner/admin/reports': 'Laba & Margin Menu',
  '/kuliner/admin/reports-advanced': 'Laporan Laba Menu Lanjutan',
  '/kuliner/admin/analytics': 'Analitik Penjualan Resto',
  '/kuliner/admin/transactions': 'Jurnal Transaksi Kas',
  '/kuliner/admin/promos': 'Manajemen Promo & Diskon',
  '/kuliner/admin/reviews': 'Ulasan & Testimoni Pelanggan',
  '/kuliner/admin/staff': 'Manajemen Staf Resto',
  '/kuliner/admin/roles': 'Hak Akses & Role Resto',
  '/kuliner/admin/settings': 'Pengaturan Toko Kuliner',
  '/kuliner/admin/backup': 'Backup Data Resto',
  '/kuliner/admin/support': 'Pusat Bantuan Resto',
  '/kuliner/admin/profile': 'Pengaturan Profil Resto',
  '/kuliner/subscription': 'Paket Langganan Resto',

  // Budidaya Module (/budidaya/...)
  '/budidaya': 'Dashboard Budidaya',
  '/budidaya/dashboard': 'Dashboard Budidaya',
  '/budidaya/ponds': 'Manajemen Kolam & Kandang',
  '/budidaya/cycles': 'Siklus Budidaya',
  '/budidaya/inventory': 'Gudang & Inventaris',
  '/budidaya/finance-summary': 'Laporan Laba Rugi Budidaya',
  '/budidaya/expenses': 'Buku Kas & Transaksi',
  '/budidaya/reports': 'Laporan & Analisa Produksi',
  '/budidaya/users': 'Manajemen Pengguna Lapangan',
  '/budidaya/roles': 'Peran & Izin Akses',
  '/budidaya/subscription': 'Paket Langganan Budidaya',
  '/budidaya/support': 'Pusat Bantuan Budidaya',
  '/budidaya/master-data': 'Master Data & Satuan',
  '/budidaya/settings': 'Pengaturan Profil Budidaya',
  '/budidaya/backup': 'Backup Data Budidaya',
  '/budidaya/feeds': 'Pakan & Logistik',
  '/budidaya/feed-units': 'Data Satuan Pakan',
  '/budidaya/feed-categories': 'Kategori Pakan',

  // Seller Module (/seller/...)
  '/seller': 'Dashboard Seller Marketplace',
  '/seller/dashboard': 'Dashboard Seller Marketplace',
  '/seller/inventory': 'Stok Gudang Multi-Channel',
  '/seller/orders': 'Pesanan Masuk Marketplace',
  '/seller/shipments': 'Pengiriman & Cetak Resi',
  '/seller/reports': 'Laporan Omzet Penjualan',
  '/seller/langganan': 'Paket Langganan Seller',
  '/seller/settings': 'Pengaturan Integrasi Toko',
};

// Helper to format unknown slug to Title Case
function formatSlugToTitle(path) {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'Beranda';
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function DocumentTitleHandler() {
  const location = useLocation();

  useEffect(() => {
    // If in Jasa module, JasaInnerApp handles the dynamic terminology
    if (location.pathname.startsWith('/jasa')) {
      return;
    }

    const path = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    let title = ROUTE_TITLES[path];

    if (!title) {
      // Check prefix match
      const matchedKey = Object.keys(ROUTE_TITLES)
        .filter(k => k !== '/' && path.startsWith(k))
        .sort((a, b) => b.length - a.length)[0];

      if (matchedKey) {
        title = ROUTE_TITLES[matchedKey];
      } else {
        title = formatSlugToTitle(path);
      }
    }

    if (path === '/') {
      document.title = 'Bizora - Solusi Manajemen Bisnis Terintegrasi';
    } else {
      document.title = `Bizora - ${title}`;
    }
  }, [location.pathname]);

  return null;
}
