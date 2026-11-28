import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { encryptPassword, isPasswordEncrypted } from './src/utils/security';

const PRIMARY_ADMIN_USERNAME = 'pebblesthepenguinishaany83';
// Legacy seeded hash fingerprint used only to invalidate an unclaimed default seed on disk
const LEGACY_UNCLAIMED_ADMIN_HASH =
  'enc_sha256:3f2285eb50bd0969b900e8da9146e0da0ff008c6649cbc975684b3ae45d16d1a';
const SCRYPT_PREFIX = 'scrypt:';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Ephemeral in-memory fallback when SESSION_SECRET is unset (never stored in .env.example)
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

const DEFAULT_ALLOWED_ORIGINS = [
  'https://ishaany83-arch.github.io',
  'https://penguin-tech2.github.io',
  'https://ais-dev-3rkm6fobgoyytw6ll5xdqk-409276822889.us-east5.run.app',
  'https://ais-pre-3rkm6fobgoyytw6ll5xdqk-409276822889.us-east5.run.app',
];

function getConfiguredOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const appUrl = (process.env.APP_URL || '').trim().replace(/\/$/, '');
  const list = [...DEFAULT_ALLOWED_ORIGINS, ...fromEnv];
  if (appUrl) list.push(appUrl);
  return Array.from(new Set(list));
}

function isOriginAllowed(origin: string | undefined, reqHost?: string): boolean {
  if (!origin) return true; // Same-origin / non-browser request (curl, server health checks)
  const normalized = origin.trim().replace(/\/$/, '');
  try {
    const parsed = new URL(normalized);
    if (reqHost && parsed.host.toLowerCase() === reqHost.toLowerCase()) {
      return true;
    }
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '[::1]'
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return getConfiguredOrigins().includes(normalized);
}

// --- Password Hashing (Per-User Salted Scrypt + Legacy Upgrade) ---
function scryptHashPassword(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
  return `${SCRYPT_PREFIX}${salt}:${derived}`;
}

function isScryptHash(value?: string | null): boolean {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split(':');
  return value.startsWith(SCRYPT_PREFIX) && parts.length === 3 && parts[1].length >= 16 && parts[2].length === 128;
}

function timingSafeHexEqual(aHex: string, bHex: string): boolean {
  if (aHex.length !== bHex.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(aHex, 'hex'), Buffer.from(bHex, 'hex'));
  } catch {
    return false;
  }
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aDigest = crypto.createHash('sha256').update(a).digest();
  const bDigest = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aDigest, bDigest);
}

function verifyServerPassword(plainPassword: string, storedHash?: string | null): boolean {
  if (!plainPassword || !storedHash || typeof plainPassword !== 'string' || typeof storedHash !== 'string') {
    return false;
  }
  if (isScryptHash(storedHash)) {
    const [, salt, expectedHex] = storedHash.split(':');
    const derivedHex = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
    return timingSafeHexEqual(derivedHex, expectedHex);
  }
  if (isPasswordEncrypted(storedHash)) {
    // Reject submitting raw hash strings directly as passwords
    if (plainPassword === storedHash) return false;
    const candidate = encryptPassword(plainPassword);
    return timingSafeStringEqual(candidate, storedHash);
  }
  return false;
}

// --- Signed Bearer Token Helpers ---
interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

