# ReTech REST API Documentation

All API endpoints are mounted under `/api` and `/api/v1`.

---

## 1. Authentication Endpoints (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register customer account. Role is hardcoded to `CUSTOMER`. |
| `POST` | `/auth/login` | Public | Authenticate and receive signed JWT token and user profile. |
| `POST` | `/auth/logout` | Protected | Clear session cookie / token. |
| `POST` | `/auth/forgot-password` | Public | Request a secure cryptographic password reset token. |
| `POST` | `/auth/reset-password` | Public | Reset password using verified token. |
| `GET` | `/auth/me` | Protected | Retrieve current authenticated user profile. |
| `PUT` | `/auth/profile` | Protected | Update profile name, phone number, and default address. |
| `PUT` | `/auth/change-password` | Protected | Change password with current password verification. |

---

## 2. Customer Endpoints (`/customer` — Requires `CUSTOMER` role)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customer/dashboard` | Dashboard metrics: total devices, pending collections, sanitized count. |
| `GET` | `/customer/devices` | Paginated list of customer's registered hardware. |
| `POST` | `/customer/devices` | 5-step intake registration and pickup logistics creation. |
| `GET` | `/customer/devices/:id` | Detailed view of a customer device (ownership enforced). |
| `GET` | `/customer/pickups` | Pickup history and logistics tracking. |
| `PATCH` | `/customer/pickups/:id/cancel` | Cancel an eligible pending pickup request. |
| `GET` | `/customer/notifications` | In-app alerts and notifications feed. |
| `PATCH` | `/customer/notifications/read` | Mark all notifications as read. |
| `GET` | `/customer/reports` | Comprehensive chain-of-custody report and certificate download links. |
| `GET` | `/customer/certificates` | Active NIST SP 800-88 certificates issued for customer's devices. |

---

## 3. Admin Endpoints (`/admin` — Requires `ADMIN` role)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Platform metrics, intake volume, circular classification distributions. |
| `GET` | `/admin/customers` | Paginated search of all registered customers. |
| `GET` | `/admin/customers/:id` | Customer profile with full device and pickup history. |
| `PATCH` | `/admin/customers/:id/status` | Activate or deactivate customer account. |
| `GET` | `/admin/devices` | Platform device inventory with filter & multi-attribute search. |
| `GET` | `/admin/devices/:id` | Detailed hardware intake record. |
| `PATCH` | `/admin/devices/:id/inspection` | Record multi-point diagnostic check and assign Grade A-D. |
| `GET` | `/admin/pickups` | Logistics orders queue across all territories. |
| `GET` | `/admin/pickups/:id` | Pickup request details with audit status history. |
| `PATCH` | `/admin/pickups/:id/status` | Advance status (`APPROVED`, `REJECTED`, `COLLECTION_CONFIRMED`, `RECEIVED`). |

---

## 4. Sanitization & Agent Endpoints (`/admin/sanitization` & `/agent`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/sanitization/jobs` | Admin | List all sanitization jobs with status filter. |
| `POST` | `/admin/sanitization/jobs` | Admin | Schedule sanitization job with NIST SP 800-88 standard. Requires `confirmAuthorization: true`. |
| `GET` | `/admin/sanitization/jobs/:id` | Admin | Job execution telemetry, live logs, and verification proof. |
| `POST` | `/admin/sanitization/pairing-codes` | Admin | Generate one-time 15-minute pairing code for local agent. |
| `GET` | `/admin/sanitization/agents` | Admin | Connected agent registry with heartbeat and drives detected. |
| `POST` | `/agent/pair` | Public / Code | Local agent submits pairing code and receives persistent API key. |
| `POST` | `/agent/heartbeat` | Agent Key | Agent submits ping, online state, and discovered physical drives. |
| `GET` | `/agent/jobs/poll` | Agent Key | Agent polls for claimed or pending sanitization jobs. |
| `PATCH` | `/agent/jobs/:id/progress` | Agent Key | Streams execution logs and completion percentage. |
| `POST` | `/agent/jobs/:id/complete` | Agent Key | Submits final wipe result, Shannon entropy score, and SHA-256 evidence. |

---

## 5. Certificate & Public Verification Endpoints (`/certificates`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/certificates` | Admin | Certificates ledger and status overview. |
| `GET` | `/certificates/eligible-devices` | Admin | Devices verified sanitized and ready for certificate issuance. |
| `POST` | `/certificates/:deviceId/generate` | Admin | Issue signed certificate. Strictly requires `status === 'VERIFIED_SUCCESSFUL'`. |
| `GET` | `/certificates/:id/pdf` | Customer (Own) / Admin | Stream physical binary PDF certificate with embedded QR code. |
| `PATCH` | `/certificates/:id/revoke` | Admin | Revoke certificate with mandatory audit justification. |
| `GET` | `/certificates/verify/:verificationId` | Public (No Auth) | Public authenticity verification lookup. |

---

## 6. Refurbished Marketplace Endpoints (`/marketplace`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/marketplace/listings` | Public | Browse published refurbished devices with price and specs filters. |
| `GET` | `/marketplace/listings/:id` | Public | Individual product details modal view. |
| `POST` | `/marketplace/enquiries` | Customer | Submit authentic purchase reservation enquiry. |
| `GET` | `/marketplace/admin/listings` | Admin | Full listings inventory manager. |
| `POST` | `/marketplace/admin/listings` | Admin | Create listing. Enforces device sanitized/refurbished eligibility. |
| `PATCH` | `/marketplace/admin/listings/:id/sold` | Admin | Confirm sale, record buyer and sold price, transition device to `SOLD`. |
| `GET` | `/marketplace/admin/enquiries` | Admin | Customer purchase enquiries ledger. |

---

## 7. External Partners, Refurbishment & Recycling Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/partners` | Admin | External partner registry (Refurbishers & Recyclers). |
| `POST` | `/admin/partners` | Admin | Register licensed partner with statutory authorization reference. |
| `GET` | `/admin/refurbishment/jobs` | Admin | Workshop repair jobs ledger. |
| `POST` | `/admin/refurbishment/jobs` | Admin | Assign device to workshop. Transitions device to `IN_REFURBISHMENT`. |
| `PATCH` | `/admin/refurbishment/jobs/:id` | Admin | Complete job, log replaced parts and cost, transition device to `READY_FOR_RESALE`. |
| `GET` | `/admin/recycling/records` | Admin | E-waste transfer manifests ledger. |
| `POST` | `/admin/recycling/records` | Admin | Dispatch manifest with gross/net weight. Transitions device to `TRANSFERRED_TO_RECYCLER`. |
| `PATCH` | `/admin/recycling/records/:id` | Admin | Update status. Marking `RECYCLED` strictly requires destruction certificate evidence. |
| `GET` | `/lifecycle/devices/:id` | Protected | Full chronological custody event timeline for target device. |

---

## 8. Health Check Probes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Root lightweight probe for cloud orchestrators (HTTP 200). |
| `GET` | `/api/health` | Public | Detailed telemetry: status, uptime, environment, and MongoDB readyState. |

