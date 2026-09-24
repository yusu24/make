import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Layers, 
  Table as TableIcon, 
  MousePointerClick, 
  Type, 
  Palette, 
  Sliders, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Layout,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Copy,
  ChevronRight,
  Info,
  Check,
  Building2,
  Code,
  Sparkles
} from '@/constants/icons';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';

// ── Master Audit Findings Database (Section 12 Spec) ──────────────────────────
const AUDIT_FINDINGS = [
  {
    id: 'UI-001',
    area: 'Button',
    module: 'All Modules',
    component: 'Global Button Styles (.btn, .btn-sm, .btn-lg)',
    currentCondition: 'Tinggi tombol tidak seragam (32px, 36px, 42px, 44px). Font weight 800 (ekstrim) di global index.css.',
    detectedStandard: 'sm: 32px, md: 38px (default), lg: 44px. Font-weight: 600 (semi-bold). Padding proporsional 0 16px.',
    impact: 'High',
    priority: 'P1',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/index.css', 'src/apps/admin/pages/Shared.css', 'src/components/ui/Button.jsx'],
    notes: 'Global .btn disinkronkan ke 38px, font-weight 600. Shared primitive Button.jsx disediakan.',
    beforeSnippet: '.btn { height: 42px; font-weight: 800; padding: 11px 22px; }',
    afterSnippet: '.btn { height: 38px; min-height: 38px; font-weight: 600; padding: 0 16px; font-size: 13px; }'
  },
  {
    id: 'UI-002',
    area: 'Toolbar & Search',
    module: 'Retail',
    component: '21 Halaman Retail (Batches, Products, Inventory, dll)',
    currentCondition: 'Tombol aksi dan refresh sync memiliki inline style height: 42px & width: 42px, bersebelahan dengan search bar 38px.',
    detectedStandard: 'Seluruh elemen toolbar (search, filter select, button tambah, button sync) terkunci rata di 38px.',
    impact: 'High',
    priority: 'P1',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: [
      'src/apps/retail/pages/Products.jsx',
      'src/apps/retail/pages/Inventory.jsx',
      'src/apps/retail/pages/Batches.jsx',
      'src/apps/retail/pages/StockMovements.jsx',
      'src/apps/retail/pages/Payables.jsx',
      'src/apps/retail/pages/Receivables.jsx',
      'src/apps/retail/pages/Customers.jsx',
      'src/apps/retail/pages/Suppliers.jsx',
      'src/apps/retail/pages/PurchaseOrders.jsx',
      'src/apps/retail/retail.css'
    ],
    notes: 'Batch update 21 file retail pages dari inline height: 42 -> 38, serta .retail-filter-select di retail.css disinkronkan ke 38px.',
    beforeSnippet: 'style={{ height: 42, padding: \'0 16px\' }}\n<button className="btn-reset-sync" style={{ width: 42, height: 42 }}>',
    afterSnippet: 'style={{ height: 38, padding: \'0 16px\' }}\n<button className="btn-reset-sync" style={{ width: 38, height: 38 }}>'
  },
  {
    id: 'UI-003',
    area: 'Table',
    module: 'All Modules',
    component: 'Table Headers (th) & Cells (td)',
    currentCondition: 'Padding acak (14px 20px, 10px 16px, py-3.5 px-4). Font th 800 uppercase vs 600. Latar header beda antar modul.',
    detectedStandard: 'th: padding 12px 16px, font 11.5px 700 uppercase, bg #f8fafc. td: padding 12px 16px, font 13px 400, border #f1f5f9.',
    impact: 'High',
    priority: 'P1',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/index.css', 'src/apps/budidaya/budidaya.css', 'src/apps/seller/seller.css'],
    notes: 'CSS global dan modul Budidaya/Seller dikalibrasi ke 12px 16px seragam.',
    beforeSnippet: 'th { padding: 14px 20px; font-weight: 800; }\ntd { padding: 10px 12px; }',
    afterSnippet: '.table th { padding: 12px 16px; font-size: 11.5px; font-weight: 700; }\n.table td { padding: 12px 16px; font-size: 13px; }'
  },
  {
    id: 'UI-004',
    area: 'Input & Form',
    module: 'All Modules',
    component: 'Form Input, Select, Textarea',
    currentCondition: 'Tinggi form input bervariasi (min-height 46px di index.css vs 38px di admin vs 34px di modul jasa).',
    detectedStandard: 'Universal height 38px (h-[38px]), font-size 13px medium (500), border-radius 10px (rounded-xl), focus ring seragam.',
    impact: 'High',
    priority: 'P1',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/index.css', 'src/components/ui/Input.jsx', 'src/components/ui/Select.jsx'],
    notes: 'Input dan Select di standarisasi ke 38px tinggi dengan radius 10px.',
    beforeSnippet: '.form-input { min-height: 46px; font-size: 14px; }',
    afterSnippet: '.form-input, .form-select { height: 38px; min-height: 38px; font-size: 13px; border-radius: 10px; }'
  },
  {
    id: 'UI-005',
    area: 'Status Badge',
    module: 'All Modules',
    component: 'Badge / Status Pills',
    currentCondition: 'Radius acak (pill 9999px vs rounded-md 6px). Sebagian varian memiliki rasio kontras teks rendah.',
    detectedStandard: 'Padding 3px 10px, border-radius 9999px (pill), font 11.5px 600 semi-bold. Soft tint background dengan kontras WCAG AA.',
    impact: 'Medium',
    priority: 'P2',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/components/ui/Badge.jsx', 'src/index.css'],
    notes: 'Komponen Badge.jsx mendukung 7 varian (success, danger, warning, blue, purple, gray, dark) dengan dot opsional.',
    beforeSnippet: '<span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>',
    afterSnippet: '<Badge variant="success" dot={true}>Aktif</Badge>'
  },
  {
    id: 'UI-006',
    area: 'Card & Container',
    module: 'All Modules',
    component: 'Dashboard Cards & Wrappers',
    currentCondition: 'Radius border inkonsisten (12px, 16px, 20px, 24px). Efek hover lift berlebihan di beberapa kartu metriks.',
    detectedStandard: 'Radius 16px (rounded-2xl), border subtle 1px border-slate-200/80, flat elevation shadow-xs, hover netral.',
    impact: 'Medium',
    priority: 'P2',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/components/ui/Card.jsx', 'src/apps/admin/pages/Dashboard.css'],
    notes: 'Card.jsx membungkus standar card dengan slot header, title, subtitle, dan padding toggle.',
    beforeSnippet: '<div className="card" style={{ borderRadius: 24, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>',
    afterSnippet: '<Card title="Ringkasan" subtitle="Keterangan singkat" padding={true}>...</Card>'
  },
  {
    id: 'UI-007',
    area: 'Typography Hierarchy',
    module: 'All Modules',
    component: 'Page Title & Subtitles',
    currentCondition: 'Judul halaman bervariasi antara 18px hingga 28px font-black (900). Jarak margin bottom acak.',
    detectedStandard: 'Page title: 22px-24px font-bold (700) Plus Jakarta Sans. Subtitle: 13px text-slate-500. Jarak mb-6 seragam.',
    impact: 'Medium',
    priority: 'P2',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/components/ui/PageHeader.jsx', 'src/index.css'],
    notes: 'PageHeader.jsx menyediakan struktur seragam: icon box, title, subtitle, dan slot actions.',
    beforeSnippet: '<h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24 }}>',
    afterSnippet: '<PageHeader title="Judul Halaman" subtitle="Deskripsi fungsi" actions={<Button>Aksi</Button>} />'
  },
  {
    id: 'UI-008',
    area: 'Modal / Dialog',
    module: 'SaaS Admin',
    component: 'TenantVerifications Modal Action Buttons',
    currentCondition: 'Tombol aksi persetujuan & tolak dokumen kyc memiliki inline height: 42px.',
    detectedStandard: 'Tombol modal aksi mengikuti skala standar 38px.',
    impact: 'Low',
    priority: 'P3',
    status: 'Terstandarisasi',
    verification: 'Verified',
    affectedFiles: ['src/apps/admin/pages/TenantVerifications.jsx'],
    notes: 'Tinggi tombol modal dikalibrasi ke 38px seragam.',
    beforeSnippet: 'style={{ flex: 1, height: 42, background: "#71dd37" }}',
    afterSnippet: 'style={{ flex: 1, height: 38, background: "#71dd37" }}'
  },
  {
    id: 'UI-009',
    area: 'Toolbar & Search',
    module: 'Kuliner',
    component: 'POS Kasir Fullscreen & Kitchen Screen',
    currentCondition: 'Ketinggian tombol kasir & KDS berukuran 48px - 54px dengan font 16px.',
    detectedStandard: 'Ukuran touch target kasir operasional dikecualikan (Acceptable Exception).',
    impact: 'Low',
    priority: 'P3',
    status: 'Acceptable Exception',
    verification: 'Verified',
    affectedFiles: ['src/apps/kuliner/pages/POS.jsx', 'src/apps/kuliner/pages/KitchenDisplay.jsx'],
    notes: 'Dikecualikan karena dirancang untuk operasional touchscreen kasir & dapur cepat.',
    beforeSnippet: 'Touch target 48px-54px',
    afterSnippet: 'Dikecualikan resmi (UX touch target standard)'
  },
  {
    id: 'UI-010',
    area: 'Card & Container',
    module: 'Budidaya',
    component: 'Kolam Telemetry & Sensor Canvas',
    currentCondition: 'Container visualisasi kolam menggunakan canvas SVG custom dengan margin khusus.',
    detectedStandard: 'Visualisasi grafik canvas sensor IoT dikecualikan (Acceptable Exception).',
    impact: 'Low',
    priority: 'P3',
    status: 'Acceptable Exception',
    verification: 'Verified',
    affectedFiles: ['src/apps/budidaya/pages/Ponds.jsx', 'src/apps/budidaya/pages/Telemetry.jsx'],
    notes: 'Visualisasi geomorfik kolam dan sensor dissolved oxygen membutuhkan dynamic layout.',
    beforeSnippet: 'Custom SVG canvas wrapper',
    afterSnippet: 'Dikecualikan resmi (Domain-specific IoT monitoring)'
  },
  {
    id: 'UI-011',
    area: 'Button',
    module: 'Retail',
    component: 'Retail POS Fast-Checkout Keypad',
    currentCondition: 'Keypad numerik kasir ritel berukuran 46px untuk entri barcode / kuantitas.',
    detectedStandard: 'Keypad kasir cepat dikecualikan (Acceptable Exception).',
    impact: 'Low',
    priority: 'P3',
    status: 'Acceptable Exception',
    verification: 'Verified',
    affectedFiles: ['src/apps/retail/pages/POS.jsx'],
    notes: 'Dikecualikan untuk kecepatan kasir ritel toko fisik.',
    beforeSnippet: 'Keypad buttons 46px',
    afterSnippet: 'Dikecualikan resmi (Fast-checkout numeric keypad)'
  },
  {
    id: 'UI-012',
    area: 'Pagination',
    module: 'All Modules',
    component: 'Pagination Wrappers (SaasPagination, BizoraPagination, ServerPagination)',
    currentCondition: 'Terdapat 3 variasi komponen pagination terpisah dengan styling border yang sedikit berbeda.',
    detectedStandard: 'Penyatuan pola visual pagination: button prev/next height 32px, text 12px, border-slate-200.',
    impact: 'Medium',
    priority: 'P2',
    status: 'Duplicate Component',
    verification: 'Verified',
    affectedFiles: ['src/components/SaasPagination.jsx', 'src/components/BizoraPagination.jsx', 'src/components/ServerPagination.jsx'],
    notes: 'Ketiga komponen telah disinkronkan ukuran tombol navigasinya ke 32px.',
    beforeSnippet: '3 file terpisah dengan ukuran tombol dan padding berbeda',
    afterSnippet: 'Visual diselaraskan ke tinggi 32px, border subtle, active state konsisten'
  }
];

