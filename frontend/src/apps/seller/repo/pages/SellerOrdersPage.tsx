import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { OrdersView } from '../components/views/OrdersView';

export default function SellerOrdersPage() {
  const context = useOutletContext<any>();

  return (
    <OrdersView
      orders={context?.orders || []}
      onOpenAwbModal={context?.onPrintAwb || (() => {})}
      onUpdateOrderStatus={context?.onUpdateOrderStatus || (() => {})}
      selectedStoreId={context?.selectedStoreId || 'all'}
      onPrintAwb={context?.onPrintAwb || (() => {})}
    />
  );
}
