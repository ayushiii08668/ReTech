r"""
ReTech Helper: Generates real sample photos & documents in the test vault.
Location: c:/Users/ayush/OneDrive/Desktop/Retech/test_dummy_drive
"""
import os
from pathlib import Path
from PIL import Image, ImageDraw

VAULT_DIR = Path(__file__).resolve().parent.parent / "test_dummy_drive"
VAULT_DIR.mkdir(parents=True, exist_ok=True)

def generate_test_files():
    # 1. Blue Image
    img1 = Image.new("RGB", (600, 400), color=(41, 128, 185))
    d1 = ImageDraw.Draw(img1)
    d1.rectangle([(20, 20), (580, 380)], outline=(255, 255, 255), width=4)
    d1.text((50, 160), "RETECH TEST PHOTO #1\nStatus: Active (Before Sanitization)\nTarget: NIST SP 800-88 Overwrite", fill=(255, 255, 255))
    img1.save(VAULT_DIR / "dummy_photo_1.jpg", quality=95)

    # 2. Red Image
    img2 = Image.new("RGB", (600, 400), color=(192, 57, 43))
    d2 = ImageDraw.Draw(img2)
    d2.rectangle([(20, 20), (580, 380)], outline=(255, 255, 255), width=4)
    d2.text((50, 160), "CONFIDENTIAL DUMMY RECORD #2\nSensitive Photo & Customer Data\nReady for Cryptographic Purge", fill=(255, 255, 255))
    img2.save(VAULT_DIR / "dummy_photo_2.jpg", quality=95)

    # 3. Green Image
    img3 = Image.new("RGB", (600, 400), color=(39, 174, 96))
    d3 = ImageDraw.Draw(img3)
    d3.rectangle([(20, 20), (580, 380)], outline=(255, 255, 255), width=4)
    d3.text((50, 160), "RETECH ASSET PHOTO #3\nHardware Asset ID: EWASTE-2026-X99\nClassification: Circular Refurbish", fill=(255, 255, 255))
    img3.save(VAULT_DIR / "dummy_photo_3.jpg", quality=95)

    # 4. Confidential Notes Document
    with open(VAULT_DIR / "confidential_notes.txt", "w", encoding="utf-8") as f:
        f.write("RETECH TEST DATA RECORD\nCustomer: John Doe\nAccount ID: ACC-994821\nDevice: DEV-DELL-003\nSanitization Standard: NIST SP 800-88 Rev. 1\n")

    # 5. Passwords Backup Document
    with open(VAULT_DIR / "passwords_backup.txt", "w", encoding="utf-8") as f:
        f.write("DUMMY CREDENTIAL BACKUP (TEST DATA)\nAdmin: admin_temp_user\nToken: tok_98a72b14c33d8e9f\nPIN: 4892\n")

    # 6. Financial CSV
    with open(VAULT_DIR / "financial_report_2025.csv", "w", encoding="utf-8") as f:
        f.write("TransactionID,DeviceCategory,ResidualValueINR,CO2OffsetKg\nTXN-001,Laptop,14500,45.2\nTXN-002,Smartphone,9200,18.7\nTXN-003,Monitor,3800,12.4\n")

    # 7. Customer Database JSON Dump
    with open(VAULT_DIR / "customer_database_dump.json", "w", encoding="utf-8") as f:
        f.write('[\n  {"customerId": "CUST-001", "name": "Alice Sharma", "email": "alice@example.com"},\n  {"customerId": "CUST-002", "name": "Rajesh Kumar", "email": "rajesh@example.com"}\n]\n')

    print("\n" + "="*65)
    print("SUCCESS: 7 test files created in test vault:")
    print(f"Directory: {VAULT_DIR}")
    print("Files created:")
    print("  - dummy_photo_1.jpg (Blue photo)")
    print("  - dummy_photo_2.jpg (Red photo)")
    print("  - dummy_photo_3.jpg (Green photo)")
    print("  - confidential_notes.txt")
    print("  - passwords_backup.txt")
    print("  - financial_report_2025.csv")
    print("  - customer_database_dump.json")
    print("="*65 + "\n")

if __name__ == "__main__":
    generate_test_files()

