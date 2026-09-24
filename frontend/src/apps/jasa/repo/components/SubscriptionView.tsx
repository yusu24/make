import React from 'react';
// @ts-ignore
import UniversalSubscriptionView from '../../../../components/subscription/UniversalSubscriptionView';
import { Wrench, Users, Package } from '@/constants/icons';

interface SubscriptionViewProps {
  workOrdersCount?: number;
  techniciansCount?: number;
  inventoryCount?: number;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  workOrdersCount = 0,
  techniciansCount = 0,
  inventoryCount = 0
}) => {
  const usageMetrics = [
    { label: 'SPK (Work Orders)', used: workOrdersCount, limit: 15, icon: Wrench },
    { label: 'Teknisi & Admin', used: techniciansCount, limit: 1, icon: Users },
    { label: 'Suku Cadang & Stok', used: inventoryCount, limit: 50, icon: Package }
  ];

  return (
    <UniversalSubscriptionView
      categoryKey="jasa"
      categoryTitle="Bengkel & Servis Jasa"
      usageMetrics={usageMetrics}
    />
  );
};
