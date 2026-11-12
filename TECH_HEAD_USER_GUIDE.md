# ReTech: Platform Evaluation & User Guide

---

## 1. Project Summary
ReTech is a hybrid Cloud-Edge platform that automates the lifecycle of electronic waste—from doorstep collection to certified second-life resale. It solves the industry's critical bottleneck of data privacy liability through a local edge agent that executes NIST SP 800-88 cryptographic sanitization, mathematically auditing drives to guaranteed zero residual entropy ($0.0000\text{ bits/byte}$). Only verified-clean devices are permitted into the resale marketplace, preventing functional electronics from premature disposal.

---

## 2. End-to-End System Flow Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────────────────┐
│ 1. INTAKE       │      │ 2. TRIAGE       │      │ 3. CRYPTOGRAPHIC WIPE       │
│ Customer books  │ ───► │ Admin inspects  │ ───► │ Local agent executes NIST   │
│ pickup (/login) │      │ hardware (A/B/C)│      │ SP 800-88 overwrite (0.0000)│
└─────────────────┘      └─────────────────┘      └──────────────┬──────────────┘
                                                                 │
┌─────────────────┐      ┌─────────────────┐      ┌──────────────▼──────────────┐
│ 6. VERIFY       │      │ 5. MARKETPLACE  │      │ 4. CERTIFICATION            │
│ Anyone scans QR │ ◄─── │ Admin approves  │ ◄─── │ System issues tamper-proof  │
│ code to verify  │      │ & lists device  │      │ certificate with SHA-256 seal│
└─────────────────┘      └─────────────────┘      └─────────────────────────────┘
```

---

## 3. Platform Credentials & Live URLs

### Live Production Links
* **Web Portal (Vercel):** https://re-tech-tawny.vercel.app *(Mirror: https://re-tech2.vercel.app)*
* **Backend API (Render):** https://retech-3x97.onrender.com *(Health Check: `/health`)*
* **Public Verifier:** https://re-tech-tawny.vercel.app/verify-certificate
* **GitHub Repository:** https://github.com/ayushiii08668/ReTech

### Role-Based Access Credentials
The login portal automatically detects user role from the JWT token and routes to the proper dashboard:

| User Role | Email / Username | Password | Default Destination | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@retech.in` | `Admin@ReTech2026!` *(or `Admin@2026!`)* | `/admin/dashboard` | Hardware inspection, sanitization tasks, agent fleet management, certificate issuance, resale marketplace approval & listing deletion. |
| **Customer** | `customer@retech.in` *(or `ayushi@gmail.com`)* | `Customer@2026!` | `/dashboard` | E-waste pickup requests, device tracking, CO₂ offset impact dashboard, certified marketplace browsing, purchase enquiries. |

---

<!-- PAGE BREAK (PAGE 2) -->

## 4. Step-by-Step Operational Workflow

### Step 1: Customer Intake & Pickup Request
1. Log in at **`/login`** using Customer credentials (`customer@retech.in`).
2. Go to **Request Collection**, enter device details (brand, model, condition), and schedule a doorstep collection.
3. System assigns a tracking identifier (`DEV-...`) and records the initial timeline event.

### Step 2: Diagnostic Inspection & Triage
1. Log in using Admin credentials (`admin@retech.in`).
2. Review registered devices under **Inventory**:
   * **Grades A / B / C:** Approved for data sanitization and refurbishment.
   * **Grade D (Hazardous / Scrap):** Routed to recycling with CPCB Form-6 manifests.

### Step 3: Mandatory NIST SP 800-88 Cryptographic Sanitization
1. Open **`/admin/sanitization`** $\rightarrow$ **Initiate Sanitization**.
2. Select target device and assigned workstation node (or safe test drive `PhysicalDrive1`).
3. Select method: **NIST SP 800-88 Clear (Single Pass 0x00 Overwrite)**.
4. **Execution & Math Audit:** The edge agent locks the OS drive against wiping (`PhysicalDrive0` protected), overwrites logical blocks with zeros, and computes Shannon Entropy:
   $$H(X) = -\sum P(x_i) \log_2 P(x_i) = 0.0000\text{ bits/byte}$$
   *(Proves 100% destruction of residual data).*

### Step 4: Digital Certificate Generation
1. Upon verified wipe, the backend generates an immutable certificate (`RETECH-CERT-...`).
2. Displays cryptographic SHA-256 seal, sectors sampled (1024/1024 clean), and a scannable QR code.

### Step 5: Resale Marketplace Approval & Gatekeeper
1. **Strict Gatekeeper:** Devices cannot be listed unless verified as `VERIFIED_SUCCESSFUL`. Unsanitized hardware is programmatically blocked with HTTP 400.
2. **Approval Prompt:** Under **Sanitization Ledger**, admin clicks **"Approve for Resale"** to open the listing wizard with device specs pre-filled.
3. Admin sets resale price (₹), condition, and 90-day warranty, then clicks **Publish**.

### Step 6: Customer Inquiry & Second-Life Sale
1. Customer browses verified listings on **`/dashboard/marketplace`** (all cards feature the green **NIST Sanitized** trust badge).
2. Customer clicks **Inspect & Enquire** to submit an inquiry (`ENQ-...`).
3. Admin confirms the transaction under **`/admin/marketplace`** by clicking **Mark Sold**, transitioning device status to `SOLD` (*"Second life extended"*).

### Step 7: Public Trust Verification (No Login Required)
1. Open **`/verify-certificate`** or scan the QR code from any smartphone.
2. System validates the certificate hash against the blockchain-style ledger and displays the verified sanitization audit report.
