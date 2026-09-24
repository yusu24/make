import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Global Modal Component using React Portals
 * This escapes the local stacking context (z-index hell)
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px', hideHeader = false }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth, padding: hideHeader ? 0 : undefined, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
        {!hideHeader && (
          <div className="modal__header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
            <h3 className="modal__title" style={{ margin: 0 }}>{title}</h3>
            <button className="btn-close" onClick={onClose} style={{ background:'none', border:'none', fontSize: 24, cursor:'pointer', color:'var(--text-muted)' }}>&times;</button>
          </div>
        )}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
