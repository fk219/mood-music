import api from "../../shared/services/api";

export const register = async ({ username, email, password }) => {
  const response = await api.post("/api/auth/register", {
    email,
    username,
    password,
  });

  return response.data;
};

export const login = async ({ username, email, password }) => {
  const response = await api.post("/api/auth/login", {
    username,
    email,
    password,
  });
  return response.data;
};

export const demoLogin = async () => {
  const response = await api.post("/api/auth/demo");

  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/auth/get-me");

  return response.data;
};

export const logOut = async () => {
  const response = await api.get("/api/auth/logout");

  return response.data;
};
