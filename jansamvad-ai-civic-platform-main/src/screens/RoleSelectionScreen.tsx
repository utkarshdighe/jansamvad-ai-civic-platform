import { User, Shield, HardHat, Megaphone, Building2, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

const roleCards: {
  role: Role;
  title: string;
  description: string;
  icon: typeof User;
  gradient: string;
  iconBg: string;
  ring: string;
}[] = [
  {
    role: 'citizen',
    title: 'Citizen',
    description: 'Access citizen complaint reporting, my complaints, tracking, rewards and notifications.',
    icon: User,
    gradient: 'from-blue-600 to-blue-700',
    iconBg: 'bg-blue-50 text-blue-600',
    ring: 'hover:ring-blue-400',
  },
  {
    role: 'authority',
    title: 'Municipal Authority',
    description: 'Access municipal complaint management, verification, assignment and administration.',
    icon: Shield,
    gradient: 'from-teal-600 to-teal-700',
    iconBg: 'bg-teal-50 text-teal-600',
    ring: 'hover:ring-teal-400',
  },
  {
    role: 'workforce',
    title: 'Field Workforce',
    description: 'Access assigned complaints, field work, status updates and resolution.',
    icon: HardHat,
    gradient: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-50 text-orange-600',
    ring: 'hover:ring-orange-400',
  },
  {
    role: 'influencer',
    title: 'Influencer / Reporter',
    description: 'Access civic reports, complaint visibility and community engagement.',
    icon: Megaphone,
    gradient: 'from-fuchsia-600 to-fuchsia-700',
    iconBg: 'bg-fuchsia-50 text-fuchsia-600',
    ring: 'hover:ring-fuchsia-400',
  },
];

export default function RoleSelectionScreen() {
  const { pendingUser, selectRole, logout } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">JanSamvad</h1>
              <p className="text-sm text-gray-500">AI-Powered Municipal Corporation Platform</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Choose Your Role</h2>
          <p className="text-sm text-gray-500 mt-1">Select the portal you want to access</p>
          {pendingUser && (
            <p className="text-xs text-gray-400 mt-2">
              Signed in as <span className="font-medium text-gray-600">{pendingUser.name}</span>
              {' · '}
              <button onClick={logout} className="text-blue-600 hover:underline">Sign out</button>
            </p>
          )}
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.role}
                onClick={() => selectRole(card.role)}
                className={`group text-left p-6 bg-white rounded-2xl border border-gray-200 shadow-sm ring-2 ring-transparent transition-all hover:shadow-md ${card.ring}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${card.iconBg} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          JanSamvad uses simulated authentication for this prototype
        </p>
      </div>
    </div>
  );
}
