import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { 
  Sparkles,
  LayoutDashboard,
  Type,
  Copy,
  Check,
  Search,
  BookOpen,
  Sliders,
  AlignLeft,
  CheckCircle2,
  Code2,
  Store,
  Utensils,
  Wrench,
  ShoppingBag,
  Droplets,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
  ExternalLink,
  Layers,
  ArrowRight,
  Clock,
  Hash
} from '@/constants/icons';
import { useToast } from '../../../components/Toast';

export default function FontDictionary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'catalog';
  const initialModule = searchParams.get('module') || 'retail';

  const [activeTab, setActiveTab] = useState(initialTab); // 'catalog' | 'inspector' | 'hierarchy' | 'guidelines'
  const [selectedModule, setSelectedModule] = useState(initialModule);
  const [copiedId, setCopiedId] = useState(null);

  // Typography Sandbox State
  const [customText, setCustomText] = useState('Omzet Kasir POS: Rp 14.850.000 (84 Transaksi Selesai)');
  const [sandboxFont, setSandboxFont] = useState('plus-jakarta');
  const [sandboxSize, setSandboxSize] = useState(18);
  const [sandboxWeight, setSandboxWeight] = useState(700);
  const [sandboxTracking, setSandboxTracking] = useState('tracking-tight');
  const [sandboxColor, setSandboxColor] = useState('text-slate-900');

  const toast = useToast();

  // Sync state to URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const modFromUrl = searchParams.get('module');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    if (modFromUrl && modFromUrl !== selectedModule) {
      setSelectedModule(modFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleModuleChange = (modId) => {
    setSelectedModule(modId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'inspector');
      next.set('module', modId);
      return next;
    });
  };

  const handleCopy = (text, id, label) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (toast?.success) {
      toast.success(`${label} disalin ke clipboard!`);
    }
    setTimeout(() => {
      setCopiedId(prev => (prev === id ? null : prev));
    }, 2000);
  };

  // Font Families Definition
  const FONT_FAMILIES = [
    {
      id: 'plus-jakarta',
      name: 'Plus Jakarta Sans',
      role: 'Font Utama & Brand Headline',
      description: 'Digunakan untuk judul halaman, sub-heading, total angka metrik KPI, dan nama produk di seluruh platform.',
      sampleText: 'The quick brown fox jumps over the lazy dog. 1234567890',
      cssFamily: "'Plus Jakarta Sans', sans-serif",
      tailwindClass: "font-['Plus_Jakarta_Sans']"
    },
    {
      id: 'inter',
      name: 'Inter',
      role: 'Font Data & Antarmuka UI',
      description: 'Digunakan untuk teks tabel data padat, isi formulir input, teks tombol aksi, dan navigasi aplikasi.',
      sampleText: 'Modern business management dashboard tailored for Indonesian MSMEs.',
      cssFamily: "'Inter', sans-serif",
      tailwindClass: "font-['Inter']"
    },
    {
      id: 'outfit',
      name: 'Outfit',
      role: 'Font Marketing & Display',
      description: 'Font geometris dengan nuansa ramah yang digunakan untuk landing page, banner promosi, dan hero display.',
      sampleText: 'Solusi Digital Terpadu untuk UMKM Indonesia Naik Kelas.',
      cssFamily: "'Outfit', sans-serif",
      tailwindClass: "font-['Outfit']"
    },
    {
      id: 'mono',
      name: 'Monospace / JetBrains',
      role: 'Kode Transaksi, Barcode & SKU',
      description: 'Font monospaced untuk nomor invoice (#INV-2026-09), kode SKU barang, token API, dan struk kasir termal.',
      sampleText: 'SKU-KOP-0994 | TXID-882194 | 2026-09-20T01:30:00Z',
      cssFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      tailwindClass: 'font-mono'
    }
  ];

  // Scale and Hierarchy definitions
  const TYPE_SCALES = [
    {
      id: 'scale-display',
      level: 'Display Hero',
      className: 'text-3xl md:text-4xl font-semibold tracking-tight',
      pixelSize: '36px (2.25rem)',
      lineHeight: 'leading-tight (40px)',
      weight: '600 (Semi Bold)',
      usage: 'Angka total omzet hero dashboard, banner promosi utama, judul landing page',
      sample: 'Rp 450.800.000'
    },
    {
      id: 'scale-h1',
      level: 'Heading 1 (H1)',
      className: 'text-2xl font-semibold tracking-tight',
      pixelSize: '24px (1.5rem)',
      lineHeight: 'leading-8 (32px)',
      weight: '600 (Semi Bold)',
      usage: 'Judul utama setiap halaman modul (e.g. Kasir POS, Inventori Stok)',
      sample: 'Manajemen Produk & Stok'
    },
    {
      id: 'scale-h2',
      level: 'Heading 2 (H2)',
      className: 'text-xl font-semibold tracking-tight',
      pixelSize: '20px (1.25rem)',
      lineHeight: 'leading-7 (28px)',
      weight: '600 (Semi Bold)',
      usage: 'Judul kartu kontainer besar, judul modal pop-up, judul tab analitik',
      sample: 'Rincian Pesanan Pelanggan'
    },
    {
      id: 'scale-h3',
      level: 'Heading 3 (H3)',
      className: 'text-base font-semibold',
      pixelSize: '16px (1rem)',
      lineHeight: 'leading-6 (24px)',
      weight: '600 (Semi Bold)',
      usage: 'Nama item produk di katalog, sub-judul kartu informasi, judul grup tabel',
      sample: 'Kopi Arabika Gayo Super 250g'
    },
    {
      id: 'scale-body-base',
      level: 'Body Regular',
      className: 'text-sm font-normal text-slate-600',
      pixelSize: '14px (0.875rem)',
      lineHeight: 'leading-5 (20px)',
      weight: '400 (Regular) / 500 (Medium)',
      usage: 'Teks paragraf standar, deskripsi fitur, isi sel tabel transaksi',
      sample: 'Transaksi penjualan offline kasir berhasil disinkronisasi ke server pusat.'
    },
    {
      id: 'scale-caption',
      level: 'Caption & Helper',
      className: 'text-xs font-medium text-slate-400',
      pixelSize: '12px (0.75rem)',
      lineHeight: 'leading-4 (16px)',
      weight: '500 (Medium)',
      usage: 'Label pendukung, timestamp tanggal, petunjuk input form, metadata SKU',
      sample: 'Diperbarui 5 menit yang lalu oleh Kasir 01'
    },
    {
      id: 'scale-micro-badge',
      level: 'Micro Tag & Badge',
      className: 'text-[10px] md:text-[11px] font-semibold uppercase tracking-wider',
      pixelSize: '10px - 11px',
      lineHeight: 'leading-none',
      weight: '600 (Semi Bold)',
      usage: 'Badge status transaksi (LUNAS, PENDING), kategori tag, chip label',
      sample: 'TERVERIFIKASI'
    }
  ];

  // ── MODULE INSPECTOR SPECIFICATIONS FOR FONTS ──
  const MODULE_FONT_DATA = useMemo(() => ({
    retail: {
      id: 'retail',
      name: 'Retail & Toko',
      icon: Store,
      routePrefix: '/retail/*',
      cssFiles: ['retail.css', 'pos.css', 'index.css'],
      description: 'Modul retail berfokus pada kecepatan bacaan teks kasir POS, barcode scanning cepat, dan keterbacaan struk termal.',
      fontRoles: {
        headline: {
          family: 'Plus Jakarta Sans',
          class: "font-['Plus_Jakarta_Sans'] font-semibold",
          usage: 'Nama toko, judul dashboard POS, harga produk katalog, dan total rupiah tagihan.'
        },
        body: {
          family: 'Inter',
          class: "font-['Inter'] font-normal text-slate-600",
          usage: 'Nama varian satuan (Pcs/Dus), form pencarian barcode, dan nama kasir shift.'
        },
        code: {
          family: 'Monospace (ui-monospace)',
          class: 'font-mono font-semibold tracking-wider',
          usage: 'Nomor Barcode EAN-13, SKU item (#SKU-098), dan Nomor Struk (#INV-20260920-001).'
        }
      },
      mockupData: {
        headerTitle: 'Kasir POS Retail - Shift Pagi',
        statusBadge: 'AKTIF (KASIR 01)',
        itemTitle: 'Minyak Goreng Sawit 2 Liter',
        itemSubtitle: 'Kategori: Sembako & Bahan Pokok • Satuan: Pcs (Dus isi 6)',
        skuText: 'SKU: RT-SEM-0024 | BARCODE: 899275321004',
        priceText: 'Rp 34.000',
        metaNote: 'Stok Toko: 18 Pcs • Buffer Minimum: 5 Pcs'
      },
      hierarchyRows: [
        { level: 'Judul Sesi Kasir', token: "font-['Plus_Jakarta_Sans'] font-semibold text-xl text-slate-900", example: 'Kasir POS Retail #01' },
        { level: 'Display Harga POS', token: "font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-emerald-600", example: 'Rp 154.500' },
        { level: 'Nama Produk Katalog', token: "font-['Plus_Jakarta_Sans'] font-semibold text-sm text-slate-800 line-clamp-1", example: 'Susu UHT Full Cream 1L' },
        { level: 'Data Barcode & SKU', token: "font-mono font-semibold text-xs text-slate-500 tracking-wider", example: 'SKU-RT-88421' },
        { level: 'Teks Struk Termal', token: "font-mono text-xs text-slate-800 leading-tight", example: 'Total: Rp 154.500 | QRIS LUNAS' }
      ]
    },

    kuliner: {
      id: 'kuliner',
      name: 'Kuliner & Resto',
      icon: Utensils,
      routePrefix: '/kuliner/*',
      cssFiles: ['KulinerDashboard.css', 'kuliner-print.css', 'index.css'],
      description: 'Modul kuliner mengutamakan kejelasan nomor meja dari kejauhan, kemudahan koki membaca pesanan di Kitchen Display System (KDS), dan struk dapur.',
      fontRoles: {
        headline: {
          family: 'Plus Jakarta Sans',
          class: "font-['Plus_Jakarta_Sans'] font-semibold",
          usage: 'Nomor Meja (#04), nama menu andalan, dan total billing kasir resto.'
        },
        body: {
          family: 'Inter',
          class: "font-['Inter'] font-medium text-slate-700",
          usage: 'Catatan modifier koki (Pedas Level 4, less ice, kuah pisah) dan instruksi pelayan.'
        },
        code: {
          family: 'Monospace (ui-monospace)',
          class: 'font-mono font-semibold tracking-wider',
          usage: 'Kode Tiket KDS (#TKT-KUL-082), timestamp pesanan (16:40:12 WIB), dan nomor split bill.'
        }
      },
      mockupData: {
        headerTitle: 'Meja #04 - Order Dine In Resto',
        statusBadge: 'KDS MASAK (18 MNT LALU)',
        itemTitle: 'Nasi Goreng Spesial Seafood',
        itemSubtitle: 'Catatan Dapur: Pedas Level 4, Telur Dadar Renyah, Jangan Pakai Seledri',
        skuText: 'KODE TIKET: #TKT-KUL-082 | JAM: 16:40 WIB',
        priceText: 'Rp 42.000',
        metaNote: 'Pelayan: Rian • Kasir: Indah • Kursi: 4 Tamu'
      },
      hierarchyRows: [
        { level: 'Nomor Meja Utama', token: "font-['Plus_Jakarta_Sans'] font-semibold text-3xl text-amber-600", example: 'Meja #04' },
        { level: 'Nama Menu Makanan', token: "font-['Plus_Jakarta_Sans'] font-semibold text-base text-slate-900", example: 'Ayam Bakar Madu Pedas' },
        { level: 'Catatan Modifier Koki', token: "font-['Inter'] font-semibold text-xs italic text-rose-600 bg-rose-50 px-2 py-1 rounded", example: 'Pedas Level 3, Kuah Pisah' },
        { level: 'Kode Tiket KDS', token: "font-mono font-semibold text-xs text-slate-700 tracking-wider", example: '#TKT-KUL-082' },
        { level: 'Timer Urgensi Dapur', token: "font-mono font-semibold text-xs text-rose-600", example: '18 Menit yang lalu' }
      ]
    },

    jasa: {
      id: 'jasa',
      name: 'Jasa & Bengkel',
      icon: Wrench,
      routePrefix: '/jasa/*',
      cssFiles: ['jasa.css', 'pos.css', 'index.css'],
      description: 'Modul jasa & bengkel menekankan keterbacaan nomor plat kendaraan berukuran besar, nomor registrasi SPK, transparansi breakdown biaya jasa vs sparepart.',
      fontRoles: {
        headline: {
          family: 'Plus Jakarta Sans',
          class: "font-['Plus_Jakarta_Sans'] font-semibold",
          usage: 'Nama jenis paket servis, judul modal SPK, nama teknisi, dan grand total biaya pengerjaan.'
        },
        body: {
          family: 'Inter',
          class: "font-['Inter'] font-normal text-slate-600",
          usage: 'Catatan keluhan pelanggan, rekomendasi mekanik, dan daftar inspeksi checklist.'
        },
        code: {
          family: 'Monospace (ui-monospace)',
          class: 'font-mono font-semibold tracking-widest',
          usage: 'Nomor Polisi (B 4819 KRF), Nomor Registrasi SPK (#SPK-2026-0814), dan Odometer (42.150 KM).'
        }
      },
      mockupData: {
        headerTitle: 'SPK Servis Berkala & Ganti Kampas Rem',
        statusBadge: 'SEDANG DIKERJAKAN',
        itemTitle: 'Honda Vario 160 CBS (Tahun 2023)',
        itemSubtitle: 'Pelanggan: Bpk. Hendra Pratama (0812-9876-xxxx) • Teknisi: Dani Prasetyo',
        skuText: 'NO. POLISI: B 4819 KRF | SPK: #SPK-2026-0814 | ODO: 42.150 KM',
        priceText: 'Rp 320.000',
        metaNote: 'Estimasi Selesai: 45 Menit • Garansi Servis: 7 Hari'
      },
      hierarchyRows: [
        { level: 'Plat Nomor Kendaraan', token: "font-mono font-semibold text-xl text-slate-900 tracking-widest", example: 'B 4819 KRF' },
        { level: 'Nomor Registrasi SPK', token: "font-mono font-semibold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded", example: 'SPK-2026-0814' },
        { level: 'Judul Paket Servis', token: "font-['Plus_Jakarta_Sans'] font-semibold text-base text-slate-900", example: 'Servis Ringan & Tune Up' },
        { level: 'Keluhan & Checklist', token: "font-['Inter'] text-xs text-slate-600 leading-relaxed", example: 'Tarikan gas berat, ganti oli mesin' },
        { level: 'Biaya Part & Jasa', token: "font-['Plus_Jakarta_Sans'] font-semibold text-lg text-sky-700", example: 'Rp 320.000' }
      ]
    },

    seller: {
      id: 'seller',
      name: 'Seller Omnichannel',
      icon: ShoppingBag,
      routePrefix: '/seller/*',
      cssFiles: ['seller.css', 'pos.css', 'index.css'],
      description: 'Modul seller omnichannel mengadopsi standar logistik e-commerce dengan nomor resi kurir monospaced, nama channel marketplace tebal, dan batas kirim countdown.',
      fontRoles: {
        headline: {
          family: 'Plus Jakarta Sans',
          class: "font-['Plus_Jakarta_Sans'] font-semibold",
          usage: 'Nama channel (Shopee/Tokopedia), nama produk online, dan total nilai pesanan.'
        },
        body: {
          family: 'Inter',
          class: "font-['Inter'] font-normal text-slate-600",
          usage: 'Alamat pengiriman pembeli, status tracking paket kurir, dan catatan pembeli.'
        },
        code: {
          family: 'Monospace (ui-monospace)',
          class: 'font-mono font-semibold tracking-wider',
          usage: 'Nomor Resi / AWB (JP8219401824), Marketplace Order ID (#260920XYZ881), dan Master SKU.'
        }
      },
      mockupData: {
        headerTitle: 'Shopee Official Store - Pesanan Baru Masuk',
        statusBadge: 'MENUNGGU PICKUP KURIR',
        itemTitle: 'Kemeja Flannel Pria Casual Lengan Panjang',
        itemSubtitle: 'Penerima: Anita W. • Jl. Margonda Raya No. 42, Depok • Kurir: J&T Express Regular',
        skuText: 'NO RESI: JP8219401824 | ORDER ID: 260920XYZ881 | SKU: FLN-NAVY-XL',
        priceText: 'Rp 210.000',
        metaNote: 'Batas Pengiriman: 20 Sep 2026, 23:59 WIB (Countdown: 4 Jam Tersisa)'
      },
      hierarchyRows: [
        { level: 'Nomor Resi / AWB', token: "font-mono font-semibold text-sm text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded", example: 'JP8219401824' },
        { level: 'Marketplace Channel Badge', token: "font-['Plus_Jakarta_Sans'] font-semibold text-xs uppercase tracking-wider", example: 'SHOPEE STORE' },
        { level: 'Nama Produk Marketplace', token: "font-['Plus_Jakarta_Sans'] font-semibold text-sm text-slate-800 line-clamp-1", example: 'Flannel Shirt Navy XL' },
        { level: 'Alamat Pengiriman', token: "font-['Inter'] text-xs text-slate-600 leading-normal", example: 'Kec. Sukmajaya, Kota Depok' },
        { level: 'Batas Waktu Kirim', token: "font-mono font-semibold text-xs text-amber-600", example: 'Sisa Waktu: 4 Jam' }
      ]
    },

    budidaya: {
      id: 'budidaya',
      name: 'Budidaya & Tambak',
      icon: Droplets,
      routePrefix: '/budidaya/*',
      cssFiles: ['budidaya.css', 'index.css'],
      description: 'Modul budidaya dirancang dengan angka sensor telemetri ukuran ekstra besar (high legibility) agar mudah terbaca teknisi tambak di bawah pantulan sinar matahari luar ruangan.',
      fontRoles: {
        headline: {
          family: 'Plus Jakarta Sans',
          class: "font-['Plus_Jakarta_Sans'] font-semibold",
          usage: 'Nama kolam / petak tambak, fase budidaya (DOC 42), dan nama komoditas (Udang Vaname / Ikan Nila).'
        },
        body: {
          family: 'Inter',
          class: "font-['Inter'] font-medium text-slate-600",
          usage: 'Keterangan kondisi air, log pemberian pakan harian, dan rekomendasi aerasi kincir.'
        },
        code: {
          family: 'Monospace (ui-monospace)',
          class: 'font-mono font-semibold tracking-tight',
          usage: 'Angka sensor IoT telemetri (pH 7.8, DO 5.8 ppm, Suhu 29.4°C), rasio FCR (1.18), dan Siklus ID.'
        }
      },
      mockupData: {
        headerTitle: 'Kolam Terpal Bioflok B-02 (Udang Vaname)',
        statusBadge: 'KUALITAS AIR OPTIMAL',
        itemTitle: 'Monitoring Telemetri IoT & Log Pakan Harian',
        itemSubtitle: 'Target Pakan Harian: 4.8 Kg/hari (4x pemberian) • Estimasi Biomassa: 340 Kg',
        skuText: 'SIKLUS: #CYC-VAN-2026-B2 | DOC: 42 HARI | SENSOR ID: IOT-AQ-092',
        priceText: 'pH: 7.8 | DO: 5.8 ppm',
        metaNote: 'Rasio FCR Kumulatif: 1.18 (Target: 1.20) • Target Panen: 18 Oktober 2026'
      },
      hierarchyRows: [
        { level: 'Nilai Sensor Telemetri', token: "font-mono font-semibold text-2xl text-emerald-600 tracking-tight", example: '7.8 pH | 5.8 ppm' },
        { level: 'Nama Kolam & Petak', token: "font-['Plus_Jakarta_Sans'] font-semibold text-base text-slate-900", example: 'Kolam Bioflok B-02' },
        { level: 'Kode Siklus Budidaya', token: "font-mono font-semibold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded", example: '#CYC-VAN-2026-B2' },
        { level: 'Fase Umur Budidaya (DOC)', token: "font-['Plus_Jakarta_Sans'] font-semibold text-xs text-slate-600", example: 'DOC 42 Hari' },
        { level: 'Log & Catatan Lapangan', token: "font-['Inter'] text-xs text-slate-600 leading-normal", example: 'Pakan habis tuntas, nafsu makan tinggi' }
      ]
    },

    admin: {
      id: 'admin',
      name: 'SaaS Admin Platform',
      icon: ShieldCheck,
      routePrefix: '/admin/*',
      cssFiles: ['index.css', 'AdminMobileNav.css'],
      description: 'Modul SaaS Platform mengadopsi tipografi modern ala enterprise tech, dengan angka MRR finansial yang tegas dan UUID serta token API monospaced.',
      fontRoles: {
        headline: {
          family: 'Plus Jakarta Sans',
          class: "font-['Plus_Jakarta_Sans'] font-semibold",
          usage: 'Angka Platform MRR/ARR, nama tenant perusahaan, dan judul analitik sistem.'
        },
        body: {
          family: 'Inter',
          class: "font-['Inter'] font-normal text-slate-600",
          usage: 'Daftar audit log aktivitas admin, deskripsi paket langganan, dan data profil merchant.'
        },
        code: {
          family: 'Monospace (ui-monospace)',
          class: 'font-mono text-xs text-slate-600',
          usage: 'Tenant UUID (8e4b2a19-9f20), API Secret Token (bz_live_...), dan Server Queue Timestamp.'
        }
      },
      mockupData: {
        headerTitle: 'Tenant Subscription: PT Berkah Retail Nusantara',
        statusBadge: 'ENTERPRISE PLAN (ACTIVE)',
        itemTitle: 'Platform Multi-Outlet POS & Omnichannel Sync',
        itemSubtitle: 'Paket: Enterprise Tier • Kuota Outlet: 12 Cabang Aktif • Pembayaran: Auto-Debit Bank Mandiri',
        skuText: 'TENANT UUID: 8e4b2a19-9f20-410d | API KEY: bz_live_9f81a7d4... | EXPIRES: 2027-01-01',
        priceText: 'Rp 499.000 / bln',
        metaNote: 'Status KYC: Terverifikasi (NIB: 9120019281) • Terdaftar sejak: Jan 2025'
      },
      hierarchyRows: [
        { level: 'Platform MRR Display', token: "font-['Plus_Jakarta_Sans'] font-semibold text-3xl text-indigo-600", example: 'Rp 148.950.000' },
        { level: 'Nama Tenant Merchant', token: "font-['Plus_Jakarta_Sans'] font-semibold text-sm text-slate-900", example: 'PT Berkah Retail Nusantara' },
        { level: 'UUID Tenant & API Token', token: "font-mono text-xs text-slate-500 font-normal", example: '8e4b2a19-9f20-410d-88b1' },
        { level: 'Status Lisensi Tenant', token: "font-['Inter'] font-semibold text-[10px] uppercase tracking-wider", example: 'ACTIVE ENTERPRISE' },
        { level: 'Audit Log & Server Time', token: "font-mono text-[11px] text-slate-400", example: '2026-09-20 01:15:22 UTC' }
      ]
    }
  }), []);

  const activeModuleData = MODULE_FONT_DATA[selectedModule] || MODULE_FONT_DATA.retail;
  const ActiveModIcon = activeModuleData.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* ── HEADER & DESIGN SYSTEM HUB BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Type size={260} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            <span>Bizora Design System & Typography Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Kamus Font & Tipografi UI
          </h1>
          <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
            Standarisasi jenis huruf, ukuran hierarki (*type scale*), bobot (*font weight*), dan implementasi tipografi per modul untuk menjaga harmoni visual di seluruh ekosistem Bizora.
          </p>
        </div>

        {/* Design System Hub Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-white/10 pt-4">
          <NavLink
            to="/admin/icon-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 text-indigo-200 hover:bg-white/10"
          >
            <Sparkles size={16} />
            <span>1. Kamus Icon UI</span>
          </NavLink>
          <NavLink
            to={`/admin/card-dictionary?tab=${activeTab === 'inspector' ? 'inspector' : 'catalog'}&module=${selectedModule}`}
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 text-indigo-200 hover:bg-white/10"
          >
            <LayoutDashboard size={16} />
            <span>2. Kamus Card UI</span>
          </NavLink>
          <NavLink
            to="/admin/font-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 bg-white text-indigo-900 shadow-md font-bold"
          >
            <Type size={16} />
            <span>3. Kamus Font & Tipografi</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              Standard + Per Modul
            </span>
          </NavLink>
        </div>
      </div>

      {/* ── MAIN SUB-TAB NAVIGATION ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders size={16} />
          <span>Kamus & Sandbox Font</span>
        </button>

        <button
          onClick={() => handleTabChange('inspector')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inspector'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>🔍 Cek Font Per Modul</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
            6 Modul
          </span>
        </button>

        <button
          onClick={() => handleTabChange('hierarchy')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'hierarchy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlignLeft size={16} />
          <span>Hierarki Skala Tipografi</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {TYPE_SCALES.length} Level
          </span>
        </button>

        <button
          onClick={() => handleTabChange('guidelines')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'guidelines'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} />
          <span>Kaidah Penulisan Teks</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CATALOG & SANDBOX VIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* INTERACTIVE TYPOGRAPHY SANDBOX */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Interactive Typography Sandbox</h3>
                  <p className="text-xs text-slate-500">Uji coba interaktif jenis font, ukuran, ketebalan, dan spasi sebelum dipakai di kode.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(`font-['Plus_Jakarta_Sans'] text-[${sandboxSize}px] font-[${sandboxWeight}] ${sandboxTracking} ${sandboxColor}`, 'sandbox-classes', 'Kelas Tailwind Sandbox')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors self-start md:self-auto"
              >
                {copiedId === 'sandbox-classes' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedId === 'sandbox-classes' ? 'Tersalin!' : 'Salin Kelas Tailwind'}</span>
              </button>
            </div>

            {/* Sandbox Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Font Family Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Jenis Font (Family)</label>
                <select
                  value={sandboxFont}
                  onChange={e => setSandboxFont(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="plus-jakarta">Plus Jakarta Sans (Brand/Headline)</option>
                  <option value="inter">Inter (Data/UI)</option>
                  <option value="outfit">Outfit (Marketing/Display)</option>
                  <option value="mono">Monospace (SKU/Kode/Struk)</option>
                </select>
              </div>

              {/* Font Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Ukuran Font</span>
                  <span className="text-indigo-600 font-mono">{sandboxSize}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="48"
                  value={sandboxSize}
                  onChange={e => setSandboxSize(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer mt-2"
                />
              </div>

              {/* Font Weight */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Ketebalan (Weight)</label>
                <div className="flex gap-1">
                  {[400, 500, 600, 700, 800].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSandboxWeight(w)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        sandboxWeight === w
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {w === 400 ? 'Reg' : w === 600 ? 'Semi' : w === 700 ? 'Bold' : w === 800 ? 'Extra' : 'Med'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Spacing (Tracking) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Letter Spacing (Tracking)</label>
                <select
                  value={sandboxTracking}
                  onChange={e => setSandboxTracking(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="tracking-tighter">tracking-tighter (-0.05em)</option>
                  <option value="tracking-tight">tracking-tight (-0.025em)</option>
                  <option value="tracking-normal">tracking-normal (0)</option>
                  <option value="tracking-wide">tracking-wide (+0.025em)</option>
                  <option value="tracking-wider">tracking-wider (+0.05em)</option>
                </select>
              </div>
            </div>

            {/* Custom Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Teks Uji Coba</label>
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Ketik teks yang ingin Anda uji coba..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sandbox Live Preview Box */}
            <div className="p-6 md:p-8 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] text-center overflow-x-auto">
              <div
                style={{
                  fontFamily: sandboxFont === 'plus-jakarta' 
                    ? "'Plus Jakarta Sans', sans-serif" 
                    : sandboxFont === 'inter'
                    ? "'Inter', sans-serif"
                    : sandboxFont === 'outfit'
                    ? "'Outfit', sans-serif"
                    : "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: `${sandboxSize}px`,
                  fontWeight: sandboxWeight,
                  lineHeight: 1.3
                }}
                className={`${sandboxTracking} ${sandboxColor} transition-all max-w-full break-words`}
              >
                {customText || 'Tulis teks contoh...'}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
                <span>Font: {sandboxFont}</span>
                <span>•</span>
                <span>Size: {sandboxSize}px</span>
                <span>•</span>
                <span>Weight: {sandboxWeight}</span>
                <span>•</span>
                <span>{sandboxTracking}</span>
              </div>
            </div>
          </div>

          {/* FONT FAMILIES SHOWCASE */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base">4 Keluarga Font Terstandarisasi Bizora</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {FONT_FAMILIES.map(font => (
                <div
                  key={font.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{font.role}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(font.tailwindClass, font.id, font.name)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Salin kelas Tailwind"
                      >
                        {copiedId === font.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <h4 className="text-xl font-extrabold text-slate-900">{font.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{font.description}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div
                      style={{ fontFamily: font.cssFamily }}
                      className="text-slate-800 text-sm md:text-base leading-relaxed break-words"
                    >
                      {font.sampleText}
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Tailwind: {font.tailwindClass}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(font.tailwindClass, `class-${font.id}`, 'Kelas')}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Copy Class
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MODULE INSPECTOR (Cek Font Per Modul)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          {/* Module Selector Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pilih Modul untuk Menginspeksi Standar Tipografi:
              </span>
              <span className="text-xs text-slate-400">
                Pilih modul di bawah
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.values(MODULE_FONT_DATA).map(mod => {
                const Icon = mod.icon;
                const isSelected = selectedModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleModuleChange(mod.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {mod.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {mod.routePrefix}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Typography Header & Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ActiveModIcon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Spesifikasi Tipografi: Modul {activeModuleData.name}
                    </h2>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {activeModuleData.routePrefix}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {activeModuleData.description}
                  </p>
                </div>
              </div>

              {/* Cross-Link to Card Dictionary */}
              <div className="shrink-0 flex items-center gap-2">
                <NavLink
                  to={`/admin/card-dictionary?tab=inspector&module=${activeModuleData.id}`}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <LayoutDashboard size={14} className="text-amber-400" />
                  <span>Cek Card Modul Ini ↗</span>
                </NavLink>
              </div>
            </div>

            {/* 3 Font Roles in This Module */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">1. Headline & Brand</span>
                  <span className="font-mono text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">Primary</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{activeModuleData.fontRoles.headline.family}</h4>
                <p className="text-slate-500 leading-snug">{activeModuleData.fontRoles.headline.usage}</p>
                <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                  {activeModuleData.fontRoles.headline.class}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">2. Body, UI & Form</span>
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">Standard</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{activeModuleData.fontRoles.body.family}</h4>
                <p className="text-slate-500 leading-snug">{activeModuleData.fontRoles.body.usage}</p>
                <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                  {activeModuleData.fontRoles.body.class}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">3. SKU, Code & Struk</span>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Mono</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{activeModuleData.fontRoles.code.family}</h4>
                <p className="text-slate-500 leading-snug">{activeModuleData.fontRoles.code.usage}</p>
                <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                  {activeModuleData.fontRoles.code.class}
                </div>
              </div>
            </div>

            {/* CSS Files */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <FileText size={14} className="text-slate-400" />
              <span>File CSS yang Memuat Font Modul Ini:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {activeModuleData.cssFiles.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* REALISTIC LIVE MOCKUP PREVIEW */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Simulasi Live Tipografi: Konteks Nyata Modul {activeModuleData.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Lihat interaksi ketiga jenis font (Headline, Body UI, dan Monospace) dalam komponen UI riil.
                </p>
              </div>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-bold">
                Live Render
              </span>
            </div>

            <div className="p-5 md:p-8 bg-slate-50/70 rounded-2xl border border-slate-200 flex items-center justify-center">
              <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ActiveModIcon size={18} className="text-indigo-600" />
                    <h4 className="font-['Plus_Jakarta_Sans'] font-extrabold text-base text-slate-900">
                      {activeModuleData.mockupData.headerTitle}
                    </h4>
                  </div>
                  <span className="text-[10px] font-['Plus_Jakarta_Sans'] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {activeModuleData.mockupData.statusBadge}
                  </span>
                </div>

                {/* SKU Code Bar */}
                <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 tracking-wider">
                    {activeModuleData.mockupData.skuText}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeModuleData.mockupData.skuText, 'mock-sku', 'Kode Transaksi')}
                    className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                  >
                    {copiedId === 'mock-sku' ? 'Tersalin' : 'Copy'}
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="space-y-1.5">
                  <div className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900">
                    {activeModuleData.mockupData.itemTitle}
                  </div>
                  <div className="font-['Inter'] text-xs text-slate-600 leading-relaxed">
                    {activeModuleData.mockupData.itemSubtitle}
                  </div>
                </div>

                {/* Price & Meta Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">
                      {activeModuleData.mockupData.priceText}
                    </div>
                    <div className="font-['Inter'] text-[11px] text-slate-400 mt-0.5">
                      {activeModuleData.mockupData.metaNote}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-bold shadow-sm">
                    Proses Transaksi &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TYPE HIERARCHY TABLE FOR THIS MODULE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                Tabel Skala & Aturan Tipografi Modul {activeModuleData.name}
              </h3>
              <span className="text-xs text-slate-400">Klik tombol salin untuk mengambil kelas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Peran Teks</th>
                    <th className="p-3">Kelas Tailwind CSS</th>
                    <th className="p-3">Teks Contoh Modul Ini</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeModuleData.hierarchyRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{row.level}</td>
                      <td className="p-3 font-mono text-[11px] text-indigo-700 bg-indigo-50/50 rounded">{row.token}</td>
                      <td className="p-3 text-slate-700">{row.example}</td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopy(row.token, `mod-row-${idx}`, row.level)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          {copiedId === `mod-row-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === `mod-row-${idx}` ? 'Tersalin' : 'Copy'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: GENERAL TYPE SCALE HIERARCHY TABLE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">Hierarki Skala Tipografi Global (Type Scale)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Panduan ukuran teks terstandarisasi mulai dari Display Hero untuk omzet hingga Micro Tag untuk status badge.
            </p>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {TYPE_SCALES.map(scale => (
              <div key={scale.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1 lg:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{scale.level}</span>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {scale.pixelSize}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {scale.usage}
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Line Height: {scale.lineHeight} | Weight: {scale.weight}
                  </div>
                </div>

                {/* Sample Render */}
                <div className="lg:flex-1 min-w-0">
                  <div className={`${scale.className} text-slate-900 truncate`}>
                    {scale.sample}
                  </div>
                </div>

                {/* Copy Class Button */}
                <div className="lg:w-auto shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(scale.className, scale.id, `Kelas ${scale.level}`)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === scale.id ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId === scale.id ? 'Tersalin' : 'Salin Kelas Tailwind'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: WRITING STANDARDS & GUIDELINES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-lg">Kaidah Penulisan Teks & Format Standar Bizora</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">1. Format Mata Uang Rupiah</h4>
              <p className="leading-relaxed">
                Selalu awali dengan <strong>Rp</strong> diikuti spasi dan pemisah titik ribuan, contoh: <strong>Rp 125.000</strong>. Hindari format tanpa spasi seperti "Rp125.000". Gunakan angka semi bold <strong>font-semibold</strong> untuk total grand summary.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">2. Title Case vs Sentence Case</h4>
              <p className="leading-relaxed">
                Gunakan <strong>Title Case</strong> untuk judul menu, tombol aksi, dan heading kartu (contoh: <em>"Tambah Produk Baru"</em>). Gunakan <strong>Sentence case</strong> untuk teks deskripsi formulir dan pesan notifikasi banner.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">3. Truncate & Line Clamp Layar HP</h4>
              <p className="leading-relaxed">
                Pada tampilan mobile atau layar kasir POS, hindari judul produk atau nama pelanggan yang merusak layout grid. Gunakan utilitas <strong>truncate</strong> untuk 1 baris, atau <strong>line-clamp-2</strong> pada kartu katalog multi-satuan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
