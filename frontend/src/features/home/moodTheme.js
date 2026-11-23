export const MOOD_HISTORY_LIMIT = 5;
export const CAMERA_CHECK_IN_INTERVAL = 30 * 1000;

export const MOOD_KEYS = ["neutral", "happy", "sad", "angry", "surprised"];

export const MOOD_THEME = {
  neutral: {
    label: "Neutral",
    color: "#a79bb5",
    secondary: "#6e5b82",
  },
  happy: {
    label: "Happy",
    color: "#f2a65a",
    secondary: "#f7d08a",
  },
  sad: {
    label: "Sad",
    color: "#7c9bd6",
    secondary: "#a79bb5",
  },
  angry: {
    label: "Angry",
    color: "#e07a6a",
    secondary: "#f2a65a",
  },
  surprised: {
    label: "Surprised",
    color: "#7fd1ae",
    secondary: "#bfead6",
  },
};

export const getMoodTheme = (mood) => MOOD_THEME[mood] || MOOD_THEME.neutral;

// FaceExpression sometimes hands us "Happy 😄". Normalize for the room UI,
// never for the song API query.
export const normalizeMood = (value) => {
  if (!value || typeof value !== "string") return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("happy") || normalized.includes("smile")) return "happy";
  if (normalized.includes("surprised")) return "surprised";
  if (normalized.includes("sad") || normalized.includes("frown")) return "sad";
  if (normalized.includes("angry") || normalized.includes("anger")) return "angry";
  if (normalized.includes("neutral")) return "neutral";
  return null;
};

export const SOURCE_LABEL = {
  camera: "Camera read",
  manual: "Manual check-in",
  library: "From the library",
  house: "House record",
};

export const formatMoodTime = (timestamp) => {
  if (!Number.isFinite(timestamp)) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};
