import React, { useRef } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import TenantSupportCenter from '../../../pages/TenantSupportCenter';

export default function CulinarySupport() {
  const supportRef = useRef(null);

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Pusat Bantuan</h1>
        <div className="kd-topbar-actions">
          <button className="kd-btn kd-btn-primary" onClick={() => supportRef.current?.openNewTicketModal()}>
            + Buat Tiket Baru
          </button>
        </div>
      </div>
      <div className="kd-content" style={{ padding: '24px 32px' }}>
        <TenantSupportCenter hideAction={true} ref={supportRef} />
      </div>
    </KulinerAdminLayout>
  );
}
