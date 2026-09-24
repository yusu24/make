/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, 
  Wrench, 
  ClipboardList, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink, 
  Plus, 
  RefreshCw,
  Search,
  Eye,
  Printer 
} from '@/constants/icons';
import { Sidebar, hasJasaPermission } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { KpiCards } from './components/KpiCards';
import { OverviewDashboard } from './components/OverviewDashboard';
import { WorkOrdersView } from './components/WorkOrdersView';
import { WorkOrderDetailModal } from './components/WorkOrderDetailModal';
import { NewWorkOrderModal } from './components/NewWorkOrderModal';
import { TechniciansView } from './components/TechniciansView';
import { ServiceCatalogView } from './components/ServiceCatalogView';
import { InventoryView } from './components/InventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { ContractsView } from './components/ContractsView';
import { FinanceView } from './components/FinanceView';
import { ExpensesView } from './components/ExpensesView';
import { AiDiagnosticsModal } from './components/AiDiagnosticsModal';
import { JasaAiFab } from './components/JasaAiFab';
import { JasaMobileBottomNav } from './components/JasaMobileBottomNav';
import { JasaMobileBottomSheet } from './components/JasaMobileBottomSheet';
import { PrintSpkModal } from './components/PrintSpkModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { DirectPosView } from './components/DirectPosView';
import '../jasa.css';
import { SettingsView } from './components/SettingsView';
import { JasaRolesView } from './components/JasaRolesView';
import { JasaStaffView } from './components/JasaStaffView';
import { JasaProfileView } from './components/JasaProfileView';
import { BackupView } from './components/BackupView';
import { GuideView } from './components/GuideView';
import { SubscriptionView } from './components/SubscriptionView';
import { Toast, ToastMessage } from './components/Toast';
import { jasaApi } from './services/jasaApi';
import { JasaProvider, useJasa } from './contexts/JasaContext';
import { useAuth } from '../../../contexts/AuthContext';
import { JasaCategoryPickerModal } from './components/JasaCategoryPickerModal';

import { TenantDeveloperPortal } from '../../../components/TenantDeveloperPortal';
import { 
  INITIAL_WORK_ORDERS, 
  INITIAL_TECHNICIANS, 
  INITIAL_SERVICE_CATALOG, 
  INITIAL_STATS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  formatRupiah,
  generateMockData
} from './data/mockData';
import { 
  WorkOrder, 
  Technician, 
  ServiceCatalogItem, 
  ServiceStatus, 
  PriorityLevel, 
  TechnicianStatus,
  ServiceCategory,
  JasaContract,
  JasaInvoice,
  InvoiceStatus,
  JasaExpense
} from './types';

const TAB_TO_PATH: Record<string, string> = {
  'overview': '/jasa/dashboard',
  'work-orders': '/jasa/work-orders',
  'pos': '/jasa/pos',
  'contracts': '/jasa/contracts',
  'technicians': '/jasa/technicians',
  'catalog': '/jasa/catalog',
  'inventory': '/jasa/inventory',
  'finance-summary': '/jasa/finance-summary',
  'finance-expenses': '/jasa/expenses',
  'finance-invoices': '/jasa/invoices',
  'finance-payables': '/jasa/payables',
  'finance-accounts': '/jasa/accounts',
  'analytics': '/jasa/analytics',
  'guide': '/jasa/guide',
  'developer-api': '/jasa/developer-api',
  'backup': '/jasa/backup',
  'subscription': '/jasa/subscription',
  'settings': '/jasa/settings',
  'roles': '/jasa/roles',
  'staff': '/jasa/staff',
  'profile': '/jasa/profile',
};

const getTabFromPath = (pathname: string): string => {
  if (pathname.includes('/jasa/profile')) return 'profile';
  if (pathname.includes('/jasa/work-orders') || pathname.includes('/jasa/spk')) return 'work-orders';
  if (pathname.includes('/jasa/pos')) return 'pos';
  if (pathname.includes('/jasa/contracts')) return 'contracts';
  if (pathname.includes('/jasa/technicians')) return 'technicians';
  if (pathname.includes('/jasa/catalog')) return 'catalog';
  if (pathname.includes('/jasa/inventory')) return 'inventory';
  if (pathname.includes('/jasa/finance-summary') || pathname === '/jasa/finance') return 'finance-summary';
  if (pathname.includes('/jasa/expenses')) return 'finance-expenses';
  if (pathname.includes('/jasa/invoices')) return 'finance-invoices';
  if (pathname.includes('/jasa/payables')) return 'finance-payables';
  if (pathname.includes('/jasa/accounts')) return 'finance-accounts';
  if (pathname.includes('/jasa/analytics')) return 'analytics';
  if (pathname.includes('/jasa/guide')) return 'guide';
  if (pathname.includes('/jasa/developer-api') || pathname.includes('/jasa/api')) return 'developer-api';
  if (pathname.includes('/jasa/backup')) return 'backup';
  if (pathname.includes('/jasa/subscription')) return 'subscription';
  if (pathname.includes('/jasa/roles')) return 'roles';
  if (pathname.includes('/jasa/staff')) return 'staff';
  if (pathname.includes('/jasa/settings')) return 'settings';
  return 'overview';
};

