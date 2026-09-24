import React, { useState } from 'react';
import { 
  Sparkles,
  LayoutDashboard,
  Table as TableIcon,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Store,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Info,
  Clock,
  ShieldCheck,
  Package,
  FileText,
  Utensils,
  Wrench,
  ShoppingBag,
  Droplets,
  CreditCard,
  Hash,
  Eye,
  Type,
  Maximize2,
  Sliders
} from '@/constants/icons';
import { useToast } from '../../../components/Toast';

export default function RetailStandardsDictionary() {
  const [activeTab, setActiveTab] = useState('catalog'); 
  const [copiedKey, setCopiedKey] = useState(null);
  const toast = useToast();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Snippet kode berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Mock table items replicating Retail gold standard
  const sampleProducts = [
    { id: 1, name: 'Keripik Singkong Balado', sku: 'MAK-9410', category: 'Makanan', stock: 143, unit: 'Pack', is_consignment: true, price_buy: 12750, price_sell: 15000 },
    { id: 2, name: 'Kacang Umpet Karamel', sku: 'MAK-6018', category: 'Makanan', stock: 60, unit: 'Pack', is_consignment: false, price_buy: 21250, price_sell: 25000 },
    { id: 3, name: 'Paket Hampers Lebaran A', sku: 'MAK-1189', category: 'Makanan', stock: 13, unit: 'Box', is_consignment: false, price_buy: 212500, price_sell: 250000 },
    { id: 4, name: 'Stick Balado Pedas', sku: 'MAK-3904', category: 'Makanan', stock: 215, unit: 'Pack', is_consignment: true, price_buy: 7650, price_sell: 9000 },
    { id: 5, name: 'Air Mineral 600ml', sku: 'MIN-6232', category: 'Minuman', stock: 50, unit: 'Botol', is_consignment: true, price_buy: 3400, price_sell: 4000 },
    { id: 6, name: 'Teh Botol Sosro', sku: 'MIN-9401', category: 'Minuman', stock: 30, unit: 'Botol', is_consignment: false, price_buy: 5100, price_sell: 6000 },
    { id: 7, name: 'Beras Pandan Wangi 5kg', sku: 'SEM-6267', category: 'Sembako', stock: 20, unit: 'Pack', is_consignment: false, price_buy: 63750, price_sell: 75000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-['Inter']">
      {/* ── Executive Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#072544] via-[#051e36] to-[#041628] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-sky-500/20 via-blue-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-semibold">
              <Sparkles size={14} className="text-sky-300" />
              <span>SaaS Design System • Gold Standard Ref</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']" style={{ fontWeight: 800 }}>
              Standar Desain Ritel untuk Seluruh Modul
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Dokumentasi spesifikasi lengkap antarmuka teruji dari modul Retail yang ditetapkan sebagai standar acuan konsistensi UI platform BIZORA (Jasa, Kuliner, Budidaya, Seller, dan SaaS Admin) mencakup jenis font, tabel, ukuran tombol, form kontrol, dan kartu metrik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[120px]">
              <span className="text-xs text-sky-200 block font-medium">Elemen Terstandar</span>
              <span className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans']">8 Core</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[120px]">
              <span className="text-xs text-emerald-300 block font-medium">Modul Target</span>
              <span className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans']">5 Modul</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'catalog', label: 'Ringkasan Standar', icon: Layers },
            { id: 'typography', label: '1. Jenis Font & Tipografi', icon: Type },
            { id: 'table', label: '2. Tabel Data Grid', icon: TableIcon },
            { id: 'buttons_forms', label: '3. Tombol & Form (38px)', icon: SlidersHorizontal },
            { id: 'cards', label: '4. Kartu & KPI Metrik', icon: LayoutDashboard },
            { id: 'badges', label: '5. Status & Lencana', icon: Sparkles },
            { id: 'pagination', label: '6. Navigasi Halaman', icon: BookOpen },
            { id: 'roadmap', label: '7. Matriks Adopsi Modul', icon: Store }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-md font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: CATALOG OVERVIEW ── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Tipografi & Font',
                desc: 'Plus Jakarta Sans untuk Heading & Banner (bold 700-800), Inter untuk Tabel, Form, dan Body (400 & 600).',
                tag: 'Typography Rule',
                tabId: 'typography',
                icon: Type,
                color: 'text-sky-600 bg-sky-50 border-sky-200'
              },
              {
                title: 'Tabel Data Grid',
                desc: 'Header uppercase 11.5px abu-abu (#64748b), baris 13px gelap (#1e293b), border halus slate-100, spacing 12px 16px.',
                tag: 'Tabel Standar',
                tabId: 'table',
                icon: TableIcon,
                color: 'text-blue-600 bg-blue-50 border-blue-200'
              },
              {
                title: 'Universal Height 38px',
                desc: 'Seluruh kontrol toolbar: search bar, select filter, action button, dan tombol refresh sync sejajar di 38px.',
                tag: 'Toolbar & Tombol',
                tabId: 'buttons_forms',
                icon: SlidersHorizontal,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
              },
              {
                title: 'Unified Pagination',
                desc: 'Format ringkas "1-10 / 48", selector ukuran halaman, dan tombol nomor halaman royal blue aktif.',
                tag: 'Data Navigation',
                tabId: 'pagination',
                icon: BookOpen,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.color}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 font-['Plus_Jakarta_Sans']">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab(card.tabId)}
                    className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <span>Pelajari Spesifikasi</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Comparison Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Daftar Lengkap Elemen Retail yang Siap Diadopsi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabel rangkuman spesifikasi teknis dan implementasi CSS untuk diaplikasikan ke modul Jasa, Kuliner, Budidaya, Seller, dan Admin.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start">
                Status: Siap Diaplikasikan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-3 px-4 text-left">Elemen UI</th>
                    <th className="py-3 px-4 text-left">Standar Ritel (Gold Standard)</th>
                    <th className="py-3 px-4 text-left">Kondisi Modul Lain Sebelum Standarisasi</th>
                    <th className="py-3 px-4 text-left">Implementasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Jenis Font Utama</td>
                    <td className="py-3 px-4">Plus Jakarta Sans (Heading/Kompak) + Inter (Tabel/Body/Data)</td>
                    <td className="py-3 px-4 text-slate-500">Campuran font yang tidak konsisten antar modul</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">Standardized di index.css</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Header Tabel (th)</td>
                    <td className="py-3 px-4">UPPERCASE, font 11.5px, weight 600, tracking 0.05em, text #64748b, bg #f8fafc</td>
                    <td className="py-3 px-4 text-slate-500">Ada yang 14px bold, ada yang kapital biasa, warna gelap/hitam</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">Injected global di index.css</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Isi Baris Tabel (td)</td>
                    <td className="py-3 px-4">Font Inter 13px, weight 400, color #1e293b, padding 12px 16px, border #f1f5f9</td>
                    <td className="py-3 px-4 text-slate-500">Padding beda (10px - 16px), font campuran sans/serif, warna pudar</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">Injected global di index.css</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Ukuran Tombol & Toolbar</td>
                    <td className="py-3 px-4">Ketinggian seragam rata 38px (Input, Select, Button Tambah, Button Sync)</td>
                    <td className="py-3 px-4 text-slate-500">Tombol 42px, search 34px, dropdown bertingkat tidak sejajar</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">Class h-[38px] & rounded-xl</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Aksi Baris (Pencil/Trash)</td>
                    <td className="py-3 px-4">Tombol icon-only 30-32px, rounded-lg, hover halus slate-100 / rose-50</td>
                    <td className="py-3 px-4 text-slate-500">Sebagian modul menggunakan dropdown titik tiga atau teks panjang</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">Gunakan icon-only w-7 h-7</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Kartu & Container</td>
                    <td className="py-3 px-4">Radius 16px (rounded-2xl), border subtle border-slate-200/80, shadow-xs</td>
                    <td className="py-3 px-4 text-slate-500">Radius acak (8px, 12px, 24px) dengan shadow berat</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">Gunakan class .card rounded-2xl</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Lencana Kategori & Status</td>
                    <td className="py-3 px-4">Pill badge rounded-lg/full, font 9-11px, soft pastel tint (WCAG AA)</td>
                    <td className="py-3 px-4 text-slate-500">Teks polos tanpa chip, atau chip tebal kontras gelap</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">Gunakan komponen shared Badge.jsx</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Navigasi Halaman (Pagination)</td>
                    <td className="py-3 px-4">BizoraPagination dengan range ringkas ("1-10 / 48") & nomor aktif royal blue</td>
                    <td className="py-3 px-4 text-slate-500">Tombol pagination tebal, border ganda, teks "Baris" berulang</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">Pakai import BizoraPagination</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TYPOGRAPHY & FONT SYSTEM ── */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                Typography System Spec
              </span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                Aturan & Spesifikasi Jenis Font (Typography Hierarchy)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ritel memisahkan peran font secara teratur: <strong>Plus Jakarta Sans</strong> untuk heading/display ekspresif, dan <strong>Inter</strong> untuk tabel, formulir, dan data operasional yang padat.
              </p>
            </div>

            {/* Font Hierarchy Showcase */}
            <div className="space-y-3">
              {[
                {
                  level: 'Hero & Banner Greeting',
                  font: "font-['Plus_Jakarta_Sans']",
                  size: '24px - 28px',
                  weight: 'Weight 800 (Bold)',
                  sample: 'Selamat malam, Demo Mart IJ6D',
                  usage: 'Header salam di bagian atas dashboard tiap modul'
                },
                {
                  level: 'Page Title (Judul Halaman)',
                  font: "font-['Plus_Jakarta_Sans']",
                  size: '22px - 24px',
                  weight: 'Weight 700 (Bold)',
                  sample: 'Katalog Produk & Inventori Toko',
                  usage: 'Judul utama setiap halaman'
                },
                {
                  level: 'Section Title & Card Header',
                  font: "font-['Plus_Jakarta_Sans']",
                  size: '15px - 16px',
                  weight: 'Weight 600 (Semi-bold)',
                  sample: 'Daftar Barang & Posisi Stok',
                  usage: 'Judul kartu, header tabel, dan section container'
                },
                {
                  level: 'Table Body & Primary Cell',
                  font: "font-['Inter']",
                  size: '13px',
                  weight: 'Weight 400 (Normal) / 500 (Medium)',
                  sample: 'Keripik Singkong Balado (Rp 15.000)',
                  usage: 'Teks isi tabel, nama barang, alamat, deskripsi'
                },
                {
                  level: 'Table Column Header (th)',
                  font: "font-['Inter'] / ['Plus_Jakarta_Sans']",
                  size: '11.5px',
                  weight: 'Weight 600 (Semi-bold) UPPERCASE',
                  sample: 'IDENTITAS BARANG • HARGA MODAL • AKSI',
                  usage: 'Baris header tabel data grid'
                },
                {
                  level: 'Micro Badges & SKU Code',
                  font: "font-mono / font-['Inter']",
                  size: '10px - 11px',
                  weight: 'Weight 600 (Semi-bold)',
                  sample: 'MAK-9410 • TITIPAN • LUNAS',
                  usage: 'Status pills, SKU barang, chip kategori'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.level}</span>
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-mono">{item.size}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{item.weight}</span>
                    </div>
                    <p className={`text-slate-900 ${item.font}`} style={{ fontSize: item.size.split(' ')[0] }}>
                      {item.sample}
                    </p>
                  </div>
                  <div className="text-right sm:max-w-xs">
                    <span className="text-[11px] text-slate-400 block">{item.usage}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Standard Weight Rule Note */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <strong className="block font-bold">Aturan Standar Weight:</strong>
              <p>
                Semua judul section, tombol, dan tabel header menggunakan <strong>weight 600 (semi-bold)</strong>. Khusus ucapan salam banner dashboard menggunakan <strong>weight 800 (bold)</strong> agar tampil tegas dan elegan sesuai arahan desain.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: TABLE DATA GRID SPECIFICATION ── */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Live Component Preview
                </span>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                  Preview Tabel Standar Ritel (Replika Katalog Produk)
                </h3>
              </div>
              <button
                onClick={() => handleCopy(
`<div className="retail-table-responsive">
  <table className="table">
    <thead>
      <tr>
        <th className="pl-6 retail-table-header">Identitas Barang</th>
        <th className="retail-table-header">SKU</th>
        <th className="retail-table-header">Kategori</th>
        <th className="retail-table-header">Posisi Stok</th>
        <th className="retail-table-header text-right">Harga Modal</th>
        <th className="retail-table-header text-right">Harga Jual</th>
        <th className="pr-6 text-right retail-table-header">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id}>
          <td className="pl-6 font-medium text-slate-900">{item.name}</td>
          <td><code className="text-slate-600 uppercase tracking-wider">{item.sku}</code></td>
          <td>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] uppercase font-semibold">
              {item.category}
            </span>
          </td>
          <td>
            <span className="text-slate-900 font-medium">{item.stock} {item.unit}</span>
            {item.is_consignment && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 border border-purple-200">
                Titipan
              </span>
            )}
          </td>
          <td className="text-right text-slate-800 font-medium">Rp {item.price_buy.toLocaleString('id-ID')}</td>
          <td className="text-right text-slate-900 font-medium">Rp {item.price_sell.toLocaleString('id-ID')}</td>
          <td className="pr-6 text-right">
            <div className="flex justify-end gap-2">
              <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700" title="Edit"><Pencil size={14} /></button>
              <button className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600" title="Hapus"><Trash2 size={14} /></button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>`, 'table_jsx')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all self-start sm:self-auto cursor-pointer"
              >
                {copiedKey === 'table_jsx' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedKey === 'table_jsx' ? 'Tersalin!' : 'Salin Kode JSX'}</span>
              </button>
            </div>

            {/* Rendered Live Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold tracking-wider uppercase text-[11.5px]">
                    <th className="py-3 px-6 text-left">Identitas Barang</th>
                    <th className="py-3 px-4 text-left">SKU</th>
                    <th className="py-3 px-4 text-left">Kategori</th>
                    <th className="py-3 px-4 text-left">Posisi Stok</th>
                    <th className="py-3 px-4 text-right">Harga Modal</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sampleProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-6 font-medium text-slate-900">{p.name}</td>
                      <td className="py-3 px-4">
                        <code className="text-slate-700 font-mono text-[11px] tracking-wider">{p.sku}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100/80 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-slate-900 font-medium">{p.stock} {p.unit}</span>
                          {p.is_consignment && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                              Titipan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800 font-medium">
                        Rp {p.price_buy.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-medium">
                        Rp {p.price_sell.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" title="Edit Data">
                            <Pencil size={14} />
                          </button>
                          <button className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Hapus Data">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span className="font-medium text-slate-700"><strong className="text-slate-900">1-7</strong> / 7 produk</span>
              <span className="text-[11px] font-medium text-slate-400">Desain 100% Pixel-Match Ritel</span>
            </div>
          </div>

          {/* Technical Spec Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Spesifikasi Header Tabel (th)
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Font:</strong> 'Inter', 'Plus Jakarta Sans', sans-serif</li>
                <li><strong>Size & Weight:</strong> 11.5px, font-weight 600 (semi-bold)</li>
                <li><strong>Transform & Tracking:</strong> UPPERCASE, letter-spacing 0.05em</li>
                <li><strong>Warna Teks:</strong> #64748b (Slate 500)</li>
                <li><strong>Padding:</strong> 12px 16px (pl-6 untuk kolom awal, pr-6 untuk aksi)</li>
                <li><strong>Latar Belakang:</strong> #f8fafc (Slate 50) dengan border bawah #e2e8f0</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Spesifikasi Baris & Sel Tabel (td)
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                <li><strong>Font & Size:</strong> Inter 13px, font-weight 400 (normal)</li>
                <li><strong>Warna Teks Utama:</strong> #1e293b (Slate 800) untuk keterbacaan tinggi</li>
                <li><strong>Angka & Mata Uang:</strong> Text-right, font-medium, pemisah ribuan titik (.)</li>
                <li><strong>Kode / SKU:</strong> Menggunakan tag <code>&lt;code&gt;</code> uppercase font-mono</li>
                <li><strong>Border Pemisah:</strong> 1px solid #f1f5f9 antar baris</li>
                <li><strong>Hover State:</strong> bg-slate-50/70 halus saat kursor melintas</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: BUTTONS & FORM SPECIFICATION ── */}
      {activeTab === 'buttons_forms' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Interactive Button & Form System
              </span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                Matriks Ukuran Tombol & Form Kontrol
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kunci kerapian antarmuka Ritel: <strong>Tinggi universal 38px</strong> untuk toolbar dan formulir, serta <strong>font-weight 600 (semi-bold)</strong>.
              </p>
            </div>

            {/* Live Button Scale Hierarchy */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skala Hirarki Ukuran Tombol</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Micro (Row Action)</span>
                  <div className="h-10 flex items-center gap-2">
                    <button className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600">
                      <Pencil size={13} />
                    </button>
                    <button className="w-7 h-7 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">30px x 30px</p>
                  <p className="text-[11px] text-slate-500">Ikon aksi per-baris tabel (Edit/Hapus).</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Small (.btn-sm)</span>
                  <div className="h-10 flex items-center">
                    <button className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">
                      Aksi Cepat
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Height: 32px</p>
                  <p className="text-[11px] text-slate-500">Tombol pagination, tab filter kompak.</p>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-blue-600">Standard / Default</span>
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">GOLD</span>
                  </div>
                  <div className="h-10 flex items-center gap-2">
                    <button className="h-[38px] px-4 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                      <Plus size={14} /> Tambah Data
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Height: 38px (h-[38px])</p>
                  <p className="text-[11px] text-slate-500">Universal toolbar, form submit, modal action.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Large (.btn-lg)</span>
                  <div className="h-10 flex items-center">
                    <button className="h-11 px-5 rounded-xl bg-indigo-600 text-white text-sm font-bold inline-flex items-center gap-2">
                      <CreditCard size={15} /> Bayar Sekarang
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Height: 44px</p>
                  <p className="text-[11px] text-slate-500">Tombol Kasir POS, Checkout, Hero CTA.</p>
                </div>
              </div>
            </div>

            {/* Live Form Controls Preview */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Form Kontrol Standar (Height 38px)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nama Produk / Layanan</label>
                  <input 
                    type="text"
                    defaultValue="Kacang Umpet Karamel"
                    className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Kategori Barang</label>
                  <select className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none">
                    <option>Makanan Ringan</option>
                    <option>Minuman Segar</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Harga Jual (Rp)</label>
                  <input 
                    type="text"
                    defaultValue="25.000"
                    className="w-full h-[38px] px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium outline-none text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: CARDS & KPI METRICS ── */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Card & Container Architecture
              </span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                Standar Kartu Metrik KPI & Container Wrapper
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Semua kartu menggunakan sudut membulat <strong>rounded-2xl (16px)</strong> dengan garis batas halus dan bayangan ringan (*shadow-xs*) tanpa efek melayang berlebihan.
              </p>
            </div>

            {/* Live KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Penjualan',
                  value: 'Rp 48.250.000',
                  sub: '+14.2% dari minggu lalu',
                  icon: CreditCard,
                  color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                },
                {
                  label: 'Transaksi Sukses',
                  value: '1.420 Nota',
                  sub: 'Rata-rata 48 nota / hari',
                  icon: Package,
                  color: 'bg-blue-50 text-blue-600 border-blue-100'
                },
                {
                  label: 'Stok Kritis',
                  value: '12 Produk',
                  sub: 'Segera lakukan PO ulang',
                  icon: AlertCircle,
                  color: 'bg-amber-50 text-amber-600 border-amber-100'
                },
                {
                  label: 'Total Pelanggan',
                  value: '840 Member',
                  sub: '+28 member baru',
                  icon: ShieldCheck,
                  color: 'bg-purple-50 text-purple-600 border-purple-100'
                }
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</span>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{kpi.value}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spec Rules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="font-bold text-slate-800 block">Border Radius 16px:</span>
                <p>Gunakan <code>rounded-2xl</code> pada semua panel konten, kartu KPI, dan pembungkus tabel.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="font-bold text-slate-800 block">Shadow Halus:</span>
                <p>Gunakan <code>shadow-xs</code> (0 1px 2px rgba(0,0,0,0.05)). Hindari shadow tebal 20px+.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="font-bold text-slate-800 block">Icon Box:</span>
                <p>Ukuran 36px - 40px dengan sudut <code>rounded-xl</code> dan warna latar pastel lembut.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: BADGES & STATUS PILLS ── */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Color & Contrast Tokens
              </span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                Lencana Status & Chip Kategori (Badges)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Standar warna pastel berlatar lembut (*soft background*) dengan border tipis dan teks dengan kontras tinggi (WCAG AA).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  variant: 'Success / Lunas / Aktif',
                  class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  dot: 'bg-emerald-500',
                  usage: 'Transaksi Lunas, Status Aktif, Stok Aman'
                },
                {
                  variant: 'Danger / Batal / Habis',
                  class: 'bg-rose-50 text-rose-700 border-rose-200',
                  dot: 'bg-rose-500',
                  usage: 'Stok Menipis/Habis, SPK Batal, Jatuh Tempo'
                },
                {
                  variant: 'Warning / Pending / Proses',
                  class: 'bg-amber-50 text-amber-700 border-amber-200',
                  dot: 'bg-amber-500',
                  usage: 'Menunggu Pembayaran, Dalam Pengerjaan, PO Draft'
                },
                {
                  variant: 'Info / Selesai / Siap',
                  class: 'bg-blue-50 text-blue-700 border-blue-200',
                  dot: 'bg-blue-500',
                  usage: 'Pesanan Siap Diambil, Teknisi Ditugaskan'
                },
                {
                  variant: 'Kategori / Sub-brand (Purple)',
                  class: 'bg-purple-50 text-purple-700 border-purple-200',
                  dot: 'bg-purple-500',
                  usage: 'Kategori Produk Ritel, Konsinyasi / Titipan'
                },
                {
                  variant: 'Neutral / Arsip / Nonaktif',
                  class: 'bg-slate-100 text-slate-700 border-slate-200',
                  dot: 'bg-slate-400',
                  usage: 'Draft Offline, Pengarsipan Data'
                }
              ].map((badge, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.class}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>Contoh Label</span>
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Pill</span>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-800">{badge.variant}</h5>
                    <p className="text-[11px] text-slate-500">{badge.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: PAGINATION SPECIFICATION ── */}
      {activeTab === 'pagination' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Navigation Pattern
              </span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                Standar Navigasi Halaman (BizoraPagination)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Komponen pagination standar tunggal yang menggabungkan indikator baris ringkas, pemilih jumlah per-halaman, dan kontrol nomor halaman aktif.
              </p>
            </div>

            {/* Live Pagination Preview */}
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                  <span className="text-slate-800 font-bold">1-10</span> / <span>48</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Tampilkan:</span>
                    <select className="h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-400 cursor-not-allowed">
                      Prev
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs">
                      1
                    </button>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      2
                    </button>
                    <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      3
                    </button>
                    <button className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 space-y-2">
              <h5 className="font-bold flex items-center gap-1.5">
                <Info size={14} className="text-blue-600" />
                Aturan Penggunaan:
              </h5>
              <p>
                Gunakan komponen bersama <code>&lt;BizoraPagination /&gt;</code> di seluruh modul untuk menghindari duplikasi CSS pagination dan menjamin navigasi seragam di semua perangkat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: MODULE ADOPTION ROADMAP ── */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Cross-Module Rollout
              </span>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
                Matriks Adopsi Standar Ritel Antar-Modul
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Status penerapan standar UI Ritel di seluruh modul operasional BIZORA SaaS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  module: 'Retail',
                  subtitle: 'Toko Kelontong & Minimarket',
                  status: 'Gold Standard (100%)',
                  statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: Store,
                  items: [
                    'Tabel Identitas, SKU, Harga Modal/Jual',
                    'Toolbar 38px + Quick Refresh Sync',
                    'Lencana Kategori & Tag Titipan',
                    'Pagination Bizora 1-10 / 48'
                  ]
                },
                {
                  module: 'Jasa & Servis',
                  subtitle: 'Bengkel & Layanan Reparasi',
                  status: 'Terstandarisasi (100%)',
                  statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: Wrench,
                  items: [
                    'Tabel SPK & Daftar Teknisi',
                    'Tabel Finansial & Stok Suku Cadang',
                    'Toolbar 38px untuk pencarian & filter',
                    'Aksi baris ringkas w-7 h-7'
                  ]
                },
                {
                  module: 'Kuliner & F&B',
                  subtitle: 'Restoran, Kafe & Bakery',
                  status: 'Terstandarisasi (100%)',
                  statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: Utensils,
                  items: [
                    'Tabel Bahan Baku, Pesanan, Meja',
                    'Kolom harga rata kanan (text-right)',
                    'Toolbar 38px pencarian & aksi',
                    'Aksi baris ringkas w-7 h-7'
                  ]
                },
                {
                  module: 'Budidaya & Agro',
                  subtitle: 'Perikanan & Peternakan',
                  status: 'Terstandarisasi (100%)',
                  statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: Droplets,
                  items: [
                    'Tabel Siklus & Log Pakan Kolam',
                    'Format mata uang rata kanan',
                    'Lencana pastel soft status siklus',
                    'Padding sel pl-6/pr-6 konsisten'
                  ]
                },
                {
                  module: 'Seller Partner',
                  subtitle: 'Toko Online & Marketplace',
                  status: 'Terstandarisasi (100%)',
                  statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: ShoppingBag,
                  items: [
                    'Tabel Katalog & Sinkronisasi Pesanan',
                    'Tabel Pelanggan & Database Buyer',
                    'Toolbar 38px search & channel filter',
                    'Lencana pastel soft status pengiriman'
                  ]
                },
                {
                  module: 'SaaS Admin',
                  subtitle: 'Konsol Eksekutif & Master Data',
                  status: 'Terstandarisasi (100%)',
                  statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: ShieldCheck,
                  items: [
                    'Tabel Manajemen Tenant, User & Langganan',
                    'Pagination standar format 1-10 / 48',
                    'Toolbar terpadu tinggi universal 38px',
                    'Tipografi Inter global tabel'
                  ]
                }
              ].map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{mod.module}</h4>
                          <span className="text-[10px] text-slate-400 block">{mod.subtitle}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${mod.statusColor}`}>
                        {mod.status}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Elemen yang Diselaraskan:</span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {mod.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
