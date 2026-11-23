import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SongContext } from "../song.context";
import { MOOD_KEYS, getMoodTheme, SOURCE_LABEL } from "../moodTheme";
import { getMoodSummary } from "../services/mood.api";
import { TrashIcon } from "../../shared/components/Icons";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  timeZone: "UTC",
});

const ENTRY_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatDay = (date) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : WEEKDAY_FORMAT.format(parsed);
};

const formatEntryTime = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : ENTRY_FORMAT.format(parsed);
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const JournalPanel = () => {
  const { journalSignal, journalError, clearJournal } = useContext(SongContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const requestIdRef = useRef(0);

  const loadSummary = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError("");

    try {
      const response = await getMoodSummary();
      if (requestId === requestIdRef.current) setSummary(response);
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;
      setError(
        requestError?.response?.data?.message ||
          "The journal couldn't be opened. Check your connection and try again.",
      );
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, journalSignal]);

  const handleClear = async () => {
    setClearing(true);
    setClearError("");

    try {
      await clearJournal();
      setConfirming(false);
    } catch (requestError) {
      setClearError(
        requestError?.response?.data?.message ||
          "The journal couldn't be cleared. Try again.",
      );
    } finally {
      setClearing(false);
    }
  };

  const counts = summary?.counts || {};
  const days = Array.isArray(summary?.days) ? summary.days : [];
  const entries = Array.isArray(summary?.entries) ? summary.entries : [];
  const total = summary?.total || 0;
  const dominant = summary?.dominantMood
    ? getMoodTheme(summary.dominantMood)
    : null;
  const maxDay = Math.max(1, ...days.map((day) => day.total || 0));
  const today = todayKey();

  return (
    <section
      className="journal-panel room-panel"
      id="journal"
      aria-labelledby="journal-title"
    >
      <header className="room-panel__head">
        <div>
          <p className="eyebrow">Mood journal</p>
          <h2 id="journal-title">Your week</h2>
          <p className="room-panel__sub">
            Private to your account. Camera reads and manual check-ins build the
            picture.
          </p>
        </div>
        <span className="journal-panel__badge">7 days</span>
      </header>

      {loading && !summary && (
        <div className="room-panel__state" role="status">
          <span className="panel-spinner" aria-hidden="true" />
          Opening the journal…
        </div>
      )}

      {journalError && (
        <p className="journal-warning" role="alert">
          {journalError}
        </p>
      )}

      {!loading && error && (
        <div className="room-panel__state room-panel__state--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadSummary}>
            Try again
          </button>
        </div>
      )}

      {!error && summary && (
        <>
          <div className="journal-week-wrap">
            <div
              className="journal-week"
              role="img"
              aria-label={`${total} mood check-ins across the last seven days`}
            >
              {days.map((day) => {
                const isToday = day.date === today;

                return (
                  <div
                    className={`journal-day${isToday ? " is-today" : ""}`}
                    key={day.date}
                    title={`${formatDay(day.date)}: ${day.total} check-in${day.total === 1 ? "" : "s"}`}
                  >
                    <span className="journal-day__count" aria-hidden="true">
                      {day.total || ""}
                    </span>
                    <div className="journal-day__bar" aria-hidden="true">
                      {day.total > 0 ? (
                        MOOD_KEYS.map((mood) => {
                          const count = day.counts?.[mood] || 0;
                          if (!count) return null;

                          return (
                            <span
                              key={mood}
                              style={{
                                height: `${(count / maxDay) * 100}%`,
                                backgroundColor: getMoodTheme(mood).color,
                              }}
                            />
                          );
                        })
                      ) : (
                        <span className="journal-day__empty" />
                      )}
                    </div>
                    <span className="journal-day__label">
                      {formatDay(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="journal-dominant">
              <span
                className="journal-dominant__dot"
                style={{ backgroundColor: dominant?.color || "#a79bb5" }}
                aria-hidden="true"
              />
              <div>
                <p>Dominant mood</p>
                <strong>{dominant ? dominant.label : "No mood yet"}</strong>
              </div>
              <span className="journal-dominant__count">
                {dominant ? `${counts[summary.dominantMood] || 0} check-ins` : "Start a read"}
              </span>
            </div>
          </div>

          <ul className="journal-counts" aria-label="Mood counts this week">
            {MOOD_KEYS.map((mood) => {
              const theme = getMoodTheme(mood);

              return (
                <li key={mood} style={{ "--count-color": theme.color }}>
                  <span className="journal-counts__dot" aria-hidden="true" />
                  <span>{theme.label}</span>
                  <strong>{counts[mood] || 0}</strong>
                </li>
              );
            })}
          </ul>

          <div className="journal-recent">
            <div className="journal-recent__head">
              <h3>Recent check-ins</h3>
              <span>Last 10</span>
            </div>

            {entries.length > 0 ? (
              <ul className="journal-entries">
                {entries.map((entry) => {
                  const theme = getMoodTheme(entry.mood);

                  return (
                    <li key={entry.id}>
                      <span
                        className="journal-entries__dot"
                        style={{ backgroundColor: theme.color }}
                        aria-hidden="true"
                      />
                      <span className="journal-entries__mood">{theme.label}</span>
                      <span className={`journal-entries__source is-${entry.source}`}>
                        {SOURCE_LABEL[entry.source] || entry.source}
                      </span>
                      <time dateTime={entry.createdAt}>
                        {formatEntryTime(entry.createdAt)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="journal-recent__empty">
                Nothing logged yet. Pick a mood above or start a camera read and
                your week will start to fill in.
              </p>
            )}
          </div>

          <div className="journal-clear">
            {confirming ? (
              <div className="journal-clear__confirm" role="group" aria-label="Confirm clearing history">
                <p>Clear every check-in? This can’t be undone.</p>
                <button
                  type="button"
                  className="journal-clear__danger"
                  onClick={handleClear}
                  disabled={clearing}
                >
                  {clearing ? "Clearing…" : "Yes, clear"}
                </button>
                <button
                  type="button"
                  className="journal-clear__cancel"
                  onClick={() => {
                    setConfirming(false);
                    setClearError("");
                  }}
                  disabled={clearing}
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="journal-clear__button"
                onClick={() => {
                  setClearError("");
                  setConfirming(true);
                }}
                disabled={total === 0 && entries.length === 0}
              >
                <TrashIcon />
                <span>Clear history</span>
              </button>
            )}

            {clearError && (
              <p className="journal-clear__error" role="alert">
                {clearError}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default JournalPanel;
