import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, Menu } from 'lucide-react';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function ProductGrid({ products, categories, cart, cashierName, onAddItem, onMenuToggle }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
            type="text"
            placeholder="Cari produk (nama/SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari produk"
          />
        </div>



        <div className="flex items-center gap-1.5 text-xs font-normal text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 select-none">
          <Clock size={13} className="text-indigo-600" />
          <span>{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

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
                <span className="font-extrabold text-slate-700 text-sm">{p.name.charAt(0).toUpperCase()}</span>
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

    </div>
  );
}
