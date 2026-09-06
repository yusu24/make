import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Bot, 
  Fish, 
  Sprout, 
  Activity, 
  Calculator, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Scale
} from 'lucide-react';

export default function BudidayaAiModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('diagnose'); // 'diagnose' | 'feeding' | 'harvest'
  
  // Chat / Diagnostic State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo Peternak & Petani Hebat! 🐟🌾 Saya Bizora AI Bio-Agronomist. Pilih gejala atau ceritakan kondisi kolam/lahan Anda untuk mendapatkan diagnosa penyakit, rekomendasi obat, dan pencegahan kematian massal.'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Feeding Calculator State
  const [feedingForm, setFeedingForm] = useState({
    population: 10000,
    abw: 25, // gram per ekor
    feedingRate: 3.5, // % biomassa per hari
    targetFcr: 1.2
  });
  const [feedingResult, setFeedingResult] = useState(null);

  // Harvest Prediction State
  const [harvestForm, setHarvestForm] = useState({
    targetSize: 100, // gram per ekor
    currentAbw: 30, // gram
    dailyGrowthRate: 1.5 // gram/hari
  });
  const [harvestResult, setHarvestResult] = useState(null);

  const handleSendPrompt = (customText) => {
    const text = customText || inputPrompt;
    if (!text.trim()) return;

    setInputPrompt('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();
      if (q.includes('putih') || q.includes('jamur') || q.includes('gantung')) {
        reply = `🩺 **Diagnosa: Indikasi White Spot Disease (Ichthyophthirius multifiliis) / Aeromonas**\n\n**Tindakan Darurat:**\n1. Naikkan aerasi kolam ke level maksimal (DO > 5 mg/L).\n2. Puasakan ikan selama 24 jam untuk mengurangi beban metabolisme air.\n3. Tebar Garam Ikan non-yodium dosis 1-2 kg / m³ air.\n4. Campurkan Probiotik Bacillus & Vitamin C 5g/kg pakan selama 5 hari berturut-turut.`;
      } else if (q.includes('fcr') || q.includes('pakan') || q.includes('boros')) {
        reply = `📈 **Panduan Optimalisasi FCR (Feed Conversion Ratio):**\n- Target FCR ideal Ikan Nila/Lele: **1.0 – 1.25**; Udang Vaname: **1.1 – 1.3**.\n- Berikan pakan dengan metode *ad libitum terkontrol* (berhenti saat respon makan berkurang 20%).\n- Jangan beri makan saat suhu air ekstrem (< 25°C atau > 33°C) atau saat cuaca hujan lebat.`;
      } else {
        reply = `💡 **Rekomendasi Manajemen Kualitas Air:**\n- Cek pH pagi (target: 7.2 - 7.8) dan sore (target: 7.8 - 8.4).\n- Jika amonia meningkat (> 0.5 ppm), lakukan siphon dasar kolam dan buang 15% air dasar, lalu tambahkan molase 10 ml/m³ untuk menumbuhkan bakteri heterotrof.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsLoading(false);
    }, 800);
  };

  const calculateFeeding = (e) => {
    e.preventDefault();
    const pop = Number(feedingForm.population) || 0;
    const abw = Number(feedingForm.abw) || 0;
    const rate = Number(feedingForm.feedingRate) || 0;
    
    // Biomassa total dalam kg
    const totalBiomassKg = (pop * abw) / 1000;
    // Pakan per hari dalam kg
    const dailyFeedKg = (totalBiomassKg * (rate / 100));
    // Pakan per feeding (3x sehari)
    const perFeedingKg = dailyFeedKg / 3;

    setFeedingResult({
      totalBiomassKg: totalBiomassKg.toFixed(1),
      dailyFeedKg: dailyFeedKg.toFixed(1),
      perFeedingKg: perFeedingKg.toFixed(2)
    });
  };

  const calculateHarvest = (e) => {
    e.preventDefault();
    const current = Number(harvestForm.currentAbw) || 0;
    const target = Number(harvestForm.targetSize) || 0;
    const growth = Number(harvestForm.dailyGrowthRate) || 0.1;

    const diff = Math.max(0, target - current);
    const daysNeeded = Math.ceil(diff / growth);
    const harvestDate = new Date(Date.now() + daysNeeded * 86400000);

    setHarvestResult({
      daysNeeded,
      estimatedDate: harvestDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Fish className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Bizora AI Bio-Diagnostic & Feeding</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Pro Feature
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">Diagnosa Penyakit Kolam, Hitung Pakan Otomatis & Estimasi Panen</p>
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
            onClick={() => setActiveTab('diagnose')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'diagnose' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Diagnosa Kesehatan & Air</span>
          </button>

          <button
            onClick={() => setActiveTab('feeding')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'feeding' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator Smart Feeding (FCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('harvest')}
            className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ' + (
              activeTab === 'harvest' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Prediksi Panen & Tonase</span>
          </button>
        </div>

        {/* Tab 1: AI Chat / Diagnostic */}
        {activeTab === 'diagnose' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Quick Prompts */}
            <div className="p-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold">
              <span className="text-emerald-800 shrink-0">💡 Gejala Umum:</span>
              <button
                onClick={() => handleSendPrompt('Ikan menggantung di permukaan dan ada bintik putih')}
                className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg shrink-0 hover:bg-emerald-100/50 cursor-pointer"
              >
                🐟 Ikan Menggantung & Bintik Putih
              </button>
              <button
                onClick={() => handleSendPrompt('Bagaimana cara menekan FCR pakan agar hemat 20%?')}
                className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg shrink-0 hover:bg-emerald-100/50 cursor-pointer"
              >
                📉 Tips Hemat FCR Pakan
              </button>
            </div>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={'flex gap-2.5 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Fish className="w-4 h-4" />
                    </div>
                  )}
                  <div className={'p-3.5 rounded-2xl max-w-lg leading-relaxed whitespace-pre-line ' + (
                    m.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-xs' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-emerald-600 font-semibold p-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Bio-AI sedang menganalisis kondisi biologis...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Deskripsikan gejala ikan, warna air, atau nafsu makan..."
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={isLoading || !inputPrompt.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Feeding Calculator */}
        {activeTab === 'feeding' && (
          <div className="p-6 space-y-5 overflow-y-auto text-xs">
            <form onSubmit={calculateFeeding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Populasi Bibit Aktif (Ekor)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={feedingForm.population}
                  onChange={e => setFeedingForm({ ...feedingForm, population: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rata-rata Bobot / ABW (Gram/Ekor)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="1"
                  value={feedingForm.abw}
                  onChange={e => setFeedingForm({ ...feedingForm, abw: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Feeding Rate (% dari Biomassa)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="1"
                  max="10"
                  value={feedingForm.feedingRate}
                  onChange={e => setFeedingForm({ ...feedingForm, feedingRate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target FCR Siklus Ini</label>
                <input
                  type="number"
                  step="0.05"
                  value={feedingForm.targetFcr}
                  onChange={e => setFeedingForm({ ...feedingForm, targetFcr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  ⚡ Hitung Takaran Pakan Harian Presisi AI
                </button>
              </div>
            </form>

            {feedingResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-950 text-sm">Rekomendasi Pakan Harian</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-200 text-emerald-900 font-extrabold text-xs">
                    Biomassa: {feedingResult.totalBiomassKg} kg
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Pakan / Hari</p>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">{feedingResult.dailyFeedKg} kg</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Porsi per Feeding (3x Sehari)</p>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">{feedingResult.perFeedingKg} kg</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Harvest Prediction */}
        {activeTab === 'harvest' && (
          <div className="p-6 space-y-5 overflow-y-auto text-xs">
            <form onSubmit={calculateHarvest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bobot Saat Ini (Gram/Ekor)</label>
                <input
                  type="number"
                  required
                  value={harvestForm.currentAbw}
                  onChange={e => setHarvestForm({ ...harvestForm, currentAbw: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Panen (Gram/Ekor)</label>
                <input
                  type="number"
                  required
                  value={harvestForm.targetSize}
                  onChange={e => setHarvestForm({ ...harvestForm, targetSize: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Laju Pertumbuhan Rata-rata (Gram/Hari)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={harvestForm.dailyGrowthRate}
                  onChange={e => setHarvestForm({ ...harvestForm, dailyGrowthRate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  ⚡ Prediksi Tanggal Panen Ideal
                </button>
              </div>
            </form>

            {harvestResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                <p className="text-xs text-emerald-800 font-semibold">Estimasi Hari Menuju Panen</p>
                <h4 className="text-2xl font-black text-emerald-950">{harvestResult.daysNeeded} Hari Lagi</h4>
                <p className="text-xs text-emerald-700 font-bold">Perkiraan Tanggal Panen: {harvestResult.estimatedDate}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