function signAuthToken(username: string): string {
  const now = Date.now();
  const payload: TokenPayload = {
    sub: username.toLowerCase(),
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifyAuthToken(token?: string | null): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, sig] = parts;
  if (!encodedPayload || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  if (!timingSafeStringEqual(sig, expectedSig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as TokenPayload;
    if (!payload || !payload.sub || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function sanitizeUserRecord(record: Record<string, any> | undefined | null): Record<string, any> | null {
  if (!record || typeof record !== 'object') return null;
  const { passwordHash: _ph, password: _pw, adminClaimed: _ac, ...safe } = record;
  return safe;
}

function sanitizeAllUsers(store: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  Object.entries(store).forEach(([key, rec]) => {
    const safe = sanitizeUserRecord(rec);
    if (safe) out[key] = safe;
  });
  return out;
}

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Prevent CSV spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

const app = express();
app.set('trust proxy', 1);

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  },
  allowRequest: (req, callback) => {
    const origin = req.headers.origin;
    const allowed = isOriginAllowed(origin, req.headers.host);
    callback(allowed ? null : 'Origin not allowed', allowed);
  },
});

function getListenPort(): number {
  for (let i = 0; i < process.argv.length; i++) {
    if ((process.argv[i] === '--port' || process.argv[i] === '-p') && process.argv[i + 1]) {
      const parsed = parseInt(process.argv[i + 1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

const PORT = getListenPort();
const USERS_FILE_PATH = path.join(process.cwd(), 'users_registry_data.json');
const PERMANENT_ARCHIVE_PATH = path.join(process.cwd(), 'users_permanent_archive.json');
const USERS_BACKUP_PATH = path.join(process.cwd(), 'users_registry_data.backup.json');
const USERS_LEDGER_PATH = path.join(process.cwd(), 'users_permanent_ledger.jsonl');

let onlineUsersCount = 1;

// Primary admin starts WITHOUT any hardcoded password in code
const serverUsersStore: Record<string, any> = {
  [PRIMARY_ADMIN_USERNAME]: {
    username: 'Pebblesthepenguinishaany83',
    name: 'Pebbles (Ishaan)',
    email: 'ishaany83@gmail.com',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isAdmin: true,
    isVip: true,
    vipLevel: 'Diamond',
  },
};

// Persistence functions
function loadPersistedUsers() {
  const fileSources = [USERS_FILE_PATH, PERMANENT_ARCHIVE_PATH, USERS_BACKUP_PATH];

  fileSources.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, val]) => {
            if (val && typeof val === 'object') {
              const lowerKey = key.toLowerCase();
              const existing = serverUsersStore[lowerKey] || {};
              const incomingPass = (val as any).passwordHash || (val as any).password || existing.passwordHash;
              serverUsersStore[lowerKey] = {
                ...existing,
                ...(val as Record<string, any>),
                passwordHash: incomingPass
                  ? isScryptHash(incomingPass) || isPasswordEncrypted(incomingPass)
                    ? incomingPass
                    : scryptHashPassword(incomingPass)
                  : existing.passwordHash,
                username: (val as any).username || existing.username || key,
              };
            }
          });
        }
      }
    } catch (err) {
      console.error(`⚠️ Could not read user store from ${filePath}:`, err);
    }
  });

  // Never allow the old hardcoded default password hash on the primary admin account unless claimed explicitly
  const adminRec = serverUsersStore[PRIMARY_ADMIN_USERNAME];
  if (adminRec) {
    adminRec.isAdmin = true;
    adminRec.isVip = true;
    adminRec.vipLevel = adminRec.vipLevel || 'Diamond';
    if (!adminRec.adminClaimed && adminRec.passwordHash === LEGACY_UNCLAIMED_ADMIN_HASH) {
      adminRec.passwordHash = '';
      adminRec.adminClaimed = false;
    } else if (adminRec.passwordHash && isScryptHash(adminRec.passwordHash)) {
      adminRec.adminClaimed = true;
    }
  }

  // Migrate any stray plaintext passwords found on disk to scrypt
  let upgradedCount = 0;
  Object.keys(serverUsersStore).forEach((key) => {
    const rec = serverUsersStore[key];
    if (rec && rec.passwordHash && !isScryptHash(rec.passwordHash) && !isPasswordEncrypted(rec.passwordHash)) {
      rec.passwordHash = scryptHashPassword(rec.passwordHash);
      upgradedCount++;
    }
    if (rec && 'password' in rec) {
      delete rec.password;
    }
  });

  console.log(`✅ Loaded & unified ${Object.keys(serverUsersStore).length} accounts from disk storage.`);
  if (upgradedCount > 0) {
    console.log(`🔒 Upgraded ${upgradedCount} password records to scrypt.`);
  }

  savePersistedUsers(false);
}

