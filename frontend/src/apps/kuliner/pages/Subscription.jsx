import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import UniversalSubscriptionView from '../../../components/subscription/UniversalSubscriptionView';
import { api } from '../../../lib/api';
import { ShoppingBag, Layers, Users } from '@/constants/icons';

export default function Subscription() {
  const [menuCount, setMenuCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    const fetchKulinerCounts = async () => {
      try {
        const [productRes, settingsRes, staffRes] = await Promise.allSettled([
          api.get('/kuliner/admin/products'),
          api.get('/kuliner/admin/settings'),
          api.get('/kuliner/admin/staff')
        ]);

        if (productRes.status === 'fulfilled') {
          const products = Array.isArray(productRes.value.data) ? productRes.value.data : (productRes.value.data?.data || []);
          setMenuCount(products.length);
        }
        if (settingsRes.status === 'fulfilled') {
          const settings = settingsRes.value.data?.data || settingsRes.value.data || {};
          setTableCount(parseInt(settings.total_tables) || 0);
        }
        if (staffRes.status === 'fulfilled') {
          const staffs = Array.isArray(staffRes.value.data) ? staffRes.value.data : (staffRes.value.data?.data || []);
          setStaffCount(staffs.length);
        }
      } catch (err) {
        console.warn('Kuliner counts fetch error:', err);
      }
    };

    fetchKulinerCounts();
  }, []);

  const usageMetrics = [
    { label: 'Menu Makanan & Minuman', used: menuCount, limit: 20, icon: ShoppingBag },
    { label: 'Meja Resto & QR Order', used: tableCount, limit: 5, icon: Layers },
    { label: 'Staf & Kasir Resto', used: staffCount, limit: 1, icon: Users }
  ];

  return (
    <KulinerAdminLayout>
      <div className="kd-content">
        <div className="w-full">
          <UniversalSubscriptionView
            categoryKey="kuliner"
            categoryTitle="Resto & Kuliner"
            usageMetrics={usageMetrics}
          />
        </div>
      </div>
    </KulinerAdminLayout>
  );
}
