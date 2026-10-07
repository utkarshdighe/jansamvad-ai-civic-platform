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
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Complaint, Priority } from '@/lib/types';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'complaints', label: 'Complaints', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'map', label: 'Map', icon: <Map className="w-4 h-4" /> },
  { id: 'departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
  { id: 'workforce', label: 'Workforce', icon: <HardHat className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
];

export default function AuthorityDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const titles: Record<string, string> = {
    dashboard: 'Dashboard', complaints: 'Complaint Management', map: 'Complaint Map',
    departments: 'Departments', workforce: 'Workforce', analytics: 'Analytics', notifications: 'Notifications',
  };
  const { complaints } = useStore();

  return (
    <DashboardLayout navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
      title={titles[activeNav]} subtitle="Municipal Corporation, Pimpri-Chinchwad" role="authority">
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
  const newCount = complaints.filter((c) => c.status === 'Submitted').length;
  const highPriority = complaints.filter((c) => c.priority === 'High').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const avgTime = '2.5 days';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total" value={complaints.length} icon={<ClipboardList className="w-5 h-5" />} color="blue" />
        <StatCard label="New" value={newCount} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
        <StatCard label="High Priority" value={highPriority} icon={<AlertTriangle className="w-5 h-5" />} color="rose" />
        <StatCard label="In Progress" value={inProgress} icon={<Clock className="w-5 h-5" />} color="violet" />
        <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Avg Time" value={avgTime} icon={<TrendingUp className="w-5 h-5" />} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Complaints by Status</h3>
          <DonutChart segments={[
            { label: 'Submitted', value: complaints.filter((c) => c.status === 'Submitted').length, color: '#3b82f6' },
            { label: 'Verified', value: complaints.filter((c) => c.status === 'Verified').length, color: '#06b6d4' },
            { label: 'Assigned', value: complaints.filter((c) => c.status === 'Assigned').length, color: '#f59e0b' },
            { label: 'In Progress', value: complaints.filter((c) => c.status === 'In Progress').length, color: '#8b5cf6' },
            { label: 'Resolved', value: complaints.filter((c) => c.status === 'Resolved').length, color: '#10b981' },
          ].filter((s) => s.value > 0)} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pending Actions</h3>
          <div className="space-y-2">
            {complaints.filter((c) => ['Submitted', 'Verified'].includes(c.status)).slice(0, 5).map((c) => (
              <div key={c.id} onClick={() => onNavChange('complaints')}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div><p className="text-sm font-medium text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.id} · {c.citizenName}</p></div>
                <StatusBadge status={c.status} />
              </div>
            ))}
            {complaints.filter((c) => ['Submitted', 'Verified'].includes(c.status)).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No pending actions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintManagement() {
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
    toast(`Complaint ${currentComplaint.id} assigned to ${workforce.find((w) => w.id === workforceId)?.name}`, 'success');
    setAssignModal(false);
    setWorkforceId('');
  };

  const handlePriority = () => {
    if (!currentComplaint) return;
    setComplaintPriority(currentComplaint.id, newPriority);
    toast(`Priority changed to ${newPriority}`, 'success');
    setPriorityModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['All', 'Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Citizen', 'Category', 'Dept', 'Priority', 'Location', 'Date', 'Status', 'Workforce', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
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
                    <button onClick={() => setSelected(c)} className="text-xs text-blue-600 hover:underline font-medium">Open</button>
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
              <button onClick={() => { verifyComplaint(currentComplaint.id); toast('Complaint verified', 'success'); setSelected(null); }}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Verify
              </button>
            )}
            {currentComplaint.status !== 'Submitted' && (
              <button onClick={() => { setAssignModal(true); }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5">
                <HardHat className="w-4 h-4" /> Assign Workforce
              </button>
            )}
            <button onClick={() => { setNewPriority(currentComplaint.priority); setPriorityModal(true); }}
              className="px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Change Priority
            </button>
            <button onClick={() => { rejectComplaint(currentComplaint.id); toast('Complaint rejected', 'warning'); setSelected(null); }}
              className="px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </>
        )}
      />

      {/* Assign Workforce Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Workforce" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Select a workforce member to assign to {currentComplaint?.id}</p>
          <select value={workforceId} onChange={(e) => setWorkforceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Select workforce</option>
            {workforce.map((w) => (
              <option key={w.id} value={w.id}>{w.name} - {w.department} ({w.availability})</option>
            ))}
          </select>
          <button onClick={handleAssign} disabled={!workforceId}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            Assign
          </button>
        </div>
      </Modal>

      {/* Change Priority Modal */}
      <Modal open={priorityModal} onClose={() => setPriorityModal(false)} title="Change Priority" size="sm">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
              <button key={p} onClick={() => setNewPriority(p)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 ${newPriority === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={handlePriority}
            className="w-full px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MapView() {
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
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-full" /> High Priority</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-full" /> Medium Priority</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400 rounded-full" /> Low Priority</span>
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
  const { departments, complaints } = useStore();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((d) => {
        const deptComplaints = complaints.filter((c) => c.department === d.name);
        return (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 rounded-lg"><Building2 className="w-5 h-5 text-teal-600" /></div>
              <div><h3 className="font-semibold text-gray-900 text-sm">{d.name}</h3><p className="text-xs text-gray-400">Head: {d.head}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-lg font-bold text-gray-900">{deptComplaints.length}</p><p className="text-xs text-gray-400">Total</p></div>
              <div className="p-2 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-600">{deptComplaints.filter((c) => c.status === 'In Progress').length}</p><p className="text-xs text-gray-400">Active</p></div>
              <div className="p-2 bg-emerald-50 rounded-lg"><p className="text-lg font-bold text-emerald-600">{deptComplaints.filter((c) => c.status === 'Resolved').length}</p><p className="text-xs text-gray-400">Done</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkforceView() {
  const { workforce, complaints } = useStore();
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>{['Name', 'Department', 'Active Tasks', 'Completed', 'Availability'].map((h) => (
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
                  }`}>{w.availability}</span>
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
          <h3 className="font-semibold text-gray-900 mb-4">Complaints by Department</h3>
          <BarChart data={byDept} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <DonutChart segments={[
            { label: 'High', value: complaints.filter((c) => c.priority === 'High').length, color: '#f43f5e' },
            { label: 'Medium', value: complaints.filter((c) => c.priority === 'Medium').length, color: '#f59e0b' },
            { label: 'Low', value: complaints.filter((c) => c.priority === 'Low').length, color: '#10b981' },
          ]} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Complaint Trend</h3>
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
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useStore();
  const myNotifs = notifications.filter((n) => n.role === 'authority' && n.userId === currentUser?.id);
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {myNotifs.filter((n) => !n.read).length > 0 && (
        <button onClick={() => markAllNotificationsRead('authority', currentUser?.id || '')} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
      )}
      {myNotifs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center"><Bell className="w-10 h-10 text-gray-300 mx-auto" /><p className="text-gray-400 mt-3">No notifications</p></div>
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
