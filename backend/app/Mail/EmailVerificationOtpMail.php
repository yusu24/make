<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otpCode;
    public string $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otpCode, string $userName = 'Pengguna')
    {
        $this->otpCode = $otpCode;
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🔐 {$this->otpCode} adalah Kode Verifikasi Akun BIZORA Anda",
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
        $otp = htmlspecialchars($this->otpCode);
        $name = htmlspecialchars($this->userName);
        $appUrl = htmlspecialchars(config('app.url', 'http://localhost:5173'));

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi BIZORA</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; }
        .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .content { padding: 32px 28px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #065f46; font-family: monospace; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">BIZORA</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Platform Ekosistem Digital Bisnis &amp; UMKM</p>
        </div>
        <div class="content">
            <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #0f172a;">Halo, {$name}! 👋</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Terima kasih telah mendaftar di <strong>BIZORA</strong>. Untuk memverifikasi kepemilikan alamat email dan mengaktifkan akun bisnis Anda, silakan masukkan kode OTP berikut:
            </p>

            <div class="otp-box">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 6px; letter-spacing: 1px;">KODE VERIFIKASI OTP</div>
                <div class="otp-code">{$otp}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏳ Kode berlaku selama <strong>15 Menit</strong></div>
            </div>

            <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #92400e; margin-bottom: 20px;">
                <strong>⚠️ Keamanan Akun:</strong> Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan BIZORA.
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                Jika Anda tidak merasa mendaftar di BIZORA, abaikan email ini.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 BIZORA Platform. Seluruh hak cipta dilindungi undang-undang.
        </div>
    </div>
</body>
</html>
HTML;
    }
}
