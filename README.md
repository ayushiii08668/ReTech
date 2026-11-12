# ReTech — Smart E-Waste Collection, Data Sanitization & Circular Economy Platform

ReTech is a production-grade full-stack platform managing the complete circular lifecycle of discarded consumer and enterprise electronics: doorstep collection, multi-point diagnostic inspection, NIST SP 800-88 compliant software-based data sanitization, cryptographic certificate generation with real PDFKit downloads and QR verification, refurbishment workshop management, refurbished resale marketplace, authorized e-waste recycling manifests, and unified chain-of-custody audit timelines.

---

## 🌍 Problem Statement & Mission

Every year, over 50 million metric tons of electronic waste are discarded globally. Less than 20% is documented as formally recycled. A primary barrier preventing consumers and enterprises from responsibly recycling laptops, desktops, and mobile devices is **data security paranoia** — the fear that residual private data, banking tokens, and enterprise documents remain on discarded storage media.

**ReTech bridges this trust deficit**:
1. Provides certified, cryptographically verifiable data destruction compliant with **NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization**.
2. Issues tamper-evident PDF certificates featuring physical QR verification codes linked directly to public verification endpoints.
3. Extends hardware lifespan through Grade A/B refurbishment workshops and certified resale.
4. Channelizes end-of-life toxic e-waste directly to state-authorized CPCB / R2v3 recyclers with mandatory destruction certificates.

---

## 📚 Technical Documentation Index

Detailed architectural and operational documentation is available in the [`docs/`](./docs) directory:
- [**System Architecture Specification**](./docs/ARCHITECTURE.md) — Tiered architecture, security boundaries, and data flow.
- [**REST API Reference**](./docs/API_DOCUMENTATION.md) — Complete endpoint catalog, request/response models, and auth scopes.
- [**Testing & QA Guide**](./docs/TESTING.md) — Detailed instructions for running all 100 automated test assertions.
- [**Production Deployment Guide**](./docs/DEPLOYMENT.md) — Production configurations for Vercel, Render, and MongoDB Atlas.
- [**Local Sanitization Agent Operator Guide**](./docs/SANITIZATION_AGENT_SETUP.md) — Local Python agent installation, pairing, and OS safeguards.
- [**Operator & Customer User Guide**](./docs/USER_GUIDE.md) — Step-by-step walkthrough of customer and administrator workflows.

---

## 🎨 Visual Identity & Design System

ReTech strictly adheres to a **Warm Editorial + Industrial Luxury** aesthetic:
- **Main Background**: Warm Ivory (`#F5F0E7`)
- **Secondary Background**: Warm Cream / Sand (`#EAE1D5`)
- **Surface**: Crisp Warm Editorial Off-White (`#FFFDF8`)
- **Primary Accent**: Earthy Terracotta (`#C66D4E` / hover `#B05D40`)
- **Secondary Accent**: Burnished Copper (`#B78B68`)
- **Main Typography & Contrast**: Deep Charcoal-Brown (`#47372E`)
- **Secondary Text**: Muted Warm Charcoal (`#75665D`)
- **Borders & Dividers**: Natural Taupe (`#DDD1C3`)
- **Typography**: Manrope (Headings, bold numbers, IDs) + DM Sans (Body, metadata)
- **Design Philosophy**: Zero gratuitous emojis, generous editorial whitespace, fine hairline borders, subtle warm shadows, and smooth Framer Motion transitions.

---

## 👥 Exactly Two Application User Roles

1. **CUSTOMER**:
   - Register, login, manage profile & default collection address.
   - Submit electronics through a 5-step collection intake workflow with automated sequential IDs (`RET-2026-XXXX`, `REQ-2026-XXXX`).
   - Track live 8-stage chain-of-custody timeline.
   - Cancel eligible pending requests; receive real-time notifications.
   - View unified **Device Reports & Certificates** (`/dashboard/reports`) with real PDF certificate download.
   - Browse the **Refurbished Device Store** (`/dashboard/marketplace`) and submit genuine purchase enquiries (`/marketplace/enquiries`).

