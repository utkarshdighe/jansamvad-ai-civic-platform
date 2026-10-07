export type Role = 'citizen' | 'authority' | 'workforce' | 'influencer';

export type ComplaintStatus =
  | 'Submitted'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type Priority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Assigned' | 'Accepted' | 'In Progress' | 'Work Completed' | 'Resolved';

export interface AIAnalysis {
  category: string;
  department: string;
  priority: Priority;
  confidence: number;
}

export interface TimelineEvent {
  status: string;
  timestamp: number;
  actor: string;
  note?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  priority: Priority;
  confidence: number;
  location: string;
  coordinates: { lat: number; lng: number };
  citizenId: string;
  citizenName: string;
  status: ComplaintStatus;
  taskStatus?: TaskStatus;
  assignedWorkforceId?: string;
  assignedWorkforceName?: string;
  imageUrl?: string;
  videoName?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  resolutionNote?: string;
  rewardPoints: number;
  createdAt: number;
  timeline: TimelineEvent[];
}

export interface WorkforceMember {
  id: string;
  name: string;
  department: string;
  activeTasks: number;
  completedTasks: number;
  availability: 'Available' | 'Busy' | 'Offline';
}

export interface Department {
  id: string;
  name: string;
  head: string;
  totalComplaints: number;
  resolved: number;
  inProgress: number;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  civicIssue: string;
  area: string;
  imageUrl?: string;
  callToAction: string;
  referralCode: string;
  influencerId: string;
  influencerName: string;
  reach: number;
  clicks: number;
  newUsers: number;
  complaintsGenerated: number;
  engagementRate: number;
  createdAt: number;
}

export interface Notification {
  id: string;
  role: Role;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  type: 'info' | 'success' | 'warning';
}

export interface RewardEntry {
  id: string;
  citizenId: string;
  points: number;
  reason: string;
  complaintId?: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  citizenId: string;
  citizenName: string;
  points: number;
  level: number;
  complaints: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  area: string;
  avatar?: string;
}

export interface AppState {
  currentUser: User | null;
  complaints: Complaint[];
  workforce: WorkforceMember[];
  departments: Department[];
  campaigns: Campaign[];
  notifications: Notification[];
  rewards: RewardEntry[];
  citizens: User[];
}
