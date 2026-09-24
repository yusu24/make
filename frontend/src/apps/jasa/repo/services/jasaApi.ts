import apiClient from '../../../../services/api';
import { WorkOrder, Technician, ServiceCatalogItem, JasaContract, JasaRole, JasaStaff, DEFAULT_JASA_ROLES } from '../types';

/**
 * Maps Backend WorkOrder (snake_case) to Frontend WorkOrder (camelCase)
 */
export const mapBackendWorkOrder = (item: any): WorkOrder => ({
  id: item.spk_number || (typeof item.id === 'string' ? item.id : `SPK-${item.id}`),
  title: item.title || '',
  customerName: item.customer_name || '',
  customerCompany: item.customer_company || '',
  customerPhone: item.customer_phone || '',
  customerEmail: item.customer_email || '',
  customerAddress: item.customer_address || '',
  category: item.category || 'Perbaikan & Troubleshooting (Corrective)',
  serviceObjectName: item.equipment_name || item.serviceObjectName || '',
  serviceObjectIdentifier: item.serial_number || item.serviceObjectIdentifier || '',
  priority: item.priority || 'Sedang',
  status: item.status || 'Menunggu Konfirmasi',
  createdAt: item.created_at || new Date().toISOString(),
  scheduledDate: item.scheduled_date || '',
  scheduledTime: item.scheduled_time || '',
  completionDate: item.completion_date || undefined,
  assignedTechnicianId: item.assigned_technician_id ? String(item.assigned_technician_id) : (item.technician?.id ? String(item.technician.id) : ''),
  technicianName: item.technician?.name || item.technician_name || 'Belum Ditugaskan',
  estimatedHours: Number(item.estimated_hours || 2),
  actualHours: item.actual_hours ? Number(item.actual_hours) : undefined,
  laborRate: Number(item.labor_rate || 150000),
  serviceDescription: item.service_description || '',
  rootCauseNotes: item.root_cause_notes || '',
  partsUsed: Array.isArray(item.parts) ? item.parts.map((p: any) => ({
    id: String(p.id || ''),
    name: p.name || '',
    quantity: Number(p.quantity || 1),
    unitCost: Number(p.unit_cost || 0)
  })) : (item.partsUsed || []),
  totalPartsCost: Number(item.total_parts_cost || 0),
  totalLaborCost: Number(item.total_labor_cost || 0),
  dpAmount: item.dp_amount ? Number(item.dp_amount) : 0,
  grandTotal: Number(item.grand_total || (Number(item.total_parts_cost || 0) + Number(item.total_labor_cost || 0))),
  paymentStatus: item.payment_status || 'Belum Bayar',
  warrantyPeriod: item.warranty_period || '30 Hari',
  slaDeadline: item.sla_deadline || '',
  logs: Array.isArray(item.logs) ? item.logs.map((l: any) => ({
    id: String(l.id || ''),
    timestamp: l.created_at || new Date().toISOString(),
    author: l.author || 'Sistem',
    action: l.action || '',
    notes: l.notes || ''
  })) : (item.logs || [])
});

/**
 * Maps Backend Technician to Frontend Technician
 */
export const mapBackendTechnician = (item: any): Technician => ({
  id: String(item.id || ''),
  name: item.name || '',
  avatar: item.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
  specialty: item.specialty || 'Teknisi Umum',
  phone: item.phone || '',
  email: item.email || '',
  rating: Number(item.rating || 5.0),
  completedJobs: Number(item.completed_jobs || 0),
  currentStatus: item.current_status || 'Tersedia',
  activeWorkOrderId: item.active_work_order_id ? String(item.active_work_order_id) : undefined,
  skills: Array.isArray(item.skills) ? item.skills : [],
  certifications: Array.isArray(item.certifications) ? item.certifications : [],
  user_id: item.user_id ? Number(item.user_id) : (item.user?.id ? Number(item.user.id) : null),
  user: item.user || null
});

/**
 * Maps Backend Service Catalog to Frontend Service Catalog
 */
