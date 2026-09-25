import React from 'react';
import BizoraPagination from './BizoraPagination';

export default function SaasPagination({ theme = 'indigo', ...props }) {
  return <BizoraPagination theme={theme} {...props} />;
}
