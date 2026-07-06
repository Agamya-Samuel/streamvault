# Technical Specification: Short-Form Media Store-Front App

**Version:** 1.0
**Target platform:** Desktop web browser (Chrome/Edge/Firefox latest)
**Timeline:** 24-hour build

---

## 1. Overview

A Netflix-style desktop web app that lets a user sign up, browse ~10,000 TV shows/movies pulled from `imdbapi.dev`, search them with autocomplete, maintain a watchlist/history, and continue functioning (from cache) when the network drops — resyncing automatically when it returns.

---

## 2. Architecture

```
┌──────────────────────────────────────────────┐
│                 React App (Vite)             │
│                                              │
│  Screens: SignUp | Home | Search | Profile   │
│           (Framer Motion transitions)        │
│                                              │
│  State: Zustand stores                       │
│   - authStore      - networkStore            │
│   - catalogStore   - userDataStore           │
│                                              │
│  Data layer:                                 │
│   - apiClient  → imdbapi.dev REST calls      │
│   - cacheDB    → IndexedDB (via idb)         │
│   - searchIndex→ in-memory hashmap           │
│                                              │
│  Auth: Firebase Auth (email/pass, Google)    │
└───────────────┬──────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
  imdbapi.dev API    Firebase Auth
  (online only)      (online only, cached
                       session offline)
```

**Data flow:** API → normalize → write to IndexedDB → build/update hashmap index → render from IndexedDB (source of truth for UI), never directly from live fetch. This is what makes "offline with full API access" possible — the UI always reads from local cache; the network layer's only job is to keep that cache fresh.

---

## 3. Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast scaffold, concurrent rendering, hooks-based lifecycle control |
| Auth | Firebase Authentication | Managed, fast to integrate, handles session persistence |
| Local persistence | IndexedDB via `idb` | Handles 10k+ structured records; localStorage too small/sync-blocking |
| List virtualization | `react-window` (`FixedSizeGrid`) | Only renders visible DOM nodes — solves memory/perf for 10k items |
| Animation | Framer Motion | Declarative screen transitions + micro-interactions |
| State management | Zustand | Minimal boilerplate, selective subscriptions avoid re-render storms |
| Search | Custom in-memory hashmap/inverted index | O(1) id lookup, O(k) prefix lookup for autocomplete |
| Image loading | Native `loading="lazy"` + IntersectionObserver fallback | Defers offscreen image decode/network cost |

---

## 4. Data Model

```ts
interface Show {
  id: string;
  primaryTitle: string;
  originalTitle?: string;
  startYear: number | null;
  endYear: number | null;
  genres: string[];
  rating: number | null;
  posterUrl: string | null;
  type: 'tvSeries' | 'movie' | ...;
  cachedAt: number; // epoch ms, for staleness checks
}

interface UserData {
  uid: string;
  watchlist: string[];   // show IDs
  history: { showId: string; watchedAt: number }[];
}
```

**IndexedDB stores:**
- `shows` (keyPath: `id`, indexes on `startYear`, `primaryTitle`)
- `meta` (sync cursor/page token, `lastSyncedAt`)
- `userData` (keyPath: `uid`)

---

## 5. API Integration Layer

- Wrapper module `api/imdbClient.js` exposes `fetchShowsPage(cursor)`, `fetchShowById(id)`.
- Pagination: fetch in batches (e.g., 100/request) and stream writes into IndexedDB incrementally rather than holding 10,000 objects in memory at once.
- Each successful page write triggers an incremental hashmap index update (not a full rebuild) to keep this cheap.
- On 4xx/5xx or network failure: fall back silently to IndexedDB contents already cached, and flag `networkStore.status = 'degraded'`.

---

## 6. Search: Hashmap Design

Three parallel maps built once at startup (and incrementally updated on sync):

```ts
idIndex: Map<string, Show>                     // exact id lookup, O(1)
titleTokenIndex: Map<string, Set<string>>      // token -> set of show IDs, for autocomplete
yearIndex: Map<number, Set<string>>            // year -> set of show IDs
```

**Autocomplete algorithm:**
1. Lowercase + tokenize query.
2. For prefix match: maintain a simple trie *or* bucket titles by first 1–3 characters (`titleTokenIndex` keyed by prefix substrings up to length 3) to bound scan size — trie is more correct but a prefix-bucket map is faster to implement in 24h.
3. Merge candidate ID sets, rank by string similarity/startsWith priority, cap results (e.g., top 20), debounce input at ~150ms.

