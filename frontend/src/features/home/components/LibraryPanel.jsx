import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SongContext } from "../song.context";
import { MOOD_KEYS, getMoodTheme } from "../moodTheme";
import { getLibrary } from "../services/song.api";
import {
  MusicIcon,
  NextIcon,
  PlayIcon,
  PreviousIcon,
  ShuffleIcon,
} from "../../shared/components/Icons";

const emptyLibrary = () => Object.fromEntries(MOOD_KEYS.map((mood) => [mood, []]));

const TrackArt = ({ src, title }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="track-art track-art--fallback" aria-hidden="true">
        <MusicIcon />
      </span>
    );
  }

  return (
    <span className="track-art">
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        aria-hidden="true"
      />
      <span className="sr-only">{title} cover art</span>
    </span>
  );
};

const LibraryPanel = () => {
  const {
    song,
    selectMood,
    queue,
    queueIndex,
    queueMood,
    shuffle,
    toggleShuffle,
    playTrack,
    playNext,
    playPrevious,
  } = useContext(SongContext);

  const [library, setLibrary] = useState(emptyLibrary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getLibrary();
      const grouped = emptyLibrary();
      MOOD_KEYS.forEach((mood) => {
        const tracks = response?.library?.[mood];
        grouped[mood] = Array.isArray(tracks) ? tracks : [];
      });
      setLibrary(grouped);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "The shelves couldn't be read. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  const total = useMemo(
    () => MOOD_KEYS.reduce((sum, mood) => sum + library[mood].length, 0),
    [library],
  );

  const queueLabel = queue.length
    ? `${Math.min(queueIndex + 1, queue.length)} of ${queue.length}`
    : "No queue";

  const upcoming = useMemo(() => {
    if (!queue.length) return [];
    const start = queueIndex >= 0 ? queueIndex + 1 : 0;
    return queue.slice(start, start + 4);
  }, [queue, queueIndex]);

  const wrapsTo = useMemo(() => {
    if (!queue.length || queueIndex !== queue.length - 1 || queue.length < 2) {
      return null;
    }
    return queue[0];
  }, [queue, queueIndex]);

  const handleMoodHeadingPlay = (mood) => {
    const tracks = library[mood];
    if (tracks[0]) playTrack(tracks[0], tracks, mood);
  };

  return (
    <section
      className="library-panel room-panel"
      id="library"
      aria-labelledby="library-title"
    >
      <header className="room-panel__head">
        <div>
          <p className="eyebrow">Record shelf</p>
          <h2 id="library-title">Records by mood</h2>
          <p className="room-panel__sub">
            {loading
              ? "Reading the shelves…"
              : total > 0
                ? `${total} tracks on the shelves. Pick a cover to set the queue.`
                : "The shelves are waiting for their first record."}
          </p>
        </div>

        <div className="library-panel__actions">
          <button
            type="button"
            className={`panel-toggle${shuffle ? " is-on" : ""}`}
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label={shuffle ? "Turn shuffle off" : "Turn shuffle on"}
            title="Shuffle the current queue"
          >
            <ShuffleIcon />
            <span>Shuffle</span>
          </button>
        </div>
      </header>

      {loading && (
        <div className="room-panel__state" role="status">
          <span className="panel-spinner" aria-hidden="true" />
          Reading the shelves…
        </div>
      )}

      {!loading && error && (
        <div className="room-panel__state room-panel__state--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadLibrary}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && total === 0 && (
        <div className="room-panel__empty">
          <p className="room-panel__empty-title">No records yet.</p>
          <p>
            Upload the first MP3 in the Studio, tag a mood, and it will appear
            here with the rest of the room.
          </p>
          <Link className="button button--ghost" to="/studio">
            Open the studio
          </Link>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div className="library-layout">
          <div className="library-scroll">
            {MOOD_KEYS.map((mood) => {
              const tracks = library[mood];
              if (!tracks.length) return null;
              const theme = getMoodTheme(mood);

              return (
                <section className="library-group" key={mood}>
                  <header className="library-group__head">
                    <span
                      className="library-group__dot"
                      style={{ backgroundColor: theme.color }}
                      aria-hidden="true"
                    />
                    <h3>{theme.label}</h3>
                    <span className="library-group__count">
                      {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                    </span>
                    <button
                      type="button"
                      className="library-group__play"
                      onClick={() => handleMoodHeadingPlay(mood)}
                      aria-label={`Play all ${theme.label.toLowerCase()} tracks`}
                    >
                      <PlayIcon />
                      <span>Play all</span>
                    </button>
                  </header>

                  <ul className="record-grid">
                    {tracks.map((track) => {
                      const isCurrent = song?.url === track.url;

                      return (
                        <li key={track._id || track.url}>
                          <button
                            type="button"
                            className={`record-card${isCurrent ? " is-current" : ""}`}
                            onClick={() => playTrack(track, tracks, mood)}
                            aria-label={
                              isCurrent
                                ? `Play ${track.title} again`
                                : `Play ${track.title}`
                            }
                            aria-current={isCurrent ? "true" : undefined}
                          >
                            <span className="record-card__art">
                              <TrackArt
                                src={track.posterImage}
                                title={track.title}
                              />
                              <span
                                className="record-card__shade"
                                aria-hidden="true"
                              />
                              <span
                                className="record-card__action"
                                aria-hidden="true"
                              >
                                {isCurrent ? (
                                  <span className="record-card__bars">
                                    <span />
                                    <span />
                                    <span />
                                  </span>
                                ) : (
                                  <PlayIcon />
                                )}
                              </span>
                              {isCurrent && (
                                <span className="record-card__now">
                                  On the platter
                                </span>
                              )}
                            </span>
                            <span className="record-card__copy">
                              <strong title={track.title}>{track.title}</strong>
                              <span className="record-card__meta">
                                <span
                                  className="record-card__dot"
                                  style={{ backgroundColor: theme.color }}
                                  aria-hidden="true"
                                />
                                {isCurrent ? "On the platter" : `${theme.label} record`}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <aside className="queue-panel" aria-label="Up next">
            <header className="queue-panel__head">
              <div>
                <p className="eyebrow">Up next</p>
                <h3>
                  {queueMood
                    ? `${getMoodTheme(queueMood).label} set`
                    : "The queue"}
                </h3>
              </div>
              <span className="queue-panel__count">{queueLabel}</span>
            </header>

            {upcoming.length > 0 ? (
              <ol className="queue-list">
                {upcoming.map((track, index) => (
                  <li key={`${track.url}-${index}`}>
                    <button
                      type="button"
                      className="queue-row"
                      onClick={() => playTrack(track, queue, queueMood)}
                      aria-label={`Play next: ${track.title}`}
                    >
                      <span className="queue-row__index" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="queue-row__copy">
                        <strong title={track.title}>{track.title}</strong>
                        <span>
                          {track.mood
                            ? getMoodTheme(track.mood).label
                            : "Mood set"}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="queue-panel__empty">
                {wrapsTo ? (
                  <p>
                    The queue wraps back to
                    <strong> {wrapsTo.title}</strong>.
                  </p>
                ) : queue.length === 1 ? (
                  <p>
                    One record in this mood. The room will loop it when it ends.
                  </p>
                ) : (
                  <p>
                    Pick a cover or run a mood check-in to build the queue.
                  </p>
                )}
              </div>
            )}

            <div className="queue-panel__foot">
              <button
                type="button"
                onClick={playPrevious}
                disabled={!queue.length}
                aria-label="Previous track"
              >
                <PreviousIcon />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={playNext}
                disabled={!queue.length}
                aria-label="Next track"
              >
                <span>Next</span>
                <NextIcon />
              </button>
            </div>

            <button
              type="button"
              className="queue-panel__mood"
              onClick={() => {
                if (queueMood) void selectMood(queueMood, "manual");
              }}
              disabled={!queueMood}
            >
              Tune a fresh {queueMood ? getMoodTheme(queueMood).label.toLowerCase() : "mood"} set
            </button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default LibraryPanel;
