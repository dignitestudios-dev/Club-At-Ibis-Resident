import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://416zwbs6-3050.inc1.devtunnels.ms/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("auth-token");
    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)auth-token=([^;]+)/);
      if (match && match[1]) {
        token = match[1];
        localStorage.setItem("auth-token", token);
      }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

function clearSessionAndRedirect() {
  if (typeof window === "undefined") return;
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.setItem("cai.logged-out", "true");
  localStorage.removeItem("auth-token");
  localStorage.removeItem("auth-user");
  document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";

  try {
    sessionStorage.setItem("cai.session-expired", "true");
  } catch {
    // Ignore sessionStorage errors
  }

  window.dispatchEvent(
    new CustomEvent("app:toast", {
      detail: {
        variant: "error",
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
      },
    })
  );

  if (!window.location.pathname.startsWith("/auth/")) {
    const currentPath = window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(currentPath);
    window.location.href = `/auth/login?returnUrl=${returnUrl}`;
  } else {
    setTimeout(() => {
      isRedirecting = false;
    }, 1000);
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginAttempt = typeof error.config?.url === "string" && error.config.url.includes("/auth/login");
    const isLogoutAttempt = typeof error.config?.url === "string" && error.config.url.includes("/auth/logout");
    if (status === 401 && !isLoginAttempt && !isLogoutAttempt) {
      clearSessionAndRedirect();
    }

    // Trigger server-error dialog on 5xx or network-down responses
    if (typeof window !== "undefined" && (!status || status >= 500 || error.code === "ERR_NETWORK")) {
      window.dispatchEvent(new CustomEvent("app:server-error"));
    }

    const data = error.response?.data;
    const message = data?.message ?? error.message;
    const err = new Error(message) as Error & { code?: string; statusCode?: number; responseData?: unknown };
    if (data?.code) err.code = data.code;
    if (status) err.statusCode = status;
    err.responseData = data;
    return Promise.reject(err);
  }
);

export default axiosInstance;
