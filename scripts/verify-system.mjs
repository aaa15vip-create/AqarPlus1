import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import WebSocket from 'ws';

const TMP_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'aqarplus-verify-'));
const TEST_PORT = 3456;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

process.env.NODE_ENV = 'production';
process.env.AQARPLUS_NO_AUTO_START = '1';
process.env.AQARPLUS_USER_DATA_DIR = TMP_DATA_DIR;
process.env.AQARPLUS_DIST_DIR = path.resolve(process.cwd(), 'dist');

async function startEmbedded(port) {
  const entry = path.resolve(process.cwd(), 'dist-server', 'server.mjs');
  const mod = await import(`${pathToFileURL(entry).href}?t=${Date.now()}`);
  return mod.startServer(port);
}

async function runTests() {
  console.log(`\n[Verify] Using isolated SQLite WAL directory: ${TMP_DATA_DIR}`);

  let started = await startEmbedded(TEST_PORT);
  try {
    // 1. Health check & SQLite WAL confirmation
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.ok, true);
    assert.equal(healthJson.sqlite.journalMode, 'wal');
    console.log('✓ 1. /api/health confirms SQLite WAL mode is active');

    // 2. Unauthenticated & spoofed x-user-id header must be rejected with 401
    const unauthRes = await fetch(`${BASE_URL}/api/state`);
    assert.equal(unauthRes.status, 401);
    const spoofRes = await fetch(`${BASE_URL}/api/state`, {
      headers: { 'x-user-id': 'usr-sys_owner' },
    });
    assert.equal(spoofRes.status, 401);
    console.log('✓ 2. Unauthenticated requests and spoofed x-user-id headers rejected (HTTP 401)');

    // 3. Invalid password rejected, valid login issues signed token
    const badLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'owner.sys@aqarplus.sa', password: 'WrongPassword!' }),
    });
    assert.equal(badLogin.status, 401);

    const goodLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'owner.sys@aqarplus.sa', password: 'Aqar@2026' }),
    });
    assert.equal(goodLogin.status, 200);
    const ownerAuth = await goodLogin.json();
    assert.ok(ownerAuth.token);
    assert.equal(ownerAuth.user.role, 'sys_owner');
    const ownerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerAuth.token}`,
    };
    console.log('✓ 3. Password login verified via scrypt + HMAC-SHA256 session token');

    // 4. Restricted role isolation & RBAC enforcement
    const techLoginRes = await fetch(`${BASE_URL}/api/auth/login-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr-tech', pin: '1234' }),
    });
    assert.equal(techLoginRes.status, 200);
    const techAuth = await techLoginRes.json();
    const techStateRes = await fetch(`${BASE_URL}/api/state`, {
      headers: { Authorization: `Bearer ${techAuth.token}` },
    });
    const techStateJson = await techStateRes.json();
    assert.equal(techStateJson.state.auditLogs.length, 0, 'Technician must not see auditLogs');
    assert.equal(techStateJson.state.backups.length, 0, 'Technician must not see backups');

    const forbiddenToggle = await fetch(`${BASE_URL}/api/permissions/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${techAuth.token}`,
      },
      body: JSON.stringify({ role: 'technician', permission: 'manage_users' }),
    });
    assert.equal(forbiddenToggle.status, 400, 'Technician must be blocked from toggling permissions');
    console.log('✓ 4. RBAC & data isolation verified (audit/backups hidden, unauthorized actions blocked)');

    // 5. Idempotent offline sync/batch + duplicate detection + conflict detection
    const contractId = ownerAuth.state.contracts[0]?.id;
    assert.ok(contractId, 'Seed must contain at least 1 contract');
    const opId = `op-verify-${Date.now()}`;
    const batch1 = await fetch(`${BASE_URL}/api/sync/batch`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        operations: [
          {
            id: 'q-1',
            operationId: opId,
            idempotencyKey: opId,
            method: 'POST',
            endpoint: '/api/payments',
            body: {
              contractId,
              amount: 750,
              paymentMethod: 'تحويل بنكي',
              paymentType: 'إيجار',
              notes: 'دفعة اختبار المزامنة',
            },
            queuedAt: new Date().toISOString(),
          },
        ],
      }),
    });
    assert.equal(batch1.status, 200);
    const batch1Json = await batch1.json();
    assert.equal(batch1Json.uploaded, 1);

    // Replay same operationId -> must deduplicate cleanly via SQLite operations_log!
    const batchDup = await fetch(`${BASE_URL}/api/sync/batch`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        operations: [
          {
            id: 'q-1',
            operationId: opId,
            idempotencyKey: opId,
            method: 'POST',
            endpoint: '/api/payments',
            body: {
              contractId,
              amount: 750,
              paymentMethod: 'تحويل بنكي',
              paymentType: 'إيجار',
            },
            queuedAt: new Date().toISOString(),
          },
        ],
      }),
    });
    const batchDupJson = await batchDup.json();
    assert.equal(batchDupJson.uploaded, 0);
    assert.equal(batchDupJson.skippedDuplicates, 1);

    // Trigger revision increment then send stale baseRevision=0 to verify conflict logging
    const targetTenantId = ownerAuth.state.tenants[0]?.id;
    await fetch(`${BASE_URL}/api/tenants/${targetTenantId}`, {
      method: 'PATCH',
      headers: ownerHeaders,
      body: JSON.stringify({ notes: 'Server revision bump 1' }),
    });
    await fetch(`${BASE_URL}/api/tenants/${targetTenantId}`, {
      method: 'PATCH',
      headers: ownerHeaders,
      body: JSON.stringify({ notes: 'Server revision bump 2' }),
    });
    const conflictBatch = await fetch(`${BASE_URL}/api/sync/batch`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        operations: [
          {
            id: 'q-conf',
            operationId: `op-conf-${Date.now()}`,
            method: 'PATCH',
            endpoint: `/api/tenants/${targetTenantId}`,
            entityType: 'tenants',
            entityId: targetTenantId,
            baseRevision: 0,
            body: { notes: 'Stale client edit' },
            queuedAt: new Date().toISOString(),
          },
        ],
      }),
    });
    const conflictJson = await conflictBatch.json();
    assert.ok(conflictJson.conflictsDetected >= 1, 'Conflict detection must trigger on stale baseRevision');
    console.log('✓ 5. Offline sync/batch deduplication (operations_log) & conflict detection verified');

    // 6. AES-256-GCM encrypted backup + preview + restore
    const bkpRes = await fetch(`${BASE_URL}/api/backups`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        label: 'Encrypted Verify Backup',
        encryptPassword: 'BackupSecret#99',
      }),
    });
    assert.equal(bkpRes.status, 201);
    const bkpJson = await bkpRes.json();
    assert.equal(bkpJson.backup.encrypted, true);

    const previewNoPass = await fetch(`${BASE_URL}/api/backups/${bkpJson.backup.id}/preview`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({}),
    });
    const previewNoPassJson = await previewNoPass.json();
    assert.equal(previewNoPassJson.requiresPassword, true);

    const previewWrongPass = await fetch(`${BASE_URL}/api/backups/${bkpJson.backup.id}/preview`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ password: 'WrongBackupPassword' }),
    });
    const previewWrongJson = await previewWrongPass.json();
    assert.equal(previewWrongJson.requiresPassword, true);
    assert.ok(previewWrongJson.decryptionError);

    const previewGood = await fetch(`${BASE_URL}/api/backups/${bkpJson.backup.id}/preview`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ password: 'BackupSecret#99' }),
    });
    const previewGoodJson = await previewGood.json();
    assert.equal(previewGoodJson.exists, true);
    assert.ok(previewGoodJson.propertiesCount >= 1);
    assert.ok(previewGoodJson.diff);

    const restoreRes = await fetch(`${BASE_URL}/api/backups/${bkpJson.backup.id}/restore`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ mode: 'merge', password: 'BackupSecret#99' }),
    });
    assert.equal(restoreRes.status, 200);
    console.log('✓ 6. AES-256-GCM encrypted backup, password gate, diff preview & merge restore verified');

    // 7. WebSocket auth check
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${TEST_PORT}/ws`);
      let seenAuthRequired = false;
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'session:identify', token: 'invalid.token' }));
      });
      ws.on('message', (raw) => {
        const msg = JSON.parse(String(raw));
        if (!seenAuthRequired) {
          assert.equal(msg.type, 'auth:required');
          seenAuthRequired = true;
          ws.send(JSON.stringify({ type: 'session:identify', token: ownerAuth.token, deviceName: 'Test Runner' }));
          return;
        }
        if (msg.type === 'presence:update') {
          return;
        }
        if (msg.type === 'state:init') {
          clearTimeout(timer);
          assert.ok(msg.state.properties.length >= 1);
          ws.close();
          resolve();
          return;
        }
        clearTimeout(timer);
        reject(new Error(`Unexpected WebSocket message: ${msg.type}`));
      });
      ws.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
    console.log('✓ 7. WebSocket rejects invalid tokens and hydrates authenticated session');

    // 8. Credential update + persistence across server restart
    const credRes = await fetch(`${BASE_URL}/api/auth/credentials`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ newPin: '5678' }),
    });
    assert.equal(credRes.status, 200);

    // Close server and restart against same SQLite DB directory
    await new Promise((r) => started.server.close(r));
    started = await startEmbedded(TEST_PORT + 1);
    const BASE_URL_2 = `http://127.0.0.1:${TEST_PORT + 1}`;

    const oldPinRes = await fetch(`${BASE_URL_2}/api/auth/login-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr-sys', pin: '1234' }),
    });
    assert.equal(oldPinRes.status, 401, 'Old PIN must fail after restart');

    const newPinRes = await fetch(`${BASE_URL_2}/api/auth/login-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr-sys', pin: '5678' }),
    });
    assert.equal(newPinRes.status, 200, 'Rotated PIN must persist in SQLite across restarts');
    const persistedJson = await newPinRes.json();
    assert.ok(persistedJson.state.payments.some((p) => p.amount === 750 && p.notes?.includes('اختبار المزامنة')));
    console.log('✓ 8. SQLite WAL persistence verified across server restart (rotated PIN & receipts preserved)');

    console.log('\n✅ ALL 8 END-TO-END VERIFICATION CHECKS PASSED!\n');
  } finally {
    await new Promise((r) => started.server.close(r));
    fs.rmSync(TMP_DATA_DIR, { recursive: true, force: true });
  }
}

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
