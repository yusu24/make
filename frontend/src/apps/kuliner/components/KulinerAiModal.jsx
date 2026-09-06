import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Bot, 
  ChefHat, 
  TrendingUp, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Calculator,
  UtensilsCrossed,
  DollarSign,
  Flame
} from 'lucide-react';

export default function KulinerAiModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'hpp' | 'waste'
  
  // Chat Advisor State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo Chef / Owner! 👨‍🍳 Saya Bizora AI Culinary Advisor. Ada yang bisa saya bantu terkait resep menu baru, strategi menurunkan food cost, atau analisa HPP restoran Anda?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // HPP Calculator State
  const [hppForm, setHppForm] = useState({
    menuName: '',
    rawCost: '',
    packagingCost: '',
    desiredMargin: 65, // %
  });
  const [hppResult, setHppResult] = useState(null);

  // Waste Reduction State
  const [wasteIngredient, setWasteIngredient] = useState('');
  const [wasteResult, setWasteResult] = useState(null);

  const handleSendPrompt = (customText) => {
    const text = customText || inputPrompt;
    if (!text.trim()) return;

    setInputPrompt('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();
      if (q.includes('laris') || q.includes('menu') || q.includes('resep')) {
        reply = `🍽️ **Rekomendasi Menu Kekinian & Margin Tinggi:**\n\n1. **Ayam Geprek Sambal Matah Keju Meleleh**: Estimasi HPP Rp 11.500, Rekomendasi Jual Rp 24.000 (Margin 52%).\n2. **Kopi Susu Gula Aren Pandan**: HPP Rp 4.200, Jual Rp 18.000 (Margin 76%).\n3. **Dimsum Mentai Mozzarella**: HPP Rp 8.000 (4 pcs), Jual Rp 22.000 (Margin 63%).\n\n💡 *Tips:* Gunakan promo combo paket *"Makan Kenyang + Minum Hemat"* untuk meningkatkan rata-rata transaksi meja (Average Check Size).`;
      } else if (q.includes('hpp') || q.includes('cost') || q.includes('biaya')) {
        reply = `📊 **Panduan Mengontrol Food Cost Restoran:**\n- Target Food Cost ideal bisnis kuliner berkisar antara **28% - 35%** dari harga jual.\n- Jika HPP melebihi 40%, pertimbangkan mencari supplier bahan utama alternatif atau lakukan penyesuaian porsi garnish.\n- Timbang bahan baku menggunakan timbangan digital presisi sebelum masuk ke proses masak.`;
      } else {
        reply = `💡 **Saran Efisiensi Operasional Dapur:**\n- Terapkan sistem FIFO (*First In, First Out*) pada chiller & freezer bahan baku.\n- Buat Batch Prep pagi hari untuk bumbu dasar (bumbu putih, merah, kuning) guna memangkas waktu saji pesanan di bawah 12 menit.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsLoading(false);
    }, 800);
  };

  const calculateHpp = (e) => {
    e.preventDefault();
    const raw = Number(hppForm.rawCost) || 0;
    const pack = Number(hppForm.packagingCost) || 0;
    const totalHpp = raw + pack;
    const marginRatio = (100 - Number(hppForm.desiredMargin)) / 100;
    const suggestedPrice = marginRatio > 0 ? Math.round(totalHpp / marginRatio / 1000) * 1000 : totalHpp * 2;
    const grossProfit = suggestedPrice - totalHpp;
    const actualMarginPct = suggestedPrice > 0 ? ((grossProfit / suggestedPrice) * 100).toFixed(1) : 0;

    setHppResult({
      totalHpp,
      suggestedPrice,
      grossProfit,
      actualMarginPct,
      foodCostPct: (100 - Number(actualMarginPct)).toFixed(1)
    });
  };

  const handleAnalyzeWaste = (e) => {
    e.preventDefault();
    if (!wasteIngredient.trim()) return;

    setTimeout(() => {
      setWasteResult({
        ingredient: wasteIngredient,
        ideas: [
          `Kreasikan menjadi **Menu Spesial Hari Ini (Chef's Daily Special)** dengan diskon 15% untuk menghabiskan stok dalam 24 jam.`,
          `Olah menjadi bahan sekunder (misal: kaldu sup kental, saus dipping homemade, atau abon topping crispy).`,
          `Jadikan paket bundling sarapan / lunch hemat agar perputaran bahan melonjak cepat.`
        ]
      });
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Bizora AI Chef & Menu Intelligence</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Pro Feature
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">Optimasi Resep HPP, Ide Menu Laris & Pencegahan Bahan Basi</p>
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
              activeTab === 'advisor' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Asisten Chef & Konsultasi</span>
          </button>

          <button
            onClick={() => setActiveTab('hpp')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'hpp' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator HPP & Margin</span>
          </button>

          <button
            onClick={() => setActiveTab('waste')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'waste' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Solusi Anti-Basi (Zero Waste)</span>
          </button>
        </div>

        {/* Tab 1: AI Chat Advisor */}
        {activeTab === 'advisor' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Quick Prompts */}
            <div className="p-3 bg-orange-50/50 border-b border-orange-100 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold">
              <span className="text-orange-800 shrink-0">💡 Saran Cepat:</span>
              <button
                onClick={() => handleSendPrompt('Berikan 3 ide menu kekinian yang margin untungnya di atas 60%')}
                className="px-2.5 py-1 bg-white border border-orange-200 text-orange-900 rounded-lg shrink-0 hover:bg-orange-100/50 cursor-pointer"
              >
                🔥 Ide Menu Untung 60%+
              </button>
              <button
                onClick={() => handleSendPrompt('Bagaimana cara menekan food cost restoran agar di bawah 30%?')}
                className="px-2.5 py-1 bg-white border border-orange-200 text-orange-900 rounded-lg shrink-0 hover:bg-orange-100/50 cursor-pointer"
              >
                📉 Cara Tekan Food Cost
              </button>
            </div>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={'flex gap-2.5 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ChefHat className="w-4 h-4" />
                    </div>
                  )}
                  <div className={'p-3.5 rounded-2xl max-w-lg leading-relaxed whitespace-pre-line ' + (
                    m.role === 'user' 
                      ? 'bg-orange-600 text-white rounded-br-none shadow-xs' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-orange-600 font-semibold p-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Chef AI sedang meracik analisis terbaik...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Tanyakan resep, bahan pengganti, atau strategi promo menu..."
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-600/20"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={isLoading || !inputPrompt.trim()}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: HPP Calculator */}
        {activeTab === 'hpp' && (
          <div className="p-6 space-y-5 overflow-y-auto text-xs">
            <form onSubmit={calculateHpp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Menu Hidangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nasi Goreng Spesial Wagyu"
                  value={hppForm.menuName}
                  onChange={e => setHppForm({ ...hppForm, menuName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Margin Kotor (%)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="90"
                  placeholder="65"
                  value={hppForm.desiredMargin}
                  onChange={e => setHppForm({ ...hppForm, desiredMargin: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biaya Bahan Baku (Raw Cost Rp)</label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="12000"
                  value={hppForm.rawCost}
                  onChange={e => setHppForm({ ...hppForm, rawCost: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kemasan / Box / Cup (Rp)</label>
                <input
                  type="number"
                  placeholder="1500"
                  value={hppForm.packagingCost}
                  onChange={e => setHppForm({ ...hppForm, packagingCost: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-600/20"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  ⚡ Hitung Rekomendasi Harga Jual & Profit AI
                </button>
              </div>
            </form>

            {hppResult && (
              <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-orange-200 pb-2">
                  <span className="font-bold text-orange-950 text-sm">Analisis Harga Jual {hppForm.menuName}</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-orange-200 text-orange-900 font-extrabold text-xs">
                    Food Cost: {hppResult.foodCostPct}% (Ideal)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total HPP</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">Rp {hppResult.totalHpp.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                    <p className="text-[10px] text-orange-700 font-semibold uppercase">Harga Jual Ideal</p>
                    <p className="text-base font-black text-orange-700 mt-0.5">Rp {hppResult.suggestedPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100">
                    <p className="text-[10px] text-emerald-700 font-semibold uppercase">Laba Kotor / Porsi</p>
                    <p className="text-sm font-extrabold text-emerald-600 mt-0.5">+Rp {hppResult.grossProfit.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Zero Waste */}
        {activeTab === 'waste' && (
          <div className="p-6 space-y-4 overflow-y-auto text-xs">
            <form onSubmit={handleAnalyzeWaste} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bahan Baku yang Berlebih / Menjelang Basi:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Roti Tawar 10 pack, Susu Fresh Milk 5 Liter, Daging Ayam Fillet 8 kg..."
                    value={wasteIngredient}
                    onChange={e => setWasteIngredient(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-600/20"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 text-xs"
                  >
                    Dapatkan Ide Menu
                  </button>
                </div>
              </div>
            </form>

            {wasteResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strategi Penyelamatan Bahan: {wasteResult.ingredient}</span>
                </div>
                <div className="space-y-2 pl-6 text-emerald-900">
                  {wasteResult.ideas.map((idea, i) => (
                    <div key={i} className="list-disc leading-relaxed">• {idea}</div>
                  ))}
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
