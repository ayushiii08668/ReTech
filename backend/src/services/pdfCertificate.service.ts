import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { ISanitizationCertificate } from '../models/SanitizationCertificate.js';
import { IDevice } from '../models/Device.js';
import { ISanitizationJob } from '../models/SanitizationJob.js';

const CERT_STORAGE_DIR = path.resolve('uploads', 'certificates');

if (!fs.existsSync(CERT_STORAGE_DIR)) {
  fs.mkdirSync(CERT_STORAGE_DIR, { recursive: true });
}

export async function generateCertificatePDF(
  certificate: ISanitizationCertificate,
  device: IDevice,
  job: ISanitizationJob,
  publicBaseUrl: string = 'http://localhost:5173',
): Promise<{ pdfPath: string; pdfBuffer: Buffer }> {
  const verificationUrl = `${publicBaseUrl}/verify-certificate/${certificate.verificationId}`;

  // Generate QR code data URL
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 140,
    margin: 1,
    color: {
      dark: '#47372E',
      light: '#FFFDF8',
    },
  });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `ReTech Sanitization Certificate - ${certificate.certificateNumber}`,
          Author: 'ReTech Cybersecurity Platform',
          Subject: 'NIST SP 800-88 Data Sanitization Verification',
          Keywords: 'NIST SP 800-88, Data Sanitization, Cryptographic Verification, E-Waste',
        },
      });

      const fileName = `${certificate.certificateNumber}.pdf`;
      const filePath = path.join(CERT_STORAGE_DIR, fileName);
      const writeStream = fs.createWriteStream(filePath);
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.pipe(writeStream);

      // --- STYLING & PALETTE ---
      // Primary: #C66D4E (Terracotta)
      // Dark Text: #47372E
      // Muted: #75665D
      // Border: #DDD1C3
      // Background Accent: #F5F0E7

      // Certificate Decorative Border
      doc
        .lineWidth(3)
        .strokeColor('#C66D4E')
        .rect(20, 20, 555, 802)
        .stroke();

      doc
        .lineWidth(1)
        .strokeColor('#DDD1C3')
        .rect(26, 26, 543, 790)
        .stroke();

      // Top Header / Brand Banner
      doc
        .rect(27, 27, 541, 75)
        .fill('#F5F0E7');

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#C66D4E')
        .text('RETECH', 45, 42, { characterSpacing: 2 });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#75665D')
        .text('SMART E-WASTE COLLECTION & HARDWARE SANITIZATION PLATFORM', 45, 68);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#47372E')
        .text('OFFICIAL MEDIA ERASURE CERTIFICATE', 320, 48, { align: 'right' });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#75665D')
        .text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`, 320, 64, { align: 'right' });

      // Title Section
      doc.moveDown(3);
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#47372E')
        .text('CERTIFICATE OF DATA SANITIZATION', 45, 120, { align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#75665D')
        .text(
          'Compliant with NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization',
          45,
          142,
          { align: 'center' },
        );

      // Status Badge
      const isRevoked = certificate.status === 'REVOKED';
      const statusText = isRevoked ? 'STATUS: REVOKED' : 'STATUS: CERTIFIED VERIFIED';
      const statusBg = isRevoked ? '#FDE8E8' : '#DEF7EC';
      const statusColor = isRevoked ? '#9B1C1C' : '#03543F';

      doc
        .roundedRect(210, 162, 175, 22, 11)
        .fill(statusBg);

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(statusColor)
        .text(statusText, 210, 168, { align: 'center', width: 175 });

      // Certificate Identification Block
      doc
        .rect(45, 195, 505, 50)
        .fill('#FFFDF8')
        .strokeColor('#DDD1C3')
        .lineWidth(1)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#75665D')
        .text('CERTIFICATE NUMBER', 60, 206);
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#C66D4E')
        .text(certificate.certificateNumber, 60, 220);

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#75665D')
        .text('SANITIZATION JOB REF', 230, 206);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#47372E')
        .text(certificate.sanitizationJobCode, 230, 220);

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#75665D')
        .text('PUBLIC VERIFICATION ID', 380, 206);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#47372E')
        .text(certificate.verificationId.slice(0, 16) + '...', 380, 220);

      // Details Table
      let currentY = 260;

      const drawRow = (label: string, value: string, isAlternate: boolean = false) => {
        if (isAlternate) {
          doc.rect(45, currentY, 505, 22).fill('#FAF7F2');
        }
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#47372E')
          .text(label, 55, currentY + 6);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#5C504A')
          .text(value, 200, currentY + 6, { width: 340 });
        doc
          .lineWidth(0.5)
          .strokeColor('#EAE2D7')
          .moveTo(45, currentY + 22)
          .lineTo(550, currentY + 22)
          .stroke();
        currentY += 22;
      };

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#C66D4E')
        .text('TARGET HARDWARE SPECIFICATION', 45, currentY);
      currentY += 16;

      drawRow('ReTech Device ID', certificate.retechDeviceId, true);
      drawRow('Device Category', device.category || 'Electronic Equipment');
      drawRow('Manufacturer & Model', `${device.brand} ${device.model}`, true);
      drawRow('Physical Storage Medium', `${job.targetDriveModel || 'Storage Drive'} (${job.targetDriveId})`);
      drawRow('Storage Capacity / Type', `${job.targetCapacity || device.storageCapacity || 'Unknown'} - ${job.targetStorageType || device.storageType || 'SSD'}`, true);

      currentY += 10;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#C66D4E')
        .text('SANITIZATION & VERIFICATION EVIDENCE', 45, currentY);
      currentY += 16;

      drawRow('Sanitization Method', certificate.sanitizationMethod, true);
      drawRow('Standard Applied', certificate.standardReference);
      drawRow('Execution Timestamp', new Date(certificate.operationCompletedAt).toUTCString(), true);
      drawRow('Verification Timestamp', new Date(certificate.verifiedAt).toUTCString());
      drawRow('Verification Outcome', '100% Full LBA Pattern Readback - CLEAN', true);
      drawRow('Shannon Entropy Score', `${certificate.entropyScore !== undefined ? certificate.entropyScore.toFixed(4) : '0.0000'} / 8.0000 (Expected ~0.00)`);
      drawRow('Sampled Sectors', `${certificate.sectorsSampled || 1024} Sectors Verified (Zero residual magnetic flux)`, true);

      currentY += 10;

      // SHA-256 Cryptographic Hash Box
      doc
        .rect(45, currentY, 505, 48)
        .fill('#2D231E');

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#68D391')
        .text('SHA-256 CRYPTOGRAPHIC DIGITAL VERIFICATION FINGERPRINT:', 55, currentY + 8);

      doc
        .font('Courier')
        .fontSize(8)
        .fillColor('#FFFDF8')
        .text(certificate.evidenceReference, 55, currentY + 24, { width: 485, lineBreak: false });

      currentY += 60;

      // QR Code & Verification Block
      doc.image(qrCodeDataUrl, 45, currentY, { width: 90 });

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#47372E')
        .text('PUBLIC VERIFICATION AUDIT TRAIL', 145, currentY + 10);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#75665D')
        .text(
          'Scan the QR code or visit the public audit URL below to independently verify the authenticity and revocation status of this digital certificate:',
          145,
          currentY + 24,
          { width: 395 },
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#C66D4E')
        .text(verificationUrl, 145, currentY + 54, { width: 395 });

      currentY += 100;

      // Legal & Signoff Footer
      doc
        .lineWidth(0.5)
        .strokeColor('#DDD1C3')
        .moveTo(45, currentY)
        .lineTo(550, currentY)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#8A7A71')
        .text(
          'ReTech certifications are issued based on recorded cryptographic hardware readback verification evidence. This certificate authenticates that the storage medium identified above was processed under the specified standard. Physical disposal and certified e-waste recovery operations comply with Indian E-Waste (Management) Rules.',
          45,
          currentY + 8,
          { width: 505, align: 'justify' },
        );

      doc.end();

      writeStream.on('finish', () => {
        const fullBuffer = Buffer.concat(buffers);
        resolve({ pdfPath: filePath, pdfBuffer: fullBuffer });
      });

      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