function savePersistedUsers(appendLedger: boolean = true) {
  try {
    Object.keys(serverUsersStore).forEach((key) => {
      const rec = serverUsersStore[key];
      if (rec && rec.passwordHash && !isScryptHash(rec.passwordHash) && !isPasswordEncrypted(rec.passwordHash)) {
        rec.passwordHash = scryptHashPassword(rec.passwordHash);
      }
      if (rec && 'password' in rec) {
        delete rec.password;
      }
    });

    const serialized = JSON.stringify(serverUsersStore, null, 2);
    fs.writeFileSync(USERS_FILE_PATH, serialized, 'utf-8');
    fs.writeFileSync(PERMANENT_ARCHIVE_PATH, serialized, 'utf-8');
    fs.writeFileSync(USERS_BACKUP_PATH, serialized, 'utf-8');

    if (appendLedger) {
      try {
        const ledgerEntry =
          JSON.stringify({
            timestamp: new Date().toISOString(),
            totalAccounts: Object.keys(serverUsersStore).length,
          }) + '\n';
        fs.appendFileSync(USERS_LEDGER_PATH, ledgerEntry, 'utf-8');
      } catch {
        // Non-blocking
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to save users to disk storage:', err);
  }
}

loadPersistedUsers();

// --- Authenticated Online Presence Tracking ---
const onlineUserSockets = new Map<string, Set<string>>();
const onlineUserMeta = new Map<string, { connectedAt: string; currentGame: string | null }>();

function getOnlineUsersList() {
  const list: Array<{
    username: string;
    key: string;
    name: string | null;
    isAdmin: boolean;
    isVip: boolean;
    vipLevel: string | null;
    avatar: string | null;
    connectedAt: string;
    connections: number;
    currentGame: string | null;
  }> = [];

  onlineUserSockets.forEach((sockets, lowerKey) => {
    if (!sockets || sockets.size === 0) return;
    const rec = serverUsersStore[lowerKey];
    if (!rec) return;
    const meta = onlineUserMeta.get(lowerKey);
    list.push({
      username: rec.username || lowerKey,
      key: lowerKey,
      name: rec.name || null,
      isAdmin: !!(rec.isAdmin || lowerKey === PRIMARY_ADMIN_USERNAME),
      isVip: !!rec.isVip,
      vipLevel: rec.vipLevel || null,
      avatar: rec.avatar || null,
      connectedAt: meta?.connectedAt || new Date().toISOString(),
      connections: sockets.size,
      currentGame: meta?.currentGame || null,
    });
  });

  return list.sort((a, b) => b.connectedAt.localeCompare(a.connectedAt));
}

function broadcastOnlineUsersToAdmins() {
  io.to('admins').emit('users:online_updated', getOnlineUsersList());
}

// --- Socket.IO Authenticated Connection Handling ---
io.on('connection', (socket) => {
  onlineUsersCount++;
  io.emit('users:count', { count: Math.max(1, onlineUsersCount) });

  const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : null;
  const verified = verifyAuthToken(token);

  if (verified) {
    const rec = serverUsersStore[verified.sub];
    if (rec) {
      socket.data.username = verified.sub;
      socket.data.isAdmin = !!(rec.isAdmin || verified.sub === PRIMARY_ADMIN_USERNAME);
      socket.join(`user:${verified.sub}`);

      let sockets = onlineUserSockets.get(verified.sub);
      if (!sockets) {
        sockets = new Set<string>();
        onlineUserSockets.set(verified.sub, sockets);
        onlineUserMeta.set(verified.sub, {
          connectedAt: new Date().toISOString(),
          currentGame: null,
        });
      }
      sockets.add(socket.id);

      if (socket.data.isAdmin) {
        socket.join('admins');
        socket.emit('users:synced_all', sanitizeAllUsers(serverUsersStore));
        socket.emit('users:online_updated', getOnlineUsersList());
      }
      broadcastOnlineUsersToAdmins();
    }
  }

  socket.on('user:join', () => {
    if (socket.data.username) {
      socket.broadcast.emit('user:joined_announcement', {
        username: socket.data.username,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  });

  socket.on('user:activity', (data: { currentGame?: string | null }) => {
    const lowerKey = socket.data.username;
    if (!lowerKey || !onlineUserSockets.has(lowerKey)) return;
    const rawGame = typeof data?.currentGame === 'string' ? data.currentGame.trim().slice(0, 80) : '';
    const existingMeta = onlineUserMeta.get(lowerKey);
    onlineUserMeta.set(lowerKey, {
      connectedAt: existingMeta?.connectedAt || new Date().toISOString(),
      currentGame: rawGame || null,
    });
    broadcastOnlineUsersToAdmins();
  });

  socket.on('disconnect', () => {
    onlineUsersCount = Math.max(1, onlineUsersCount - 1);
    io.emit('users:count', { count: onlineUsersCount });

    const lowerKey = socket.data.username;
    if (lowerKey) {
      const sockets = onlineUserSockets.get(lowerKey);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUserSockets.delete(lowerKey);
          onlineUserMeta.delete(lowerKey);
        }
      }
      broadcastOnlineUsersToAdmins();
    }
  });
});

// --- Express Security Middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false, // Required so game iframes & AI Studio preview iframe render properly
  })
);

