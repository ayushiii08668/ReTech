"""
ReTech Sanitization Agent CLI Runner.
Interactive Menu & Command-line execution.

Usage:
  python run_agent.py                    # Launches interactive console menu
  python run_agent.py --drives           # Audits local storage drives & USBs
  python run_agent.py --pair CODE        # Pairs agent with single-use code
  python run_agent.py --serve            # Starts background job runner & API
  python run_agent.py --test-wipe        # Runs NIST SP 800-88 test wipe
  python run_agent.py --generate-sample  # Generates test photos & documents
"""
import sys
import os
import platform
import argparse
import uvicorn
from pathlib import Path

from app.config import load_config
from app.services.authentication import pair_with_backend
from app.services.device_discovery import discover_storage_drives
from app.services.job_runner import send_heartbeat, poll_and_process_jobs
from app.utils.logger import logger

def display_drives():
    drives = discover_storage_drives()
    print("\n" + "="*70)
    print("RETECH LOCAL STORAGE DEVICE AUDIT")
    print("="*70)
    for idx, d in enumerate(drives, 1):
        sys_tag = " [PROTECTED SYSTEM DISK - IN-OS WIPE BLOCKED]" if d.isSystemDrive else " [AUXILIARY - TARGETABLE]"
        print(f"[{idx}] {d.driveId}: {d.model}")
        print(f"    Capacity: {d.capacityFormatted} ({d.capacityBytes:,} bytes)")
        print(f"    Type: {d.storageType} ({d.interfaceType})")
        print(f"    Status: {sys_tag}")
        print(f"    Serial: {d.serialNumber or 'N/A'}")
    print("="*70 + "\n")

def run_test_wipe():
    from wipe_test_photos import wipe_vault
    from create_test_photos import generate_test_files, VAULT_DIR
    files = [f for f in os.listdir(VAULT_DIR) if (VAULT_DIR / f).is_file()] if VAULT_DIR.exists() else []
    if not files:
        print("\nTest vault empty. Auto-generating sample sensitive files first...")
        generate_test_files()
    wipe_vault()

def interactive_menu():
    while True:
        config = load_config()
        is_paired = bool(config.agentId and config.apiKey)
        status_str = f"PAIRED ({config.agentId})" if is_paired else "NOT PAIRED (Standalone Mode)"

        print("\n" + "="*72)
        print("             RETECH SECURE DATA SANITIZATION AGENT")
        print("="*72)
        print(f" Host Machine : {platform.node()} ({platform.system()} {platform.release()})")
        print(f" Node Status  : {status_str}")
        print(f" Cloud Server : {config.backendUrl}")
        print("="*72)
        print(" [1] Scan & Audit Host Storage (Disks, USB Pen Drives, Smartphones)")
        print(" [2] Pair with ReTech Cloud (Enter Pairing Code from Admin UI)")
        print(" [3] Start Agent Service (Listen for Cloud Jobs & Auto-Process)")
        print(" [4] Test Local Vault Sanitization (NIST SP 800-88 Zero Overwrite Demo)")
        print(" [5] Generate Sample Files in Test Vault (BMP Photos, CSV, Passwords)")
        print(" [6] Open Diagnostic Web REST API (Swagger UI at http://127.0.0.1:8000/docs)")
        print(" [7] Exit")
        print("="*72)

        try:
            choice = input("Select an option (1-7): ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

        if choice == "1":
            display_drives()
        elif choice == "2":
            print("\nTo pair, open the ReTech Admin Portal -> Sanitization Ops -> 'Pair New Agent'.")
            code = input("Enter Pairing Code (e.g. PAIR-XXXX-XXXX): ").strip()
            if code:
                name = input(f"Agent Name (Press Enter for 'Agent Node ({platform.node()})'): ").strip()
                server = input(f"Server URL (Press Enter for '{config.backendUrl}'): ").strip()
                success = pair_with_backend(code, custom_name=name or None, server_url=server or None)
                if success:
                    print("\n[SUCCESS] Node paired successfully with central ReTech cloud!\n")
                else:
                    print("\n[FAILED] Pairing failed. Verify code or server connectivity.\n")
        elif choice == "3":
            if not is_paired:
                print("\n[NOTE] Agent is currently not paired with a ReTech cloud server.")
                ans = input("Do you want to start local diagnostic listener anyway? (y/N): ").strip().lower()
                if ans != "y":
                    continue
            print("\nStarting ReTech Agent Service on 127.0.0.1:8000...")
            print("Press Ctrl+C to stop.\n")
            try:
                uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
            except KeyboardInterrupt:
                print("\nService stopped.")
        elif choice == "4":
            run_test_wipe()
        elif choice == "5":
            from create_test_photos import generate_test_files
            generate_test_files()
        elif choice == "6":
            print("\nStarting REST API on http://127.0.0.1:8000...")
            print("Open http://127.0.0.1:8000/docs in your browser to view Swagger UI.")
            print("Press Ctrl+C to return to menu.\n")
            try:
                import webbrowser
                webbrowser.open("http://127.0.0.1:8000/docs")
            except Exception:
                pass
            try:
                uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
            except KeyboardInterrupt:
                print("\nAPI stopped.")
        elif choice == "7":
            print("\nExiting ReTech Agent. Goodbye!")
            sys.exit(0)
        else:
            print("\nInvalid choice. Please select 1-7.")

def main():
    parser = argparse.ArgumentParser(description="ReTech Data Sanitization Agent")
    parser.add_argument("--pair", type=str, help="Pair agent using single-use pairing code (e.g. PAIR-ABCD-1234)")
    parser.add_argument("--server", "--url", dest="server", type=str, default=None, help="Target backend API server URL")
    parser.add_argument("--name", type=str, default=None, help="Custom name for this agent node")
    parser.add_argument("--sync", action="store_true", help="Perform immediate one-time sync with backend")
    parser.add_argument("--drives", action="store_true", help="Inspect and display host storage drives")
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI diagnostic server and background poller")
    parser.add_argument("--test-wipe", action="store_true", help="Run local vault NIST SP 800-88 test wipe")
    parser.add_argument("--generate-sample", action="store_true", help="Generate test photos and records in vault")
    parser.add_argument("--menu", action="store_true", help="Force interactive terminal menu")
    parser.add_argument("--port", type=int, default=8000, help="Port for the local diagnostic server (default: 8000)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host interface (default: 127.0.0.1)")

    args = parser.parse_args()

    # If no flags passed or --menu requested, launch interactive menu if interactive terminal
    if (len(sys.argv) == 1 or args.menu) and sys.stdin.isatty():
        interactive_menu()
        return

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
        display_drives()
        sys.exit(0)

    if args.test_wipe:
        run_test_wipe()
        sys.exit(0)

    if args.generate_sample:
        from create_test_photos import generate_test_files
        generate_test_files()
        sys.exit(0)

    if args.sync:
        logger.info("Executing one-time sync...")
        send_heartbeat()
        count = poll_and_process_jobs()
        logger.info(f"Sync complete. Processed {count} sanitization job(s).")
        sys.exit(0)

    # If --serve specified or default non-interactive
    logger.info(f"Starting ReTech Sanitization Agent service on {args.host}:{args.port}...")
    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=False)

if __name__ == "__main__":
    main()
