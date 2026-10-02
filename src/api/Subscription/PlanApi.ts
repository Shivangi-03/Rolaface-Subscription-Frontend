import { createAxiosInstance } from "../axiosInstance";
import { API, ERP_BASE } from "../../config/api";
import type { ModuleDef, ProductDef, SubModuleDef } from "../../types/plan.types";

const api = createAxiosInstance(ERP_BASE);

interface RawProduct {
  name?: string;
  product_code?: string | null;
  product_name?: string | null;
  description?: string | null;
}
interface RawModule {
  name?: string;
  product?: string | null;
  module_code?: string | null;
  module_name?: string | null;
}
interface RawSubModule {
  name?: string;
  parent?: string | null;
  sub_module_code?: string | null;
  sub_module_name?: string | null;
}
interface ListResponse<T> {
  data?: T[];
}

const PALETTE = ["teal", "blue", "violet", "orange", "pink", "cyan", "grape", "lime"];


const getList = async <T>(
  url: string,
  fields: string[],
  orderBy: string,
  signal?: AbortSignal,
  extra: Record<string, string> = {},
): Promise<T[]> => {
  const resp = await api.get<ListResponse<T>>(url, {
    params: {
      fields: JSON.stringify(fields),
      filters: JSON.stringify([["is_active", "=", 1]]),
      order_by: orderBy,
      limit_page_length: 0,
      ...extra,
    },
    signal,
  });
  const rows = resp.data?.data;
  if (!Array.isArray(rows)) {
    // e.g. proxy returned the SPA's index.html instead of JSON
    throw new Error("Unexpected response format from server");
  }
  return rows;
};

const clean = (v: string | null | undefined): string => (typeof v === "string" ? v.trim() : "");

export const fetchProducts = async (signal?: AbortSignal): Promise<ProductDef[]> => {
  const rows = await getList<RawProduct>(
    API.plan.products,
    ["name", "product_code", "product_name", "description"],
    "creation asc, name asc",
    signal,
  );

  const seen = new Set<string>();
  const out: ProductDef[] = [];
  for (const r of rows) {
    const name = clean(r.name);
    if (!name) continue;
    const code = clean(r.product_code) || name;
    if (seen.has(code)) continue;
    seen.add(code);
    out.push({
      code,
      name: clean(r.product_name) || code,
      description: clean(r.description),
      color: PALETTE[out.length % PALETTE.length],
    });
  }
  return out;
};

export const fetchModules = async (signal?: AbortSignal): Promise<ModuleDef[]> => {
  const rows = await getList<RawModule>(
    API.plan.modules,
    ["name", "product", "module_code", "module_name"],
    "creation asc, name asc",
    signal,
  );

  const seen = new Set<string>();
  const out: ModuleDef[] = [];
  for (const r of rows) {
    const id = clean(r.name);
    const product = clean(r.product);
    if (!id || !product || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      product,
      code: clean(r.module_code) || id,
      name: clean(r.module_name) || clean(r.module_code) || id,
    });
  }
  return out;
};

export const fetchSubModules = async (signal?: AbortSignal): Promise<SubModuleDef[]> => {
  const rows = await getList<RawSubModule>(
    API.plan.subModules,
    ["name", "parent", "sub_module_code", "sub_module_name"],
    "idx asc, creation asc",
    signal,
    { parent: "Custom Module" }, 
  );

  const seen = new Set<string>();
  const out: SubModuleDef[] = [];
  for (const r of rows) {
    const id = clean(r.name);
    const moduleId = clean(r.parent);
    if (!id || !moduleId || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      moduleId,
      code: clean(r.sub_module_code) || id,
      name: clean(r.sub_module_name) || clean(r.sub_module_code) || id,
    });
  }
  return out;
};


export const fetchPlanCatalog = async (signal?: AbortSignal) => {
  const [products, modules, subModules] = await Promise.all([
    fetchProducts(signal),
    fetchModules(signal),
    fetchSubModules(signal),
  ]);

  const productCodes = new Set(products.map((p) => p.code));
  const validModules = modules.filter((m) => productCodes.has(m.product));
  const moduleIds = new Set(validModules.map((m) => m.id));

  return {
    products,
    modules: validModules,
    subModules: subModules.filter((s) => moduleIds.has(s.moduleId)),
  };
};