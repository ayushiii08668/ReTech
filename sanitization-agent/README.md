# ReTech Secure Data Sanitization Agent

Standalone local data sanitization node conforming to **NIST SP 800-88 Rev. 1 Clear & Purge** standards.

---

## ⚡ Quick Start (Windows, macOS, Linux)

### Option A: Double-Click (Windows)
Simply double-click **`start.bat`**.
> It automatically checks Python, creates a virtual environment, installs the 4 lightweight dependencies, and launches the interactive menu.

### Option B: Terminal / macOS / Linux
```bash
# 1. Install dependencies (Python 3.10+ recommended)
pip install -r requirements.txt

# 2. Run the interactive launcher
python run_agent.py
```

---

## 🖥️ Interactive Console Menu

When you launch `start.bat` or `python run_agent.py`, you will see:

```
========================================================================
             RETECH SECURE DATA SANITIZATION AGENT
========================================================================
 Host Machine : DESKTOP-NODE (Windows 11)
 Node Status  : NOT PAIRED (Standalone Mode)
 Cloud Server : https://retech-3x97.onrender.com/api/v1
========================================================================
 [1] Scan & Audit Host Storage (Disks, USB Pen Drives, Smartphones)
 [2] Pair with ReTech Cloud (Enter Pairing Code from Admin UI)
 [3] Start Agent Service (Listen for Cloud Jobs & Auto-Process)
 [4] Test Local Vault Sanitization (NIST SP 800-88 Zero Overwrite Demo)
 [5] Generate Sample Files in Test Vault (BMP Photos, CSV, Passwords)
 [6] Open Diagnostic Web REST API (Swagger UI at http://127.0.0.1:8000/docs)
 [7] Exit
========================================================================
```

---

## 🧪 How to Test and Verify

### 1. Storage Drive Audit (Option 1)
- Scans all attached physical disks, external USB pen drives, and portable devices.
- **Safety guarantee**: Your primary boot disk (`C:\` or `/`) is automatically marked as **`PROTECTED SYSTEM DISK - IN-OS WIPE BLOCKED`** so host laptops are completely safe.
- Discovers attached USB flash drives or provides a safe targetable simulation disk.

### 2. NIST SP 800-88 Sanitization Verification (Option 4)
- Generates sensitive sample files (Windows BMP photos, confidential customer database dumps, password backups).
- Measures pre-wipe **Shannon Entropy** (active data: ~4.5 - 5.5).
- Performs a 3-stage NIST SP 800-88 single-pass `0x00` zero-fill overwrite with write buffer flushing (`fsync`).
- Samples post-wipe sectors and computes post-wipe Shannon Entropy (**0.0000 = zero residual recoverable data**).
- Computes cryptographic SHA-256 evidence hash.
- Unlinks and shreds the storage allocation blocks.

### 3. Cloud Pairing & Remote Sanitization (Options 2 & 3)
1. Go to the ReTech Admin Portal: **`https://re-tech2.vercel.app/admin/sanitization`**
2. Click **Pair New Agent** to generate a single-use pairing code (e.g. `PAIR-ABCD-1234`).
3. In this agent console, choose **[2] Pair with ReTech Cloud** and enter the pairing code.
4. Once paired, choose **[3] Start Agent Service**.
5. Back on the Admin Portal, assign any pending sanitization job to this agent node. The agent will automatically pull the job, execute the NIST overwrite, generate a tamper-evident audit report, and mint a verified certificate!

---

## 🛠️ Direct CLI Commands (Advanced)

```bash
# Scan and print storage drives
python run_agent.py --drives

# Run NIST SP 800-88 local test wipe
python run_agent.py --test-wipe

# Generate sample files in test_dummy_drive
python run_agent.py --generate-sample

# Pair with pairing code from web dashboard
python run_agent.py --pair PAIR-ABCD-1234

# Start background poller daemon & FastAPI diagnostic server
python run_agent.py --serve --port 8000
```

---

## 🛡️ Safety & Security Architecture
- **In-OS System Drive Protection**: Primary system boot partition cannot be targeted for destructive in-OS wipes.
- **Zero Inbound Ports Required**: Uses secure outbound HTTPS polling to the central ReTech backend.
- **Cryptographic Audit Proof**: Generates deterministic SHA-256 evidence records and zero-entropy certificates.