export const mapBackendServiceCatalog = (item: any): ServiceCatalogItem => ({
  id: String(item.id || ''),
  code: item.code || '',
  name: item.name || '',
  category: item.category || 'Pemeliharaan Berkala (Preventive)',
  description: item.description || '',
  basePrice: Number(item.base_price || 0),
  estimatedDurationHours: Number(item.estimated_duration_hours || 2),
  warrantyDays: Number(item.warranty_days || 30),
  requiredSkillLevel: item.required_skill_level || 'Madya',
  recommendedParts: Array.isArray(item.recommended_parts) ? item.recommended_parts : ['Material Standar & APD'],
  activeOrdersCount: Number(item.active_orders_count || 0)
});

/**
 * Maps Backend Contract to Frontend JasaContract
 */
export const mapBackendContract = (item: any): JasaContract => {
  const endDate = item.end_date ? new Date(item.end_date) : new Date();
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    id: String(item.id || ''),
    contractNumber: item.contract_number || `CTR-${item.id}`,
    title: item.title || '',
    clientCompany: item.client_company || '',
    clientName: item.client_name || '',
    clientPhone: item.client_phone || '',
    clientEmail: item.client_email || '',
    clientAddress: item.client_address || '',
    serviceCategory: item.service_category || 'Pemeliharaan Berkala (Preventive)',
    equipmentList: Array.isArray(item.equipment_list) ? item.equipment_list : ['Mesin Utama'],
    startDate: item.start_date || '',
    endDate: item.end_date || '',
    frequency: item.frequency || 'Bulanan',
    totalVisitsQuota: Number(item.total_visits_quota || 12),
    completedVisitsCount: Number(item.completed_visits_count || 0),
    nextScheduleDate: item.next_schedule_date || '',
    contractValue: Number(item.contract_value || 0),
    assignedTechnicianId: item.assigned_technician_id ? String(item.assigned_technician_id) : undefined,
    technicianName: item.technician?.name || 'Belum Ditentukan',
    status: item.status || (daysLeft <= 0 ? 'Berakhir' : daysLeft <= 30 ? 'Segera Berakhir' : 'Aktif'),
    slaNotes: item.sla_notes || '',
    daysUntilExpiration: daysLeft
  };
};

