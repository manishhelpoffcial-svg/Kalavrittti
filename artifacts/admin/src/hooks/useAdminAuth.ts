import { useState, useEffect, useCallback } from "react";
import { AdminInfo } from "@workspace/api-client-react";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("kalavritti_admin_token");
  });

  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    const stored = localStorage.getItem("kalavritti_admin_info");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((newToken: string, adminInfo: AdminInfo) => {
    localStorage.setItem("kalavritti_admin_token", newToken);
    localStorage.setItem("kalavritti_admin_info", JSON.stringify(adminInfo));
    setToken(newToken);
    setAdmin(adminInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("kalavritti_admin_token");
    localStorage.removeItem("kalavritti_admin_info");
    setToken(null);
    setAdmin(null);
  }, []);

  return {
    isAuthenticated: !!token,
    token,
    admin,
    login,
    logout,
  };
}
