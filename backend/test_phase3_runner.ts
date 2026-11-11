/**
 * Phase 3 Comprehensive Integration Test Runner
 * Verifies the full ReTech Data Sanitization lifecycle:
 * - Admin agent pairing code generation
 * - Local agent pairing & API key generation
 * - Agent heartbeat & drive discovery reporting
 * - Sanitization job creation with NIST SP 800-88 standard
 * - Agent job polling, claiming, streaming progress, and results submission
 * - Cryptographic verification proof (SHA-256 evidence & certificate)
 * - Device status transition to SANITIZED
 * - Customer verification certificate retrieval
 * - Strict role-based security boundaries (Customers blocked from Admin sanitization APIs)
 * - Agent revocation enforcement
 */
import mongoose from 'mongoose';
import http from 'http';
import app from './src/app.js';
import User from './src/models/User.js';
import Device from './src/models/Device.js';
import Agent from './src/models/Agent.js';
import SanitizationJob from './src/models/SanitizationJob.js';
import { seedAdminUser } from './src/config/seedAdmin.js';
import env from './src/config/env.js';

const TEST_PORT = 5005;
const BASE_URL = `http://localhost:${TEST_PORT}/api/v1`;

let server: http.Server;
let adminToken: string;
let customerToken: string;
let customerUserId: string;
let testDeviceId: string;
let pairingCode: string;
let agentId: string;
let agentApiKey: string;
let testJobId: string;

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

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  RETECH PHASE 3 - SANITIZATION & AGENT INTEGRATION TEST');
  console.log('======================================================\n');

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
    // 1. Connect DB and start test server
    await mongoose.connect(env.MONGODB_URI);
    server = app.listen(TEST_PORT);
    console.log(`  Connected to MongoDB & Test server listening on port ${TEST_PORT}\n`);

    // Clean up test records
    await Agent.deleteMany({ hostname: 'test-agent-host' });
    await SanitizationJob.deleteMany({ targetDriveId: 'TestDrivePhys1' });

    // Ensure Admin user is seeded
    await seedAdminUser();

    // 2. Obtain Admin and Customer tokens
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@retech.in', password: 'Admin@ReTech2026!' },
    });
    adminToken = adminLoginRes.data?.token || adminLoginRes.data?.data?.token;
    assert(Boolean(adminToken), 'Admin authentication successful for Phase 3 tests');

    let customerUser = await User.findOne({ email: 'john.doe@example.com' });
    if (!customerUser) {
      await request('/auth/register', {
        method: 'POST',
        body: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+919988776655',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          termsAccepted: true,
        },
      });
      customerUser = await User.findOne({ email: 'john.doe@example.com' });
    }
    if (!customerUser) {
      throw new Error('Customer user could not be initialized.');
    }
    customerUserId = customerUser._id.toString();

    const customerLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'john.doe@example.com', password: 'SecurePassword123!' },
    });
    customerToken = customerLoginRes.data?.token || customerLoginRes.data?.data?.token;
    assert(Boolean(customerToken), 'Customer authentication successful');

    // Find or create test device
    let device = await Device.findOne({ customerId: customerUser._id });
    if (!device) {
      device = await Device.create({
        deviceId: 'RET-2026-TEST',
        customerId: customerUser._id,
        category: 'Laptop',
        brand: 'Dell',
        model: 'XPS 15 Test Edition',
        condition: 'Good',
        powersOn: true,
        storageType: 'NVMe SSD',
        storageCapacity: '512 GB',
        status: 'INSPECTED',
      });
    }
    testDeviceId = device._id.toString();
    assert(Boolean(testDeviceId), `Target device ready (${device.deviceId})`);

    // 3. Admin generates single-use pairing code
    const pairingRes = await request('/admin/sanitization/agents/pairing-code', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(pairingRes.status === 201, 'Admin generated 15-minute pairing code');
    pairingCode = pairingRes.data?.data?.pairingCode;
    const initialAgentId = pairingRes.data?.data?.agentId;
    assert(Boolean(pairingCode && pairingCode.startsWith('PAIR-')), `Pairing code created: ${pairingCode}`);

    // 4. Local Python Agent exchanges pairing code for scoped API key
    const pairAgentRes = await request('/agent/pair', {
      method: 'POST',
      body: {
        pairingCode,
        name: 'Dell Inspiron Sanitization Rig',
        hostname: 'test-agent-host',
        platform: 'Windows 11 Professional',
        agentVersion: '1.0.0',
        supportedCapabilities: ['NIST_SP_800_88_CLEAR', 'ZERO_OVERWRITE', 'DRY_RUN_SIMULATION'],
        discoveredDrives: [
          {
            driveId: 'PhysicalDrive0',
            model: 'Host Boot SSD',
            capacityBytes: 512000000000,
            capacityFormatted: '512.0 GB',
            storageType: 'NVMe',
            interfaceType: 'NVMe',
            isSystemDrive: true,
            isRemovable: false,
            supportedMethods: ['DRY_RUN_SIMULATION'],
          },
          {
            driveId: 'TestDrivePhys1',
            model: 'Target Customer SSD',
            capacityBytes: 1000000000000,
            capacityFormatted: '1.0 TB',
            storageType: 'SATA SSD',
            interfaceType: 'SATA',
            isSystemDrive: false,
            isRemovable: true,
            supportedMethods: ['NIST_SP_800_88_CLEAR', 'ZERO_OVERWRITE', 'DRY_RUN_SIMULATION'],
          },
        ],
      },
    });

    assert(pairAgentRes.status === 200, 'Agent pairing handshake succeeded');
    agentId = pairAgentRes.data?.data?.agentId;
    agentApiKey = pairAgentRes.data?.data?.apiKey;
    assert(Boolean(agentId && agentApiKey?.startsWith('ret_agt_')), 'Agent received valid scoped API key');

    // 5. Agent sends authenticated heartbeat ping
    const heartbeatRes = await request('/agent/heartbeat', {
      method: 'POST',
      headers: {
        'x-agent-id': agentId,
        'x-agent-key': agentApiKey,
      },
      body: {
        hostname: 'test-agent-host',
        platform: 'Windows 11 Professional',
        agentVersion: '1.0.0',
      },
    });
    assert(heartbeatRes.status === 200, 'Agent authenticated heartbeat acknowledged');
    assert(heartbeatRes.data?.data?.status === 'ONLINE', 'Agent status confirmed ONLINE in registry');

    // 6. Admin creates sanitization job with NIST SP 800-88 standard
    const createJobRes = await request('/admin/sanitization/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        deviceId: testDeviceId,
        targetDriveId: 'TestDrivePhys1',
        targetDriveModel: 'Target Customer SSD 1.0 TB',
        targetStorageType: 'SATA SSD',
        targetCapacity: '1.0 TB',
        selectedMethod: 'NIST_SP_800_88_CLEAR',
        sanitizationStandard: 'NIST SP 800-88 Rev. 1 Clear',
        reason: 'Customer authorized complete data erasure prior to reuse',
        isSimulation: true,
        confirmAuthorization: true,
      },
    });
    assert(createJobRes.status === 201, 'Admin created NIST SP 800-88 sanitization job');
    testJobId = createJobRes.data?.data?.jobId;
    assert(Boolean(testJobId?.startsWith('SAN-')), `Sanitization Job ID assigned: ${testJobId}`);

    // Verify Device status transitioned to SANITIZATION_PENDING
    const updatedDevice = await Device.findById(testDeviceId);
    assert(updatedDevice?.status === 'SANITIZATION_PENDING', 'Device status transitioned to SANITIZATION_PENDING');

    // 7. Agent polls for pending jobs
    const getJobsRes = await request('/agent/jobs', {
      headers: {
        'x-agent-id': agentId,
        'x-agent-key': agentApiKey,
      },
    });
    assert(getJobsRes.status === 200, 'Agent retrieved pending job queue');
    const matchedJob = getJobsRes.data?.data?.find((j: any) => j.jobId === testJobId);
    assert(Boolean(matchedJob), 'Pending job found in agent polling response');

    // 8. Agent claims the sanitization job
    const claimRes = await request(`/agent/jobs/${testJobId}/claim`, {
      method: 'POST',
      headers: {
        'x-agent-id': agentId,
        'x-agent-key': agentApiKey,
      },
    });
    assert(claimRes.status === 200, 'Agent successfully claimed sanitization job');
    assert(claimRes.data?.data?.status === 'READY_TO_START', 'Job transitioned to READY_TO_START');

    // 9. Agent streams execution progress event
    const eventRes = await request(`/agent/jobs/${testJobId}/events`, {
      method: 'POST',
      headers: {
        'x-agent-id': agentId,
        'x-agent-key': agentApiKey,
      },
      body: {
        status: 'RUNNING',
        progressPercent: 50,
        logs: [
          { level: 'INFO', message: 'Stage 1/4: Volume unmount confirmed. Direct sector lock acquired.' },
          { level: 'INFO', message: 'Stage 2/4: Sector overwrite 50% complete.' },
        ],
      },
    });
    assert(eventRes.status === 200, 'Agent posted RUNNING progress and streaming logs');
    assert(eventRes.data?.data?.progressPercent === 50, 'Job progress recorded at 50%');

    // 10. Agent reports final execution result & cryptographic verification proof
    const resultRes = await request(`/agent/jobs/${testJobId}/results`, {
      method: 'POST',
      headers: {
        'x-agent-id': agentId,
        'x-agent-key': agentApiKey,
      },
      body: {
        status: 'VERIFIED_SUCCESSFUL',
        verificationResult: {
          verified: true,
          methodUsed: 'NIST_SP_800_88_CLEAR',
          entropyScore: 0.0002,
          sectorsSampled: 1024,
          sectorsVerifiedClean: 1024,
          sha256VerificationHash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
          notes: 'Automated 1024-sector LBA sampling verified zero residual magnetic flux.',
        },
        logs: [
          { level: 'SUCCESS', message: 'Sanitization and SHA-256 verification completed successfully.' },
        ],
      },
    });
    assert(resultRes.status === 200, 'Agent finalized job with VERIFIED_SUCCESSFUL result');
    const certId = resultRes.data?.data?.verificationResult?.certificateId;
    assert(Boolean(certId?.startsWith('CERT-')), `Cryptographic certificate generated: ${certId}`);

    // 11. Cross-model integrity: Device status updated to SANITIZED
    const sanitizedDevice = await Device.findById(testDeviceId);
    assert(sanitizedDevice?.status === 'SANITIZED', 'Device status automatically updated to SANITIZED in ReTech inventory');

    // 12. Customer checks sanitization certificate for their device
    const customerSanRes = await request(`/customer/devices/${testDeviceId}/sanitization`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(customerSanRes.status === 200, 'Customer retrieved transparent sanitization record');
    assert(customerSanRes.data?.data?.hasSanitizationRecord === true, 'Customer confirmed hasSanitizationRecord = true');
    assert(customerSanRes.data?.data?.verification?.certificateId === certId, 'Customer certificate ID matches cryptographic proof');

    // 13. Security boundary: Customer blocked from admin sanitization endpoints
    const customerAdminBlockRes = await request('/admin/sanitization/jobs', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(customerAdminBlockRes.status === 403, 'Customer role strictly blocked from Admin sanitization jobs (403)');

    const customerPairingBlockRes = await request('/admin/sanitization/agents/pairing-code', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(customerPairingBlockRes.status === 403, 'Customer role strictly blocked from generating pairing codes (403)');

    // 14. Admin revokes agent access
    const revokeRes = await request(`/admin/sanitization/agents/${agentId}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(revokeRes.status === 200, 'Admin successfully revoked agent credentials');

    // 15. Revoked agent blocked from communicating
    const revokedPingRes = await request('/agent/heartbeat', {
      method: 'POST',
      headers: {
        'x-agent-id': agentId,
        'x-agent-key': agentApiKey,
      },
    });
    assert(revokedPingRes.status === 403, 'Revoked agent strictly blocked from further API calls (403)');

  } catch (err: any) {
    console.error('\n  \x1b[31mError during test execution:\x1b[0m', err.message);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    console.log('\n======================================================');
    console.log(`  PHASE 3 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
