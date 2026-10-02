import type { UseFormReturnType } from "@mantine/form";
import type { ApiError } from "../api/utils/ApiError";

export type ProductCode = string;
export type PlanStatus = "draft" | "active";
export type BillingFrequency = "monthly" | "quarterly" | "half_yearly" | "yearly";
export type PricingModel = "flat" | "per_module";
export type RenewalMode = "auto" | "fixed";
export type PlanTab = "basic" | "modules" | "pricing" | "trial";
export type ColumnKey = "name" | "product" | "billing" | "price" | "trial" | "status";

export type NumInput = number | string; 

export interface ProductDef {
  code: ProductCode;
  name: string; 
  description: string; 
  color: string; 
}

export interface ModuleDef {
  id: string; 
  product: ProductCode; 
  code: string; 
  name: string; 
}

export interface SubModuleDef {
  id: string; 
  moduleId: string; 
  code: string; 
  name: string;
}

export type CatalogStatus = "loading" | "success" | "error";

export interface PlanCatalog {
  status: CatalogStatus;
  products: ProductDef[];
  modules: ModuleDef[];
  subModules: SubModuleDef[];
  subModulesByModule: Record<string, SubModuleDef[]>;
  error: ApiError | null;
  reload: () => void;
}

export interface PlanFormValues {
  products: ProductCode[];
  name: string;
  code: string;
  userLimit: NumInput;
  description: string;
  status: PlanStatus;
  modules: string[];
  billingFrequency: BillingFrequency;
  pricingModel: PricingModel;
  currency: string;
  basePrice: NumInput;
  setupFee: NumInput;
  modulePrices: Record<string, NumInput>;
  freeTrial: boolean;
  trialDays: NumInput;
  renewalMode: RenewalMode;
  cycles: NumInput;
}

export type PlanForm = UseFormReturnType<PlanFormValues>;

export interface Plan {
  id: string;
  name: string;
  code: string;
  products: ProductCode[];
  billingFrequency: BillingFrequency;
  pricingModel: PricingModel;
  price: number;
  currency: string;
  trialDays: number;
  status: PlanStatus;
  values: PlanFormValues; 
}