import type {
  AppState,
  User,
  Complaint,
  WorkforceMember,
  Department,
  Campaign,
  Notification,
  RewardEntry,
} from './types';

const now = Date.now();
const DAY = 86400000;

export const CITIZENS: User[] = [
  { id: 'c1', name: 'Rahul Sharma', role: 'citizen', email: 'rahul@gmail.com', phone: '9876543210', area: 'Akurdi' },
  { id: 'c2', name: 'Priya Patil', role: 'citizen', email: 'priya@gmail.com', phone: '9876543211', area: 'Nigdi' },
  { id: 'c3', name: 'Amit Deshmukh', role: 'citizen', email: 'amit@gmail.com', phone: '9876543212', area: 'Pimpri' },
  { id: 'c4', name: 'Sneha Joshi', role: 'citizen', email: 'sneha@gmail.com', phone: '9876543213', area: 'Wakad' },
  { id: 'c5', name: 'Vikram Pawar', role: 'citizen', email: 'vikram@gmail.com', phone: '9876543214', area: 'Chinchwad' },
  { id: 'c6', name: 'Anjali Mehta', role: 'citizen', email: 'anjali@gmail.com', phone: '9876543215', area: 'Akurdi' },
  { id: 'c7', name: 'Rohan Kulkarni', role: 'citizen', email: 'rohan@gmail.com', phone: '9876543216', area: 'Nigdi' },
  { id: 'c8', name: 'Divya Nair', role: 'citizen', email: 'divya@gmail.com', phone: '9876543217', area: 'Pimpri' },
];

export const AUTHORITY_USER: User = {
  id: 'a1',
  name: 'Municipal Commissioner',
  role: 'authority',
  email: 'commissioner@pcmc.gov.in',
  phone: '9876500001',
  area: 'Pimpri-Chinchwad',
};

export const INFLUENCERS: User[] = [
  { id: 'i1', name: 'Tejas Deshpande', role: 'influencer', email: 'tejas@gmail.com', phone: '9876500002', area: 'Akurdi' },
  { id: 'i2', name: 'Sakshi More', role: 'influencer', email: 'sakshi@gmail.com', phone: '9876500003', area: 'Wakad' },
];

export const WORKFORCE: WorkforceMember[] = [
  { id: 'w1', name: 'Suresh Kamble', department: 'Solid Waste Management', activeTasks: 1, completedTasks: 24, availability: 'Busy' },
  { id: 'w2', name: 'Mahesh Jadhav', department: 'Public Works Department', activeTasks: 1, completedTasks: 18, availability: 'Available' },
  { id: 'w3', name: 'Ramesh Shinde', department: 'Electrical Department', activeTasks: 0, completedTasks: 31, availability: 'Available' },
  { id: 'w4', name: 'Prakash Pawar', department: 'Water Supply Department', activeTasks: 0, completedTasks: 27, availability: 'Offline' },
];

export const WORKFORCE_USER: User = {
  id: 'w1',
  name: 'Suresh Kamble',
  role: 'workforce',
  email: 'suresh@pcmc.gov.in',
  phone: '9876500004',
  area: 'Akurdi',
};

