import React from 'react'

/**
 * Standardized Table Components for Budidaya Ikan module
 * Following strict SaaS design rules for consistency and readability.
 */

export const Table = ({ children, className = '', ...props }) => (
  <div className={`aq-table-container ${className}`}>
    <table className="aq-table" {...props}>
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
    className={`aq-table-header-cell capitalize-first-only ${className}`} 
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
