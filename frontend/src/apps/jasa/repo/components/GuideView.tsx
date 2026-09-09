import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ClipboardList, 
  CreditCard, 
  Wrench, 
  Users, 
  ShieldCheck, 
  Layers, 
  FileText,
  Printer,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Calculator,
  Package,
  Clock,
  AlertTriangle,
  RotateCcw,
  Percent,
  Coins,
  TrendingUp,
  Award,
  Check,
  Smartphone,
  Car,
  Snowflake,
  Shirt,
  Scissors
} from 'lucide-react';
import { useJasa } from '../contexts/JasaContext';
import { useAuth } from '../../../../contexts/AuthContext';

interface GuideViewProps {
  onNavigateTab?: (tab: string) => void;
  onOpenNewSpk?: () => void;
  onOpenAiModal?: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({
  onNavigateTab,
  onOpenNewSpk,
  onOpenAiModal
}) => {
  const { user } = useAuth();
  const isDemoAccount = user?.email?.startsWith('demo-') || user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.role === 'superadmin';
  const { category, terms, openPicker } = useJasa();
  const [activeTab, setActiveTab] = useState<'flow' | 'category' | 'ai' | 'spareparts' | 'commission' | 'warranty' | 'simulator'>('flow');

  // Interactive Simulator State
  const [simJasaFee, setSimJasaFee] = useState<number>(150000);
  const [simPartSale, setSimPartSale] = useState<number>(250000);
  const [simPartCost, setSimPartCost] = useState<number>(160000);
  const [simCommType, setSimCommType] = useState<'percent' | 'flat'>('percent');
  const [simCommRate, setSimCommRate] = useState<number>(35); // 35%
  const [simCommFlat, setSimCommFlat] = useState<number>(50000); // 50rb flat
  const [simOperationalCost, setSimOperationalCost] = useState<number>(15000);

  // Simulator Calculations
  const simTotalBilled = simJasaFee + simPartSale;
  const simPartProfit = simPartSale - simPartCost;
  const simTechCommission = simCommType === 'percent' 
    ? (simJasaFee * (simCommRate / 100))
    : simCommFlat;
  const simTotalDirectCost = simPartCost + simTechCommission + simOperationalCost;
  const simNetProfitWorkshop = simTotalBilled - simTotalDirectCost;
  const simNetMargin = simTotalBilled > 0 ? ((simNetProfitWorkshop / simTotalBilled) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan, SOP & Rumus Keuangan Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Operasional Modul Jasa & Bengkel
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Panduan terstruktur end-to-end untuk bisnis jasa ({terms.categoryName}): mulai dari SOP penerimaan order & SPK, integrasi Diagnosa AI, pemotongan stok sparepart, rumus komisi teknisi, manajemen klaim garansi, hingga simulator bagi hasil.
            </p>
          </div>

          {isDemoAccount && (
            <button
              type="button"
              onClick={openPicker}
              className="px-5 py-3 bg-white text-indigo-700 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ganti Industri ({terms.categoryName})</span>
            </button>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'flow', label: '1. SOP & Alur Kerja SPK', icon: ClipboardList },
          { id: 'category', label: `2. Fitur Industri ${terms.categoryName}`, icon: Layers },
          { id: 'ai', label: '3. Diagnosa AI Kerusakan', icon: Sparkles },
          { id: 'spareparts', label: '4. Gudang & Suku Cadang', icon: Package },
          { id: 'commission', label: '5. Rumus Komisi & Bagi Hasil', icon: Percent },
          { id: 'warranty', label: '6. SLA Garansi & Retur Servis', icon: ShieldCheck },
          { id: 'simulator', label: '🧮 7. Simulator Profit & Komisi', icon: Calculator },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SOP & ALUR KERJA SPK */}
      {activeTab === 'flow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                  <span>SOP 7 Tahap Penerimaan, Pengerjaan & Serah Terima Servis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Standar baku operasional meja front-desk hingga serah terima unit ke pelanggan.
                </p>
              </div>
              {onOpenNewSpk && (
                <button
                  type="button"
                  onClick={onOpenNewSpk}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>{terms.newWorkOrderBtn || '+ Buat SPK Baru'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Penerimaan Awal (Check-In)',
                  desc: 'Input identitas customer, kelengkapan unit (charger/kunci/aksesoris), kondisi fisik awal, dan keluhan utama.',
                  badge: 'Front Desk'
                },
                {
                  step: '2',
                  title: 'Inspeksi & Diagnosa',
                  desc: 'Teknisi membongkar/memeriksa unit, mendeteksi akar masalah, dan menguji komponen yang perlu diganti.',
                  badge: 'Teknisi'
                },
                {
                  step: '3',
                  title: 'Konfirmasi Biaya (Approval)',
                  desc: 'Hubungi customer via WhatsApp untuk konfirmasi estimasi biaya jasa + harga sparepart sebelum eksekusi.',
                  badge: 'CS / Kasir'
                },
                {
                  step: '4',
                  title: 'Eksekusi & Pasang Part',
                  desc: 'Teknisi mengerjakan perbaikan, mengambil sparepart dari gudang, dan sistem otomatis mengunci stok.',
                  badge: 'Workshop'
                },
                {
                  step: '5',
                  title: 'Quality Control (QC)',
                  desc: 'Uji fungsi menyeluruh (suhu/tegangan/running test) untuk memastikan kerusakan tidak kambuh.',
                  badge: 'QC Inspector'
                },
                {
                  step: '6',
                  title: 'Kasir & Pelunasan',
                  desc: 'Customer membayar lunas tagihan via Kasir POS (Tunai, QRIS, Transfer) dan menerima struk nota resmi.',
                  badge: 'Kasir POS'
                },
                {
                  step: '7',
                  title: 'Serah Terima & Garansi',
                  desc: 'Serahkan unit beserta kartu/struk garansi. Sistem mengaktifkan masa countdown garansi otomatis.',
                  badge: 'Handover'
                },
                {
                  step: '8',
                  title: 'Pencairan Komisi',
                  desc: 'Sistem mengakumulasikan komisi teknisi yang telah menyelesaikan SPK ke buku laporan komisi harian/bulanan.',
                  badge: 'Keuangan'
                },
              ].map(card => (
                <div key={card.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {card.step}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {card.badge}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning Callout */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block">SOP Pencegahan Sengketa Fisik:</strong>
                <p>Wajib catat kondisi lecet/cacat fisik awal dan minta tanda tangan atau konfirmasi WA customer saat penyerahan awal. Ini mencegah klaim sepihak terkait cacat fisik yang bukan disebabkan oleh bengkel.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FITUR KHUSUS INDUSTRI */}
      {activeTab === 'category' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Dynamic Service Engine</span>
                <h2 className="text-xl font-extrabold text-slate-900">Kustomisasi Format Khusus: {terms.categoryName}</h2>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                Mode Adaptif Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kamus Terminologi yang Diterapkan</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span>Sebutan Pekerja:</span>
                    <strong className="text-slate-900">{terms.technicianLabel}</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span>Objek Servis:</span>
                    <strong className="text-slate-900">{terms.unitLabel}</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span>Dokumen Kerja:</span>
                    <strong className="text-slate-900">{terms.workOrderLabel}</strong>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span>Material / Suku Cadang:</span>
                    <strong className="text-slate-900">{terms.sparepartLabel}</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Kolom Input Spesifik Kategori Ini</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-indigo-700 block">{terms.customField1Label}</span>
                    <span className="text-slate-500">Contoh input: {terms.customField1Placeholder}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-indigo-700 block">{terms.customField2Label}</span>
                    <span className="text-slate-500">Contoh input: {terms.customField2Placeholder}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Industry Matrix */}
            <div className="mt-4">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Dukungan Industri Lainnya di Bizora Jasa:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { name: 'Elektronik & HP', icon: Smartphone, unit: 'Merk & IMEI' },
                  { name: 'Bengkel Otomotif', icon: Car, unit: 'No Polisi & KM' },
                  { name: 'AC & Pendingin', icon: Snowflake, unit: 'Kapasitas PK & Freon' },
                  { name: 'Laundry Kiloan', icon: Shirt, unit: 'Berat Kg & Pewangi' },
                  { name: 'Barbershop & Salon', icon: Scissors, unit: 'Model & Antrean' },
                  { name: 'Custom Jasa Lain', icon: Wrench, unit: 'Dapat disesuaikan' },
                ].map(ind => {
                  const Icon = ind.icon;
                  return (
                    <div key={ind.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
                      <Icon className="w-5 h-5 mx-auto text-indigo-600" />
                      <div className="text-xs font-bold text-slate-800">{ind.name}</div>
                      <div className="text-[10px] text-slate-500">{ind.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSA AI KERUSAKAN */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <span>Asisten AI Diagnostics & Estimasi Otomatis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan kecerdasan buatan untuk mempercepat diagnosa kerusakan, jam kerja, dan rekomendasi part.
                </p>
              </div>
              {onOpenAiModal && (
                <button
                  type="button"
                  onClick={onOpenAiModal}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buka AI Diagnostics</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900">Deskripsikan Gejala</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masukkan cerita keluhan pelanggan, misalnya: <em>"Layar LCD kedap-kedip setelah kena air"</em> atau <em>"Motor matic bunyi ngorok di area CVT saat tanjakan"</em>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900">Analisa AI Terstruktur</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engine AI menganalisis kemungkinan kerusakan (root cause), estimasi jam kerja, estimasi tarif jasa pasar, dan suku cadang yang wajib diganti.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900">Auto-Fill ke Form SPK</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Klik tombol <strong>"Terapkan ke SPK"</strong>. Seluruh diagnosa teknis dan rincian perkiraan biaya akan langsung tertulis di formulir tanpa perlu ketik manual.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <strong className="font-bold text-slate-800">Contoh Hasil Analisa AI Diagnostics:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Gejala: Motor Starter Cetek-Cetek</span>
                  <p className="mt-1 font-medium text-slate-900">• Diagnosa: Relay Starter kotor / Arang Dinamo habis</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">• Estimasi Waktu: 45 Menit | Estimasi Jasa: Rp 45.000</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">Gejala: Laptop Mati Total Kena Kopi</span>
                  <p className="mt-1 font-medium text-slate-900">• Diagnosa: Short IC Power 3V/5V & Korosi Jalur</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">• Estimasi Waktu: 2-3 Hari | Estimasi Jasa: Rp 250.000 - 450.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GUDANG & SPAREPARTS */}
      {activeTab === 'spareparts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-indigo-600" />
              <span>SOP Manajemen Gudang Suku Cadang & Material</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Metode Pemotongan Stok Otomatis</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ketika teknisi memasukkan sparepart ke dalam rincian SPK, stok material akan berstatus <strong>Reserved (Terkunci)</strong>. Saat SPK diubah ke status "Selesai" atau dibayar di kasir, stok fisik gudang akan otomatis dipotong.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-indigo-900">
                  Stok Tersedia = Stok Fisik - Stok SPK Sedang Dikerjakan
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Rumus HPP Moving Average Suku Cadang</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Saat Anda membeli suku cadang baru dengan harga kulakan yang berbeda dari supplier, sistem menghitung rata-rata tertimbang modal agar laba suku cadang tetap presisi:
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-indigo-900">
                  HPP Baru = ((Stok Lama × HPP Lama) + (Qty Beli × Harga Beli Baru)) ÷ Total Stok Baru
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <strong className="font-bold block">Integrasi Penjualan Langsung (POS):</strong>
              <p>Sparepart dapat dijual langsung ke pelanggan tanpa melalui SPK servis menggunakan menu <strong>Kasir (POS)</strong>. Cocok untuk toko sparepart / aksesoris eceran.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RUMUS KOMISI TEKNISI */}
      {activeTab === 'commission' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Percent className="w-6 h-6 text-emerald-600" />
              <span>Rumus Perhitungan Komisi Teknisi & Laba Bersih Bengkel</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">Skema 1</span>
                <h3 className="text-sm font-bold text-slate-900">Persentase dari Biaya Jasa</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Teknisi mendapatkan persentase tertentu (misal 30% - 50%) dari total nominal jasa (ongkos kerja), tidak termasuk harga sparepart.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-emerald-700">
                  Komisi = Biaya Jasa × % Komisi
                </div>
                <div className="text-[11px] text-slate-500">
                  <em>Contoh: Jasa Rp 200.000 × 35% = <strong>Rp 70.000</strong></em>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-extrabold">Skema 2</span>
                <h3 className="text-sm font-bold text-slate-900">Flat Fee per SPK / Unit</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Teknisi menerima upah tetap sesuai kategori pekerjaan (misal: Ganti Oli Rp 10.000, Cuci AC Rp 35.000, Reball IC Rp 150.000).
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-blue-700">
                  Komisi = Σ (Tarif Flat per Kategori)
                </div>
                <div className="text-[11px] text-slate-500">
                  <em>Contoh: Selesai 3 unit Cuci AC = 3 × Rp 35.000 = <strong>Rp 105.000</strong></em>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-extrabold">Skema 3</span>
                <h3 className="text-sm font-bold text-slate-900">Bagi Hasil Margin Bersih</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Komisi dihitung setelah total tagihan dikurangi modal beli sparepart dan biaya operasional langsung.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-purple-700">
                  Komisi = (Total Tagihan - HPP Part) × % Bagi Hasil
                </div>
                <div className="text-[11px] text-slate-500">
                  <em>Contoh: (Tagihan 500rb - Modal 300rb) × 40% = <strong>Rp 80.000</strong></em>
                </div>
              </div>
            </div>

            {/* Formula Breakdown Card */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>Rumus Laba Bersih Perbaikan Per SPK (Workshop Net Profit)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-800 rounded-xl space-y-2">
                  <span className="text-slate-400 font-semibold block">Pendapatan SPK (Gross Revenue):</span>
                  <div className="font-mono text-sm text-emerald-300">Revenue = Total Jasa + Penjualan Sparepart</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-xl space-y-2">
                  <span className="text-slate-400 font-semibold block">Laba Bersih Pemilik Usaha:</span>
                  <div className="font-mono text-sm text-amber-300">Net Profit = Revenue - (HPP Part + Komisi Teknisi + Ops)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SLA GARANSI & RETUR */}
      {activeTab === 'warranty' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>SOP Penanganan Klaim Garansi & Retur Servis</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>1. Masa Berlaku Garansi Otomatis</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem Bizora menghitung tanggal kadaluarsa garansi sejak hari SPK dinyatakan Selesai. Customer cukup menunjukkan Nota SPK atau No HP untuk verifikasi status garansi aktif.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-indigo-900">
                  Expired Garansi = Tanggal Selesai + Durasi Garansi (Contoh: 30 Hari)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>2. Ketentuan Garansi Gugur (Void)</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Segel garansi toko rusak atau telah dibongkar pihak lain.</li>
                  <li>Kerusakan fisik baru (jatuh, pecah, retak, atau terkena air).</li>
                  <li>Kerusakan pada komponen di luar bagian yang diperbaiki sebelumnya.</li>
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                <span>Alur Servis Ulang Garansi (SPK Komplain):</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900">
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Langkah 1: Verifikasi Tiket</strong>
                  <p className="text-[11px] text-slate-600 mt-1">Cari nomor SPK lama di sistem, pastikan tanggal komplain masih dalam periode garansi.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Langkah 2: Buat SPK Re-Work</strong>
                  <p className="text-[11px] text-slate-600 mt-1">Buat SPK klaim garansi dengan tarif Jasa Rp 0 dan tautkan ke teknisi terdahulu.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <strong>Langkah 3: Retur Part Supplier</strong>
                  <p className="text-[11px] text-slate-600 mt-1">Jika sparepart rusak dari pabrik, buat dokumen retur ke supplier sparepart terkait.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SIMULATOR PROFIT & KOMISI */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <Calculator className="w-6 h-6 text-indigo-600" />
                  <span>Kalkulator & Simulator Pembagian Hasil SPK Jasa</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Simulasikan biaya jasa, penjualan sparepart, modal, dan bagi hasil teknisi secara realtime.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                Kalkulator Realtime
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Input Form */}
              <div className="lg:col-span-6 space-y-4 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Parameter Transaksi SPK
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Biaya Tarif Jasa / Ongkos Kerja (Rp)
                    </label>
                    <input
                      type="number"
                      value={simJasaFee}
                      onChange={(e) => setSimJasaFee(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Harga Jual Sparepart (Rp)
                      </label>
                      <input
                        type="number"
                        value={simPartSale}
                        onChange={(e) => setSimPartSale(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Harga Modal / HPP Part (Rp)
                      </label>
                      <input
                        type="number"
                        value={simPartCost}
                        onChange={(e) => setSimPartCost(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Model Komisi Teknisi
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setSimCommType('percent')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          simCommType === 'percent'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Persentase Jasa (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimCommType('flat')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          simCommType === 'flat'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        Nominal Flat (Rp)
                      </button>
                    </div>

                    {simCommType === 'percent' ? (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">Persentase Bagi Hasil Teknisi:</span>
                          <span className="font-extrabold text-indigo-600">{simCommRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={simCommRate}
                          onChange={(e) => setSimCommRate(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nominal Komisi Flat Teknisi (Rp)
                        </label>
                        <input
                          type="number"
                          value={simCommFlat}
                          onChange={(e) => setSimCommFlat(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimasi Beban Listrik / Bahan Habis Pakai / Konsumabel (Rp)
                    </label>
                    <input
                      type="number"
                      value={simOperationalCost}
                      onChange={(e) => setSimOperationalCost(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Realtime Output Breakdown */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Hasil Analisa Keuangan SPK
                  </span>

                  <div className="space-y-3 font-mono text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-slate-300">
                      <span>Total Tagihan ke Customer:</span>
                      <strong className="text-white text-sm">Rp {simTotalBilled.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Tarif Jasa:</span>
                      <span>Rp {simJasaFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Harga Sparepart:</span>
                      <span>Rp {simPartSale.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-rose-300">
                      <span>1. Modal Beli Part (HPP):</span>
                      <span>- Rp {simPartCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>2. Komisi Teknisi:</span>
                      <span className="font-bold">Rp {simTechCommission.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>3. Biaya Bahan Habis Pakai:</span>
                      <span>- Rp {simOperationalCost.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-emerald-400 font-mono">
                      <span className="text-xs font-bold uppercase">Laba Bersih Workshop:</span>
                      <span className="text-xl font-extrabold">Rp {simNetProfitWorkshop.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>Profit Margin Workshop:</span>
                      <span className="font-bold text-emerald-300">{simNetMargin}%</span>
                    </div>
                  </div>
                </div>

                {/* Insight Evaluation */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                  simNetProfitWorkshop > 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <strong className="font-bold block">
                    {simNetProfitWorkshop > 0 ? '✓ Evaluasi Keuangan Sehat:' : '⚠ Peringatan Margin Negatif / Rugi:'}
                  </strong>
                  <p>
                    {simNetProfitWorkshop > 0 
                      ? `Transaksi ini menghasilkan profit bersih Rp ${simNetProfitWorkshop.toLocaleString('id-ID')} (${simNetMargin}%) untuk bengkel/workshop setelah teknisi menerima hak komisi sebesar Rp ${simTechCommission.toLocaleString('id-ID')}.`
                      : 'Total biaya modal sparepart dan komisi teknisi melebihi tagihan yang ditagihkan ke customer! Naikkan tarif jasa atau kurangi persentase komisi.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
