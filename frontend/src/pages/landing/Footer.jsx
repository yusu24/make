import { Building2, Phone, Mail, MapPin, Heart } from 'lucide-react'

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
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="BIZORA Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-5 h-5 text-[#041512]" />
                )}
              </div>
              <span className="text-xl font-black text-white font-mono tracking-wider">BIZORA</span>
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
