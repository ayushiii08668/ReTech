# ReTech Operator & Customer User Guide

## 1. Customer User Guide

### A. Registering an Account
1. Open the ReTech portal at `http://localhost:5173/register`.
2. Enter your Full Name, Email, Phone Number, Password, and check the Terms & Conditions.
3. Upon registration, you are logged in and redirected to your **Customer Dashboard**.

### B. Scheduling a Doorstep Device Collection
1. Click **"Request Collection"** in the sidebar (or navigate to `/dashboard/submit`).
2. **Step 1: Category & Specs** — Select device type (Laptop, Desktop, Smartphone, Tablet), brand, model, and purchase year.
3. **Step 2: Condition Evaluation** — Indicate if device powers on, cosmetic grade, and storage type.
4. **Step 3: Device Photos** — Upload up to 4 photos of the device.
5. **Step 4: Doorstep Pickup Details** — Provide pickup address, city, state, pin code, preferred date, and time slot.
6. **Step 5: Review & Confirm** — Review the details and submit. An automated sequential Device ID (`RET-2026-XXXX`) and Pickup Request ID (`REQ-2026-XXXX`) will be assigned immediately.

### C. Tracking Collection & Chain of Custody
1. Click **"Track Requests"** in the sidebar.
2. The interactive 8-stage progress tracker displays live milestones:
   - Request Submitted $\rightarrow$ Logistics Approved $\rightarrow$ Agent Dispatched $\rightarrow$ Collected at Doorstep $\rightarrow$ Received at Central Hub $\rightarrow$ Diagnostic Inspection $\rightarrow$ NIST SP 800-88 Sanitization $\rightarrow$ Final Destination.

### D. Viewing Reports & Downloading Official Certificates
1. Navigate to `/dashboard/reports`.
2. Each submitted device displays its complete chain-of-custody journey.
3. If data sanitization has been verified successful, click **"Download Certificate (PDF)"** to obtain the cryptographically signed certificate featuring your device details, NIST standard, SHA-256 evidence fingerprint, and audit QR code.

### E. Browsing the Refurbished Device Store
1. Click **"Refurbished Store"** (`/dashboard/marketplace`).
2. Filter listings by Category (Laptop, Desktop, Smartphone), Condition Grade (Like new, Good, Fair), or Price Range.
3. Click a product to review detailed hardware specifications, battery health, and warranty information.
4. Click **"Submit Purchase Enquiry"** to reserve the item. Enter your contact details and message to the ReTech sales team.

---

## 2. Administrator Operations Guide

### A. Accessing the Admin Console
1. Open `http://localhost:5173/admin/login`.
2. Enter administrator credentials (`admin@retech.in` / `Admin@ReTech2026!`).

### B. Managing Logistics & Intake Bay
1. Navigate to **"Pickup Requests"** (`/admin/pickups`).
2. Filter by status: `PENDING`, `APPROVED`, `SCHEDULED`, `RECEIVED`.
3. To approve a request, click **"Approve & Dispatch Courier"**.
4. When the device arrives at the facility, click **"Confirm Arrival at Hub"** to log the hardware into inventory.

### C. Conducting Technical Inspection & Classification
1. Open **"Device Inventory"** (`/admin/devices`).
2. Select the incoming device and click **"Record Technical Inspection"**.
3. Record powers-on test, physical condition, storage capacity, and assign a ReTech Circular Classification:
   - **Grade A – Reusable**: Device in good cosmetic/functional state; eligible for resale.
   - **Grade B – Requires Refurbishment**: Component repair needed before resale.
   - **Grade C – Certified Recycling**: Functional failure; suitable for raw material recovery.
   - **Grade D – Hazardous Special Handling**: Severely damaged / battery swelling; requires licensed destruction.

### D. Managing Data Sanitization Ops
1. Open **"Sanitization Ops"** (`/admin/sanitization`).
2. Click **"+ New Sanitization Job"**.
3. Select an intake device and choose the target physical drive.
4. Select the standard (e.g. `NIST SP 800-88 Rev 1 Clear`), check explicit authorization confirmation, and click **"Dispatch Job"**.
5. Connected Python agents will claim the job, execute the passes, stream telemetry logs, and upload SHA-256 verification evidence.

### E. Issuing & Revoking Sanitization Certificates
1. Open **"Certificates Ledger"** (`/admin/certificates`).
2. Click **"+ Issue Sanitization Certificate"** to select from verified sanitized devices.
3. The system generates an official PDF certificate with embedded QR verification.
4. If a drive requires re-testing or was incorrectly certified, click **"Revoke Certificate"** and enter a mandatory justification. The certificate status becomes `REVOKED` and public audit links immediately reflect the revocation.

### F. Managing Refurbished Marketplace Listings
1. Open **"Resale Marketplace"** (`/admin/marketplace`).
2. Click **"+ Create Listing"**. Select an inspected, sanitized device, enter resale price, specifications, warranty period, and publish.
3. Under the **"Customer Enquiries"** tab, review incoming buyer reservation messages.
4. To complete a transaction, click **"Mark as SOLD"**, enter buyer details and final price. The device status updates to `SOLD`.

### G. Dispatching Recycling Transfer Manifests
1. Open **"Recycler Transfers"** (`/admin/recycling`).
2. To transfer Class C/D hardware, click **"+ Initiate Transfer Manifest"**.
3. Select the target device, choose an authorized CPCB/R2v3 recycling partner, enter net weight in kg and handover gate-pass reference.
4. Once dismantled, click **"Update Status"**, select `RECYCLED`, and enter the partner's statutory **Destruction Certificate Reference** (e.g. `COD-CPCB-2026-991208`).

