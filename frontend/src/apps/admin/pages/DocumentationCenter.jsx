import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../lib/api';
import {
  Search,
  ChevronRight,
  BookOpen,
  Printer,
  Download,
  Layout,
  FileText,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Store,
  Coins,
  Settings,
  ShieldCheck,
  Layers,
  Lightbulb,
  Tag,
  Compass,
  CheckCircle2,
  MessageSquare
} from '@/constants/icons';

// Helper to pick category icon based on name or module
function getCategoryIcon(name = '', module = '') {
  const lower = (name + ' ' + module).toLowerCase();
  if (lower.includes('keuangan') || lower.includes('akuntansi') || lower.includes('laba')) {
    return Coins;
  }
  if (lower.includes('retail') || lower.includes('toko') || lower.includes('pos') || lower.includes('kasir')) {
    return Store;
  }
  if (lower.includes('langganan') || lower.includes('daftar') || lower.includes('paket') || lower.includes('onboarding')) {
    return Sparkles;
  }
  if (lower.includes('kuliner') || lower.includes('f&b') || lower.includes('restoran')) {
    return Compass;
  }
  if (lower.includes('stok') || lower.includes('produk') || lower.includes('inventori')) {
    return Layers;
  }
  if (lower.includes('keamanan') || lower.includes('privasi') || lower.includes('auth')) {
    return ShieldCheck;
  }
  if (lower.includes('sistem') || lower.includes('setting') || lower.includes('pengaturan')) {
    return Settings;
  }
  return BookOpen;
}

