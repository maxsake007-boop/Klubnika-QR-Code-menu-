import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-white border-[#7cf994] text-[#2a170f]'
              : toast.type === 'warning'
              ? 'bg-white border-[#ffdad6] text-[#2a170f]'
              : 'bg-white border-[#ffe2d8] text-[#2a170f]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'success'
                ? 'bg-[#7cf994]/30 text-[#006e2d]'
                : toast.type === 'warning'
                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                : 'bg-[#ffe2d8] text-[#dc2626]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === 'success'
                ? 'check'
                : toast.type === 'warning'
                ? 'warning'
                : 'notifications'}
            </span>
          </div>

          <div className="flex-1 pr-1">
            <h4 className="text-xs font-bold text-[#2a170f]">{toast.title}</h4>
            {toast.message && <p className="text-[11px] text-[#5c403c] mt-0.5">{toast.message}</p>}
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-[#916f6b] hover:text-[#2a170f] p-0.5"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
