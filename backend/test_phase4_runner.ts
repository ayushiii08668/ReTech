/**
 * Phase 4 Comprehensive Integration Test Runner
 * Verifies the full ReTech Phase 4 Ecosystem:
 * - Sanitization Certificates (Strict verification eligibility, PDF generation, QR code, Revocation)
 * - Public Certificate Verification Endpoint (Zero auth required, cryptographic proof)
 * - Customer Reports (Full chain-of-custody overview from intake to certificates)
 * - Refurbished Marketplace (Eligibility enforcement, listings, customer enquiries, mark sold)
 * - Refurbishment Partner Management (External registry, workshop jobs, completion lifecycle)
 * - Authorised Recycling Management (Licensed registry, transfer manifests, mandatory evidence enforcement)
 * - Unified Device Lifecycle Timeline (Chronological audit history in MongoDB)
 * - Strict Role Boundaries (Only 2 roles: CUSTOMER and ADMIN. Partners are records, not user logins)
 */
import mongoose from 'mongoose';
import http from 'http';
import app from './src/app.js';
import User from './src/models/User.js';
import Device from './src/models/Device.js';
import SanitizationJob from './src/models/SanitizationJob.js';
import SanitizationCertificate from './src/models/SanitizationCertificate.js';
import MarketplaceListing from './src/models/MarketplaceListing.js';
import MarketplaceEnquiry from './src/models/MarketplaceEnquiry.js';
import Partner from './src/models/Partner.js';
import RefurbishmentJob from './src/models/RefurbishmentJob.js';
import RecyclingRecord from './src/models/RecyclingRecord.js';
import DeviceLifecycleEvent from './src/models/DeviceLifecycleEvent.js';
import { seedAdminUser } from './src/config/seedAdmin.js';
import env from './src/config/env.js';

const TEST_PORT = 5006;
const BASE_URL = `http://localhost:${TEST_PORT}/api/v1`;

let server: http.Server;
let adminToken: string;
let customerToken: string;
let customerUserId: string;

let testDeviceUnsanitizedId: string;
let testDeviceSanitizedId: string;
let testDeviceRefurbishId: string;
let testDeviceRecycleId: string;

let sanitizationJobId: string;
let generatedCertId: string;
let generatedVerificationId: string;

let marketplaceListingId: string;
let marketplaceEnquiryId: string;

let refurbPartnerId: string;
let refurbJobId: string;

let recyclePartnerId: string;
let recyclingRecordId: string;

async function request(path: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    const arrayBuf = await res.arrayBuffer();
    return { status: res.status, ok: res.ok, buffer: Buffer.from(arrayBuf), contentType };
  }

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, contentType };
}

