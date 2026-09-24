import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';

const ROUTE_TITLES = {
  // Public & Authentication
  '/': 'Solusi Manajemen Bisnis Terintegrasi',
  '/login': 'Masuk Akun',
  '/register': 'Daftar Tenant Baru',
  '/error': 'Terjadi Kesalahan',
  '/coming-soon': 'Segera Hadir',
  '/support': 'Pusat Bantuan & Support',

  // SaaS Super Admin
  '/dashboard': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/users': 'Pengguna Platform',
  '/admin/users': 'Pengguna Platform',
  '/categories': 'Kategori Bisnis',
  '/admin/categories': 'Kategori Bisnis',
  '/tenants': 'Daftar Tenant',
  '/admin/tenants': 'Daftar Tenant',
  '/kyc': 'Verifikasi KYC Tenant',
  '/admin/kyc': 'Verifikasi KYC Tenant',
  '/subscriptions': 'Manajemen Langganan',
  '/admin/subscriptions': 'Manajemen Langganan',
  '/subscription-requests': 'Permintaan Langganan',
  '/admin/subscription-requests': 'Permintaan Langganan',
  '/packages-features': 'Paket & Fitur',
  '/admin/packages-features': 'Paket & Fitur',
  '/finance': 'Finansial & Faktur',
  '/admin/finance': 'Finansial & Faktur',
  '/invoice-settings': 'Pengaturan Invoice',
  '/admin/invoice-settings': 'Pengaturan Invoice',
  '/subscription-reminders': 'Pengingat & Otomasi',
  '/admin/subscription-reminders': 'Pengingat & Otomasi',
  '/support-center': 'Pusat Bantuan (Tiket)',
  '/admin/support-center': 'Pusat Bantuan (Tiket)',
  '/system-monitoring': 'Monitoring Sistem',
  '/admin/system-monitoring': 'Monitoring Sistem',
  '/content-announcement': 'Pengumuman & Konten',
  '/admin/content-announcement': 'Pengumuman & Konten',
  '/reports-analytics': 'Laporan Overview',
  '/admin/reports-analytics': 'Laporan Overview',
  '/reports-revenue': 'Laporan Pendapatan',
  '/admin/reports-revenue': 'Laporan Pendapatan',
  '/reports-tenants': 'Analitik Tenant',
  '/admin/reports-tenants': 'Analitik Tenant',
  '/admins': 'Kelola Admin',
  '/admin/admins': 'Kelola Admin',
  '/saas-roles': 'Role & Hak Akses',
  '/admin/saas-roles': 'Role & Hak Akses',
  '/logs': 'Log Aktivitas & Audit',
  '/admin/logs': 'Log Aktivitas & Audit',
  '/settings': 'Pengaturan Landing Page',
  '/admin/settings': 'Pengaturan Landing Page',
  '/landing-settings': 'Pengaturan Landing Page',
  '/admin/landing-settings': 'Pengaturan Landing Page',
  '/landing-sectors': 'Sektor Bisnis',
  '/admin/landing-sectors': 'Sektor Bisnis',
  '/landing-features': 'Fitur Platform',
  '/admin/landing-features': 'Fitur Platform',
  '/landing-howitworks': 'Cara Kerja',
  '/admin/landing-howitworks': 'Cara Kerja',
  '/landing-faq': 'FAQ & Pertanyaan Umum',
  '/admin/landing-faq': 'FAQ & Pertanyaan Umum',
  '/landing-footer': 'Pengaturan Footer',
  '/admin/landing-footer': 'Pengaturan Footer',
  '/landing-testimonials': 'Testimoni Pelanggan',
  '/admin/landing-testimonials': 'Testimoni Pelanggan',
  '/landing-billing': 'Harga Paket & Rekening',
  '/admin/landing-billing': 'Harga Paket & Rekening',
  '/landing-logo': 'Logo & Branding',
  '/admin/landing-logo': 'Logo & Branding',
  '/developer-integrations': 'Integrasi & Webhook',
  '/admin/developer-integrations': 'Integrasi & Webhook',
  '/module-docs': 'Arsitektur Modul',
  '/admin/module-docs': 'Arsitektur Modul',
  '/backups': 'Cadangan Data (Backup)',
  '/admin/backups': 'Cadangan Data (Backup)',
  '/doc-dashboard': 'Kelola Dokumentasi',
  '/admin/doc-dashboard': 'Kelola Dokumentasi',
  '/doc-center': 'Pusat Dokumentasi',
  '/admin/doc-center': 'Pusat Dokumentasi',
  '/icon-dictionary': 'Kamus Icon UI',
  '/admin/icon-dictionary': 'Kamus Icon UI',
  '/card-dictionary': 'Kamus Card UI',
  '/admin/card-dictionary': 'Kamus Card UI',
  '/font-dictionary': 'Kamus Font & Tipografi',
  '/admin/font-dictionary': 'Kamus Font & Tipografi',
  '/ui-consistency': 'Audit Konsistensi UI',
  '/admin/ui-consistency': 'Audit Konsistensi UI',
  '/profile': 'Profil Saya',
  '/admin/profile': 'Profil Saya',

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

  // Jasa Module (/jasa/...)
  '/jasa': 'Dashboard Jasa',
  '/jasa/dashboard': 'Dashboard Jasa',
  '/jasa/pos': 'Kasir (POS)',
  '/jasa/work-orders': 'Daftar SPK',
  '/jasa/spk': 'Daftar SPK',
  '/jasa/contracts': 'Jadwal & Kontrak',
  '/jasa/technicians': 'Tim & Teknisi',
  '/jasa/catalog': 'Katalog Layanan',
  '/jasa/inventory': 'Stok & Material',
  '/jasa/finance-summary': 'Laba Rugi',
  '/jasa/finance': 'Laba Rugi',
  '/jasa/expenses': 'Buku Kas',
  '/jasa/invoices': 'Tagihan & Piutang',
  '/jasa/payables': 'Hutang Vendor',
  '/jasa/accounts': 'Rekening & Bank',
  '/jasa/analytics': 'Laporan & SLA',
  '/jasa/settings': 'Pengaturan Jasa',
  '/jasa/roles': 'Role & Hak Akses',
  '/jasa/staff': 'Staf & Operator',
  '/jasa/backup': 'Backup Data',
  '/jasa/developer-api': 'Integrasi API',
  '/jasa/profile': 'Profil Pengguna',
  '/jasa/guide': 'Buku Panduan',
  '/jasa/subscription': 'Paket Langganan',

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

  // Apply custom favicon from SaaS Admin branding settings
  useEffect(() => {
    const cachedFavicon = localStorage.getItem('bizora_custom_favicon');
    if (cachedFavicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = cachedFavicon;
    }

    api.get('/landing-settings')
      .then(res => {
        const faviconUrl = res.data?.data?.favicon_url;
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }

        if (faviconUrl) {
          localStorage.setItem('bizora_custom_favicon', faviconUrl);
          link.href = faviconUrl;
        } else {
          localStorage.removeItem('bizora_custom_favicon');
          link.href = '/favicon.png';
        }
      })
      .catch(() => {});
  }, []);

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
