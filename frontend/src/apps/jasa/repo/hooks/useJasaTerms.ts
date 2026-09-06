import { useContext } from 'react';

export type JasaCategoryType = 
  | 'elektronik' 
  | 'otomotif' 
  | 'ac_appliances' 
  | 'laundry' 
  | 'salon_barbershop' 
  | 'tailor' 
  | 'umum';

export interface JasaCategoryInfo {
  id: JasaCategoryType;
  title: string;
  badge: string;
  icon: string;
  color: string;
  bgLight: string;
  borderLight: string;
  tagline: string;
  description: string;
  examples: string[];
}

export interface JasaTerms {
  categoryId: JasaCategoryType;
  categoryName: string;
  categoryIcon: string;
  badgeName: string;
  themeColor: string;
  
  // Entities & Labels
  technicianLabel: string;        // Teknisi / Mekanik / Stylist / Operator / Penjahit / Pelaksana
  techniciansLabel: string;       // Tim Teknisi / Tim Mekanik / Tim Stylist / dll
  unitLabel: string;              // Perangkat / Kendaraan / Unit AC / Cucian / Pelanggan / Pakaian / Pekerjaan
  unitsLabel: string;             // Daftar Perangkat / Daftar Kendaraan / dll
  unitIdLabel: string;            // IMEI / SN / No. Polisi / Tipe Unit / No. Nota / ID Pesanan
  unitIdPlaceholder: string;      // Contoh: 3528491... / B 1234 ABC
  unitModelLabel: string;         // Merk & Seri / Merk Kendaraan / Merk Unit / Jenis Pakaian / Layanan
  unitModelPlaceholder: string;   // Contoh: iPhone 13 Pro / Honda Vario 160 / Daikin 1 PK
  
  workOrderLabel: string;         // SPK / Form Servis / Nota Masuk / Work Order
  workOrdersLabel: string;        // Daftar SPK / Riwayat Servis / Antrean Servis
  newWorkOrderBtn: string;        // Buat SPK Baru / Terima Servis Masuk / Terima Order
  
  problemLabel: string;           // Keluhan & Kerusakan / Masalah / Permintaan Treatment / Catatan Model
  problemPlaceholder: string;     // Contoh: Layar pecah / Mesin brebet saat gas / AC tidak dingin
  diagnosisLabel: string;         // Hasil Diagnosa / Analisa Kerusakan / Catatan Pengerjaan
  diagnosisPlaceholder: string;   // Rincian pengecekan teknisi...
  
  sparepartLabel: string;         // Sparepart & Suku Cadang / Sparepart & Oli / Perlengkapan / Aksesoris & Bahan
  sparepartsLabel: string;        // Gudang Sparepart / Stok Suku Cadang / Stok Bahan
  
  // Specific Custom Fields (2 unique fields per industry)
  customField1Label: string;      // Pola/Password (Elektronik) | Kilometer KM (Otomotif) | Alamat Kunjungan (AC) | No Rak (Laundry) | Kursi/Room (Salon) | Ukuran Badan (Tailor) | Lokasi Proyek (Umum)
  customField1Placeholder: string;
  customField1Help?: string;
  
  customField2Label: string;      // Kelengkapan (Elektronik) | Warna/Tahun (Otomotif) | Kapasitas PK (AC) | Berat Kg / Pcs (Laundry) | Durasi Menit (Salon) | Jenis Bahan Kain (Tailor) | Target Selesai (Umum)
  customField2Placeholder: string;
  customField2Help?: string;

  // Statuses wording
  statusPending: string;          // Menunggu Pengecekan / Antrean Masuk
  statusDiagnosing: string;       // Sedang Diagnosa / Sedang Cek
  statusWorking: string;          // Dalam Pengerjaan / Sedang Diservis / Sedang Dicuci / Sedang Treatment
  statusWaitingPart: string;      // Menunggu Sparepart / Menunggu Bahan
  statusDone: string;             // Selesai (Siap Ambil/Kirim)
  statusDelivered: string;        // Sudah Diambil Pelanggan / Selesai Serah Terima
  statusCancelled: string;        // Dibatalkan

