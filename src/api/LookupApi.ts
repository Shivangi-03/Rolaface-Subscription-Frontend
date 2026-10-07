import type { AxiosResponse } from "axios";
import { createAxiosInstance } from "./axiosInstance";
import { API, ERP_BASE } from "../config/api";

const api = createAxiosInstance(ERP_BASE);

export interface CurrencyApiItem {
  name: string;
  currency_name: string;
  symbol: string;
  number_format: string;
}

const CURRENCY_PAGE_SIZE = 50;


export async function searchRolaCurrencies(search = "", signal?: AbortSignal): Promise<CurrencyApiItem[]> {
  const term = search.trim();
  const resp: AxiosResponse = await api.get(API.currency.getCurrency, {
    params: { page: 1, page_size: CURRENCY_PAGE_SIZE, ...(term && { search: term }) },
    signal,
  });
  return resp.data?.data ?? [];
}

export interface CountryApiItem {
  name: string;
  country_name?: string;
  code?: string;
}


export async function getRolaCountryList(): Promise<CountryApiItem[]> {
  const resp: AxiosResponse = await api.get(API.country.getCountries, {
    params: { fields: JSON.stringify(["name", "country_name", "code"]), limit_page_length: 300 },
  });
  return resp.data?.data ?? [];
}