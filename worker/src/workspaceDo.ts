import { DurableObject } from 'cloudflare:workers';
import { createInitialSeed } from '../../server/seed';
import {
  AqarDatabaseState,
  BackupCollectionDiff,
  BackupPreviewResult,
  BackupSnapshot,
  Lead,
  Payment,
  PermissionKey,
  RoleKey,
  StaffUser,
  SyncConflictRecord,
} from '../../src/types/aqar';
import {
  decryptBackupWeb,
  encryptBackupWeb,
  hashSecretWeb,
  signTokenWeb,
  verifySecretWeb,
  verifyTokenWeb,
  WebEncryptedEnvelope,
} from './cryptoWeb';

export interface WorkerEnv {
  ASSETS: Fetcher;
  WORKSPACE_DO: DurableObjectNamespace<AqarWorkspaceDO>;
  AQAR_SESSION_SECRET?: string;
  AQAR_DEMO_LOGIN?: string;
  GEMINI_API_KEY?: string;
}

const SESSION_COOKIE_NAME = 'aqar_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface WsAttachment {
  sessionId: string;
  userId: string;
  authenticated: boolean;
  deviceName: string;
  connectedAt: string;
}

interface AuthedActor {
  userId: string;
  role: RoleKey;
  sessionId: string;
  rawToken: string;
  deviceName: string;
}

const PUBLIC_PATHS = new Set([
  '/api/health',
  '/api/auth/session',
  '/api/auth/login',
  '/api/auth/login-pin',
  '/api/auth/logout',
  '/api/public/prospect-context',
  '/api/public/leads',
]);

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(extraHeaders || {}),
    },
  });
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, '').slice(-9);
}

export class AqarWorkspaceDO extends DurableObject<WorkerEnv> {
  private stateCache: AqarDatabaseState | null = null;
  private initialized = false;
  private sessionSecretCache: string | null = null;

  constructor(ctx: DurableObjectState, env: WorkerEnv) {
    super(ctx, env);
    this.initSchema();
  }

