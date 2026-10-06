import type { AxiosResponse } from "axios";
import { createAxiosInstance } from "./axiosInstance";
import { API, ERP_BASE } from "../config/api";
import type { PlanPayload, PlanStatusPayload, PlanUpdatePayload } from "../types/plan.types";

const api = createAxiosInstance(ERP_BASE);
export const PlanAPI = API.plans;

export async function createPlan(payload: PlanPayload): Promise<any> {
  const resp: AxiosResponse = await api.post(PlanAPI.create, payload);
  return resp.data;
}
export async function getAllPlans(
  page: number = 1,
  page_size: number = 20,
  search?: string,
  status?: string,
): Promise<any> {
  const resp: AxiosResponse = await api.get(PlanAPI.getAll, {
    params: {
      page,
      page_size,
      ...(search && { search }),
      ...(status && { status }),
    },
  });
  return resp.data;
}
export async function getPlanById(id: string): Promise<any> {
  const resp: AxiosResponse = await api.get(PlanAPI.getById, { params: { id } });
  return resp.data;
}

export async function updatePlan(payload: PlanUpdatePayload): Promise<any> {
  const resp: AxiosResponse = await api.put(PlanAPI.update, payload);
  return resp.data;
}
export async function updatePlanStatus(payload: PlanStatusPayload): Promise<any> {
  const resp: AxiosResponse = await api.put(PlanAPI.updateStatus, payload);
  return resp.data;
}

