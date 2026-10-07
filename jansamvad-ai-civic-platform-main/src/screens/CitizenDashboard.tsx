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
import { analyzeComplaintEnhanced, CATEGORY_LIST } from '@/lib/ai';
import type { EnhancedAIAnalysis } from '@/lib/ai';
import { formatDate, timeAgo, getLevel } from '@/lib/utils';
import type { Complaint } from '@/lib/types';

const AREAS = ['Akurdi', 'Nigdi', 'Pimpri', 'Wakad', 'Chinchwad', 'Bhosari', 'Hinjewadi'];

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'report', label: 'Report Complaint', icon: <FilePlus className="w-4 h-4" /> },
  { id: 'complaints', label: 'My Complaints', icon: <ListChecks className="w-4 h-4" /> },
  { id: 'track', label: 'Track Complaint', icon: <Search className="w-4 h-4" /> },
  { id: 'rewards', label: 'Rewards', icon: <Trophy className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
];

export default function CitizenDashboard() {
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

  const titles: Record<string, string> = {
    dashboard: 'Dashboard', report: 'Report Complaint', complaints: 'My Complaints',
    track: 'Track Complaint', rewards: 'Rewards', notifications: 'Notifications', profile: 'Profile',
  };

  return (
    <DashboardLayout
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      title={titles[activeNav]}
      subtitle={`Welcome back, ${currentUser?.name}`}
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
  const { currentUser } = useStore();
  const level = getLevel(totalPoints);
  const recent = myComplaints.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={myComplaints.length} icon={<ListChecks className="w-5 h-5" />} color="blue" />
        <StatCard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Reward Points" value={totalPoints} icon={<Trophy className="w-5 h-5" />} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Complaints</h3>
          {recent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No complaints yet</p>
              <button onClick={() => onNavChange('report')} className="mt-3 text-sm text-blue-600 hover:underline">Report your first complaint</button>
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
            <h3 className="font-semibold">Your Level</h3>
          </div>
          <p className="text-3xl font-bold">{level.title}</p>
          <p className="text-sm text-white/80 mt-1">Level {level.level} · {totalPoints} points</p>
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${level.progress}%` }} />
            </div>
            <p className="text-xs text-white/70 mt-1.5">{level.progress}% to next level</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Complaint Activity (Last 7 Days)</h3>
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
      toast('Please enter title and description first', 'warning');
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
      toast(`Complaint ${complaint.id} submitted successfully! +50 points`, 'success');
    } catch {
      toast('Unable to connect to the server. Please try again.', 'warning');
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
        <h3 className="text-xl font-bold text-gray-900">Complaint Submitted!</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Complaint ID</span><span className="font-semibold text-gray-900">{success.id}</span></div>
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Status</span><span className="font-semibold text-blue-600">REGISTERED</span></div>
          <div className="flex justify-between p-2 bg-amber-50 rounded-lg"><span className="text-gray-500">Reward</span><span className="font-semibold text-amber-600">+{success.points} points</span></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { handleReset(); onNavChange('complaints'); }} className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">View My Complaints</button>
          <button onClick={handleReset} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Report Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <p className="text-sm text-blue-700">Multimodal Complaint: Text + Image + Video + Location</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Complaint Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Garbage not collected in my area"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder="Describe the problem in detail..."
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Select category</option>
              {CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Location *</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Select area</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Upload Image</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto" />
              <input type="file" accept="image/*" className="hidden" id="img-upload"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setImageUrl(URL.createObjectURL(f)); }} />
              <label htmlFor="img-upload" className="text-xs text-blue-600 cursor-pointer mt-1 block">
                {imageUrl ? 'Image selected' : 'Click to upload'}
              </label>
            </div>
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg max-h-32 w-full object-cover" />}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Upload Video</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Video className="w-6 h-6 text-gray-400 mx-auto" />
              <input type="file" accept="video/*" className="hidden" id="vid-upload"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideoName(f.name); }} />
              <label htmlFor="vid-upload" className="text-xs text-blue-600 cursor-pointer mt-1 block">
                {videoName ? videoName : 'Click to upload'}
              </label>
            </div>
          </div>
        </div>

        {imageUrl && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" /> Location will be set to: <span className="font-medium">{location || 'Your area'}</span>
          </div>
        )}

        <button onClick={handleAnalyze} disabled={!title.trim() || !description.trim()}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Cpu className="w-4 h-4" /> Run AI Analysis
        </button>
      </div>

      {/* AI Analysis Modal */}
      <Modal open={showAI} onClose={() => !analyzing && setShowAI(false)} title="AI Complaint Analysis" size="md">
        {analyzing ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Cpu className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-700 font-medium">AI is analyzing your complaint...</p>
            <p className="text-sm text-gray-400 mt-1">Classifying category, department, and priority</p>
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
                <p className="font-semibold text-sm text-gray-900">AI Prediction Result</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500">Category</p><p className="text-sm font-medium">{aiResult.category}</p></div>
                <div><p className="text-xs text-gray-500">Department</p><p className="text-sm font-medium">{aiResult.department}</p></div>
                <div><p className="text-xs text-gray-500">Priority</p><p className="text-sm font-medium">{aiResult.priority}</p></div>
                <div><p className="text-xs text-gray-500">Confidence</p><p className="text-sm font-medium text-blue-600">{aiResult.confidence}%</p></div>
                <div><p className="text-xs text-gray-500">Severity</p><p className="text-sm font-medium text-orange-600">{aiResult.severity}/100</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
                <div><p className="text-xs text-gray-500">AI Summary</p><p className="text-sm text-gray-700 mt-0.5">{aiResult.summary}</p></div>
                <div><p className="text-xs text-gray-500">Suggested Action</p><p className="text-sm text-gray-700 mt-0.5">{aiResult.suggestedAction}</p></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAI(false)} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Confirm & Submit
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
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['All', 'Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <ListChecks className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">No complaints found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Title', 'Category', 'Location', 'Priority', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
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
        <label className="text-sm font-medium text-gray-700">Enter Complaint ID</label>
        <div className="flex gap-2 mt-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. JS-2026-000001"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={handleSearch} disabled={searching} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Search className="w-4 h-4" /> {searching ? 'Searching...' : 'Track'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Enter your complaint ID to track its progress</p>
      </div>

      {searched && !result && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400">No complaint found with ID "{query}"</p>
        </div>
      )}

      {result && (
        <TrackResult complaint={result} />
      )}
    </div>
  );
}

// --- Track Result (6-stage pipeline) ---
const PIPELINE_STAGES = ['REGISTERED', 'AI_ANALYZED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

const STAGE_MAP: Record<string, string> = {
  'Submitted': 'REGISTERED',
  'Verified': 'VERIFIED',
  'Assigned': 'ASSIGNED',
  'In Progress': 'IN_PROGRESS',
  'Resolved': 'RESOLVED',
  'Rejected': 'REJECTED',
};

function TrackResult({ complaint }: { complaint: Complaint }) {
  const completedStages = new Set(
    complaint.timeline.map((e) => STAGE_MAP[e.status] || e.status)
  );
  if (complaint.status === 'Rejected') completedStages.add('REJECTED');
  const currentStageIdx = PIPELINE_STAGES.findIndex((s) => completedStages.has(s) && !PIPELINE_STAGES.slice(0, PIPELINE_STAGES.indexOf(s) + 1).some((later) => completedStages.has(later) && PIPELINE_STAGES.indexOf(later) > PIPELINE_STAGES.indexOf(s)));
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
        <p className="text-sm font-medium text-gray-500 mb-4">Complaint Progress Pipeline</p>
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
                    {stage.replace(/_/g, ' ')}
                    {isCurrent && <span className="ml-2 text-xs text-blue-500">Current</span>}
                    {isUpcoming && <span className="ml-2 text-xs text-gray-400">Upcoming</span>}
                  </p>
                  {timelineEvent ? (
                    <>
                      <p className="text-xs text-gray-400 mt-0.5">{timelineEvent.actor} · {formatDate(timelineEvent.timestamp)}</p>
                      {timelineEvent.note && <p className="text-xs text-gray-500 mt-0.5">{timelineEvent.note}</p>}
                    </>
                  ) : isUpcoming ? (
                    <p className="text-xs text-gray-400 mt-0.5">Awaiting previous stage completion</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {complaint.status === 'Rejected' && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-sm text-rose-700 font-medium">This complaint was rejected by the Municipal Authority.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">Category</p>
          <p className="text-sm font-medium text-gray-900">{complaint.category}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">Department</p>
          <p className="text-sm font-medium text-gray-900">{complaint.department}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">Location</p>
          <p className="text-sm font-medium text-gray-900">{complaint.location}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">Priority</p>
          <p className="text-sm font-medium text-gray-900">{complaint.priority}</p>
        </div>
      </div>
    </div>
  );
}

// --- Rewards ---
function Rewards({ myRewards, totalPoints, citizens, currentUserId }: {
  myRewards: { id: string; points: number; reason: string; complaintId?: string; timestamp: number }[];
  totalPoints: number; citizens: { id: string; name: string }[]; currentUserId: string;
}) {
  const { rewards } = useStore();
  const level = getLevel(totalPoints);

  const leaderboard = citizens.map((c) => {
    const pts = rewards.filter((r) => r.citizenId === c.id).reduce((sum, r) => sum + r.points, 0);
    const complaints = rewards.filter((r) => r.citizenId === c.id).length;
    return { citizenId: c.id, citizenName: c.name, points: pts, complaints, level: getLevel(pts).level };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl p-6 text-white">
          <Trophy className="w-8 h-8 mb-3" />
          <p className="text-3xl font-bold">{totalPoints}</p>
          <p className="text-sm text-white/80">Total Points</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Award className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">Level {level.level}</p>
          <p className="text-sm text-gray-500">{level.title}</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${level.progress}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{myRewards.length}</p>
          <p className="text-sm text-gray-500">Rewards Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Rewards</h3>
          {myRewards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No rewards yet</p>
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
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 8).map((entry, i) => (
              <div key={entry.citizenId} className={`flex items-center gap-3 p-2.5 rounded-lg ${entry.citizenId === currentUserId ? 'bg-blue-50 border border-blue-200' : ''}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{entry.citizenName}</span>
                <span className="text-xs text-gray-400">Lv {entry.level}</span>
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
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useStore();
  const myNotifs = notifications.filter((n) => n.role === 'citizen' && n.userId === currentUser?.id);
  const unread = myNotifs.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {unread > 0 && (
        <button onClick={() => markAllNotificationsRead('citizen', currentUser?.id || '')}
          className="text-sm text-blue-600 hover:underline">Mark all as read</button>
      )}
      {myNotifs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">No notifications</p>
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
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-900">{currentUser.email}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900">{currentUser.phone}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Area</p><p className="text-sm font-medium text-gray-900">{currentUser.area}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Role</p><p className="text-sm font-medium text-gray-900 capitalize">{currentUser.role}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Level</p><p className="text-sm font-medium text-gray-900">{level.title} (Lv {level.level})</p></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Complaints" value={myComplaints.length} icon={<ListChecks className="w-5 h-5" />} color="blue" />
        <StatCard label="Resolved" value={myComplaints.filter((c) => c.status === 'Resolved').length} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Points" value={myPoints} icon={<Trophy className="w-5 h-5" />} color="violet" />
      </div>
    </div>
  );
}
