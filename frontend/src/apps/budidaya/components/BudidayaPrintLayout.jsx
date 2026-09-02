import React from 'react';

/**
 * Standard utility helpers for Budidaya / Agribisnis PDF Reports
 */
export const formatRp = (num) => {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

export const formatDateIndo = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const BudidayaPrintHeader = ({
  user,
  title,
  subtitle,
  periodText,
  startDate,
  endDate,
  terms
}) => {
  const todayFormatted = formatDateIndo(new Date().toISOString().split('T')[0]);

  let period = periodText;
  if (!period) {
    if (startDate && endDate) {
      period = `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`;
    } else if (startDate) {
      period = `Mulai ${formatDateIndo(startDate)}`;
    } else {
      period = 'Semua Periode Siklus';
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #000000', paddingBottom: 14, marginBottom: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#000000' }}>
          {user?.tenant_name || 'USAHA BUDIDAYA & AGRIBISNIS TERPADU'}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#374151', lineHeight: 1.4 }}>
          {user?.address || 'Unit Pengelolaan Siklus Produksi & Farm Lapangan'} {user?.phone ? `• Telp: ${user.phone}` : ''}
        </p>
        {subtitle && (
          <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#4B5563' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-block', padding: '4px 10px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#000000', textTransform: 'uppercase' }}>
          {title}
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#374151' }}>
          Periode: <strong>{period}</strong>
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6B7280' }}>
          Dicetak: {todayFormatted}
        </p>
      </div>
    </div>
  );
};

export const BudidayaPrintSectionHeader = ({ title, rightText }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D1D5DB', paddingBottom: 4, margin: '14px 0 10px' }}>
      <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.03em', margin: 0 }}>
        {title}
      </h3>
      {rightText && (
        <span style={{ fontSize: 10, color: '#4B5563' }}>{rightText}</span>
      )}
    </div>
  );
};

export const BudidayaPrintAppendixHeader = ({
  title,
  subtitle,
  pageText = 'Halaman 2 dari 2',
  user
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000000', paddingBottom: 10, marginBottom: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, textTransform: 'uppercase', color: '#000000' }}>
          {title}
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#4B5563' }}>
          {subtitle || `Lampiran Metodologi & Analisis Produksi Budidaya — ${user?.tenant_name || 'Agribisnis UMKM'}`}
        </p>
      </div>
      <div style={{ textAlign: 'right', fontSize: 10, color: '#4B5563' }}>
        {pageText}
      </div>
    </div>
  );
};

export const BudidayaPrintExplanationBox = ({
  number,
  title,
  desc,
  formula,
  variant = 'default'
}) => {
  const styles = {
    default: { bg: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', formulaColor: '#2563EB' },
    emerald: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', formulaColor: '#16A34A' },
    rose: { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239', formulaColor: '#DC2626' },
    indigo: { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', formulaColor: '#4338CA' },
    amber: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', formulaColor: '#B45309' },
    dark: { bg: '#111827', border: '#1F2937', text: '#FFFFFF', formulaColor: '#4ADE80' },
  };

  const current = styles[variant] || styles.default;
  const isDark = variant === 'dark';

  return (
    <div 
      className="budidaya-print-explanation-box" 
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
      <p style={{ margin: 0, color: isDark ? '#E5E7EB' : '#475569', lineHeight: 1.45 }}>
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

export const BudidayaPrintFooter = ({
  user,
  showSignatures = true,
  authorTitle = 'Dibuat Oleh (Pengelola Farm / Lapangan)',
  approverTitle = 'Disetujui Oleh (Pemilik / Pengawas)',
}) => {
  if (!showSignatures) return null;

  return (
    <div style={{ marginTop: 24, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div 
        className="budidaya-print-signatures"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 40, 
          textAlign: 'center', 
          fontSize: 10.5, 
          marginBottom: 10,
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        <div>
          <div style={{ color: '#4B5563', marginBottom: 44 }}>{authorTitle},</div>
          <div style={{ fontWeight: 700, color: '#000000', borderTop: '1px solid #9CA3AF', paddingTop: 6, display: 'inline-block', minWidth: 150 }}>
            {user?.name || 'Petugas Budidaya'}
          </div>
        </div>
        <div>
          <div style={{ color: '#4B5563', marginBottom: 44 }}>{approverTitle},</div>
          <div style={{ fontWeight: 700, color: '#000000', borderTop: '1px solid #9CA3AF', paddingTop: 6, display: 'inline-block', minWidth: 150 }}>
            {user?.tenant_name ? `Manajemen ${user.tenant_name}` : 'Pemilik Usaha'}
          </div>
        </div>
      </div>
    </div>
  );
};