2. **ADMIN**:
   - Access internal operations console via `/admin/login` (no public registration).
   - View platform analytics & distribution charts (Recharts).
   - Manage all customers and logistics orders.
   - Inspect devices and assign ReTech Circular Classifications:
     - **Grade A – Reusable** (Eligible for Refurbished Resale)
     - **Grade B – Requires Refurbishment** (Assignable to Refurbishment Workshop)
     - **Grade C – Suitable for Certified Recycling**
     - **Grade D – Special Handling & Hazardous Dismantling**
   - **Sanitization Ops Console**: Pair local Python FastAPI agents, dispatch NIST SP 800-88 jobs, and cryptographically verify sector-level wipes.
   - **Sanitization Certificates Ledger**: Generate official certificates (only for `VERIFIED_SUCCESSFUL` jobs), download signed PDF with embedded QR code, or revoke with mandatory justification.
   - **Resale Marketplace Management**: Enforce strict device eligibility, publish listings, manage customer purchase enquiries, and mark listings as `SOLD`.
   - **Refurbishment Partner Operations**: Register external repair facilities, assign workshop jobs, record component replacements and costs, and transition completed devices to `READY_FOR_RESALE`.
   - **Authorised Recycler & Transfer Management**: Register licensed e-waste yards (CPCB / R2v3 / ISO 14001), dispatch transfer manifests (`RecyclingRecord`), and record certified destruction evidence to transition devices to `RECYCLED`.

> **Important Boundary Rule**: External partners (Refurbishers, Recyclers, Technicians, Logistics) exist strictly as database records (`Partner`), **never** as login application roles.

---

## 🔑 Provisioned Test Credentials

| Role | Email | Password | Portal |
|---|---|---|---|
| **Admin** | `admin@retech.in` | `Admin@ReTech2026!` | `/admin/login` |
| **Customer** | Register in UI or demo prefill | *Any compliant password* | `/login` |

*(Note: Both customer and admin login screens include one-click "Prefill demo credentials" buttons for instant evaluation).*

---

## 🛡️ Public Certificate Verification

ReTech certificates include a non-guessable cryptographic UUID verification link embedded in the physical PDF QR code:
- **Public URL**: `http://localhost:5173/verify-certificate/:verificationId`
- **Zero Authentication Required**: Accessible to auditors, buyers, and compliance inspectors.
- **Verification Guarantee**: Displays sanitized device specs, applied NIST SP 800-88 standard, SHA-256 evidence fingerprint, sector zero entropy score, and immediate `REVOKED` banner if invalidated.

---

## 🧪 Comprehensive Automated Test Suites

Both Phase 3 and Phase 4 include full-stack automated integration test runners verifying the real MongoDB database and Express HTTP APIs:

### Run Phase 4 Test Suite (40/40 Passing):
```bash
cd backend
npx tsx test_phase4_runner.ts
```
Covers:
1. Authentication & strict role boundaries (Customer blocked with 403 on all Admin endpoints).
2. Sanitization certificate pre-requisite enforcement (Blocked with 400 for unverified devices).
3. Official Certificate Generation (NIST SP 800-88 Rev 1, UUID `verificationId`, SHA-256 fingerprint).
4. Physical PDF generation (PDFKit stream with valid `%PDF-` header).
5. Public audit verification without authentication.
6. Certificate revocation with mandatory justification.
7. Refurbished Marketplace eligibility enforcement (Residual customer data prevention).
8. Customer purchase enquiry flow & Admin mark listing as SOLD.
9. Refurbishment partner registration, workshop job assignment, and completion lifecycle.
10. Authorised Recycler registration, transfer manifest, and mandatory destruction evidence enforcement.
11. Unified Device Lifecycle chronological audit timeline.
12. Customer chain-of-custody report aggregation.

### Run Phase 3 Test Suite (28/28 Passing):
```bash
cd backend
npx tsx test_phase3_runner.ts
```

---

## 📁 Repository Structure

