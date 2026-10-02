import type { AxiosResponse } from "axios";
import { createAxiosInstance } from "./axiosInstance";
import { ERP_BASE, API } from "../config/api";

const api = createAxiosInstance(ERP_BASE);


export interface AuthUser {
  username?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
  sid?: string;
}

interface LoginApiResponse {
  message?: {
    status?: string;
    data?: {
      sid?: string;
      username?: string;
      email?: string;
      full_name?: string;
      roles?: string[];
    };
  };
}

interface GetLoginUserResponse {
  message: {
    status: "success" | "error";
    message: string | null;
    data: {
      fullName: string;
      email: string;
      username: string;
      roles: string[];
    };
  };
}


export const loginApi = async (email: string, password: string): Promise<AuthUser> => {
  const resp: AxiosResponse<LoginApiResponse> = await api.post(API.loginApi.login, {
    usr: email,
    pwd: password,
  });
  const data = resp.data;

  if (!data?.message || data.message.status !== "success") {
    throw new Error("LOGIN_FAILED");
  }

  const d = data.message.data;
  return {
    username: d?.username,
    email: d?.email,
    fullName: d?.full_name,
    roles: d?.roles ?? [],
    sid: d?.sid,
  };
};


export const fetchLoginUser = async (): Promise<AuthUser> => {
  const resp: AxiosResponse<GetLoginUserResponse> = await api.get(API.loginApi.getUserDetails);

  const data = resp.data;
  if (!data?.message || data.message.status !== "success") {
    throw new Error("FETCH_LOGIN_USER_FAILED");
  }

  const d = data.message.data;
  return {
    username: d.username,
    email: d.email,
    fullName: d.fullName,
    roles: d.roles ?? [],
  };
};


export const logoutApi = async (): Promise<void> => {
  try {
    await api.post(API.loginApi.logout);
  } catch {
    console.warn("Logout API failed, clearing local session anyway");
  }
};