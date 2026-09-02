import React from 'react';
import { X, Printer, Wrench } from 'lucide-react';
import { WorkOrder } from '../types';
import '../jasa-print.css';
import {
  JasaPrintHeader,
  JasaPrintSectionHeader,
  JasaPrintAppendixHeader,
  JasaPrintExplanationBox,
  JasaPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/JasaPrintLayout';

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

        {/* Printable SPK Document (Formal 2-Page Accounting & Service Layout) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:m-0">
          
          {/* ==================== HALAMAN 1: SURAT PERINTAH KERJA & BIAYA ==================== */}
          <div>
            {/* 1. Header / Kop Surat Resmi Divisi Servis */}
            <JasaPrintHeader
              title="Surat Perintah Kerja (SPK)"
              subtitle="Divisi Layanan Rekayasa, Pemeliharaan & Servis Lapangan Terpadu"
              docNumber={order.id}
              periodText={`Jadwal: ${order.scheduledDate} (${order.scheduledTime})`}
            />

            {/* 2. Informasi Objek Servis & Pelanggan */}
            <div style={{ marginBottom: 18 }}>
              <JasaPrintSectionHeader title="I. Identitas Klien & Spesifikasi Objek Servis" />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000', marginBottom: 12 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', width: 140, fontWeight: 600 }}>Perintah Tugas</td>
                    <td style={{ padding: '5px 4px', fontWeight: 600 }}>{order.title}</td>
                    <td style={{ padding: '5px 4px', width: 120, fontWeight: 600 }}>Prioritas Layanan</td>
                    <td style={{ padding: '5px 4px', width: 130 }}>{order.priority}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', fontWeight: 600 }}>Nama Perusahaan / Klien</td>
                    <td style={{ padding: '5px 4px' }}>{order.customerCompany} — PIC: {order.customerName} ({order.customerPhone})</td>
                    <td style={{ padding: '5px 4px', fontWeight: 600 }}>Teknisi Pelaksana</td>
                    <td style={{ padding: '5px 4px' }}>{order.technicianName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', fontWeight: 600 }}>Objek / Unit Servis</td>
                    <td style={{ padding: '5px 4px' }}>{order.equipmentName} (SN: {order.serialNumber || '-'})</td>
                    <td style={{ padding: '5px 4px', fontWeight: 600 }}>Garansi Layanan</td>
                    <td style={{ padding: '5px 4px' }}>{order.warrantyPeriod}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', fontWeight: 600 }}>Lokasi Pengerjaan</td>
                    <td colSpan={3} style={{ padding: '5px 4px', color: '#374151' }}>{order.customerAddress}</td>
                  </tr>
                </tbody>
              </table>

              {order.serviceDescription && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 10.5, lineHeight: 1.45, color: '#334155' }}>
                  <strong>Uraian / Ruang Lingkup Pekerjaan:</strong> {order.serviceDescription}
                </div>
              )}
            </div>

            {/* 3. Tabel Rincian Suku Cadang & Biaya Jasa */}
            <div style={{ marginBottom: 20 }}>
              <JasaPrintSectionHeader title="II. Rincian Pemakaian Suku Cadang & Biaya Jasa Teknisi" />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                <thead>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                    <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Deskripsi Komponen / Jasa Layanan</th>
                    <th style={{ padding: '7px 6px', textAlign: 'center', width: 80, fontWeight: 600 }}>Volume</th>
                    <th style={{ padding: '7px 6px', textAlign: 'right', width: 140, fontWeight: 600, whiteSpace: 'nowrap' }}>Harga Satuan (Rp)</th>
                    <th style={{ padding: '7px 6px', textAlign: 'right', width: 150, fontWeight: 600, whiteSpace: 'nowrap' }}>Subtotal Nilai (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.partsUsed.map((part, idx) => (
                    <tr key={part.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{part.name}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'center', color: '#000000' }}>{part.quantity} Unit</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>{formatRp(part.unitCost)}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                        {formatRp(part.quantity * part.unitCost)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{order.partsUsed.length + 1}</td>
                    <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>
                      Jasa Layanan & Pengerjaan Teknisi ({order.estimatedHours} Jam Kerja)
                    </td>
                    <td style={{ padding: '6px 6px', textAlign: 'center', color: '#000000' }}>1 Paket</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>{formatRp(order.laborRate)}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                      {formatRp(order.totalLaborCost)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                    <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                      Total Rekapitulasi Biaya SPK:
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatRp(order.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 4. Kolom Tanda Tangan 3 Pihak (Halaman 1) */}
            <JasaPrintFooter
              technicianName={order.technicianName}
              customerName={order.customerName}
            />
          </div>

          {/* ==================== HALAMAN 2: LAMPIRAN GARANSI & SLA SERVIS ==================== */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <JasaPrintAppendixHeader
              title="Lampiran: Standar Garansi & Prosedur Pelayanan Servis"
              subtitle={`Ketentuan Pemeliharaan, Pengujian & Jaminan Mutu Pekerjaan — SPK #${order.id}`}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <JasaPrintExplanationBox
                number="1"
                title="Cakupan Jaminan Garansi Servis (Warranty Coverage)"
                desc={`Pekerjaan perbaikan dan penggantian suku cadang yang tertera pada SPK ini dilindungi garansi resmi selama ${order.warrantyPeriod} sejak tanggal serah terima pekerjaan selesai.`}
                variant="default"
              />

              <JasaPrintExplanationBox
                number="2"
                title="Pemeriksaan & Uji Fungsi Objek (Commissioning Test)"
                desc="Klien bersama teknisi wajib melakukan uji coba operasional alat sebelum menandatangani berita acara serah terima untuk memastikan peralatan berfungsi normal."
                variant="emerald"
              />

              <JasaPrintExplanationBox
                number="3"
                title="Keaslian Suku Cadang & Komponen (Spare Parts Authenticity)"
                desc="Seluruh suku cadang yang dipasang telah melalui proses verifikasi standar spesifikasi pabrikan dan bebas dari cacat produksi."
                variant="indigo"
              />

              <JasaPrintExplanationBox
                number="4"
                title="Batasan dan Pembatalan Garansi (Warranty Void Policy)"
                desc="Garansi tidak berlaku apabila terjadi kerusakan akibat kesalahan pengoperasian oleh pihak ketiga, lonjakan tegangan listrik di luar batas aman, atau bencana alam."
                variant="rose"
              />

              <JasaPrintExplanationBox
                number="5"
                title="Layanan Dukungan & Emergency Dispatch"
                desc="Untuk permintaan servis ulang dalam masa garansi, pelanggan dapat menghubungi pusat bantuan dengan mencantumkan nomor SPK yang tertera pada dokumen ini."
                variant="dark"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

