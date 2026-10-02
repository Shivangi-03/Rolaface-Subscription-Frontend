import { ENV } from "./env";

export const ERP_BASE = ENV.apiBaseUrl;

export const API = {
  loginApi: {
    login: `${ERP_BASE}/api/method/auth_api.user_management.api.auth.login`,
    logout: `${ERP_BASE}/api/method/auth_api.user_management.api.auth.logout`,
    getUserDetails: `${ERP_BASE}/api/method/auth_api.user_management.api.auth.get_login_user`,
  },

    plan: {
    products: `${ERP_BASE}/api/resource/${encodeURIComponent("Custom Product")}`,
    modules: `${ERP_BASE}/api/resource/${encodeURIComponent("Custom Module")}`,
    subModules: `${ERP_BASE}/api/resource/${encodeURIComponent("Custom Sub Module")}`,
  },

  /* =========================
   * CUSTOMER
   * ========================= */
  customer: {
    getAll: `${ERP_BASE}/api/method/custom_api.api.selling.customer.api.get_customers`,
    getById: `${ERP_BASE}/api/method/custom_api.api.selling.customer.api.get_customer_by_id`,
    create: `${ERP_BASE}/api/method/custom_api.api.selling.customer.api.create_customer`,
    update: `${ERP_BASE}/api/method/custom_api.api.selling.customer.api.update_customer`,
    delete: `${ERP_BASE}/api/method/custom_api.api.selling.customer.api.delete_customer`,
    updateStatus: `${ERP_BASE}/api/method/custom_api.api.selling.customer.api.update_customer_status`,
  },

} as const;