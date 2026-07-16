import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Server-side search/filter/sort/pagination state manager, for endpoints that use
 * Laravel's real ->paginate() (unlike usePagination.js, which slices an already-fetched
 * full array client-side). Response shape expected: { data, current_page, last_page, total, per_page }.
 */
export default function useServerTable(fetcher, { initialPerPage = 15, initialSort = null, initialFilters = {} } = {}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: initialPerPage });
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        sort: sortBy || undefined,
        dir: sortBy ? sortDir : undefined,
        page,
        per_page: perPage,
        ...filters,
      };
      const res = await fetcher(params);
      const body = res.data;
      setRows(body.data || []);
      setMeta({
        current_page: body.current_page ?? 1,
        last_page: body.last_page ?? 1,
        total: body.total ?? (body.data?.length || 0),
        per_page: body.per_page ?? perPage,
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortDir, page, perPage, JSON.stringify(filters)]);

  // Debounce search changes; other changes (sort/page/filters) load immediately.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(), search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  return {
    rows, meta, loading,
    search, setSearch: updateSearch,
    filters, setFilter: updateFilter,
    sortBy, sortDir, toggleSort,
    page, setPage,
    perPage, setPerPage: (n) => { setPerPage(n); setPage(1); },
    reload: load,
  };
}
