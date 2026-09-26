import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MainDashboardView } from '../components/views/MainDashboardView';
import { tabToPath } from '../SellerApp';
import { ActiveTab } from '../types';

export default function SellerDashboardPage() {
  const context = useOutletContext<any>();
  const navigate = useNavigate();

  return (
    <MainDashboardView
      orders={context?.orders || []}
      products={context?.products || []}
      stores={context?.stores || []}
      setActiveTab={(tab: ActiveTab) => navigate(tabToPath(tab))}
      onPrintAwb={context?.onPrintAwb || (() => {})}
    />
  );
}
