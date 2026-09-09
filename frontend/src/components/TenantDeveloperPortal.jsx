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
} from 'lucide-react';
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
      if (statusRes.data?.success) {
        setHasAccess(Boolean(statusRes.data.has_access));
        setTenantInfo(statusRes.data);
      }

      if (statusRes.data?.has_access) {
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

  const getCodeSnippet = () => {
    const baseUrl = `${window.location.origin}/api/v1/external`;
    const sampleKey = apiKeys.length > 0 ? (apiKeys[0].key_prefix.replace('...', '') + 'xxxxxxxxxxxxxxxxxxxx') : 'bzr_live_your_api_key_here';

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
              <span>{hasAccess ? 'Akses API Aktif' : 'Akses API Terkunci'}</span>
            </span>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* LOCKED SCREEN (If Subscription Does Not Include API Access) */}
      {!loading && !hasAccess && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-extrabold text-slate-900">
              Fitur REST API & Webhooks Belum Aktif
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fitur integrasi pihak ketiga membutuhkan paket langganan <strong>Pro Developer</strong> atau <strong>Enterprise</strong>. Anda dapat mengaktifkannya melalui menu Paket Langganan atau menghubungi SaaS Admin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Key className="w-4 h-4 text-indigo-600" />
              <strong className="block text-slate-900">Token API Terisolasi</strong>
              <p className="text-slate-500 text-[11px]">Akses aman CRUD produk, stok, dan kasir.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <WebhookIcon className="w-4 h-4 text-emerald-600" />
              <strong className="block text-slate-900">Event Realtime</strong>
              <p className="text-slate-500 text-[11px]">Notifikasi instan saat order masuk atau dibayar.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <strong className="block text-slate-900">SLA 99.9% Uptime</strong>
              <p className="text-slate-500 text-[11px]">Performa tinggi untuk ribuan request harian.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={subscriptionLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade ke Paket Developer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ACTIVE DEVELOPER PORTAL */}
      {!loading && hasAccess && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
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
                    setNewRawKey(null);
                    setShowKeyModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Buat Kunci API Baru</span>
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
                          Belum ada kunci API yang dibuat. Klik tombol <strong>"+ Buat Kunci API Baru"</strong> di atas.
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
                  onClick={() => setShowWebhookModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Webhook Endpoint</span>
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
                {[
                  { id: 'order.created', label: 'order.created (Pesanan baru masuk)' },
                  { id: 'payment.success', label: 'payment.success (Pembayaran lunas)' },
                  { id: 'stock.low', label: 'stock.low (Peringatan stok menipis)' },
                ].map(ev => (
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
