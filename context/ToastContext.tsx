
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 animate-[slideIn_0.3s_ease-out] relative overflow-hidden group
              ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' : ''}
              ${toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-100' : ''}
              ${toast.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-100' : ''}
              ${toast.type === 'info' ? 'bg-indigo-950/80 border-indigo-500/30 text-indigo-100' : ''}
            `}
          >
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className={`p-1.5 rounded-lg shrink-0 
              ${toast.type === 'success' ? 'bg-emerald-500/20' : ''}
              ${toast.type === 'error' ? 'bg-rose-500/20' : ''}
              ${toast.type === 'warning' ? 'bg-amber-500/20' : ''}
              ${toast.type === 'info' ? 'bg-indigo-500/20' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle size={16} className="text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle size={16} className="text-amber-400" />}
              {toast.type === 'info' && <Info size={16} className="text-indigo-400" />}
            </div>

            <div className="flex-1 pt-0.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">
                {toast.type === 'error' ? 'System Alert' : toast.type === 'success' ? 'Operation Complete' : 'Notification'}
              </h4>
              <p className="text-xs font-mono font-medium leading-relaxed opacity-90">{toast.message}</p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
