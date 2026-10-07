import { useCallback, useEffect, useState } from "react";
import { openCommonModal, notifyError, notifySuccess } from "../utils/Alert";
import { useClientList, type ListFilters } from "./useClientList";
import { COLUMNS, fromListItem, fromPlanDetail } from "../views/Subscription/Plan/plan.constants";
import { useModalStore } from "../store/modalstore";
import { REFRESH_KEYS, useDataRefreshStore } from "../store/datarefreshstore";
import type { ColumnKey, Plan, PlanDetail, PlanListItem } from "../types/plan.types";
import { getAllPlans, getPlanById, updatePlanStatus } from "../api/planAPi";
import { useDebouncedValue } from "@mantine/hooks";

const match = (_p: Plan, _f: ListFilters) => true;
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
const [loading, setLoading] = useState(true);
const [reloadKey, setReloadKey] = useState(0);
const [busyId, setBusyId] = useState<string | null>(null);
const reload = useCallback(() => setReloadKey((k) => k + 1), []);
const refreshTick = useDataRefreshStore((s) => s.ticks[REFRESH_KEYS.PLAN_LIST] ?? 0);
const openModal = useModalStore((s) => s.openModal);
const list = useClientList(plans, match);
const [search] = useDebouncedValue(list.filters.search.trim(), 400);

useEffect(() => {
  let cancelled = false;
  setLoading(true);
getAllPlans(1, 20, search)
    .then((res) => {
      if (cancelled) return;
      if (!Array.isArray(res?.data)) throw new Error("Unexpected response format from server");
      setPlans((res.data as PlanListItem[]).map(fromListItem));
    })
    .catch((err) => {
      if (cancelled) return;
      setPlans([]);
      notifyError(err, "Couldn't load plans");
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
  return () => {
    cancelled = true;
  };
}, [reloadKey, refreshTick, search]);
  const [visible, setVisible] = useState<ColumnKey[]>(COLUMNS.map((c) => c.key));

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
    notifyError(err, "Couldn't load plan");
  } finally {
    setBusyId(null);
  }
};

const changeStatus = (p: Plan) => {
  if (busyId) return;
  const activating = p.status !== "active";
  openCommonModal({
    heading: activating ? "Activate Plan" : "Deactivate Plan",
    subtitle: "Please confirm your action.",
    body: `Plan "${p.name}" will be ${activating ? "activated" : "deactivated"}.`,
    color: activating ? "green" : "red",
    buttons: [
      { label: "Cancel", variant: "default" },
      {
        label: activating ? "Activate" : "Deactivate",
        color: activating ? "green" : "red",
        onClick: async () => {
          setBusyId(p.id);
          try {
            await updatePlanStatus({ id: p.id, status: activating ? "Active" : "Inactive" });
            notifySuccess(
              `Plan "${p.name}" has been ${activating ? "activated" : "deactivated"} successfully.`,
              activating ? "Plan Activated" : "Plan Deactivated"
            );
            reload();
          } catch (err) {
            notifyError(err, "Couldn't update status");
          } finally {
            setBusyId(null);
          }
        },
      },
    ],
  });
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