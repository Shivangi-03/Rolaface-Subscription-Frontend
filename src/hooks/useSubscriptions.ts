import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { notifyError, notifySuccess } from "../utils/Alert";
import { cancelSubscription, getAllSubscriptions, getSubscriptionById } from "../api/Subscription/subscriptionApi";
import { useModalStore } from "../store/modalstore";
import { REFRESH_KEYS, useDataRefreshStore } from "../store/datarefreshstore";
import { COLUMNS } from "../views/Subscription/CustomerSubscription/subscription.constants";
import type {
    ApiSubscription,
  SubscriptionColumnKey,
} from "../types/subscription.types";

export function useSubscriptions() {
  const [rows, setRows] = useState<ApiSubscription[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [filters, setFilters] = useState({ search: "", status: "all" });
const [loading, setLoading] = useState(false);
const reload = useDataRefreshStore((s) => s.ticks[REFRESH_KEYS.SUBSCRIPTION_LIST] ?? 0);
const triggerRefresh = useDataRefreshStore((s) => s.triggerRefresh);
const openModal = useModalStore((s) => s.openModal);

const [debouncedSearch] = useDebouncedValue(filters.search, 400);
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
      triggerRefresh(REFRESH_KEYS.SUBSCRIPTION_LIST);
    } catch (e: any) {
      notifyError(e, "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const toggleColumn =(key: SubscriptionColumnKey) =>
    setVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key]));
  return {
    list,

    visible,
    toggleColumn,
    openCreate: () => openModal({ type: "subscription", id: "subscription-new", title: "Add Subscription" }),
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
        openModal({
          id: `subscription-${res.data.name}`,
          type: "subscription",
          title: `Edit ${res.data.name}`,
          initialData: res.data,
          isEdit: true,
        });
      } catch (err) {
        notifyError(err, "Failed to load subscription");
      } finally {
        setOpening(null);
      }
    },
    
  };
}