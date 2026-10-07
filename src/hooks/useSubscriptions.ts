import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { notifyError, notifySuccess } from "../utils/Alert";
import { cancelSubscription, getAllSubscriptions, getSubscriptionById } from "../api/Subscription/subscriptionApi";
import { getAllPlans } from "../api/planAPi";
import { getAllCustomers } from "../api/customerApi";
import { COLUMNS } from "../views/Subscription/CustomerSubscription/subscription.constants";
import type {
    ApiSubscription,
  CustomerOption,
  PlanListItem,
    SubscriptionDetail,
  SubscriptionColumnKey,
  SubscriptionFormValues,
} from "../types/subscription.types";

export function useSubscriptions() {
  const [rows, setRows] = useState<ApiSubscription[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [filters, setFilters] = useState({ search: "", status: "all" });
const [loading, setLoading] = useState(false);
const [reload, setReload] = useState(0);
const [plans, setPlans] = useState<PlanListItem[]>([]);
const [customers, setCustomers] = useState<CustomerOption[]>([]);
const [debouncedSearch] = useDebouncedValue(filters.search, 400);
 const [editing, setEditing] = useState<SubscriptionDetail | "new" | null>(null);
const [opening, setOpening] = useState<string | null>(null);
const [cancelTarget, setCancelTarget] = useState<ApiSubscription | null>(null);
const [cancelling, setCancelling] = useState(false);
  const [visible, setVisible] = useState<SubscriptionColumnKey[]>(COLUMNS.map((c) => c.key));
useEffect(() => {
let cancelled = false;
setLoading(true);
getAllSubscriptions(
page,
pageSize,
debouncedSearch.trim() || undefined,
filters.status === "all" ? undefined : filters.status,
    )
    .then((res) => {
if (cancelled) return;
setRows(res.data);
setTotal(res.pagination.total);
      })
    .catch((err) => notifyError(err, "Failed to load subscriptions"))
    .finally(() => {
if (!cancelled) setLoading(false);
      });
return () => {
cancelled = true;
    };
}, [page, pageSize, debouncedSearch, filters.status, reload]);

useEffect(() => {
getAllPlans(1, 100)
    .then((res) => setPlans((res.data as PlanListItem[]).filter((p) => p.status === "Active")))
    .catch((err) => notifyError(err, "Failed to load plans"));
getAllCustomers(1, 100)
    .then((res) => setCustomers((res.data as CustomerOption[]).filter((c) => c.status === "Active")))
    .catch((err) => notifyError(err, "Failed to load customers"));
}, []);

const list = {
rows,
total,
page,
pageSize,
filters,
loading,
setFilter: (patch: Partial<typeof filters>) => {
setFilters((f) => ({ ...f, ...patch }));
setPage(1);
    },
setPage,
setPageSize: (n: number) => {
setPageSize(n);
setPage(1);
    },
  };

  const confirmCancel = async (reason: string, immediate: boolean) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelSubscription({ id: cancelTarget.name, reason, immediate });
      notifySuccess(
        immediate
          ? `Subscription ${cancelTarget.name} has been cancelled.`
          : `Cancellation for subscription ${cancelTarget.name} has been scheduled.`,
        immediate ? "Subscription Cancelled" : "Cancellation Scheduled"
      );
      setCancelTarget(null);
      setReload((n) => n + 1);
    } catch (e: any) {
      notifyError(e, "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const toggleColumn =(key: SubscriptionColumnKey) =>
    setVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key]));

  const save = (_values: SubscriptionFormValues, number: string) => {
    setEditing(null);
    setReload((n) => n + 1);
    notifySuccess(`Subscription ${number} has been saved successfully.`, "Subscription Saved");
  };

  return {
    list,
    numbers: rows.map((s) => s.name),
    plans,
    customers,
    editing,
    visible,
    toggleColumn,
    openCreate: () => setEditing("new"),
    opening,
    cancelTarget,
    cancelling,
    openCancel: setCancelTarget,
    closeCancel: () => setCancelTarget(null),
    confirmCancel,
    openEdit: async (s: ApiSubscription) => {
      setOpening(s.name);
      try {
        const res = await getSubscriptionById(s.name);
        setEditing(res.data);
      } catch (err) {
        notifyError(err, "Failed to load subscription");
      } finally {
        setOpening(null);
      }
    },
    closeModal: () => setEditing(null),
    save,
  };
}