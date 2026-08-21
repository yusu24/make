import React from 'react';
import { X, Printer, Wrench, Shield, CheckCircle } from 'lucide-react';
import { WorkOrder } from '../types';
import { formatRupiah } from '../data/mockData';

interface PrintSpkModalProps {
  order: WorkOrder | null;
  onClose: () => void;
}

export const PrintSpkModal: React.FC<PrintSpkModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Print Preview</span>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">Pratinjau Cetak Surat Perintah Kerja (SPK)</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable SPK Document (White paper style for clear printing) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:m-0">
          
          {/* Company Header / Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">PT PRO-SERVIS TEKNOLOGI INDONESIA</h1>
                <p className="text-xs text-slate-600 font-medium">Divisi Layanan Rekayasa, Pemeliharaan & Servis Lapangan Terpadu</p>
                <p className="text-[11px] text-slate-500">Gedung Graha Solusi Lt. 5, Jl. Gatot Subroto No. 88, Jakarta Selatan | Telp: (021) 555-8900</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">SURAT PERINTAH KERJA</div>
              <div className="font-mono text-base font-semibold text-blue-700">{order.id}</div>
              <div className="text-[11px] text-slate-600">Tgl: {order.createdAt}</div>
            </div>
          </div>

          {/* Title & Priority */}
          <div className="mb-5 bg-slate-100 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Perintah Tugas:</span>
              <h2 className="text-base font-semibold text-slate-900">{order.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2 py-1 bg-slate-900 text-white rounded">
                Prioritas: {order.priority}
              </span>
            </div>
          </div>

          {/* Two Columns: Customer & Service Specs */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div className="border border-slate-300 rounded-lg p-3 space-y-1">
              <div className="font-semibold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1 mb-2">
                1. Data Pelanggan / Lokasi
              </div>
              <div><strong>Perusahaan:</strong> {order.customerCompany}</div>
              <div><strong>PIC:</strong> {order.customerName} ({order.customerPhone})</div>
              <div><strong>Email:</strong> {order.customerEmail}</div>
              <div><strong>Alamat:</strong> {order.customerAddress}</div>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 space-y-1">
              <div className="font-semibold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1 mb-2">
                2. Spesifikasi Objek & Teknisi
              </div>
              <div><strong>Objek / Peralatan:</strong> {order.equipmentName}</div>
              <div><strong>No. Seri:</strong> {order.serialNumber || 'N/A'}</div>
              <div><strong>Teknisi Ditugaskan:</strong> {order.technicianName}</div>
              <div><strong>Jadwal Servis:</strong> {order.scheduledDate} ({order.scheduledTime})</div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="mb-6">
            <div className="font-semibold text-slate-900 uppercase text-xs mb-1">
              3. Ruang Lingkup & Uraian Pekerjaan:
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed">
              {order.serviceDescription}
            </div>
          </div>

          {/* Cost & Materials Table */}
          <div className="mb-6">
            <div className="font-semibold text-slate-900 uppercase text-xs mb-2">
              4. Rincian Suku Cadang & Biaya Jasa:
            </div>
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-2 text-left">Deskripsi Komponen / Jasa</th>
                  <th className="p-2 text-center w-16">Qty</th>
                  <th className="p-2 text-right">Harga Satuan</th>
                  <th className="p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.partsUsed.map(part => (
                  <tr key={part.id}>
                    <td className="p-2">{part.name}</td>
                    <td className="p-2 text-center">{part.quantity}</td>
                    <td className="p-2 text-right">{formatRupiah(part.unitCost)}</td>
                    <td className="p-2 text-right font-medium">{formatRupiah(part.quantity * part.unitCost)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="p-2 font-medium">Jasa Layanan Teknisi ({order.estimatedHours} Jam Kerja)</td>
                  <td className="p-2 text-center">1 Paket</td>
                  <td className="p-2 text-right">{formatRupiah(order.laborRate)}</td>
                  <td className="p-2 text-right font-medium">{formatRupiah(order.totalLaborCost)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-semibold">
                <tr>
                  <td colSpan={3} className="p-2 text-right">TOTAL BIAYA:</td>
                  <td className="p-2 text-right text-slate-900 text-sm font-semibold">{formatRupiah(order.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terms & Warranty */}
          <div className="mb-8 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-300">
            <strong>Ketentuan Garansi & Pelaksanaan:</strong>
            <p className="mt-0.5">
              1. Pekerjaan dilindungi garansi operasional selama <strong>{order.warrantyPeriod}</strong> sejak tanggal serah terima.
              2. Pelanggan wajib memastikan keamanan lokasi dan aksesibilitas peralatan saat teknisi bertugas.
              3. Kerusakan akibat bencana alam atau manipulasi pihak ketiga membatalkan garansi servis.
            </p>
          </div>

          {/* Signature Areas */}
          <div className="grid grid-cols-3 gap-6 pt-4 text-center text-xs">
            <div>
              <div className="font-semibold text-slate-800 mb-12">Pemberi Perintah / Dispatcher</div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-900">( Staff Manajemen Jasa )</div>
            </div>

            <div>
              <div className="font-semibold text-slate-800 mb-12">Teknisi Pelaksana</div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-900">( {order.technicianName} )</div>
            </div>

            <div>
              <div className="font-semibold text-slate-800 mb-12">Klien / Penerima Layanan</div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-900">( {order.customerName} )</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
