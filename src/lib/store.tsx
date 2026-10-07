import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type {
  AppState,
  User,
  Complaint,
  Notification,
  RewardEntry,
  Campaign,
  Priority,
  Role,
} from './types';
import { getInitialState } from './mockData';
import { analyzeComplaint } from './ai';
import { signUp as authSignUp, signIn as authSignIn, saveSession, loadSession, clearSession, accountToUser, savePendingUser, loadPendingUser, clearPendingUser, clearToken, type Account } from './auth';
import { apiSignup, apiSignin, apiGetMe, getToken, apiCreateComplaint, apiGetUserComplaints, apiGetComplaint, type ComplaintResponseDto } from './api';

const STORAGE_KEY = 'jansamvad_state_v1';

interface StoreContextValue extends AppState {
  pendingUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  selectRole: (role: Role) => void;
  signUp: (name: string, email: string, password: string, role: Role, phone: string) => Promise<{ ok: true; account?: Account } | { ok: false; error: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: true; user: User } | { ok: false; error: string }>;
  addComplaint: (c: Omit<Complaint, 'id' | 'status' | 'timeline' | 'createdAt' | 'rewardPoints'>) => Promise<Complaint>;
  fetchUserComplaints: (userId: string) => Promise<void>;
  fetchComplaint: (id: string) => Promise<Complaint | null>;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  addTimelineEvent: (id: string, status: string, actor: string, note?: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: Role, userId: string) => void;
  addReward: (r: Omit<RewardEntry, 'id' | 'timestamp'>) => void;
  addCampaign: (c: Omit<Campaign, 'id' | 'createdAt' | 'reach' | 'clicks' | 'newUsers' | 'complaintsGenerated' | 'engagementRate'>) => Campaign;
  assignWorkforce: (complaintId: string, workforceId: string) => void;
  verifyComplaint: (id: string) => void;
  rejectComplaint: (id: string) => void;
  resolveComplaint: (id: string, beforePhotoUrl: string, afterPhotoUrl: string, note: string) => void;
  setComplaintPriority: (id: string, priority: Priority) => void;
  updateTaskStatus: (id: string, taskStatus: Complaint['taskStatus']) => void;
  toast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  toasts: { id: string; message: string; type: 'info' | 'success' | 'warning' }[];
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadState(): AppState {
  const base = getInitialState();
  const session = loadSession();
  if (session) {
    return { ...base, currentUser: session };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return { ...parsed, currentUser: null };
    }
  } catch {
    // ignore
  }
  return base;
}

function loadInitialPending(): User | null {
  return loadPendingUser();
}

let complaintCounter = 1;

function generateComplaintId(): string {
  const num = String(complaintCounter++).padStart(6, '0');
  return `JS-2026-${num}`;
}

function mapBackendStatus(status: string): Complaint['status'] {
  const map: Record<string, Complaint['status']> = {
    'REGISTERED': 'Submitted',
    'AI_ANALYZED': 'Submitted',
    'VERIFIED': 'Verified',
    'ASSIGNED': 'Assigned',
    'IN_PROGRESS': 'In Progress',
    'RESOLVED': 'Resolved',
    'REJECTED': 'Rejected',
  };
  return map[status] || 'Submitted';
}

function mapBackendPriority(priority: string | null): Priority {
  if (!priority) return 'Medium';
  const p = priority.toUpperCase();
  if (p === 'HIGH') return 'High';
  if (p === 'LOW') return 'Low';
  return 'Medium';
}

