import type {
  BillingFrequency,
  ColumnKey,
  NumInput,
  Plan,
    PlanFormValues,
  PlanDetail,
  PlanListItem,
  PlanPayload,
  PlanTab,
  PlanUpdatePayload,
  PricingModel,
  ProductCode,
  RenewalMode,
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

export const formatMoney = (amount: number, currency?: string) => {
  if (!currency) return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(amount);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
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
const BILLING_API: Record<BillingFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half Yearly",
  yearly: "Yearly",
};

const PRICING_API: Record<PricingModel, string> = {
  flat: "Flat",
  per_module: "Per Module",
};

const RENEWAL_API: Record<RenewalMode, string> = {
  fixed: "Fixed Cycles",
  auto: "Auto-renew",
};

export const buildPlanPayload = (v: PlanFormValues): PlanPayload => ({
  plan_name: v.name.trim(),
  plan_code: v.code.trim() || generateCode(v.products),
  currency: v.currency,
  pricing_model: PRICING_API[v.pricingModel],
  billing_frequency: BILLING_API[v.billingFrequency],
    modules: v.modules.map((m) =>
    v.pricingModel === "per_module"
      ? { module: m, price: num(v.modulePrices[m] ?? 0) }
      : { module: m },
  ),
  user_limit: num(v.userLimit),
  description: v.description.trim(),
      ...(v.pricingModel === "flat" && { base_price: num(v.basePrice) }),
  setup_fee: num(v.setupFee),
  trial_enabled: v.freeTrial,
  trial_days: v.freeTrial ? num(v.trialDays) : 0,
  renewal_mode: RENEWAL_API[v.renewalMode],
  billing_cycles: v.renewalMode === "fixed" ? num(v.cycles) : 0,
});
const invert = <T extends string>(m: Record<T, string>) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<string, T>;

const BILLING_FROM_API = invert(BILLING_API);
const PRICING_FROM_API = invert(PRICING_API);

const toPlanStatus = (s?: string): Plan["status"] => {
  const v = s?.toLowerCase();
  if (v === "active") return "active";
  if (v === "inactive") return "inactive";
  return "draft";
};

export const fromListItem = (r: PlanListItem): Plan => {
  const values: PlanFormValues = {
    ...DEFAULT_VALUES,
    products: r.products ?? [],
    name: r.plan_name,
    code: r.plan_code,
    status: toPlanStatus(r.status),
    billingFrequency: BILLING_FROM_API[r.billing_frequency] ?? "monthly",
    pricingModel: PRICING_FROM_API[r.pricing_model] ?? "flat",
    currency: r.currency,
    basePrice: r.base_price,
  };
  return { ...toPlan(r.name, values), name: r.plan_name, code: r.plan_code };
};

const RENEWAL_FROM_API = invert(RENEWAL_API);

export const fromPlanDetail = (r: PlanDetail, fallbackProducts: string[] = []): Plan => {
  const mods = r.modules ?? [];
  const values: PlanFormValues = {
    ...DEFAULT_VALUES,
    products: r.products?.length ? r.products : fallbackProducts,
    name: r.plan_name,
    code: r.plan_code,
    userLimit: r.user_limit || "",
    description: r.description ?? "",
    status: r.status?.toLowerCase() === "active" ? "active" : "draft",
    modules: mods.map((m) => m.module),
    billingFrequency: BILLING_FROM_API[r.billing_frequency] ?? "monthly",
    pricingModel: PRICING_FROM_API[r.pricing_model] ?? "flat",
    currency: r.currency,
    basePrice: r.base_price ?? "",
    setupFee: r.setup_fee ?? "",
    modulePrices: Object.fromEntries(mods.map((m) => [m.module, m.price ?? 0])),
    freeTrial: !!r.trial_enabled,
    trialDays: r.trial_days || "",
    renewalMode: RENEWAL_FROM_API[r.renewal_mode ?? ""] ?? "auto",
    cycles: r.billing_cycles || "",
  };
  return { ...toPlan(r.name, values), name: r.plan_name, code: r.plan_code };
};

export const buildPlanUpdatePayload = (
  id: string,
  v: PlanFormValues,
  init: PlanFormValues,
): PlanUpdatePayload => {
  const p: PlanUpdatePayload = { id };
  const perModule = v.pricingModel === "per_module";
  const pricingChanged = v.pricingModel !== init.pricingModel;

  if (v.name.trim() !== init.name.trim()) p.plan_name = v.name.trim();
  if (v.code.trim() !== init.code.trim()) p.plan_code = v.code.trim();
  if (v.currency !== init.currency) p.currency = v.currency;
  if (pricingChanged) p.pricing_model = PRICING_API[v.pricingModel];
  if (v.billingFrequency !== init.billingFrequency) p.billing_frequency = BILLING_API[v.billingFrequency];
  if (num(v.userLimit) !== num(init.userLimit)) p.user_limit = num(v.userLimit);
  if (v.description.trim() !== init.description.trim()) p.description = v.description.trim();
  if (!perModule && (pricingChanged || num(v.basePrice) !== num(init.basePrice))) p.base_price = num(v.basePrice);
  if (num(v.setupFee) !== num(init.setupFee)) p.setup_fee = num(v.setupFee);
  if (v.freeTrial !== init.freeTrial) p.trial_enabled = v.freeTrial;
  if (num(v.trialDays) !== num(init.trialDays)) p.trial_days = v.freeTrial ? num(v.trialDays) : 0;
  if (v.renewalMode !== init.renewalMode) p.renewal_mode = RENEWAL_API[v.renewalMode];
  if (num(v.cycles) !== num(init.cycles)) p.billing_cycles = v.renewalMode === "fixed" ? num(v.cycles) : 0;

  const sameModules =
    [...v.modules].sort().join("|") === [...init.modules].sort().join("|");
  const pricesChanged =
    perModule && v.modules.some((m) => num(v.modulePrices[m] ?? 0) !== num(init.modulePrices[m] ?? 0));
  if (!sameModules || pricesChanged || pricingChanged) {
    p.modules = v.modules.map((m) =>
      perModule ? { module: m, price: num(v.modulePrices[m] ?? 0) } : { module: m },
    );
  }

  return p;
};