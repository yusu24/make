import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function ErrorPage() {
  const navigate = useNavigate()
  const [errorInfo, setErrorInfo] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('umkm_last_error')
    if (!raw) return
    try {
      setErrorInfo(JSON.parse(raw))
    } catch {
      // malformed entry — ignore, generic message will show instead
    }
  }, [])

  const handleBackHome = () => {
    sessionStorage.removeItem('umkm_last_error')
    navigate('/')
  }

  return (
    <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__grid" />
      </div>

      <div className="card card-pad animate-fade-in" style={{ maxWidth: 560, width: '100%', textAlign: 'center', zIndex: 1, padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Terjadi Kesalahan</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          Maaf, aplikasi mengalami masalah yang tidak terduga saat memuat halaman ini.
        </p>

        {errorInfo ? (
          <div style={{
            textAlign: 'left', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 12, padding: 16, marginBottom: 24,
          }}>
            <p style={{ margin: '0 0 6px 0', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.3 }}>
              PESAN ERROR
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: 13, fontFamily: 'monospace', color: '#dc2626', wordBreak: 'break-word' }}>
              {errorInfo.message || 'Tidak diketahui'}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Halaman: <code>{errorInfo.path || '-'}</code>
              {errorInfo.time && <> · {new Date(errorInfo.time).toLocaleString('id-ID')}</>}
            </p>

            {errorInfo.stack && (
              <>
                <button
                  type="button"
                  onClick={() => setShowDetail(v => !v)}
                  style={{
                    marginTop: 10, background: 'none', border: 'none', padding: 0,
                    color: 'var(--primary-500)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {showDetail ? 'Sembunyikan detail teknis' : 'Tampilkan detail teknis'}
                </button>
                {showDetail && (
                  <pre style={{
                    marginTop: 10, fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                    maxHeight: 220, overflow: 'auto', background: 'var(--bg-base)',
                    border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10,
                    color: 'var(--text-secondary)',
                  }}>
                    {errorInfo.stack}
                  </pre>
                )}
              </>
            )}
          </div>
        ) : (
          <p style={{ marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            Tidak ada detail teknis yang tercatat untuk kesalahan ini.
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => window.location.reload()}>
            Muat Ulang
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBackHome}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  )
}
