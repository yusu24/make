import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Building,
  User,
  AlertCircle
} from 'lucide-react';
import { JasaInvoice, InvoiceStatus, PaymentTransaction } from '../types';
import { formatRupiah } from '../data/mockData';
import { PrintReceiptModal } from './PrintReceiptModal';

interface InvoiceDetailModalProps {
  invoice: JasaInvoice;
  onClose: () => void;
  onAddPayment: (invoiceId: string, amount: number, method: string, reference: string) => void;
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ 
  invoice, 
  onClose,
  onAddPayment,
  onUpdateStatus
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(invoice.totalAmount - invoice.paidAmount);
  const [payMethod, setPayMethod] = useState('Transfer Bank');
  const [payRef, setPayRef] = useState('');

  const remainingBalance = invoice.totalAmount - invoice.paidAmount;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0 || payAmount > remainingBalance) return;
    onAddPayment(invoice.id, payAmount, payMethod, payRef);
    setShowPaymentForm(false);
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dibayar Sebagian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Belum Dibayar': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Jatuh Tempo': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Dibatalkan': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Detail Tagihan</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80">
                  {invoice.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPrint(true)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Cetak Struk"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pelanggan Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Informasi Pelanggan</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3 mb-2">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{invoice.customerName}</p>
                      <p className="text-xs text-slate-500">{invoice.customerId}</p>
                    </div>
                  </div>
                  {invoice.customerCompany && (
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-700">{invoice.customerCompany}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tagihan Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Detail Referensi</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Referensi SPK</p>
                      <p className="text-sm font-semibold text-slate-900">{invoice.workOrderId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Tanggal Terbit</p>
                      <p className="text-sm font-semibold text-slate-900">{(invoice.issueDate || '').split('T')[0]}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Jatuh Tempo</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <p className={`text-sm font-semibold ${new Date(invoice.dueDate) < new Date() && invoice.status !== 'Lunas' ? 'text-rose-600' : 'text-slate-900'}`}>
                          {(invoice.dueDate || '').split('T')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Item */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> Rincian Item Tagihan
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Deskripsi Item</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-medium text-slate-700">{item.description}</td>
                      <td className="py-2.5 px-4 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">{formatRupiah(item.unitPrice)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{formatRupiah(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-semibold text-slate-700 uppercase text-[10px] tracking-wider">Total Tagihan</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">{formatRupiah(invoice.totalAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 px-4 text-right font-semibold text-emerald-600 uppercase text-[10px] tracking-wider">Telah Dibayar</td>
                    <td className="py-2 px-4 text-right font-semibold text-emerald-600">{formatRupiah(invoice.paidAmount)}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td colSpan={3} className="py-3 px-4 text-right font-bold text-slate-900 uppercase text-[10px] tracking-wider">Sisa Pembayaran</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 text-base">{formatRupiah(remainingBalance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Riwayat Pembayaran */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Riwayat Pembayaran
              </h3>
              {remainingBalance > 0 && !showPaymentForm && (
                <button 
                  onClick={() => setShowPaymentForm(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  + Catat Pembayaran
                </button>
              )}
            </div>

            {showPaymentForm && (
              <form onSubmit={handlePaymentSubmit} className="mb-4 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-emerald-800">Form Pembayaran Baru</h4>
                  <button type="button" onClick={() => setShowPaymentForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nominal (Maks: {formatRupiah(remainingBalance)})</label>
                    <input 
                      type="number" 
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      max={remainingBalance}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Metode</label>
                    <select 
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="Transfer Bank">Transfer Bank</option>
                      <option value="Tunai">Tunai / Cash</option>
                      <option value="Cek / Giro">Cek / Giro</option>
                      <option value="Kartu Kredit / Debit">Kartu Kredit / Debit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Referensi / No. Bukti</label>
                    <input 
                      type="text" 
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      placeholder="Trf BCA 12345..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                    Simpan Pembayaran
                  </button>
                </div>
              </form>
            )}

            {invoice.payments.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-500">Belum ada riwayat pembayaran untuk tagihan ini.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Tgl Pembayaran</th>
                      <th className="py-2.5 px-4">ID Transaksi</th>
                      <th className="py-2.5 px-4">Metode & Referensi</th>
                      <th className="py-2.5 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.payments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-2.5 px-4 font-medium text-slate-700">{(pay.date || '').split('T')[0]}</td>
                        <td className="py-2.5 px-4 text-slate-500">{pay.id}</td>
                        <td className="py-2.5 px-4 text-slate-700">
                          <span className="font-semibold">{pay.method}</span>
                          {pay.reference && <span className="block text-[10px] text-slate-500 mt-0.5">{pay.reference}</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-emerald-600">{formatRupiah(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {invoice.notes && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-800"><span className="font-semibold">Catatan:</span> {invoice.notes}</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
          
          {remainingBalance <= 0 && invoice.status !== 'Lunas' && (
            <button
              onClick={() => onUpdateStatus(invoice.id, 'Lunas')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Validasi & Tandai Lunas
            </button>
          )}
        </div>
      </div>
      
      {showPrint && (
        <PrintReceiptModal 
          invoice={invoice} 
          onClose={() => setShowPrint(false)} 
        />
      )}
    </div>
  );
};
