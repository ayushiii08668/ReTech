# ReTech Sanitization Agent (Local Python Agent)

> Planned for implementation in **Phase 6 & 7**.

## Overview
The ReTech Local Sanitization Agent is a standalone Python application that runs on a supported client machine to communicate with the ReTech backend API and execute authorized, NIST SP 800-88 compliant data sanitization operations.

## Safety Architecture
- Outbound authenticated connection to ReTech backend (no open incoming ports)
- Strict allowlist of safe erasure utilities (no arbitrary shell execution)
- Never target system drives automatically
- Explicit drive verification and cryptographic wipe confirmations
- Standalone execution environment