app.use(express.json({ limit: '100kb' }));

// Strict CORS allowlist
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const host = req.headers.host;

  if (origin) {
    if (!isOriginAllowed(origin, host)) {
      if (req.path.startsWith('/api')) {
        return res.status(403).json({ success: false, error: 'CORS origin denied' });
      }
      return next();
    }
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Try again later.' },
});

app.use('/api', apiLimiter);

// --- Auth Middlewares ---
interface AuthenticatedRequest extends Request {
  authUser?: {
    username: string;
    isAdmin: boolean;
    record: Record<string, any>;
  };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }
  const record = serverUsersStore[payload.sub];
  if (!record) {
    return res.status(401).json({ success: false, error: 'Account no longer exists.' });
  }
  req.authUser = {
    username: payload.sub,
    isAdmin: !!(record.isAdmin || payload.sub === PRIMARY_ADMIN_USERNAME),
    record,
  };
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.authUser?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Administrator privileges required.' });
    }
    next();
  });
}

// --- Public Status Endpoint ---
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    onlineUsers: onlineUsersCount,
    totalAccounts: Object.keys(serverUsersStore).length,
    uptime: process.uptime(),
  });
});

// --- Auth & Registration Endpoints ---
app.post('/api/users/login', authLimiter, (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both username and password.' });
  }

  const lowerKey = username.toLowerCase();
  const record = serverUsersStore[lowerKey];
  if (!record) {
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }

  let authenticated = false;

  if (lowerKey === PRIMARY_ADMIN_USERNAME) {
    const envAdminPass = process.env.ADMIN_PASSWORD?.trim();
    if (envAdminPass) {
      authenticated = timingSafeStringEqual(password, envAdminPass);
    } else if (record.passwordHash) {
      authenticated = verifyServerPassword(password, record.passwordHash);
    }
  } else {
    authenticated = verifyServerPassword(password, record.passwordHash);
  }

  if (!authenticated) {
    return res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }

  // Single-use test account check
  if (record.isTestAccount && record.testAccountUsed) {
    return res.status(403).json({
      success: false,
      error: 'This single-use test account pass has already been consumed.',
    });
  }

  // Upgrade legacy salted-SHA256 hashes cleanly to scrypt on successful login
  if (record.passwordHash && !isScryptHash(record.passwordHash) && lowerKey !== PRIMARY_ADMIN_USERNAME) {
    record.passwordHash = scryptHashPassword(password);
  }

  const now = new Date().toISOString();
  record.lastLogin = now;
  if (record.isTestAccount) {
    record.testAccountUsed = true;
    record.testAccountUsedAt = record.testAccountUsedAt || now;
  }
  savePersistedUsers(false);

  const token = signAuthToken(lowerKey);
  return res.json({
    success: true,
    user: sanitizeUserRecord({ ...record, username: record.username || username }),
    token,
  });
});

