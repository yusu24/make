import React from 'react';
import BizoraPagination from '../../../components/BizoraPagination';

export default function BudidayaPagination({ theme = 'teal', ...props }) {
  return <BizoraPagination theme={theme} {...props} />;
}