export const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Solid Waste Management', head: 'Anil Kale', totalComplaints: 2, resolved: 1, inProgress: 1 },
  { id: 'd2', name: 'Public Works Department', head: 'Sunil Rao', totalComplaints: 1, resolved: 0, inProgress: 1 },
  { id: 'd3', name: 'Water Supply Department', head: 'Deepak Joshi', totalComplaints: 1, resolved: 0, inProgress: 0 },
  { id: 'd4', name: 'Electrical Department', head: 'Manoj Desai', totalComplaints: 1, resolved: 1, inProgress: 0 },
  { id: 'd5', name: 'Sanitation Department', head: 'Vilas More', totalComplaints: 0, resolved: 0, inProgress: 0 },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'JS-1023',
    title: 'Garbage piling near Akurdi railway station',
    description: 'Garbage has not been collected near Akurdi railway station for three days. It is causing a foul smell and unhygienic conditions.',
    category: 'Waste Management',
    department: 'Solid Waste Management',
    priority: 'High',
    confidence: 94,
    location: 'Akurdi Railway Station, Akurdi',
    coordinates: { lat: 18.6651, lng: 73.7651 },
    citizenId: 'c1',
    citizenName: 'Rahul Sharma',
    status: 'Resolved',
    taskStatus: 'Resolved',
    assignedWorkforceId: 'w1',
    assignedWorkforceName: 'Suresh Kamble',
    imageUrl: 'https://images.pexels.com/photos/2661176/pexels-photo-2661176.jpeg?auto=compress&cs=tinysrgb&w=600',
    beforePhotoUrl: 'https://images.pexels.com/photos/2661176/pexels-photo-2661176.jpeg?auto=compress&cs=tinysrgb&w=600',
    afterPhotoUrl: 'https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=600',
    resolutionNote: 'Garbage cleared and area sanitized. Daily collection schedule restored.',
    rewardPoints: 100,
    createdAt: now - 6 * DAY,
    timeline: [
      { status: 'Submitted', timestamp: now - 6 * DAY, actor: 'Rahul Sharma' },
      { status: 'Verified', timestamp: now - 5 * DAY, actor: 'Municipal Commissioner' },
      { status: 'Assigned', timestamp: now - 5 * DAY, actor: 'Municipal Commissioner', note: 'Assigned to Suresh Kamble' },
      { status: 'In Progress', timestamp: now - 4 * DAY, actor: 'Suresh Kamble' },
      { status: 'Resolved', timestamp: now - 3 * DAY, actor: 'Suresh Kamble', note: 'Garbage cleared and area sanitized' },
    ],
  },
  {
    id: 'JS-1022',
    title: 'Large pothole on Wakad main road',
    description: 'There is a large pothole on the main road in Wakad near the bus stop. It is causing traffic and accidents.',
    category: 'Road Damage',
    department: 'Public Works Department',
    priority: 'High',
    confidence: 91,
    location: 'Wakad Bus Stop, Wakad',
    coordinates: { lat: 18.5984, lng: 73.7747 },
    citizenId: 'c4',
    citizenName: 'Sneha Joshi',
    status: 'In Progress',
    taskStatus: 'In Progress',
    assignedWorkforceId: 'w2',
    assignedWorkforceName: 'Mahesh Jadhav',
    imageUrl: 'https://images.pexels.com/photos/2599538/pexels-photo-2599538.jpeg?auto=compress&cs=tinysrgb&w=600',
    beforePhotoUrl: 'https://images.pexels.com/photos/2599538/pexels-photo-2599538.jpeg?auto=compress&cs=tinysrgb&w=600',
    rewardPoints: 70,
    createdAt: now - 3 * DAY,
    timeline: [
      { status: 'Submitted', timestamp: now - 3 * DAY, actor: 'Sneha Joshi' },
      { status: 'Verified', timestamp: now - 2 * DAY, actor: 'Municipal Commissioner' },
      { status: 'Assigned', timestamp: now - 2 * DAY, actor: 'Municipal Commissioner', note: 'Assigned to Mahesh Jadhav' },
      { status: 'In Progress', timestamp: now - 1 * DAY, actor: 'Mahesh Jadhav' },
    ],
  },
  {
    id: 'JS-1021',
    title: 'Street light not working in Nigdi sector 3',
    description: 'The street light outside my building in Nigdi sector 3 has not been working for a week. The area is very dark at night.',
    category: 'Street Lighting',
    department: 'Electrical Department',
    priority: 'Medium',
    confidence: 93,
    location: 'Sector 3, Nigdi',
    coordinates: { lat: 18.6498, lng: 73.7676 },
    citizenId: 'c2',
    citizenName: 'Priya Patil',
    status: 'Resolved',
    taskStatus: 'Resolved',
    assignedWorkforceId: 'w3',
    assignedWorkforceName: 'Ramesh Shinde',
    imageUrl: 'https://images.pexels.com/photos/265832/pexels-photo-265832.jpeg?auto=compress&cs=tinysrgb&w=600',
    beforePhotoUrl: 'https://images.pexels.com/photos/265832/pexels-photo-265832.jpeg?auto=compress&cs=tinysrgb&w=600',
    afterPhotoUrl: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600',
    resolutionNote: 'Bulb replaced and wiring checked. Street light now working.',
    rewardPoints: 100,
    createdAt: now - 5 * DAY,
    timeline: [
      { status: 'Submitted', timestamp: now - 5 * DAY, actor: 'Priya Patil' },
      { status: 'Verified', timestamp: now - 4 * DAY, actor: 'Municipal Commissioner' },
      { status: 'Assigned', timestamp: now - 4 * DAY, actor: 'Municipal Commissioner', note: 'Assigned to Ramesh Shinde' },
      { status: 'In Progress', timestamp: now - 4 * DAY, actor: 'Ramesh Shinde' },
      { status: 'Resolved', timestamp: now - 3 * DAY, actor: 'Ramesh Shinde', note: 'Bulb replaced' },
    ],
  },
  {
    id: 'JS-1020',
    title: 'Water leakage from main pipe in Pimpri',
    description: 'There is a major water leakage from the main supply pipe in Pimpri near the market. Lots of water is being wasted.',
    category: 'Water Supply',
    department: 'Water Supply Department',
    priority: 'High',
    confidence: 95,
    location: 'Pimpri Market, Pimpri',
    coordinates: { lat: 18.6223, lng: 73.7994 },
    citizenId: 'c3',
    citizenName: 'Amit Deshmukh',
    status: 'Assigned',
    taskStatus: 'Assigned',
    assignedWorkforceId: 'w4',
    assignedWorkforceName: 'Prakash Pawar',
    imageUrl: 'https://images.pexels.com/photos/298935/pexels-photo-298935.jpeg?auto=compress&cs=tinysrgb&w=600',
    rewardPoints: 50,
    createdAt: now - 1 * DAY,
    timeline: [
      { status: 'Submitted', timestamp: now - 1 * DAY, actor: 'Amit Deshmukh' },
      { status: 'Verified', timestamp: now - 1 * DAY + 3600000, actor: 'Municipal Commissioner' },
      { status: 'Assigned', timestamp: now - 1 * DAY + 7200000, actor: 'Municipal Commissioner', note: 'Assigned to Prakash Pawar' },
    ],
  },
  {
    id: 'JS-1019',
    title: 'Overflowing drainage in Chinchwad',
    description: 'The drainage near Chinchwad chowk is overflowing and dirty water is on the road. It is a health hazard.',
    category: 'Sanitation',
    department: 'Sanitation Department',
    priority: 'High',
    confidence: 90,
    location: 'Chinchwad Chowk, Chinchwad',
    coordinates: { lat: 18.6357, lng: 73.7929 },
    citizenId: 'c5',
    citizenName: 'Vikram Pawar',
    status: 'Submitted',
    taskStatus: undefined,
    rewardPoints: 50,
    createdAt: now - 4 * 3600000,
    timeline: [
      { status: 'Submitted', timestamp: now - 4 * 3600000, actor: 'Vikram Pawar' },
    ],
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-001',
    title: 'Clean Our City',
    description: 'Report garbage and sanitation problems using JanSamvad. Let us make Pimpri-Chinchwad cleaner together.',
    civicIssue: 'Waste Management',
    area: 'Akurdi',
    callToAction: 'Report garbage issues now!',
    referralCode: 'JAN-TEJAS-2026',
    influencerId: 'i1',
    influencerName: 'Tejas Deshpande',
    reach: 12400,
    clicks: 1850,
    newUsers: 340,
    complaintsGenerated: 78,
    engagementRate: 14.9,
    createdAt: now - 10 * DAY,
  },
  {
    id: 'CMP-002',
    title: 'Fix Our Roads',
    description: 'Potholes are dangerous. Report every pothole you see and help make our roads safe.',
    civicIssue: 'Road Damage',
    area: 'Wakad',
    callToAction: 'Report potholes today!',
    referralCode: 'JAN-SAKSHI-2026',
    influencerId: 'i2',
    influencerName: 'Sakshi More',
    reach: 8200,
    clicks: 920,
    newUsers: 180,
    complaintsGenerated: 42,
    engagementRate: 11.2,
    createdAt: now - 7 * DAY,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', role: 'citizen', userId: 'c1', title: 'Complaint Resolved', message: 'Your complaint JS-1023 has been resolved. +30 bonus points awarded!', read: false, timestamp: now - 3 * DAY, type: 'success' },
  { id: 'n2', role: 'citizen', userId: 'c1', title: 'Reward Earned', message: 'You earned 50 points for submitting complaint JS-1023.', read: true, timestamp: now - 6 * DAY, type: 'success' },
  { id: 'n3', role: 'authority', userId: 'a1', title: 'New Complaint', message: 'New complaint JS-1019 submitted by Vikram Pawar needs verification.', read: false, timestamp: now - 4 * 3600000, type: 'info' },
  { id: 'n4', role: 'authority', userId: 'a1', title: 'Task Resolved', message: 'Suresh Kamble resolved complaint JS-1023.', read: false, timestamp: now - 3 * DAY, type: 'success' },
  { id: 'n5', role: 'workforce', userId: 'w1', title: 'New Task Assigned', message: 'You have been assigned complaint JS-1023.', read: true, timestamp: now - 5 * DAY, type: 'info' },
  { id: 'n6', role: 'workforce', userId: 'w4', title: 'New Task Assigned', message: 'You have been assigned complaint JS-1020.', read: false, timestamp: now - 1 * DAY, type: 'info' },
  { id: 'n7', role: 'influencer', userId: 'i1', title: 'Campaign Milestone', message: 'Your campaign "Clean Our City" reached 12,400 people!', read: false, timestamp: now - 2 * DAY, type: 'success' },
];

