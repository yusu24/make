export type ActiveTab =
  | 'menu-utama'
  | 'pesanan'
  | 'katalog'
  | 'katalog-kategori'
  | 'katalog-satuan'
  | 'katalog-batch'
  | 'katalog-serial'
  | 'katalog-label'
  | 'katalog-diskon'
  | 'katalog-harga'
  | 'gudang'
  | 'gudang-multi'
  | 'penerimaan-barang'
  | 'gudang-po'
  | 'gudang-mutasi'
  | 'gudang-transfer'
  | 'gudang-retur-supplier'
  | 'stock-opname'
  | 'toko-offline'
  | 'transaksi-riwayat'
  | 'transaksi-shift'
  | 'transaksi-retur-pelanggan'
  | 'crm-supplier'
  | 'crm-cabang'
  | 'pelanggan'
  | 'keuangan-pengeluaran'
  | 'keuangan-pemasukan'
  | 'keuangan-kas'
  | 'keuangan-laporan'
  | 'keuangan-laba-rugi'
  | 'keuangan-hutang'
  | 'keuangan-piutang'
  | 'keuangan-mutasi'
  | 'keuangan-arus-kas'
  | 'keuangan-pajak'
  | 'keuangan-kategori'
  | 'laporan-penjualan'
  | 'laporan-produk'
  | 'laporan-margin'
  | 'laporan-pelanggan'
  | 'laporan-konsinyasi'
  | 'laporan-shift'
  | 'laporan-pembayaran'
  | 'master-data'
  | 'settings-app'
  | 'settings-account'
  | 'settings-roles'
  | 'settings-users'
  | 'settings-store'
  | 'marketplace-dashboard'
  | 'marketplace-connected'
  | 'marketplace-mapping'
  | 'marketplace-sync'
  | 'marketplace-history'
  | 'shipping-dashboard'
  | 'shipping-management'
  | 'shipping-packing'
  | 'notification-center'
  | 'panduan'
  | 'developer-api'
  | 'langganan'
  | 'support'
  | 'backup';

export type MarketplacePlatform = 'Shopee' | 'Tokopedia' | 'TikTok Shop' | 'Lazada' | 'Blibli' | 'Manual/Offline';

export interface StoreChannel {
  id: string;
  name: string;
  platform: MarketplacePlatform;
  storeCode: string;
  connected: boolean;
  avatarUrl?: string;
  lastSyncAt: string;
  totalOrdersToday: number;
  revenueToday: number;
  pendingEscrow: number;
}

export type ExpenseCategory =
  | 'Iklan & Marketing'
  | 'Biaya Admin Marketplace'
  | 'Packing & Bahan'
  | 'Gaji & Operasional'
  | 'Logistik & Ongkir'
  | 'Sewa & Utilitas'
  | 'Lain-lain';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  storeId?: string;
  storeName?: string;
  paymentMethod: string;
  proofUrl?: string;
  createdByName: string;
}

export interface Income {
  id: string;
  date: string;
  category: 'Klaim Retur/Hilang' | 'Cashback Platform' | 'Komisi Affiliate' | 'Penjualan Offline' | 'Lain-lain';
  description: string;
  amount: number;
  storeName: string;
}

export type OrderStatus = 'Perlu Diproses' | 'Dalam Pengiriman' | 'Selesai' | 'Dibatalkan/Retur';

export interface OrderItem {
  productId?: string;
  sku: string;
  productName: string;
  variant?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  platform: MarketplacePlatform;
  storeName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discounts: number;
  platformFee: number;
  totalAmount: number;
  courier: string;
  trackingNumber?: string;
  paymentMethod: string;
  isPrintedAWB?: boolean;
}

export interface ProductVariant {
  id: string;
  variantName: string;
  sku: string;
  hpp: number;
  priceShopee: number;
  priceTokopedia: number;
  priceTiktok: number;
  priceLazada: number;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId: string;
  unit: string;
  image: string;
  rawImageUrl: string | null;
  hpp: number; // Harga Pokok Penjualan
  priceOffline: number;
  priceShopee: number;
  priceTokopedia: number;
  priceTiktok: number;
  priceLazada: number;
  totalStock: number;
  stockMin: number;
  warehouseStock: { [warehouseId: string]: number };
  variants?: ProductVariant[];
  status: 'Aktif' | 'Stok Menipis' | 'Habis';
  connectedChannels: MarketplacePlatform[];
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  picName: string;
  picPhone: string;
  totalSKUs: number;
  totalItems: number;
  isDefault?: boolean;
}

export interface StockMovement {
  id: string;
  date: string;
  sku: string;
  productName: string;
  warehouseName: string;
  type: 'Masuk' | 'Keluar' | 'Opname Adjust';
  qty: number;
  notes: string;
  user: string;
}

export interface CashSummaryItem {
  id: string;
  platform: MarketplacePlatform;
  storeName: string;
  readyBalance: number;
  pendingEscrow: number;
  nextSettlementDate: string;
  bankAccount: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  categories: string[];
}

export interface MarketplaceAccount {
  id: string;
  platform: MarketplacePlatform;
  shopName: string;
  shopId: string;
  status: 'Connected' | 'Disconnected' | 'Token Expired';
  lastSync: string;
  autoSync: boolean;
  errorLog?: string;
}

export interface ProductMapping {
  id: string;
  localProductId: string;
  localSku: string;
  localProductName: string;
  marketplacePlatform: MarketplacePlatform;
  marketplaceProductId: string;
  marketplaceSku: string;
  status: 'Connected' | 'Not Connected' | 'Conflict';
  lastSync: string;
}

export interface SyncHistory {
  id: string;
  marketplacePlatform: MarketplacePlatform;
  syncType: 'Products' | 'Stock' | 'Price' | 'Orders';
  timestamp: string;
  durationStr: string;
  status: 'Success' | 'Failed' | 'Partial';
  totalData: number;
  successCount: number;
  failedCount: number;
  logDetails?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  courier: string;
  trackingNumber: string;
  status: 'Pending Packing' | 'Ready Pickup' | 'Shipping Today' | 'Delayed Shipment' | 'Return Today' | 'Completed';
  pickupSchedule?: string;
  shippingLabelUrl?: string;
}

export interface NotificationItem {
  id: string;
  type: 'Sync Failed' | 'Token Expired' | 'Mapping Failed' | 'Stock Conflict' | 'Price Conflict' | 'Low Stock';
  message: string;
  createdAt: string;
  isRead: boolean;
}
