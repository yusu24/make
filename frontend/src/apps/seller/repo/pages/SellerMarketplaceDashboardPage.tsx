import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceDashboardView } from '../components/omnichannel/MarketplaceDashboardView';

export default function SellerMarketplaceDashboardPage() {
  const navigate = useNavigate();

  return (
    <MarketplaceDashboardView
      onNavigateToConnected={() => navigate('/seller/marketplace/connected')}
    />
  );
}
