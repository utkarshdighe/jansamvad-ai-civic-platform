import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'warning' ? AlertTriangle : Info;
        const color = t.type === 'success' ? 'text-emerald-600' : t.type === 'warning' ? 'text-amber-600' : 'text-blue-600';
        return (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-start gap-3 animate-[slideIn_0.3s_ease-out]"
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
            <p className="text-sm text-gray-700 flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
