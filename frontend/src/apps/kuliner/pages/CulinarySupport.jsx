import React, { useRef } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import TenantSupportCenter from '../../../pages/TenantSupportCenter';

export default function CulinarySupport() {
  const supportRef = useRef(null);

  return (
    <KulinerAdminLayout>
      <div className="kd-content" style={{ padding: '24px 32px' }}>
        <TenantSupportCenter hideAction={true} ref={supportRef} />
      </div>
    </KulinerAdminLayout>
  );
}