```
retech/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                       # Typed & validated environment variables
│   │   │   ├── db.ts                        # Mongoose connection
│   │   │   └── seedAdmin.ts                 # Initial administrator provisioner
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts           # Customer/Admin auth & profile
│   │   │   ├── customer.controller.ts       # Customer dashboard, intake, pickups, notifications, reports
│   │   │   ├── admin.controller.ts          # Admin overview, customer directory, pickup logistics, inspection
│   │   │   ├── sanitization.controller.ts   # Agent pairing, job dispatch, verification
│   │   │   ├── certificate.controller.ts    # Certificate issuance, PDF stream, revocation, public audit
│   │   │   ├── marketplace.controller.ts    # Resale listings, customer enquiries, mark sold
│   │   │   ├── partner.controller.ts        # External partner registry (Refurbishers & Recyclers)
│   │   │   ├── refurbishment.controller.ts  # Workshop job dispatch & component logging
│   │   │   ├── recycling.controller.ts      # E-waste transfer manifests & destruction evidence
│   │   │   └── lifecycle.controller.ts      # Unified device chain-of-custody timeline
│   │   ├── models/
│   │   │   ├── User.ts                      # Customer & Admin user schema
│   │   │   ├── Device.ts                    # Hardware inventory with circular statuses & classification
│   │   │   ├── PickupRequest.ts             # Doorstep collection logistics
│   │   │   ├── Agent.ts                     # Local Python agent registration & API keys
│   │   │   ├── SanitizationJob.ts           # 13-stage NIST SP 800-88 state machine
│   │   │   ├── SanitizationCertificate.ts   # Cryptographic certificate with QR & revocation
│   │   │   ├── MarketplaceListing.ts        # Refurbished device resale listing
│   │   │   ├── MarketplaceEnquiry.ts        # Customer purchase enquiry & reservation
│   │   │   ├── Partner.ts                   # External partner records (REFURBISHMENT / RECYCLING)
│   │   │   ├── RefurbishmentJob.ts          # Workshop repair job & cost tracking
│   │   │   ├── RecyclingRecord.ts           # Hazardous e-waste transfer manifest
│   │   │   ├── DeviceLifecycleEvent.ts      # Unified immutable audit event ledger
│   │   │   └── Counter.ts                   # Sequential code generator (CERT, MKT, ENQ, PTR, RFB, RCY)
│   │   ├── services/
│   │   │   └── pdfCertificate.service.ts    # PDFKit + QRCode vector document generator
│   │   ├── routes/                          # Express REST API routes
│   │   ├── test_phase3_runner.ts            # Phase 3 integration test suite
│   │   └── test_phase4_runner.ts            # Phase 4 integration test suite
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/ProtectedRoute.tsx      # Customer & Admin route guards
│   │   │   ├── dashboard/
│   │   │   │   ├── CustomerLayout.tsx       # Customer sidebar with reports & refurbished store
│   │   │   │   ├── AdminLayout.tsx          # Admin operations sidebar with all Phase 4 modules
│   │   │   │   └── DeviceLifecycleTimeline.tsx # Reusable vertical chain-of-custody timeline
│   │   │   ├── landing/                     # High-conversion landing sections
│   │   │   └── layout/                      # Navbar, mobile menu, footer
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   └── VerifyCertificatePage.tsx # Public certificate verification portal
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboardPage.tsx
│   │   │   │   ├── SubmitDevicePage.tsx
│   │   │   │   ├── MyDevicesPage.tsx
│   │   │   │   ├── TrackRequestsPage.tsx
│   │   │   │   ├── CustomerReportsPage.tsx   # Chain-of-custody overview & certificate download
│   │   │   │   ├── RefurbishedMarketplacePage.tsx # Refurbished device catalog & purchase modal
│   │   │   │   └── CustomerProfilePage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── AdminDevicesPage.tsx
│   │   │   │   ├── AdminSanitizationPage.tsx
│   │   │   │   ├── AdminCertificatesPage.tsx # Certificates ledger, issuance wizard & revocation
│   │   │   │   ├── AdminMarketplacePage.tsx  # Resale manager, creation wizard & enquiries
│   │   │   │   ├── AdminRefurbishmentPage.tsx# Workshop job dispatch & partner registry
│   │   │   │   └── AdminRecyclingPage.tsx    # Recycling manifests, yard registry & destruction evidence
│   │   │   └── LandingPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts                       # Axios client with JWT interceptors
│   │   │   ├── phase4Service.ts             # Phase 4 API client for all models
│   │   │   └── sanitizationService.ts       # Sanitization client
│   │   ├── App.tsx                          # Route definitions & guards
│   │   └── index.css                        # Tailwind v4 theme tokens
│   ├── package.json
│   └── vite.config.ts
│
├── sanitization-agent/
│   ├── app/
│   │   ├── core/system_guard.py             # System drive protection guard
│   │   ├── services/disk_discovery.py       # OS drive & partition enumerator
│   │   ├── services/wipe_executor.py        # NIST SP 800-88 sanitization engine
│   │   ├── services/entropy_verifier.py     # Sector-level entropy verification
│   │   ├── client/backend_client.py         # HTTPX agent-to-backend communication
│   │   └── main.py                          # FastAPI application
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
└── README.md
```

---

## 🚀 Getting Started

### ⚡ Quick Start: Run with Docker (Zero Manual Installation)

