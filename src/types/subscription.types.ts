export type SubscriptionStatus = "active" | "trial" | "expired" | "cancelled";
export type SubscriptionColumnKey = "number" | "customer" | "plan" | "period" | "total" | "status";

export interface Customer {
  id: string;
  name: string;
  company: string;
}

export interface SubscriptionFormValues {
  customerId: string;
  planId: string;
  startDate: string; 
  expiryDate: string; 
  discount: number | string; 
  notes: string;
}

export interface Subscription {
  id: string;
  number: string;
  status: SubscriptionStatus;
  total: number; 
  values: SubscriptionFormValues; 
}

export interface ApiSubscription {
  name: string;
  customer: string;
  customer_name: string;
  plan: string;
  plan_name: string;
  billing_frequency: string;
  period_months: number;
  currency: string;
  subtotal: number;
  discount_amount: number;
  grand_total: number;
  renewal_mode: string;
  billing_cycles: number;
  start_date: string;
  trial_end_date: string | null;
  end_date: string | null;
  cancelled_on: string | null;
  creation: string;
  modified: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  expiry_date: string;
  cancel_scheduled: boolean;
}

export interface GetAllSubscriptionsResponse {
  status_code: number;
  status: string;
  message: string;
  data: ApiSubscription[];
  pagination: { total: number; page: number; page_size: number; total_pages: number };
}

export interface SubscriptionPayload {
  customer: string;
  plan: string;
  start_date: string;
  end_date: string; 
  billing_frequency: string;
  discount_amount: number;
  notes?: string;
}

export interface CustomerOption {
  id: string;
  name: string;
  currency: string;
  status: string;
}

export interface PlanListItem {
  name: string;
  plan_name: string;
  status: string;
  base_price: number;
  currency: string;
  billing_frequency: string;
}

export interface PlanDetail extends PlanListItem {
  plan_code: string;
  renewal_mode: string;
  billing_cycles: number;
  trial_enabled: number;
  trial_days: number;
  setup_fee: number;
  products: string[];
  modules: { product: string; module: string; module_name: string; price: number; currency: string }[];
}

export interface SubscriptionDetail extends ApiSubscription {
  plan_code: string;
  pricing_model: string;
  plan_billing_frequency: string;
  custom_interval_months: number;
  plan_price: number;
  setup_fee: number;
  discount_reason: string | null;
  trial_enabled: number;
  trial_days: number;
  user_limit: number;
  products: string;
  cancel_reason: string | null;
  notes: string | null;
  request_id: string | null;
  modules: { name: string; module: string; module_name: string; product: string; price: number; is_enabled: number }[];
}
export interface SubscriptionUpdatePayload {
  id: string;
  customer?: string;
  plan?: string;
  start_date?: string;
  end_date?: string;
  billing_frequency?: string;
  discount_amount?: number;
  notes?: string;
}
export interface SubscriptionCancelPayload {
  id: string;
  reason: string;
  immediate: boolean;
}