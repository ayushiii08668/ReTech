# ReTech Local Sanitization Agent Setup & Operator Guide

The **ReTech Local Sanitization Agent** is a dedicated Python daemon that runs directly on an authorized technician's workstation. It establishes an authenticated outbound connection to the ReTech backend to receive wiping instructions, verify hardware compatibility, execute sector overwrites under NIST SP 800-88 guidelines, and calculate Shannon entropy verification proof.

---

## 1. System Requirements

- **Operating System**: Windows 10/11 (64-bit), Ubuntu Linux 22.04 LTS, or macOS 12+
- **Python**: Version 3.12 or 3.13
- **Privileges**: Administrator / Root access (required for physical drive enumeration and raw sector I/O)
- **Network**: Outbound HTTPS connectivity to the ReTech backend API

---

## 2. Installation & Setup

### Step 1: Navigate to the Agent Directory
```bash
cd sanitization-agent
```

### Step 2: Create and Activate a Virtual Environment
**On Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

---

## 3. Configuration & Secure Pairing Handshake

The local agent communicates outbound with the backend via HTTPS and never exposes public ingress ports to the internet.

### Step 1: Generate a Pairing Code
1. Log in to the ReTech Admin Portal at `http://localhost:5173/admin/sanitization`.
2. Navigate to **Connected Agents** tab.
3. Click **"+ Generate Pairing Code"**. A 6-character alpha-numeric pairing code (valid for 15 minutes) is generated.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your backend URL:
```env
RETECH_BACKEND_URL=http://localhost:5000/api/v1
AGENT_PORT=8765
```

### Step 3: Start the Agent in Pairing Mode
```bash
python run_agent.py --pair <PAIRING_CODE>
```
The agent contacts `POST /api/v1/agent/pair`, presents the one-time code, and receives a persistent cryptographic `AGENT_ID` and `AGENT_API_KEY` which are securely persisted in `agent_credentials.json`.

---

## 4. Running the Agent Daemon

Once paired, run the agent:
```bash
python -m uvicorn app.main:app --port 8765
```
Or use the launcher:
```bash
python run_agent.py
```

### Heartbeat & Telemetry
- The agent initiates an automated background heartbeat every 15 seconds (`POST /api/v1/agent/heartbeat`).
- It enumerates attached physical storage disks and reports disk identifiers, models, capacities, and mountpoints to the backend.
- The Admin Console displays the agent status as **ONLINE (Connected)**.
- If the agent is terminated, the backend automatically transitions connected agents to **OFFLINE** after 60 seconds of missed heartbeats.

---

## 5. Security Safeguards & System Drive Lock

### Critical Safety Invariants:
1. **Operating System Protection Lock**:
   - The agent detects the active boot/OS partition (`C:\` on Windows, `/` on Linux).
   - If an operator accidentally selects the host OS drive for sanitization, the `is_drive_safe_for_sanitization()` guard **hard-blocks** the operation and logs `SAFETY LOCK TRIGGERED`.
   - Host machine erasure from inside the running OS is prevented.
2. **Strict Operation Allowlist**:
   - Only pre-approved methods (`NIST_SP_800_88_CLEAR`, `NIST_SP_800_88_PURGE`, `ZERO_OVERWRITE`, `RANDOM_OVERWRITE`, `NVME_CRYPTO_ERASE`, `DRY_RUN_SIMULATION`) can be executed.
   - Arbitrary shell commands sent from outside are rejected.
3. **Dry-Run Simulation Mode**:
   - Allows safe operator training and test runs. Hardware sectors remain untouched, and the certificate clearly notes the execution mode.

---

## 6. Running the Agent Test Suite

```bash
cd sanitization-agent
python -m pytest -v tests/test_agent.py
```
*(All 8 unit and security safeguard tests pass with 100% success).*

