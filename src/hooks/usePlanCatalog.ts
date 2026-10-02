import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPlanCatalog } from "../api/Subscription/PlanApi";
import { isCanceled, toApiError } from "../api/utils/ApiError";
import type { ApiError } from "../api/utils/ApiError";
import type { CatalogStatus, ModuleDef, PlanCatalog, ProductDef, SubModuleDef } from "../types/plan.types";

interface State {
  status: CatalogStatus;
  products: ProductDef[];
  modules: ModuleDef[];
  subModules: SubModuleDef[];
  error: ApiError | null;
}

const EMPTY: Omit<State, "status" | "error"> = { products: [], modules: [], subModules: [] };

export function usePlanCatalog(): PlanCatalog {
  const [state, setState] = useState<State>({ status: "loading", ...EMPTY, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading", error: null }));

    fetchPlanCatalog(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: "success", ...data, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isCanceled(err)) return;
        setState({ status: "error", ...EMPTY, error: toApiError(err) });
      });

    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);

  return useMemo(() => {
    const subModulesByModule: Record<string, SubModuleDef[]> = {};
    for (const s of state.subModules) (subModulesByModule[s.moduleId] ??= []).push(s);
    return { ...state, subModulesByModule, reload };
  }, [state, reload]);
}