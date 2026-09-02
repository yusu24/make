import React from 'react';

/**
 * Standard utility helpers for Jasa / Servis / Proyek PDF Reports
 */
export const formatRp = (num: any) => {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

export const formatDateIndo = (d: any) => {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

interface JasaPrintHeaderProps {
  user?: any;
  title: string;
  subtitle?: string;
  docNumber?: string;
  periodText?: string;
  startDate?: string;
  endDate?: string;
}

export const JasaPrintHeader: React.FC<JasaPrintHeaderProps> = ({
  user,
  title,
  subtitle,
  docNumber,
  periodText,
  startDate,
  endDate
}) => {
  const todayFormatted = formatDateIndo(new Date().toISOString().split('T')[0]);

  let period = periodText;
  if (!period) {
    if (startDate && endDate) {
      period = `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`;
    } else if (startDate) {
      period = `Mulai ${formatDateIndo(startDate)}`;
    } else {
      period = 'Semua Periode Transaksi';
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #0f172a', paddingBottom: 14, marginBottom: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a' }}>
          {user?.tenant_name || 'PUSAT LAYANAN JASA & SERVIS TEKNIK'}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
          {user?.address || 'Divisi Pemeliharaan, Reparasi & Servis Terpadu'} {user?.phone ? `• Telp: ${user.phone}` : ''}
        </p>
        {subtitle && (
          <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#64748B' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-block', padding: '4px 10px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#0F172A', textTransform: 'uppercase' }}>
          {title}
        </div>
        {docNumber && (
          <div style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
            {docNumber}
          </div>
        )}
        <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#64748B' }}>
          Periode: <strong>{period}</strong>
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#94A3B8' }}>
          Dicetak: {todayFormatted}
        </p>
      </div>
    </div>
  );
};

export const JasaPrintSectionHeader: React.FC<{ title: string; rightText?: string }> = ({ title, rightText }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 4, margin: '14px 0 10px' }}>
      <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.03em', margin: 0 }}>
        {title}
      </h3>
      {rightText && (
        <span style={{ fontSize: 10, color: '#64748B' }}>{rightText}</span>
      )}
    </div>
  );
};

export const JasaPrintAppendixHeader: React.FC<{ title: string; subtitle?: string; pageText?: string; user?: any }> = ({
  title,
  subtitle,
  pageText = 'Halaman 2 dari 2',
  user
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: 10, marginBottom: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, textTransform: 'uppercase', color: '#0F172A' }}>
          {title}
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#64748B' }}>
          {subtitle || `Lampiran Standar Operasional & Kebijakan Garansi Jasa — ${user?.tenant_name || 'Layanan Servis & Proyek'}`}
        </p>
      </div>
      <div style={{ textAlign: 'right', fontSize: 10, color: '#64748B' }}>
        {pageText}
      </div>
    </div>
  );
};

interface JasaPrintExplanationBoxProps {
  number?: string;
  title: string;
  desc: string;
  formula?: string;
  variant?: 'default' | 'emerald' | 'rose' | 'indigo' | 'amber' | 'dark';
}

export const JasaPrintExplanationBox: React.FC<JasaPrintExplanationBoxProps> = ({
  number,
  title,
  desc,
  formula,
  variant = 'default'
}) => {
  const styles: Record<string, { bg: string; border: string; text: string; formulaColor: string }> = {
    default: { bg: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', formulaColor: '#2563EB' },
    emerald: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', formulaColor: '#16A34A' },
    rose: { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239', formulaColor: '#DC2626' },
    indigo: { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', formulaColor: '#4338CA' },
    amber: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', formulaColor: '#B45309' },
    dark: { bg: '#0F172A', border: '#1E293B', text: '#FFFFFF', formulaColor: '#4ADE80' },
  };

  const current = styles[variant] || styles.default;
  const isDark = variant === 'dark';

  return (
    <div 
      className="jasa-print-explanation-box" 
      style={{ 
        background: current.bg, 
        border: `1px solid ${current.border}`, 
        borderRadius: 8, 
        padding: '10px 14px', 
        marginBottom: 10, 
        fontSize: 11,
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      <div style={{ fontWeight: 700, color: current.text, marginBottom: 3 }}>
        {number ? `${number}. ` : ''}{title}
      </div>
      <p style={{ margin: 0, color: isDark ? '#E2E8F0' : '#475569', lineHeight: 1.45 }}>
        {desc}
      </p>
      {formula && (
        <div style={{ marginTop: 5, fontStyle: 'italic', color: current.formulaColor, fontWeight: 600 }}>
          {formula}
        </div>
      )}
    </div>
  );
};

interface JasaPrintFooterProps {
  user?: any;
  showSignatures?: boolean;
  authorTitle?: string;
  technicianTitle?: string;
  approverTitle?: string;
  technicianName?: string;
  customerName?: string;
}

export const JasaPrintFooter: React.FC<JasaPrintFooterProps> = ({
  user,
  showSignatures = true,
  authorTitle = 'Pemberi Tugas (Dispatcher / Admin)',
  technicianTitle = 'Teknisi Pelaksana',
  approverTitle = 'Penerima Layanan (Klien / PIC)',
  technicianName,
  customerName,
}) => {
  if (!showSignatures) return null;

  return (
    <div style={{ marginTop: 24, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div 
        className="jasa-print-signatures"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: 20, 
          textAlign: 'center', 
          fontSize: 10, 
          marginBottom: 10,
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <div>
          <div style={{ color: '#64748B', marginBottom: 44 }}>{authorTitle},</div>
          <div style={{ fontWeight: 700, color: '#0F172A', borderTop: '1px solid #CBD5E1', paddingTop: 6, display: 'inline-block', minWidth: 130 }}>
            {user?.name || 'Admin Manajemen Jasa'}
          </div>
        </div>
        <div>
          <div style={{ color: '#64748B', marginBottom: 44 }}>{technicianTitle},</div>
          <div style={{ fontWeight: 700, color: '#0F172A', borderTop: '1px solid #CBD5E1', paddingTop: 6, display: 'inline-block', minWidth: 130 }}>
            {technicianName || 'Teknisi Ditugaskan'}
          </div>
        </div>
        <div>
          <div style={{ color: '#64748B', marginBottom: 44 }}>{approverTitle},</div>
          <div style={{ fontWeight: 700, color: '#0F172A', borderTop: '1px solid #CBD5E1', paddingTop: 6, display: 'inline-block', minWidth: 130 }}>
            {customerName || 'Klien / Pelanggan'}
          </div>
        </div>
      </div>
    </div>
  );
};
