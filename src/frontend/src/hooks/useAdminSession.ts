import { useState } from "react";

const SESSION_KEY = "adminSessionId";

export function useAdminSession() {
  const [sessionId, setSessionIdState] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_KEY),
  );

  const setSession = (token: string) => {
    sessionStorage.setItem(SESSION_KEY, token);
    setSessionIdState(token);
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSessionIdState(null);
  };

  return {
    sessionId,
    setSession,
    clearSession,
    isAdminLoggedIn: !!sessionId,
  };
}
