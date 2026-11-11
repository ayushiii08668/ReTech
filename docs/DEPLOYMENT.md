# ReTech Production Deployment Guide

## 1. Production Architecture Overview

The recommended production deployment topology separates concerns across managed cloud providers:

| Component | Technology | Recommended Host | Production URL Pattern |
|---|---|---|---|
| **Frontend** | React 19 + Vite SPA | Vercel / Cloudflare Pages | `https://retech-platform.vercel.app` |
| **Backend API** | Node.js + Express (TS) | Render / Railway / AWS App Runner | `https://api.retech.in` |
| **Database** | MongoDB 6.0+ | MongoDB Atlas | `mongodb+srv://cluster.mongodb.net/retech` |
| **Media Storage** | Cloudinary / Private S3 | Cloudinary | `res.cloudinary.com/retech/...` |
| **Local Agent** | Python 3.12+ FastAPI | Local Workshop Workstation | `http://127.0.0.1:8765` (Outbound only) |

---

## 2. Frontend Deployment (Vercel)

### Step 1: Import Project
1. In Vercel, click **Add New** $\rightarrow$ **Project**.
2. Select the repository and set the **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.

### Step 2: Configure Environment Variables
Add the following in Vercel Project Settings:
```env
VITE_API_URL=https://api.retech.in/api
VITE_API_BASE_URL=https://api.retech.in/api
```

### Step 3: SPA Route Rewrites
The project includes `frontend/vercel.json` and `frontend/public/_redirects`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This guarantees deep links like `/dashboard/devices` and `/verify-certificate/:id` do not 404 on hard reload.

---

## 3. Backend Deployment (Render / Railway)

### Step 1: Create Web Service
1. In Render, select **New Web Service**.
2. Set Root Directory to `backend`.
3. Environment: **Node**.
4. Build Command:
   ```bash
   pnpm install && pnpm build
   ```
5. Start Command:
   ```bash
   node dist/server.js
   ```

### Step 2: Configure Production Environment Variables
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/retech?retryWrites=true&w=majority
JWT_SECRET=super-secure-production-random-jwt-secret-string-at-least-64-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://retech-platform.vercel.app
ADMIN_EMAIL=admin@retech.in
ADMIN_PASSWORD=SetAStrongProductionAdminPassword2026!
```

### Step 3: Health Probe
Set Render's health check path to `/health` (HTTP 200).

---

## 4. MongoDB Atlas Database Setup

1. Create a dedicated M0 / M10+ cluster on MongoDB Atlas.
2. In **Database Access**, create an application user with readWrite privileges on database `retech`.
3. In **Network Access**, add IP whitelist entries (either Render's outbound static IPs or `0.0.0.0/0` with strong password protection).
4. Automated index creation is enabled in Mongoose schemas. Initial connection will automatically build compound performance indexes.

---

## 5. Local Sanitization Agent Deployment

> **Important Architecture Note**: The local sanitization agent is designed to execute direct hardware discovery and low-level drive wiping. It **cannot** run as a cloud web service because a browser or cloud container cannot access physical customer storage drives. It must be installed on a technician's local workshop PC.

See [`docs/SANITIZATION_AGENT_SETUP.md`](./SANITIZATION_AGENT_SETUP.md) for complete local setup and pairing instructions.

