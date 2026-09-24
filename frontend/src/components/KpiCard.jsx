import React from 'react';

const COLOR_MAP = {
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/60',
    hoverBorder: 'hover:border-indigo-300/80',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/60',
    hoverBorder: 'hover:border-emerald-300/80',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/60',
    hoverBorder: 'hover:border-amber-300/80',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-100/60',
    hoverBorder: 'hover:border-rose-300/80',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/60',
    hoverBorder: 'hover:border-blue-300/80',
  },
  slate: {
    iconBg: 'bg-slate-100 text-slate-600 border border-slate-200/60',
    hoverBorder: 'hover:border-slate-300/80',
  },
};

/**
 * KpiCard - Standard Side-by-Side Metric Card for Bizora SaaS
 *
 * Implements the user-approved standard:
 * - Icon side-by-side with label
 * - Label: 14.5px font-bold text-slate-700
 * - Value: 22px font-bold text-slate-900
 * - Subtext: 12px text-slate-400
 */
export default function KpiCard({
  icon: Icon,
  label,
  title,
  value,
  sub,
  subtitle,
  badge,
  color = 'indigo',
  loading = false,
  onClick,
  className = '',
  style = {}
}) {
  const cardTitle = label ?? title;
  const cardSub = sub ?? subtitle;
  const themeColors = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all ${
        themeColors.hoverBorder
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={style}
    >
      {/* Top Header: Icon + Title side-by-side */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${themeColors.iconBg}`}>
              <Icon size={20} />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {cardTitle}
          </span>
        </div>

        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Main Value Metric */}
      <div className="mt-1">
        {loading ? (
          <div className="h-8 w-28 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
            {value}
          </div>
        )}
      </div>

      {/* Subtext / Trend */}
      {cardSub && (
        <div className="text-xs text-slate-400 font-medium mt-1 font-['Inter']">
          {cardSub}
        </div>
      )}
    </div>
  );
}
