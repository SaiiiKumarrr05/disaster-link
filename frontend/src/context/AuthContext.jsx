import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage?.getItem("disasterlink_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persistSession = (token, userInfo) => {
    try {
      window.localStorage?.setItem("disasterlink_token", token);
      window.localStorage?.setItem("disasterlink_user", JSON.stringify(userInfo));
    } catch {
      // localStorage unavailable — session won't persist across reloads, but app still works
    }
    setUser(userInfo);
  };

  const login = useCallback(async (phone, password) => {
    const data = await authApi.login(phone, password);
    const userInfo = { fullName: data.full_name, role: data.role };
    persistSession(data.access_token, userInfo);
    return userInfo;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authApi.signup(payload);
    const userInfo = { fullName: data.full_name, role: data.role };
    persistSession(data.access_token, userInfo);
    return userInfo;
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage?.removeItem("disasterlink_token");
      window.localStorage?.removeItem("disasterlink_user");
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = { user, login, signup, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