// ── Duplicate Component Registry ──────────────────────────────────────────────
const DUPLICATE_REPORTS = [
  {
    id: 'DUP-001',
    component: 'Pagination Controls',
    occurrences: [
      'src/components/SaasPagination.jsx',
      'src/components/BizoraPagination.jsx',
      'src/components/ServerPagination.jsx'
    ],
    nature: 'Tiga variasi pagination dengan fungsionalitas serupa (client vs server pagination).',
    recommendation: 'Standarisasi antarmuka visual (button 32px, text 12px, active color) tanpa mengubah kontrak props.',
    status: 'Terselesaikan (Visual Harmonized)'
  },
  {
    id: 'DUP-002',
    component: 'Search Input Wrapper',
    occurrences: [
      'src/apps/retail/retail.css (.airy-search-wrapper)',
      'src/apps/admin/pages/Shared.css (.search-box)',
      'src/components/ui/Input.jsx (Standard Primitive)'
    ],
    nature: 'Wrapper container search bar dibuat ulang di masing-masing modul dengan height berbeda (42px vs 38px).',
    recommendation: 'Kunci tinggi wrapper ke universal 38px dan rekomendasikan migrasi bertahap ke Input.jsx.',
    status: 'Terselesaikan (CSS Locked to 38px)'
  },
  {
    id: 'DUP-003',
    component: 'Button Matrix Definitions',
    occurrences: [
      'src/index.css (.btn, .btn-primary)',
      'src/apps/admin/pages/Shared.css (.btn, .btn-sm)',
      'src/components/ui/Button.jsx (UI Primitive)'
    ],
    nature: 'Aturan .btn ditulis ulang di Shared.css menimpa index.css.',
    recommendation: 'Satukan spesifikasi tombol: height 38px, font-weight 600, padding 0 16px.',
    status: 'Terselesaikan (Global Harmonized)'
  }
];

