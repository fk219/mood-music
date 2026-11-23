import { useContext, useEffect, useRef, useState } from "react";
import { SongContext } from "../../home/song.context";
import { getSong } from "../../home/services/song.api";
import {
  formatMoodTime,
  getMoodTheme,
  MOOD_HISTORY_LIMIT,
  normalizeMood,
} from "../../home/moodTheme";
import {
  initializeFaceExpression,
  startFaceDetection,
  stopFaceDetection,
  stopFaceExpression,
} from "../utils/utils";
import { AlertIcon, CameraIcon } from "../../shared/components/Icons";
import "../styles/style.scss";

const moodMap = {
  Happy: "happy",
  Surprised: "surprised",
  Sad: "sad",
  Neutral: "neutral",
};

export default function FaceExpression() {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const lastMoodRef = useRef("");
  const lastDetectionRef = useRef("");
  const lastRecordedMoodRef = useRef("");
  const setupRunRef = useRef(0);
  const handledSignalRef = useRef(null);

  const [expression, setExpression] = useState("Camera ready");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Warming up the mood lens");
  const [cameraError, setCameraError] = useState("");
  const [playlistError, setPlaylistError] = useState("");

  const {
    setSong,
    setLoading: setSongLoading,
    setError: setSongError,
    mood,
    moodHistory,
    recordMood,
    detectSignal,
  } = useContext(SongContext);

  const setupCamera = async () => {
    const runId = ++setupRunRef.current;
    const cancelled = () => runId !== setupRunRef.current;

    setCameraError("");
    setReady(false);
    setLoading(true);
    setStatus("Warming up the mood lens…");

    await initializeFaceExpression({
      videoRef,
      landmarkerRef,
      setExpression,
      setLoading,
      onStatus: (message) => {
        if (!cancelled()) setStatus(message);
      },
      onReady: () => {
        if (cancelled()) return;
        setReady(true);
        setCameraError("");
        setStatus("Camera ready. Start a read when you like.");
      },
      onError: (message) => {
        if (cancelled()) return;
        setCameraError(message);
        setReady(false);
        setStatus("Camera unavailable");
      },
      isCancelled: cancelled,
    });
  };

  useEffect(() => {
    setupCamera();

    return () => {
      setupRunRef.current += 1;
      stopFaceExpression({
        videoRef,
        landmarkerRef,
        animationRef,
      });
    };
    // The lens initializes once per room visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMoodRequest = async (value, force = false) => {
    // The song API stores moods as happy | sad | surprised | neutral.
    const moodQuery =
      moodMap[value] || normalizeMood(value) || value?.toLowerCase();
    if (!moodQuery) return;
    if (!force && moodQuery === lastMoodRef.current) return;

    lastMoodRef.current = moodQuery;
    setPlaylistError("");
    setSongError("");
    setStatus(`Finding a ${normalizeMood(value) || "new"} playlist…`);
    setSongLoading(true);

    try {
      const response = await getSong({ mood: moodQuery });
      const payload = response?.song;
      const track = Array.isArray(payload) ? payload[0] : payload;

      if (track?.url) {
        setSong({ ...track, mood: normalizeMood(track.mood) || moodQuery });
        setStatus(
          `Playlist tuned for ${normalizeMood(value) || moodQuery}`,
        );
      } else {
        setStatus("No track came back for that mood");
        setPlaylistError("The room couldn’t find a track for this mood.");
        setSongError("No track found for that mood.");
      }
    } catch (error) {
      console.error(error);
      setStatus("The playlist signal dropped");
      setPlaylistError(
        "Couldn’t tune the playlist. Check your connection and try again.",
      );
      setSongError("Playlist unavailable right now.");
    } finally {
      setSongLoading(false);
    }
  };

  const handleExpressionChange = (value) => {
    const detectedMood = normalizeMood(value);

    if (detectedMood) {
      lastDetectionRef.current = value;
      if (detectedMood !== lastRecordedMoodRef.current) {
        lastRecordedMoodRef.current = detectedMood;
        recordMood(detectedMood);
      }
    }

    if (value && value !== "No face detected" && value !== "Camera ready") {
      handleMoodRequest(value);
    }
  };

  const handleDetect = () => {
    if (isRunning || loading || !ready) return;

    lastMoodRef.current = "";
    lastDetectionRef.current = "";
    lastRecordedMoodRef.current = "";
    setPlaylistError("");
    setExpression("Reading…");
    setStatus("Scanning your expression…");

    startFaceDetection({
      videoRef,
      landmarkerRef,
      animationRef,
      setExpression,
      setIsRunning,
      onExpressionChange: handleExpressionChange,
      onError: (message) => {
        setStatus(message);
      },
    });
  };

  const handleStop = () => {
    stopFaceDetection({ animationRef, setIsRunning });
    setStatus("Read paused. Your last mood stays on the ring.");
  };

  useEffect(() => {
    if (handledSignalRef.current === null) {
      handledSignalRef.current = detectSignal;
      return;
    }

    if (!detectSignal || detectSignal === handledSignalRef.current) return;
    handledSignalRef.current = detectSignal;

    if (isRunning) return;

    if (loading) {
      setStatus("The lens is still warming up. One moment…");
      return;
    }

    if (!ready) {
      setStatus(
        cameraError
          ? "Fix the camera message, then start a read."
          : "The camera isn’t ready yet.",
      );
      return;
    }

    handleDetect();
    // handleDetect is intentionally read from the render that received the signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectSignal]);

  const detectedMood = normalizeMood(expression);
  const displayMood = loading
    ? "Warming up"
    : cameraError
      ? "Unavailable"
      : detectedMood
        ? getMoodTheme(detectedMood).label
        : isRunning
          ? "No face yet"
          : "Ready";

  const signalLabel = cameraError
    ? "Camera off"
    : loading
      ? "Waking"
      : isRunning
        ? "Live"
        : ready
          ? "Idle"
          : "Offline";

  const signalState = cameraError
    ? "is-error"
    : isRunning
      ? "is-live"
      : "";

  return (
    <section
      className="mood-lens"
      id="mood-lens"
      aria-labelledby="mood-lens-title"
    >
      <header className="mood-lens__top">
        <div>
          <p className="eyebrow">Mood lens</p>
          <h2 id="mood-lens-title">Let the room read you.</h2>
        </div>
        <span className={`mood-lens__signal ${signalState}`}>
          <span className="mood-lens__signal-dot" aria-hidden="true" />
          {signalLabel}
        </span>
      </header>

      <div className={`mood-lens__stage${isRunning ? " is-live" : ""}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="mood-lens__video"
          aria-label="Camera preview for mood detection"
        />

        {!ready && (
          <div className="mood-lens__veil">
            {loading ? (
              <span className="mood-lens__spinner" aria-hidden="true" />
            ) : (
              <span className="mood-lens__veil-icon" aria-hidden="true">
                <CameraIcon />
              </span>
            )}
            <p>{loading ? "Warming up the lens…" : "Camera unavailable"}</p>
            {!loading && (
              <span className="mood-lens__veil-hint">
                Use the message below to restore access.
              </span>
            )}
          </div>
        )}

        {ready && !isRunning && (
          <span className="mood-lens__standby">
            <span aria-hidden="true" />
            Camera ready
          </span>
        )}

        <div className="mood-lens__readout">
          <span>Current mood</span>
          <strong>
            <span
              className="mood-lens__readout-dot"
              style={{ backgroundColor: getMoodTheme(detectedMood || mood).color }}
              aria-hidden="true"
            />
            {displayMood}
          </strong>
        </div>
      </div>

      {cameraError && (
        <div className="mood-lens__error" role="alert">
          <AlertIcon />
          <p>{cameraError}</p>
          <button type="button" onClick={setupCamera}>
            Retry
          </button>
        </div>
      )}

      <div className="mood-lens__controls">
        <p className="mood-lens__status" aria-live="polite">
          {status}
        </p>
        <button
          type="button"
          id="detect-mood-button"
          className={`mood-lens__detect${isRunning ? " is-stop" : ""}`}
          onClick={isRunning ? handleStop : handleDetect}
          disabled={!isRunning && (loading || !ready)}
        >
          {loading ? "Warming up…" : isRunning ? "Stop reading" : "Detect mood"}
        </button>
      </div>

      {playlistError && (
        <p className="mood-lens__playlist-error" role="alert">
          <span>{playlistError}</span>
          <button
            type="button"
            onClick={() => handleMoodRequest(lastDetectionRef.current, true)}
            disabled={!lastDetectionRef.current}
          >
            Try again
          </button>
        </p>
      )}

      <div className="mood-lens__history">
        <div className="mood-lens__history-head">
          <p className="eyebrow">Mood trail</p>
          <span>Last {MOOD_HISTORY_LIMIT} reads</span>
        </div>

        {moodHistory.length ? (
          <ul className="mood-trail">
            {moodHistory.map((entry) => {
              const theme = getMoodTheme(entry.mood);
              return (
                <li
                  key={`${entry.at}-${entry.mood}`}
                  style={{ "--chip-color": theme.color }}
                  title={new Date(entry.at).toLocaleString()}
                >
                  <span className="mood-trail__dot" aria-hidden="true" />
                  <span>{theme.label}</span>
                  <time dateTime={new Date(entry.at).toISOString()}>
                    {formatMoodTime(entry.at)}
                  </time>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mood-lens__history-empty">
            No reads yet. Your last few moods will settle here.
          </p>
        )}
      </div>
    </section>
  );
}
