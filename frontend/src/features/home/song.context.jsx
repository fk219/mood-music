import { createContext, useCallback, useEffect, useState } from "react";
import { HOUSE_TRACK } from "./constants";
import {
  MOOD_HISTORY_LIMIT,
  MOOD_THEME,
  normalizeMood,
} from "./moodTheme";

export const SongContext = createContext(null);

const HISTORY_KEY = "moodify.mood-history.v1";
const MOOD_REPEAT_WINDOW = 15000;

const readMoodHistory = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.at === "number" &&
          Number.isFinite(item.at) &&
          MOOD_THEME[item.mood],
      )
      .slice(0, MOOD_HISTORY_LIMIT);
  } catch {
    return [];
  }
};

export const SongContextProvider = ({ children }) => {
  const [song, setSong] = useState(HOUSE_TRACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mood, setMood] = useState("neutral");
  const [moodHistory, setMoodHistory] = useState(readMoodHistory);
  const [detectSignal, setDetectSignal] = useState(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(moodHistory));
    } catch {
      // Private mode / blocked storage: the trail still works for this session.
    }
  }, [moodHistory]);

  const recordMood = useCallback((value) => {
    const nextMood = normalizeMood(value);
    if (!nextMood) return;

    setMood(nextMood);
    setMoodHistory((previous) => {
      const latest = previous[0];
      if (latest?.mood === nextMood && Date.now() - latest.at < MOOD_REPEAT_WINDOW) {
        return previous;
      }

      return [{ mood: nextMood, at: Date.now() }, ...previous].slice(
        0,
        MOOD_HISTORY_LIMIT,
      );
    });
  }, []);

  const requestMoodDetection = useCallback(() => {
    setDetectSignal((value) => value + 1);
  }, []);

  return (
    <SongContext.Provider
      value={{
        song,
        setSong,
        loading,
        setLoading,
        error,
        setError,
        mood,
        moodHistory,
        recordMood,
        detectSignal,
        requestMoodDetection,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};
