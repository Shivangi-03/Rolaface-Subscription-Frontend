import type { AxiosResponse } from "axios";
import { createAxiosInstance } from "./axiosInstance";
import { API, ERP_BASE } from "../config/api";

const api = createAxiosInstance(ERP_BASE);
export const CustomerAPI = API.customer;

export async function getAllCustomers(
  page: number = 1,
  page_size: number = 5,
  taxCategory?: string,
  search?: string,
  status?: string,
): Promise<any> {
  const resp: AxiosResponse = await api.get(CustomerAPI.getAll, {
    params: {
      page,
      page_size,
      status,
      ...(taxCategory && { taxCategory }),
      ...(search && { search }),
    },
  });
  return resp.data;
}

export async function getCustomerByCustomerCode(id: string): Promise<any> {
  const resp: AxiosResponse = await api.get(CustomerAPI.getById, { params: { id } });
  return resp.data;
}

export async function createCustomer(payload: any): Promise<any> {
  const resp: AxiosResponse = await api.post(CustomerAPI.create, payload);
  return resp.data;
}

export async function updateCustomerByCustomerCode(id: string, payload: any): Promise<any> {
  const resp: AxiosResponse = await api.patch(CustomerAPI.update, payload, { params: { id } });
  return resp.data;
}

export async function deleteCustomerById(id: string): Promise<any> {
  const resp: AxiosResponse = await api.delete(CustomerAPI.delete, { params: { id } });
  return resp.data;
}

export async function updateCustomerStatus(id: string, status: "active" | "inactive"): Promise<any> {
  const resp: AxiosResponse = await api.patch(CustomerAPI.updateStatus, { status }, { params: { id } });
  return resp.data;
}
