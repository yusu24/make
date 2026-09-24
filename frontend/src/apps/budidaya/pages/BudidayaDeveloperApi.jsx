import React from 'react';
import { TenantDeveloperPortal } from '../../../components/TenantDeveloperPortal';

export default function BudidayaDeveloperApi() {
  return (
    <div className="aq-container pb-16" style={{ animation: 'kd-fadeIn 0.3s ease' }}>
      <TenantDeveloperPortal 
        moduleName="Budidaya Farm / Tambak" 
        accentColor="teal" 
        subscriptionLink="/budidaya/subscription" 
      />
    </div>
  );
}
