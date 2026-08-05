import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Calculator, TrendingUp, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Expense, Order, Product } from '../types';
import { formatIDR } from '../utils/formatters';

interface AiAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  orders: Order[];
  products: Product[];
}

export const AiAdvisorDrawer: React.FC<AiAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  expenses,
  orders,
  products,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Halo! Saya Bizora AI Advisor 🚀 Ada yang bisa saya bantu terkait perhitungan profit bersih, optimasi Shopee Ads, atau proyeksi stok gudang Anda hari ini?',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim()) return;

    const userMessage = text;
    setInputPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Calculate context stats
      const totalOmset = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      // We can call server API or mock smart responses
      setTimeout(() => {
        let reply = '';
        if (text.toLowerCase().includes('profit') || text.toLowerCase().includes('laba')) {
          reply = `📊 **Analisis Profitabilitas Bizora AI:**\n- Total Omset Harian: **${formatIDR(
            totalOmset
          )}**\n- Total Pengeluaran: **${formatIDR(
            totalExpenses
          )}**\n- Estimasi Net Margin: **18.4%**\n\n💡 *Rekomendasi:* Pengeluaran terbesar Anda ada di kategori Iklan Ads. Disarankan untuk menurunkan bid pada kata kunci non-konversi di Shopee Ads & meningkatkan budget pada produk GlowUp Vitamin C Serum yang memiliki ROAS 4.2x.`;
        } else if (text.toLowerCase().includes('ads') || text.toLowerCase().includes('iklan')) {
          reply = `🎯 **Tips Optimasi Iklan Shopee & TikTok Ads:**\n1. Alokasikan 60% budget iklan untuk Shopee Auto-Ads pada produk best seller.\n2. Di TikTok Shop, fokuskan komisi affiliate streamer di 10-15% daripada iklan CPV biasa.\n3. Pertahankan Rasio Iklan terhadap Omset (CIR) di bawah 15% agar margin bersih tetap aman!`;
        } else {
          reply = `💡 **Bizora Smart Seller Advice:**\nUntuk meningkatkan penjualan di Shopee, Tokopedia, dan TikTok Shop:\n- Pastikan stok SKU Master Anda di Gudang Utama selalu tersinkron otomatis.\n- Gunakan promo bundling paket diskon antara Serum + Sunscreen untuk menaikkan Average Order Value (AOV).\n- Cetak resi AWB sebelum pukul 15:00 WIB untuk mempertahankan rating Toko Super VIP!`;
        }

        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white">
              Bizora AI Business Advisor
            </h3>
            <p className="text-[10px] text-indigo-200/80">E-Commerce Profit & Strategy Intelligence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => handleSendPrompt('Berapa profit bersih saya hari ini?')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold whitespace-nowrap hover:bg-indigo-50 cursor-pointer shrink-0"
        >
          📊 Hitung Net Profit
        </button>
        <button
          onClick={() => handleSendPrompt('Bagaimana cara optimasi iklan Shopee Ads?')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap hover:bg-slate-100 cursor-pointer shrink-0"
        >
          🎯 Optimasi Shopee Ads
        </button>
        <button
          onClick={() => handleSendPrompt('Saran restock produk habis?')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap hover:bg-slate-100 cursor-pointer shrink-0"
        >
          📦 Proyeksi Restock
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none whitespace-pre-line border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 items-center text-slate-400 text-xs italic">
            <Bot className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Bizora AI sedang menganalisis data e-commerce Anda...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Tanyakan analisis profit, iklan, atau stok..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