// Calculate estimated reading time
function getEstimatedReadTime(htmlContent = '') {
  if (!htmlContent) return '1 menit';
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} menit baca`;
}

export default function DocumentationCenter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articleLoading, setArticleLoading] = useState(false);

  // Sidebar & Navigation states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [sidebarFilter, setSidebarFilter] = useState('');

  // Reader UX states
  const [copied, setCopied] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null); // 'helpful' | 'unhelpful' | null
  const articleContainerRef = useRef(null);

  // Load Categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync with URL query parameter
  useEffect(() => {
    const slug = searchParams.get('article');
    if (slug) {
      if (!selectedArticle || selectedArticle.slug !== slug) {
        fetchArticle(slug, false);
      }
    } else if (categories.length > 0 && !selectedArticle) {
      // Default to first article if available
      const firstCatWithArticles = categories.find(c => c.articles && c.articles.length > 0);
      if (firstCatWithArticles && firstCatWithArticles.articles[0]) {
        fetchArticle(firstCatWithArticles.articles[0].slug, true);
      }
    }
  }, [searchParams, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documentation/categories');
      const cats = res.data || [];
      setCategories(cats);

      // Default all categories open
      const initialCollapsed = {};
      cats.forEach(c => {
        initialCollapsed[c.id] = false;
      });
      setCollapsedCategories(initialCollapsed);

      // If initial slug is present in URL, fetch it
      const currentSlug = new URLSearchParams(window.location.search).get('article');
      if (currentSlug) {
        fetchArticle(currentSlug, false);
      } else if (cats.length > 0) {
        const firstCat = cats.find(c => c.articles && c.articles.length > 0);
        if (firstCat && firstCat.articles[0]) {
          fetchArticle(firstCat.articles[0].slug, true);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil kategori dokumentasi:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async (slug, updateUrl = true) => {
    if (!slug) return;
    try {
      setArticleLoading(true);
      const res = await api.get(`/documentation/article/${slug}`);
      setSelectedArticle(res.data);
      setFeedbackState(null);
      setMobileSidebarOpen(false);

      if (updateUrl) {
        setSearchParams({ article: slug });
      }

      // Smooth scroll to top of article area
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Gagal mengambil artikel:', err);
    } finally {
      setArticleLoading(false);
    }
  };

  const toggleCategoryCollapse = (catId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadPdf = () => {
    if (!selectedArticle) return;
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/documentation/export/article/${selectedArticle.slug}`, '_blank');
  };

  // Flattened list of articles for Prev / Next navigation
  const allArticlesList = useMemo(() => {
    const list = [];
    categories.forEach(cat => {
      if (cat.articles && cat.articles.length > 0) {
        cat.articles.forEach(art => {
          list.push({
            ...art,
            categoryName: cat.name
          });
        });
      }
    });
    return list;
  }, [categories]);

  // Find previous and next articles
  const { prevArticle, nextArticle } = useMemo(() => {
    if (!selectedArticle || allArticlesList.length === 0) {
      return { prevArticle: null, nextArticle: null };
    }
    const currentIndex = allArticlesList.findIndex(a => a.slug === selectedArticle.slug || a.id === selectedArticle.id);
    if (currentIndex === -1) return { prevArticle: null, nextArticle: null };

    return {
      prevArticle: currentIndex > 0 ? allArticlesList[currentIndex - 1] : null,
      nextArticle: currentIndex < allArticlesList.length - 1 ? allArticlesList[currentIndex + 1] : null
    };
  }, [selectedArticle, allArticlesList]);

  // Filtered categories according to sidebar search query
  const filteredCategories = useMemo(() => {
    if (!sidebarFilter.trim()) return categories;
    const filterLower = sidebarFilter.toLowerCase();
    return categories
      .map(cat => {
        const matchedArticles = (cat.articles || []).filter(a => a.title.toLowerCase().includes(filterLower));
        const catMatched = cat.name.toLowerCase().includes(filterLower);
        if (catMatched || matchedArticles.length > 0) {
          return {
            ...cat,
            articles: catMatched ? cat.articles : matchedArticles
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [categories, sidebarFilter]);

  // Total article count
  const totalArticles = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.articles?.length || 0), 0);
  }, [categories]);

  return (
    <div className="doc-center-wrapper font-sans text-slate-800 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Main Container Layout */}
      <div className="w-full py-2 flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Menyiapkan Pusat Dokumentasi...</h3>
            <p className="text-xs text-slate-500 mt-1">Mengambil index panduan dan materi sistem</p>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 lg:gap-8 items-start relative">
            
            {/* Left Sidebar Navigation (Desktop Fixed, Mobile Drawer) */}
            <aside
              className={`
                fixed inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200/90 p-4 transform transition-transform duration-300 ease-in-out lg:static lg:w-72 lg:translate-x-0 lg:border-r-0 lg:p-0 lg:bg-transparent lg:z-auto
                ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
              `}
            >
              {/* Mobile Close Button */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 lg:hidden">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800 text-sm">Daftar Panduan</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Content Card */}
              <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-slate-200/80 lg:shadow-xs p-3.5 flex flex-col max-h-[calc(100vh-140px)] lg:sticky lg:top-20">
                
                {/* Search / Filter within Sidebar */}
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Saring daftar panduan..."
                    value={sidebarFilter}
                    onChange={(e) => setSidebarFilter(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                  {sidebarFilter && (
                    <button
                      onClick={() => setSidebarFilter('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categories & Articles Accordion Tree */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {/* Home Overview Button */}
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      setSearchParams({});
                      setMobileSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all mb-2
                      ${!selectedArticle
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layout className="w-4 h-4" />
                      <span>Beranda Panduan</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!selectedArticle ? 'bg-indigo-500 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                      {totalArticles}
                    </span>
                  </button>

                  {/* Render Categories */}
                  {filteredCategories.map((category) => {
                    const CategoryIcon = getCategoryIcon(category.name, category.module);
                    const isCollapsed = collapsedCategories[category.id];
                    const hasActiveArticle = category.articles?.some(a => a.id === selectedArticle?.id);

                    return (
                      <div key={category.id} className="rounded-xl border border-slate-100 overflow-hidden">
                        {/* Category Header Bar */}
                        <button
                          onClick={() => toggleCategoryCollapse(category.id)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 text-left transition-colors
                            ${hasActiveArticle ? 'bg-slate-50/90 text-indigo-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'}
                          `}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CategoryIcon className={`w-3.5 h-3.5 shrink-0 ${hasActiveArticle ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className="text-xs truncate font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {category.articles?.length || 0}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                isCollapsed ? '-rotate-90' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Article Items Under Category */}
                        {!isCollapsed && (
                          <div className="bg-slate-50/50 py-1 px-1.5 space-y-0.5 border-t border-slate-100/60">
                            {category.articles && category.articles.length > 0 ? (
                              category.articles.map((art) => {
                                const isActive = selectedArticle?.id === art.id;
                                return (
                                  <button
                                    key={art.id}
                                    onClick={() => fetchArticle(art.slug)}
                                    className={`
                                      w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-start gap-2 relative
                                      ${
                                        isActive
                                          ? 'bg-indigo-50/90 text-indigo-700 font-semibold border-l-2 border-indigo-600 pl-2 shadow-xs'
                                          : 'text-slate-600 hover:bg-white hover:text-slate-900 font-normal'
                                      }
                                    `}
                                  >
                                    <FileText className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className="leading-snug line-clamp-2">{art.title}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-3 py-2 text-[11px] text-slate-400 italic">
                                Belum ada panduan di kategori ini.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sidebar Footer Extra Links */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                  <a
                    href="/developers"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors font-medium"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Dokumentasi API Pengembang
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
            )}

            {/* Main Content Reading Area */}
            <main className="flex-1 min-w-0" ref={articleContainerRef}>
              {articleLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Membuka panduan...</p>
                </div>
              ) : selectedArticle ? (
                <div className="space-y-6">
                  {/* Article Paper Container */}
                  <article className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgb(0,0,0,0.03)] p-5 sm:p-7 md:p-9 lg:p-10 relative">
                    
                    {/* Top Breadcrumb & Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100 hide-on-print">
                      {/* Breadcrumbs with Mobile Drawer Trigger */}
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
                        <button
                          onClick={() => setMobileSidebarOpen(true)}
                          className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold mr-1"
                          title="Buka Daftar Panduan"
                        >
                          <Menu className="w-4 h-4 text-indigo-600" />
                          <span>Daftar Panduan</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedArticle(null);
                            setSearchParams({});
                          }}
                          className="hover:text-indigo-600 transition-colors flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Pusat Panduan</span>
                        </button>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {selectedArticle.category?.name || 'Umum'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span className="text-slate-800 font-semibold truncate max-w-[160px] sm:max-w-xs">
                          {selectedArticle.title}
                        </span>
                      </div>

                      {/* Reading Controls & Export Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                        {/* Copy Link */}
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                          title="Salin tautan ke artikel ini"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span className="hidden sm:inline">Salin Link</span>
                            </>
                          )}
                        </button>

                        {/* Print Button */}
                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                          title="Cetak panduan ini"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Cetak</span>
                        </button>

                        {/* PDF Download Button */}
                        <button
                          onClick={handleDownloadPdf}
                          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs shadow-indigo-600/20"
                          title="Unduh format PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Article Header Details */}
                    <header className="mb-8">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        <span>Kategori: {selectedArticle.category?.name || 'Dokumentasi Sistem'}</span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                        {selectedArticle.title}
                      </h1>

                      {/* Metadata Chips Bar */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 font-medium py-2.5 px-3.5 bg-slate-50/80 rounded-xl border border-slate-100 mb-6">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                            B
                          </div>
                          <span className="font-semibold text-slate-700">Tim Bizora</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getEstimatedReadTime(selectedArticle.content)}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span>
                          Diperbarui{' '}
                          {selectedArticle.published_at
                            ? new Date(selectedArticle.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : '-'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold text-[11px]">
                          Versi {selectedArticle.version || '1.0'}
                        </span>
                      </div>

                      {/* Short Description Highlight Card */}
                      {selectedArticle.short_description && (
                        <div className="bg-gradient-to-r from-indigo-50/90 via-indigo-50/40 to-slate-50 border-l-4 border-indigo-600 rounded-r-xl p-4 sm:p-5 text-sm md:text-base text-slate-700 font-medium leading-relaxed flex items-start gap-3 shadow-xs">
                          <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                              Ringkasan Inti
                            </div>
                            <p>{selectedArticle.short_description}</p>
                          </div>
                        </div>
                      )}
                    </header>

                    {/* Article Body */}
                    <div
                      className="article-content text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />

                    {/* Article Footer & Was it helpful? */}
                    <div className="mt-12 pt-8 border-t border-slate-100 hide-on-print">
                      {/* Helpful Rating */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Apakah artikel panduan ini membantu Anda?
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Masukan Anda sangat berarti bagi penyempurnaan panduan kami.
                          </p>
                        </div>

                        {feedbackState ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-100 animate-fade-in">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Terima kasih atas tanggapan Anda!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setFeedbackState('helpful')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Ya, Membantu</span>
                            </button>
                            <button
                              onClick={() => setFeedbackState('unhelpful')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-rose-400 hover:text-rose-600 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>Perlu Perbaikan</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Previous / Next Article Navigation Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {prevArticle ? (
                          <button
                            onClick={() => fetchArticle(prevArticle.slug)}
                            className="text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex flex-col justify-between"
                          >
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Panduan Sebelumnya</span>
                            </div>
                            <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                              {prevArticle.title}
                            </div>
                          </button>
                        ) : (
                          <div />
                        )}

                        {nextArticle ? (
                          <button
                            onClick={() => fetchArticle(nextArticle.slug)}
                            className="text-right p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group flex flex-col justify-between ml-auto w-full sm:w-auto"
                          >
                            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                              <span>Panduan Selanjutnya</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                              {nextArticle.title}
                            </div>
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                /* Overview / Welcome Landing View */
                <div className="space-y-8 animate-fade-in">
                  {/* Mobile Trigger for Drawer */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setMobileSidebarOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white shadow-xs text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <Menu className="w-4 h-4 text-indigo-600" />
                      <span>Buka Daftar Panduan & Kategori</span>
                    </button>
                  </div>

                  {/* Hero Header */}
                  <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Pusat Bantuan Resmi Bizora</span>
                      </div>

                      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                        Bagaimana kami dapat membantu operasional Anda?
                      </h2>
                      <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed mb-6 font-normal">
                        Jelajahi panduan langkah demi langkah, kalkulasi rumus sistem, hingga prosedur operasional standar (SOP) untuk memaksimalkan potensi bisnis Anda.
                      </p>

                      {/* Quick Filter Pill Buttons */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-indigo-300 font-medium">Topik populer:</span>
                        {['Pendaftaran', 'Laba Rugi', 'Retail', 'Kasir POS'].map((topic) => (
                          <button
                            key={topic}
                            onClick={() => {
                              setSidebarFilter(topic);
                              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category Grid Section */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Kategori Dokumentasi</h3>
                        <p className="text-xs text-slate-500">Pilih topik modul untuk membaca penjelasan detail</p>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {categories.length} Kategori Tersedia
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {categories.map((category) => {
                        const Icon = getCategoryIcon(category.name, category.module);
                        const articleCount = category.articles?.length || 0;
                        const firstArticle = category.articles?.[0];

                        return (
                          <div
                            key={category.id}
                            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {articleCount} Artikel
                                </span>
                              </div>

                              <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                                {category.name}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                                {category.description || `Kumpulan panduan teknis dan alur operasional untuk ${category.name}.`}
                              </p>

                              {/* Top 3 articles in this category */}
                              <div className="space-y-1.5 mb-4">
                                {category.articles?.slice(0, 3).map((art) => (
                                  <button
                                    key={art.id}
                                    onClick={() => fetchArticle(art.slug)}
                                    className="w-full text-left text-xs text-slate-600 hover:text-indigo-600 hover:underline flex items-center gap-1.5 truncate"
                                  >
                                    <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{art.title}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {firstArticle && (
                              <button
                                onClick={() => fetchArticle(firstArticle.slug)}
                                className="w-full py-2 px-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-100 group-hover:border-indigo-100"
                              >
                                <span>Buka Panduan</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Need More Assistance Banner */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          Tidak menemukan jawaban yang Anda cari?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          Tim layanan dukungan teknis Bizora siap membantu kendala operasional Anda setiap hari kerja.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href="/support"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs shadow-indigo-600/20"
                      >
                        Buka Tiket Bantuan
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Modern Typography & Prose Stylesheet */}
      <style>{`
        /* Smooth Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Modern Documentation Article Typography */
        .article-content {
          color: #334155;
          line-height: 1.75;
          letter-spacing: -0.01em;
        }

        .article-content h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2.25rem;
          margin-bottom: 0.85rem;
          letter-spacing: -0.025em;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .article-content h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 1.75rem;
          margin-bottom: 0.65rem;
          letter-spacing: -0.015em;
        }

        .article-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .article-content p {
          margin-bottom: 1.25rem;
          color: #334155;
        }

        .article-content a {
          color: #4f46e5;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 600;
          transition: color 0.15s;
        }

        .article-content a:hover {
          color: #3730a3;
        }

        .article-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .article-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .article-content li {
          margin-bottom: 0.45rem;
          padding-left: 0.25rem;
        }

        .article-content li::marker {
          color: #6366f1;
          font-weight: 700;
        }

        .article-content strong, .article-content b {
          color: #0f172a;
          font-weight: 700;
        }

        .article-content blockquote {
          position: relative;
          border-left: 4px solid #6366f1;
          background: #f8fafc;
          padding: 1rem 1.25rem;
          border-radius: 0 0.75rem 0.75rem 0;
          margin: 1.5rem 0;
          color: #1e293b;
          font-style: normal;
          font-size: 0.95em;
          box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.02);
        }

        .article-content code {
          background: #f1f5f9;
          color: #db2777;
          padding: 0.2rem 0.45rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          border: 1px solid #e2e8f0;
        }

        .article-content pre {
          background: #0f172a;
          color: #f8fafc;
          padding: 1.25rem;
          border-radius: 0.85rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-size: 0.875rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .article-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          border: none;
        }

        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.75rem 0;
          font-size: 0.875rem;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .article-content th {
          background: #f8fafc;
          color: #1e293b;
          font-weight: 700;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .article-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .article-content tr:nth-child(even) {
          background: #fafafa;
        }

        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.85rem;
          margin: 2rem 0;
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.08);
          border: 1px solid #e2e8f0;
        }

        /* Print styles */
        @media print {
          .hide-on-print {
            display: none !important;
          }
          aside {
            display: none !important;
          }
          .doc-center-wrapper {
            background: white !important;
            padding: 0 !important;
          }
          article {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .article-content {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
