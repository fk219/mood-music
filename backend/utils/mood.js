const MOODS = ["neutral", "happy", "sad", "angry", "surprised"];

// Accepts both API moods ("happy") and UI labels ("Happy 😄").
const normalizeMood = (value) => {
  if (!value || typeof value !== "string") return null;

  const normalized = value.toLowerCase();
  if (normalized.includes("happy") || normalized.includes("smile")) return "happy";
  if (normalized.includes("surprised")) return "surprised";
  if (normalized.includes("sad") || normalized.includes("frown")) return "sad";
  if (normalized.includes("angry") || normalized.includes("anger")) return "angry";
  if (normalized.includes("neutral")) return "neutral";
  return null;
};

module.exports = { MOODS, normalizeMood };