app.post('/api/users/register', authLimiter, (req, res) => {
  const userObj = req.body?.user && typeof req.body.user === 'object' ? req.body.user : {};
  const rawUsername = String(req.body?.username || userObj.username || '').trim();
  const rawPassword = String(req.body?.password || userObj.password || '').trim();
  const rawName = req.body?.name ?? userObj.name;
  const rawEmail = req.body?.email ?? userObj.email;

  if (!rawUsername || !/^[a-zA-Z0-9_]{3,32}$/.test(rawUsername)) {
    return res.status(400).json({
      success: false,
      error: 'Username must be 3-32 characters using only letters, numbers, and underscores.',
    });
  }

  if (!rawPassword || rawPassword.length < 4 || rawPassword.length > 128) {
    return res.status(400).json({
      success: false,
      error: 'Password must be between 4 and 128 characters.',
    });
  }

  const email = typeof rawEmail === 'string' && rawEmail.trim() ? rawEmail.trim().slice(0, 120) : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const name = typeof rawName === 'string' && rawName.trim() ? rawName.trim().slice(0, 80) : undefined;
  const lowerKey = rawUsername.toLowerCase();

  // Strictly prevent account takeover / overwrites on existing accounts
  if (serverUsersStore[lowerKey]) {
    return res.status(409).json({
      success: false,
      error: 'An account with this username already exists.',
    });
  }

  const now = new Date().toISOString();
  // Assign least-privilege fields only (ignore any client-supplied isAdmin / isVip / points)
  serverUsersStore[lowerKey] = {
    username: rawUsername,
    name,
    email,
    passwordHash: scryptHashPassword(rawPassword),
    createdAt: now,
    lastLogin: now,
    points: 10,
    isAdmin: false,
    isVip: false,
    loginStreak: 1,
    lastStreakDate: now.split('T')[0],
    hasPenguinBadge: false,
    mysteryGifts: [],
  };

  savePersistedUsers();
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));

  const token = signAuthToken(lowerKey);
  return res.status(201).json({
    success: true,
    user: sanitizeUserRecord(serverUsersStore[lowerKey]),
    token,
    total: Object.keys(serverUsersStore).length,
  });
});

app.post('/api/auth/claim-test-pass', authLimiter, (_req, res) => {
  const availableKey = Object.keys(serverUsersStore).find(
    (k) => serverUsersStore[k]?.isTestAccount && !serverUsersStore[k]?.testAccountUsed && !serverUsersStore[k]?.isAdmin
  );

  const now = new Date().toISOString();
  let testKey = availableKey;

  if (!testKey) {
    const randomId = crypto.randomInt(1000, 9999);
    testKey = `test_pass_${randomId}_${crypto.randomBytes(2).toString('hex')}`;
    serverUsersStore[testKey] = {
      username: testKey,
      name: `Single-Use Test Pass #${randomId}`,
      email: `test_${randomId}@gameland.test`,
      passwordHash: scryptHashPassword(crypto.randomBytes(16).toString('hex')),
      createdAt: now,
      lastLogin: now,
      points: 10,
      isAdmin: false,
      isVip: false,
      isTestAccount: true,
      testAccountUsed: false,
    };
  }

  const record = serverUsersStore[testKey];
  record.testAccountUsed = true;
  record.testAccountUsedAt = now;
  record.lastLogin = now;

  savePersistedUsers();
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));

  const token = signAuthToken(testKey);
  return res.json({
    success: true,
    user: sanitizeUserRecord(record),
    token,
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    success: true,
    user: sanitizeUserRecord(req.authUser!.record),
  });
});

