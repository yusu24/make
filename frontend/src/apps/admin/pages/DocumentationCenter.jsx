import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { Search, ChevronRight, BookOpen, Printer, Download, Layout, FileText, ChevronDown, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentationCenter() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dropdown states
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNavDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documentation/categories');
      setCategories(res.data || []);
      
      if (res.data?.length > 0 && res.data[0].articles?.length > 0 && !selectedArticle) {
        fetchArticle(res.data[0].articles[0].slug);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async (slug) => {
    try {
      setLoading(true);
      const res = await api.get(`/documentation/article/${slug}`);
      setSelectedArticle(res.data);
      setSearchQuery('');
      setSearchResults([]);
      setNavDropdownOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      try {
        const res = await api.get(`/documentation/search?q=${q}`);
        setSearchResults(res.data || []);
      } catch (err) {}
    } else {
      setSearchResults([]);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedArticle) return;
    window.open(`${import.meta.env.VITE_API_URL}/api/documentation/export/article/${selectedArticle.slug}`, '_blank');
  };

  return (
    <div className="relative font-sans">
      {/* Top Navigation & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between hide-on-print">
          
          {/* Custom Dropdown Navigation */}
          <div className="relative w-full md:w-3/5" ref={dropdownRef}>
            <button 
              onClick={() => setNavDropdownOpen(!navDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <AlignLeft className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="truncate">
                  <div className="text-xs text-slate-500 font-semibold mb-0.5">Daftar Isi Panduan</div>
                  <div className="text-sm font-bold text-slate-800 truncate">
                    {selectedArticle ? selectedArticle.title : 'Pilih Panduan...'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${navDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {navDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[60vh] overflow-y-auto custom-scrollbar"
                >
                  <div className="p-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="mb-3 last:mb-0">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Layout className="w-3.5 h-3.5" />
                          {cat.name}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {cat.articles?.map(art => {
                            const isActive = selectedArticle?.id === art.id;
                            return (
                              <button 
                                key={art.id}
                                onClick={() => fetchArticle(art.slug)}
                                className={`
                                  w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-start gap-2.5
                                  ${isActive 
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                              >
                                <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span className="leading-snug">{art.title}</span>
                              </button>
                            );
                          })}
                          {(!cat.articles || cat.articles.length === 0) && (
                            <span className="text-xs text-slate-400 pl-4 py-2 italic">Belum ada panduan</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-2/5">
            <Search className="absolute top-3 left-3 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari panduan..." 
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-lg py-2.5 pl-9 pr-4 text-sm transition-all"
              value={searchQuery}
              onChange={handleSearch}
            />
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[300px] overflow-y-auto"
                >
                  {searchResults.map(res => (
                    <div 
                      key={res.id} 
                      className="p-3 hover:bg-indigo-50 border-b border-slate-50 last:border-0 cursor-pointer" 
                      onClick={() => fetchArticle(res.slug)}
                    >
                      <div className="text-sm font-semibold text-slate-800">{res.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{res.category?.name}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Article Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Memuat panduan...</p>
          </div>
        ) : selectedArticle ? (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 sm:p-6 md:p-8 md:px-10"
          >
            {/* Top Actions & Breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 hide-on-print">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 max-w-full overflow-hidden">
                <span className="hover:text-indigo-600 cursor-pointer transition-colors hidden sm:inline whitespace-nowrap shrink-0">Bizora Help Center</span>
                <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:inline shrink-0" />
                <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md truncate text-xs md:text-sm">{selectedArticle.category?.name || 'Umum'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs md:text-sm font-semibold transition-colors border border-slate-200">
                  <Printer className="w-4 h-4" /> Cetak
                </button>
                <button onClick={handleDownloadPdf} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40">
                  <Download className="w-4 h-4" /> Unduh PDF
                </button>
              </div>
            </div>

            {/* Article Header */}
            <header className="mb-6 pb-6 border-b border-slate-100">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mb-3 tracking-tight">
                {selectedArticle.title}
              </h1>
              
              {selectedArticle.short_description && (
                <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4 md:mb-5 font-medium">
                  {selectedArticle.short_description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] md:text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
                    B
                  </div>
                  <span>Tim Bizora</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span>Diperbarui {selectedArticle.published_at ? new Date(selectedArticle.published_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Versi {selectedArticle.version}</span>
              </div>
            </header>

            {/* Article Content */}
            <div 
              className="article-content" 
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </motion.article>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang di Bizora Help Center</h3>
            <p className="text-slate-500 max-w-md">Temukan panduan, tutorial, dan jawaban atas pertanyaan Anda. Gunakan menu <b>Daftar Isi Panduan</b> di atas atau ketikkan kata kunci pada kolom pencarian.</p>
          </div>
        )}
      
      {/* Global & Prose Styles */}
      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Beautiful Typography for Article Content */
        .article-content {
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .article-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
        }
        .article-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .article-content p {
          margin-bottom: 1.25rem;
        }
        .article-content a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }
        .article-content a:hover {
          text-decoration: underline;
        }
        .article-content ul, .article-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content li::marker {
          color: #64748b;
          font-weight: 600;
        }
        .article-content img {
          max-width: 100%;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          margin: 2rem 0;
          border: 1px solid #f1f5f9;
        }
        .article-content blockquote {
          border-left: 4px solid #4f46e5;
          background: #eef2ff;
          padding: 1rem 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 1.5rem 0;
          color: #1e293b;
          font-style: italic;
        }
        .article-content code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          color: #ef4444;
          font-family: monospace;
        }

        @media print {
          .hide-on-print { display: none !important; }
          body { background: white !important; }
          .article-content { color: black !important; }
        }

        @media (max-width: 768px) {
          .article-content { font-size: 0.875rem; line-height: 1.6; }
          .article-content h2 { font-size: 1.125rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
          .article-content h3 { font-size: 1rem; margin-top: 1.25rem; }
          .article-content p { margin-bottom: 1rem; }
          .article-content img { margin: 1.5rem 0; }
          .article-content blockquote { padding: 0.75rem 1rem; margin: 1rem 0; }
        }
      `}</style>
    </div>
  );
}
