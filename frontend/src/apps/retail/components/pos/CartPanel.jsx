import React, { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default function CartPanel({
  items, discount, note, taxRate,
  subtotal, discountAmount, taxAmount, total,
  customers, customerId, onCustomerChange,
  onUpdateQty, onApplyDiscount, onRemoveDiscount, onSetNote, onClearCart, onCheckout,
  onClose, className = '',
}) {
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError('');
    setDiscountSuccess('');
    try {
      const applied = await onApplyDiscount(discountCode.trim());
      setDiscountSuccess(`Berhasil menerapkan ${applied.name}`);
      setDiscountCode('');
    } catch (err) {
      setDiscountError(err?.response?.data?.message || 'Gagal menerapkan kode diskon.');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount();
    setDiscountSuccess('');
    setDiscountError('');
  };

  return (
    <aside className={`pos-cart-panel ${className}`}>
      <div className="pos-cart-header select-none">
        <div className="flex items-center">
          {onClose && (
            <button
              onClick={onClose}
              className="pos-cart-close-btn p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 rounded-lg mr-1.5 select-none cursor-pointer items-center justify-center"
              title="Tutup Keranjang"
            >
              <X size={18} />
            </button>
          )}
          <span className="pos-cart-title">
            <ShoppingBag size={16} className="mr-2" style={{ color: 'var(--pos-teal)' }} />
            Pesanan
          </span>
        </div>
        {items.length > 0 && (
          <button onClick={onClearCart} className="pos-cart-clear" aria-label="Hapus semua item">
            Hapus Semua
          </button>
        )}
      </div>

      <div className="px-5 pt-3 pb-1">
        <select
          value={customerId}
          onChange={(e) => onCustomerChange(e.target.value)}
          className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-400"
        >
          <option value="">Pelanggan Umum</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="pos-cart-items">
        {items.length > 0 ? items.map((item) => (
          <div key={item.product_id} className="pos-cart-item">
            <span className="pos-item-icon">🛒</span>
            <div className="pos-item-info">
              <h4 className="pos-item-name" title={item.name}>{item.name}</h4>
              <p className="pos-item-price">
                <span className="font-semibold">{fmtRp(item.price)}</span>
                <span className="ml-1 text-[9px] text-slate-400">(Sisa: {Math.round(item.max_stock)})</span>
              </p>
            </div>
            <div className="pos-qty-ctrl">
              <button onClick={() => onUpdateQty(item.product_id, item.qty - 1)} className="pos-qty-btn" aria-label="Kurang satu">−</button>
              <span className="pos-qty-num">{item.qty}</span>
              <button
                disabled={item.qty >= item.max_stock}
                onClick={() => onUpdateQty(item.product_id, item.qty + 1)}
                className="pos-qty-btn"
                aria-label="Tambah satu"
              >
                +
              </button>
            </div>
          </div>
        )) : (
          <div className="pos-empty-cart select-none">
            <ShoppingBag size={36} />
            <p>Keranjang kosong</p>
          </div>
        )}
      </div>

      <div className="pos-cart-footer">
        <div className="pos-discount-row">
          <input
            disabled={items.length === 0 || discountLoading}
            type="text"
            placeholder="Kode diskon (mis. HEMAT10)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            className="pos-disc-input"
          />
          <button
            disabled={items.length === 0 || discountLoading || !discountCode.trim()}
            onClick={handleApplyDiscount}
            className="pos-disc-btn"
          >
            {discountLoading ? '...' : 'Pakai'}
          </button>
        </div>

        {discountError && <p className="text-[10px] font-normal text-rose-500 mb-2">{discountError}</p>}
        {discountSuccess && <p className="text-[10px] font-normal text-emerald-600 mb-2">{discountSuccess}</p>}

        {discount && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-lg px-2.5 py-1.5 text-[10px] font-normal mb-3">
            <span className="flex items-center gap-1.5">🏷️ {discount.name} ({discount.code})</span>
            <button onClick={handleRemoveDiscount} className="p-0.5 hover:bg-emerald-500/20 rounded">
              <X size={10} />
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-3 select-none">
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              note ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            📝 {note ? 'Edit Catatan' : 'Tambah Catatan'}
          </button>
        </div>

        {showNoteInput && (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex gap-2 mb-3">
            <textarea
              placeholder="Tambahkan catatan khusus transaksi di sini..."
              value={note}
              onChange={(e) => onSetNote(e.target.value)}
              className="flex-1 min-h-[44px] bg-transparent border-0 text-[10px] text-slate-700 placeholder-slate-400 p-0 focus:ring-0 focus:outline-none resize-none"
            />
            <button
              onClick={() => setShowNoteInput(false)}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] self-end"
            >
              OK
            </button>
          </div>
        )}

        <div className="pos-totals select-none">
          <div className="pos-total-row">
            <span>Subtotal</span>
            <span className="font-semibold">{fmtRp(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="pos-total-row" style={{ color: '#E24B4A' }}>
              <span>Diskon</span>
              <span className="font-semibold">-{fmtRp(discountAmount)}</span>
            </div>
          )}
          <div className="pos-total-row">
            <span>Pajak ({taxRate}%)</span>
            <span className="font-semibold">{fmtRp(taxAmount)}</span>
          </div>
          <div className="pos-total-row grand">
            <span>Total</span>
            <span className="font-semibold">{fmtRp(total)}</span>
          </div>
        </div>

        <button disabled={items.length === 0} onClick={onCheckout} className="pos-checkout-btn">
          Bayar Sekarang
        </button>
      </div>
    </aside>
  );
}
