import React from 'react';
import { TenantDeveloperPortal } from '../../../components/TenantDeveloperPortal';

export default function RetailDeveloperApi() {
  return (
    <div className="page-content--retail pb-12">
      <TenantDeveloperPortal 
        moduleName="Retail" 
        accentColor="indigo" 
        subscriptionLink="/retail/subscription" 
      />
    </div>
  );
}
