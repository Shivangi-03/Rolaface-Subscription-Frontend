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


  country:{
     getCountries: `${ERP_BASE}/api/resource/Country`
  },

  currency:{
      getCurrency:`${ERP_BASE}/api/method/custom_api.api.search.get_currencies`
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
   /* =========================
   * PLAN
   * ========================= */
  plans: {
    create: `${ERP_BASE}/api/method/rolaface_subscription.modules.plan.plan.create`,
    getAll: `${ERP_BASE}/api/method/rolaface_subscription.modules.plan.plan.get`,
    getById:`${ERP_BASE}/api/method/rolaface_subscription.modules.plan.plan.get_by_id`,
    update: `${ERP_BASE}/api/method/rolaface_subscription.modules.plan.plan.update`,
    updateStatus: `${ERP_BASE}/api/method/rolaface_subscription.modules.plan.plan.update_status`

  },
   /* =========================
   * SUBSCRIPTION
   * ========================= */

  subscriptions: {
    getAll: `${ERP_BASE}/api/method/rolaface_subscription.modules.subscription.subscription.get`,
    create: `${ERP_BASE}/api/method/rolaface_subscription.modules.subscription.subscription.create`,
    getById: `${ERP_BASE}/api/method/rolaface_subscription.modules.subscription.subscription.get_by_id`,
    update: `${ERP_BASE}/api/method/rolaface_subscription.modules.subscription.subscription.update`,
    cancel: `${ERP_BASE}/api/method/rolaface_subscription.modules.subscription.subscription.cancel`,
  },



} as const;