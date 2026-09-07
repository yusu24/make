import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, Menu, Sparkles } from 'lucide-react';
import OfflineStatusBadge from './OfflineStatusBadge';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

function PosClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs font-normal text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 select-none">
      <Clock size={13} className="text-indigo-600" />
      <span>{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  );
}

export default function ProductGrid({
  products,
  categories,
  cart,
  cashierName,
  onAddItem,
  onMenuToggle,
  offlineBadgeProps,
  searchRef
}) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [posAiEnabled, setPosAiEnabled] = useState(() => {
    const saved = localStorage.getItem('bizora_pos_ai_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    const handleStateChange = (e) => {
      if (e.detail?.enabled !== undefined) {
        setPosAiEnabled(e.detail.enabled);
      }
    };
    window.addEventListener('bizora:pos-ai-state-changed', handleStateChange);
    return () => window.removeEventListener('bizora:pos-ai-state-changed', handleStateChange);
  }, []);

  const handleToggleAi = () => {
    const next = !posAiEnabled;
    setPosAiEnabled(next);
    localStorage.setItem('bizora_pos_ai_enabled', String(next));
    window.dispatchEvent(new CustomEvent('bizora:toggle-pos-ai', { detail: { enabled: next } }));
  };

  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent('bizora:open-retail-ai'));
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchCategory = activeCategory === null ? true : p.category_id === activeCategory;
    const q = debouncedSearch.trim().toLowerCase();
    const matchSearch = q === '' ? true :
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  }), [products, activeCategory, debouncedSearch]);

  const getCartQty = (productId) => cart.find((item) => item.product_id === productId)?.qty || 0;
  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="pos-main-area">
      {/* Top bar: search, clock, cashier */}
      <div className="pos-top-bar">
        {onMenuToggle && (
          <button
            type="button"
            className="pos-menu-toggle-btn"
            onClick={onMenuToggle}
            title="Menu Utama"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="pos-search-box">
          <Search size={16} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Cari produk (nama/SKU/barcode)... [F1]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const q = search.trim().toLowerCase();
                if (!q) return;

                let matchedProduct = null;
                let matchedUnit = null;

                for (let p of products) {
                  if (p.sku && p.sku.toLowerCase() === q) {
                    matchedProduct = p;
                    break;
                  }
                  if (p.multi_units && p.multi_units.length > 0) {
                    for (let mu of p.multi_units) {
                      if (mu.barcode && mu.barcode.toLowerCase() === q) {
                        matchedProduct = p;
                        matchedUnit = mu;
                        break;
                      }
                    }
                  }
                  if (matchedProduct) break;
                }

                if (matchedProduct) {
                  onAddItem(matchedProduct, matchedUnit);
                  setSearch('');
                }
              }
            }}
            aria-label="Cari produk"
          />
        </div>



        {/* AI Advisor Button & POS Toggle */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0 select-none">
          <button
            type="button"
            onClick={handleOpenAi}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            title="Buka Retail AI Advisor"
          >
            <Sparkles size={13} className="text-indigo-600 animate-pulse" />
            <span className="hidden md:inline">AI Advisor</span>
          </button>
          <button
            type="button"
            onClick={handleToggleAi}
            className={`px-1.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
              posAiEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
            title={posAiEnabled ? 'Bubble AI aktif di kasir (Klik untuk sembunyikan)' : 'Bubble AI nonaktif di kasir (Klik untuk tampilkan)'}
          >
            {posAiEnabled ? 'Bubble ON' : 'Bubble OFF'}
          </button>
        </div>

        <PosClock />

        {/* Offline / Online Status Badge */}
        {offlineBadgeProps && (
          <OfflineStatusBadge {...offlineBadgeProps} />
        )}

        <div className="pos-cashier-info select-none">
          <div className="pos-avatar">{(cashierName || 'U').substring(0, 2).toUpperCase()}</div>
          <span className="hidden sm:inline">{(cashierName || 'User').split(' ')[0]}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="pos-cat-tabs select-none" role="tablist">
        <button onClick={() => setActiveCategory(null)} className={`pos-cat-tab ${activeCategory === null ? 'active' : ''}`}>
          Semua
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`pos-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="pos-products-grid select-none">
        {filteredProducts.length > 0 ? filteredProducts.map((p) => {
          const inCartQty = getCartQty(p.id);
          const maxStock = Number(p.stock) || 0;
          const isOutOfStock = maxStock <= 0;
          const limitReached = inCartQty >= maxStock;

          return (
            <div
              key={p.id}
              onClick={() => { if (!isOutOfStock && !limitReached) onAddItem(p); }}
              className={`pos-prod-card ${isOutOfStock || limitReached ? 'out' : ''}`}
              role="listitem"
              tabIndex={!isOutOfStock && !limitReached ? 0 : -1}
              aria-label={`${p.name} ${fmtRp(p.price_sell)}`}
            >
              <div className="pos-prod-icon">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-slate-700 text-sm">{p.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="pos-prod-name" title={p.name}>{p.name}</div>
              <div className="pos-prod-price">{fmtRp(p.price_sell)}</div>
              <div className="pos-prod-stock">{maxStock > 0 ? `Stok: ${Math.round(maxStock)}` : 'Habis'}</div>

              {isOutOfStock && <span className="pos-badge-out">Habis</span>}

              {inCartQty > 0 && (
                <span className="absolute top-2 right-2 bg-indigo-600 text-white font-normal text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  {inCartQty}
                </span>
              )}
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '40px 0' }}>
            Produk tidak ditemukan
          </div>
        )}
      </div>

      {/* Keyboard Shortcut Helper Bar */}
      <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-slate-300 text-[11px] border-t border-slate-800 shrink-0 select-none overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mr-1 flex items-center gap-1">
          ⌨️ Shortcuts:
        </span>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
          <kbd className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[10px] font-mono font-bold shadow-xs">F1</kbd>
          <span className="text-slate-300">Cari Produk</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
          <kbd className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-mono font-bold shadow-xs">F4</kbd>
          <span className="text-indigo-200 font-semibold">Bayar / Checkout</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
          <kbd className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[10px] font-mono font-bold shadow-xs">F8</kbd>
          <span className="text-slate-300">Tahan Transaksi</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
          <kbd className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[10px] font-mono font-bold shadow-xs">F9</kbd>
          <span className="text-slate-300">Daftar Tertahan</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
          <kbd className="px-1.5 py-0.5 bg-slate-700 text-white rounded text-[10px] font-mono font-bold shadow-xs">Esc</kbd>
          <span className="text-slate-300">Batal / Tutup</span>
        </div>
      </div>

    </div>
  );
}