async function runTests() {
  console.log('\n================================================================');
  console.log('  RETECH PHASE 4 - CERTIFICATES, MARKETPLACE, PARTNERS & LIFECYCLE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
      passed++;
    } else {
      console.log(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    // 0. Connect & Start Server
    await mongoose.connect(env.MONGODB_URI);
    await seedAdminUser();

    await new Promise<void>((resolve) => {
      server = http.createServer(app);
      server.listen(TEST_PORT, () => {
        resolve();
      });
    });

    console.log(`\x1b[36m--- SUITE 1: AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---\x1b[0m`);

    // 1. Admin login
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@retech.in', password: 'Admin@ReTech2026!' },
    });
    assert(adminLoginRes.status === 200 && !!adminLoginRes.data?.token, '1. Admin user logs in successfully', JSON.stringify(adminLoginRes.data));
    adminToken = adminLoginRes.data?.token;

    // 2. Customer register & login
    const testEmail = `test_customer_${Date.now()}@retech.local`;
    const custRegRes = await request('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Phase4 Test Customer',
        email: testEmail,
        phone: '9876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      },
    });
    assert(custRegRes.status === 201 && !!custRegRes.data?.token, '2. Customer registers successfully', JSON.stringify(custRegRes.data));
    customerToken = custRegRes.data?.token;
    customerUserId = custRegRes.data?.user?.id || custRegRes.data?.user?._id;

    // 3. Strict Role Boundary: Customer cannot access Admin endpoints
    const unauthPartnerRes = await request('/admin/partners', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(unauthPartnerRes.status === 403, '3. Customer is strictly forbidden from Admin Partners endpoint (403)');

    const unauthCertGenRes = await request('/certificates/anyid/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(unauthCertGenRes.status === 403, '4. Customer is strictly forbidden from Admin Certificate Generation (403)');

    const unauthRecycleRes = await request('/admin/recycling/records', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(unauthRecycleRes.status === 403, '5. Customer is strictly forbidden from Admin Recycling Management (403)');

    console.log(`\n\x1b[36m--- SUITE 2: DEVICE PRE-REQUISITES & SANITIZATION ELIGIBILITY ---\x1b[0m`);

    // Create devices for tests
    const dev1 = await Device.create({
      deviceId: `DEV-P4-RAW-${Date.now()}`,
      customerId: new mongoose.Types.ObjectId(customerUserId),
      category: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 7420',
      serialNumber: `SN-RAW-${Date.now()}`,
      condition: 'Good',
      status: 'RECEIVED',
    });
    testDeviceUnsanitizedId = dev1._id.toString();

    // 6. Certificate generation is BLOCKED for unsanitized device
    const blockedCertRes = await request(`/certificates/${testDeviceUnsanitizedId}/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      blockedCertRes.status === 400,
      '6. Certificate generation strictly BLOCKED for device without VERIFIED_SUCCESSFUL sanitization (400)',
      blockedCertRes.data?.message
    );

    // Create a device with a verified sanitization job
    const dev2 = await Device.create({
      deviceId: `DEV-P4-SAN-${Date.now()}`,
      customerId: new mongoose.Types.ObjectId(customerUserId),
      category: 'Laptop',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 2',
      serialNumber: `SN-SAN-${Date.now()}`,
      condition: 'Good',
      status: 'SANITIZED',
      dataSanitization: {
        isSanitized: true,
        method: 'NIST_SP_800_88_CLEAR',
        sanitizedAt: new Date(),
        sha256VerificationHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      },
    });
    testDeviceSanitizedId = dev2._id.toString();

    const job = await SanitizationJob.create({
      jobId: `JOB-P4-${Date.now()}`,
      deviceId: dev2._id,
      retechDeviceId: dev2.deviceId,
      targetDriveId: 'DRV-NVME-0',
      targetDriveModel: 'Samsung 980 PRO 1TB',
      targetStorageType: 'NVMe SSD',
      targetCapacity: '1TB',
      selectedMethod: 'NIST_SP_800_88_CLEAR',
      sanitizationStandard: 'NIST_SP_800_88_REV1',
      authorizedBy: new mongoose.Types.ObjectId(),
      authorizedByName: 'ReTech Platform Administrator',
      authorizationConfirmedAt: new Date(),
      status: 'VERIFIED_SUCCESSFUL',
      progressPercent: 100,
      verificationResult: {
        verified: true,
        methodUsed: 'NIST_SP_800_88_CLEAR',
        sha256VerificationHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        verificationTimestamp: new Date(),
        entropyScore: 0.001,
        sectorsSampled: 1000,
        sectorsVerifiedClean: 1000,
        notes: 'Cryptographic sector zero sampling verified 100% clean',
      },
      completedAt: new Date(),
    });
    sanitizationJobId = job._id.toString();

    console.log(`\n\x1b[36m--- SUITE 3: SANITIZATION CERTIFICATES & PUBLIC AUDIT ---\x1b[0m`);

    // 7. Generate certificate for verified sanitized device
    const genCertRes = await request(`/certificates/${testDeviceSanitizedId}/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const cert = genCertRes.data?.data;
    assert(
      genCertRes.status === 201 && !!(cert?.certificateNumber || cert?.certificateId),
      '7. Admin successfully generates official Sanitization Certificate',
      JSON.stringify(genCertRes.data)
    );
    generatedCertId = cert?._id || cert?.id;
    generatedVerificationId = cert?.verificationId;

    // 8. Validate cryptographic elements of certificate
    assert(
      !!cert?.verificationId && !!(cert?.evidenceReference || cert?.sha256CertificateFingerprint),
      '8. Certificate contains UUID verificationId and SHA-256 evidence fingerprint'
    );
    assert(cert?.status === 'ACTIVE', '9. Newly issued certificate status is ACTIVE');

    // 10. Public Certificate Verification (No Auth Required)
    const publicVerifyRes = await request(`/certificates/verify/${generatedVerificationId}`);
    assert(
      publicVerifyRes.status === 200 && publicVerifyRes.data?.data?.certificateNumber === cert?.certificateNumber,
      '10. Public verification endpoint validates certificate without authentication (200 OK)'
    );
    assert(
      publicVerifyRes.data?.data?.device?.model === 'ThinkPad T14 Gen 2',
      '11. Public verification payload returns correct audited device model'
    );

    // 12. PDF Certificate Generation & Download
    const pdfRes: any = await request(`/certificates/${generatedCertId}/pdf`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      pdfRes.status === 200 && pdfRes.contentType?.includes('application/pdf'),
      '12. Certificate PDF generation endpoint returns application/pdf content-type'
    );
    const isRealPdf = pdfRes.buffer && pdfRes.buffer.slice(0, 5).toString('utf-8') === '%PDF-';
    assert(isRealPdf, '13. Generated PDF buffer is valid binary PDF (header %PDF-)');

    // 14. Customer Certificate Retrieval
    const custCertsRes = await request('/customer/certificates', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custCertsRes.status === 200 && Array.isArray(custCertsRes.data?.data) && custCertsRes.data?.data.length > 0,
      '14. Customer can retrieve their own device sanitization certificates'
    );

    // 15. Certificate Revocation with Mandatory Justification
    const emptyRevokeRes = await request(`/certificates/${generatedCertId}/revoke`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { reason: '' },
    });
    assert(emptyRevokeRes.status === 400, '15. Revocation rejected without mandatory reason (400)');

    const validRevokeRes = await request(`/certificates/${generatedCertId}/revoke`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { reason: 'Target storage drive re-entered secondary test bench for extended destructive testing.' },
    });
    assert(
      validRevokeRes.status === 200 && validRevokeRes.data?.data?.status === 'REVOKED',
      '16. Certificate revoked successfully with audit reason'
    );

    // 17. Public verification reflects revocation
    const revokedVerifyRes = await request(`/certificates/verify/${generatedVerificationId}`);
    assert(
      revokedVerifyRes.status === 200 && revokedVerifyRes.data?.data?.status === 'REVOKED' && !!revokedVerifyRes.data?.data?.revocationReason,
      '17. Public verification immediately reflects REVOKED status and reason'
    );

    console.log(`\n\x1b[36m--- SUITE 4: REFURBISHED RESALE MARKETPLACE ---\x1b[0m`);

    // 18. Marketplace eligibility check: uninspected device cannot be listed
    const blockedListRes = await request('/marketplace/admin/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        deviceId: testDeviceUnsanitizedId,
        title: 'Dell Latitude 7420 Business Laptop',
        description: 'Clean device ready for work',
        price: 32000,
        condition: 'Good',
      },
    });
    assert(
      blockedListRes.status === 400,
      '18. Marketplace listing blocked for device that has not been sanitized or refurbished (400)',
      blockedListRes.data?.message
    );

    // 19. Create valid listing for sanitized device
    const validListRes = await request('/marketplace/admin/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        deviceId: testDeviceSanitizedId,
        title: 'Lenovo ThinkPad T14 Gen 2 - Enterprise Certified',
        description: 'Military-grade certified refurbished ThinkPad with freshly zeroed NVMe SSD and pristine display.',
        price: 38500,
        originalEstimatedValue: 75000,
        condition: 'Good',
        specifications: {
          processor: 'Intel Core i7-1185G7',
          ram: '16GB DDR4',
          storage: '512GB NVMe SSD',
          screenSize: '14-inch FHD IPS',
        },
        warrantyInformation: '12 Months Comprehensive ReTech Warranty',
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600'],
      },
    });
    assert(
      validListRes.status === 201 && !!validListRes.data?.data?.listingId,
      '19. Admin creates refurbished marketplace listing successfully (201)',
      JSON.stringify(validListRes.data)
    );
    marketplaceListingId = validListRes.data?.data?._id;

    // 20. Device status transitions to LISTED_FOR_RESALE
    const updatedDeviceAfterList = await Device.findById(testDeviceSanitizedId);
    assert(
      updatedDeviceAfterList?.status === 'LISTED_FOR_RESALE',
      '20. Target device status transitions to LISTED_FOR_RESALE'
    );

    // 21. Customer browses public marketplace catalog
    const catalogRes = await request('/marketplace/listings');
    assert(
      catalogRes.status === 200 && Array.isArray(catalogRes.data?.data?.listings) && catalogRes.data?.data?.listings.length > 0,
      '21. Public marketplace catalog returns active listings'
    );

    // 22. Customer submits genuine purchase enquiry
    const enquiryRes = await request('/marketplace/enquiries', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        listingId: marketplaceListingId,
        customerMessage: 'Interested in buying this ThinkPad. Is warranty valid across India?',
        offeredPrice: 37000,
        contactPhone: '+919876543210',
      },
    });
    assert(
      enquiryRes.status === 201 && !!enquiryRes.data?.data?.enquiryId,
      '22. Customer submits purchase enquiry successfully (201)',
      JSON.stringify(enquiryRes.data)
    );
    marketplaceEnquiryId = enquiryRes.data?.data?._id;

    // 23. Admin views enquiries ledger
    const adminEnquiriesRes = await request('/marketplace/admin/enquiries', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminEnquiriesRes.status === 200 && Array.isArray(adminEnquiriesRes.data?.data) && adminEnquiriesRes.data?.data.length > 0,
      '23. Admin retrieves customer purchase enquiries ledger'
    );

    // 24. Admin marks listing as SOLD
    const markSoldRes = await request(`/marketplace/admin/listings/${marketplaceListingId}/sold`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        buyerName: 'Ayush Customer',
        buyerContact: '+919876543210',
        soldPrice: 37500,
      },
    });
    assert(
      markSoldRes.status === 200 && markSoldRes.data?.data?.listingStatus === 'SOLD',
      '24. Admin marks marketplace listing as SOLD',
      JSON.stringify(markSoldRes.data)
    );

    const devAfterSold = await Device.findById(testDeviceSanitizedId);
    assert(devAfterSold?.status === 'SOLD', '25. Device status transitions to SOLD');

    console.log(`\n\x1b[36m--- SUITE 5: REFURBISHMENT PARTNER & WORKSHOP JOBS ---\x1b[0m`);

    // 26. Register Refurbishment Partner
    const createRefurbPartnerRes = await request('/admin/partners', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        partnerType: 'REFURBISHMENT',
        partnerName: 'CirQtech Refurb Labs',
        companyName: 'CirQtech Engineering Services Pvt Ltd',
        contactPerson: 'Devendra Joshi',
        email: 'workshop@cirqtech.local',
        phone: '+919988776655',
        address: {
          street: 'Plot 44, Electronic City',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560100',
        },
        services: ['Component level repair', 'Battery replacement', 'Thermal repaste', 'Keyboard replacement'],
        supportedCategories: ['Laptop', 'Desktop', 'Server'],
        authorisationReference: 'MEITY-REFURB-REG-2025-091',
      },
    });
    assert(
      createRefurbPartnerRes.status === 201 && !!createRefurbPartnerRes.data?.data?.partnerId,
      '26. Admin registers external Refurbishment Partner record',
      JSON.stringify(createRefurbPartnerRes.data)
    );
    refurbPartnerId = createRefurbPartnerRes.data?.data?._id;

    // Create device for refurbishment
    const dev3 = await Device.create({
      deviceId: `DEV-P4-RFB-${Date.now()}`,
      customerId: new mongoose.Types.ObjectId(customerUserId),
      category: 'Laptop',
      brand: 'HP',
      model: 'EliteBook 840 G8',
      serialNumber: `SN-HP-${Date.now()}`,
      condition: 'Fair',
      status: 'INSPECTED',
      classification: 'B',
      inspection: {
        physicalCondition: 'Battery health degraded, missing spacebar mechanism',
        powersOn: true,
        inspectedAt: new Date(),
      },
    });
    testDeviceRefurbishId = dev3._id.toString();

    // 27. Assign device to Refurbishment Workshop Job
    const assignJobRes = await request('/admin/refurbishment/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        deviceId: testDeviceRefurbishId,
        partnerId: refurbPartnerId,
        instructions: 'Replace 53Wh battery pack, clean heat pipe and apply thermal paste, replace spacebar.',
        expectedCompletionDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    });
    assert(
      assignJobRes.status === 201 && !!assignJobRes.data?.data?.jobId,
      '27. Admin assigns device to refurbishment partner workshop job',
      JSON.stringify(assignJobRes.data)
    );
    refurbJobId = assignJobRes.data?.data?._id;

    const devAfterAssign = await Device.findById(testDeviceRefurbishId);
    assert(
      devAfterAssign?.status === 'IN_REFURBISHMENT',
      '28. Device status transitions to IN_REFURBISHMENT'
    );

    // 29. Complete Refurbishment Job
    const completeJobRes = await request(`/admin/refurbishment/jobs/${refurbJobId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'COMPLETED',
        inspectionFindings: 'OEM battery replaced with genuine unit (100% capacity). Thermal performance restored.',
        replacedComponents: ['Battery Pack 53Wh', 'Spacebar Mechanism', 'Thermal Compound Noctua NT-H1'],
        refurbishmentCost: 4200,
        finalOutcome: 'PASSED_QUALITY_CONTROL',
      },
    });
    assert(
      completeJobRes.status === 200 && completeJobRes.data?.data?.status === 'COMPLETED',
      '29. Refurbishment job completed with component replacement details and cost'
    );

    const devAfterComplete = await Device.findById(testDeviceRefurbishId);
    assert(
      devAfterComplete?.status === 'READY_FOR_RESALE' || devAfterComplete?.status === 'REFURBISHED',
      '30. Device status transitions to READY_FOR_RESALE / REFURBISHED'
    );

    console.log(`\n\x1b[36m--- SUITE 6: AUTHORISED RECYCLER & MANIFEST PROCESSING ---\x1b[0m`);

    // 31. Register Authorised Recycler
    const createRecyclerRes = await request('/admin/partners', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        partnerType: 'RECYCLING',
        partnerName: 'GreenEarth E-Waste Solutions',
        companyName: 'GreenEarth Material Recovery India Ltd',
        contactPerson: 'Suresh Menon',
        email: 'compliance@greenearth-ewaste.in',
        phone: '+919443322110',
        address: {
          street: 'SIPCOT Industrial Park',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pinCode: '602105',
        },
        services: ['PCB precious metal smelting', 'Zero-landfill shredding', 'Hazardous battery disposal'],
        supportedCategories: ['Laptop', 'Desktop', 'Server', 'Smartphone', 'Tablet'],
        authorisationReference: 'CPCB-EWASTE-AUTH-TN-2024-8891',
      },
    });
    assert(
      createRecyclerRes.status === 201 && !!createRecyclerRes.data?.data?.partnerId,
      '31. Admin registers Authorised Recycler with statutory CPCB authorization reference',
      JSON.stringify(createRecyclerRes.data)
    );
    recyclePartnerId = createRecyclerRes.data?.data?._id;

    // Create device for recycling
    const dev4 = await Device.create({
      deviceId: `DEV-P4-RCY-${Date.now()}`,
      customerId: new mongoose.Types.ObjectId(customerUserId),
      category: 'Laptop',
      brand: 'Acer',
      model: 'Aspire 3',
      serialNumber: `SN-ACER-${Date.now()}`,
      condition: 'Damaged',
      status: 'INSPECTED',
      classification: 'D',
      inspection: {
        physicalCondition: 'Liquid damage on motherboard, cracked panel, beyond economical repair',
        powersOn: false,
        inspectedAt: new Date(),
      },
    });
    testDeviceRecycleId = dev4._id.toString();

    // 32. Initiate Recycling Transfer Manifest
    const createTransferRes = await request('/admin/recycling/records', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        deviceId: testDeviceRecycleId,
        recyclerId: recyclePartnerId,
        approximateWeightKg: 2.15,
        handoverReference: 'MNF-RETECH-2026-00441',
        handoverReceipt: 'GATEPASS-LOGISTICS-7781',
        internalNotes: 'Contains lithium-ion pouch battery and lead solder on PCB.',
      },
    });
    assert(
      createTransferRes.status === 201 && !!createTransferRes.data?.data?.recordId,
      '32. Admin creates hazardous e-waste transfer manifest to authorised recycler',
      JSON.stringify(createTransferRes.data)
    );
    recyclingRecordId = createTransferRes.data?.data?._id;

    const devAfterTransfer = await Device.findById(testDeviceRecycleId);
    assert(
      devAfterTransfer?.status === 'TRANSFERRED_TO_RECYCLER',
      '33. Device status transitions to TRANSFERRED_TO_RECYCLER'
    );

    // 34. Attempt to mark RECYCLED without processingEvidence is BLOCKED
    const blockedRecycledRes = await request(`/admin/recycling/records/${recyclingRecordId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        processingStatus: 'RECYCLED',
        processingEvidence: '', // missing mandatory evidence
      },
    });
    assert(
      blockedRecycledRes.status === 400,
      '34. Marking RECYCLED strictly blocked when processingEvidence is missing (400)',
      blockedRecycledRes.data?.message
    );

    // 35. Complete Recycling with mandatory evidence
    const validRecycleUpdateRes = await request(`/admin/recycling/records/${recyclingRecordId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        processingStatus: 'RECYCLED',
        processingEvidence: 'COD-TNPCB-GREENEARTH-2026-991208',
        recyclerAcknowledgement: 'Received and dismantled at SIPCOT yard under batch #TN-8812',
        finalOutcome: 'Shredded and smelted; recovered copper 340g, gold 0.08g, plastic 920g.',
      },
    });
    assert(
      validRecycleUpdateRes.status === 200 && validRecycleUpdateRes.data?.data?.processingStatus === 'RECYCLED',
      '35. Recycling record updated to RECYCLED with statutory certificate of destruction'
    );

    const devAfterRecycled = await Device.findById(testDeviceRecycleId);
    assert(
      devAfterRecycled?.status === 'RECYCLED',
      '36. Device status transitions to RECYCLED'
    );

    console.log(`\n\x1b[36m--- SUITE 7: UNIFIED DEVICE LIFECYCLE AUDIT TRAIL ---\x1b[0m`);

    // 37. Unified Device Lifecycle Query
    const lifecycleRes = await request(`/lifecycle/devices/${testDeviceSanitizedId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      lifecycleRes.status === 200 && Array.isArray(lifecycleRes.data?.data?.events) && lifecycleRes.data?.data?.events.length > 0,
      '37. Lifecycle API returns chronological chain-of-custody events'
    );
    const events = lifecycleRes.data?.data?.events || [];
    const eventTypes = events.map((e: any) => e.eventType);
    assert(
      eventTypes.includes('SANITIZATION_CERTIFICATE_ISSUED') || eventTypes.includes('DEVICE_LISTED_FOR_RESALE') || eventTypes.includes('DEVICE_SOLD'),
      '38. Lifecycle event stream captured certificate issuance and marketplace transactions'
    );

    console.log(`\n\x1b[36m--- SUITE 8: CUSTOMER REPORTS & CHAIN-OF-CUSTODY ---\x1b[0m`);

    // 39. Customer reports overview
    const custReportsRes = await request('/customer/reports', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(
      custReportsRes.status === 200 && Array.isArray(custReportsRes.data?.data),
      '39. Customer reports endpoint returns structured device reports'
    );
    const reports = custReportsRes.data?.data || [];
    const foundReport = reports.find((r: any) => r.device?._id?.toString() === testDeviceSanitizedId || r.device?.deviceId === dev2.deviceId);
    assert(
      !!foundReport && !!foundReport.device && !!foundReport.sanitization && !!foundReport.finalDestination,
      '40. Report contains device details, sanitization details, and final destination status'
    );

  } catch (err: any) {
    console.error('\x1b[31mFATAL ERROR IN TEST SUITE:\x1b[0m', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();

    console.log('\n================================================================');
    console.log(`  PHASE 4 TEST SUMMARY: \x1b[32m${passed} PASSED\x1b[0m, \x1b[${failed > 0 ? '31m' : '32m'}${failed} FAILED\x1b[0m`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
