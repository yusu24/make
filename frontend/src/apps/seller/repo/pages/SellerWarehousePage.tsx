import React, { useState, useEffect } from 'react';
import { WarehouseView } from '../components/views/WarehouseView';
import { AddWarehouseModal } from '../components/modals/AddWarehouseModal';
import { Warehouse, StockMovement } from '../types';
import { INITIAL_WAREHOUSES, INITIAL_STOCK_MOVEMENTS } from '../data/mockData';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../lib/api';

export default function SellerWarehousePage() {
  const { user } = useAuth();
  const DEMO_EMAILS = ['seller@demo.com', 'ahmad@retail.com', 'retail@demo.com', 'siti@ikan.com', 'budidaya@demo.com', 'dewi@kuliner.com', 'kuliner@demo.com', 'jasa@demo.com'];
  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-') || DEMO_EMAILS.includes(user?.email || '');

  const [warehouses, setWarehouses] = useState<Warehouse[]>(isDemo ? INITIAL_WAREHOUSES : []);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(isDemo ? INITIAL_STOCK_MOVEMENTS : []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [warehouseToEdit, setWarehouseToEdit] = useState<Warehouse | null>(null);

  const mapWarehouse = (w: any): Warehouse => ({
    id: w.id?.toString(),
    name: w.name,
    code: w.code || '',
    city: w.city || '',
    address: w.address || '',
    picName: w.pic_name || '',
    picPhone: w.pic_phone || '',
    totalSKUs: w.totalSKUs ?? 0,
    totalItems: w.totalItems ?? 0,
    isDefault: !!w.is_default,
  });

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/seller/warehouses');
      if (response.data.success && Array.isArray(response.data.data)) {
        if (response.data.data.length > 0) {
          setWarehouses(response.data.data.map(mapWarehouse));
        } else if (isDemo) {
          setWarehouses(INITIAL_WAREHOUSES);
        } else {
          setWarehouses([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch warehouses', error);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const res = await api.get('/retail/stock/movements');
      const rows = res.data?.data;
      if (Array.isArray(rows) && rows.length > 0) {
        const mappedMovements: StockMovement[] = rows.map((m: any) => {
          const qty = parseFloat(m.quantity) || 0;
          return {
            id: m.id?.toString(),
            date: m.created_at?.replace('T', ' ').substring(0, 16) || '-',
            sku: m.product?.sku || '-',
            productName: m.product?.name || `Produk #${m.product_id}`,
            warehouseName: '-',
            type: m.type === 'adjustment' ? 'Opname Adjust' : (qty >= 0 ? 'Masuk' : 'Keluar'),
            qty,
            notes: m.note || '-',
            user: m.user?.name || '-',
          };
        });
        setStockMovements(mappedMovements);
      }
    } catch (err) {
      console.error('Failed to fetch stock movements', err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchStockMovements();
  }, []);

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gudang ini?')) return;
    try {
      await api.delete(`/seller/warehouses/${id}`);
      setWarehouses((prev) => {
        const remaining = prev.filter((w) => w.id !== id);
        if (!remaining.some((w) => w.isDefault) && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete warehouse', err);
      alert('Gagal menghapus gudang.');
    }
  };

  return (
    <>
      <WarehouseView
        warehouses={warehouses}
        stockMovements={stockMovements}
        onAddWarehouse={() => {
          setWarehouseToEdit(null);
          setIsModalOpen(true);
        }}
        onEditWarehouse={(wh: Warehouse) => {
          setWarehouseToEdit(wh);
          setIsModalOpen(true);
        }}
        onDeleteWarehouse={handleDeleteWarehouse}
      />

      {isModalOpen && (
        <AddWarehouseModal
          warehouseToEdit={warehouseToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setWarehouseToEdit(null);
          }}
          onSuccess={(savedWarehouse) => {
            const mapped = mapWarehouse(savedWarehouse);
            setWarehouses((prev) => {
              const isEdit = prev.some((w) => w.id === mapped.id);
              const updated = isEdit
                ? prev.map((w) => (w.id === mapped.id ? mapped : w))
                : [...prev, mapped];
              return mapped.isDefault
                ? updated.map((w) => (w.id === mapped.id ? w : { ...w, isDefault: false }))
                : updated;
            });
            setIsModalOpen(false);
            setWarehouseToEdit(null);
          }}
        />
      )}
    </>
  );
}
