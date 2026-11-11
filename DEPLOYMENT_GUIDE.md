# ReTech Production Deployment & Operations Guide

Welcome to the **ReTech** (Smart E-Waste Collection, Data Sanitization & Circular Economy Platform) production deployment manual.

---

## 🚀 1. Quick Start: Single-Command Docker Deployment

You can deploy the entire production stack (Frontend + Backend + MongoDB) on any Linux/Windows VPS in seconds:

```bash
# Clone the repository onto your server
git clone <your-repo-url> retech
cd retech

# Launch all production containers
docker compose up -d --build
```

### Verified Port Mappings:
* **Frontend Web Application:** `http://your-server-ip:80` (or `http://localhost:5173`)
* **Backend API & Health:** `http://your-server-ip:5000/api/v1/health`
* **MongoDB Database:** `27017` (isolated in private docker network)

---

## ☁️ 2. Cloud Platform Deployment (PaaS)

If deploying to cloud platforms like **Render**, **Railway**, or **Vercel**:

### A. Deploy Backend (Render / Railway)
1. **Root Directory:** `backend`
2. **Build Command:** `pnpm install && pnpm run build`
3. **Start Command:** `node dist/server.js`
4. **Environment Variables:**
   * `NODE_ENV`: `production`
   * `PORT`: `5000` (or leave default assigned by platform)
   * `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/retech?retryWrites=true&w=majority`
   * `JWT_SECRET`: `<generate-a-strong-64-char-random-string>`
   * `JWT_EXPIRES_IN`: `7d`
   * `CORS_ORIGIN`: `https://your-frontend-domain.com`

### B. Deploy Frontend (Vercel / Netlify / Cloudflare Pages)
1. **Root Directory:** `frontend`
2. **Framework Preset:** `Vite`
3. **Build Command:** `pnpm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**
   * `VITE_API_URL`: `https://your-backend-domain.com/api/v1`

---

## 🔒 3. Domain, HTTPS & SSL Hardening

Production deployments must enforce **HTTPS** so that cryptographic signatures, JWT bearer tokens, and agent heartbeats cannot be intercepted.

### Recommended Nginx / Cloudflare Setup:
1. Point your domain (e.g. `retech.in` and `api.retech.in`) to your server IP.
2. Enable Cloudflare Proxy (Orange Cloud) for automatic free SSL/TLS, DDoS mitigation, and HTTP/2 acceleration.
3. In `backend/.env`, set:
   ```env
   CORS_ORIGIN=https://retech.in,https://www.retech.in
   ```

---

## 📦 4. Packaging the Python Sanitization Agent for Technicians

To allow remote recycling partners or warehouse technicians to run the sanitization agent without installing Python:

### Step 1: Install PyInstaller
```bash
pip install pyinstaller
```

### Step 2: Build Standalone Executable
In `sanitization-agent/`:
```bash
pyinstaller --onefile --clean --name "retech-agent" run_agent.py
```

### Step 3: Distribution
* The output executable will be placed in `sanitization-agent/dist/retech-agent.exe`.
* Remote technicians can simply double-click `retech-agent.exe` or run:
  ```bash
  retech-agent.exe --sync
  ```

---

## 🔑 5. Standard Admin & Customer Demo Credentials

Upon initial database boot, the system automatically seeds default demo accounts:

### Administrator Account (Full Operations Center):
* **Email:** `admin@retech.in`
* **Password:** `Admin@2026!`
* **Capabilities:** Device inventory management, agent pairing, NIST SP 800-88 sanitization dispatch, cryptographic certificates ledger, resale pricing.

### Customer Account (Circular E-Waste Portal):
* **Email:** `customer@retech.in`
* **Password:** `Customer@2026!`
* **Capabilities:** Doorstep e-waste pickup booking, live tracking, data wipe certificates download, environmental CO₂ credits tracker.

---

## 🛡️ 6. Security & Compliance Checklist

* [x] **NIST SP 800-88 Rev. 1 Clear/Purge** algorithmic compliance.
* [x] **Shannon Entropy Analysis** ($0.0000$ bits/byte mathematical proof).
* [x] **SHA-256 Cryptographic Evidence** attached to tamper-evident certificates.
* [x] **Public Verification Endpoint** (`/verify-certificate/:certificateId`).
* [x] **Hardcoded Host Boot Drive Lock** (`PhysicalDrive0` blocked from erasure).
* [x] **Strict API Rate Limiting** on authentication endpoints to prevent brute-force attacks.
* [x] **Zero-Knowledge Customer Portal** maintaining confidentiality.

