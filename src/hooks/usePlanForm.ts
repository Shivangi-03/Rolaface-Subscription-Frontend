import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { openCommonModal, notifyError } from "../utils/Alert";
import { DEFAULT_VALUES, PLAN_TABS, TAB_OF_FIELD, buildPlanPayload, buildPlanUpdatePayload, calcRate, num } from "../views/Subscription/Plan/plan.constants";
import { createPlan, updatePlan } from "../api/planAPi";
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
onSave: (values: PlanFormValues) => void | Promise<void>;
onClose: () => void;
isEdit?: boolean;
planId?: string;
}

export function usePlanForm({ initial, onSave, onClose, isEdit = false, planId }: Options) {
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
    openCommonModal({
      heading: "Discard Changes",
      subtitle: "You have unsaved changes.",
      body: "If you close now, your unsaved changes will be lost.",
      color: "red",
      buttons: [
        { label: "Keep editing", variant: "default" },
        { label: "Discard", color: "red", onClick: onClose },
      ],
    });
  };

const submit = async () => {
console.log("1 submit clicked");
if (saving) return;
const result = form.validate();
console.log("2 validation errors", result.errors);
    if (result.hasErrors) {
      const first = Object.keys(result.errors)[0];
      if (first) setTab(TAB_OF_FIELD(first));
      return;
    }
    setSaving(true);
 try {
if (!isEdit) {
const payload = buildPlanPayload(form.values);
console.log("PLAN PAYLOAD", JSON.stringify(payload, null, 2));
await createPlan(payload);
      }
if (isEdit && planId) {
  const payload = buildPlanUpdatePayload(planId, form.values, initial ?? DEFAULT_VALUES);
  console.log("PLAN UPDATE PAYLOAD", payload);
  if (Object.keys(payload).length > 1) await updatePlan(payload);
}
await onSave(form.values);
    } catch (err) {
      notifyError(err, "Couldn't save plan");
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
    next: () => {
      const nextTab = PLAN_TABS[Math.min(tabIndex + 1, PLAN_TABS.length - 1)];
      if (nextTab) setTab(nextTab.value);
    },
    reset: () => {
      form.reset();
      setTab("basic");
    },
    submit,
    requestClose,
  };
}