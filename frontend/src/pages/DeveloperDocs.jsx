import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Key,
  Webhook,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Terminal,
  BookOpen,
  Server,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Cpu,
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import bizoraLogo from '../assets/bizora-logo.png';

export default function DeveloperDocs() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const getOrigin = () => typeof window !== 'undefined' ? window.location.origin : 'https://bizora.id';
  const baseUrl = `${getOrigin()}/api/v1/external`;

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const SECTIONS = [
    { id: 'overview', title: '1. Pengenalan & Quickstart', icon: Zap },
    { id: 'auth', title: '2. Autentikasi & API Keys', icon: Key },
    { id: 'profile', title: '3. GET /profile (Info Toko)', icon: Server },
    { id: 'products', title: '4. GET /products (Katalog & Stok)', icon: Layers },
    { id: 'orders', title: '5. POST /orders (Buat Pesanan)', icon: Code2 },
    { id: 'stock', title: '6. GET /stock (Sync Kuota)', icon: RefreshCw },
    { id: 'webhooks', title: '7. Webhooks & Verifikasi HMAC', icon: Webhook },
    { id: 'errors', title: '8. Status Code & Error Handling', icon: AlertCircle },
    { id: 'security', title: '9. Rate Limit & Best Practices', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#03110e] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Fixed Top Navigation */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#041512]/95 backdrop-blur-md border-b border-[#0f382e]/80 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden group-hover:scale-105 transition-transform">
                <img src={bizoraLogo} alt="Bizora" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black text-white font-mono tracking-wider">
                BIZORA
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
              API Docs v1.0
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <Link
              to="/"
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
            <Link
              to="/login"
              className="hidden sm:inline-block px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-[#082620] border border-[#14493e] transition-colors"
            >
              Masuk Dashboard
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Documentation Container (offset for fixed header) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-3 sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto space-y-2 bg-[#041915]/90 p-4 rounded-2xl border border-[#0f382e]/80 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-900">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Daftar Modul & API
          </div>
          <nav className="space-y-1">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    const el = document.getElementById(sec.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#06241e]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#0f382e]/80 mt-4 px-2 space-y-2">
            <div className="text-[11px] text-slate-400">
              Butuh bantuan implementasi?
            </div>
            <a
              href="mailto:support@bizora.id"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Hubungi Tim Integrasi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-16">
          
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>OVERVIEW & QUICKSTART</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Dokumentasi REST API & Webhooks Bizora
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Selamat datang di dokumentasi resmi <strong>Bizora Developer Platform</strong>. Melalui API ini, Anda dapat mengintegrasikan website e-commerce mandiri (Shopify, WooCommerce, Custom Web), aplikasi mobile Android/iOS, bot kasir WhatsApp, mesin POS pintar, sensor IoT, atau software ERP akuntansi langsung ke backend bisnis Anda di Bizora.
            </p>

            <div className="p-5 rounded-2xl bg-[#06241e] border border-[#114539] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Base URL Produksi:</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">HTTPS Only</span>
              </div>
              <div className="p-3 bg-[#020b09] rounded-xl font-mono text-xs text-emerald-300 border border-[#114539] flex items-center justify-between">
                <code>{baseUrl}</code>
                <button
                  onClick={() => copyCode(baseUrl, 'baseurl')}
                  className="px-2.5 py-1 bg-[#092922] hover:bg-[#0e3b32] text-xs font-sans rounded text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === 'baseurl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'baseurl' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Auth */}
          <section id="auth" className="space-y-6 pt-6 border-t border-[#0f382e]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
              <Key className="w-4 h-4" />
              <span>AUTENTIKASI & KEAMANAN</span>
            </div>
            <h2 className="text-2xl font-black text-white">Autentikasi Request</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Setiap request ke endpoint external API Bizora wajib menyertakan token API aktif yang digenerate dari dashboard toko Anda. Masukkan token tersebut pada HTTP Header <code className="text-emerald-400 font-mono">X-API-KEY</code> atau sebagai Bearer Token.
            </p>

            <div className="rounded-2xl bg-[#020b09] border border-[#133d34] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#051814] border-b border-[#133d34] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-bold">Contoh Header HTTP</span>
                <button
                  onClick={() => copyCode(`X-API-KEY: bzr_live_9a8f7e6d5c4b3a21...
Content-Type: application/json`, 'auth_header')}
                  className="px-2.5 py-1 bg-[#092922] text-slate-300 hover:text-white text-xs rounded font-sans flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === 'auth_header' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Salin</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto">
{`X-API-KEY: bzr_live_9a8f7e6d5c4b3a21...
Content-Type: application/json`}
              </pre>
            </div>
          </section>

          {/* Section 3: Profile */}
          <section id="profile" className="space-y-6 pt-6 border-t border-[#0f382e]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 font-mono">
              <Server className="w-4 h-4" />
              <span>ENDPOINT PROFIL</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-sky-950 text-sky-400 border border-sky-800 text-xs font-mono font-bold rounded-lg">GET</span>
              <h2 className="text-xl font-bold text-white font-mono">/profile</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Digunakan untuk memvalidasi token API, status aktif toko, serta informasi paket langganan dan kuota integrasi.
            </p>

            <div className="rounded-2xl bg-[#020b09] border border-[#133d34] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#051814] border-b border-[#133d34] text-xs font-mono text-slate-400 font-bold">
                Contoh Response JSON (200 OK)
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "data": {
    "tenant_id": "TN-2026-0089",
    "name": "Kopi Senja Nusantara",
    "category": "Kuliner",
    "status": "active",
    "plan": "Pro Developer",
    "features": {
      "apiAccess": true,
      "webhooks": true
    }
  }
}`}
              </pre>
            </div>
          </section>

          {/* Section 4: Products */}
          <section id="products" className="space-y-6 pt-6 border-t border-[#0f382e]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
              <Layers className="w-4 h-4" />
              <span>ENDPOINT PRODUK & KATALOG</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold rounded-lg">GET</span>
              <h2 className="text-xl font-bold text-white font-mono">/products</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Mengambil katalog produk aktif, harga jual, barcode SKU, dan stok saat ini. Mendukung parameter pencarian <code className="text-emerald-400 font-mono">?search=nama_produk</code> dan paginasi <code className="text-emerald-400 font-mono">?page=1&limit=50</code>.
            </p>

            <div className="rounded-2xl bg-[#020b09] border border-[#133d34] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#051814] border-b border-[#133d34] text-xs font-mono text-slate-400 font-bold">
                Contoh Response JSON (200 OK)
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": 104,
      "sku": "SKU-ARABICA-250G",
      "name": "Kopi Arabika Gayo 250gr",
      "category": "Biji Kopi",
      "price": 65000,
      "stock": 48,
      "stock_min": 10,
      "unit": "Pcs",
      "image_url": "https://bizora.id/storage/products/arabica.jpg"
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Section 5: Orders */}
          <section id="orders" className="space-y-6 pt-6 border-t border-[#0f382e]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
              <Code2 className="w-4 h-4" />
              <span>ENDPOINT ORDER & POTONG STOK</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono font-bold rounded-lg">POST</span>
              <h2 className="text-xl font-bold text-white font-mono">/orders</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Mencatat transaksi penjualan baru ke sistem Bizora. Stok produk yang dipesan akan otomatis diverifikasi dan dipotong secara realtime dari inventaris toko. Jika pembayaran lunas, webhook event <code className="text-emerald-400 font-mono">order.created</code> akan otomatis terkirim.
            </p>

            <div className="rounded-2xl bg-[#020b09] border border-[#133d34] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#051814] border-b border-[#133d34] text-xs font-mono text-slate-400 font-bold">
                Contoh Request Body (JSON)
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`{
  "customer_name": "Budi Santoso",
  "customer_phone": "08123456789",
  "payment_method": "ONLINE_TRANSFER",
  "notes": "Tolong packing rapi ya",
  "items": [
    {
      "product_id": 104,
      "quantity": 2,
      "price": 65000
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Section 6: Webhooks */}
          <section id="webhooks" className="space-y-6 pt-6 border-t border-[#0f382e]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 font-mono">
              <Webhook className="w-4 h-4" />
              <span>WEBHOOKS REALTIME & SIGNATURE HMAC</span>
            </div>
            <h2 className="text-2xl font-black text-white">Event Webhook & Verifikasi Keamanan</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Setiap kali ada kejadian transaksi, Bizora mengirimkan request HTTP POST ke endpoint server Anda. Setiap pengiriman dilengkapi header <code className="text-emerald-400 font-mono">X-Bizora-Signature</code> berupa hash HMAC-SHA256 dari payload menggunakan Secret Key Anda untuk memastikan request tidak dimanipulasi oleh pihak ketiga.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#06241e] border border-[#114539]">
                <code className="text-emerald-400 font-mono font-bold text-xs">order.created</code>
                <p className="text-slate-400 text-xs mt-1">Ditembakkan ketika ada order baru dibuat dari kasir, POS, atau API.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#06241e] border border-[#114539]">
                <code className="text-emerald-400 font-mono font-bold text-xs">payment.success</code>
                <p className="text-slate-400 text-xs mt-1">Ditembakkan ketika status pembayaran pesanan berubah menjadi Lunas.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#06241e] border border-[#114539]">
                <code className="text-emerald-400 font-mono font-bold text-xs">stock.low</code>
                <p className="text-slate-400 text-xs mt-1">Ditembakkan jika sisa stok suatu produk berada di bawah ambang minimum.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#020b09] border border-[#133d34] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#051814] border-b border-[#133d34] text-xs font-mono text-slate-400 font-bold">
                Contoh Verifikasi Signature di Node.js (Express)
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`const crypto = require('crypto');

app.post('/webhook-listener', (req, res) => {
  const signature = req.headers['x-bizora-signature'];
  const secretKey = 'your_webhook_secret_key';

  const computedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== computedSignature) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;
  console.log('Event Masuk:', event, data);
  res.status(200).send('OK');
});`}
              </pre>
            </div>
          </section>

          {/* Section 7: Errors */}
          <section id="errors" className="space-y-6 pt-6 border-t border-[#0f382e]/80">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 font-mono">
              <AlertCircle className="w-4 h-4" />
              <span>STATUS CODE & ERROR HANDLING</span>
            </div>
            <h2 className="text-2xl font-black text-white">Kode Respons HTTP</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-[#06241e] text-slate-300 font-bold border-b border-[#114539]">
                    <th className="p-3">HTTP Code</th>
                    <th className="p-3">Arti / Penjelasan</th>
                    <th className="p-3">Tindakan Client</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0f382e]/60 text-slate-300">
                  <tr>
                    <td className="p-3 text-emerald-400 font-bold">200 OK / 201 Created</td>
                    <td className="p-3">Request berhasil diproses.</td>
                    <td className="p-3">Lanjutkan alur logika aplikasi.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-amber-400 font-bold">400 Bad Request</td>
                    <td className="p-3">Format data salah atau stok barang tidak mencukupi.</td>
                    <td className="p-3">Cek detail pesan error di respons JSON.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-rose-400 font-bold">401 Unauthorized</td>
                    <td className="p-3">API Key hilang, salah, atau telah dicabut.</td>
                    <td className="p-3">Periksa header <code className="text-white">X-API-KEY</code> Anda.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-rose-400 font-bold">403 Forbidden</td>
                    <td className="p-3">Paket langganan belum memiliki fitur akses API.</td>
                    <td className="p-3">Upgrade ke paket Developer / Enterprise.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-rose-400 font-bold">429 Too Many Requests</td>
                    <td className="p-3">Melebihi batas kuota pemanggilan (Rate Limit).</td>
                    <td className="p-3">Terapkan jeda (backoff) retry request.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 8: Rate Limit */}
          <section id="security" className="space-y-6 pt-6 border-t border-[#0f382e]/80 pb-16">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>RATE LIMITING & BEST PRACTICES</span>
            </div>
            <h2 className="text-2xl font-black text-white">Batas Kecepatan (Rate Limiting)</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Untuk menjaga performa dan keandalan sistem multi-tenant, Bizora menerapkan batas default <strong>60 request per menit</strong> per API Key. Jika Anda membutuhkan batas pemanggilan yang lebih tinggi untuk integrasi skala perusahaan (Enterprise), silakan hubungi tim account manager kami.
            </p>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Siap Mengintegrasikan Aplikasi Anda?</h3>
                <p className="text-xs text-slate-300">Dapatkan token API gratis dan mulai uji coba integrasi sekarang.</p>
              </div>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Daftar Akun Developer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

        </main>
      </div>

    </div>
  );
}
