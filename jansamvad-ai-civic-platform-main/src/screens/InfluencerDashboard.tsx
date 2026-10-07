import { useState } from 'react';
import {
  LayoutDashboard, Megaphone, PlusCircle, BarChart3, Gift, User as UserIcon,
  Users, MousePointerClick, TrendingUp, Share2, Copy, QrCode, Link2, Eye, Image as ImageIcon,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from '@/components/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Modal from '@/components/ui/Modal';
import BarChart from '@/components/ui/Charts';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import type { Campaign } from '@/lib/types';

const CIVIC_ISSUES = ['Waste Management', 'Road Damage', 'Street Lighting', 'Water Supply', 'Sanitation', 'Tree & Garden', 'Encroachment'];
const AREAS = ['Akurdi', 'Nigdi', 'Pimpri', 'Wakad', 'Chinchwad', 'Bhosari', 'Hinjewadi'];

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'create', label: 'Create Campaign', icon: <PlusCircle className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'referrals', label: 'Referrals', icon: <Gift className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
];

export default function InfluencerDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const titles: Record<string, string> = {
    dashboard: 'Dashboard', campaigns: 'Campaigns', create: 'Create Campaign',
    analytics: 'Analytics', referrals: 'Referrals', profile: 'Profile',
  };

  return (
    <DashboardLayout navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
      title={titles[activeNav]} subtitle="Civic Awareness & Campaigns" role="influencer">
      {activeNav === 'dashboard' && <Overview onNavChange={setActiveNav} />}
      {activeNav === 'campaigns' && <CampaignsView />}
      {activeNav === 'create' && <CreateCampaign onNavChange={setActiveNav} />}
      {activeNav === 'analytics' && <AnalyticsView />}
      {activeNav === 'referrals' && <ReferralsView />}
      {activeNav === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

function Overview({ onNavChange }: { onNavChange: (id: string) => void }) {
  const { campaigns, currentUser } = useStore();
  const myCampaigns = campaigns.filter((c) => c.influencerId === currentUser?.id);
  const totalReach = myCampaigns.reduce((s, c) => s + c.reach, 0);
  const totalNew = myCampaigns.reduce((s, c) => s + c.newUsers, 0);
  const totalComplaints = myCampaigns.reduce((s, c) => s + c.complaintsGenerated, 0);
  const avgEngagement = myCampaigns.length > 0 ? (myCampaigns.reduce((s, c) => s + c.engagementRate, 0) / myCampaigns.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Campaigns" value={myCampaigns.length} icon={<Megaphone className="w-5 h-5" />} color="fuchsia" />
        <StatCard label="People Reached" value={totalReach.toLocaleString()} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label="New Citizens" value={totalNew} icon={<UserIcon className="w-5 h-5" />} color="emerald" />
        <StatCard label="Complaints Generated" value={totalComplaints} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Active Campaigns</h3>
          <button onClick={() => onNavChange('create')} className="text-sm text-fuchsia-600 hover:underline">Create new</button>
        </div>
        {myCampaigns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No campaigns yet</p>
        ) : (
          <div className="space-y-3">
            {myCampaigns.map((c) => (
              <div key={c.id} onClick={() => onNavChange('campaigns')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div><p className="text-sm font-medium text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.referralCode} · {c.area}</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-gray-900">{c.reach.toLocaleString()}</p><p className="text-xs text-gray-400">reached</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Engagement Rate</h3>
        <p className="text-3xl font-bold text-fuchsia-600">{avgEngagement}%</p>
        <p className="text-sm text-gray-400 mt-1">Average across all campaigns</p>
      </div>
    </div>
  );
}

function CampaignsView() {
  const { campaigns, currentUser, toast } = useStore();
  const myCampaigns = campaigns.filter((c) => c.influencerId === currentUser?.id);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const copyLink = (code: string) => {
    const link = `https://jansamvad.app/ref/${code}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    toast('Referral link copied!', 'success');
  };

  return (
    <div className="space-y-4">
      {myCampaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">No campaigns yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myCampaigns.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-fuchsia-500 to-pink-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{c.title}</h3>
                  <span className="text-xs px-2 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-full font-medium">{c.civicIssue}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 bg-gray-50 rounded"><p className="text-gray-400">Area</p><p className="font-medium text-gray-700">{c.area}</p></div>
                  <div className="p-2 bg-gray-50 rounded"><p className="text-gray-400">Referral Code</p><p className="font-medium text-fuchsia-600">{c.referralCode}</p></div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div><p className="text-sm font-bold text-gray-900">{c.reach.toLocaleString()}</p><p className="text-[10px] text-gray-400">Reach</p></div>
                  <div><p className="text-sm font-bold text-gray-900">{c.clicks}</p><p className="text-[10px] text-gray-400">Clicks</p></div>
                  <div><p className="text-sm font-bold text-gray-900">{c.newUsers}</p><p className="text-[10px] text-gray-400">New Users</p></div>
                  <div><p className="text-sm font-bold text-gray-900">{c.complaintsGenerated}</p><p className="text-[10px] text-gray-400">Complaints</p></div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => setSelected(c)} className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center justify-center gap-1"><BarChart3 className="w-3 h-3" /> Analytics</button>
                  <button onClick={() => copyLink(c.referralCode)} className="flex-1 px-3 py-1.5 bg-fuchsia-600 text-white rounded-lg text-xs font-medium hover:bg-fuchsia-700 flex items-center justify-center gap-1"><Copy className="w-3 h-3" /> Copy Link</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Campaign Analytics" size="md">
        {selected && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-900">{selected.title}</h4>
              <p className="text-xs text-gray-400">Referral: {selected.referralCode}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg"><Eye className="w-5 h-5 text-blue-600 mb-1" /><p className="text-xl font-bold text-gray-900">{selected.reach.toLocaleString()}</p><p className="text-xs text-gray-400">Reach</p></div>
              <div className="p-3 bg-amber-50 rounded-lg"><MousePointerClick className="w-5 h-5 text-amber-600 mb-1" /><p className="text-xl font-bold text-gray-900">{selected.clicks}</p><p className="text-xs text-gray-400">Clicks</p></div>
              <div className="p-3 bg-emerald-50 rounded-lg"><Users className="w-5 h-5 text-emerald-600 mb-1" /><p className="text-xl font-bold text-gray-900">{selected.newUsers}</p><p className="text-xs text-gray-400">New Users</p></div>
              <div className="p-3 bg-fuchsia-50 rounded-lg"><TrendingUp className="w-5 h-5 text-fuchsia-600 mb-1" /><p className="text-xl font-bold text-gray-900">{selected.complaintsGenerated}</p><p className="text-xs text-gray-400">Complaints</p></div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Engagement Rate</p>
              <p className="text-2xl font-bold text-fuchsia-600">{selected.engagementRate}%</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateCampaign({ onNavChange }: { onNavChange: (id: string) => void }) {
  const { addCampaign, currentUser, toast } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [civicIssue, setCivicIssue] = useState('');
  const [area, setArea] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [created, setCreated] = useState<Campaign | null>(null);

  const generateCode = () => {
    const name = currentUser?.name.split(' ')[0]?.toUpperCase() || 'USER';
    return `JAN-${name}-${new Date().getFullYear()}`;
  };

  const handleCreate = () => {
    if (!title.trim() || !description.trim() || !civicIssue || !area) {
      toast('Please fill all required fields', 'warning');
      return;
    }
    const campaign = addCampaign({
      title: title.trim(),
      description: description.trim(),
      civicIssue,
      area,
      imageUrl: imageUrl || undefined,
      callToAction: callToAction || 'Join and report!',
      referralCode: generateCode(),
      influencerId: currentUser?.id || '',
      influencerName: currentUser?.name || '',
    });
    setCreated(campaign);
    toast('Campaign created successfully!', 'success');
  };

  const copyLink = () => {
    if (!created) return;
    navigator.clipboard?.writeText(`https://jansamvad.app/ref/${created.referralCode}`).catch(() => {});
    toast('Referral link copied!', 'success');
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-fuchsia-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Campaign Created!</h3>
        <div className="mt-4 space-y-2 text-sm text-left">
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Campaign</span><span className="font-semibold">{created.title}</span></div>
          <div className="flex justify-between p-2 bg-fuchsia-50 rounded-lg"><span className="text-gray-500">Referral Code</span><span className="font-semibold text-fuchsia-600">{created.referralCode}</span></div>
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg"><span className="text-gray-500">Area</span><span className="font-semibold">{created.area}</span></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={copyLink} className="flex-1 px-4 py-2.5 bg-fuchsia-600 text-white rounded-lg text-sm font-medium hover:bg-fuchsia-700 flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Copy Link</button>
          <button onClick={() => { setCreated(null); onNavChange('campaigns'); }} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">View Campaigns</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Campaign Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Clean Our City"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the campaign..."
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 outline-none resize-none" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Civic Issue *</label>
            <select value={civicIssue} onChange={(e) => setCivicIssue(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-fuchsia-500">
              <option value="">Select issue</option>
              {CIVIC_ISSUES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Area *</label>
            <select value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-fuchsia-500">
              <option value="">Select area</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Campaign Image</label>
          <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-fuchsia-400">
            <input type="file" accept="image/*" className="hidden" id="camp-img"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setImageUrl(URL.createObjectURL(f)); }} />
            <label htmlFor="camp-img" className="cursor-pointer">
              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-xs text-fuchsia-600 mt-1">{imageUrl ? 'Image selected' : 'Click to upload'}</p>
            </label>
          </div>
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg max-h-32 w-full object-cover" />}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Call to Action</label>
          <input value={callToAction} onChange={(e) => setCallToAction(e.target.value)} placeholder="e.g. Report garbage issues now!"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 outline-none" />
        </div>
        <div className="bg-fuchsia-50 rounded-lg p-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-fuchsia-600" />
          <p className="text-sm text-fuchsia-700">Referral code will be: <span className="font-bold">{generateCode()}</span></p>
        </div>
        <button onClick={handleCreate}
          className="w-full px-4 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create Campaign
        </button>
      </div>
    </div>
  );
}

function AnalyticsView() {
  const { campaigns, currentUser } = useStore();
  const myCampaigns = campaigns.filter((c) => c.influencerId === currentUser?.id);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Campaign Reach Over Time</h3>
        <BarChart data={[
          { label: 'Wk 1', value: 3200, color: '#d946ef' },
          { label: 'Wk 2', value: 5100, color: '#d946ef' },
          { label: 'Wk 3', value: 8400, color: '#d946ef' },
          { label: 'Wk 4', value: 12400, color: '#d946ef' },
        ]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {myCampaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">{c.title}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-blue-50 rounded"><p className="text-xs text-gray-400">Reach</p><p className="font-bold">{c.reach.toLocaleString()}</p></div>
              <div className="p-2 bg-amber-50 rounded"><p className="text-xs text-gray-400">Clicks</p><p className="font-bold">{c.clicks}</p></div>
              <div className="p-2 bg-emerald-50 rounded"><p className="text-xs text-gray-400">New Users</p><p className="font-bold">{c.newUsers}</p></div>
              <div className="p-2 bg-fuchsia-50 rounded"><p className="text-xs text-gray-400">Complaints</p><p className="font-bold">{c.complaintsGenerated}</p></div>
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded text-center"><p className="text-xs text-gray-400">Engagement Rate</p><p className="text-lg font-bold text-fuchsia-600">{c.engagementRate}%</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralsView() {
  const { campaigns, currentUser, toast } = useStore();
  const myCampaigns = campaigns.filter((c) => c.influencerId === currentUser?.id);

  const copyLink = (code: string) => {
    navigator.clipboard?.writeText(`https://jansamvad.app/ref/${code}`).catch(() => {});
    toast('Referral link copied!', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Your Referral Codes</h3>
        {myCampaigns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No referral codes yet. Create a campaign first.</p>
        ) : (
          <div className="space-y-3">
            {myCampaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-lg border border-fuchsia-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Link2 className="w-3 h-3 text-fuchsia-500" />
                    <code className="text-xs text-fuchsia-600 font-mono">{c.referralCode}</code>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{c.newUsers} new citizens joined · {c.complaintsGenerated} complaints generated</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyLink(c.referralCode)} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="Copy link">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => toast('QR code generated (demo)', 'info')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="QR Code">
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button onClick={() => toast('Campaign shared (demo)', 'success')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileView() {
  const { currentUser, campaigns } = useStore();
  if (!currentUser) return null;
  const myCampaigns = campaigns.filter((c) => c.influencerId === currentUser.id);
  const totalReach = myCampaigns.reduce((s, c) => s + c.reach, 0);
  const totalNew = myCampaigns.reduce((s, c) => s + c.newUsers, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white flex items-center justify-center text-2xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentUser.name}</h3>
            <p className="text-sm text-gray-500">Influencer · {currentUser.area}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium">{currentUser.email}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium">{currentUser.phone}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Area</p><p className="text-sm font-medium">{currentUser.area}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Campaigns</p><p className="text-sm font-medium">{myCampaigns.length}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Campaigns" value={myCampaigns.length} icon={<Megaphone className="w-5 h-5" />} color="fuchsia" />
        <StatCard label="Reach" value={totalReach.toLocaleString()} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label="New Citizens" value={totalNew} icon={<UserIcon className="w-5 h-5" />} color="emerald" />
      </div>
    </div>
  );
}
