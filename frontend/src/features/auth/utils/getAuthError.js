const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const getAuthErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (isRecord(data)) {
    const message = data.message || data.Message || data.error || data.msg;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error?.request) {
    return "We couldn’t reach the listening room. Check your connection and try again.";
  }

  return fallback;
};
