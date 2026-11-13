import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import dns from 'node:dns';
import env from '../config/env.js';
import connectDB from '../config/db.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import Device from '../models/Device.js';
import PickupRequest from '../models/PickupRequest.js';
import Partner from '../models/Partner.js';
import SanitizationJob from '../models/SanitizationJob.js';
import SanitizationCertificate from '../models/SanitizationCertificate.js';
import MarketplaceListing from '../models/MarketplaceListing.js';
import RefurbishmentJob from '../models/RefurbishmentJob.js';
import RecyclingRecord from '../models/RecyclingRecord.js';
import DeviceLifecycleEvent from '../models/DeviceLifecycleEvent.js';

if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {}
}

async function seedFullPlatformDemo() {
  try {
    logger.info('Connecting to MongoDB Atlas for full demo seeding...');
    await connectDB();

    // 1. Ensure Admin & Demo Customer
    const adminSalt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash('Admin@ReTech2026!', adminSalt);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@retech.in' },
      {
        fullName: 'ReTech Platform Administrator',
        email: 'admin@retech.in',
        phone: '+91 98765 43210',
        passwordHash: adminHash,
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        address: { street: '100 Sustainability Boulevard', city: 'Bengaluru', state: 'Karnataka', pinCode: '560001' },
      },
      { upsert: true, new: true }
    );

    const custSalt = await bcrypt.genSalt(12);
    const custHash = await bcrypt.hash('Customer@2026!', custSalt);
    const customer = await User.findOneAndUpdate(
      { email: 'customer@retech.in' },
      {
        fullName: 'Ayushi Singh',
        email: 'customer@retech.in',
        phone: '+91 98123 45678',
        passwordHash: custHash,
        role: 'CUSTOMER',
        accountStatus: 'ACTIVE',
        address: { street: 'Flat 402, Green Glen Layout, Bellandur', city: 'Bengaluru', state: 'Karnataka', pinCode: '560103' },
      },
      { upsert: true, new: true }
    );

    logger.info('👥 Core accounts verified in Atlas.');

    // 2. Provision Partners
    const refurbPartner = await Partner.findOneAndUpdate(
      { email: 'workshop@apexcircuits.in' },
      {
        partnerId: 'PTR-RFB-001',
        partnerType: 'REFURBISHMENT',
        partnerName: 'Apex Circuit Labs',
        companyName: 'Apex Circuit Labs & Refurbishment Pvt Ltd',
        contactPerson: 'Karan Mehra',
        email: 'workshop@apexcircuits.in',
        phone: '+91 98450 11223',
        address: { street: 'Plot 14, Phase 2, Electronic City', city: 'Bengaluru', state: 'Karnataka', pinCode: '560100' },
        services: ['Motherboard BGA rework', 'Thermal servicing', 'Component harvest'],
        supportedCategories: ['Laptop', 'Desktop', 'Server'],
        authorisationReference: 'AUTH-RFB-2024-BLR-019',
        verificationDocuments: ['https://retech.in/docs/apex_iso9001.pdf'],
        status: 'ACTIVE',
        internalNotes: 'Tier-1 certified workshop partner in South Bengaluru.',
        createdBy: admin._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const recyclerPartner = await Partner.findOneAndUpdate(
      { email: 'compliance@ecorecycle.in' },
      {
        partnerId: 'PTR-RCY-001',
        partnerType: 'RECYCLING',
        partnerName: 'EcoRecycle India',
        companyName: 'EcoRecycle India Pvt Ltd',
        contactPerson: 'Dr. Sunita Rao',
        email: 'compliance@ecorecycle.in',
        phone: '+91 98220 99887',
        address: { street: 'Survey 88, Harohalli Industrial Area', city: 'Ramanagara', state: 'Karnataka', pinCode: '562112' },
        services: ['Hydrometallurgical refining', 'Shredding', 'Precious metal recovery'],
        supportedCategories: ['All electronics', 'Batteries', 'Circuit boards'],
        authorisationReference: 'CPCB/EW/2023/4819',
        verificationDocuments: ['https://retech.in/docs/ecorecycle_cpcb.pdf'],
        status: 'ACTIVE',
        internalNotes: 'CPCB & R2v3 authorized recycler facility.',
        createdBy: admin._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info('🏢 External Partners provisioned.');

    // 3. Provision Sample Devices for Customer
    let deviceA = await Device.findOne({ deviceId: 'DEV-MBP-001' });
    if (!deviceA) {
      deviceA = await Device.create({
        deviceId: 'DEV-MBP-001',
        customerId: customer._id,
        category: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Pro 14 (M1 Pro, 16GB)',
        serialNumber: 'C02G80A4MD6R',
        purchaseYear: 2021,
        condition: 'Good',
        powersOn: true,
        storageType: 'NVMe SSD',
        storageCapacity: '512GB',
        description: 'Single owner, pristine casing, battery cycle 142. Ready for secondary use.',
        status: 'SANITIZED',
        classification: 'A',
      });
    }

    let deviceB = await Device.findOne({ deviceId: 'DEV-THINKPAD-002' });
    if (!deviceB) {
      deviceB = await Device.create({
        deviceId: 'DEV-THINKPAD-002',
        customerId: customer._id,
        category: 'Laptop',
        brand: 'Lenovo',
        model: 'ThinkPad X1 Carbon (Gen 9)',
        serialNumber: 'PF39K09Z',
        purchaseYear: 2022,
        condition: 'Fair',
        powersOn: true,
        storageType: 'NVMe SSD',
        storageCapacity: '1TB',
        description: 'Trackpad replaced, minor keyboard wear. Premium ultrabook.',
        status: 'IN_REFURBISHMENT',
        classification: 'B',
      });
    }

    let deviceC = await Device.findOne({ deviceId: 'DEV-DELL-003' });
    if (!deviceC) {
      deviceC = await Device.create({
        deviceId: 'DEV-DELL-003',
        customerId: customer._id,
        category: 'Laptop',
        brand: 'Dell',
        model: 'XPS 15 (9500, 4K UHD)',
        serialNumber: '8H92KQ2',
        purchaseYear: 2020,
        condition: 'Good',
        powersOn: true,
        storageType: 'NVMe SSD',
        storageCapacity: '1TB',
        description: 'Collected from customer residence, currently in diagnostic intake bay.',
        status: 'INSPECTION_PENDING',
        classification: 'PENDING',
      });
    }

    let deviceD = await Device.findOne({ deviceId: 'DEV-IPHONE-004' });
    if (!deviceD) {
      deviceD = await Device.create({
        deviceId: 'DEV-IPHONE-004',
        customerId: customer._id,
        category: 'Smartphone',
        brand: 'Apple',
        model: 'iPhone 13 Pro (256GB Sierra Blue)',
        serialNumber: 'F2LXW09KN73N',
        purchaseYear: 2021,
        condition: 'Like new',
        powersOn: true,
        storageType: 'NVMe SSD',
        storageCapacity: '256GB',
        description: '91% battery health, certified data sanitized, flawless screen with original box.',
        status: 'READY_FOR_RESALE',
        classification: 'A',
      });
    }

    let deviceE = await Device.findOne({ deviceId: 'DEV-COMPAQ-005' });
    if (!deviceE) {
      deviceE = await Device.create({
        deviceId: 'DEV-COMPAQ-005',
        customerId: customer._id,
        category: 'Desktop',
        brand: 'HP',
        model: 'Compaq Pro 6300 MT (Core i5 3rd Gen)',
        serialNumber: 'CZC7419LMN',
        purchaseYear: 2013,
        condition: 'Not working',
        powersOn: false,
        storageType: 'HDD',
        storageCapacity: '500GB',
        description: 'Blown motherboard capacitors, unrepairable. Destined for precious metal recovery.',
        status: 'TRANSFERRED_TO_RECYCLER',
        classification: 'D',
      });
    }

    logger.info('💻 Sample devices in multiple lifecycle stages verified.');

    // 4. Pickup Request for Device C
    let existingPickup = await PickupRequest.findOne({ requestId: 'REQ-BLR-001' });
    if (!existingPickup) {
      await PickupRequest.create({
        requestId: 'REQ-BLR-001',
        customerId: customer._id,
        deviceId: deviceC._id,
        pickupAddress: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560103',
        contactNumber: '+91 98123 45678',
        preferredDate: '2026-11-15',
        preferredTimeSlot: '10:00 AM - 01:00 PM',
        status: 'SCHEDULED',
        adminRemarks: 'Field agent Rajesh M. assigned for doorstep pickup.',
        statusHistory: [{ status: 'SCHEDULED', timestamp: new Date(), remarks: 'Pickup confirmed.' }],
      });
      logger.info('📦 Doorstep pickup request provisioned.');
    }

    // 5. Sanitization Job & Official Certificate for Device A
    let sanitizationJob = await SanitizationJob.findOne({ jobId: 'JOB-SAN-001' });
    if (!sanitizationJob) {
      sanitizationJob = await SanitizationJob.create({
        jobId: 'JOB-SAN-001',
        deviceId: deviceA._id,
        retechDeviceId: deviceA.deviceId,
        targetDriveId: 'PhysicalDrive0',
        targetDriveModel: 'Apple NVMe SSD 512GB',
        sanitizationStandard: 'NIST_SP_800_88_REV1',
        selectedMethod: 'PURGE_CRYPTO_ERASE',
        status: 'VERIFIED_SUCCESSFUL',
        confirmAuthorization: true,
        authorizedBy: admin._id,
        verificationResult: {
          verified: true,
          methodUsed: 'PURGE_CRYPTO_ERASE',
          entropyScore: 7.9998,
          sha256VerificationHash: crypto.randomBytes(32).toString('hex'),
          verificationTimestamp: new Date(),
        },
      });
    }

    let certificate = await SanitizationCertificate.findOne({ certificateNumber: 'RETECH-CERT-000101' });
    if (!certificate) {
      certificate = await SanitizationCertificate.create({
        certificateNumber: 'RETECH-CERT-000101',
        verificationId: 'VER-A94F81',
        deviceId: deviceA._id,
        retechDeviceId: deviceA.deviceId,
        customerId: customer._id,
        sanitizationJobId: sanitizationJob._id,
        sanitizationJobCode: sanitizationJob.jobId,
        sanitizationMethod: 'PURGE_CRYPTO_ERASE',
        standardReference: 'NIST SP 800-88 Rev. 1',
        operationCompletedAt: new Date(),
        verifiedAt: new Date(),
        issuedAt: new Date(),
        issuedBy: admin._id,
        issuedByName: 'ReTech Platform Administrator',
        verificationOutcome: 'VERIFIED_SUCCESSFUL',
        evidenceReference: `SHA256:${crypto.randomBytes(32).toString('hex')}`,
        status: 'ACTIVE',
      });
      logger.info('📜 Verifiable Sanitization Certificate provisioned (VER-A94F81).');
    }

    // 6. Refurbishment Job for Device B
    let refurbJob = await RefurbishmentJob.findOne({ jobId: 'RFB-JOB-001' });
    if (!refurbJob) {
      await RefurbishmentJob.create({
        jobId: 'RFB-JOB-001',
        deviceId: deviceB._id,
        retechDeviceId: deviceB.deviceId,
        partnerId: refurbPartner._id,
        partnerName: refurbPartner.partnerName,
        assignedBy: admin._id,
        assignedByName: 'ReTech Administrator',
        assignmentDate: new Date(),
        instructions: 'Keyboard replacement and thermal paste refresh.',
        status: 'IN_PROGRESS',
        inspectionFindings: 'Keyboard keycaps loose; motherboard 100% functional.',
        replacedComponents: ['Backlit Keyboard Assembly', 'Thermal Interface Paste'],
        refurbishmentCost: 3200,
        supportingDocuments: [],
      });
      logger.info('🔧 Refurbishment workshop job provisioned.');
    }

    // 7. Recycling Record for Device E
    let recyclingRecord = await RecyclingRecord.findOne({ recordId: 'RCY-REC-001' });
    if (!recyclingRecord) {
      await RecyclingRecord.create({
        recordId: 'RCY-REC-001',
        deviceId: deviceE._id,
        retechDeviceId: deviceE.deviceId,
        recyclerId: recyclerPartner._id,
        recyclerName: recyclerPartner.partnerName,
        createdBy: admin._id,
        createdByName: 'ReTech Administrator',
        transferDate: new Date(),
        deviceCategory: 'Desktop',
        approximateWeightKg: 9.3,
        handoverReference: 'FORM-6-HAZ-2024-081',
        processingStatus: 'RECEIVED_BY_RECYCLER',
        internalNotes: 'CPCB compliant recycling manifest generated.',
      });
      logger.info('♻️ Recycling manifest record provisioned.');
    }

    // 8. Refurbished Marketplace Listing for Device D
    let marketplaceListing = await MarketplaceListing.findOne({ listingId: 'MKT-LST-001' });
    if (!marketplaceListing) {
      await MarketplaceListing.create({
        listingId: 'MKT-LST-001',
        deviceId: deviceD._id,
        retechDeviceId: deviceD.deviceId,
        title: 'Apple iPhone 13 Pro 256GB - Sierra Blue (Certified Pre-Owned)',
        description: 'Professionally data-sanitized and certified by ReTech. Battery health 91%, pristine exterior. Includes original charging cable and 6-month ReTech Circular Warranty.',
        category: 'Smartphone',
        brand: 'Apple',
        model: 'iPhone 13 Pro',
        specifications: { storage: '256GB', color: 'Sierra Blue', batteryHealth: '91%' },
        price: 49999,
        originalEstimatedValue: 55000,
        warrantyInformation: '6 Months ReTech Hardware Warranty',
        condition: 'Like new',
        refurbishmentStatus: 'CERTIFIED_SANITIZED',
        images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80'],
        listingStatus: 'PUBLISHED',
        availability: 'AVAILABLE',
        createdBy: admin._id,
      });
      logger.info('🛍️ Circular Marketplace listing provisioned.');
    }

    // 9. Timeline Events for Device A
    await DeviceLifecycleEvent.deleteMany({ deviceId: deviceA._id });
    await DeviceLifecycleEvent.create([
      {
        deviceId: deviceA._id,
        retechDeviceId: deviceA.deviceId,
        eventType: 'INTAKE_REGISTERED',
        title: 'Device Registered by Customer',
        description: 'Customer registered MacBook Pro 14 for collection.',
        performedBy: customer._id,
        performedByName: 'Ayushi Singh',
        eventTimestamp: new Date(Date.now() - 3600 * 1000 * 96),
        supportingDocuments: [],
      },
      {
        deviceId: deviceA._id,
        retechDeviceId: deviceA.deviceId,
        eventType: 'PHYSICAL_INSPECTION_COMPLETED',
        title: 'Physical & Diagnostic Inspection Complete',
        description: 'Hardware diagnostics verified: 100% operational, battery healthy. Classified as Grade A.',
        performedBy: admin._id,
        performedByName: 'ReTech Platform Administrator',
        eventTimestamp: new Date(Date.now() - 3600 * 1000 * 48),
        supportingDocuments: [],
      },
      {
        deviceId: deviceA._id,
        retechDeviceId: deviceA.deviceId,
        eventType: 'DATA_SANITIZATION_COMPLETED',
        title: 'Cryptographic Data Sanitization Executed',
        description: 'NIST SP 800-88 Cryptographic Erase executed. Shannon entropy 7.9998 bits/byte.',
        performedBy: admin._id,
        performedByName: 'ReTech Platform Administrator',
        eventTimestamp: new Date(Date.now() - 3600 * 1000 * 24),
        supportingDocuments: [],
      },
      {
        deviceId: deviceA._id,
        retechDeviceId: deviceA.deviceId,
        eventType: 'CERTIFICATE_ISSUED',
        title: 'Tamper-Evident Certificate Issued',
        description: 'Official Sanitization Certificate RETECH-CERT-000101 issued with verifiable QR hash.',
        performedBy: admin._id,
        performedByName: 'ReTech Platform Administrator',
        eventTimestamp: new Date(Date.now() - 3600 * 1000 * 12),
        supportingDocuments: [],
      },
    ]);

    logger.info('📊 Chronological Lifecycle Timeline provisioned.');
    logger.info('================================================================');
    logger.info('🎉 RETECH FULL PLATFORM DEMO SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('================================================================');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

seedFullPlatformDemo();
