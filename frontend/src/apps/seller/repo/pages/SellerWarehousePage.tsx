import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { WarehouseView } from '../components/views/WarehouseView';

export default function SellerWarehousePage() {
  const context = useOutletContext<any>();

  return (
    <WarehouseView
      warehouses={context?.warehouses || []}
      stockMovements={context?.stockMovements || []}
      onAddWarehouse={context?.onAddWarehouse}
      onEditWarehouse={context?.onEditWarehouse}
      onDeleteWarehouse={context?.onDeleteWarehouse}
    />
  );
}
