import React, { useState, useEffect, useMemo } from 'react';
import { X, Wallet, CreditCard, Banknote, Landmark, ArrowRight, CircleAlert } from 'lucide-react';

const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

const PAYMENT_METHODS = [
  { id: 'CASH', name: 'Tunai', icon: Banknote, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'QRIS', name: 'QRIS', icon: Wallet, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'CARD', name: 'Kartu Debit/Kredit', icon: CreditCard, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'TRANSFER', name: 'Transfer Bank', icon: Landmark, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { id: 'SPLIT', name: 'Split Payment', icon: Wallet, color: 'text-teal-600 bg-teal-50 border-teal-100' },
];

export default function PaymentModal({ 
  isOpen, onClose, total, subtotal, discount, 
  customer, settings, staff = [], redeemPoints, setRedeemPoints, pointsDiscountAmount, 
  onSubmit 
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [salesId, setSalesId] = useState('');
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setPaymentAmount(total);
      setSplits([{ id: 1, method: 'CASH', amount: total }]);
      setError('');
    }
  }, [isOpen, total]);

  useEffect(() => {
    if (paymentMethod !== 'CASH' && paymentMethod !== 'SPLIT') setPaymentAmount(total);
    if (paymentMethod === 'SPLIT' && splits.length === 1) {
      setSplits([{ id: 1, method: 'CASH', amount: 0 }, { id: 2, method: 'QRIS', amount: 0 }]);
    }
  }, [paymentMethod, total]);

  const cashShortcuts = useMemo(() => {
    const roundToNext = (val, round) => Math.ceil(val / round) * round;
    const list = [total];
    [10000, 20000, 50000, 100000].forEach((amt) => {
      if (amt > total && !list.includes(amt)) list.push(amt);
    });
    const r50 = roundToNext(total, 50000);
    if (r50 > total && !list.includes(r50)) list.push(r50);
    const r100 = roundToNext(total, 100000);
    if (r100 > total && !list.includes(r100)) list.push(r100);
    return list.sort((a, b) => a - b).slice(0, 5);
  }, [total]);

  if (!isOpen) return null;

  const formatNumber = (num) => (!num && num !== 0) ? '' : new Intl.NumberFormat('id-ID').format(num);
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPaymentAmount(raw ? parseInt(raw, 10) : 0);
  };

  const changeAmount = Math.max(0, paymentAmount - total);
  
  const currentTotalPaid = paymentMethod === 'SPLIT' 
    ? splits.reduce((sum, s) => sum + Number(s.amount), 0)
    : paymentAmount;

  const isAmountValid = paymentMethod === 'SPLIT' 
    ? currentTotalPaid >= total 
    : paymentAmount >= total;

  const handleSubmit = async () => {
    if (!isAmountValid) {
      setError('Nominal pembayaran kurang dari total belanja.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        sales_id: salesId || null,
      };

      if (paymentMethod === 'SPLIT') {
        payload.payment_methods = splits.map(s => ({ method: s.method, amount: s.amount }));
      } else {
        payload.payment_method = paymentMethod;
        payload.payment_amount = paymentAmount;
      }

      await onSubmit(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-sm font-normal text-slate-900">Metode Pembayaran</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Pilih metode dan input nominal bayar</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs">
              <CircleAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Total Tagihan</span>
              <p className="text-2xl font-semibold text-slate-950 mt-1">{fmtRp(total)}</p>
            </div>
            <div className="text-right">
              {discount && (
                <div className="mb-1">
                  <span className="text-[9px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {discount.name}
                  </span>
                </div>
              )}
              {pointsDiscountAmount > 0 && (
                <div className="mb-1">
                  <span className="text-[9px] font-normal text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Diskon Poin: -{fmtRp(pointsDiscountAmount)}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Subtotal: <span className="font-semibold">{fmtRp(subtotal)}</span></p>
            </div>
          </div>

          {customer && settings?.enable_loyalty && (
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Loyalty Poin</span>
                <span className="text-xs font-semibold text-purple-800">{customer.points} Poin (Tier: {customer.tier})</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  max={customer.points}
                  value={redeemPoints || ''}
                  onChange={(e) => setRedeemPoints(Math.min(Number(e.target.value), customer.points))}
                  placeholder="Tukar Poin"
                  className="form-input text-xs w-full max-w-[120px] h-8 bg-white"
                />
                <span className="text-[10px] text-purple-600">
                  (1 Poin = {fmtRp(settings?.point_value_rupiah || 1)})
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Sales / SPG (Opsional)</span>
            <select
              value={salesId}
              onChange={(e) => setSalesId(e.target.value)}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:bg-white"
            >
              <option value="">Pilih Sales / SPG</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.role}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Pilih Metode</span>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/10 text-white' : method.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {paymentMethod === 'SPLIT' ? (
              <div className="space-y-3">
                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                  Rincian Split Payment
                </span>
                {splits.map((split, index) => (
                  <div key={split.id} className="flex items-center gap-2">
                    <select
                      value={split.method}
                      onChange={(e) => {
                        const newSplits = [...splits];
                        newSplits[index].method = e.target.value;
                        setSplits(newSplits);
                      }}
                      className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    >
                      {PAYMENT_METHODS.filter(m => m.id !== 'SPLIT').map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={split.amount ? formatNumber(split.amount) : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          const newSplits = [...splits];
                          newSplits[index].amount = raw ? parseInt(raw, 10) : 0;
                          setSplits(newSplits);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold outline-none focus:border-indigo-400"
                        placeholder="0"
                      />
                    </div>
                    {splits.length > 2 && (
                      <button
                        onClick={() => setSplits(splits.filter(s => s.id !== split.id))}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSplits([...splits, { id: Date.now(), method: 'CASH', amount: 0 }])}
                    className="text-xs text-indigo-600 font-bold hover:text-indigo-700"
                  >
                    + Tambah Metode
                  </button>
                  <div className="text-xs font-semibold text-slate-500">
                    Total: <span className={currentTotalPaid >= total ? 'text-emerald-600' : 'text-rose-500'}>
                      {fmtRp(currentTotalPaid)} / {fmtRp(total)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">
                    {paymentMethod === 'CASH' ? 'Uang Diterima' : 'Konfirmasi Jumlah'}
                  </span>
                  {paymentMethod === 'CASH' && isAmountValid && (
                    <span className="text-[10px] font-semibold text-emerald-600">Kembalian: {fmtRp(changeAmount)}</span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">Rp</span>
                  <input
                    disabled={paymentMethod !== 'CASH' || loading}
                    type="text"
                    inputMode="numeric"
                    value={paymentAmount ? formatNumber(paymentAmount) : ''}
                    onChange={handleAmountChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-0 focus:outline-none rounded-2xl pl-12 pr-4 py-4 text-xl font-semibold text-slate-900 placeholder-slate-300 disabled:opacity-60"
                    placeholder="0"
                  />
                </div>

                {paymentMethod === 'CASH' && (
                  <div className="flex flex-wrap gap-2">
                    {cashShortcuts.map((amount, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPaymentAmount(amount)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                          paymentAmount === amount ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {amount === total ? 'Uang Pas' : fmtRp(amount)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 shrink-0">
          <button onClick={onClose} className="px-5 py-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer">
            Batal
          </button>
          <button
            disabled={loading || !isAmountValid}
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Proses Pembayaran'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
