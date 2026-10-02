import { useMemo, useState } from "react";

export interface ListFilters {
  search: string;
  status: string; 
  product: string; 
}

export function useClientList<T>(items: T[], match: (item: T, f: ListFilters) => boolean) {
  const [filters, setFilters] = useState<ListFilters>({ search: "", status: "all", product: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(20);

  const filtered = useMemo(() => items.filter((i) => match(i, filters)), [items, filters, match]);
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, maxPage);

  return {
    filters,
    setFilter: (patch: Partial<ListFilters>) => {
      setFilters((f) => ({ ...f, ...patch }));
      setPage(1);
    },
    rows: filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    total: filtered.length,
    page: safePage,
    pageSize,
    setPage,
    setPageSize: (s: number) => {
      setPageSizeState(s);
      setPage(1);
    },
  };
}