  // Preset services suggestions
  presetServices: { name: string; category: string; price: number; durationHours: number }[];
}

export const JASA_CATEGORIES_LIST: JasaCategoryInfo[] = [
  {
    id: 'elektronik',
    title: 'Servis Elektronik & Gadget',
    badge: 'Smartphone, Laptop, PC, TV, Audio',
    icon: 'Smartphone',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderLight: 'border-indigo-200 dark:border-indigo-800',
    tagline: 'Ideal untuk konter HP, reparasi laptop, komputer, service center elektronik & gadget.',
    description: 'Dilengkapi input IMEI/Serial Number, pencatatan pola/password kunci layar, kelengkapan unit (charger/box), dan riwayat garansi komponen.',
    examples: ['Ganti LCD / Touchscreen', 'Ganti Baterai', 'Flash & Bypass Software', 'Servis IC Power & Reball']
  },
  {
    id: 'otomotif',
    title: 'Bengkel Otomotif',
    badge: 'Bengkel Motor, Mobil, Sepeda & Variasi',
    icon: 'Car',
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    borderLight: 'border-blue-200 dark:border-blue-800',
    tagline: 'Dirancang untuk bengkel motor umum, bengkel mobil, spesialis AC mobil, dan toko variasi.',
    description: 'Mendukung Nomor Polisi (Nopol), pencatatan Kilometer (KM) masuk, tracking mekanik, penggantian suku cadang & oli, serta reminder servis berkala.',
    examples: ['Servis Ringan + Ganti Oli', 'Tune Up & Gurah Mesin', 'Ganti Kampas Rem', 'Overhaul / Turun Mesin']
  },
  {
    id: 'ac_appliances',
    title: 'Servis AC & Home Appliances',
    badge: 'AC, Kulkas, Mesin Cuci, Pompa Air',
    icon: 'Snowflake',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderLight: 'border-cyan-200 dark:border-cyan-800',
    tagline: 'Solusi untuk jasa cuci/servis AC on-site, kulkas, freezer, mesin cuci, dan instalasi rumah tangga.',
    description: 'Pencatatan alamat kunjungan/on-site, kapasitas PK/Watt, keluhan dingin/bocor, penugasan teknisi lapangan, dan pencatatan isi freon.',
    examples: ['Cuci AC Split (0.5 - 1 PK)', 'Tambah Freon R32/R410A', 'Perbaikan Modul Mesin Cuci', 'Flushing Pipa AC']
  },
  {
    id: 'laundry',
    title: 'Laundry & Cuci Sepatu',
    badge: 'Kiloan, Satuan, Sepatu, Tas, Karpet',
    icon: 'Shirt',
    color: 'text-sky-600 dark:text-sky-400',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    borderLight: 'border-sky-200 dark:border-sky-800',
    tagline: 'Untuk usaha laundry kiloan/satuan, cuci sepatu premium, tas, helm, dan dry cleaning.',
    description: 'Manajemen berat cucian (Kg/Pcs), penomoran rak/hanger simpan, status pencucian (Cuci/Kering/Setrika/Packing), dan estimasi waktu ambil.',
    examples: ['Cuci Kering Setrika (Kiloan)', 'Deep Clean Sepatu Sneakers', 'Cuci Bedcover Jumbo', 'Dry Cleaning Jas']
  },
  {
    id: 'salon_barbershop',
    title: 'Salon, Barbershop & Spa',
    badge: 'Pangkas Rambut, Salon Wanita, Spa, Nail Art',
    icon: 'Scissors',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    borderLight: 'border-rose-200 dark:border-rose-800',
    tagline: 'Untuk barbershop, pangkas rambut modern, salon kecantikan, spa & refleksi, serta nail art studio.',
    description: 'Pencatatan kapster/stylist/terapis pilihan, nomor kursi/ruang treatment, durasi pengerjaan, paket perawatan, dan sistem komisi staf.',
    examples: ['Gentleman Haircut + Massage', 'Creambath Tradisional', 'Hair Coloring / Highlight', 'Manicure & Pedicure Spa']
  },
  {
    id: 'tailor',
    title: 'Tailor & Konveksi',
    badge: 'Penjahit Pakaian, Permak Levis, Konveksi',
    icon: 'Needle',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderLight: 'border-amber-200 dark:border-amber-800',
    tagline: 'Untuk penjahit busana pria/wanita, permak jeans/baju, dan rumah konveksi seragam.',
    description: 'Pencatatan ukuran fitting badan (lingkar dada, panjang, dll), jenis bahan kain, model potongan, jadwal fitting, dan tanggal jadi pakaian.',
    examples: ['Jahit Kemeja Batik Custom', 'Jahit Kebaya Modern', 'Permak Potong / Kecilkan Celana', 'Jahit Seragam Kantor']
  },
  {
    id: 'umum',
    title: 'Jasa & Proyek Umum',
    badge: 'Percetakan, Desain, Instalasi, Proyek Khusus',
    icon: 'Wrench',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200 dark:border-emerald-800',
    tagline: 'Format fleksibel dan serbaguna untuk berbagai macam bidang jasa, instalasi, dan order pekerjaan.',
    description: 'Dapat disesuaikan bebas untuk percetakan, sablon, pertukangan, instalasi listrik/CCTV, perbaikan umum, dan jasa kustom lainnya.',
    examples: ['Jasa Instalasi CCTV 4 Channel', 'Cetak Banner / Spanduk', 'Jasa Desain Logo & Branding', 'Pekerjaan Maintenance']
  }
];

