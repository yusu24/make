<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $invoiceData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $invoiceData)
    {
        $this->invoiceData = $invoiceData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚡ Tagihan Pembayaran Langganan Bizora SaaS [' . ($this->invoiceData['invoice_number'] ?? '') . ']',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    /**
     * Build responsive HTML email content.
     */
    private function buildHtml(): string
    {
        $inv = $this->invoiceData;
        $customerName = htmlspecialchars($inv['customer_name'] ?? 'Pelanggan');
        $invoiceNumber = htmlspecialchars($inv['invoice_number'] ?? '');
        $plan = htmlspecialchars($inv['plan'] ?? 'Basic');
        $amount = number_format((float) ($inv['amount'] ?? 0), 0, ',', '.');
        $dueDate = htmlspecialchars($inv['due_date'] ?? '');
        $bankName = htmlspecialchars($inv['bank_name'] ?? 'BANK BCA');
        $bankNo = htmlspecialchars($inv['bank_account_no'] ?? '8837 001 992');
        $bankHolder = htmlspecialchars($inv['bank_account_name'] ?? 'PT Antigravity Global SaaS');
        $billingEmail = htmlspecialchars($inv['billing_email'] ?? 'billing@bizora.id');
        $supportEmail = htmlspecialchars($inv['support_email'] ?? 'bantuan@bizora.id');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tagihan Pembayaran Bizora</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); max-width:90%;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg, #4f46e5, #7c3aed); padding:30px; text-align:center; color:#ffffff;">
                            <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px;">BIZORA SaaS</h1>
                            <p style="margin:5px 0 0 0; font-size:14px; opacity:0.9;">Tagihan Pembayaran Langganan</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:30px;">
                            <p style="font-size:15px; color:#334155; margin-top:0;">Halo <strong>{$customerName}</strong>,</p>
                            <p style="font-size:14px; color:#475569; line-height:1.6;">Terima kasih telah mengajukan upgrade langganan di Bizora. Berikut adalah detail tagihan pembayaran Anda:</p>
                            
                            <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; margin:20px 0; font-size:14px;">
                                <tr>
                                    <td style="color:#64748b; border-bottom:1px solid #e2e8f0;">No. Invoice</td>
                                    <td align="right" style="font-weight:700; color:#1e293b; border-bottom:1px solid #e2e8f0;">{$invoiceNumber}</td>
                                </tr>
                                <tr>
                                    <td style="color:#64748b; border-bottom:1px solid #e2e8f0;">Paket Langganan</td>
                                    <td align="right" style="font-weight:700; color:#4f46e5; border-bottom:1px solid #e2e8f0;">{$plan}</td>
                                </tr>
                                <tr>
                                    <td style="color:#64748b; border-bottom:1px solid #e2e8f0;">Total Tagihan</td>
                                    <td align="right" style="font-size:18px; font-weight:800; color:#10b981; border-bottom:1px solid #e2e8f0;">Rp {$amount}</td>
                                </tr>
                                <tr>
                                    <td style="color:#64748b;">Batas Waktu Pembayaran</td>
                                    <td align="right" style="font-weight:600; color:#ef4444;">{$dueDate}</td>
                                </tr>
                            </table>

                            <div style="background:#f1f5f9; padding:16px; border-radius:8px; margin-bottom:20px;">
                                <h4 style="margin:0 0 8px 0; color:#1e293b; font-size:14px;">🏦 Instruksi Transfer Bank / E-Wallet:</h4>
                                <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">
                                    Silakan lakukan pembayaran ke rekening berikut:<br>
                                    Bank: <strong>{$bankName}</strong><br>
                                    No. Rekening: <strong>{$bankNo}</strong><br>
                                    Atas Nama: <strong>{$bankHolder}</strong>
                                </p>
                            </div>

                            <p style="font-size:13px; color:#64748b; line-height:1.5;">Jika ada pertanyaan seputar tagihan ini, silakan hubungi tim penagihan kami di <a href="mailto:{$billingEmail}" style="color:#4f46e5; text-decoration:none; font-weight:600;">{$billingEmail}</a> atau layanan bantuan CS di <a href="mailto:{$supportEmail}" style="color:#4f46e5; text-decoration:none; font-weight:600;">{$supportEmail}</a>.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc; padding:20px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8;">
                            &copy; 2026 Bizora SaaS Platform. Semua hak dilindungi.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }
}
