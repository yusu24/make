import React from 'react';

export default function RetailTableLoadingRow({ colSpan, text = 'Memuat...' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-20 text-center retail-text-secondary">
        {text}
      </td>
    </tr>
  );
}
