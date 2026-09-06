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
  Smartphone, 
  Car, 
  Snowflake, 
  Shirt, 
  Scissors, 
  FileText,
  Printer,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useJasa } from '../contexts/JasaContext';
import { JasaCategoryType } from '../hooks/useJasaTerms';
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
  const [activeSection, setActiveSection] = useState<'flow' | 'category' | 'ai' | 'pos' | 'settings'>('flow');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan & SOP Operasional Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Cara Penggunaan Modul Jasa
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Panduan lengkap langkah demi langkah operasional modul Jasa & Servis adaptif ({terms.categoryName}), mulai dari penerimaan order, diagnosa AI, kasir POS, hingga pelacakan status dan cetak nota.
            </p>
          </div>

          {isDemoAccount && (
            <button
              type="button"
              onClick={openPicker}
              className="px-5 py-3 bg-white text-indigo-700 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ganti Kategori Industri</span>
            </button>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'flow', label: '1. Alur Kerja SPK & Servis', icon: ClipboardList },
          { id: 'category', label: `2. Fitur Khusus ${terms.categoryName}`, icon: Layers },
          { id: 'ai', label: '3. Diagnosa AI Kerusakan', icon: Sparkles },
          { id: 'pos', label: '4. Kasir Penjualan Langsung', icon: CreditCard },
          { id: 'settings', label: '5. Pengaturan & Istilah', icon: Wrench },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
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

      {/* SECTION 1: Alur Kerja Utama */}
      {activeSection === 'flow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              <span>Standar Operasional Prosedur (SOP) Penerimaan Order</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: `Buat ${terms.workOrderLabel} Baru`,
                  desc: `Klik tombol "${terms.newWorkOrderBtn}", masukkan data pelanggan, identifikasi ${terms.unitLabel}, keluhan, dan kelengkapan unit.`,
                  action: onOpenNewSpk ? 'Buka Form' : undefined,
                  actionFn: onOpenNewSpk
                },
                {
                  step: '2',
                  title: 'Pemeriksaan & Estimasi',
                  desc: `Pilih ${terms.technicianLabel} penanggung jawab. Masukkan rincian diagnosa teknis dan estimasi biaya suku cadang (${terms.sparepartLabel}).`,
                  action: onOpenAiModal ? 'Coba Diagnosa AI' : undefined,
                  actionFn: onOpenAiModal
                },
                {
                  step: '3',
                  title: 'Pengerjaan & Suku Cadang',
                  desc: `Ubah status ke "Sedang Dikerjakan". Jika membutuhkan material tambahan, gunakan menu Gudang ${terms.sparepartsLabel}.`,
                },
                {
                  step: '4',
                  title: 'Pelunasan & Serah Terima',
                  desc: 'Ubah status ke "Selesai & Siap Ambil", terima pembayaran sisa tagihan di kasir, dan cetak Nota Tanda Terima resmi.',
                }
              ].map(card => (
                <div key={card.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-indigo-300 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {card.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                  {card.action && card.actionFn && (
                    <button
                      type="button"
                      onClick={card.actionFn}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{card.action}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block">Tips Penting Tanda Terima:</strong>
                <p>Selalu cetak atau simpan PDF bukti penerimaan SPK saat pelanggan menyerahkan barang/pesanan. Nota SPK memuat nomor tiket resmi, data kerusakan awal, dan disclaimer garansi.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Fitur Khusus Kategori Aktif */}
      {activeSection === 'category' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Kategori Aktif</span>
                <h2 className="text-xl font-extrabold text-slate-900">{terms.categoryName}</h2>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
                Mode Otomatis Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kamus Istilah yang Diterapkan</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li>• Pekerja Lapangan: <strong className="text-slate-900">{terms.technicianLabel}</strong></li>
                  <li>• Objek Servis / Pekerjaan: <strong className="text-slate-900">{terms.unitLabel}</strong></li>
                  <li>• Dokumen Pekerjaan: <strong className="text-slate-900">{terms.workOrderLabel}</strong></li>
                  <li>• Stok / Bahan: <strong className="text-slate-900">{terms.sparepartLabel}</strong></li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kolom Input Khusus Industri Ini</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li>• <strong>{terms.customField1Label}</strong> ({terms.customField1Placeholder})</li>
                  <li>• <strong>{terms.customField2Label}</strong> ({terms.customField2Placeholder})</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AI Diagnostics */}
      {activeSection === 'ai' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>Cara Menggunakan Asisten AI Diagnostics</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fitur AI Diagnostics membantu mengestimasi durasi pengerjaan, estimasi biaya jasa teknisi, dan rekomendasi suku cadang berdasarkan gejala kerusakan yang diceritakan pelanggan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900">Ketik Gejala / Masalah</h3>
                <p className="text-xs text-slate-600">Masukkan apa yang dirasakan pelanggan, misalnya "Layar retak bergaris hijau" atau "Mesin brebet saat gas ditarik".</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900">Analisis Otomatis</h3>
                <p className="text-xs text-slate-600">AI menghitung jam kerja, tingkat kesulitan perbaikan, serta komponen cadangan yang perlu disiapkan.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900">Terapkan ke SPK</h3>
                <p className="text-xs text-slate-600">Klik "Terapkan ke Form SPK" agar seluruh kalkulasi biaya dan rekomendasi langsung terisi ke formulir.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Kasir POS Penjualan Langsung */}
      {activeSection === 'pos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <span>Kasir POS Penjualan Langsung & Suku Cadang</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Selain menangani SPK servis yang berproses, modul Jasa memiliki menu <strong>Kasir (POS)</strong> untuk penjualan suku cadang langsung, aksesoris, atau jasa cepat yang langsung dibayar lunas di tempat.
            </p>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Langkah Transaksi Kasir POS:</h3>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                <li>Buka menu <strong>Kasir (POS)</strong> dari sidebar kiri.</li>
                <li>Klik item katalog jasa atau suku cadang untuk memasukkannya ke keranjang belanja.</li>
                <li>Pilih metode pembayaran (Tunai, Transfer, atau QRIS).</li>
                <li>Selesaikan transaksi dan cetak struk kasir thermal 58mm/80mm untuk pelanggan.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Pengaturan & Istilah */}
      {activeSection === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-purple-600" />
              <span>Pengaturan Profil Usaha & Kustomisasi Terminologi</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Pada menu <strong>Pengaturan Modul Jasa</strong>, Anda memiliki kendali penuh untuk:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Mengganti Bidang Industri</strong> kapan saja lewat kartu *Dynamic Service Engine*.</li>
                <li><strong>Mengubah Identitas Usaha</strong> (Nama Toko/Bengkel, No WhatsApp CS, Alamat Workshop, dan Slogan Nota).</li>
                <li><strong>Menyesuaikan Istilah Mandiri</strong> jika usaha Anda memiliki istilah lokal tersendiri.</li>
                <li><strong>Mengatur Master Kategori Layanan & Gudang</strong> untuk memudahkan dropdown input saat membuat SPK.</li>
                <li><strong>Mengunggah URL Gambar QRIS & Data Rekening Bank</strong> untuk dicetak di invoice penagihan.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
