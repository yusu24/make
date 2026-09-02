import React from 'react'

/**
 * Standardized Table Components for Budidaya Hewan module
 * Following strict SaaS design rules for consistency and readability.
 */

export const Table = ({ children, className = '', style = {}, ...props }) => (
  <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', ...style }}>
    <table className={`aq-table ${className}`} {...props}>
      {children}
    </table>
  </div>
)

export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`aq-table-header ${className}`} {...props}>
    {children}
  </thead>
)

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
)

export const TableRow = ({ children, className = '', isHoverable = true, ...props }) => (
  <tr 
    className={`aq-table-row ${!isHoverable ? 'no-hover' : ''} ${className}`} 
    {...props}
  >
    {children}
  </tr>
)

export const TableHeaderCell = ({ children, className = '', ...props }) => (
  <th 
    className={`aq-table-header-cell ${className}`} 
    {...props}
  >
    {children}
  </th>
)

export const TableCell = ({ children, className = '', isSecondary = false, ...props }) => (
  <td 
    className={`
      aq-table-cell 
      ${isSecondary ? 'aq-table-cell-secondary' : ''} 
      ${className}
    `} 
    {...props}
  >
    {children}
  </td>
)

// Add a helper for sentence case if needed, but usually we just write it in sentence case.
// The rule says "DO NOT use uppercase" and "Sentence case".
