import api from "../../shared/services/api";

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.patch("/api/auth/password", {
    currentPassword,
    newPassword,
  });

  return response.data;
};

export const exportAccountData = async () => {
  const response = await api.get("/api/auth/export", {
    responseType: "blob",
  });

  return response;
};

export const deleteAccount = async ({ password }) => {
  const response = await api.delete("/api/auth/account", {
    data: { password },
  });

  return response.data;
};
