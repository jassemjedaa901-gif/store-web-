import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearStoredAuth, getStoredUser, setStoredAuth } from "@/lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin" || user?.role === "merchant",
      login: async ({ email, password }) => {
        const data = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setStoredAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        setUser(data.user);
      },
      register: async ({ name, email, password }) => {
        const data = await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setStoredAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        setUser(data.user);
      },
      logout: async () => {
        try {
          await api("/auth/logout", { method: "POST" });
        } catch {
          // ignore
        }
        clearStoredAuth();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

