import type { ComplaintStatus, Priority, TaskStatus } from '@/lib/types';
import { statusColor, priorityColor, taskStatusColor } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(status)}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityColor(priority)}`}>
      {t(`priority.${priority}`)}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${taskStatusColor(status)}`}>
      {t(`taskStatus.${status}`)}
    </span>
  );
}
