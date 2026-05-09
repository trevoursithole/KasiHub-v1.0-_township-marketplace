# 🏪 KasiHub — Township Marketplace

> A full-stack deployable marketplace platform built for South African townships.  
> Buy, sell and deliver safely with Voucher Escrow, Runner Network, and Safe-Trade Zones.

---

## 🚀 Quick Start

### Step 1 — Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Seed the database

```bash
cd backend
node src/db/seed.js
```

You should see:
```
🌱  Seeding KasiHub database…
✅  Seeded:
    9 users  ·  12 listings  ·  5 safe zones  ·  4 runners
    1 demo transaction  ·  5 notifications
```

### Step 3 — Build the frontend

```bash
cd frontend
npm run build
```

### Step 4 — Start the server

```bash
cd backend
node src/server.js
```

Open **http://localhost:4000** — the API and React app are both served from there.

---

## 🔑 Demo accounts

All accounts use password: **`password123`**

| Name | Phone | Role |
|---|---|---|
| Thandeka Mokoena | `0821234567` | Buyer / Top Seller |
| Mama Dlamini | `0829876543` | Food Vendor |
| Sipho Mokoena | `0831112233` | Electronics Seller |
| Zakhele Mokoena | `0855556677` | Runner (bicycle) |
| Lerato Sithole | `0866667788` | Runner (on foot) |

---

## 🏗️ Project structure

```
kasihub/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js      SQLite via sql.js (no native build needed)
│   │   │   └── seed.js          Realistic SA township demo data
│   │   ├── middleware/
│   │   │   └── auth.js          JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js          Register / Login / Profile
│   │   │   ├── listings.js      Full listings CRUD + filters
│   │   │   └── api.js           Runners, Zones, Transactions,
│   │   │                        Notifications, Reviews, Stats
│   │   └── server.js            Express app + SPA serving
│   ├── .env                     Environment variables
│   └── package.json
├── frontend/
│   └── src/
│       ├── api/index.js         Axios client for all endpoints
│       ├── context/             Auth + Toast providers
│       ├── components/UI.jsx    Shared UI components
│       └── pages/               Home, ListingDetail, Sell,
│                                Runners, Zones, Profile,
│                                Notifications, Transactions,
│                                Login, Register
├── Dockerfile
├── docker-compose.yml
├── railway.toml                 Railway.app one-click deploy
├── render.yaml                  Render.com free tier deploy
└── test_api.py                  Full API test suite (Python)
```

---

## 🌐 API endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login → JWT token |
| GET  | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/me` | ✅ | Update profile |

### Listings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/api/listings` | — | List with filters: `?section=Block L&category=Food&flash=1&search=kota` |
| GET  | `/api/listings/:id` | — | Single listing |
| POST | `/api/listings` | ✅ | Create listing |
| PATCH | `/api/listings/:id` | ✅ | Update (owner only) |
| DELETE | `/api/listings/:id` | ✅ | Soft delete (owner only) |

### Other
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/api/runners` | — | Online runners (`?section=`) |
| GET  | `/api/zones` | — | Safe-Trade Zones |
| GET  | `/api/stats/platform` | — | Live platform stats |
| GET  | `/api/transactions` | ✅ | My transactions |
| POST | `/api/transactions` | ✅ | Create (lock escrow) |
| POST | `/api/transactions/:id/complete` | ✅ | Confirm delivery (QR scan) |
| GET  | `/api/notifications` | ✅ | My notifications |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| POST | `/api/reviews` | ✅ | Post a review |
| GET  | `/health` | — | Health check |

---

## 🛠️ Development mode (hot reload)

Run the API and frontend separately for live reloading:

```bash
# Terminal 1 — Backend (auto-restarts on file change if you have nodemon)
cd backend
node src/server.js

# Terminal 2 — Frontend dev server with hot reload
cd frontend
npm run dev
# → http://localhost:5173 (proxies /api to :4000)
```

---

## 🐳 Docker

```bash
docker-compose up --build
# → http://localhost:4000
```

Database and uploads are persisted in named Docker volumes.

---

## ☁️ Deploy to Railway (recommended — free)

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Railway reads `railway.toml` automatically
4. Add one env var: `JWT_SECRET=<any long random string>`
5. Done — live in ~2 minutes

## ☁️ Deploy to Render (free tier)

1. Push to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect repo
3. Render reads `render.yaml` automatically
4. Add env var: `JWT_SECRET=<any long random string>`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛡️ **Verified Residents** | Community-vouched identity badges via local "anchors" |
| 🔒 **Voucher Escrow** | Payment locked until buyer scans QR on delivery |
| 🚴 **Runner Network** | Local youth runners with live status and ratings |
| 📍 **Safe-Trade Zones** | Vetted high-traffic meet-up points (garages, malls, police stations) |
| ⚡ **Flash Sales** | Time-limited listings with countdown timers |
| 🏪 **Spaza Integration** | B2C portal for local shops |
| 🧾 **Digital Receipts** | Auto-generated invoices for every transaction |
| 🗺️ **Section-Based Search** | Filter by local Block/Section identifiers |

---

## 📄 License

MIT — Built with ❤️ for the Kasi.
