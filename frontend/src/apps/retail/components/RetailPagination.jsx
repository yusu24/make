import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../retail.css';


export default function RetailPagination({
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
}) {
  const pageNumbers = [];
  
  // Calculate range of page numbers to show (max 5 pages shown at a time)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="retail-pagination-container">
      <div className="retail-pagination-info">
        Menampilkan {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} dari {totalItems} data
      </div>
      <div className="retail-pagination-controls">
        <div className="retail-pagination-select-wrapper">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="retail-pagination-select"
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
          className="retail-pagination-btn prev-next"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`retail-pagination-btn ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="retail-pagination-btn prev-next"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
