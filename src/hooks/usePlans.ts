import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useClientList, type ListFilters } from "./useClientList";
import { COLUMNS, toPlan } from "../views/Subscription/Plan/plan.constants";
import type { ColumnKey, Plan, PlanFormValues } from "../types/plan.types";

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
  const [editing, setEditing] = useState<Plan | "new" | null>(null);
  const [visible, setVisible] = useState<ColumnKey[]>(COLUMNS.map((c) => c.key));
  const list = useClientList(plans, match);

  const toggleColumn = (key: ColumnKey) =>
    setVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key]));

  const save = (values: PlanFormValues) => {
    const isEdit = editing !== null && editing !== "new";
    const plan = toPlan(isEdit ? editing.id : `plan-${Date.now()}`, values);
    setPlans((prev) => (isEdit ? prev.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...prev]));
    setEditing(null);
    notifications.show({ color: "green", title: isEdit ? "Plan updated" : "Plan created", message: plan.name });
  };

  return {
    list,
    editing,
    visible,
    toggleColumn,
    openCreate: () => setEditing("new"),
    openEdit: (p: Plan) => setEditing(p),
    closeModal: () => setEditing(null),
    save,
  };
}