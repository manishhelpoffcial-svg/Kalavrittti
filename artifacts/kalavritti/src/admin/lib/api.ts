import axios from "axios";

export const adminApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Synchronously initialize auth header from storage at module load time
// This prevents 401 errors on page refresh before useEffect runs
(function initAuthHeader() {
  try {
    const token =
      localStorage.getItem("kv_admin_token") ??
      sessionStorage.getItem("kv_admin_token");
    if (token) {
      adminApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // localStorage may be unavailable in some contexts
  }
})();

export function setAdminAuthToken(token: string | null) {
  if (token) {
    adminApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common["Authorization"];
  }
}
