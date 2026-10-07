import { useState } from 'react';
import {
  LayoutDashboard, ClipboardList, History, User as UserIcon,
  CheckCircle2, Play, MapPin, Camera, FileText, Clock, ArrowRight, Image as ImageIcon,
} from 'lucide-react';
import DashboardLayout, { type NavItem } from '@/components/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { PriorityBadge, TaskStatusBadge } from '@/components/ui/Badges';
import Modal from '@/components/ui/Modal';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import type { Complaint, TaskStatus } from '@/lib/types';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'tasks', label: 'My Tasks', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'history', label: 'Task History', icon: <History className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
];

export default function WorkforceDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const titles: Record<string, string> = { dashboard: 'Dashboard', tasks: 'My Tasks', history: 'Task History', profile: 'Profile' };

  return (
    <DashboardLayout navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
      title={titles[activeNav]} subtitle="Field Operations Unit" role="workforce">
      {activeNav === 'dashboard' && <Overview onNavChange={setActiveNav} />}
      {activeNav === 'tasks' && <MyTasks />}
      {activeNav === 'history' && <TaskHistory />}
      {activeNav === 'profile' && <ProfileView />}
    </DashboardLayout>
  );
}

function Overview({ onNavChange }: { onNavChange: (id: string) => void }) {
  const { complaints, currentUser } = useStore();
  const myTasks = complaints.filter((c) => c.assignedWorkforceId === currentUser?.id);
  const assigned = myTasks.filter((c) => c.taskStatus === 'Assigned').length;
  const inProgress = myTasks.filter((c) => c.taskStatus === 'In Progress' || c.taskStatus === 'Accepted').length;
  const completed = myTasks.filter((c) => c.taskStatus === 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Tasks" value={assigned} icon={<ClipboardList className="w-5 h-5" />} color="amber" />
        <StatCard label="In Progress" value={inProgress} icon={<Play className="w-5 h-5" />} color="violet" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Today's Tasks" value={myTasks.length} icon={<Clock className="w-5 h-5" />} color="blue" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Active Tasks</h3>
          <button onClick={() => onNavChange('tasks')} className="text-sm text-blue-600 hover:underline">View all</button>
        </div>
        {myTasks.filter((c) => c.taskStatus !== 'Resolved').length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No active tasks</p>
        ) : (
          <div className="space-y-3">
            {myTasks.filter((c) => c.taskStatus !== 'Resolved').slice(0, 4).map((c) => (
              <div key={c.id} onClick={() => onNavChange('tasks')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div><p className="text-sm font-medium text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.id} · {c.location}</p></div>
                {c.taskStatus && <TaskStatusBadge status={c.taskStatus} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyTasks() {
  const { complaints, currentUser, updateTaskStatus, resolveComplaint, toast } = useStore();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [resolveModal, setResolveModal] = useState(false);
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [note, setNote] = useState('');

  const myTasks = complaints.filter((c) => c.assignedWorkforceId === currentUser?.id && c.taskStatus !== 'Resolved');
  const current = selected ? complaints.find((c) => c.id === selected.id) || selected : null;

  const handleAccept = (c: Complaint) => { updateTaskStatus(c.id, 'Accepted'); toast('Task accepted', 'success'); };
  const handleStart = (c: Complaint) => { updateTaskStatus(c.id, 'In Progress'); toast('Task started', 'success'); };

  const handleResolve = () => {
    if (!current || !beforePhoto || !afterPhoto) { toast('Please upload both before and after photos', 'warning'); return; }
    resolveComplaint(current.id, beforePhoto, afterPhoto, note);
    toast('Complaint resolved successfully!', 'success');
    setResolveModal(false); setBeforePhoto(''); setAfterPhoto(''); setNote(''); setSelected(null);
  };

  return (
    <div className="space-y-4">
      {myTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">No active tasks assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myTasks.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-400">{c.id} · {formatDate(c.createdAt)}</p>
                </div>
                {c.taskStatus && <TaskStatusBadge status={c.taskStatus} />}
              </div>

              {c.imageUrl && <img src={c.imageUrl} alt="Complaint" className="w-full h-40 object-cover rounded-lg mb-3" />}

              <p className="text-sm text-gray-600 mb-3">{c.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</div>
                <div><PriorityBadge priority={c.priority} /></div>
                <div className="col-span-2">Category: <span className="font-medium text-gray-700">{c.category}</span></div>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                {c.taskStatus === 'Assigned' && (
                  <button onClick={() => handleAccept(c)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Accept Task</button>
                )}
                {(c.taskStatus === 'Accepted' || c.taskStatus === 'Assigned') && (
                  <button onClick={() => handleStart(c)} className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 flex items-center gap-1"><Play className="w-3 h-3" /> Start</button>
                )}
                <button onClick={() => setSelected(c)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1"><MapPin className="w-3 h-3" /> View Location</button>
                {c.taskStatus === 'In Progress' && (
                  <button onClick={() => { setSelected(c); setResolveModal(true); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Mark Resolved</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location / Details Modal */}
      <Modal open={!!selected && !resolveModal} onClose={() => setSelected(null)} title={`Task Details - ${current?.id || ''}`} size="md">
        {current && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">{current.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{current.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Location</p><p className="font-medium">{current.location}</p></div>
              <div><p className="text-xs text-gray-400">Category</p><p className="font-medium">{current.category}</p></div>
              <div><p className="text-xs text-gray-400">Priority</p><PriorityBadge priority={current.priority} /></div>
              <div><p className="text-xs text-gray-400">Citizen</p><p className="font-medium">{current.citizenName}</p></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Simulated Location</p>
              <div className="h-32 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <MapPin className="w-6 h-6 text-blue-500 mx-auto" />
                  <p className="text-xs text-gray-500 mt-1">{current.location}</p>
                  <p className="text-[10px] text-gray-400">{current.coordinates.lat.toFixed(4)}, {current.coordinates.lng.toFixed(4)}</p>
                </div>
              </div>
            </div>
            {current.taskStatus === 'In Progress' && (
              <button onClick={() => setResolveModal(true)} className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Mark Resolved
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal open={resolveModal} onClose={() => setResolveModal(false)} title="Resolve Complaint" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Upload Before Photo</label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400">
                <Camera className="w-6 h-6 text-gray-400 mx-auto" />
                <input type="file" accept="image/*" className="hidden" id="before-upload"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setBeforePhoto(URL.createObjectURL(f)); }} />
                <label htmlFor="before-upload" className="text-xs text-emerald-600 cursor-pointer mt-1 block">{beforePhoto ? 'Photo selected' : 'Click to upload'}</label>
              </div>
              {beforePhoto && <img src={beforePhoto} alt="Before" className="mt-2 rounded-lg h-24 w-full object-cover" />}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Upload After Photo</label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400">
                <Camera className="w-6 h-6 text-gray-400 mx-auto" />
                <input type="file" accept="image/*" className="hidden" id="after-upload"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setAfterPhoto(URL.createObjectURL(f)); }} />
                <label htmlFor="after-upload" className="text-xs text-emerald-600 cursor-pointer mt-1 block">{afterPhoto ? 'Photo selected' : 'Click to upload'}</label>
              </div>
              {afterPhoto && <img src={afterPhoto} alt="After" className="mt-2 rounded-lg h-24 w-full object-cover" />}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Resolution Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Describe what was done..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <button onClick={handleResolve} disabled={!beforePhoto || !afterPhoto}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Confirm Resolution
          </button>
        </div>
      </Modal>
    </div>
  );
}

function TaskHistory() {
  const { complaints, currentUser } = useStore();
  const completed = complaints.filter((c) => c.assignedWorkforceId === currentUser?.id && c.taskStatus === 'Resolved');

  return (
    <div className="space-y-4">
      {completed.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <History className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-400 mt-3">No completed tasks yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['ID', 'Title', 'Category', 'Location', 'Date', 'Resolution'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completed.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{c.id}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-48 truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600">{c.category}</td>
                    <td className="px-4 py-3 text-gray-600">{c.location}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-48 truncate">{c.resolutionNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileView() {
  const { currentUser, complaints, workforce } = useStore();
  if (!currentUser) return null;
  const wf = workforce.find((w) => w.id === currentUser.id);
  const myTasks = complaints.filter((c) => c.assignedWorkforceId === currentUser.id);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-2xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentUser.name}</h3>
            <p className="text-sm text-gray-500">Field Workforce · {wf?.department}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium">{currentUser.email}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium">{currentUser.phone}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Department</p><p className="text-sm font-medium">{wf?.department}</p></div>
          <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Status</p><p className="text-sm font-medium">{wf?.availability}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Tasks" value={myTasks.length} icon={<ClipboardList className="w-5 h-5" />} color="blue" />
        <StatCard label="Resolved" value={wf?.completedTasks || 0} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <StatCard label="Active" value={wf?.activeTasks || 0} icon={<Clock className="w-5 h-5" />} color="amber" />
      </div>
    </div>
  );
}
