import apiClient from '../../../../services/api';
import { WorkOrder, Technician, ServiceCatalogItem } from '../types';

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
  equipmentName: item.equipment_name || '',
  serialNumber: item.serial_number || '',
  priority: item.priority || 'Sedang',
  status: item.status || 'Menunggu Konfirmasi',
  scheduledDate: item.scheduled_date || '',
  scheduledTime: item.scheduled_time || '',
  technicianId: item.assigned_technician_id ? String(item.assigned_technician_id) : (item.technician?.id ? String(item.technician.id) : 'T-01'),
  technicianName: item.technician?.name || item.technician_name || 'Belum Ditugaskan',
  estimatedHours: Number(item.estimated_hours || 2),
  laborRate: Number(item.labor_rate || 150000),
  serviceDescription: item.service_description || '',
  partsReplaced: Array.isArray(item.parts) ? item.parts.map((p: any) => ({
    id: String(p.id || ''),
    name: p.name || '',
    partNumber: p.part_number || '',
    quantity: Number(p.quantity || 1),
    unitCost: Number(p.unit_cost || 0),
    isApprovedByClient: Boolean(p.is_approved_by_client ?? true)
  })) : (item.partsReplaced || []),
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
  certifications: Array.isArray(item.certifications) ? item.certifications : []
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
      equipment_name: order.equipmentName,
      serial_number: order.serialNumber,
      priority: order.priority,
      status: order.status || 'Menunggu Konfirmasi',
      scheduled_date: order.scheduledDate,
      scheduled_time: order.scheduledTime,
      assigned_technician_id: order.technicianId ? (isNaN(Number(order.technicianId)) ? null : Number(order.technicianId)) : null,
      estimated_hours: order.estimatedHours,
      labor_rate: order.laborRate,
      service_description: order.serviceDescription,
      payment_status: order.paymentStatus || 'Belum Bayar',
      warranty_period: order.warrantyPeriod || '30 Hari',
      parts: order.partsReplaced?.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitCost: p.unitCost
      })) || []
    };

    const res = await apiClient.post('/jasa/work-orders', payload);
    return mapBackendWorkOrder(res.data?.data);
  },

  async updateWorkOrderStatus(id: string | number, status: string, notes?: string) {
    const res = await apiClient.patch(`/jasa/work-orders/${id}/status`, { status, notes });
    return mapBackendWorkOrder(res.data?.data);
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
  }
};
