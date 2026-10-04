import React from 'react';
import { TenantDeveloperPortal } from '../../../components/TenantDeveloperPortal';
import '../retail.css';

export default function RetailDeveloperApi() {
  const isSeller = typeof window !== 'undefined' && window.location.pathname.startsWith('/seller');
  return (
    <div className="page-content--retail pb-12">
      <TenantDeveloperPortal 
        moduleName={isSeller ? "Retail & Omnichannel" : "Retail"} 
        accentColor="indigo" 
        subscriptionLink={isSeller ? "/seller/subscription" : "/retail/subscription"} 
      />
    </div>
  );
}
