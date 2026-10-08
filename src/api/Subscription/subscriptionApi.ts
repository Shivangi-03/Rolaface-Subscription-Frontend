import type { AxiosResponse } from "axios";
import { createAxiosInstance } from "../axiosInstance";
import { API, ERP_BASE } from "../../config/api";
import type {
  GetAllSubscriptionsResponse,
  SubscriptionCancelPayload,
  SubscriptionPayload,
  SubscriptionUpdatePayload,
} from "../../types/subscription.types";


const api = createAxiosInstance(ERP_BASE);
export const SubscriptionAPI = API.subscriptions;

export async function getAllSubscriptions(
  page: number = 1,
  page_size: number = 20,
  search?: string,
  status?: string,
): Promise<GetAllSubscriptionsResponse> {
  const resp: AxiosResponse<GetAllSubscriptionsResponse> = await api.get(SubscriptionAPI.getAll, {
    params: {
      page,
      page_size,
      ...(search && { search }),
      ...(status && { status }),
    },
  });
  return resp.data;
}
export async function createSubscription(payload: SubscriptionPayload): Promise<any> {
  const resp: AxiosResponse = await api.post(SubscriptionAPI.create, payload);
  return resp.data;
}
export async function getSubscriptionById(id: string): Promise<any> {
  const resp: AxiosResponse = await api.get(SubscriptionAPI.getById, { params: { id } });
  return resp.data;
}
export async function updateSubscription(payload: SubscriptionUpdatePayload): Promise<any> {
  const resp: AxiosResponse = await api.put(SubscriptionAPI.update, payload);
  return resp.data;
}
export async function cancelSubscription(payload: SubscriptionCancelPayload): Promise<any> {
  const resp: AxiosResponse = await api.put(SubscriptionAPI.cancel, payload);
  return resp.data;
}

export async function submitSubscription(id: string): Promise<any> {
  const resp: AxiosResponse = await api.put(SubscriptionAPI.submit, { id });
  return resp.data;
}