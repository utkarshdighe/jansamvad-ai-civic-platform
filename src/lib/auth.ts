import type { Role, User } from './types';

export interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  area: string;
}

const ACCOUNTS_KEY = 'jansamvad_accounts_v1';
const SESSION_KEY = 'jansamvad_session_v1';
const TOKEN_KEY = 'jansamvad_jwt_token_v1';

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as Account[];
  } catch {
    // ignore
  }
  return [];
}

function saveAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

export function findAccountByEmail(email: string): Account | undefined {
  return loadAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function signUp(name: string, email: string, password: string, role: Role, phone: string): { ok: true; account: Account } | { ok: false; error: string } {
  const accounts = loadAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists' };
  }
  const account: Account = {
    id: `u${Date.now()}`,
    name,
    email,
    password,
    role,
    phone,
    area: 'Pimpri-Chinchwad',
  };
  accounts.push(account);
  saveAccounts(accounts);
  return { ok: true, account };
}

export function signIn(email: string, password: string): { ok: true; account: Account } | { ok: false; error: string } {
  const account = findAccountByEmail(email);
  if (!account) return { ok: false, error: 'No account found with this email' };
  if (account.password !== password) return { ok: false, error: 'Incorrect password' };
  return { ok: true, account };
}

export function saveSession(user: User): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // ignore
  }
  return null;
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

const PENDING_KEY = 'jansamvad_pending_v1';

export function savePendingUser(user: User): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function loadPendingUser(): User | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // ignore
  }
  return null;
}

export function clearPendingUser(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

export function accountToUser(account: Account): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    phone: account.phone,
    area: account.area,
  };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}
