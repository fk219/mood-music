# Moodify web

The React 19 + Vite front end for Moodify's listening room, manual check-in, library queue, mood journal, and owner Studio.

The sign-in page includes **Enter the demo room**, which opens the shared listener session in one click without exposing the demo password. See the [root README](../README.md) for the one-click flow, positioning, environment variables, and API documentation.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Set `VITE_API_URL` in `.env.local` to point the app at a local API. It defaults to the deployed Render API.
