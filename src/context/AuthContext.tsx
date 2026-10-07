import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { notifyError } from "../utils/Alert";
import { fetchLoginUser, loginApi, logoutApi } from "../api/authApi";
import { onSessionExpired } from "../utils/SessionEvent";
import { AuthContext, type AuthUser } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLoginUser()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null);
        notifyError("Please login again", "Session expired");
      }),
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginApi(email, password);
    try {
      setUser(await fetchLoginUser());
    } catch {
      setUser(loggedIn);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}