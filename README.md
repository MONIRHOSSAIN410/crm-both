# মূলধন · Muldhon — Investment Admin Platform

Full-stack rebuild of the attached designs.

- **Frontend** — React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios
- **Backend** — Node.js + Express (ESM, `"type": "module"`), Mongoose / MongoDB, JWT + bcrypt
- **Structure** — `routes/` → `controllers/` → `models/`, with `middleware/`, `config/`, `utils/`, `seed/`

```
muldhon/
├── vercel.json                 one deployment: static client + /api function
├── package.json                API dependencies + build script for Vercel
├── api/index.js                the serverless function (re-exports the Express app)
├── client/                     React + Tailwind + Framer Motion
│   ├── public/logo.svg         the Muldhon mark, also the favicon
│   └── src/
│       ├── api/axios.js        axios instance + JWT interceptor
│       ├── routes.js           lazy routes with preload(), for instant navigation
│       ├── components/         AuthShell, Sidebar, Topbar, DashboardLayout,
│       │                       PageSkeleton, ui/, people/, settings/
│       ├── context/            AuthContext (login / register / profile)
│       ├── data/demo.js        offline fallback data
│       ├── hooks/useFetch.js   fetch-with-fallback hook
│       └── pages/              Login, Register, Dashboard, Investors, Entrepreneurs,
│                               Payment, Messages, Notifications, Reports,
│                               ActivityLogs, Settings
└── server/
    └── src/
        ├── config/db.js
        ├── models/             User, Project, Payment, Activity, Notification, Message
        ├── controllers/        auth, user, project, payment, activity,
        │                       notification, message, dashboard
        ├── routes/             one router per resource, mounted in app.js
        ├── middleware/         protect / authorize (JWT, RBAC), error handler
        ├── utils/              token generator
        ├── seed/seed.js        demo data matching the designs
        ├── app.js
        └── server.js
```

## Run it

### 1. Backend

```bash
cd server
cp .env.example .env          # set MONGO_URI + JWT_SECRET
npm install
npm run seed                  # optional: fills MongoDB with demo data
npm run dev                   # http://localhost:5000
```

MongoDB must be reachable at `MONGO_URI` (local `mongod` or an Atlas connection string).

### 2. Frontend

```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

Leave `client/.env` empty. Vite proxies `/api` to `http://localhost:5000`, so
there is no CORS setup and no URL to keep in sync.

### Login

After seeding: **admin@muldhon.com / 123456**

## Deploy (Vercel)

The whole project deploys as **one Vercel project**: the built React app is
served as static files and the Express API runs as a serverless function on
`/api` of the same domain. Same origin means the browser calls a relative
`/api` path — there is no `VITE_API_URL` to keep in sync and no CORS preflight
to get wrong, which is what used to break login and register after a deploy.

The pieces that make this work, all at the repo root:

| File | Role |
| --- | --- |
| `vercel.json` | builds `client/`, serves `client/dist`, sends `/api/*` to the function and every other path to `index.html` so deep links work |
| `package.json` | the API's dependencies (Vercel installs these for the function) plus the build script |
| `api/index.js` | the function itself — re-exports the Express app from `server/src/app.js` |

### Setting it up

1. **Vercel → Add New → Project**, import the repository.
2. **Root Directory: leave it at the repository root.** Do not point it at
   `client/` or `server/` — the root `vercel.json` wires both halves together.
   Framework preset: *Other*. Leave Build and Output settings on default;
   `vercel.json` supplies them.
3. **Settings → Environment Variables** (Production *and* Preview):

   | Name | Value |
   | --- | --- |
   | `MONGO_URI` | the Atlas `mongodb+srv://...` string, ending in `/muldhon` |
   | `JWT_SECRET` | a long random string |

   `VITE_API_URL` is **not** set — leaving it unset is what makes the client
   call `/api` on its own domain. `CLIENT_URL` is not needed either, because
   the client and API share an origin.
4. **MongoDB Atlas → Network Access → Add IP Address → Allow access from
   anywhere (`0.0.0.0/0`)**. Vercel functions have no fixed IP, so without this
   every request times out and every login fails.
5. Deploy.

### Checking a deployment

| URL | What a healthy answer looks like |
| --- | --- |
| `/` | the login screen, not a 404 |
| `/dashboard` | the app (a 404 here means the SPA rewrite is missing) |
| `/api/health` | `{"success":true,"service":"Muldhon API",...}` |
| `/api/health/db` | `{"success":true,"connected":true,...}` |

`/api/health` only proves the server is awake. `/api/health/db` proves the
database is reachable and, when it is not, says exactly why — whether
`MONGO_URI` is missing, still points at localhost, or Atlas is refusing the
connection. Start there before anything else.

