import React from 'react';
import BizoraPagination from '../../../components/BizoraPagination';

export default function RetailPagination({ theme = 'emerald', ...props }) {
  return <BizoraPagination theme={theme} {...props} />;
}

