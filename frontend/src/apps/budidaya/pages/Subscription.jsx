import React, { useState, useEffect } from 'react';
import UniversalSubscriptionView from '../../../components/subscription/UniversalSubscriptionView';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';
import { api } from '../../../lib/api';
import { Layers, RefreshCw, Archive } from '@/constants/icons';

export default function Subscription() {
  const { terms } = useBudidayaTerms();
  const [pondCount, setPondCount] = useState(0);
  const [activeCycleCount, setActiveCycleCount] = useState(0);

  useEffect(() => {
    const fetchBudidayaCounts = async () => {
      try {
        const [pondRes, cycleRes] = await Promise.allSettled([
          api.get('/budidaya/ponds'),
          api.get('/budidaya/cycles')
        ]);

        if (pondRes.status === 'fulfilled') {
          const ponds = Array.isArray(pondRes.value.data) ? pondRes.value.data : (pondRes.value.data?.data || []);
          setPondCount(ponds.length);
        }
        if (cycleRes.status === 'fulfilled') {
          const cycles = Array.isArray(cycleRes.value.data) ? cycleRes.value.data : (cycleRes.value.data?.data || []);
          setActiveCycleCount(cycles.filter(c => c.status === 'active').length);
        }
      } catch (err) {
        console.warn('Budidaya counts fetch error:', err);
      }
    };

    fetchBudidayaCounts();
  }, []);

  const usageMetrics = [
    { label: `Jumlah ${terms?.pondLabel || 'Kolam'}`, used: pondCount, limit: 3, icon: Layers },
    { label: 'Siklus Aktif', used: activeCycleCount, limit: 1, icon: RefreshCw },
    { label: 'Pencatatan Pakan & Panen', used: 1, limit: '∞', icon: Archive }
  ];

  return (
    <div className="aq-container w-full">
      <UniversalSubscriptionView
        categoryKey="budidaya"
        categoryTitle={terms?.sectorName || 'Budidaya & Pertanian'}
        usageMetrics={usageMetrics}
      />
    </div>
  );
}