function mapBackendComplaint(dto: ComplaintResponseDto): Complaint {
  return {
    id: dto.complaintNumber || String(dto.id),
    title: dto.title,
    description: dto.description,
    category: dto.category,
    department: dto.department || '',
    priority: mapBackendPriority(dto.priority),
    confidence: dto.aiConfidence != null ? dto.aiConfidence : 0,
    location: dto.location || '',
    coordinates: { lat: dto.latitude || 0, lng: dto.longitude || 0 },
    citizenId: String(dto.citizenId),
    citizenName: dto.citizenName,
    status: mapBackendStatus(dto.status),
    taskStatus: dto.taskStatus as Complaint['taskStatus'] || undefined,
    assignedWorkforceId: dto.assignedWorkerId != null ? String(dto.assignedWorkerId) : undefined,
    assignedWorkforceName: dto.assignedWorkerName || undefined,
    imageUrl: dto.imageUrl || undefined,
    videoName: dto.videoName || undefined,
    beforePhotoUrl: dto.beforePhotoUrl || undefined,
    afterPhotoUrl: dto.afterPhotoUrl || undefined,
    resolutionNote: dto.resolutionNote || undefined,
    rewardPoints: dto.rewardPoints,
    createdAt: dto.createdAt ? new Date(dto.createdAt).getTime() : Date.now(),
    timeline: (dto.timeline || []).map((t) => ({
      status: t.status,
      timestamp: t.timestamp ? new Date(t.timestamp).getTime() : Date.now(),
      actor: t.actor,
      note: t.note || undefined,
    })),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [pendingUser, setPendingUser] = useState<User | null>(loadInitialPending);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' }[]>([]);

  useEffect(() => {
    try {
      const { currentUser, ...persist } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      // ignore
    }
  }, [state]);

  useEffect(() => {
    const token = getToken();
    if (token && !loadSession() && !loadPendingUser()) {
      apiGetMe()
        .then((user) => {
          savePendingUser(user);
          setPendingUser(user);
        })
        .catch(() => {
          clearToken();
        });
    }
  }, []);

  const toast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `t${Date.now()}${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const login = useCallback((user: User) => {
    saveSession(user);
    setState((s) => ({ ...s, currentUser: user }));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    clearPendingUser();
    clearToken();
    setPendingUser(null);
    setState((s) => ({ ...s, currentUser: null }));
  }, []);

  const selectRole = useCallback((role: Role) => {
    setPendingUser((pending) => {
      if (!pending) return pending;
      const user: User = { ...pending, role };
      saveSession(user);
      clearPendingUser();
      setState((s) => ({ ...s, currentUser: user }));
      return null;
    });
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, role: Role, phone: string) => {
    try {
      const result = await apiSignup({ fullName: name, email, password, mobileNumber: phone });
      return { ok: true as const };
    } catch {
      // Fallback to localStorage
      const result = authSignUp(name, email, password, role, phone);
      if (!result.ok) return { ok: false as const, error: result.error };
      return { ok: true as const, account: result.account };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiSignin({ email, password });
      const user = result.user;
      savePendingUser(user);
      setPendingUser(user);
      return { ok: true as const, user };
    } catch {
      // Fallback to localStorage
      const result = authSignIn(email, password);
      if (!result.ok) return { ok: false as const, error: result.error };
      const user = accountToUser(result.account);
      savePendingUser(user);
      setPendingUser(user);
      return { ok: true as const, user };
    }
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setState((s) => ({
      ...s,
      notifications: [
        { ...n, id: `n${Date.now()}${Math.random()}`, timestamp: Date.now(), read: false },
        ...s.notifications,
      ],
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((role: Role, userId: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.role === role && n.userId === userId ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const addReward = useCallback((r: Omit<RewardEntry, 'id' | 'timestamp'>) => {
    setState((s) => ({
      ...s,
      rewards: [{ ...r, id: `r${Date.now()}${Math.random()}`, timestamp: Date.now() }, ...s.rewards],
    }));
  }, []);

  const addTimelineEvent = useCallback((id: string, status: string, actor: string, note?: string) => {
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === id
          ? { ...c, timeline: [...c.timeline, { status, timestamp: Date.now(), actor, note }] }
          : c
      ),
    }));
  }, []);

  const addComplaint = useCallback(
    async (c: Omit<Complaint, 'id' | 'status' | 'timeline' | 'createdAt' | 'rewardPoints'>) => {
      try {
        const dto = await apiCreateComplaint({
          title: c.title,
          description: c.description,
          category: c.category,
          location: c.location,
          latitude: c.coordinates.lat,
          longitude: c.coordinates.lng,
          imageUrl: c.imageUrl,
          videoName: c.videoName,
          priority: c.priority.toUpperCase(),
          department: c.department,
          aiCategory: c.category,
          aiDepartment: c.department,
          aiPriority: c.priority.toUpperCase(),
          aiConfidence: c.confidence,
        });
        const newComplaint = mapBackendComplaint(dto);
        setState((s) => ({
          ...s,
          complaints: [newComplaint, ...s.complaints],
          rewards: [
            { id: `r${Date.now()}${Math.random()}`, citizenId: c.citizenId, points: 50, reason: 'Complaint submitted', complaintId: newComplaint.id, timestamp: Date.now() },
            ...s.rewards,
          ],
          notifications: [
            { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: c.citizenId, title: 'Complaint Submitted', message: `Your complaint ${newComplaint.id} has been submitted. +50 reward points!`, read: false, timestamp: Date.now(), type: 'success' },
            ...s.notifications,
          ],
        }));
        return newComplaint;
      } catch {
        // Fallback to local in-memory creation
        const id = generateComplaintId();
        const newComplaint: Complaint = {
          ...c,
          id,
          status: 'Submitted',
          taskStatus: undefined,
          rewardPoints: 50,
          createdAt: Date.now(),
          timeline: [{ status: 'Submitted', timestamp: Date.now(), actor: c.citizenName }],
        };
        setState((s) => ({
          ...s,
          complaints: [newComplaint, ...s.complaints],
          rewards: [
            { id: `r${Date.now()}${Math.random()}`, citizenId: c.citizenId, points: 50, reason: 'Complaint submitted', complaintId: id, timestamp: Date.now() },
            ...s.rewards,
          ],
          notifications: [
            { id: `n${Date.now()}${Math.random()}`, role: 'authority' as Role, userId: 'a1', title: 'New Complaint', message: `New complaint ${id} submitted by ${c.citizenName}.`, read: false, timestamp: Date.now(), type: 'info' },
            { id: `n${Date.now()}${Math.random()}1`, role: 'citizen' as Role, userId: c.citizenId, title: 'Complaint Submitted', message: `Your complaint ${id} has been submitted. +50 reward points!`, read: false, timestamp: Date.now(), type: 'success' },
            ...s.notifications,
          ],
        }));
        return newComplaint;
      }
    },
    []
  );

  const fetchUserComplaints = useCallback(async (userId: string) => {
    try {
      const dtos = await apiGetUserComplaints(userId);
      const complaints = dtos.map(mapBackendComplaint);
      setState((s) => {
        const otherComplaints = s.complaints.filter((c) => c.citizenId !== userId);
        return { ...s, complaints: [...complaints, ...otherComplaints] };
      });
    } catch {
      // Backend unavailable — keep existing in-memory complaints
    }
  }, []);

  const fetchComplaint = useCallback(async (id: string): Promise<Complaint | null> => {
    try {
      const dto = await apiGetComplaint(id);
      return mapBackendComplaint(dto);
    } catch {
      return null;
    }
  }, []);

  const updateComplaint = useCallback((id: string, patch: Partial<Complaint>) => {
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const verifyComplaint = useCallback((id: string) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Verified',
                timeline: [...c.timeline, { status: 'Verified', timestamp: Date.now(), actor: 'Municipal Commissioner' }],
              }
            : c
        ),
        rewards: [
          { id: `r${Date.now()}${Math.random()}`, citizenId: complaint.citizenId, points: 20, reason: 'Complaint verified', complaintId: id, timestamp: Date.now() },
          ...s.rewards,
        ],
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Complaint Verified', message: `Your complaint ${id} has been verified. +20 bonus points!`, read: false, timestamp: Date.now(), type: 'success' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const rejectComplaint = useCallback((id: string) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Rejected',
                timeline: [...c.timeline, { status: 'Rejected', timestamp: Date.now(), actor: 'Municipal Commissioner' }],
              }
            : c
        ),
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Complaint Rejected', message: `Your complaint ${id} has been rejected.`, read: false, timestamp: Date.now(), type: 'warning' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const assignWorkforce = useCallback((complaintId: string, workforceId: string) => {
    setState((s) => {
      const wf = s.workforce.find((w) => w.id === workforceId);
      const complaint = s.complaints.find((c) => c.id === complaintId);
      if (!wf || !complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === complaintId
            ? {
                ...c,
                status: 'Assigned',
                taskStatus: 'Assigned',
                assignedWorkforceId: workforceId,
                assignedWorkforceName: wf.name,
                timeline: [...c.timeline, { status: 'Assigned', timestamp: Date.now(), actor: 'Municipal Commissioner', note: `Assigned to ${wf.name}` }],
              }
            : c
        ),
        workforce: s.workforce.map((w) =>
          w.id === workforceId ? { ...w, activeTasks: w.activeTasks + 1, availability: 'Busy' as const } : w
        ),
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'workforce' as Role, userId: workforceId, title: 'New Task Assigned', message: `You have been assigned complaint ${complaintId}.`, read: false, timestamp: Date.now(), type: 'info' },
          { id: `n${Date.now()}${Math.random()}1`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Workforce Assigned', message: `Your complaint ${complaintId} has been assigned to ${wf.name}.`, read: false, timestamp: Date.now(), type: 'info' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const setComplaintPriority = useCallback((id: string, priority: Priority) => {
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === id
          ? { ...c, priority, timeline: [...c.timeline, { status: `Priority changed to ${priority}`, timestamp: Date.now(), actor: 'Municipal Commissioner' }] }
          : c
      ),
    }));
  }, []);

  const updateTaskStatus = useCallback((id: string, taskStatus: Complaint['taskStatus']) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      const statusMap: Record<string, Complaint['status']> = {
        'Accepted': 'Assigned',
        'In Progress': 'In Progress',
        'Work Completed': 'In Progress',
        'Resolved': 'Resolved',
      };
      const newStatus = statusMap[taskStatus || ''] || complaint.status;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                taskStatus: taskStatus || c.taskStatus,
                status: newStatus,
                timeline: [...c.timeline, { status: taskStatus || 'Updated', timestamp: Date.now(), actor: complaint.assignedWorkforceName || 'Workforce' }],
              }
            : c
        ),
      };
    });
  }, []);

  const resolveComplaint = useCallback((id: string, beforePhotoUrl: string, afterPhotoUrl: string, note: string) => {
    setState((s) => {
      const complaint = s.complaints.find((c) => c.id === id);
      if (!complaint) return s;
      return {
        ...s,
        complaints: s.complaints.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Resolved',
                taskStatus: 'Resolved',
                beforePhotoUrl,
                afterPhotoUrl,
                resolutionNote: note,
                rewardPoints: c.rewardPoints + 30,
                timeline: [...c.timeline, { status: 'Resolved', timestamp: Date.now(), actor: c.assignedWorkforceName || 'Workforce', note }],
              }
            : c
        ),
        workforce: s.workforce.map((w) =>
          w.id === complaint.assignedWorkforceId
            ? { ...w, activeTasks: Math.max(0, w.activeTasks - 1), completedTasks: w.completedTasks + 1, availability: 'Available' as const }
            : w
        ),
        rewards: [
          { id: `r${Date.now()}${Math.random()}`, citizenId: complaint.citizenId, points: 30, reason: 'Complaint resolved', complaintId: id, timestamp: Date.now() },
          ...s.rewards,
        ],
        notifications: [
          { id: `n${Date.now()}${Math.random()}`, role: 'citizen' as Role, userId: complaint.citizenId, title: 'Complaint Resolved', message: `Your complaint ${id} has been resolved. +30 bonus points!`, read: false, timestamp: Date.now(), type: 'success' },
          { id: `n${Date.now()}${Math.random()}1`, role: 'authority' as Role, userId: 'a1', title: 'Complaint Resolved', message: `${complaint.assignedWorkforceName || 'Workforce'} resolved complaint ${id}.`, read: false, timestamp: Date.now(), type: 'success' },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const addCampaign = useCallback(
    (c: Omit<Campaign, 'id' | 'createdAt' | 'reach' | 'clicks' | 'newUsers' | 'complaintsGenerated' | 'engagementRate'>) => {
      const newCampaign: Campaign = {
        ...c,
        id: `CMP-${String(Date.now()).slice(-3)}`,
        createdAt: Date.now(),
        reach: 0,
        clicks: 0,
        newUsers: 0,
        complaintsGenerated: 0,
        engagementRate: 0,
      };
      setState((s) => ({ ...s, campaigns: [newCampaign, ...s.campaigns] }));
      return newCampaign;
    },
    []
  );

  const value: StoreContextValue = {
    ...state,
    pendingUser,
    toasts,
    toast,
    dismissToast,
    login,
    logout,
    selectRole,
    signUp,
    signIn,
    addComplaint,
    fetchUserComplaints,
    fetchComplaint,
    updateComplaint,
    addTimelineEvent,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    addReward,
    addCampaign,
    assignWorkforce,
    verifyComplaint,
    rejectComplaint,
    resolveComplaint,
    setComplaintPriority,
    updateTaskStatus,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { analyzeComplaint };
