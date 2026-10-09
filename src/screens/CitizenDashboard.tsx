import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FilePlus, ListChecks, Search, Trophy, Bell, User as UserIcon,
  MapPin, Upload, Image as ImageIcon, Video, Cpu, CheckCircle2, Sparkles, TrendingUp, Award, Clock,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from '@/components/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badges';
import Modal from '@/components/ui/Modal';
import ComplaintDetailModal from '@/components/ComplaintDetailModal';
import BarChart from '@/components/ui/Charts';
import { useStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { analyzeComplaintEnhanced, CATEGORY_LIST } from '@/lib/ai';
import type { EnhancedAIAnalysis } from '@/lib/ai';
import { formatDate, timeAgo, getLevel } from '@/lib/utils';
import type { Complaint } from '@/lib/types';

const AREAS = ['Akurdi', 'Nigdi', 'Pimpri', 'Wakad', 'Chinchwad', 'Bhosari', 'Hinjewadi'];

export default function CitizenDashboard() {
  const { t } = useI18n();
  const [activeNav, setActiveNav] = useState('dashboard');
  const { currentUser, complaints, rewards, citizens, fetchUserComplaints } = useStore();

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserComplaints(currentUser.id);
    }
  }, [currentUser?.id, fetchUserComplaints]);

  const myComplaints = complaints.filter((c) => c.citizenId === currentUser?.id);
  const myRewards = rewards.filter((r) => r.citizenId === currentUser?.id);
  const totalPoints = myRewards.reduce((sum, r) => sum + r.points, 0);
  const pending = myComplaints.filter((c) => !['Resolved', 'Rejected'].includes(c.status)).length;
  const resolved = myComplaints.filter((c) => c.status === 'Resolved').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'report', label: t('nav.report'), icon: <FilePlus className="w-4 h-4" /> },
    { id: 'complaints', label: t('nav.myComplaints'), icon: <ListChecks className="w-4 h-4" /> },
    { id: 'track', label: t('nav.track'), icon: <Search className="w-4 h-4" /> },
    { id: 'rewards', label: t('nav.rewards'), icon: <Trophy className="w-4 h-4" /> },
    { id: 'notifications', label: t('nav.notifications'), icon: <Bell className="w-4 h-4" /> },
    { id: 'profile', label: t('nav.profile'), icon: <UserIcon className="w-4 h-4" /> },
  ];

  const titles: Record<string, string> = {
    dashboard: t('nav.dashboard'), report: t('nav.report'), complaints: t('nav.myComplaints'),
    track: t('nav.track'), rewards: t('nav.rewards'), notifications: t('nav.notifications'), profile: t('nav.profile'),
  };

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      title={titles[activeNav]}
      subtitle={t('layout.welcomeBack', { name: currentUser?.name || '' })}
      role="citizen"
    >
      {activeNav === 'dashboard' && <Overview myComplaints={myComplaints} totalPoints={totalPoints} pending={pending} resolved={resolved} onNavChange={setActiveNav} />}
      {activeNav === 'report' && <ReportComplaint onNavChange={setActiveNav} />}
      {activeNav === 'complaints' && <MyComplaints complaints={myComplaints} />}
      {activeNav === 'track' && <TrackComplaint />}
      {activeNav === 'rewards' && <Rewards myRewards={myRewards} totalPoints={totalPoints} citizens={citizens} currentUserId={currentUser?.id || ''} />}
      {activeNav === 'notifications' && <NotificationsView />}
      {activeNav === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

// --- Overview ---
function Overview({ myComplaints, totalPoints, pending, resolved, onNavChange }: {
  myComplaints: Complaint[]; totalPoints: number; pending: number; resolved: number;
  onNavChange: (id: string) => void;
}) {
  const { t } = useI18n();
  const level = getLevel(totalPoints);
  const recent = myComplaints.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('citizen.totalComplaints')} value={myComplaints.length} icon={<ListChecks className="w-5 h-5" />} color="blue" />
        <StatCard label={t('citizen.pending')} value={pending} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label={t('citizen.resolved')} value={resolved} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label={t('citizen.rewardPoints')} value={totalPoints} icon={<Trophy className="w-5 h-5" />} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{t('citizen.recentComplaints')}</h3>
          {recent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">{t('citizen.noComplaints')}</p>
              <button onClick={() => onNavChange('report')} className="mt-3 text-sm text-blue-600 hover:underline">{t('citizen.reportFirst')}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.id} · {formatDate(c.createdAt)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5" />
            <h3 className="font-semibold">{t('citizen.yourLevel')}</h3>
          </div>
          <p className="text-3xl font-bold">{level.title}</p>
          <p className="text-sm text-white/80 mt-1">{t('citizen.level')} {level.level} · {totalPoints} {t('citizen.points')}</p>
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${level.progress}%` }} />
            </div>
            <p className="text-xs text-white/70 mt-1.5">{level.progress}{t('citizen.toNextLevel')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">{t('citizen.complaintActivity')}</h3>
        <BarChart data={[
          { label: 'Mon', value: 1, color: '#3b82f6' },
          { label: 'Tue', value: 0, color: '#3b82f6' },
          { label: 'Wed', value: 2, color: '#3b82f6' },
          { label: 'Thu', value: 1, color: '#3b82f6' },
          { label: 'Fri', value: 0, color: '#3b82f6' },
          { label: 'Sat', value: 1, color: '#3b82f6' },
          { label: 'Sun', value: 1, color: '#3b82f6' },
        ]} />
      </div>
    </div>
  );
}

// --- Report Complaint ---
function ReportComplaint({ onNavChange }: { onNavChange: (id: string) => void }) {
  const { t } = useI18n();
  const { addComplaint, currentUser, toast } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoName, setVideoName] = useState('');
  const [aiResult, setAiResult] = useState<EnhancedAIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [success, setSuccess] = useState<{ id: string; points: number } | null>(null);

  const handleAnalyze = () => {
    if (!title.trim() || !description.trim()) {
      toast(t('report.errTitleDesc'), 'warning');
      return;
    }
    setAnalyzing(true);
    setShowAI(true);
    setTimeout(() => {
      const result = analyzeComplaintEnhanced(description + ' ' + title);
      setAiResult(result);
      setAnalyzing(false);
    }, 2000);
  };

  const handleConfirm = async () => {
    if (!currentUser || !aiResult) return;
    try {
      const complaint = await addComplaint({
        title: title.trim(),
        description: description.trim(),
        category: aiResult.category,
        department: aiResult.department,
        priority: aiResult.priority,
        confidence: aiResult.confidence,
        location: location || currentUser.area,
        coordinates: { lat: 18.65 + Math.random() * 0.02, lng: 73.76 + Math.random() * 0.03 },
        citizenId: currentUser.id,
        citizenName: currentUser.name,
        imageUrl: imageUrl || undefined,
        videoName: videoName || undefined,
      });
      setSuccess({ id: complaint.id, points: 50 });
      toast(t('report.successMsg', { id: complaint.id }), 'success');
    } catch {
      toast(t('report.errServer'), 'warning');
    }
  };

  const handleReset = () => {
    setTitle(''); setDescription(''); setCategory(''); setLocation('');
    setImageUrl(''); setVideoName(''); setAiResult(null); setShowAI(false); setSuccess(null);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{t('report.submitted')}</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">{t('report.complaintId')}</span><span className="font-semibold text-gray-900">{success.id}</span></div>
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">{t('report.status')}</span><span className="font-semibold text-blue-600">REGISTERED</span></div>
          <div className="flex justify-between p-2 bg-amber-50 rounded-lg"><span className="text-gray-500">{t('report.reward')}</span><span className="font-semibold text-amber-600">+{success.points} {t('citizen.points')}</span></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { handleReset(); onNavChange('complaints'); }} className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">{t('report.viewMyComplaints')}</button>
          <button onClick={handleReset} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">{t('report.reportAnother')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <p className="text-sm text-blue-700">{t('report.multimodal')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">{t('report.title')}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('report.titlePlaceholder')}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">{t('report.description')}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder={t('report.descPlaceholder')}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('report.category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">{t('report.selectCategory')}</option>
              {CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t('report.location')}</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">{t('report.selectArea')}</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('report.uploadImage')}</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto" />
              <input type="file" accept="image/*" className="hidden" id="img-upload"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setImageUrl(URL.createObjectURL(f)); }} />
              <label htmlFor="img-upload" className="text-xs text-blue-600 cursor-pointer mt-1 block">
                {imageUrl ? t('report.imageSelected') : t('report.clickUpload')}
              </label>
            </div>
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg max-h-32 w-full object-cover" />}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t('report.uploadVideo')}</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Video className="w-6 h-6 text-gray-400 mx-auto" />
              <input type="file" accept="video/*" className="hidden" id="vid-upload"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideoName(f.name); }} />
              <label htmlFor="vid-upload" className="text-xs text-blue-600 cursor-pointer mt-1 block">
                {videoName ? videoName : t('report.clickUpload')}
              </label>
            </div>
          </div>
        </div>

        {imageUrl && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" /> {t('report.locationSet')} <span className="font-medium">{location || t('report.yourArea')}</span>
          </div>
        )}

        <button onClick={handleAnalyze} disabled={!title.trim() || !description.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Cpu className="w-4 h-4" /> {t('report.runAI')}
        </button>
      </div>

      <Modal open={showAI} onClose={() => !analyzing && setShowAI(false)} title={t('report.aiAnalysis')} size="md">
        {analyzing ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Cpu className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-700 font-medium">{t('report.aiAnalyzing')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('report.aiClassifying')}</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : aiResult ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-sm text-gray-900">{t('report.aiResult')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500">{t('report.aiCategory')}</p><p className="text-sm font-medium">{aiResult.category}</p></div>
                <div><p className="text-xs text-gray-500">{t('report.aiDepartment')}</p><p className="text-sm font-medium">{aiResult.department}</p></div>
                <div><p className="text-xs text-gray-500">{t('report.aiPriority')}</p><p className="text-sm font-medium">{aiResult.priority}</p></div>
                <div><p className="text-xs text-gray-500">{t('report.aiConfidence')}</p><p className="text-sm font-medium text-blue-600">{aiResult.confidence}%</p></div>
                <div><p className="text-xs text-gray-500">{t('report.aiSeverity')}</p><p className="text-sm font-medium text-orange-600">{aiResult.severity}/100</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
                <div><p className="text-xs text-gray-500">{t('report.aiSummary')}</p><p className="text-sm text-gray-700 mt-0.5">{aiResult.summary}</p></div>
                <div><p className="text-xs text-gray-500">{t('report.aiAction')}</p><p className="text-sm text-gray-700 mt-0.5">{aiResult.suggestedAction}</p></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAI(false)} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">{t('report.cancel')}</button>
              <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {t('report.confirmSubmit')}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

// --- My Complaints ---
function MyComplaints({ complaints }: { complaints: Complaint[] }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState('All');

  const filterKeys = ['filter.all', 'filter.submitted', 'filter.verified', 'filter.assigned', 'filter.inProgress', 'filter.resolved'];
  const filterValues = ['All', 'Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterKeys.map((fk, i) => (
          <button key={fk} onClick={() => setFilter(filterValues[i])}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === filterValues[i] ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t(fk)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <ListChecks className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">{t('myComplaints.noFound')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['myComplaints.table.id', 'myComplaints.table.title', 'myComplaints.table.category', 'myComplaints.table.location', 'myComplaints.table.priority', 'myComplaints.table.date', 'myComplaints.table.status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">{t(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">{c.id}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-48 truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.category}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.location}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ComplaintDetailModal complaint={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

// --- Track Complaint ---
function TrackComplaint() {
  const { t } = useI18n();
  const { complaints, fetchComplaint } = useStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Complaint | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const local = complaints.find((c) => c.id.toLowerCase() === query.trim().toLowerCase());
    if (local) {
      setResult(local);
      setSearched(true);
      setSearching(false);
      return;
    }
    const backend = await fetchComplaint(query.trim());
    setResult(backend);
    setSearched(true);
    setSearching(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="text-sm font-medium text-gray-700">{t('track.enterId')}</label>
        <div className="flex gap-2 mt-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('track.placeholder')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={handleSearch} disabled={searching} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Search className="w-4 h-4" /> {searching ? t('track.searching') : t('track.track')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">{t('track.hint')}</p>
      </div>

      {searched && !result && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400">{t('track.notFound', { query })}</p>
        </div>
      )}

      {result && (<TrackResult complaint={result} />)}
    </div>
  );
}

// --- Track Result (6-stage pipeline) ---
const PIPELINE_STAGES = ['REGISTERED', 'AI_ANALYZED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
const STAGE_MAP: Record<string, string> = {
  'Submitted': 'REGISTERED', 'Verified': 'VERIFIED', 'Assigned': 'ASSIGNED',
  'In Progress': 'IN_PROGRESS', 'Resolved': 'RESOLVED', 'Rejected': 'REJECTED',
};
const STAGE_LABELS: Record<string, string> = {
  'REGISTERED': 'filter.submitted', 'AI_ANALYZED': 'report.aiAnalysis',
  'VERIFIED': 'filter.verified', 'ASSIGNED': 'filter.assigned',
  'IN_PROGRESS': 'filter.inProgress', 'RESOLVED': 'filter.resolved',
};

function TrackResult({ complaint }: { complaint: Complaint }) {
  const { t } = useI18n();
  const completedStages = new Set(complaint.timeline.map((e) => STAGE_MAP[e.status] || e.status));
  if (complaint.status === 'Rejected') completedStages.add('REJECTED');
  const lastCompletedIdx = PIPELINE_STAGES.reduce((lastIdx, stage, idx) => completedStages.has(stage) ? idx : lastIdx, -1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{complaint.title}</p>
          <p className="text-sm text-gray-400">{complaint.id} · {formatDate(complaint.createdAt)}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500 mb-4">{t('track.progress')}</p>
        <div className="space-y-0">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = completedStages.has(stage);
            const isCurrent = idx === lastCompletedIdx;
            const isUpcoming = !isCompleted;
            const isRejected = complaint.status === 'Rejected' && stage !== 'REGISTERED' && stage !== 'AI_ANALYZED';
            const timelineEvent = complaint.timeline.find((e) => (STAGE_MAP[e.status] || e.status) === stage);

            return (
              <div key={stage} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                    isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                    isRejected ? 'bg-rose-100 border-rose-300 text-rose-500' :
                    'bg-gray-50 border-gray-200 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  {idx < PIPELINE_STAGES.length - 1 && (
                    <div className={`w-0.5 h-10 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="pb-4 pt-1">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                    {t(STAGE_LABELS[stage] || stage)}
                    {isCurrent && <span className="ml-2 text-xs text-blue-500">{t('track.current')}</span>}
                    {isUpcoming && <span className="ml-2 text-xs text-gray-400">{t('track.upcoming')}</span>}
                  </p>
                  {timelineEvent ? (
                    <>
                      <p className="text-xs text-gray-400 mt-0.5">{timelineEvent.actor} · {formatDate(timelineEvent.timestamp)}</p>
                      {timelineEvent.note && <p className="text-xs text-gray-500 mt-0.5">{timelineEvent.note}</p>}
                    </>
                  ) : isUpcoming ? (
                    <p className="text-xs text-gray-400 mt-0.5">{t('track.awaiting')}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {complaint.status === 'Rejected' && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-rose-700 font-medium">{t('track.rejected')}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('myComplaints.table.category')}</p><p className="text-sm font-medium text-gray-900">{complaint.category}</p></div>
        <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('track.department')}</p><p className="text-sm font-medium text-gray-900">{complaint.department}</p></div>
        <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('myComplaints.table.location')}</p><p className="text-sm font-medium text-gray-900">{complaint.location}</p></div>
        <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('track.priority')}</p><p className="text-sm font-medium text-gray-900">{complaint.priority}</p></div>
      </div>
    </div>
  );
}

