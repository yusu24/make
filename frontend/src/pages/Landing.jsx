import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './landing/landing-theme.css'
import bizoraLogo from '../assets/bizora-logo.png'

import Navbar from './landing/Navbar'
import Hero from './landing/Hero'
import SectorsSection from './landing/SectorsSection'
import FeaturesSection from './landing/FeaturesSection'
import HowItWorks from './landing/HowItWorks'
import RoiCalculator from './landing/RoiCalculator'
import Testimonials from './landing/Testimonials'
import FaqSection from './landing/FaqSection'
import Footer from './landing/Footer'
import PromoBanner from './landing/PromoBanner'
import BudidayaSubtypeModal from './landing/BudidayaSubtypeModal'

// Route map per slug — where to navigate after a successful demo login
const SLUG_ROUTES = {
  'toko-retail':      '/retail/dashboard',
  'budidaya-hewan':    '/budidaya/dashboard',
  'budidaya-tanaman': '/budidaya/dashboard',
  'kuliner':          '/kuliner/admin',
  'seller':           '/seller/dashboard',
  'jasa':             '/jasa/dashboard',
}

export default function Landing() {
  const { user, loginDemoSandbox, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [demoLoading, setDemoLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)
  const [submitForm, setSubmitForm] = useState({ name: '', role: '', stars: 5, text: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [showBudidayaModal, setShowBudidayaModal] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settings, setSettings] = useState({
    hero_title: 'Solusi Manajemen UMKM Digital Terbaik',
    hero_subtitle: '',
    hero_desc: 'Tingkatkan produktivitas bisnis Anda dengan fitur terlengkap.',
    campaign_text: 'Promo Spesial Kategori — Potongan Harga Upgrade Paket Aktif! Buat bisnis Anda naik tingkat.',
    campaign_active: true,
    show_sandbox: true,
    show_features: true,
    show_testimonials: true,
  })

  // Load dynamic landing page settings and active public testimonials
  useEffect(() => {
    api.get('/landing-settings')
      .then(r => { if (r.data?.data) setSettings(r.data.data) })
      .catch(e => console.error('Gagal mengambil pengaturan landing:', e))
      .finally(() => setSettingsLoading(false))

    api.get('/categories/public')
      .then(r => { if (r.data?.data) setCategories(r.data.data) })
      .catch(e => console.error('Gagal mengambil kategori:', e))
      .finally(() => setCategoriesLoading(false))

    api.get('/testimonials/public')
      .then(r => { if (r.data?.data) setTestimonials(r.data.data) })
      .catch(e => console.error('Gagal mengambil testimoni publik:', e))
      .finally(() => setTestimonialsLoading(false))
  }, [])

  // Scroll to the section named in the URL hash (e.g. coming from /register's "Fitur" link)
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDemoLogin = async (slug, subtype = null) => {
    if (slug === 'budidaya-hewan' && !subtype) {
      setShowBudidayaModal(true)
      return
    }
    setShowBudidayaModal(false)
    setDemoLoading(true)
    try {
      const path = SLUG_ROUTES[slug]
      if (!path) {
        alert('Modul ini segera hadir! 🚀')
        setDemoLoading(false)
        return
      }
      await loginDemoSandbox(slug, subtype)
      navigate(path)
    } catch (err) {
      alert('Gagal memproses demo sandbox: ' + (err.response?.data?.message || 'Koneksi bermasalah'))
    } finally {
      setDemoLoading(false)
    }
  }

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault()
    if (!submitForm.name.trim() || !submitForm.role.trim() || !submitForm.text.trim()) return
    setSubmitting(true)
    try {
      await api.post('/testimonials/public-submit', submitForm)
      setSubmitSuccess(true)
      setSubmitForm({ name: '', role: '', stars: 5, text: '' })
    } catch (err) {
      alert('Gagal mengirim ulasan: ' + (err.response?.data?.message || 'Masalah koneksi internet'))
    } finally {
      setSubmitting(false)
    }
  }

  // Sandbox demo buttons & sector tabs only show admin-selected categories
  // (settings.featured_categories); an empty/unset list means "show all".
  const featuredCategories = settings.featured_categories?.length
    ? categories.filter(c => settings.featured_categories.includes(c.slug))
    : categories

  // Redirect to dashboard instantly if user is already authenticated
  if (user) {
    if (user.role === 'super_admin' || user.role === 'admin') return <Navigate to="/dashboard" replace />
    if (user.business_category === 'Toko Retail') return <Navigate to="/retail/dashboard" replace />
    if (user.business_category === 'Budidaya Hewan' || user.business_category === 'Budidaya Tanaman') return <Navigate to="/budidaya/dashboard" replace />
    if (user.business_category === 'Kuliner') return <Navigate to="/kuliner/admin" replace />
    if (user.business_category === 'Seller') return <Navigate to="/seller/dashboard" replace />
    if (user.business_category === 'Jasa') return <Navigate to="/jasa/dashboard" replace />
    return <Navigate to="/coming-soon" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      <h2 className="sr-only">BIZORA — halaman utama, login, dan fitur platform digital bisnis Indonesia</h2>

      <Navbar
        user={user}
        onLogout={() => { logout(); }}
        onScrollTo={scrollTo}
        logoUrl={settings.landing_logo_url || bizoraLogo}
      />

      <Hero
        settings={settings}
        settingsLoading={settingsLoading}
        categories={featuredCategories}
        categoriesLoading={categoriesLoading}
        demoLoading={demoLoading}
        onOpenSandbox={handleDemoLogin}
        onScrollToFeatures={() => scrollTo('fitur')}
      />

      {settings.show_features && (
        <>
          <SectorsSection categories={featuredCategories} categoriesLoading={categoriesLoading} onOpenSandbox={handleDemoLogin} />
          <FeaturesSection features={settings.features_platform} />
        </>
      )}

      <HowItWorks steps={settings.how_it_works_steps} />

      <RoiCalculator title={settings.roi_title} desc={settings.roi_desc} />

      {settings.show_testimonials && (
        <Testimonials
          testimonials={testimonials}
          testimonialsLoading={testimonialsLoading}
          submitForm={submitForm}
          setSubmitForm={setSubmitForm}
          submitting={submitting}
          submitSuccess={submitSuccess}
          onSubmit={handleSubmitTestimonial}
        />
      )}

      <FaqSection faqs={settings.faq_items} />

      <Footer
        categories={categories}
        logoUrl={settings.landing_logo_url || bizoraLogo}
        onScrollTo={scrollTo}
        brandDesc={settings.footer_brand_desc}
        address={settings.footer_address}
        phone={settings.footer_phone}
        email={settings.footer_email}
        securityText={settings.footer_security_text}
      />

      <PromoBanner
        active={settings.campaign_active}
        loading={settingsLoading}
        text={settings.campaign_text}
        onClick={() => scrollTo('fitur')}
      />

      <BudidayaSubtypeModal
        isOpen={showBudidayaModal}
        onClose={() => setShowBudidayaModal(false)}
        onSelect={(subtype) => handleDemoLogin('budidaya-hewan', subtype)}
      />
    </div>
  )
}
