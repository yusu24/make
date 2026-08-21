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
  RefreshCw 
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { KpiCards } from './components/KpiCards';
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
import { PrintSpkModal } from './components/PrintSpkModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { SettingsView } from './components/SettingsView';
import { Toast, ToastMessage } from './components/Toast';
import { jasaApi } from './services/jasaApi';

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
  'contracts': '/jasa/contracts',
  'technicians': '/jasa/technicians',
  'catalog': '/jasa/catalog',
  'inventory': '/jasa/inventory',
  'finance': '/jasa/finance',
  'expenses': '/jasa/expenses',
  'analytics': '/jasa/analytics',
  'settings': '/jasa/settings',
};

const getTabFromPath = (pathname: string): string => {
  if (pathname.includes('/jasa/work-orders') || pathname.includes('/jasa/spk')) return 'work-orders';
  if (pathname.includes('/jasa/contracts')) return 'contracts';
  if (pathname.includes('/jasa/technicians')) return 'technicians';
  if (pathname.includes('/jasa/catalog')) return 'catalog';
  if (pathname.includes('/jasa/inventory')) return 'inventory';
  if (pathname.includes('/jasa/finance')) return 'finance';
  if (pathname.includes('/jasa/expenses')) return 'expenses';
  if (pathname.includes('/jasa/analytics')) return 'analytics';
  if (pathname.includes('/jasa/settings')) return 'settings';
  return 'overview';
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Helper: Tab title lookup
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview': return 'Beranda Operasional';
      case 'work-orders': return 'Surat Perintah Kerja (SPK)';
      case 'contracts': return 'Jadwal Reservasi / Kontrak';
      case 'technicians': return 'Manajemen Tim & Pekerja Lapangan';
      case 'catalog': return 'Katalog Layanan & Tarif Jasa';
      case 'inventory': return 'Stok Gudang & Material';
      case 'finance': return 'Tagihan Masuk (Piutang)';
      case 'expenses': return 'Catatan Pengeluaran (Beban)';
      case 'analytics': return 'Analitik Operasional & Kepatuhan SLA';
      case 'settings': return 'Pengaturan Modul Jasa';
      default: return 'Modul Layanan Jasa';
    }
  };

  // Core Domain Entities State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [contracts, setContracts] = useState<JasaContract[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>(INITIAL_SERVICE_CATALOG);
  const [invoices, setInvoices] = useState<JasaInvoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<JasaExpense[]>(INITIAL_EXPENSES);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState(INITIAL_STATS);
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
      const [ordersRes, contractsRes, techsRes, catalogRes, statsRes, inventoryRes, settingsRes] = await Promise.allSettled([
        jasaApi.getWorkOrders(),
        jasaApi.getContracts(),
        jasaApi.getTechnicians(),
        jasaApi.getServices(),
        jasaApi.getStats(),
        jasaApi.getInventory(),
        jasaApi.getSettings()
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value && ordersRes.value.length > 0) {
        setWorkOrders(ordersRes.value);
      }
      if (contractsRes.status === 'fulfilled' && contractsRes.value && contractsRes.value.length > 0) {
        setContracts(contractsRes.value);
      }
      if (techsRes.status === 'fulfilled' && techsRes.value && techsRes.value.length > 0) {
        setTechnicians(techsRes.value);
      }
      if (catalogRes.status === 'fulfilled' && catalogRes.value && catalogRes.value.length > 0) {
        setCatalog(catalogRes.value);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(prev => ({ ...prev, ...statsRes.value }));
      }
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value) {
        setInventory(inventoryRes.value);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setJasaSettings(settingsRes.value);
      }
    } catch (err) {
      console.warn('Koneksi backend jasa: Menggunakan fallback dataset lokal.', err);
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
    addToast('success', 'Diagnosa AI Diterapkan', 'Formulir SPK telah diisi dengan rekomendasi AI.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* Dedicated Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewSpk={() => setShowNewSpkModal(true)}
        onOpenAiAssistant={() => setShowAiModal(true)}
        urgentCount={urgentOrders.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        totalOrders={workOrders.length}
        availableTechsCount={technicians.filter(t => t.currentStatus === 'Tersedia').length}
      />

      {/* Main Content Area (offset by sidebar width on lg) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Streamlined Top Bar */}
        <TopBar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
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
        />

        {/* Main View Container (with spacious padding below fixed navtop) */}
        <main className="flex-1 w-full mx-auto px-3 sm:px-5 lg:px-6 pt-[124px] pb-8 sm:pt-[92px] sm:pb-10">
          
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
          <div className="space-y-4">
            
            {/* Top Bento KPI Metric Cards */}
            <KpiCards
              stats={stats}
              onFilterUrgent={() => {
                setPriorityFilter('Darurat');
                setActiveTab('work-orders');
              }}
              onFilterActive={() => {
                setStatusFilter('Sedang Dikerjakan');
                setActiveTab('work-orders');
              }}
            />

            {/* Bento Grid Layout Section (as in Bento Design HTML) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Bento Card 1: Distribusi Layanan (Large 2 Cols) */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Analitik Aktivitas</span>
                    <h3 className="font-semibold text-slate-900 text-base tracking-tight mt-0.5">Distribusi Beban Servis</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Minggu Ini
                    </span>
                  </div>
                </div>

                {/* Simulated Weekly Bento Bars */}
                <div className="h-36 flex items-end justify-between gap-2.5 sm:gap-3 pt-2 pb-1">
                  {[
                    { day: 'Sen', pct: 80, count: 14 },
                    { day: 'Sel', pct: 60, count: 11 },
                    { day: 'Rab', pct: 95, count: 18 },
                    { day: 'Kam', pct: 45, count: 8 },
                    { day: 'Jum', pct: 88, count: 16 },
                    { day: 'Sab', pct: 55, count: 10 },
                    { day: 'Min', pct: 30, count: 5 }
                  ].map((bar, idx) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[9px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.count} SPK
                      </div>
                      <div className="w-full bg-slate-100 rounded-xl h-full relative overflow-hidden flex items-end">
                        <div 
                          className="w-full bg-blue-600 group-hover:bg-blue-500 rounded-xl transition-all duration-500" 
                          style={{ height: `${bar.pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Rata-rata: <strong className="text-slate-800 font-semibold">12.4 SPK / hari</strong></span>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Laporan Lengkap →
                  </button>
                </div>
              </div>

              {/* Bento Card 2: Pemesanan & SPK Terkini (2 Cols) */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="flex justify-between items-center mb-3 shrink-0">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pekerjaan Berjalan</span>
                    <h3 className="font-semibold text-slate-900 text-base tracking-tight mt-0.5">Pemesanan Terkini</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('work-orders')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Lihat Semua ({workOrders.length})
                  </button>
                </div>

                <div className="space-y-2.5 flex-1 overflow-hidden">
                  {workOrders
                    .filter(o => o.status !== 'Dibatalkan')
                    .slice(0, 3)
                    .map((order) => {
                      const initial = order.category.includes('Preventive') ? 'PM' : 
                                      order.category.includes('Corrective') ? 'CR' : 
                                      order.category.includes('Instalasi') ? 'IN' : 'SV';
                      
                      const badgeColor = order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                         order.status === 'Sedang Dikerjakan' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                         order.status === 'Menunggu Sparepart' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                         'bg-slate-100 text-slate-700 border-slate-200';

                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-xs shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                {order.title}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                {order.customerCompany} • {order.technicianName}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`px-2 py-0.5 text-[9px] font-semibold rounded border uppercase tracking-wider ${badgeColor}`}>
                              {order.status === 'Sedang Dikerjakan' ? 'PROSES' : 
                               order.status === 'Selesai' ? 'SELESAI' : 
                               order.status === 'Menunggu Sparepart' ? 'SPAREPART' : 'ANTREAN'}
                            </span>
                            <div className="text-[10.5px] font-semibold text-slate-700 mt-0.5">
                              {formatRupiah(order.grandTotal)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Bento Card 3: Tim Teknisi & Kapasitas Lapangan (Full 2 Cols Dark Bento) */}
              <div className="lg:col-span-2 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Manajemen Personel</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {technicians.filter(t => t.currentStatus === 'Bertugas').length} Teknisi Lapangan Aktif
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-lg tracking-tight">Kesiapan Tim Teknisi</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {technicians.length} Teknisi bersertifikasi siap tugas menyebar di wilayah operasional.
                  </p>
                </div>

                <div className="relative z-10 my-3">
                  <div className="flex justify-between items-end mb-1 text-xs">
                    <span className="font-semibold text-slate-300 text-[11px]">Kapasitas Pemanfaatan Tim</span>
                    <span className="font-semibold text-white text-sm">84% <span className="text-[10px] text-slate-400 font-normal">(12/15 Sibuk)</span></span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[84%] rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 pt-2.5 border-t border-slate-800">
                  <div className="flex -space-x-2">
                    {technicians.slice(0, 4).map((t, idx) => (
                      <img
                        key={t.id}
                        src={t.avatar}
                        alt={t.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] text-white font-semibold">
                      +{technicians.length - 4}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('technicians')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
                  >
                    Kelola Jadwal →
                  </button>
                </div>

                {/* Subtle visual glow */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
              </div>

              {/* Bento Card 4: AI & Quick Action Hub (2 Cols) */}
              <div className="lg:col-span-2 bg-gradient-to-br from-amber-500/10 via-white to-blue-500/10 border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      AI Diagnostic Engine
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                    Estimasi Kerusakan & Suku Cadang Cepat
                  </h3>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                    Gunakan kecerdasan buatan untuk menganalisis keluhan mesin, mengkalkulasi durasi jam kerja teknisi, serta merumuskan kebutuhan suku cadang.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="p-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Mulai Diagnosa AI</span>
                  </button>

                  <button
                    onClick={() => setShowNewSpkModal(true)}
                    className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Terbitkan SPK</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* View 2: SPK & Perintah Kerja */}
        {activeTab === 'work-orders' && (
          <WorkOrdersView
            workOrders={workOrders}
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
          />
        )}

        {/* View 6: Keuangan & Tagihan */}
        {activeTab === 'finance' && (
          <FinanceView
            invoices={invoices}
            onUpdateInvoiceStatus={(id, status) => {
              setInvoices(prev => prev.map(inv => 
                inv.id === id ? { ...inv, status, paidAmount: status === 'Lunas' ? inv.totalAmount : inv.paidAmount } : inv
              ));
              if (selectedInvoice?.id === id) {
                setSelectedInvoice(prev => prev ? { ...prev, status, paidAmount: status === 'Lunas' ? prev.totalAmount : prev.paidAmount } : prev);
              }
              addToast('success', 'Status Tagihan Diperbarui', `Tagihan ${id} telah diperbarui menjadi ${status}.`);
            }}
            onViewInvoice={(invoice) => setSelectedInvoice(invoice)}
          />
        )}

        {/* View 7: Catatan Pengeluaran */}
        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onAddExpense={(expense) => {
              const newExp: JasaExpense = {
                ...expense,
                id: `EXP-JASA-${Date.now()}`
              };
              setExpenses(prev => [newExp, ...prev]);
              addToast('success', 'Pengeluaran Dicatat', 'Beban pengeluaran berhasil disimpan.');
            }}
          />
        )}

        {/* View 8: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={jasaSettings}
            onRefresh={() => loadAllDataFromDatabase(true)}
            onLoadDummyData={handleLoadDummyData}
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

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
