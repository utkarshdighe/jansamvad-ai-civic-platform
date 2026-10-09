import { User, Shield, HardHat, Megaphone, Building2, ArrowRight, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import type { Role } from '@/lib/types';

export default function RoleSelectionScreen() {
  const { pendingUser, selectRole, logout, isDemoMode } = useStore();
  const { t } = useI18n();

  const roleCards: {
    role: Role;
    title: string;
    description: string;
    icon: typeof User;
    gradient: string;
    iconBg: string;
    ring: string;
    allowed: boolean;
  }[] = [
    {
      role: 'citizen',
      title: t('role.citizen'),
      description: t('role.citizenDesc'),
      icon: User,
      gradient: 'from-blue-600 to-blue-700',
      iconBg: 'bg-blue-50 text-blue-600',
      ring: 'hover:ring-blue-400',
      allowed: isDemoMode || pendingUser?.role === 'citizen',
    },
    {
      role: 'authority',
      title: t('role.authority'),
      description: t('role.authorityDesc'),
      icon: Shield,
      gradient: 'from-teal-600 to-teal-700',
      iconBg: 'bg-teal-50 text-teal-600',
      ring: 'hover:ring-teal-400',
      allowed: isDemoMode || pendingUser?.role === 'authority',
    },
    {
      role: 'workforce',
      title: t('role.workforce'),
      description: t('role.workforceDesc'),
      icon: HardHat,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-50 text-orange-600',
      ring: 'hover:ring-orange-400',
      allowed: isDemoMode || pendingUser?.role === 'workforce',
    },
    {
      role: 'influencer',
      title: t('role.influencer'),
      description: t('role.influencerDesc'),
      icon: Megaphone,
      gradient: 'from-fuchsia-600 to-fuchsia-700',
      iconBg: 'bg-fuchsia-50 text-fuchsia-600',
      ring: 'hover:ring-fuchsia-400',
      allowed: isDemoMode || pendingUser?.role === 'influencer',
    },
  ];

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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('app.name')}</h1>
              <p className="text-sm text-gray-500">{t('app.tagline')}</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">{t('role.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('role.subtitle')}</p>
          {pendingUser && (
            <p className="text-xs text-gray-400 mt-2">
              {t('role.signedInAs')} <span className="font-medium text-gray-600">{pendingUser.name}</span>
              {' · '}
              <button onClick={logout} className="text-blue-600 hover:underline">{t('role.signOut')}</button>
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
                onClick={() => card.allowed && selectRole(card.role)}
                disabled={!card.allowed}
                className={`group text-left p-6 bg-white rounded-2xl border border-gray-200 shadow-sm ring-2 ring-transparent transition-all ${
                  card.allowed ? `hover:shadow-md ${card.ring} cursor-pointer` : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${card.iconBg} shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
                      {card.allowed ? (
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('app.prototype')}
        </p>
      </div>
    </div>
  );
}
