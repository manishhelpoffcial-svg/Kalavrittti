import { useState, useEffect, useCallback, useRef } from "react";
import { setAdminAuthToken } from "@/admin/lib/api";

const TOKEN_KEY = "kv_admin_token";
const INFO_KEY = "kv_admin_info";
const EXPIRY_KEY = "kv_admin_expiry";

export interface AdminInfo {
  name: string;
  email: string;
}

function readStorage() {
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  const info = localStorage.getItem(INFO_KEY) ?? sessionStorage.getItem(INFO_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  return { token, info, expiry };
}

function isExpired(expiry: string | null): boolean {
  if (!expiry) return false;
  return Date.now() > parseInt(expiry, 10);
}

function clearStorage() {
  [TOKEN_KEY, INFO_KEY, EXPIRY_KEY].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export function useAdminAuth() {
  const { token: storedToken, info: storedInfo, expiry: storedExpiry } = readStorage();

  const alreadyExpired = isExpired(storedExpiry);
  if (alreadyExpired) clearStorage();

  const [token, setToken] = useState<string | null>(alreadyExpired ? null : storedToken);
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    if (alreadyExpired) return null;
    try { return storedInfo ? JSON.parse(storedInfo) : null; } catch { return null; }
  });

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutoLogout = useCallback((expiryMs: number) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    const remaining = expiryMs - Date.now();
    if (remaining <= 0) return;
    logoutTimerRef.current = setTimeout(() => {
      clearStorage();
      setToken(null);
      setAdmin(null);
      setAdminAuthToken(null);
      window.location.href = window.location.origin + (import.meta.env.BASE_URL || "/") + "admin/login";
    }, remaining);
  }, []);

  useEffect(() => {
    if (token) {
      setAdminAuthToken(token);
      const expiry = localStorage.getItem(EXPIRY_KEY);
      if (expiry) scheduleAutoLogout(parseInt(expiry, 10));
    }
    return () => { if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current); };
  }, [token, scheduleAutoLogout]);

  const login = useCallback((newToken: string, adminInfo: AdminInfo, rememberMe: boolean) => {
    const store = rememberMe ? localStorage : sessionStorage;
    const expiryMs = rememberMe ? Date.now() + 48 * 60 * 60 * 1000 : 0;

    clearStorage();
    store.setItem(TOKEN_KEY, newToken);
    store.setItem(INFO_KEY, JSON.stringify(adminInfo));
    if (rememberMe) {
      localStorage.setItem(EXPIRY_KEY, String(expiryMs));
      scheduleAutoLogout(expiryMs);
    }

    setAdminAuthToken(newToken);
    setToken(newToken);
    setAdmin(adminInfo);
  }, [scheduleAutoLogout]);

  const logout = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    clearStorage();
    setAdminAuthToken(null);
    setToken(null);
    setAdmin(null);
  }, []);

  return { isAuthenticated: !!token, token, admin, login, logout };
}
