import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SaasPagination({
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
  
  // Calculate range of page numbers to show (max 5 pages shown at a time)
  let startPage = Math.max(1, safeCurrentPage - 2);
  let endPage = Math.min(safeTotalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="saas-pagination-container">
      <div className="saas-pagination-info">
        {displayStart}–{displayEnd} dari {safeTotalItems}
      </div>
      <div className="saas-pagination-controls">
        <div className="saas-pagination-select-wrapper">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="saas-pagination-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="saas-pagination-btn prev-next"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`saas-pagination-btn ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="saas-pagination-btn prev-next"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
