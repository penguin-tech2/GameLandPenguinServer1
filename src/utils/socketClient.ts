import { io, Socket } from 'socket.io-client';

export interface OnlineUserInfo {
  username: string;
  key: string;
  name?: string | null;
  isAdmin?: boolean;
  isVip?: boolean;
  vipLevel?: string | null;
  avatar?: string | null;
  connectedAt: string;
  connections: number;
  currentGame?: string | null;
}

let socket: Socket | null = null;
let currentOnlineCount = 1;
let currentOnlineUsersList: OnlineUserInfo[] = [];
// Bearer token stored strictly in JS runtime memory (never in localStorage/sessionStorage)
let authToken: string | null = null;

export const USERS_STORAGE_KEY = 'gameland_users_db_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'gameland_active_session_v1';
export const CLOUD_RUN_BACKEND_URL = 'https://ais-dev-3rkm6fobgoyytw6ll5xdqk-409276822889.us-east5.run.app';

export const BACKEND_URL = (((import.meta as any).env?.VITE_API_URL) || '').replace(/\/$/, '');

export function getEffectiveBackendUrl(): string {
  if (BACKEND_URL) return BACKEND_URL;
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname.endsWith('github.io') || window.location.protocol === 'file:') {
    return CLOUD_RUN_BACKEND_URL;
  }
  return window.location.origin;
}

export function setAuthToken(token: string | null) {
  authToken = token || null;
  refreshSocketAuth();
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  currentOnlineUsersList = [];
  refreshSocketAuth();
}

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

export function refreshSocketAuth() {
  if (!socket) return;
  try {
    socket.disconnect();
    socket.connect();
  } catch {
    // Ignore socket refresh errors when standby
  }
}

if (typeof window !== 'undefined') {
  const targetServer = getEffectiveBackendUrl();
  try {
    socket = io(targetServer, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      timeout: 10000,
      auth: (cb) => cb({ token: authToken }),
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Gameland Real-Time Backend:', targetServer);
    });

    socket.on('connect_error', (err) => {
      console.warn('ℹ️ Backend Socket connection standby:', err.message || err);
    });

    socket.on('users:count', (data: { count: number }) => {
      if (data && typeof data.count === 'number') {
        currentOnlineCount = data.count;
        window.dispatchEvent(new CustomEvent('gameland_online_users_update', { detail: data.count }));
      }
    });

    // Admin-only real-time online users list
    socket.on('users:online_updated', (list: OnlineUserInfo[]) => {
      if (Array.isArray(list)) {
        currentOnlineUsersList = list;
        window.dispatchEvent(new CustomEvent('gameland_online_users_list_update', { detail: list }));
      }
    });

    // Admin-only full directory updates from server (sanitized, no password hashes)
    socket.on('users:synced_all', (serverUsers: Record<string, any>) => {
      if (serverUsers && typeof serverUsers === 'object') {
        try {
          const raw = localStorage.getItem(USERS_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          const merged: Record<string, any> = { ...existing };

          Object.entries(serverUsers).forEach(([key, rec]) => {
            const lowerKey = key.toLowerCase();
            if (rec && typeof rec === 'object') {
              merged[lowerKey] = {
                ...(merged[lowerKey] || {}),
                ...rec,
                username: (rec as any).username || (merged[lowerKey] && merged[lowerKey].username) || key,
              };
            }
          });

          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: merged }));
        } catch (e) {
          console.error('Failed to merge server synced users', e);
        }
      }
    });

    // Real-time coin updates from backend
    socket.on('user:coins_updated', (data: { username: string; points: number; operation: string; amount: number; reason?: string }) => {
      if (data && data.username) {
        try {
          const lowerKey = data.username.toLowerCase();
          const raw = localStorage.getItem(USERS_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          if (existing[lowerKey]) {
            existing[lowerKey].points = data.points;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existing));
          }

          const sessionRaw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session && session.username && session.username.toLowerCase() === lowerKey) {
              session.points = data.points;
              localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
              window.dispatchEvent(new CustomEvent('gameland_session_coins_updated', { detail: data }));
            }
          }

          window.dispatchEvent(new CustomEvent('gameland_coins_updated', { detail: data }));
          window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: existing }));
        } catch (err) {
          console.error('Error handling user:coins_updated socket event', err);
        }
      }
    });

    // Real-time VIP updates from backend
    socket.on('user:vip_updated', (data: { username: string; isVip: boolean; vipLevel?: string; vipGrantedAt?: string }) => {
      if (data && data.username) {
        try {
          const lowerKey = data.username.toLowerCase();
          const raw = localStorage.getItem(USERS_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          if (existing[lowerKey]) {
            existing[lowerKey].isVip = data.isVip;
            existing[lowerKey].vipLevel = data.vipLevel;
            existing[lowerKey].vipGrantedAt = data.vipGrantedAt;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existing));
          }

          const sessionRaw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session && session.username && session.username.toLowerCase() === lowerKey) {
              session.isVip = data.isVip;
              session.vipLevel = data.vipLevel;
              session.vipGrantedAt = data.vipGrantedAt;
              localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
              window.dispatchEvent(new CustomEvent('gameland_session_vip_updated', { detail: data }));
            }
          }

          window.dispatchEvent(new CustomEvent('gameland_vip_updated', { detail: data }));
          window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: existing }));
        } catch (err) {
          console.error('Error handling user:vip_updated socket event', err);
        }
      }
    });

    // Mass coins bonus from admin
    socket.on('users:mass_coins_granted', (data: { amount: number; note?: string }) => {
      window.dispatchEvent(new CustomEvent('gameland_mass_coins_granted', { detail: data }));
    });
  } catch (err) {
    console.warn('Socket initialization standby:', err);
  }
}