// --- Admin-Only User Registry & CSV Export ---
app.get('/api/users', requireAdmin, (_req, res) => {
  res.json(sanitizeAllUsers(serverUsersStore));
});

app.get('/api/users/online', requireAdmin, (_req, res) => {
  res.json({
    success: true,
    onlineUsers: getOnlineUsersList(),
    totalConnections: onlineUsersCount,
  });
});

app.get('/api/users/csv', requireAdmin, (_req, res) => {
  const headers = [
    'Username',
    'Email',
    'Full Name',
    'Role',
    'VIP Status',
    'VIP Tier',
    'Points',
    'Registered Date',
    'Last Login',
  ];

  const rows = Object.values(serverUsersStore).map((u: any) =>
    [
      escapeCsvCell(u.username),
      escapeCsvCell(u.email || ''),
      escapeCsvCell(u.name || ''),
      escapeCsvCell(u.isAdmin ? 'Admin' : 'User'),
      escapeCsvCell(u.isVip ? 'VIP' : 'Free'),
      escapeCsvCell(u.vipLevel || 'None'),
      escapeCsvCell(u.points ?? 0),
      escapeCsvCell(u.createdAt || ''),
      escapeCsvCell(u.lastLogin || ''),
    ].join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="gameland-users-${new Date().toISOString().slice(0, 10)}.csv"`
  );
  res.send(csvContent);
});

app.post('/api/users/sync', requireAdmin, (req, res) => {
  const { users, user } = req.body || {};
  let updated = false;

  const mergeProfile = (key: string, incoming: Record<string, any>) => {
    const lowerKey = key.toLowerCase();
    if (!/^[a-z0-9_]+$/.test(lowerKey)) return;
    const existing = serverUsersStore[lowerKey] || {};
    const {
      password: rawPw,
      passwordHash: rawPh,
      adminClaimed: _ignoreClaimed,
      ...safeProfile
    } = incoming;

    let nextPasswordHash = existing.passwordHash;
    if (typeof rawPw === 'string' && rawPw.length >= 4) {
      nextPasswordHash = scryptHashPassword(rawPw);
    } else if (typeof rawPh === 'string' && (isScryptHash(rawPh) || isPasswordEncrypted(rawPh))) {
      nextPasswordHash = existing.passwordHash || rawPh;
    }

    serverUsersStore[lowerKey] = {
      points: 10,
      ...existing,
      ...safeProfile,
      passwordHash: nextPasswordHash,
      adminClaimed: existing.adminClaimed,
      isAdmin: lowerKey === PRIMARY_ADMIN_USERNAME ? true : !!(safeProfile.isAdmin ?? existing.isAdmin),
      username: safeProfile.username || existing.username || key,
    };
    updated = true;
  };

  if (users && typeof users === 'object') {
    Object.entries(users).forEach(([key, rec]) => {
      if (rec && typeof rec === 'object') {
        mergeProfile(key, rec as Record<string, any>);
      }
    });
  }

  if (user && typeof user === 'object' && typeof user.username === 'string') {
    mergeProfile(user.username.trim(), user);
  }

  if (updated) {
    savePersistedUsers();
    io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));
  }

  res.json({ success: true, count: Object.keys(serverUsersStore).length });
});

app.delete('/api/users/:username', requireAdmin, (req, res) => {
  const username = (req.params.username || '').toLowerCase();
  console.warn(`🛑 Rejected account deletion attempt for "${username}". Account deletion is permanently disabled.`);
  return res.status(403).json({
    success: false,
    error: 'Account deletion is permanently disabled.',
  });
});

// --- Self or Admin Endpoints ---
app.get('/api/users/:username/status', requireAuth, (req: AuthenticatedRequest, res) => {
  const target = (req.params.username || '').toLowerCase();
  if (req.authUser!.username !== target && !req.authUser!.isAdmin) {
    return res.status(403).json({ success: false, error: 'You may only view your own account status.' });
  }
  const record = serverUsersStore[target];
  if (!record) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({
    success: true,
    username: target,
    points: typeof record.points === 'number' ? record.points : 10,
    isVip: !!record.isVip,
    vipLevel: record.vipLevel || null,
    vipGrantedAt: record.vipGrantedAt || null,
  });
});

app.post('/api/users/:username/password', requireAuth, (req: AuthenticatedRequest, res) => {
  const target = (req.params.username || '').toLowerCase();
  if (req.authUser!.username !== target && !req.authUser!.isAdmin) {
    return res.status(403).json({ success: false, error: 'Not authorized to change this password.' });
  }
  const record = serverUsersStore[target];
  if (!record) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  const newPassword = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const minLen = target === PRIMARY_ADMIN_USERNAME ? 8 : 4;
  if (newPassword.length < minLen || newPassword.length > 128) {
    return res.status(400).json({
      success: false,
      error: `Password must be between ${minLen} and 128 characters.`,
    });
  }
  record.passwordHash = scryptHashPassword(newPassword);
  if (target === PRIMARY_ADMIN_USERNAME) {
    record.adminClaimed = true;
  }
  savePersistedUsers();
  return res.json({ success: true });
});

app.post('/api/users/:username/admin-role', requireAdmin, (req: AuthenticatedRequest, res) => {
  const target = (req.params.username || '').toLowerCase();
  if (target === PRIMARY_ADMIN_USERNAME) {
    return res.status(403).json({ success: false, error: 'Primary admin role cannot be revoked.' });
  }
  const record = serverUsersStore[target];
  if (!record) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  const nextAdmin = typeof req.body?.isAdmin === 'boolean' ? req.body.isAdmin : !record.isAdmin;
  record.isAdmin = nextAdmin;
  savePersistedUsers();
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));
  return res.json({ success: true, username: target, isAdmin: record.isAdmin });
});

app.post('/api/users/:username/coins', requireAuth, (req: AuthenticatedRequest, res) => {
  const target = (req.params.username || '').toLowerCase();
  const isSelf = req.authUser!.username === target;
  const isAdmin = req.authUser!.isAdmin;

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ success: false, error: 'Not authorized to update coins for another user.' });
  }

  const { amount, operation = 'add', reason } = req.body || {};
  const numAmount = Number(amount);

  if (!Number.isFinite(numAmount) || numAmount < 0) {
    return res.status(400).json({ success: false, error: 'Invalid coin amount provided.' });
  }

  const record = serverUsersStore[target];
  if (!record) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Non-admins cannot arbitrarily set balances or credit more than 25 coins per action
  if (!isAdmin) {
    if (operation === 'set') {
      return res.status(403).json({ success: false, error: 'Only administrators can set balances directly.' });
    }
    if (operation === 'add' && numAmount > 25) {
      return res.status(403).json({ success: false, error: 'Reward amount exceeds allowed per-action cap.' });
    }
  }

  const currentPoints = typeof record.points === 'number' ? record.points : 10;
  let newPoints = currentPoints;

  if (operation === 'add') {
    newPoints = currentPoints + numAmount;
  } else if (operation === 'deduct') {
    if (currentPoints < numAmount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient coins. Current balance: ${currentPoints}, required: ${numAmount}`,
        points: currentPoints,
      });
    }
    newPoints = Math.max(0, currentPoints - numAmount);
  } else if (operation === 'set') {
    newPoints = Math.max(0, numAmount);
  } else {
    return res.status(400).json({ success: false, error: 'Invalid coin operation.' });
  }

  record.points = newPoints;
  savePersistedUsers();

  const coinPayload = {
    username: target,
    points: newPoints,
    operation,
    amount: numAmount,
    reason: reason || 'balance_update',
  };
  io.to(`user:${target}`).to('admins').emit('user:coins_updated', coinPayload);
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));

  return res.json({
    success: true,
    username: target,
    points: newPoints,
    operation,
    amount: numAmount,
  });
});

