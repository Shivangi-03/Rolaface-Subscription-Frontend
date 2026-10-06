import { useCallback, useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useClientList, type ListFilters } from "./useClientList";
import { COLUMNS, fromListItem, fromPlanDetail } from "../views/Subscription/Plan/plan.constants";
import type { ColumnKey, Plan, PlanDetail, PlanFormValues, PlanListItem } from "../types/plan.types";
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
}, [reloadKey]);
  const [editing, setEditing] = useState<Plan | "new" | null>(null);
  const [visible, setVisible] = useState<ColumnKey[]>(COLUMNS.map((c) => c.key));
  const list = useClientList(plans, match);

const openEdit = async (p: Plan) => {
  if (busyId) return;
  setBusyId(p.id);
  try {
    const res = await getPlanById(p.id);
    const detail = (res?.message?.data ?? res?.data) as PlanDetail | undefined;
    if (!detail || Array.isArray(detail)) throw new Error("Plan not found");
    setEditing({ ...fromPlanDetail(detail, p.products), id: p.id });
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

 const save = (values: PlanFormValues) => {
  const isEdit = editing !== null && editing !== "new";
  setEditing(null);
  notifications.show({
    color: "green",
    title: isEdit ? "Plan updated" : "Plan created",
    message: values.name.trim(),
  });
  reload();
};
return {
list,
loading,
reload,
    editing,
    visible,
    toggleColumn,
    openCreate: () => setEditing("new"),
   openEdit,
changeStatus,
busyId,
    closeModal: () => setEditing(null),
    save,
  };
}