# Moodify

A small listening room that reads your face, guesses your mood, and plays a track that fits it.

**Live app:** https://moodify.furqankhan.dev
**API:** https://moodify-backend-8rn5.onrender.com

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-face%20landmarks-0097A7)
![Node](https://img.shields.io/badge/Node.js-22-5FA04E?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-sessions-DC382D?logo=redis&logoColor=white)
![Render](https://img.shields.io/badge/API-Render-46E3B7)
![Vercel](https://img.shields.io/badge/Web-Vercel-000000?logo=vercel&logoColor=white)

## What it is

Most music apps ask what you want to hear. Moodify watches your expression through the camera, maps it to one of five moods, and picks a song for that mood. The interface reacts with it: a mood ring around the record shifts hue, the record spins while music plays, and your last few detections stay in a small trail.

## Features

**Mood lens**
- Face detection in the browser with MediaPipe Tasks Vision — no frames leave the device.
- Expressions normalized into `neutral`, `happy`, `sad`, `angry`, and `surprised`.
- Camera permission and camera-error guidance, with retry and a stop-reading control.
- Mood trail: the last five detections, persisted locally, shown as colored chips with timestamps.

**Listening room**
- Mood ring halo and record artwork that shift with the detected mood.
- Play, pause, seek, restart, volume, mute, and playback-speed cycling.
- Playback errors with retry, fetch loading overlay, and an empty-platter state with clear actions.
- `Space` toggles playback when focus is not inside an input.
- Halo drift and record spin disabled under `prefers-reduced-motion`.

**Accounts**
- Register, log in, log out, protected home route.
- JWT in an `httpOnly`, `SameSite=None`, `Secure` cookie; bcrypt password hashing; Redis-backed logout.
- Inline auth validation, loading spinners, and disabled states.

## How it works

```
Camera ──► MediaPipe FaceLandmarker ──► expression
                                            │
                              normalize to mood
                                            │
              GET /api/song?mood=<mood> ────┤
                                            ▼
                                   audio player + mood ring
```

The backend stores tracks in MongoDB and media in ImageKit; Redis is used for logout invalidation.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite, Sass, MediaPipe Tasks Vision |
| Backend | Node.js, Express 5, Mongoose, ioredis, JWT, bcrypt, multer, ImageKit |
| Hosting | Vercel (web), Render (API), MongoDB Atlas, Upstash/Redis |

## Project structure

```
backend/
  server.js
  src/app.js                     Express app + CORS
  routes/                        auth, song
  controllers/                   register, login, logout, me, upload, get song
  models/                        User, Song
frontend/
  src/
    features/Expression/         camera, face landmarks, mood normalization
    features/home/               player, mood ring, song context
    features/auth/               auth context, pages, guards
    features/shared/             tokens, buttons, icons
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
npm run dev                      # http://localhost:5173
```

### Environment variables

| Key | Purpose |
|---|---|
| `PORT` | API port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs auth cookies |
| `IMAGEKIT_PRIVATE_KEY` | Server-side uploads |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Logout token store |

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Sign in, set cookie |
| `GET` | `/api/auth/logout` | Cookie | Invalidate session |
| `GET` | `/api/auth/get-me` | Cookie | Current user |
| `POST` | `/api/song` | Cookie | Upload a track |
| `GET` | `/api/song?mood=` | Cookie | Get a song for a mood |

## Deployment notes

- The API runs on Render's free plan, so the first request after idle can take ~50 seconds.
- Camera access requires HTTPS; production is served over TLS.
- CORS is restricted to the production app URL plus localhost.
- `frontend/vercel.json` rewrites client routes to `index.html`.
