import React from 'react';
import './Shared.css'; // or appropriate css

export default function CustomerOnboardingGuide() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <h2 className="page-title">Panduan Berlangganan (Customer Onboarding)</h2>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: 18, marginBottom: 10 }}>
          Alur Pendaftaran Tenant Baru
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          Halaman ini mendokumentasikan langkah-langkah yang dilalui oleh calon pengguna (customer) untuk mendaftarkan bisnis mereka dan berlangganan di platform Bizora. Panduan ini berguna bagi tim Support dan Sales untuk memandu calon klien.
        </p>
      </div>

      <div className="grid-1" style={{ gap: 30 }}>
        {/* Step 1 */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ 
              background: '#4f46e5', color: '#fff', width: 30, height: 30, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>1</span>
            <h4 style={{ margin: 0, fontSize: 16 }}>Pilih Paket Berlangganan</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Customer membuka halaman pendaftaran dan dihadapkan pada tabel perbandingan paket (Basic, Pro, Enterprise). Mereka dapat memilih modul bisnis yang sesuai (Retail, F&B, Jasa, dll).
          </p>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 20, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Pilih Paket" style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </div>
        </div>

        {/* Step 2 */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ 
              background: '#4f46e5', color: '#fff', width: 30, height: 30, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>2</span>
            <h4 style={{ margin: 0, fontSize: 16 }}>Pengisian Data Organisasi & Akun</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Setelah memilih paket, customer mengisi formulir pendaftaran yang mencakup Nama Bisnis, Kategori Bisnis, Email Admin, dan Password. Sistem akan otomatis membuatkan Tenant ID (misal: <code>TN-1029</code>).
          </p>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 20, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" alt="Isi Formulir" style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </div>
        </div>

        {/* Step 3 */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ 
              background: '#4f46e5', color: '#fff', width: 30, height: 30, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>3</span>
            <h4 style={{ margin: 0, fontSize: 16 }}>Pembayaran & Inisialisasi Dashboard</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Customer melakukan pembayaran via Payment Gateway. Setelah pembayaran berhasil, sistem akan melakukan *provisioning* database dan mengarahkan customer ke Dashboard khusus modul mereka.
          </p>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 20, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" alt="Sukses Berlangganan" style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