export const jasaApi = {
  // Stats
  async getStats() {
    const res = await apiClient.get('/jasa/stats');
    return res.data?.data;
  },

  // Service Catalog
  async getServices() {
    const res = await apiClient.get('/jasa/services');
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data.map(mapBackendServiceCatalog);
    }
    return [];
  },

  async storeService(payload: any) {
    const res = await apiClient.post('/jasa/services', payload);
    return mapBackendServiceCatalog(res.data?.data);
  },

  async createService(payload: any) {
    return this.storeService(payload);
  },

  async updateService(id: number | string, payload: any) {
    const res = await apiClient.put(`/jasa/services/${id}`, payload);
    return mapBackendServiceCatalog(res.data?.data);
  },

  async deleteService(id: number | string) {
    const res = await apiClient.delete(`/jasa/services/${id}`);
    return res.data?.success;
  },

  // Work Orders (SPK)
  async getWorkOrders(params?: { status?: string; priority?: string; search?: string }) {
    const res = await apiClient.get('/jasa/work-orders', { params });
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data.map(mapBackendWorkOrder);
    }
    return [];
  },

  async createWorkOrder(order: Partial<WorkOrder>) {
    const payload = {
      title: order.title,
      customer_name: order.customerName,
      customer_company: order.customerCompany,
      customer_phone: order.customerPhone,
      customer_email: order.customerEmail,
      customer_address: order.customerAddress,
      category: order.category,
      equipment_name: order.serviceObjectName,
      serial_number: order.serviceObjectIdentifier,
      priority: order.priority,
      status: order.status || 'Menunggu Konfirmasi',
      scheduled_date: order.scheduledDate,
      scheduled_time: order.scheduledTime,
      assigned_technician_id: order.assignedTechnicianId ? (isNaN(Number(order.assignedTechnicianId)) ? null : Number(order.assignedTechnicianId)) : null,
      estimated_hours: order.estimatedHours,
      labor_rate: order.laborRate,
      service_description: order.serviceDescription,
      payment_status: order.paymentStatus || 'Belum Bayar',
      warranty_period: order.warrantyPeriod || '30 Hari',
      parts: order.partsUsed?.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitCost: p.unitCost
      })) || []
    };

    const res = await apiClient.post('/jasa/work-orders', payload);
    return mapBackendWorkOrder(res.data?.data);
  },

  async updateWorkOrder(id: string | number, order: Partial<WorkOrder>) {
    const payload: any = {};
    if (order.title !== undefined) payload.title = order.title;
    if (order.customerName !== undefined) payload.customer_name = order.customerName;
    if (order.customerCompany !== undefined) payload.customer_company = order.customerCompany;
    if (order.customerPhone !== undefined) payload.customer_phone = order.customerPhone;
    if (order.customerEmail !== undefined) payload.customer_email = order.customerEmail;
    if (order.customerAddress !== undefined) payload.customer_address = order.customerAddress;
    if (order.category !== undefined) payload.category = order.category;
    if (order.serviceObjectName !== undefined) payload.equipment_name = order.serviceObjectName;
    if (order.serviceObjectIdentifier !== undefined) payload.serial_number = order.serviceObjectIdentifier;
    if (order.priority !== undefined) payload.priority = order.priority;
    if (order.status !== undefined) payload.status = order.status;
    if (order.scheduledDate !== undefined) payload.scheduled_date = order.scheduledDate;
    if (order.scheduledTime !== undefined) payload.scheduled_time = order.scheduledTime;
    if (order.assignedTechnicianId !== undefined) {
      payload.assigned_technician_id = isNaN(Number(order.assignedTechnicianId)) ? null : Number(order.assignedTechnicianId);
    }
    if (order.estimatedHours !== undefined) payload.estimated_hours = order.estimatedHours;
    if (order.laborRate !== undefined) payload.labor_rate = order.laborRate;
    if (order.serviceDescription !== undefined) payload.service_description = order.serviceDescription;
    if (order.paymentStatus !== undefined) payload.payment_status = order.paymentStatus;
    if (order.warrantyPeriod !== undefined) payload.warranty_period = order.warrantyPeriod;
    if (order.partsUsed) {
      payload.parts = order.partsUsed.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitCost: p.unitCost
      }));
    }

    const res = await apiClient.put(`/jasa/work-orders/${id}`, payload);
    return mapBackendWorkOrder(res.data?.data);
  },

  async updateWorkOrderStatus(id: string | number, status: string, notes?: string) {
    const res = await apiClient.patch(`/jasa/work-orders/${id}/status`, { status, notes });
    return mapBackendWorkOrder(res.data?.data);
  },

  // Direct POS Kasir Checkout
  async posCheckout(payload: {
    items: { id?: string | number; name: string; price: number; quantity: number; type: string }[];
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    paymentMethod: string;
    amountPaid: number;
    total: number;
    vehiclePlate?: string;
  }) {
    const res = await apiClient.post('/jasa/pos/checkout', payload);
    return res.data;
  },

  // Customer List (Isolated to Jasa)
  async getCustomers() {
    const res = await apiClient.get('/jasa/customers');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  // Technicians
  async getTechnicians() {
    const res = await apiClient.get('/jasa/technicians');
    return Array.isArray(res.data?.data) ? res.data.data.map(mapBackendTechnician) : [];
  },

  async updateTechnicianStatus(id: string, status: string) {
    const res = await apiClient.put(`/jasa/technicians/${id}/status`, { status });
    return mapBackendTechnician(res.data?.data);
  },

  async storeTechnician(payload: any) {
    const res = await apiClient.post('/jasa/technicians', payload);
    return mapBackendTechnician(res.data?.data);
  },

  async updateTechnician(id: string, payload: any) {
    const res = await apiClient.put(`/jasa/technicians/${id}`, payload);
    return mapBackendTechnician(res.data?.data);
  },

  async deleteTechnician(id: string) {
    const res = await apiClient.delete(`/jasa/technicians/${id}`);
    return res.data?.success;
  },

  // B2B Maintenance Contracts
  async getContracts(params?: { status?: string; search?: string }) {
    const res = await apiClient.get('/jasa/contracts', { params });
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data.map(mapBackendContract);
    }
    return [];
  },

  async createContract(contract: Partial<JasaContract>) {
    const payload = {
      contract_number: contract.contractNumber,
      title: contract.title,
      client_company: contract.clientCompany,
      client_name: contract.clientName,
      client_phone: contract.clientPhone,
      client_email: contract.clientEmail,
      client_address: contract.clientAddress,
      service_category: contract.serviceCategory,
      equipment_list: contract.equipmentList,
      start_date: contract.startDate,
      end_date: contract.endDate,
      frequency: contract.frequency,
      total_visits_quota: contract.totalVisitsQuota,
      next_schedule_date: contract.nextScheduleDate,
      contract_value: contract.contractValue,
      assigned_technician_id: contract.assignedTechnicianId ? (isNaN(Number(contract.assignedTechnicianId)) ? null : Number(contract.assignedTechnicianId)) : null,
      sla_notes: contract.slaNotes
    };

    const res = await apiClient.post('/jasa/contracts', payload);
    return mapBackendContract(res.data?.data);
  },

  async generateSpkFromContract(contractId: string | number) {
    const res = await apiClient.post(`/jasa/contracts/${contractId}/generate-spk`);
    return {
      workOrder: mapBackendWorkOrder(res.data?.data?.workOrder),
      contract: mapBackendContract(res.data?.data?.contract)
    };
  },

  // Calendar Events
  async getCalendarEvents(params?: { month?: number; year?: number }) {
    const res = await apiClient.get('/jasa/calendar-events', { params });
    const data = res.data?.data;
    return {
      workOrders: Array.isArray(data?.workOrders) ? data.workOrders.map(mapBackendWorkOrder) : [],
      contracts: Array.isArray(data?.contracts) ? data.contracts.map(mapBackendContract) : []
    };
  },

  // Inventory (Spareparts)
  async getInventory() {
    const res = await apiClient.get('/jasa/inventory');
    return res.data?.data || [];
  },

  async storeInventory(payload: any) {
    const res = await apiClient.post('/jasa/inventory', payload);
    return res.data?.data;
  },

  async updateInventory(id: number | string, payload: any) {
    const res = await apiClient.put(`/jasa/inventory/${id}`, payload);
    return res.data?.data;
  },

  async deleteInventory(id: number | string) {
    const res = await apiClient.delete(`/jasa/inventory/${id}`);
    return res.data?.success;
  },

  // Settings
  async getSettings() {
    const res = await apiClient.get('/jasa/settings');
    const data = res.data?.data;
    if (!data) return null;
    return {
      id: data.id,
      businessType: data.business_type,
      termTechnician: data.term_technician,
      termSparepart: data.term_sparepart,
      termSpk: data.term_spk,
      documentPrefix: data.document_prefix
    };
  },

  async updateSettings(payload: any) {
    const res = await apiClient.put('/jasa/settings', {
      business_type: payload.businessType,
      term_technician: payload.termTechnician,
      term_sparepart: payload.termSparepart,
      term_spk: payload.termSpk,
      document_prefix: payload.documentPrefix,
      service_categories: payload.service_categories,
      technician_specialties: payload.technician_specialties,
      inventory_categories: payload.inventory_categories
    });
    return res.data?.data;
  },

  // Finance & Invoices
  async getInvoices() {
    const res = await apiClient.get('/jasa/invoices');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async updateInvoiceStatus(id: string | number, status: string) {
    const res = await apiClient.put(`/jasa/invoices/${id}/status`, { status });
    return res.data?.data;
  },

  // Expenses & Cashflow
  async getExpenses() {
    const res = await apiClient.get('/jasa/expenses');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async storeExpense(payload: {
    description: string;
    amount: number;
    category?: string;
    payment_method?: string;
    transaction_date?: string;
    reference_spk_id?: string;
    recipient_or_payer?: string;
  }) {
    const res = await apiClient.post('/jasa/expenses', payload);
    return res.data?.data;
  },

  async updateExpense(id: string | number, payload: any) {
    const res = await apiClient.put(`/jasa/expenses/${id}`, payload);
    return res.data?.data;
  },

  async deleteExpense(id: string | number) {
    const res = await apiClient.delete(`/jasa/expenses/${id}`);
    return res.data?.success;
  },

  // Payables (Hutang Usaha)
  async getPayables() {
    const res = await apiClient.get('/jasa/payables');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async storePayable(payload: {
    payable_number: string;
    vendor_name: string;
    description: string;
    amount: number;
    paid_amount?: number;
    due_date: string;
    status?: string;
    notes?: string;
  }) {
    const res = await apiClient.post('/jasa/payables', payload);
    return res.data?.data;
  },

  async updatePayable(id: string | number, payload: any) {
    const res = await apiClient.put(`/jasa/payables/${id}`, payload);
    return res.data?.data;
  },

  async deletePayable(id: string | number) {
    const res = await apiClient.delete(`/jasa/payables/${id}`);
    return res.data?.success;
  },

  // Financial Accounts (Rekening & Kas)
  async getAccounts() {
    const res = await apiClient.get('/jasa/accounts');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async storeAccount(payload: {
    name: string;
    type: string;
    account_number?: string;
    balance: number;
    is_active?: boolean;
  }) {
    const res = await apiClient.post('/jasa/accounts', payload);
    return res.data?.data;
  },

  async updateAccount(id: string | number, payload: any) {
    const res = await apiClient.put(`/jasa/accounts/${id}`, payload);
    return res.data?.data;
  },

  async deleteAccount(id: string | number) {
    const res = await apiClient.delete(`/jasa/accounts/${id}`);
    return res.data?.success;
  },

  async transferAccount(payload: {
    from_account_id: number;
    to_account_id: number;
    amount: number;
    notes?: string;
  }) {
    const res = await apiClient.post('/jasa/accounts/transfer', payload);
    return res.data;
  },

  // Roles & Permissions
  async getRoles(): Promise<JasaRole[]> {
    try {
      const res = await apiClient.get('/jasa/roles');
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return res.data.data;
      }
      return DEFAULT_JASA_ROLES;
    } catch (err) {
      console.warn('Fallback to default roles:', err);
      return DEFAULT_JASA_ROLES;
    }
  },

  async createRole(payload: { name: string; description?: string; permissions: Record<string, boolean> }) {
    const res = await apiClient.post('/jasa/roles', payload);
    return res.data?.data;
  },

  async storeRole(payload: { name: string; description?: string; permissions: Record<string, boolean> }) {
    const res = await apiClient.post('/jasa/roles', payload);
    return res.data?.data;
  },

  async updateRole(id: number | string, payload: { name: string; description?: string; permissions: Record<string, boolean> }) {
    const res = await apiClient.put(`/jasa/roles/${id}`, payload);
    return res.data?.data;
  },

  async deleteRole(id: number | string) {
    const res = await apiClient.delete(`/jasa/roles/${id}`);
    return res.data;
  },

  // Staff & User Accounts
  async getStaff(): Promise<JasaStaff[]> {
    try {
      const res = await apiClient.get('/jasa/staff');
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.warn('Failed to load staff:', err);
      return [];
    }
  },

  async createStaff(payload: any) {
    const res = await apiClient.post('/jasa/staff', payload);
    return res.data?.data;
  },

  async storeStaff(payload: any) {
    const res = await apiClient.post('/jasa/staff', payload);
    return res.data?.data;
  },

  async updateStaff(id: number | string, payload: any) {
    const res = await apiClient.put(`/jasa/staff/${id}`, payload);
    return res.data?.data;
  },

  async deleteStaff(id: number | string) {
    const res = await apiClient.delete(`/jasa/staff/${id}`);
    return res.data;
  }
};