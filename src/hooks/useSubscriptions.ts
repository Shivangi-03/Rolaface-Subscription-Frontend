import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useClientList, type ListFilters } from "../hooks/useClientList";
import {
  COLUMNS,
  DUMMY_SUBSCRIPTIONS,
  findCustomer,
  findPlan,
  toSubscription,
} from "../views/Subscription/CustomerSubscription/subscription.constants";
import type { Subscription, SubscriptionColumnKey, SubscriptionFormValues } from "../types/subscription.types";

const match = (s: Subscription, f: ListFilters) => {
  const q = f.search.trim().toLowerCase();
  if (f.status !== "all" && s.status !== f.status) return false;
  if (!q) return true;
  const customer = findCustomer(s.values.customerId);
  const plan = findPlan(s.values.planId);
  return `${s.number} ${customer?.name ?? ""} ${customer?.company ?? ""} ${plan?.name ?? ""}`
    .toLowerCase()
    .includes(q);
};

export function useSubscriptions() {
  const [items, setItems] = useState<Subscription[]>(DUMMY_SUBSCRIPTIONS);
  const [editing, setEditing] = useState<Subscription | "new" | null>(null);
  const [visible, setVisible] = useState<SubscriptionColumnKey[]>(COLUMNS.map((c) => c.key));
  const list = useClientList(items, match);

  const toggleColumn = (key: SubscriptionColumnKey) =>
    setVisible((v) => (v.includes(key) ? v.filter((k) => k !== key) : [...v, key]));

  const save = (values: SubscriptionFormValues, number: string) => {
    const existing = editing !== null && editing !== "new" ? editing : null;
    const status = existing?.status ?? (findPlan(values.planId)?.values.freeTrial ? "trial" : "active");
    const sub = toSubscription(existing?.id ?? `sub-${Date.now()}`, number, status, values);

    setItems((prev) => (existing ? prev.map((s) => (s.id === sub.id ? sub : s)) : [sub, ...prev]));
    setEditing(null);
    notifications.show({
      color: "green",
      title: existing ? "Subscription updated" : "Subscription created",
      message: sub.number,
    });
  };

  return {
    list,
    numbers: items.map((s) => s.number),
    editing,
    visible,
    toggleColumn,
    openCreate: () => setEditing("new"),
    openEdit: (s: Subscription) => setEditing(s),
    closeModal: () => setEditing(null),
    save,
  };
}