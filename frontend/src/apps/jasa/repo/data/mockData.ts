import { WorkOrder, Technician, ServiceCatalogItem, ServiceStats, JasaInvoice, JasaExpense } from '../types';

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'TECH-01',
    name: 'Budi Hartono, S.T.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialty: 'HVAC & Pendingin Industri',
    phone: '0812-3456-7890',
    email: 'budi.h@servispro.id',
    rating: 4.9,
    completedJobs: 142,
    currentStatus: 'Bertugas',
    activeWorkOrderId: 'SPK-2026-0801',
    skills: ['Chiller Sentrifugal', 'VRV/VRF System', 'Troubleshooting Refrigerant', 'Sertifikasi BNSP HVAC'],
    certifications: ['BNSP HVAC Level 4', 'K3 Listrik Industri']
  },
  {
    id: 'TECH-02',
    name: 'Ahmad Fauzi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Genset & Kelistrikan Arus Kuat',
    phone: '0813-9876-5432',
    email: 'ahmad.fauzi@servispro.id',
    rating: 4.8,
    completedJobs: 98,
    currentStatus: 'Bertugas',
    activeWorkOrderId: 'SPK-2026-0802',
    skills: ['Genset 500kVA+', 'Panel ATS/AMF', 'Sinkronisasi Generator', 'Kalibrasi Proteksi'],
    certifications: ['Ahli K3 Listrik Kemenaker', 'Sertifikasi Cummins & Perkins']
  },
  {
    id: 'TECH-03',
    name: 'Rian Pratama, A.Md.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Infrastruktur Jaringan & Server',
    phone: '0857-1122-3344',
    email: 'rian.p@servispro.id',
    rating: 4.95,
    completedJobs: 165,
    currentStatus: 'Tersedia',
    skills: ['Fiber Optic Splicing', 'Rack Server Cabling', 'Cisco Switch/Router', 'CCTV IP Enterprise'],
    certifications: ['CCNA', 'MikroTik MTCNA', 'Fiber Optic Certified']
  },
  {
    id: 'TECH-04',
    name: 'Dedi Kurniawan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Automasi & PLC Mesin Pabrik',
    phone: '0878-4455-6677',
    email: 'dedi.k@servispro.id',
    rating: 4.75,
    completedJobs: 84,
    currentStatus: 'Siaga',
    skills: ['Siemens S7-1200', 'Mitsubishi PLC', 'Inverter VFD', 'Sensor Kalibrasi'],
    certifications: ['Siemens PLC Certified Specialist']
  },
  {
    id: 'TECH-05',
    name: 'Siti Rahmawati',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Instrumen Laboratorium & Medis',
    phone: '0821-6677-8899',
    email: 'siti.r@servispro.id',
    rating: 5.0,
    completedJobs: 110,
    currentStatus: 'Tersedia',
    skills: ['Autoclave Presisi', 'Spektrofotometer', 'Kalibrasi Timbangan Mikro', 'Validasi ISO 17025'],
    certifications: ['Auditor ISO 17025', 'Kalibrasi Metrologi']
  },
  {
    id: 'TECH-06',
    name: 'Hendra Saputra',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    specialty: 'Mekanik Pompa & Hidrolik Industri',
    phone: '0812-7788-9900',
    email: 'hendra.s@servispro.id',
    rating: 4.7,
    completedJobs: 76,
    currentStatus: 'Izin / Cuti',
    skills: ['Pompa Sentrifugal Booster', 'Overhaul Kompresor', 'Piping & Valve', 'Penggantian Seal'],
    certifications: ['Teknisi Fluida Industri']
  }
];