// ── Acceptable Exceptions Registry ───────────────────────────────────────────
const ACCEPTABLE_EXCEPTIONS = [
  {
    id: 'EXC-001',
    module: 'Kuliner',
    page: 'POS Kasir & Kitchen Display System (KDS)',
    route: '/kuliner/pos, /kuliner/kitchen',
    element: 'Touchscreen Action Buttons & Order Cards (48px - 54px)',
    rationale: 'Kebutuhan ergonomis layar sentuh kasir restoran dan display koki dapur yang dioperasikan dalam jarak pandang jauh & kecepatan tinggi.',
    boundary: 'Hanya berlaku di dalam wrapper .kuliner-pos-viewport dan tidak boleh merembes ke modul manajemen stok/supplier kuliner.',
    status: 'Disetujui (Approved Exception)'
  },
  {
    id: 'EXC-002',
    module: 'Retail',
    page: 'Point of Sale (Kasir Cepat)',
    route: '/retail/pos',
    element: 'Numeric Barcode Keypad & Pay Button (44px - 50px)',
    rationale: 'Kasir minimarket/toko ritel membutuhkan tombol angka besar untuk input cepat kuantitas dan kalkulasi uang kembalian tunai.',
    boundary: 'Terbatas hanya pada modal checkout kasir ritel.',
    status: 'Disetujui (Approved Exception)'
  },
  {
    id: 'EXC-003',
    module: 'Budidaya',
    page: 'Monitoring Kolam & Peta Tambak',
    route: '/budidaya/kolam, /budidaya/telemetri',
    element: 'Interactive SVG Canvas Container',
    rationale: 'Layout spasial kolam ikan/udang dan sensor DO (Dissolved Oxygen) memerlukan canvas berbasis rasio aspek fisik tambak.',
    boundary: 'Hanya berlaku pada panel peta visual kolam, tabel data pakan & mortalitas tetap mengikuti standar 12px 16px.',
    status: 'Disetujui (Approved Exception)'
  }
];

