import axios from "axios";

export const sellerApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

(function initAuthHeader() {
  try {
    const token = localStorage.getItem("kv_seller_token") ?? sessionStorage.getItem("kv_seller_token");
    if (token) sellerApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch {}
})();

export function setSellerAuthToken(token: string | null) {
  if (token) sellerApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete sellerApi.defaults.headers.common["Authorization"];
}