// --- Rewards ---
function Rewards({ myRewards, totalPoints, citizens, currentUserId }: {
  myRewards: { id: string; points: number; reason: string; complaintId?: string; timestamp: number }[];
  totalPoints: number; citizens: { id: string; name: string }[]; currentUserId: string;
}) {
  const { t } = useI18n();
  const { rewards } = useStore();
  const level = getLevel(totalPoints);

  const leaderboard = citizens.map((c) => {
    const pts = rewards.filter((r) => r.citizenId === c.id).reduce((sum, r) => sum + r.points, 0);
    return { citizenId: c.id, citizenName: c.name, points: pts, level: getLevel(pts).level };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl p-6 text-white">
          <Trophy className="w-8 h-8 mb-3" />
          <p className="text-3xl font-bold">{totalPoints}</p>
          <p className="text-sm text-white/80">{t('rewards.totalPoints')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Award className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{t('rewards.level', { level: level.level })}</p>
          <p className="text-sm text-gray-500">{level.title}</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${level.progress}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{myRewards.length}</p>
          <p className="text-sm text-gray-500">{t('rewards.rewardsEarned')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{t('rewards.recentRewards')}</h3>
          {myRewards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">{t('rewards.noRewards')}</p>
          ) : (
            <div className="space-y-2">
              {myRewards.slice(0, 8).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.reason}</p>
                    <p className="text-xs text-gray-400">{r.complaintId} · {timeAgo(r.timestamp)}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">+{r.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> {t('rewards.leaderboard')}</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 8).map((entry, i) => (
              <div key={entry.citizenId} className={`flex items-center gap-3 p-2.5 rounded-lg ${entry.citizenId === currentUserId ? 'bg-blue-50 border border-blue-200' : ''}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{entry.citizenName}</span>
                <span className="text-xs text-gray-400">{t('citizen.level')} {entry.level}</span>
                <span className="text-sm font-bold text-gray-900">{entry.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Notifications ---
function NotificationsView() {
  const { t } = useI18n();
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useStore();
  const myNotifs = notifications.filter((n) => n.role === 'citizen' && n.userId === currentUser?.id);
  const unread = myNotifs.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {unread > 0 && (
        <button onClick={() => markAllNotificationsRead('citizen', currentUser?.id || '')}
          className="text-sm text-blue-600 hover:underline">{t('notif.markAllRead')}</button>
      )}
      {myNotifs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">{t('notif.noNotifications')}</p>
        </div>
      ) : (
        myNotifs.map((n) => (
          <div key={n.id} onClick={() => markNotificationRead(n.id)}
            className={`bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer hover:shadow-sm transition-shadow ${!n.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 ${!n.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// --- Profile ---
function ProfileView() {
  const { t } = useI18n();
  const { currentUser, complaints, rewards } = useStore();
  if (!currentUser) return null;
  const myComplaints = complaints.filter((c) => c.citizenId === currentUser.id);
  const myPoints = rewards.filter((r) => r.citizenId === currentUser.id).reduce((sum, r) => sum + r.points, 0);
  const level = getLevel(myPoints);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-2xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentUser.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{currentUser.role} · {currentUser.area}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('profile.email')}</p><p className="text-sm font-medium text-gray-900">{currentUser.email}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('profile.phone')}</p><p className="text-sm font-medium text-gray-900">{currentUser.phone}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('profile.area')}</p><p className="text-sm font-medium text-gray-900">{currentUser.area}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('profile.role')}</p><p className="text-sm font-medium text-gray-900 capitalize">{currentUser.role}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">{t('profile.level')}</p><p className="text-sm font-medium text-gray-900">{level.title} (Lv {level.level})</p></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t('citizen.complaints')} value={myComplaints.length} icon={<ListChecks className="w-5 h-5" />} color="blue" />
        <StatCard label={t('citizen.resolved')} value={myComplaints.filter((c) => c.status === 'Resolved').length} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label={t('rewards.points')} value={myPoints} icon={<Trophy className="w-5 h-5" />} color="violet" />
      </div>
    </div>
  );
}
