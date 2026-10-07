import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useForm } from "@mantine/form";
import { openCommonModal, notifyError } from "../utils/Alert";
import { getPlanById } from "../api/planAPi";
import { createSubscription, updateSubscription } from "../api/Subscription/subscriptionApi";
import { num } from "../views/Subscription/Plan/plan.constants";
import { useDataRefreshStore, REFRESH_KEYS } from "../store/datarefreshstore";
import { addPeriod, emptyValues } from"../views/Subscription/CustomerSubscription/subscription.constants";
import type { BillingFrequency } from "../types/plan.types";
import type {
PlanDetail,
SubscriptionDetail,
SubscriptionFormValues,
SubscriptionUpdatePayload,
} from "../types/subscription.types";

const toPlanDetail = (s: SubscriptionDetail): PlanDetail => ({
name: s.plan,
plan_name: s.plan_name,
plan_code: s.plan_code,
status: "Active",
base_price: s.plan_price,
currency: s.currency,
billing_frequency: s.plan_billing_frequency,
renewal_mode: s.renewal_mode,
billing_cycles: s.billing_cycles,
trial_enabled: s.trial_enabled,
trial_days: s.trial_days,
setup_fee: s.setup_fee,
products: s.products.split(",").map((p) => p.trim()).filter(Boolean),
modules: s.modules.filter((m) => m.is_enabled).map((m) => ({ ...m, currency: s.currency })),
});

const toFormValues = (s: SubscriptionDetail): SubscriptionFormValues => ({
customerId: s.customer,
planId: s.plan,
startDate: s.start_date,
expiryDate: s.expiry_date,
discount: s.discount_amount,
notes: s.notes ?? "",
});

const toFrequency = (f: string) => f.toLowerCase().replace(/[\s-]+/g, "_") as BillingFrequency;

const validateSubscription = (v: SubscriptionFormValues, price: number) => {
  const e: Record<string, string> = {};
  if (!v.customerId) e.customerId = "Select a customer";
  if (!v.planId) e.planId = "Select a plan";
  if (!v.startDate) e.startDate = "Start date is required";
  if (!v.expiryDate) e.expiryDate = "Expiry date is required";
  else if (v.startDate && !dayjs(v.expiryDate).isAfter(dayjs(v.startDate))) e.expiryDate = "Must be after start date";
  if (num(v.discount) < 0) e.discount = "Cannot be negative";
 else if (num(v.discount) > price) e.discount = "Cannot exceed plan price";
  return e;
};

interface Options {
 subscription: SubscriptionDetail | null;

  onClose: () => void;
}

export function useSubscriptionForm({ subscription, onClose }: Options) {
const [plan, setPlanDetail] = useState<PlanDetail | null>(() => (subscription ? toPlanDetail(subscription) : null));
const [planLoading, setPlanLoading] = useState(false);
const form = useForm<SubscriptionFormValues>({
initialValues: subscription ? toFormValues(subscription) : emptyValues(),
validate: (v) => validateSubscription(v, plan?.base_price ?? 0),
  });
const [number] = useState(() => subscription?.name ?? "");
  const [saving, setSaving] = useState(false);

  const dirty = form.isDirty();

  
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const setPlan = async (planId: string | null) => {
form.setFieldValue("planId", planId ?? "");
setPlanDetail(null);
if (!planId) return;
setPlanLoading(true);
try {
const res = await getPlanById(planId);
const detail: PlanDetail = res.data;
setPlanDetail(detail);
if (form.values.startDate) {
form.setFieldValue("expiryDate", addPeriod(form.values.startDate, toFrequency(detail.billing_frequency)));
      }
    } catch (err) {
      form.setFieldValue("planId", "");
      notifyError(err, "Failed to load plan");
    } finally {
setPlanLoading(false);
    }
  };

  const setStart = (date: string | null) => {
    form.setFieldValue("startDate", date ?? "");
if (date && plan) form.setFieldValue("expiryDate", addPeriod(date, toFrequency(plan.billing_frequency)));
  };

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

const done = (message: string) => {
useDataRefreshStore.getState().triggerRefresh(REFRESH_KEYS.SUBSCRIPTION_LIST);
notifications.show({ color: "green", title: "Subscription saved", message });
onClose();
  };

const submit = async () => {
    if (saving) return;
   if (form.validate().hasErrors) return;
if (subscription) {
const v = form.values;
const changes: Omit<SubscriptionUpdatePayload, "id"> = {
...(num(v.discount) !== num(subscription.discount_amount) && { discount_amount: num(v.discount) }),
...((v.notes ?? "") !== (subscription.notes ?? "") && { notes: v.notes }),
...(v.startDate !== subscription.start_date && { start_date: dayjs(v.startDate).format("YYYY-MM-DD") }),
    };
if (Object.keys(changes).length === 0) return onClose();
setSaving(true);
try {
await updateSubscription({ id: subscription.name, ...changes });
done(subscription.name);
    } catch (e: any) {
      notifyError(e, "Failed to update subscription");
    } finally {
      setSaving(false);
    }
    return;
  }
  setSaving(true);
    try {
     const v = form.values;
const resp = await createSubscription({
customer: v.customerId,
plan: v.planId,
start_date: dayjs(v.startDate).format("YYYY-MM-DD"),
billing_frequency: plan?.billing_frequency ?? "",
discount_amount: num(v.discount),
...(v.notes && { notes: v.notes }),
    });
done(resp?.data?.name ?? "Subscription created");
    } catch (e: any) {
      notifyError(e, "Failed to create subscription");
    } finally {
      setSaving(false);
    }
  };

  return { form, number, saving, plan, planLoading, setPlan, setStart, submit, requestClose };
}