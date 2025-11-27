
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000); // Auto close after 5s
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const styles = {
    success: 'bg-[#151725] border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    error: 'bg-[#151725] border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    info: 'bg-[#151725] border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  };

  const icons = {
    success: 'bx-check-circle',
    error: 'bx-error',
    info: 'bx-info-circle',
  };

  return (
    <div className={`${styles[toast.type]} pointer-events-auto border-l-4 px-5 py-4 rounded-r-xl shadow-xl flex items-center gap-4 min-w-[320px] max-w-[400px] animate-[slideIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] font-sans backdrop-blur-xl bg-opacity-95`}>
      <i className={`bx ${icons[toast.type]} text-2xl shrink-0`}></i>
      <p className="text-sm font-semibold flex-1 leading-snug text-slate-200">{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-white transition-colors shrink-0">
        <i className="bx bx-x text-2xl"></i>
      </button>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
