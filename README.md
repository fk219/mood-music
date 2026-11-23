# Moodify

A privacy-first mood listening room. Moodify reads your expression on-device, or takes a manual check-in, then tunes the room to one of five moods with a track from the library. It keeps a queue playing and builds a private weekly mood journal from your check-ins.

**Live app:** https://moodify.furqankhan.dev
**API:** https://moodify-backend-8rn5.onrender.com

![Moodify](docs/preview.png)

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-face%20landmarks-0097A7)
![Node](https://img.shields.io/badge/Node.js-22-5FA04E?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-sessions-DC382D?logo=redis&logoColor=white)
![Render](https://img.shields.io/badge/API-Render-46E3B7)
![Vercel](https://img.shields.io/badge/Web-Vercel-000000?logo=vercel&logoColor=white)

## What it is

Most music apps ask what you want to hear. Moodify asks how you feel, then makes the room match. The signature flow uses the camera and MediaPipe Face Landmarker entirely in the browser: no frames leave the device. When the camera is unavailable or you would rather not use it, the manual check-in does the same job with one click.

Every check-in belongs to the signed-in listener. The journal shows the last seven days, the dominant mood, and the ten most recent entries. A protected Studio lets an owner grow the catalog by uploading tagged MP3s.

## Capabilities

**Mood lens (signature flow)**
- On-device face detection with MediaPipe Tasks Vision.
- Expressions normalized into `neutral`, `happy`, `sad`, `angry`, and `surprised`.
- Camera permission and camera-error guidance with retry and stop-reading controls.
- Detected moods fetch a matching track, update the queue, and turn the mood ring.
- Camera check-ins are recorded at most once every 30 seconds; the trail keeps the last five local reads.

**Manual check-in**
- All five moods are available without a camera.
- A pick uses the same mood-selection path as a camera read: fetch tracks, build the queue, autoplay, and update the ring.
- Manual check-ins are saved to the journal immediately and marked as `manual`.

**Library and queue**
- A Library panel groups the real catalog by mood with cover art and track actions.
- Playing a track sets the queue to that mood's songs; previous/next wrap through it.
- Shuffle reorders the current queue, auto-advance keeps the room playing, and "Up next" shows what follows.
- The current track is marked in both the library and the fixed player bar.

**Mood journal**
- Weekly stacked bars by mood, seven-day counts, dominant mood, and the last 10 check-ins.
- Each entry records its source (`camera` or `manual`) and timestamp.
- Clear-history action removes the signed-in user's entries only.
- A mood with no tracks safely falls back to the neutral set instead of showing an empty room.

**Owner Studio**
- Protected `/studio` route reachable from the room header.
- MP3 picker, mood selector, upload progress, success/error states, and a result card.
- Validation: MP3 only, 15 MB maximum, valid mood, ID3 title, and embedded cover art.
- Uploads require a signed-in session. Set `STUDIO_EMAIL` to reserve the Studio for one owner account.

**Accounts and room**
- Register, log in, log out, protected room and Studio routes.
- JWT in an `httpOnly`, `SameSite=None`, `Secure` cookie; bcrypt password hashing; Redis-backed logout.
- Play, pause, seek, restart, volume, mute, speed, previous/next, shuffle, and `Space` play/pause.
- Helmet security headers and IP rate limits on auth writes, mood writes, and uploads.

## How it works

```
Camera ──► MediaPipe FaceLandmarker ──► expression
                                             │
                                  normalize to mood
                                             │
Manual check-in ─────────────────────────────┤
                                             ▼
                          GET /api/song?mood=<mood>
                                             │
                          queue + player + mood ring
                                             │
                          POST /api/mood (camera throttled)
                                             ▼
                          GET /api/mood/summary ──► journal
```

The backend stores tracks in MongoDB and media in ImageKit. Redis invalidates logged-out JWTs. Mood entries are stored per user in MongoDB as `MoodEntry { user, mood, source, createdAt }` with timestamps enabled; camera entries are deduplicated to at most one every 30 seconds on both the client and the server, while manual picks record immediately.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, Sass, MediaPipe Tasks Vision |
| Backend | Node.js, Express 5, Mongoose, ioredis, JWT, bcrypt, multer, ImageKit, Helmet, express-rate-limit |
| Hosting | Vercel (web), Render (API), MongoDB Atlas, Upstash/Redis |

## Project structure

```
backend/
  server.js
  src/app.js                     Express app, Helmet, CORS, error handling
  routes/                        auth, song, mood
  controllers/                   auth, song upload/library, mood journal
  models/                        User, Song, MoodEntry, Blacklist
  middleware/                    auth, upload, rate limits, Studio owner gate
  services/                      ImageKit storage
  utils/                         shared mood normalization
frontend/
  src/
    features/Expression/         camera, face landmarks, mood lens
    features/home/               player, queue, manual check-in, library, journal
    features/studio/             owner upload page
    features/auth/               auth context, pages, guards
    features/shared/             tokens, API client, header, icons
```

## Run locally

```bash
# API
cd backend
npm install
cp .env.example .env             # Mongo, JWT, ImageKit and Redis keys
npm run dev                      # http://localhost:3000

# Web
cd frontend
npm install
cp .env.example .env.local      # optional: point at a local API
npm run dev                      # http://localhost:5173
```

The web app defaults to the deployed API. To point it at a local API:

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:3000
```

### Environment variables

| Key | Required | Purpose |
|---|---|---|
| `PORT` | No | API port (defaults to 3000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signs auth cookies |
| `IMAGEKIT_PRIVATE_KEY` | Yes | Server-side uploads |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Yes | Logout token store |
| `STUDIO_EMAIL` | No | Restricts uploads to one owner email; any signed-in user can upload when unset |
| `VITE_API_URL` | No | Frontend API origin override (defaults to the Render API) |

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create account (10/min per IP) |
| `POST` | `/api/auth/login` | Public | Sign in, set cookie (10/min per IP) |
| `GET` | `/api/auth/logout` | Cookie | Invalidate session in Redis |
| `GET` | `/api/auth/get-me` | Cookie | Current user |
| `GET` | `/api/song?mood=` | Public | Tracks for a mood; falls back to neutral when empty |
| `GET` | `/api/song/library` | Public | Full catalog grouped by mood |
| `POST` | `/api/song` | Cookie | Upload an MP3 (5/hour per IP) |
| `POST` | `/api/mood` | Cookie | Record a check-in (30/min per IP) |
| `GET` | `/api/mood/summary` | Cookie | Seven-day counts, dominant mood, last 10 entries |
| `DELETE` | `/api/mood` | Cookie | Clear the current user's journal |

`POST /api/song` accepts `multipart/form-data` with `song` (MP3) and `mood`. The MP3 must include an ID3 title and embedded cover art; missing tags return a `400` with a clear message.

## Deployment notes

- The API runs on Render's free plan, so the first request after idle can take ~50 seconds.
- Camera access requires HTTPS; production is served over TLS.
- CORS is restricted to the production app URL plus localhost.
- Set `STUDIO_EMAIL` in production to keep the catalog owner-only.
- Rate limits use express-rate-limit's in-memory store, so they reset on restart and are scoped to one API instance.
- `frontend/vercel.json` rewrites client routes to `index.html`, including `/studio`.
