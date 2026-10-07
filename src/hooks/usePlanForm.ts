import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { DEFAULT_VALUES, PLAN_TABS, TAB_OF_FIELD, buildPlanPayload, buildPlanUpdatePayload, calcRate, num } from "../views/Subscription/Plan/plan.constants";
import { createPlan, updatePlan } from "../api/planAPi";
import { toApiError } from "../api/utils/ApiError";
import { REFRESH_KEYS, useDataRefreshStore } from "../../src/store/datarefreshstore";
import { notifications } from "@mantine/notifications";
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
onClose: () => void;
isEdit?: boolean;
planId?: string;
}

export function usePlanForm({ initial, onClose, isEdit = false, planId }: Options) {
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
console.log("1 submit clicked");
if (saving) return;
const result = form.validate();
console.log("2 validation errors", result.errors);
    if (result.hasErrors) {
      setTab(TAB_OF_FIELD(Object.keys(result.errors)[0]));
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
useDataRefreshStore.getState().triggerRefresh(REFRESH_KEYS.PLAN_LIST);
notifications.show({ color: "green", title: isEdit ? "Plan updated" : "Plan created", message: form.values.name });
onClose();
    } catch (err) {
notifications.show({ color: "red", title: "Couldn't save plan", message: toApiError(err).message });
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