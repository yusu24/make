<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionActivatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $activatedData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $activatedData)
    {
        $this->activatedData = $activatedData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 Pembayaran Berhasil - Paket Langganan ' . ($this->activatedData['plan'] ?? '') . ' Anda Telah Aktif!',
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
        $data = $this->activatedData;
        $customerName = htmlspecialchars($data['customer_name'] ?? 'Pelanggan');
        $invoiceNumber = htmlspecialchars($data['invoice_number'] ?? '');
        $plan = htmlspecialchars($data['plan'] ?? 'Basic');
        $expiresAt = htmlspecialchars($data['expires_at'] ?? '');
        $appUrl = htmlspecialchars(config('app.url', 'http://localhost:5173'));

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pembayaran Langganan Berhasil</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); max-width:90%;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg, #10b981, #059669); padding:30px; text-align:center; color:#ffffff;">
                            <div style="font-size:40px; margin-bottom:10px;">🎉</div>
                            <h1 style="margin:0; font-size:24px; font-weight:800;">Pembayaran Berhasil!</h1>
                            <p style="margin:5px 0 0 0; font-size:14px; opacity:0.9;">Paket Langganan Bizora Anda Telah Aktif</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding:30px;">
                            <p style="font-size:15px; color:#334155; margin-top:0;">Halo <strong>{$customerName}</strong>,</p>
                            <p style="font-size:14px; color:#475569; line-height:1.6;">Selamat! Pembayaran tagihan Anda dengan No. Invoice <strong>{$invoiceNumber}</strong> telah berhasil kami terima dan terverifikasi secara penuh.</p>
                            
                            <table width="100%" cellpadding="12" cellspacing="0" style="background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0; margin:20px 0; font-size:14px;">
                                <tr>
                                    <td style="color:#166534; border-bottom:1px solid #dcfce7;">Status Paket</td>
                                    <td align="right" style="font-weight:800; color:#15803d; border-bottom:1px solid #dcfce7;">AKTIF ✅</td>
                                </tr>
                                <tr>
                                    <td style="color:#166534; border-bottom:1px solid #dcfce7;">Paket Terpilih</td>
                                    <td align="right" style="font-weight:700; color:#166534; border-bottom:1px solid #dcfce7;">{$plan}</td>
                                </tr>
                                <tr>
                                    <td style="color:#166534;">Berlaku Hingga</td>
                                    <td align="right" style="font-weight:700; color:#166534;">{$expiresAt}</td>
                                </tr>
                            </table>

                            <p style="font-size:14px; color:#475569; line-height:1.6;">Anda sekarang dapat menikmati seluruh fitur lengkap dari paket <strong>{$plan}</strong> untuk mendukung pertumbuhan bisnis Anda.</p>

                            <div style="text-align:center; margin:30px 0 10px 0;">
                                <a href="{$appUrl}" style="background:linear-gradient(135deg, #4f46e5, #7c3aed); color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:700; font-size:14px; display:inline-block;">Buka Dashboard Bisnis Saya</a>
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc; padding:20px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8;">
                            &copy; 2026 Bizora SaaS Platform. Terima kasih atas kepercayaan Anda!
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