export function emitSocketUserJoin(username: string) {
  if (socket && socket.connected && authToken) {
    socket.emit('user:join', { username });
  }
}

export function emitSocketUserActivity(currentGame: string | null) {
  if (socket && socket.connected && authToken) {
    socket.emit('user:activity', { currentGame });
  }
}

export function getSocketOnlineUserCount(): number {
  return currentOnlineCount;
}

export function getSocketOnlineUsersList(): OnlineUserInfo[] {
  return currentOnlineUsersList;
}

export async function fetchOnlineUsersFromServer(): Promise<OnlineUserInfo[] | null> {
  if (typeof window === 'undefined' || !authToken) return null;
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/online`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.onlineUsers)) {
        currentOnlineUsersList = data.onlineUsers;
        window.dispatchEvent(new CustomEvent('gameland_online_users_list_update', { detail: data.onlineUsers }));
        return data.onlineUsers;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch online users list:', err);
  }
  return null;
}

// Admin-only HTTP sync (never sends unauthenticated Socket.IO broadcasts)
export function emitSocketUsersSync(users: Record<string, any>) {
  if (typeof window === 'undefined' || !authToken) return;
  const backend = getEffectiveBackendUrl();
  if (!backend) return;

  // Strip any passwordHash fields before syncing admin edits
  const sanitized: Record<string, any> = {};
  Object.entries(users).forEach(([key, rec]) => {
    if (rec && typeof rec === 'object') {
      const { passwordHash: _ph, password: _pw, ...safe } = rec as Record<string, any>;
      sanitized[key] = safe;
    }
  });

  fetch(`${backend}/api/users/sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ users: sanitized }),
  }).catch(() => {});
}

export async function fetchServerUsersSync(): Promise<Record<string, any> | null> {
  if (typeof window === 'undefined' || !authToken) return null;
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : {};
        const merged: Record<string, any> = { ...existing };

        Object.entries(data).forEach(([key, rec]) => {
          const lowerKey = key.toLowerCase();
          if (rec && typeof rec === 'object') {
            merged[lowerKey] = {
              ...(merged[lowerKey] || {}),
              ...(rec as any),
              username: (rec as any).username || (merged[lowerKey] && merged[lowerKey].username) || key,
            };
          }
        });

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: merged }));
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to fetch user accounts sync from server', err);
  }
  return null;
}

export async function claimTestPassOnServer(): Promise<{
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}> {
  if (typeof window === 'undefined') return { success: false, error: 'No browser context' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/auth/claim-test-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function registerUserOnServer(payload: {
  username: string;
  password: string;
  name?: string;
  email?: string;
}): Promise<{ success: boolean; user?: any; token?: string; error?: string; status?: number }> {
  if (typeof window === 'undefined') return { success: false, error: 'No browser context' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ...data, status: res.status };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function updatePasswordOnServer(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !authToken) return { success: false, error: 'Not authenticated' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}/password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function toggleAdminRoleOnServer(
  username: string,
  isAdmin: boolean
): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> {
  if (typeof window === 'undefined' || !authToken) return { success: false, error: 'Not authenticated' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}/admin-role`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isAdmin }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// Authoritative Coin Operations
export async function cloudRunUpdateCoins(
  username: string,
  amount: number,
  operation: 'add' | 'deduct' | 'set' = 'add',
  reason?: string
): Promise<{ success: boolean; points?: number; error?: string }> {
  if (typeof window === 'undefined' || !authToken) return { success: false, error: 'Not authenticated' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}/coins`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, operation, reason }),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Coin update standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

// Authoritative VIP Operations
export async function cloudRunUpdateVip(
  username: string,
  isVip: boolean,
  vipLevel?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  if (typeof window === 'undefined' || !authToken) return { success: false, error: 'Not authenticated' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}/vip`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isVip, vipLevel, vipGrantedAt: new Date().toISOString() }),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('VIP update standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

// Authoritative Mass Coins Airdrop
export async function cloudRunMassCoins(
  amount: number,
  note?: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (typeof window === 'undefined' || !authToken) return { success: false, error: 'Not authenticated' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/mass-coins`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, note }),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Mass coins standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

// Authoritative Promote All VIP
export async function cloudRunPromoteAllVip(
  vipLevel: string = 'Gold'
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (typeof window === 'undefined' || !authToken) return { success: false, error: 'Not authenticated' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/promote-all-vip`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vipLevel }),
    });
    return await res.json();
  } catch (err: any) {
    console.warn('Mass VIP standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}
