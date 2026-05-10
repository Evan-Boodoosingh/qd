# Queued

**The social anime platform the community actually deserves.**

Queued is a full-stack social anime tracking platform built from the ground up over two weeks. It's the app I wanted to exist — somewhere between MyAnimeList, Letterboxd, and a Discord server where people actually talk about what they're watching. You can track shows, follow friends, discuss episodes, and discover what your nakama are loving right now.

🔗 **Live:** [qd-two.vercel.app](https://qd-two.vercel.app)
💼 **LinkedIn:** [linkedin.com/in/evan-boodoosingh](https://www.linkedin.com/in/evan-boodoosingh)
🐙 **GitHub:** [github.com/Evan-Boodoosingh](https://github.com/Evan-Boodoosingh)

---

## The Honest Story

I built this as my main portfolio piece while learning full-stack development. The first half was me genuinely figuring things out — how JWT auth flows, how to structure a Mongoose schema, how Express middleware actually works. The second half was pushing through to ship something real.

This isn't a tutorial clone. Every feature has a reason behind it, every technical decision was made deliberately, and every problem I ran into got solved. The sections below explain not just *what* I built, but *why* I made the choices I did.

---

## Features

### Anime Data & Discovery
- **Seasonal browser** — Browse currently airing shows pulled from the Jikan API (MyAnimeList's unofficial API)
- **Show detail pages** — Full info including synopsis, episode list, streaming links, related entries, opening/ending themes, studio, score, rank, and member count
- **Episode pages** — Individual episode details with synopsis fetched from a separate endpoint, with retry logic and in-memory caching to avoid redundant API calls
- **Search** — Search anime by title with live results as you type, debounced at 400ms
- **Trending grid** — Responsive grid of trending shows that scales from 2 columns on mobile to 6 on desktop

### Schedule & Airing
- **Weekly schedule grid** — Full 7-day grid of airing shows, desktop only
- **AiringToday component** — Mobile/tablet timeline of what's airing today with a toggle between All shows and My List
- **Timezone-aware scheduling** — AnimeSchedule API returns ISO 8601 dates. I made the deliberate decision to store the raw `isoDate` and do all timezone conversion on the client, not the server. This means each user sees correct local air times regardless of where they are, without the server needing to know their timezone

### Watchlist & Tracking
- **Status tracking** — Watching, Plan to Watch, Completed, Dropped
- **Episode progress** — Increment/decrement current episode with a cap at the show's total (or current airing count for ongoing shows)
- **Rating system** — 1–10 rating accessible directly from the Show page action bar, only visible when the show is on your list
- **Favorites** — Any show rated 8 or higher automatically appears in your Favorites tab on your profile, sorted by rating
- **Progress bars** — Visual episode completion bars on the MyList page

### Friends & Social Graph
- **Friend requests** — Send, receive, accept, and decline friend requests by username
- **Sent requests panel** — Toggle between received and sent pending requests in one panel, with badge count for incoming only (since those require action)
- **Friend suggestion algorithm** — Suggests friends of friends who aren't already your friends. Scores suggestions by mutual friend count first, then shared shows as a tiebreaker. Also filters out people you've already sent a request to at the database level, not just the frontend — so suggestions stay clean across page refreshes
- **Compatibility score** — When viewing someone's profile who isn't your friend yet, you see a 0–100% compatibility score. The algorithm weights shared shows at 70% and shared genres at 30%, normalized to your list size
- **Currently watching** — See what your friends are actively watching in a compact card. Shows you both watch are highlighted with an orange border
- **Friend activity feed** — A unified feed of threads your friends created, replied to, or liked — in that priority order

### Community & Threads
- **3-step thread creation** — Step 1: pick a show (with live search). Step 2: pick Episode or Show thread type with relevant fields. Step 3: write your post with a spoiler toggle. Each step validates before continuing
- **Spoiler system** — Three layers of spoiler protection:
  1. Thread author can mark their thread as a spoiler at creation
  2. Any logged-in user can flag a reply as a spoiler
  3. If a thread accumulates 5 or more spoiler reports from different users, it gets automatically blurred — no moderator needed
  4. Users can choose to reveal blurred content with a "Show spoiler" button, which only reveals it for that session
- **Thread sorting** — Sort replies by Top (most liked), New (most recent), or Old (chronological)
- **Like system** — Optimistic UI updates for both thread likes and reply likes — the count updates instantly and rolls back if the API call fails
- **Reply reporting** — Users can flag replies as spoilers or report them separately, with local state tracking so you can't double-report

### Profiles
- **Public profiles** — Watching tab, Favorites tab, and Discussions tab
- **Stats** — Shows watched, episodes watched, days watched, threads started, and friends — all in a single responsive row
- **Friend button** — Dynamically shows the correct state: Add Friend, Request Sent, or ✓ Friends, by actually fetching the friends list on load rather than guessing

### Auth & Navigation
- **JWT authentication** — Tokens stored in localStorage (persistent) or sessionStorage (session only) based on the "Keep me logged in" checkbox
- **Protected routes** — A `ProtectedRoute` wrapper component redirects unauthenticated users to login
- **Mobile navigation** — Hamburger menu at the `lg` breakpoint with a Framer Motion slide-in drawer from the right, filtered navigation links based on auth state

---

## Tech Stack

### Frontend
| Technology | Version | Why |
|---|---|---|
| React | 19 | Component model, hooks, ecosystem |
| TypeScript | 6 | Type safety, better dev experience |
| Vite | 8 | Fast dev server, fast builds |
| Tailwind CSS | 4 | Utility-first, consistent design system |
| Framer Motion | 12 | Animations for nav drawer and slide panels |
| React Router | 7 | Client-side routing |
| Lucide React | 1 | Icon library |

### Backend
| Technology | Version | Why |
|---|---|---|
| Node.js | 18+ | JavaScript on the server, large ecosystem |
| Express | 5 | Minimal, flexible HTTP framework |
| MongoDB | — | Flexible schema, good fit for social data |
| Mongoose | 9 | ODM for MongoDB, schema validation |
| JWT (jsonwebtoken) | 9 | Stateless auth, easy to implement |
| bcryptjs | 3 | Password hashing |
| cors | 2 | Cross-origin request handling |
| dotenv | 17 | Environment variable management |

### External APIs
| API | Purpose |
|---|---|
| **Jikan** (MAL unofficial) | Show data, episode lists, search, seasonal anime |
| **AniList** (GraphQL) | Supplementary show data, library carryover |
| **AnimeSchedule** | Real-time airing schedules with ISO date support |

### Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting, automatic GitHub deploys |
| **Railway** | Backend API hosting |
| **MongoDB Atlas** | Cloud database (M0 free tier) |

---

## Project Structure

```
qd/
├── public/
│   ├── queued.png           # Wordmark logo
│   └── qd.png               # Favicon
├── server/                  # Express backend
│   ├── middleware/
│   │   └── auth.js          # JWT verification — attaches req.user to protected routes
│   ├── models/
│   │   ├── User.js          # Schema: username, email, password (hashed), displayName,
│   │   │                    #   bio, friends[], friendRequests[{from, status}], createdAt
│   │   ├── Thread.js        # Schema: show, showId, threadType, episode, season,
│   │   │                    #   originalPost, replies[{content, likes, spoilerFlags}],
│   │   │                    #   likes[], hasSpoiler, spoilerReports
│   │   └── Watchlist.js     # Schema: user, showId, showName, image, status,
│   │                        #   currentEpisode, totalEpisodes, airingEpisode,
│   │                        #   rating, genres[]
│   ├── routes/
│   │   ├── anime.js         # Jikan + AniList proxy, caching layer, schedule fetching
│   │   ├── friends.js       # Social graph: requests, suggestions, compatibility
│   │   ├── threads.js       # Thread CRUD, replies, likes, flags, reports
│   │   ├── users.js         # Register, login, profile, watchlist stats
│   │   └── watchlist.js     # Watchlist CRUD, per-user and public reads
│   └── app.js               # Express entry: middleware, routes, MongoDB connection
├── src/
│   ├── components/
│   │   ├── AiringToday/     # Mobile timeline, My List / All toggle, timezone conversion
│   │   ├── Calendar/        # Desktop weekly grid, day tabs
│   │   ├── Discussions/     # Thread list with spoiler blur
│   │   ├── Hero/            # Featured show with blurred banner, trailer toggle
│   │   ├── Liked/           # Shows friends rated 7+, grouped and scored
│   │   ├── Nav/             # Responsive nav, mobile drawer, auth-aware links
│   │   ├── PopularDiscussions/ # Top threads component for homepage
│   │   ├── Toast/           # Global toast system with toastService singleton
│   │   └── Trending/        # Trending shows grid
│   ├── pages/
│   │   ├── Community.tsx    # Thread browser with sort (active/new/liked) and type filter
│   │   ├── EditProfile.tsx  # Profile editing with password change
│   │   ├── Episode.tsx      # Episode detail, synopsis with retry + cache, discussions
│   │   ├── Friends.tsx      # Friends dashboard: watching feed, thread activity, people
│   │   ├── Landing.tsx      # Logged-out homepage
│   │   ├── Login.tsx        # Login with persistent/session storage toggle
│   │   ├── MyList.tsx       # Watchlist with status tabs, progress bars, rating
│   │   ├── NewThread.tsx    # 3-step thread creation flow
│   │   ├── NotFound.tsx     # 404 page
│   │   ├── Profile.tsx      # Public profile: stats, watching, favorites, discussions
│   │   ├── Register.tsx     # Registration
│   │   ├── Schedule.tsx     # Full weekly schedule with My Schedule / Full Schedule tabs
│   │   ├── Search.tsx       # Anime and user search
│   │   ├── Show.tsx         # Show detail: hero, stats, episodes, discussions, related
│   │   └── Thread.tsx       # Thread view with replies, likes, spoiler reveal, sorting
│   ├── services/
│   │   ├── api.ts           # Single source of truth for API base URL (env var)
│   │   ├── anime.ts         # Anime fetch helpers, image proxy
│   │   └── watchlist.ts     # Watchlist CRUD wrappers
│   └── utils/
│       └── scheduleTime.ts  # getLocalDay(), getLocalTime(), getLocalMinutes()
│                            # Client-side timezone conversion from ISO dates
├── vercel.json              # React Router rewrite rules
├── index.html
└── package.json
```

---

## Technical Decisions Worth Explaining

### Timezone handling
AnimeSchedule returns air times as ISO 8601 dates in JST. Rather than converting on the server (which would require knowing each user's timezone), I store the raw `isoDate` and built a utility file — `scheduleTime.ts` — that handles all conversion on the client. Functions like `getLocalDay()` and `getLocalTime()` take a raw ISO string and return the correct local day and time for wherever the user is.

### Friend suggestion algorithm
The `GET /api/friends/suggested` route does the following:
1. Finds all friends of your friends who aren't already your friends
2. Filters out people you've already sent a pending request to — this query runs against the database, not just local state, so it persists across sessions
3. Scores each suggestion by mutual friend count (primary) and shared shows (tiebreaker)
4. Returns the top 10

This means the suggestions are genuinely relevant and stay clean without the user ever having to manually dismiss anyone.

### Spoiler system
There are three independent layers:
- **Author flag** — set at thread creation, immediately blurs content for all readers
- **Community flags** — any user can flag a reply as a spoiler; flags are stored on the reply document
- **Auto-blur threshold** — if `spoilerReports` on a thread reaches 5, it gets treated as a spoiler automatically, no moderator action required

Revealed spoilers are tracked in local React state per session — revealing a spoiler doesn't persist, which is intentional.

### Optimistic UI for likes
Clicking like on a thread or reply updates the count immediately in local state, then fires the API call. If the API call fails, the state rolls back. This makes the app feel fast without sacrificing correctness.

### Episode synopsis caching
Episode synopsis data is fetched from a separate endpoint that sometimes returns empty on first call (Jikan rate limits). I implemented:
- An in-memory cache keyed by `showId-episodeNumber`
- A retry loop with a 3 second delay, up to 2 retries
- Loading state tracked separately from the main page load

This means users don't see a broken page — they see "Loading synopsis..." which resolves when the data arrives.

### API centralization
Every fetch call in the frontend goes through `src/services/api.ts` which exports a single `API` constant driven by `import.meta.env.VITE_API_URL`. Switching between local development and production is a one-line environment variable change. No hardcoded URLs anywhere in the component tree.

### JWT storage strategy
Login has a "Keep me logged in" checkbox. Checked: token goes to `localStorage` (persists across sessions). Unchecked: token goes to `sessionStorage` (cleared when the tab closes). Every auth check reads from both, `localStorage` first.

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- npm
- MongoDB running locally, or a MongoDB Atlas account
- AnimeSchedule API token (free tier at animeschedule.net)

### 1. Clone the repo

```bash
git clone https://github.com/Evan-Boodoosingh/qd.git
cd qd
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/queued
JWT_SECRET=your_secret_key_here
ANIMESCHEDULE_TOKEN=your_animeschedule_token_here
```

```bash
npm run dev
```

Backend runs at `http://localhost:3001`.

### 3. Frontend setup

From the project root:

```bash
npm install
```

Create `.env` at the project root:

```env
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Express server port (default: 3001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens — make this long and random |
| `ANIMESCHEDULE_TOKEN` | AnimeSchedule API bearer token |

### Frontend (`.env` at project root)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL for the backend API |

---

## API Routes

### Auth & Users
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | No | Create account |
| POST | `/api/users/login` | No | Login, returns JWT |
| GET | `/api/users/me` | Yes | Get current user |
| PATCH | `/api/users/me` | Yes | Update profile |
| GET | `/api/users/profile/:username` | No | Public profile + stats |
| GET | `/api/users/search?q=` | No | Search users by username |

### Anime
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/anime/seasonal` | No | Currently airing shows |
| GET | `/api/anime/season` | No | This season's shows |
| GET | `/api/anime/show/:id` | No | Full show details |
| GET | `/api/anime/show/:id/episodes` | No | Episode list (paginated) |
| GET | `/api/anime/show/:id/episode/:ep` | No | Single episode detail |
| GET | `/api/anime/search?q=` | No | Search anime |
| GET | `/api/anime/schedule` | No | Weekly schedule |

### Watchlist
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/watchlist` | Yes | Your watchlist |
| POST | `/api/watchlist` | Yes | Add show to list |
| PATCH | `/api/watchlist/:showId` | Yes | Update status, episode, rating |
| GET | `/api/watchlist/user/:userId` | Yes | Another user's watchlist |

### Threads
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/threads` | No | All threads (filterable by showId) |
| POST | `/api/threads` | Yes | Create thread |
| GET | `/api/threads/:id` | No | Single thread with replies |
| PATCH | `/api/threads/:id/like` | Yes | Toggle thread like |
| POST | `/api/threads/:id/replies` | Yes | Post a reply |
| PATCH | `/api/threads/:id/replies/:replyId/like` | Yes | Toggle reply like |
| PATCH | `/api/threads/:id/replies/:replyId/flag` | Yes | Flag reply as spoiler |
| POST | `/api/threads/:id/replies/:replyId/report` | Yes | Report reply |

### Friends
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/friends` | Yes | Your friends list |
| POST | `/api/friends/request/:username` | Yes | Send friend request |
| GET | `/api/friends/requests` | Yes | Incoming pending requests |
| GET | `/api/friends/requests/sent` | Yes | Outgoing pending requests |
| PATCH | `/api/friends/request/:id/accept` | Yes | Accept request |
| PATCH | `/api/friends/request/:id/decline` | Yes | Decline request |
| DELETE | `/api/friends/:id` | Yes | Remove friend |
| GET | `/api/friends/suggested` | Yes | Friend suggestions |
| GET | `/api/friends/compatibility/:username` | Yes | Compatibility score |

---

## Deployment

### MongoDB Atlas
1. Create a free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Under **Database Access** — create a database user, save the password
3. Under **Network Access → IP Access List** — add `0.0.0.0/0` to allow all IPs (required for Railway)
4. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>`

### Railway (Backend API)
1. Sign up at [railway.app](https://railway.app) with GitHub
2. New Project → Deploy from GitHub repo
3. In service **Settings → Source** — set Root Directory to `server`
4. In **Variables** — add all four backend environment variables
5. In **Settings → Networking** — Generate Domain
6. Your Railway URL is your production API base

### Vercel (Frontend)
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import repo → Vercel auto-detects Vite
3. Add environment variable: `VITE_API_URL` = your Railway URL
4. Deploy

The `vercel.json` at the root handles React Router client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Every push to `main` triggers automatic redeployment on both Vercel and Railway.

---

## Roadmap

- [ ] Rate limiting and input sanitization
- [ ] JWT expiry and refresh tokens
- [ ] Scheduled episode sync for airing shows
- [ ] In-app notifications with badge
- [ ] Report entire threads
- [ ] User blocking
- [ ] Moderation queue
- [ ] MyList sort and filter
- [ ] Search filters (genre, year, score range)
- [ ] Activity feed frontend
- [ ] Rating prompt on show completion
- [ ] Google OAuth
- [ ] WebSocket support for real-time thread updates
- [ ] React Native mobile app

---

## What I Learned

**Jikan has real rate limits.** I hit them constantly early on and had to build caching for show data and retry logic for episode synopses. The episode synopsis endpoint in particular would return empty on first call, which pushed me to build a retry loop with delays and an in-memory cache.

**Timezones are genuinely hard.** Deciding where to do timezone conversion — client vs server — isn't obvious. I landed on client-side conversion and built a utility module for it. That decision affected the AnimeSchedule integration, the AiringToday component, and the weekly schedule grid.

**MongoDB aggregation is powerful and confusing.** The friends activity feed required cross-collection lookups to find threads where friends were the creator, a replier, or a liker. Using `$lookup`, `$unwind`, and filtering in stages was a real learning curve.

**Optimistic UI feels trivial until you implement it.** Getting likes to feel instant — update locally, call API, roll back on failure — is simple in concept but requires careful state management when you have both thread-level and reply-level likes on the same page.

**Deployment is its own discipline.** CORS, environment variables, MongoDB Atlas IP whitelisting, Railway root directory config, Vercel rewrite rules — none of this is in tutorials. Getting all three services talking correctly took longer than any single feature.

**Design systems pay off fast.** Having a consistent color palette and spacing scale from day one meant every new component looked right immediately without revisiting design decisions.

---

## Author

**Evan Boodoosingh**
[linkedin.com/in/evan-boodoosingh](https://www.linkedin.com/in/evan-boodoosingh) · [github.com/Evan-Boodoosingh](https://github.com/Evan-Boodoosingh)

Built in 2026. If you have questions about any of the decisions made here, feel free to reach out.

---

## License

MIT