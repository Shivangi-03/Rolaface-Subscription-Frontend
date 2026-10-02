import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useDebouncedValue } from "@mantine/hooks";
import {
  createCustomer,
  deleteCustomerById,
  getAllCustomers,
  getCustomerByCustomerCode,
  updateCustomerByCustomerCode,
  updateCustomerStatus,
} from "../api/customerApi";
import { buildCreatePayload, buildUpdatePayload } from "../views/Customer/customer.constants";
import type { CustomerDetail, CustomerFormValues, CustomerSummary } from "../types/customer.types";
import { toApiError } from "../api/utils/ApiError";

const notifyError = (title: string, err: unknown) =>
  notifications.show({ color: "red", title, message: toApiError(err).message });

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

  const [editing, setEditing] = useState<CustomerDetail | "new" | null>(null);
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
        setError(toApiError(err).message);
      })
      .finally(() => {
        if (requestId === latestRequest.current) setLoading(false);
      });
  }, [page, pageSize, debouncedSearch, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  const openCreate = () => setEditing("new");
  const closeModal = () => setEditing(null);

  const openEdit = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await getCustomerByCustomerCode(id);
      const detail = (res?.message?.data ?? res?.data) as CustomerDetail | undefined;
      if (!detail) throw new Error("Customer not found");
      setEditing({ ...detail, id: detail.id ?? id });
    } catch (err) {
      notifyError("Couldn't load customer", err);
    } finally {
      setBusyId(null);
    }
  };

  // Throws on failure so the modal stays open with the user's data.
  const save = async (values: CustomerFormValues) => {
    const current = editing;
    try {
      if (current && current !== "new") {
        await updateCustomerByCustomerCode(current.id, buildUpdatePayload(values, current));
        notifications.show({ color: "green", title: "Customer updated", message: values.name.trim() });
      } else {
        const res = await createCustomer(buildCreatePayload(values));
        const newId = res?.message?.data?.customerId as string | undefined;
        notifications.show({
          color: "green",
          title: "Customer created",
          message: newId ? `${values.name.trim()} (${newId})` : values.name.trim(),
        });
      }
      setEditing(null);
      reload();
    } catch (err) {
      notifyError("Couldn't save customer", err);
      throw err;
    }
  };

  const toggleStatus = (row: CustomerSummary) => {
    const disabling = row.status === "Active";
    modals.openConfirmModal({
      title: disabling ? "Disable customer?" : "Enable customer?",
      children: `${row.name} (${row.id}) will be ${disabling ? "disabled" : "enabled"}.`,
      labels: { confirm: disabling ? "Disable" : "Enable", cancel: "Cancel" },
      confirmProps: { color: disabling ? "red" : "green" },
      onConfirm: async () => {
        try {
          await updateCustomerStatus(row.id, disabling ? "inactive" : "active");
          notifications.show({ color: "green", title: disabling ? "Customer disabled" : "Customer enabled", message: row.name });
          reload();
        } catch (err) {
          notifyError("Couldn't update status", err);
        }
      },
    });
  };

  const remove = (row: CustomerSummary) => {
    modals.openConfirmModal({
      title: "Delete customer?",
      children: `Delete ${row.name} (${row.id})? This cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteCustomerById(row.id);
          notifications.show({ color: "green", title: "Customer deleted", message: row.name });
          // deleted the only row on this page => go back one page
          if (rows.length === 1 && page > 1) setPage((p) => p - 1);
          else reload();
        } catch (err) {
          notifyError("Couldn't delete customer", err);
        }
      },
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
    editing,
    setSearch,
    setPage,
    setPageSize,
    reload,
    openCreate,
    openEdit,
    closeModal,
    save,
    toggleStatus,
    remove,
  };
}