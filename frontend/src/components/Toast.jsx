import React, { createContext, useCallback, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

const ToastContext = createContext(null);

let idSeq = 0;

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const COLORS = {
  success: { bg: 'var(--success-500, #10b981)', text: '#fff' },
  error: { bg: 'var(--danger-500, #ef4444)', text: '#fff' },
  warning: { bg: 'var(--warning-500, #f59e0b)', text: '#1e293b' },
  info: { bg: 'var(--primary-500, #3b82f6)', text: '#fff' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idSeq;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const toast = {
    show: showToast,
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {ReactDOM.createPortal(
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360,
        }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              style={{
                background: COLORS[t.type]?.bg || COLORS.info.bg,
                color: COLORS[t.type]?.text || COLORS.info.text,
                padding: '12px 16px',
                borderRadius: 10,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                animation: 'toast-in 0.2s ease',
              }}
            >
              <span style={{ fontSize: 15 }}>{ICONS[t.type] || ICONS.info}</span>
              <span style={{ flex: 1 }}>{t.message}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
