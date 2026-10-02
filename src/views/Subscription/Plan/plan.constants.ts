import type {
  BillingFrequency,
  ColumnKey,
  NumInput,
  Plan,
  PlanFormValues,
  PlanTab,
  PricingModel,
  ProductCode,
} from "../../../types/plan.types";



export const BILLING_OPTIONS: { value: BillingFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half-Yearly" },
  { value: "yearly", label: "Yearly" },
];
export const BILLING_LABEL = Object.fromEntries(BILLING_OPTIONS.map((o) => [o.value, o.label])) as Record<BillingFrequency, string>;
export const BILLING_SUFFIX: Record<BillingFrequency, string> = {
  monthly: "/mo",
  quarterly: "/qtr",
  half_yearly: "/half-yr",
  yearly: "/yr",
};
export const PRICING_LABEL: Record<PricingModel, string> = { flat: "Flat Pricing", per_module: "Per Module Pricing" };

export const CURRENCIES = ["USD", "INR", "EUR", "GBP", "AED", "SGD"];

export const PLAN_TABS: { value: PlanTab; label: string }[] = [
  { value: "basic", label: "Basic Information" },
  { value: "modules", label: "Modules & Features" },
  { value: "pricing", label: "Pricing & Billing" },
  { value: "trial", label: "Trial & Renewal" },
];

export const TAB_OF_FIELD = (field: string): PlanTab => {
  if (field === "modules") return "modules";
  if (["currency", "basePrice", "setupFee"].includes(field) || field.startsWith("modulePrices")) return "pricing";
  if (["trialDays", "cycles"].includes(field)) return "trial";
  return "basic";
};

export const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "name", label: "Plan Name" },
  { key: "product", label: "Product" },
  { key: "billing", label: "Billing" },
  { key: "price", label: "Price" },
  { key: "trial", label: "Trial" },
  { key: "status", label: "Status" },
];

export const DEFAULT_VALUES: PlanFormValues = {
  products: [],
  name: "",
  code: "",
  userLimit: "",
  description: "",
  status: "draft",
  modules: [],
  billingFrequency: "monthly",
  pricingModel: "flat",
  currency: "USD",
  basePrice: "",
  setupFee: "",
  modulePrices: {},
  freeTrial: false,
  trialDays: "",
  renewalMode: "auto",
  cycles: "",
};

export const num = (v: NumInput) => (typeof v === "number" ? v : Number(v) || 0);

export const calcRate = (v: PlanFormValues) =>
  v.pricingModel === "flat" ? num(v.basePrice) : v.modules.reduce((sum, id) => sum + num(v.modulePrices[id] ?? 0), 0);

export const generateCode = (products: ProductCode[]) =>
  products.length ? `${products.join("-")}-${new Date().getFullYear()}` : "";

export const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

export const toPlan = (id: string, values: PlanFormValues): Plan => ({
  id,
  name: values.name.trim(),
  code: values.code.trim() || generateCode(values.products),
  products: values.products,
  billingFrequency: values.billingFrequency,
  pricingModel: values.pricingModel,
  price: calcRate(values),
  currency: values.currency,
  trialDays: values.freeTrial ? num(values.trialDays) : 0,
  status: values.status,
  values,
});