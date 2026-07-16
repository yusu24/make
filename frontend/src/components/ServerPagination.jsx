import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ServerPagination.css';

/**
 * Presentational pager for endpoints using Laravel's real ->paginate() response shape
 * ({ current_page, last_page, total, per_page }), as opposed to RetailPagination.jsx
 * which consumes client-computed totals from usePagination.js. Kept as a separate,
 * self-contained (theme-var based) component so existing pages are never touched.
 */
export default function ServerPagination({ meta, page, setPage, perPage, setPerPage }) {
  const { current_page = 1, last_page = 1, total = 0 } = meta || {};
  const startIndex = total > 0 ? (current_page - 1) * perPage : 0;
  const endIndex = Math.min(startIndex + perPage, total);

  const pageNumbers = [];
  let startPage = Math.max(1, current_page - 2);
  let endPage = Math.min(last_page, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="sp-container">
      <div className="sp-info">
        Menampilkan {total > 0 ? startIndex + 1 : 0}–{endIndex} dari {total} data
      </div>
      <div className="sp-controls">
        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="sp-select"
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>

        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={current_page === 1}
          className="sp-btn"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={15} />
        </button>

        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`sp-btn ${current_page === n ? 'active' : ''}`}
          >
            {n}
          </button>
        ))}

        <button
          onClick={() => setPage(Math.min(last_page, page + 1))}
          disabled={current_page === last_page}
          className="sp-btn"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
