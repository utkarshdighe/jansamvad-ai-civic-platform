import type { ComplaintStatus, Priority, TaskStatus } from './types';

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function statusColor(status: ComplaintStatus): string {
  switch (status) {
    case 'Submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Verified': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'Assigned': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'In Progress': return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'High': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function taskStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'Assigned': return 'bg-amber-100 text-amber-700';
    case 'Accepted': return 'bg-blue-100 text-blue-700';
    case 'In Progress': return 'bg-violet-100 text-violet-700';
    case 'Work Completed': return 'bg-cyan-100 text-cyan-700';
    case 'Resolved': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function getLevel(points: number): { level: number; title: string; next: number; progress: number } {
  const levels = [
    { level: 1, title: 'Civic Beginner', min: 0 },
    { level: 2, title: 'Civic Reporter', min: 100 },
    { level: 3, title: 'Civic Champion', min: 250 },
    { level: 4, title: 'Civic Leader', min: 500 },
    { level: 5, title: 'Civic Hero', min: 1000 },
  ];
  let current = levels[0];
  for (const l of levels) {
    if (points >= l.min) current = l;
  }
  const nextLevel = levels.find((l) => l.level === current.level + 1);
  const next = nextLevel ? nextLevel.min : current.min;
  const progress = nextLevel ? Math.round(((points - current.min) / (nextLevel.min - current.min)) * 100) : 100;
  return { level: current.level, title: current.title, next, progress };
}