// --- Admin-Only VIP & Mass Operations ---
app.post('/api/users/:username/vip', requireAdmin, (req, res) => {
  const target = (req.params.username || '').toLowerCase();
  const record = serverUsersStore[target];
  if (!record) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const { isVip, vipLevel, vipGrantedAt } = req.body || {};
  record.isVip = !!isVip;
  if (isVip) {
    record.vipLevel = vipLevel || 'Gold';
    record.vipGrantedAt = vipGrantedAt || new Date().toISOString();
  } else {
    delete record.vipLevel;
    delete record.vipGrantedAt;
  }

  savePersistedUsers();

  const vipPayload = {
    username: target,
    isVip: record.isVip,
    vipLevel: record.vipLevel || null,
    vipGrantedAt: record.vipGrantedAt || null,
  };
  io.to(`user:${target}`).to('admins').emit('user:vip_updated', vipPayload);
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));

  return res.json({
    success: true,
    username: target,
    isVip: record.isVip,
    vipLevel: record.vipLevel,
  });
});

app.post('/api/users/mass-coins', requireAdmin, (req, res) => {
  const { amount, note } = req.body || {};
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0 || numAmount > 100000) {
    return res.status(400).json({ success: false, error: 'Invalid mass coin amount' });
  }

  let count = 0;
  Object.keys(serverUsersStore).forEach((key) => {
    const record = serverUsersStore[key];
    const current = typeof record.points === 'number' ? record.points : 10;
    record.points = current + numAmount;
    count++;
    io.to(`user:${key}`).emit('user:coins_updated', {
      username: key,
      points: record.points,
      operation: 'add',
      amount: numAmount,
      reason: note || 'Admin bonus',
    });
  });

  savePersistedUsers();

  io.emit('users:mass_coins_granted', {
    amount: numAmount,
    note: note || 'Admin bonus',
    timestamp: new Date().toISOString(),
  });
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));

  return res.json({ success: true, count, amount: numAmount });
});

