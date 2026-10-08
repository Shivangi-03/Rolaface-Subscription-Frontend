import type { AxiosResponse } from "axios";
import { createAxiosInstance } from "../axiosInstance";
import { API, ERP_BASE } from "../../config/api";

const api = createAxiosInstance(ERP_BASE);
export const FRAPPEAPI = API.frappe;

export async function deletedoc(doctype: string, name: string): Promise<any> {
  const resp: AxiosResponse = await api.delete(FRAPPEAPI.delete, {
    params: {
      doctype,
      name,
    },
  });
  return resp.data;
}