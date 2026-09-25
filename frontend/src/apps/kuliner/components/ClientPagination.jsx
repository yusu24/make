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
  theme = 'amber',
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
      theme={theme}
      className={compact ? 'sp-compact' : ''}
      {...rest}
    />
  );
}
