import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../../components/ServerPagination.css'; // Reuse the exact same CSS

export default function ClientPagination({ currentPage, setCurrentPage, totalPages, itemsPerPage, setItemsPerPage, totalItems, compact = false }) {
  if (totalPages <= 1 && totalItems === 0) return null;

  // Maximum 5 visible pages sliding window (geser dinamis saat halaman berganti)
  const maxVisiblePages = 5;
  const pageNumbers = [];
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className={`sp-container no-print ${compact ? 'sp-compact' : ''}`}>
      <div className="sp-info">
        {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} dari {totalItems}
      </div>
      <div className="sp-controls">
        {setItemsPerPage && (
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to page 1 on limit change
            }}
            className="sp-select"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        )}

        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="sp-btn"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={15} />
        </button>

        {!compact && pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setCurrentPage(n)}
            className={`sp-btn ${currentPage === n ? 'active' : ''}`}
          >
            {n}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="sp-btn"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