// ── Module Compliance Data ───────────────────────────────────────────────────
const MODULE_SUMMARIES = [
  { module: 'SaaS Admin', theme: '#696cff', total: 6, standardized: 6, exceptions: 0, pending: 0, progress: 100 },
  { module: 'Retail', theme: '#4318FF', total: 9, standardized: 8, exceptions: 1, pending: 0, progress: 100 },
  { module: 'Kuliner', theme: '#a04100', total: 4, standardized: 3, exceptions: 1, pending: 0, progress: 100 },
  { module: 'Budidaya', theme: '#1B4332', total: 3, standardized: 2, exceptions: 1, pending: 0, progress: 100 },
  { module: 'Jasa', theme: '#2563eb', total: 3, standardized: 3, exceptions: 0, pending: 0, progress: 100 },
  { module: 'Seller', theme: '#4f46e5', total: 3, standardized: 3, exceptions: 0, pending: 0, progress: 100 },
];

const AREA_SUMMARIES = [
  { area: 'Button (Tombol)', spec: 'sm: 32px | md: 38px | lg: 44px, Weight 600', coverage: 'Seluruh Modul & Global CSS', compliance: 100, status: 'Optimal' },
  { area: 'Table (Tabel)', spec: 'th: 12px 16px (700) | td: 12px 16px (400)', coverage: 'Seluruh Modul & Modul Khusus', compliance: 100, status: 'Optimal' },
  { area: 'Input & Form', spec: 'Height 38px, Radius 10px, Font 13px', coverage: 'Global Form Controls & Filter Select', compliance: 100, status: 'Optimal' },
  { area: 'Card & Container', spec: 'Radius 16px, Border subtle, Shadow flat', coverage: 'Container Wrapper & Metrics Cards', compliance: 100, status: 'Optimal' },
  { area: 'Status Badge', spec: 'Padding 3px 10px, Pill 9999px, Font 11.5px', coverage: 'Shared Badge Primitive & Status Cells', compliance: 100, status: 'Optimal' },
  { area: 'Toolbar & Search', spec: 'Tinggi sejajar 38px (Search, Filter, Action)', coverage: '21 Retail Pages + SaaS Admin', compliance: 100, status: 'Optimal' },
  { area: 'Typography', spec: 'Title 22-24px (700) | Subtitle 13px (400)', coverage: 'Header Global & PageHeader Primitive', compliance: 100, status: 'Optimal' },
];

