export type PriorityLevel = 'Darurat' | 'Tinggi' | 'Sedang' | 'Rendah';

export type ServiceStatus = 
  | 'Antrean'
  | 'Pengecekan & Estimasi'
  | 'Menunggu Persetujuan'
  | 'Sedang Dikerjakan'
  | 'Menunggu Sparepart'
  | 'Selesai & Siap Diambil'
  | 'Diserahkan / Lunas'
  | 'Dibatalkan';

export type TechnicianStatus = 'Tersedia' | 'Bertugas' | 'Izin / Cuti' | 'Siaga';

export type ServiceCategory = 
  | 'Pemeliharaan Berkala (Preventive)'
  | 'Perbaikan & Troubleshooting (Corrective)'
  | 'Instalasi & Commissioning'
  | 'Kalibrasi & Pengujian'
  | 'Konsultasi & Audit Teknis'
  | 'Upgrade & Modifikasi';

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
  completedJobs: number;
  currentStatus: TechnicianStatus;
  activeWorkOrderId?: string;
  skills: string[];
  certifications: string[];
}

export interface ServiceItemRequirement {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface WorkOrderLog {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  notes: string;
}

export interface WorkOrder {
  id: string; // e.g., SPK-2026-0842
  title: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  category: ServiceCategory;
  serviceObjectName: string; // Generic replacement for equipmentName
  serviceObjectIdentifier?: string; // Generic replacement for serialNumber
  priority: PriorityLevel;
  status: ServiceStatus;
  createdAt: string;
  scheduledDate: string;
  scheduledTime: string;
  completionDate?: string;
  assignedTechnicianId: string;
  technicianName: string;
  estimatedHours: number;
  actualHours?: number;
  laborRate: number;
  serviceDescription: string;
  rootCauseNotes?: string;
  partsUsed: ServiceItemRequirement[];
  totalPartsCost: number;
  totalLaborCost: number;
  dpAmount?: number; // Down Payment
  grandTotal: number;
  paymentStatus: 'Lunas' | 'Sebagian (DP)' | 'Belum Bayar';
  warrantyPeriod: string;
  slaDeadline: string;
  customerSatisfaction?: number; // 1-5
  logs: WorkOrderLog[];
}

export interface ServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  estimatedDurationHours: number;
  warrantyDays: number;
  requiredSkillLevel: 'Junior' | 'Madya' | 'Senior' | 'Spesialis Ahli';
  recommendedParts: string[];
  activeOrdersCount: number;
}

export interface AIDiagnosisResult {
  diagnosis: string;
  estimatedHours: number;
  complexity: string;
  recommendedParts: { name: string; estimatedCost: number }[];
  estimatedLaborCost: number;
  suggestedTechnicianSkills: string[];
  safetyPrecautions: string[];
  quotationSummary: string;
  isAiGenerated?: boolean;
}

export interface ServiceStats {
  totalOrders: number;
  activeOrders: number;
  completedThisMonth: number;
  totalRevenueMonth: number;
  slaComplianceRate: number;
  averageCsat: number;
  urgentTickets: number;
  technicianUtilizationRate: number;
}

export type ContractFrequency = 
  | 'Bulanan'
  | '2 Bulan Sekali'
  | 'Kuartalan'
  | '6 Bulan Sekali'
  | 'Tahunan';

export type ContractStatus = 
  | 'Aktif'
  | 'Segera Berakhir'
  | 'Berakhir'
  | 'Ditangguhkan';

export interface JasaContract {
  id: string;
  contractNumber: string;
  title: string;
  clientCompany: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  serviceCategory: ServiceCategory;
  equipmentList: string[];
  startDate: string;
  endDate: string;
  frequency: ContractFrequency;
  totalVisitsQuota: number;
  completedVisitsCount: number;
  nextScheduleDate: string;
  contractValue: number;
  assignedTechnicianId?: string;
  technicianName?: string;
  status: ContractStatus;
  slaNotes?: string;
  daysUntilExpiration?: number;
}

export type InvoiceStatus = 'Belum Dibayar' | 'Dibayar Sebagian' | 'Lunas' | 'Jatuh Tempo' | 'Dibatalkan';

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}

export interface JasaInvoice {
  id: string; // e.g., INV-JASA-2026001
  workOrderId: string;
  customerId: string;
  customerName: string;
  customerCompany?: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  payments: PaymentTransaction[];
  notes?: string;
}

export type ExpenseCategory = 
  | 'Belanja Suku Cadang (Parts)'
  | 'Transportasi & Akomodasi'
  | 'Peralatan Kerja'
  | 'Sewa Alat Khusus'
  | 'Biaya Operasional'
  | 'Lain-lain';

export interface JasaExpense {
  id: string; // e.g., EXP-2026001
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  workOrderId?: string; // Optional: Link to specific project/SPK
  recordedBy: string;
  receiptUrl?: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Selesai';
}

export interface JasaSparepart {
  id: number;
  tenant_id: string;
  item_code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  min_stock_alert: number;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  description: string;
  type: 'Pemasukan' | 'Pengeluaran';
  category: 'Service' | 'Material' | 'Operasional' | 'Gaji' | 'Lainnya';
  amount: number;
  reference: string;
}

export interface JasaSetting {
  id?: number;
  businessType: string;
  termTechnician: string;
  termSparepart: string;
  termSpk: string;
  documentPrefix: string;
}
