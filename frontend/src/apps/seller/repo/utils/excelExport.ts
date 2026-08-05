// Helper utility for Excel/CSV exports and template downloads in Seller Module

export const exportToCsv = (
  filename: string,
  headers: string[],
  rows: (string | number | boolean | undefined | null)[][]
) => {
  const escapeCell = (cell: string | number | boolean | undefined | null) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\r\n');

  // \uFEFF BOM forces Microsoft Excel & Google Sheets to open UTF-8 CSV with proper column separation
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadProductImportTemplate = () => {
  const headers = ['SKU', 'Nama_Produk', 'Kategori', 'Harga_Beli_HPP', 'Harga_Jual', 'Stok_Awal', 'Satuan'];
  const sampleRows = [
    ['TSHIRT-001', 'Kaos Polos Cotton 30S Hitam L', 'Pakaian Pria', 35000, 75000, 50, 'Pcs'],
    ['HOODIE-002', 'Hoodie Fleece Oversize Grey XL', 'Pakaian Pria', 85000, 165000, 30, 'Pcs'],
    ['SHOES-003', 'Sepatu Sneakers Casual White 42', 'Sepatu', 120000, 245000, 25, 'Pasang'],
    ['BAG-004', 'Tas Ransel Laptop Canvas Waterproof', 'Aksesoris', 75000, 149000, 40, 'Pcs'],
  ];
  exportToCsv('Template_Import_Produk_Bizora_Seller', headers, sampleRows);
};
