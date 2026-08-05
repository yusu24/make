import React from 'react';
import { X, Printer, CheckCircle2, Share2, Sparkles, Store } from 'lucide-react';
import { Order } from '../../types';
import { formatIDR } from '../../utils/formatters';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  cashReceived?: number;
  cashChange?: number;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  cashReceived = 0,
  cashChange = 0,
  storeName = 'Toko Saya',
  storeAddress = '',
  storePhone = '',
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWa = () => {
    const text = `Halo Kak ${order.customerName}, Terima kasih telah berbelanja di Toko Offline Bizora Boutique! Total transaksi ${formatIDR(order.totalAmount)}. No Nota: ${order.orderNumber}`;
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="font-extrabold text-sm tracking-tight">Transaksi Offline Berhasil</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body (80mm Paper Styling) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-950">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4 print:shadow-none print:border-none">
            {/* Logo & Store Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex justify-center mb-1">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  {storeName.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                {storeName}
              </h2>
              {(storeAddress || storePhone) && (
                <p className="text-[10px] text-slate-500 leading-tight">
                  {storeAddress}
                  {storeAddress && storePhone && <br />}
                  {storePhone && `Telp: ${storePhone}`}
                </p>
              )}
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{order.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {item.productName}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      {item.quantity} x {formatIDR(item.price)}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatIDR(item.quantity * item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatIDR(order.subtotal)}</span>
              </div>
              {order.discounts > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon Tambahan:</span>
                  <span>-{formatIDR(order.discounts)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1">
                <span>TOTAL:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatIDR(order.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-semibold uppercase text-indigo-600">{order.paymentMethod}</span>
              </div>
              {cashReceived > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uang Dibayar:</span>
                    <span>{formatIDR(cashReceived)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Kembalian:</span>
                    <span>{formatIDR(cashChange)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center text-[10px] text-slate-400 space-y-1 pt-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                Terima Kasih Telah Berbelanja!
              </p>
              <p>Barang dapat ditukar max 3 hari kerja membawa struk ini.</p>
              <div className="pt-2 flex justify-center">
                <div className="w-16 h-16 border-2 border-slate-300 rounded p-1 flex items-center justify-center text-[8px] text-slate-400 font-sans">
                  [QR CODE POS]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk (Thermal)</span>
          </button>
          <button
            onClick={handleShareWa}
            className="w-full sm:flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim Nota WA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
