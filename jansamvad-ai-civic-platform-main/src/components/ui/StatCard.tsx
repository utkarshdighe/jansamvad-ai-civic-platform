import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'gray' | 'fuchsia';
  subtext?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  gray: 'bg-gray-50 text-gray-600',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-600',
};

export default function StatCard({ label, value, icon, color = 'blue', subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between hover:shadow-sm transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>{icon}</div>
    </div>
  );
}