You do **not** need to install Node.js, pnpm, Python, or MongoDB. All you need is [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### **On Windows:**
Simply double-click **`start.bat`** in the project root (or run `docker compose up -d --build`).

#### **On Mac / Linux:**
```bash
chmod +x start.sh && ./start.sh
# or simply: docker compose up -d --build
```

#### **Live Services & Pre-Seeded Credentials:**
| Service | Local URL | Credentials |
|---|---|---|
| **Web Application** | [http://localhost](http://localhost) *(or `http://localhost:5173`)* | — |
| **Admin Operations** | `http://localhost/admin/login` | `admin@retech.in` / `Admin@ReTech2026!` |
| **Customer Portal** | `http://localhost/login` | `customer@retech.in` / `Customer@2026!` |
| **Backend API Health** | `http://localhost:5000/api/v1/health` | — |
| **MongoDB Database** | `localhost:27017` | — |

To stop all services:
```bash
docker compose down
```

---

### 💻 Manual Developer Setup (Without Docker)

If you prefer developing locally without Docker:

#### 1. Prerequisites
- Node.js 20+
- pnpm 9+
- MongoDB 6+ running locally (`mongodb://localhost:27017/retech`)
- Python 3.12+ (for local sanitization agent)

#### 2. Start the Backend API (`http://localhost:5000`)
```bash
cd backend
pnpm install
pnpm run dev
```

#### 3. Start the Frontend Application (`http://localhost:5173`)
```bash
cd frontend
pnpm install
pnpm run dev
```

### 4. Running the Local Sanitization Agent

The Sanitization Agent can be run in any of three ways:

- **Method A: Standalone Windows Executable (Zero Install — No Python or Docker needed)**
  Double-click `retech_agent.exe` (or extract `retech-agent-windows-exe.zip`). Opens an interactive console menu immediately.

- **Method B: Docker Container (No Python needed)**
  Double-click `sanitization-agent/start_docker.bat` (or `./start_docker.sh` on Linux/macOS).

- **Method C: Native Python**
  ```bash
  cd sanitization-agent
  start.bat                  # On Windows
  # or on Linux/macOS:
  pip install -r requirements.txt
  python run_agent.py
  ```

---

## 📋 Phase 4 Feature Summary Matrix

| Feature | Endpoint / Route | Access Role | Status |
|---|---|---|---|
| **Public Certificate Verification** | `/verify-certificate/:verificationId` | Public (No Auth) | ✅ Verified |
| **PDF Certificate Download** | `GET /api/v1/certificates/:id/pdf` | Customer (Own) / Admin | ✅ Verified |
| **Certificate Revocation** | `PATCH /api/v1/certificates/:id/revoke` | Admin Only | ✅ Verified |
| **Customer Chain-of-Custody Reports** | `GET /api/v1/customer/reports` | Customer Only | ✅ Verified |
| **Refurbished Marketplace Catalog** | `GET /api/v1/marketplace/listings` | Public / Customer | ✅ Verified |
| **Marketplace Purchase Enquiry** | `POST /api/v1/marketplace/enquiries` | Customer Only | ✅ Verified |
| **Admin Marketplace Listing & Mark SOLD** | `POST/PATCH /api/v1/marketplace/admin/*` | Admin Only | ✅ Verified |
| **Refurbishment Partner Registry** | `POST /api/v1/admin/partners` | Admin Only | ✅ Verified |
| **Workshop Job Dispatch & Completion** | `POST/PATCH /api/v1/admin/refurbishment/jobs/*` | Admin Only | ✅ Verified |
| **Recycling Transfer Manifest** | `POST /api/v1/admin/recycling/records` | Admin Only | ✅ Verified |
| **Certified Destruction Evidence Enforcement** | `PATCH /api/v1/admin/recycling/records/:id` | Admin Only | ✅ Verified |
| **Unified Device Lifecycle Timeline** | `GET /api/v1/lifecycle/devices/:id` | Authenticated | ✅ Verified |

---

## 🔧 Troubleshooting Guide

### 1. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- Ensure local MongoDB daemon is running:
  - Windows: Start the **MongoDB Server** service via `services.msc` or `net start MongoDB`.
  - Linux/macOS: `sudo systemctl start mongod` or `brew services start mongodb-community`.
- If using MongoDB Atlas, update `MONGODB_URI` in `backend/.env` with your cluster connection string and ensure IP whitelisting includes your IP.

### 2. Port In Use Error (`EADDRINUSE: port 5000`)
- Another process is occupying port 5000:
  ```powershell
  # Windows
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
  ```
- Or change `PORT=5001` in `backend/.env` and `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.

### 3. Deep SPA Route Refresh 404 in Production
- Ensure `vercel.json` or `public/_redirects` is deployed with the frontend build:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

### 4. Sanitization Agent Shows OFFLINE
- The local Python agent must be running on the technician's machine (`uvicorn app.main:app --port 8765`).
- Ensure the agent is paired using a valid 15-minute pairing code generated from `/admin/sanitization`.
- Check that the agent's `.env` specifies the correct backend URL (`RETECH_BACKEND_URL`).
- ReTech deliberately displays the agent as **OFFLINE** if the physical local daemon is not running. It will never falsely claim an agent is connected if no physical workstation daemon is heartbeating.

