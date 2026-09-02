import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../budidaya.css';

export default function BudidayaPagination({
  currentPage = 1,
  setCurrentPage,
  pageSize = 10,
  setPageSize,
  totalPages,
  totalItems = 0,
  startIndex,
  endIndex,
}) {
  const safeCurrentPage = Number(currentPage) || 1;
  const safePageSize = Number(pageSize) || 10;
  const safeTotalItems = Number(totalItems) || 0;
  const safeTotalPages = Number(totalPages) || Math.ceil(safeTotalItems / safePageSize) || 1;

  const calcStart = (startIndex !== undefined && !isNaN(startIndex))
    ? Number(startIndex)
    : (safeCurrentPage - 1) * safePageSize;
  const calcEnd = (endIndex !== undefined && !isNaN(endIndex))
    ? Number(endIndex)
    : Math.min(calcStart + safePageSize, safeTotalItems);

  const displayStart = safeTotalItems > 0 ? calcStart + 1 : 0;
  const displayEnd = Math.min(calcEnd, safeTotalItems);

  const pageNumbers = [];
  let startPage = Math.max(1, safeCurrentPage - 2);
  let endPage = Math.min(safeTotalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="retail-pagination-container" style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
      <div className="retail-pagination-info" style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
        {displayStart}–{displayEnd} dari {safeTotalItems}
      </div>
      <div className="retail-pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {setPageSize && (
          <div className="retail-pagination-select-wrapper" style={{ marginRight: '6px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                height: '32px', padding: '0 8px', borderRadius: '6px',
                border: '1px solid #CBD5E1', background: '#ffffff',
                fontSize: '12.5px', color: '#334155', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          style={{
            width: '32px', height: '32px', borderRadius: '6px',
            border: '1px solid #CBD5E1', background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: currentPage === 1 ? '#94A3B8' : '#475569',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.6 : 1
          }}
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((number) => {
          const isActive = currentPage === number;
          return (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              style={{
                minWidth: '32px', height: '32px', padding: '0 6px', borderRadius: '6px',
                border: isActive ? '1px solid #1B4332' : '1px solid transparent',
                background: isActive ? '#1B4332' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: isActive ? 700 : 500, fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {number}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(safeTotalPages, prev + 1))}
          disabled={currentPage === safeTotalPages}
          style={{
            width: '32px', height: '32px', borderRadius: '6px',
            border: '1px solid #CBD5E1', background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: currentPage === safeTotalPages ? '#94A3B8' : '#475569',
            cursor: currentPage === safeTotalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === safeTotalPages ? 0.6 : 1
          }}
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
