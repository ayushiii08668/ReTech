# ReTech Testing & Verification Guide

ReTech implements automated, multi-tiered test suites verifying database integrity, state machines, cryptographic proofs, and role boundaries.

---

## 1. Automated Test Suite Summary

| Test Suite | File Path | Scope | Status |
|---|---|---|---|
| **Master E2E Lifecycle Journey** | `backend/test_e2e_journey.ts` | 17-step end-to-end customer and admin circular lifecycle from registration to device resale | **24 / 24 Passing (100%)** |
| **Phase 4 Ecosystem Suite** | `backend/test_phase4_runner.ts` | Certificates, PDF streams, public QR verification, resale marketplace, refurbishment workshop, recycling manifests | **40 / 40 Passing (100%)** |
| **Phase 3 Sanitization & Agent Suite** | `backend/test_phase3_runner.ts` | Agent pairing, heartbeat, job state machine, simulation mode, SHA-256 evidence, revocation | **28 / 28 Passing (100%)** |
| **Python Local Agent Suite** | `sanitization-agent/tests/test_agent.py` | Pytest suite: OS drive protection, allowlist validation, Shannon entropy, SHA-256 evidence | **8 / 8 Passing (100%)** |
| **Total Test Assertions** | — | — | **100 / 100 Passing (100%)** |

---

## 2. Running Automated Tests

### A. Run Master End-to-End User Journey (24 Tests)
```bash
cd backend
npx tsx test_e2e_journey.ts
```

### B. Run Phase 4 Certificates, Marketplace & Recycling Tests (40 Tests)
```bash
cd backend
npx tsx test_phase4_runner.ts
```

### C. Run Phase 3 Sanitization & State Machine Tests (28 Tests)
```bash
cd backend
npx tsx test_phase3_runner.ts
```

### D. Run Python Local Agent Pytest Suite (8 Tests)
```bash
cd sanitization-agent
python -m pytest -v tests/test_agent.py
```

---

## 3. Type Checking & Production Build Tests

### Backend TypeScript Compilation
```bash
cd backend
pnpm exec tsc --noEmit
pnpm build
```
*(Result: 0 errors; clean `dist/` compilation)*

### Frontend Vite Production Bundle
```bash
cd frontend
pnpm exec tsc --noEmit
pnpm build
```
*(Result: 0 errors; optimized production bundle generated in `dist/`)*

---

## 4. Manual QA Test Matrix

### A. Customer User Journey
1. Navigate to `http://localhost:5173/register` and create an account.
2. Log in and navigate to `/dashboard/submit`. Fill out the 5-step hardware intake wizard (select device type, model, upload photo, choose collection date/slot, submit).
3. Confirm automated sequential Device ID (`RET-2026-XXXX`) and Request ID (`REQ-2026-XXXX`) are assigned.
4. Open `/dashboard/track` and observe the live 8-stage progress timeline.
5. Once sanitized and inspected, open `/dashboard/reports` to inspect the chain of custody and click "Download Certificate" to verify the binary PDFKit document.
6. Open `/dashboard/marketplace` to browse the store, click a listed product, and submit a purchase enquiry.

### B. Admin Operations Journey
1. Navigate to `http://localhost:5173/admin/login` and authenticate with `admin@retech.in` / `Admin@ReTech2026!`.
2. Review aggregated metrics on `/admin/dashboard`.
3. Open `/admin/pickups`, inspect the customer request, and click "Approve". Advance status to "Received at Hub".
4. Open `/admin/devices`, select the device, and record technical inspection: physical condition, storage type, and assign Classification Grade A.
5. Open `/admin/sanitization`, select the device, and schedule a NIST SP 800-88 job.
6. Once verified, open `/admin/certificates`, click "+ Issue Sanitization Certificate", and download the signed PDF.
7. Open `/admin/marketplace`, click "+ Create Listing", set resale price, and publish to store.
8. Under enquiries, click "Mark as SOLD" and verify the device circular status completes as `SOLD`.
9. For damaged devices, open `/admin/recycling`, initiate a transfer manifest to a licensed recycler, and verify that marking `RECYCLED` strictly requires destruction certificate evidence.

