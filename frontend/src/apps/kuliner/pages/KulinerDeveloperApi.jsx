import React from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { TenantDeveloperPortal } from '../../../components/TenantDeveloperPortal';

export default function KulinerDeveloperApi() {
  return (
    <KulinerAdminLayout title="Integrasi API & Webhook Resto">
      <div className="kd-content space-y-6 pb-16">
        <TenantDeveloperPortal 
          moduleName="Kuliner Resto & Cafe" 
          accentColor="amber" 
          subscriptionLink="/kuliner/subscription" 
        />
      </div>
    </KulinerAdminLayout>
  );
}
