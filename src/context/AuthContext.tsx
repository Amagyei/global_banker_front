import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  clearSession,
  getAccessToken,
  markSessionActivity,
  getLastActivityTimestamp,
  AUTH_ACTIVITY_EVENT_NAME,
  AUTH_LOGOUT_EVENT_NAME,
  ACCESS_STORAGE_KEY,
  REFRESH_STORAGE_KEY,
} from "@/lib/api";

const SESSION_IDLE_TIMEOUT_MINUTES = Number(import.meta.env.VITE_SESSION_IDLE_TIMEOUT_MINUTES ?? "15");
const SESSION_VERIFICATION_INTERVAL_MINUTES = Number(import.meta.env.VITE_SESSION_VERIFY_INTERVAL_MINUTES ?? "5");

const SESSION_IDLE_TIMEOUT_MS = SESSION_IDLE_TIMEOUT_MINUTES * 60_000;
const SESSION_VERIFICATION_INTERVAL_MS = SESSION_VERIFICATION_INTERVAL_MINUTES * 60_000;

type AuthContextValue = {
  isAuthenticated: boolean;
  logout: (reason?: string) => void;
  touchSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getAccessToken()));
  const idleTimerRef = useRef<number>();
  const verifyTimerRef = useRef<number>();

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = undefined;
    }
    if (verifyTimerRef.current) {
      window.clearInterval(verifyTimerRef.current);
      verifyTimerRef.current = undefined;
    }
  }, []);

  const logout = useCallback(
    (reason?: string) => {
      clearTimers();
      clearSession();
      setIsAuthenticated(false);
      toast({
        title: "Session ended",
        description: reason ?? "Please sign in again.",
        variant: "destructive",
      });
      navigate("/login", { replace: true, state: { reason } });
    },
    [clearTimers, navigate, toast],
  );

  const scheduleIdleTimeout = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      clearTimers();
      setIsAuthenticated(false);
      return;
    }

    const lastActivity = getLastActivityTimestamp() ?? markSessionActivity();
    const elapsed = Date.now() - lastActivity;
    const remaining = Math.max(SESSION_IDLE_TIMEOUT_MS - elapsed, 0);

    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      logout("Your session expired due to inactivity.");
    }, remaining);
  }, [clearTimers, logout]);

  const touchSession = useCallback(() => {
    if (!getAccessToken()) {
      return;
    }
    markSessionActivity();
    scheduleIdleTimeout();
  }, [scheduleIdleTimeout]);

  const verifySession = useCallback(async () => {
    if (!getAccessToken()) {
      return;
    }
    try {
      await api.get("/profile/me/");
      setIsAuthenticated(true);
      markSessionActivity();
    } catch (error) {
      logout("Your session expired. Please sign in again.");
    }
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) {
      clearTimers();
      return;
    }

    scheduleIdleTimeout();
    verifySession();

    verifyTimerRef.current = window.setInterval(verifySession, SESSION_VERIFICATION_INTERVAL_MS);
    return () => {
      if (verifyTimerRef.current) {
        window.clearInterval(verifyTimerRef.current);
        verifyTimerRef.current = undefined;
      }
    };
  }, [isAuthenticated, clearTimers, scheduleIdleTimeout, verifySession]);

  useEffect(() => {
    const handleActivity = () => {
      if (!getAccessToken()) {
        return;
      }
      setIsAuthenticated(true);
      scheduleIdleTimeout();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        (event.key === ACCESS_STORAGE_KEY || event.key === REFRESH_STORAGE_KEY) &&
        event.newValue === null
      ) {
        logout();
      }
    };

    const handleActivityEvent = () => handleActivity();
    const handleLogoutEvent = () => logout();

    window.addEventListener(AUTH_ACTIVITY_EVENT_NAME, handleActivityEvent);
    window.addEventListener(AUTH_LOGOUT_EVENT_NAME, handleLogoutEvent);
    window.addEventListener("storage", handleStorage);

    // Initialize timers based on current state
    handleActivity();

    return () => {
      window.removeEventListener(AUTH_ACTIVITY_EVENT_NAME, handleActivityEvent);
      window.removeEventListener(AUTH_LOGOUT_EVENT_NAME, handleLogoutEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [logout, scheduleIdleTimeout]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      logout,
      touchSession,
    }),
    [isAuthenticated, logout, touchSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

