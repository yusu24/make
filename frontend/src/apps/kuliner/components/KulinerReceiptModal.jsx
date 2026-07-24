import React, { useRef } from 'react';
import { Printer, MessageCircle, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const fmtDate = (dateStr) => new Date(dateStr).toLocaleString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export default function KulinerReceiptModal({ isOpen, order, storeName, onClose }) {
  const receiptRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: order ? `Struk-${order.order_number || order.id}` : 'Struk',
  });

  if (!isOpen || !order) return null;

  const items = order.items || [];

  const shareText = encodeURIComponent(
    `Struk Pesanan ${storeName || ''}\n` +
    `No: ${order.order_number || order.id}\n` +
    `Tanggal: ${fmtDate(order.created_at)}\n\n` +
    items.map((it) => `${it.qty}x ${it.name} - ${fmtRp(it.subtotal)}`).join('\n') +
    `\n\nTOTAL: ${fmtRp(order.total)}\n\nTerima kasih!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Struk Digital</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 flex justify-center">
          <div ref={receiptRef} className="w-full bg-white text-slate-900 p-6 rounded-xl font-mono text-[10px] leading-relaxed" style={{ maxWidth: 300 }}>
            <div className="text-center mb-3 border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wide">{storeName || 'Toko Kuliner'}</h2>
            </div>
            <div className="mb-3 border-b border-dashed border-slate-300 pb-3 text-[9px] text-slate-600 space-y-1">
              <div className="flex justify-between"><span>No. Pesanan:</span><span>{order.order_number || order.id}</span></div>
              <div className="flex justify-between"><span>Tanggal:</span><span>{fmtDate(order.created_at)}</span></div>
              <div className="flex justify-between"><span>Tipe:</span><span>{order.order_type || '-'}</span></div>
            </div>
            <div className="mb-3 border-b border-dashed border-slate-300 pb-3 space-y-1">
              {items.map((it) => (
                <div key={it.id}>
                  <div className="flex justify-between font-semibold">
                    <span className="truncate max-w-[180px]">{it.name}</span>
                    <span>{fmtRp(it.subtotal)}</span>
                  </div>
                  <div className="text-[8px] text-slate-500">{it.qty} x {fmtRp(it.price)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-xs">
              <span>TOTAL</span><span>{fmtRp(order.total)}</span>
            </div>
            <div className="text-center mt-4 text-[9px] text-slate-400">Terima kasih atas pesanan Anda!</div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-2">
          {/* Browser print dialog already offers "Save as PDF" as a destination,
              so a separate PDF button here would just duplicate this one. */}
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold">
            <Printer size={14} /> Cetak / Simpan PDF
          </button>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-xs font-semibold"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
