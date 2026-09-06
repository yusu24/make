import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';
import { WorkOrder, JasaInvoice } from '../types';
import { formatRupiah } from '../data/mockData';
import { useJasa } from '../contexts/JasaContext';

interface PrintReceiptModalProps {
  order?: WorkOrder | null;
  invoice?: JasaInvoice | null;
  onClose: () => void;
  settings?: any;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ order, invoice, onClose, settings }) => {
  const { terms } = useJasa();

  if (!order && !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const businessType = settings?.businessType || `BIZORA ${terms.categoryName.toUpperCase()}`;
  
  // Extract data generically
  const id = invoice?.id || order?.id || '';
  const dateStr = invoice?.issueDate || order?.createdAt || '';
  const customerName = invoice?.customerName || order?.customerName || '';
  const status = invoice?.status || order?.paymentStatus || order?.status || '';
  const grandTotal = invoice?.totalAmount || order?.grandTotal || 0;
  
  // Calculate DP / Payments
  let dpAmount = 0;
  if (invoice) {
    // If it's an invoice and not fully paid, we treat paidAmount as DP/Cicilan
    if (invoice.status !== 'Lunas') {
      dpAmount = invoice.paidAmount;
    }
  } else if (order) {
    dpAmount = order.dpAmount || 0;
  }
  
  const remaining = Math.max(0, grandTotal - dpAmount);

  const handleShareWhatsApp = () => {
    const rawPhone = (order?.customerPhone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
    
    let details = '';
    if (order) {
      details = `Perangkat/Objek: ${order.serviceObjectName}\n` +
        `Keluhan/Layanan: ${order.serviceDescription}\n` +
        `Teknisi: ${order.technicianName || '-'}\n` +
        `Estimasi Selesai: ${order.scheduledDate} ${order.scheduledTime || ''}\n` +
        `Status: ${order.status} (${order.paymentStatus})\n` +
        `Total Estimasi: ${formatRupiah(grandTotal)}\n` +
        (dpAmount > 0 ? `DP Dibayar: ${formatRupiah(dpAmount)}\nSisa: ${formatRupiah(remaining)}\n` : '');
    } else if (invoice) {
      details = `Faktur: ${invoice.id}\n` +
        `Jatuh Tempo: ${invoice.dueDate}\n` +
        `Status: ${invoice.status}\n` +
        `Total: ${formatRupiah(grandTotal)}\n` +
        (dpAmount > 0 ? `Terbayar: ${formatRupiah(dpAmount)}\nSisa Tagihan: ${formatRupiah(remaining)}\n` : '');
    }

    const msg = 
      `*NOTIFIKASI LAYANAN — ${businessType}*\n` +
      `--------------------------------\n` +
      `No. SPK/Ref : #${id}\n` +
      `Tanggal     : ${dateStr}\n` +
      `Pelanggan   : ${customerName}\n` +
      `--------------------------------\n` +
      details +
      `--------------------------------\n` +
      `Terima kasih telah mempercayakan layanan kepada kami! 🙏`;

    const url = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-5">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Print Preview</span>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">Pratinjau Cetak Struk / Faktur</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Thermal</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content: Thermal Receipt Style */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-200/50 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          
          <div className="bg-white w-[80mm] min-h-[100mm] shadow-lg print:shadow-none font-mono text-[11px] text-slate-800 p-4 border border-slate-200 print:border-none print:w-full mx-auto" id="printable-receipt">
            
            {/* Store Header */}
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold mb-1 uppercase">{businessType}</h1>
              <p className="text-[10px] leading-tight">Jl. Contoh Bisnis UMKM No. 123</p>
              <p className="text-[10px] leading-tight">Telp: 0812-3456-7890</p>
            </div>
            
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Receipt Info */}
            <div className="mb-2">
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{dateStr}</span>
              </div>
              <div className="flex justify-between">
                <span>No. Ref</span>
                <span>{id}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan</span>
                <span>{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir/Op</span>
                <span>Admin Kasir</span>
              </div>
            </div>
            
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Items */}
            <div className="mb-3">
              <div className="font-bold mb-1">Rincian:</div>
              
              {order && (
                <>
                  <div className="mb-1">
                    <div className="flex justify-between">
                      <span className="truncate pr-2">Jasa Layanan ({order.estimatedHours} jam)</span>
                      <span>{formatRupiah(order.totalLaborCost)}</span>
                    </div>
                  </div>
                  {order.partsUsed.map((part, index) => (
                    <div className="mb-1" key={index}>
                      <div className="flex justify-between">
                        <span className="truncate pr-2">{part.name}</span>
                        <span>{formatRupiah(part.quantity * part.unitCost)}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 pl-2">
                        {part.quantity} x {formatRupiah(part.unitCost)}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {invoice && invoice.items.map((item, index) => (
                <div className="mb-1" key={index}>
                  <div className="flex justify-between">
                    <span className="truncate pr-2">{item.description}</span>
                    <span>{formatRupiah(item.total)}</span>
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-[9px] text-slate-500 pl-2">
                      {item.quantity} x {formatRupiah(item.unitPrice)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            {/* Totals */}
            <div className="mb-3">
              <div className="flex justify-between font-bold">
                <span>Total Biaya</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
              {dpAmount > 0 && (
                <>
                  <div className="flex justify-between mt-1">
                    <span>Telah Dibayar (DP)</span>
                    <span>-{formatRupiah(dpAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1">
                    <span>Sisa Tagihan</span>
                    <span>{formatRupiah(remaining)}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="border-t border-dashed border-slate-400 my-2"></div>
            
            <div className="text-center mt-4">
              <p className="font-bold mb-1">Status: {status}</p>
              {order?.warrantyPeriod && (
                <p className="mb-2">Garansi Pekerjaan: {order.warrantyPeriod}</p>
              )}
              <p className="text-[10px] mt-2">Terima kasih atas kepercayaan Anda!</p>
              <p className="text-[9px] mt-1 text-slate-500">Ditenagai oleh ServisHub</p>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
