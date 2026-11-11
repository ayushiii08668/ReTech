# ReTech Platform: Technical Reviewer & Evaluation User Guide

> **Project:** ReTech – Smart E-Waste Collection, Cryptographic Data Sanitization & Circular Economy Platform  
> **Target Audience:** Tech Lead, Engineering Managers, Solution Architects, Project Evaluators  
> **Last Updated:** November 2026  

---

## 1. Executive Summary & Live Deployments

ReTech is a full-stack, enterprise-grade circular economy platform that automates the end-to-end lifecycle of electronic waste—from residential/corporate collection intake and hardware triage to **NIST SP 800-88 compliant cryptographic data sanitization**, tamper-evident certification, and certified second-life hardware resale.

To eliminate the #1 bottleneck in electronics refurbishment—**residual data liability**—ReTech implements a **hybrid Cloud-Edge architecture**:
* A **Cloud Orchestration API** that manages device state machines, authentication, audit ledgers, and tamper-evident certificate hashes.
* A **Local Edge Sanitization Agent** running on physical technician workstations that securely interfaces with storage controllers (NVMe, SATA, USB), executes zero/pattern overwrites, mathematically calculates Shannon entropy ($0.0000\text{ bits/byte}$), and streams verifiable evidence back to the cloud.

### Live Production Links
* **Frontend Web Application (Vercel):** [https://re-tech-tawny.vercel.app](https://re-tech-tawny.vercel.app) *(Mirror: [https://re-tech2.vercel.app](https://re-tech2.vercel.app))*
* **Backend API Gateway (Render):** [https://retech-3x97.onrender.com](https://retech-3x97.onrender.com)
* **API Health Check Probe:** [https://retech-3x97.onrender.com/health](https://retech-3x97.onrender.com/health)
* **Public Certificate Verifier:** [https://re-tech-tawny.vercel.app/verify-certificate](https://re-tech-tawny.vercel.app/verify-certificate)
* **GitHub Repository:** [https://github.com/ayushiii08668/ReTech](https://github.com/ayushiii08668/ReTech)

---

## 2. Platform Access Credentials

The platform enforces strict Role-Based Access Control (**RBAC**). The login interface automatically determines user privileges from the verified JWT payload and routes them directly to their dedicated dashboard:

| User Role | Email Address | Password | Default Destination | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@retech.in` | `Admin@ReTech2026!` *(or `Admin@2026!`)* | `/admin/dashboard` | Hardware inspection & grading, initiating sanitization tasks, managing workstation nodes, generating pairing codes, issuing certificates, approving & managing resale marketplace listings, deleting nodes/listings. |
| **Customer / Business Client** | `customer@retech.in` *(or `ayushi@gmail.com`)* | `Customer@2026!` | `/dashboard` | E-waste pickup requests, device tracking, environmental CO₂ impact metrics, viewing certificates, browsing certified second-life marketplace, submitting purchase inquiries. |

> **Login Page:** [https://re-tech-tawny.vercel.app/login](https://re-tech-tawny.vercel.app/login)

---

## 3. Technology Architecture & Stack

```
   ┌────────────────────────────────────────────────────────┐
   │              CLIENT TIER (Vercel Edge CDN)             │
   │  React 18 • TypeScript • Tailwind CSS • Framer Motion  │
   │   Role-based portals: /dashboard and /admin/dashboard  │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTPS / JSON Web Tokens
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │           CLOUD ORCHESTRATOR (Render Web Service)      │
   │     Node.js 22 • Express • Mongoose • Docker Linux     │
   │  State machines, RBAC, Certificate Hashes, Marketplace │
   └─────────────┬───────────────────────────┬──────────────┘
                 │ Read / Write              │ Outbound Polling
                 ▼                           ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │    DATABASE (MongoDB AWS) │ │ EDGE WORKSTATION AGENT    │
   │  Clustered Mongo Atlas    │ │ Python 3.11 • PyCryptodome│
   │  Sharded Multi-Collection │ │ Hardware Lock, Shannon H  │
   └───────────────────────────┘ └───────────────────────────┘
```

* **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Vite bundler.
* **Backend:** Node.js 22, Express.js, TypeScript, Mongoose ODM, JWT authentication, CORS reflection, Docker.
* **Database:** MongoDB Atlas (AWS Cloud Cluster) with automatic index optimizations and timestamped audit logs.
* **Edge Agent:** Python 3.11, FastAPI, Uvicorn, HTTPX client, PyCryptodome, Windows WMI / PowerShell integration.

---

## 4. Testing Path 1: Customer Portal Journey

1. Open [https://re-tech-tawny.vercel.app/login](https://re-tech-tawny.vercel.app/login).
2. Log in using Customer credentials:
   * **Email:** `customer@retech.in`
   * **Password:** `Customer@2026!`
3. You will be automatically routed to the **Customer Dashboard** (`/dashboard`).

### Key Features to Inspect:
* **Real-Time Circular Metrics:** View total registered e-waste assets, verified kilograms of CO₂ emissions prevented, and toxic landfill waste offset.
* **Book an E-Waste Collection (`/dashboard/request-collection`):**
  * Schedule on-demand doorstep collection or select an authorized drop-off center.
  * Enter device specifications (brand, model, serial, estimated cosmetic condition).
* **Device Audit & Timeline (`/dashboard/devices`):**
  * Track devices across all state transitions: `PENDING_COLLECTION` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `INSPECTION_PENDING` $\rightarrow$ `SANITIZED` $\rightarrow$ `LISTED_FOR_RESALE`.
* **Certified Refurbished Marketplace (`/dashboard/marketplace`):**
  * Browse functional, high-performance refurbished electronics.
  * Notice the green **"NIST Sanitized"** shield badge on every card guaranteeing 0% residual data risk.
  * Click **"Inspect & Enquire"** to submit a purchase inquiry or reservation request.

---

## 5. Testing Path 2: Administrator & Sanitization Ops Journey

1. Log in using Administrator credentials:
   * **Email:** `admin@retech.in`
   * **Password:** `Admin@ReTech2026!`
2. You will be automatically routed to the **Admin Governance Center** (`/admin/dashboard`).

### A. Data Sanitization & Agent Node Management (`/admin/sanitization`)
Switch between the three operational tabs:

1. **Tab 1: Sanitization Ledger**
   * Inspect all historical and active sanitization tasks.
   * View live progress bars and cryptographic status badges (`VERIFIED_SUCCESSFUL`, `RUNNING`, `PENDING`).
   * Click **"Audit & Logs"** to open the real-time terminal execution modal showing sampled sectors, Shannon entropy score ($0.0000 / 8.0$), and the immutable SHA-256 verification hash.
   * **"Approve for Resale" Action:** On any verified job, click **"Approve for Resale"** to immediately open the marketplace wizard with the device pre-selected!

2. **Tab 2: Agents & Nodes (Workstation Fleet)**
   * View connected physical technician workstations.
   * Nodes actively polling show a glowing green **"ONLINE"** indicator with real-time host info (`Dellinspiron15`, `Windows 11`) and detected physical storage drives.
   * **Generate Pairing Code:** Click **"Pair New Agent"** to generate a single-use, 15-minute pairing code (e.g. `PAIR-8A2F-9C1D`).
   * **Delete Node:** Click the red **Delete (Trash)** button next to any offline or unneeded agent node to permanently remove it from MongoDB Atlas.

3. **Tab 3: Initiate Sanitization Task**
   * Select an inspected device from inventory.
   * Assign a workstation node (or target simulation drive `PhysicalDrive1`).
   * Choose standard: **NIST SP 800-88 Clear (Single Pass 0x00 Overwrite)** or **NIST SP 800-88 Purge**.
   * Toggle **Dry-Run / Simulation Mode** (enabled by default to guarantee 100% safety for personal workstation drives).
   * Confirm administrator authorization and launch the job.

### B. Refurbished Resale Marketplace (`/admin/marketplace`)
* **Strict Security Gatekeeper:** The backend programmatically prevents listing any device unless it has an associated `SanitizationJob` with status **`VERIFIED_SUCCESSFUL`**. Unsanitized devices or hazardous Class D hardware are rejected with HTTP 400.
* **Publish Resale Listing:** Configure condition grade (`Like new`, `Good`, `Fair`), resale price (₹), specifications, and 90-day warranty.
* **Delete / Remove Listing:** Click the red **Trash icon** next to any active listing to immediately unpublish it from the marketplace and return the device to sanitized inventory.
* **Mark Sold:** Record confirmed second-life sales, transitioning device status to `SOLD` and recording an audit timeline event (*"Second life extended"*).

---

## 6. Testing Path 3: Local Python Agent Integration (Workbench Test)

Evaluators who want to test the physical edge agent on their workstation can connect to the cloud backend in under 60 seconds.

### Quick Setup:
```powershell
# 1. Navigate to agent directory
cd sanitization-agent

# 2. Install dependencies (if not already installed)
pip install -r requirements.txt

# 3. Discover local host storage drives (Safe read-only audit)
python run_agent.py --drives
```

### Pairing with Deployed Cloud Backend:
```powershell
# Generate a pairing code on https://re-tech-tawny.vercel.app/admin/sanitization
python run_agent.py --pair PAIR-XXXX-XXXX --server https://retech-3x97.onrender.com --name "TechLead-Node"
```
* **Output:**
  ```text
  [INFO] Initiating pairing with backend at https://retech-3x97.onrender.com/api/v1/agent/pair...
  [INFO] Pairing SUCCESSFUL! Agent registered as ID: AGT-xxxx
  [INFO] Agent configuration saved to agent_config.json
  ```
* Refresh the Vercel admin dashboard—your node will instantly show **`ONLINE`**!

### Start the Background Worker:
```powershell
python run_agent.py --serve
```
* Keep this running. Any sanitization task queued on Vercel from anywhere in the world will be claimed by your local terminal, executed, and completed with real-time logs!

### Physical File Destruction Test on Dummy Drive:
The platform includes a safe target directory (`test_dummy_drive`) containing sample sensitive files (photos, password backups, customer databases):
```powershell
# Re-generate 7 sample dummy files anytime
python create_test_photos.py

# Execute NIST SP 800-88 single-pass overwrite, calculate entropy, and shred
python wipe_test_photos.py
```

---

## 7. Public Certificate Verification Portal

Anyone can verify certificate authenticity without logging in:
1. Open **[https://re-tech-tawny.vercel.app/verify-certificate](https://re-tech-tawny.vercel.app/verify-certificate)**.
2. Enter a Certificate ID (e.g. `RETECH-CERT-000101` or any ID from your completed jobs) or SHA-256 hash.
3. Or scan the QR code on the certificate using a smartphone camera.
4. The system validates the tamper-evident cryptographic seal against the database ledger and displays the verified sanitization audit report.

---

## 8. Standards Compliance & Methodology Matrix

| Regulatory / Technical Standard | ReTech Implementation |
| :--- | :--- |
| **NIST SP 800-88 Rev. 1** | Implements Clear (single-pass pseudorandom or zero overwrite) and Purge standards with firmware-level command execution allowlists. |
| **Shannon Entropy Mathematical Audit** | Calculates $H(X) = -\sum P(x_i) \log_2 P(x_i)$. Active readable data yields $\approx 7.92\text{ bits/byte}$; verified sanitization guarantees exactly $0.0000\text{ bits/byte}$. |
| **Host System Drive Protection** | Queries Windows WMI `IsBoot` and `IsSystem` flags. The operating system drive (`PhysicalDrive0` / `C:\`) is hardware-locked against in-OS wiping. |
| **CPCB E-Waste Rules, 2022** | Enforces Form-6 recycling manifests and hazardous waste tracking for Grade D scrap components. |
| **Second-Life Embodied Carbon** | Quantifies lifecycle extension: $\approx 70\text{--}80\%$ of a computer's lifetime carbon emissions occur during manufacturing; resale preserves this embodied energy. |

---

*ReTech Documentation &bull; Built with security, circularity, and verifiable trust.*
