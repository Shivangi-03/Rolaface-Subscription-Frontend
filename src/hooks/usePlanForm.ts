import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { DEFAULT_VALUES, PLAN_TABS, TAB_OF_FIELD, calcRate, num } from "../views/Subscription/Plan/plan.constants";
import type { PlanFormValues, PlanTab } from "../types/plan.types";

const validatePlan = (v: PlanFormValues) => {
  const e: Record<string, string> = {};
  if (!v.products.length) e.products = "Select at least one product";
  if (!v.name.trim()) e.name = "Plan name is required";
  if (v.userLimit !== "" && num(v.userLimit) < 1) e.userLimit = "Must be at least 1";
  if (!v.modules.length) e.modules = "Select at least one module";
  if (!v.currency) e.currency = "Currency is required";
  if (v.pricingModel === "flat" && num(v.basePrice) <= 0) e.basePrice = "Enter a base price";
  if (v.pricingModel === "per_module" && calcRate(v) <= 0) e.modulePrices = "Enter a price for at least one module";
  if (v.freeTrial && num(v.trialDays) < 1) e.trialDays = "Enter trial days";
  if (v.renewalMode === "fixed" && num(v.cycles) < 1) e.cycles = "Enter number of cycles";
  return e;
};

interface Options {
  initial?: PlanFormValues;
  onSave: (values: PlanFormValues) => void;
  onClose: () => void;
}

export function usePlanForm({ initial, onSave, onClose }: Options) {
  const form = useForm<PlanFormValues>({ initialValues: initial ?? DEFAULT_VALUES, validate: validatePlan });
  const [tab, setTab] = useState<PlanTab>("basic");
  const [saving, setSaving] = useState(false);

  const dirty = form.isDirty();
  const tabIndex = PLAN_TABS.findIndex((t) => t.value === tab);
  const isLast = tabIndex === PLAN_TABS.length - 1;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

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
    const result = form.validate();
    if (result.hasErrors) {
      setTab(TAB_OF_FIELD(Object.keys(result.errors)[0]));
      return;
    }
    setSaving(true);
    try {
      // TODO: await createPlan / updatePlan here
      await new Promise((r) => setTimeout(r, 400));
      onSave(form.values);
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    tab,
    setTab,
    isLast,
    saving,
    next: () => setTab(PLAN_TABS[Math.min(tabIndex + 1, PLAN_TABS.length - 1)].value),
    reset: () => {
      form.reset();
      setTab("basic");
    },
    submit,
    requestClose,
  };
}