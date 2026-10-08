import type { Role, User } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'jansamvad_jwt_token_v1';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface AuthSignupRequest {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
}

export interface AuthSigninRequest {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  ward: string | null;
  department: string | null;
  mobileNumber: string;
}

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  ward: string | null;
  department: string | null;
  createdAt: string;
}

function mapRole(role: string): Role {
  const r = role.toUpperCase();
  if (r === 'CITIZEN') return 'citizen';
  if (r === 'MUNICIPAL_AUTHORITY') return 'authority';
  if (r === 'FIELD_WORKFORCE') return 'workforce';
  if (r === 'INFLUENCER_REPORTER' || r === 'INFLUENCER') return 'influencer';
  return 'citizen';
}

function authResponseToUser(resp: AuthResponseDto): User {
  return {
    id: resp.userId,
    name: resp.fullName,
    email: resp.email,
    role: mapRole(resp.role),
    phone: resp.mobileNumber,
    area: resp.ward || 'Pimpri-Chinchwad',
  };
}

function userResponseToUser(resp: UserResponseDto): User {
  return {
    id: String(resp.id),
    name: resp.fullName,
    email: resp.email,
    role: mapRole(resp.role),
    phone: resp.mobileNumber,
    area: resp.ward || 'Pimpri-Chinchwad',
  };
}

export async function apiSignup(req: AuthSignupRequest): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await handleResponse<AuthResponseDto>(res);
  saveToken(data.token);
  return { token: data.token, user: authResponseToUser(data) };
}

export async function apiSignin(req: AuthSigninRequest): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await handleResponse<AuthResponseDto>(res);
  saveToken(data.token);
  return { token: data.token, user: authResponseToUser(data) };
}

export async function apiGetMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<UserResponseDto>(res);
  return userResponseToUser(data);
}

export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'OPTIONS',
    });
    return res.ok || res.status === 401 || res.status === 400;
  } catch {
    return false;
  }
}

// ---- Complaint API ----

export interface ComplaintRequestDto {
  title: string;
  description: string;
  category: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  videoName?: string;
  priority?: string;
  department?: string;
  aiCategory?: string;
  aiDepartment?: string;
  aiPriority?: string;
  aiConfidence?: number;
  aiSeverity?: number;
  aiSummary?: string;
  aiSuggestedAction?: string;
}

export interface ComplaintResponseDto {
  id: number;
  complaintNumber: string;
  citizenId: number;
  citizenName: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  priority: string | null;
  department: string | null;
  aiCategory: string | null;
  aiDepartment: string | null;
  aiPriority: string | null;
  aiConfidence: number | null;
  aiSeverity: number | null;
  aiSuggestedAction: string | null;
  aiSummary: string | null;
  status: string;
  taskStatus: string | null;
  assignedWorkerId: number | null;
  assignedWorkerName: string | null;
  imageUrl: string | null;
  videoName: string | null;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  resolutionNote: string | null;
  rewardPoints: number;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
  timeline: { status: string; timestamp: string; actor: string; note: string | null }[];
}

export async function apiCreateComplaint(req: ComplaintRequestDto): Promise<ComplaintResponseDto> {
  const res = await fetch(`${API_BASE}/api/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(req),
  });
  return handleResponse<ComplaintResponseDto>(res);
}

export async function apiGetUserComplaints(userId: string): Promise<ComplaintResponseDto[]> {
  const res = await fetch(`${API_BASE}/api/complaints/user/${userId}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<ComplaintResponseDto[]>(res);
}

export async function apiGetComplaint(id: string): Promise<ComplaintResponseDto> {
  const res = await fetch(`${API_BASE}/api/complaints/${id}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<ComplaintResponseDto>(res);
}

export async function apiUpdateComplaintStatus(id: string, status: string, taskStatus?: string, note?: string): Promise<ComplaintResponseDto> {
  const res = await fetch(`${API_BASE}/api/complaints/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status, taskStatus, note }),
  });
  return handleResponse<ComplaintResponseDto>(res);
}

// ---- Chat API ----

export interface ChatMessageDto {
  message: string;
  conversationId?: number;
}

export interface ChatReplyDto {
  conversationId: number;
  reply: string;
}

export interface ChatConversationDto {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageItemDto[];
}

export interface ChatMessageItemDto {
  id: number;
  conversationId: number;
  sender: string;
  message: string;
  createdAt: string;
}

export async function apiSendMessage(message: string, conversationId?: number): Promise<ChatReplyDto> {
  const res = await fetch(`${API_BASE}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ message, conversationId }),
  });
  return handleResponse<ChatReplyDto>(res);
}

export async function apiGetConversations(): Promise<ChatConversationDto[]> {
  const res = await fetch(`${API_BASE}/api/chat/conversations`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<ChatConversationDto[]>(res);
}

export async function apiGetConversationMessages(id: number): Promise<ChatConversationDto> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${id}/messages`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<ChatConversationDto>(res);
}

export async function apiDeleteConversation(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete conversation (${res.status})`);
  }
}