export const INITIAL_REWARDS: RewardEntry[] = [
  { id: 'r1', citizenId: 'c1', points: 50, reason: 'Complaint submitted', complaintId: 'JS-1023', timestamp: now - 6 * DAY },
  { id: 'r2', citizenId: 'c1', points: 20, reason: 'Complaint verified', complaintId: 'JS-1023', timestamp: now - 5 * DAY },
  { id: 'r3', citizenId: 'c1', points: 30, reason: 'Complaint resolved', complaintId: 'JS-1023', timestamp: now - 3 * DAY },
  { id: 'r4', citizenId: 'c2', points: 50, reason: 'Complaint submitted', complaintId: 'JS-1021', timestamp: now - 5 * DAY },
  { id: 'r5', citizenId: 'c2', points: 20, reason: 'Complaint verified', complaintId: 'JS-1021', timestamp: now - 4 * DAY },
  { id: 'r6', citizenId: 'c2', points: 30, reason: 'Complaint resolved', complaintId: 'JS-1021', timestamp: now - 3 * DAY },
  { id: 'r7', citizenId: 'c3', points: 50, reason: 'Complaint submitted', complaintId: 'JS-1020', timestamp: now - 1 * DAY },
  { id: 'r8', citizenId: 'c4', points: 50, reason: 'Complaint submitted', complaintId: 'JS-1022', timestamp: now - 3 * DAY },
  { id: 'r9', citizenId: 'c4', points: 20, reason: 'Complaint verified', complaintId: 'JS-1022', timestamp: now - 2 * DAY },
  { id: 'r10', citizenId: 'c5', points: 50, reason: 'Complaint submitted', complaintId: 'JS-1019', timestamp: now - 4 * 3600000 },
];

export function getInitialState(): AppState {
  return {
    currentUser: null,
    complaints: [...INITIAL_COMPLAINTS],
    workforce: [...WORKFORCE],
    departments: [...DEPARTMENTS],
    campaigns: [...INITIAL_CAMPAIGNS],
    notifications: [...INITIAL_NOTIFICATIONS],
    rewards: [...INITIAL_REWARDS],
    citizens: [...CITIZENS],
  };
}

export function getDemoUsers(): User[] {
  return [
    CITIZENS[0],
    AUTHORITY_USER,
    WORKFORCE_USER,
    INFLUENCERS[0],
  ];
}
