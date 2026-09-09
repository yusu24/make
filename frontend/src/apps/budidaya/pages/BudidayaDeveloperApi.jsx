import React from 'react';
import { TenantDeveloperPortal } from '../../../components/TenantDeveloperPortal';

export default function BudidayaDeveloperApi() {
  return (
    <div className="aq-container space-y-6 pb-16 p-4 sm:p-6 max-w-7xl mx-auto">
      <TenantDeveloperPortal 
        moduleName="Budidaya Farm / Tambak" 
        accentColor="teal" 
        subscriptionLink="/budidaya/subscription" 
      />
    </div>
  );
}
