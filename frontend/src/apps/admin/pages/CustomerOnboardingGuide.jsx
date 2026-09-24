import React from 'react';
import {
  Users, CheckCircle2, ShieldCheck, CreditCard, Store, ArrowRight,
  BookOpen, HelpCircle, FileText, Sparkles
} from '@/constants/icons';
import './Shared.css';

export default function CustomerOnboardingGuide() {
  const steps = [
    {
      step: 1,
      title: 'Pendaftaran Akun & Pemilihan Modul Bisnis',
      desc: 'Calon pengguna (owner UMKM) mendaftarkan email dan nama usaha di halaman registrasi, kemudian memilih kategori industri yang sesuai.',
      items: [
        'Kategori Industri: Toko Retail, Kuliner (F&B), Jasa & Servis, Budidaya Ternak/Tani, atau Seller Hub (Omnichannel).',
        'Sistem otomatis membuat ruang kerja (Tenant Workspace) terisolasi dengan format Tenant ID unik (misal: TN-1042).',
        'Masa uji coba gratis (Trial) aktif otomatis selama 14 hari dengan fitur operasional lengkap.'
      ],
      badge: 'Registrasi & Trial',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe'
    },
    {
      step: 2,
      title: 'Pemilihan Paket & Siklus Langganan',
      desc: 'Tenant memilih paket langganan sesuai kapasitas usaha dan durasi penagihan (Bulanan atau Tahunan berdiskon).',
      items: [
        'Paket Starter / Basic: Untuk usaha mikro rintisan dengan limit transaksi dan kasir tunggal.',
        'Paket Pro / Growth: Mendukung multi-outlet, multi-kasir, analitik margin laba rugi, dan inventaris berkala.',
        'Paket Enterprise: Fitur penuh tanpa batasan kuota, dukungan prioritas, dan integrasi API webhook.',
        'Rumus Diskon Tahunan: Tagihan Tahunan = (Harga Paket Dasar x 10 Bulan) + PPN 11% (Gratis 2 bulan).'
      ],
      badge: 'Paket & Faktur',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7'
    },
    {
      step: 3,
      title: 'Unggah Dokumen & Verifikasi KYC Tenant',
      desc: 'Untuk membuka limit transaksi dan mengaktifkan fitur pembayaran digital (QRIS / Transfer Bank), tenant wajib melengkapi verifikasi identitas.',
      items: [
        'Dokumen Wajib: Foto e-KTP penanggung jawab usaha, Nomor Induk Berusaha (NIB) / SKU, dan foto plang/lokasi usaha fisik.',
        'Tim Administrator SaaS memverifikasi berkas melalui menu Verifikasi KYC Tenant (/kyc).',
        'SLA Verifikasi maksimal 1 x 24 jam kerja. Apabila berkas buram atau tidak sesuai, admin wajib memberikan catatan revisi.'
      ],
      badge: 'Verifikasi KYC',
      badgeColor: '#4f46e5',
      badgeBg: '#e0e7ff'
    },
    {
      step: 4,
      title: 'Setup Master Data Awal & Go-Live Operasional',
      desc: 'Setelah verifikasi KYC disetujui, tenant dipandu mengisi data dasar toko untuk siap melayani pelanggan pertama.',
      items: [
        'Input Master Data: Impor katalog barang/menu (Excel), setup barcode, kategori, dan satuan dasar.',
        'Konfigurasi Kasir: Daftarkan akun staf kasir di menu Staf & Hak Akses, atur printer struk thermal (58mm/80mm).',
        'Buka Shift Kasir Pagi: Kasir menginput modal awal (Cash in Drawer) dan siap melakukan transaksi POS pertama.'
      ],
      badge: 'Go-Live Toko',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        borderRadius: 18,
        padding: '24px 28px',
        color: '#fff',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              SOP Onboarding Tenant v2.5
            </span>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Panduan Operasional Tim Support & Sales</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Panduan Onboarding & Berlangganan Tenant</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: 13.5, opacity: 0.9, maxWidth: 680, lineHeight: 1.6 }}>
            Alur kerja standar pendampingan calon pengguna dari registrasi, verifikasi identitas (KYC), aktivasi paket, hingga inisialisasi master data operasional.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/tenants" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Store size={14} /> Daftar Tenant
          </a>
          <a href="/kyc" className="btn btn-sm" style={{ background: '#4f46e5', color: '#fff', fontWeight: 600 }}>
            <ShieldCheck size={14} /> Verifikasi KYC
          </a>
          <a href="/doc-center" className="btn btn-sm" style={{ background: '#fff', color: '#0f172a', fontWeight: 700 }}>
            <BookOpen size={14} /> Pusat Dokumentasi
          </a>
        </div>
      </div>

      {/* 4 Steps Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {steps.map((step) => (
          <div
            key={step.step}
            style={{
              background: 'var(--bg-card, #fff)',
              borderRadius: 16,
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: step.badgeColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16
                }}>
                  {step.step}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color: step.badgeColor,
                background: step.badgeBg
              }}>
                {step.badge}
              </span>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 18px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Poin Penting Prosedur:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                {step.items.map((it, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* SOP Support & Hotline Footer Card */}
      <div style={{
        marginTop: 24,
        background: '#f0fdf4',
        borderRadius: 16,
        border: '1px solid #bbf7d0',
        padding: 22,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: '#14532d' }}>
              SOP Layanan Bantuan & Escalation Path
            </h4>
            <p style={{ margin: '3px 0 0 0', fontSize: 13, color: '#166534' }}>
              Jika calon tenant mengalami kendala teknis saat registrasi atau pembayaran, arahkan ke menu Pusat Bantuan (Tiket) atau hubungi tim engineering via kanal Helpdesk.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/support-center" className="btn btn-sm" style={{ background: '#16a34a', color: '#fff', fontWeight: 600 }}>
            Buka Pusat Bantuan (Tiket) <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
