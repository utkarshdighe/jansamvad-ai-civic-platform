import Modal from '@/components/ui/Modal';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badges';
import { MapPin, User, Calendar, Cpu, Building, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';
import type { Complaint } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
}

export default function ComplaintDetailModal({ complaint, open, onClose, actions }: ComplaintDetailModalProps) {
  if (!complaint) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Complaint ${complaint.id}`} size="xl">
      <div className="space-y-5">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{complaint.title}</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              {complaint.category}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{complaint.description}</p>
        </div>

        {complaint.imageUrl && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Attached Media</p>
            <img src={complaint.imageUrl} alt="Complaint" className="rounded-lg max-h-48 object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" /> {complaint.citizenName}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" /> {complaint.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" /> {formatDateTime(complaint.createdAt)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4 text-gray-400" /> {complaint.department}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-sm text-gray-900">AI Complaint Analysis</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium text-gray-900">{complaint.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm font-medium text-gray-900">{complaint.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Priority</p>
              <p className="text-sm font-medium text-gray-900">{complaint.priority}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Confidence</p>
              <p className="text-sm font-medium text-blue-600">{complaint.confidence}%</p>
            </div>
          </div>
        </div>

        {/* Before/After proof */}
        {(complaint.beforePhotoUrl || complaint.afterPhotoUrl) && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Resolution Proof</p>
            <div className="grid grid-cols-2 gap-3">
              {complaint.beforePhotoUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Before</p>
                  <img src={complaint.beforePhotoUrl} alt="Before" className="rounded-lg w-full h-32 object-cover" />
                </div>
              )}
              {complaint.afterPhotoUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> After</p>
                  <img src={complaint.afterPhotoUrl} alt="After" className="rounded-lg w-full h-32 object-cover" />
                </div>
              )}
            </div>
            {complaint.resolutionNote && (
              <p className="text-sm text-gray-600 mt-2 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-600" />
                {complaint.resolutionNote}
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3">Status Timeline</p>
          <div className="space-y-3">
            {complaint.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === complaint.timeline.length - 1 ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                  {i < complaint.timeline.length - 1 && <div className="w-0.5 h-6 bg-gray-200" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-gray-900">{event.status}</p>
                  <p className="text-xs text-gray-400">
                    {event.actor} · {formatDateTime(event.timestamp)}
                  </p>
                  {event.note && <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {complaint.assignedWorkforceName && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg p-3 border border-amber-100">
            <Clock className="w-4 h-4 text-amber-600" />
            Assigned to: <span className="font-medium">{complaint.assignedWorkforceName}</span>
          </div>
        )}

        {actions && <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">{actions}</div>}
      </div>
    </Modal>
  );
}
