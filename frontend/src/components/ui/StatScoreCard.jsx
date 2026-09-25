import React from 'react';

const VARIANT_MAP = {
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40',
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/40',
    bar: 'bg-blue-500',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
  },
  sky: {
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/50 dark:border-sky-800/40',
    bar: 'bg-sky-500',
    iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
  },
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40',
    bar: 'bg-indigo-500',
    iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/40',
    bar: 'bg-violet-500',
    iconBg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/40',
    bar: 'bg-purple-500',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400'
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40',
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
  },
  yellow: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40',
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
  },
  rose: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/40',
    bar: 'bg-rose-500',
    iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
  },
  red: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/40',
    bar: 'bg-rose-500',
    iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
  },
  slate: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    bar: 'bg-slate-500',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  }
};

export default function StatScoreCard({
  title,
  value,
  status,
  statusVariant,
  statusBadge,
  icon,
  desc,
  subtitle,
  progress,
  progressVariant,
  progressBar,
  trend,
  className = '',
  onClick
}) {
  // Support both direct props and object props (statusBadge, progressBar, subtitle)
  const finalStatus = status || (typeof statusBadge === 'string' ? statusBadge : statusBadge?.text);
  const resolvedVariantKey = statusVariant || (typeof statusBadge === 'object' ? statusBadge?.color : undefined) || 'emerald';
  const variant = VARIANT_MAP[resolvedVariantKey] || VARIANT_MAP.emerald;

  const finalDesc = desc || subtitle;

  const rawProgress = typeof progress === 'number' 
    ? progress 
    : (typeof progressBar === 'number' ? progressBar : progressBar?.value);

  const barColor = progressVariant 
    ? (VARIANT_MAP[progressVariant]?.bar || 'bg-emerald-500') 
    : (progressBar?.color || variant.bar);

  const isClickable = Boolean(onClick);

  // Safely render icon whether it is a Component (Lucide), a React element, or a string
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
      const IconComponent = icon;
      return <IconComponent size={18} strokeWidth={2} />;
    }
    return icon;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md' : 'hover:border-slate-300 dark:hover:border-slate-700'
      } ${className}`}
    >
      <div>
        {/* Top Header: Title & Anchored Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
            {title}
          </span>
          {icon && (
            <span className={`p-2 rounded-xl shrink-0 transition-colors ${variant.iconBg} flex items-center justify-center`}>
              {renderIcon()}
            </span>
          )}
        </div>

        {/* Value & Status Pill */}
        <div className="mt-3 flex items-baseline flex-wrap gap-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Plus_Jakarta_Sans']">
            {value}
          </span>
          {finalStatus && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variant.badge}`}>
              {trend?.direction === 'up' && '▲ '}
              {trend?.direction === 'down' && '▼ '}
              {finalStatus}
            </span>
          )}
        </div>

        {/* Description / Subtitle */}
        {finalDesc && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {finalDesc}
          </p>
        )}
      </div>

      {/* Bottom Micro Progress Bar */}
      {typeof rawProgress === 'number' && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, rawProgress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