  private initSchema() {
    const sql = this.ctx.storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS kv_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS state_snapshots (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sync_revision INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        state_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS user_credentials (
        user_id TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        pin_hash TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        revoked INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS operations_log (
        operation_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        method TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        status TEXT NOT NULL,
        response_json TEXT,
        processed_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS backups_store (
        id TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private async ensureBootstrapped(): Promise<AqarDatabaseState> {
    if (this.initialized && this.stateCache) return this.stateCache;

    const sql = this.ctx.storage.sql;
    const rows = sql.exec<{ state_json: string }>('SELECT state_json FROM state_snapshots WHERE id = 1').toArray();
    if (rows.length > 0) {
      this.stateCache = JSON.parse(rows[0].state_json) as AqarDatabaseState;
    } else {
      const seed = createInitialSeed();
      if (!seed.entityRevisions) seed.entityRevisions = {};
      this.stateCache = seed;
      sql.exec(
        'INSERT OR REPLACE INTO state_snapshots (id, sync_revision, updated_at, state_json) VALUES (1, ?, ?, ?)',
        seed.syncRevision || 1,
        seed.lastUpdatedAt,
        JSON.stringify(seed)
      );
    }

    // Seed initial credentials for any user without rows in user_credentials
    const existingCreds = new Set(
      sql.exec<{ user_id: string }>('SELECT user_id FROM user_credentials').toArray().map((r) => r.user_id)
    );
    const defaultPwHash = await hashSecretWeb('Aqar@2026');
    const defaultPinHash = await hashSecretWeb('1234');
    const now = new Date().toISOString();
    for (const user of this.stateCache.users) {
      if (!existingCreds.has(user.id)) {
        sql.exec(
          'INSERT INTO user_credentials (user_id, password_hash, pin_hash, updated_at) VALUES (?, ?, ?, ?)',
          user.id,
          defaultPwHash,
          defaultPinHash,
          now
        );
      }
    }

    // Ensure persistent session HMAC secret
    if (this.env.AQAR_SESSION_SECRET) {
      this.sessionSecretCache = this.env.AQAR_SESSION_SECRET;
    } else {
      const secretRow = sql.exec<{ value: string }>("SELECT value FROM kv_meta WHERE key = 'session_secret'").toArray();
      if (secretRow.length > 0) {
        this.sessionSecretCache = secretRow[0].value;
      } else {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        const hex = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        sql.exec("INSERT INTO kv_meta (key, value) VALUES ('session_secret', ?)", hex);
        this.sessionSecretCache = hex;
      }
    }

    this.initialized = true;
    return this.stateCache;
  }

  private persistState(state: AqarDatabaseState) {
    state.lastUpdatedAt = new Date().toISOString();
    state.syncRevision = (state.syncRevision || 1) + 1;
    this.stateCache = state;
    this.ctx.storage.sql.exec(
      'INSERT OR REPLACE INTO state_snapshots (id, sync_revision, updated_at, state_json) VALUES (1, ?, ?, ?)',
      state.syncRevision,
      state.lastUpdatedAt,
      JSON.stringify(state)
    );
  }

  private hasPermission(state: AqarDatabaseState, userId: string, perm: PermissionKey): boolean {
    const user = state.users.find((u) => u.id === userId && u.active);
    if (!user) return false;
    if (user.role === 'sys_owner') return true;
    return (state.rolePermissions[user.role] || []).includes(perm);
  }

  private assertPermission(state: AqarDatabaseState, userId: string, perm: PermissionKey) {
    if (!this.hasPermission(state, userId, perm)) {
      throw new Error('ليست لديك الصلاحية اللازمة لتنفيذ هذا الإجراء');
    }
  }

  private bumpRevision(state: AqarDatabaseState, entityType: string, entityId: string) {
    if (!state.entityRevisions) state.entityRevisions = {};
    const key = `${entityType}:${entityId}`;
    state.entityRevisions[key] = (state.entityRevisions[key] || 0) + 1;
  }

  private appendAudit(
    state: AqarDatabaseState,
    userId: string,
    action: string,
    entityType: AqarDatabaseState['auditLogs'][number]['entityType'],
    entityId: string,
    summary: string,
    deviceName = 'Cloudflare Edge'
  ) {
    const actor = state.users.find((u) => u.id === userId);
    state.auditLogs.unshift({
      id: uid('aud'),
      userId,
      userName: actor?.nameAr || 'مستخدم',
      userRole: actor?.roleLabelAr || '',
      deviceName,
      action,
      entityType,
      entityId,
      summary,
      createdAt: new Date().toISOString(),
    });
    if (state.auditLogs.length > 500) {
      state.auditLogs.length = 500;
    }
  }

  private getStateForUser(state: AqarDatabaseState, userId: string): AqarDatabaseState {
    const user = state.users.find((u) => u.id === userId && u.active);
    if (!user) {
      throw new Error('المستخدم غير موجود أو تم تعطيل حسابه');
    }
    const clone = JSON.parse(JSON.stringify(state)) as AqarDatabaseState;
    const perms = new Set(clone.rolePermissions[user.role] || []);

    if (user.role !== 'sys_owner' && !perms.has('view_audit')) {
      clone.auditLogs = [];
    }
    if (user.role !== 'sys_owner' && !perms.has('backup_restore')) {
      clone.backups = [];
    }
    if (user.role !== 'sys_owner' && !perms.has('manage_users')) {
      clone.users = clone.users.map((u) =>
        u.id === user.id
          ? u
          : {
              ...u,
              email: '',
              phone: '',
            }
      );
    }

    if (user.role === 'owner' && user.ownerId) {
      const ownerId = user.ownerId;
      clone.properties = clone.properties.filter((p) => p.ownerShares.some((s) => s.ownerId === ownerId));
      const propIds = new Set(clone.properties.map((p) => p.id));
      clone.units = clone.units.filter((u) => propIds.has(u.propertyId));
      clone.contracts = clone.contracts.filter((c) => propIds.has(c.propertyId));
      const contractIds = new Set(clone.contracts.map((c) => c.id));
      const tenantIds = new Set(clone.contracts.map((c) => c.tenantId));
      clone.tenants = clone.tenants.filter((t) => tenantIds.has(t.id));
      clone.installments = clone.installments.filter((i) => contractIds.has(i.contractId));
      clone.payments = clone.payments.filter((p) => propIds.has(p.propertyId));
      clone.expenses = clone.expenses.filter((e) => propIds.has(e.propertyId));
      clone.tickets = clone.tickets.filter((t) => propIds.has(t.propertyId));
      clone.documents = clone.documents.filter(
        (d) =>
          (d.relatedType === 'عقار' && propIds.has(d.relatedId)) ||
          (d.relatedType === 'عقد' && contractIds.has(d.relatedId))
      );
      clone.leads = [];
      clone.auditLogs = [];
      clone.backups = [];
    } else if (user.allowedPropertyIds && user.allowedPropertyIds.length > 0 && user.role !== 'sys_owner' && user.role !== 'gm') {
      const allowed = new Set(user.allowedPropertyIds);
      clone.properties = clone.properties.filter((p) => allowed.has(p.id));
      clone.units = clone.units.filter((u) => allowed.has(u.propertyId));
      clone.contracts = clone.contracts.filter((c) => allowed.has(c.propertyId));
      const contractIds = new Set(clone.contracts.map((c) => c.id));
      clone.installments = clone.installments.filter((i) => contractIds.has(i.contractId));
      clone.payments = clone.payments.filter((p) => allowed.has(p.propertyId));
      clone.expenses = clone.expenses.filter((e) => allowed.has(e.propertyId));
      clone.tickets = clone.tickets.filter((t) => allowed.has(t.propertyId));
      clone.leads = clone.leads.filter((l) => !l.propertyId || allowed.has(l.propertyId));
    }

    return clone;
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      return authHeader.slice(7).trim();
    }
    const cookies = parseCookies(req.headers.get('cookie'));
    return cookies[SESSION_COOKIE_NAME] || null;
  }

  private async resolveActor(req: Request, state: AqarDatabaseState, overrideToken?: string): Promise<AuthedActor | null> {
    const rawToken = overrideToken || this.extractToken(req);
    if (!rawToken || !this.sessionSecretCache) return null;
    const claims = await verifyTokenWeb(rawToken, this.sessionSecretCache);
    if (!claims) return null;

    const sessionRow = this.ctx.storage.sql
      .exec<{ user_id: string; expires_at: string; revoked: number }>(
        'SELECT user_id, expires_at, revoked FROM sessions WHERE token_id = ?',
        claims.sid
      )
      .toArray()[0];

    if (!sessionRow || sessionRow.revoked !== 0 || sessionRow.user_id !== claims.uid) {
      return null;
    }
    if (new Date(sessionRow.expires_at).getTime() <= Date.now()) {
      return null;
    }

    const user = state.users.find((u) => u.id === claims.uid && u.active);
    if (!user) return null;

    const rawDevice = req.headers.get('x-device-name');
    let deviceName = claims.deviceName || 'Cloudflare Web';
    if (rawDevice) {
      try {
        deviceName = decodeURIComponent(rawDevice);
      } catch {
        deviceName = rawDevice;
      }
    }

    return {
      userId: user.id,
      role: user.role,
      sessionId: claims.sid,
      rawToken,
      deviceName,
    };
  }

  private async issueSession(user: StaffUser, deviceName: string): Promise<{ token: string; cookieHeader: string }> {
    const now = Date.now();
    const exp = now + SESSION_TTL_MS;
    const expiresAt = new Date(exp).toISOString();
    const sid = `ses-${crypto.randomUUID().slice(0, 12)}`;
    const token = await signTokenWeb(
      { sid, uid: user.id, role: user.role, deviceName, iat: now, exp },
      this.sessionSecretCache!
    );
    this.ctx.storage.sql.exec(
      'INSERT INTO sessions (token_id, user_id, device_name, created_at, expires_at, revoked) VALUES (?, ?, ?, ?, ?, 0)',
      sid,
      user.id,
      deviceName,
      new Date(now).toISOString(),
      expiresAt
    );
    const cookieHeader = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
    return { token, cookieHeader };
  }

  private getPresenceList(state: AqarDatabaseState) {
    const out: Array<{
      sessionId: string;
      userId: string;
      nameAr: string;
      roleLabelAr: string;
      deviceName: string;
      connectedAt: string;
    }> = [];
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment() as WsAttachment | null;
      if (!meta || !meta.authenticated) continue;
      const u = state.users.find((x) => x.id === meta.userId);
      if (u) {
        out.push({
          sessionId: meta.sessionId,
          userId: u.id,
          nameAr: u.nameAr,
          roleLabelAr: u.roleLabelAr,
          deviceName: meta.deviceName || u.deviceName,
          connectedAt: meta.connectedAt,
        });
      }
    }
    return out;
  }

  private broadcastStateChange(state: AqarDatabaseState, actorUserId: string, summary: string) {
    const presence = this.getPresenceList(state);
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment() as WsAttachment | null;
      if (!meta || !meta.authenticated) continue;
      try {
        ws.send(
          JSON.stringify({
            type: 'state:updated',
            actorUserId,
            summary,
            presence,
            state: this.getStateForUser(state, meta.userId),
          })
        );
      } catch {
        // ignore broken ws socket
      }
    }
  }

  private async handleMutation(
    state: AqarDatabaseState,
    actor: AuthedActor,
    method: string,
    pathname: string,
    body: Record<string, any>
  ): Promise<unknown> {
    const now = new Date().toISOString();
    const { userId, deviceName } = actor;

    if (method === 'PATCH' && pathname === '/api/settings') {
      state.settings = { ...state.settings, ...body };
      this.bumpRevision(state, 'settings', 'company');
      this.appendAudit(state, userId, 'تحديث الإعدادات', 'إعدادات', 'company', 'تحديث إعدادات المنشأة', deviceName);
      this.persistState(state);
      return { settings: state.settings, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/properties') {
      this.assertPermission(state, userId, 'manage_properties');
      const prop = {
        id: uid('prop'),
        code: String(body.code || `PR-${state.properties.length + 101}`),
        nameAr: String(body.nameAr || 'عقار جديد'),
        nameEn: String(body.nameEn || body.nameAr || 'New Property'),
        city: String(body.city || state.settings.city || 'الرياض'),
        district: String(body.district || 'العليا'),
        street: String(body.street || ''),
        nationalAddress: String(body.nationalAddress || ''),
        type: body.type || 'سكني',
        deedNumber: String(body.deedNumber || ''),
        status: body.status || 'نشط',
        buildingsCount: Number(body.buildingsCount || 1),
        floorsCount: Number(body.floorsCount || 1),
        managementFeePercent: Number(body.managementFeePercent ?? state.settings.defaultManagementFeePercent ?? 5),
        ownershipMode: body.ownershipMode || 'إدارة للغير',
        ownerShares: Array.isArray(body.ownerShares)
          ? body.ownerShares
          : [{ ownerId: state.owners[0]?.id || 'own-1', sharePercent: 100 }],
        electricityMeterMain: String(body.electricityMeterMain || ''),
        waterMeterMain: String(body.waterMeterMain || ''),
        caretakerName: String(body.caretakerName || ''),
        caretakerPhone: String(body.caretakerPhone || ''),
        createdAt: now,
      };
      state.properties.unshift(prop);
      this.bumpRevision(state, 'properties', prop.id);
      this.appendAudit(state, userId, 'إضافة عقار', 'عقار', prop.id, `إضافة العقار ${prop.nameAr}`, deviceName);
      this.persistState(state);
      return { property: prop, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/units') {
      this.assertPermission(state, userId, 'manage_properties');
      const monthly = Number(body.suggestedMonthlyRent || Math.round(Number(body.suggestedAnnualRent || 30000) / 12));
      const unit = {
        id: uid('unit'),
        propertyId: String(body.propertyId || state.properties[0]?.id || ''),
        buildingName: String(body.buildingName || 'المبنى الرئيسي'),
        floor: Number(body.floor || 1),
        unitNumber: String(body.unitNumber || `${state.units.length + 101}`),
        unitType: body.unitType || 'شقة',
        areaSqm: Number(body.areaSqm || 120),
        rooms: Number(body.rooms || 3),
        bathrooms: Number(body.bathrooms || 2),
        furnished: Boolean(body.furnished),
        acCount: Number(body.acCount || 2),
        electricityMeter: String(body.electricityMeter || ''),
        waterMeter: String(body.waterMeter || ''),
        keyCount: Number(body.keyCount || 2),
        acRemoteCount: Number(body.acRemoteCount || 2),
        suggestedMonthlyRent: monthly,
        suggestedAnnualRent: Number(body.suggestedAnnualRent || monthly * 12),
        officeFee: Number(body.officeFee || 0),
        status: body.status || 'شاغرة',
      };
      state.units.push(unit);
      this.bumpRevision(state, 'units', unit.id);
      this.persistState(state);
      return { unit, state: this.getStateForUser(state, userId) };
    }

    const unitStatusMatch = /^\/api\/units\/([^/]+)\/status$/.exec(pathname);
    if (method === 'PATCH' && unitStatusMatch) {
      this.assertPermission(state, userId, 'manage_properties');
      const unit = state.units.find((u) => u.id === unitStatusMatch[1]);
      if (!unit) throw new Error('الوحدة غير موجودة');
      unit.status = body.status;
      this.bumpRevision(state, 'units', unit.id);
      this.persistState(state);
      return { unit, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/tenants') {
      this.assertPermission(state, userId, 'manage_tenants');
      const tenant = {
        id: uid('ten'),
        nameAr: String(body.nameAr || 'مستأجر جديد'),
        nameEn: String(body.nameEn || body.nameAr || 'Tenant'),
        nationalIdOrIqama: String(body.nationalIdOrIqama || body.nationalId || ''),
        nationality: String(body.nationality || 'سعودي'),
        phone: String(body.phone || ''),
        email: String(body.email || ''),
        tenantType: body.tenantType || 'فرد',
        classification: body.classification || 'نشط',
        rating: Number(body.rating ?? 5),
        notes: String(body.notes || ''),
        createdAt: now,
      };
      state.tenants.unshift(tenant);
      this.bumpRevision(state, 'tenants', tenant.id);
      this.persistState(state);
      return { tenant, state: this.getStateForUser(state, userId) };
    }

    const tenantMatch = /^\/api\/tenants\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && tenantMatch) {
      this.assertPermission(state, userId, 'manage_tenants');
      const tenant = state.tenants.find((t) => t.id === tenantMatch[1]);
      if (!tenant) throw new Error('المستأجر غير موجود');
      Object.assign(tenant, body);
      this.bumpRevision(state, 'tenants', tenant.id);
      this.persistState(state);
      return { tenant, state: this.getStateForUser(state, userId) };
    }
    if (method === 'DELETE' && tenantMatch) {
      this.assertPermission(state, userId, 'manage_tenants');
      state.tenants = state.tenants.filter((t) => t.id !== tenantMatch[1]);
      this.bumpRevision(state, 'tenants', tenantMatch[1]);
      this.persistState(state);
      return { ok: true, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/contracts') {
      this.assertPermission(state, userId, 'manage_contracts');
      const unitId = String(body.unitId || '');
      const contract = {
        id: uid('con'),
        internalNumber: String(body.internalNumber || `CNT-${state.contracts.length + 1001}`),
        ejarNumber: String(body.ejarNumber || ''),
        ejarStatus: body.ejarStatus || 'غير موثق',
        lifecycleStatus: 'نشط' as const,
        propertyId: String(body.propertyId || state.properties[0]?.id || ''),
        unitId,
        tenantId: String(body.tenantId || state.tenants[0]?.id || ''),
        startDate: String(body.startDate || now.slice(0, 10)),
        endDate: String(body.endDate || now.slice(0, 10)),
        annualRent: Number(body.annualRent || 30000),
        paymentFrequency: body.paymentFrequency || 'شهري',
        installmentsCount: Number(body.installmentsCount || 12),
        securityDeposit: Number(body.securityDeposit || 2000),
        officeFee: Number(body.officeFee || 0),
        managementCommissionPercent: Number(body.managementCommissionPercent ?? state.settings.defaultManagementFeePercent ?? 5),
        includedServices: String(body.includedServices || ''),
        version: 1,
        createdBy: userId,
        createdAt: now,
      };
      state.contracts.unshift(contract);
      const unit = state.units.find((u) => u.id === unitId);
      if (unit) {
        unit.status = 'مؤجرة';
        this.bumpRevision(state, 'units', unit.id);
      }
      this.bumpRevision(state, 'contracts', contract.id);
      this.persistState(state);
      return { contract, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/payments') {
      this.assertPermission(state, userId, 'collect_payments');
      const amount = Number(body.amount || 0);
      if (amount <= 0) throw new Error('مبلغ التحصيل يجب أن يكون أكبر من صفر');
      const idempotencyKey = String(body.idempotencyKey || uid('idem'));
      const existing = state.payments.find((p) => p.idempotencyKey === idempotencyKey);
      if (existing) {
        return { payment: existing, duplicate: true, state: this.getStateForUser(state, userId) };
      }
      const contract = state.contracts.find((c) => c.id === body.contractId);
      if (!contract) throw new Error('العقد غير موجود');
      state.counters.receipt += 1;
      const allocations: { installmentId: string; amount: number }[] = [];
      if ((body.paymentType || 'إيجار') === 'إيجار') {
        let rem = amount;
        const openInsts = state.installments
          .filter((i) => i.contractId === contract.id && i.remainingAmount > 0 && i.status !== 'ملغاة')
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        for (const inst of openInsts) {
          if (rem <= 0) break;
          const applied = Math.min(rem, inst.remainingAmount);
          inst.paidAmount = Math.round((inst.paidAmount + applied) * 100) / 100;
          inst.remainingAmount = Math.round((inst.amount - inst.paidAmount) * 100) / 100;
          inst.status = inst.remainingAmount === 0 ? 'مدفوعة بالكامل' : 'مدفوعة جزئياً';
          allocations.push({ installmentId: inst.id, amount: applied });
          rem = Math.round((rem - applied) * 100) / 100;
          this.bumpRevision(state, 'installments', inst.id);
        }
      }
      const payment: Payment = {
        id: uid('pay'),
        receiptNumber: `REC-${new Date().getFullYear()}-${String(state.counters.receipt).padStart(4, '0')}`,
        idempotencyKey,
        contractId: contract.id,
        unitId: contract.unitId,
        propertyId: contract.propertyId,
        tenantId: contract.tenantId,
        allocations,
        amount,
        currency: body.currency || 'SAR',
        paymentMethod: body.paymentMethod || 'تحويل بنكي',
        paymentType: body.paymentType || 'إيجار',
        referenceNumber: body.referenceNumber,
        receivedBy: userId,
        deviceName,
        status: 'معتمد',
        notes: body.notes,
        createdAt: now,
      };
      state.payments.unshift(payment);
      this.bumpRevision(state, 'payments', payment.id);
      this.appendAudit(state, userId, 'تحصيل دفعة', 'دفعة', payment.id, `سند ${payment.receiptNumber} بمبلغ ${amount}`, deviceName);
      this.persistState(state);
      return { payment, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/expenses') {
      this.assertPermission(state, userId, 'create_expense');
      state.counters.expense += 1;
      const expense = {
        id: uid('exp'),
        expenseNumber: `EXP-${String(state.counters.expense).padStart(4, '0')}`,
        date: String(body.date || now.slice(0, 10)),
        category: body.category || 'صيانة',
        propertyId: String(body.propertyId || state.properties[0]?.id || ''),
        unitId: body.unitId ? String(body.unitId) : undefined,
        vendorId: body.vendorId ? String(body.vendorId) : undefined,
        invoiceNumber: String(body.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`),
        amount: Number(body.amount || 0),
        currency: body.currency || 'SAR',
        paymentMethod: body.paymentMethod || 'تحويل بنكي',
        bearer: body.bearer || 'المالك',
        approvalStatus: 'بانتظار المشرف' as const,
        notes: body.notes,
        createdBy: userId,
        createdAt: now,
      };
      state.expenses.unshift(expense);
      this.bumpRevision(state, 'expenses', expense.id);
      this.persistState(state);
      return { expense, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/tickets') {
      this.assertPermission(state, userId, 'manage_maintenance');
      state.counters.ticket += 1;
      const ticket = {
        id: uid('tkt'),
        ticketNumber: `MNT-${String(state.counters.ticket).padStart(4, '0')}`,
        propertyId: String(body.propertyId || state.properties[0]?.id || ''),
        unitId: String(body.unitId || state.units[0]?.id || ''),
        source: body.source || 'المشرف',
        category: String(body.category || 'أخرى'),
        priority: body.priority || 'متوسط',
        title: String(body.title || 'بلاغ صيانة'),
        description: String(body.description || ''),
        estimatedCost: Number(body.estimatedCost || 0),
        actualCost: 0,
        status: 'جديد' as const,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      };
      state.tickets.unshift(ticket);
      this.bumpRevision(state, 'tickets', ticket.id);
      this.persistState(state);
      return { ticket, state: this.getStateForUser(state, userId) };
    }

    const tktMatch = /^\/api\/tickets\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && tktMatch) {
      const ticket = state.tickets.find((t) => t.id === tktMatch[1]);
      if (!ticket) throw new Error('بلاغ الصيانة غير موجود');
      Object.assign(ticket, body, { updatedAt: now });
      this.bumpRevision(state, 'tickets', ticket.id);
      this.persistState(state);
      return { ticket, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/tasks') {
      const task = {
        id: uid('tsk'),
        title: String(body.title || 'مهمة جديدة'),
        description: String(body.description || ''),
        type: String(body.type || 'متابعة'),
        priority: body.priority || 'متوسط',
        assignedTo: String(body.assignedTo || userId),
        createdBy: userId,
        dueDate: String(body.dueDate || now.slice(0, 10)),
        status: 'جديدة' as const,
        checklist: Array.isArray(body.checklist) ? body.checklist : [],
        comments: [],
        createdAt: now,
      };
      state.tasks.unshift(task);
      this.bumpRevision(state, 'tasks', task.id);
      this.persistState(state);
      return { task, state: this.getStateForUser(state, userId) };
    }

    const tskMatch = /^\/api\/tasks\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && tskMatch) {
      const task = state.tasks.find((t) => t.id === tskMatch[1]);
      if (!task) throw new Error('المهمة غير موجودة');
      Object.assign(task, body);
      this.bumpRevision(state, 'tasks', task.id);
      this.persistState(state);
      return { task, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/templates') {
      const template = {
        id: uid('tpl'),
        name: String(body.name || 'قالب جديد'),
        category: body.category || 'custom',
        channel: body.channel || 'whatsapp',
        language: body.language || 'ar',
        contentAr: String(body.contentAr || ''),
        contentEn: body.contentEn ? String(body.contentEn) : undefined,
        usageCount: 0,
        createdBy: userId,
        updatedAt: now,
      };
      state.communicationTemplates = [template, ...(state.communicationTemplates || [])];
      this.bumpRevision(state, 'communicationTemplates', template.id);
      this.persistState(state);
      return { template, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/notifications/read') {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isReadBy: n.isReadBy.includes(userId) ? n.isReadBy : [...n.isReadBy, userId],
      }));
      this.persistState(state);
      return { ok: true, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/permissions/toggle') {
      this.assertPermission(state, userId, 'manage_users');
      const role = body.role as RoleKey;
      const perm = body.permission as PermissionKey;
      const current = state.rolePermissions[role] || [];
      state.rolePermissions[role] = current.includes(perm)
        ? current.filter((p) => p !== perm)
        : [...current, perm];
      this.persistState(state);
      return { rolePermissions: state.rolePermissions, state: this.getStateForUser(state, userId) };
    }

    if (method === 'POST' && pathname === '/api/workspace/reset-fresh') {
      this.assertPermission(state, userId, 'backup_restore');
      state.properties = [];
      state.units = [];
      state.tenants = [];
      state.leads = [];
      state.contracts = [];
      state.installments = [];
      state.payments = [];
      state.expenses = [];
      state.tickets = [];
      state.tasks = [];
      state.documents = [];
      this.persistState(state);
      return { ok: true, state: this.getStateForUser(state, userId) };
    }

    throw new Error(`مسار غير مدعوم بعد في الخادم السحابي: ${method} ${pathname}`);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const state = await this.ensureBootstrapped();

    // 1. WebSocket Upgrade (Hibernation API)
    if (pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const actor = await this.resolveActor(request, state);
      const attachment: WsAttachment = {
        sessionId: actor?.sessionId || uid('ws'),
        userId: actor?.userId || '',
        authenticated: Boolean(actor),
        deviceName: actor?.deviceName || 'Web Terminal',
        connectedAt: new Date().toISOString(),
      };
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment(attachment);
      if (attachment.authenticated && attachment.userId) {
        server.send(
          JSON.stringify({
            type: 'state:init',
            state: this.getStateForUser(state, attachment.userId),
            presence: this.getPresenceList(state),
          })
        );
      }
      return new Response(null, { status: 101, webSocket: client });
    }

    // 2. Public endpoints & Auth endpoints
    if (pathname === '/api/health') {
      return jsonResponse({
        ok: true,
        runtime: 'cloudflare-workers-durable-objects',
        lastUpdatedAt: state.lastUpdatedAt,
        syncRevision: state.syncRevision || 1,
      });
    }

    if (pathname === '/api/auth/session' && request.method === 'GET') {
      const demoLoginEnabled = this.env.AQAR_DEMO_LOGIN !== 'false';
      const actor = await this.resolveActor(request, state);
      const companyBranding = {
        nameAr: state.settings.nameAr,
        nameEn: state.settings.nameEn,
        logoDataUrl: state.settings.logoDataUrl,
      };
      const loginProfiles = demoLoginEnabled
        ? state.users
            .filter((u) => u.active)
            .map((u) => ({
              id: u.id,
              nameAr: u.nameAr,
              nameEn: u.nameEn,
              role: u.role,
              roleLabelAr: u.roleLabelAr,
              roleLabelEn: u.roleLabelEn,
              email: u.email,
            }))
        : [];
      if (!actor) {
        return jsonResponse({ authenticated: false, demoLoginEnabled, loginProfiles, companyBranding });
      }
      const user = state.users.find((u) => u.id === actor.userId);
      return jsonResponse({
        authenticated: true,
        user,
        token: actor.rawToken,
        demoLoginEnabled,
        loginProfiles,
        companyBranding,
      });
    }

    if (pathname === '/api/auth/login' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const identifier = String(body.identifier || body.email || body.userId || '').trim().toLowerCase();
      const password = String(body.password || '');
      const phoneNeedle = normalizePhone(identifier);
      const user = state.users.find(
        (u) =>
          u.active &&
          (u.id.toLowerCase() === identifier ||
            u.email.toLowerCase() === identifier ||
            (phoneNeedle.length >= 6 && normalizePhone(u.phone) === phoneNeedle))
      );
      if (!user) return jsonResponse({ error: 'بيانات الدخول غير صحيحة' }, 401);
      const cred = this.ctx.storage.sql
        .exec<{ password_hash: string }>('SELECT password_hash FROM user_credentials WHERE user_id = ?', user.id)
        .toArray()[0];
      if (!cred || !(await verifySecretWeb(password, cred.password_hash))) {
        return jsonResponse({ error: 'بيانات الدخول غير صحيحة' }, 401);
      }
      const { token, cookieHeader } = await this.issueSession(user, String(body.deviceName || 'Web Terminal'));
      return jsonResponse(
        { authenticated: true, user, token, state: this.getStateForUser(state, user.id) },
        200,
        { 'Set-Cookie': cookieHeader }
      );
    }

    if (pathname === '/api/auth/login-pin' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const userId = String(body.userId || 'usr-sys_owner');
      const pin = String(body.pin || '').trim();
      const user = state.users.find((u) => u.id === userId && u.active);
      if (!user) return jsonResponse({ error: 'الحساب غير موجود' }, 401);
      const cred = this.ctx.storage.sql
        .exec<{ pin_hash: string }>('SELECT pin_hash FROM user_credentials WHERE user_id = ?', user.id)
        .toArray()[0];
      if (!cred || !(await verifySecretWeb(pin, cred.pin_hash))) {
        return jsonResponse({ error: 'رمز PIN غير صحيح' }, 401);
      }
      const { token, cookieHeader } = await this.issueSession(user, String(body.deviceName || 'Web Terminal'));
      return jsonResponse(
        { authenticated: true, user, token, state: this.getStateForUser(state, user.id) },
        200,
        { 'Set-Cookie': cookieHeader }
      );
    }

    if (pathname === '/api/auth/logout' && request.method === 'POST') {
      const token = this.extractToken(request);
      if (token && this.sessionSecretCache) {
        const claims = await verifyTokenWeb(token, this.sessionSecretCache);
        if (claims?.sid) {
          this.ctx.storage.sql.exec('UPDATE sessions SET revoked = 1 WHERE token_id = ?', claims.sid);
        }
      }
      return jsonResponse({ ok: true }, 200, {
        'Set-Cookie': `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      });
    }

    if (pathname === '/api/public/prospect-context' && request.method === 'GET') {
      return jsonResponse({
        companyNameAr: state.settings.nameAr,
        companyNameEn: state.settings.nameEn,
        properties: state.properties.map((p) => ({ id: p.id, nameAr: p.nameAr, city: p.city, district: p.district })),
        vacantUnits: state.units
          .filter((u) => u.status === 'شاغرة' || u.status === 'قيد التأجير')
          .map((u) => ({
            id: u.id,
            propertyId: u.propertyId,
            unitNumber: u.unitNumber,
            unitType: u.unitType,
            suggestedAnnualRent: u.suggestedAnnualRent,
            areaSqm: u.areaSqm,
            rooms: u.rooms,
          })),
      });
    }

    if (pathname === '/api/public/leads' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const lead: Lead = {
        id: uid('lead'),
        nameAr: String(body.nameAr || ''),
        phone: String(body.phone || ''),
        source: String(body.source || 'استبيان رابط إلكتروني'),
        propertyId: String(body.propertyId || state.properties[0]?.id || ''),
        unitId: String(body.unitId || state.units[0]?.id || ''),
        offeredRent: Number(body.offeredRent || 0),
        budgetMonthly: Math.round(Number(body.offeredRent || 0) / 12),
        viewingDate: new Date().toISOString().slice(0, 10),
        status: 'جديد',
        assignedTo: 'usr-agent1',
        notes: String(body.notes || ''),
        createdAt: new Date().toISOString(),
      };
      state.leads.unshift(lead);
      this.persistState(state);
      return jsonResponse({ lead, ok: true }, 201);
    }

    // 3. Protected API Guard
    const actor = !PUBLIC_PATHS.has(pathname) && !pathname.startsWith('/api/public/lead-decision/')
      ? await this.resolveActor(request, state)
      : null;

    if (!PUBLIC_PATHS.has(pathname) && !pathname.startsWith('/api/public/lead-decision/') && !actor) {
      return jsonResponse(
        { error: 'انتهت الجلسة أو لم يتم تسجيل الدخول — يرجى المصادقة للمتابعة', code: 'AUTH_REQUIRED' },
        401
      );
    }

    const verifiedActor = actor!;

    if (pathname === '/api/state' && request.method === 'GET') {
      return jsonResponse({
        state: this.getStateForUser(state, verifiedActor.userId),
        presence: this.getPresenceList(state),
      });
    }

    if (pathname === '/api/auth/credentials' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const targetUserId = String(body.targetUserId || verifiedActor.userId);
      if (targetUserId !== verifiedActor.userId) {
        this.assertPermission(state, verifiedActor.userId, 'manage_users');
      }
      const now = new Date().toISOString();
      const row = this.ctx.storage.sql
        .exec<{ password_hash: string; pin_hash: string }>(
          'SELECT password_hash, pin_hash FROM user_credentials WHERE user_id = ?',
          targetUserId
        )
        .toArray()[0];
      let pwHash = row?.password_hash || (await hashSecretWeb('Aqar@2026'));
      let pinHash = row?.pin_hash || (await hashSecretWeb('1234'));
      if (body.newPassword && String(body.newPassword).length >= 6) {
        pwHash = await hashSecretWeb(String(body.newPassword));
      }
      if (body.newPin && /^\d{4,6}$/.test(String(body.newPin))) {
        pinHash = await hashSecretWeb(String(body.newPin));
      }
      this.ctx.storage.sql.exec(
        'INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, updated_at) VALUES (?, ?, ?, ?)',
        targetUserId,
        pwHash,
        pinHash,
        now
      );
      return jsonResponse({ ok: true, state: this.getStateForUser(state, verifiedActor.userId) });
    }

    // Encrypted Backup Endpoints on Durable Object SQLite
    if (pathname === '/api/backups' && request.method === 'POST') {
      this.assertPermission(state, verifiedActor.userId, 'backup_restore');
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const snapshotData = JSON.parse(JSON.stringify(state)) as AqarDatabaseState;
      const encryptPassword = body.encryptPassword ? String(body.encryptPassword) : undefined;
      const encrypted = Boolean(encryptPassword && encryptPassword.trim().length > 0);
      const id = uid('bkp');
      const payloadToStore = encrypted
        ? await encryptBackupWeb(snapshotData, encryptPassword!)
        : snapshotData;
      const rawPayload = JSON.stringify(payloadToStore);
      const bkpMeta: BackupSnapshot = {
        id,
        label: String(body.label || `نسخة سحابية · ${new Date().toLocaleDateString('ar-SA')}`),
        createdAt: new Date().toISOString(),
        createdBy: verifiedActor.userId,
        sizeKb: Math.max(1, Math.round(rawPayload.length / 1024)),
        recordCount:
          state.properties.length +
          state.units.length +
          state.tenants.length +
          state.contracts.length +
          state.payments.length,
        encrypted,
      };
      this.ctx.storage.sql.exec(
        'INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)',
        id,
        rawPayload,
        bkpMeta.createdAt
      );
      state.backups.unshift(bkpMeta);
      this.persistState(state);
      return jsonResponse({ backup: bkpMeta, state: this.getStateForUser(state, verifiedActor.userId) }, 201);
    }

    const bkpPreviewMatch = /^\/api\/backups\/([^/]+)\/preview$/.exec(pathname);
    if (bkpPreviewMatch && (request.method === 'POST' || request.method === 'GET')) {
      this.assertPermission(state, verifiedActor.userId, 'backup_restore');
      const bkpId = bkpPreviewMatch[1];
      const meta = state.backups.find((b) => b.id === bkpId);
      const row = this.ctx.storage.sql
        .exec<{ payload_json: string }>('SELECT payload_json FROM backups_store WHERE id = ?', bkpId)
        .toArray()[0];
      if (!row) {
        return jsonResponse({
          id: bkpId,
          label: meta?.label || '',
          exists: false,
          encrypted: Boolean(meta?.encrypted),
          propertiesCount: 0,
          unitsCount: 0,
          tenantsCount: 0,
          contractsCount: 0,
          paymentsCount: 0,
          templatesCount: 0,
        });
      }
      const parsed = JSON.parse(row.payload_json) as AqarDatabaseState | WebEncryptedEnvelope;
      let snap: AqarDatabaseState;
      if ('aqarEncrypted' in parsed && parsed.aqarEncrypted) {
        const body = request.method === 'POST' ? ((await request.json().catch(() => ({}))) as Record<string, any>) : {};
        const password = body.password ? String(body.password) : url.searchParams.get('password') || '';
        if (!password) {
          return jsonResponse({
            id: bkpId,
            exists: true,
            encrypted: true,
            requiresPassword: true,
            propertiesCount: 0,
            unitsCount: 0,
            tenantsCount: 0,
            contractsCount: 0,
            paymentsCount: 0,
            templatesCount: 0,
          });
        }
        try {
          snap = await decryptBackupWeb<AqarDatabaseState>(parsed, password);
        } catch {
          return jsonResponse({
            id: bkpId,
            exists: true,
            encrypted: true,
            requiresPassword: true,
            decryptionError: 'كلمة مرور فك التشفير غير صحيحة',
            propertiesCount: 0,
            unitsCount: 0,
            tenantsCount: 0,
            contractsCount: 0,
            paymentsCount: 0,
            templatesCount: 0,
          });
        }
      } else {
        snap = parsed as AqarDatabaseState;
      }

      const diffCollection = <T extends { id: string }>(cur: T[] = [], inc: T[] = []): BackupCollectionDiff => {
        const curMap = new Map(cur.map((x) => [x.id, JSON.stringify(x)]));
        let added = 0;
        let updated = 0;
        let unchanged = 0;
        for (const item of inc) {
          const ex = curMap.get(item.id);
          if (!ex) added += 1;
          else if (ex === JSON.stringify(item)) unchanged += 1;
          else updated += 1;
        }
        return { added, updated, unchanged };
      };

      const diff = {
        properties: diffCollection(state.properties, snap.properties),
        units: diffCollection(state.units, snap.units),
        tenants: diffCollection(state.tenants, snap.tenants),
        contracts: diffCollection(state.contracts, snap.contracts),
        payments: diffCollection(state.payments, snap.payments),
        expenses: diffCollection(state.expenses, snap.expenses),
        tickets: diffCollection(state.tickets, snap.tickets),
      };
      const totalChanged = Object.values(diff).reduce((s, d) => s + d.added + d.updated, 0);

      const preview: BackupPreviewResult = {
        id: bkpId,
        exists: true,
        encrypted: 'aqarEncrypted' in parsed,
        propertiesCount: snap.properties?.length || 0,
        unitsCount: snap.units?.length || 0,
        tenantsCount: snap.tenants?.length || 0,
        contractsCount: snap.contracts?.length || 0,
        paymentsCount: snap.payments?.length || 0,
        templatesCount: snap.communicationTemplates?.length || 0,
        lastUpdatedAt: snap.lastUpdatedAt,
        diff: { ...diff, totalChanged },
      };
      return jsonResponse(preview);
    }

    const bkpRestoreMatch = /^\/api\/backups\/([^/]+)\/restore$/.exec(pathname);
    if (bkpRestoreMatch && request.method === 'POST') {
      this.assertPermission(state, verifiedActor.userId, 'backup_restore');
      const bkpId = bkpRestoreMatch[1];
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const row = this.ctx.storage.sql
        .exec<{ payload_json: string }>('SELECT payload_json FROM backups_store WHERE id = ?', bkpId)
        .toArray()[0];
      if (!row) return jsonResponse({ error: 'النسخة غير موجودة' }, 404);
      const parsed = JSON.parse(row.payload_json) as AqarDatabaseState | WebEncryptedEnvelope;
      let snap: AqarDatabaseState;
      if ('aqarEncrypted' in parsed && parsed.aqarEncrypted) {
        if (!body.password) return jsonResponse({ error: 'كلمة مرور فك التشفير مطلوبة' }, 400);
        snap = await decryptBackupWeb<AqarDatabaseState>(parsed, String(body.password));
      } else {
        snap = parsed as AqarDatabaseState;
      }
      // Save automatic safety backup prior to restore
      const safetyId = uid('bkp-safety');
      this.ctx.storage.sql.exec(
        'INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)',
        safetyId,
        JSON.stringify(state),
        new Date().toISOString()
      );
      if (body.mode === 'merge') {
        const mergeById = <T extends { id: string }>(cur: T[] = [], inc: T[] = []) => {
          const seen = new Set(cur.map((x) => x.id));
          return [...cur, ...inc.filter((x) => !seen.has(x.id))];
        };
        state.properties = mergeById(state.properties, snap.properties);
        state.units = mergeById(state.units, snap.units);
        state.tenants = mergeById(state.tenants, snap.tenants);
        state.contracts = mergeById(state.contracts, snap.contracts);
        state.installments = mergeById(state.installments, snap.installments);
        state.payments = mergeById(state.payments, snap.payments);
        state.expenses = mergeById(state.expenses, snap.expenses);
        state.tickets = mergeById(state.tickets, snap.tickets);
        state.tasks = mergeById(state.tasks, snap.tasks);
        state.documents = mergeById(state.documents, snap.documents);
      } else {
        const preservedBackups = state.backups;
        Object.assign(state, snap);
        state.backups = preservedBackups;
      }
      this.persistState(state);
      this.broadcastStateChange(state, verifiedActor.userId, 'استعادة نسخة احتياطية');
      return jsonResponse({ ok: true, mode: body.mode || 'replace', state: this.getStateForUser(state, verifiedActor.userId) });
    }

    // Idempotent Offline Sync Batch Replay with operations_log + entityRevisions conflict check
    if (pathname === '/api/sync/batch' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const operations = Array.isArray(body.operations) ? body.operations : [];
      let uploaded = 0;
      let skippedDuplicates = 0;
      let conflictsDetected = 0;
      const newConflicts: SyncConflictRecord[] = [];
      const errors: string[] = [];

      for (const op of operations) {
        const operationId = String(op.operationId || op.idempotencyKey || op.id || '');
        if (!operationId) continue;

        const existingOp = this.ctx.storage.sql
          .exec<{ operation_id: string }>('SELECT operation_id FROM operations_log WHERE operation_id = ?', operationId)
          .toArray()[0];

        if (existingOp) {
          skippedDuplicates += 1;
          continue;
        }

        if (op.entityType && op.entityId && typeof op.baseRevision === 'number') {
          const revKey = `${op.entityType}:${op.entityId}`;
          const serverRev = state.entityRevisions?.[revKey] || 0;
          if (serverRev > op.baseRevision) {
            conflictsDetected += 1;
            const conflict: SyncConflictRecord = {
              id: uid('cnf'),
              entityType: op.entityType,
              entityId: op.entityId,
              entityLabel: `${op.entityType}:${op.entityId}`,
              firstActorName: 'تحديث محفوظ على الخادم',
              secondActorName: verifiedActor.deviceName,
              firstChangeSummary: `إصدار الخادم #${serverRev}`,
              secondChangeSummary: `عملية جهاز العميل (${op.endpoint}) من الإصدار #${op.baseRevision}`,
              status: 'بانتظار مراجعة المدير',
              createdAt: new Date().toISOString(),
            };
            if (!state.syncConflicts) state.syncConflicts = [];
            state.syncConflicts.unshift(conflict);
            newConflicts.push(conflict);
          }
        }

        try {
          const res = await this.handleMutation(state, verifiedActor, op.method || 'POST', op.endpoint, op.body || {});
          uploaded += 1;
          this.ctx.storage.sql.exec(
            'INSERT INTO operations_log (operation_id, user_id, method, endpoint, status, response_json, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            operationId,
            verifiedActor.userId,
            op.method || 'POST',
            op.endpoint,
            'applied',
            JSON.stringify({ ok: true, id: (res as { id?: string })?.id }),
            new Date().toISOString()
          );
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      if (conflictsDetected > 0) this.persistState(state);
      if (uploaded > 0) {
        this.broadcastStateChange(state, verifiedActor.userId, `مزامنة ${uploaded} عملية من العمل دون إنترنت`);
      }

      return jsonResponse({
        success: errors.length === 0,
        uploaded,
        skippedDuplicates,
        conflictsDetected,
        newConflicts,
        errors,
        state: this.getStateForUser(state, verifiedActor.userId),
        syncedAt: new Date().toISOString(),
      });
    }

    if (pathname === '/api/sync/delta' && request.method === 'GET') {
      const since = url.searchParams.get('since');
      const hasChanges = !since || new Date(state.lastUpdatedAt).getTime() > new Date(since).getTime();
      return jsonResponse({
        hasChanges,
        serverRevision: state.syncRevision || 1,
        lastUpdatedAt: state.lastUpdatedAt,
        pendingConflictsCount: (state.syncConflicts || []).filter((c) => c.status === 'بانتظار مراجعة المدير').length,
        syncConflicts: state.syncConflicts || [],
        state: hasChanges ? this.getStateForUser(state, verifiedActor.userId) : undefined,
      });
    }

    // Standard protected mutations
    if (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE') {
      try {
        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const result = await this.handleMutation(state, verifiedActor, request.method, pathname, body);
        this.broadcastStateChange(state, verifiedActor.userId, `تحديث ${pathname}`);
        return jsonResponse(result, request.method === 'POST' ? 201 : 200);
      } catch (err) {
        return jsonResponse({ error: (err as Error).message }, 400);
      }
    }

    return jsonResponse({ error: 'Not Found' }, 404);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const text = typeof message === 'string' ? message : new TextDecoder().decode(message);
      const msg = JSON.parse(text) as { type?: string; token?: string; deviceName?: string };
      if (msg.type === 'session:identify') {
        const state = await this.ensureBootstrapped();
        const dummyReq = new Request('https://worker.local/ws');
        const actor = await this.resolveActor(dummyReq, state, msg.token);
        if (!actor) {
          ws.send(JSON.stringify({ type: 'auth:required' }));
          return;
        }
        const meta: WsAttachment = {
          sessionId: actor.sessionId,
          userId: actor.userId,
          authenticated: true,
          deviceName: msg.deviceName || actor.deviceName,
          connectedAt: new Date().toISOString(),
        };
        ws.serializeAttachment(meta);
        ws.send(
          JSON.stringify({
            type: 'state:init',
            state: this.getStateForUser(state, actor.userId),
            presence: this.getPresenceList(state),
          })
        );
      }
    } catch {
      // ignore invalid ws payload
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    try {
      ws.close(code, reason);
    } catch {
      // already closed
    }
  }
}
