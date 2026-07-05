import { useState, useEffect, useCallback, useRef } from "react";
import { setSellerAuthToken } from "@/seller/lib/api";

const TOKEN_KEY = "kv_seller_token";
const INFO_KEY = "kv_seller_info";

export interface SellerInfo {
  id: number;
  email: string;
  shopName: string | null;
  shopLogo: string | null;
  isVerified: boolean;
}

function readStorage() {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  const info = localStorage.getItem(INFO_KEY) ?? sessionStorage.getItem(INFO_KEY);
  return { token, info };
}

function clearStorage() {
  [TOKEN_KEY, INFO_KEY].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export function useSellerAuth() {
  const { token: storedToken, info: storedInfo } = readStorage();
  const [token, setToken] = useState<string | null>(storedToken);
  const [seller, setSeller] = useState<SellerInfo | null>(() => {
    try { return storedInfo ? JSON.parse(storedInfo) : null; } catch { return null; }
  });

  useEffect(() => {
    if (token) setSellerAuthToken(token);
  }, [token]);

  const login = useCallback((newToken: string, sellerInfo: SellerInfo, remember = true) => {
    const store = remember ? localStorage : sessionStorage;
    clearStorage();
    store.setItem(TOKEN_KEY, newToken);
    store.setItem(INFO_KEY, JSON.stringify(sellerInfo));
    setSellerAuthToken(newToken);
    setToken(newToken);
    setSeller(sellerInfo);
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setSellerAuthToken(null);
    setToken(null);
    setSeller(null);
  }, []);

  const updateSeller = useCallback((updates: Partial<SellerInfo>) => {
    setSeller(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(INFO_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { isAuthenticated: !!token, token, seller, login, logout, updateSeller };
}
