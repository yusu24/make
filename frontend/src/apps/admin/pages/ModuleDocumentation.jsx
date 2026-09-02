import React, { useState, useRef } from 'react';
import {
  BookOpen, Code2, Database, Layers, Cpu, FileText, CheckCircle2,
  Terminal, Copy, Check, Search, ShieldCheck, ArrowRight, Store,
  Server, Layout, Sparkles, FolderTree, Key, ChevronDown, ChevronRight,
  ExternalLink, Printer, ShoppingCart, Package, RefreshCw, BarChart2,
  Wallet, Users, Settings, Tag, ArrowRightLeft, FileSpreadsheet, Lock,
  Truck, ZoomIn, ZoomOut, Maximize2, Minimize2, Eye, Network, GitCommit,
  Download, Filter, HelpCircle, Info, Utensils, Coffee, QrCode, Flame,
  Clock, Trash2, Sliders, Star, Activity, Scale, Trees, Globe, ShoppingBag,
  Wrench, ClipboardList
} from 'lucide-react';
import './Shared.css';

export default function ModuleDocumentation() {
  const [selectedModule, setSelectedModule] = useState('retail'); // 'retail' | 'kuliner'
  const [activeTab, setActiveTab] = useState('erd'); // Default to ERD
  const [erdViewMode, setErdViewMode] = useState('visual'); // 'visual' | 'schema' | 'mermaid'
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState({
    retail_products: true,
    retail_transactions: true,
    kuliner_products: true,
    kuliner_orders: true,
    kuliner_recipe_items: true
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [hoveredTable, setHoveredTable] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const svgContainerRef = useRef(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleTableExpand = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(Number((prev + delta).toFixed(1)), 0.5), 1.6));
  };

  const resetZoom = () => setZoomLevel(1);

  // Switch module handler (reset domain to 'all')
  const handleModuleChange = (modKey) => {
    setSelectedModule(modKey);
    setSelectedDomain('all');
    setHoveredTable(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REPOSITORY DOKUMENTASI LENGKAP (RETAIL & KULINER)
  // ═══════════════════════════════════════════════════════════════════════════
  const MODULE_DATA = {
    // ─────────────────────────────────────────────────────────────────────────
    // [1] MODUL TOKO RETAIL & POS
    // ─────────────────────────────────────────────────────────────────────────
    retail: {
      key: 'retail',
      icon: <Store size={18} />,
      title: 'Modul Toko Retail & POS (Point of Sale)',
      description: 'Sistem operasional terintegrasi untuk bisnis retail modern, minimarket, grosir, dan toko kelontong dengan fitur kasir cepat, multi-outlet, multi-satuan, pelacakan batch & serial, inventaris berkala, akuntansi kas, dan kontrol hak akses staf.',
      version: 'v2.4.5 (Enhanced Margin Analytics & Mobile LAN Sync)',
      lastUpdated: '2026-08-31',
      leadDeveloper: 'Bizora Core Engineering Team',

      domains: [
        { id: 'all', label: 'Semua Domain (Full ERD)', color: '#6366f1' },
        { id: 'core', label: 'Core & Multi-Tenant', color: '#4f46e5' },
        { id: 'catalog', label: 'Katalog & Multi-Satuan', color: '#0284c7' },
        { id: 'inventory', label: 'Stok, Batch & Serial', color: '#d97706' },
        { id: 'pos', label: 'POS & Transaksi Kasir', color: '#10b981' },
        { id: 'purchasing', label: 'Pengadaan & Supplier', color: '#7c3aed' },
        { id: 'finance', label: 'Keuangan & Hutang/Piutang', color: '#e11d48' },
      ],

      techStack: {
        backend: [
          { name: 'Laravel 11.x', role: 'Backend Framework & REST API Engine', tag: 'Framework' },
          { name: 'PHP 8.2+', role: 'Programming Language & Runtime', tag: 'Core' },
          { name: 'Laravel Sanctum', role: 'SPA Token-based Authentication', tag: 'Auth' },
          { name: 'Eloquent ORM', role: 'Database Abstraction & Relational Mapping', tag: 'ORM' },
          { name: 'Multi-Tenant Scopes', role: 'Automatic tenant_id database isolation', tag: 'Security' },
          { name: 'Custom RBAC Middleware', role: 'CheckRetailPermission, CheckSubscription, CheckPlanFeature', tag: 'Middleware' },
          { name: 'Laravel Artisan & Scheduler', role: 'Automated background tasks & subscription expiry', tag: 'CLI & Cron' },
        ],
        frontend: [
          { name: 'React 18.x', role: 'User Interface Component Library', tag: 'UI Library' },
          { name: 'Vite 5.x + Auto LAN Host', role: 'Bundler with automatic local network & mobile hotspot binding', tag: 'Bundler' },
          { name: 'Dynamic API Resolver', role: 'window.location.hostname detection for seamless multi-device access (HP/Tablet/PC)', tag: 'Networking' },
          { name: 'React Router v6', role: 'Client-side Declarative Routing & Navigation Guards', tag: 'Routing' },
          { name: 'Axios Interceptors', role: 'Centralized HTTP Client, Token Injection & 401/402 Error Handlers', tag: 'Networking' },
          { name: 'Recharts 2.x', role: 'Top 10 Horizontal Bar & Analytics Visualizations', tag: 'Charts' },
          { name: 'Context API', role: 'Global State (AuthContext, ThemeContext, TenantContext)', tag: 'State' },
          { name: 'Lucide React', role: 'Consistent & Modern SVG Iconography', tag: 'Icons' },
          { name: 'Pure CSS Design System', role: 'Scoped CSS variables (--retail-*), animations, zero Tailwind lock-in', tag: 'Styling' },
        ],
        database: [
          { name: 'MySQL 8.0 / MariaDB', role: 'Primary Relational Database Management System', tag: 'Production DB' },
          { name: 'Database Indexes', role: 'Optimized on [tenant_id, barcode, created_at, status]', tag: 'Performance' },
          { name: 'Transactions & ACID', role: 'Atomic operations on checkout, stock movements & opname', tag: 'Integrity' },
          { name: 'Soft Deletes', role: 'Audit retention for products, customers, and suppliers', tag: 'Audit' },
        ]
      },

      features: [
        {
          category: 'Point of Sale (Kasir)',
          icon: <ShoppingCart size={20} className="text-primary" />,
          items: [
            'Barcode scanner scanning cepat (instant lookup via autofocus)',
            'Hold & Recall antrean transaksi kasir (multi-transaksi tertunda)',
            'Split Payment (Kombinasi Tunai, QRIS Dinamis, Transfer Bank, Kartu Debit/Kredit)',
            'Kalkulator kembalian instan & nominal uang pas',
            'Diskon berjenjang (Diskon per item, Diskon total nominal/persen, Kupon)',
            'Pajak otomatis (PPN/Tax) yang dapat dikonfigurasi aktif/nonaktif',
            'Sistem Tukar Poin Loyalitas Member ke potongan harga belanja',
            'Cetak Struk Thermal (58mm & 80mm) via printer Bluetooth/USB/ESC-POS & Logo Toko Custom',
          ]
        },
        {
          category: 'Katalog & Multi-Satuan Produk',
          icon: <Package size={20} className="text-primary" />,
          items: [
            'Pemisahan Katalog Produk dari Laporan Margin sensitif (tampilan operasional bersih & aman dari kasir)',
            'Hierarki kategori produk & pengelompokan rak/etalase',
            'Multi-satuan per produk (Pcs, Box, Dus, Lusin, Karton) dengan rasio konversi otomatis',
            'Daftar Harga Khusus (Pricelist Tier: Grosir, Reseller, Member VIP)',
            'Pelacakan Nomor Batch & Tanggal Kedaluwarsa (Expired Date Warning)',
            'Pelacakan Nomor Serial / IMEI unik untuk produk elektronik & garansi',
            'Import & Export terpisah dengan visual tombol Sky Blue & Emerald Excel',
            'Upload foto produk & cetak label barcode / price tag siap tempel',
          ]
        },
        {
          category: 'Inventaris, Stok & Multi-Outlet',
          icon: <Store size={20} className="text-primary" />,
          items: [
            'Multi-Outlet / Multi-Cabang toko dengan pemisahan stok real-time',
            'Riwayat Kartu Stok (Audit trail mutasi: Masuk, Keluar, Penjualan, Retur, Penyesuaian)',
            'Stock Opname digital dengan deteksi selisih stok (varian) dan rekonsiliasi otomatis',
            'Transfer Stok antar-cabang dengan status Pengiriman (In Transit) & Penerimaan (Received)',
            'Peringatan Stok Rendah (Low Stock Alert) otomatis ketika mendekati batas minimum',
          ]
        },
        {
          category: 'Pengadaan (Purchasing) & Supplier',
          icon: <Truck size={20} className="text-primary" />,
          items: [
            'Manajemen data Supplier lengkap dengan kontak dan termin pembayaran',
            'Purchase Order (PO) pengadaan barang dengan status Draft, Dipesan, Diterima Parsial, & Selesai',
            'Penerimaan Barang (Goods Receipt) langsung menambah kuantitas stok otomatis',
            'Retur Pembelian ke Supplier dengan alasan barang rusak/cacat dan opsi ganti barang/dana',
            'Pencatatan Hutang Usaha (Accounts Payable) dan cicilan pembayaran ke supplier',
          ]
        },
        {
          category: 'Pelanggan, Retur & Loyalitas',
          icon: <Users size={20} className="text-primary" />,
          items: [
            'Database Pelanggan (Member) dengan riwayat akumulasi transaksi belanja',
            'Program Poin Loyalitas (Perhitungan rasio belanja per poin dan nilai tukar Rupiah)',
            'Retur Penjualan Konsumen (Customer Return) dengan pengembalian dana atau tukar produk',
            'Pencatatan Piutang Pelanggan (Accounts Receivable / Kasbon) & pengingat jatuh tempo',
          ]
        },
        {
          category: 'Kasir, Shift & Hak Akses (RBAC)',
          icon: <ShieldCheck size={20} className="text-primary" />,
          items: [
            'Buka & Tutup Shift Kasir dengan perhitungan kas awal, kas masuk, kas keluar, dan selisih kas fisik',
            'Manajemen akun staf kasir/karyawan tanpa batasan akun per outlet',
            'Role-Based Access Control (RBAC) granular: POS, Katalog, Stok, Pembelian, Keuangan, Laporan, Staf, Master',
            'Kunci keamanan otomatis saat sesi kedaluwarsa atau langganan berakhir',
          ]
        },
        {
          category: 'Keuangan, Arus Kas & Pajak',
          icon: <Wallet size={20} className="text-primary" />,
          items: [
            'Pencatatan Pemasukan & Pengeluaran operasional toko non-penjualan',
            'Bagan Akun (Chart of Accounts) untuk Kasir, Kas Toko, Rekening Bank, dan Dompet Digital',
            'Transfer Kas antar-rekening/kasir dengan verifikasi saldo',
            'Laporan Arus Kas (Cash Flow) terpadu antara operasional, penjualan, dan beban',
            'Laporan Rekapitulasi Pajak PPN keluaran penjualan',
            'Tampilan High-Contrast Bold pada baris Laba Bersih (Net Profit) untuk kemudahan analisis owner',
          ]
        },
        {
          category: 'Laporan Komprehensif & Analitik',
          icon: <BarChart2 size={20} className="text-primary" />,
          items: [
            'Laporan Margin & Profitabilitas Produk terdedikasi (/retail/reports/margins) dengan Top 10 Horizontal Bar Chart',
            'Status margin dinamis (Sangat Sehat >=30%, Sehat >=20%, Normal >=10%, Tipis >=0%, Rugi <0%)',
            'Laporan Penjualan harian, mingguan, bulanan dengan filter outlet & kasir',
            'Laporan Laba Kotor (Gross Margin Analysis) per produk dan per transaksi',
            'Laporan Produk Terlaris (Top Selling Items & Dead Stock Analysis)',
            'Laporan Penjualan Barang Konsinyasi (Titip Jual) dengan supplier',
            'Laporan Kinerja Shift & Kasir beserta komparasi performa penjualan',
            'Laporan Metode Pembayaran (Cash vs QRIS vs Transfer vs EDC)',
            'Fitur Cetak & Export Laporan standar resmi A4 / Thermal',
          ]
        },
        {
          category: 'Pengaturan & Verifikasi Usaha (KYC)',
          icon: <Settings size={20} className="text-primary" />,
          items: [
            'Profil Toko, Logo Struk, Nama Usaha, Alamat, Catatan Kaki Nota Struk',
            'Upload gambar QRIS statis toko untuk pembayaran digital',
            'Konfigurasi printer thermal (lebar kertas, pemotong otomatis)',
            'Upload Dokumen Verifikasi Usaha / KYC (KTP/NIB/NPWP) terintegrasi ke Admin SaaS',
          ]
        }
      ],

      erdNodes: [
        {
          id: 'tenants',
          domain: 'core',
          title: 'tenants',
          badge: 'Root Entity',
          color: '#4f46e5',
          x: 40,
          y: 40,
          width: 230,
          height: 220,
          fields: [
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'PK' },
            { name: 'user_id', type: 'BIGINT', key: 'FK' },
            { name: 'business_category_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'subscription_plan', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
            { name: 'trial_ends_at', type: 'DATETIME' },
            { name: 'kyc_status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_outlets',
          domain: 'core',
          title: 'retail_outlets',
          badge: 'Cabang Toko',
          color: '#4f46e5',
          x: 40,
          y: 290,
          width: 230,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'code', type: 'VARCHAR(50)' },
            { name: 'is_main', type: 'BOOLEAN' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_shifts',
          domain: 'pos',
          title: 'retail_shifts',
          badge: 'Shift Kasir',
          color: '#0d9488',
          x: 40,
          y: 500,
          width: 230,
          height: 210,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'user_id', type: 'BIGINT', key: 'FK' },
            { name: 'outlet_id', type: 'BIGINT', key: 'FK' },
            { name: 'starting_cash', type: 'DECIMAL(12,2)' },
            { name: 'actual_ending_cash', type: 'DECIMAL(12,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_roles',
          domain: 'core',
          title: 'retail_roles',
          badge: 'RBAC Staf',
          color: '#475569',
          x: 40,
          y: 740,
          width: 230,
          height: 160,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'permissions', type: 'JSON' },
          ]
        },
        {
          id: 'retail_categories',
          domain: 'catalog',
          title: 'retail_categories',
          badge: 'Kategori',
          color: '#0284c7',
          x: 320,
          y: 40,
          width: 230,
          height: 150,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'slug', type: 'VARCHAR(255)' },
          ]
        },
        {
          id: 'retail_units',
          domain: 'catalog',
          title: 'retail_units',
          badge: 'Satuan',
          color: '#0284c7',
          x: 320,
          y: 220,
          width: 230,
          height: 150,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'short_name', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_products',
          domain: 'catalog',
          title: 'retail_products',
          badge: 'Master Produk',
          color: '#2563eb',
          x: 320,
          y: 400,
          width: 260,
          height: 290,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'category_id', type: 'BIGINT', key: 'FK' },
            { name: 'unit_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'barcode', type: 'VARCHAR(100)' },
            { name: 'purchase_price', type: 'DECIMAL(12,2)' },
            { name: 'selling_price', type: 'DECIMAL(12,2)' },
            { name: 'stock', type: 'DECIMAL(12,2)' },
            { name: 'track_batch', type: 'BOOLEAN' },
            { name: 'track_serial', type: 'BOOLEAN' },
          ]
        },
        {
          id: 'retail_product_units',
          domain: 'catalog',
          title: 'retail_product_units',
          badge: 'Multi-Satuan',
          color: '#3b82f6',
          x: 320,
          y: 720,
          width: 260,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'unit_id', type: 'BIGINT', key: 'FK' },
            { name: 'conversion_factor', type: 'DECIMAL(10,4)' },
            { name: 'selling_price', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_product_stocks',
          domain: 'inventory',
          title: 'retail_product_stocks',
          badge: 'Stok Cabang',
          color: '#d97706',
          x: 630,
          y: 40,
          width: 250,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'outlet_id', type: 'BIGINT', key: 'FK' },
            { name: 'stock_qty', type: 'DECIMAL(12,2)' },
            { name: 'min_stock_alert', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_product_batches',
          domain: 'inventory',
          title: 'retail_product_batches',
          badge: 'Expired & Batch',
          color: '#d97706',
          x: 630,
          y: 240,
          width: 250,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'batch_number', type: 'VARCHAR(100)' },
            { name: 'expired_at', type: 'DATE' },
            { name: 'stock_qty', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_product_serials',
          domain: 'inventory',
          title: 'retail_product_serials',
          badge: 'IMEI / Serial',
          color: '#d97706',
          x: 630,
          y: 440,
          width: 250,
          height: 160,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'serial_number', type: 'VARCHAR(100)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_stock_movements',
          domain: 'inventory',
          title: 'retail_stock_movements',
          badge: 'Audit Mutasi',
          color: '#ea580c',
          x: 630,
          y: 630,
          width: 260,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'outlet_id', type: 'BIGINT', key: 'FK' },
            { name: 'type', type: 'VARCHAR(30)' },
            { name: 'quantity', type: 'DECIMAL(12,2)' },
            { name: 'after_qty', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_stock_opnames',
          domain: 'inventory',
          title: 'retail_stock_opnames',
          badge: 'Opname Fisik',
          color: '#ea580c',
          x: 630,
          y: 860,
          width: 260,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'outlet_id', type: 'BIGINT', key: 'FK' },
            { name: 'opname_number', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
            { name: 'total_discrepancy', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_customers',
          domain: 'pos',
          title: 'retail_customers',
          badge: 'Pelanggan/Member',
          color: '#059669',
          x: 940,
          y: 40,
          width: 250,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'phone', type: 'VARCHAR(50)' },
            { name: 'loyalty_points', type: 'INT' },
            { name: 'total_spent', type: 'DECIMAL(14,2)' },
          ]
        },
        {
          id: 'retail_transactions',
          domain: 'pos',
          title: 'retail_transactions',
          badge: 'Nota Struk Kasir',
          color: '#10b981',
          x: 940,
          y: 250,
          width: 270,
          height: 320,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'outlet_id', type: 'BIGINT', key: 'FK' },
            { name: 'shift_id', type: 'BIGINT', key: 'FK' },
            { name: 'customer_id', type: 'BIGINT', key: 'FK' },
            { name: 'invoice_number', type: 'VARCHAR(50)' },
            { name: 'subtotal', type: 'DECIMAL(12,2)' },
            { name: 'tax_amount', type: 'DECIMAL(12,2)' },
            { name: 'discount_amount', type: 'DECIMAL(12,2)' },
            { name: 'total_amount', type: 'DECIMAL(12,2)' },
            { name: 'payment_method', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_transaction_items',
          domain: 'pos',
          title: 'retail_transaction_items',
          badge: 'Item Belanja',
          color: '#16a34a',
          x: 940,
          y: 600,
          width: 270,
          height: 220,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'transaction_id', type: 'BIGINT', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'quantity', type: 'DECIMAL(12,2)' },
            { name: 'unit_selling_price', type: 'DECIMAL(12,2)' },
            { name: 'subtotal', type: 'DECIMAL(12,2)' },
            { name: 'gross_profit', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_transaction_payments',
          domain: 'pos',
          title: 'retail_trans_payments',
          badge: 'Split Payment',
          color: '#22c55e',
          x: 940,
          y: 850,
          width: 270,
          height: 160,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'transaction_id', type: 'BIGINT', key: 'FK' },
            { name: 'payment_method', type: 'VARCHAR(50)' },
            { name: 'amount', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_suppliers',
          domain: 'purchasing',
          title: 'retail_suppliers',
          badge: 'Pemasok/Distributor',
          color: '#7c3aed',
          x: 1260,
          y: 40,
          width: 250,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'phone', type: 'VARCHAR(50)' },
            { name: 'payment_terms_days', type: 'INT' },
          ]
        },
        {
          id: 'retail_purchases',
          domain: 'purchasing',
          title: 'retail_purchases',
          badge: 'Purchase Order (PO)',
          color: '#8b5cf6',
          x: 1260,
          y: 240,
          width: 250,
          height: 210,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'supplier_id', type: 'BIGINT', key: 'FK' },
            { name: 'po_number', type: 'VARCHAR(50)' },
            { name: 'total_amount', type: 'DECIMAL(12,2)' },
            { name: 'payment_status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_purchase_items',
          domain: 'purchasing',
          title: 'retail_purchase_items',
          badge: 'Baris PO',
          color: '#a855f7',
          x: 1260,
          y: 480,
          width: 250,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'purchase_id', type: 'BIGINT', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'quantity', type: 'DECIMAL(12,2)' },
            { name: 'unit_price', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'retail_payables',
          domain: 'finance',
          title: 'retail_payables',
          badge: 'Hutang Dagang',
          color: '#e11d48',
          x: 1260,
          y: 690,
          width: 250,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'supplier_id', type: 'BIGINT', key: 'FK' },
            { name: 'purchase_id', type: 'BIGINT', key: 'FK' },
            { name: 'remaining_amount', type: 'DECIMAL(12,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'retail_receivables',
          domain: 'finance',
          title: 'retail_receivables',
          badge: 'Piutang Member',
          color: '#f43f5e',
          x: 1260,
          y: 890,
          width: 250,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'customer_id', type: 'BIGINT', key: 'FK' },
            { name: 'transaction_id', type: 'BIGINT', key: 'FK' },
            { name: 'remaining_amount', type: 'DECIMAL(12,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        }
      ],

      erdEdges: [
        { from: 'tenants', to: 'retail_products', label: '1:N', color: '#4f46e5' },
        { from: 'tenants', to: 'retail_outlets', label: '1:N', color: '#4f46e5' },
        { from: 'retail_categories', to: 'retail_products', label: '1:N', color: '#0284c7' },
        { from: 'retail_units', to: 'retail_products', label: '1:N', color: '#0284c7' },
        { from: 'retail_products', to: 'retail_product_units', label: '1:N', color: '#2563eb' },
        { from: 'retail_products', to: 'retail_product_stocks', label: '1:N', color: '#2563eb' },
        { from: 'retail_outlets', to: 'retail_product_stocks', label: '1:N', color: '#4f46e5' },
        { from: 'retail_products', to: 'retail_product_batches', label: '1:N', color: '#d97706' },
        { from: 'retail_products', to: 'retail_product_serials', label: '1:N', color: '#d97706' },
        { from: 'retail_products', to: 'retail_stock_movements', label: '1:N', color: '#ea580c' },
        { from: 'retail_customers', to: 'retail_transactions', label: '1:N', color: '#059669' },
        { from: 'retail_shifts', to: 'retail_transactions', label: '1:N', color: '#0d9488' },
        { from: 'retail_transactions', to: 'retail_transaction_items', label: '1:N', color: '#10b981' },
        { from: 'retail_products', to: 'retail_transaction_items', label: '1:N', color: '#2563eb' },
        { from: 'retail_transactions', to: 'retail_transaction_payments', label: '1:N', color: '#10b981' },
        { from: 'retail_suppliers', to: 'retail_purchases', label: '1:N', color: '#7c3aed' },
        { from: 'retail_purchases', to: 'retail_purchase_items', label: '1:N', color: '#8b5cf6' },
        { from: 'retail_products', to: 'retail_purchase_items', label: '1:N', color: '#2563eb' },
        { from: 'retail_purchases', to: 'retail_payables', label: '1:1', color: '#e11d48' },
        { from: 'retail_transactions', to: 'retail_receivables', label: '1:1', color: '#f43f5e' },
      ],

      erdEntities: [
        {
          table: 'tenants',
          description: 'Tabel induk penyewa / pemilik toko UMKM (Multi-Tenancy Root)',
          keys: ['PK: tenant_id (VARCHAR)', 'FK: user_id', 'FK: business_category_id'],
          columns: ['name', 'business_name', 'subscription_plan', 'status', 'trial_ends_at', 'expires_at', 'kyc_status', 'kyc_document_path', 'settings (JSON)'],
          relationships: ['1 to Many: retail_products', '1 to Many: retail_transactions', '1 to Many: retail_outlets', '1 to Many: retail_shifts']
        },
        {
          table: 'retail_categories',
          description: 'Kategori pengelompokan produk retail',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'slug', 'description', 'created_at', 'updated_at'],
          relationships: ['1 to Many: retail_products']
        },
        {
          table: 'retail_units',
          description: 'Master satuan barang (Pcs, Box, Lusin, Kg, Liter, Pack)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'short_name', 'created_at', 'updated_at'],
          relationships: ['1 to Many: retail_products', '1 to Many: retail_product_units']
        },
        {
          table: 'retail_products',
          description: 'Katalog master data produk retail',
          keys: ['PK: id', 'FK: tenant_id', 'FK: category_id', 'FK: unit_id'],
          columns: ['name', 'barcode', 'sku', 'purchase_price', 'selling_price', 'stock', 'min_stock', 'track_batch', 'track_serial', 'image_path', 'status', 'deleted_at'],
          relationships: ['Many to 1: retail_categories', 'Many to 1: retail_units', '1 to Many: retail_product_units', '1 to Many: retail_product_stocks', '1 to Many: retail_product_batches', '1 to Many: retail_product_serials', '1 to Many: retail_transaction_items']
        },
        {
          table: 'retail_product_units',
          description: 'Konversi multi-satuan per produk (misal: 1 Dus = 24 Pcs, harga grosir berbeda)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: unit_id'],
          columns: ['conversion_factor', 'selling_price', 'barcode', 'is_base_unit'],
          relationships: ['Many to 1: retail_products', 'Many to 1: retail_units']
        },
        {
          table: 'retail_outlets',
          description: 'Cabang atau gerai toko retail (Multi-Outlet)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'code', 'phone', 'address', 'is_main', 'status'],
          relationships: ['1 to Many: retail_product_stocks', '1 to Many: retail_shifts', '1 to Many: retail_transactions']
        },
        {
          table: 'retail_product_stocks',
          description: 'Level stok per produk per outlet cabang',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: outlet_id'],
          columns: ['stock_qty', 'reserved_qty', 'min_stock_alert'],
          relationships: ['Many to 1: retail_products', 'Many to 1: retail_outlets']
        },
        {
          table: 'retail_product_batches',
          description: 'Informasi nomor batch & tanggal expired barang',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: outlet_id'],
          columns: ['batch_number', 'stock_qty', 'expired_at', 'purchase_cost'],
          relationships: ['Many to 1: retail_products']
        },
        {
          table: 'retail_product_serials',
          description: 'Nomor seri / IMEI unik tiap unit barang',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: outlet_id'],
          columns: ['serial_number', 'status (available, sold, returned)', 'warranty_expires_at'],
          relationships: ['Many to 1: retail_products']
        },
        {
          table: 'retail_customers',
          description: 'Master data konsumen / member loyalitas',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'phone', 'email', 'address', 'loyalty_points', 'total_spent', 'pricelist_id'],
          relationships: ['1 to Many: retail_transactions', '1 to Many: retail_receivables']
        },
        {
          table: 'retail_suppliers',
          description: 'Master data distributor & pemasok barang',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'contact_person', 'phone', 'email', 'address', 'payment_terms_days'],
          relationships: ['1 to Many: retail_purchases', '1 to Many: retail_supplier_returns', '1 to Many: retail_payables']
        },
        {
          table: 'retail_shifts',
          description: 'Pencatatan sesi kasir / shift kerja',
          keys: ['PK: id', 'FK: tenant_id', 'FK: user_id', 'FK: outlet_id'],
          columns: ['start_time', 'end_time', 'starting_cash', 'expected_ending_cash', 'actual_ending_cash', 'cash_difference', 'notes', 'status (open, closed)'],
          relationships: ['1 to Many: retail_transactions']
        },
        {
          table: 'retail_transactions',
          description: 'Header transaksi kasir (Struk Penjualan)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: outlet_id', 'FK: shift_id', 'FK: cashier_user_id', 'FK: customer_id'],
          columns: ['invoice_number', 'subtotal', 'discount_amount', 'tax_amount', 'points_redeemed_amount', 'total_amount', 'paid_amount', 'change_amount', 'payment_method', 'payment_status', 'status (completed, cancelled, refunded)', 'created_at'],
          relationships: ['1 to Many: retail_transaction_items', '1 to Many: retail_transaction_payments', '1 to Many: retail_customer_returns']
        },
        {
          table: 'retail_transaction_items',
          description: 'Baris rincian item belanja pada struk',
          keys: ['PK: id', 'FK: tenant_id', 'FK: transaction_id', 'FK: product_id', 'FK: unit_id', 'FK: batch_id'],
          columns: ['quantity', 'unit_purchase_price', 'unit_selling_price', 'discount_amount', 'subtotal', 'gross_profit'],
          relationships: ['Many to 1: retail_transactions', 'Many to 1: retail_products']
        },
        {
          table: 'retail_transaction_payments',
          description: 'Rincian metode split payment per transaksi',
          keys: ['PK: id', 'FK: tenant_id', 'FK: transaction_id'],
          columns: ['payment_method (cash, qris, transfer, card)', 'amount', 'reference_number'],
          relationships: ['Many to 1: retail_transactions']
        },
        {
          table: 'retail_stock_movements',
          description: 'Buku besar log audit mutasi kartu stok produk',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: outlet_id', 'FK: user_id'],
          columns: ['type (in, out, sale, purchase, transfer_in, transfer_out, opname_adj, return)', 'quantity', 'before_qty', 'after_qty', 'reference_type', 'reference_id', 'notes'],
          relationships: ['Many to 1: retail_products']
        },
        {
          table: 'retail_stock_opnames',
          description: 'Header kegiatan fisik penghitungan stok gudang/toko',
          keys: ['PK: id', 'FK: tenant_id', 'FK: outlet_id', 'FK: conducted_by_user_id'],
          columns: ['opname_number', 'opname_date', 'status (draft, finalized)', 'total_system_qty', 'total_physical_qty', 'total_discrepancy_qty', 'total_financial_loss'],
          relationships: ['1 to Many: retail_stock_opname_items']
        },
        {
          table: 'retail_stock_opname_items',
          description: 'Rincian per produk hasil penghitungan opname fisik',
          keys: ['PK: id', 'FK: tenant_id', 'FK: stock_opname_id', 'FK: product_id'],
          columns: ['system_stock', 'physical_stock', 'difference_stock', 'unit_cost', 'adjustment_reason'],
          relationships: ['Many to 1: retail_stock_opnames', 'Many to 1: retail_products']
        },
        {
          table: 'retail_stock_transfers',
          description: 'Header mutasi pemindahan stok antar-cabang',
          keys: ['PK: id', 'FK: tenant_id', 'FK: from_outlet_id', 'FK: to_outlet_id', 'FK: requester_user_id'],
          columns: ['transfer_number', 'status (draft, shipped, received, cancelled)', 'shipped_at', 'received_at', 'notes'],
          relationships: ['1 to Many: retail_stock_transfer_items']
        },
        {
          table: 'retail_stock_transfer_items',
          description: 'Rincian produk yang dikirim dalam mutasi transfer',
          keys: ['PK: id', 'FK: tenant_id', 'FK: transfer_id', 'FK: product_id'],
          columns: ['qty_sent', 'qty_received', 'notes'],
          relationships: ['Many to 1: retail_stock_transfers', 'Many to 1: retail_products']
        },
        {
          table: 'retail_purchases',
          description: 'Faktur Pengadaan / Purchase Order dari Supplier',
          keys: ['PK: id', 'FK: tenant_id', 'FK: supplier_id', 'FK: outlet_id'],
          columns: ['po_number', 'purchase_date', 'due_date', 'total_amount', 'paid_amount', 'payment_status (unpaid, partial, paid)', 'delivery_status (pending, received)'],
          relationships: ['1 to Many: retail_purchase_items', '1 to 1: retail_payables']
        },
        {
          table: 'retail_purchase_items',
          description: 'Daftar barang dan harga modal dalam nota pembelian',
          keys: ['PK: id', 'FK: tenant_id', 'FK: purchase_id', 'FK: product_id'],
          columns: ['quantity', 'unit_price', 'subtotal', 'batch_number', 'expired_at'],
          relationships: ['Many to 1: retail_purchases', 'Many to 1: retail_products']
        },
        {
          table: 'retail_payables',
          description: 'Buku Hutang Dagang ke Supplier (Accounts Payable)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: supplier_id', 'FK: purchase_id'],
          columns: ['invoice_number', 'total_amount', 'paid_amount', 'remaining_amount', 'due_date', 'status (unpaid, partial, paid)'],
          relationships: ['1 to Many: retail_payable_payments']
        },
        {
          table: 'retail_receivables',
          description: 'Buku Piutang Dagang Konsumen (Accounts Receivable / Kasbon)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: customer_id', 'FK: transaction_id'],
          columns: ['invoice_number', 'total_amount', 'paid_amount', 'remaining_amount', 'due_date', 'status (unpaid, partial, paid)'],
          relationships: ['1 to Many: retail_receivable_payments']
        },
        {
          table: 'retail_roles',
          description: 'Daftar peran & hak akses kustom staf retail (RBAC)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'permissions (JSON: pos, catalog, inventory, purchasing, finance, reports, staff, master)'],
          relationships: ['1 to Many: users']
        },
        {
          table: 'retail_settings',
          description: 'Konfigurasi spesifik toko retail per tenant',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['store_name', 'store_phone', 'store_address', 'receipt_header', 'receipt_footer', 'qris_image_path', 'store_icon_path', 'enable_tax', 'tax_rate', 'enable_loyalty', 'points_ratio', 'point_value_rupiah', 'low_stock_default_threshold']
        }
      ],

      directoryStructure: [
        {
          section: 'Backend Architecture (Laravel 11)',
          tree: `backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── Retail/
│   │   │   │   ├── RetailStockController.php          # Manajemen & Log Stok
│   │   │   │   ├── RetailStockOpnameController.php    # Stock Opname Digital
│   │   │   │   ├── RetailStockTransferController.php  # Mutasi Antar Cabang
│   │   │   │   ├── RetailProductBatchController.php   # Batch & Expired Tracker
│   │   │   │   ├── RetailProductSerialController.php  # Serial Number & IMEI
│   │   │   │   ├── RetailOutletController.php         # Multi-Outlet Master
│   │   │   ├── RetailMasterController.php             # Katalog, Satuan, Kategori
│   │   │   ├── RetailTransactionController.php        # POS Engine & Struk Kasir
│   │   │   ├── RetailPurchaseController.php           # PO & Pembelian Supplier
│   │   │   ├── RetailShiftController.php              # Buka/Tutup Shift Kasir
│   │   │   ├── RetailFinanceController.php            # Arus Kas, Kasir & Pajak
│   │   │   ├── RetailReportController.php             # Laporan & Analisis Margin
│   │   │   ├── RetailRoleController.php               # Role & Hak Akses Staf
│   │   │   ├── RetailStaffController.php              # Akun Karyawan Kasir
│   │   │   ├── TenantKycController.php                # Dokumen Verifikasi Usaha
│   │   │   └── RetailSettingsController.php           # Pengaturan Toko & Printer
│   │   ├── Middleware/
│   │   │   ├── TenantMiddleware.php                   # Multi-Tenancy Resolver
│   │   │   ├── CheckSubscription.php                  # Guard Masa Aktif Langganan
│   │   │   ├── CheckPlanFeature.php                   # Guard Fitur (Basic vs Pro)
│   │   │   └── CheckRetailPermission.php              # RBAC Granular Staf Kasir
│   │   ├── Models/
│   │   │   ├── Tenant.php, RetailProduct.php, RetailTransaction.php...
│   └── Console/Commands/
│       └── CheckExpiredSubscriptions.php              # Auto-Expire Scheduler
├── database/migrations/                               # 28+ Migrasi Khusus Retail
└── routes/api.php                                     # RESTful Endpoints Route Group`
        },
        {
          section: 'Frontend Architecture (React 18 + Vite)',
          tree: `frontend/src/
├── apps/retail/
│   ├── pages/
│   │   ├── Dashboard.jsx        # Ringkasan Penjualan, Tren & Stok Tipis
│   │   ├── Pos.jsx              # Kasir Cepat, Barcode, Split Payment, Struk
│   │   ├── Products.jsx         # Katalog Master, Batch, Serial, Impor/Ekspor
│   │   ├── Inventory.jsx        # Multi-Outlet Stock Levels & Low Stock Alert
│   │   ├── StockOpname.jsx      # Penghitungan Opname Fisik & Rekonsiliasi
│   │   ├── StockTransfers.jsx   # Pemindahan Stok Antar-Cabang (In-Transit)
│   │   ├── PurchaseOrders.jsx   # PO ke Supplier & Penerimaan Barang
│   │   ├── SupplierReturns.jsx  # Retur Pembelian ke Supplier
│   │   ├── CustomerReturns.jsx  # Retur Penjualan dari Konsumen
│   │   ├── Shifts.jsx           # Rekonsiliasi Kas Laci & Riwayat Shift Kasir
│   │   ├── FinanceSummary.jsx   # Buku Kas Toko, Arus Kas & PPN
│   │   ├── SalesReport.jsx      # Analitik Penjualan & Margin Laba Kotor
│   │   ├── ProductMarginReport.jsx # Laporan Margin Produk & Top 10 Profit
│   │   ├── Staff.jsx & Roles.jsx# Manajemen Karyawan & Hak Akses (RBAC)
│   │   └── Settings.jsx         # Branding Nota, Logo, QRIS, & Tab KYC
│   ├── components/              # Retail-specific widgets & thermal receipt modals
│   └── retail.css               # Modul Design System & Styling Tokens
├── routes/retail.routes.jsx     # Route Map & CategoryRoute Guards
└── services/api.js              # Axios Client & Interceptor (401/402/403)`
        }
      ],

      apiEndpoints: [
        { method: 'POST', path: '/api/retail/pos/checkout', name: 'Checkout POS Transaksi', perm: 'pos', desc: 'Membuat struk belanja, memotong stok real-time, catat mutasi stok & poin loyalitas' },
        { method: 'GET', path: '/api/retail/pos/hold', name: 'Ambil Antrean Transaksi Hold', perm: 'pos', desc: 'Melihat dan mengambil kembali transaksi pelanggan yang ditunda di kasir' },
        { method: 'GET', path: '/api/retail/products', name: 'List Katalog Produk', perm: 'catalog', desc: 'Mengambil data produk lengkap dengan filter kategori, barcode, & status stok' },
        { method: 'POST', path: '/api/retail/products', name: 'Tambah Produk Baru', perm: 'catalog', desc: 'Menyimpan produk beserta varian multi-satuan, batch, dan nomor serial' },
        { method: 'POST', path: '/api/retail/stock-opnames/finalize', name: 'Finalisasi Stock Opname', perm: 'inventory', desc: 'Menerapkan penyesuaian selisih stok fisik langsung ke kartu stok' },
        { method: 'POST', path: '/api/retail/stock-transfers', name: 'Kirim Transfer Stok Cabang', perm: 'inventory', desc: 'Membuat pengiriman stok ke outlet lain dengan status in-transit' },
        { method: 'POST', path: '/api/retail/purchases', name: 'Simpan Purchase Order', perm: 'purchasing', desc: 'Mencatat PO ke supplier dan membuat jadwal hutang tempo otomatis' },
        { method: 'POST', path: '/api/retail/shifts/close', name: 'Tutup Shift Kasir', perm: 'pos', desc: 'Menghitung total kas laci dan mencatat selisih fisik vs sistem' },
        { method: 'GET', path: '/api/retail/reports/sales', name: 'Laporan Penjualan & Laba', perm: 'reports', desc: 'Agregasi omzet, HPP (COGS), dan laba bersih per rentang tanggal' },
        { method: 'GET', path: '/api/retail/reports/product-margins', name: 'Laporan Margin Produk', perm: 'reports', desc: 'Agregasi omzet, HPP riil, laba kotor, dan % margin per produk dengan Top 10 ranking' },
        { method: 'POST', path: '/api/settings/kyc', name: 'Upload Dokumen KYC Usaha', perm: 'master', desc: 'Mengunggah KTP/NIB untuk diverifikasi oleh Super Admin' }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // [2] MODUL RESTO & KULINER (F&B)
    // ─────────────────────────────────────────────────────────────────────────
    kuliner: {
      key: 'kuliner',
      icon: <Utensils size={18} />,
      title: 'Modul Resto & Kuliner (F&B / Kitchen Management)',
      description: 'Sistem operasional menyeluruh untuk kafe, restoran, warung makan, dan cloud kitchen. Dilengkapi manajemen meja & QR self-order, integrasi dapur Kitchen Display System (KDS), Bill of Materials (BOM Resep), pemantauan bahan baku otomatis, tracking sisa limbah (waste), serta kasir shift.',
      version: 'v2.2.0 (F&B Multi-Table Ready)',
      lastUpdated: '2026-08-20',
      leadDeveloper: 'Bizora F&B Engineering Team',

      domains: [
        { id: 'all', label: 'Semua Domain (Full ERD Resto)', color: '#6366f1' },
        { id: 'core', label: 'Core, Meja & QR Self-Order', color: '#4f46e5' },
        { id: 'menu', label: 'Menu, Modifier & Varian', color: '#0284c7' },
        { id: 'recipe', label: 'Bahan Baku, Resep (BOM) & Waste', color: '#d97706' },
        { id: 'order', label: 'Pesanan, KDS & Kasir Shift', color: '#10b981' },
        { id: 'purchasing', label: 'Pengadaan Bahan Dapur', color: '#7c3aed' },
        { id: 'finance', label: 'Keuangan, Promo & Ulasan', color: '#e11d48' },
      ],

      techStack: {
        backend: [
          { name: 'Laravel 11.x', role: 'Backend REST API Engine & Real-time KDS Polling', tag: 'Framework' },
          { name: 'PHP 8.2+', role: 'Core Execution Runtime', tag: 'Core' },
          { name: 'BOM Deduction Engine', role: 'Auto-deduct raw ingredient stock upon order preparation', tag: 'Recipe Core' },
          { name: 'Laravel Sanctum', role: 'Token-based Authentication for Staff, Cashier & Kiosk', tag: 'Auth' },
          { name: 'Multi-Tenant Isolation', role: 'Strict tenant_id partition for F&B operations', tag: 'Security' },
          { name: 'CheckKulinerPermission', role: 'Granular RBAC: Waiter, Chef, Barista, Cashier, Manager', tag: 'RBAC' },
          { name: 'Kitchen Order Dispatcher', role: 'Real-time state tracking (Pending -> Preparing -> Ready -> Served)', tag: 'KDS' },
        ],
        frontend: [
          { name: 'React 18.x', role: 'High-performance interactive UI component tree', tag: 'UI Library' },
          { name: 'Vite 5.x', role: 'Lightning-fast client bundling & hot reload', tag: 'Bundler' },
          { name: 'qrcode.react', role: 'Dynamic QR Code Generator per meja resto untuk Self-Order', tag: 'QR Engine' },
          { name: 'React Router v6', role: 'Storefront, QR Self-Order & Protected Admin Routing', tag: 'Routing' },
          { name: 'KDS Live Audio Alert', role: 'Sound chime on new incoming kitchen orders', tag: 'Audio' },
          { name: 'Context API', role: 'Tenant context, active table order cart & live shift state', tag: 'State' },
          { name: 'CSS Design System', role: 'Tailored F&B theme variables (--kuliner-*) & KDS dark mode', tag: 'Styling' },
        ],
        database: [
          { name: 'MySQL 8.0 / MariaDB', role: 'Primary RDBMS for transactional F&B records', tag: 'Production DB' },
          { name: 'ACID Transactions', role: 'Atomic table lock on order creation & split payment', tag: 'Integrity' },
          { name: 'BOM Triggers & Log', role: 'Ingredient stock movements audit for every cooking batch', tag: 'Audit' },
          { name: 'Cascade & Soft Deletes', role: 'Safe retention for recipes, orders, and financial expenses', tag: 'Retention' },
        ]
      },

      features: [
        {
          category: 'Menu Engineering, Resep & BOM',
          icon: <Utensils size={20} className="text-primary" />,
          items: [
            'Bill of Materials (BOM Resep): Penentuan takaran bahan baku per porsi menu',
            'Potong stok bahan baku otomatis saat pesanan masuk tahap masak di dapur',
            'Grup Modifier Varian Menu (Level Pedas, Suhu Ice/Hot, Pilihan Topping, Sugar Level)',
            'Menu Tambahan Berbayar (Add-ons: Extra Telur, Nasi Tambah, Keju Mozzarella)',
            'Paket Kombo / Paket Hemat (Bundles) dengan diskon harga paket otomatis',
            'Kalkulasi Food Cost / HPP Hidangan otomatis berdasarkan harga beli bahan baku',
          ]
        },
        {
          category: 'Manajemen Meja & QR Self-Order',
          icon: <QrCode size={20} className="text-primary" />,
          items: [
            'Visual denah tata letak meja (Table Layout Map) dengan nomor & kapasitas kursi',
            'Generate QR Code Meja Unik untuk pemesanan mandiri oleh tamu dari smartphone',
            'Status Meja Real-time: Kosong (Available), Terisi (Occupied), Dipesan (Reserved)',
            'Fitur Pindah Meja (Move Table) dan Gabung Tagihan Meja (Merge Bills)',
          ]
        },
        {
          category: 'Order Lifecycle & Kitchen Display (KDS)',
          icon: <Flame size={20} className="text-primary" />,
          items: [
            'Mode Pesanan Fleksibel: Dine-in (Makan di Tempat), Takeaway (Bungkus), Delivery',
            'Kitchen Display System (KDS): Layar antrean digital khusus koki dan barista di dapur',
            'Status Alur Pesanan: Pending ➔ Sedang Dimasak (Preparing) ➔ Siap Saji (Ready) ➔ Selesai (Served)',
            'Pencatatan Catatan Koki Khusus per Item (misal: "Jangan pakai daun bawang, sambal dipisah")',
            'Cetak Tiket Pesanan Dapur (Kitchen Order Ticket / KOT) otomatis',
          ]
        },
        {
          category: 'Bahan Baku & Waste Tracking',
          icon: <Trash2 size={20} className="text-primary" />,
          items: [
            'Master Data Bahan Baku (Daging, Beras, Minyak, Sayur, Bumbu) dengan multi-satuan gram/ml/kg',
            'Buku Besar Mutasi Bahan Baku (Masuk, Terpakai Resep, Rusak, Penyesuaian)',
            'Stock Opname Fisik Bahan Baku Dapur dengan kalkulasi selisih susut',
            'Waste Tracking: Pencatatan limbah sisa makanan / bahan expired untuk mencegah kebocoran biaya (Loss Prevention)',
          ]
        },
        {
          category: 'Pengadaan Bahan & Supplier Dapur',
          icon: <Truck size={20} className="text-primary" />,
          items: [
            'Database Supplier Bahan Segar, Sayur, Daging & Packaging dengan kontak cepat',
            'Purchase Order (PO) Bahan Baku Dapur dengan status pesanan dan tempo pembayaran',
            'Penerimaan Bahan Baku Dapur langsung memperbarui saldo stok dan HPP rata-rata',
          ]
        },
        {
          category: 'Kasir Resto, Split Bill & Shift',
          icon: <ShoppingCart size={20} className="text-primary" />,
          items: [
            'Kasir Point of Sale F&B cepat dengan pencarian menu & visual tombol foto menu',
            'Fitur Split Bill: Pembayaran terpisah per orang atau per porsi dalam 1 meja',
            'Buka & Tutup Shift Kasir Restoran dengan rekonsiliasi kas laci dan uang modal',
            'Cetak Struk Pembayaran Konsumen (Thermal 58mm/80mm) & QRIS Statis Dinamis',
          ]
        },
        {
          category: 'Promo, Diskon & Ulasan Tamu',
          icon: <Tag size={20} className="text-primary" />,
          items: [
            'Manajemen Diskon & Promo Jam Tertentu (Happy Hour / Promo Makan Siang)',
            'Kupon Voucher Potongan Belanja Resto dengan batasan minimal transaksi',
            'Testimonial & Review Rating Bintang dari tamu restoran untuk evaluasi rasa & layanan',
          ]
        },
        {
          category: 'Keuangan & Beban Dapur',
          icon: <Wallet size={20} className="text-primary" />,
          items: [
            'Pencatatan Beban Operasional Dapur (Gas LPG, Listrik, Es Batu, Kebersihan)',
            'Bagan Kategori Keuangan Restoran khusus F&B',
            'Laporan Arus Kas (Cash Flow) terpadu antara penjualan hidangan dan belanja pasar',
          ]
        },
        {
          category: 'Laporan & Menu Engineering Analytics',
          icon: <BarChart2 size={20} className="text-primary" />,
          items: [
            'Matriks Menu Engineering: Klasifikasi Menu Bintang (Stars), Kuda Beban (Plowhorses), Teka-teki (Puzzles), dan Anjing (Dogs)',
            'Laporan Food Cost Percentage & Margin Keuntungan per menu hidangan',
            'Laporan Kecepatan Pelayanan Dapur (Rata-rata waktu masak dari order sampai ready)',
            'Laporan Rekapitulasi Pajak Restoran (PB1 / Daerah) dan Service Charge',
          ]
        }
      ],

      erdNodes: [
        // Kolom 1: Core, Meja & RBAC Resto
        {
          id: 'tenants',
          domain: 'core',
          title: 'tenants',
          badge: 'Root Entity',
          color: '#4f46e5',
          x: 40,
          y: 40,
          width: 230,
          height: 220,
          fields: [
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'PK' },
            { name: 'user_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'business_name', type: 'VARCHAR(255)' },
            { name: 'subscription_plan', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
            { name: 'trial_ends_at', type: 'DATETIME' },
          ]
        },
        {
          id: 'kuliner_tables',
          domain: 'core',
          title: 'kuliner_tables',
          badge: 'Meja Resto',
          color: '#4f46e5',
          x: 40,
          y: 290,
          width: 230,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'table_number', type: 'VARCHAR(50)' },
            { name: 'capacity', type: 'INT' },
            { name: 'qr_code_token', type: 'VARCHAR(100)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'kuliner_shifts',
          domain: 'order',
          title: 'kuliner_shifts',
          badge: 'Shift Kasir Resto',
          color: '#0d9488',
          x: 40,
          y: 500,
          width: 230,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'user_id', type: 'BIGINT', key: 'FK' },
            { name: 'starting_cash', type: 'DECIMAL(12,2)' },
            { name: 'actual_ending_cash', type: 'DECIMAL(12,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'kuliner_roles',
          domain: 'core',
          title: 'kuliner_roles',
          badge: 'RBAC Resto',
          color: '#475569',
          x: 40,
          y: 730,
          width: 230,
          height: 160,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'permissions', type: 'JSON' },
          ]
        },

        // Kolom 2: Menu, Kategori & Varian
        {
          id: 'kuliner_categories',
          domain: 'menu',
          title: 'kuliner_categories',
          badge: 'Kategori Menu',
          color: '#0284c7',
          x: 320,
          y: 40,
          width: 230,
          height: 150,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'icon', type: 'VARCHAR(100)' },
          ]
        },
        {
          id: 'kuliner_products',
          domain: 'menu',
          title: 'kuliner_products',
          badge: 'Master Menu Hidangan',
          color: '#2563eb',
          x: 320,
          y: 220,
          width: 260,
          height: 270,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'category_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'price', type: 'DECIMAL(12,2)' },
            { name: 'cogs_estimate', type: 'DECIMAL(12,2)' },
            { name: 'is_available', type: 'BOOLEAN' },
            { name: 'has_recipe', type: 'BOOLEAN' },
          ]
        },
        {
          id: 'kuliner_modifier_groups',
          domain: 'menu',
          title: 'kuliner_modifier_groups',
          badge: 'Grup Varian',
          color: '#3b82f6',
          x: 320,
          y: 520,
          width: 260,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'is_required', type: 'BOOLEAN' },
            { name: 'min_selection', type: 'INT' },
            { name: 'max_selection', type: 'INT' },
          ]
        },
        {
          id: 'kuliner_modifier_options',
          domain: 'menu',
          title: 'kuliner_mod_options',
          badge: 'Pilihan Varian',
          color: '#3b82f6',
          x: 320,
          y: 720,
          width: 260,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'modifier_group_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'extra_price', type: 'DECIMAL(12,2)' },
          ]
        },

        // Kolom 3: Bahan Baku, BOM Resep & Waste
        {
          id: 'kuliner_ingredients',
          domain: 'recipe',
          title: 'kuliner_ingredients',
          badge: 'Bahan Baku Dapur',
          color: '#d97706',
          x: 630,
          y: 40,
          width: 250,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'unit', type: 'VARCHAR(50)' },
            { name: 'current_stock', type: 'DECIMAL(12,2)' },
            { name: 'min_stock_alert', type: 'DECIMAL(12,2)' },
            { name: 'cost_per_unit', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'kuliner_recipe_items',
          domain: 'recipe',
          title: 'kuliner_recipe_items',
          badge: 'BOM / Resep Menu',
          color: '#d97706',
          x: 630,
          y: 270,
          width: 250,
          height: 190,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'ingredient_id', type: 'BIGINT', key: 'FK' },
            { name: 'quantity_required', type: 'DECIMAL(10,4)' },
          ]
        },
        {
          id: 'kuliner_wastes',
          domain: 'recipe',
          title: 'kuliner_wastes',
          badge: 'Limbah / Bahan Rusak',
          color: '#ea580c',
          x: 630,
          y: 490,
          width: 250,
          height: 190,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'ingredient_id', type: 'BIGINT', key: 'FK' },
            { name: 'quantity', type: 'DECIMAL(12,2)' },
            { name: 'financial_loss', type: 'DECIMAL(12,2)' },
            { name: 'reason', type: 'VARCHAR(255)' },
          ]
        },
        {
          id: 'kuliner_ing_movements',
          domain: 'recipe',
          title: 'kuliner_ing_movements',
          badge: 'Kartu Stok Bahan',
          color: '#ea580c',
          x: 630,
          y: 710,
          width: 250,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'ingredient_id', type: 'BIGINT', key: 'FK' },
            { name: 'type', type: 'VARCHAR(30)' },
            { name: 'quantity', type: 'DECIMAL(12,2)' },
            { name: 'after_stock', type: 'DECIMAL(12,2)' },
          ]
        },

        // Kolom 4: Pesanan & KDS
        {
          id: 'kuliner_orders',
          domain: 'order',
          title: 'kuliner_orders',
          badge: 'Nota Pesanan Resto',
          color: '#10b981',
          x: 930,
          y: 40,
          width: 270,
          height: 310,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'order_number', type: 'VARCHAR(50)' },
            { name: 'table_id', type: 'BIGINT', key: 'FK' },
            { name: 'shift_id', type: 'BIGINT', key: 'FK' },
            { name: 'order_type', type: 'VARCHAR(30)' },
            { name: 'total_amount', type: 'DECIMAL(12,2)' },
            { name: 'payment_status', type: 'VARCHAR(20)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'kuliner_order_items',
          domain: 'order',
          title: 'kuliner_order_items',
          badge: 'Item Pesanan & Notes',
          color: '#16a34a',
          x: 930,
          y: 380,
          width: 270,
          height: 240,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'order_id', type: 'BIGINT', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'quantity', type: 'INT' },
            { name: 'unit_price', type: 'DECIMAL(12,2)' },
            { name: 'notes', type: 'TEXT' },
            { name: 'kitchen_status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'kuliner_promos',
          domain: 'finance',
          title: 'kuliner_promos',
          badge: 'Promo & Kupon',
          color: '#059669',
          x: 930,
          y: 650,
          width: 270,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'title', type: 'VARCHAR(255)' },
            { name: 'discount_type', type: 'VARCHAR(20)' },
            { name: 'discount_value', type: 'DECIMAL(10,2)' },
          ]
        },

        // Kolom 5: Pengadaan & Keuangan Dapur
        {
          id: 'kuliner_suppliers',
          domain: 'purchasing',
          title: 'kuliner_suppliers',
          badge: 'Pemasok Bahan Segar',
          color: '#7c3aed',
          x: 1250,
          y: 40,
          width: 250,
          height: 170,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'phone', type: 'VARCHAR(50)' },
          ]
        },
        {
          id: 'kuliner_purchases',
          domain: 'purchasing',
          title: 'kuliner_purchases',
          badge: 'PO Belanja Bahan',
          color: '#8b5cf6',
          x: 1250,
          y: 240,
          width: 250,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'supplier_id', type: 'BIGINT', key: 'FK' },
            { name: 'purchase_number', type: 'VARCHAR(50)' },
            { name: 'total_amount', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'kuliner_purchase_items',
          domain: 'purchasing',
          title: 'kuliner_purchase_items',
          badge: 'Item Belanja Bahan',
          color: '#a855f7',
          x: 1250,
          y: 470,
          width: 250,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'purchase_id', type: 'BIGINT', key: 'FK' },
            { name: 'ingredient_id', type: 'BIGINT', key: 'FK' },
            { name: 'quantity', type: 'DECIMAL(12,2)' },
            { name: 'unit_price', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'kuliner_expenses',
          domain: 'finance',
          title: 'kuliner_expenses',
          badge: 'Beban Operasional',
          color: '#e11d48',
          x: 1250,
          y: 680,
          width: 250,
          height: 180,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'amount', type: 'DECIMAL(12,2)' },
            { name: 'category', type: 'VARCHAR(100)' },
            { name: 'description', type: 'TEXT' },
          ]
        }
      ],

      erdEdges: [
        { from: 'tenants', to: 'kuliner_products', label: '1:N', color: '#4f46e5' },
        { from: 'tenants', to: 'kuliner_tables', label: '1:N', color: '#4f46e5' },
        { from: 'tenants', to: 'kuliner_ingredients', label: '1:N', color: '#4f46e5' },
        { from: 'kuliner_categories', to: 'kuliner_products', label: '1:N', color: '#0284c7' },
        { from: 'kuliner_products', to: 'kuliner_recipe_items', label: '1:N', color: '#2563eb' },
        { from: 'kuliner_ingredients', to: 'kuliner_recipe_items', label: '1:N', color: '#d97706' },
        { from: 'kuliner_products', to: 'kuliner_modifier_groups', label: '1:N', color: '#3b82f6' },
        { from: 'kuliner_modifier_groups', to: 'kuliner_modifier_options', label: '1:N', color: '#3b82f6' },
        { from: 'kuliner_tables', to: 'kuliner_orders', label: '1:N', color: '#4f46e5' },
        { from: 'kuliner_shifts', to: 'kuliner_orders', label: '1:N', color: '#0d9488' },
        { from: 'kuliner_orders', to: 'kuliner_order_items', label: '1:N', color: '#10b981' },
        { from: 'kuliner_products', to: 'kuliner_order_items', label: '1:N', color: '#2563eb' },
        { from: 'kuliner_ingredients', to: 'kuliner_wastes', label: '1:N', color: '#d97706' },
        { from: 'kuliner_ingredients', to: 'kuliner_ing_movements', label: '1:N', color: '#ea580c' },
        { from: 'kuliner_suppliers', to: 'kuliner_purchases', label: '1:N', color: '#7c3aed' },
        { from: 'kuliner_purchases', to: 'kuliner_purchase_items', label: '1:N', color: '#8b5cf6' },
        { from: 'kuliner_ingredients', to: 'kuliner_purchase_items', label: '1:N', color: '#d97706' },
      ],

      erdEntities: [
        {
          table: 'tenants',
          description: 'Penyewa / Pemilik Resto UMKM (Multi-Tenancy Root)',
          keys: ['PK: tenant_id (VARCHAR)', 'FK: user_id'],
          columns: ['name', 'business_name', 'subscription_plan', 'status', 'trial_ends_at', 'settings (JSON)'],
          relationships: ['1 to Many: kuliner_products', '1 to Many: kuliner_tables', '1 to Many: kuliner_orders', '1 to Many: kuliner_ingredients']
        },
        {
          table: 'kuliner_tables',
          description: 'Master Denah & Nomor Meja Tamu Restoran',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['table_number', 'capacity', 'qr_code_token', 'status (available, occupied, reserved)', 'created_at'],
          relationships: ['1 to Many: kuliner_orders']
        },
        {
          table: 'kuliner_categories',
          description: 'Kategori Menu F&B (Makanan, Minuman, Snack, Paket)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'icon', 'sort_order'],
          relationships: ['1 to Many: kuliner_products']
        },
        {
          table: 'kuliner_products',
          description: 'Master Menu Hidangan & Minuman Restoran',
          keys: ['PK: id', 'FK: tenant_id', 'FK: category_id'],
          columns: ['name', 'price', 'cogs_estimate', 'image_path', 'is_available', 'has_recipe', 'deleted_at'],
          relationships: ['Many to 1: kuliner_categories', '1 to Many: kuliner_recipe_items', '1 to Many: kuliner_order_items']
        },
        {
          table: 'kuliner_ingredients',
          description: 'Master Bahan Baku Dapur (Daging, Beras, Sayur, Sirup)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'unit (gram, ml, pcs)', 'current_stock', 'min_stock_alert', 'cost_per_unit'],
          relationships: ['1 to Many: kuliner_recipe_items', '1 to Many: kuliner_ingredient_stock_movements', '1 to Many: kuliner_wastes']
        },
        {
          table: 'kuliner_recipe_items',
          description: 'Bill of Materials (BOM) / Resep Takaran Bahan per Menu',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: ingredient_id'],
          columns: ['quantity_required', 'unit'],
          relationships: ['Many to 1: kuliner_products', 'Many to 1: kuliner_ingredients']
        },
        {
          table: 'kuliner_modifier_groups',
          description: 'Grup Pilihan Varian Hidangan (Level Pedas, Suhu, Topping)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'is_required', 'min_selection', 'max_selection'],
          relationships: ['1 to Many: kuliner_modifier_options']
        },
        {
          table: 'kuliner_modifier_options',
          description: 'Pilihan Opsi Varian Hidangan (Pedas Sedang, Extra Keju)',
          keys: ['PK: id', 'FK: modifier_group_id'],
          columns: ['name', 'extra_price'],
          relationships: ['Many to 1: kuliner_modifier_groups']
        },
        {
          table: 'kuliner_orders',
          description: 'Header Transaksi Pesanan Meja / Kasir Restoran',
          keys: ['PK: id', 'FK: tenant_id', 'FK: table_id', 'FK: shift_id'],
          columns: ['order_number', 'order_type (dine_in, takeaway, delivery)', 'customer_name', 'subtotal', 'tax_amount', 'total_amount', 'payment_status (pending, paid)', 'status (pending, preparing, ready, served, completed)'],
          relationships: ['1 to Many: kuliner_order_items', 'Many to 1: kuliner_tables', 'Many to 1: kuliner_shifts']
        },
        {
          table: 'kuliner_order_items',
          description: 'Rincian Menu Dipesan beserta Catatan Khusus Koki',
          keys: ['PK: id', 'FK: tenant_id', 'FK: order_id', 'FK: product_id'],
          columns: ['quantity', 'unit_price', 'subtotal', 'notes (e.g. tanpa pedas)', 'kitchen_status (queue, cooking, ready)'],
          relationships: ['Many to 1: kuliner_orders', 'Many to 1: kuliner_products']
        },
        {
          table: 'kuliner_wastes',
          description: 'Pencatatan Bahan Rusak / Makanan Terbuang (Loss Prevention)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: ingredient_id'],
          columns: ['quantity', 'financial_loss', 'reason (expired, gosong, rusak)', 'waste_date'],
          relationships: ['Many to 1: kuliner_ingredients']
        },
        {
          table: 'kuliner_ingredient_stock_movements',
          description: 'Log Audit Kartu Stok Bahan Baku Dapur',
          keys: ['PK: id', 'FK: tenant_id', 'FK: ingredient_id'],
          columns: ['type (purchase, recipe_usage, waste, opname_adj)', 'quantity', 'before_stock', 'after_stock', 'notes'],
          relationships: ['Many to 1: kuliner_ingredients']
        },
        {
          table: 'kuliner_shifts',
          description: 'Sesi Kasir Restoran & Rekonsiliasi Kas Laci',
          keys: ['PK: id', 'FK: tenant_id', 'FK: user_id'],
          columns: ['starting_cash', 'actual_ending_cash', 'cash_difference', 'status (open, closed)'],
          relationships: ['1 to Many: kuliner_orders']
        },
        {
          table: 'kuliner_suppliers',
          description: 'Master Pemasok Sayur, Daging & Bahan Segar',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'contact_person', 'phone', 'address'],
          relationships: ['1 to Many: kuliner_purchases']
        },
        {
          table: 'kuliner_purchases',
          description: 'Faktur Pengadaan Belanja Bahan Dapur',
          keys: ['PK: id', 'FK: tenant_id', 'FK: supplier_id'],
          columns: ['purchase_number', 'total_amount', 'purchase_date', 'status'],
          relationships: ['1 to Many: kuliner_purchase_items']
        },
        {
          table: 'kuliner_purchase_items',
          description: 'Baris Item Belanja Bahan Baku Dapur',
          keys: ['PK: id', 'FK: purchase_id', 'FK: ingredient_id'],
          columns: ['quantity', 'unit_price', 'subtotal'],
          relationships: ['Many to 1: kuliner_purchases', 'Many to 1: kuliner_ingredients']
        },
        {
          table: 'kuliner_promos',
          description: 'Voucher Promo, Diskon Menu & Happy Hour',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['title', 'code', 'discount_type', 'discount_value', 'min_spend', 'expires_at']
        },
        {
          table: 'kuliner_expenses',
          description: 'Pencatatan Beban Operasional Dapur & Resto',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['category', 'amount', 'expense_date', 'description']
        },
        {
          table: 'kuliner_roles',
          description: 'Hak Akses Staf F&B (Kasir, Koki, Waiter, Barista)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'permissions (JSON: pos, kitchen_kds, recipes, ingredients, tables, reports, cashier)']
        },
        {
          table: 'kuliner_settings',
          description: 'Pengaturan Resto (PB1 Resto, Service Charge, Logo, QRIS)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['restaurant_name', 'phone', 'address', 'tax_rate_pb1', 'service_charge_rate', 'qris_image_path']
        }
      ],

      directoryStructure: [
        {
          section: 'Backend Architecture (Laravel 11)',
          tree: `backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── Kuliner/
│   │   │   │   ├── TableController.php             # Manajemen Meja & QR Self-Order
│   │   │   │   ├── RecipeController.php            # BOM Resep Takaran Hidangan
│   │   │   │   ├── IngredientController.php        # Master Bahan Baku & Stok
│   │   │   │   ├── IngredientPurchaseController.php# PO Belanja Bahan Segar
│   │   │   │   ├── IngredientOpnameController.php  # Opname Fisik Bahan Dapur
│   │   │   │   ├── KitchenQueueController.php      # KDS Antrean Layar Dapur
│   │   │   │   ├── ModifierGroupController.php     # Grup Varian & Pilihan Opsi
│   │   │   │   ├── AddonController.php             # Menu Tambahan Berbayar
│   │   │   │   ├── BundleController.php            # Paket Kombo / Hemat
│   │   │   │   ├── WasteController.php             # Log Limbah / Sisa Terbuang
│   │   │   │   ├── ShiftController.php             # Buka/Tutup Kasir Restoran
│   │   │   │   ├── SupplierController.php          # Pemasok Bahan Dapur
│   │   │   │   └── ReportController.php            # Laporan Food Cost & Penjualan
│   │   │   ├── KulinerController.php               # Menu, Pesanan, Promo & Analytics
│   │   ├── Middleware/
│   │   │   ├── TenantMiddleware.php                # Multi-Tenancy Resolver
│   │   │   ├── CheckSubscription.php               # Guard Masa Aktif Langganan
│   │   │   └── CheckKulinerPermission.php          # RBAC Khusus Staf Resto
├── database/migrations/                            # 25+ Migrasi Khusus Resto & F&B
└── routes/api.php                                  # Route Group /api/kuliner/*`
        },
        {
          section: 'Frontend Architecture (React 18 + Vite)',
          tree: `frontend/src/
├── apps/kuliner/
│   ├── pages/
│   │   ├── KulinerDashboard.jsx     # Ringkasan Omzet, Pesanan Aktif & Stok Kritis
│   │   ├── Tables.jsx               # Denah Meja & Generator QR Code Self-Order
│   │   ├── KitchenQueue.jsx         # Kitchen Display System (KDS Live Queue)
│   │   ├── KulinerOrders.jsx        # Kasir POS & Monitoring Status Pesanan
│   │   ├── FullMenu.jsx             # Menu Katalog Pelanggan (Storefront)
│   │   ├── BahanBaku.jsx            # Inventaris Bahan Baku Dapur
│   │   ├── Recipes.jsx              # Manajemen Resep (BOM) & Takaran Porsi
│   │   ├── Modifiers.jsx            # Varian Level Pedas, Manis & Topping
│   │   ├── Bundles.jsx              # Paket Hemat & Menu Kombo
│   │   ├── Waste.jsx                # Pencatatan Limbah Bahan Rusak (Loss)
│   │   ├── KulinerPurchases.jsx     # PO Belanja Bahan Baku Dapur
│   │   ├── Shift.jsx                # Rekonsiliasi Kas Laci Kasir Resto
│   │   ├── CulinaryPromos.jsx       # Voucher Diskon & Happy Hour
│   │   ├── CulinaryAnalytics.jsx    # Matriks Menu Engineering (Stars, Dogs)
│   │   └── CulinaryStaff.jsx        # RBAC Staf (Koki, Barista, Waiter)
│   └── components/
│       ├── KulinerAdminLayout.jsx   # Layout Admin Restoran
│       └── KitchenOrderCard.jsx     # Kartu Antrean Tiket Dapur
├── routes/kuliner.routes.jsx        # Route Map Storefront & Admin Resto
└── services/api.js                  # Axios Client & Token Interceptors`
        }
      ],

      apiEndpoints: [
        { method: 'POST', path: '/api/kuliner/orders', name: 'Simpan Pesanan Meja Resto', perm: 'pos', desc: 'Mencatat pesanan dine-in/takeaway, trigger KDS dapur, potong stok bahan resep' },
        { method: 'GET', path: '/api/kuliner/kitchen/queue', name: 'Live Kitchen Queue (KDS)', perm: 'kitchen_kds', desc: 'Mengambil daftar antrean hidangan yang sedang/harus dimasak koki' },
        { method: 'PATCH', path: '/api/kuliner/orders/{id}/status', name: 'Update Status Dapur', perm: 'kitchen_kds', desc: 'Mengubah status hidangan (Preparing ➔ Ready ➔ Served)' },
        { method: 'GET', path: '/api/kuliner/tables', name: 'Daftar Meja & QR Token', perm: 'tables', desc: 'Mengambil status meja resto (Available/Occupied) beserta link QR self-order' },
        { method: 'POST', path: '/api/kuliner/recipes', name: 'Simpan Resep (BOM)', perm: 'recipes', desc: 'Mengaitkan takaran bahan baku gram/ml ke menu hidangan' },
        { method: 'POST', path: '/api/kuliner/wastes', name: 'Catat Limbah / Bahan Rusak', perm: 'ingredients', desc: 'Mencatat bahan terbuang dan menghitung kerugian finansial dapur' },
        { method: 'POST', path: '/api/kuliner/purchases', name: 'Simpan Belanja Bahan', perm: 'ingredients', desc: 'Mencatat nota pembelian bahan segar dari supplier/pasar' },
        { method: 'POST', path: '/api/kuliner/shifts/close', name: 'Tutup Shift Kasir Resto', perm: 'cashier', desc: 'Rekonsiliasi kas laci kasir dan menghitung selisih uang tunai' },
        { method: 'GET', path: '/api/kuliner/reports/menu-engineering', name: 'Matriks Menu Engineering', perm: 'reports', desc: 'Analisis profitabilitas dan popularitas hidangan (Star vs Dog items)' }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // [3] MODUL PETERNAKAN, BUDIDAYA & AGRIBISNIS HEWAN (MULTI-SEKTOR)
    // ─────────────────────────────────────────────────────────────────────────
    budidaya: {
      key: 'budidaya',
      icon: <Activity size={18} />,
      title: 'Modul Peternakan, Budidaya & Agribisnis Hewan (Multi-Sektor)',
      description: 'Sistem operasional dan manajemen siklus pemeliharaan terintegrasi untuk peternakan unggas (broiler/layer/bebek), ruminansia (sapi/kambing/domba), penangkaran burung kicau, perikanan air tawar/tambak, dan agribisnis hortikultura. Dilengkapi pelacakan FCR/ADG, monitoring bobot sampling, manajemen stok pakan & log harian, log kesehatan & mortalitas, akuntansi HPP modal produksi, serta manajemen fasilitas kandang/kolam.',
      version: 'v2.0.0 (Multi-Sector Dynamic Engine)',
      lastUpdated: '2026-08-20',
      leadDeveloper: 'Bizora AgriTech Engineering Team',

      domains: [
        { id: 'all', label: 'Semua Domain (Full ERD Agribisnis)', color: '#10b981' },
        { id: 'core', label: 'Core, Multi-Tenant & Profil Sektor', color: '#15803d' },
        { id: 'infrastructure', label: 'Manajemen Kandang / Kolam / Lahan', color: '#047857' },
        { id: 'cycle', label: 'Siklus & Batch Masuk (DOC / Bibit)', color: '#0284c7' },
        { id: 'nutrition', label: 'Pakan, Sampling Bobot & FCR', color: '#d97706' },
        { id: 'health', label: 'Kesehatan, Vaksin & Mortalitas', color: '#ef4444' },
        { id: 'harvest', label: 'Panen, Tonase & Distribusi', color: '#8b5cf6' },
        { id: 'finance', label: 'Keuangan, Beban Operasional & HPP', color: '#e11d48' },
      ],

      techStack: {
        backend: [
          { name: 'Laravel 11.x', role: 'RESTful API & Multi-Sector Calculation Engine', tag: 'Framework' },
          { name: 'PHP 8.2+', role: 'Core Execution Runtime & Typed Processing', tag: 'Core' },
          { name: 'BudidayaPresetService', role: 'Dynamic Profiling (Poultry, Livestock, Bird, Aquaculture, Crop)', tag: 'Engine' },
          { name: 'Laravel Sanctum', role: 'Token-based Authentication for Farm Operators & Managers', tag: 'Auth' },
          { name: 'Multi-Tenant Isolation', role: 'Strict tenant_id partition for All Agricultural Operations', tag: 'Security' },
          { name: 'FCR & Biomass Calculator', role: 'Real-time FCR formula: (Total Pakan / Total Bobot Panen)', tag: 'Analytics' },
          { name: 'CheckCategory Middleware', role: 'Guard route akses bisnis budidaya-hewan', tag: 'Middleware' },
        ],
        frontend: [
          { name: 'React 18.x', role: 'Interactive Dashboard & Operations Management UI', tag: 'UI Library' },
          { name: 'Vite 5.x', role: 'Blazing fast bundler & HMR development suite', tag: 'Bundler' },
          { name: 'useBudidayaTerms Hook', role: 'Zero-overhead dynamic terminology translation engine', tag: 'State' },
          { name: 'Interactive SVG Charting', role: 'Smooth growth curve with hover tooltip & clean nodes', tag: 'DataViz' },
          { name: 'react-to-print', role: 'Print-ready financial ledger & harvest reporting engine', tag: 'Export' },
          { name: 'React Router v6', role: 'Declarative SPA routing with dynamic breadcrumb sync', tag: 'Routing' },
          { name: 'Pure CSS Design System', role: 'Vibrant green agricultural theme, zero uppercase styling', tag: 'Styling' },
        ],
        database: [
          { name: 'MySQL 8.0 / MariaDB', role: 'Primary Enterprise Relational Database', tag: 'Database' },
          { name: 'Composite Indexing', role: 'High-speed querying on [tenant_id, cycle_id, date]', tag: 'Indexing' },
          { name: 'ACID Transactions', role: 'Atomic batch transitions, moving cycles & total harvests', tag: 'ACID' },
          { name: 'Foreign Key Constraints', role: 'Cascading integrity between ponds, cycles, logs & expenses', tag: 'Integrity' },
        ]
      },

      features: [
        {
          category: 'Mesin Sektor Dinamis (Multi-Sector Engine)',
          icon: <Activity size={20} className="text-primary" />,
          items: [
            'Dukungan 5 Sektor Agribisnis: Unggas (Broiler/Layer), Ruminansia (Sapi/Kambing), Burung (Breeding), Perikanan (Air Tawar/Tambak), dan Tanaman (Hortikultura)',
            'Adaptasi Terminologi Otomatis: Istilah unit (Kandang/Kolam/Lahan), bibit (DOC/Bakalan/Benih), dan pakan (Konsentrat/Pelet/Pupuk) berganti secara kontekstual',
            'Parameter Lingkungan Sektoral: Menampilkan suhu & ventilasi/amonia pada kandang unggas/ternak, dan kualitas air (pH & DO) pada perikanan',
          ]
        },
        {
          category: 'Manajemen Fasilitas & Aset Kandang',
          icon: <Store size={20} className="text-primary" />,
          items: [
            'Pencatatan Master Fasilitas Kandang / Kolam / Bedengan Lahan',
            'Informasi Luas Area (m²), Tipe Konstruksi (Closed House/Open House/Koloni), dan Kapasitas Maksimum Populasi',
            'Status Keterisian Real-Time (Kandang Terisi Aktif, Kosong Siap Pakai, atau Pembersihan/Maintenance)',
            'Fitur Pemindahan Siklus (Pindah Kandang) dengan transfer seluruh data historis dan pengosongan kandang asal',
          ]
        },
        {
          category: 'Siklus Budidaya & Batch Masuk (Chick-in)',
          icon: <RefreshCw size={20} className="text-primary" />,
          items: [
            'Pembukaan Siklus Baru: Input galur/ras bibit (DOC Broiler/Sapi Limosin/Benih Lele), jumlah populasi awal, dan modal awal benih',
            'Penghitungan Umur Ternak Harian (Hari ke-N / Day-Old) secara otomatis dari tanggal tebar/chick-in',
            'Monitoring Estimasi Target Tanggal Panen dan Persentase Progres Menuju Ukuran Konsumsi',
            'Dukungan Penutupan Siklus Parsial (Panen Sebagian) dan Penutupan Siklus Total (Tutup Batch & Arsip)',
          ]
        },
        {
          category: 'Nutrisi, Manajemen Pakan & Log Harian',
          icon: <ShoppingCart size={20} className="text-primary" />,
          items: [
            'Gudang Pakan & Nutrisi: Pelacakan stok karung/kg pakan di gudang, tanggal kadaluarsa, dan nilai modal beli',
            'Pencatatan Log Pemberian Pakan Harian per kandang dengan pengurangan stok otomatis',
            'Prediksi Ketahanan Stok Pakan: Menghitung sisa hari stok mencukupi berdasarkan rata-rata konsumsi harian',
          ]
        },
        {
          category: 'Sampling Bobot, Pertumbuhan & FCR',
          icon: <Scale size={20} className="text-primary" />,
          items: [
            'Pencatatan Sampling Bobot Rata-rata berkala (gram untuk unggas/ikan, kg untuk ruminansia, cm untuk tanaman)',
            'Grafik Kurva Pertumbuhan Interaktif dengan Interactive Hover Tooltips dan visualisasi kenaikan bobot aktual',
            'Estimasi Total Biomassa & Tonase Kandang otomatis: (Rata-rata bobot sampel × Populasi hidup)',
            'Kalkulasi Efisiensi Pakan (FCR - Feed Conversion Ratio) & Evaluasi terhadap Target Standar Ideal (1.15)',
          ]
        },
        {
          category: 'Kesehatan, Mortalitas & Vaksinasi',
          icon: <ShieldCheck size={20} className="text-primary" />,
          items: [
            'Pencatatan Mortalitas / Kematian Harian dengan pengurangan populasi hidup kandang secara real-time',
            'Tingkat Kelangsungan Hidup (SR - Survival Rate %) terhitung otomatis',
            'Log Catatan Gejala Penyakit & Tindakan Medis (Pemberian Vitamin, Antibiotik, Vaksinasi, Desinfeksi)',
          ]
        },
        {
          category: 'Hasil Panen, Penjualan & Distribusi',
          icon: <Package size={20} className="text-primary" />,
          items: [
            'Pencatatan Panen: Total berat hasil panen (kg), harga jual per kg, tanggal panen, dan penerimaan total',
            'Panen Total: Menutup siklus secara resmi, mengosongkan kandang, dan mengunci laporan HPP akhir',
            'Panen Parsial: Mengurangi sebagian populasi dan mencatat pemasukan antara tanpa memutus siklus',
          ]
        },
        {
          category: 'Keuangan, HPP Produksi & Laba Rugi',
          icon: <Wallet size={20} className="text-primary" />,
          items: [
            'Kalkulasi Akuntansi HPP (Harga Pokok Produksi): Modal Bibit + Biaya Pakan + Biaya Operasional (Listrik, Gaji, Vaksin)',
            'Laporan Laba / Rugi Bersih (Profit & Loss) dan Margin Profitabilitas (%) per siklus budidaya',
            'Buku Kas Besar (General Ledger) mencatat seluruh arus kas masuk (panen) dan arus kas keluar (biaya)',
            'Fitur Cetak & Ekspor PDF Laporan Keuangan siap pakai dengan kop tenant resmi',
          ]
        },
        {
          category: 'Manajemen Tim & Hak Akses Kustom (RBAC)',
          icon: <Users size={20} className="text-primary" />,
          items: [
            'Manajemen Karyawan / Operator Kandang terintegrasi dengan akun login sistem',
            'Pembuatan Peran Kustom (Custom Roles) dengan matriks hak akses granuler (Kelola Kandang, Catat Pakan, Lihat Keuangan)',
            'Isolasi Keamanan Data Multi-Tenant per akun pemilik peternakan',
          ]
        }
      ],

      erdNodes: [
        // Kolom 1: Core & Multi-Tenant Peternakan
        {
          id: 'tenants',
          domain: 'core',
          title: 'tenants',
          badge: 'Root Entity',
          color: '#15803d',
          x: 40,
          y: 40,
          width: 230,
          height: 200,
          fields: [
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'PK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'business_name', type: 'VARCHAR(255)' },
            { name: 'subscription_plan', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'budidaya_settings',
          domain: 'core',
          title: 'budidaya_settings',
          badge: 'Profil Sektoral',
          color: '#15803d',
          x: 40,
          y: 270,
          width: 230,
          height: 230,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'farming_category', type: 'VARCHAR(50)' },
            { name: 'farming_profile', type: 'VARCHAR(50)' },
            { name: 'farm_name', type: 'VARCHAR(150)' },
            { name: 'farm_type', type: 'VARCHAR(50)' },
            { name: 'tracking_mode', type: 'VARCHAR(30)' },
            { name: 'feature_flags', type: 'JSON' },
            { name: 'terminology', type: 'JSON' },
          ]
        },
        {
          id: 'budidaya_roles',
          domain: 'core',
          title: 'budidaya_roles',
          badge: 'RBAC Peternakan',
          color: '#475569',
          x: 40,
          y: 530,
          width: 230,
          height: 160,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'is_system', type: 'BOOLEAN' },
            { name: 'permissions', type: 'JSON' },
          ]
        },
        {
          id: 'budidaya_staff',
          domain: 'core',
          title: 'budidaya_staff',
          badge: 'Operator Kandang',
          color: '#475569',
          x: 40,
          y: 720,
          width: 230,
          height: 190,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'user_id', type: 'BIGINT', key: 'FK' },
            { name: 'role_id', type: 'BIGINT', key: 'FK' },
            { name: 'position', type: 'VARCHAR(100)' },
            { name: 'phone', type: 'VARCHAR(30)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },

        // Kolom 2: Fasilitas & Siklus Pemeliharaan
        {
          id: 'budidaya_ponds',
          domain: 'infrastructure',
          title: 'budidaya_ponds',
          badge: 'Kandang / Kolam / Lahan',
          color: '#047857',
          x: 320,
          y: 40,
          width: 230,
          height: 230,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'type', type: 'VARCHAR(50)' },
            { name: 'capacity', type: 'INT' },
            { name: 'area_m2', type: 'DECIMAL(10,2)' },
            { name: 'status', type: 'VARCHAR(30)' },
            { name: 'location', type: 'VARCHAR(255)' },
          ]
        },
        {
          id: 'budidaya_cycles',
          domain: 'cycle',
          title: 'budidaya_cycles',
          badge: 'Siklus / Batch Pemeliharaan',
          color: '#0284c7',
          x: 320,
          y: 300,
          width: 230,
          height: 270,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'pond_id', type: 'BIGINT', key: 'FK' },
            { name: 'seed_type', type: 'VARCHAR(100)' },
            { name: 'seed_count', type: 'INT' },
            { name: 'total_seed_cost', type: 'DECIMAL(14,2)' },
            { name: 'seed_date', type: 'DATE' },
            { name: 'expected_harvest_date', type: 'DATE' },
            { name: 'status', type: 'VARCHAR(30)' },
          ]
        },
        {
          id: 'budidaya_species',
          domain: 'cycle',
          title: 'budidaya_species',
          badge: 'Katalog Galur / Ras',
          color: '#0284c7',
          x: 320,
          y: 600,
          width: 230,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'category', type: 'VARCHAR(50)' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'ideal_fcr', type: 'DECIMAL(4,2)' },
            { name: 'harvest_age_days', type: 'INT' },
            { name: 'target_weight_gram', type: 'DECIMAL(10,2)' },
          ]
        },

        // Kolom 3: Nutrisi, Sampling & Kesehatan
        {
          id: 'budidaya_feedings',
          domain: 'nutrition',
          title: 'budidaya_feedings',
          badge: 'Pemberian Pakan',
          color: '#d97706',
          x: 600,
          y: 40,
          width: 230,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'cycle_id', type: 'BIGINT', key: 'FK' },
            { name: 'inventory_id', type: 'BIGINT', key: 'FK' },
            { name: 'amount_kg', type: 'DECIMAL(10,2)' },
            { name: 'date', type: 'DATE' },
            { name: 'notes', type: 'TEXT' },
          ]
        },
        {
          id: 'budidaya_samplings',
          domain: 'nutrition',
          title: 'budidaya_samplings',
          badge: 'Sampling Pertumbuhan',
          color: '#d97706',
          x: 600,
          y: 270,
          width: 230,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'cycle_id', type: 'BIGINT', key: 'FK' },
            { name: 'average_weight_gram', type: 'DECIMAL(10,2)' },
            { name: 'sample_count', type: 'INT' },
            { name: 'date', type: 'DATE' },
            { name: 'notes', type: 'TEXT' },
          ]
        },
        {
          id: 'budidaya_health_logs',
          domain: 'health',
          title: 'budidaya_health_logs',
          badge: 'Mortalitas & Medis',
          color: '#ef4444',
          x: 600,
          y: 500,
          width: 230,
          height: 220,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'cycle_id', type: 'BIGINT', key: 'FK' },
            { name: 'mortality_count', type: 'INT' },
            { name: 'disease_note', type: 'TEXT' },
            { name: 'treatment_note', type: 'TEXT' },
            { name: 'date', type: 'DATE' },
          ]
        },

        // Kolom 4: Panen, Keuangan & Inventaris Gudang
        {
          id: 'budidaya_harvests',
          domain: 'harvest',
          title: 'budidaya_harvests',
          badge: 'Hasil Panen',
          color: '#8b5cf6',
          x: 880,
          y: 40,
          width: 230,
          height: 230,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'cycle_id', type: 'BIGINT', key: 'FK' },
            { name: 'harvest_type', type: 'VARCHAR(30)' },
            { name: 'total_weight_kg', type: 'DECIMAL(12,2)' },
            { name: 'sale_price_per_kg', type: 'DECIMAL(12,2)' },
            { name: 'total_revenue', type: 'DECIMAL(14,2)' },
            { name: 'harvest_date', type: 'DATE' },
          ]
        },
        {
          id: 'budidaya_expenses',
          domain: 'finance',
          title: 'budidaya_expenses',
          badge: 'Beban Operasional & HPP',
          color: '#e11d48',
          x: 880,
          y: 300,
          width: 230,
          height: 220,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'cycle_id', type: 'BIGINT', key: 'FK' },
            { name: 'category', type: 'VARCHAR(50)' },
            { name: 'amount', type: 'DECIMAL(14,2)' },
            { name: 'date', type: 'DATE' },
            { name: 'notes', type: 'TEXT' },
          ]
        },
        {
          id: 'budidaya_inventories',
          domain: 'nutrition',
          title: 'budidaya_inventories',
          badge: 'Gudang Pakan & Sarpras',
          color: '#0284c7',
          x: 880,
          y: 550,
          width: 230,
          height: 230,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(150)' },
            { name: 'category', type: 'VARCHAR(50)' },
            { name: 'stock', type: 'DECIMAL(12,2)' },
            { name: 'unit', type: 'VARCHAR(30)' },
            { name: 'price_per_unit', type: 'DECIMAL(12,2)' },
            { name: 'min_stock_alert', type: 'DECIMAL(10,2)' },
          ]
        },
      ],

      erdEdges: [
        { from: 'tenants', to: 'budidaya_settings', label: '1:1', desc: 'Konfigurasi Sektor & Profil Konteks', color: '#15803d' },
        { from: 'tenants', to: 'budidaya_ponds', label: '1:N', desc: 'Daftar Fasilitas Kandang / Kolam', color: '#047857' },
        { from: 'tenants', to: 'budidaya_roles', label: '1:N', desc: 'Peran & Hak Akses Staf', color: '#475569' },
        { from: 'budidaya_roles', to: 'budidaya_staff', label: '1:N', desc: 'Penugasan Peran Karyawan', color: '#475569' },
        { from: 'budidaya_ponds', to: 'budidaya_cycles', label: '1:N', desc: 'Riwayat Siklus Pemeliharaan', color: '#0284c7' },
        { from: 'budidaya_cycles', to: 'budidaya_feedings', label: '1:N', desc: 'Log Pakan Harian', color: '#d97706' },
        { from: 'budidaya_cycles', to: 'budidaya_samplings', label: '1:N', desc: 'Kurva Bobot Sampling Pertumbuhan', color: '#d97706' },
        { from: 'budidaya_cycles', to: 'budidaya_health_logs', label: '1:N', desc: 'Log Mortalitas & Tindakan Medis', color: '#ef4444' },
        { from: 'budidaya_cycles', to: 'budidaya_harvests', label: '1:N', desc: 'Rekaman Hasil Panen (Total / Parsial)', color: '#8b5cf6' },
        { from: 'budidaya_cycles', to: 'budidaya_expenses', label: '1:N', desc: 'Biaya Produksi & HPP', color: '#e11d48' },
        { from: 'budidaya_inventories', to: 'budidaya_feedings', label: '1:N', desc: 'Pengurangan Stok Pakan Gudang', color: '#0284c7' },
      ],

      erdMermaid: `erDiagram
    tenants ||--|| budidaya_settings : "konfigurasi sektor"
    tenants ||--o{ budidaya_ponds : "memiliki kandang"
    tenants ||--o{ budidaya_roles : "memiliki peran"
    tenants ||--o{ budidaya_inventories : "memiliki gudang"
    budidaya_roles ||--o{ budidaya_staff : "diberikan kepada"
    budidaya_ponds ||--o{ budidaya_cycles : "menampung siklus"
    budidaya_cycles ||--o{ budidaya_feedings : "catatan pakan"
    budidaya_cycles ||--o{ budidaya_samplings : "catatan sampling"
    budidaya_cycles ||--o{ budidaya_health_logs : "catatan mortalitas"
    budidaya_cycles ||--o{ budidaya_harvests : "hasil panen"
    budidaya_cycles ||--o{ budidaya_expenses : "biaya HPP"
    budidaya_inventories ||--o{ budidaya_feedings : "pengurangan stok"`,

      erdEntities: [
        {
          table: 'budidaya_settings',
          description: 'Profil sektor, jenis ternak/tanaman, dan kamus terminologi dinamis tenant',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['farming_category (poultry, livestock, bird, aquaculture, crop)', 'farming_profile', 'farm_name', 'farm_type', 'tracking_mode (group, individual, breeding)', 'feature_flags (JSON)', 'terminology (JSON)'],
          relationships: ['1 to 1: tenants']
        },
        {
          table: 'budidaya_ponds',
          description: 'Master aset fisik tempat pemeliharaan (Kandang, Kolam, Pen, Bedengan)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'type (Closed House, Open House, Bioflok, Tanah, Koloni)', 'capacity (ekor/tanaman)', 'area_m2', 'status (aktif, kosong, maintenance)', 'location'],
          relationships: ['1 to Many: budidaya_cycles']
        },
        {
          table: 'budidaya_cycles',
          description: 'Periode batch pemeliharaan dari bibit/DOC masuk s.d. panen total',
          keys: ['PK: id', 'FK: tenant_id', 'FK: pond_id'],
          columns: ['seed_type (Ayam Broiler, Sapi Limosin, dll)', 'seed_count', 'total_seed_cost', 'seed_date', 'expected_harvest_date', 'status (aktif, panen, dibatalkan)'],
          relationships: ['Many to 1: budidaya_ponds', '1 to Many: budidaya_feedings', '1 to Many: budidaya_samplings', '1 to Many: budidaya_health_logs', '1 to Many: budidaya_harvests', '1 to Many: budidaya_expenses']
        },
        {
          table: 'budidaya_feedings',
          description: 'Catatan harian pemberian pakan/nutrisi per kandang',
          keys: ['PK: id', 'FK: tenant_id', 'FK: cycle_id', 'FK: inventory_id'],
          columns: ['amount_kg', 'date', 'notes'],
          relationships: ['Many to 1: budidaya_cycles', 'Many to 1: budidaya_inventories']
        },
        {
          table: 'budidaya_samplings',
          description: 'Pencatatan sampling pertumbuhan bobot rata-rata berkala',
          keys: ['PK: id', 'FK: tenant_id', 'FK: cycle_id'],
          columns: ['average_weight_gram', 'sample_count', 'date', 'notes'],
          relationships: ['Many to 1: budidaya_cycles']
        },
        {
          table: 'budidaya_health_logs',
          description: 'Catatan mortalitas (kematian), gejala penyakit & tindakan medis',
          keys: ['PK: id', 'FK: tenant_id', 'FK: cycle_id'],
          columns: ['mortality_count', 'disease_note', 'treatment_note', 'date'],
          relationships: ['Many to 1: budidaya_cycles']
        },
        {
          table: 'budidaya_harvests',
          description: 'Hasil panen ternak/komoditas (panen parsial & panen total)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: cycle_id'],
          columns: ['harvest_type (total, sebagian)', 'total_weight_kg', 'sale_price_per_kg', 'total_revenue', 'harvest_date', 'notes'],
          relationships: ['Many to 1: budidaya_cycles']
        },
        {
          table: 'budidaya_expenses',
          description: 'Beban biaya operasional (gaji, listrik, pakan, logistik) pembentuk HPP',
          keys: ['PK: id', 'FK: tenant_id', 'FK: cycle_id (nullable)'],
          columns: ['category (gaji, listrik, panen, lainnya)', 'amount', 'date', 'notes'],
          relationships: ['Many to 1: budidaya_cycles']
        },
        {
          table: 'budidaya_inventories',
          description: 'Gudang persediaan pakan, bibit, vaksin & sarana produksi',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'category (pakan, pupuk, bibit, obat, sarpras)', 'stock', 'unit (kg, sak, botol, pack)', 'price_per_unit', 'min_stock_alert'],
          relationships: ['1 to Many: budidaya_feedings']
        },
        {
          table: 'budidaya_roles',
          description: 'Peran kustom staf peternakan & matriks hak akses RBAC',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'description', 'is_system', 'permissions (JSON: kelola_kolam, catat_pakan, sampling, laporan, dll)'],
          relationships: ['1 to Many: budidaya_staff']
        },
        {
          table: 'budidaya_staff',
          description: 'Daftar operator kandang, teknisi pakan & pengawas peternakan',
          keys: ['PK: id', 'FK: tenant_id', 'FK: user_id', 'FK: role_id'],
          columns: ['position', 'phone', 'status (aktif, nonaktif)'],
          relationships: ['Many to 1: users', 'Many to 1: budidaya_roles']
        },
        {
          table: 'budidaya_species',
          description: 'Katalog referensi galur, ras ternak, standar FCR & target bobot panen',
          keys: ['PK: id', 'FK: tenant_id (nullable)'],
          columns: ['category', 'name', 'ideal_fcr', 'harvest_age_days', 'target_weight_gram', 'is_active'],
          relationships: ['Reference Data']
        }
      ],

      directoryStructure: [
        {
          section: 'Backend Architecture (Laravel 11)',
          tree: `backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── Budidaya/
│   │   │   │   ├── BudidayaSettingController.php    # Context & Profil Sektoral
│   │   │   │   ├── PondController.php               # CRUD Master Kandang / Kolam
│   │   │   │   ├── CycleController.php              # Lifecycle Siklus & Sampling
│   │   │   │   ├── FeedingController.php            # Log Pakan & Pengurangan Stok
│   │   │   │   ├── HealthController.php             # Log Mortalitas & Pengobatan
│   │   │   │   ├── HarvestController.php            # Panen Total / Parsial & Tutup Siklus
│   │   │   │   ├── FinanceController.php            # HPP, Beban Operasional & Ledger
│   │   │   │   ├── InventoryController.php          # Gudang Pakan, Bibit & Sarpras
│   │   │   │   ├── ReportController.php             # KPI Dashboard & Analisis FCR
│   │   │   │   ├── RoleController.php               # RBAC Peran Karyawan Kandang
│   │   │   │   ├── StaffController.php              # Akun Operator & Penugasan
│   │   │   │   └── SpeciesController.php            # Katalog Standar Galur / Ras
│   │   ├── Middleware/
│   │   │   ├── CheckCategory.php                    # Guard Kategori Usaha budidaya-hewan
│   │   │   └── CheckBudidayaPermission.php          # Guard Granular Hak Akses Peran
│   │   ├── Models/
│   │   │   ├── BudidayaSetting.php, BudidayaPond.php, BudidayaCycle.php...
│   │   └── Services/
│   │       └── Budidaya/
│   │           └── BudidayaPresetService.php        # Kamus Preset 5 Sektor Agribisnis
├── database/migrations/                             # 15+ Migrasi Khusus Budidaya
└── routes/api.php                                   # Route Group prefix('budidaya')`
        },
        {
          section: 'Frontend Architecture (React 18 + Vite)',
          tree: `frontend/src/
├── apps/budidaya/
│   ├── pages/
│   │   ├── Dashboard.jsx              # Metrik Produksi, Stok Kritis & Cuaca
│   │   ├── Ponds.jsx                  # Pure Table View Fasilitas Kandang & Pencarian
│   │   ├── PondDetail.jsx             # Visualisasi Kurva Bobot & Operasional Kandang
│   │   ├── Cycles.jsx                 # Monitoring Siklus Aktif & Riwayat Panen
│   │   ├── CycleDetail.jsx            # Detail Batch, FCR, Pakan, Sampling & Biaya HPP
│   │   ├── Inventory.jsx              # Gudang Pakan, Bibit & Restock Otomatis
│   │   ├── Feeds.jsx                  # Ringkasan Persediaan Nutrisi/Pakan
│   │   ├── BudidayaExpenses.jsx       # Catatan Beban Operasional & Export PDF
│   │   ├── BudidayaFinanceSummary.jsx # Buku Kas Besar (Ledger) & Laba/Rugi Bersih
│   │   ├── Reports.jsx                # Laporan Komparasi Panen, FCR & Survival Rate
│   │   ├── RolesPermissions.jsx       # Matriks Hak Akses & Peran Karyawan
│   │   ├── UserManagement.jsx         # Manajemen Staf Operator Peternakan
│   │   ├── Settings.jsx               # Preferensi Peternakan & Notifikasi
│   │   └── Subscription.jsx           # Status Paket Langganan SaaS Budidaya
│   ├── hooks/
│   │   └── useBudidayaTerms.js        # Engine Terjemahan Terminologi Dinamis
│   ├── contexts/
│   │   └── BudidayaContext.jsx        # Global Farm Context & Active Profile
│   ├── components/                    # Table, Modal, UXComponents, NumericInput
│   ├── BudidayaLayout.jsx             # Master Layout & Navtop Header Sync
│   └── BudidayaSidebar.jsx            # Sidebar Terkategorisasi Sesuai Alur Usaha`
        }
      ],

      apiEndpoints: [
        { method: 'GET', path: '/api/budidaya/dashboard/stats', name: 'Statistik KPI Dashboard', perm: 'reports', desc: 'Mengambil ringkasan total kandang, populasi aktif, biomassa & stok pakan' },
        { method: 'GET', path: '/api/budidaya/ponds', name: 'Daftar Kandang / Kolam', perm: 'kelola_kolam', desc: 'Mengambil daftar seluruh fasilitas tempat pemeliharaan hewan' },
        { method: 'POST', path: '/api/budidaya/ponds', name: 'Tambah Kandang Baru', perm: 'kelola_kolam', desc: 'Mendaftarkan fasilitas kandang/kolam/lahan baru ke sistem' },
        { method: 'GET', path: '/api/budidaya/cycles', name: 'Daftar Siklus Pemeliharaan', perm: 'kelola_kolam', desc: 'Mengambil daftar batch pemeliharaan aktif maupun yang sudah panen' },
        { method: 'POST', path: '/api/budidaya/cycles', name: 'Mulai Siklus (DOC / Bibit Masuk)', perm: 'kelola_kolam', desc: 'Membuka siklus baru dengan data bibit, populasi awal, dan modal awal' },
        { method: 'POST', path: '/api/budidaya/cycles/{id}/move', name: 'Pindahkan Siklus Antar-Kandang', perm: 'kelola_kolam', desc: 'Memindahkan batch ke kandang kosong lain beserta histori datanya' },
        { method: 'POST', path: '/api/budidaya/feedings', name: 'Catat Pemberian Pakan', perm: 'catat_pakan', desc: 'Mencatat konsumsi pakan harian dan memotong stok gudang otomatis' },
        { method: 'POST', path: '/api/budidaya/samplings', name: 'Catat Sampling Bobot Pertumbuhan', perm: 'sampling', desc: 'Merekam bobot rata-rata sampel dan mengupdate kurva grafik pertumbuhan' },
        { method: 'POST', path: '/api/budidaya/health', name: 'Catat Mortalitas & Kesehatan', perm: 'kesehatan', desc: 'Mencatat kematian hewan (mengurangi populasi) dan tindakan medis' },
        { method: 'POST', path: '/api/budidaya/harvests', name: 'Catat Panen (Parsial / Total)', perm: 'panen', desc: 'Merekam hasil panen, penerimaan penjualan, dan menutup siklus (jika total)' },
        { method: 'GET', path: '/api/budidaya/finance/summary', name: 'Ringkasan Laba / Rugi', perm: 'lihat_keuangan', desc: 'Kalkulasi total pendapatan panen, total biaya pengeluaran, dan net profit' },
        { method: 'GET', path: '/api/budidaya/finance/ledger', name: 'Buku Kas Besar (General Ledger)', perm: 'lihat_keuangan', desc: 'Riwayat mutasi transaksi keuangan masuk dan keluar' },
        { method: 'POST', path: '/api/budidaya/expenses', name: 'Catat Beban Operasional', perm: 'kelola_keuangan', desc: 'Mencatat pengeluaran listrik, gaji, logistik, atau sarpras' },
        { method: 'GET', path: '/api/budidaya/context', name: 'Konteks & Profil Sektor Aktif', perm: 'public', desc: 'Mengambil profil sektor (unggas, ruminansia, burung, ikan) dan kamus istilah' },
        { method: 'GET', path: '/api/budidaya/inventory', name: 'Daftar Stok Gudang Sarpras', perm: 'gudang', desc: 'Mengambil persediaan pakan, konsentrat, vitamin, dan obat-obatan' },
        { method: 'GET', path: '/api/budidaya/roles', name: 'Daftar Peran & Hak Akses', perm: 'edit_peran', desc: 'Mengambil master peran karyawan kandang beserta matriks izin' }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // [4] MODUL SELLER HUB, OMNICHANNEL & MARKETPLACE E-COMMERCE
    // ─────────────────────────────────────────────────────────────────────────
    seller: {
      key: 'seller',
      icon: <Globe size={18} />,
      title: 'Modul Seller Hub, Omnichannel & Marketplace E-Commerce',
      description: 'Pusat komando operasional toko online multi-channel untuk seller Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, dan toko offline. Dilengkapi integrasi sinkronisasi stok otomatis terpusat (Central SKU Mapping), manajemen pesanan lintas channel, stasiun packing & cetak resi massal (Thermal A6), manajemen gudang & rak (Inbound/Bin Location), serta akuntansi laba-rugi & rekonsiliasi dana tertahan (Escrow).',
      version: 'v2.5.0 (Omnichannel Cloud Ready)',
      lastUpdated: '2026-08-20',
      leadDeveloper: 'Bizora E-Commerce Engineering Team',

      domains: [
        { id: 'all', label: 'Semua Domain (Full ERD Seller Hub)', color: '#0284c7' },
        { id: 'marketplace', label: 'Channel Toko & Multi-Marketplace', color: '#2563eb' },
        { id: 'orders', label: 'Pesanan & Order Fulfillment', color: '#10b981' },
        { id: 'inventory', label: 'Master SKU, Stok & Bin Lokasi', color: '#d97706' },
        { id: 'shipping', label: 'Pengiriman, Resi & Manifest Kurir', color: '#7c3aed' },
        { id: 'warehouse', label: 'Gudang, Inbound & Stock Opname', color: '#059669' },
        { id: 'finance', label: 'Keuangan, Admin Fee & Escrow', color: '#e11d48' },
        { id: 'core', label: 'Multi-Tenant & Hak Akses Staf', color: '#475569' },
      ],

      techStack: {
        backend: [
          { name: 'Laravel 11.x', role: 'RESTful API, Webhook Receiver & Queue Dispatcher', tag: 'Framework' },
          { name: 'PHP 8.2+', role: 'Core Execution Runtime & Async Jobs', tag: 'Core' },
          { name: 'Marketplace Sync Engine', role: 'Bidirectional sync for Order & Stock allocations across platforms', tag: 'Sync Core' },
          { name: 'Laravel Horizon / Queues', role: 'Background worker handling high-throughput webhooks & bulk prints', tag: 'Queue' },
          { name: 'Sanctum & Multi-Tenant', role: 'Enterprise data partition & safe store token isolation', tag: 'Security' },
          { name: 'Barcode & Resi Parser', role: 'Fast regex parsing for J&T, SiCepat, JNE, Shopee Xpress, SPX, Lex', tag: 'Logistics' },
          { name: 'Financial Reconciliation', role: 'Automated settlement calculation (Gross - Admin Fee - Ads - Return)', tag: 'Finance' },
        ],
        frontend: [
          { name: 'React 18.x (TypeScript)', role: 'Interactive high-speed Seller Hub dashboard and packing station', tag: 'UI Library' },
          { name: 'Vite 5.x', role: 'High-speed build tool and rapid development server', tag: 'Bundler' },
          { name: 'Tailwind CSS & CSS Engine', role: 'Modern dense enterprise UI with dark/light mode toggle', tag: 'Styling' },
          { name: 'ESC/POS & Thermal Print', role: 'Direct thermal label printing engine for 100x150mm (A6) shipping labels', tag: 'Printing' },
          { name: 'Webcam Barcode Scanner', role: 'Instant scan for picking verification & packing video recorder', tag: 'Scanner' },
          { name: 'Lucide React', role: 'Consistent & Modern SVG iconography set', tag: 'Icons' },
        ],
        database: [
          { name: 'MySQL 8.0 / InnoDB', role: 'Primary transactional database for high volume orders', tag: 'Database' },
          { name: 'Optimistic Locking', role: 'Stock reservation lock preventing overselling across marketplace channels', tag: 'Concurrency' },
          { name: 'High-Performance Indexing', role: 'Indexed on [tenant_id, order_number, tracking_number, sku]', tag: 'Performance' },
          { name: 'JSON Storage Engine', role: 'Raw marketplace webhook payload logging for reconciliation audits', tag: 'Audit' },
        ]
      },

      features: [
        {
          category: 'Integrasi Multi-Channel & Marketplace',
          icon: <Globe size={20} className="text-primary" />,
          items: [
            'Koneksi Multi-Toko: Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, dan Toko Manual/Offline dalam satu dashboard',
            'Sinkronisasi Stok Real-Time: Pengurangan otomatis stok di semua platform saat barang terjual di salah satu channel',
            'Central Master SKU Mapping: Pemetaan kode SKU gudang ke variasi nama produk yang berbeda di tiap marketplace',
            'Log Riwayat Sinkronisasi (Sync History) dengan pelacakan status sukses/gagal per produk',
          ]
        },
        {
          category: 'Manajemen Pesanan Terpusat (Omnichannel Orders)',
          icon: <ShoppingCart size={20} className="text-primary" />,
          items: [
            'Inbox Pesanan Terpadu: Filter pesanan berdasarkan status (Perlu Diproses, Dalam Pengiriman, Selesai, Retur/Batal)',
            'Batch Order Processing: Terima dan konfirmasi ratusan pesanan marketplace sekaligus dengan 1 klik',
            'Pemisahan Prioritas Pengiriman (Instant, Same Day, Reguler, Hemat, Kargo)',
            'Notifikasi Real-time pesanan baru dari seluruh marketplace terhubung',
          ]
        },
        {
          category: 'Stasiun Packing & Pengiriman (Shipping Hub)',
          icon: <Truck size={20} className="text-primary" />,
          items: [
            'Cetak Resi Massal (Bulk Thermal Label A6): Cetak ratusan label resi marketplace tanpa perlu buka tab baru satu per satu',
            'Picking List & Packing List otomatis terurut berdasarkan lokasi rak gudang',
            'Packing Station Scanner: Verifikasi barcode barang sebelum masuk kardus untuk mencegah salah kirim produk',
            'Cetak Manifest Serah Terima Kurir (J&T, SiCepat, JNE, Shopee Xpress, Anteraja, Ninja Xpress)',
          ]
        },
        {
          category: 'Manajemen Gudang, Inbound & Stock Opname',
          icon: <Package size={20} className="text-primary" />,
          items: [
            'Multi-Gudang (Pusat, Cabang, Fulfillment Center) dengan alokasi stok per channel',
            'Penerimaan Barang Masuk (Inbound Receiving) dari supplier atau pabrik dengan generate nomor batch',
            'Stock Opname per Rak / Lokasi Bin dengan perbandingan stok fisik vs sistem dan jurnal penyesuaian otomatis',
            'Manajemen Lokasi Rak & Bin Gudang untuk efisiensi rute pengambilan barang (picker routing)',
          ]
        },
        {
          category: 'Keuangan, Potongan Marketplace & Rekonsiliasi Saldo',
          icon: <Wallet size={20} className="text-primary" />,
          items: [
            'Rekonsiliasi Dana Tertahan (Escrow): Memantau saldo yang masih tertahan di marketplace vs dana yang sudah cair ke rekening',
            'Pelacakan Biaya Admin & Komisi Platform (Shopee Admin Fee, Tokopedia Service Fee, TikTok Commission)',
            'Pelacakan Biaya Iklan (Shopee Ads, TikTok Shop Ads, Tokopedia TopAds) & Analisis ROAS',
            'Laporan Laba / Rugi Bersih Penjualan Online setelah dipotong HPP modal barang, packing, ongkir talangan, dan admin marketplace',
          ]
        },
        {
          category: 'Mini POS & Penjualan Toko Offline',
          icon: <Store size={20} className="text-primary" />,
          items: [
            'Kasir Cepat Toko Offline untuk melayani pembeli langsung di toko fisik / gudang',
            'Stok toko fisik otomatis memotong master persediaan gudang omnichannel',
            'Cetak struk thermal kasir & split payment tunai/QRIS',
          ]
        }
      ],

      erdNodes: [
        // Kolom 1: Core & Marketplace Channels
        {
          id: 'tenants',
          domain: 'core',
          title: 'tenants',
          badge: 'Root Entity',
          color: '#2563eb',
          x: 40,
          y: 40,
          width: 230,
          height: 200,
          fields: [
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'PK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'business_name', type: 'VARCHAR(255)' },
            { name: 'subscription_plan', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'seller_stores',
          domain: 'marketplace',
          title: 'seller_stores',
          badge: 'Marketplace Channel',
          color: '#2563eb',
          x: 40,
          y: 270,
          width: 230,
          height: 240,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'platform', type: 'VARCHAR(50)' },
            { name: 'store_name', type: 'VARCHAR(150)' },
            { name: 'store_code', type: 'VARCHAR(50)' },
            { name: 'access_token', type: 'TEXT' },
            { name: 'is_connected', type: 'BOOLEAN' },
            { name: 'last_synced_at', type: 'DATETIME' },
          ]
        },
        {
          id: 'seller_roles',
          domain: 'core',
          title: 'seller_roles',
          badge: 'RBAC Seller',
          color: '#475569',
          x: 40,
          y: 540,
          width: 230,
          height: 160,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'permissions', type: 'JSON' },
          ]
        },

        // Kolom 2: Katalog Master SKU & Mapping
        {
          id: 'seller_products',
          domain: 'inventory',
          title: 'seller_products',
          badge: 'Master SKU Gudang',
          color: '#d97706',
          x: 320,
          y: 40,
          width: 230,
          height: 240,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'sku', type: 'VARCHAR(100)' },
            { name: 'barcode', type: 'VARCHAR(100)' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'cost_price', type: 'DECIMAL(12,2)' },
            { name: 'sell_price', type: 'DECIMAL(12,2)' },
            { name: 'total_stock', type: 'INT' },
          ]
        },
        {
          id: 'seller_sku_mappings',
          domain: 'marketplace',
          title: 'seller_sku_mappings',
          badge: 'Channel SKU Mapping',
          color: '#2563eb',
          x: 320,
          y: 310,
          width: 230,
          height: 210,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'store_id', type: 'BIGINT', key: 'FK' },
            { name: 'marketplace_item_id', type: 'VARCHAR(100)' },
            { name: 'marketplace_sku', type: 'VARCHAR(100)' },
            { name: 'sync_stock_enabled', type: 'BOOLEAN' },
          ]
        },
        {
          id: 'seller_warehouses',
          domain: 'warehouse',
          title: 'seller_warehouses',
          badge: 'Gudang & Rak Bin',
          color: '#059669',
          x: 320,
          y: 550,
          width: 230,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'name', type: 'VARCHAR(150)' },
            { name: 'code', type: 'VARCHAR(50)' },
            { name: 'city', type: 'VARCHAR(100)' },
            { name: 'is_default', type: 'BOOLEAN' },
          ]
        },

        // Kolom 3: Pesanan & Order Items
        {
          id: 'seller_orders',
          domain: 'orders',
          title: 'seller_orders',
          badge: 'Pesanan Omnichannel',
          color: '#10b981',
          x: 600,
          y: 40,
          width: 230,
          height: 260,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'store_id', type: 'BIGINT', key: 'FK' },
            { name: 'order_number', type: 'VARCHAR(100)' },
            { name: 'platform', type: 'VARCHAR(50)' },
            { name: 'customer_name', type: 'VARCHAR(150)' },
            { name: 'total_amount', type: 'DECIMAL(14,2)' },
            { name: 'status', type: 'VARCHAR(50)' },
            { name: 'order_date', type: 'DATETIME' },
          ]
        },
        {
          id: 'seller_order_items',
          domain: 'orders',
          title: 'seller_order_items',
          badge: 'Rincian Item Pesanan',
          color: '#10b981',
          x: 600,
          y: 330,
          width: 230,
          height: 210,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'order_id', type: 'BIGINT', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'sku', type: 'VARCHAR(100)' },
            { name: 'quantity', type: 'INT' },
            { name: 'price', type: 'DECIMAL(12,2)' },
          ]
        },
        {
          id: 'seller_shipments',
          domain: 'shipping',
          title: 'seller_shipments',
          badge: 'Resi & Manifest',
          color: '#7c3aed',
          x: 600,
          y: 570,
          width: 230,
          height: 220,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'order_id', type: 'BIGINT', key: 'FK' },
            { name: 'courier', type: 'VARCHAR(100)' },
            { name: 'tracking_number', type: 'VARCHAR(100)' },
            { name: 'printed_at', type: 'DATETIME' },
            { name: 'manifest_number', type: 'VARCHAR(100)' },
          ]
        },

        // Kolom 4: Keuangan & Mutasi Stok
        {
          id: 'seller_finances',
          domain: 'finance',
          title: 'seller_finances',
          badge: 'Buku Kas & Escrow',
          color: '#e11d48',
          x: 880,
          y: 40,
          width: 230,
          height: 240,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'store_id', type: 'BIGINT', key: 'FK' },
            { name: 'type', type: 'VARCHAR(20)' },
            { name: 'category', type: 'VARCHAR(100)' },
            { name: 'amount', type: 'DECIMAL(14,2)' },
            { name: 'escrow_status', type: 'VARCHAR(30)' },
            { name: 'date', type: 'DATE' },
          ]
        },
        {
          id: 'seller_stock_logs',
          domain: 'warehouse',
          title: 'seller_stock_logs',
          badge: 'Kartu Mutasi Stok',
          color: '#059669',
          x: 880,
          y: 310,
          width: 230,
          height: 220,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'product_id', type: 'BIGINT', key: 'FK' },
            { name: 'warehouse_id', type: 'BIGINT', key: 'FK' },
            { name: 'type', type: 'VARCHAR(50)' },
            { name: 'quantity', type: 'INT' },
            { name: 'balance_after', type: 'INT' },
            { name: 'reference', type: 'VARCHAR(100)' },
          ]
        },
        {
          id: 'seller_inbounds',
          domain: 'warehouse',
          title: 'seller_inbounds',
          badge: 'Penerimaan Barang',
          color: '#059669',
          x: 880,
          y: 560,
          width: 230,
          height: 210,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'warehouse_id', type: 'BIGINT', key: 'FK' },
            { name: 'inbound_number', type: 'VARCHAR(100)' },
            { name: 'supplier_name', type: 'VARCHAR(150)' },
            { name: 'status', type: 'VARCHAR(30)' },
            { name: 'received_date', type: 'DATE' },
          ]
        },
      ],

      erdEdges: [
        { from: 'tenants', to: 'seller_stores', label: '1:N', desc: 'Toko Marketplace Terhubung', color: '#2563eb' },
        { from: 'tenants', to: 'seller_products', label: '1:N', desc: 'Master SKU Gudang & Stok', color: '#d97706' },
        { from: 'tenants', to: 'seller_warehouses', label: '1:N', desc: 'Master Lokasi Gudang', color: '#059669' },
        { from: 'seller_products', to: 'seller_sku_mappings', label: '1:N', desc: 'Pemetaan SKU Channel', color: '#2563eb' },
        { from: 'seller_stores', to: 'seller_sku_mappings', label: '1:N', desc: 'Daftar Produk per Toko', color: '#2563eb' },
        { from: 'seller_stores', to: 'seller_orders', label: '1:N', desc: 'Pesanan Marketplace', color: '#10b981' },
        { from: 'seller_orders', to: 'seller_order_items', label: '1:N', desc: 'Rincian Barang Dipesan', color: '#10b981' },
        { from: 'seller_products', to: 'seller_order_items', label: '1:N', desc: 'Pengurangan Stok Order', color: '#10b981' },
        { from: 'seller_orders', to: 'seller_shipments', label: '1:1', desc: 'Label Resi & Tracking Kurir', color: '#7c3aed' },
        { from: 'seller_products', to: 'seller_stock_logs', label: '1:N', desc: 'Riwayat Mutasi Stok Gudang', color: '#059669' },
        { from: 'seller_warehouses', to: 'seller_inbounds', label: '1:N', desc: 'Penerimaan Barang Inbound', color: '#059669' },
        { from: 'seller_stores', to: 'seller_finances', label: '1:N', desc: 'Rekap Dana Escrow & Potongan', color: '#e11d48' },
      ],

      erdMermaid: `erDiagram
    tenants ||--o{ seller_stores : "menghubungkan toko"
    tenants ||--o{ seller_products : "memiliki master SKU"
    tenants ||--o{ seller_warehouses : "mengelola gudang"
    seller_stores ||--o{ seller_sku_mappings : "memetakan SKU"
    seller_products ||--o{ seller_sku_mappings : "dipetakan ke channel"
    seller_stores ||--o{ seller_orders : "menerima pesanan"
    seller_orders ||--o{ seller_order_items : "memiliki item"
    seller_products ||--o{ seller_order_items : "dibeli dalam"
    seller_orders ||--|| seller_shipments : "dicetak resi"
    seller_products ||--o{ seller_stock_logs : "riwayat mutasi"
    seller_warehouses ||--o{ seller_inbounds : "menerima inbound"
    seller_stores ||--o{ seller_finances : "pencatatan escrow"`,

      erdEntities: [
        {
          table: 'seller_stores',
          description: 'Channel toko marketplace terhubung (Shopee, Tokopedia, TikTok, Lazada, Blibli)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['platform', 'store_name', 'store_code', 'access_token', 'is_connected', 'last_synced_at', 'total_orders_today', 'revenue_today'],
          relationships: ['Many to 1: tenants', '1 to Many: seller_orders', '1 to Many: seller_sku_mappings']
        },
        {
          table: 'seller_products',
          description: 'Master katalog SKU dan stok terpusat di seluruh channel toko online',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['sku', 'barcode', 'name', 'brand', 'cost_price', 'sell_price', 'total_stock', 'min_stock_alert', 'weight_gram'],
          relationships: ['Many to 1: tenants', '1 to Many: seller_sku_mappings', '1 to Many: seller_stock_logs', '1 to Many: seller_order_items']
        },
        {
          table: 'seller_sku_mappings',
          description: 'Tabel pemetaan relasi antara Master SKU gudang dengan Item ID marketplace',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: store_id'],
          columns: ['marketplace_item_id', 'marketplace_sku', 'marketplace_variation', 'sync_stock_enabled', 'price_override'],
          relationships: ['Many to 1: seller_products', 'Many to 1: seller_stores']
        },
        {
          table: 'seller_orders',
          description: 'Header pesanan e-commerce omnichannel dari seluruh marketplace',
          keys: ['PK: id', 'FK: tenant_id', 'FK: store_id'],
          columns: ['order_number', 'platform', 'customer_name', 'customer_phone', 'shipping_address', 'courier_service', 'total_amount', 'shipping_fee', 'status (Perlu Diproses, Dalam Pengiriman, Selesai, Retur)', 'order_date'],
          relationships: ['Many to 1: seller_stores', '1 to Many: seller_order_items', '1 to 1: seller_shipments']
        },
        {
          table: 'seller_order_items',
          description: 'Daftar produk, kuantitas dan harga dalam setiap nota pesanan online',
          keys: ['PK: id', 'FK: tenant_id', 'FK: order_id', 'FK: product_id'],
          columns: ['sku', 'product_name', 'variant_name', 'quantity', 'unit_price', 'subtotal'],
          relationships: ['Many to 1: seller_orders', 'Many to 1: seller_products']
        },
        {
          table: 'seller_shipments',
          description: 'Data resi pengiriman kurir, tanggal cetak thermal, dan manifest serah terima',
          keys: ['PK: id', 'FK: tenant_id', 'FK: order_id'],
          columns: ['courier_name', 'tracking_number', 'shipping_label_url', 'is_printed', 'printed_at', 'manifest_number', 'scanned_at_packing'],
          relationships: ['1 to 1: seller_orders']
        },
        {
          table: 'seller_warehouses',
          description: 'Master lokasi gudang fisik, rak penyimpanan & lokasi bin',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'code', 'city', 'address', 'pic_name', 'pic_phone', 'is_default'],
          relationships: ['Many to 1: tenants', '1 to Many: seller_stock_logs', '1 to Many: seller_inbounds']
        },
        {
          table: 'seller_stock_logs',
          description: 'Kartu stok dan log mutasi inventaris (Inbound, Outbound Order, Penyesuaian)',
          keys: ['PK: id', 'FK: tenant_id', 'FK: product_id', 'FK: warehouse_id'],
          columns: ['type (sale_out, inbound, opname_adjust, return_in)', 'quantity', 'balance_after', 'reference_number', 'notes'],
          relationships: ['Many to 1: seller_products', 'Many to 1: seller_warehouses']
        },
        {
          table: 'seller_inbounds',
          description: 'Dokumen penerimaan stok barang masuk dari supplier / pabrik',
          keys: ['PK: id', 'FK: tenant_id', 'FK: warehouse_id'],
          columns: ['inbound_number', 'supplier_name', 'total_items', 'status (draft, received, verified)', 'received_date', 'notes'],
          relationships: ['Many to 1: seller_warehouses']
        },
        {
          table: 'seller_finances',
          description: 'Rekap transaksi finansial e-commerce, biaya admin platform, iklan & saldo escrow',
          keys: ['PK: id', 'FK: tenant_id', 'FK: store_id (nullable)'],
          columns: ['type (income, expense)', 'category (Biaya Admin, Iklan Ads, Packing, Gaji, Klaim Retur)', 'amount', 'escrow_status (pending, released)', 'date', 'description'],
          relationships: ['Many to 1: seller_stores']
        },
        {
          table: 'seller_roles',
          description: 'Daftar peran & hak akses staf seller (Admin, Packer, Picker, Finance)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['name', 'permissions (JSON: orders, shipping, inventory, warehouse, finance, settings)'],
          relationships: ['Many to 1: tenants']
        }
      ],

      directoryStructure: [
        {
          section: 'Backend Architecture (Laravel 11)',
          tree: `backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── SellerWarehouseController.php  # CRUD Gudang, Multi-Warehouse Master
│   │   │   ├── SellerOrderController.php      # Omnichannel Order Processing & Status
│   │   │   ├── SellerProductController.php    # Master SKU, Central Inventory & Barcode
│   │   │   ├── SellerMarketplaceController.php# Channel Sync (Shopee, Tokopedia, TikTok)
│   │   │   ├── SellerShippingController.php   # Thermal Label Print, Batch & Manifest
│   │   │   ├── SellerFinanceController.php    # Escrow Settlement, Admin Fee & ROAS
│   │   │   └── SellerRoleController.php       # RBAC Staf Gudang & Admin Toko
│   │   ├── Middleware/
│   │   │   ├── CheckCategory.php              # Guard Kategori Usaha toko-online/seller
│   │   │   └── CheckSellerPermission.php      # Guard RBAC Staf Seller
│   │   ├── Models/
│   │   │   ├── SellerWarehouse.php, SellerStore.php, SellerOrder.php...
│   │   └── Services/
│   │       └── Marketplace/
│   │           ├── ShopeeApiService.php       # Shopee Open Platform API Client
│   │           ├── TokopediaApiService.php    # Tokopedia Open API Client
│   │           └── TikTokShopApiService.php   # TikTok Shop Partner API Client
├── database/migrations/                       # 16+ Migrasi Skema Seller Hub
└── routes/api.php                             # Route Group prefix('seller')`
        },
        {
          section: 'Frontend Architecture (React 18 TypeScript + Vite)',
          tree: `frontend/src/
├── apps/seller/
│   ├── repo/
│   │   ├── SellerApp.tsx              # Master Controller & Tab Navigation
│   │   ├── types.ts                   # Type Definitions (Orders, Stores, Stock, Finance)
│   │   ├── components/
│   │   │   ├── DashboardTab.tsx       # KPI Omzet, Order Masuk & Escrow Alert
│   │   │   ├── OrdersTab.tsx          # Inbox Pesanan Omnichannel & Batch Action
│   │   │   ├── CatalogTab.tsx         # Master SKU, Harga Modal & Central Stock
│   │   │   ├── WarehouseTab.tsx       # Multi-Gudang & Bin Location Management
│   │   │   ├── InboundTab.tsx         # Penerimaan Barang Masuk (Inbound Receiving)
│   │   │   ├── StockOpnameTab.tsx     # Opname Fisik Rak & Rekonsiliasi Varian
│   │   │   ├── OfflineStoreTab.tsx    # Kasir Cepat Mini POS Toko Fisik / COD
│   │   │   ├── MarketplaceTab.tsx     # Integrasi Shopee, Tokopedia, TikTok Shop
│   │   │   ├── ShippingTab.tsx        # Cetak Resi Massal A6 Thermal & Manifest
│   │   │   ├── FinanceTab.tsx         # Laporan Laba/Rugi, Admin Fee & Escrow
│   │   │   └── SettingsTab.tsx        # Pengaturan Akun, RBAC Peran & Staf
│   │   ├── hooks/                     # Custom Hooks for Seller Data Fetching
│   │   └── utils/                     # Formatting, Print Helpers & Barcode Parsers
│   └── seller.css                     # Scoped CSS Theme for Seller Hub`
        }
      ],

      apiEndpoints: [
        { method: 'GET', path: '/api/seller/dashboard/stats', name: 'Statistik Omnichannel Real-time', perm: 'dashboard', desc: 'Mengambil total omzet harian, jumlah pesanan baru, dan dana escrow tertahan' },
        { method: 'GET', path: '/api/seller/orders', name: 'Daftar Pesanan Multi-Channel', perm: 'orders', desc: 'Mengambil daftar pesanan dari Shopee, Tokopedia, TikTok, Lazada, dll' },
        { method: 'POST', path: '/api/seller/orders/batch-accept', name: 'Terima Pesanan Massal', perm: 'orders', desc: 'Konfirmasi dan proses ratusan pesanan marketplace sekaligus' },
        { method: 'POST', path: '/api/seller/shipping/bulk-labels', name: 'Generate Resi Thermal Massal', perm: 'shipping', desc: 'Membuat dokumen PDF cetak resi thermal A6 untuk batch pesanan' },
        { method: 'POST', path: '/api/seller/shipping/manifest', name: 'Cetak Manifest Serah Terima Kurir', perm: 'shipping', desc: 'Membuat berita acara penyerahan paket ke driver ekspedisi' },
        { method: 'GET', path: '/api/seller/products', name: 'Master Katalog SKU & Stok Terpusat', perm: 'catalog', desc: 'Mengambil daftar master SKU beserta alokasi stok di setiap channel' },
        { method: 'POST', path: '/api/seller/products/sync-stock', name: 'Push Sinkronisasi Stok ke Marketplace', perm: 'catalog', desc: 'Mengirim update stok terkini ke API Shopee, Tokopedia & TikTok Shop' },
        { method: 'GET', path: '/api/seller/warehouses', name: 'Daftar Lokasi Gudang Fisik', perm: 'warehouse', desc: 'Mengambil daftar gudang pusat, cabang, dan fulfillment center' },
        { method: 'POST', path: '/api/seller/warehouses', name: 'Tambah Gudang Baru', perm: 'warehouse', desc: 'Mendaftarkan lokasi gudang fisik atau cabang baru' },
        { method: 'POST', path: '/api/seller/inbounds', name: 'Catat Penerimaan Barang (Inbound)', perm: 'warehouse', desc: 'Mencatat stok masuk dari supplier dan menambah saldo gudang' },
        { method: 'POST', path: '/api/seller/opname', name: 'Submit Stock Opname Fisik', perm: 'warehouse', desc: 'Menyimpan hasil audit fisik rak gudang dan mencatat jurnal selisih stok' },
        { method: 'GET', path: '/api/seller/finance/escrow', name: 'Monitoring Saldo Escrow', perm: 'finance', desc: 'Pelacakan dana yang masih tertahan di rekening perantara marketplace' },
        { method: 'GET', path: '/api/seller/finance/summary', name: 'Laporan Laba / Rugi E-Commerce', perm: 'finance', desc: 'Kalkulasi laba bersih setelah dipotong HPP, biaya admin platform, dan ads' },
        { method: 'GET', path: '/api/seller/stores', name: 'Daftar Toko Marketplace Terhubung', perm: 'settings', desc: 'Mengambil status koneksi OAuth API toko Shopee, Tokopedia, TikTok Shop' }
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // [5] MODUL JASA, SERVIS & WORK ORDER (SERVICES OS)
    // ─────────────────────────────────────────────────────────────────────────

    landing: {
      key: 'landing',
      icon: <Sparkles size={18} />,
      title: 'Modul Landing Page & Portal',
      description: 'Halaman profil utama (front-facing) website untuk promosi produk, fitur unggulan ERP, tabel harga (pricing), FAQ, dan sistem registrasi (onboarding) tenant baru.',
      version: 'v1.1.0',
      lastUpdated: '2026-08-21',
      leadDeveloper: 'Bizora Frontend Team',

      domains: [
        { id: 'all', label: 'Semua Domain', color: '#ec4899' }
      ],

      techStack: {
        backend: [
          { name: 'Laravel 11.x', role: 'API untuk Registrasi & Data Referensi', tag: 'Framework' },
          { name: 'Sanctum', role: 'Otentikasi Login & Registrasi', tag: 'Auth' }
        ],
        frontend: [
          { name: 'React 18.x', role: 'UI Components', tag: 'UI Library' },
          { name: 'Vite 5.x', role: 'Build Tool', tag: 'Bundler' },
          { name: 'Lucide React', role: 'Iconography', tag: 'Icons' }
        ],
        database: [
          { name: 'MySQL', role: 'Tenant Data & Leads', tag: 'Storage' }
        ]
      },

      features: [
        {
          category: 'Company Profile',
          icon: <Globe size={20} className="text-primary" />,
          items: [
            'Hero Section animasi dinamis dengan call-to-action (CTA)',
            'Showcase Modul (Retail, Kuliner, Jasa, Budidaya, Seller)',
            'Tabel Harga Berlangganan (Pricing Plan)',
            'Testimonial Pelanggan & FAQ'
          ]
        },
        {
          category: 'Onboarding & Akses',
          icon: <Users size={20} className="text-primary" />,
          items: [
            'Pendaftaran Tenant Baru (Self-Service Registration)',
            'Portal Login terintegrasi untuk pengguna',
            'Sistem Kontak & Leads Generation'
          ]
        }
      ],
      erdNodes: [
        {
          id: 'tenants',
          domain: 'all',
          title: 'tenants',
          badge: 'Pelanggan / Organisasi',
          color: '#ec4899',
          x: 100,
          y: 100,
          width: 250,
          height: 160,
          fields: [
            { name: 'id', type: 'VARCHAR(32)', key: 'PK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'domain', type: 'VARCHAR(255)' },
            { name: 'status', type: 'VARCHAR(20)' },
            { name: 'created_at', type: 'TIMESTAMP' }
          ]
        }
      ],
      erdEntities: [
        {
          table: 'tenants',
          description: 'Pelanggan atau Organisasi yang mendaftar ke sistem',
          keys: ['PK: id (VARCHAR)'],
          columns: ['name', 'domain', 'status', 'created_at'],
          relationships: []
        }
      ],
      erdEdges: [],
      directoryStructure: [
        { section: 'frontend/src/pages/', items: ['Landing.jsx', 'Login.jsx', 'Register.jsx'] }
      ],
      apiEndpoints: [
        { method: 'POST', path: '/api/auth/register', name: 'Registrasi Tenant', perm: 'public', desc: 'Mendaftarkan tenant baru dan inisialisasi modul dasar' },
        { method: 'POST', path: '/api/auth/login', name: 'Login Akses', perm: 'public', desc: 'Autentikasi masuk ke dashboard masing-masing modul' }
      ]
    },
    jasa: {
      key: 'jasa',
      icon: <Wrench size={18} />,
      title: 'Modul Manajemen Jasa, Servis & Work Order (Services OS)',
      description: 'Platform operasional terpadu untuk bisnis jasa teknis, reparasi/bengkel, instalasi, salon/treatment, laundry, dan perawatan berkala. Dilengkapi manajemen Surat Perintah Kerja (SPK / Work Order), pelacakan tahapan servis, jadwal & kesiapan teknisi, pemakaian sparepart & bahan, AI Diagnostics & Estimator, kepatuhan SLA, serta cetak SPK & faktur resmi.',
      version: 'v2.0.0 (Services OS Core)',
      lastUpdated: '2026-08-20',
      leadDeveloper: 'Bizora Services Engineering Team',

      domains: [
        { id: 'all', label: 'Semua Domain (Full ERD Services OS)', color: '#8b5cf6' },
        { id: 'workorders', label: 'Surat Perintah Kerja (SPK)', color: '#6d28d9' },
        { id: 'technicians', label: 'Manajemen & Kesiapan Teknisi', color: '#0284c7' },
        { id: 'catalog', label: 'Katalog Layanan & Tarif Jasa', color: '#10b981' },
        { id: 'parts', label: 'Suku Cadang & Bahan Material', color: '#d97706' },
        { id: 'analytics', label: 'Analitik SLA & CSAT Pelanggan', color: '#e11d48' },
        { id: 'core', label: 'Multi-Tenant & Hak Akses', color: '#475569' },
      ],

      techStack: {
        backend: [
          { name: 'Laravel 11.x', role: 'RESTful API & Service Dispatching Core', tag: 'Framework' },
          { name: 'PHP 8.2+', role: 'Execution Runtime & SLA Time Tracking', tag: 'Core' },
          { name: 'SPK Generator Engine', role: 'Auto-incrementing work order identifier with validation', tag: 'Engine' },
          { name: 'Sanctum & Multi-Tenant', role: 'Tenant-scoped isolation for all service records & technicians', tag: 'Security' },
          { name: 'AI Diagnostics Integration', role: 'Root-cause symptom analyzer & parts estimator', tag: 'AI Engine' },
        ],
        frontend: [
          { name: 'React 18.x (TypeScript)', role: 'Dense high-performance service dispatching UI', tag: 'UI Library' },
          { name: 'Vite 5.x', role: 'Blazing fast bundler & HMR suite', tag: 'Bundler' },
          { name: 'Lucide React', role: 'Consistent iconography set', tag: 'Icons' },
          { name: 'Thermal & SPK Document Engine', role: 'Print-ready work order sheet & invoice formatter', tag: 'Printing' },
        ],
        database: [
          { name: 'MySQL 8.0 / InnoDB', role: 'Primary relational database for work order records', tag: 'Database' },
          { name: 'Relational Cascading', role: 'Clean logs & parts cleanup on work order lifecycle', tag: 'Integrity' },
        ]
      },

      features: [
        {
          category: 'Surat Perintah Kerja (Work Orders / SPK)',
          icon: <ClipboardList size={20} className="text-primary" />,
          items: [
            'Penerbitan SPK Baru dengan nomor unik terstandarisasi (SPK-YYYY-XXXX)',
            'Tingkat Prioritas (Darurat, Tinggi, Sedang, Rendah) dengan batas tenggat waktu SLA otomatis',
            'Pelacakan 8 Tahapan Servis: Menunggu Konfirmasi ➔ Dijadwalkan ➔ Dalam Perjalanan ➔ Dikerjakan ➔ Menunggu Sparepart ➔ QC ➔ Selesai ➔ Dibatalkan',
            'Riwayat Audit Trail (Action Log) mencatat setiap pergantian status dan catatan teknisi',
          ]
        },
        {
          category: 'Mesin Sektor Dinamis (Multi-Sector Jasa)',
          icon: <Activity size={20} className="text-primary" />,
          items: [
            'Dukungan 10 Kategori Bisnis Jasa: Bengkel, Cleaning Service, Laundry, Salon, Klinik, IT, Fotografi, Konsultan, Konstruksi, dan Lainnya.',
            'Adaptasi Terminologi Otomatis: Istilah Pekerja (Teknisi/Stylist/Terapis), Dokumen (SPK/Order/Booking), dan Material (Sparepart/Produk/Bahan) menyesuaikan dengan jenis bisnis.',
            'Kustomisasi Standarisasi Master Data: Kategori Layanan, Spesialisasi Pegawai, dan Kategori Inventory yang otomatis berubah mengikuti tema bisnis.',
            'Prefix Dokumen Dinamis (SRV, LND, SLN, MED, dll) untuk membedakan jenis dokumen transaksi.'
          ]
        },
        {
          category: 'Manajemen Teknisi & Penugasan Lapangan',
          icon: <Users size={20} className="text-primary" />,
          items: [
            'Monitoring Status Kesiapan Teknisi secara Real-Time (Tersedia, Bertugas, Izin/Cuti, Siaga)',
            'Katalog Keahlian (Skills) & Sertifikasi Keahlian per personil',
            'Penilaian Kinerja & Rating Pelanggan (CSAT 1-5 bintang) serta riwayat pekerjaan tuntas',
            'Kalkulasi Tingkat Utilisasi Personil (Technician Utilization Rate %)',
          ]
        },
        {
          category: 'Katalog Layanan & Tarif Jasa',
          icon: <Wrench size={20} className="text-primary" />,
          items: [
            'Daftar Tarif Dasar Layanan (Base Price) & estimasi durasi pengerjaan per jam',
            'Kategori Layanan: Preventive Maintenance, Corrective Troubleshooting, Instalasi, Kalibrasi, Konsultasi',
            'Garansi Pengerjaan (Warranty Days) tercantum resmi pada struk/SPK',
            'Rekomendasi suku cadang standar untuk setiap jenis jasa',
          ]
        },
        {
          category: 'AI Diagnostics & Estimator Biaya',
          icon: <Sparkles size={20} className="text-primary" />,
          items: [
            'Analisis Gejala Kerusakan otomatis berbasis kecerdasan buatan',
            'Estimasi Kebutuhan Suku Cadang & Biaya Tenaga Kerja (Labor Rate)',
            'Rekomendasi Tingkat Keahlian Teknisi dan Petunjuk Keselamatan Kerja (Safety Precautions)',
          ]
        },
        {
          category: 'Cetak Dokumen SPK & Faktur Bergaransi',
          icon: <Printer size={20} className="text-primary" />,
          items: [
            'Format Cetak Resmi SPK (Surat Perintah Kerja) untuk pegangan teknisi di lapangan',
            'Lembar Tanda Terima Pelanggan & Kartu Garansi Servis',
          ]
        }
      ],

      erdNodes: [
        // Kolom 1: Core & Multi-Tenant
        {
          id: 'tenants',
          domain: 'core',
          title: 'tenants',
          badge: 'Root Entity',
          color: '#6d28d9',
          x: 40,
          y: 40,
          width: 230,
          height: 200,
          fields: [
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'PK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'business_name', type: 'VARCHAR(255)' },
            { name: 'subscription_plan', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ]
        },
        {
          id: 'jasa_services',
          domain: 'catalog',
          title: 'jasa_services',
          badge: 'Katalog Tarif Jasa',
          color: '#10b981',
          x: 40,
          y: 270,
          width: 230,
          height: 230,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'code', type: 'VARCHAR(50)' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'category', type: 'VARCHAR(100)' },
            { name: 'base_price', type: 'DECIMAL(14,2)' },
            { name: 'warranty_days', type: 'INT' },
          ]
        },

        // Kolom 2: Teknisi
        {
          id: 'jasa_technicians',
          domain: 'technicians',
          title: 'jasa_technicians',
          badge: 'Personel & Teknisi',
          color: '#0284c7',
          x: 320,
          y: 40,
          width: 230,
          height: 250,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'user_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(150)' },
            { name: 'specialty', type: 'VARCHAR(150)' },
            { name: 'phone', type: 'VARCHAR(50)' },
            { name: 'rating', type: 'DECIMAL(3,2)' },
            { name: 'current_status', type: 'VARCHAR(50)' },
          ]
        },

        // Kolom 3: Surat Perintah Kerja (SPK)
        {
          id: 'jasa_work_orders',
          domain: 'workorders',
          title: 'jasa_work_orders',
          badge: 'Surat Perintah Kerja (SPK)',
          color: '#6d28d9',
          x: 600,
          y: 40,
          width: 240,
          height: 300,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'assigned_technician_id', type: 'BIGINT', key: 'FK' },
            { name: 'spk_number', type: 'VARCHAR(50)' },
            { name: 'title', type: 'VARCHAR(255)' },
            { name: 'customer_name', type: 'VARCHAR(150)' },
            { name: 'category', type: 'VARCHAR(100)' },
            { name: 'priority', type: 'VARCHAR(30)' },
            { name: 'status', type: 'VARCHAR(50)' },
            { name: 'grand_total', type: 'DECIMAL(14,2)' },
          ]
        },

        // Kolom 4: Suku Cadang & Log
        {
          id: 'jasa_order_parts',
          domain: 'parts',
          title: 'jasa_order_parts',
          badge: 'Suku Cadang & Bahan',
          color: '#d97706',
          x: 890,
          y: 40,
          width: 230,
          height: 200,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'work_order_id', type: 'BIGINT', key: 'FK' },
            { name: 'name', type: 'VARCHAR(255)' },
            { name: 'quantity', type: 'INT' },
            { name: 'unit_cost', type: 'DECIMAL(14,2)' },
            { name: 'subtotal', type: 'DECIMAL(14,2)' },
          ]
        },
        {
          id: 'jasa_work_order_logs',
          domain: 'workorders',
          title: 'jasa_work_order_logs',
          badge: 'Audit Log SPK',
          color: '#6d28d9',
          x: 890,
          y: 270,
          width: 230,
          height: 190,
          fields: [
            { name: 'id', type: 'BIGINT', key: 'PK' },
            { name: 'tenant_id', type: 'VARCHAR(32)', key: 'FK' },
            { name: 'work_order_id', type: 'BIGINT', key: 'FK' },
            { name: 'author', type: 'VARCHAR(100)' },
            { name: 'action', type: 'VARCHAR(100)' },
            { name: 'notes', type: 'TEXT' },
            { name: 'created_at', type: 'TIMESTAMP' },
          ]
        },
      ],

      erdEdges: [
        { from: 'tenants', to: 'jasa_services', label: '1:N', desc: 'Daftar Layanan Jasa', color: '#10b981' },
        { from: 'tenants', to: 'jasa_technicians', label: '1:N', desc: 'Daftar Personel Teknisi', color: '#0284c7' },
        { from: 'tenants', to: 'jasa_work_orders', label: '1:N', desc: 'Daftar Surat Perintah Kerja', color: '#6d28d9' },
        { from: 'jasa_technicians', to: 'jasa_work_orders', label: '1:N', desc: 'Penugasan SPK ke Teknisi', color: '#0284c7' },
        { from: 'jasa_work_orders', to: 'jasa_order_parts', label: '1:N', desc: 'Pemakaian Suku Cadang', color: '#d97706' },
        { from: 'jasa_work_orders', to: 'jasa_work_order_logs', label: '1:N', desc: 'Catatan Progress & Log', color: '#6d28d9' },
      ],

      erdMermaid: `erDiagram
    tenants ||--o{ jasa_services : "memiliki layanan"
    tenants ||--o{ jasa_technicians : "memiliki teknisi"
    tenants ||--o{ jasa_work_orders : "menerbitkan SPK"
    jasa_technicians ||--o{ jasa_work_orders : "ditugaskan ke"
    jasa_work_orders ||--o{ jasa_order_parts : "memakai suku cadang"
    jasa_work_orders ||--o{ jasa_work_order_logs : "riwayat log"`,

      erdEntities: [
        {
          table: 'jasa_services',
          description: 'Katalog daftar harga jasa, estimasi durasi dan masa garansi',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['code', 'name', 'category', 'description', 'base_price', 'estimated_duration_hours', 'warranty_days', 'required_skill_level'],
          relationships: ['Many to 1: tenants']
        },
        {
          table: 'jasa_technicians',
          description: 'Data teknisi, spesialisasi, rating pelanggan dan status kesiapan kerja',
          keys: ['PK: id', 'FK: tenant_id', 'FK: user_id'],
          columns: ['name', 'avatar', 'specialty', 'phone', 'email', 'rating', 'completed_jobs', 'current_status (Tersedia, Bertugas, Cuti, Siaga)'],
          relationships: ['Many to 1: tenants', '1 to Many: jasa_work_orders']
        },
        {
          table: 'jasa_work_orders',
          description: 'Surat Perintah Kerja (SPK) mencatat detail keluhan, teknisi, biaya, dan SLA',
          keys: ['PK: id', 'FK: tenant_id', 'FK: assigned_technician_id'],
          columns: ['spk_number', 'title', 'customer_name', 'customer_phone', 'customer_address', 'category', 'equipment_name', 'priority', 'status', 'grand_total', 'payment_status', 'warranty_period', 'sla_deadline'],
          relationships: ['Many to 1: tenants', 'Many to 1: jasa_technicians', '1 to Many: jasa_order_parts', '1 to Many: jasa_work_order_logs']
        },
        {
          table: 'jasa_order_parts',
          description: 'Rincian suku cadang / material yang digunakan dalam perbaikan',
          keys: ['PK: id', 'FK: tenant_id', 'FK: work_order_id'],
          columns: ['name', 'quantity', 'unit_cost', 'subtotal'],
          relationships: ['Many to 1: jasa_work_orders']
        },
        {
          table: 'jasa_work_order_logs',
          description: 'Catatan kronologis aktivitas dan pembaruan tahapan pengerjaan SPK',
          keys: ['PK: id', 'FK: tenant_id', 'FK: work_order_id'],
          columns: ['author', 'action', 'notes', 'created_at'],
          relationships: ['Many to 1: jasa_work_orders']
        },
        {
          table: 'jasa_settings',
          description: 'Pengaturan terminologi dinamis (Pekerja, Dokumen, Material) berdasarkan jenis bisnis jasa (Bengkel, Laundry, Klinik, dll)',
          keys: ['PK: id', 'FK: tenant_id'],
          columns: ['business_type', 'term_technician', 'term_sparepart', 'term_spk', 'document_prefix', 'service_categories (JSON)', 'technician_specialties (JSON)', 'inventory_categories (JSON)'],
          relationships: ['1 to 1: tenants']
        }
      ],

      directoryStructure: [
        {
          section: 'Backend Architecture (Laravel 11)',
          tree: `backend/
├── app/
│   ├── Http/
│   │   └── Controllers/Api/
│   │       └── JasaController.php             # Work Orders, Technicians, Services, Stats
│   ├── Models/
│   │   ├── JasaService.php                    # Model Katalog Layanan
│   │   ├── JasaTechnician.php                 # Model Personel Teknisi
│   │   ├── JasaWorkOrder.php                  # Model SPK / Work Order
│   │   ├── JasaOrderPart.php                  # Model Suku Cadang & Bahan
│   │   └── JasaWorkOrderLog.php               # Model Audit Log Pengerjaan
└── routes/api.php                             # Route Group prefix('jasa')`
        },
        {
          section: 'Frontend Architecture (React 18 TypeScript + Vite)',
          tree: `frontend/src/
├── apps/jasa/
│   └── repo/
│       ├── App.tsx                            # Master Layout & Controller
│       ├── types.ts                           # Domain Type Definitions (WorkOrder, Technician)
│       ├── components/
│       │   ├── KpiCards.tsx                   # KPI Metrik Operasional & Kepatuhan SLA
│       │   ├── WorkOrdersView.tsx             # Grid & Table Filter Surat Perintah Kerja
│       │   ├── NewWorkOrderModal.tsx          # Form Penerbitan SPK Baru & Alokasi Teknisi
│       │   ├── WorkOrderDetailModal.tsx       # Detail SPK, Tahapan Pengerjaan & Suku Cadang
│       │   ├── PrintSpkModal.tsx              # Format Cetak Resmi Dokumen SPK Bergaransi
│       │   ├── TechniciansView.tsx            # Monitoring Kesiapan Teknisi & Keahlian
│       │   ├── ServiceCatalogView.tsx         # Katalog Tarif Jasa & Estimasi Durasi
│       │   ├── AiDiagnosticsModal.tsx         # AI Root-Cause Diagnostic & Part Estimator
│       │   ├── AnalyticsView.tsx              # Grafik Analitik SLA, Revenue & CSAT
│       │   ├── TopBar.tsx & Sidebar.tsx       # Navigasi Menu Layanan Jasa
│       │   └── Toast.tsx                      # Notification Feedback Alerts
│       └── data/mockData.ts                   # Initial Seed Data`
        }
      ],

      apiEndpoints: [
        { method: 'GET', path: '/api/jasa/stats', name: 'Statistik KPI Operasional', perm: 'reports', desc: 'Mengambil ringkasan tiket aktif, SLA compliance rate, dan utilisasi teknisi' },
        { method: 'GET', path: '/api/jasa/work-orders', name: 'Daftar Surat Perintah Kerja (SPK)', perm: 'orders', desc: 'Mengambil daftar SPK dengan filter status dan tingkat prioritas' },
        { method: 'POST', path: '/api/jasa/work-orders', name: 'Buat SPK Baru', perm: 'orders', desc: 'Menerbitkan Surat Perintah Kerja baru dan menugaskan teknisi' },
        { method: 'PATCH', path: '/api/jasa/work-orders/{id}/status', name: 'Update Tahapan Servis', perm: 'orders', desc: 'Memperbarui status pengerjaan SPK (Dikerjakan, QC, Selesai) dan mencatat log' },
        { method: 'GET', path: '/api/jasa/technicians', name: 'Daftar Teknisi & Kesiapan', perm: 'technicians', desc: 'Mengambil data teknisi, spesialisasi, rating, dan status tugas' },
        { method: 'GET', path: '/api/jasa/services', name: 'Katalog Tarif Layanan Jasa', perm: 'catalog', desc: 'Mengambil daftar tarif dasar layanan, durasi jam, dan masa garansi' }
      ]
    }
  };

  const currentDoc = MODULE_DATA[selectedModule] || MODULE_DATA.retail;

  const filteredEntities = currentDoc.erdEntities.filter(e =>
    e.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEndpoints = currentDoc.apiEndpoints.filter(e =>
    e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNodeById = (id) => currentDoc.erdNodes.find(n => n.id === id);

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="page-header">
        <h2 className="page-title">Dokumentasi Modul &amp; Arsitektur</h2>
      </div>

      {/* Module Selector Toolbar */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 12 }}>
            <BookOpen size={14} /> Dokumentasi Teknis Sistem
          </span>
          <span className="badge badge-success" style={{ padding: '5px 12px', fontSize: 12 }}>
            {currentDoc.version}
          </span>
        </div>

        {/* Module Selector Dropdown */}
        <div style={{ minWidth: 260 }}>
          <select
            value={selectedModule}
            onChange={(e) => handleModuleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <option value="retail">🏪 Modul Retail</option>
            <option value="kuliner">🍽️ Modul Kuliner (F&amp;B)</option>
            <option value="budidaya">🐔 Modul Budidaya &amp; Peternakan</option>
            <option value="seller">🌐 Modul Seller Hub</option>
            <option value="jasa">🔧 Modul Jasa (Services OS)</option>
            <option value="landing">✨ Landing Page</option>
          </select>
        </div>
      </div>

      {/* Module Highlight Banner */}
      <div className="module-hero-banner" style={{
        background: selectedModule === 'kuliner'
          ? 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)'
          : (selectedModule === 'budidaya'
            ? 'linear-gradient(135deg, #1B4332 0%, #059669 100%)'
            : (selectedModule === 'seller'
              ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
              : (selectedModule === 'jasa'
                ? 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)'
                : (selectedModule === 'landing' ? 'linear-gradient(135deg, #be185d 0%, #f472b6 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)')))),
        color: '#ffffff',
        padding: '20px 24px',
        borderRadius: 16,
        marginBottom: 20,
        boxShadow: selectedModule === 'kuliner'
          ? '0 10px 25px -5px rgba(234, 88, 12, 0.25)'
          : (selectedModule === 'budidaya'
            ? '0 10px 25px -5px rgba(27, 67, 50, 0.25)'
            : (selectedModule === 'seller'
              ? '0 10px 25px -5px rgba(2, 132, 199, 0.25)'
              : (selectedModule === 'jasa'
                ? '0 10px 25px -5px rgba(109, 40, 217, 0.25)'
                : '0 10px 25px -5px rgba(79, 70, 229, 0.25)'))),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        transition: 'background 0.3s'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: '#ffffff' }}>
            <span style={{ color: '#ffffff', display: 'flex' }}>{currentDoc.icon}</span>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: '#ffffff' }}>{currentDoc.title}</h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.95, lineHeight: 1.5, color: '#ffffff' }}>
            {currentDoc.description}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85, fontWeight: 600, color: '#ffffff' }}>Tabel Database</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#ffffff' }}>{currentDoc.erdEntities.length} Tabel</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85, fontWeight: 600, color: '#ffffff' }}>Relasi Entitas</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#ffffff' }}>{currentDoc.erdEdges.length} Relasi</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85, fontWeight: 600, color: '#ffffff' }}>Diagram Visual</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#ffffff' }}>Canvas HD</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        marginBottom: 20,
        overflowX: 'auto',
        paddingBottom: 2
      }}>
        {[
          { id: 'erd', label: '🖼️ Database & ERD Schema', icon: <Database size={17} /> },
          { id: 'overview', label: '⚙️ Tech Stack & Framework', icon: <Cpu size={17} /> },
          { id: 'features', label: '⚡ Daftar Fitur Lengkap', icon: <Layers size={17} /> },
          { id: 'directory', label: '🧩 Struktur Folder & Kode', icon: <FolderTree size={17} /> },
          { id: 'endpoints', label: '🔌 API Reference', icon: <Terminal size={17} /> },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 18px',
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id
                ? (selectedModule === 'kuliner' ? '#ea580c' : (selectedModule === 'budidaya' ? '#1B4332' : (selectedModule === 'seller' ? '#0284c7' : (selectedModule === 'jasa' ? '#6d28d9' : (selectedModule === 'landing' ? '#ec4899' : '#4f46e5')))))
                : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id
                ? `3px solid ${selectedModule === 'kuliner' ? '#ea580c' : (selectedModule === 'budidaya' ? '#1B4332' : (selectedModule === 'seller' ? '#0284c7' : (selectedModule === 'jasa' ? '#6d28d9' : (selectedModule === 'landing' ? '#ec4899' : '#4f46e5'))))}`
                : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: DATABASE & ERD SCHEMA (ENHANCED VISUAL DIAGRAM) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'erd' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Sub-Tabs & Diagram Controls Toolbar */}
          <div style={{
            background: 'var(--bg-card, #fff)',
            borderRadius: 14,
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            {/* View Mode Selector */}
            <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${erdViewMode === 'visual' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '6px 14px' }}
                onClick={() => setErdViewMode('visual')}
              >
                <Eye size={15} /> Diagram Visual (Grafik ERD)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${erdViewMode === 'schema' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '6px 14px' }}
                onClick={() => setErdViewMode('schema')}
              >
                <Database size={15} /> Kamus Data & Kolom ({currentDoc.erdEntities.length} Tabel)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${erdViewMode === 'mermaid' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '6px 14px' }}
                onClick={() => setErdViewMode('mermaid')}
              >
                <Code2 size={15} /> Kode Mermaid
              </button>
            </div>

            {/* Visual Canvas Toolbar Controls */}
            {erdViewMode === 'visual' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', padding: '3px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '4px 8px' }}
                    onClick={() => handleZoom(-0.1)}
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 46, textAlign: 'center' }}>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '4px 8px' }}
                    onClick={() => handleZoom(0.1)}
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 11 }}
                    onClick={resetZoom}
                    title="Reset Zoom (100%)"
                  >
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  {isFullscreen ? 'Kecilkan' : 'Layar Penuh'}
                </button>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MODE 1: VISUAL INTERACTIVE ERD GRAPH CANVAS */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {erdViewMode === 'visual' && (
            <div style={{
              background: 'var(--bg-card, #fff)',
              borderRadius: 16,
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: isFullscreen ? 'fixed' : 'relative',
              top: isFullscreen ? 0 : 'auto',
              left: isFullscreen ? 0 : 'auto',
              width: isFullscreen ? '100vw' : '100%',
              height: isFullscreen ? '100vh' : 'auto',
              zIndex: isFullscreen ? 99999 : 1,
              boxShadow: isFullscreen ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }}>
              {/* Domain Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Filter size={13} /> Filter Klaster:
                </span>
                {currentDoc.domains.map(dom => (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setSelectedDomain(dom.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: selectedDomain === dom.id ? 700 : 500,
                      border: '1px solid',
                      borderColor: selectedDomain === dom.id ? dom.color : '#e2e8f0',
                      background: selectedDomain === dom.id ? dom.color : '#fff',
                      color: selectedDomain === dom.id ? '#fff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {dom.label}
                  </button>
                ))}
              </div>

              {/* ERD Diagram Instructions & Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} /> <strong>PK</strong> = Primary Key
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} /> <strong>FK</strong> = Foreign Key
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowRight size={13} color="#64748b" /> Garis = Relasi (<strong>1:N</strong> = One-to-Many, <strong>1:1</strong> = One-to-One)
                  </span>
                </div>
                <span style={{ fontStyle: 'italic' }}>
                  💡 Arahkan kursor pada garis / tabel untuk melihat keterangan relasi data lengkap.
                </span>
              </div>

              {/* SVG Canvas Container */}
              <div
                ref={svgContainerRef}
                style={{
                  width: '100%',
                  height: isFullscreen ? 'calc(100vh - 170px)' : '780px',
                  background: 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  overflow: 'auto',
                  position: 'relative'
                }}
              >
                <svg
                  width={1580 * zoomLevel}
                  height={1120 * zoomLevel}
                  viewBox="0 0 1580 1120"
                  style={{
                    display: 'block',
                    transition: 'transform 0.15s ease-out',
                    transformOrigin: '0 0'
                  }}
                >
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={selectedModule === 'kuliner' ? '#ea580c' : (selectedModule === 'budidaya' ? '#15803d' : (selectedModule === 'seller' ? '#0284c7' : (selectedModule === 'jasa' ? '#6d28d9' : (selectedModule === 'landing' ? '#ec4899' : '#4f46e5'))))} />
                    </marker>
                    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.08" />
                    </filter>
                    <filter id="shadow-hover" x="-10%" y="-10%" width="125%" height="125%">
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.18" />
                    </filter>
                  </defs>

                  {/* ─── RENDER CONNECTIONS (RELATIONAL EDGES) ────────────────── */}
                  {currentDoc.erdEdges.map((edge, idx) => {
                    const fromNode = getNodeById(edge.from);
                    const toNode = getNodeById(edge.to);
                    if (!fromNode || !toNode) return null;

                    const isHighlighted = hoveredTable === edge.from || hoveredTable === edge.to;
                    const isDomainActive = selectedDomain === 'all' || fromNode.domain === selectedDomain || toNode.domain === selectedDomain;

                    if (!isDomainActive) return null;

                    const startX = fromNode.x + fromNode.width;
                    const startY = fromNode.y + Math.min(fromNode.height / 2, 70);
                    const endX = toNode.x;
                    const endY = toNode.y + Math.min(toNode.height / 2, 70);

                    const dx = Math.abs(endX - startX) * 0.5;
                    const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
                    const activeColor = selectedModule === 'kuliner' ? '#ea580c' : (selectedModule === 'budidaya' ? '#15803d' : (selectedModule === 'seller' ? '#0284c7' : (selectedModule === 'jasa' ? '#6d28d9' : (selectedModule === 'landing' ? '#ec4899' : '#4f46e5'))));

                    return (
                      <g key={idx} opacity={isHighlighted ? 1 : 0.65} style={{ cursor: 'pointer' }}>
                        <title>{`${edge.from} ➔ ${edge.to} (${edge.label || '1:N'}${edge.desc ? ': ' + edge.desc : ''})`}</title>
                        <path
                          d={pathData}
                          fill="none"
                          stroke={isHighlighted ? activeColor : '#94a3b8'}
                          strokeWidth={isHighlighted ? 3 : 1.8}
                          strokeDasharray={edge.label === '1:1' ? '4,4' : 'none'}
                          markerEnd={isHighlighted ? 'url(#arrow-active)' : 'url(#arrow)'}
                        />
                        <rect
                          x={(startX + endX) / 2 - 14}
                          y={(startY + endY) / 2 - 9}
                          width="28"
                          height="18"
                          rx="5"
                          fill={isHighlighted ? activeColor : '#f8fafc'}
                          stroke={isHighlighted ? activeColor : '#cbd5e1'}
                          strokeWidth="1.2"
                        />
                        <text
                          x={(startX + endX) / 2}
                          y={(startY + endY) / 2 + 3.5}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill={isHighlighted ? '#fff' : '#475569'}
                          fontFamily="sans-serif"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* ─── RENDER ENTITY NODES (TABLES) ────────────────────────── */}
                  {currentDoc.erdNodes.map((node) => {
                    const isHovered = hoveredTable === node.id;
                    const isDomainMatch = selectedDomain === 'all' || node.domain === selectedDomain;
                    const opacity = isDomainMatch ? (hoveredTable && !isHovered ? 0.75 : 1) : 0.25;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        opacity={opacity}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={() => setHoveredTable(node.id)}
                        onMouseLeave={() => setHoveredTable(null)}
                      >
                        <rect
                          width={node.width}
                          height={node.height}
                          rx="10"
                          fill="#ffffff"
                          stroke={isHovered ? node.color : '#e2e8f0'}
                          strokeWidth={isHovered ? 2.5 : 1.2}
                          filter={isHovered ? 'url(#shadow-hover)' : 'url(#shadow)'}
                        />
                        <path
                          d={`M 0 10 Q 0 0 10 0 L ${node.width - 10} 0 Q ${node.width} 0 ${node.width} 10 L ${node.width} 36 L 0 36 Z`}
                          fill={node.color}
                        />
                        <text
                          x="12"
                          y="22"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="800"
                          fontFamily="Consolas, Monaco, monospace"
                        >
                          {node.title}
                        </text>
                        <rect
                          x={node.width - 92}
                          y="8"
                          width="84"
                          height="18"
                          rx="9"
                          fill="rgba(255,255,255,0.25)"
                        />
                        <text
                          x={node.width - 50}
                          y="20.5"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="700"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {node.badge}
                        </text>

                        {node.fields.map((field, fidx) => {
                          const rowY = 56 + (fidx * 21);
                          const isPk = field.key === 'PK';
                          const isFk = field.key === 'FK';

                          return (
                            <g key={fidx}>
                              {fidx % 2 === 1 && (
                                <rect
                                  x="2"
                                  y={rowY - 14}
                                  width={node.width - 4}
                                  height="20"
                                  fill="#f8fafc"
                                />
                              )}
                              {isPk && (
                                <circle cx="15" cy={rowY - 4} r="5" fill="#d97706" />
                              )}
                              {isFk && (
                                <circle cx="15" cy={rowY - 4} r="5" fill="#2563eb" />
                              )}
                              <text
                                x={isPk || isFk ? '26' : '12'}
                                y={rowY}
                                fontSize="11"
                                fontWeight={isPk || isFk ? '700' : '500'}
                                fill={isPk ? '#92400e' : isFk ? '#1e40af' : '#1e293b'}
                                fontFamily="Consolas, Monaco, monospace"
                              >
                                {field.name}
                              </text>
                              <text
                                x={node.width - 10}
                                y={rowY}
                                fontSize="9.5"
                                fill="#64748b"
                                textAnchor="end"
                                fontFamily="sans-serif"
                              >
                                {field.type}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MODE 2: SCHEMA EXPLORER & DATA DICTIONARY */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {erdViewMode === 'schema' && (
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Kamus Data & Spesifikasi Kolom ({currentDoc.erdEntities.length} Tabel Database)</h3>
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Struktur tabel lengkap dengan tipe data, relasi foreign key, dan deskripsi fungsi</span>
                </div>
                <div style={{ position: 'relative', width: 280 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Cari nama tabel..."
                    className="form-control"
                    style={{ paddingLeft: 32, fontSize: 13 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredEntities.map((entity, idx) => {
                  const isExpanded = !!expandedTables[entity.table];
                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--border-color, #e2e8f0)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div
                        onClick={() => toggleTableExpand(entity.table)}
                        style={{
                          padding: '14px 18px',
                          background: isExpanded ? 'var(--bg-hover, #f8fafc)' : '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <code style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: selectedModule === 'kuliner' ? '#ea580c' : '#4f46e5',
                            background: selectedModule === 'kuliner' ? '#ffedd5' : '#ede9fe',
                            padding: '3px 8px',
                            borderRadius: 6
                          }}>
                            {entity.table}
                          </code>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>— {entity.description}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="badge badge-secondary" style={{ fontSize: 11 }}>{entity.columns?.length || 0} Kolom</span>
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border-color, #e2e8f0)', background: '#fff', fontSize: 13 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 14 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Keys & Identifiers</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {entity.keys.map((k, kidx) => (
                                  <div key={kidx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                                    <Key size={13} color={k.startsWith('PK') ? '#d97706' : '#2563eb'} />
                                    <code>{k}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Relasi (Relationships)</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {entity.relationships?.map((r, ridx) => (
                                  <div key={ridx} style={{ fontSize: 12.5, color: '#4b5563' }}>
                                    • {r}
                                  </div>
                                )) || <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Tidak ada relasi turunan</span>}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Daftar Kolom Penting</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {entity.columns.map((col, cidx) => (
                                <span key={cidx} style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 4, fontSize: 11.5, fontFamily: 'monospace' }}>
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MODE 3: MERMAID CODE VIEW */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {erdViewMode === 'mermaid' && (
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Code2 size={18} color="#4f46e5" /> Kode Mermaid ERD ({currentDoc.title})
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => copyToClipboard(
                    currentDoc.erdEdges.map(e => `  ${e.from.toUpperCase()} ||--o{ ${e.to.toUpperCase()} : "${e.label}"`).join('\n'),
                    'mermaid_raw'
                  )}
                >
                  {copiedId === 'mermaid_raw' ? <Check size={14} /> : <Copy size={14} />} Salin Kode Mermaid
                </button>
              </div>
              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: 18,
                borderRadius: 10,
                fontSize: 13,
                lineHeight: 1.6,
                overflowX: 'auto',
                margin: 0,
                fontFamily: 'Consolas, Monaco, monospace'
              }}>
                {`erDiagram\n` + currentDoc.erdEdges.map(e => `  ${e.from.toUpperCase()} ||--o{ ${e.to.toUpperCase()} : "${e.label}"`).join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: TECH STACK & FRAMEWORK */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Backend Tech Card */}
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Backend Framework & Core</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Server-side RESTful API Architecture</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentDoc.techStack.backend.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--bg-hover, #f8fafc)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.role}</div>
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: 11 }}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frontend Tech Card */}
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layout size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Frontend & UI Framework</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Client-side SPA (Single Page Application)</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentDoc.techStack.frontend.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--bg-hover, #f8fafc)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.role}</div>
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: 11 }}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Database & Security Card */}
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Database & Storage Layer</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ACID Compliant Relational Engine</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentDoc.techStack.database.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--bg-hover, #f8fafc)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.role}</div>
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: 11 }}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: FITUR LENGKAP */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'features' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {currentDoc.features.map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card, #fff)',
                borderRadius: 16,
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: 22,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: selectedModule === 'kuliner' ? '#ffedd5' : '#ede9fe',
                  color: selectedModule === 'kuliner' ? '#ea580c' : '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary)' }}>{feat.category}</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {feat.items.map((it, iidx) => (
                  <li key={iidx} style={{ marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: DIRECTORY & CODE STRUCTURE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'directory' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {currentDoc.directoryStructure.map((dir, idx) => (
            <div key={idx} style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderTree size={18} color={selectedModule === 'kuliner' ? '#ea580c' : (selectedModule === 'budidaya' ? '#1B4332' : (selectedModule === 'seller' ? '#0284c7' : '#4f46e5'))} /> {dir.section}
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => copyToClipboard(dir.tree, `tree_${idx}`)}
                >
                  {copiedId === `tree_${idx}` ? <Check size={14} color="#16a34a" /> : <Copy size={14} />} Salin Struktur
                </button>
              </div>
              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: 18,
                borderRadius: 10,
                fontSize: 12.5,
                lineHeight: 1.6,
                overflowX: 'auto',
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace'
              }}>
                {dir.tree}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: API ENDPOINTS REFERENCE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'endpoints' && (
        <div className="animate-fade-in" style={{ background: 'var(--bg-card, #fff)', borderRadius: 16, border: '1px solid var(--border-color, #e2e8f0)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} color={selectedModule === 'kuliner' ? '#ea580c' : (selectedModule === 'budidaya' ? '#1B4332' : (selectedModule === 'seller' ? '#0284c7' : '#4f46e5'))} /> RESTful API Endpoints ({currentDoc.title})
              </h3>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Semua endpoint diwajibkan header <code>Authorization: Bearer {'<token>'}</code></span>
            </div>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Cari endpoint atau permission..."
                className="form-control"
                style={{ paddingLeft: 32, fontSize: 13 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table" style={{ width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <th style={{ padding: '12px 14px', width: 90 }}>Method</th>
                  <th style={{ padding: '12px 14px' }}>Endpoint Path</th>
                  <th style={{ padding: '12px 14px', width: 150 }}>Permission</th>
                  <th style={{ padding: '12px 14px' }}>Deskripsi Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEndpoints.map((ep, idx) => {
                  const methodColor =
                    ep.method === 'GET' ? '#0284c7' :
                    ep.method === 'POST' ? '#16a34a' :
                    ep.method === 'PUT' ? '#d97706' :
                    ep.method === 'PATCH' ? '#9333ea' : '#dc2626';
                  const methodBg =
                    ep.method === 'GET' ? '#e0f2fe' :
                    ep.method === 'POST' ? '#dcfce7' :
                    ep.method === 'PUT' ? '#fef3c7' :
                    ep.method === 'PATCH' ? '#f3e8ff' : '#fee2e2';

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          color: methodColor,
                          background: methodBg
                        }}>
                          {ep.method}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <code style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{ep.path}</code>
                        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{ep.name}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-secondary" style={{ fontSize: 11.5 }}>
                          {selectedModule === 'kuliner' ? 'kuliner_permission:' : (selectedModule === 'budidaya' ? 'budidaya_permission:' : (selectedModule === 'seller' ? 'seller_permission:' : 'retail_permission:'))}{ep.perm}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: 12.5 }}>
                        {ep.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
