import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  ClipboardList,
  Wrench,
  Users,
  ShieldCheck,
  Layers,
  FileText,
  Printer,
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
  Smartphone,
  Car,
  Snowflake,
  Shirt,
  Scissors,
  Building2,
  Phone,
  MessageSquare,
  Key,
  Server,
  Receipt,
  Wallet,
  Star,
  Zap,
  Boxes,
  Code,
  Check,
  Briefcase,
  Search,
  SlidersHorizontal,
  DollarSign,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  Send,
  Trash2,
  Pencil,
  Eye,
  Settings,
  Scale,
  Activity,
  Award,
  BarChart2,
  PieChart,
  BadgePercent
} from '@/constants/icons';
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
  const [activeTab, setActiveTab] = useState<
    'sop_spk' | 'sop_pos' | 'sop_inventory' | 'sop_services_tech' | 'sop_contracts' | 'sop_finance' | 'sop_warranty' | 'sop_settings_api' | 'industry_presets' | 'simulator'
  >('sop_spk');

  // Interactive Simulator State
  const [simJasaFee, setSimJasaFee] = useState<number>(150000);
  const [simPartSale, setSimPartSale] = useState<number>(250000);
  const [simPartCost, setSimPartCost] = useState<number>(160000);
  const [simCommType, setSimCommType] = useState<'percent' | 'flat'>('percent');
  const [simCommRate, setSimCommRate] = useState<number>(35); // 35%
  const [simCommFlat, setSimCommFlat] = useState<number>(50000); // 50rb flat
  const [simOperationalCost, setSimOperationalCost] = useState<number>(15000);

  // Preset Handler for Simulator
  const applySimPreset = (preset: string) => {
    switch (preset) {
      case 'elektronik':
        setSimJasaFee(175000);
        setSimPartSale(350000);
        setSimPartCost(220000);
        setSimCommType('percent');
        setSimCommRate(35);
        setSimOperationalCost(15000);
        break;
      case 'otomotif':
        setSimJasaFee(120000);
        setSimPartSale(280000);
        setSimPartCost(190000);
        setSimCommType('percent');
        setSimCommRate(30);
        setSimOperationalCost(20000);
        break;
      case 'ac':
        setSimJasaFee(85000);
        setSimPartSale(150000);
        setSimPartCost(75000);
        setSimCommType('flat');
        setSimCommFlat(35000);
        setSimOperationalCost(10000);
        break;
      case 'laundry':
        setSimJasaFee(65000);
        setSimPartSale(0);
        setSimPartCost(0);
        setSimCommType('percent');
        setSimCommRate(25);
        setSimOperationalCost(12000);
        break;
      case 'tailor':
        setSimJasaFee(250000);
        setSimPartSale(120000);
        setSimPartCost(60000);
        setSimCommType('percent');
        setSimCommRate(40);
        setSimOperationalCost(15000);
        break;
      case 'kontraktor':
        setSimJasaFee(1500000);
        setSimPartSale(3200000);
        setSimPartCost(2400000);
        setSimCommType('percent');
        setSimCommRate(30);
        setSimOperationalCost(150000);
        break;
      default:
        break;
    }
  };

  // Simulator Calculations
  const simTotalBilled = simJasaFee + simPartSale;
  const simTechCommission = simCommType === 'percent' 
    ? (simJasaFee * (simCommRate / 100))
    : simCommFlat;
  const simTotalDirectCost = simPartCost + simTechCommission + simOperationalCost;
  const simNetProfitWorkshop = simTotalBilled - simTotalDirectCost;
  const simNetMargin = simTotalBilled > 0 ? ((simNetProfitWorkshop / simTotalBilled) * 100).toFixed(1) : '0';

  const fmtRp = (num: number) => `Rp ${Math.round(num || 0).toLocaleString('id-ID')}`;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan & SOP Operasional Aplikasi Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Pemakaian Aplikasi Modul Jasa & Bengkel
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Panduan praktis langkah-demi-langkah cara penggunaan seluruh fitur dan menu di Modul Jasa ({terms.categoryName}): mulai dari input data SPK, penerbitan invoice kasir POS, audit gudang suku cadang, penugasan teknisi, manajemen kontrak B2B, pembukuan kas & piutang, klaim garansi, hingga pengaturan API & simulator profit.
            </p>
          </div>

          {isDemoAccount && (
            <button
              type="button"
              onClick={openPicker}
              className="px-5 py-3 bg-white text-indigo-700 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ganti Sektor Industri ({terms.categoryName})</span>
            </button>
          )}
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'sop_spk', label: '1. SOP Surat Perintah Kerja (SPK)', icon: ClipboardList },
          { id: 'sop_pos', label: '2. Kasir POS & Pelunasan', icon: Receipt },
          { id: 'sop_inventory', label: '3. Gudang & Suku Cadang', icon: Package },
          { id: 'sop_services_tech', label: '4. Master Layanan & Teknisi', icon: Wrench },
          { id: 'sop_contracts', label: '5. Kontrak Maintenance B2B', icon: Briefcase },
          { id: 'sop_finance', label: '6. Keuangan, Kas, Hutang & Piutang', icon: Wallet },
          { id: 'sop_warranty', label: '7. Garansi & Re-Work SPK', icon: ShieldCheck },
          { id: 'sop_settings_api', label: '8. Pengaturan, API & Webhook', icon: Code },
          { id: 'industry_presets', label: `9. Fitur Sektor ${terms.categoryName}`, icon: Layers },
          { id: 'simulator', label: '🧮 10. Simulator Laba & Komisi', icon: Calculator },
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

      {/* ========================================================================= */}
      {/* TAB 1: SOP SURAT PERINTAH KERJA (SPK)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'sop_spk' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                  <span>SOP & Petunjuk Lengkap Pembuatan serta Pelacakan SPK Servis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Menu Utama: <strong>Daftar Pekerjaan / SPK (`/jasa/work-orders`)</strong>
                </p>
              </div>
              {onOpenNewSpk && (
                <button
                  type="button"
                  onClick={onOpenNewSpk}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{terms.newWorkOrderBtn || 'Buat SPK Baru'}</span>
                </button>
              )}
            </div>

            {/* Step by step cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">1</span>
                  <h3 className="text-sm font-bold text-slate-900">Cara Membuat SPK Servis Masuk Baru (Check-In)</h3>
                </div>
                <div className="pl-11 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. Klik tombol biru <strong>"{terms.newWorkOrderBtn || 'Buat SPK Baru'}"</strong> di pojok kanan atas atau di bilah menu navigasi.</p>
                  <p>2. <strong>Bagian Data Pelanggan:</strong> Masukkan Nama Lengkap, Nomor WhatsApp aktif (format: 08xxx), dan Alamat pelanggan.</p>
                  <p>3. <strong>Bagian Objek Servis ({terms.unitLabel}):</strong> Masukkan nama perangkat/unit (misal: *iPhone 13 Pro 128GB*, *Honda Vario 160cc*, *AC Daikin 1 PK*), kelengkapan yang dibawa (charger, remote, kunci kontak), dan deskripsi keluhan utama.</p>
                  <p>4. <strong>Bagian Form Khusus:</strong> Isi kolom spesifik industri seperti <em>{terms.customField1Label}</em> dan <em>{terms.customField2Label}</em>.</p>
                  <p>5. <strong>Penugasan Teknisi & Prioritas:</strong> Pilih nama {terms.technicianLabel} yang ditugaskan dan tentukan level urgensi (*Normal*, *Penting*, atau *Darurat*).</p>
                  <p>6. Klik <strong>"Simpan & Terbitkan SPK"</strong>. Sistem otomatis menghasilkan Nomor SPK unik (misal: `#SPK-1082`).</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">2</span>
                  <h3 className="text-sm font-bold text-slate-900">Cara Menggunakan Asisten AI Diagnostics di Form SPK</h3>
                </div>
                <div className="pl-11 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. Pada modal pembuatan/pengeditan SPK, klik tombol berkilau <strong>"Diagnosa AI"</strong>.</p>
                  <p>2. Ketikkan gejala masalah apa adanya di kolom cerita, contoh: <em>"Mesin cuci tidak mau berputar saat proses pengeringan dan keluar bau hangus"</em>.</p>
                  <p>3. Klik <strong>"Mulai Analisa AI"</strong>. Dalam 2 detik, sistem akan merekomendasikan kemungkinan kerusakan, estimasi jam pengerjaan (SLA), perkiraan tarif jasa pasar, dan daftar suku cadang yang wajib disiapkan.</p>
                  <p>4. Klik tombol <strong>"Terapkan ke SPK"</strong> untuk mengisi estimasi tarif & diagnosa secara otomatis.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">3</span>
                  <h3 className="text-sm font-bold text-slate-900">Cara Menambahkan Suku Cadang & Ongkos Kerja ke SPK</h3>
                </div>
                <div className="pl-11 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. Buka detail SPK dengan mengklik baris pesanan pada tabel atau papan kanban.</p>
                  <p>2. Pada seksi <strong>Rincian Suku Cadang & Jasa</strong>, klik tombol <strong>"Tambah Suku Cadang"</strong>.</p>
                  <p>3. Pilih sparepart dari inventori gudang atau ketik nama item baru, tentukan jumlah (Qty), harga jual, dan modal beli (HPP).</p>
                  <p>4. Masukkan biaya tarif jasa perbaikan. Total tagihan grand total akan dihitung secara otomatis dan realtime.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">4</span>
                  <h3 className="text-sm font-bold text-slate-900">Cara Memperbarui Status Pengerjaan & Serah Terima</h3>
                </div>
                <div className="pl-11 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. Ubah dropdown status tahapan kerja: <strong>Menunggu</strong> $\rightarrow$ <strong>Dikerjakan</strong> $\rightarrow$ <strong>Selesai</strong> $\rightarrow$ <strong>Siap Diambil</strong> $\rightarrow$ <strong>Diserahkan</strong>.</p>
                  <p>2. Catat log aktivitas teknisi (misal: *"IC Power berhasil diganti, unit masuk tahap uji kelistrikan 2 jam"*).</p>
                  <p>3. Saat status beralih ke <strong>Selesai</strong>, sistem otomatis mengunci masa countdown garansi dan menyiapkan tagihan ke kasir POS.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm font-extrabold shadow-xs">5</span>
                  <h3 className="text-sm font-bold text-slate-900">Cara Cetak SPK Fisik & Kirim Notifikasi WhatsApp</h3>
                </div>
                <div className="pl-11 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. <strong>Cetak Fisik / PDF:</strong> Klik tombol ikon <strong>Printer</strong> di modal detail SPK. Pilih format Nota Tanda Terima Kasir (Thermal 58mm/80mm) atau Lembar Kerja Teknisi (A4/Letter) lengkap dengan barcode SPK.</p>
                  <p>2. <strong>Kirim WhatsApp Otomatis:</strong> Klik tombol hijau <strong>"Kirim WA Pelanggan"</strong>. Sistem akan membuka WhatsApp Web / App dengan template pesan resmi berisi nama unit, keluhan, estimasi biaya, status berjalan, dan tautan tracking nota tanpa perlu mengetik manual.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KASIR POS & PELUNASAN NOTA                                         */}
      {/* ========================================================================= */}
      {activeTab === 'sop_pos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Receipt className="w-6 h-6 text-emerald-600" />
              <span>SOP Kasir POS, Pelunasan SPK, Penjualan Eceran & Multi-Payment</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menu Utama: <strong>Kasir (POS) (`/jasa/pos`)</strong> dan <strong>Tagihan & Piutang (`/jasa/invoices`)</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Pelunasan Nota SPK di Meja Kasir</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Buka menu <strong>Kasir (POS)</strong> atau klik tombol <strong>"Bayar Kasir"</strong> langsung dari detail SPK.</p>
                  <p>• Pilih nomor SPK yang akan dibayar. Sistem menampilkan rincian total biaya jasa + suku cadang.</p>
                  <p>• Terapkan diskon promosi atau voucher bila ada.</p>
                  <p>• Pilih metode pembayaran: <strong>Tunai (Cash)</strong>, <strong>Transfer Bank</strong>, <strong>QRIS</strong>, atau <strong>Tempo (Piutang)</strong>.</p>
                  <p>• Masukkan nominal uang yang diterima, sistem menghitung nominal kembalian secara otomatis.</p>
                  <p>• Klik <strong>"Proses Pembayaran"</strong> $\rightarrow$ Status SPK berubah menjadi <strong>Lunas</strong> dan struk kasir otomatis tercetak.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Penjualan Langsung Sparepart & Aksesoris</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Kasir dapat melayani transaksi eceran (tanpa servis) seperti penjualan oli, oli transmisi, kabel data, atau casing.</p>
                  <p>• Klik produk sparepart di katalog POS atau gunakan barcode scanner untuk scan barcode item.</p>
                  <p>• Klik tombol <strong>"Bayar"</strong>, pilih rekening tujuan kas, dan selesaikan transaksi.</p>
                  <p>• Stok sparepart di gudang otomatis terpotong saat transaksi selesai.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Pencatatan Down Payment (DP / Uang Muka)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Jika servis memerlukan DP awal untuk pembelian sparepart inden, buka menu <strong>Tagihan & Piutang (`/jasa/invoices`)</strong>.</p>
                  <p>• Cari nomor invoice SPK terkait, klik <strong>"Catat Pembayaran"</strong>.</p>
                  <p>• Masukkan nominal DP yang dibayarkan (misal: 50%). Status invoice berubah menjadi <strong>"Dibayar Sebagian"</strong>.</p>
                  <p>• Sisa kekurangan akan ditagihkan saat unit selesai dan siap diserahkan.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Cetak Ulang Nota & Pengiriman Struk Digital</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Setiap riwayat transaksi tersimpan permanen di menu Tagihan & Piutang.</p>
                  <p>• Kasir dapat mencetak ulang nota struk kapan saja jika pelanggan membutuhkan salinan faktur fisik.</p>
                  <p>• Format struk sudah mencantumkan informasi garansi, nama teknisi, tanggal pengerjaan, dan QR Code verifikasi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GUDANG & SUKU CADANG                                               */}
      {/* ========================================================================= */}
      {activeTab === 'sop_inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-indigo-600" />
              <span>SOP Manajemen Gudang Suku Cadang, Restock & Pemotongan Stok</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menu Utama: <strong>Gudang Suku Cadang (`/jasa/inventory`)</strong>
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>Mendaftarkan Item Sparepart / Material Baru</span>
                </h3>
                <p>1. Buka menu <strong>Gudang Suku Cadang</strong>, klik tombol <strong>"Tambah Sparepart"</strong>.</p>
                <p>2. Masukkan Kode Barang (SKU/Part Number), Nama Suku Cadang, Kategori (*Fast Moving*, *Slow Moving*, *Konsumabel*), Satuan (*Pcs*, *Liter*, *Set*, *Meter*).</p>
                <p>3. Masukkan <strong>Harga Beli Modal (HPP)</strong> dan <strong>Harga Jual Standar</strong>.</p>
                <p>4. Tentukan <strong>Batas Minimum Stok (Minimum Stock Alert)</strong>, misal 5 Pcs. Sistem otomatis memunculkan tanda peringatan merah saat stok berada di bawah batas ini.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span>Mencatat Restock / Pembelian Stok Masuk dari Vendor</span>
                </h3>
                <p>1. Saat kiriman sparepart dari supplier datang, klik tombol <strong>"Restock / Tambah Stok Masuk"</strong> pada baris barang terkait.</p>
                <p>2. Masukkan jumlah Qty yang dibeli dan harga beli per unit pada faktur supplier saat ini.</p>
                <p>3. Jika harga beli berbeda dari sebelumnya, sistem otomatis menerapkan rumus <strong>Weighted Moving Average</strong> untuk menghitung HPP baru yang presisi tanpa mengacaukan perhitungan margin historis.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <span>Siklus Kunci Stok (Reserved) vs Potong Fisik</span>
                </h3>
                <p>• <strong>Saat Sparepart Dimasukkan ke SPK:</strong> Stok barang berstatus <em>"Reserved"</em>. Barang tersebut tidak bisa diambil untuk SPK lain.</p>
                <p>• <strong>Saat SPK Selesai / Dibayar Lunas:</strong> Sistem langsung memotong stok fisik gudang dan memasukkan HPP modal ke buku besar pengeluaran laba rugi.</p>
                <p>• <strong>Jika Servis Dibatalkan:</strong> Stok <em>Reserved</em> otomatis dilepaskan kembali menjadi stok tersedia (Ready Stock).</p>
              </div>
            </div>

            {/* FORMULA SECTION GUDANG */}
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  📐 Kamus Rumus Gudang: HPP Moving Average, Margin vs Markup & Titik Pesan Ulang (ROP)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Formula 1: Moving Average HPP */}
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900">1. Weighted Moving Average HPP</span>
                    <span className="px-2 py-0.5 bg-indigo-200/80 text-indigo-800 rounded text-[10px] font-bold">Valuasi Stok</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-100 font-mono text-[11px] text-indigo-950 leading-relaxed">
                    <strong>HPP Baru =</strong><br />
                    [(Stok Lama × HPP Lama) + (Qty Beli Baru × Harga Beli Baru)] ÷ (Stok Lama + Qty Beli Baru)
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                    <strong className="text-slate-800 block">Contoh Perhitungan:</strong>
                    <p>• Stok awal: 10 Pcs @ Rp 100.000 = Rp 1.000.000</p>
                    <p>• Restock: 20 Pcs @ Rp 130.000 = Rp 2.600.000</p>
                    <p>• <strong>HPP Baru:</strong> (1.000.000 + 2.600.000) ÷ 30 Pcs = <strong className="text-indigo-700">Rp 120.000 / Pcs</strong>.</p>
                  </div>
                </div>

                {/* Formula 2: Margin vs Markup */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900">2. Margin vs Markup Penjualan</span>
                    <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-800 rounded text-[10px] font-bold">Profit Sparepart</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-mono text-[11px] text-emerald-950 leading-relaxed space-y-1">
                    <div><strong>Margin % =</strong> [(Jual - HPP) ÷ Jual] × 100%</div>
                    <div><strong>Markup % =</strong> [(Jual - HPP) ÷ HPP] × 100%</div>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                    <strong className="text-slate-800 block">Contoh Perhitungan:</strong>
                    <p>• HPP: Rp 100.000 | Harga Jual: Rp 150.000</p>
                    <p>• Laba Nominal: Rp 50.000</p>
                    <p>• <strong>Margin:</strong> (50.000 / 150.000) = <strong className="text-emerald-700">33.33%</strong></p>
                    <p>• <strong>Markup:</strong> (50.000 / 100.000) = <strong className="text-emerald-700">50.00%</strong></p>
                  </div>
                </div>

                {/* Formula 3: Reorder Point (ROP) */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">3. Reorder Point & Safety Stock</span>
                    <span className="px-2 py-0.5 bg-amber-200/80 text-amber-800 rounded text-[10px] font-bold">Pengadaan</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-mono text-[11px] text-amber-950 leading-relaxed">
                    <strong>ROP =</strong><br />
                    (Rata-rata Pemakaian Harian × Waktu Kirim Vendor / Lead Time) + Safety Stock
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                    <strong className="text-slate-800 block">Contoh Perhitungan:</strong>
                    <p>• Pemakaian harian: 3 unit/hari</p>
                    <p>• Lead time kirim: 4 hari | Safety stock: 5 unit</p>
                    <p>• <strong>ROP:</strong> (3 × 4) + 5 = <strong className="text-amber-800">17 unit</strong>. Saat stok sisa 17, order ulang ke supplier.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MASTER LAYANAN & TEKNISI                                           */}
      {/* ========================================================================= */}
      {activeTab === 'sop_services_tech' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-indigo-600" />
              <span>SOP Manajemen Katalog Paket Layanan & Penugasan Teknisi</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menu Utama: <strong>Master Layanan (`/jasa/services`)</strong> dan <strong>Teknisi & Pegawai (`/jasa/technicians`)</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>SOP Master Katalog Layanan (/jasa/services)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. <strong>Tambah Paket Servis:</strong> Klik tombol <strong>"Tambah Layanan"</strong>.</p>
                  <p>2. <strong>Isi Parameter Layanan:</strong> Masukkan Kode Servis (misal: `SRV-TUNEUP`), Nama Paket, Kategori, Estimasi Waktu Kerja (SLA dalam jam/menit), Masa Garansi Default (misal: 30 Hari), dan Tarif Biaya Dasar.</p>
                  <p>3. <strong>Rekomendasi Part Bawaan:</strong> Tautkan sparepart yang umumnya dibutuhkan paket ini (misal: Oli Mesin + Busi) agar kasir tidak lupa menawarkan saat check-in.</p>
                  <p>4. Paket yang terdaftar dapat dipilih langsung dengan 1-klik saat membuat SPK baru.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>SOP Master Data Teknisi (/jasa/technicians)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>1. <strong>Daftarkan Tenaga Kerja:</strong> Klik tombol <strong>"Tambah Pegawai"</strong>.</p>
                  <p>2. <strong>Data & Keahlian:</strong> Masukkan Nama Lengkap, Nomor Kontak WhatsApp, Level Keahlian (*Junior*, *Senior*, *Master Specialist*), dan Bidang Spesialisasi teknis.</p>
                  <p>3. <strong>Skema Komisi:</strong> Atur persentase bagi hasil default teknisi (misal: 35% dari biaya ongkos kerja) atau tarif upah flat per unit pengerjaan.</p>
                  <p>4. <strong>Monitoring Antrean:</strong> Pantau kartu beban kerja teknisi (Active Orders vs Completed Orders) agar distribusi pekerjaan merata dan tidak ada teknisi yang overload.</p>
                </div>
              </div>
            </div>

            {/* FORMULA SECTION KOMISI TEKNISI */}
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  📐 Kamus Rumus & 4 Skema Perhitungan Bagi Hasil Komisi Teknisi
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Skema 1 */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-900">Skema 1: % Jasa Murni</span>
                    <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-[9px] font-bold">Standard</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-blue-100 font-mono text-[11px] text-blue-950">
                    <strong>Komisi =</strong><br />
                    Tarif Ongkos Jasa × % Komisi
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <p className="text-slate-500 font-semibold mb-1">Contoh Kasus:</p>
                    <p>• Tarif Jasa SPK: Rp 200.000</p>
                    <p>• Persentase Komisi: 35%</p>
                    <p>• <strong>Hak Teknisi:</strong> Rp 70.000</p>
                    <p>• <strong>Bagian Toko:</strong> Rp 130.000</p>
                    <p className="text-[10px] text-slate-400 mt-1">*(Penjualan part tidak dihitung komisi)*</p>
                  </div>
                </div>

                {/* Skema 2 */}
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900">Skema 2: Flat Rate per Unit</span>
                    <span className="px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded text-[9px] font-bold">Fixed Fee</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-indigo-100 font-mono text-[11px] text-indigo-950">
                    <strong>Komisi =</strong><br />
                    Nominal Tetap per Jenis SPK
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <p className="text-slate-500 font-semibold mb-1">Contoh Kasus:</p>
                    <p>• Cuci AC 1/2-1 PK: Rp 35.000/unit</p>
                    <p>• Ganti Oli Mesin: Rp 15.000/motor</p>
                    <p>• Bongkar Pasang Ban: Rp 20.000/roda</p>
                    <p>• Jika 5 unit AC: 5 × 35.000 = <strong className="text-indigo-700">Rp 175.000</strong></p>
                  </div>
                </div>

                {/* Skema 3 */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900">Skema 3: Net Margin Share</span>
                    <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded text-[9px] font-bold">Bagi Untung</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100 font-mono text-[10px] text-emerald-950">
                    <strong>Dasar Untung =</strong><br />
                    Jasa + (Jual Part - HPP) - Konsumabel<br />
                    <strong>Komisi =</strong> Dasar Untung × %
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <p className="text-slate-500 font-semibold mb-1">Contoh Kasus:</p>
                    <p>• Jasa: Rp 150rb, Laba Part: Rp 60rb</p>
                    <p>• Konsumabel: Rp 10rb</p>
                    <p>• Dasar Untung: Rp 200.000</p>
                    <p>• Bagi Hasil 40% = <strong className="text-emerald-700">Rp 80.000</strong></p>
                  </div>
                </div>

                {/* Skema 4 */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-900">Skema 4: Tier Target Kuota</span>
                    <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 rounded text-[9px] font-bold">Incentive</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-purple-100 font-mono text-[11px] text-purple-950">
                    <strong>Total Upah =</strong><br />
                    Komisi Dasar + Bonus Kuota Tier
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <p className="text-slate-500 font-semibold mb-1">Contoh Kasus:</p>
                    <p>• Target: 30 SPK/bulan</p>
                    <p>• Realisasi: 42 SPK (Over 12 unit)</p>
                    <p>• Komisi Dasar: Rp 3.200.000</p>
                    <p>• Bonus Tier (&gt;30 SPK): +Rp 500.000</p>
                    <p>• <strong>Total Diterima:</strong> <strong className="text-purple-700">Rp 3.700.000</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: KONTRAK MAINTENANCE B2B                                            */}
      {/* ========================================================================= */}
      {activeTab === 'sop_contracts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-indigo-600" />
              <span>SOP Pengelolaan Kontrak Servis B2B & Jadwal Kunjungan Berkala</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menu Utama: <strong>Kontrak B2B (`/jasa/contracts`)</strong>
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900">Langkah 1: Mendaftarkan Kontrak Kerjasama Korporat</h3>
                <p>• Klik tombol <strong>"Daftarkan Kontrak B2B"</strong>.</p>
                <p>• Masukkan Nama Perusahaan/Instansi (misal: *PT Graha Mandiri Abadi*, *Hotel Grand Nusantara*), PIC penanggung jawab, dan nomor WhatsApp.</p>
                <p>• Tentukan Tanggal Mulai dan Tanggal Berakhir Kontrak (misal: 1 Tahun).</p>
                <p>• Masukkan Nilai Total Kontrak, Skema Pembayaran (*Bulanan*, *Triwulan*, *Termin Proyek*), dan Kuota Kunjungan Wajib (misal: 24 Kunjungan per Tahun = 2x per Bulan).</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900">Langkah 2: Menerbitkan SPK Kunjungan Berkala Otomatis</h3>
                <p>• Ketika jadwal perawatan tiba, buka detail kontrak klien.</p>
                <p>• Klik tombol <strong>"Terbitkan SPK Kunjungan"</strong>. Sistem otomatis membuat SPK bernomor referensi kontrak tersebut dan menugaskan teknisi lapangan yang ditunjuk.</p>
                <p>• Teknisi membawa lembar kerja digital/cetak ke lokasi klien dan melakukan checklist maintenance.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900">Langkah 3: Pemenuhan SLA Kunjungan & Penerbitan Invoice Tagihan</h3>
                <p>• Setelah kunjungan selesai dan ditandatangani klien, kuota kunjungan kontrak akan bertambah otomatis (misal: 8/24 Kunjungan = 33% SLA Kepatuhan).</p>
                <p>• Terbitkan faktur tagihan invoice berkala ke bagian keuangan klien. Invoice langsung terhubung ke modul Piutang Pelanggan.</p>
              </div>
            </div>

            {/* FORMULA SECTION KONTRAK B2B */}
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  📐 Kamus Rumus Kontrak B2B: Kepatuhan SLA, MRR & First-Time Fix Rate
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-900">1. Kepatuhan SLA Kunjungan</span>
                    <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded text-[10px] font-bold">Fulfillment</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-indigo-100 font-mono text-[11px] text-indigo-950">
                    <strong>SLA % =</strong><br />
                    (Kunjungan Realisasi ÷ Target Kontrak) × 100%
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block">Contoh:</strong>
                    <p>• Target: 24 Kunjungan / thn</p>
                    <p>• Selesai s/d bulan 6: 12 Kunjungan</p>
                    <p>• <strong>SLA:</strong> (12 / 24) = <strong className="text-indigo-700">50% (On-Track 100% YTD)</strong></p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900">2. Monthly Recurring Revenue (MRR)</span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold">Pendapatan Rutin</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100 font-mono text-[11px] text-emerald-950">
                    <strong>MRR =</strong><br />
                    Nilai Total Kontrak ÷ Durasi Kontrak (Bulan)
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block">Contoh:</strong>
                    <p>• Nilai Kontrak 1 Thn: Rp 36.000.000</p>
                    <p>• Durasi: 12 Bulan</p>
                    <p>• <strong>MRR Diakui:</strong> <strong className="text-emerald-700">Rp 3.000.000 / Bulan</strong></p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-900">3. First-Time Fix Rate (FTFR)</span>
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded text-[10px] font-bold">Kualitas Jasa</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-purple-100 font-mono text-[11px] text-purple-950">
                    <strong>FTFR % =</strong><br />
                    (SPK Sukses Tanpa Komplain ÷ Total SPK) × 100%
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block">Contoh:</strong>
                    <p>• Total SPK Selesai: 50 unit</p>
                    <p>• Re-work komplain: 2 unit (Sukses: 48)</p>
                    <p>• <strong>FTFR:</strong> (48 / 50) = <strong className="text-purple-700">96.0% (Sangat Baik)</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: KEUANGAN, KAS, HUTANG & PIUTANG                                     */}
      {/* ========================================================================= */}
      {activeTab === 'sop_finance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Wallet className="w-6 h-6 text-emerald-600" />
              <span>SOP Pembukuan Kas Harian, Piutang Pelanggan, Hutang Vendor & Rekening Bank</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menu Navigasi Sub-Menu: <strong>Laba Rugi (`/jasa/summary`)</strong>, <strong>Buku Kas (`/jasa/expenses`)</strong>, <strong>Tagihan & Piutang (`/jasa/invoices`)</strong>, <strong>Hutang Vendor (`/jasa/payables`)</strong>, dan <strong>Multi Kas & Bank (`/jasa/accounts`)</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>1. Pencatatan Buku Kas & Pengeluaran Operasional (/jasa/expenses)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Klik tombol <strong>"Catat Transaksi Kas"</strong>.</p>
                  <p>• Pilih Tipe: <strong>Pengeluaran (Kas Keluar)</strong> atau <strong>Pemasukan Lainnya (Kas Masuk)</strong>.</p>
                  <p>• Pilih Kategori: Biaya Listrik/Air/Internet, Beli Konsumabel (Tin Solder/Minyak Pembersih/Isolasi), Uang Makan Lembur, Sewa Tempat, atau Biaya Promosi.</p>
                  <p>• Masukkan nominal dan pilih rekening kas pemotong (Kas Tunai Laci / Bank BCA / Mandiri).</p>
                  <p>• Klik Simpan. Pengeluaran langsung terpotong dari saldo kas dan masuk ke laporan laba rugi.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>2. Manajemen Tagihan & Piutang Pelanggan (/jasa/invoices)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Pantau daftar nota SPK yang belum lunas atau memiliki saldo piutang.</p>
                  <p>• Filter berdasarkan status: <em>Semua</em>, <em>Belum Lunas</em>, <em>Dibayar Sebagian (DP)</em>, atau <em>Jatuh Tempo</em>.</p>
                  <p>• Klik <strong>"Catat Pelunasan"</strong> saat pelanggan melunasi tagihan, pilih tanggal dan akun kas tujuan transfer.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>3. Manajemen Hutang Supplier & Pembelian Tempo (/jasa/payables)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Saat membeli suku cadang secara tempo dari distributor, klik tombol <strong>"Catat Hutang Supplier"</strong>.</p>
                  <p>• Masukkan Nama Supplier/Distributor, No Faktur Supplier, Tanggal Jatuh Tempo, dan Total Tagihan.</p>
                  <p>• Catat pembayaran angsuran/pelunasan bertahap saat mentransfer ke rekening vendor.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>4. Multi Akun Bank & Mutasi Transfer Kas (/jasa/accounts)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Daftarkan akun penyimpanan keuangan: <em>Kas Tunai Meja Kasir</em>, <em>Rekening Bank BCA</em>, <em>Rekening Mandiri</em>, dan <em>QRIS Settlement</em>.</p>
                  <p>• Klik tombol <strong>"Transfer Antar Kas / Bank"</strong> untuk memindahkan saldo internal (misal: setoran tunai laci kasir ke rekening bank tanpa dianggap sebagai beban pengeluaran usaha).</p>
                </div>
              </div>
            </div>

            {/* FORMULA SECTION KEUANGAN LENGKAP */}
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  📐 Kamus Rumus Lengkap Keuangan, Laba Rugi & Neraca Kas Modul Jasa
                </h3>
              </div>

              {/* Formula Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Omset Kotor */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">1. Omset Kotor (Gross Revenue)</span>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">Top-Line</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                    <strong>Omset Kotor =</strong><br />
                    Total Pendapatan Jasa + Penjualan Sparepart
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Akumulasi seluruh nilai transaksi tagihan servis dan penjualan langsung yang telah diselesaikan.
                  </p>
                </div>

                {/* 2. HPP Suku Cadang */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">2. HPP Suku Cadang (COGS)</span>
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">Biaya Pokok</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                    <strong>Total HPP =</strong><br />
                    Σ (Qty Sparepart Terpakai × HPP Beli Modal)
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Nilai modal beli asli suku cadang gudang yang terpasang pada SPK lunas atau terjual di POS.
                  </p>
                </div>

                {/* 3. Laba Kotor & Gross Margin */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">3. Laba Kotor & Gross Margin %</span>
                    <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">Gross Profit</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100 font-mono text-[11px] text-emerald-950 space-y-0.5">
                    <div><strong>Laba Kotor =</strong> Omset - HPP Part</div>
                    <div><strong>Gross Margin % =</strong> (Laba Kotor ÷ Omset) × 100%</div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Keuntungan kotor murni dari selisih tarif jasa dan margin harga jual suku cadang sebelum beban operasional.
                  </p>
                </div>

                {/* 4. Beban Operasional (OPEX) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">4. Beban Operasional (OPEX)</span>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">Beban Usaha</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                    <strong>OPEX =</strong><br />
                    Komisi Teknisi + Gaji Pokok + Pengeluaran Kas (Listrik/Air/Konsumabel/Sewa)
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Seluruh biaya pengeluaran harian yang tercatat di Buku Kas (`/jasa/expenses`) ditambah hak bagi hasil upah teknisi.
                  </p>
                </div>

                {/* 5. Laba Bersih Usaha (Net Operating Profit) */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">5. Laba Bersih Usaha (Net Profit)</span>
                    <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">Net Profit</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-100 font-mono text-[11px] text-emerald-950 space-y-0.5">
                    <div><strong>Laba Bersih =</strong> Laba Kotor - OPEX</div>
                    <div><strong>Net Margin % =</strong> (Laba Bersih ÷ Omset) × 100%</div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Hasil keuntungan bersih akhir yang benar-benar menjadi profit bengkel / workshop.
                  </p>
                </div>

                {/* 6. Arus Kas Bersih (Net Cash Flow) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">6. Arus Kas Bersih (Cash Flow)</span>
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">Likuiditas</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-[10px] text-slate-800">
                    <strong>Net Cash Flow =</strong><br />
                    (Kas Masuk Kasir + DP + Pelunasan Piutang) - (Beli Part Tunai + Beban Kas Keluar + Bayar Hutang)
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Perubahan fisik saldo uang tunai dan rekening bank pada periode berjalan.
                  </p>
                </div>
              </div>

              {/* Kasus Nyata Contoh Perhitungan Laba Rugi Bulanan */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Contoh Simulasi Perhitungan Laba Rugi 1 Bulan Bengkel / Servis
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                    Kondisi Keuangan Sehat (Net Margin 38.75%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-white/10 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block">1. Total Omset (Gross Revenue)</span>
                    <strong className="text-white text-base">Rp 80.000.000</strong>
                    <div className="text-[10px] text-slate-300">• Jasa Servis: Rp 45.000.000<br />• Sparepart: Rp 35.000.000</div>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl space-y-1">
                    <span className="text-rose-300 text-[10px] block">2. HPP Sparepart (Modal Beli)</span>
                    <strong className="text-rose-300 text-base">- Rp 22.000.000</strong>
                    <div className="text-[10px] text-slate-300">Laba Kotor: <strong>Rp 58.000.000</strong><br />(Gross Margin: 72.5%)</div>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl space-y-1">
                    <span className="text-amber-300 text-[10px] block">3. Beban Operasional (OPEX)</span>
                    <strong className="text-amber-300 text-base">- Rp 27.000.000</strong>
                    <div className="text-[10px] text-slate-300">• Komisi Teknisi: Rp 15.000.000<br />• Sewa, Listrik, Internet: Rp 12.000.000</div>
                  </div>

                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl space-y-1">
                    <span className="text-emerald-300 text-[10px] block">4. Laba Bersih Akhir (Net Income)</span>
                    <strong className="text-emerald-400 text-base">Rp 31.000.000</strong>
                    <div className="text-[10px] text-emerald-200 font-bold">Net Profit Margin: 38.75%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GARANSI & RE-WORK SPK                                              */}
      {/* ========================================================================= */}
      {activeTab === 'sop_warranty' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>SOP Penanganan Komplain Pelanggan, Klaim Garansi & SPK Re-Work Rp 0</span>
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>Verifikasi Keabsahan Garansi Servis</span>
                </h3>
                <p>1. Saat pelanggan datang membawa unit yang kambuh, minta Nomor Nota SPK terdahulu atau cari berdasarkan Nomor Handphone / Nama Pelanggan di kolom pencarian.</p>
                <p>2. Cek tanggal selesai pengerjaan dan durasi masa garansi (misal 30 hari). Sistem menampilkan indikator apakah garansi <strong>Masih Berlaku (Active)</strong> atau <strong>Kadaluarsa (Expired)</strong>.</p>
                <p>3. <strong>Pemeriksaan Fisik:</strong> Pastikan segel garansi toko tidak sobek/rusak dan tidak ada tanda kerusakan baru yang diakibatkan kelalaian pengguna (jatuh, retak, atau terkena air).</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span>Penerbitan SPK Re-Work Garansi (Tarif Jasa Rp 0)</span>
                </h3>
                <p>1. Buka formulir SPK baru, pilih tipe pengerjaan <strong>"Klaim Garansi / Re-Work"</strong> dan masukkan nomor SPK induk referensi.</p>
                <p>2. Terapkan biaya jasa Rp 0 karena masih dalam masa garansi resmi toko.</p>
                <p>3. Tugaskan kembali ke teknisi yang menangani sebelumnya untuk dilakukan inspeksi ulang.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <span>Klaim Retur Suku Cadang Cacat Pabrik ke Vendor</span>
                </h3>
                <p>• Jika setelah dibongkar ternyata suku cadang baru mengalami cacat produksi pabrik (factory defective), buat dokumen retur suku cadang ke supplier terkait.</p>
                <p>• Ambil suku cadang pengganti dari gudang, pasang ke unit pelanggan, dan selesaikan pengetesan Quality Control (QC).</p>
              </div>
            </div>

            {/* FORMULA SECTION GARANSI */}
            <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  📐 Kamus Rumus Garansi, Defect Rate & Dampak Finansial Re-Work
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-900">1. Rasio Klaim Garansi (Warranty Claim Rate)</span>
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-800 rounded text-[10px] font-bold">Kualitas QC</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-rose-100 font-mono text-[11px] text-rose-950">
                    <strong>Claim Rate % =</strong> (Total SPK Klaim Garansi ÷ Total SPK Selesai) × 100%
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block">Indikator Kualitas:</strong>
                    <p>• <strong>&lt; 3%:</strong> Kualitas sangat prima / QC handal</p>
                    <p>• <strong>3% - 7%:</strong> Normal industri servis elektronik / otomotif</p>
                    <p>• <strong>&gt; 7%:</strong> Wajib audit skill teknisi & kualitas suku cadang supplier</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">2. Beban Biaya Re-Work terhadap Workshop</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-[10px] font-bold">Beban Garansi</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-amber-100 font-mono text-[11px] text-amber-950">
                    <strong>Beban Toko =</strong> (HPP Part Baru + Jam Kerja Teknisi) - Klaim Retur Supplier
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 block">Prinsip Akuntansi:</strong>
                    <p>Ketika garansi diklaim, tarif jasa pelanggan adalah Rp 0. Jika ada penggantian part yang tidak bisa diretur ke supplier, HPP part baru dicatat sebagai Beban Garansi Operasional.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: PENGATURAN, API & WEBHOOK                                          */}
      {/* ========================================================================= */}
      {activeTab === 'sop_settings_api' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Code className="w-6 h-6 text-indigo-600" />
              <span>SOP Pengaturan Profil Bengkel, Cetak Nota, API Key & Webhook Realtime</span>
            </h2>
            <p className="text-xs text-slate-500">
              Menu Utama: <strong>Pengaturan (`/jasa/settings`)</strong> dan <strong>Pengembang & API (`/jasa/developer-api`)</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span>1. SOP Pengaturan Profil & Struk Nota (/jasa/settings)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• <strong>Profil Usaha:</strong> Masukkan Nama Toko/Bengkel, Alamat Lengkap, Nomor Kontak WhatsApp Resmi, dan Logo Usaha.</p>
                  <p>• <strong>Kustomisasi Nota Struk:</strong> Tambahkan teks catatan kaki (Footer Terms) seperti: <em>"Barang servis yang tidak diambil dalam 60 hari di luar tanggung jawab toko. Garansi berlaku 30 hari sejak tanggal selesai."</em></p>
                  <p>• <strong>Ukuran Kertas Printer:</strong> Pilih lebar printer kasir default (*Thermal 58mm*, *Thermal 80mm*, atau *A4 Printer*).</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>2. SOP Integrasi External REST API (/jasa/developer-api)</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Buka tab <strong>Kunci API (API Keys)</strong>, klik tombol <strong>"Buat Kunci API Baru"</strong>.</p>
                  <p>• Simpan token rahasia (Secret Key). Gunakan header <code>Authorization: Bearer {'<TOKEN>'}</code> pada aplikasi eksternal Anda.</p>
                  <p>• <strong>Endpoint Tersedia:</strong></p>
                  <p className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                    GET /api/v1/external/work-orders<br/>
                    POST /api/v1/external/work-orders<br/>
                    GET /api/v1/external/services<br/>
                    GET /api/v1/external/technicians
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 md:col-span-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>3. SOP Konfigurasi Webhook Endpoint Realtime</span>
                </h3>
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>• Buka tab <strong>Webhooks</strong>, klik tombol <strong>"Tambah Webhook Endpoint"</strong>.</p>
                  <p>• Masukkan URL target server Anda (misal: `https://api.bisnisanda.com/webhook/bizora-jasa`).</p>
                  <p>• Centang event yang ingin dimonitor: <strong>work_order.created</strong> (saat ada SPK baru masuk), <strong>work_order.completed</strong> (saat servis selesai pengerjaan), dan <strong>work_order.paid</strong> (saat nota dilunasi di kasir).</p>
                  <p>• Sistem Bizora akan secara otomatis mengirimkan payload JSON via HTTP POST setiap kali event tersebut berlangsung.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: FITUR SEKTOR INDUSTRI                                              */}
      {/* ========================================================================= */}
      {activeTab === 'industry_presets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Dynamic Business Engine</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Kustomisasi Format Sektor: {terms.categoryName}</h2>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                Mode Industri Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kamus Terminologi yang Diterapkan</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span>Sebutan Pekerja / Tenaga Ahli:</span>
                    <strong className="text-slate-900">{terms.technicianLabel}</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span>Objek Servis / Pengerjaan:</span>
                    <strong className="text-slate-900">{terms.unitLabel}</strong>
                  </li>
                  <li className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span>Dokumen Surat Perintah Kerja:</span>
                    <strong className="text-slate-900">{terms.workOrderLabel}</strong>
                  </li>
                  <li className="flex justify-between pb-1.5">
                    <span>Material / Suku Cadang:</span>
                    <strong className="text-slate-900">{terms.sparepartLabel}</strong>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Kolom Input Khusus Sektor Ini</span>
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

            {/* Matrix 6 Sektor Industri */}
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Adaptasi 6 Sektor Bisnis Jasa di Bizora:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Servis Elektronik & Laptop / HP',
                    icon: Smartphone,
                    unit: 'Merk, Model & No Seri / IMEI',
                    field1: 'Kapasitas RAM / Storage',
                    field2: 'Status Segel / Water Damage',
                    desc: 'Pengujian IC power, reball chip, ganti LCD touch screen, bypass software, hingga pemulihan data.'
                  },
                  {
                    name: 'Bengkel Mobil & Sepeda Motor',
                    icon: Car,
                    unit: 'Nomor Polisi & Merk Kendaraan',
                    field1: 'Kilometer (KM) Odometer',
                    field2: 'Nomor Rangka & Mesin',
                    desc: 'Tune up, servis berkala, ganti oli transmisi, overhaul mesin, kampas rem, dan diagnosa scanner ECU.'
                  },
                  {
                    name: 'Teknisi AC, Kulkas & HVAC',
                    icon: Snowflake,
                    unit: 'Tipe Unit AC & Kapasitas PK',
                    field1: 'Jenis Freon (R32 / R410 / R22)',
                    field2: 'Tekanan PSI & Ampere Kompresor',
                    desc: 'Cuci steam evaporator indoor/outdoor, flushing instalasi pipa, tambah freon, ganti kapasitor kipas.'
                  },
                  {
                    name: 'Laundry Kiloan & Dry Cleaning',
                    icon: Shirt,
                    unit: 'Berat Timbangan (Kg) / Pcs',
                    field1: 'Pilihan Aroma Pewangi',
                    field2: 'Instruksi Khusus (Pisah Luntur)',
                    desc: 'Cuci lipat kilat, setrika uap presisi, dry clean jas formal, pencucian karpet tebal, dan laundry helm.'
                  },
                  {
                    name: 'Tailor, Modiste & Konveksi Jahit',
                    icon: Scissors,
                    unit: 'Jenis Busana & Kain Bawaan',
                    field1: 'Ukuran Lingkar Dada & Bahu (cm)',
                    field2: 'Panjang Lengan & Celana (cm)',
                    desc: 'Potong bahan, obras kelim, pembuatan pola kemeja/gamis kustom, seragam kantor, hingga vermak ukuran.'
                  },
                  {
                    name: 'Kontraktor, Tukang & Proyek Jasa',
                    icon: Building2,
                    unit: 'Nama Lokasi Proyek / Gedung',
                    field1: 'Luas Area Kerja (m²)',
                    field2: 'Estimasi Durasi Hari Kerja',
                    desc: 'Pengecatan dinding, instalasi kabel listrik, renovasi partisi gypsum, waterproofing atap bocor, dan plumbing.'
                  },
                ].map(ind => {
                  const Icon = ind.icon;
                  return (
                    <div key={ind.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{ind.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-600">{ind.desc}</p>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[10px] space-y-1">
                        <div className="text-slate-500 font-medium">Objek: <strong className="text-slate-800">{ind.unit}</strong></div>
                        <div className="text-slate-500 font-medium">Spesifikasi: <strong className="text-slate-800">{ind.field1} & {ind.field2}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: SIMULATOR LABA & KOMISI INTERAKTIF                                */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <Calculator className="w-6 h-6 text-indigo-600" />
                  <span>Kalkulator & Simulator Interaktif Bagi Hasil SPK Jasa</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Simulasikan biaya jasa, penjualan suku cadang, modal HPP, dan bagi hasil komisi teknisi secara realtime dengan preset industri.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                Kalkulator Realtime
              </span>
            </div>

            {/* Quick Industry Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Pilih Preset Cepat Industri:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: 'elektronik', name: 'Elektronik / HP', icon: Smartphone },
                  { id: 'otomotif', name: 'Bengkel Otomotif', icon: Car },
                  { id: 'ac', name: 'Servis AC & HVAC', icon: Snowflake },
                  { id: 'laundry', name: 'Laundry Kiloan', icon: Shirt },
                  { id: 'tailor', name: 'Jahit / Konveksi', icon: Scissors },
                  { id: 'kontraktor', name: 'Proyek Kontraktor', icon: Building2 },
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applySimPreset(p.id)}
                      className="px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
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
                        Harga Jual Suku Cadang (Rp)
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
                      Beban Bahan Habis Pakai / Konsumabel (Rp)
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
                    Hasil Analisis Keuangan SPK
                  </span>

                  <div className="space-y-3 font-mono text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-slate-300">
                      <span>Total Tagihan ke Pelanggan:</span>
                      <strong className="text-white text-sm">{fmtRp(simTotalBilled)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Tarif Jasa (Ongkos Kerja):</span>
                      <span>{fmtRp(simJasaFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Harga Suku Cadang:</span>
                      <span>{fmtRp(simPartSale)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-rose-300">
                      <span>1. Modal Beli Part (HPP):</span>
                      <span>- {fmtRp(simPartCost)}</span>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>2. Komisi Teknisi:</span>
                      <span className="font-bold">{fmtRp(simTechCommission)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>3. Biaya Bahan Habis Pakai:</span>
                      <span>- {fmtRp(simOperationalCost)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-emerald-400 font-mono">
                      <span className="text-xs font-bold uppercase">Laba Bersih Bengkel:</span>
                      <span className="text-xl font-extrabold">{fmtRp(simNetProfitWorkshop)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>Profit Margin Bersih:</span>
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
                      ? `Transaksi ini menghasilkan laba bersih ${fmtRp(simNetProfitWorkshop)} (${simNetMargin}%) untuk workshop setelah teknisi menerima hak komisi sebesar ${fmtRp(simTechCommission)}.`
                      : 'Total biaya modal suku cadang dan komisi teknisi melebihi nilai yang ditagihkan ke pelanggan! Naikkan tarif jasa atau sesuaikan skema komisi teknisi.'}
                  </p>
                </div>

                {/* Mathematical Formula Breakdown */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rumus Matematika yang Berjalan di Simulator Ini:</span>
                  </span>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <div>1. Total Tagihan = Tarif Jasa + Harga Jual Suku Cadang</div>
                    <div>2. Komisi Teknisi = {simCommType === 'percent' ? `Tarif Jasa × ${simCommRate}%` : `Flat ${fmtRp(simCommFlat)}`}</div>
                    <div>3. Total Biaya Pokok = Modal Part (HPP) + Komisi Teknisi + Bahan Konsumabel</div>
                    <div>4. Laba Bersih Bengkel = Total Tagihan - Total Biaya Pokok</div>
                    <div>5. Profit Margin % = (Laba Bersih ÷ Total Tagihan) × 100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

