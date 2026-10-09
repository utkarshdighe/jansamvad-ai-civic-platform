import { useState } from 'react';
import {
  LayoutDashboard, ClipboardList, Map, Building2, HardHat, BarChart3, Bell,
  CheckCircle2, XCircle, AlertTriangle, Clock, MapPin, Cpu, TrendingUp,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from '@/components/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badges';
import Modal from '@/components/ui/Modal';
import BarChart, { DonutChart } from '@/components/ui/Charts';
import ComplaintDetailModal from '@/components/ComplaintDetailModal';
import { useStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Complaint, Priority } from '@/lib/types';

const navItems: NavItem[] = [];

function useNavItems(): NavItem[] {
  const { t } = useI18n();
  return [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'complaints', label: t('nav.complaints'), icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'map', label: t('nav.map'), icon: <Map className="w-4 h-4" /> },
    { id: 'departments', label: t('nav.departments'), icon: <Building2 className="w-4 h-4" /> },
    { id: 'workforce', label: t('nav.workforce'), icon: <HardHat className="w-4 h-4" /> },
    { id: 'analytics', label: t('nav.analytics'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'notifications', label: t('nav.notifications'), icon: <Bell className="w-4 h-4" /> },
  ];
}

export default function AuthorityDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const { t } = useI18n();
  const navItems = useNavItems();
  const titles: Record<string, string> = {
    dashboard: t('nav.dashboard'), complaints: t('auth_dash.complaintMgmt'), map: t('auth_dash.complaintMap'),
    departments: t('nav.departments'), workforce: t('nav.workforce'), analytics: t('nav.analytics'), notifications: t('nav.notifications'),
  };
  const { complaints } = useStore();

  return (
    <DashboardLayout navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
      title={titles[activeNav]} subtitle={t('layout.municipalCorp')} role="authority">
      {activeNav === 'dashboard' && <Overview complaints={complaints} onNavChange={setActiveNav} />}
      {activeNav === 'complaints' && <ComplaintManagement />}
      {activeNav === 'map' && <MapView />}
      {activeNav === 'departments' && <DepartmentsView />}
      {activeNav === 'workforce' && <WorkforceView />}
      {activeNav === 'analytics' && <AnalyticsView />}
      {activeNav === 'notifications' && <NotificationsView />}
    </DashboardLayout>
  );
}

