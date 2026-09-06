import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Bot, 
  Store, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  ShoppingCart, 
  Tags, 
  Layers
} from 'lucide-react';

export default function RetailAiModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'restock' | 'deadstock'
  
  // Chat Advisor State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo Juragan Retail! 🏬 Saya Bizora AI Retail Optimizer. Ada yang bisa saya bantu terkait prediksi stok barang habis, rekomendasi kuantitas PO ke supplier, atau strategi bundling cuci gudang?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Restock Calculator State
  const [restockForm, setRestockForm] = useState({
    productName: '',
    currentStock: '',
    dailySales: '',
    leadTimeDays: 3, // hari pengiriman supplier
    safetyDays: 2 // buffer pengaman
  });
  const [restockResult, setRestockResult] = useState(null);

  const handleSendPrompt = (customText) => {
    const text = customText || inputPrompt;
    if (!text.trim()) return;

    setInputPrompt('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();
      if (q.includes('habis') || q.includes('stok') || q.includes('po') || q.includes('supplier')) {
        reply = `📦 **Rekomendasi Restock & Manajemen Supplier:**\n\n1. **Produk Fast-Moving (Misal: Minyak Goreng, Beras, Sabun Cuci)**:\n   - Tetapkan Safety Stock minimal 3 hari penjualan.\n   - Buat Purchase Order (PO) otomatis begitu stok mencapai Reorder Point (ROP).\n2. **Kategori Grosir**:\n   - Minta diskon tambahan 2-4% ke supplier dengan memesan dalam satuan karton / dus utuh.\n3. **Cek Buffer Waktu**: Selalu tambahkan 2 hari ekstra pengiriman saat mendekati akhir pekan atau tanggal merah.`;
      } else if (q.includes('mati') || q.includes('macet') || q.includes('dead') || q.includes('diskon')) {
        reply = `🏷️ **Strategi Mengatasi Dead Stock (Barang Mengendap):**\n- **Metode Cross-Bundling**: Gabungkan produk *slow-moving* dengan produk *best-seller* seharga paket hemat (misal: Beli Kopi Premium + Diskon 50% Gula Sachet).\n- **Flash Sale Akhir Bulan**: Pasang diskon 15-20% untuk membebaskan modal kerja daripada mengendap menjadi beban rak.\n- **Display Kasir**: Letakkan barang ukuran kecil di dekat meja kasir (*Impulse Buy section*).`;
      } else {
        reply = `💡 **Tips Menaikkan Rata-Rata Belanja (Basket Size):**\n- Terapkan promo minimal belanja: *"Belanja min. Rp 100.000 dapat tebus murah produk tertentu seharga Rp 5.000"*.\n- Tampilkan label harga grosir bertingkat (Beli 1 @Rp 10.000, Beli 3 @Rp 9.000) untuk mendorong pembelian jumlah banyak.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsLoading(false);
    }, 800);
  };

  const calculateRestock = (e) => {
    e.preventDefault();
    const current = Number(restockForm.currentStock) || 0;
    const daily = Number(restockForm.dailySales) || 0;
    const lead = Number(restockForm.leadTimeDays) || 0;
    const safety = Number(restockForm.safetyDays) || 0;

    const daysRemaining = daily > 0 ? (current / daily).toFixed(1) : '99+';
    const safetyStock = daily * safety;
    const reorderPoint = (daily * lead) + safetyStock;
    const recommendedOrder = Math.max(0, (daily * 14) + safetyStock - current); // Target stok 2 minggu

    setRestockResult({
      daysRemaining,
      safetyStock,
      reorderPoint: Math.ceil(reorderPoint),
      recommendedOrder: Math.ceil(recommendedOrder),
      urgency: Number(daysRemaining) <= lead ? 'Darurat (Segera Pesan)' : Number(daysRemaining) <= (lead + safety) ? 'Waspada' : 'Aman'
    });
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Bizora AI Retail & Stock Predictor</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Pro Feature
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">Prediksi Habis Stok, Rekomendasi Restock PO & Strategi Promo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('advisor')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'advisor' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Asisten Retail & Strategi Penjualan</span>
          </button>

          <button
            onClick={() => setActiveTab('restock')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'restock' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Prediksi Habis Stok & Kalkulator PO</span>
          </button>
        </div>

        {/* Tab 1: AI Chat / Advisor */}
        {activeTab === 'advisor' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Quick Prompts */}
            <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold">
              <span className="text-blue-800 shrink-0">💡 Saran Cepat:</span>
              <button
                onClick={() => handleSendPrompt('Bagaimana cara mengatasi barang menumpuk dan tidak laku di gudang?')}
                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded-lg shrink-0 hover:bg-blue-100/50 cursor-pointer"
              >
                🏷️ Solusi Barang Macet (Dead Stock)
              </button>
              <button
                onClick={() => handleSendPrompt('Tips menentukan kuantitas restock barang fast moving ke supplier')}
                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-900 rounded-lg shrink-0 hover:bg-blue-100/50 cursor-pointer"
              >
                📦 Rumus Reorder Point (ROP)
              </button>
            </div>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={'flex gap-2.5 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="w-4 h-4" />
                    </div>
                  )}
                  <div className={'p-3.5 rounded-2xl max-w-lg leading-relaxed whitespace-pre-line ' + (
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-xs' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-blue-600 font-semibold p-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Retail AI sedang menganalisis perputaran inventori...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Tanyakan analisis penjualan produk, strategi diskon, atau restock..."
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={isLoading || !inputPrompt.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Restock Calculator */}
        {activeTab === 'restock' && (
          <div className="p-6 space-y-5 overflow-y-auto text-xs">
            <form onSubmit={calculateRestock} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk / Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Minyak Goreng 2L"
                  value={restockForm.productName}
                  onChange={e => setRestockForm({ ...restockForm, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stok Fisik Saat Ini (Pcs / Unit)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="15"
                  value={restockForm.currentStock}
                  onChange={e => setRestockForm({ ...restockForm, currentStock: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rata-rata Terjual per Hari (Pcs)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="5"
                  value={restockForm.dailySales}
                  onChange={e => setRestockForm({ ...restockForm, dailySales: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lama Pengiriman Supplier (Hari)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="3"
                  value={restockForm.leadTimeDays}
                  onChange={e => setRestockForm({ ...restockForm, leadTimeDays: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  ⚡ Hitung Prediksi Kehabisan & Rekomendasi Order AI
                </button>
              </div>
            </form>

            {restockResult && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                  <span className="font-bold text-blue-950 text-sm">Hasil Analisis {restockForm.productName}</span>
                  <span className={'px-2.5 py-0.5 rounded-lg text-xs font-extrabold ' + (
                    restockResult.urgency.includes('Darurat') ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-blue-200 text-blue-900'
                  )}>
                    Status: {restockResult.urgency}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Stok Bertahan</p>
                    <p className="text-base font-black text-slate-900 mt-0.5">{restockResult.daysRemaining} Hari</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-700 font-semibold uppercase">Titik Reorder (ROP)</p>
                    <p className="text-base font-black text-blue-700 mt-0.5">{restockResult.reorderPoint} Unit</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100">
                    <p className="text-[10px] text-emerald-700 font-semibold uppercase">Saran Pesan ke Supplier</p>
                    <p className="text-base font-black text-emerald-600 mt-0.5">+{restockResult.recommendedOrder} Unit</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
