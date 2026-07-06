# StreamVault

A Netflix-style desktop web app for browsing, searching, and managing a personal catalog of TV shows and movies — with full offline support.

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable **Email/Password** authentication
   - (Optional) Enable **Google** sign-in provider
   - Copy your web app config

3. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Architecture

```
src/
├── api/imdbClient.js         # REST client for api.imdbapi.dev
├── cache/db.js               # IndexedDB via idb (shows, meta, userData stores)
├── stores/                   # Zustand stores (auth, catalog, network, userData)
├── search/searchIndex.js     # In-memory hashmap index for O(1)/O(k) search
├── hooks/useSync.js          # Incremental sync: API → IndexedDB → hashmap
├── hooks/useNetworkStatus.js # Real + simulated offline detection
├── components/               # Shared UI (Layout, ShowCard, VirtualGrid, etc.)
└── screens/                  # Route-level views (SignUp, Home, Search, Profile, ShowDetail)
```

**Data flow:** API → normalize → IndexedDB → hashmap index → UI reads from IndexedDB. The UI never reads directly from the network — IndexedDB is the single source of truth, making offline-first behavior seamless.

## Key Decisions

- **react-window v2 Grid** for virtualized catalog rendering — only visible DOM nodes exist regardless of catalog size
- **Custom hashmap search index** (prefix-bucket map) built incrementally during sync — no server-side search endpoint exists on the API
- **Zustand** for state management with selective subscriptions to avoid re-render storms
- **IndexedDB via idb** for structured storage of 10k+ records (localStorage is too small and sync-blocking)
- **Mock offline toggle** in dev mode simulates network drops every ~45s with 15% probability to exercise reconnect/resync logic
- **Framer Motion** for screen transitions, card hover effects, hero Ken Burns animation, and connection banner slide-in/out

## Known Limitations

- Google OAuth requires additional Firebase configuration; email/password works out of the box
- Mock offline toggles automatically in dev mode — disable by removing the interval in `useNetworkStatus.js`
- Delta sync on reconnect fetches up to 50 pages per sync cycle as a simplification
- The API returns 50 titles/page sorted by popularity; no server-side search or filtering
- Hero banner picks randomly from the top 10 highest-rated cached shows with posters

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Auth | Firebase Authentication |
| Persistence | IndexedDB (idb) |
| Virtualization | react-window v2 Grid |
| Animation | Framer Motion |
| State | Zustand |
| Search | Custom in-memory hashmap |
| API | api.imdbapi.dev |
