import { createContext, useEffect, useState } from "react";
import { getMe as getMeApi } from "./services/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await getMeApi();
        if (active) setUser(response?.user || null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setInitializing(false);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};
