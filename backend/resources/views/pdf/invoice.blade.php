<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice['id'] ?? 'INV' }}</title>
    <style>
        @page {
            margin: 30px 40px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 12px;
            line-height: 1.5;
            background: #ffffff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table {
            margin-bottom: 30px;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 15px;
        }
        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #4f46e5;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .company-sub {
            font-size: 11px;
            color: #64748b;
            margin: 2px 0 0 0;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            text-align: right;
            text-transform: uppercase;
            margin: 0;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
            text-align: center;
        }
        .badge-paid {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
        }
        .badge-unpaid {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fde047;
        }
        .badge-overdue {
            background-color: #ffe4e6;
            color: #be123c;
            border: 1px solid #fecdd3;
        }
        .info-table {
            margin-bottom: 25px;
        }
        .info-box {
            vertical-align: top;
            width: 50%;
        }
        .info-label {
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 12px;
            color: #1e293b;
        }
        .items-table {
            margin-bottom: 25px;
        }
        .items-table th {
            background-color: #4f46e5;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            text-align: left;
            padding: 8px 12px;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .total-box {
            float: right;
            width: 250px;
            margin-bottom: 30px;
        }
        .total-row td {
            padding: 6px 12px;
        }
        .grand-total {
            font-size: 14px;
            font-weight: bold;
            color: #4f46e5;
            background-color: #e0e7ff;
            border-top: 2px solid #6366f1;
        }
        .payment-box {
            background-color: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 15px;
            margin-top: 40px;
            clear: both;
        }
        .payment-title {
            font-size: 11px;
            font-weight: bold;
            color: #334155;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .footer-note {
            margin-top: 30px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td style="width: 58%; vertical-align: top;">
                <table style="border: none; margin: 0; padding: 0; width: auto;">
                    <tr>
                        @if(!empty($settings['invoice_logo_base64']))
                            <td style="vertical-align: middle; padding-right: 14px; width: 60px;">
                                <img src="{{ $settings['invoice_logo_base64'] }}" style="max-height: 50px; max-width: 70px; display: block;">
                            </td>
                        @elseif(!empty($settings['invoice_logo_url']))
                            <td style="vertical-align: middle; padding-right: 14px; width: 60px;">
                                <img src="{{ $settings['invoice_logo_url'] }}" style="max-height: 50px; max-width: 70px; display: block;">
                            </td>
                        @endif
                        <td style="vertical-align: middle;">
                            <h1 class="company-name" style="margin: 0;">{{ $settings['company_name'] ?? 'BIZORA SaaS' }}</h1>
                            <p class="company-sub" style="margin: 2px 0 0 0;">{{ $settings['company_tagline'] ?? 'Sistem Manajemen Usaha & Kasir Terintegrasi' }}</p>
                        </td>
                    </tr>
                </table>
                <p class="company-sub" style="margin-top: 6px;">
                    {{ $settings['company_address'] ?? 'Jl. Jendral Sudirman No. 123, Jakarta' }}<br>
                    Email: {{ $settings['company_email'] ?? 'support@bizora.id' }} | Telp: {{ $settings['company_phone'] ?? '0812-3456-7890' }}
                </p>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right;">
                @if(($invoice['status'] ?? 'unpaid') === 'paid')
                    <h2 class="invoice-title" style="color: #15803d;">KUITANSI LUNAS</h2>
                @else
                    <h2 class="invoice-title">INVOICE / TAGIHAN</h2>
                @endif
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
                    No: <strong>{{ $invoice['id'] ?? 'INV-001' }}</strong>
                </p>
            </td>
        </tr>
    </table>

    <!-- Billing Info Section with Center Stamp -->
    <table class="info-table">
        <tr>
            <td class="info-box" style="width: 38%; vertical-align: middle;">
                <div class="info-label">DITAGIHKAN KEPADA:</div>
                <div class="info-value">
                    <strong>{{ $invoice['tenant_name'] ?? 'Tenant UMKM' }}</strong><br>
                    ID Tenant: <code>{{ $invoice['tenant_id'] ?? '-' }}</code><br>
                    Email: {{ $invoice['tenant_email'] ?? '-' }}
                </div>
            </td>

            {{-- Center Stamp Column --}}
            <td style="width: 24%; vertical-align: middle; text-align: center; padding: 8px 4px;">
                @if(($invoice['status'] ?? 'unpaid') === 'paid')
                    <div class="stamp-paid">
                        <div class="stamp-sub">★ RESMI &amp; TERVERIFIKASI ★</div>
                        <div style="font-size: 15px; padding: 2px 0; letter-spacing: 3px;">L U N A S</div>
                        <div class="stamp-sub">OFFICIAL RECEIPT</div>
                    </div>
                @elseif(($invoice['status'] ?? 'unpaid') === 'overdue')
                    <div class="stamp-overdue">
                        <div style="font-size: 8px; letter-spacing: 0.5px;">⚠ PERINGATAN</div>
                        <div style="font-size: 13px; padding: 1px 0;">JATUH TEMPO</div>
                    </div>
                @else
                    <div class="stamp-unpaid">
                        <div style="font-size: 8px; letter-spacing: 0.5px;">MENUNGGU PEMBAYARAN</div>
                        <div style="font-size: 13px; padding: 1px 0;">BELUM DIBAYAR</div>
                    </div>
                @endif
            </td>

            <td class="info-box" style="width: 38%; text-align: right; vertical-align: middle;">
                <div class="info-label">RINCIAN TANGGAL:</div>
                <div class="info-value">
                    Tanggal Terbit: <strong>{{ $invoice['date'] ?? date('Y-m-d') }}</strong><br>
                    @if(($invoice['status'] ?? 'unpaid') === 'paid')
                        Status Pembayaran: <strong style="color: #15803d;">Lunas Terverifikasi</strong><br>
                    @else
                        Batas Jatuh Tempo: <strong style="color: #dc2626;">{{ $invoice['due_date'] ?? date('Y-m-d', strtotime('+7 days')) }}</strong><br>
                    @endif
                    Metode Pembayaran: <strong>Transfer Bank / Rekening</strong>
                </div>
            </td>
        </tr>
    </table>


    <!-- Items Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 60%;">Deskripsi Layanan</th>
                <th style="width: 20%; text-align: center;">Paket</th>
                <th style="width: 20%; text-align: right;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>Langganan Sistem BIZORA SaaS (Paket {{ $invoice['plan'] ?? 'Pro' }})</strong><br>
                    <span style="font-size: 10px; color: #64748b;">Akses penuh fitur kasir, inventaris, laporan keuangan, dan multi-outlet.</span>
                </td>
                <td style="text-align: center; font-weight: bold;">{{ $invoice['plan'] ?? 'Pro' }}</td>
                <td style="text-align: right; font-weight: bold;">Rp {{ number_format($invoice['amount'] ?? 0, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Total Summary -->
    <table class="total-box">
        <tr class="total-row">
            <td style="color: #64748b;">Subtotal:</td>
            <td style="text-align: right;">Rp {{ number_format($invoice['amount'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td style="color: #64748b;">Pajak (0%):</td>
            <td style="text-align: right;">Rp 0</td>
        </tr>
        <tr class="total-row grand-total" style="{{ ($invoice['status'] ?? 'unpaid') === 'paid' ? 'background-color: #dcfce7; color: #15803d; border-top: 2px solid #22c55e;' : '' }}">
            <td>TOTAL {{ ($invoice['status'] ?? 'unpaid') === 'paid' ? 'DIBAYAR' : 'TAGIHAN' }}:</td>
            <td style="text-align: right;">Rp {{ number_format($invoice['amount'] ?? 0, 0, ',', '.') }}</td>
        </tr>
    </table>
    <div style="clear: both;"></div>

    <!-- Payment Instruction / Receipt Box -->
    @if(($invoice['status'] ?? 'unpaid') === 'paid')
        <div class="payment-box" style="background-color: #f0fdf4; border: 1px solid #86efac;">
            <div class="payment-title" style="color: #15803d;">STATUS: TELAH DIBAYAR LUNAS (OFFICIAL RECEIPT)</div>
            <table style="font-size: 11px;">
                <tr>
                    <td style="width: 130px; color: #166534;">Diterima Pada Rekening:</td>
                    <td><strong>{{ $settings['bank_name'] ?? 'Bank Mandiri' }} ({{ $settings['bank_account_number'] ?? '123-00-9988776-5' }})</strong> a.n. <strong>{{ $settings['bank_account_name'] ?? 'PT BIZORA TEKNOLOGI INDONESIA' }}</strong></td>
                </tr>
                <tr>
                    <td style="color: #166534;">Keterangan:</td>
                    <td style="color: #15803d; font-weight: bold;">Pembayaran telah diverifikasi. Paket aktif dan dapat digunakan.</td>
                </tr>
            </table>
        </div>
    @else
        <div class="payment-box">
            <div class="payment-title">INSTRUKSI PEMBAYARAN / TRANSFER REKENING BANK:</div>
            <table style="font-size: 11px;">
                <tr>
                    <td style="width: 120px; color: #64748b;">Nama Bank:</td>
                    <td><strong>{{ $settings['bank_name'] ?? 'Bank Mandiri' }}</strong></td>
                </tr>
                <tr>
                    <td style="color: #64748b;">Nomor Rekening:</td>
                    <td><strong style="font-size: 13px; color: #4f46e5;">{{ $settings['bank_account_number'] ?? '123-00-9988776-5' }}</strong></td>
                </tr>
                <tr>
                    <td style="color: #64748b;">Atas Nama:</td>
                    <td><strong>{{ $settings['bank_account_name'] ?? 'PT BIZORA TEKNOLOGI INDONESIA' }}</strong></td>
                </tr>
                @if(!empty($settings['payment_notes']))
                <tr>
                    <td style="color: #64748b; vertical-align: top;">Catatan:</td>
                    <td>{{ $settings['payment_notes'] }}</td>
                </tr>
                @endif
            </table>
        </div>
    @endif

    <!-- Footer Note / Terms -->
    <div class="footer-note">
        <p>{{ $settings['invoice_terms'] ?? 'Terima kasih atas kepercayaan Anda menggunakan BIZORA SaaS. Faktur ini sah tanpa tanda tangan fisik.' }}</p>
    </div>

</body>
</html>
