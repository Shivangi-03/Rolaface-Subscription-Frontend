import { useEffect, useState } from "react";
import { notifyError } from "../utils/Alert";
import { getAllPlans } from "../api/planAPi";
import { getAllCustomers } from "../api/customerApi";
import type { CustomerOption, PlanListItem } from "../types/subscription.types";

export function useSubscriptionLookups() {
  const [plans, setPlans] = useState<PlanListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  useEffect(() => {
    getAllPlans(1, 100)
      .then((res) => setPlans((res.data as PlanListItem[]).filter((p) => p.status === "Active")))
      .catch((err) => notifyError(err, "Failed to load plans"));
    getAllCustomers(1, 100)
      .then((res) => setCustomers((res.data as CustomerOption[]).filter((c) => c.status === "Active")))
      .catch((err) => notifyError(err, "Failed to load customers"));
  }, []);

  return { plans, customers };
}