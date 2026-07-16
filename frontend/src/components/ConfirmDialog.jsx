import React, { createContext, useCallback, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

const ConfirmContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [state, setState] = useState(null); // { title, message, resolve, danger }

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({
        title: options.title || 'Konfirmasi',
        message,
        confirmLabel: options.confirmLabel || 'Ya, Lanjutkan',
        cancelLabel: options.cancelLabel || 'Batal',
        danger: options.danger ?? true,
        resolve,
      });
    });
  }, []);

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && ReactDOM.createPortal(
        <div
          className="modal-overlay"
          onClick={() => close(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <h3 className="modal__title" style={{ marginBottom: 10 }}>{state.title}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 22 }}>
              {state.message}
            </p>
            <div className="modal__actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => close(false)}>
                {state.cancelLabel}
              </button>
              <button
                type="button"
                className={state.danger ? 'btn btn-danger' : 'btn btn-primary'}
                onClick={() => close(true)}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  return ctx;
}
