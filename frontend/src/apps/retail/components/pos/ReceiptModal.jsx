import React, { useRef } from 'react';
import { Printer, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const fmtDate = (dateStr) => new Date(dateStr).toLocaleString('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export default function ReceiptModal({ isOpen, order, outletName, cashierName, receiptFooter, onClose, onNewTransaction }) {
  const receiptRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: order ? `Struk-${order.invoice_no}` : 'Struk',
  });

  if (!isOpen || !order) return null;

  const discountAmount = Number(order.discount_amount) || 0;
  const changeAmount = Number(order.change_amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none" onClick={onClose}>
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 bg-emerald-500/10 border-b border-emerald-500/20 text-center shrink-0 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2">
            <CheckCircle2 size={22} />
          </div>
          <h3 className="text-xs font-normal text-emerald-400">Pembayaran Berhasil</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Transaksi #{order.invoice_no} telah disimpan</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-950/20 flex justify-center">
          <div
            ref={receiptRef}
            className="w-full bg-white text-slate-900 p-6 rounded-2xl shadow-inner font-mono text-[10px] leading-relaxed select-text"
            style={{ width: '100%', maxWidth: 300 }}
          >
            <div className="text-center space-y-1 mb-4 border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-xs font-normal tracking-wider uppercase">{outletName || 'Toko'}</h2>
            </div>

            <div className="space-y-1 mb-4 border-b border-dashed border-slate-300 pb-3 text-[9px] text-slate-600">
              <div className="flex justify-between"><span>No. Invoice:</span><span className="font-normal">{order.invoice_no}</span></div>
              <div className="flex justify-between"><span>Tanggal:</span><span>{fmtDate(order.created_at)}</span></div>
              <div className="flex justify-between"><span>Kasir:</span><span>{cashierName || '-'}</span></div>
            </div>

            <div className="space-y-2 mb-4 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-[9px]">
                <span>Item</span><span>Subtotal</span>
              </div>
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-normal">
                    <span className="truncate max-w-[180px]">{item.product?.name || 'Produk'}</span>
                    <span className="font-semibold">{fmtRp(item.subtotal)}</span>
                  </div>
                  <div className="text-[8px] text-slate-500">{Math.round(item.qty)} x {fmtRp(item.price)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[9px] text-slate-700">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">{fmtRp(order.subtotal ?? (order.total_amount + discountAmount - order.tax_amount))}</span></div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon:</span><span>-{fmtRp(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between"><span>Pajak:</span><span className="font-semibold">{fmtRp(order.tax_amount)}</span></div>

              <div className="flex justify-between font-semibold text-slate-900 border-t border-dashed border-slate-300 pt-2 text-xs">
                <span>TOTAL:</span><span>{fmtRp(order.total_amount)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="capitalize">{(order.payment_method || '').toLowerCase()} Bayar:</span>
                <span className="font-semibold">{fmtRp(order.paid_amount)}</span>
              </div>

              {changeAmount > 0 && (
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Kembalian:</span><span>{fmtRp(changeAmount)}</span>
                </div>
              )}
            </div>

            {order.note && (
              <div className="mt-4 p-2 bg-slate-50 border border-slate-100 rounded text-[8px] text-slate-500 italic">
                Catatan: {order.note}
              </div>
            )}

            <div className="text-center mt-6 text-[8px] text-slate-400">
              <p>{receiptFooter || 'Terima kasih atas kunjungan Anda'}</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-colors border border-slate-700 cursor-pointer"
          >
            <Printer size={14} />
            Cetak Struk
          </button>
          <button
            onClick={onNewTransaction}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <RefreshCw size={14} />
            Kasir Baru
          </button>
        </div>
      </div>
    </div>
  );
}
