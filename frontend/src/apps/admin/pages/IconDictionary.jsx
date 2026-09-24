import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles,
  SlidersHorizontal,
  Code2,
  Palette,
  BookOpen,
  Eye,
  LayoutDashboard,
  Type
} from '@/constants/icons';
import { 
  ICON_CATALOG, 
  SearchIcon, 
  CopyIcon, 
  CheckIcon, 
  SlidersIcon,
  RefreshIcon,
  DocsIcon,
  EyeIcon
} from '../../../constants/icons';
import { useToast } from '../../../components/Toast';

export default function IconDictionary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewSize, setPreviewSize] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [colorTheme, setColorTheme] = useState('indigo');
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'guidelines'
  
  const toast = useToast();

  const categories = useMemo(() => [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'crud', label: 'Aksi & CRUD' },
    { id: 'table', label: 'Tabel & Toolbar' },
    { id: 'feedback', label: 'Status & Feedback' },
    { id: 'finance', label: 'Keuangan & POS' },
    { id: 'inventory', label: 'Inventori & Logistik' },
    { id: 'kuliner', label: 'F&B & Kuliner' },
    { id: 'jasa', label: 'Jasa & Bengkel' },
    { id: 'budidaya', label: 'Budidaya & Tambak' },
    { id: 'users', label: 'Pengguna & Akses' },
    { id: 'system', label: 'Sistem & Server' },
  ], []);

  const colorThemes = [
    { id: 'indigo', label: 'Indigo (Primary)', class: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'slate', label: 'Slate (Neutral)', class: 'text-slate-700 bg-slate-100 border-slate-200' },
    { id: 'emerald', label: 'Emerald (Success)', class: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'rose', label: 'Rose (Danger)', class: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'amber', label: 'Amber (Warning)', class: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const filteredIcons = useMemo(() => {
    return ICON_CATALOG.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCat) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.lucideName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
      );
    });
  }, [selectedCategory, search]);

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

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* ── HEADER & BANNER ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Sparkles size={260} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            <span>Bizora Design System & Asset Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Kamus Icon & Standarisasi UI
          </h1>
          <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
            Pusat standarisasi icon (*Single Source of Truth*) untuk seluruh modul UMKM (Retail, Kuliner, Jasa, Budidaya, Seller) dan SaaS Admin. Gunakan nama semantik agar tampilan aplikasi selalu konsisten dan seragam.
          </p>
        </div>

        {/* Design System Hub Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-white/10 pt-4">
          <NavLink
            to="/admin/icon-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 bg-white text-indigo-900 shadow-md font-bold"
          >
            <Sparkles size={16} />
            <span>1. Kamus Icon UI</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              {ICON_CATALOG.length}
            </span>
          </NavLink>
          <NavLink
            to="/admin/card-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 text-indigo-200 hover:bg-white/10"
          >
            <LayoutDashboard size={16} />
            <span>2. Kamus Card UI</span>
          </NavLink>
          <NavLink
            to="/admin/font-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 text-indigo-200 hover:bg-white/10"
          >
            <Type size={16} />
            <span>3. Kamus Font & Tipografi</span>
          </NavLink>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <EyeIcon size={16} />
            <span>Katalog & Tester Interaktif</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              {ICON_CATALOG.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'guidelines'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <BookOpen size={16} />
            <span>Panduan & Aturan Penyeragaman</span>
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* ── INTERACTIVE CONTROLLER / TOOLBAR ── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Search Bar */}
              <div className="lg:col-span-5 relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari icon berdasarkan nama, fungsi (edit, hapus, kasir), atau kata kunci..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Live Playground Adjusters */}
              <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-3 text-xs">
                {/* Size Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium px-2">Ukuran:</span>
                  {[14, 16, 18, 20, 24, 32].map(s => (
                    <button
                      key={s}
                      onClick={() => setPreviewSize(s)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        previewSize === s
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>

                {/* Stroke Width Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium px-2">Tebal:</span>
                  {[1.5, 2, 2.5].map(w => (
                    <button
                      key={w}
                      onClick={() => setStrokeWidth(w)}
                      className={`px-2 py-1 rounded-lg font-bold transition-all ${
                        strokeWidth === w
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>

                {/* Color Theme Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {colorThemes.map(ct => (
                    <button
                      key={ct.id}
                      onClick={() => setColorTheme(ct.id)}
                      title={ct.label}
                      className={`w-6 h-6 rounded-lg transition-all ${
                        ct.id === 'indigo' ? 'bg-indigo-600' :
                        ct.id === 'slate' ? 'bg-slate-700' :
                        ct.id === 'emerald' ? 'bg-emerald-600' :
                        ct.id === 'rose' ? 'bg-rose-600' : 'bg-amber-500'
                      } ${colorTheme === ct.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
              {categories.map(cat => {
                const count = cat.id === 'all'
                  ? ICON_CATALOG.length
                  : ICON_CATALOG.filter(i => i.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedCategory === cat.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── GRID ICON CARDS ── */}
          {filteredIcons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <SearchIcon size={40} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">Tidak ada icon ditemukan</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Coba cari dengan kata kunci lain seperti "edit", "hapus", "kasir", atau pilih kategori "Semua".
              </p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredIcons.map(item => {
                const IconComponent = item.component;
                const importSnippet = `import { ${item.name} } from '@/constants/icons';`;
                const jsxSnippet = `<${item.name} size={${previewSize}} />`;

                const isCopiedImport = copiedId === `imp-${item.name}`;
                const isCopiedJsx = copiedId === `jsx-${item.name}`;

                // Determine preview style from chosen theme
                const activeColorTheme = colorThemes.find(t => t.id === colorTheme);

                return (
                  <div
                    key={item.name}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top: Icon Box & Category Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${activeColorTheme.class}`}
                        >
                          <IconComponent size={previewSize} strokeWidth={strokeWidth} />
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                          {item.categoryName}
                        </span>
                      </div>

                      {/* Middle: Title & Names */}
                      <div className="space-y-1 mb-2">
                        <h3 className="font-mono text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          {item.name}
                        </h3>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>Lucide:</span>
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                            {item.lucideName}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Action: Copy Snippets */}
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <button
                        onClick={() => handleCopy(importSnippet, `imp-${item.name}`, 'Kode Import')}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          isCopiedImport
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200/70'
                        }`}
                      >
                        <span className="font-mono text-[11px] truncate">Import</span>
                        {isCopiedImport ? <CheckIcon size={14} className="text-emerald-600" /> : <CopyIcon size={13} className="text-slate-400" />}
                      </button>

                      <button
                        onClick={() => handleCopy(jsxSnippet, `jsx-${item.name}`, 'Komponen JSX')}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          isCopiedJsx
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                        }`}
                      >
                        <span className="font-mono text-[11px] truncate">{`<${item.name} />`}</span>
                        {isCopiedJsx ? <CheckIcon size={14} className="text-emerald-600" /> : <CopyIcon size={13} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ── GUIDELINES / PANDUAN STANDARISASI TAB ── */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Aturan & Standarisasi Pemakaian Icon di Bizora
              </h2>
              <p className="text-sm text-slate-600">
                Gunakan panduan ini saat membuat atau mengubah halaman modul (Retail, Kuliner, Jasa, Budidaya, Seller, SaaS Admin) agar tidak terjadi lagi inkonsistensi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Cara Import */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <Code2 size={18} className="text-indigo-600" />
                  <span>1. Cara Import yang Benar (Single Source of Truth)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hindari meng-import langsung icon acak seperti `Edit2` atau `Edit3` dari `lucide-react`. Selalu import dari file kamus:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs overflow-x-auto">
                  <span className="text-slate-500">// ✅ Rekomendasi (Konsisten & Seragam):</span><br />
                  <span className="text-indigo-300">import</span> {'{'} <span className="text-amber-300">EditIcon, DeleteIcon, AddIcon</span> {'}'} <span className="text-indigo-300">from</span> <span className="text-emerald-300">'@/constants/icons'</span>;
                </div>
              </div>

              {/* Box 2: Standar Ukuran */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                  <SlidersIcon size={18} className="text-indigo-600" />
                  <span>2. Standar Ukuran Icon (Pixel Standard)</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                    <span>Tombol Aksi di Tabel (Edit / Hapus / View):</span>
                    <strong className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">14px - 16px</strong>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                    <span>Toolbar / Tombol Header ("Tambah Data"):</span>
                    <strong className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">16px - 18px</strong>
                  </li>
                  <li className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                    <span>Navigasi Sidebar & Topbar:</span>
                    <strong className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">18px - 20px</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>KPI Card & Banner Icon:</span>
                    <strong className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">24px - 32px</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tabel Standar Aksi */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">
                3. Matriks Standar Aksi & Warna Tombol
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Aksi</th>
                      <th className="p-3">Semantic Component</th>
                      <th className="p-3">Lucide Base</th>
                      <th className="p-3">Warna / Tailwind Styling</th>
                      <th className="p-3">Penggunaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Ubah Data</td>
                      <td className="p-3 font-mono text-indigo-600 font-bold">EditIcon</td>
                      <td className="p-3 font-mono">Pencil</td>
                      <td className="p-3"><span className="text-slate-600 hover:text-indigo-600 font-semibold">text-slate-600 hover:text-indigo-600</span></td>
                      <td className="p-3">Semua tabel di Retail, Kuliner, Jasa, Budidaya, SaaS</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Hapus Data</td>
                      <td className="p-3 font-mono text-rose-600 font-bold">DeleteIcon</td>
                      <td className="p-3 font-mono">Trash2</td>
                      <td className="p-3"><span className="text-slate-600 hover:text-rose-600 font-semibold">text-slate-600 hover:text-rose-600</span></td>
                      <td className="p-3">Aksi hapus item dengan modal konfirmasi</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Tambah Data</td>
                      <td className="p-3 font-mono text-indigo-600 font-bold">AddIcon</td>
                      <td className="p-3 font-mono">Plus</td>
                      <td className="p-3"><span className="text-white bg-indigo-600 px-2 py-0.5 rounded font-semibold">bg-indigo-600 text-white</span></td>
                      <td className="p-3">Tombol utama Create / Tambah Baru di atas tabel</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Lihat Detail</td>
                      <td className="p-3 font-mono text-slate-700 font-bold">ViewIcon</td>
                      <td className="p-3 font-mono">Eye</td>
                      <td className="p-3"><span className="text-slate-600 hover:text-slate-900 font-semibold">text-slate-600 hover:text-slate-900</span></td>
                      <td className="p-3">Buka modal detail rincian atau pratinjau invoice</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Cetak Berkas</td>
                      <td className="p-3 font-mono text-slate-700 font-bold">PrintIcon</td>
                      <td className="p-3 font-mono">Printer</td>
                      <td className="p-3"><span className="text-slate-600 font-semibold">text-slate-700</span></td>
                      <td className="p-3">Cetak struk kasir, surat jalan, atau invoice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
