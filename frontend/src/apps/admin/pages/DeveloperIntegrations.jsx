import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import './Shared.css';

export default function DeveloperIntegrations() {
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Gateway Config State
  const [pgConfig, setPgConfig] = useState({
    provider: 'midtrans',
    is_production: false,
    merchant_id: 'M109283-BIZORA',
    client_key: 'SB-Mid-client-88a9BcD1293',
    server_key: '••••••••••••••••',
    webhook_url: `${window.location.origin}/api/payment/webhook`,
    auto_settlement: true
  });
  const [savingPg, setSavingPg] = useState(false);
  const [pgSuccess, setPgSuccess] = useState('');
  const [simulating, setSimulating] = useState(false);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [newRawKey, setNewRawKey] = useState(null);
  const [copyLabel, setCopyLabel] = useState('Salin');

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookError, setWebhookError] = useState('');
  const [savingWebhook, setSavingWebhook] = useState(false);

  const fetchAll = async () => {
    try {
      const [keysRes, hooksRes, pgRes] = await Promise.allSettled([
        api.get('/admin/developer/api-keys'),
        api.get('/admin/developer/webhooks'),
        api.get('/admin/payment-gateway-config'),
      ]);
      if (keysRes.status === 'fulfilled') setApiKeys(keysRes.value.data?.data || []);
      if (hooksRes.status === 'fulfilled') setWebhooks(hooksRes.value.data?.data || []);
      if (pgRes.status === 'fulfilled' && pgRes.value.data?.data) {
        setPgConfig(prev => ({ ...prev, ...pgRes.value.data.data }));
      }
    } catch {
      // leave lists empty on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSavePgConfig = async (e) => {
    e.preventDefault();
    setSavingPg(true);
    setPgSuccess('');
    try {
      await api.post('/admin/payment-gateway-config', pgConfig);
      setPgSuccess('Konfigurasi Payment Gateway berhasil disimpan!');
      setTimeout(() => setPgSuccess(''), 3000);
    } catch (err) {
      alert('Gagal menyimpan konfigurasi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPg(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      const testInvoice = 'INV-' + Math.floor(100000 + Math.random() * 900000);
      const res = await api.post('/payment/simulate-pay', {
        invoice_number: testInvoice,
        payment_method: 'QRIS (Simulasi Midtrans)'
      });
      alert(`✅ Simulasi Webhook Berhasil!\nStatus: ${res.data?.message || 'Invoice diproses'}`);
    } catch (err) {
      alert('Simulasi Webhook gagal: ' + (err.response?.data?.message || err.message));
    } finally {
      setSimulating(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setSavingKey(true);
    try {
      const res = await api.post('/admin/developer/api-keys', { name: keyName.trim() });
      setNewRawKey(res.data?.data?.raw_key || null);
      setKeyName('');
      fetchAll();
    } catch (err) {
      alert('Gagal membuat API key: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingKey(false);
    }
  };

  const closeKeyModal = () => {
    setShowKeyModal(false);
    setNewRawKey(null);
    setCopyLabel('Salin');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newRawKey).then(() => {
      setCopyLabel('Tersalin!');
      setTimeout(() => setCopyLabel('Salin'), 1500);
    });
  };

  const handleRevokeKey = async (key) => {
    if (!window.confirm(`Cabut API key "${key.name}"? Aplikasi yang memakainya akan langsung berhenti berfungsi.`)) return;
    try {
      await api.delete(`/admin/developer/api-keys/${key.id}`);
      setApiKeys(prev => prev.filter(k => k.id !== key.id));
    } catch (err) {
      alert('Gagal mencabut API key: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    setWebhookError('');
    setSavingWebhook(true);
    try {
      const res = await api.post('/admin/developer/webhooks', { url: webhookUrl.trim() });
      setWebhooks(prev => [res.data.data, ...prev]);
      setWebhookUrl('');
      setShowWebhookModal(false);
    } catch (err) {
      setWebhookError(err.response?.data?.errors?.url?.[0] || err.response?.data?.message || 'URL tidak valid');
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleToggleWebhook = async (hook) => {
    try {
      const res = await api.patch(`/admin/developer/webhooks/${hook.id}/toggle`);
      setWebhooks(prev => prev.map(w => w.id === hook.id ? res.data.data : w));
    } catch (err) {
      alert('Gagal mengubah status webhook: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteWebhook = async (hook) => {
    if (!window.confirm('Hapus webhook ini?')) return;
    try {
      await api.delete(`/admin/developer/webhooks/${hook.id}`);
      setWebhooks(prev => prev.filter(w => w.id !== hook.id));
    } catch (err) {
      alert('Gagal menghapus webhook: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Integrasi &amp; Developer</h2>
      </div>

      {/* ── Payment Gateway Integration Card ── */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>💳</span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, margin: 0 }}>
                Payment Gateway &amp; Webhook Langganan SaaS
              </h3>
            </div>
            <p className="page-sub" style={{ marginTop: 4 }}>
              Otomatisasi invoice tagihan langganan tenant melalui QRIS, Virtual Account (BCA/Mandiri/BRI/BNI), dan E-Wallet.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSimulateWebhook}
              disabled={simulating}
              title="Kirim payload webhook simulasi transaksi lunas"
            >
              {simulating ? '⏳ Menguji...' : '⚡ Test Simulasi Webhook'}
            </button>
          </div>
        </div>

        {pgSuccess && (
          <div className="auth-alert auth-alert--success" style={{ marginBottom: 16 }}>
            <span>✓</span> {pgSuccess}
          </div>
        )}

        <form onSubmit={handleSavePgConfig}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Payment Gateway Provider</label>
              <select
                className="form-control"
                value={pgConfig.provider}
                onChange={e => setPgConfig({ ...pgConfig, provider: e.target.value })}
              >
                <option value="midtrans">Midtrans (Snap &amp; Core API)</option>
                <option value="tripay">Tripay Payment Gateway</option>
                <option value="xendit">Xendit</option>
                <option value="duitku">Duitku</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Environment Mode</label>
              <select
                className="form-control"
                value={pgConfig.is_production ? 'production' : 'sandbox'}
                onChange={e => setPgConfig({ ...pgConfig, is_production: e.target.value === 'production' })}
              >
                <option value="sandbox">🛠️ Sandbox (Uji Coba &amp; Simulasi)</option>
                <option value="production">🚀 Production (Transaksi Nyata)</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Merchant ID / Code</label>
              <input
                className="form-input"
                placeholder="Contoh: M109283-BIZORA"
                value={pgConfig.merchant_id}
                onChange={e => setPgConfig({ ...pgConfig, merchant_id: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Client Key / Public Key</label>
              <input
                className="form-input"
                placeholder="SB-Mid-client-..."
                value={pgConfig.client_key}
                onChange={e => setPgConfig({ ...pgConfig, client_key: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Server Key / Secret API Key</label>
              <input
                className="form-input"
                type="password"
                placeholder="SB-Mid-server-..."
                value={pgConfig.server_key}
                onChange={e => setPgConfig({ ...pgConfig, server_key: e.target.value })}
              />
            </div>
          </div>

          {/* Webhook Endpoint Info */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              🔗 URL WEBHOOK NOTIFIKASI PEMBAYARAN (Paste ke Dashboard Midtrans/Tripay):
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ flex: 1, padding: '6px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12.5, color: '#0f172a' }}>
                {window.location.origin}/api/payment/webhook
              </code>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/payment/webhook`);
                  alert('URL Webhook berhasil disalin ke clipboard!');
                }}
              >
                📋 Salin URL
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPg}>
              {savingPg ? 'Menyimpan...' : '💾 Simpan Konfigurasi Gateway'}
            </button>
          </div>
        </form>
      </div>

      {/* API Keys */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>API Keys</h3>
            <p className="page-sub" style={{ marginTop: 2 }}>Buat dan cabut API key untuk aplikasi yang mengakses BIZORA secara terprogram.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowKeyModal(true)}>+ Generate Key Baru</button>
        </div>

        <div className="table-wrap table-responsive" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Key</th>
                <th>Dibuat Oleh</th>
                <th>Terakhir Dipakai</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Memuat...</td></tr>
              ) : apiKeys.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Belum ada API key. Klik "Generate Key Baru" untuk membuat.</td></tr>
              ) : apiKeys.map(key => (
                <tr key={key.id}>
                  <td style={{ fontWeight: 600 }}>{key.name}</td>
                  <td><code style={{ fontSize: 12 }}>{key.key_prefix}</code></td>
                  <td>{key.creator?.name || '—'}</td>
                  <td>{key.last_used_at ? new Date(key.last_used_at).toLocaleString('id-ID') : 'Belum pernah'}</td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-500)' }} onClick={() => handleRevokeKey(key)}>Cabut</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks */}
      <div className="card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Webhooks</h3>
            <p className="page-sub" style={{ marginTop: 2 }}>Endpoint yang menerima notifikasi real-time dari platform.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowWebhookModal(true)}>+ Tambah Webhook</button>
        </div>

        <div className="table-wrap table-responsive" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Status</th>
                <th>Dibuat Oleh</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Memuat...</td></tr>
              ) : webhooks.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Belum ada webhook terdaftar.</td></tr>
              ) : webhooks.map(hook => (
                <tr key={hook.id}>
                  <td style={{ wordBreak: 'break-all' }}>{hook.url}</td>
                  <td>
                    <button
                      className={`badge ${hook.is_active ? 'badge-green' : 'badge-gray'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => handleToggleWebhook(hook)}
                      title="Klik untuk mengubah status"
                    >
                      {hook.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td>{hook.creator?.name || '—'}</td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-500)' }} onClick={() => handleDeleteWebhook(hook)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate API Key modal */}
      <Modal isOpen={showKeyModal} onClose={closeKeyModal} title={newRawKey ? 'API Key Dibuat' : 'Generate API Key Baru'} maxWidth="480px">
        {newRawKey ? (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Simpan key ini sekarang — karena alasan keamanan, key lengkapnya <strong style={{ fontWeight: 600 }}>tidak akan ditampilkan lagi</strong> setelah modal ini ditutup.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <code style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13, wordBreak: 'break-all' }}>{newRawKey}</code>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyKey}>{copyLabel}</button>
            </div>
            <button type="button" className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={closeKeyModal}>Selesai</button>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey}>
            <div className="form-group">
              <label className="form-label">Nama Key</label>
              <input
                className="form-input"
                placeholder="Contoh: Integrasi Akuntansi"
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-ghost" onClick={closeKeyModal}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={savingKey}>{savingKey ? 'Membuat...' : 'Generate'}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add webhook modal */}
      <Modal isOpen={showWebhookModal} onClose={() => { setShowWebhookModal(false); setWebhookError(''); }} title="Tambah Webhook" maxWidth="480px">
        <form onSubmit={handleAddWebhook}>
          <div className="form-group">
            <label className="form-label">URL Endpoint</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://contoh.com/webhook"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              autoFocus
              required
            />
            {webhookError && <p style={{ color: 'var(--danger-500)', fontSize: 12, marginTop: 4 }}>{webhookError}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowWebhookModal(false); setWebhookError(''); }}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={savingWebhook}>{savingWebhook ? 'Menyimpan...' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
