import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { num } from "../views/Subscription/Plan/plan.constants";
import { addPeriod, calcTotals, emptyValues, findPlan, nextNumber } from "../views/Subscription/CustomerSubscription/subscription.constants";
import type { Subscription, SubscriptionFormValues } from "../types/subscription.types";

const validateSubscription = (v: SubscriptionFormValues) => {
  const e: Record<string, string> = {};
  if (!v.customerId) e.customerId = "Select a customer";
  if (!v.planId) e.planId = "Select a plan";
  if (!v.startDate) e.startDate = "Start date is required";
  if (!v.expiryDate) e.expiryDate = "Expiry date is required";
  else if (v.startDate && !dayjs(v.expiryDate).isAfter(dayjs(v.startDate))) e.expiryDate = "Must be after start date";
  if (num(v.discount) < 0) e.discount = "Cannot be negative";
  else if (num(v.discount) > calcTotals(findPlan(v.planId), 0).subtotal) e.discount = "Cannot exceed plan price";
  return e;
};

interface Options {
  subscription: Subscription | null; 
  numbers: string[]; 
  onSave: (values: SubscriptionFormValues, number: string) => void;
  onClose: () => void;
}

export function useSubscriptionForm({ subscription, numbers, onSave, onClose }: Options) {
  const form = useForm<SubscriptionFormValues>({
    initialValues: subscription?.values ?? emptyValues(),
    validate: validateSubscription,
  });
  const [number] = useState(() => subscription?.number ?? nextNumber(numbers));
  const [saving, setSaving] = useState(false);

  const dirty = form.isDirty();

  
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setPlan = (planId: string | null) => {
    form.setFieldValue("planId", planId ?? "");
    const plan = planId ? findPlan(planId) : undefined;
    if (plan && form.values.startDate) {
      form.setFieldValue("expiryDate", addPeriod(form.values.startDate, plan.billingFrequency));
    }
  };

  const setStart = (date: string | null) => {
    form.setFieldValue("startDate", date ?? "");
    const plan = findPlan(form.values.planId);
    if (date && plan) form.setFieldValue("expiryDate", addPeriod(date, plan.billingFrequency));
  };

  const requestClose = () => {
    if (saving) return;
    if (!form.isDirty()) return onClose();
    modals.openConfirmModal({
      title: "Discard changes?",
      children: "You have unsaved changes. If you close now, they will be lost.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      onConfirm: onClose,
    });
  };

  const submit = async () => {
    if (saving) return;
    if (form.validate().hasErrors) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      onSave(form.values, number);
    } finally {
      setSaving(false);
    }
  };

  return { form, number, saving, setPlan, setStart, submit, requestClose };
}