# মূলধন · Muldhon — Investment Admin Platform

Full-stack rebuild of the attached designs.

- **Frontend** — React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios
- **Backend** — Node.js + Express (ESM, `"type": "module"`), Mongoose / MongoDB, JWT + bcrypt
- **Structure** — `routes/` → `controllers/` → `models/`, with `middleware/`, `config/`, `utils/`, `seed/`

```
muldhon/
├── client/                     React + Tailwind + Framer Motion
│   └── src/
│       ├── api/axios.js        axios instance + JWT interceptor
│       ├── components/         AuthShell, Sidebar, Topbar, DashboardLayout, ui/, people/
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

Vite proxies `/api` → `http://localhost:5000`, so no CORS setup is needed in development.

### Login

After seeding: **admin@muldhon.com / 123456**

If the API is unreachable the client falls back to bundled demo data and a local demo
session (any email + a 4-character password), so every screen still renders.

## API

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | investor / entrepreneur / admin |
| POST | `/api/auth/login` | returns JWT |
| GET/PUT | `/api/auth/me` | profile, settings |
| PUT | `/api/auth/password` | change password |
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

Registration asks for **gender (male / female)** and a **real password** (minimum 6
characters). Both are stored on the user document, and `POST /api/auth/login`
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

## Troubleshooting: "Login failed" / "Registration failed"

Those two messages mean the request never came back with a readable answer from the
API. Work through this list:

1. **Is `client/.env` pointing at the right API?** For local development
   `VITE_API_URL` must be **empty** so Vite proxies `/api` to `http://localhost:5000`.
   Pointing it at a deployed backend while running locally sends every login to that
   remote server instead. Restart `npm run dev` after editing `.env` — Vite only reads
   it at startup.
2. **Is the API running?** `cd server && npm run dev` should print
   `✔ Muldhon API running`. Open <http://localhost:5000/api/health> — it must return JSON.
3. **Is MongoDB running and reachable?** Use `mongodb://127.0.0.1:27017/muldhon`, not
   `localhost`: on Windows `localhost` often resolves to IPv6 while MongoDB listens on
   IPv4 only, so the driver hangs until it times out. A hanging database is what turns
   a login into a timeout with no JSON message behind it.
4. **Deploying to Vercel?** A serverless function cannot reach `127.0.0.1`, so
   `MONGO_URI` there must be a MongoDB **Atlas** connection string, and Atlas →
   Network Access must allow `0.0.0.0/0` (Vercel has no fixed IP). Set `MONGO_URI`,
   `JWT_SECRET` and `CLIENT_URL` in the Vercel project's Environment Variables, and
   set `VITE_API_URL` on the frontend project to the backend URL ending in `/api`.
5. **CORS**: `CLIENT_URL` must have **no trailing slash**, and may list several
   origins separated by commas.

### `GET /api/health/db` — the fastest way to find the problem

Open `<your-api>/api/health/db` in a browser. It reports whether `MONGO_URI` is
set, whether it is an Atlas (`mongodb+srv://`) or plain URI, the host it points at
(never the password), whether the connection succeeded, and a specific hint when it
did not. `/api/health` only proves the server is awake; this one proves the database
is reachable.

The login and register screens now show the real reason (server unreachable, database
timeout, wrong password, email already registered) instead of a single generic line.