export const INITIAL_SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'CAT-01',
    code: 'SRV-HVAC-01',
    name: 'Overhaul & Cuci Kimia Chiller/VRV',
    category: 'Pemeliharaan Berkala (Preventive)',
    description: 'Pembersihan kondensor/evaporator kimiawi, cek tekanan oli kompresor, flushing pipa, tes kebocoran freon, dan kalibrasi termostat.',
    basePrice: 1850000,
    estimatedDurationHours: 4,
    warrantyDays: 60,
    requiredSkillLevel: 'Senior',
    recommendedParts: ['Cairan Chemical Coil Cleaner', 'Refrigerant R410A/R32', 'Filter Drier'],
    activeOrdersCount: 8
  },
  {
    id: 'CAT-02',
    code: 'SRV-GEN-02',
    name: 'Servis Berkala & Uji Beban Genset 250-500 kVA',
    category: 'Pemeliharaan Berkala (Preventive)',
    description: 'Penggantian oli mesin, filter oli & solar, cek air radiator, pembersihan injector, load bank test 50-100%, dan kalibrasi AVR.',
    basePrice: 2450000,
    estimatedDurationHours: 5,
    warrantyDays: 90,
    requiredSkillLevel: 'Senior',
    recommendedParts: ['Oli Mesin Diesel 15W-40 20L', 'Filter Oli OEM', 'Filter Solar Ganda', 'Air Radiator Coolant'],
    activeOrdersCount: 6
  },
  {
    id: 'CAT-03',
    code: 'SRV-NET-03',
    name: 'Terminasi, Splicing & Sertifikasi OTDR Fiber Optic',
    category: 'Instalasi & Commissioning',
    description: 'Penyambungan core fiber optic dengan fusion splicer presisi tinggi, pelindung heat-shrink, penataan OTB/ODC, dan uji redaman OTDR lengkap dengan sertifikat.',
    basePrice: 1250000,
    estimatedDurationHours: 3,
    warrantyDays: 180,
    requiredSkillLevel: 'Madya',
    recommendedParts: ['Pigtail LC/SC UPC Singlemode', 'Protection Sleeve 60mm', 'Adapter Coupler'],
    activeOrdersCount: 5
  },
  {
    id: 'CAT-04',
    code: 'SRV-PLC-04',
    name: 'Troubleshooting & Reprogramming PLC / Inverter VFD',
    category: 'Perbaikan & Troubleshooting (Corrective)',
    description: 'Diagnosa error tripping, backup program ladder logic, penyesuaian parameter PID inverter, dan pengujian sinkronisasi motor conveyor.',
    basePrice: 1750000,
    estimatedDurationHours: 3.5,
    warrantyDays: 45,
    requiredSkillLevel: 'Spesialis Ahli',
    recommendedParts: ['Kabel Komunikasi USB-PPI/MPI', 'Relay Omron 24VDC', 'Terminal Blok Phoenix'],
    activeOrdersCount: 4
  },
  {
    id: 'CAT-05',
    code: 'SRV-CAL-05',
    name: 'Kalibrasi Suhu & Tekanan Instrumen Laboratorium',
    category: 'Kalibrasi & Pengujian',
    description: 'Kalibrasi 5 titik suhu dan 3 titik tekanan terstandarisasi KAN/ISO 17025 menggunakan reference dry-well calibrator dan deadweight tester.',
    basePrice: 2100000,
    estimatedDurationHours: 3,
    warrantyDays: 365,
    requiredSkillLevel: 'Spesialis Ahli',
    recommendedParts: ['Stiker Kalibrasi Hologram', 'Sensor Probe PT100 Pengganti', 'Thermal Grease'],
    activeOrdersCount: 3
  },
  {
    id: 'CAT-06',
    code: 'SRV-PUMP-06',
    name: 'Perbaikan & Penggantian Mechanical Seal Pompa Transfer',
    category: 'Perbaikan & Troubleshooting (Corrective)',
    description: 'Bongkar housing pompa, ganti mechanical seal silicon carbide, alignment kopling dial gauge, dan uji kebocoran tekanan dinamik.',
    basePrice: 1400000,
    estimatedDurationHours: 4,
    warrantyDays: 30,
    requiredSkillLevel: 'Madya',
    recommendedParts: ['Mechanical Seal 32mm SiC/SiC', 'O-Ring NBR Set', 'Bearing SKF 6306-2RS'],
    activeOrdersCount: 2
  },
  {
    id: 'CAT-07',
    code: 'SRV-AUD-07',
    name: 'Audit Kualitas Daya & Termografi Panel Listrik',
    category: 'Konsultasi & Audit Teknis',
    description: 'Pemeriksaan titik panas (hotspot) dengan Fluke Thermal Imager, analisis harmonik THD-V/THD-I, power factor logger, dan laporan rekomendasi K3.',
    basePrice: 3200000,
    estimatedDurationHours: 6,
    warrantyDays: 30,
    requiredSkillLevel: 'Senior',
    recommendedParts: ['Laporan Komprehensif Cetak & Digital', 'Marker Label Kabel'],
    activeOrdersCount: 3
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'SPK-2026-0801',
    title: 'Perbaikan Darurat Chiller VRV Gedung Tower B - Tidak Dingin',
    customerName: 'Ir. Handoko Prasetyo',
    customerCompany: 'PT Sinarmas Mega Properti',
    customerPhone: '0811-2233-4455',
    customerEmail: 'handoko@sinarmaspro.co.id',
    customerAddress: 'Sinarmas Land Plaza Tower 2 Lt. 14, Jl. MH Thamrin No. 51, Jakarta Pusat',
    category: 'Perbaikan & Troubleshooting (Corrective)',
    serviceObjectName: 'Daikin VRV IV 30 HP Outdoor Unit',
    serviceObjectIdentifier: 'DK-VRV-2023-88910',
    priority: 'Darurat',
    status: 'Sedang Dikerjakan',
    createdAt: '2026-08-20 07:30',
    scheduledDate: '2026-08-20',
    scheduledTime: '08:30',
    assignedTechnicianId: 'TECH-01',
    technicianName: 'Budi Hartono, S.T.',
    estimatedHours: 4.0,
    laborRate: 750000,
    serviceDescription: 'Unit outdoor trip error E3 (High Pressure Protection). Suhu ruang server naik ke 29°C. Memerlukan evakuasi freon dan penggantian sensor expansion valve.',
    rootCauseNotes: 'Ditemukan penyumbatan pada electronic expansion valve (EEV) cabang outdoor 2 serta motor fan kondensor macet.',
    partsUsed: [
      { id: 'P-101', name: 'Electronic Expansion Valve Coil Daikin', quantity: 1, unitCost: 1450000 },
      { id: 'P-102', name: 'Refrigerant R410A Dupont (1 Silinder 11.3kg)', quantity: 1, unitCost: 1250000 },
      { id: 'P-103', name: 'Nitrogen Flushing & Pressure Test', quantity: 1, unitCost: 350000 }
    ],
    totalPartsCost: 3050000,
    totalLaborCost: 750000,
    dpAmount: 0,
    grandTotal: 3800000,
    paymentStatus: 'Sebagian (DP)',
    warrantyPeriod: '60 Hari Kerja',
    slaDeadline: '2026-08-20 13:30',
    logs: [
      { id: 'L-1', timestamp: '2026-08-20 07:30', author: 'Customer Service (Rina)', action: 'Tiket Dibuat', notes: 'Pelanggan melapor melalui hot-line darurat ruang server.' },
      { id: 'L-2', timestamp: '2026-08-20 07:45', author: 'Dispatch Manager (Eko)', action: 'Penugasan Teknisi', notes: 'Dialokasikan ke Teknisi Budi Hartono (Status Prioritas Darurat).' },
      { id: 'L-3', timestamp: '2026-08-20 08:35', author: 'Budi Hartono', action: 'Check-in Lokasi', notes: 'Tiba di lokasi, memulai isolasi tegangan dan pengukuran manifold pressure.' }
    ]
  },
  {
    id: 'SPK-2026-0802',
    title: 'Servis Preventif & Pergantian Filter Genset 500kVA',
    customerName: 'Bambang Sudiro',
    customerCompany: 'RS Graha Medika Internasional',
    customerPhone: '0812-9900-1122',
    customerEmail: 'bambang.med@grahamedika.org',
    customerAddress: 'Jl. Surya Sumantri No. 120, Sukajadi, Bandung',
    category: 'Pemeliharaan Berkala (Preventive)',
    serviceObjectName: 'Perkins 500kVA Silent Type Genset',
    serviceObjectIdentifier: 'PK-500-2022-771',
    priority: 'Tinggi',
    status: 'Sedang Dikerjakan',
    createdAt: '2026-08-19 14:00',
    scheduledDate: '2026-08-20',
    scheduledTime: '09:00',
    assignedTechnicianId: 'TECH-02',
    technicianName: 'Ahmad Fauzi',
    estimatedHours: 5.0,
    laborRate: 1200000,
    serviceDescription: 'Jadwal servis 250 jam operasional rutin genset darurat RS. Penggantian pelumas mesin, filter ganda, dan pengetesan ATS otomatis.',
    partsUsed: [
      { id: 'P-201', name: 'Oli Mesin Meditran SX SAE 15W-40 (40 Liter)', quantity: 2, unitCost: 1100000 },
      { id: 'P-202', name: 'Filter Oli Perkins Original 2654403', quantity: 2, unitCost: 450000 },
      { id: 'P-203', name: 'Filter Solar Racor Separator 1000FH', quantity: 2, unitCost: 650000 },
      { id: 'P-204', name: 'Battery Aki Genset 12V 100Ah Yuasa', quantity: 2, unitCost: 1850000 }
    ],
    totalPartsCost: 8100000,
    totalLaborCost: 1200000,
    dpAmount: 0,
    grandTotal: 9300000,
    paymentStatus: 'Belum Bayar',
    warrantyPeriod: '90 Hari',
    slaDeadline: '2026-08-20 16:00',
    logs: [
      { id: 'L-1', timestamp: '2026-08-19 14:00', author: 'Kontrak Service Planner', action: 'Tiket Terjadwal', notes: 'Dibuat berdasarkan siklus perawatan berkala otomatis.' },
      { id: 'L-2', timestamp: '2026-08-20 09:10', author: 'Ahmad Fauzi', action: 'Mulai Pengerjaan', notes: 'Pengurasan oli lama dan pengecekan tegangan baterai starter.' }
    ]
  },
  {
    id: 'SPK-2026-0803',
    title: 'Splicing 48 Core OTB Datacenter & Uji Redaman OTDR',
    customerName: 'Diana Lestari',
    customerCompany: 'PT Telco Nusa Solusindo',
    customerPhone: '0813-8877-6655',
    customerEmail: 'diana.lestari@telconusa.id',
    customerAddress: 'APL Tower Podomoro City Lt. 28, Tanjung Duren, Jakarta Barat',
    category: 'Instalasi & Commissioning',
    serviceObjectName: 'Optical Termination Box 48 Port Rackmount',
    serviceObjectIdentifier: 'OTB-FO-2026-044',
    priority: 'Sedang',
    status: 'Pengecekan & Estimasi',
    createdAt: '2026-08-20 08:00',
    scheduledDate: '2026-08-21',
    scheduledTime: '10:00',
    assignedTechnicianId: 'TECH-03',
    technicianName: 'Rian Pratama, A.Md.',
    estimatedHours: 3.5,
    laborRate: 1000000,
    serviceDescription: 'Penyambungan jalur backbone baru ke rack server F-09. Memerlukan laporan loss decibel resmi untuk sertifikasi SLA 99.98%.',
    partsUsed: [
      { id: 'P-301', name: 'Pigtail SC/UPC SM 0.9mm (Pack 12pcs)', quantity: 4, unitCost: 180000 },
      { id: 'P-302', name: 'Protection Sleeve Fiber 60mm (Pack 50pcs)', quantity: 1, unitCost: 65000 },
      { id: 'P-303', name: 'Adapter SC Simplex Coupler (Pack 12pcs)', quantity: 4, unitCost: 95000 }
    ],
    totalPartsCost: 1165000,
    totalLaborCost: 1000000,
    dpAmount: 0,
    grandTotal: 2165000,
    paymentStatus: 'Sebagian (DP)',
    warrantyPeriod: '180 Hari',
    slaDeadline: '2026-08-21 16:00',
    logs: [
      { id: 'L-1', timestamp: '2026-08-20 08:00', author: 'Project Coordinator', action: 'Jadwal Ditetapkan', notes: 'Izin masuk gedung loading dock telah diterbitkan.' }
    ]
  },
  {
    id: 'SPK-2026-0804',
    title: 'Audit Termografi & Kualitas Daya Panel Utama MDP Pabrik',
    customerName: 'Kusuma Wardhana',
    customerCompany: 'PT Indofood CBP Sukses Makmur Tbk',
    customerPhone: '0812-4433-2211',
    customerEmail: 'kusuma.w@icbp.indofood.co.id',
    customerAddress: 'Kawasan Industri MM2100 Blok GG-4, Cikarang Barat, Bekasi',
    category: 'Konsultasi & Audit Teknis',
    serviceObjectName: 'Main Distribution Panel (MDP) 2000A Schneider',
    serviceObjectIdentifier: 'SCH-MDP-2019-902',
    priority: 'Sedang',
    status: 'Selesai & Siap Diambil',
    createdAt: '2026-08-18 10:15',
    scheduledDate: '2026-08-19',
    scheduledTime: '13:00',
    completionDate: '2026-08-20 07:00',
    assignedTechnicianId: 'TECH-02',
    technicianName: 'Ahmad Fauzi',
    estimatedHours: 6.0,
    actualHours: 5.5,
    laborRate: 2800000,
    serviceDescription: 'Pemeriksaan berkala titik panas busbar dan breaker utama dalam kondisi beban puncak operasional. Pembuatan sertifikat K3 dan rekomendasi torsi baut.',
    partsUsed: [
      { id: 'P-401', name: 'Dokumen Sertifikat Hasil Uji & Analisis Fluke Thermal (Hard & Softcopy)', quantity: 1, unitCost: 400000 }
    ],
    totalPartsCost: 400000,
    totalLaborCost: 2800000,
    dpAmount: 0,
    grandTotal: 3200000,
    paymentStatus: 'Lunas',
    warrantyPeriod: '30 Hari',
    slaDeadline: '2026-08-19 18:00',
    customerSatisfaction: 5,
    logs: [
      { id: 'L-1', timestamp: '2026-08-19 13:00', author: 'Ahmad Fauzi', action: 'Mulai Audit', notes: 'Thermal imaging 12 panel feeder dilakukan saat pabrik beroperasi 80% beban.' },
      { id: 'L-2', timestamp: '2026-08-19 17:30', author: 'Ahmad Fauzi', action: 'Selesai Lapangan', notes: 'Ditemukan delta T 18°C pada feeder 3, telah direkomendasikan retightening.' },
      { id: 'L-3', timestamp: '2026-08-20 07:00', author: 'Supervisor QC (Bayu)', action: 'QC Laporan Disetujui', notes: 'Laporan final dikirim ke klien.' }
    ]
  },
  {
    id: 'SPK-2026-0805',
    title: 'Troubleshooting PLC Line Packaging 3 - Alarm Sensor Proximity',
    customerName: 'Agus Wijaya',
    customerCompany: 'PT Unilever Oleochemical',
    customerPhone: '0815-6677-8899',
    customerEmail: 'agus.wijaya@unilever.com',
    customerAddress: 'Kawasan Ekonomi Khusus Sei Mangkei, Kab. Simalungun',
    category: 'Perbaikan & Troubleshooting (Corrective)',
    serviceObjectName: 'Siemens S7-1500 PLC & Festo Pneumatic Valve',
    serviceObjectIdentifier: 'SIE-S7-2024-301',
    priority: 'Darurat',
    status: 'Menunggu Sparepart',
    createdAt: '2026-08-20 06:15',
    scheduledDate: '2026-08-20',
    scheduledTime: '07:30',
    assignedTechnicianId: 'TECH-04',
    technicianName: 'Dedi Kurniawan',
    estimatedHours: 4.0,
    laborRate: 1500000,
    serviceDescription: 'Conveyor packaging terhenti intermittency akibat sinyal digital input modul SM 521 gagal membaca posisi piston silinder pneumatik.',
    partsUsed: [
      { id: 'P-501', name: 'Festo Proximity Switch SMT-8M-A-PS-24V-E-2,5-OE', quantity: 2, unitCost: 480000 },
      { id: 'P-502', name: 'Siemens SM 521 Digital Input Module 16 DI', quantity: 1, unitCost: 2950000 }
    ],
    totalPartsCost: 3910000,
    totalLaborCost: 1500000,
    dpAmount: 0,
    grandTotal: 5410000,
    paymentStatus: 'Belum Bayar',
    warrantyPeriod: '45 Hari',
    slaDeadline: '2026-08-20 12:00',
    logs: [
      { id: 'L-1', timestamp: '2026-08-20 06:15', author: 'Helpdesk Industri', action: 'Tiket Darurat Dibuat', notes: 'Lini produksi packaging 3 stop total.' },
      { id: 'L-2', timestamp: '2026-08-20 08:20', author: 'Dedi Kurniawan', action: 'Diagnosa Selesai', notes: 'Modul input rusak akibat induksi lonjakan voltase. Menunggu pengiriman modul dari gudang logistik.' }
    ]
  },
  {
    id: 'SPK-2026-0806',
    title: 'Kalibrasi & Sertifikasi ISO Timbangan Analitik Micro Lab R&D',
    customerName: 'Dr. apt. Maya Novita',
    customerCompany: 'PT Kalbe Farma Tbk',
    customerPhone: '0812-1122-3377',
    customerEmail: 'maya.novita@kalbe.co.id',
    customerAddress: 'Jl. Letjen Suprapto No. 4, Cempaka Putih, Jakarta Pusat',
    category: 'Kalibrasi & Pengujian',
    serviceObjectName: 'Mettler Toledo XPR Microbalance 0.001 mg',
    serviceObjectIdentifier: 'MT-XPR-2025-1044',
    priority: 'Sedang',
    status: 'Diserahkan / Lunas',
    createdAt: '2026-08-17 09:00',
    scheduledDate: '2026-08-18',
    scheduledTime: '10:00',
    completionDate: '2026-08-18 14:30',
    assignedTechnicianId: 'TECH-05',
    technicianName: 'Siti Rahmawati',
    estimatedHours: 3.0,
    actualHours: 2.8,
    laborRate: 1800000,
    serviceDescription: 'Kalibrasi tahunan standar ISO/IEC 17025 menggunakan anak timbangan E2 bersertifikat resmi KAN. Verifikasi repeatability, linearity, dan corner load error.',
    partsUsed: [
      { id: 'P-601', name: 'Sertifikat Kalibrasi Terakreditasi KAN & Label Hologram', quantity: 1, unitCost: 350000 }
    ],
    totalPartsCost: 350000,
    totalLaborCost: 1800000,
    dpAmount: 0,
    grandTotal: 2150000,
    paymentStatus: 'Lunas',
    warrantyPeriod: '365 Hari (1 Tahun Kalibrasi)',
    slaDeadline: '2026-08-18 17:00',
    customerSatisfaction: 5,
    logs: [
      { id: 'L-1', timestamp: '2026-08-18 10:00', author: 'Siti Rahmawati', action: 'Pengerjaan Kalibrasi', notes: 'Pengkondisian suhu lab pada 20°C ± 0.5°C selama 1 jam.' },
      { id: 'L-2', timestamp: '2026-08-18 14:30', author: 'Siti Rahmawati', action: 'Selesai & Diserahkan', notes: 'Nilai ketidakpastian pengukuran U = 0.004 mg (memenuhi toleransi USP).' }
    ]
  },
  {
    id: 'SPK-2026-0807',
    title: 'Instalasi & Setting Unit Baru Pompa Booster Grundfos Hydro MPC',
    customerName: 'Ferry Gunawan',
    customerCompany: 'Apartemen Sudirman Suites',
    customerPhone: '0818-0909-1234',
    customerEmail: 'building.mgr@sudirmansuites.com',
    customerAddress: 'Jl. Jend. Sudirman Kav. 36-38, Jakarta Pusat',
    category: 'Instalasi & Commissioning',
    serviceObjectName: 'Grundfos Hydro MPC-E 3 CR 15-7 Pump Skid',
    serviceObjectIdentifier: 'GRF-MPC-2026-550',
    priority: 'Tinggi',
    status: 'Antrean',
    createdAt: '2026-08-20 07:00',
    scheduledDate: '2026-08-22',
    scheduledTime: '08:00',
    assignedTechnicianId: 'TECH-01',
    technicianName: 'Budi Hartono, S.T.',
    estimatedHours: 6.0,
    laborRate: 2500000,
    serviceDescription: 'Pemasangan unit booster pompa air bersih baru gedung 30 lantai, pengkabelan control unit CU 352, setting pressure transmitter 8.5 bar, dan uji hydro test pipa manifold.',
    partsUsed: [
      { id: 'P-701', name: 'Flexible Joint Rubber Flange DN80 JIS 10K', quantity: 3, unitCost: 650000 },
      { id: 'P-702', name: 'Danfoss Pressure Transmitter MBS 3000 (0-16 Bar)', quantity: 2, unitCost: 1450000 },
      { id: 'P-703', name: 'Pipa Seamless Sch40 Fitting & Gasket Kit', quantity: 1, unitCost: 1200000 }
    ],
    totalPartsCost: 6050000,
    totalLaborCost: 2500000,
    dpAmount: 0,
    grandTotal: 8550000,
    paymentStatus: 'Belum Bayar',
    warrantyPeriod: '1 Tahun Garansi Instalasi',
    slaDeadline: '2026-08-22 17:00',
    logs: [
      { id: 'L-1', timestamp: '2026-08-20 07:00', author: 'Admin Kontrak Jasa', action: 'Draft SPK Diterbitkan', notes: 'Menunggu persetujuan Purchase Order dari manajemen gedung.' }
    ]
  },
  {
    id: 'SPK-2026-0803',
    title: 'Splicing 48 Core OTB Datacenter & Uji Redaman OTDR',
    customerName: 'Diana Lestari',
    customerCompany: 'PT Telco Nusa Solusindo',
    customerPhone: '0813-8877-6655',
    customerEmail: 'diana.lestari@telconusa.id',
    customerAddress: 'APL Tower Podomoro City Lt. 28, Tanjung Duren, Jakarta Barat',
    category: 'Instalasi & Commissioning',
    serviceObjectName: 'Optical Termination Box 48 Port Rackmount',
    serviceObjectIdentifier: 'OTB-FO-2026-044',
    priority: 'Sedang',
    status: 'Pengecekan & Estimasi',
    createdAt: '2026-08-20 08:00',
    scheduledDate: '2026-08-21',
    scheduledTime: '10:00',
    assignedTechnicianId: 'TECH-03',
    technicianName: 'Rian Pratama, A.Md.',
    estimatedHours: 3.5,
    laborRate: 1000000,
    serviceDescription: 'Penyambungan jalur backbone baru ke rack server F-09. Memerlukan laporan loss decibel resmi untuk sertifikasi SLA 99.98%.',
    partsUsed: [
      { id: 'P-301', name: 'Pigtail SC/UPC SM 0.9mm (Pack 12pcs)', quantity: 4, unitCost: 180000 },
      { id: 'P-302', name: 'Protection Sleeve Fiber 60mm (Pack 50pcs)', quantity: 1, unitCost: 65000 },
      { id: 'P-303', name: 'Adapter SC Simplex Coupler (Pack 12pcs)', quantity: 4, unitCost: 95000 }
    ],
    totalPartsCost: 1165000,
    totalLaborCost: 1000000,
    dpAmount: 0,
    grandTotal: 2165000,
    paymentStatus: 'Sebagian (DP)',
    warrantyPeriod: '180 Hari',
    slaDeadline: '2026-08-21 16:00',
    logs: [
      { id: 'L-1', timestamp: '2026-08-20 08:00', author: 'Project Coordinator', action: 'Jadwal Ditetapkan', notes: 'Izin masuk gedung loading dock telah diterbitkan.' }
    ]
  }
];

