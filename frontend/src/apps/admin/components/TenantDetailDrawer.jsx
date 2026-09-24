import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Store,
  Mail,
  Calendar,
  CreditCard,
  Box,
  KeyRound,
  Key,
  Pencil,
  Trash2,
  Users,
  Package,
  ShoppingBag,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Shield,
  Clock,
  RefreshCw,
  HardDrive
} from '@/constants/icons'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import { api } from '../../../lib/api'

export default function TenantDetailDrawer({
  isOpen,
  tenant,
  onClose,
  onImpersonate,
  onOpenResetPassword,
  onEdit,
  onOpenModules,
  onRefresh
}) {
  const [detailData, setDetailData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'modules' | 'stats'

  useEffect(() => {
    if (!isOpen || !tenant) {
      setDetailData(null)
      return
    }

    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/tenants/${tenant.tenant_id}`)
        setDetailData(res.data?.data || tenant)
      } catch {
        setDetailData(tenant)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [isOpen, tenant])

  if (!isOpen || !tenant) return null

  const data = detailData || tenant
  const stats = data.stats || {}

  const healthColor = data.health_status === 'healthy' 
    ? { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' }
    : data.health_status === 'warning'
    ? { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }
    : { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#ffffff',
          height: '100%',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideLeft 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          padding: '24px 24px 20px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={getAvatarStyle(data.name || data.tenant_id, 52)}>
                {getInitials(data.name || data.tenant_id)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                    {data.name || data.business_name}
                  </h3>
                  {data.is_demo && (
                    <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                      DEMO
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>
                  <code style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: 4, color: '#a5b4fc', fontFamily: 'monospace' }}>
                    {data.tenant_id}
                  </code>
                  <span>•</span>
                  <span>{data.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              title="Tutup Panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Status Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <span style={{
              background: data.status === 'active' ? '#10b98125' : '#ef444425',
              border: `1px solid ${data.status === 'active' ? '#10b98180' : '#ef444480'}`,
              color: data.status === 'active' ? '#34d399' : '#f87171',
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700
            }}>
              {data.status === 'active' ? '✓ Tenant Aktif' : '✗ Nonaktif'}
            </span>

            <span style={{
              background: healthColor.bg,
              border: `1px solid ${healthColor.border}`,
              color: healthColor.text,
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <Activity size={12} />
              <span>Health: {data.health_label || 'Sehat'} ({data.health_score ?? 85})</span>
            </span>

            <span style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600
            }}>
              Paket: {data.subscription_plan || data.plan || 'Free'}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 18, marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'overview' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'overview' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                borderBottom: activeTab === 'overview' ? '2px solid #818cf8' : '2px solid transparent',
                paddingBottom: 4
              }}
            >
              Ringkasan Operasional
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'modules' ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === 'modules' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                borderBottom: activeTab === 'modules' ? '2px solid #818cf8' : '2px solid transparent',
                paddingBottom: 4
              }}
            >
              Modul &amp; Hak Akses
            </button>
          </div>
        </div>

        {/* Drawer Body Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f8fafc' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
              <span>Memuat data lengkap tenant...</span>
            </div>
          ) : activeTab === 'overview' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 4 Metric Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <Users size={18} className="text-indigo-600 mx-auto mb-1" />
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{stats.total_users ?? 1}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Staf Akun</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <Package size={18} className="text-emerald-600 mx-auto mb-1" />
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{stats.total_products ?? 0}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Katalog</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <ShoppingBag size={18} className="text-blue-600 mx-auto mb-1" />
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{stats.total_transactions ?? 0}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Transaksi</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <FileText size={18} className="text-amber-600 mx-auto mb-1" />
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{stats.total_invoices ?? 0}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Tagihan</div>
                </div>
              </div>

              {/* Box 1: Langganan & Kuota */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', marginBottom: 12 }}>
                  <CreditCard size={16} className="text-indigo-600" />
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Paket Langganan &amp; Kuota</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Paket Terdaftar</span>
                    <strong style={{ color: '#4f46e5', textTransform: 'uppercase' }}>{data.subscription_plan || data.plan || 'Free'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Harga Langganan</span>
                    <strong>{stats.plan_price ? `Rp ${Number(stats.plan_price).toLocaleString('id-ID')}/bln` : 'Gratis'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Masa Berlaku Hingga</span>
                    <strong>{data.expires_at || 'Selamanya'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Batas Maksimum Pegawai</span>
                    <strong>{stats.max_staff || '1 Staf'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Batas Katalog Produk</span>
                    <strong>{stats.max_products || '100 Produk'}</strong>
                  </div>
                </div>
              </div>

              {/* Box 2: Metadata Bisnis */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', marginBottom: 12 }}>
                  <Store size={16} className="text-emerald-600" />
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Informasi Bisnis</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Sektor Industri</span>
                    <strong>{data.category || 'Retail'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Aktivitas Terakhir</span>
                    <strong style={{ color: '#0284c7' }}>{data.last_activity_human || 'Belum ada aktivitas'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Tanggal Pendaftaran</span>
                    <strong>{data.joined || data.created_at || '-'}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: 14, fontSize: 12.5, color: '#3730a3' }}>
                <strong>Daftar Modul Terpasang:</strong> Modul khusus yang aktif untuk toko ini dapat disesuaikan sewaktu-waktu sesuai kebutuhan tenant.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.active_modules && stats.active_modules.length > 0 ? (
                  stats.active_modules.map((mName, i) => (
                    <div key={i} style={{
                      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
                      padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Box size={16} className="text-emerald-600" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{mName}</span>
                      </div>
                      <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                        ✓ Aktif
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12.5 }}>
                    Menggunakan konfigurasi modul standar sektor {data.category}.
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose()
                  if (onOpenModules) onOpenModules(data.tenant_id)
                }}
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Box size={14} />
                <span>Buka Konfigurator Modul Lengkap</span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Sticky Action Footer */}
        <div style={{
          padding: '16px 24px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose()
                if (onOpenResetPassword) onOpenResetPassword(data)
              }}
              title="Reset Password Tenant"
              style={{ color: '#d97706' }}
            >
              <Key size={13} />
              <span>Reset Password</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose()
                if (onEdit) onEdit(data)
              }}
              title="Edit Data Tenant"
            >
              <Pencil size={13} />
              <span>Edit</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onClose()
              if (onImpersonate) onImpersonate(data)
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <KeyRound size={13} />
            <span>Login Tenant</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}