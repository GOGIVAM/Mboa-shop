import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, TriangleAlert } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warn';

interface Toast { id: number; message: string; type: ToastType; }

interface ToastCtx { show: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastCtx>({ show: () => {} });

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warn: TriangleAlert,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon size={18} strokeWidth={2} />
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