function Overview({ complaints, onNavChange }: { complaints: Complaint[]; onNavChange: (id: string) => void }) {
  const { t } = useI18n();
  const newCount = complaints.filter((c) => c.status === 'Submitted').length;
  const highPriority = complaints.filter((c) => c.priority === 'High').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const avgTime = '2.5 days';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label={t('auth_dash.total')} value={complaints.length} icon={<ClipboardList className="w-5 h-5" />} color="blue" />
        <StatCard label={t('auth_dash.new')} value={newCount} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
        <StatCard label={t('auth_dash.highPriority')} value={highPriority} icon={<AlertTriangle className="w-5 h-5" />} color="rose" />
        <StatCard label={t('auth_dash.inProgress')} value={inProgress} icon={<Clock className="w-5 h-5" />} color="violet" />
        <StatCard label={t('auth_dash.resolved')} value={resolved} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label={t('auth_dash.avgTime')} value={avgTime} icon={<TrendingUp className="w-5 h-5" />} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{t('auth_dash.byStatus')}</h3>
          <DonutChart segments={[
            { label: 'Submitted', value: complaints.filter((c) => c.status === 'Submitted').length, color: '#3b82f6' },
            { label: 'Verified', value: complaints.filter((c) => c.status === 'Verified').length, color: '#06b6d4' },
            { label: 'Assigned', value: complaints.filter((c) => c.status === 'Assigned').length, color: '#f59e0b' },
            { label: 'In Progress', value: complaints.filter((c) => c.status === 'In Progress').length, color: '#8b5cf6' },
            { label: 'Resolved', value: complaints.filter((c) => c.status === 'Resolved').length, color: '#10b981' },
          ].filter((s) => s.value > 0)} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{t('auth_dash.pendingActions')}</h3>
          <div className="space-y-2">
            {complaints.filter((c) => ['Submitted', 'Verified'].includes(c.status)).slice(0, 5).map((c) => (
              <div key={c.id} onClick={() => onNavChange('complaints')}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div><p className="text-sm font-medium text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.id} · {c.citizenName}</p></div>
                <StatusBadge status={c.status} />
              </div>
            ))}
            {complaints.filter((c) => ['Submitted', 'Verified'].includes(c.status)).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">{t('auth_dash.noPending')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintManagement() {
  const { t } = useI18n();
  const { complaints, workforce, verifyComplaint, rejectComplaint, assignWorkforce, setComplaintPriority, toast } = useStore();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState('All');
  const [assignModal, setAssignModal] = useState(false);
  const [priorityModal, setPriorityModal] = useState(false);
  const [workforceId, setWorkforceId] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('Medium');

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);
  const currentComplaint = selected ? complaints.find((c) => c.id === selected.id) || selected : null;

  const handleAssign = () => {
    if (!currentComplaint || !workforceId) return;
    assignWorkforce(currentComplaint.id, workforceId);
    toast(t('auth_dash.assigned', { id: currentComplaint.id, name: workforce.find((w) => w.id === workforceId)?.name || '' }), 'success');
    setAssignModal(false);
    setWorkforceId('');
  };

  const handlePriority = () => {
    if (!currentComplaint) return;
    setComplaintPriority(currentComplaint.id, newPriority);
    toast(t('auth_dash.priorityChanged', { priority: newPriority }), 'success');
    setPriorityModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['All', 'Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'All' ? t('filter.all') : t(`filter.${f.toLowerCase().replace(' ', '').replace('progress', 'InProgress')}`) || t(`status.${f}`)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Citizen', 'Category', 'Dept', 'Priority', 'Location', 'Date', 'Status', 'Workforce', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">{h === 'ID' ? t('myComplaints.table.id') : h === 'Citizen' ? t('myComplaints.table.citizen') : h === 'Category' ? t('myComplaints.table.category') : h === 'Dept' ? t('myComplaints.table.dept') : h === 'Priority' ? t('myComplaints.table.priority') : h === 'Location' ? t('myComplaints.table.location') : h === 'Date' ? t('myComplaints.table.date') : h === 'Status' ? t('myComplaints.table.status') : h === 'Workforce' ? t('myComplaints.table.workforce') : t('myComplaints.table.action')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">{c.id}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.citizenName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.category}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.department}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.location}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.assignedWorkforceName || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(c)} className="text-xs text-blue-600 hover:underline font-medium">{t('auth_dash.open')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ComplaintDetailModal complaint={currentComplaint} open={!!selected} onClose={() => setSelected(null)}
        actions={currentComplaint && currentComplaint.status !== 'Rejected' && currentComplaint.status !== 'Resolved' && (
          <>
            {currentComplaint.status === 'Submitted' && (
              <button onClick={() => { verifyComplaint(currentComplaint.id); toast(t('auth_dash.verified'), 'success'); setSelected(null); }}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t('auth_dash.verify')}
              </button>
            )}
            {currentComplaint.status !== 'Submitted' && (
              <button onClick={() => { setAssignModal(true); }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5">
                <HardHat className="w-4 h-4" /> {t('auth_dash.assignWorkforce')}
              </button>
            )}
            <button onClick={() => { setNewPriority(currentComplaint.priority); setPriorityModal(true); }}
              className="px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {t('auth_dash.changePriority')}
            </button>
            <button onClick={() => { rejectComplaint(currentComplaint.id); toast(t('auth_dash.rejected'), 'warning'); setSelected(null); }}
              className="px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {t('auth_dash.reject')}
            </button>
          </>
        )}
      />

      {/* Assign Workforce Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title={t('auth_dash.assignTitle')} size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{t('auth_dash.selectWorkforceToAssign', { id: currentComplaint?.id || '' })}</p>
          <select value={workforceId} onChange={(e) => setWorkforceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">{t('auth_dash.selectWorkforce')}</option>
            {workforce.map((w) => (
              <option key={w.id} value={w.id}>{w.name} - {w.department} ({w.availability})</option>
            ))}
          </select>
          <button onClick={handleAssign} disabled={!workforceId}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {t('auth_dash.assign')}
          </button>
        </div>
      </Modal>

      {/* Change Priority Modal */}
      <Modal open={priorityModal} onClose={() => setPriorityModal(false)} title={t('auth_dash.priorityTitle')} size="sm">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
              <button key={p} onClick={() => setNewPriority(p)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 ${newPriority === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                {p === 'High' ? t('priority.High') : p === 'Medium' ? t('priority.Medium') : t('priority.Low')}
              </button>
            ))}
          </div>
          <button onClick={handlePriority}
            className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
            {t('auth_dash.confirm')}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MapView() {
  const { t } = useI18n();
  const { complaints } = useStore();
  const [selected, setSelected] = useState<Complaint | null>(null);

  // Simulated map positions (percentages on a stylized map background)
  const positions: Record<string, { x: number; y: number }> = {};
  complaints.forEach((c, i) => {
    // Distribute based on coordinates relative to Pune area
    const x = ((c.coordinates.lng - 73.75) / 0.08) * 80 + 10;
    const y = ((18.68 - c.coordinates.lat) / 0.08) * 80 + 10;
    positions[c.id] = { x: Math.max(5, Math.min(90, x)), y: Math.max(5, Math.min(90, y)) };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-full" /> {t('auth_dash.highP')}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-full" /> {t('auth_dash.medP')}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400 rounded-full" /> {t('auth_dash.lowP')}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative w-full h-[500px] bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 rounded-lg overflow-hidden border border-gray-200">
          {/* Stylized map grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          {/* Area labels */}
          {['Akurdi', 'Nigdi', 'Pimpri', 'Wakad', 'Chinchwad'].map((area, i) => (
            <span key={area} className="absolute text-xs font-medium text-gray-400"
              style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}>
              {area}
            </span>
          ))}

          {complaints.map((c) => {
            const pos = positions[c.id];
            const color = c.priority === 'High' ? 'bg-rose-500' : c.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400';
            return (
              <button key={c.id} onClick={() => setSelected(c)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                <span className={`block w-4 h-4 ${color} rounded-full border-2 border-white shadow-md hover:scale-125 transition-transform`} />
                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {c.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">{selected.title}</h3>
              <p className="text-xs text-gray-400">{selected.id} · {selected.citizenName}</p>
            </div>
            <div className="flex gap-2"><PriorityBadge priority={selected.priority} /><StatusBadge status={selected.status} /></div>
          </div>
          <p className="text-sm text-gray-600">{selected.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2"><MapPin className="w-4 h-4" /> {selected.location}</div>
        </div>
      )}
    </div>
  );
}

function DepartmentsView() {
  const { t } = useI18n();
  const { departments, complaints } = useStore();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((d) => {
        const deptComplaints = complaints.filter((c) => c.department === d.name);
        return (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 rounded-lg"><Building2 className="w-5 h-5 text-teal-600" /></div>
              <div><h3 className="font-semibold text-gray-900 text-sm">{d.name}</h3><p className="text-xs text-gray-400">{t('auth_dash.deptHead', { name: d.head })}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-gray-900">{deptComplaints.length}</p><p className="text-xs text-gray-400">{t('auth_dash.deptTotal')}</p></div>
              <div className="p-2 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-600">{deptComplaints.filter((c) => c.status === 'In Progress').length}</p><p className="text-xs text-gray-400">{t('auth_dash.deptActive')}</p></div>
              <div className="p-2 bg-emerald-50 rounded-lg"><p className="text-lg font-bold text-emerald-600">{deptComplaints.filter((c) => c.status === 'Resolved').length}</p><p className="text-xs text-gray-400">{t('auth_dash.deptDone')}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkforceView() {
  const { t } = useI18n();
  const { workforce, complaints } = useStore();
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>{[t('auth_dash.name'), t('nav.departments'), t('wf.activeTasks'), t('auth_dash.completed'), t('auth_dash.availability')].map((h) => (
            <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
          ))}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {workforce.map((w) => {
            const assigned = complaints.filter((c) => c.assignedWorkforceId === w.id && !['Resolved', 'Rejected'].includes(c.status));
            return (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">{w.name.charAt(0)}</div>
                    <span className="font-medium text-gray-900">{w.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{w.department}</td>
                <td className="px-4 py-3 text-gray-600">{assigned.length}</td>
                <td className="px-4 py-3 text-gray-600">{w.completedTasks}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    w.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : w.availability === 'Busy' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>{t(`availability.${w.availability}`)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsView() {
  const { t } = useI18n();
  const { complaints, departments } = useStore();
  const byDept = departments.map((d) => ({
    label: d.name.split(' ')[0],
    value: complaints.filter((c) => c.department === d.name).length,
    color: '#0d9488',
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{t('auth_dash.byDept')}</h3>
          <BarChart data={byDept} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{t('auth_dash.priorityDist')}</h3>
          <DonutChart segments={[
            { label: t('priority.High'), value: complaints.filter((c) => c.priority === 'High').length, color: '#f43f5e' },
            { label: t('priority.Medium'), value: complaints.filter((c) => c.priority === 'Medium').length, color: '#f59e0b' },
            { label: t('priority.Low'), value: complaints.filter((c) => c.priority === 'Low').length, color: '#10b981' },
          ]} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">{t('auth_dash.weeklyTrend')}</h3>
        <BarChart data={[
          { label: 'Wk 1', value: 3, color: '#0d9488' },
          { label: 'Wk 2', value: 5, color: '#0d9488' },
          { label: 'Wk 3', value: 4, color: '#0d9488' },
          { label: 'Wk 4', value: 6, color: '#0d9488' },
        ]} />
      </div>
    </div>
  );
}

function NotificationsView() {
  const { t } = useI18n();
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useStore();
  const myNotifs = notifications.filter((n) => n.role === 'authority' && n.userId === currentUser?.id);
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {myNotifs.filter((n) => !n.read).length > 0 && (
        <button onClick={() => markAllNotificationsRead('authority', currentUser?.id || '')} className="text-sm text-blue-600 hover:underline">{t('layout.markAllAsRead')}</button>
      )}
      {myNotifs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center"><Bell className="w-10 h-10 text-gray-300 mx-auto" /><p className="text-gray-400 mt-3">{t('layout.noNotifications')}</p></div>
      ) : (
        myNotifs.map((n) => (
          <div key={n.id} onClick={() => markNotificationRead(n.id)}
            className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm ${!n.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}>
            <p className="text-sm font-medium text-gray-900">{n.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.timestamp)}</p>
          </div>
        ))
      )}
    </div>
  );
}
