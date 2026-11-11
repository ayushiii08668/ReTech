# ReTech — System Architecture Specification

## 1. Overview & High-Level Architecture

**ReTech** is an enterprise-grade circular electronics lifecycle management platform. The architecture coordinates three core tiers:
1. **Frontend Presentation Tier**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion (Single Page Application).
2. **Backend Application & Security Tier**: Node.js + Express + TypeScript + Mongoose + JWT + PDFKit.
3. **Local Hardware Operations Tier**: Python 3.12/3.13 + FastAPI + Uvicorn + OS storage inspection utilities.

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER                                   |
|   React 19 SPA (Customer Portal, Admin Operations Console, Public Verification)   |
+----------------------------------------+------------------------------------------+
                                         | HTTPS / REST APIs
                                         v
+-----------------------------------------------------------------------------------+
|                              APPLICATION LAYER                                    |
|   Express.js (TypeScript)                                                         |
|   - Strict Role-Based Access Control (CUSTOMER / ADMIN)                           |
|   - Circular Hardware State Machine (16 discrete device lifecycle states)          |
|   - 13-stage NIST SP 800-88 Sanitization Orchestrator                            |
|   - Cryptographic PDF Certificate Generator (PDFKit + QRCode + SHA-256)           |
|   - Refurbished Marketplace Engine & Authentic Enquiry Ledger                     |
|   - Hazardous E-Waste Manifests & Destruction Evidence Enforcement                |
+-------------------+------------------------------------+--------------------------+
                    |                                    | Outbound Heartbeat / Polling
                    v                                    v
+----------------------------------+   +--------------------------------------------+
|         DATA STORAGE             |   |        LOCAL SANITIZATION AGENT            |
|   MongoDB Database               |   |   Python FastAPI Daemon (Local Computer)   |
|   - Users (Bcrypt hashed)        |   |   - Direct Storage Discovery               |
|   - Devices & Logistics          |   |   - OS Boot Drive Safety Lock              |
|   - Sanitization Jobs & Proofs   |   |   - NIST SP 800-88 Clear/Purge Executor    |
|   - Resale Listings & Enquiries  |   |   - Shannon Entropy Sector Verifier        |
|   - External Partner Registries  |   |   - SHA-256 Evidence Generator             |
|   - Immutable Lifecycle Events   |   +--------------------------------------------+
+----------------------------------+
```

---

## 2. Core Architectural Principles & Boundaries

### A. Strictly Two User Roles
The platform enforces a rigid 2-role security boundary:
1. `CUSTOMER`: Can register, manage personal devices, schedule collection pickups, review chain-of-custody reports, download signed PDF certificates, and browse the refurbished store to submit purchase reservations.
2. `ADMIN`: Full operational authority over customer records, logistics dispatch, diagnostic inspections, hardware classification (Grade A-D), sanitization job dispatch, certificate issuance/revocation, refurbished marketplace inventory, repair workshop dispatch, and recycler manifests.

> **Crucial Rule**: External partners (Refurbishers, Recyclers, Logistics Couriers) exist purely as business records (`Partner`), **never** as login application roles.

### B. Hardware Lifecycle State Machine
A device progresses through an immutable state progression:
`SUBMITTED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `COLLECTION_CONFIRMED` $\rightarrow$ `RECEIVED` $\rightarrow$ `INSPECTION_PENDING` $\rightarrow$ `INSPECTED` $\rightarrow$ `SANITIZATION_PENDING` $\rightarrow$ `SANITIZED` $\rightarrow$ `READY_FOR_RESALE` / `LISTED_FOR_RESALE` $\rightarrow$ `SOLD` or `TRANSFERRED_TO_RECYCLER` $\rightarrow$ `RECYCLED`.

### C. Cryptographic Evidence & Sanitization Safeguards
- A browser cannot wipe physical storage. Sanitization is executed via an outbound-connected local Python agent.
- Active Operating System drives (`mountPoint === '/'` or `'C:\'`) are hard-locked against in-OS erasure.
- Certificates require `SanitizationJob.status === 'VERIFIED_SUCCESSFUL'`.
- Certificate PDFs render a vector QR code containing a non-guessable UUID leading to public audit endpoints.

---

## 3. Database Schema Topology

```
+----------------+       1:N       +-------------------+       1:1       +--------------------+
|     User       +---------------->+      Device       +---------------->+   PickupRequest    |
| (CUSTOMER/ADM) |                 | (16-state machine)|                 | (Logistics audit)  |
+----------------+                 +---------+---------+                 +--------------------+
                                             |
                   +-------------------------+-------------------------+
                   | 1:N                                               | 1:N
                   v                                                   v
+------------------+---------------+               +-------------------+----------------+
|        SanitizationJob           |               |      DeviceLifecycleEvent          |
| (13-stage NIST 800-88 machine)   |               | (Immutable audit trail ledger)     |
+------------------+---------------+               +------------------------------------+
                   | 1:1
                   v
+------------------+---------------+
|     SanitizationCertificate      |
| (UUID, QR code, SHA-256 hash)    |
+----------------------------------+
```

---

## 4. Security Architecture

1. **Defense-in-Depth**:
   - `helmet`: Secure HTTP headers (HSTS, clickjacking prevention, MIME sniffing block).
   - `express-rate-limit`: General limit (1000 req/15min) + strict brute-force throttle (30 req/15min) on authentication endpoints.
   - `hpp`: HTTP parameter pollution prevention.
   - `cors`: Strict origin validation with localhost development allowances.
2. **Password & Token Security**:
   - Passwords hashed with `bcryptjs` (salt work factor: 12).
   - JWT tokens signed with HMAC-SHA256 and configured with expiration (`7d`).
   - Customer-scoped queries automatically inject `customerId = req.user._id`.
3. **Safe Production Error Handling**:
   - Stack traces and internal database errors are withheld from clients in `NODE_ENV === 'production'`.