export const INITIAL_STATS: ServiceStats = {
  totalOrders: 128,
  activeOrders: 14,
  completedThisMonth: 114,
  totalRevenueMonth: 284500000,
  slaComplianceRate: 97.4,
  averageCsat: 4.88,
  urgentTickets: 3,
  technicianUtilizationRate: 88.5
};

export const REVENUE_MONTHLY_CHART_DATA = [
  { month: 'Mar', revenue: 198000000, laborCost: 78000000, completed: 88, target: 190000000 },
  { month: 'Apr', revenue: 215000000, laborCost: 85000000, completed: 96, target: 200000000 },
  { month: 'Mei', revenue: 232000000, laborCost: 92000000, completed: 104, target: 210000000 },
  { month: 'Jun', revenue: 248000000, laborCost: 99000000, completed: 108, target: 225000000 },
  { month: 'Jul', revenue: 265000000, laborCost: 106000000, completed: 112, target: 240000000 },
  { month: 'Agu', revenue: 284500000, laborCost: 114000000, completed: 114, target: 260000000 }
];

export const CATEGORY_DISTRIBUTION_DATA = [
  { name: 'Pemeliharaan Berkala', value: 42, color: '#2563eb' },
  { name: 'Perbaikan & Troubleshooting', value: 28, color: '#dc2626' },
  { name: 'Instalasi & Commissioning', value: 16, color: '#16a34a' },
  { name: 'Kalibrasi & Audit Teknis', value: 14, color: '#d97706' }
];

