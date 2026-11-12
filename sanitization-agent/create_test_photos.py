r"""
ReTech Helper: Generates real sample photos & sensitive documents in the test vault.
Location: sanitization-agent/test_dummy_drive
Zero external dependencies required (uses standard library pure Python).
"""
import os
from pathlib import Path

VAULT_DIR = Path(__file__).resolve().parent / "test_dummy_drive"

def create_bmp_file(filepath: Path, width: int, height: int, r: int, g: int, b: int):
    """Creates a valid 24-bit uncompressed RGB Windows Bitmap (BMP) using pure Python."""
    row_bytes = width * 3
    padding = (4 - (row_bytes % 4)) % 4
    image_size = (row_bytes + padding) * height
    file_size = 54 + image_size

    # BMP Header (14 bytes)
    header = bytearray(b"BM")
    header += file_size.to_bytes(4, "little")
    header += (0).to_bytes(4, "little")  # Reserved
    header += (54).to_bytes(4, "little") # Pixel data offset

    # DIB Header (BITMAPINFOHEADER, 40 bytes)
    dib = bytearray()
    dib += (40).to_bytes(4, "little")     # Header size
    dib += width.to_bytes(4, "little", signed=True)
    dib += height.to_bytes(4, "little", signed=True)
    dib += (1).to_bytes(2, "little")      # Color planes
    dib += (24).to_bytes(2, "little")     # Bits per pixel (24-bit RGB)
    dib += (0).to_bytes(4, "little")      # BI_RGB (uncompressed)
    dib += image_size.to_bytes(4, "little")
    dib += (2835).to_bytes(4, "little")   # 72 DPI horizontal
    dib += (2835).to_bytes(4, "little")   # 72 DPI vertical
    dib += (0).to_bytes(4, "little")      # Colors in color table
    dib += (0).to_bytes(4, "little")      # Important color count

    # Pixel data (BMP stores in BGR order, bottom-to-top)
    pixel_row = bytes([b, g, r]) * width + b"\x00" * padding
    pixel_data = pixel_row * height

    with open(filepath, "wb") as f:
        f.write(header + dib + pixel_data)

def generate_test_files():
    VAULT_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Blue Image (BMP)
    create_bmp_file(VAULT_DIR / "dummy_photo_1_blue.bmp", 400, 300, 41, 128, 185)

    # 2. Red Image (BMP)
    create_bmp_file(VAULT_DIR / "dummy_photo_2_red.bmp", 400, 300, 192, 57, 43)

    # 3. Green Image (BMP)
    create_bmp_file(VAULT_DIR / "dummy_photo_3_green.bmp", 400, 300, 39, 174, 96)

    # 4. Confidential Notes Document
    with open(VAULT_DIR / "confidential_notes.txt", "w", encoding="utf-8") as f:
        f.write(
            "RETECH TEST DATA RECORD\n"
            "Customer: John Doe\n"
            "Account ID: ACC-994821\n"
            "Device: DEV-DELL-003\n"
            "Sanitization Standard: NIST SP 800-88 Rev. 1\n"
            "Sensitivity: Highly Confidential E-Waste Internal Disk\n"
        )

    # 5. Passwords Backup Document
    with open(VAULT_DIR / "passwords_backup.txt", "w", encoding="utf-8") as f:
        f.write(
            "DUMMY CREDENTIAL BACKUP (TEST DATA)\n"
            "Admin: admin_temp_user\n"
            "Token: tok_98a72b14c33d8e9f\n"
            "PIN: 4892\n"
            "Encryption Key: sec_9f88a21b330e84b8d\n"
        )

    # 6. Financial CSV
    with open(VAULT_DIR / "financial_report_2025.csv", "w", encoding="utf-8") as f:
        f.write(
            "TransactionID,DeviceCategory,ResidualValueINR,CO2OffsetKg\n"
            "TXN-001,Laptop,14500,45.2\n"
            "TXN-002,Smartphone,9200,18.7\n"
            "TXN-003,Monitor,3800,12.4\n"
            "TXN-004,Server,42000,110.5\n"
        )

    # 7. Customer Database JSON Dump
    with open(VAULT_DIR / "customer_database_dump.json", "w", encoding="utf-8") as f:
        f.write(
            '[\n'
            '  {"customerId": "CUST-001", "name": "Alice Sharma", "email": "alice@example.com", "ssn": "XXX-XX-1234"},\n'
            '  {"customerId": "CUST-002", "name": "Rajesh Kumar", "email": "rajesh@example.com", "ssn": "XXX-XX-5678"}\n'
            ']\n'
        )

    files = [f.name for f in VAULT_DIR.iterdir() if f.is_file()]
    print("\n" + "="*65)
    print(f"SUCCESS: {len(files)} test files generated in vault:")
    print(f"Directory: {VAULT_DIR}")
    for fname in files:
        print(f"  - {fname}")
    print("="*65 + "\n")
    return files

if __name__ == "__main__":
    generate_test_files()
