import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import RoomHeader from "../../shared/components/RoomHeader";
import { MOOD_KEYS, getMoodTheme } from "../../home/moodTheme";
import { uploadSong } from "../../home/services/song.api";
import { AlertIcon, UploadIcon } from "../../shared/components/Icons";
import "../styles/studio.scss";

const MAX_BYTES = 15 * 1024 * 1024;
const MP3_TYPES = new Set([
  "",
  "application/octet-stream",
  "audio/mpeg",
  "audio/mp3",
  "audio/x-mpeg",
  "audio/mpeg3",
  "audio/x-mp3",
  "audio/mpg",
]);

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isMp3 = (file) => {
  const name = (file?.name || "").toLowerCase();
  const type = (file?.type || "").toLowerCase();
  return name.endsWith(".mp3") && MP3_TYPES.has(type);
};

const Studio = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [mood, setMood] = useState("neutral");
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [uploaded, setUploaded] = useState(null);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    setStatus(null);
    setUploaded(null);
    setProgress(0);
    setFileError("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!isMp3(nextFile)) {
      setFile(null);
      setFileError("Choose an MP3 file. Other audio formats won’t be accepted.");
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_BYTES) {
      setFile(null);
      setFileError(
        `That file is ${formatBytes(nextFile.size)}. MP3 uploads must be 15 MB or smaller.`,
      );
      event.target.value = "";
      return;
    }

    setFile(nextFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (uploading) return;

    if (!file) {
      setStatus({ type: "error", message: "Choose an MP3 file first." });
      return;
    }

    if (fileError) return;

    setUploading(true);
    setProgress(0);
    setStatus(null);
    setUploaded(null);

    try {
      const response = await uploadSong({
        file,
        mood,
        onProgress: setProgress,
      });

      setUploaded(response.song);
      setStatus({
        type: "success",
        message: "Track added. It is already on the mood shelf.",
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "The upload didn’t go through. Check the file and try again.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const selectedTheme = getMoodTheme(mood);

  return (
    <div className="studio-page">
      <RoomHeader active="studio" />

      <main className="studio-shell">
        <section className="studio-intro" aria-labelledby="studio-title">
          <p className="eyebrow">Owner studio</p>
          <h1 id="studio-title">Grow the room’s record shelf.</h1>
          <p className="studio-intro__copy">
            Add an MP3 to the catalog, tag the mood it belongs to, and it joins
            the library for everyone listening.
          </p>

          <ul className="studio-checklist">
            <li>MP3 file, 15 MB or smaller</li>
            <li>ID3 title tag</li>
            <li>Embedded cover art</li>
            <li>One of the five room moods</li>
          </ul>

          <p className="studio-intro__note">
            Uploads are protected by your room session and capped at five per
            hour.
          </p>
        </section>

        <section className="studio-card" aria-labelledby="studio-form-title">
          <header className="studio-card__head">
            <div>
              <p className="eyebrow">Upload a record</p>
              <h2 id="studio-form-title">Add to the library</h2>
            </div>
            <span
              className="studio-card__mood"
              style={{ "--studio-mood": selectedTheme.color }}
            >
              <span aria-hidden="true" />
              {selectedTheme.label}
            </span>
          </header>

          <form className="studio-form" onSubmit={handleSubmit} aria-busy={uploading}>
            <fieldset className="studio-fieldset" disabled={uploading}>
              <legend>Mood</legend>
              <div className="studio-moods">
                {MOOD_KEYS.map((value) => {
                  const theme = getMoodTheme(value);

                  return (
                    <label
                      key={value}
                      className={`studio-mood${mood === value ? " is-active" : ""}`}
                      style={{ "--studio-mood": theme.color }}
                    >
                      <input
                        type="radio"
                        name="mood"
                        value={value}
                        checked={mood === value}
                        onChange={() => setMood(value)}
                        className="sr-only"
                      />
                      <span className="studio-mood__dot" aria-hidden="true" />
                      <span>{theme.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="studio-file">
              <label className="studio-dropzone" htmlFor="studio-song">
                <span className="studio-dropzone__icon" aria-hidden="true">
                  <UploadIcon />
                </span>
                <span className="studio-dropzone__title">
                  {file ? file.name : "Choose an MP3"}
                </span>
                <span className="studio-dropzone__hint">
                  {file
                    ? `${formatBytes(file.size)} · ready to upload`
                    : "MP3 only · max 15 MB · title and cover art required"}
                </span>
                <input
                  ref={fileInputRef}
                  id="studio-song"
                  type="file"
                  accept="audio/mpeg,.mp3"
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>

              {fileError && (
                <p className="studio-form__error" role="alert">
                  <AlertIcon />
                  <span>{fileError}</span>
                </p>
              )}
            </div>

            {uploading && (
              <div className="studio-progress" role="status">
                <div
                  className="studio-progress__track"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={progress}
                  aria-label="Upload progress"
                >
                  <span style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            )}

            <button
              type="submit"
              className="button studio-submit"
              disabled={uploading || !file || Boolean(fileError)}
            >
              {uploading ? "Uploading…" : "Add to the library"}
            </button>

            {status && (
              <div
                className={`studio-status is-${status.type}`}
                role={status.type === "error" ? "alert" : "status"}
              >
                {status.type === "error" ? <AlertIcon /> : <span className="studio-status__dot" aria-hidden="true" />}
                <span>{status.message}</span>
              </div>
            )}
          </form>

          {uploaded && (
            <article className="studio-result">
              {uploaded.posterImage ? (
                <img
                  src={uploaded.posterImage}
                  alt={`Cover art for ${uploaded.title}`}
                />
              ) : (
                <span className="studio-result__fallback" aria-hidden="true">
                  <UploadIcon />
                </span>
              )}
              <div>
                <p className="eyebrow">
                  Added to {getMoodTheme(uploaded.mood).label}
                </p>
                <h3>{uploaded.title}</h3>
                <Link to="/" className="studio-result__link">
                  Back to the listening room
                </Link>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
};

export default Studio;
