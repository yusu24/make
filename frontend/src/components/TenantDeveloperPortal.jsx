import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Key, 
  Webhook as WebhookIcon, 
  BookOpen, 
  Lock, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  AlertTriangle, 
  ShieldCheck, 
  Globe, 
  Code, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Layers,
  Terminal
} from '@/constants/icons';
import { api } from '../lib/api';
import Modal from './Modal';

export const TenantDeveloperPortal = ({
  moduleName = 'Bisnis',
  accentColor = 'indigo',
  subscriptionLink = '/subscription'
}) => {
  const [activeTab, setActiveTab] = useState('keys');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [newRawKey, setNewRawKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState(['order.created', 'payment.success', 'stock.low']);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Snippet language
  const [snippetLang, setSnippetLang] = useState('curl');

  const fetchStatusAndData = async () => {
    setLoading(true);
    try {
      const statusRes = await api.get('/tenant/developer/status');
      const canAccess = Boolean(statusRes.data?.success && statusRes.data?.has_access);
      setHasAccess(canAccess);
      setTenantInfo(statusRes.data || null);

      if (canAccess) {
        const [keysRes, hooksRes] = await Promise.allSettled([
          api.get('/tenant/developer/api-keys'),
          api.get('/tenant/developer/webhooks')
        ]);
        if (keysRes.status === 'fulfilled') setApiKeys(keysRes.value.data?.data || []);
        if (hooksRes.status === 'fulfilled') setWebhooks(hooksRes.value.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load developer portal status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndData();
  }, []);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setSavingKey(true);
    try {
      const res = await api.post('/tenant/developer/api-keys', { name: keyName.trim() });
      if (res.data?.success) {
        setNewRawKey(res.data.data?.raw_key || null);
        setKeyName('');
        // refresh keys
        const keysRes = await api.get('/tenant/developer/api-keys');
        setApiKeys(keysRes.data?.data || []);
      }
    } catch (err) {
      alert('Gagal membuat API Key: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingKey(false);
    }
  };

  const handleRevokeKey = async (id, name) => {
    if (!window.confirm(`Yakin ingin mencabut kunci API "${name}"? Aplikasi luar yang menggunakan kunci ini tidak akan bisa terhubung lagi.`)) {
      return;
    }
    try {
      await api.delete(`/tenant/developer/api-keys/${id}`);
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      alert('Gagal mencabut kunci API: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    setSavingWebhook(true);
    try {
      const res = await api.post('/tenant/developer/webhooks', {
        url: webhookUrl.trim(),
        events: selectedEvents
      });
      if (res.data?.success) {
        setShowWebhookModal(false);
        setWebhookUrl('');
        // refresh
        const hooksRes = await api.get('/tenant/developer/webhooks');
        setWebhooks(hooksRes.data?.data || []);
      }
    } catch (err) {
      alert('Gagal mendaftarkan webhook: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleToggleWebhook = async (id) => {
    try {
      const res = await api.patch(`/tenant/developer/webhooks/${id}/toggle`);
      if (res.data?.success) {
        setWebhooks(prev => prev.map(w => w.id === id ? res.data.data : w));
      }
    } catch (err) {
      alert('Gagal mengubah status webhook: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!window.confirm('Yakin ingin menghapus endpoint webhook ini?')) return;
    try {
      await api.delete(`/tenant/developer/webhooks/${id}`);
      setWebhooks(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      alert('Gagal menghapus webhook: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTestPingWebhook = async (id) => {
    setTestingWebhookId(id);
    setTestResult(null);
    try {
      const res = await api.post(`/tenant/developer/webhooks/${id}/test`);
      setTestResult(res.data);
      alert(`✅ ${res.data?.message || 'Tes ping berhasil dikirim!'}`);
    } catch (err) {
      alert(`❌ Gagal mengirim tes ping: ${err.response?.data?.message || err.message}`);
    } finally {
      setTestingWebhookId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const isJasa = (moduleName || '').toLowerCase().includes('jasa') || (moduleName || '').toLowerCase().includes('servis');

  const getCodeSnippet = () => {
    const baseUrl = `${window.location.origin}/api/v1/external`;
    const sampleKey = apiKeys.length > 0 ? (apiKeys[0].key_prefix.replace('...', '') + 'xxxxxxxxxxxxxxxxxxxx') : 'bzr_live_your_api_key_here';

    if (isJasa) {
      if (snippetLang === 'curl') {
        return `# 1. Ambil Profil Servis & Bengkel
curl -X GET "${baseUrl}/profile" \\
  -H "X-API-KEY: ${sampleKey}" \\
  -H "Content-Type: application/json"

# 2. Terbitkan SPK / Tiket Servis Baru Otomatis (Integrasi Website/WA Bot)
curl -X POST "${baseUrl}/work-orders" \\
  -H "X-API-KEY: ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Servis Rutin Berkala & Penggantian Sparepart",
    "customer_name": "Budi Santoso",
    "customer_phone": "08123456789",
    "equipment_name": "Printer Epson L3110",
    "priority": "Sedang",
    "service_description": "Hasil cetak bergaris dan roller macet",
    "labor_rate": 150000
  }'

# 3. Lacak Status SPK Pelanggan (Portal Tracking Publik)
curl -X GET "${baseUrl}/work-orders/SPK-12345678" \\
  -H "X-API-KEY: ${sampleKey}"

# 4. Ambil Katalog Tarif Layanan Servis
curl -X GET "${baseUrl}/services" \\
  -H "X-API-KEY: ${sampleKey}"

# 5. Cek Tim Teknisi Siap Tugas
curl -X GET "${baseUrl}/technicians" \\
  -H "X-API-KEY: ${sampleKey}"`;
      }

      if (snippetLang === 'javascript') {
        return `// JavaScript (Fetch / Axios) Node.js / React
const API_URL = '${baseUrl}';
const API_KEY = '${sampleKey}';

// 1. Terbitkan SPK Baru
async function createWorkOrder(spkPayload) {
  const response = await fetch(\`\${API_URL}/work-orders\`, {
    method: 'POST',
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spkPayload)
  });
  return await response.json();
}

// 2. Lacak Status SPK Pelanggan
async function checkSpkStatus(spkNumber) {
  const response = await fetch(\`\${API_URL}/work-orders/\${spkNumber}\`, {
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}`;
      }

      if (snippetLang === 'php') {
        return `<?php
// PHP cURL Integration - Terbitkan SPK Jasa Baru
$apiKey = '${sampleKey}';
$url = '${baseUrl}/work-orders';

$payload = [
    'title' => 'Servis AC Ruang Rapat',
    'customer_name' => 'PT Surya Digital',
    'customer_phone' => '08123456789',
    'equipment_name' => 'AC Daikin 2PK Inverter',
    'priority' => 'Tinggi',
    'service_description' => 'Tidak dingin dan bocor air',
    'labor_rate' => 200000
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-KEY: ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`;
      }

      if (snippetLang === 'python') {
        return `import requests

API_URL = "${baseUrl}"
API_KEY = "${sampleKey}"

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

# Terbitkan Tiket SPK Baru
payload = {
    "title": "Perbaikan Laptop Tidak Menyala",
    "customer_name": "Ahmad Fauzi",
    "customer_phone": "081298765432",
    "equipment_name": "Asus ROG Zephyrus G14",
    "priority": "Tinggi",
    "service_description": "Mati total setelah lonjakan daya"
}

res = requests.post(f"{API_URL}/work-orders", json=payload, headers=headers)
print("SPK Response:", res.json())`;
      }
    }

    if (snippetLang === 'curl') {
      return `# 1. Ambil Profil Toko
curl -X GET "${baseUrl}/profile" \\
  -H "X-API-KEY: ${sampleKey}" \\
  -H "Content-Type: application/json"

# 2. Ambil Daftar Produk & Stok Realtime
curl -X GET "${baseUrl}/products?search=kopi" \\
  -H "X-API-KEY: ${sampleKey}"

# 3. Buat Transaksi / Pesanan Baru (Stok Otomatis Terpotong)
curl -X POST "${baseUrl}/orders" \\
  -H "X-API-KEY: ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Budi Santoso",
    "customer_phone": "08123456789",
    "payment_method": "ONLINE_TRANSFER",
    "items": [
      { "product_id": 1, "quantity": 2, "price": 25000 }
    ]
  }'`;
    }

    if (snippetLang === 'javascript') {
      return `// JavaScript (Fetch / Axios) Node.js / React
const API_URL = '${baseUrl}';
const API_KEY = '${sampleKey}';

async function getProducts() {
  const response = await fetch(\`\${API_URL}/products\`, {
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  const result = await response.json();
  console.log('Daftar Produk:', result.data);
}

async function createOrder(orderPayload) {
  const response = await fetch(\`\${API_URL}/orders\`, {
    method: 'POST',
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });
  return await response.json();
}`;
    }

    if (snippetLang === 'php') {
      return `<?php
// PHP cURL Integration
$apiKey = '${sampleKey}';
$url = '${baseUrl}/products';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-KEY: ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
?>`;
    }

    if (snippetLang === 'python') {
      return `import requests

API_URL = "${baseUrl}"
API_KEY = "${sampleKey}"

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

# Ambil Stok Produk
res = requests.get(f"{API_URL}/products", headers=headers)
print("Response:", res.json())`;
    }

    return '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-300 border border-white/15">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Developer API & Webhook Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Integrasi REST API & Webhook Toko
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Hubungkan website e-commerce custom, aplikasi mobile, bot WhatsApp, atau sistem ERP internal Anda ke engine {moduleName} Bizora.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
              hasAccess 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-amber-950/80 text-amber-300 border-amber-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{hasAccess ? (tenantInfo?.is_local ? '🛠️ Mode Dev / Sandbox Aktif' : 'Akses API Aktif') : 'Akses API Terkunci (Perlu Pro/Enterprise)'}</span>
            </span>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Memeriksa status integrasi API & Webhooks...</p>
        </div>
      )}

      {/* ACTIVE DEVELOPER PORTAL */}
      {!loading && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
            {[
              { id: 'keys', label: '1. Kunci API (API Keys)', icon: Key },
              { id: 'webhooks', label: '2. Webhooks & Notifikasi Event', icon: WebhookIcon },
              { id: 'docs', label: '3. Dokumentasi & Contoh Kode', icon: Code },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
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

          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              {!hasAccess && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block font-bold text-sm text-slate-900">Pembuatan Kunci API Memerlukan Paket Pro/Enterprise</strong>
                      <span className="text-slate-600 text-xs">Paket Anda saat ini adalah <strong>{tenantInfo?.subscription_plan || 'Standar'}</strong>. Anda tetap dapat membaca dokumentasi & contoh integrasi pada Tab 3.</span>
                    </div>
                  </div>
                  <Link
                    to={subscriptionLink}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upgrade Paket</span>
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <span>Daftar Kunci API (API Keys)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Gunakan Secret Key ini pada header request <code className="text-indigo-600 font-mono">X-API-KEY: bzr_live_...</code> aplikasi luar Anda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!hasAccess) {
                      alert('Fitur pembuatan Kunci API memerlukan upgrade ke paket Pro Developer atau Enterprise.');
                      return;
                    }
                    setNewRawKey(null);
                    setShowKeyModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Kunci API Baru</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">Nama Kunci</th>
                      <th className="p-3">Prefix Token</th>
                      <th className="p-3">Terakhir Digunakan</th>
                      <th className="p-3">Dibuat Pada</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                          Belum ada kunci API yang dibuat. Klik tombol <strong>"Buat Kunci API Baru"</strong> di atas.
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map(k => (
                        <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold font-sans text-slate-900">{k.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 border border-slate-200">
                              {k.key_prefix}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-sans">
                            {k.last_used_at ? new Date(k.last_used_at).toLocaleString('id-ID') : 'Belum pernah'}
                          </td>
                          <td className="p-3 text-slate-500 font-sans">
                            {new Date(k.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevokeKey(k.id, k.name)}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold font-sans transition-colors cursor-pointer"
                            >
                              Cabut Kunci
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              {!hasAccess && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block font-bold text-sm text-slate-900">Registrasi Webhook Memerlukan Paket Pro/Enterprise</strong>
                      <span className="text-slate-600 text-xs">Paket Anda saat ini adalah <strong>{tenantInfo?.subscription_plan || 'Standar'}</strong>. Notifikasi event webhook otomatis hanya aktif untuk pelanggan paket Pro Developer atau Enterprise.</span>
                    </div>
                  </div>
                  <Link
                    to={subscriptionLink}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upgrade Paket</span>
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <WebhookIcon className="w-5 h-5 text-emerald-600" />
                    <span>Daftar Endpoint Webhook</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Bizora akan mengirimkan data HTTP POST realtime ke URL endpoint Anda setiap kali event transaksi terjadi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!hasAccess) {
                      alert('Fitur pendaftaran Webhook endpoint memerlukan upgrade ke paket Pro Developer atau Enterprise.');
                      return;
                    }
                    setShowWebhookModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Webhook Endpoint</span>
                </button>
              </div>

              {/* Webhooks List */}
              <div className="space-y-3">
                {webhooks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                    Belum ada webhook yang didaftarkan.
                  </div>
                ) : (
                  webhooks.map(wh => (
                    <div key={wh.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${wh.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="font-mono text-xs font-bold text-slate-900">{wh.url}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(wh.events || ['order.created']).map((ev) => (
                            <span key={ev} className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-mono">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          type="button"
                          disabled={testingWebhookId === wh.id}
                          onClick={() => handleTestPingWebhook(wh.id)}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Play className="w-3 h-3 text-emerald-600" />
                          <span>{testingWebhookId === wh.id ? 'Mengirim...' : 'Tes Ping'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleWebhook(wh.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            wh.is_active 
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {wh.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCS & CODE SNIPPETS */}
          {activeTab === 'docs' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  <span>Dokumentasi REST API & Contoh Integrasi Kode</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Base URL: <code className="text-indigo-600 font-mono font-bold">{window.location.origin}/api/v1/external</code>
                </p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'curl', label: 'cURL' },
                  { id: 'javascript', label: 'JavaScript (Fetch)' },
                  { id: 'php', label: 'PHP (cURL)' },
                  { id: 'python', label: 'Python (Requests)' },
                ].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSnippetLang(l.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      snippetLang === l.id 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-xs overflow-x-auto shadow-inner">
                <button
                  type="button"
                  onClick={() => copyToClipboard(getCodeSnippet())}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
                <pre className="whitespace-pre">{getCodeSnippet()}</pre>
              </div>

              {/* Endpoint Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Daftar Endpoint REST API Resmi:</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                      <span className="font-bold text-slate-800">/api/v1/external/profile</span>
                    </div>
                    <span className="font-sans text-slate-500">Mengecek profil toko & status langganan</span>
                  </div>

                  {isJasa ? (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                          <span className="font-bold text-slate-800">/api/v1/external/work-orders</span>
                        </div>
                        <span className="font-sans text-slate-500">Mengambil daftar seluruh SPK & tiket servis</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded">POST</span>
                          <span className="font-bold text-slate-800">/api/v1/external/work-orders</span>
                        </div>
                        <span className="font-sans text-slate-500">Menerbitkan SPK / tiket servis baru otomatis</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                          <span className="font-bold text-slate-800">/api/v1/external/work-orders/{'{spk_number}'}</span>
                        </div>
                        <span className="font-sans text-slate-500">Lacak progres, estimasi biaya & status pengerjaan</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                          <span className="font-bold text-slate-800">/api/v1/external/services</span>
                        </div>
                        <span className="font-sans text-slate-500">Mengambil katalog tarif layanan & durasi</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                          <span className="font-bold text-slate-800">/api/v1/external/technicians</span>
                        </div>
                        <span className="font-sans text-slate-500">Mengecek tim teknisi & kesiapan kerja lapangan</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                          <span className="font-bold text-slate-800">/api/v1/external/products</span>
                        </div>
                        <span className="font-sans text-slate-500">Mengambil katalog produk, harga & stok</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded">POST</span>
                          <span className="font-bold text-slate-800">/api/v1/external/orders</span>
                        </div>
                        <span className="font-sans text-slate-500">Membuat transaksi order & potong stok otomatis</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">GET</span>
                          <span className="font-bold text-slate-800">/api/v1/external/stock</span>
                        </div>
                        <span className="font-sans text-slate-500">Sinkronisasi kuota stok real-time</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: BUAT API KEY BARU */}
      {showKeyModal && (
        <Modal
          title={newRawKey ? "Kunci API Berhasil Dibuat" : "Buat Kunci API Baru"}
          onClose={() => setShowKeyModal(false)}
        >
          {newRawKey ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <strong className="font-bold block text-sm">⚠️ PENTING: Simpan Kunci Anda Sekarang!</strong>
                <p>Token ini hanya ditampilkan <strong>satu kali ini saja</strong>. Demi keamanan, server Bizora tidak menyimpan teks kunci mentah ini.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs break-all flex items-center justify-between gap-3">
                <span>{newRawKey}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(newRawKey)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Saya Sudah Menyimpan Kunci
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Aplikasi / Kunci API:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Website E-Commerce, Bot WA, App Mobile"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingKey}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  {savingKey ? 'Membuat...' : 'Generate Kunci API'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* MODAL: TAMBAH WEBHOOK */}
      {showWebhookModal && (
        <Modal
          title="Tambah Webhook Endpoint"
          onClose={() => setShowWebhookModal(false)}
        >
          <form onSubmit={handleCreateWebhook} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Endpoint Server Anda (HTTPS):
              </label>
              <input
                type="url"
                required
                placeholder="https://toko-anda.com/api/bizora-webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Event Notifikasi:
              </label>
              <div className="space-y-2 text-xs">
                {(isJasa ? [
                  { id: 'spk.created', label: 'spk.created (SPK / tiket servis baru diterbitkan)' },
                  { id: 'spk.status_updated', label: 'spk.status_updated (Status pengerjaan diperbarui)' },
                  { id: 'spk.completed', label: 'spk.completed (Servis tuntas & siap diambil)' },
                  { id: 'payment.received', label: 'payment.received (Pembayaran nota servis diterima)' },
                ] : [
                  { id: 'order.created', label: 'order.created (Pesanan baru masuk)' },
                  { id: 'payment.success', label: 'payment.success (Pembayaran lunas)' },
                  { id: 'stock.low', label: 'stock.low (Peringatan stok menipis)' },
                ]).map(ev => (
                  <label key={ev.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents([...selectedEvents, ev.id]);
                        } else {
                          setSelectedEvents(selectedEvents.filter(x => x !== ev.id));
                        }
                      }}
                      className="rounded accent-emerald-600"
                    />
                    <span>{ev.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingWebhook}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                {savingWebhook ? 'Menyimpan...' : 'Simpan Webhook'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
