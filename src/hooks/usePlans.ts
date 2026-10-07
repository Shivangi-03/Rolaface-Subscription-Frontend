import { useCallback, useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useClientList, type ListFilters } from "./useClientList";
import { COLUMNS, fromListItem, fromPlanDetail } from "../views/Subscription/Plan/plan.constants";
import { useModalStore } from "../store/modalstore";
import { REFRESH_KEYS, useDataRefreshStore } from "../store/datarefreshstore";
import type { ColumnKey, Plan, PlanDetail, PlanListItem } from "../types/plan.types";
import { getAllPlans, getPlanById, updatePlanStatus } from "../api/planAPi";
import { toApiError } from "../api/utils/ApiError";

const match = (p: Plan, f: ListFilters) => {
  const q = f.search.trim().toLowerCase();
  const moduleNames = q ? p.values.modules.join(" ") : "";
  return (
    (f.status === "all" || p.status === f.status) &&
    (f.product === "all" || p.products.includes(f.product as Plan["products"][number])) &&
    (!q || `${p.name} ${p.code} ${moduleNames}`.toLowerCase().includes(q))
  );
};

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
const [loading, setLoading] = useState(true);
const [reloadKey, setReloadKey] = useState(0);
const [busyId, setBusyId] = useState<string | null>(null);
const reload = useCallback(() => setReloadKey((k) => k + 1), []);
const refreshTick = useDataRefreshStore((s) => s.ticks[REFRESH_KEYS.PLAN_LIST] ?? 0);
const openModal = useModalStore((s) => s.openModal);

useEffect(() => {
  let cancelled = false;
  setLoading(true);
  getAllPlans(1, 20)
    .then((res) => {
      if (cancelled) return;
      if (!Array.isArray(res?.data)) throw new Error("Unexpected response format from server");
      setPlans((res.data as PlanListItem[]).map(fromListItem));
    })
    .catch((err) => {
      if (cancelled) return;
      setPlans([]);
      notifications.show({ color: "red", title: "Couldn't load plans", message: toApiError(err).message });
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
  return () => {
    cancelled = true;
  };
}, [reloadKey, refreshTick]);
  const [visible, setVisible] = useState<ColumnKey[]>(COLUMNS.map((c) => c.key));
  const list = useClientList(plans, match);

const openEdit = async (p: Plan) => {
  if (busyId) return;
  setBusyId(p.id);
  try {
    const res = await getPlanById(p.id);
    const detail = (res?.message?.data ?? res?.data) as PlanDetail | undefined;
    if (!detail || Array.isArray(detail)) throw new Error("Plan not found");
   openModal({
id: `plan-${p.id}`,
type: "plan",
title: `Edit ${p.name}`,
initialData: { ...fromPlanDetail(detail, p.products), id: p.id },
isEdit: true,
    });
  } catch (err) {
    notifications.show({ color: "red", title: "Couldn't load plan", message: toApiError(err).message });
  } finally {
    setBusyId(null);
  }
};

const changeStatus = async (p: Plan) => {
  if (busyId) return;
  const activating = p.status !== "active";
  setBusyId(p.id);
  try {
    await updatePlanStatus({ id: p.id, status: activating ? "Active" : "Inactive" });
    notifications.show({ color: "green", title: activating ? "Plan activated" : "Plan deactivated", message: p.name });
    reload();
  } catch (err) {
    notifications.show({ color: "red", title: "Couldn't update status", message: toApiError(err).message });
  } finally {
    setBusyId(null);
  }
};

const toggleColumn = (key: ColumnKey) =>
    setVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key]));

return {
list,
loading,
reload,
    visible,
    toggleColumn,
    openCreate: () => openModal({ type: "plan", id: "plan-new", title: "Add Plan" }),
   openEdit,
changeStatus,
busyId,
  };
}