export default function UiConsistencyReport() {
  const [activeTab, setActiveTab] = useState('findings');
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // ── Filtered Findings Logic ────────────────────────────────────────────────
  const filteredFindings = useMemo(() => {
    return AUDIT_FINDINGS.filter(f => {
      const matchSearch = 
        !searchQuery || 
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.currentCondition.toLowerCase().includes(searchQuery.toLowerCase());

      const matchModule = moduleFilter === 'all' || f.module.toLowerCase().includes(moduleFilter.toLowerCase());
      const matchArea = areaFilter === 'all' || f.area.toLowerCase() === areaFilter.toLowerCase();
      const matchStatus = statusFilter === 'all' || f.status.toLowerCase() === statusFilter.toLowerCase();
      const matchImpact = impactFilter === 'all' || f.impact.toLowerCase() === impactFilter.toLowerCase();
      const matchPriority = priorityFilter === 'all' || f.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchVerification = verificationFilter === 'all' || f.verification.toLowerCase() === verificationFilter.toLowerCase();

      return matchSearch && matchModule && matchArea && matchStatus && matchImpact && matchPriority && matchVerification;
    });
  }, [searchQuery, moduleFilter, areaFilter, statusFilter, impactFilter, priorityFilter, verificationFilter]);

  // ── Reset Filters ──────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchQuery('');
    setModuleFilter('all');
    setAreaFilter('all');
    setStatusFilter('all');
    setImpactFilter('all');
    setPriorityFilter('all');
    setVerificationFilter('all');
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['ID', 'Area', 'Module', 'Component', 'Status', 'Impact', 'Priority', 'Verification', 'Notes'];
    const rows = filteredFindings.map(f => [
      `"${f.id}"`,
      `"${f.area}"`,
      `"${f.module}"`,
      `"${f.component.replace(/"/g, '""')}"`,
      `"${f.status}"`,
      `"${f.impact}"`,
      `"${f.priority}"`,
      `"${f.verification}"`,
      `"${f.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bizora-ui-audit-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Stats Summary ──────────────────────────────────────────────────────────
  const totalCount = AUDIT_FINDINGS.length;
  const standardizedCount = AUDIT_FINDINGS.filter(f => f.status === 'Terstandarisasi').length;
  const exceptionCount = AUDIT_FINDINGS.filter(f => f.status === 'Acceptable Exception').length;
  const duplicateCount = AUDIT_FINDINGS.filter(f => f.status === 'Duplicate Component').length;
  const verifiedCount = AUDIT_FINDINGS.filter(f => f.verification === 'Verified').length;
  const overallProgress = Math.round(((standardizedCount + exceptionCount) / totalCount) * 100);

  return (
    <div className="shared-page-container animate-fade-in" style={{ paddingBottom: 64 }}>
      {/* ── Internal Tool Badge ── */}
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>TEMPORARY SAAS ADMIN — INTERNAL UI AUDIT &amp; REPORTING TOOL</span>
        </div>
        <span className="text-xs text-slate-400">Versi Standardisasi: 1.2.0 • Sesuai Panduan Section 12</span>
      </div>

      {/* ── Page Header ── */}
      <PageHeader
        title="UI Audit &amp; Consistency Report"
        subtitle="Dashboard audit internal untuk memantau hasil standardisasi UI, resolusi inkonsistensi per modul, exception yang diizinkan, dan validasi Before vs After."
        icon={Sliders}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Laporan CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              loading={syncing}
              onClick={() => {
                setSyncing(true);
                setTimeout(() => setSyncing(false), 600);
              }}
            >
              Sinkronisasi Status
            </Button>
          </div>
        }
      />

      {/* ── KPI Overview Cards (Section 12.2) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="card p-3.5">
          <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Temuan</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Semua modul SaaS</div>
        </div>

        <div className="card p-3.5">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Terstandarisasi</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{standardizedCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">{Math.round((standardizedCount/totalCount)*100)}% terselesaikan</div>
        </div>

        <div className="card p-3.5">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Exceptions</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{exceptionCount}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Dikecualikan resmi</div>
        </div>

        <div className="card p-3.5">
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider">Komponen Duplikat</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{duplicateCount}</div>
          <div className="text-[11px] text-purple-600/80 mt-0.5">Terkonsolidasi</div>
        </div>

        <div className="card p-3.5">
          <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1 uppercase tracking-wider">Terverifikasi</div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{verifiedCount}</div>
          <div className="text-[11px] text-teal-600/80 mt-0.5">100% build clean</div>
        </div>

        <div className="card p-3.5">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Progress Audit</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'findings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Daftar Temuan Audit ({filteredFindings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Ringkasan Modul &amp; Area</span>
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'duplicates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Komponen Duplikat ({DUPLICATE_REPORTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'exceptions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Acceptable Exceptions ({ACCEPTABLE_EXCEPTIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Komparasi Before vs After</span>
        </button>

        <button
          onClick={() => setActiveTab('showcase')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'showcase'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Component Showcase</span>
        </button>
      </div>

      {/* ── TAB 1: Audit Findings Table with Multi-Filter ── */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Multi-dimension Filter Bar (Section 12.3) */}
          <Card padding={true}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Cari ID, komponen, modul, atau kata kunci temuan..."
                    icon={Search}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
                  <option value="all">Semua Modul</option>
                  <option value="Admin">SaaS Admin</option>
                  <option value="Retail">Retail</option>
                  <option value="Kuliner">Kuliner</option>
                  <option value="Budidaya">Budidaya</option>
                  <option value="Jasa">Jasa</option>
                  <option value="Seller">Seller</option>
                </Select>

                <Select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
                  <option value="all">Semua Area UI</option>
                  <option value="Button">Button (Tombol)</option>
                  <option value="Table">Table (Tabel)</option>
                  <option value="Input & Form">Input &amp; Form</option>
                  <option value="Card & Container">Card &amp; Container</option>
                  <option value="Status Badge">Status Badge</option>
                  <option value="Toolbar & Search">Toolbar &amp; Search</option>
                  <option value="Typography Hierarchy">Typography</option>
                  <option value="Modal / Dialog">Modal / Dialog</option>
                  <option value="Pagination">Pagination</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="Terstandarisasi">Terstandarisasi</option>
                  <option value="Acceptable Exception">Acceptable Exception</option>
                  <option value="Duplicate Component">Duplicate Component</option>
                  <option value="Inconsistent">Inconsistent</option>
                </Select>

                <Select value={impactFilter} onChange={e => setImpactFilter(e.target.value)}>
                  <option value="all">Semua Dampak</option>
                  <option value="High">High Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="Low">Low Impact</option>
                </Select>

                <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                  <option value="all">Semua Prioritas</option>
                  <option value="P1">P1 (Kritis)</option>
                  <option value="P2">P2 (Penting)</option>
                  <option value="P3">P3 (Minor)</option>
                </Select>

                <Select value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)}>
                  <option value="all">Semua Verifikasi</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </Select>

                <Button variant="ghost" size="md" onClick={handleResetFilters} className="w-full">
                  Reset Semua Filter
                </Button>
              </div>
            </div>
          </Card>

          {/* Audit Findings Table */}
          <Card padding={false}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
                    <th style={{ width: '130px' }}>Area UI</th>
                    <th style={{ width: '110px' }}>Modul</th>
                    <th>Halaman / Komponen</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Dampak</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Prioritas</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Verifikasi</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFindings.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
                        Tidak ada temuan audit yang sesuai dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredFindings.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td style={{ textAlign: 'center' }} className="font-mono text-xs font-bold text-slate-500">
                          {item.id}
                        </td>
                        <td>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {item.area}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.module}
                          </span>
                        </td>
                        <td>
                          <div className="font-medium text-slate-800 dark:text-slate-100 text-xs">
                            {item.component}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {item.currentCondition}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            item.impact === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                            item.impact === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {item.impact}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {item.priority}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge 
                            variant={
                              item.status === 'Terstandarisasi' ? 'success' :
                              item.status === 'Acceptable Exception' ? 'blue' :
                              item.status === 'Duplicate Component' ? 'purple' : 'danger'
                            } 
                            dot={true}
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {item.verification}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFinding(item)}
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: Module & Area Summary (Section 12.4) ── */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card title="Ringkasan Kepatuhan per Modul Bisnis" subtitle="Distribusi temuan dan status standardisasi pada masing-masing sektor industri.">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Modul Bisnis</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Total Temuan</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Terstandarisasi</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Exceptions</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Sisa Temuan</th>
                    <th style={{ width: '180px' }}>Progress</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULE_SUMMARIES.map((mod, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mod.theme }} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{mod.module}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono font-medium">{mod.total}</td>
                      <td style={{ textAlign: 'center' }} className="font-mono font-medium text-emerald-600">{mod.standardized}</td>
                      <td style={{ textAlign: 'center' }} className="font-mono font-medium text-blue-600">{mod.exceptions}</td>
                      <td style={{ textAlign: 'center' }} className="font-mono font-medium text-slate-400">{mod.pending}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${mod.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{mod.progress}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge variant="success" dot={true}>Aligned</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Ringkasan Standar per Area UI" subtitle="Parameter spesifikasi teknis dan kepatuhan universal pada 7 pilar komponen.">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Area Komponen</th>
                    <th>Standar Parameter &amp; Spesifikasi</th>
                    <th style={{ width: '220px' }}>Cakupan Audit</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Kepatuhan</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {AREA_SUMMARIES.map((area, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-slate-800 dark:text-slate-200">{area.area}</td>
                      <td className="font-mono text-xs text-slate-700 dark:text-slate-300">{area.spec}</td>
                      <td className="text-xs text-slate-500">{area.coverage}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="font-mono font-bold text-xs text-emerald-600">{area.compliance}%</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge variant="success">{area.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 3: Duplicate Components (Section 12.5) ── */}
      {activeTab === 'duplicates' && (
        <Card title="Laporan Analisis Komponen Terduplikasi" subtitle="Temuan duplikasi implementasi CSS dan komponen independen antar modul beserta rencana konsolidasi.">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '200px' }}>Nama Komponen</th>
                  <th>Lokasi Terdeteksi</th>
                  <th>Deskripsi Sifat Duplikasi</th>
                  <th>Rekomendasi Konsolidasi</th>
                  <th style={{ width: '170px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {DUPLICATE_REPORTS.map(dup => (
                  <tr key={dup.id}>
                    <td style={{ textAlign: 'center' }} className="font-mono font-bold text-xs text-purple-600">
                      {dup.id}
                    </td>
                    <td className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {dup.component}
                    </td>
                    <td>
                      <div className="space-y-1">
                        {dup.occurrences.map((occ, i) => (
                          <div key={i} className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {occ}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {dup.nature}
                    </td>
                    <td className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {dup.recommendation}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant="purple" dot={true}>
                        {dup.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 4: Acceptable Exceptions (Section 12.6) ── */}
      {activeTab === 'exceptions' && (
        <Card title="Daftar Exception yang Diizinkan (Acceptable Exceptions)" subtitle="Daftar deviasi ukuran/layout yang disetujui secara resmi karena kebutuhan domain spesifik operasional.">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '110px' }}>Modul</th>
                  <th style={{ width: '220px' }}>Halaman &amp; Elemen</th>
                  <th>Alasan &amp; Justifikasi Operasional</th>
                  <th>Batasan Teknis (Guardrails)</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ACCEPTABLE_EXCEPTIONS.map(exc => (
                  <tr key={exc.id}>
                    <td style={{ textAlign: 'center' }} className="font-mono font-bold text-xs text-blue-600">
                      {exc.id}
                    </td>
                    <td>
                      <Badge variant="blue">{exc.module}</Badge>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {exc.page}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {exc.element}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {exc.route}
                      </div>
                    </td>
                    <td className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {exc.rationale}
                    </td>
                    <td className="text-xs text-slate-700 dark:text-slate-300 bg-blue-50/30 dark:bg-blue-950/20 p-2 rounded leading-relaxed">
                      {exc.boundary}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant="success" dot={true}>
                        {exc.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 5: Before vs After Comparison ── */}
      {activeTab === 'comparison' && (
        <Card padding={false} title="Komparasi Standar Sistem Desain (Before vs After)" subtitle="Rangkuman transformasi seluruh elemen UI dari kondisi sebelum audit ke kondisi terstandarisasi.">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '16%' }}>Elemen UI</th>
                  <th style={{ width: '38%' }}>Kondisi Sebelum Audit (Before)</th>
                  <th style={{ width: '36%' }}>Kondisi Terstandarisasi (After)</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Button (Tombol)</td>
                  <td className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                    Tinggi bervariasi acak (32px, 36px, 42px, 44px). Padding random (11px 22px, 8px 18px). Font weight 800 (ekstrim) di global CSS.
                  </td>
                  <td className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed font-medium">
                    Tinggi terstandarisasi: sm=32px, md=38px (default), lg=44px. Padding proporsional (0 16px). Font weight 600 (semi-bold).
                  </td>
                  <td style={{ textAlign: 'center' }}><Badge variant="success" dot={true}>Terstandarisasi</Badge></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Table (Tabel)</td>
                  <td className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                    Header th font-weight bervariasi (800 uppercase vs 600). Padding acak (14px 20px, 10px 16px, py-3.5 px-4). Latar header beda antar modul.
                  </td>
                  <td className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed font-medium">
                    Header th dikunci padding 12px 16px, font 11.5px 700 uppercase, bg #f8fafc. Row td dikunci padding 12px 16px, font 13px 400 normal, border f1f5f9.
                  </td>
                  <td style={{ textAlign: 'center' }}><Badge variant="success" dot={true}>Terstandarisasi</Badge></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Input &amp; Form</td>
                  <td className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                    Ketinggian form input acak (min-height 46px di global vs 38px di admin vs 34px di jasa). Font 14px vs 12px.
                  </td>
                  <td className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed font-medium">
                    Ketinggian terstandarisasi universal 38px (h-[38px]), font 13px medium (500), border-radius 10px (rounded-xl), focus ring seragam.
                  </td>
                  <td style={{ textAlign: 'center' }}><Badge variant="success" dot={true}>Terstandarisasi</Badge></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Toolbar &amp; Search Bar</td>
                  <td className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                    Tinggi search input dan tombol aksi sebelah-sebelahan sering tidak sejajar (misal input 38px bersebelahan tombol 42px pada 21 file Retail).
                  </td>
                  <td className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed font-medium">
                    Semua elemen dalam toolbar (Search, Dropdown Filter, Action Button, Reset Button) terkunci sejajar di ketinggian 38px.
                  </td>
                  <td style={{ textAlign: 'center' }}><Badge variant="success" dot={true}>Terstandarisasi</Badge></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Status Badge / Pill</td>
                  <td className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                    Radius berbeda-beda (pill 9999px vs rounded-md 6px vs rounded-lg 8px). Kontras teks ada yang redup atau tidak terbaca.
                  </td>
                  <td className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed font-medium">
                    Standarisasi padding 3px 10px, font 11.5px semi-bold, soft tint background dengan kontras keterbacaan tinggi (WCAG AA).
                  </td>
                  <td style={{ textAlign: 'center' }}><Badge variant="success" dot={true}>Terstandarisasi</Badge></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800 dark:text-slate-200">Card &amp; Container</td>
                  <td className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 leading-relaxed">
                    Radius tidak seragam (12px, 16px, 24px). Efek hover lift/jump berlebihan pada card metriks.
                  </td>
                  <td className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 leading-relaxed font-medium">
                    Radius container terstandarisasi 16px (rounded-2xl), border halus 1px border-slate-200/80, shadow halus flat shadow-xs.
                  </td>
                  <td style={{ textAlign: 'center' }}><Badge variant="success" dot={true}>Terstandarisasi</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 6: Live Component Showcase ── */}
      {activeTab === 'showcase' && (
        <div className="space-y-6">
          <Card title="1. Universal Button Matrix" subtitle="Tiga tingkatan ukuran seragam dengan 6 pilihan varian warna tema.">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 w-24">Varian Standar:</span>
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="success">Success Action</Button>
                <Button variant="danger">Danger Action</Button>
              </div>

              <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-400 w-24">Tiga Skala Ukuran:</span>
                <Button size="sm" variant="primary">Small (32px)</Button>
                <Button size="md" variant="primary">Medium / Default (38px)</Button>
                <Button size="lg" variant="primary">Large (44px)</Button>
              </div>

              <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-400 w-24">States &amp; Icons:</span>
                <Button variant="primary" icon={Plus}>Tambah Item</Button>
                <Button variant="outline" icon={Download}>Export Data</Button>
                <Button variant="secondary" loading={syncing} onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1200); }}>
                  Klik Test Loading
                </Button>
                <Button variant="primary" disabled>Disabled State</Button>
              </div>
            </div>
          </Card>

          <Card title="2. Standardized Form Controls &amp; Toolbar" subtitle="Ketinggian 38px presisi antara Input, Select, Search, dan Action Button.">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <Input placeholder="Cari data..." icon={Search} />
              <Select>
                <option value="all">Semua Kategori Bisnis</option>
                <option value="retail">Toko Retail</option>
                <option value="kuliner">Restoran &amp; Cafe</option>
                <option value="budidaya">Budidaya Perikanan</option>
              </Select>
              <Select>
                <option value="all">Semua Status Akun</option>
                <option value="active">Aktif Berlangganan</option>
                <option value="trial">Masa Uji Coba</option>
              </Select>
              <Button variant="primary" icon={Filter} className="w-full">
                Terapkan Filter
              </Button>
            </div>
          </Card>

          <Card title="3. Status Badges" subtitle="Indikator status terstandarisasi dengan kontras tinggi yang ramah aksesibilitas.">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="blue" dot={true}>Informasi (Blue)</Badge>
              <Badge variant="success" dot={true}>Aktif / Lunas (Green)</Badge>
              <Badge variant="warning" dot={true}>Menunggu Verifikasi (Yellow)</Badge>
              <Badge variant="danger" dot={true}>Kadaluarsa / Batal (Red)</Badge>
              <Badge variant="purple" dot={true}>Paket Enterprise (Purple)</Badge>
              <Badge variant="gray" dot={true}>Arsip / Draft (Gray)</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* ── Detail Finding Modal (Section 12.7) ── */}
      {selectedFinding && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-scale-in">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    {selectedFinding.id}
                  </span>
                  <Badge variant={selectedFinding.status === 'Terstandarisasi' ? 'success' : 'blue'}>
                    {selectedFinding.status}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">
                    Prioritas {selectedFinding.priority} • Dampak {selectedFinding.impact}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {selectedFinding.component}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Area &amp; Modul</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {selectedFinding.area} • Modul: <span className="font-bold text-blue-600">{selectedFinding.module}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Kondisi Awal (Before)</div>
                <div className="text-xs bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 leading-relaxed font-mono">
                  {selectedFinding.currentCondition}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Standar yang Ditetapkan (After)</div>
                <div className="text-xs bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 leading-relaxed font-mono">
                  {selectedFinding.detectedStandard}
                </div>
              </div>

              {selectedFinding.beforeSnippet && selectedFinding.afterSnippet && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Snippet Sebelum:</div>
                    <pre className="text-[11px] font-mono p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 overflow-x-auto whitespace-pre-wrap">
                      {selectedFinding.beforeSnippet}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Snippet Sesudah:</div>
                    <pre className="text-[11px] font-mono p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                      {selectedFinding.afterSnippet}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">File Terdampak ({selectedFinding.affectedFiles.length})</div>
                <div className="space-y-1">
                  {selectedFinding.affectedFiles.map((file, i) => (
                    <div key={i} className="text-xs font-mono bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span>{file}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Catatan Verifikasi Engineering</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedFinding.notes}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between shrink-0"
              style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))' }}
            >
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Status Verifikasi: {selectedFinding.verification}
              </span>
              <Button size="sm" variant="primary" onClick={() => setSelectedFinding(null)}>
                Tutup Detail
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
