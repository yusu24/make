import React from 'react';
// @ts-ignore
import UniversalSubscriptionView from '../../../../../components/subscription/UniversalSubscriptionView';
import { Package, Store, Users } from '@/constants/icons';

export const SellerSubscriptionView: React.FC = () => {
  const usageMetrics = [
    { label: 'Katalog Produk', used: 12, limit: 30, icon: Package },
    { label: 'Manajemen Gudang', used: 1, limit: 1, icon: Store },
    { label: 'Akun Pengguna', used: 1, limit: 1, icon: Users }
  ];

  return (
    <div className="w-full">
      <UniversalSubscriptionView
        categoryKey="seller"
        categoryTitle="Seller & E-Commerce"
        usageMetrics={usageMetrics}
      />
    </div>
  );
};
