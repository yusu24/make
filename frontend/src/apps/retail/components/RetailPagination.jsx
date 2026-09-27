import React from 'react';
import BizoraPagination from '../../../components/BizoraPagination';

export default function RetailPagination({ theme, ...props }) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isSeller = path.includes('/seller');
  const resolvedTheme = theme || (isSeller ? 'indigo' : 'blue');
  return <BizoraPagination theme={resolvedTheme} {...props} />;
}