## API

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | investor / entrepreneur / admin |
| POST | `/api/auth/login` | returns JWT |
| GET/PUT | `/api/auth/me` | profile, settings |
| PUT | `/api/auth/password` | change password |
| GET | `/api/auth/verification/required` | the documents verification asks for |
| GET | `/api/auth/verification` | the signed-in user's uploaded documents |
| PUT | `/api/auth/verification` | upload / replace one document |
| DELETE | `/api/auth/verification/:key` | remove one document |
| POST | `/api/auth/verification/submit` | submit the set for review |
| GET | `/api/users?role=&status=&search=` | lists + pagination |
| GET | `/api/users/stats?role=` | stat cards + top investors |
| PATCH | `/api/users/:id/status` | approve / reject applications *(admin)* |
| GET/POST | `/api/projects` | list / create |
| GET | `/api/projects/stats` | counts by status + category |
| PATCH | `/api/projects/:id/status` | approve / reject / close *(admin)* |
| GET | `/api/payments` | master escrow ledger |
| GET | `/api/payments/summary` | escrow totals, project-wise, investor-wise |
| GET | `/api/payments/trend` | monthly chart series |
| PATCH | `/api/payments/:id/status` | release / refund *(admin)* |
| GET | `/api/activities` | filterable logs |
| GET | `/api/activities/stats` | log stat cards |
| GET | `/api/activities/export` | CSV download |
| POST | `/api/activities/:id/comments` | add a comment |
| GET | `/api/notifications` | list + unread count |
| PATCH | `/api/notifications/read-all` | mark all read |
| GET | `/api/messages/contacts?role=` | chat sidebar |
| GET/POST | `/api/messages/:userId` | thread / send |
| GET | `/api/dashboard` | admin overview |
| GET | `/api/dashboard/reports` | reports page |

All routes except `register` / `login` require `Authorization: Bearer <token>`;
`adminOnly` routes additionally require `role === 'admin'`.

## Verification documents

Settings → Verification takes three files: NID front, NID back, and a trade
licence or TIN certificate (JPG, PNG, WEBP or PDF, up to 8 MB). Images are
resized in the browser so the long edge is at most 1400px — large enough that
the numbers on an ID card stay readable, small enough that three documents fit
in one request — and stored as data URLs on the user document, the same way
profile photos are. Vercel's filesystem is read-only and wiped between
invocations, so files written to an `/uploads` folder would silently disappear.

The screen shows upload progress, a thumbnail of each file, replace and remove,
and only enables **Submit for review** once all three are in. Submitting sets
`verificationStatus` to `submitted`, locks the documents, and writes an entry to
the activity log. Replacing a document after a review resets the status.

The file bytes are deliberately stripped from the account that travels with
login and `/auth/me` — three scans is about a megabyte that nothing on those
screens needs — and fetched only by the Verification screen itself.

## Performance: pages open on click

Every page is a separate bundle, which keeps the first load small but means a
chunk is normally requested at the exact moment it is clicked. Two things fix
that, both in `client/src/routes.js`:

- every dashboard chunk is fetched once the browser goes idle after first paint,
  one at a time so it never competes with the visible page's data; and
- hovering, focusing or pressing a sidebar link warms that page's chunk
  immediately, which covers the first seconds and touch devices.

By the time a link is clicked the module is already in memory, so React mounts
it in the same frame. The Suspense boundary also sits inside `DashboardLayout`
rather than around the whole app, so the sidebar and topbar never blank out, and
the page transition no longer uses `AnimatePresence mode="wait"` — that held the
outgoing page on screen for the full length of its exit animation before
mounting the next one, roughly 300ms of nothing happening on every click.

## Design notes

- Palette is defined once in `tailwind.config.js` (`brand`, `deep`, `sun`, `blush`, `lav`, `canvas`, `line`)
  so the deep-green gradient, mint cards and yellow accents stay consistent everywhere.
- Framer Motion handles: auth card entrance, staggered stat cards and list rows, the sliding
  sidebar/tab indicators (`layoutId`), page transitions in `DashboardLayout`, animated chat
  bubbles, animated progress bars, and the mobile drawer.
- Every screen is responsive: cards collapse 4 → 2 → 1 column, tables scroll horizontally
  inside their own container, the sidebar becomes a drawer below `lg`, and the chat list
  and thread swap on small screens.

## Accounts, gender and login

Registration asks for **gender (male / female)** — a real radio group, so one
and only one can be selected, arrow keys move between them and the browser's own
validation applies — and a **real password** (minimum 6 characters). Both are stored on the user document, and `POST /api/auth/login`
returns that exact account — so signing in as a female account shows the female
profile, and a male account shows the male profile. When a user has not uploaded a
photo, `client/src/utils/avatar.js` draws a gender-matched placeholder as an inline
SVG, so no avatar is ever wrong or borrowed from another user.

Seeded test logins (`npm run seed` in `server/`), all with password `123456`:

| Email | Account |
| --- | --- |
| `admin@muldhon.com` | admin (male) |
| `male@muldhon.com` | investor, male |
| `female@muldhon.com` | investor, female |

## Troubleshooting

**A 404 on every page, including `/`.** The Vercel project's Root Directory is
not the repository root, or the root `vercel.json` is missing. This is what the
old `client/vercel.json` caused: it declared a Node build of a `server.js` that
does not exist in `client/`, so nothing was ever served.

**`/` works but `/dashboard` 404s on refresh.** The SPA rewrite is missing —
every path that is not a real file has to fall through to `index.html`.

**"Login failed" / "Registration failed".** Open `/api/health/db`:

1. `MONGO_URI is not set` — add it in Settings → Environment Variables and
   redeploy. Environment variables only apply to builds made after they were
   added.
2. `connected: false` with an Atlas timeout — Atlas → Network Access must allow
   `0.0.0.0/0`. A serverless function has no fixed IP to allow-list.
3. Authentication failure — the database user or password in `MONGO_URI` is
   wrong. A password containing `@ : / ? #` must be URL-encoded.
4. Locally, use `mongodb://127.0.0.1:27017/muldhon`, not `localhost`: on Windows
   `localhost` often resolves to IPv6 while MongoDB listens on IPv4 only, so the
   driver hangs until it times out.

The login and register screens show the real reason (server unreachable,
database timeout, wrong password, email already registered) rather than a
single generic line.
