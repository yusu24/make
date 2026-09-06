import React from 'react';
import BizoraPagination from '../../../components/BizoraPagination';

export default function ClientPagination({
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  compact = false,
  ...rest
}) {
  return (
    <BizoraPagination
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      pageSize={itemsPerPage}
      setPageSize={setItemsPerPage}
      totalItems={totalItems}
      className={compact ? 'sp-compact' : ''}
      {...rest}
    />
  );
}
