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