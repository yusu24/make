import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { Bell, Sparkles, AlertTriangle, ShieldCheck, Tag, X, Check } from 'lucide-react';

export default function AnnouncementModal() {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.get('/announcements/active');
        const list = res.data?.data || [];
        if (list.length > 0) {
          // Find the first announcement not dismissed yet
          const unread = list.find(a => !localStorage.getItem(`bzr_announcement_seen_${a.id}`));
          if (unread) {
            setAnnouncement(unread);
            setVisible(true);
          }
        }
      } catch {
        // Silently skip if error
      }
    };

    fetchActive();
  }, []);

  if (!visible || !announcement) return null;

  const handleDismiss = () => {
    localStorage.setItem(`bzr_announcement_seen_${announcement.id}`, 'true');
    setVisible(false);
  };

  const getTheme = (type) => {
    switch (type) {
      case 'promo':
        return {
          icon: <Tag size={24} color="#ea580c" />,
          badge: '🎉 Promo Spesial',
          gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
          bg: '#fff7ed',
          border: '#fed7aa',
        };
      case 'maintenance':
        return {
          icon: <AlertTriangle size={24} color="#d97706" />,
          badge: '🛠️ Pemeliharaan Sistem',
          gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          bg: '#fffbeb',
          border: '#fde68a',
        };
      case 'security':
        return {
          icon: <ShieldCheck size={24} color="#dc2626" />,
          badge: '🛡️ Keamanan & Privasi',
          gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          bg: '#fef2f2',
          border: '#fecaca',
        };
      default:
        return {
          icon: <Sparkles size={24} color="#6366f1" />,
          badge: '✨ Pembaruan Fitur Baru',
          gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          bg: '#eef2ff',
          border: '#c7d2fe',
        };
    }
  };

  const theme = getTheme(announcement.type);

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: theme.gradient,
          padding: '24px 24px 20px',
          color: '#ffffff',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.02em',
            }}>
              {theme.badge}
            </span>
            <button
              onClick={handleDismiss}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              title="Tutup"
            >
              <X size={16} />
            </button>
          </div>

          <h2 style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#ffffff',
            margin: '14px 0 4px',
            lineHeight: 1.3,
          }}>
            {announcement.title}
          </h2>
          <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
            Dipublikasikan pada: {announcement.date || new Date().toLocaleDateString('id-ID')}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 24px' }}>
          <div style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: '#334155',
            whiteSpace: 'pre-line',
            maxHeight: 280,
            overflowY: 'auto',
            paddingRight: 4,
          }}>
            {announcement.content}
          </div>

          {/* Footer Action */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #f1f5f9',
          }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDismiss}
              style={{
                background: theme.gradient,
                border: 'none',
                padding: '10px 22px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Check size={16} /> Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
