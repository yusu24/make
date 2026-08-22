import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { Search, Printer, Plus, Trash2, X } from 'lucide-react';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import Modal from '../../../components/Modal';
import '../retail.css';

const formatRp = (v) => `Rp ${Math.round(Number(v || 0)).toLocaleString('id-ID')}`;

// The printable component
// Uses standard CSS to render a grid of labels. Typically A4 has 3 columns, 7 rows per page, but we'll use Flex/Grid
const LabelsPrintable = React.forwardRef(({ items }, ref) => {
  return (
    <div ref={ref} className="print-container" style={{ padding: '20px', backgroundColor: '#fff', width: '210mm', minHeight: '297mm' }}>
      <style>
        {`
          @media print {
            @page { margin: 0; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-container { width: 100% !important; padding: 10mm !important; }
            .label-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 4mm !important; }
            .label-item { break-inside: avoid; border: 1px dashed #64748b; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; box-sizing: border-box; }
          }
          .label-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
          .label-item { border: 1px dashed #64748b; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: white; }
          .label-name { font-size: 12px; font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.2; }
          .label-price { font-size: 16px; font-weight: 700; margin-top: 4px; }
        `}
      </style>
      <div className="label-grid">
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="label-item">
            <div className="label-name">{item.name}</div>
            <Barcode value={item.sku || `PROD-${item.id}`} width={1.5} height={40} fontSize={12} margin={5} />
            <div className="label-price">{formatRp(item.price_sell)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function PrintLabels() {
  const toast = useToast();
  const printRef = useRef();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // { product: {}, qty: 1 }

  // Generate printable array (e.g. if qty=3, add item 3 times)
  const printableItems = React.useMemo(() => {
    const arr = [];
    selectedItems.forEach(i => {
      for (let j = 0; j < i.qty; j++) {
        arr.push(i.product);
      }
    });
    return arr;
  }, [selectedItems]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Barcode-Labels',
  });

  const searchProducts = useCallback(async (query) => {
    setIsSearching(true);
    try {
      const params = query ? { search: query, limit: 10 } : { limit: 15 };
      const res = await api.get('/retail/products', { params });
      setSearchResults(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (search !== '') setIsSearching(true);
    const timer = setTimeout(() => {
      searchProducts(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchProducts]);

  const addProduct = (product) => {
    if (!product.sku) {
      toast.error('Produk ini tidak memiliki SKU/Barcode!');
      // We can still allow it, it will just use PROD-id, but standard is SKU. Let's let them proceed anyway for now.
    }
    
    setSelectedItems(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
    setSearch('');
    setIsFocused(false);
  };

  const updateQty = (productId, newQty) => {
    if (newQty < 1) newQty = 1;
    setSelectedItems(prev => prev.map(i => i.product.id === productId ? { ...i, qty: newQty } : i));
  };

  const removeItem = (productId) => {
    setSelectedItems(prev => prev.filter(i => i.product.id !== productId));
  };

  return (
    <div className="retail-page-classic pb-20">
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary shadow-lg" onClick={handlePrint} disabled={printableItems.length === 0}>
          <Printer size={18} className="mr-2" />
          Cetak {printableItems.length} Label
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Selection */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card p-5 !overflow-visible">
            <h3 className="font-bold mb-4">Cari Produk</h3>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Ketik nama produk atau SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => { setIsFocused(true); searchProducts(search); }}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              />
              {search && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => { setSearch(''); setIsFocused(true); }}>
                  <X size={16} />
                </button>
              )}
              {(isFocused || search !== '') && (
                <div className="absolute left-0 right-0 top-full mt-2 border border-slate-200 rounded-lg max-h-[300px] overflow-y-auto bg-white shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-slate-400 text-sm">Mencari...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">Tidak ditemukan</div>
                  ) : (
                    searchResults.map(p => (
                      <div key={p.id} className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer flex justify-between items-center" onMouseDown={(e) => { e.preventDefault(); addProduct(p); }}>
                        <div>
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.sku || 'Belum ada SKU'} • {formatRp(p.price_sell)}</div>
                        </div>
                        <Plus size={16} className="text-primary-600" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Daftar Cetak</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{selectedItems.length} Produk</span>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-sm">
                Belum ada produk yang dipilih.<br/>Cari produk di atas untuk ditambahkan ke daftar.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedItems.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="font-medium text-sm truncate">{item.product.name}</div>
                      <div className="text-xs text-slate-500">{item.product.sku || 'Tanpa SKU'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        className="form-input w-16 px-2 py-1 text-center h-8"
                        value={item.qty}
                        onChange={(e) => updateQty(item.product.id, parseInt(e.target.value) || 1)}
                      />
                      <button className="p-1 text-red-500 hover:bg-red-50 rounded" onClick={() => removeItem(item.product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Preview */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden" style={{ minHeight: '500px', background: '#f8fafc' }}>
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-700">Preview Cetak (A4)</span>
              <span className="text-xs text-slate-500">{printableItems.length} label</span>
            </div>
            
            <div className="p-6 overflow-auto" style={{ maxHeight: '70vh' }}>
              {printableItems.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  Preview label akan muncul di sini
                </div>
              ) : (
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                  <div className="shadow-lg mx-auto bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
                    <LabelsPrintable ref={printRef} items={printableItems} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
