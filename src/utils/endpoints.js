export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  USERS: {
    LIST: "/users",
    ROLE: (id) => `/users/${id}/role`,
    DELETE: (id) => `/users/${id}`,
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    STATUS: (id) => `/orders/${id}/status`,
    UPLOAD_RECEIPT: "/orders/upload-receipt",
  },
  STOCK: {
    LOGS: "/stock/logs",
    ADJUST: "/stock/adjust",
  },
  REPORTS: {
    DASHBOARD: "/reports/dashboard",
    SALES: "/reports/sales",
  },
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
  },
  REGIONS: {
    PROVINCES: "/regions/provinces",
    REGENCIES: (provCode) => `/regions/regencies/${provCode}`,
    DISTRICTS: (regencyCode) => `/regions/districts/${regencyCode}`,
  },
  SHIPPING: {
    DESTINATION: "/shipping/destination",
    COST: "/shipping/cost",
  },
  PAYMENT_METHODS: {
    LIST: "/payment-methods",
    ADMIN_LIST: "/admin/payment-methods",
    CREATE: "/admin/payment-methods",
    UPDATE: (id) => `/admin/payment-methods/${id}`,
    DELETE: (id) => `/admin/payment-methods/${id}`,
  },
  UPLOAD: "/upload",
};
