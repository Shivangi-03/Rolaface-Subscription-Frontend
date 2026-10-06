import dayjs from "dayjs";
import { num } from "../../../views/Subscription/Plan/plan.constants";
import type { BillingFrequency, ModuleDef, Plan, ProductDef } from "../../../types/plan.types";
import type {
  Customer,
  Subscription,
  SubscriptionColumnKey,
  SubscriptionFormValues,
  SubscriptionStatus,
} from "../../../types/subscription.types";

export const GST_RATE = 0.18;
export const DATE_FORMAT = "YYYY-MM-DD";

export const STATUS_COLOR: Record<SubscriptionStatus, string> = {
  active: "green",
  trial: "blue",
  expired: "orange",
  cancelled: "red",
};
export const statusColor = (s: string) =>
  STATUS_COLOR[s.toLowerCase() as SubscriptionStatus] ?? "gray";
export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

export const COLUMNS: { key: SubscriptionColumnKey; label: string }[] = [
  { key: "number", label: "Subscription" },
  { key: "customer", label: "Customer" },
  { key: "plan", label: "Plan" },
  { key: "period", label: "Contract Period" },
  { key: "total", label: "Total (incl. GST)" },
  { key: "status", label: "Status" },
];

const BILLING_MONTHS: Record<BillingFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
};


export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Apex Global Logistics", company: "Apex Global" },
  { id: "c2", name: "Nexus FinTech Ltd", company: "Nexus FinTech" },
  { id: "c3", name: "Northridge Systems", company: "Northridge" },
  { id: "c4", name: "Summit Lending Corp", company: "Summit Lending" },
  { id: "c5", name: "Mr. ABCD", company: "ABCD Corp" },
];


export const activePlans = (plans: Plan[] | undefined): Plan[] => (plans ?? []).filter((p) => p.status === "active");
export const findPlan = (plans: Plan[] | undefined, id: string): Plan | undefined =>
  id ? (plans ?? []).find((p) => p.id === id) : undefined;
export const findCustomer = (id: string) => CUSTOMERS.find((c) => c.id === id);

export const emptyValues = (): SubscriptionFormValues => ({
  customerId: "",
  planId: "",
  startDate: dayjs().format(DATE_FORMAT),
  expiryDate: "",
  discount: "",
  notes: "",
});

export const addPeriod = (start: string, frequency: BillingFrequency) =>
  dayjs(start).add(BILLING_MONTHS[frequency], "month").format(DATE_FORMAT);

export const nextNumber = (existing: string[]) => {
  const year = new Date().getFullYear();
  const max = existing.reduce((m, n) => Math.max(m, Number(n.split("-").pop()) || 0), 0);
  return `SUB-${year}-${String(max + 1).padStart(4, "0")}`;
};

export const calcTotals = (plan: Plan | undefined, discount: number | string) => {
  const subtotal = plan?.price ?? 0;
  const disc = Math.min(Math.max(num(discount), 0), subtotal);
  const tax = Math.round((subtotal - disc) * GST_RATE * 100) / 100;
  return { subtotal, discount: disc, tax, total: subtotal - disc + tax };
};

export const formatDate = (iso: string) => {
  const d = dayjs(iso);
  return iso && d.isValid() ? d.format("DD MMM YYYY") : "-";
};

export const trialText = (plan: Plan) =>
  plan.values.freeTrial ? `${num(plan.values.trialDays)} Days Free Trial` : "No Trial";

export const renewalText = (plan: Plan) =>
  plan.values.renewalMode === "auto" ? "Auto-renew" : `Fixed ${num(plan.values.cycles)} Cycles`;

export const entitlements = (plan: Plan, products: ProductDef[] = [], modules: ModuleDef[] = []) => {
  const selectedIds = new Set(plan.values.modules);
  return products
    .filter((p) => plan.products.includes(p.code))
    .map((p) => {
      const productModules = modules.filter((m) => m.product === p.code);
      return {
        ...p,
        total: productModules.length,
        selected: productModules.filter((m) => selectedIds.has(m.id)).length,
      };
    });
};

export const toSubscription = (
  id: string,
  number: string,
  status: SubscriptionStatus,
  values: SubscriptionFormValues,
  plan: Plan | undefined,
): Subscription => ({
  id,
  number,
  status,
  total: calcTotals(plan, values.discount).total,
  values,
});

export const DUMMY_SUBSCRIPTIONS: Subscription[] = [];