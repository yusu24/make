import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Settings, 
  Package, 
  ShoppingBag, 
  Store, 
  Boxes, 
  Calculator, 
  ChevronRight, 
  Search, 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  PlayCircle, 
  Truck, 
  Database, 
  Users, 
  Globe, 
  Printer, 
  Link, 
  ShieldCheck, 
  LayoutDashboard, 
  Layers, 
  RefreshCw, 
  History, 
  ChevronDown,
  Percent,
  Coins,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Tag,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const GuideView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'flow' | 'channels' | 'stock' | 'shipping' | 'marketplace-fees' | 'finance-formulas' | 'simulator'>('flow');

  // Simulator State
  const [simChannel, setSimChannel] = useState<'shopee' | 'tokopedia' | 'tiktok' | 'lazada' | 'offline'>('shopee');
  const [simProductCost, setSimProductCost] = useState<number>(85000); // Modal beli HPP
  const [simTargetProfit, setSimTargetProfit] = useState<number>(35000); // Keuntungan bersih diinginkan
  const [simPackagingCost, setSimPackagingCost] = useState<number>(3000); // Kardus & Bubble
  const [simAdminFeeRate, setSimAdminFeeRate] = useState<number>(6.5); // % Biaya Admin
  const [simExtraOngkirRate, setSimExtraOngkirRate] = useState<number>(4.0); // % Gratis Ongkir XTRA
  const [simAffiliateRate, setSimAffiliateRate] = useState<number>(5.0); // % Komisi Afiliasi (jika ikut)
  const [simIncludeAffiliate, setSimIncludeAffiliate] = useState<boolean>(true);
  const [simVoucherDiscount, setSimVoucherDiscount] = useState<number>(0); // Diskon subsidi toko

  // Preset channel rates
  const handleChannelChange = (channel: 'shopee' | 'tokopedia' | 'tiktok' | 'lazada' | 'offline') => {
    setSimChannel(channel);
    if (channel === 'shopee') {
      setSimAdminFeeRate(6.5);
      setSimExtraOngkirRate(4.0);
    } else if (channel === 'tokopedia') {
      setSimAdminFeeRate(6.0);
      setSimExtraOngkirRate(3.5);
    } else if (channel === 'tiktok') {
      setSimAdminFeeRate(6.0);
      setSimExtraOngkirRate(4.5);
    } else if (channel === 'lazada') {
      setSimAdminFeeRate(5.0);
      setSimExtraOngkirRate(3.0);
    } else {
      setSimAdminFeeRate(0);
      setSimExtraOngkirRate(0);
      setSimAffiliateRate(0);
    }
  };

  // Simulator Calculation:
  // Net Settlement = SellingPrice - MarketplaceFees - VoucherDiscount
  // Net Profit = Net Settlement - ProductCost - PackagingCost = TargetProfit
  // Total Fee Rate % = AdminFeeRate + ExtraOngkirRate + (simIncludeAffiliate ? AffiliateRate : 0)
  // SellingPrice * (1 - TotalFeeRate/100) = ProductCost + PackagingCost + TargetProfit + VoucherDiscount
  const totalFeeRatePercent = (simAdminFeeRate + simExtraOngkirRate + (simIncludeAffiliate ? simAffiliateRate : 0));
  const multiplier = Math.max(0.1, 1 - (totalFeeRatePercent / 100));
  const baseCostAndProfit = simProductCost + simPackagingCost + simTargetProfit + simVoucherDiscount;
  const simRecommendedSellingPrice = Math.ceil(baseCostAndProfit / multiplier);

  // Detailed deductions on recommended selling price:
  const simNominalAdmin = Math.round(simRecommendedSellingPrice * (simAdminFeeRate / 100));
  const simNominalExtra = Math.round(simRecommendedSellingPrice * (simExtraOngkirRate / 100));
  const simNominalAffiliate = simIncludeAffiliate ? Math.round(simRecommendedSellingPrice * (simAffiliateRate / 100)) : 0;
  const simTotalMarketplaceDeduction = simNominalAdmin + simNominalExtra + simNominalAffiliate;
  const simNetSettlement = simRecommendedSellingPrice - simTotalMarketplaceDeduction - simVoucherDiscount;
  const simRealizedNetProfit = simNetSettlement - simProductCost - simPackagingCost;
  const simMarginPercent = simRecommendedSellingPrice > 0 ? ((simRealizedNetProfit / simRecommendedSellingPrice) * 100).toFixed(1) : '0';

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan, SOP & Rumus Seller Omnichannel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Operasional Toko Online & Omnichannel
            </h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              Panduan lengkap operasional multi-channel: sinkronisasi stok master SKU (Shopee, Tokopedia, TikTok, Lazada, Offline POS), cetak label thermal AWB, rumus potongan marketplace, hingga simulator penentuan harga jual.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/seller/marketplace')}
            className="px-5 py-3 bg-white text-teal-700 hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Pusat Sinkronisasi Toko</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'flow', label: '1. Alur Kerja Pesanan Omnichannel', icon: ShoppingBag },
          { id: 'channels', label: '2. Integrasi & Aturan Sinkronisasi', icon: Globe },
          { id: 'stock', label: '3. Gudang & Stock Opname', icon: Package },
          { id: 'shipping', label: '4. Cetak Resi Massal & Manifest', icon: Truck },
          { id: 'marketplace-fees', label: '5. Struktur Biaya Marketplace', icon: Percent },
          { id: 'finance-formulas', label: '6. Rumus Laba Rugi & Net Settlement', icon: Coins },
          { id: 'simulator', label: '🧮 7. Simulator Potongan & Harga Jual', icon: Calculator },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALUR KERJA PESANAN OMNICHANNEL */}
      {activeTab === 'flow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <ShoppingBag className="w-6 h-6 text-teal-600" />
                  <span>SOP Pemrosesan Pesanan Masuk (Order Fulfillment)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Alur terpusat dari transaksi online (Shopee/Tokopedia/TikTok) dan Kasir Fisik (POS).
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/seller/orders')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Buka Daftar Pesanan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Order Masuk (Single Pool)',
                  desc: 'Pesanan dari seluruh marketplace & POS masuk otomatis ke tab "Perlu Diproses". Stok gudang di-lock (reserved).',
                  badge: 'Auto Inbound'
                },
                {
                  step: '2',
                  title: 'Konfirmasi & Terima Pesanan',
                  desc: 'Klik "Terima Pesanan" untuk memesan nomor resi otomatis dari sistem ekspedisi marketplace terkait.',
                  badge: 'Validation'
                },
                {
                  step: '3',
                  title: 'Packing & Cetak AWB Termal',
                  desc: 'Staf gudang mengemas barang, mencetak label resi 100x150mm secara massal, dan menempelkan barcode.',
                  badge: 'Packing Station'
                },
                {
                  step: '4',
                  title: 'Handover / Request Pickup',
                  desc: 'Serahkan paket ke kurir atau drop-off ke gerai ekspedisi. Cetak Lembar Manifest Driver sebagai tanda terima fisik.',
                  badge: 'Dispatch'
                },
              ].map(card => (
                <div key={card.step} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 hover:border-teal-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {card.step}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {card.badge}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{card.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block">SOP Pencegahan Double Booking:</strong>
                <p>Ketika pesanan masuk dari Shopee 1 unit, Bizora seketika memotong kuota stok di Tokopedia dan TikTok Shop secara otomatis dalam hitungan detik untuk mencegah pembatalan pesanan akibat stok kosong (out-of-stock penalty).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTEGRASI & ATURAN SINKRONISASI */}
      {activeTab === 'channels' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-teal-600" />
              <span>Aturan Pemetaan Master SKU & Single-Pool Stock Sync</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Kunci Utama: Kesamaan Kode Master SKU</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Agar sistem Bizora dapat mengenali bahwa <em>Baju Gamis Merah Ukuran L</em> di Shopee sama dengan di TikTok Shop, pastikan Anda memberikan <strong>Kode SKU yang persis sama</strong> (huruf besar/kecil & tanda hubung) pada menu <strong>Pemetaan Produk</strong>.
                </p>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-teal-700 dark:text-teal-300">
                  Master SKU Pusat: GMS-RED-L ➔ Sync ke Shopee, Tokopedia, TikTok
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Rumus Safety Buffer Stock</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Untuk mengantisipasi pesanan offline yang sedang antre di kasir fisik, Anda dapat menerapkan persentase atau batas cadangan stok aman (Buffer Stock):
                </p>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-teal-700 dark:text-teal-300">
                  Stok Sync Marketplace = Maksimal(0, Stok Fisik Gudang - Safety Buffer)
                </div>
                <div className="text-[11px] text-slate-500">
                  <em>Contoh: Stok Gudang 10 pcs, Safety Buffer 2 pcs ➔ Stok yang tampil di Shopee/TikTok = <strong>8 pcs</strong>.</em>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Shopee Open API', status: 'Terhubung', color: 'text-orange-600' },
                { name: 'Tokopedia / TikTok Shop', status: 'Terhubung', color: 'text-emerald-600' },
                { name: 'Lazada Open Platform', status: 'Terhubung', color: 'text-blue-600' },
                { name: 'Offline Kasir POS', status: 'Sinkron Instan', color: 'text-indigo-600' },
              ].map(chan => (
                <div key={chan.name} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <div className={`text-xs font-extrabold ${chan.color}`}>{chan.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{chan.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GUDANG & STOCK OPNAME */}
      {activeTab === 'stock' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Package className="w-6 h-6 text-teal-600" />
              <span>SOP Manajemen Gudang, Inbound Restock & Stock Opname</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Penerimaan Barang (Inbound)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gunakan menu <strong>Penerimaan Barang</strong> saat kulakan barang baru dari supplier. Sistem akan mengakumulasi stok dan memperbarui HPP modal secara otomatis.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stok Terkunci (Booking Stock)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ketika ada order masuk yang belum dipack, kuota stok tersebut berada di status <em>Reserved</em> agar tidak dijual dua kali ke pelanggan lain.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Stock Opname</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Lakukan audit fisik berkala di menu <strong>Stock Opname</strong>. Selisih barang (rusak/hilang) akan dicatat sebagai beban operasional (Loss).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <h3 className="text-xs font-extrabold text-teal-400 uppercase tracking-wider">
                Rumus Perhitungan HPP Modal Rata-Rata (Weighted Average Cost):
              </h3>
              <div className="p-3 bg-slate-800 rounded-xl font-mono text-xs text-teal-300">
                HPP Baru = ((Stok Lama × HPP Lama) + (Qty Masuk × Harga Kulakan Baru)) ÷ (Stok Lama + Qty Masuk)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CETAK RESI MASSAL & MANIFEST */}
      {activeTab === 'shipping' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Truck className="w-6 h-6 text-teal-600" />
              <span>SOP Cetak Label Resi Thermal AWB & Manifest Driver</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-teal-600" />
                  <span>1. Format Standar Label Thermal (100x150mm)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sistem mendukung cetak massal hingga 100 resi sekaligus dalam format 4x6 inci (100x150mm). Label memuat Barcode Resi, Nama Penerima, Alamat Lengkap, Ekspedisi (J&T, SiCepat, SPX, JNE, Ninja), dan Item Pesanan.
                </p>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                  Tips: Gunakan printer Direct Thermal Bluetooth/USB dengan densitas 203 DPI untuk hasil scan barcode yang tajam.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  <span>2. Cetak Lembar Manifest Driver Pickup</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sebelum paket diserahkan ke kurir jemputan (pickup), cetak lembar <strong>Manifest Serah Terima</strong>. Driver wajib menandatangani jumlah paket yang diterima sebagai bukti legal jika terjadi kehilangan barang di jalan.
                </p>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                  Dokumen manifest mencakup: Nomor Resi, Ekspedisi, Nama Buyer, dan Kolom Tanda Tangan Kurir.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STRUKTUR BIAYA MARKETPLACE */}
      {activeTab === 'marketplace-fees' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Percent className="w-6 h-6 text-teal-600" />
              <span>Struktur Komponen Potongan & Biaya Layanan Marketplace</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 space-y-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">4.5% - 8.5%</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Biaya Administrasi Non-Star / Star / Mall</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Dikenakan dari harga produk per kategori barang (Fashion, Elektronik, FMCG).</p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">3.5% - 5.0%</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Program Gratis Ongkir XTRA</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Biaya partisipasi agar toko Anda mendapatkan badge Gratis Ongkir XTRA bagi pembeli.</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">5.0% - 15.0%</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Komisi Afiliasi (TikTok / Shopee)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Bagi hasil untuk kreator konten / influencer yang mempromosikan keranjang kuning produk Anda.</p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">Rp 1.000 - Rp 3.000</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Biaya Layanan Transaksi Pembeli</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Biaya penanganan sistem per transaksi berhasil yang dipotong marketplace.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <strong className="font-bold block">Peringatan Bahaya "Perang Harga Tanpa Hitung Fee":</strong>
              <p>Total potongan marketplace dapat mencapai 12% hingga 18% dari harga jual kotor. Jika margin kotor produk Anda hanya 10%, maka setiap transaksi yang terjadi justru menimbulkan kerugian finansial!</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RUMUS LABA RUGI & NET SETTLEMENT */}
      {activeTab === 'finance-formulas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Coins className="w-6 h-6 text-teal-600" />
              <span>Rumus Keuangan Seller & Penentuan Harga Jual Efektif</span>
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Rumus Net Settlement (Dana Bersih Masuk Saldo Rekening)</h3>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-teal-700 dark:text-teal-300">
                  Dana Cair = Harga Jual - (Biaya Admin + Biaya XTRA + Komisi Afiliasi + Voucher Diskon Toko)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Rumus Menentukan Harga Jual Online (Target Net Profit)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Agar Anda mendapatkan laba bersih sesuai target setelah dipotong seluruh fee marketplace dan biaya packaging kardus:
                </p>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-indigo-700 dark:text-indigo-300">
                  Harga Jual Rekomendasi = (HPP Modal + Biaya Kemasan + Target Laba Bersih) ÷ (1 - Total % Potongan Marketplace)
                </div>
                <div className="text-[11px] text-slate-500">
                  <em>Contoh: HPP Rp 85.000, Packing Rp 3.000, Ingin Laba Rp 35.000, Total Fee 15.5% (0.155):<br />
                  Harga Jual = (85.000 + 3.000 + 35.000) ÷ (1 - 0.155) = 123.000 ÷ 0.845 = <strong>Rp 145.562</strong> (dibulatkan Rp 146.000).</em>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Rumus Rasio Retur & Kegagalan COD (Return Rate)</h3>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-rose-700 dark:text-rose-300">
                  Rasio Retur % = (Jumlah Paket Gagal Kirim COD ÷ Total Paket Terkirim) × 100%
                </div>
                <p className="text-xs text-slate-500">
                  Ambang batas aman rasio retur COD toko online adalah di bawah <strong>5%</strong>. Di atas 8% memerlukan audit ekspedisi atau non-aktifkan opsi COD pada wilayah berisiko tinggi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SIMULATOR POTONGAN & HARGA JUAL */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Calculator className="w-6 h-6 text-teal-600" />
                  <span>Kalkulator & Simulator Harga Jual Marketplace Interaktif</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hitung otomatis biaya admin, gratis ongkir, komisi affiliate, dan harga jual agar profit bersih tidak tergerus.
                </p>
              </div>
              <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-full text-xs font-bold">
                Kalkulator Realtime
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Input Form */}
              <div className="lg:col-span-6 space-y-4 bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pilih Channel & Parameter Biaya
                </h3>

                {/* Channel Selector */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'shopee', label: 'Shopee' },
                    { id: 'tokopedia', label: 'Tokopedia' },
                    { id: 'tiktok', label: 'TikTok Shop' },
                    { id: 'lazada', label: 'Lazada' },
                    { id: 'offline', label: 'Toko Fisik (POS)' },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleChannelChange(ch.id as any)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all text-center ${
                        simChannel === ch.id
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        HPP Modal Beli (Rp)
                      </label>
                      <input
                        type="number"
                        value={simProductCost}
                        onChange={(e) => setSimProductCost(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Laba Bersih (Rp)
                      </label>
                      <input
                        type="number"
                        value={simTargetProfit}
                        onChange={(e) => setSimTargetProfit(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Biaya Packing (Dus/Bubble)
                      </label>
                      <input
                        type="number"
                        value={simPackagingCost}
                        onChange={(e) => setSimPackagingCost(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Voucher Subsidi Toko (Rp)
                      </label>
                      <input
                        type="number"
                        value={simVoucherDiscount}
                        onChange={(e) => setSimVoucherDiscount(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Fee Rates */}
                  <div className="border-t border-slate-200 dark:border-slate-700/60 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Biaya Admin:</span>
                          <span className="font-extrabold text-teal-600">{simAdminFeeRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          step="0.5"
                          value={simAdminFeeRate}
                          onChange={(e) => setSimAdminFeeRate(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Gratis Ongkir XTRA:</span>
                          <span className="font-extrabold text-teal-600">{simExtraOngkirRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={simExtraOngkirRate}
                          onChange={(e) => setSimExtraOngkirRate(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={simIncludeAffiliate}
                            onChange={(e) => setSimIncludeAffiliate(e.target.checked)}
                            className="rounded accent-teal-600"
                          />
                          <span>Sertakan Komisi Afiliasi (Influencer)</span>
                        </label>
                        {simIncludeAffiliate && (
                          <span className="text-xs font-extrabold text-purple-600">{simAffiliateRate}%</span>
                        )}
                      </div>
                      {simIncludeAffiliate && (
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="1"
                          value={simAffiliateRate}
                          onChange={(e) => setSimAffiliateRate(Number(e.target.value))}
                          className="w-full accent-purple-600 cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Breakdown */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Rekomendasi Harga Jual ({simChannel.toUpperCase()})
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700">
                      Total Potongan {totalFeeRatePercent}%
                    </span>
                  </div>

                  <div className="p-4 bg-teal-950/80 rounded-xl border border-teal-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-teal-300 block font-semibold">Harga Jual Yang Harus Dipasang:</span>
                      <strong className="text-2xl font-black text-white font-mono">
                        Rp {simRecommendedSellingPrice.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <Tag className="w-8 h-8 text-teal-400 shrink-0" />
                  </div>

                  <div className="space-y-2 font-mono text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-rose-300">
                      <span>• Potongan Biaya Admin ({simAdminFeeRate}%):</span>
                      <span>- Rp {simNominalAdmin.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-teal-300">
                      <span>• Potongan Gratis Ongkir ({simExtraOngkirRate}%):</span>
                      <span>- Rp {simNominalExtra.toLocaleString('id-ID')}</span>
                    </div>
                    {simIncludeAffiliate && (
                      <div className="flex justify-between text-purple-300">
                        <span>• Potongan Komisi Afiliasi ({simAffiliateRate}%):</span>
                        <span>- Rp {simNominalAffiliate.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {simVoucherDiscount > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span>• Potongan Voucher Toko:</span>
                        <span>- Rp {simVoucherDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 font-mono text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-slate-300">
                      <span>Dana Cair Bersih (Net Settlement):</span>
                      <strong className="text-white">Rp {simNetSettlement.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Modal Beli Barang (HPP):</span>
                      <span>- Rp {simProductCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>• Biaya Kemasan (Dus & Bubble):</span>
                      <span>- Rp {simPackagingCost.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-emerald-400 font-mono">
                      <span className="text-xs font-bold uppercase">Laba Bersih Toko (Net Profit):</span>
                      <span className="text-xl font-extrabold">Rp {simRealizedNetProfit.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>Net Profit Margin:</span>
                      <span className="font-bold text-emerald-300">{simMarginPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Practical Insight */}
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                  <strong className="font-bold block">✓ Kesimpulan Simulasi:</strong>
                  <p>
                    Dengan memasang harga jual <strong>Rp {simRecommendedSellingPrice.toLocaleString('id-ID')}</strong> di {simChannel}, toko Anda tetap mengantongi laba bersih aman sebesar <strong>Rp {simRealizedNetProfit.toLocaleString('id-ID')} ({simMarginPercent}%)</strong> setelah dipotong seluruh biaya administrasi marketplace dan operasional kemasan.
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
