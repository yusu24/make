import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, Sparkles, Building2 } from 'lucide-react'

const NAV_LINKS = [
  { name: 'Beranda', href: '#beranda' },
  { name: 'Fitur', href: '#fitur' },
  { name: 'Cara Kerja', href: '#cara-kerja' },
  { name: 'Testimoni', href: '#testimoni' },
]

export default function Navbar({ user, onLogout, onScrollTo, logoUrl }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    onScrollTo(href.slice(1))
  }

  return (
    <header className="sticky top-0 z-50 bg-[#041512]/90 backdrop-blur-md border-b border-[#0f382e]/60 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        <a href="#beranda" onClick={(e) => handleNavClick(e, '#beranda')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="BIZORA Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-6 h-6 bg-[#041512] rounded-lg flex items-center justify-center relative">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
            )}
          </div>
          <span className="text-xl font-black tracking-wider text-white font-mono">
            BIZORA
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-semibold text-slate-200 hover:text-white transition-colors px-3 py-2">
                Ke Dashboard
              </Link>
              <button
                onClick={onLogout}
                className="bg-[#082620] hover:bg-[#0c382f] text-slate-200 border border-[#1a5749] text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white transition-colors px-3 py-2">
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-[#10b981] hover:bg-[#059669] text-[#03110e] text-sm font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 flex items-center gap-2"
              >
                <span>Daftar Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#051c17] border-b border-[#0f382e] px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 py-2 border-b border-[#0f382e]/40"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-200 bg-[#082620] border border-[#14473b] rounded-lg"
                >
                  Ke Dashboard
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout() }}
                  className="w-full text-center py-2.5 text-sm font-bold text-[#03110e] bg-[#10b981] rounded-lg"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-200 bg-[#082620] border border-[#14473b] rounded-lg"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-[#03110e] bg-[#10b981] rounded-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                >
                  <span>Daftar Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