export function formatRupiah(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount || 0);
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function formatNumberInput(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseNumberInput(value: string | number | undefined | null): number {
  if (!value) return 0;
  const digits = String(value).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export const INITIAL_INVOICES: JasaInvoice[] = [
  {
    id: 'INV-JASA-2026001',
    workOrderId: 'SPK-2026-0801',
    customerId: 'CUST-01',
    customerName: 'Ir. Handoko Prasetyo',
    customerCompany: 'PT Sinarmas Mega Properti',
    issueDate: '2026-08-20',
    dueDate: '2026-09-03',
    totalAmount: 3800000,
    paidAmount: 1500000,
    status: 'Dibayar Sebagian',
    items: [
      { description: 'Biaya Jasa Teknisi & Diagnosa', quantity: 1, unitPrice: 750000, total: 750000 },
      { description: 'Electronic Expansion Valve Coil Daikin', quantity: 1, unitPrice: 1450000, total: 1450000 },
      { description: 'Refrigerant R410A Dupont (1 Silinder)', quantity: 1, unitPrice: 1250000, total: 1250000 },
      { description: 'Nitrogen Flushing & Pressure Test', quantity: 1, unitPrice: 350000, total: 350000 }
    ],
    payments: [
      { id: 'PAY-1001', date: '2026-08-20', amount: 1500000, method: 'Transfer Bank BCA', reference: 'TRF/0820/9991' }
    ],
    notes: 'Terima kasih atas kepercayaan Anda.'
  },
  {
    id: 'INV-JASA-2026002',
    workOrderId: 'SPK-2026-0804',
    customerId: 'CUST-04',
    customerName: 'Kusuma Wardhana',
    customerCompany: 'PT Indofood CBP Sukses Makmur Tbk',
    issueDate: '2026-08-19',
    dueDate: '2026-09-02',
    totalAmount: 3200000,
    paidAmount: 3200000,
    status: 'Lunas',
    items: [
      { description: 'Jasa Audit Termografi & Kualitas Daya', quantity: 1, unitPrice: 2800000, total: 2800000 },
      { description: 'Dokumen Sertifikat Hasil Uji', quantity: 1, unitPrice: 400000, total: 400000 }
    ],
    payments: [
      { id: 'PAY-1002', date: '2026-08-21', amount: 3200000, method: 'Transfer Bank Mandiri', reference: 'TRF/0821/7772' }
    ]
  },
  {
    id: 'INV-JASA-2026003',
    workOrderId: 'SPK-2026-0802',
    customerId: 'CUST-02',
    customerName: 'Bambang Sudiro',
    customerCompany: 'RS Graha Medika Internasional',
    issueDate: '2026-08-20',
    dueDate: '2026-09-20',
    totalAmount: 9300000,
    paidAmount: 0,
    status: 'Belum Dibayar',
    items: [
      { description: 'Jasa Servis Preventif Genset', quantity: 1, unitPrice: 1200000, total: 1200000 },
      { description: 'Oli Mesin Meditran SX SAE 15W-40', quantity: 2, unitPrice: 1100000, total: 2200000 },
      { description: 'Filter Oli Perkins Original 2654403', quantity: 2, unitPrice: 450000, total: 900000 },
      { description: 'Filter Solar Racor Separator 1000FH', quantity: 2, unitPrice: 650000, total: 1300000 },
      { description: 'Battery Aki Genset 12V 100Ah Yuasa', quantity: 2, unitPrice: 1850000, total: 3700000 }
    ],
    payments: [],
    notes: 'Pembayaran maksimal 30 hari kalender (Net 30).'
  }
];

export const INITIAL_EXPENSES: JasaExpense[] = [
  {
    id: 'EXP-JASA-2026001',
    type: 'Pengeluaran',
    date: '2026-08-18',
    category: 'Belanja Suku Cadang (Parts)',
    description: 'Pembelian Freon R410A dan Pipa Tembaga Daikin (Untuk SPK-2026-0801)',
    amount: 1750000,
    referenceSpkId: 'SPK-2026-0801',
    recordedBy: 'Admin Jasa',
    notes: 'Nota pembelian dari Toko Aneka Teknik terlampir.',
    status: 'Selesai'
  },
  {
    id: 'EXP-JASA-2026002',
    type: 'Pengeluaran',
    date: '2026-08-19',
    category: 'Transportasi & Akomodasi',
    description: 'Bensin & Tol Operasional Teknisi (Tim A - Budi Hartono)',
    amount: 350000,
    recordedBy: 'Admin Jasa',
    status: 'Selesai'
  },
  {
    id: 'EXP-JASA-2026003',
    type: 'Pengeluaran',
    date: '2026-08-20',
    category: 'Peralatan Kerja',
    description: 'Penggantian Mata Bor SDS & Tang Krimping Fiber Optic',
    amount: 850000,
    recordedBy: 'Admin Jasa',
    notes: 'Peralatan sebelumnya rusak akibat pemakaian berat.',
    status: 'Selesai'
  },
  {
    id: 'EXP-JASA-2026004',
    type: 'Pengeluaran',
    date: '2026-08-21',
    category: 'Sewa Alat Khusus',
    description: 'Sewa Scaffolding 3 Set untuk Pemasangan OTB di Ketinggian (Untuk SPK-2026-0803)',
    amount: 450000,
    referenceSpkId: 'SPK-2026-0803',
    recordedBy: 'Admin Jasa',
    status: 'Selesai'
  },
  {
    id: 'INC-JASA-2026005',
    type: 'Pemasukan',
    date: '2026-08-22',
    category: 'Pendapatan Jasa',
    description: 'DP Proyek Instalasi Jaringan B2B',
    amount: 5000000,
    recordedBy: 'Admin Jasa',
    status: 'Selesai'
  }
];

export const generateMockData = (businessType: string) => {
  let catalog: ServiceCatalogItem[] = [];
  let technicians: Technician[] = [];
  let workOrders: WorkOrder[] = [];
  
  if (businessType.includes('Laundry')) {
    catalog = [
      { id: 'CAT-L-01', name: 'Cuci Kering Standar', category: 'Layanan Utama', basePrice: 15000, estimatedDurationMinutes: 1440, isActive: true },
      { id: 'CAT-L-02', name: 'Setrika Express', category: 'Layanan Cepat', basePrice: 20000, estimatedDurationMinutes: 120, isActive: true },
      { id: 'CAT-L-03', name: 'Cuci Sepatu Premium', category: 'Perawatan Khusus', basePrice: 35000, estimatedDurationMinutes: 2880, isActive: true }
    ];
    technicians = [
      { id: 'TECH-L-01', name: 'Ibu Ratna', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', specialty: 'Ahli Cuci & Setrika', phone: '0811223344', email: 'ratna@laundry.id', rating: 4.8, completedJobs: 300, currentStatus: 'Tersedia', skills: ['Setrika Uap'], certifications: [] }
    ];
    workOrders = [
      {
        id: 'SPK-L-001', title: 'Cuci Selimut Tebal', customerName: 'Bpk. Surya', customerCompany: '-', customerPhone: '08123', customerEmail: '', customerAddress: 'Jl. Mawar', category: 'Layanan Utama' as any, serviceObjectName: 'Selimut', priority: 'Sedang', status: 'Antrean', createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0], scheduledTime: '09:00', assignedTechnicianId: 'TECH-L-01', technicianName: 'Ibu Ratna', estimatedHours: 24, laborRate: 15000, serviceDescription: 'Cuci selimut tebal', partsUsed: [], totalPartsCost: 0, totalLaborCost: 15000
      }
    ];
  } else if (businessType.includes('Salon')) {
    catalog = [
      { id: 'CAT-S-01', name: 'Potong Rambut Pria', category: 'Haircut', basePrice: 50000, estimatedDurationMinutes: 45, isActive: true },
      { id: 'CAT-S-02', name: 'Creambath Spa', category: 'Treatment', basePrice: 120000, estimatedDurationMinutes: 90, isActive: true },
      { id: 'CAT-S-03', name: 'Smoothing / Rebonding', category: 'Styling', basePrice: 350000, estimatedDurationMinutes: 180, isActive: true }
    ];
    technicians = [
      { id: 'TECH-S-01', name: 'Siska Beauty', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', specialty: 'Hair Stylist', phone: '0899887766', email: 'siska@salon.id', rating: 4.9, completedJobs: 450, currentStatus: 'Tersedia', skills: ['Coloring', 'Styling'], certifications: ['Certified MUA'] }
    ];
    workOrders = [
      {
        id: 'SPK-S-001', title: 'Paket Creambath', customerName: 'Ibu Rina', customerCompany: '-', customerPhone: '08123', customerEmail: '', customerAddress: 'Jl. Melati', category: 'Treatment' as any, serviceObjectName: 'Rambut', priority: 'Sedang', status: 'Antrean', createdAt: new Date().toISOString(), scheduledDate: new Date().toISOString().split('T')[0], scheduledTime: '10:00', assignedTechnicianId: 'TECH-S-01', technicianName: 'Siska Beauty', estimatedHours: 1.5, laborRate: 120000, serviceDescription: 'Creambath lidah buaya', partsUsed: [], totalPartsCost: 0, totalLaborCost: 120000
      }
    ];
  } else {
    // Default fallback to INITIAL_... (Bengkel/Servis)
    catalog = [...INITIAL_SERVICE_CATALOG];
    technicians = [...INITIAL_TECHNICIANS];
    workOrders = [...INITIAL_WORK_ORDERS];
  }
  
  return { catalog, technicians, workOrders };
};
