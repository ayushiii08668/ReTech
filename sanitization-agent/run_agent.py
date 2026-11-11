"""
ReTech Sanitization Agent CLI Runner.
Usage:
  python run_agent.py --pair PAIR-XXXX-XXXX
  python run_agent.py --sync
  python run_agent.py --drives
  python run_agent.py --serve [--port 8000]
"""
import sys
import argparse
import uvicorn

from app.config import load_config
from app.services.authentication import pair_with_backend
from app.services.device_discovery import discover_storage_drives
from app.services.job_runner import send_heartbeat, poll_and_process_jobs
from app.utils.logger import logger

def main():
    parser = argparse.ArgumentParser(description="ReTech Data Sanitization Agent")
    parser.add_argument("--pair", type=str, help="Pair agent using single-use pairing code (e.g. PAIR-ABCD-1234)")
    parser.add_argument("--server", "--url", dest="server", type=str, default=None, help="Target backend API server URL (e.g. https://retech-3x97.onrender.com)")
    parser.add_argument("--name", type=str, default=None, help="Custom name for this agent node")
    parser.add_argument("--sync", action="store_true", help="Perform immediate one-time sync with backend")
    parser.add_argument("--drives", action="store_true", help="Inspect and display host storage drives")
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI diagnostic server and background poller")
    parser.add_argument("--port", type=int, default=8000, help="Port for the local diagnostic server (default: 8000)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host interface (default: 127.0.0.1)")

    args = parser.parse_args()

    if args.pair:
        logger.info(f"Initiating agent pairing using code: {args.pair}")
        success = pair_with_backend(args.pair, custom_name=args.name, server_url=args.server)
        if success:
            logger.info("Agent paired successfully! Ready to process jobs.")
            sys.exit(0)
        else:
            logger.error("Failed to pair agent.")
            sys.exit(1)

    if args.drives:
        drives = discover_storage_drives()
        print("\n" + "="*70)
        print("RETECH LOCAL STORAGE DEVICE AUDIT")
        print("="*70)
        for idx, d in enumerate(drives, 1):
            sys_tag = " [PROTECTED SYSTEM DISK - IN-OS WIPE BLOCKED]" if d.isSystemDrive else " [AUXILIARY - TARGETABLE]"
            print(f"[{idx}] {d.driveId}: {d.model}")
            print(f"    Capacity: {d.capacityFormatted} ({d.capacityBytes} bytes)")
            print(f"    Type: {d.storageType} ({d.interfaceType})")
            print(f"    Status: {sys_tag}")
            print(f"    Serial: {d.serialNumber or 'N/A'}")
        print("="*70 + "\n")
        sys.exit(0)

    if args.sync:
        logger.info("Executing one-time sync...")
        send_heartbeat()
        count = poll_and_process_jobs()
        logger.info(f"Sync complete. Processed {count} sanitization job(s).")
        sys.exit(0)

    # Default action: start diagnostic server and background loop
    logger.info(f"Starting ReTech Sanitization Agent service on {args.host}:{args.port}...")
    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=False)

if __name__ == "__main__":
    main()

