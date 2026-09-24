import { Link } from 'react-router-dom'
import { Building2, Phone, Mail, MapPin, Heart } from '@/constants/icons'
import bizoraLogo from '../../assets/bizora-logo.png'

const DEFAULTS = {
  brandDesc: 'Platform bisnis digital #1 Indonesia untuk kelola toko retail, kuliner, serta budidaya hewan dan tanaman dalam satu aplikasi terpadu.',
  address: 'Jakarta & Bandung, Indonesia',
  phone: '+62 812-3456-7890 (CS WhatsApp 24/7)',
  email: 'bantuan@bizora.id',
  securityText: 'Bizora menggunakan infrastruktur cloud terenkripsi SSL 256-bit dengan backup otomatis harian.',
}

export default function Footer({ categories, logoUrl, onScrollTo, brandDesc, address, phone, email, securityText }) {
  const handleNavClick = (e, id) => {
    e.preventDefault()
    onScrollTo(id)
  }

  return (
    <footer className="bg-[#02100d] border-t border-[#0d382e] text-slate-400 text-xs pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#0e3b31]">

          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-[10px] overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={logoUrl || bizoraLogo} alt="BIZORA" className="w-full h-full object-contain rounded-[10px]" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-[0.06em]" style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif" }}>BIZORA</span>
            </div>

            <p className="text-slate-300 leading-relaxed max-w-sm">
              {brandDesc || DEFAULTS.brandDesc}
            </p>

            <div className="space-y-2 pt-2 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{address || DEFAULTS.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{phone || DEFAULTS.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{email || DEFAULTS.email}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-2">
              <li><a href="#beranda" onClick={(e) => handleNavClick(e, 'beranda')} className="hover:text-emerald-400 transition-colors">Beranda</a></li>
              <li><a href="#fitur" onClick={(e) => handleNavClick(e, 'fitur')} className="hover:text-emerald-400 transition-colors">Fitur Platform</a></li>
              <li><a href="#cara-kerja" onClick={(e) => handleNavClick(e, 'cara-kerja')} className="hover:text-emerald-400 transition-colors">Cara Kerja</a></li>
              <li><Link to="/developers" className="hover:text-emerald-400 transition-colors">API &amp; Developer</Link></li>
              <li><a href="#testimoni" onClick={(e) => handleNavClick(e, 'testimoni')} className="hover:text-emerald-400 transition-colors">Testimoni</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sektor Usaha</h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <span className="text-slate-300">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Keamanan &amp; Layanan</h4>
            <p className="text-slate-400 leading-relaxed">
              {securityText || DEFAULTS.securityText}
            </p>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <p>✓ Privasi Data Terjamin</p>
              <p>✓ Berizin &amp; Terdaftar Resmi</p>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} BIZORA Indonesia. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Kemajuan UMKM Indonesia
          </p>
        </div>

      </div>
    </footer>
  )
}
