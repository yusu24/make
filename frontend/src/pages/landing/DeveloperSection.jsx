import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Key, 
  Webhook, 
  ShieldCheck, 
  Code2, 
  Copy, 
  Check, 
  ArrowRight, 
  Terminal, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function DeveloperSection() {
  const [activeLang, setActiveLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const getOrigin = () => typeof window !== 'undefined' ? window.location.origin : 'https://bizora.id';

  const SNIPPETS = {
    curl: `# 1. Ambil Katalog Produk & Stok Realtime
curl -X GET "${getOrigin()}/api/v1/external/products" \\
  -H "X-API-KEY: bzr_live_9a8f7e6d5c4b3a21..." \\
  -H "Content-Type: application/json"

# 2. Buat Transaksi / Order Baru (Stok Otomatis Terpotong)
curl -X POST "${getOrigin()}/api/v1/external/orders" \\
  -H "X-API-KEY: bzr_live_9a8f7e6d5c4b3a21..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Budi Santoso",
    "customer_phone": "08123456789",
    "payment_method": "ONLINE_TRANSFER",
    "items": [
      { "product_id": 104, "quantity": 2, "price": 45000 }
    ]
  }'`,

    javascript: `// JavaScript (Node.js / React / Next.js)
const API_URL = '${getOrigin()}/api/v1/external';
const API_KEY = 'bzr_live_9a8f7e6d5c4b3a21...';

async function createNewOrder(orderData) {
  const response = await fetch(\`\${API_URL}/orders\`, {
    method: 'POST',
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  if (result.success) {
    console.log('✅ Order Sukses:', result.data.order_number);
    console.log('Total:', result.data.total_amount);
  }
}`,

    php: `<?php
// PHP cURL Order Integration
$apiKey = 'bzr_live_9a8f7e6d5c4b3a21...';
$endpoint = '${getOrigin()}/api/v1/external/orders';

$payload = json_encode([
    'customer_name' => 'Ahmad Fauzi',
    'customer_phone' => '082198765432',
    'payment_method' => 'QRIS',
    'items' => [
        ['product_id' => 12, 'quantity' => 1, 'price' => 75000]
    ]
]);

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'X-API-KEY: ' . $apiKey,
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
?>`,

    python: `import requests

API_URL = "${getOrigin()}/api/v1/external"
API_KEY = "bzr_live_9a8f7e6d5c4b3a21..."

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

# Ambil data stok produk untuk sinkronisasi e-commerce
res = requests.get(f"{API_URL}/products", headers=headers)
products = res.json().get("data", [])

for p in products:
    print(f"SKU: {p['sku']} | {p['name']} | Stok: {p['stock']}")`,

    webhook: `// Payload HTTP POST yang dikirim Bizora ke URL Webhook Server Anda
// Header: X-Bizora-Event: order.created
// Header: X-Bizora-Signature: hmac_sha256_hash
{
  "event": "order.created",
  "timestamp": 1788933000,
  "data": {
    "order_id": 4892,
    "order_number": "ORD-20260909-0012",
    "customer": {
      "name": "Rina Wijaya",
      "phone": "081399887766"
    },
    "total_amount": 150000,
    "payment_status": "PAID",
    "items_count": 3,
    "created_at": "2026-09-09T08:30:00Z"
  }
}`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(SNIPPETS[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developer" className="py-24 bg-[#031310] relative overflow-hidden text-white border-t border-[#0f382e]/50">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-inner">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>DEVELOPER REST API & WEBHOOKS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Hubungkan Apapun ke Engine Bisnis Anda
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bangun integrasi kustom tanpa batas. Sambungkan website toko online custom, aplikasi mobile Flutter/React Native, bot WhatsApp kasir, sistem POS hardware, hingga IoT sensor ke backend Bizora dengan aman.
          </p>
        </div>

        {/* 3 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-[#061e19]/70 border border-[#14493e]/60 backdrop-blur-sm space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Token API Terisolasi</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Setiap tenant memiliki API Key unik berbasis SHA-256 yang aman. Akses multi-tenant terisolasi penuh menjamin data toko tidak akan bocor ke pihak lain.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#061e19]/70 border border-[#14493e]/60 backdrop-blur-sm space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Webhook className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Realtime Webhooks</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Dapatkan notifikasi instan saat ada pesanan baru (<code className="text-emerald-400 font-mono text-xs">order.created</code>), konfirmasi bayar, atau stok menipis dengan tanda tangan HMAC.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#061e19]/70 border border-[#14493e]/60 backdrop-blur-sm space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Potong Stok Otomatis</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Endpoint order eksternal otomatis mengecek ketersediaan barang dan memotong stok gudang real-time tanpa perlu entri manual di kasir.
            </p>
          </div>
        </div>

        {/* Live Code Console Playground */}
        <div className="rounded-3xl bg-[#020b09] border border-[#133d34] shadow-2xl overflow-hidden">
          {/* Console Header */}
          <div className="px-5 py-3.5 bg-[#051814] border-b border-[#133d34] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 font-mono text-xs font-semibold text-slate-400">
                bizora-api-playground
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[#03110e] rounded-xl border border-[#133d34]">
              {[
                { id: 'curl', label: 'cURL' },
                { id: 'javascript', label: 'JavaScript' },
                { id: 'php', label: 'PHP' },
                { id: 'python', label: 'Python' },
                { id: 'webhook', label: 'Webhook JSON' },
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLang === lang.id
                      ? 'bg-emerald-500 text-[#020b09] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={copyCode}
              className="px-3 py-1.5 rounded-lg bg-[#082620] hover:bg-[#0d3b32] text-slate-200 border border-[#19574a] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="p-6 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto leading-relaxed bg-[#020a08]/90">
            <pre className="whitespace-pre">{SNIPPETS[activeLang]}</pre>
          </div>

          {/* Console Footer / Official Endpoints */}
          <div className="px-6 py-4 bg-[#051814] border-t border-[#133d34] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-slate-400 flex-wrap">
              <span className="font-semibold text-slate-200">Base URL:</span>
              <code className="px-2 py-0.5 rounded bg-[#03110e] border border-[#133d34] text-emerald-400 font-mono">
                {getOrigin()}/api/v1/external
              </code>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/developers"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Buka Dokumentasi API Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA Strip */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mulai Integrasi — Daftar Gratis</span>
          </Link>

          <Link
            to="/developers"
            className="px-6 py-3.5 bg-[#082620] hover:bg-[#0c382f] text-slate-200 border border-[#1b5749] font-bold rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Pelajari Spesifikasi Endpoint & Webhook</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
