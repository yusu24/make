import React, { useState } from 'react';
import { api } from '../lib/api';

export default function PaymentProofUpload({ pendingReq, globalSettings, onUploadSuccess, style = {} }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bankSender, setBankSender] = useState('');
  const [senderName, setSenderName] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showReupload, setShowReupload] = useState(false);

  const bankAccounts = (Array.isArray(globalSettings?.bank_accounts) && globalSettings.bank_accounts.length > 0)
    ? globalSettings.bank_accounts
    : [{
        bank_name: globalSettings?.bank_name || 'BCA',
        bank_account_no: globalSettings?.bank_account_no || '8837 001 992',
        bank_account_name: globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'
      }];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5MB.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      alert('Silakan pilih file bukti transfer terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('proof_file', file);
      if (bankSender) formData.append('bank_sender', bankSender);
      if (senderName) formData.append('sender_name', senderName);
      if (notes) formData.append('notes', notes);

      const res = await api.post('/subscription/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(res.data?.message || '✅ Bukti transfer berhasil diunggah! Super Admin akan segera memverifikasi.');
      setFile(null);
      setPreviewUrl(null);
      setShowReupload(false);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} berhasil disalin ke clipboard!`);
    });
  };

  const hasProof = !!pendingReq?.proof;

  return (
    <div style={{
      background: 'var(--bg-elevated, #f8fafc)',
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: 16,
      padding: '20px 24px',
      marginTop: 20,
      ...style
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 24 }}>📤</div>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-main, #1e293b)' }}>
            Konfirmasi Bukti Transfer Manual
          </h4>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted, #64748b)' }}>
            Transfer ke salah satu rekening resmi di bawah, lalu unggah slip/bukti transfer untuk aktivasi paket Anda.
          </p>
        </div>
      </div>

      {/* Daftar Rekening Bank Tujuan */}
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 16
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: 8 }}>
          🏦 Rekening Tujuan Transfer ({bankAccounts.length} Bank Tersedia):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {bankAccounts.map((acc, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              background: 'var(--bg-elevated, #f1f5f9)',
              borderRadius: 8,
              border: '1px solid var(--border-color, #cbd5e1)'
            }}>
              <div>
                <span style={{ fontWeight: 800, color: 'var(--primary-600, #2563eb)', fontSize: 13 }}>{acc.bank_name}</span>
                <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.02em', color: 'var(--text-main, #1e293b)' }}>
                  {acc.bank_account_no || acc.bank_account_number}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)' }}>
                  a.n. {acc.bank_account_name || 'PT Antigravity Global SaaS'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(acc.bank_account_no || acc.bank_account_number || '', `No Rekening ${acc.bank_name}`)}
                style={{
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#334155'
                }}
              >
                Salin
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Proof Status or Upload Form */}
      {hasProof && !showReupload ? (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 12,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>
                  Bukti Pembayaran Sudah Diunggah
                </div>
                <div style={{ fontSize: 12, color: '#15803d' }}>
                  Super Admin sedang memverifikasi pembayaran Anda. Paket akan aktif sesaat setelah disetujui.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={pendingReq.proof}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#15803d',
                  color: '#fff',
                  borderRadius: 6,
                  textDecoration: 'none'
                }}
              >
                👁️ Lihat Bukti
              </a>
              <button
                type="button"
                onClick={() => setShowReupload(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#fff',
                  border: '1px solid #86efac',
                  color: '#166534',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                🔄 Upload Ulang
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {showReupload && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>🔄 Mengunggah ulang bukti pembayaran baru</span>
              <button
                type="button"
                onClick={() => setShowReupload(false)}
                style={{ fontSize: 11, background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Batal
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-main, #334155)' }}>
                Bank Pengirim (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: BCA / Mandiri / Dana"
                value={bankSender}
                onChange={(e) => setBankSender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #cbd5e1)',
                  background: 'var(--bg-card, #fff)',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-main, #334155)' }}>
                Nama Pemilik Rekening Pengirim
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #cbd5e1)',
                  background: 'var(--bg-card, #fff)',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-main, #334155)' }}>
              Pilih File Bukti / Slip Transfer <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{
              border: '2px dashed var(--border-color, #cbd5e1)',
              borderRadius: 10,
              padding: '16px',
              textAlign: 'center',
              background: 'var(--bg-card, #fff)',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: 120, borderRadius: 6, objectFit: 'contain', border: '1px solid #e2e8f0' }} />
                  ) : (
                    <div style={{ fontSize: 32 }}>📄</div>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>{file.name}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>({(file.size / 1024).toFixed(1)} KB) - Klik untuk ganti file</span>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>📁</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main, #334155)' }}>
                    Klik atau Seret file slip bukti transfer ke sini
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>
                    Mendukung JPG, PNG, WEBP, atau PDF (Maksimal 5MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-main, #334155)' }}>
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Transfer via Mobile Banking BCA pukul 14:30"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--bg-card, #fff)',
                fontSize: 13,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="submit"
              disabled={isUploading || !file}
              style={{
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 800,
                borderRadius: 8,
                border: 'none',
                background: (!file || isUploading) ? '#94a3b8' : 'var(--primary-600, #2563eb)',
                color: '#fff',
                cursor: (!file || isUploading) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s'
              }}
            >
              {isUploading ? 'Mengunggah Bukti...' : '📤 Kirim Bukti Transfer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