**Search modes:** `id` → `idIndex.get()`; `name` → token/prefix index; `year` → `yearIndex.get()`. UI can auto-detect (numeric input = try year first, else id if it matches ID format, else name).

---

## 7. Screens & Component Breakdown

### 7.1 Sign-Up / Login
- Firebase email/password create + sign-in; optional Google provider.
- Form validation client-side; errors surfaced inline.
- On success → Zustand `authStore` populated, persisted session via Firebase's own persistence, route to Home.

### 7.2 Home
- **Today's Top Show:** hero banner — pick from a designated "featured" subset (or highest-rated cached item) with autoplay-style motion (Ken Burns pan or fade).
- **Full catalog grid:** `react-window` `FixedSizeGrid`, each cell = memoized `ShowCard`. Data source = IndexedDB read (paginated cursor), not full array in memory beyond what's rendered + a small buffer.

### 7.3 Search
- Debounced input → hashmap query → dropdown of matches → click navigates to a detail view/modal.

### 7.4 Profile
- Watchlist (add/remove toggle on each `ShowCard`), Watch History (append-only, timestamped), Sign-out button clearing Firebase session + optionally clearing sensitive local cache.

---

## 8. Performance / Memory-Leak Prevention

1. **Virtualization** — `react-window` renders only visible rows/columns; DOM node count stays constant regardless of catalog size.
2. **Memoization** — `ShowCard` wrapped in `React.memo`; equality check on `id` + `inWatchlist` flag only.
3. **Stable references** — `useCallback` for handlers passed to list items; `useMemo` for derived/sorted arrays so children don't see new prop identities each render.
4. **Effect cleanup** — every `useEffect` that subscribes (network listeners, IndexedDB cursors, Firebase auth state listener, any interval used to simulate connectivity flips) returns a cleanup function that unsubscribes/clears on unmount.
5. **Selective Zustand subscriptions** — components subscribe to slices (`useStore(s => s.watchlist)`), not the whole store, to avoid unrelated re-renders.
6. **Image lifecycle** — lazy-loaded images use `loading="lazy"`; large offscreen images are not retained once scrolled far past (rely on browser's own image decode lifecycle + virtualization unmounting cells).

---

## 9. Offline / Online Handling

- `networkStore` tracks `{status: 'online' | 'offline', lastSyncedAt}`.
- Real detection: `navigator.onLine` + `online`/`offline` window events.
- Simulated random flips (per assessment requirement): a dev-only interval toggles a **separate mock flag** that the UI treats identically to a real disconnect, so the reconnect-resync logic is exercised without needing to physically disable networking.
- **UI indicator:** persistent banner/pill (e.g., top-right) — "Online", or "Offline — showing cached content" with a subtle color/animation change.
- **On reconnect:** trigger a delta sync — refetch from last known cursor/page, merge new/changed records into IndexedDB, incrementally patch the hashmap index, without discarding local-only user data (watchlist/history).

---

## 10. Animations

- Framer Motion `AnimatePresence` wraps the router outlet for screen-level transitions (slide/fade between Sign-up → Home → Search/Profile).
- Card hover: scale + shadow transition.
- Skeleton shimmer placeholders while a grid cell's image is still loading.
- Connection banner: slide-in/out on status change.

---

## 11. Build Order (Execution Plan)

1. Scaffold Vite + React, install deps (firebase, idb, react-window, framer-motion, zustand).
2. Firebase project + Auth screens.
3. API client + IndexedDB cache + incremental sync.
4. Hashmap search index + Search screen.
5. Home screen with virtualized grid + hero.
6. Profile screen (watchlist/history/sign-out).
7. Network status store + simulated offline/online + reconnect resync.
8. Animations/transitions pass.
9. Perf pass (memoization, cleanup audit).
10. README + deploy + final QA on a clean browser profile.

---

## 12. Risks / Cut-Scope Fallbacks

| Risk | Fallback |
|---|---|
| `imdbapi.dev` rate-limits/lacks a true "top shows" endpoint | Curate a static featured-ID list for the hero |
| Trie-based autocomplete too slow to build in time | Prefix-bucket map (simpler, O(k) acceptable) |
| Google OAuth setup friction | Ship email/password only |
| Full delta-sync complexity | On reconnect, do a full re-fetch of first N pages instead of true delta, clearly documented as a simplification |

---

## 13. Deliverables

- Live deployed link (Vercel/Netlify)
- GitHub repo with this spec as `TECHNICAL_SPEC.md`
- README covering setup, architecture decisions, and known limitations