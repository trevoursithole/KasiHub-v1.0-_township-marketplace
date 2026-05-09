# KasiHub — Deployment Guide

## Option 1: Render.com (easiest — already configured)

**Free tier:** 750hrs/month, HTTPS, auto-deploy from GitHub.  
**Note:** Free tier sleeps after 15min inactivity (fine for portfolio, upgrade for pilot).

### Steps

1. Push to GitHub:
```bash
git init
git add .
git commit -m "KasiHub v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kasihub.git
git push -u origin main
```

2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Render auto-reads `render.yaml` — no manual config needed
5. Add one secret env var: `JWT_SECRET` → any long random string
6. Click **Deploy**

Your app will be live at `https://kasihub.onrender.com`

---

## Option 2: Fly.io (best free tier — doesn't sleep)

**Free tier:** 3 VMs, 3GB storage, Johannesburg region, always on.

### Steps

```bash
# 1. Install Fly CLI
# Windows: winget install -e --id Flyio.flyctl
# Mac:     brew install flyctl
# Linux:   curl -L https://fly.io/install.sh | sh

# 2. Sign up / login
fly auth signup

# 3. From the kasihub/ folder
fly launch
# When prompted:
#   App name: kasihub (or any name)
#   Region: jnb (Johannesburg)
#   Postgres: No (we use SQLite)
#   Deploy now: Yes

# 4. Create persistent volume for the database
fly volumes create kasihub_data --size 1 --region jnb

# 5. Set your JWT secret
fly secrets set JWT_SECRET="$(openssl rand -hex 32)"

# 6. Deploy
fly deploy

# 7. View logs
fly logs

# 8. Open in browser
fly open
```

Your app will be live at `https://kasihub.fly.dev`

---

## Option 3: Koyeb (no sleep, no card required)

1. Go to [koyeb.com](https://koyeb.com) → **Create App**
2. Select **GitHub** → connect repo
3. Set build command: `cd backend && npm install && cd ../frontend && npm install && npm run build && cd ../backend && node src/db/seed.js`
4. Set run command: `cd backend && node src/server.js`
5. Add env vars: `NODE_ENV=production`, `PORT=8000`, `JWT_SECRET=your-secret`
6. Deploy

---

## Option 4: Docker (VPS / local server)

Works on any Linux VPS (Hetzner, DigitalOcean, Oracle Free Tier, etc.)

```bash
# Clone and deploy
git clone https://github.com/YOUR_USERNAME/kasihub.git
cd kasihub

# Set your JWT secret
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env

# Build and run
docker-compose up --build -d

# View logs
docker-compose logs -f

# App runs on http://YOUR_SERVER_IP:4000
```

---

## Post-deploy checklist

After any deployment:

- [ ] Visit `/health` — should return `{"status":"ok"}`
- [ ] Register a new account
- [ ] Browse listings (should see 12 seeded listings)
- [ ] Login with `0821234567` / `password123`
- [ ] Check notifications (should see 5)
- [ ] Post a test listing
- [ ] Update your `FRONTEND_URL` env var to your live domain

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Long random string — keep secret |
| `NODE_ENV` | ✅ Yes | Set to `production` |
| `PORT` | ✅ Yes | `4000` (Fly/Docker) or `10000` (Render) |
| `DB_PATH` | Optional | Path to SQLite file (default: `./kasihub.db`) |
| `FRONTEND_URL` | Optional | Your live domain (for CORS) |