export function getJasaTerms(category: JasaCategoryType = 'elektronik'): JasaTerms {
  switch (category) {
    case 'otomotif':
      return {
        categoryId: 'otomotif',
        categoryName: 'Bengkel Otomotif',
        categoryIcon: 'Car',
        badgeName: 'Bengkel Otomotif',
        themeColor: 'blue',
        technicianLabel: 'Mekanik / Montir',
        techniciansLabel: 'Daftar Mekanik',
        unitLabel: 'Kendaraan',
        unitsLabel: 'Daftar Kendaraan',
        unitIdLabel: 'Nomor Polisi (Nopol)',
        unitIdPlaceholder: 'Contoh: B 1234 ABC / D 5678 XYZ',
        unitModelLabel: 'Merk & Tipe Kendaraan',
        unitModelPlaceholder: 'Contoh: Honda Vario 160 / Toyota Avanza 1.5 G',
        workOrderLabel: 'SPK Servis Bengkel',
        workOrdersLabel: 'Daftar Kendaraan Masuk (SPK)',
        newWorkOrderBtn: 'Terima Kendaraan Masuk',
        problemLabel: 'Keluhan & Gejala Kerusakan',
        problemPlaceholder: 'Contoh: Mesin brebet saat tarikan awal, rem depan berdecit, ganti oli berkala...',
        diagnosisLabel: 'Hasil Diagnosa & Pemeriksaan Mekanik',
        diagnosisPlaceholder: 'Contoh: Busi aus, roller CVT aus, kampas rem depan tipis...',
        sparepartLabel: 'Suku Cadang & Oli',
        sparepartsLabel: 'Stok Suku Cadang & Oli',
        customField1Label: 'Kilometer (KM) Saat Masuk',
        customField1Placeholder: 'Contoh: 18.500 KM',
        customField1Help: 'Catatan odometer kendaraan untuk jadwal servis berikutnya',
        customField2Label: 'Tahun / Warna Kendaraan',
        customField2Placeholder: 'Contoh: 2022 / Hitam Doff',
        customField2Help: 'Identifikasi fisik kendaraan saat parkir di bengkel',
        statusPending: 'Antrean Masuk',
        statusDiagnosing: 'Pengecekan Mesin',
        statusWorking: 'Sedang Dikerjakan',
        statusWaitingPart: 'Tunggu Suku Cadang',
        statusDone: 'Selesai (Siap Diambil)',
        statusDelivered: 'Sudah Diambil Pemilik',
        statusCancelled: 'Servis Dibatalkan',
        presetServices: [
          { name: 'Servis Ringan + Ganti Oli Mesin', category: 'Perawatan Berkala', price: 95000, durationHours: 1 },
          { name: 'Tune Up & Pembersihan Injektor/Karbu', category: 'Performa Mesin', price: 150000, durationHours: 1.5 },
          { name: 'Servis CVT & Pembersihan Pulley (Matic)', category: 'Transmisi', price: 85000, durationHours: 1 },
          { name: 'Ganti Kampas Rem Depan & Belakang', category: 'Pengereman', price: 45000, durationHours: 0.5 },
          { name: 'Kuras Radiator & Ganti Coolant', category: 'Pendinginan', price: 65000, durationHours: 0.5 }
        ]
      };

    case 'ac_appliances':
      return {
        categoryId: 'ac_appliances',
        categoryName: 'Servis AC & Home Appliances',
        categoryIcon: 'Snowflake',
        badgeName: 'Servis AC & Pendingin',
        themeColor: 'cyan',
        technicianLabel: 'Teknisi Pendingin',
        techniciansLabel: 'Daftar Teknisi Lapangan',
        unitLabel: 'Unit AC / Mesin',
        unitsLabel: 'Daftar Unit Terdaftar',
        unitIdLabel: 'Tipe / Serial Unit',
        unitIdPlaceholder: 'Contoh: AC Split Inverter / Kulkas 2 Pintu',
        unitModelLabel: 'Merk & Tipe Unit',
        unitModelPlaceholder: 'Contoh: Daikin Flash Inverter / Panasonic EcoNavi',
        workOrderLabel: 'Order Servis / Kunjungan',
        workOrdersLabel: 'Jadwal Servis & Kunjungan',
        newWorkOrderBtn: 'Terima Order Kunjungan',
        problemLabel: 'Keluhan & Gejala Kerusakan',
        problemPlaceholder: 'Contoh: AC kurang dingin, bocor air pada indoor, outdoor berisik / mati total...',
        diagnosisLabel: 'Hasil Analisa & Pengukuran Tekanan',
        diagnosisPlaceholder: 'Contoh: Evaporator kotor tebal, tekanan freon R32 tersisa 60 PSI (bocor halus pipa)...',
        sparepartLabel: 'Sparepart & Bahan Pendingin',
        sparepartsLabel: 'Stok Sparepart & Freon',
        customField1Label: 'Alamat Kunjungan / Lokasi Unit',
        customField1Placeholder: 'Contoh: Jl. Anggrek No. 12, Blok B (Lantai 2 Kamar Utama)',
        customField1Help: 'Lokasi tempat unit AC / mesin dipasang untuk teknisi kunjungan',
        customField2Label: 'Kapasitas Unit (PK / Watt)',
        customField2Placeholder: 'Contoh: 0.5 PK / 1 PK / 2 PK / Inverter',
        customField2Help: 'Spesifikasi ukuran pendingin / daya unit',
        statusPending: 'Booking Masuk',
        statusDiagnosing: 'Survei & Pengecekan',
        statusWorking: 'Sedang Dikerjakan',
        statusWaitingPart: 'Menunggu Pengadaan Part/Freon',
        statusDone: 'Selesai & Uji Coba',
        statusDelivered: 'Selesai (Pelanggan Puas)',
        statusCancelled: 'Kunjungan Dibatalkan',
        presetServices: [
          { name: 'Cuci AC Split Reguler (0.5 - 1 PK)', category: 'Cleaning & Wash', price: 75000, durationHours: 1 },
          { name: 'Cuci AC Split Besar (1.5 - 2 PK)', category: 'Cleaning & Wash', price: 95000, durationHours: 1.2 },
          { name: 'Tambah Freon R32 / R410A (Full)', category: 'Refill Freon', price: 175000, durationHours: 0.8 },
          { name: 'Perbaikan Kebocoran Pipa & Las Tembaga', category: 'Perbaikan', price: 250000, durationHours: 2 },
          { name: 'Bongkar & Pasang Relokasi Unit AC', category: 'Instalasi', price: 350000, durationHours: 2.5 }
        ]
      };

    case 'laundry':
      return {
        categoryId: 'laundry',
        categoryName: 'Laundry & Cuci Sepatu',
        categoryIcon: 'Shirt',
        badgeName: 'Laundry & Dry Clean',
        themeColor: 'sky',
        technicianLabel: 'Operator / Kasir Cuci',
        techniciansLabel: 'Daftar Operator Laundry',
        unitLabel: 'Cucian / Item',
        unitsLabel: 'Daftar Cucian Masuk',
        unitIdLabel: 'No. Nota / Label Tag',
        unitIdPlaceholder: 'Contoh: LDY-8841 / TAG-012',
        unitModelLabel: 'Paket Layanan & Jenis Barang',
        unitModelPlaceholder: 'Contoh: Cuci Kering Setrika / Sepatu Sneaker Kulit / Bedcover King',
        workOrderLabel: 'Nota Masuk Laundry',
        workOrdersLabel: 'Antrean Proses Laundry',
        newWorkOrderBtn: 'Terima Cucian Baru',
        problemLabel: 'Instruksi Khusus & Catatan Noda',
        problemPlaceholder: 'Contoh: Noda kopi di kerah kemeja, jangan gunakan pemutih, parfum wangi Lavender...',
        diagnosisLabel: 'Catatan Pengecekan Awal',
        diagnosisPlaceholder: 'Contoh: Terdapat kancing lepas pada baju batik, noda minyak di celana jeans...',
        sparepartLabel: 'Deterjen & Perlengkapan',
        sparepartsLabel: 'Stok Bahan & Plastik Packing',
        customField1Label: 'No. Rak / Hanger Penyimpanan',
        customField1Placeholder: 'Contoh: Rak B-04 / Hanger 12',
        customField1Help: 'Lokasi penyimpanan agar mudah dicari saat pelanggan datang mengambil',
        customField2Label: 'Berat Total (Kg) / Jumlah Pcs',
        customField2Placeholder: 'Contoh: 4.8 Kg (atau 3 Pcs)',
        customField2Help: 'Timbangan cucian atau rincian item satuan',
        statusPending: 'Antrean Cuci',
        statusDiagnosing: 'Pemisahan Noda',
        statusWorking: 'Sedang Dicuci & Setrika',
        statusWaitingPart: 'Proses Pengeringan',
        statusDone: 'Selesai (Siap Diambil/Packing)',
        statusDelivered: 'Sudah Diambil Pelanggan',
        statusCancelled: 'Cucian Dibatalkan',
        presetServices: [
          { name: 'Cuci Kering Setrika Reguler (2 Hari)', category: 'Kiloan', price: 8000, durationHours: 48 },
          { name: 'Cuci Kering Setrika Express (6 Jam)', category: 'Kiloan', price: 15000, durationHours: 6 },
          { name: 'Cuci Bedcover Jumbo King Size', category: 'Satuan', price: 35000, durationHours: 24 },
          { name: 'Deep Clean Sepatu Sneakers Standar', category: 'Shoes Care', price: 40000, durationHours: 24 },
          { name: 'Dry Cleaning Jas / Blazer Formal', category: 'Dry Clean', price: 45000, durationHours: 48 }
        ]
      };

    case 'salon_barbershop':
      return {
        categoryId: 'salon_barbershop',
        categoryName: 'Salon, Barbershop & Spa',
        categoryIcon: 'Scissors',
        badgeName: 'Barbershop & Beauty',
        themeColor: 'rose',
        technicianLabel: 'Stylist / Kapster / Terapis',
        techniciansLabel: 'Daftar Stylist & Kapster',
        unitLabel: 'Pelanggan & Treatment',
        unitsLabel: 'Daftar Kunjungan & Booking',
        unitIdLabel: 'No. Member / Booking ID',
        unitIdPlaceholder: 'Contoh: MBR-0021 / WALK-IN',
        unitModelLabel: 'Paket / Model Potongan Rambut',
        unitModelPlaceholder: 'Contoh: French Crop Fade / Hair Spa Anti-Dandruff / Balayage',
        workOrderLabel: 'Order Treatment & Layanan',
        workOrdersLabel: 'Antrean Layanan Kursi',
        newWorkOrderBtn: 'Input Antrean Pelanggan',
        problemLabel: 'Permintaan Model & Catatan Khusus',
        problemPlaceholder: 'Contoh: Potong tipis samping nomor 1, bagian atas disisir ke samping, hindari produk mint...',
        diagnosisLabel: 'Konsultasi & Rekomendasi Stylist',
        diagnosisPlaceholder: 'Contoh: Kondisi kulit kepala sensitif, disarankan perawatan Hair Tonic Ginseng...',
        sparepartLabel: 'Produk & Bahan Treatment',
        sparepartsLabel: 'Stok Pomade, Shampo & Cat Rambut',
        customField1Label: 'Nomor Kursi / Ruang Treatment',
        customField1Placeholder: 'Contoh: Kursi 02 (Lt. 1) / Ruang VIP 1',
        customField1Help: 'Penempatan kursi pelayanan agar alur kerja salon rapi',
        customField2Label: 'Estimasi Durasi Layanan',
        customField2Placeholder: 'Contoh: 45 Menit / 1.5 Jam',
        customField2Help: 'Perkiraan waktu pengerjaan untuk antrean berikutnya',
        statusPending: 'Menunggu Giliran',
        statusDiagnosing: 'Konsultasi Rambut',
        statusWorking: 'Sedang Dikerjakan di Kursi',
        statusWaitingPart: 'Proses Diamkan Cat/Bahan',
        statusDone: 'Selesai Treatment',
        statusDelivered: 'Selesai Pembayaran Kasir',
        statusCancelled: 'Antrean Dibatalkan',
        presetServices: [
          { name: 'Gentleman Haircut + Keramas + Pijat Bahu', category: 'Haircut', price: 60000, durationHours: 0.75 },
          { name: 'Kids Haircut & Styling', category: 'Haircut', price: 45000, durationHours: 0.5 },
          { name: 'Hair Coloring (Cat Rambut Hitam / Fashion)', category: 'Coloring', price: 150000, durationHours: 2 },
          { name: 'Creambath Tradisional + Steam Rambut', category: 'Spa & Care', price: 85000, durationHours: 1.2 },
          { name: 'Shaving Kumis & Jenggot Hot Towel', category: 'Grooming', price: 35000, durationHours: 0.5 }
        ]
      };

    case 'tailor':
      return {
        categoryId: 'tailor',
        categoryName: 'Tailor & Konveksi',
        categoryIcon: 'Needle',
        badgeName: 'Tailor & Penjahit',
        themeColor: 'amber',
        technicianLabel: 'Penjahit / Pemotong Pola',
        techniciansLabel: 'Daftar Penjahit',
        unitLabel: 'Pakaian / Pesanan',
        unitsLabel: 'Daftar Order Pakaian',
        unitIdLabel: 'No. Order / Nota Fitting',
        unitIdPlaceholder: 'Contoh: JHT-2026-001',
        unitModelLabel: 'Jenis Busana & Model Jahitan',
        unitModelPlaceholder: 'Contoh: Kemeja Batik Lengan Panjang Slimfit / Kebaya Brokat',
        workOrderLabel: 'SPK Jahit & Potong',
        workOrdersLabel: 'Daftar Order Pengerjaan Jahit',
        newWorkOrderBtn: 'Terima Pesanan Jahit Baru',
        problemLabel: 'Spesifikasi Model & Catatan Permintaan',
        problemPlaceholder: 'Contoh: Kerah kemeja kaku, kancing bungkus kain, saku bobok kiri depan...',
        diagnosisLabel: 'Rincian Ukuran / Data Fitting Badan',
        diagnosisPlaceholder: 'Contoh: Lingkar Dada: 102cm, Panjang Baju: 74cm, Panjang Tangan: 61cm, Bahu: 44cm...',
        sparepartLabel: 'Bahan, Benang & Aksesoris',
        sparepartsLabel: 'Stok Kain, Kancing & Ritsleting',
        customField1Label: 'Data Ukuran Badan / Fitting',
        customField1Placeholder: 'Contoh: LD: 104, PB: 75, PL: 62, LB: 46 (atau Lampirkan Form)',
        customField1Help: 'Rincian ukuran badan pelanggan untuk pembuatan pola',
        customField2Label: 'Jenis Kain & Panjang Bahan (Meter)',
        customField2Placeholder: 'Contoh: Katun Primisima Batik 2.5 Meter (Bawa Sendiri)',
        customField2Help: 'Catatan asal dan karakteristik bahan kain',
        statusPending: 'Antrean Pola',
        statusDiagnosing: 'Pemotongan Bahan',
        statusWorking: 'Proses Jahit & Obras',
        statusWaitingPart: 'Menunggu Jadwal Fitting',
        statusDone: 'Selesai (Siap Fitting/Ambil)',
        statusDelivered: 'Sudah Diserahkan ke Pelanggan',
        statusCancelled: 'Order Dibatalkan',
        presetServices: [
          { name: 'Jahit Kemeja Pria Lengan Pendek (Ongkos)', category: 'Pria', price: 120000, durationHours: 72 },
          { name: 'Jahit Kemeja Pria Lengan Panjang (Ongkos)', category: 'Pria', price: 150000, durationHours: 72 },
          { name: 'Jahit Celana Bahan Formal Pria', category: 'Pria', price: 140000, durationHours: 72 },
          { name: 'Jahit Gamis / Dress Wanita Standar', category: 'Wanita', price: 200000, durationHours: 96 },
          { name: 'Permak Potong Panjang Celana Jeans / Bahan', category: 'Permak', price: 25000, durationHours: 2 }
        ]
      };

    case 'umum':
      return {
        categoryId: 'umum',
        categoryName: 'Jasa & Proyek Umum',
        categoryIcon: 'Wrench',
        badgeName: 'Servis & Jasa Umum',
        themeColor: 'emerald',
        technicianLabel: 'Teknisi / Pelaksana Proyek',
        techniciansLabel: 'Daftar Tenaga Ahli / Tim',
        unitLabel: 'Pekerjaan / Item Proyek',
        unitsLabel: 'Daftar Proyek & Pekerjaan',
        unitIdLabel: 'No. SPK / Kode Order',
        unitIdPlaceholder: 'Contoh: SPK-2026-001',
        unitModelLabel: 'Nama Layanan / Judul Proyek',
        unitModelPlaceholder: 'Contoh: Instalasi CCTV 4 Titik / Desain Katalog 20 Halaman',
        workOrderLabel: 'Surat Perintah Kerja (SPK)',
        workOrdersLabel: 'Daftar Pekerjaan Masuk (SPK)',
        newWorkOrderBtn: 'Buat SPK Proyek Baru',
        problemLabel: 'Spesifikasi Order & Instruksi Kerja',
        problemPlaceholder: 'Contoh: Pasang 4 kamera Outdoor 2MP, tarik kabel 80 meter, setting DVR ke smartphone...',
        diagnosisLabel: 'Catatan Hasil Survei / Analisa Kerja',
        diagnosisPlaceholder: 'Contoh: Jalur kabel aman lewat plafon, adaptor power supply membutuhkan stop kontak baru...',
        sparepartLabel: 'Material & Perlengkapan',
        sparepartsLabel: 'Stok Material & Perlengkapan',
        customField1Label: 'Lokasi Pengerjaan / Proyek',
        customField1Placeholder: 'Contoh: Ruko Sentra Niaga Blok C5 (Lantai 1-2)',
        customField1Help: 'Lokasi di mana pekerjaan / instalasi jasa dilakukan',
        customField2Label: 'Target / Estimasi Waktu Selesai',
        customField2Placeholder: 'Contoh: 2 Hari Kerja / Selesai Tgl 10',
        customField2Help: 'Tenggat waktu pengerjaan proyek pesanan pelanggan',
        statusPending: 'Order Masuk',
        statusDiagnosing: 'Survei & Perencanaan',
        statusWorking: 'Sedang Dikerjakan',
        statusWaitingPart: 'Menunggu Material',
        statusDone: 'Selesai Pengerjaan',
        statusDelivered: 'Selesai Serah Terima',
        statusCancelled: 'Pekerjaan Dibatalkan',
        presetServices: [
          { name: 'Jasa Instalasi CCTV per Titik Kamera', category: 'Instalasi', price: 150000, durationHours: 2 },
          { name: 'Jasa Setting Jaringan Router & Wi-Fi Kantor', category: 'Networking', price: 250000, durationHours: 3 },
          { name: 'Jasa Desain Banner / Spanduk Promosi', category: 'Desain', price: 75000, durationHours: 4 },
          { name: 'Jasa Pemasangan Bracket TV Dinding (32-55 Inch)', category: 'Instalasi', price: 120000, durationHours: 1.5 },
          { name: 'Jasa Maintenance / Pemeliharaan Rutin Bulanan', category: 'Maintenance', price: 500000, durationHours: 5 }
        ]
      };

    case 'elektronik':
    default:
      return {
        categoryId: 'elektronik',
        categoryName: 'Servis Elektronik & Gadget',
        categoryIcon: 'Smartphone',
        badgeName: 'Servis HP & Elektronik',
        themeColor: 'indigo',
        technicianLabel: 'Teknisi Gadget',
        techniciansLabel: 'Daftar Teknisi Servis',
        unitLabel: 'Perangkat / Gadget',
        unitsLabel: 'Daftar Perangkat Masuk',
        unitIdLabel: 'IMEI / Serial Number',
        unitIdPlaceholder: 'Contoh: 352849102938472 / SN: C39FK29...',
        unitModelLabel: 'Merk & Seri Perangkat',
        unitModelPlaceholder: 'Contoh: iPhone 13 Pro 128GB / Samsung Galaxy S23',
        workOrderLabel: 'Tanda Terima Servis (SPK)',
        workOrdersLabel: 'Daftar Servis Masuk (SPK)',
        newWorkOrderBtn: 'Terima Servis Baru',
        problemLabel: 'Keluhan & Kerusakan Perangkat',
        problemPlaceholder: 'Contoh: Layar retak garis hijau, baterai cepat drop (kembung), mati total setelah jatuh...',
        diagnosisLabel: 'Hasil Diagnosa & Pemeriksaan Teknisi',
        diagnosisPlaceholder: 'Contoh: LCD original rusak pada flexibel, konsumsi arus normal 0.4A, baterai health 68%...',
        sparepartLabel: 'Sparepart & Komponen',
        sparepartsLabel: 'Stok Sparepart & Modul',
        customField1Label: 'Pola Kunci / Password Layar',
        customField1Placeholder: 'Contoh: PIN 123456 / Pola L terbalik / Tanpa Sandi',
        customField1Help: 'Diperlukan untuk pengujian speaker, mic, kamera, & sensor setelah selesai servis',
        customField2Label: 'Kelengkapan Unit Saat Diterima',
        customField2Placeholder: 'Contoh: Unit saja (SIM card & memori sudah dilepas) / Bawa Charger Asli',
        customField2Help: 'Penting untuk mencegah klaim barang tertinggal',
        statusPending: 'Antrean Masuk',
        statusDiagnosing: 'Sedang Dicek',
        statusWorking: 'Sedang Diservis',
        statusWaitingPart: 'Menunggu Sparepart',
        statusDone: 'Selesai (Siap Diambil)',
        statusDelivered: 'Sudah Diambil Pelanggan',
        statusCancelled: 'Servis Dibatalkan',
        presetServices: [
          { name: 'Ganti LCD / Touchscreen Original', category: 'Hardware Layar', price: 450000, durationHours: 2 },
          { name: 'Ganti Baterai High Capacity', category: 'Hardware Daya', price: 250000, durationHours: 1 },
          { name: 'Servis Konektor Charger / Fleksibel Cas', category: 'Hardware Port', price: 150000, durationHours: 1.5 },
          { name: 'Flash / Install Ulang OS & Bypass Akun', category: 'Software & OS', price: 120000, durationHours: 1 },
          { name: 'Perbaikan IC Power & Jalur Mati Total', category: 'Motherboard', price: 550000, durationHours: 24 }
        ]
      };
  }
}
