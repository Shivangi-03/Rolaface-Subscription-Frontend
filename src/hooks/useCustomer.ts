import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  deleteCustomerById,
  getAllCustomers,
  getCustomerByCustomerCode,
  updateCustomerStatus,
} from "../api/customerApi";
import { useModalStore } from "../../src/store/modalstore";
import { REFRESH_KEYS, useDataRefreshStore } from "../store/datarefreshstore";
import type { CustomerDetail, CustomerSummary } from "../types/customer.types";
import { openCommonModal, notifyError, notifySuccess, parseFrappeError } from "../utils/Alert";

export function useCustomers() {
  const [rows, setRows] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearchState] = useState("");
  const [debouncedSearch] = useDebouncedValue(search.trim(), 400);
  const [reloadKey, setReloadKey] = useState(0);
  const refreshTick = useDataRefreshStore((s) => s.ticks[REFRESH_KEYS.CUSTOMER_LIST] ?? 0);
  const openModal = useModalStore((s) => s.openModal);

  const [busyId, setBusyId] = useState<string | null>(null);

  const latestRequest = useRef(0);

  // fetch list. Stale responses (older request finishing late) are ignored.
  useEffect(() => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);

    getAllCustomers(page, pageSize, undefined, debouncedSearch || undefined)
      .then((res) => {
        if (requestId !== latestRequest.current) return;
        const data = res?.data;
        if (!Array.isArray(data)) throw new Error("Unexpected response format from server");
        setRows(data as CustomerSummary[]);
        setTotalItems(Number(res?.pagination?.total) || data.length);
      })
      .catch((err: unknown) => {
        if (requestId !== latestRequest.current) return;
        setRows([]);
        setTotalItems(0);
        setError(parseFrappeError(err));
      })
      .finally(() => {
        if (requestId === latestRequest.current) setLoading(false);
      });
  }, [page, pageSize, debouncedSearch, reloadKey, refreshTick]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  const openCreate = () => openModal({ type: "customer", id: "customer-new", title: "Add Customer" });

  const openEdit = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await getCustomerByCustomerCode(id);
      const detail = (res?.message?.data ?? res?.data) as CustomerDetail | undefined;
      if (!detail) throw new Error("Customer not found");
          openModal({
        id: `customer-${id}`,
        type: "customer",
        title: `Edit ${id}`,
        initialData: { ...detail, id: detail.id ?? id },
        isEdit: true,
      });
    } catch (err) {
      notifyError(err, "Couldn't load customer");
    } finally {
      setBusyId(null);
    }
  };
  const openView = async (id: string) => {
  if (busyId) return;
  setBusyId(id);
  try {
    const res = await getCustomerByCustomerCode(id);
    const detail = (res?.message?.data ?? res?.data) as CustomerDetail | undefined;
    if (!detail) throw new Error("Customer not found");
    openModal({
      id: `customer-view-${id}`,
      type: "customer",
      title: `View ${id}`,
      initialData: { ...detail, id: detail.id ?? id },
      isEdit: false,
      readOnly: true,
    });
  } catch (err) {
    notifyError(err, "Couldn't load customer");
  } finally {
    setBusyId(null);
  }
};

  const toggleStatus = (row: CustomerSummary) => {
    const active = row.status === "Active";
    openCommonModal({
      heading: active ? "Inactive Customer" : "Active Customer",
      body: `${row.name} (${row.id}) will be set to ${active ? "Inactive" : "Active"}.`,
      color: active ? "red" : "green",
      buttons: [
        { label: "Cancel", variant: "default" },
        {
          label: active ? "Inactive" : "Active",
          color: active ? "red" : "green",
          onClick: async () => {
            try {
              await updateCustomerStatus(row.id, active ? "inactive" : "active");
              notifySuccess(
                `${row.name} has been set to ${active ? "Inactive" : "Active"} successfully.`,
                active ? "Customer Inactive" : "Customer Active"
              );
              reload();
            } catch (err) {
              notifyError(err, "Couldn't update status");
            }
          },
        },
      ],
    });
  };

  const remove = (row: CustomerSummary) => {
    openCommonModal({
      heading: "Delete Customer",
      subtitle: "This action cannot be undone.",
      body: `Delete ${row.name} (${row.id})? This cannot be undone.`,
      color: "red",
      buttons: [
        { label: "Cancel", variant: "default" },
        {
          label: "Delete",
          color: "red",
          onClick: async () => {
            try {
              await deleteCustomerById(row.id);
              notifySuccess(`Customer ${row.name} has been deleted successfully.`, "Customer Deleted");
              // deleted the only row on this page => go back one page
              if (rows.length === 1 && page > 1) setPage((p) => p - 1);
              else reload();
            } catch (err) {
              notifyError(err, "Couldn't delete customer");
            }
          },
        },
      ],
    });
  };

  return {
    rows,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    search,
    busyId,
    setSearch,
    setPage,
    setPageSize,
    reload,
    openCreate,
    openEdit,
    toggleStatus,
    remove,
    openView
  };
}