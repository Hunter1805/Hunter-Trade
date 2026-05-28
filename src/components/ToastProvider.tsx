import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, Zap } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (e: CustomEvent<Omit<ToastMessage, 'id'>>) => {
      const newToast: ToastMessage = {
        ...e.detail,
        id: Math.random().toString(36).substring(2, 9),
      };
      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration !== 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration || 5000);
      }
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);
    return () => window.removeEventListener('show-toast', handleShowToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-80">
      {toasts.map((toast) => {
        
        let bgColor = 'bg-surface-container-high border-outline-variant';
        let iconColor = 'text-on-surface-variant';
        let Icon = Info;
        
        if (toast.type === 'success') {
           bgColor = 'bg-primary/10 border-primary/30';
           iconColor = 'text-primary';
           Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
           bgColor = 'bg-orange-500/10 border-orange-500/30';
           iconColor = 'text-orange-500';
           Icon = Zap;
        } else if (toast.type === 'error') {
           bgColor = 'bg-error/10 border-error/30';
           iconColor = 'text-error';
           Icon = AlertTriangle;
        }

        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto backdrop-blur-xl border p-4 rounded-xl shadow-lg flex items-start gap-3 animate-in slide-in-from-right-8 fade-in duration-300 ${bgColor}`}
          >
            <Icon size={20} className={`shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h4 className="text-[13px] font-bold text-on-surface">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{toast.description}</p>
              )}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  );
}