const TAB_PERMISSIONS: Record<string, string | string[]> = {
  pos: 'pos_checkout',
  contracts: 'contracts_manage',
  technicians: 'technicians_manage',
  catalog: 'catalog_manage',
  inventory: ['inventory_view', 'inventory_manage'],
  'finance-summary': 'finance_view',
  'finance-expenses': 'finance_expenses',
  'finance-invoices': 'pos_invoices',
  'finance-payables': 'finance_expenses',
  'finance-accounts': 'finance_accounts',
  finance: 'finance_view',
  expenses: 'finance_expenses',
  analytics: 'finance_view',
  settings: 'staff_manage',
  roles: 'staff_manage',
  staff: 'staff_manage',
  backup: 'staff_manage',
  'developer-api': 'staff_manage',
  subscription: 'staff_manage',
};

function JasaInnerApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { terms } = useJasa();
  const { user } = useAuth();

  const isDemoAccount = user?.email?.startsWith('demo-') || user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-');

  // Navigation & View State (synced with React Router URL)
  const activeTab = getTabFromPath(location.pathname);
  
  // Dummy Data Generator
  const handleLoadDummyData = (businessType: string) => {
    const newData = generateMockData(businessType);
    setCatalog(newData.catalog);
    setTechnicians(newData.technicians);
    setWorkOrders(newData.workOrders);
    addToast('success', 'Data Contoh', `Data contoh untuk tema ${businessType} berhasil dimuat.`);
  };

  const setActiveTab = (tabId: string) => {
    const targetPath = TAB_TO_PATH[tabId] || '/jasa/dashboard';
    navigate(targetPath);
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsBottomSheetOpen(false);
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Helper: Tab title lookup (strictly aligned with Sidebar.tsx labels)
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview': return 'Dashboard';
      case 'pos': return 'Kasir (POS)';
      case 'work-orders': return terms.workOrdersLabel || 'Daftar SPK';
      case 'contracts': return 'Jadwal & Kontrak';
      case 'technicians': return terms.techniciansLabel || 'Tim & Teknisi';
      case 'catalog': return 'Katalog Layanan';
      case 'inventory': return terms.sparepartsLabel || 'Stok & Material';
      case 'finance-summary': return 'Laba Rugi';
      case 'finance-expenses': return 'Buku Kas';
      case 'finance-invoices': return 'Tagihan & Piutang';
      case 'finance-payables': return 'Hutang Vendor';
      case 'finance-accounts': return 'Rekening & Bank';
      case 'analytics': return 'Laporan & SLA';
      case 'settings': return 'Pengaturan Jasa';
      case 'roles': return 'Role & Hak Akses';
      case 'staff': return 'Staf & Operator';
      case 'backup': return 'Backup Data';
      case 'developer-api': return 'Integrasi API';
      case 'profile': return 'Profil Pengguna';
      case 'guide': return 'Buku Panduan';
      case 'subscription': return 'Paket Langganan';
      default: return 'Dashboard';
    }
  };

  // Dynamically update browser tab title
  useEffect(() => {
    const title = getTabTitle(activeTab);
    document.title = title ? `Bizora - ${title}` : 'Bizora - Sistem Manajemen Jasa & Reparasi';
  }, [activeTab, terms]);

  // Core Domain Entities State (Empty by default for fresh registered users)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => isDemoAccount ? INITIAL_WORK_ORDERS : []);
  const [contracts, setContracts] = useState<JasaContract[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>(() => isDemoAccount ? INITIAL_TECHNICIANS : []);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>(() => isDemoAccount ? INITIAL_SERVICE_CATALOG : []);
  const [invoices, setInvoices] = useState<JasaInvoice[]>(() => isDemoAccount ? INITIAL_INVOICES : []);
  const [expenses, setExpenses] = useState<JasaExpense[]>(() => isDemoAccount ? INITIAL_EXPENSES : []);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState(() => isDemoAccount ? INITIAL_STATS : {
    activeOrders: 0,
    completedThisMonth: 0,
    availableTechs: 0,
    totalRevenueMonth: 0,
    slaComplianceRate: 100,
    totalContracts: 0
  });
  const [jasaSettings, setJasaSettings] = useState<any>({
    businessType: 'Bengkel / Servis',
    termTechnician: 'Teknisi',
    termSparepart: 'Sparepart',
    termSpk: 'SPK',
    documentPrefix: 'SRV'
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load live data from Backend API Database
  const loadAllDataFromDatabase = async (silent = false) => {
    if (!silent) setIsLoadingData(true);
    setIsSyncing(true);
    try {
      const [ordersRes, contractsRes, techsRes, catalogRes, statsRes, inventoryRes, settingsRes, invoicesRes, expensesRes] = await Promise.allSettled([
        jasaApi.getWorkOrders(),
        jasaApi.getContracts(),
        jasaApi.getTechnicians(),
        jasaApi.getServices(),
        jasaApi.getStats(),
        jasaApi.getInventory(),
        jasaApi.getSettings(),
        jasaApi.getInvoices(),
        jasaApi.getExpenses()
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const val = ordersRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setWorkOrders(val);
        }
      }
      if (contractsRes.status === 'fulfilled' && contractsRes.value) {
        const val = contractsRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setContracts(val);
        }
      }
      if (techsRes.status === 'fulfilled' && techsRes.value) {
        const val = techsRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setTechnicians(val);
        }
      }
      if (catalogRes.status === 'fulfilled' && catalogRes.value) {
        const val = catalogRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setCatalog(val);
        }
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(prev => ({ ...prev, ...statsRes.value }));
      }
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value) {
        const val = inventoryRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setInventory(val);
        }
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setJasaSettings(settingsRes.value);
      }
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value) {
        const val = invoicesRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setInvoices(val);
        }
      }
      if (expensesRes.status === 'fulfilled' && expensesRes.value) {
        const val = expensesRes.value;
        if (!isDemoAccount || (Array.isArray(val) && val.length > 0)) {
          setExpenses(val.map((e: any) => ({
            id: e.expenseNumber || `EXP-${e.id}`,
            type: e.type || 'Pengeluaran',
            date: e.date || new Date().toISOString(),
            category: e.category || 'Biaya Operasional',
            description: e.description || '',
            amount: Number(e.amount || 0),
            referenceSpkId: e.referenceSpkId || '',
            recordedBy: e.recordedBy || 'Admin Jasa',
            notes: '',
            status: e.status || 'Selesai'
          })));
        }
      }
    } catch (err) {
      console.warn('Koneksi backend jasa:', err);
    } finally {
      setIsLoadingData(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAllDataFromDatabase();
  }, []);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'Semua'>('Semua');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'Semua'>('Semua');

  // Modals State
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [printingOrder, setPrintingOrder] = useState<WorkOrder | null>(null);
  const [showNewSpkModal, setShowNewSpkModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  
  // Invoice Detail Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<JasaInvoice | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Urgent Orders Count
  const urgentOrders = workOrders.filter(o => o.priority === 'Darurat' && o.status !== 'Selesai' && o.status !== 'Dibatalkan');

  // Handler: Update Work Order
  const handleUpdateWorkOrder = async (updated: WorkOrder) => {
    const oldOrder = workOrders.find(o => o.id === updated.id);
    
    setWorkOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setSelectedOrder(updated);

    try {
      await jasaApi.updateWorkOrderStatus(updated.id, updated.status);
    } catch (err) {
      console.warn('Saved status locally:', err);
    }

    // Handle Customer Satisfaction (Rating) Update
    if (updated.customerSatisfaction && (!oldOrder || oldOrder.customerSatisfaction !== updated.customerSatisfaction)) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === updated.assignedTechnicianId) {
          const newRating = (t.rating * t.completedJobs + updated.customerSatisfaction!) / (t.completedJobs + 1);
          return {
            ...t,
            rating: Number(newRating.toFixed(2))
          };
        }
        return t;
      }));
    }

    // Update technician active order if status changed to completed
    if (updated.status === 'Selesai & Siap Diambil' || updated.status === 'Diserahkan / Lunas') {
      setTechnicians(prev => prev.map(t => {
        if (t.id === updated.assignedTechnicianId) {
          return {
            ...t,
            completedJobs: t.completedJobs + 1,
            currentStatus: 'Tersedia',
            activeWorkOrderId: undefined
          };
        }
        return t;
      }));

      setStats(prev => ({
        ...prev,
        completedThisMonth: prev.completedThisMonth + 1,
        activeOrders: Math.max(0, prev.activeOrders - 1),
        totalRevenueMonth: prev.totalRevenueMonth + updated.grandTotal
      }));

      addToast('success', 'SPK Selesai', `Pekerjaan ${updated.id} berhasil ditandai tuntas.`);
    } else {
      addToast('info', 'SPK Diperbarui', `Perubahan pada ${updated.id} berhasil disimpan.`);
    }

    loadAllDataFromDatabase(true);
  };

  // Handler: Quick Status Update
  const handleQuickUpdateStatus = async (orderId: string, newStatus: ServiceStatus) => {
    const order = workOrders.find(o => o.id === orderId);
    if (!order) return;

    const isCompleted = newStatus === 'Selesai & Siap Diambil' || newStatus === 'Diserahkan / Lunas';

    const updated: WorkOrder = {
      ...order,
      status: newStatus,
      completionDate: isCompleted ? new Date().toISOString().replace('T', ' ').slice(0, 16) : order.completionDate
    };

    await handleUpdateWorkOrder(updated);
  };

  // Handler: Create New Work Order
  const handleCreateWorkOrder = async (newOrder: WorkOrder) => {
    try {
      const saved = await jasaApi.createWorkOrder(newOrder);
      setWorkOrders(prev => [saved, ...prev]);
      addToast('success', 'SPK Diterbitkan', `Surat Perintah Kerja ${saved.id} berhasil disimpan ke database.`);
    } catch (err) {
      console.warn('Gagal menyimpan SPK ke backend, tersimpan lokal:', err);
      setWorkOrders(prev => [newOrder, ...prev]);
      addToast('success', 'SPK Diterbitkan', `Surat Perintah Kerja ${newOrder.id} berhasil dibuat.`);
    }

    setShowNewSpkModal(false);

    // Update technician status to on-duty
    setTechnicians(prev => prev.map(t => {
      if (t.id === newOrder.technicianId) {
        return {
          ...t,
          currentStatus: 'Bertugas',
          activeWorkOrderId: newOrder.id
        };
      }
      return t;
    }));

    setStats(prev => ({
      ...prev,
      totalOrders: prev.totalOrders + 1,
      activeOrders: prev.activeOrders + 1,
      urgentTickets: newOrder.priority === 'Darurat' ? prev.urgentTickets + 1 : prev.urgentTickets
    }));

    loadAllDataFromDatabase(true);
  };

  // Handler: Update Technician Status
  const handleUpdateTechnicianStatus = async (techId: string, newStatus: TechnicianStatus) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return { ...t, currentStatus: newStatus };
      }
      return t;
    }));
    const tech = technicians.find(t => t.id === techId);

    try {
      await jasaApi.updateTechnicianStatus(techId, newStatus);
      addToast('info', 'Status Teknisi', `Kesiapan ${tech?.name} tersimpan ke database.`);
    } catch (err) {
      console.warn('Technician status saved locally:', err);
      addToast('info', 'Status Teknisi', `Kesiapan ${tech?.name} diubah menjadi "${newStatus}".`);
    }
  };

  // Handler: Add Catalog Item
  const handleAddCatalogItem = async (newItem: ServiceCatalogItem) => {
    try {
      const saved = await jasaApi.createService(newItem);
      setCatalog(prev => [saved, ...prev]);
      addToast('success', 'Layanan Ditambahkan', `Paket layanan ${saved.name} tersimpan ke database.`);
    } catch (err) {
      console.warn('Catalog saved locally:', err);
      setCatalog(prev => [newItem, ...prev]);
      addToast('success', 'Layanan Ditambahkan', `Paket layanan ${newItem.name} berhasil disimpan ke katalog.`);
    }
    loadAllDataFromDatabase(true);
  };

  // Handler: Create B2B Contract
  const handleCreateContract = async (newContract: Partial<JasaContract>) => {
    try {
      const saved = await jasaApi.createContract(newContract);
      setContracts(prev => [saved, ...prev]);
      addToast('success', 'Kontrak Didaftarkan', `Kontrak kerja sama ${saved.contractNumber} (${saved.clientCompany}) berhasil disimpan.`);
    } catch (err) {
      console.warn('Gagal menyimpan kontrak ke backend, tersimpan lokal:', err);
      const fallbackContract: JasaContract = {
        id: `CTR-${Date.now()}`,
        contractNumber: newContract.contractNumber || `CTR-${Date.now()}`,
        title: newContract.title || '',
        clientCompany: newContract.clientCompany || '',
        clientName: newContract.clientName || '',
        clientPhone: newContract.clientPhone,
        clientEmail: newContract.clientEmail,
        clientAddress: newContract.clientAddress,
        serviceCategory: newContract.serviceCategory || 'Pemeliharaan Berkala (Preventive)',
        equipmentList: newContract.equipmentList || ['Unit Utama'],
        startDate: newContract.startDate || new Date().toISOString().slice(0, 10),
        endDate: newContract.endDate || new Date().toISOString().slice(0, 10),
        frequency: newContract.frequency || 'Bulanan',
        totalVisitsQuota: newContract.totalVisitsQuota || 12,
        completedVisitsCount: 0,
        nextScheduleDate: newContract.nextScheduleDate || new Date().toISOString().slice(0, 10),
        contractValue: newContract.contractValue || 0,
        status: 'Aktif',
        daysUntilExpiration: 365
      };
      setContracts(prev => [fallbackContract, ...prev]);
      addToast('success', 'Kontrak Didaftarkan', `Kontrak ${fallbackContract.contractNumber} berhasil dibuat.`);
    }
    loadAllDataFromDatabase(true);
  };

  // Handler: Generate SPK from Contract
  const handleGenerateSpkFromContract = async (contract: JasaContract) => {
    try {
      const res = await jasaApi.generateSpkFromContract(contract.id);
      if (res.workOrder) {
        setWorkOrders(prev => [res.workOrder, ...prev]);
      }
      if (res.contract) {
        setContracts(prev => prev.map(c => c.id === contract.id ? res.contract : c));
      }
      addToast('success', 'SPK Diterbitkan', `SPK ${res.workOrder.id} berhasil dibuat otomatis dari kontrak ${contract.contractNumber}.`);
    } catch (err) {
      console.warn('Generate SPK from contract fallback:', err);
      const spkId = `SPK-${Date.now()}`;
      const newSpk: WorkOrder = {
        id: spkId,
        title: `Pemeliharaan Rutin Kontrak [${contract.contractNumber}]: ${contract.title}`,
        customerName: contract.clientName,
        customerCompany: contract.clientCompany,
        customerPhone: contract.clientPhone || '',
        customerEmail: contract.clientEmail || '',
        customerAddress: contract.clientAddress || '',
        category: contract.serviceCategory,
        equipmentName: contract.equipmentList[0] || 'Perangkat Kontrak',
        priority: 'Sedang',
        status: 'Dijadwalkan',
        scheduledDate: contract.nextScheduleDate || new Date().toISOString().slice(0, 10),
        scheduledTime: '09:00 WIB',
        technicianId: contract.assignedTechnicianId || 'T-01',
        technicianName: contract.technicianName || 'Belum Ditugaskan',
        estimatedHours: 3,
        laborRate: 0,
        serviceDescription: `Pemeliharaan berkala terjadwal sesuai perjanjian kontrak ${contract.contractNumber}.`,
        partsReplaced: [],
        grandTotal: 0,
        paymentStatus: 'Lunas',
        warrantyPeriod: 'Sesuai Masa Kontrak',
        slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        logs: []
      };
      setWorkOrders(prev => [newSpk, ...prev]);
      setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, completedVisitsCount: c.completedVisitsCount + 1 } : c));
      addToast('success', 'SPK Diterbitkan', `SPK ${spkId} berhasil dibuat dari jadwal kontrak.`);
    }
    loadAllDataFromDatabase(true);
  };

  // Handler: Select Catalog for SPK
  const handleSelectCatalogForSpk = (item: ServiceCatalogItem) => {
    setShowNewSpkModal(true);
  };

  // Handler: Apply AI Estimation to new SPK
  const handleApplyAiToNewSpk = (data: {
    category: ServiceCategory;
    equipmentName: string;
    priority: PriorityLevel;
    estimatedHours: number;
    laborRate: number;
    description: string;
    recommendedParts: { name: string; estimatedCost: number }[];
  }) => {
    setShowAiModal(false);
    setShowNewSpkModal(true);
  };

  const [collapsed, setCollapsed] = useState(window.innerWidth < 1200);

  return (
    <div className="jasa-scope min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* Dedicated Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenNewSpk={() => setShowNewSpkModal(true)}
        onOpenAiAssistant={() => setShowAiModal(true)}
        urgentCount={urgentOrders.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        totalOrders={workOrders.length}
        availableTechsCount={technicians.filter(t => t.currentStatus === 'Tersedia').length}
      />

      {/* Main Content Area (offset by sidebar width on lg) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-72'}`}>
        
        {/* Streamlined Top Bar (hidden on full-screen POS register) */}
        {activeTab !== 'pos' && (
          <TopBar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            onOpenMobileSidebar={() => setIsBottomSheetOpen(true)}
            onOpenNewSpk={() => setShowNewSpkModal(true)}
            onOpenAiAssistant={() => setShowAiModal(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            urgentCount={urgentOrders.length}
            onFilterUrgent={() => {
              setPriorityFilter('Darurat');
              setStatusFilter('Semua');
              setActiveTab('work-orders');
            }}
            activeTabTitle={getTabTitle(activeTab)}
            activeTab={activeTab}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSettings={() => setActiveTab('settings')}
            onOpenSubscription={() => setActiveTab('subscription')}
            workOrders={workOrders}
            contracts={contracts}
            onSelectWorkOrder={(order) => setSelectedOrder(order)}
          />
        )}

        {/* Main View Container */}
        <main className={`flex-1 w-full min-w-0 ${activeTab === 'pos' ? 'p-0 h-[100dvh] overflow-hidden relative' : 'mx-auto px-3 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24 sm:pb-10'}`}>
          {TAB_PERMISSIONS[activeTab] && !hasJasaPermission(user, TAB_PERMISSIONS[activeTab]) ? (
            <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Akses Dibatasi</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Akun Anda ({user?.role || 'Operator'}) tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi pemilik usaha jika memerlukan hak akses ini.
              </p>
              <button
                onClick={() => setActiveTab('work-orders')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                Kembali ke Daftar SPK
              </button>
            </div>
          ) : (
            <>
              {/* Emergency Alert Banner */}
              {urgentOrders.length > 0 && activeTab === 'overview' && (
            <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-rose-50/90 via-white to-rose-50/90 border border-rose-200 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-600">Tiket Kritis</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600 text-white">
                      {urgentOrders.length} SPK Perlu Respon Cepat
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    Peringatan Tiket Darurat Berprioritas Tinggi (Urgent SLA)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Terdapat pekerjaan berprioritas darurat yang belum dituntaskan teknisi. Pastikan penanganan aktif.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <button
                  onClick={() => {
                    setPriorityFilter('Darurat');
                    setStatusFilter('Semua');
                    setActiveTab('work-orders');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-sm shadow-rose-600/25 whitespace-nowrap cursor-pointer"
                >
                  Tinjau Tiket Darurat →
                </button>
              </div>
            </div>
          )}

        {/* Dynamic Views */}
        {activeTab === 'overview' && (
          <OverviewDashboard
            stats={stats}
            workOrders={workOrders}
            technicians={technicians}
            onOpenNewSpk={() => setShowNewSpkModal(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectWorkOrder={(order) => setSelectedOrder(order)}
            onPrintWorkOrder={(order) => setPrintingOrder(order)}
            onFilterUrgent={() => {
              setPriorityFilter('Darurat');
              setActiveTab('work-orders');
            }}
            onFilterActive={() => {
              setStatusFilter('Sedang Dikerjakan');
              setActiveTab('work-orders');
            }}
          />
        )}

        {/* View 2: SPK & Perintah Kerja */}
        {activeTab === 'work-orders' && (
          <WorkOrdersView
            workOrders={workOrders}
            technicians={technicians}
            onSelectWorkOrder={(order) => setSelectedOrder(order)}
            onPrintWorkOrder={(order) => setPrintingOrder(order)}
            onOpenNewSpk={() => setShowNewSpkModal(true)}
            searchQuery={searchQuery}
            selectedStatusFilter={statusFilter}
            onStatusFilterChange={(st) => setStatusFilter(st)}
            selectedPriorityFilter={priorityFilter}
            onPriorityFilterChange={(p) => setPriorityFilter(p)}
            onQuickUpdateStatus={handleQuickUpdateStatus}
          />
        )}

        {/* View: Kasir POS Penjualan Langsung */}
        {activeTab === 'pos' && (
          <DirectPosView
            inventory={inventory}
            catalog={catalog}
            settings={jasaSettings}
            onMenuToggle={() => {
              if (window.innerWidth < 768) {
                setIsBottomSheetOpen(prev => !prev);
              } else {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              }
            }}
            onDeductInventory={(itemId, qty) => {
              setInventory((prev) =>
                prev.map((item) => {
                  if (String(item.id) === String(itemId) || String(item.part_number) === String(itemId)) {
                    const currentStock = item.stock_qty ?? item.quantity ?? 0;
                    return { ...item, stock_qty: Math.max(0, currentStock - qty), quantity: Math.max(0, currentStock - qty) };
                  }
                  return item;
                })
              );
            }}
            onAddToast={addToast}
          />
        )}

        {/* View: Kontrak Kerja Sama & Jadwal Servis B2B */}
        {activeTab === 'contracts' && (
          <ContractsView
            contracts={contracts}
            technicians={technicians}
            workOrders={workOrders}
            onCreateContract={handleCreateContract}
            onGenerateSpkFromContract={handleGenerateSpkFromContract}
            onSelectWorkOrder={(order) => setSelectedOrder(order)}
          />
        )}

        {/* View 3: Tim Teknisi */}
        {activeTab === 'technicians' && (
          <TechniciansView
            technicians={technicians}
            workOrders={workOrders}
            settings={jasaSettings}
            onUpdateStatus={handleUpdateTechnicianStatus}
            onSelectWorkOrder={(order) => setSelectedOrder(order)}
            onRefresh={() => loadAllDataFromDatabase(true)}
          />
        )}

        {/* View 4: Katalog Layanan & Tarif */}
        {activeTab === 'catalog' && (
          <ServiceCatalogView
            catalog={catalog}
            settings={jasaSettings}
            onRefresh={loadAllDataFromDatabase}
            onSelectCatalogForSpk={handleSelectCatalogForSpk}
          />
        )}

        {/* View: Gudang & Material */}
        {activeTab === 'inventory' && (
          <InventoryView 
            inventory={inventory}
            settings={jasaSettings}
            onRefresh={() => loadAllDataFromDatabase(true)}
          />
        )}

        {/* View 5: Analitik & SLA */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            technicians={technicians}
            invoices={invoices}
            expenses={expenses}
            workOrders={workOrders}
          />
        )}

        {/* View 6: Keuangan & Kas Sub-views */}
        {(activeTab === 'finance-summary' || activeTab === 'finance-expenses' || activeTab === 'finance-invoices' || activeTab === 'finance-payables' || activeTab === 'finance-accounts' || activeTab === 'finance' || activeTab === 'expenses') && (
          <FinanceView
            invoices={invoices}
            expenses={expenses}
            inventory={inventory}
            initialTab={
              activeTab === 'finance-summary' ? 'summary' :
              activeTab === 'finance-expenses' || activeTab === 'expenses' ? 'expenses' :
              activeTab === 'finance-invoices' ? 'invoices' :
              activeTab === 'finance-payables' ? 'payables' :
              activeTab === 'finance-accounts' ? 'accounts' :
              'summary'
            }
            onUpdateInvoiceStatus={async (id, status) => {
              setInvoices(prev => prev.map(inv => 
                inv.id === id ? { ...inv, status, paidAmount: status === 'Lunas' ? inv.totalAmount : inv.paidAmount } : inv
              ));
              if (selectedInvoice?.id === id) {
                setSelectedInvoice(prev => prev ? { ...prev, status, paidAmount: status === 'Lunas' ? prev.totalAmount : prev.paidAmount } : prev);
              }
              try {
                await jasaApi.updateInvoiceStatus(id, status);
              } catch (err) {
                console.warn('Updated status locally:', err);
              }
              addToast('success', 'Status Tagihan Diperbarui', `Tagihan ${id} telah diperbarui menjadi ${status}.`);
            }}
            onViewInvoice={(invoice) => setSelectedInvoice(invoice)}
            onAddExpense={async (expense) => {
              const tempId = `EXP-JASA-${Date.now()}`;
              const newExp: JasaExpense = {
                ...expense,
                id: tempId
              };
              setExpenses(prev => [newExp, ...prev]);

              try {
                const created = await jasaApi.storeExpense({
                  description: expense.description,
                  amount: expense.amount,
                  category: expense.category,
                  type: expense.type,
                  date: expense.date,
                  notes: expense.notes,
                  reference_spk_id: expense.referenceSpkId
                });
                if (created && (created.expenseNumber || created.id)) {
                  setExpenses(prev => prev.map(e => e.id === tempId ? {
                    ...e,
                    id: created.expenseNumber || String(created.id)
                  } : e));
                }
              } catch (err) {
                console.warn('Saved expense locally:', err);
              }

              addToast('success', 'Transaksi Kas Tersimpan', `${expense.type} sebesar ${formatRupiah(expense.amount)} berhasil dicatat.`);
            }}
          />
        )}

        {/* View 8: Backup & Data Security */}
        {activeTab === 'backup' && (
          <BackupView />
        )}

        {/* View 9: Buku Panduan & SOP Operasional */}
        {activeTab === 'guide' && (
          <GuideView 
            onNavigateTab={setActiveTab}
            onOpenNewSpk={() => setShowNewSpkModal(true)}
            onOpenAiModal={() => setShowAiModal(true)}
          />
        )}

        {/* View 10: Upgrade & Paket Langganan */}
        {activeTab === 'subscription' && (
          <SubscriptionView
            workOrdersCount={workOrders.length}
            techniciansCount={technicians.length}
            inventoryCount={inventory.length}
          />
        )}

        {/* View 11: Integrasi API & Webhooks */}
        {activeTab === 'developer-api' && (
          <TenantDeveloperPortal
            moduleName="Jasa & Servis"
            accentColor="indigo"
            subscriptionLink="/jasa/subscription"
          />
        )}

        {/* View 12: Roles & Permissions */}
        {activeTab === 'roles' && (
          <JasaRolesView
            onRefresh={() => loadAllDataFromDatabase(true)}
          />
        )}

        {/* View 13: Staff & Operator Accounts */}
        {activeTab === 'staff' && (
          <JasaStaffView
            technicians={technicians}
            onRefresh={() => loadAllDataFromDatabase(true)}
          />
        )}

        {/* View 14: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={jasaSettings}
            onRefresh={() => loadAllDataFromDatabase(true)}
            onLoadDummyData={handleLoadDummyData}
          />
        )}

        {/* View 15: Profile & Password */}
        {activeTab === 'profile' && (
          <JasaProfileView />
        )}
             </>
          )}

          {/* Mobile Bottom Clearance Spacer so bottom-most content is never covered by bottom nav */}
          {activeTab !== 'pos' && (
            <div
              className="md:hidden"
              style={{
                height: 'calc(110px + env(safe-area-inset-bottom, 16px))',
                width: '100%',
                pointerEvents: 'none',
                flexShrink: 0
              }}
              aria-hidden="true"
            />
          )}
      </main>

      </div>

      {/* Modals */}
      {selectedOrder && (
        <WorkOrderDetailModal
          order={selectedOrder}
          technicians={technicians}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={handleUpdateWorkOrder}
          onPrintOrder={(order) => setPrintingOrder(order)}
        />
      )}

      {showNewSpkModal && (
        <NewWorkOrderModal
          technicians={technicians}
          onClose={() => setShowNewSpkModal(false)}
          onSubmit={handleCreateWorkOrder}
          onOpenAiAssistant={() => {
            setShowNewSpkModal(false);
            setShowAiModal(true);
          }}
        />
      )}

      {showAiModal && (
        <AiDiagnosticsModal
          onClose={() => setShowAiModal(false)}
          onApplyToNewSpk={handleApplyAiToNewSpk}
        />
      )}

      {printingOrder && (
        <PrintSpkModal
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onAddPayment={(id, amount, method, ref) => {
            setInvoices(prev => prev.map(inv => {
              if (inv.id === id) {
                const newPayment = {
                  id: `TRX-${Date.now()}`,
                  date: new Date().toISOString().slice(0, 10),
                  amount,
                  method,
                  reference: ref
                };
                const newPaidAmount = inv.paidAmount + amount;
                const newStatus = newPaidAmount >= inv.totalAmount ? 'Lunas' : 'Dibayar Sebagian';
                
                const updatedInvoice = {
                  ...inv,
                  paidAmount: newPaidAmount,
                  status: newStatus as InvoiceStatus,
                  payments: [newPayment, ...inv.payments]
                };
                
                if (selectedInvoice?.id === id) setSelectedInvoice(updatedInvoice);
                return updatedInvoice;
              }
              return inv;
            }));
            addToast('success', 'Pembayaran Dicatat', `Pembayaran sebesar ${formatRupiah(amount)} berhasil disimpan.`);
          }}
          onUpdateStatus={(id, status) => {
            setInvoices(prev => prev.map(inv => 
              inv.id === id ? { ...inv, status, paidAmount: status === 'Lunas' ? inv.totalAmount : inv.paidAmount } : inv
            ));
            if (selectedInvoice?.id === id) {
              setSelectedInvoice(prev => prev ? { ...prev, status, paidAmount: status === 'Lunas' ? prev.totalAmount : prev.paidAmount } : prev);
            }
            addToast('success', 'Status Tagihan Diperbarui', `Tagihan ${id} telah diperbarui menjadi ${status}.`);
          }}
        />
      )}

      {/* Onboarding & Category Picker Modal */}
      <JasaCategoryPickerModal />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Floating AI Diagnostic Bubble */}
      <JasaAiFab
        onOpen={() => setShowAiModal(true)}
        isPosView={activeTab === 'pos'}
      />

      {/* Mobile Bottom Navigation & Slide-up Sheet */}
      <>
        {activeTab !== 'pos' && (
          <JasaMobileBottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onToggleMore={() => setIsBottomSheetOpen(prev => !prev)}
            isSheetOpen={isBottomSheetOpen}
          />
        )}
        <JasaMobileBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      </>

    </div>
  );
}

export default function App() {
  return (
    <JasaProvider>
      <JasaInnerApp />
    </JasaProvider>
  );
}