app.post('/api/users/promote-all-vip', requireAdmin, (req, res) => {
  const { vipLevel = 'Gold' } = req.body || {};
  const now = new Date().toISOString();
  let count = 0;

  Object.keys(serverUsersStore).forEach((key) => {
    const record = serverUsersStore[key];
    record.isVip = true;
    record.vipLevel = vipLevel;
    if (!record.vipGrantedAt) {
      record.vipGrantedAt = now;
    }
    count++;
    io.to(`user:${key}`).emit('user:vip_updated', {
      username: key,
      isVip: true,
      vipLevel,
      vipGrantedAt: record.vipGrantedAt,
    });
  });

  savePersistedUsers();
  io.to('admins').emit('users:synced_all', sanitizeAllUsers(serverUsersStore));

  return res.json({ success: true, count, vipLevel });
});

// --- Frontend Dev / Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: { server: httpServer },
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);

      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith('/api') || url.startsWith('/socket.io')) {
          return next();
        }
        try {
          const indexPath = path.join(process.cwd(), 'index.html');
          if (fs.existsSync(indexPath)) {
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          } else {
            next();
          }
        } catch (e: any) {
          vite.ssrFixStacktrace?.(e);
          next(e);
        }
      });
    } catch (e) {
      console.warn('Vite dev server middleware not loaded:', e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          res.status(200).json({ status: 'ok', service: 'Gameland Penguin API', port: PORT });
        }
      });
    });
  }

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} in use, retrying in 1s...`);
      setTimeout(() => {
        httpServer.close();
        httpServer.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('⚠️ HTTP Server error:', err);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gameland Penguin Real-Time Server running on port ${PORT}`);
  });
}

startServer();
