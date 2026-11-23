import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SongContext } from "../song.context";
import { getMoodTheme, normalizeMood, SOURCE_LABEL } from "../moodTheme";
import {
  MusicIcon,
  MutedIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  RestartIcon,
  ShuffleIcon,
  VolumeIcon,
} from "../../shared/components/Icons";
import "../styles/player.scss";

const SPEEDS = [0.75, 1, 1.25, 1.5];

const formatTime = (value) => {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const Player = () => {
  const {
    song,
    loading,
    error,
    mood,
    moodSource,
    requestMoodDetection,
    queue,
    queueIndex,
    shuffle,
    toggleShuffle,
    playNext,
    playPrevious,
    playHouseTrack,
    playSignal,
    fallbackNote,
  } = useContext(SongContext);

  const audioRef = useRef(null);
  const playNextRef = useRef(playNext);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    setPosterFailed(false);
    if (!audio) return;

    if (!song?.url) {
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      setPlaybackError("");
      return;
    }

    audio.src = song.url;
    audio.load();
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setPlaybackError("");
  }, [song?.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(audio.duration || 0);
      playNextRef.current?.();
    };
    const handleError = () => {
      setIsPlaying(false);
      setPlaybackError(
        "We couldn’t play this track. Check your connection and try again.",
      );
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (!playSignal || !song?.url) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended) audio.currentTime = 0;

    audio.play().catch((playError) => {
      if (playError?.name === "AbortError") return;
      setPlaybackError("Your browser paused the room. Press play to start.");
    });
  }, [playSignal, song?.url]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !song?.url) return;

    setPlaybackError("");

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (audio.ended) audio.currentTime = 0;

    try {
      await audio.play();
    } catch (playError) {
      if (playError?.name === "AbortError") return;
      setPlaybackError("Playback couldn’t start. Press play to try again.");
    }
  }, [song?.url]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.code !== "Space" ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      if (
        ["input", "textarea", "select", "button", "a"].includes(tag) ||
        target?.isContentEditable
      ) {
        return;
      }

      if (!song?.url) return;

      event.preventDefault();
      togglePlayback();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayback, song?.url]);

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Number(event.target.value);
    setProgress(Number(event.target.value));
  };

  const shiftTime = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(
      0,
      Math.min(audio.duration || 0, audio.currentTime + seconds),
    );
    audio.currentTime = nextTime;
    setProgress(nextTime);
  };

  const restartTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setProgress(0);
  };

  const cycleSpeed = () => {
    const nextIndex = (SPEEDS.indexOf(speed) + 1) % SPEEDS.length;
    setSpeed(SPEEDS[nextIndex]);
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (muted) setMuted(false);
  };

  const isSilent = muted || volume === 0;

  const toggleMute = () => {
    if (isSilent) {
      setMuted(false);
      if (volume === 0) setVolume(0.6);
      return;
    }

    setMuted(true);
  };

  const retryPlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackError("");
    audio.load();

    try {
      await audio.play();
    } catch (playError) {
      if (playError?.name === "AbortError") return;
      setPlaybackError("Playback still can’t start. Try another track.");
    }
  };

  const handleDetectRequest = () => {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    document.getElementById("mood-lens")?.scrollIntoView?.({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
    requestMoodDetection();
  };

  const handleHouseTrack = () => {
    playHouseTrack();
  };

  const handlePrevious = () => {
    const audio = audioRef.current;

    if (queue.length && audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    playPrevious();
  };

  const songMood = normalizeMood(song?.mood || "");
  const songMoodLabel = songMood ? getMoodTheme(songMood).label : "Curated";
  const sourceLabel = SOURCE_LABEL[moodSource] || "Shaped by the room";
  const progressPercent =
    duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <>
      {song?.url ? (
        <section
          className={`now-spinning${isPlaying ? " is-playing" : ""}`}
          aria-label="Now spinning"
          aria-busy={loading}
        >
          <div className="now-spinning__platter">
            <div className="now-spinning__halo" aria-hidden="true" />

            <div className="now-spinning__ring">
              <div className="now-spinning__disc">
                {song.posterImage && !posterFailed ? (
                  <img
                    className="now-spinning__art"
                    src={song.posterImage}
                    alt={`Album art for ${song.title || "the current track"}`}
                    onError={() => setPosterFailed(true)}
                    draggable="false"
                  />
                ) : (
                  <div
                    className="now-spinning__art now-spinning__fallback"
                    role="img"
                    aria-label={`Fallback artwork for ${song.title || "the current track"}`}
                  >
                    <MusicIcon />
                  </div>
                )}
                <span className="now-spinning__grooves" aria-hidden="true" />
                <span className="now-spinning__spindle" aria-hidden="true" />
              </div>
            </div>

            <span className="now-spinning__room-mood">
              <span
                style={{ backgroundColor: getMoodTheme(mood).color }}
                aria-hidden="true"
              />
              Room · {getMoodTheme(mood).label}
            </span>

            {loading && (
              <div className="now-spinning__loading" role="status">
                <span className="now-spinning__spinner" aria-hidden="true" />
                <span>Tuning the room…</span>
              </div>
            )}
          </div>

          <div className="now-spinning__meta">
            <p className="eyebrow">Now spinning</p>
            <h1 title={song.title}>{song.title || "Moodify mix"}</h1>
            <p className="now-spinning__sub">
              <span>{songMoodLabel} mix</span>
              <span className="now-spinning__dot" aria-hidden="true" />
              <span>{sourceLabel}</span>
              {queue.length > 1 && (
                <>
                  <span className="now-spinning__dot" aria-hidden="true" />
                  <span>
                    {queueIndex + 1} of {queue.length}
                  </span>
                </>
              )}
            </p>
            {fallbackNote && (
              <p className="now-spinning__fallback">{fallbackNote}</p>
            )}
          </div>
        </section>
      ) : (
        <section
          className="now-spinning now-spinning--empty"
          aria-label="Nothing playing"
        >
          <div className="now-spinning__platter">
            <div className="now-spinning__halo" aria-hidden="true" />
            <div className="empty-platter">
              <span className="empty-platter__icon" aria-hidden="true">
                <MusicIcon />
              </span>
            </div>
          </div>

          <div className="now-spinning__meta">
            <p className="eyebrow">The platter is bare</p>
            <h1>The room is quiet.</h1>
            <p className="now-spinning__empty-copy">
              Pick a mood above or look into the lens, and a record will drop on
              the platter. The house record is always here too.
            </p>
            <div className="now-spinning__empty-actions">
              <button
                type="button"
                className="button"
                onClick={handleDetectRequest}
              >
                Detect mood
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={handleHouseTrack}
              >
                Play the house track
              </button>
            </div>
          </div>
        </section>
      )}

      {song?.url && (
        <aside
          className="player-bar"
          aria-label="Player controls"
          aria-busy={loading}
        >
          <div className="player-bar__track">
            <div className="player-bar__thumb">
              {song.posterImage && !posterFailed ? (
                <img src={song.posterImage} alt="" aria-hidden="true" />
              ) : (
                <span className="player-bar__thumb-fallback" aria-hidden="true">
                  <MusicIcon />
                </span>
              )}
            </div>
            <div className="player-bar__copy">
              <p className="player-bar__eyebrow">
                {loading ? "Tuning the room" : error ? "Signal lost" : "In the room"}
              </p>
              <p className="player-bar__title" title={song.title || "Moodify mix"}>
                {song.title || "Moodify mix"}
              </p>
              <p className={`player-bar__meta${error ? " is-error" : ""}`}>
                {loading
                  ? "Finding a new side…"
                  : error ||
                    fallbackNote ||
                    `${songMoodLabel} mix${queue.length > 1 ? ` · ${queueIndex + 1}/${queue.length}` : ""}`}
              </p>
            </div>
          </div>

          <div className="player-bar__main">
            {playbackError ? (
              <div className="player-bar__error" role="alert">
                <span>{playbackError}</span>
                <button type="button" onClick={retryPlayback}>
                  Retry
                </button>
              </div>
            ) : (
              <div className="player-bar__timeline">
                <span>{formatTime(progress)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={duration ? Math.min(progress, duration) : 0}
                  onChange={handleSeek}
                  style={{ "--fill": `${progressPercent}%` }}
                  aria-label="Seek through track"
                  disabled={!duration}
                />
                <span>{formatTime(duration)}</span>
              </div>
            )}

            <div className="player-bar__controls">
              <button
                type="button"
                className="player-bar__control player-bar__control--queue"
                onClick={handlePrevious}
                aria-label="Previous track"
                title="Previous track"
                disabled={!queue.length}
              >
                <PreviousIcon />
              </button>
              <button
                type="button"
                className="player-bar__control"
                onClick={restartTrack}
                aria-label="Restart track"
                title="Restart track"
              >
                <RestartIcon />
              </button>
              <button
                type="button"
                className="player-bar__control player-bar__control--skip"
                onClick={() => shiftTime(-10)}
                aria-label="Back 10 seconds"
                title="Back 10 seconds"
              >
                −10
              </button>
              <button
                type="button"
                className="player-bar__control player-bar__control--play"
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause track" : "Play track"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className="player-bar__control player-bar__control--skip"
                onClick={() => shiftTime(10)}
                aria-label="Forward 10 seconds"
                title="Forward 10 seconds"
              >
                +10
              </button>
              <button
                type="button"
                className="player-bar__control player-bar__control--queue"
                onClick={playNext}
                aria-label="Next track"
                title="Next track"
                disabled={!queue.length}
              >
                <NextIcon />
              </button>
            </div>
          </div>

          <div className="player-bar__utility">
            <button
              type="button"
              className={`player-bar__shuffle${shuffle ? " is-on" : ""}`}
              onClick={toggleShuffle}
              aria-label={shuffle ? "Turn shuffle off" : "Turn shuffle on"}
              aria-pressed={shuffle}
              title={shuffle ? "Shuffle on" : "Shuffle the queue"}
            >
              <ShuffleIcon />
            </button>

            <button
              type="button"
              className="player-bar__speed"
              onClick={cycleSpeed}
              aria-label={`Playback speed ${speed} times`}
              title="Cycle playback speed"
            >
              {speed}×
            </button>

            <button
              type="button"
              className="player-bar__mute"
              onClick={toggleMute}
              aria-label={isSilent ? "Unmute" : "Mute"}
              aria-pressed={isSilent}
              title={isSilent ? "Unmute" : "Mute"}
            >
              {isSilent ? <MutedIcon /> : <VolumeIcon />}
            </button>

            <label className="player-bar__volume">
              <span className="sr-only">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{ "--fill": `${volume * 100}%` }}
                aria-label="Volume"
              />
            </label>

            <span className="player-bar__hint" aria-hidden="true">
              Space · play/pause
            </span>
          </div>
        </aside>
      )}

      <audio ref={audioRef} preload="metadata" className="player-audio" />
    </>
  );
};

export default Player;
