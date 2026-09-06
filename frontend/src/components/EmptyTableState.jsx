import React from 'react';
import { Inbox, Plus } from 'lucide-react';

/**
 * EmptyTableState - Standard Empty State Component for Bizora SaaS
 *
 * Can be rendered either directly or inside a <tr><td colSpan={...}> wrapper:
 * <EmptyTableState
 *    title="Belum ada produk"
 *    description="Tambahkan produk pertama untuk mulai berjualan."
 *    actionLabel="Tambah Produk"
 *    onAction={() => setShowModal(true)}
 * />
 */
export default function EmptyTableState({
  icon: Icon = Inbox,
  title = 'Belum Ada Data',
  description = 'Data tidak ditemukan atau belum ditambahkan.',
  actionLabel,
  onAction,
  colSpan,
  compact = false,
  className = ''
}) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-12'} px-4 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <Icon size={24} className="stroke-[1.75]" />
      </div>
      <h4 className="text-[15px] font-semibold text-slate-800 mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/25 transition-all"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  );

  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-0 border-none">
          {content}
        </td>
      </tr>
    );
  }

  return content;
}
