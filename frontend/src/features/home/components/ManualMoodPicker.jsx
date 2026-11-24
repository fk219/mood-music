import { useContext, useEffect, useState } from "react";
import { SongContext } from "../song.context";
import { MOOD_KEYS, getMoodTheme } from "../moodTheme";

const ManualMoodPicker = () => {
  const { mood, moodSource, selectMood } = useContext(SongContext);
  const [busyMood, setBusyMood] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (moodSource !== "manual") setMessage("");
  }, [moodSource]);

  const handlePick = async (value) => {
    if (busyMood) return;

    setBusyMood(value);
    setMessage("");

    try {
      const result = await selectMood(value, "manual");

      if (!result?.stale) {
        if (result?.ok && result.fallback) {
          setMessage(
            "That mood has no records yet, so the room is playing a neutral set.",
          );
        } else if (result?.error) {
          setMessage(result.error);
        }
      }
    } finally {
      setBusyMood("");
    }
  };

  return (
    <section
      className="check-in"
      id="mood-checkin"
      aria-labelledby="check-in-title"
      aria-busy={Boolean(busyMood)}
    >
      <div className="check-in__copy">
        <p className="eyebrow">Mood check-in</p>
        <h2 id="check-in-title">How does today feel?</h2>
        <p>
          Pick the mood closest to now and the room tunes itself. No camera
          needed, and the check-in stays in your private journal.
        </p>
      </div>

      <div className="check-in__moods" role="group" aria-label="Choose your mood">
        {MOOD_KEYS.map((value) => {
          const theme = getMoodTheme(value);
          const active = mood === value;
          const busy = busyMood === value;

          return (
            <button
              key={value}
              type="button"
              className={`mood-pick${active ? " is-active" : ""}`}
              style={{ "--pick-color": theme.color }}
              onClick={() => handlePick(value)}
              disabled={Boolean(busyMood)}
              aria-pressed={active}
              title={`Play a ${theme.label.toLowerCase()} set`}
            >
              <span className="mood-pick__dot" aria-hidden="true" />
              <span className="mood-pick__label">{theme.label}</span>
              {busy && <span className="mood-pick__spinner" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <p className="check-in__status" aria-live="polite">
        {message}
      </p>
    </section>
  );
};

export default ManualMoodPicker;
