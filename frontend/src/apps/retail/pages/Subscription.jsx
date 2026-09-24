import React, { useState, useEffect } from 'react';
import UniversalSubscriptionView from '../../../components/subscription/UniversalSubscriptionView';
import { api } from '../../../lib/api';
import { Package, Users, Store } from '@/constants/icons';

export default function Subscription() {
  const [productCount, setProductCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [outletCount, setOutletCount] = useState(1);

  useEffect(() => {
    const fetchRetailCounts = async () => {
      try {
        const [prodRes, staffRes, outletRes] = await Promise.allSettled([
          api.get('/retail/products'),
          api.get('/retail/staff'),
          api.get('/retail/outlets')
        ]);

        if (prodRes.status === 'fulfilled') {
          const prods = Array.isArray(prodRes.value.data) ? prodRes.value.data : (prodRes.value.data?.data || []);
          setProductCount(prods.length);
        }
        if (staffRes.status === 'fulfilled') {
          const staffs = Array.isArray(staffRes.value.data) ? staffRes.value.data : (staffRes.value.data?.data || []);
          setStaffCount(staffs.length);
        }
        if (outletRes.status === 'fulfilled') {
          const outlets = Array.isArray(outletRes.value.data) ? outletRes.value.data : (outletRes.value.data?.data || []);
          setOutletCount(Math.max(1, outlets.length));
        }
      } catch (err) {
        console.warn('Retail counts fetch error:', err);
      }
    };

    fetchRetailCounts();
  }, []);

  const usageMetrics = [
    { label: 'Katalog Produk', used: productCount, limit: 50, icon: Package },
    { label: 'Akun Staf & Kasir', used: staffCount, limit: 1, icon: Users },
    { label: 'Cabang / Outlet', used: outletCount, limit: 1, icon: Store }
  ];

  return (
    <div className="w-full">
      <UniversalSubscriptionView
        categoryKey="retail"
        categoryTitle="Toko Retail POS"
        usageMetrics={usageMetrics}
      />
    </div>
  );
}
