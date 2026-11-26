import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HOUSE_TRACK } from "./constants";
import { useAuth } from "../auth/hook/useAuth";
import { getSong } from "./services/song.api";
import {
  clearMoodHistory as clearMoodHistoryApi,
  recordMoodEntry,
} from "./services/mood.api";
import {
  CAMERA_CHECK_IN_INTERVAL,
  MOOD_HISTORY_LIMIT,
  MOOD_THEME,
  getMoodTheme,
  normalizeMood,
} from "./moodTheme";

export const SongContext = createContext(null);

const HISTORY_KEY = "moodmusic.mood-history.v1";
const HISTORY_OWNER_KEY = "moodmusic.mood-history.owner.v1";
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

const tracksFromResponse = (payload) => {
  if (Array.isArray(payload)) return payload.filter((track) => track?.url);
  if (payload?.url) return [payload];
  return [];
};

const shuffleTracks = (tracks) => {
  const copy = [...tracks];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

const getRequestErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const orderQueue = (tracks, selected, shouldShuffle) => {
  const index = selected ? tracks.indexOf(selected) : 0;

  if (!shouldShuffle || tracks.length < 2) {
    return { list: tracks, index: Math.max(0, index) };
  }

  const first = selected || tracks[0];
  return {
    list: [first, ...shuffleTracks(tracks.filter((track) => track !== first))],
    index: 0,
  };
};

export const SongContextProvider = ({ children }) => {
  const { user, initializing } = useAuth();
  const [song, setSong] = useState(HOUSE_TRACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mood, setMood] = useState("neutral");
  const [moodSource, setMoodSource] = useState("");
  const [moodHistory, setMoodHistory] = useState(readMoodHistory);
  const [detectSignal, setDetectSignal] = useState(0);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [queueMood, setQueueMood] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [playSignal, setPlaySignal] = useState(0);
  const [journalSignal, setJournalSignal] = useState(0);
  const [journalError, setJournalError] = useState("");
  const [fallbackNote, setFallbackNote] = useState("");

  const requestIdRef = useRef(0);
  const lastCameraCheckInRef = useRef(0);

  const resetRoom = useCallback(() => {
    requestIdRef.current += 1;
    lastCameraCheckInRef.current = 0;
    setSong(HOUSE_TRACK);
    setLoading(false);
    setError("");
    setMood("neutral");
    setMoodSource("");
    setMoodHistory([]);
    setQueue([]);
    setQueueIndex(-1);
    setQueueMood("");
    setShuffle(false);
    setFallbackNote("");
    setJournalError("");
  }, []);

  useEffect(() => {
    if (initializing) return;

    const currentUserId = user?._id || user?.id || null;

    try {
      const storedOwner = window.localStorage.getItem(HISTORY_OWNER_KEY);

      if (!currentUserId) {
        resetRoom();
        window.localStorage.removeItem(HISTORY_OWNER_KEY);
        return;
      }

      if (storedOwner && String(storedOwner) !== String(currentUserId)) {
        resetRoom();
      }

      if (!storedOwner || String(storedOwner) !== String(currentUserId)) {
        window.localStorage.setItem(HISTORY_OWNER_KEY, String(currentUserId));
      }
    } catch {
      // Blocked storage should not interrupt the session or the room.
    }
  }, [user, initializing, resetRoom]);
  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(moodHistory));
    } catch {
      // Private mode / blocked storage: the trail still works for this session.
    }
  }, [moodHistory]);

  const recordMood = useCallback(async (value, source = "manual") => {
    const nextMood = normalizeMood(value);
    if (!nextMood) return false;

    const now = Date.now();
    setMood(nextMood);
    setMoodHistory((previous) => {
      const latest = previous[0];
      if (latest?.mood === nextMood && now - latest.at < MOOD_REPEAT_WINDOW) {
        return previous;
      }

      return [{ mood: nextMood, at: now, source }, ...previous].slice(
        0,
        MOOD_HISTORY_LIMIT,
      );
    });

    if (
      source === "camera" &&
      now - lastCameraCheckInRef.current < CAMERA_CHECK_IN_INTERVAL
    ) {
      return false;
    }

    if (source === "camera") lastCameraCheckInRef.current = now;

    setJournalError("");

    try {
      const result = await recordMoodEntry({ mood: nextMood, source });
      if (result?.recorded !== false) {
        setJournalSignal((value) => value + 1);
      }
      return result?.recorded !== false;
    } catch (recordingError) {
      console.error(
        "Mood check-in could not be saved:",
        recordingError?.message || "unknown error",
      );
      setJournalError(
        "That check-in couldn't be saved to your journal. It's still on the local trail.",
      );
      return false;
    }
  }, []);

  const selectMood = useCallback(
    async (value, source = "manual") => {
      const nextMood = normalizeMood(value);
      if (!nextMood) {
        return { ok: false, error: "That mood isn't part of the room." };
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setMood(nextMood);
      setMoodSource(source);
      setLoading(true);
      setError("");
      setFallbackNote("");
      void recordMood(nextMood, source);

      try {
        const response = await getSong({ mood: nextMood });
        if (requestId !== requestIdRef.current) {
          return { ok: false, stale: true, requestedMood: nextMood };
        }

        const tracks = tracksFromResponse(response?.song);
        if (!tracks.length) {
          const message =
            "No tracks for that mood yet. Open the Studio to add the first record.";
          setError(message);
          return { ok: false, error: message, requestedMood: nextMood };
        }

        const ordered = orderQueue(tracks, tracks[0], shuffle);
        const firstTrackMood =
          normalizeMood(tracks[0].mood) || normalizeMood(response?.resolvedMood);
        const resolvedMood = normalizeMood(response?.resolvedMood) || firstTrackMood || nextMood;
        const fallback = Boolean(response?.fallback) || resolvedMood !== nextMood;

        setQueue(ordered.list);
        setQueueIndex(ordered.index);
        setQueueMood(nextMood);
        setSong({
          ...tracks[0],
          mood: normalizeMood(tracks[0].mood) || resolvedMood,
        });
        setFallbackNote(
          fallback
            ? `No ${getMoodTheme(nextMood).label.toLowerCase()} tracks yet. The room is playing ${getMoodTheme(resolvedMood).label.toLowerCase()}.`
            : "",
        );
        setPlaySignal((value) => value + 1);

        return {
          ok: true,
          tracks,
          fallback,
          resolvedMood,
          requestedMood: nextMood,
        };
      } catch (requestError) {
        if (requestId !== requestIdRef.current) {
          return { ok: false, stale: true, requestedMood: nextMood };
        }

        const message = getRequestErrorMessage(
          requestError,
          "Couldn't tune the playlist. Check your connection and try again.",
        );
        setError(message);
        return { ok: false, error: message, requestedMood: nextMood };
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [recordMood, shuffle],
  );

  const playTrack = useCallback((track, tracks, trackMood) => {
    if (!track?.url) return;

    requestIdRef.current += 1;
    const nextMood =
      normalizeMood(trackMood) || normalizeMood(track.mood) || "neutral";
    const list = Array.isArray(tracks) && tracks.length ? tracks : [track];
    const selected = list.find((item) => item.url === track.url) || track;
    const ordered = orderQueue(list, selected, shuffle);

    setLoading(false);
    setMood(nextMood);
    setMoodSource("library");
    setQueue(ordered.list);
    setQueueIndex(ordered.index);
    setQueueMood(nextMood);
    setSong({ ...selected, mood: normalizeMood(selected.mood) || nextMood });
    setError("");
    setFallbackNote("");
    setPlaySignal((value) => value + 1);
  }, [shuffle]);

  const playNext = useCallback(() => {
    if (!queue.length) return;

    requestIdRef.current += 1;
    const nextIndex = (queueIndex + 1) % queue.length;
    const nextTrack = queue[nextIndex];
    if (!nextTrack?.url) return;

    setLoading(false);
    setQueueIndex(nextIndex);
    setSong({ ...nextTrack, mood: normalizeMood(nextTrack.mood) || queueMood });
    setError("");
    setPlaySignal((value) => value + 1);
  }, [queue, queueIndex, queueMood]);

  const playPrevious = useCallback(() => {
    if (!queue.length) return;

    requestIdRef.current += 1;
    const previousIndex = (queueIndex - 1 + queue.length) % queue.length;
    const previousTrack = queue[previousIndex];
    if (!previousTrack?.url) return;

    setLoading(false);
    setQueueIndex(previousIndex);
    setSong({
      ...previousTrack,
      mood: normalizeMood(previousTrack.mood) || queueMood,
    });
    setError("");
    setPlaySignal((value) => value + 1);
  }, [queue, queueIndex, queueMood]);

  const toggleShuffle = useCallback(() => {
    const nextShuffle = !shuffle;
    setShuffle(nextShuffle);

    if (nextShuffle && queue.length > 1) {
      const currentTrack = queue[queueIndex] || queue[0];
      const rest = queue.filter((track) => track !== currentTrack);

      setQueue(
        currentTrack
          ? [currentTrack, ...shuffleTracks(rest)]
          : shuffleTracks(rest),
      );
      setQueueIndex(currentTrack ? 0 : -1);
    }
  }, [shuffle, queue, queueIndex]);

  const playHouseTrack = useCallback(() => {
    requestIdRef.current += 1;
    setLoading(false);
    setQueue([]);
    setQueueIndex(-1);
    setQueueMood("");
    setMood(normalizeMood(HOUSE_TRACK.mood) || "neutral");
    setMoodSource("house");
    setSong({ ...HOUSE_TRACK });
    setError("");
    setFallbackNote("");
    setPlaySignal((value) => value + 1);
  }, []);

  const clearJournal = useCallback(async () => {
    const result = await clearMoodHistoryApi();
    setMoodHistory([]);
    setJournalError("");
    setJournalSignal((value) => value + 1);
    return result;
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
        moodSource,
        moodHistory,
        recordMood,
        detectSignal,
        requestMoodDetection,
        selectMood,
        playTrack,
        playNext,
        playPrevious,
        playHouseTrack,
        queue,
        queueIndex,
        queueMood,
        shuffle,
        toggleShuffle,
        playSignal,
        journalSignal,
        journalError,
        clearJournal,
        fallbackNote,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};
