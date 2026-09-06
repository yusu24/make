import React, { useState } from 'react';
import { 
  BookOpen, 
  ShoppingBag, 
  Package, 
  Truck, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Globe, 
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface SellerGuideViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const SellerGuideView: React.FC<SellerGuideViewProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'channels' | 'shipping' | 'stock' | 'analytics'>('flow');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan & SOP Seller Omnichannel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panduan Cara Penggunaan Modul Seller
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed">
            Pelajari alur sinkronisasi multi-toko marketplace (Shopee, Tokopedia, TikTok Shop, Lazada), manajemen antrean order terpusat, cetak label resi massal, dan analitik profit per channel.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'flow', label: '1. Alur Kerja Order Masuk', icon: ShoppingBag },
          { id: 'channels', label: '2. Integrasi Toko Marketplace', icon: Globe },
          { id: 'shipping', label: '3. Cetak Resi & Pengiriman', icon: Truck },
          { id: 'stock', label: '4. Sinkronisasi Stok Gudang', icon: Package },
          { id: 'analytics', label: '5. Analitik Laba & Performa', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Alur Kerja Order Masuk */}
      {activeTab === 'flow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              <span>SOP Pemrosesan Order Masuk dari Semua Marketplace</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Order Masuk Terpusat',
                  desc: 'Pesanan dari Shopee, Tokopedia, TikTok Shop, dan Lazada masuk otomatis ke satu layar antrean "Semua Pesanan".',
                },
                {
                  step: '2',
                  title: 'Packing & Verifikasi',
                  desc: 'Gunakan fitur Scan Barcode untuk memvalidasi item yang dipacking agar tidak terjadi salah kirim varian atau jumlah.',
                },
                {
                  step: '3',
                  title: 'Cetak Resi Massal',
                  desc: 'Pilih beberapa pesanan sekaligus, lalu klik "Cetak Label Resi Thermal" (format 100x150mm otomatis dengan barcode kurir).',
                },
                {
                  step: '4',
                  title: 'Serah Terima Kurir',
                  desc: 'Serahkan paket ke kurir ekspedisi (J&T, SiCepat, JNE, SPX, Anteraja) dan buat Manifest Serah Terima.',
                }
              ].map(card => (
                <div key={card.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {card.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900">
              <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block">Tips Efisiensi Gudang:</strong>
                <p>Gunakan fitur Cetak Lembar Ambil Barang (*Pick List*) sebelum packing agar staf gudang dapat mengambil seluruh barang pesanan sekaligus dalam 1 kali putaran.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Integrasi Channel */}
      {activeTab === 'channels' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-teal-600" />
              <span>Cara Menghubungkan Toko Marketplace</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Langkah Otorisasi Toko:</h3>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Buka menu <strong>Marketplace & Integrasi</strong> di sidebar kiri.</li>
                  <li>Pilih channel yang ingin dihubungkan (Shopee, Tokopedia, TikTok Shop, atau Lazada).</li>
                  <li>Klik <strong>Hubungkan Toko</strong> dan login menggunakan akun seller resmi Anda.</li>
                  <li>Berikan izin sinkronisasi produk, stok, dan pesanan.</li>
                  <li>Status toko akan berubah menjadi <strong className="text-emerald-600">Terhubung (Aktif)</strong>.</li>
                </ol>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Manfaat Integrasi Multi-Store:</h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li>• Tidak perlu lagi membuka banyak tab browser berbeda.</li>
                  <li>• Mengurangi risiko penalti pembatalan akibat stok kosong (*Out of Stock*).</li>
                  <li>• Update harga massal (*Bulk Price Update*) ke seluruh channel dalam hitungan detik.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Cetak Resi & Pengiriman */}
      {activeTab === 'shipping' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Truck className="w-6 h-6 text-blue-600" />
              <span>Manajemen Ekspedisi & Cetak Resi Massal</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Modul Seller terintegrasi langsung dengan printer thermal 100x150mm untuk mencetak label resi pengiriman standar kurir nasional.
            </p>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Fitur Pengiriman yang Tersedia:</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• <strong>Bulk AWB Generation</strong>: Mendapatkan nomor resi untuk ratusan paket sekaligus.</li>
                <li>• <strong>Cetak Manifest Driver</strong>: Dokumen serah terima bertanda tangan kurir untuk klaim kehilangan paket.</li>
                <li>• <strong>Pelacakan Paket Terkirim</strong>: Memantau apakah paket sudah *In Transit*, *Delivered*, atau mengalami kendala *Return / Retur*.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Sinkronisasi Stok Gudang */}
      {activeTab === 'stock' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-amber-600" />
              <span>Sistem Single-Stock Multi-Marketplace</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Dengan arsitektur *Single-Stock Pooling*, Anda tidak perlu membagi stok fisik per toko. 
                Contoh: Anda memiliki 100 unit di gudang utama. Ketika terjual 5 unit di Shopee dan 2 unit di TikTok Shop, 
                sistem secara otomatis menurunkan stok di Tokopedia dan Lazada menjadi 93 unit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Analitik Laba & Performa */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <span>Laporan Finansial Bersih Per Channel</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Menu Laporan membedah omset kotor vs profit bersih setelah dipotong biaya admin marketplace, biaya komisi affiliate TikTok/Shopee, dan ongkos kirim.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
