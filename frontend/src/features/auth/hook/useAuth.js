import { useContext, useState } from "react";
import {
  login as loginApi,
  register as registerApi,
  logOut as logOutApi,
} from "../services/auth.api";
import { AuthContext } from "../auth.context";

export const useAuth = () => {
  const { user, setUser, initializing } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const response = await registerApi({ username, email, password });
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const response = await loginApi({ username, email, password });
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await logOutApi();
    } catch (error) {
      // The local session still ends even if the network call fails.
      console.error(error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    initializing,
    handleRegister,
    handleLogin,
    handleLogOut,
  };
};
