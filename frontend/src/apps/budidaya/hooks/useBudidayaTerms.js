import { useAuth } from '../../../contexts/AuthContext'

export function useBudidayaTerms() {
  const { user } = useAuth()
  const isTanaman = user?.business_category === 'Budidaya Tanaman'

  if (isTanaman) {
    return {
      isTanaman: true,
      unit: 'Lahan',
      unitLower: 'lahan',
      unitCode: 'Kode lahan',
      unitName: 'Nama lahan',
      newUnit: 'Lahan Baru',
      addUnit: 'Tambah Lahan',
      registerUnit: 'Daftarkan Lahan',
      typeUnit: 'Jenis lahan',
      types: [
        ['tanah', 'Tanah'],
        ['bedengan', 'Bedengan'],
        ['polybag', 'Polybag'],
        ['hidroponik', 'Hidroponik']
      ],
      selectUnit: 'Pilih Unit Lahan (Tersedia)',
      noUnitEmpty: '* Tidak ada unit lahan kosong tersedia saat ini.',
      seedTypeLabel: 'Jenis / Varietas Benih',
      seedCountLabel: 'Jumlah Tanam (Batang)',
      seedCountLabelShort: 'Jumlah Tanam',
      seedDateLabel: 'Tanggal Tanam',
      startCycleLabel: 'Mulai Siklus (Tanam)',
      startCycleAction: 'Mulai Tanam',
      emptyCyclesDesc: 'Tanam benih/bibit di lahan yang kosong untuk memulai monitoring',
      phLabel: 'pH Tanah',
      tempLabel: 'Suhu Udara',
      o2Label: 'Kelembaban Tanah',
      feedLabel: 'Pupuk/Nutrisi',
      feedLabelShort: 'Pupuk',
      feedUnit: 'Nutrisi',
      healthLabel: 'Kesehatan',
      populationLabel: 'Kapasitas (batang)',
      populationCount: 'batang',
      populationCountTitle: 'Populasi',
      growthLabel: 'Grafik pertumbuhan tanaman',
      growthSub: 'Kenaikan tinggi rata-rata (cm) per minggu',
      iconMain: 'grass',
      iconFeed: 'eco',
      iconSeed: 'spa',
      iconCycle: 'nature',
      iconUnitDefault: 'yard',
      // Inventory categories
      inventoryCategories: ['Semua', 'Pupuk', 'Benih', 'Pestisida', 'Peralatan', 'Lainnya'],
      defaultInventoryCategory: 'pupuk',
      emptyInventoryDesc: 'Mulai tambahkan pupuk atau benih ke gudang Anda.',
      stockReceiveNote: 'Pupuk/nutrisi masuk',
      stockNotePlaceholder: 'Contoh: Pembelian pupuk baru, Pemupukan harian',
      // Stats:
      statsTodayFeed: 'TOTAL NUTRISI HARI INI',
      statsTemp: 'SUHU UDARA',
      statsO2: 'KELEMBABAN TANAH',
      statsPH: 'RATA-RATA PH TANAH',
      statsTodayFeedVal: '12.4 L',
      statsTempVal: '26.4°C',
      statsO2Val: '65%',
      statsPHVal: '6.2',
      // Dashboard items
      totalUnitsLabel: 'Total lahan',
      warningLabel: 'Kelembaban Rendah (Lahan B3)',
      nextFeedLabel: 'Jadwal pemupukan berikutnya',
      nextFeedDetail: 'Nutrisi A cair – 45 Menit lagi',
      tempAvgLabel: 'Suhu udara rata-rata',
      idealConditionLabel: 'Kondisi Ideal untuk Cabai',
      // Mock cards
      mockA1Title: 'Lahan A1 - Pembesaran Cabai',
      mockA1Details: 'Usia: 45 Hari | Populasi: 2000 Batang',
      mockB3Title: 'Lahan B3 - Semai Melon',
      mockB3Details: 'Usia: 12 Hari | Populasi: 500 Batang',
      mockB3Warning: 'Kelembaban Tanah Rendah',
      mockKPIs: [
        { label: 'PH', val: '6.2' },
        { label: 'KELEMBABAN', val: '65%' },
        { label: 'SUHU', val: '26.5°C' }
      ],
      mockB3KPIs: [
        { label: 'PH', val: '5.8' },
        { label: 'KELEMBABAN', val: '32%', alert: true },
        { label: 'SUHU', val: '28.2°C' }
      ]
    }
  }

  const isAyam = user?.email?.includes('ayam')
  const isSapi = user?.email?.includes('sapi')
  const isHewanDarat = isAyam || isSapi

  if (isHewanDarat) {
    return {
      isTanaman: false,
      unit: 'Kandang',
      unitLower: 'kandang',
      unitCode: 'Kode kandang',
      unitName: 'Nama kandang',
      newUnit: 'Kandang Baru',
      addUnit: 'Tambah Kandang',
      registerUnit: 'Daftarkan Kandang',
      typeUnit: 'Jenis kandang',
      types: isAyam ? [
        ['baterai', 'Baterai'],
        ['postal', 'Postal'],
        ['panggung', 'Panggung']
      ] : [
        ['terbuka', 'Terbuka'],
        ['tertutup', 'Tertutup'],
        ['semi', 'Semi Terbuka']
      ],
      selectUnit: 'Pilih Unit Kandang (Tersedia)',
      noUnitEmpty: '* Tidak ada unit kandang kosong tersedia saat ini.',
      seedTypeLabel: 'Jenis / Varietas',
      seedCountLabel: 'Jumlah Masuk (Ekor)',
      seedCountLabelShort: 'Jumlah Masuk',
      seedDateLabel: 'Tanggal Masuk',
      startCycleLabel: 'Mulai Siklus (Masuk Kandang)',
      startCycleAction: 'Mulai Ternak',
      emptyCyclesDesc: 'Masukkan hewan ternak ke kandang yang kosong untuk memulai monitoring',
      phLabel: 'Suhu Kandang',
      tempLabel: 'Kelembaban',
      o2Label: 'Sirkulasi Udara',
      feedLabel: 'Pakan',
      feedLabelShort: 'Pakan',
      feedUnit: 'Pakan',
      healthLabel: 'Kesehatan',
      populationLabel: 'Kapasitas (ekor)',
      populationCount: 'ekor',
      populationCountTitle: 'Populasi',
      growthLabel: 'Grafik pertumbuhan',
      growthSub: 'Kenaikan berat rata-rata per minggu',
      iconMain: 'pets',
      iconFeed: 'restaurant',
      iconSeed: 'egg',
      iconCycle: 'inventory',
      iconUnitDefault: 'home_work',
      inventoryCategories: ['Semua', 'Pakan', 'Bibit', 'Obat', 'Peralatan', 'Lainnya'],
      defaultInventoryCategory: 'pakan',
      emptyInventoryDesc: 'Mulai tambahkan pakan atau peralatan ke gudang Anda.',
      stockReceiveNote: 'Penerimaan barang',
      stockNotePlaceholder: 'Contoh: Pembelian baru, Pakan harian',
      statsTodayFeed: 'TOTAL PAKAN HARI INI',
      statsActiveUnit: 'KANDANG AKTIF',
      statsPop: 'TOTAL POPULASI',
      statsHarvest: 'PANEN BULAN INI',
      btnDetailCycle: 'Detail Siklus',
      btnEditCycle: 'Edit Siklus',
      modalNewUnitTitle: 'Tambah Kandang Baru',
      toastUnitSaved: 'Kandang berhasil disimpan',
      toastUnitDeleted: 'Kandang dihapus',
      unitTabActive: 'Aktif',
      unitTabEmpty: 'Kosong',
      unitTabAll: 'Semua',
      titleUnitMgmt: 'Manajemen Kandang',
      subUnitMgmt: 'Kelola data kandang dan kapasitas maksimal',
      statsTemp: 'SUHU UDARA',
      statsO2: 'KELEMBABAN',
      statsPH: 'SIRKULASI',
      statsTodayFeedVal: '124.5 kg',
      statsTempVal: '28.4°C',
      statsO2Val: '65 %',
      statsPHVal: 'Normal',
      totalUnitsLabel: 'Total kandang',
      warningLabel: 'Kondisi Hewan Sakit (Kandang B3)',
      nextFeedLabel: 'Jadwal pakan berikutnya',
      nextFeedDetail: 'Pakan Utama – 45 Menit lagi',
      tempAvgLabel: 'Suhu kandang rata-rata',
      idealConditionLabel: 'Kondisi Ideal',
      mockA1Title: 'Kandang A1 - Pembesaran',
      mockA1Details: 'Usia: 45 Hari | Populasi: 2000 Ekor',
      mockB3Title: 'Kandang B3 - Bibit Baru',
      mockB3Details: 'Usia: 12 Hari | Populasi: 500 Ekor',
      mockB3Warning: 'Kondisi Hewan Sakit',
      mockKPIs: [
        { label: 'SUHU', val: '28°C' },
        { label: 'LEMBAB', val: '65%' },
        { label: 'AMONIAK', val: 'Aman' }
      ],
      mockB3KPIs: [
        { label: 'SUHU', val: '31°C', alert: true },
        { label: 'LEMBAB', val: '80%', alert: true },
        { label: 'AMONIAK', val: 'Tinggi' }
      ]
    }
  }

  // Budidaya Hewan Air (default ikan)
  return {
    isTanaman: false,
    unit: 'Kolam',
    unitLower: 'kolam',
    unitCode: 'Kode kolam',
    unitName: 'Nama kolam',
    newUnit: 'Kolam Baru',
    addUnit: 'Tambah Kolam',
    registerUnit: 'Daftarkan Kolam',
    typeUnit: 'Jenis kolam',
    types: [
      ['tanah', 'Tanah'],
      ['beton', 'Beton'],
      ['terpal', 'Terpal']
    ],
    selectUnit: 'Pilih Unit Kolam (Tersedia)',
    noUnitEmpty: '* Tidak ada unit kolam kosong tersedia saat ini.',
    seedTypeLabel: 'Jenis / Varietas Benih',
    seedCountLabel: 'Jumlah Tebar (Ekor)',
    seedCountLabelShort: 'Jumlah Tebar',
    seedDateLabel: 'Tanggal Tebar',
    startCycleLabel: 'Mulai Siklus (Tebar)',
    startCycleAction: 'Mulai Budidaya',
    emptyCyclesDesc: 'Tebar benih di kolam yang kosong untuk memulai monitoring',
    phLabel: 'Tingkat pH',
    tempLabel: 'Suhu',
    o2Label: 'Oksigen Terlarut',
    feedLabel: 'Pakan',
    feedLabelShort: 'Pakan',
    feedUnit: 'Pakan',
    healthLabel: 'Kesehatan',
    populationLabel: 'Kapasitas (ekor)',
    populationCount: 'ekor',
    populationCountTitle: 'Populasi',
    growthLabel: 'Grafik pertumbuhan ikan',
    growthSub: 'Kenaikan berat rata-rata (gram) per minggu',
    iconMain: 'waves',
    iconFeed: 'restaurant',
    iconSeed: 'water_drop',
    iconCycle: 'set_meal',
    iconUnitDefault: 'water',
    // Inventory categories
    inventoryCategories: ['Semua', 'Pakan', 'Bibit', 'Obat', 'Peralatan', 'Lainnya'],
    defaultInventoryCategory: 'pakan',
    emptyInventoryDesc: 'Mulai tambahkan pakan atau peralatan ke gudang Anda.',
    stockReceiveNote: 'Penerimaan barang',
    stockNotePlaceholder: 'Contoh: Pembelian baru, Pakan harian',
    // Stats:
    statsTodayFeed: 'TOTAL PAKAN HARI INI',
    statsTemp: 'SUHU AIR',
    statsO2: 'OKSIGEN TERLARUT',
    statsPH: 'RATA-RATA PH',
    statsTodayFeedVal: '124.5 kg',
    statsTempVal: '28.4°C',
    statsO2Val: '6.5 mg/L',
    statsPHVal: '7.2',
    // Dashboard items
    totalUnitsLabel: 'Total kolam',
    warningLabel: 'Kadar Oksigen Rendah (Kolam B3)',
    nextFeedLabel: 'Jadwal pakan berikutnya',
    nextFeedDetail: 'Pakan Protein Tinggi – 45 Menit lagi',
    tempAvgLabel: 'Suhu air rata-rata',
    idealConditionLabel: 'Kondisi Ideal untuk Nila',
    // Mock cards
    mockA1Title: 'Kolam A1 - Pembesaran Nila',
    mockA1Details: 'Usia: 45 Hari | Populasi: 2000 Ekor',
    mockB3Title: 'Kolam B3 - Pemijahan Gurame',
    mockB3Details: 'Usia: 12 Hari | Populasi: 500 Ekor',
    mockB3Warning: 'Kadar Oksigen Rendah',
    mockKPIs: [
      { label: 'PH', val: '7.2' },
      { label: 'O2', val: '6.5 mg/L' },
      { label: 'AMONIAK', val: '0.01 ppm' }
    ],
    mockB3KPIs: [
      { label: 'PH', val: '6.8' },
      { label: 'O2', val: '3.2 mg/L', alert: true },
      { label: 'AMONIAK', val: '0.05 ppm' }
    ]
  }
}
