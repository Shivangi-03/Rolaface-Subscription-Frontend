import { create } from "zustand";

export const REFRESH_KEYS = {
    SUBSCRIPTION_LIST: "subscription_list",
   PLAN_LIST: "plan_list",
  CUSTOMER_LIST: "customer_list",
} as const;

interface DataRefreshState {
  ticks: Record<string, number>;
  triggerRefresh: (key: string) => void;
}

export const useDataRefreshStore = create<DataRefreshState>((set) => ({
  ticks: {},
  triggerRefresh: (key) => set((s) => ({ ticks: { ...s.ticks, [key]: (s.ticks[key] ?? 0) + 1 } })),
}));