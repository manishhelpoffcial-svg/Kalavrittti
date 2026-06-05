import axios from "axios";

export const adminApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export function setAdminAuthToken(token: string | null) {
  if (token) {
    adminApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete adminApi.defaults.headers.common["Authorization"];
  }
}
