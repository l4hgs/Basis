import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog — Branded modal for destructive action confirmations.
 * Props:
 *   isOpen    {boolean}  — controls visibility
 *   title     {string}   — dialog heading
 *   message   {string}   — body message
 *   onConfirm {function} — called when user confirms
 *   onCancel  {function} — called when user cancels / clicks backdrop
 */
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  // Trap focus inside dialog
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.20)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm mx-4 outline-none"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '1rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
          animation: 'confirmSlideIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both'
        }}
      >
        {/* Close X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-brand-text-tertiary hover:text-brand-text-primary hover:bg-brand-bg-canvas transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
          </div>

          {/* Text */}
          <h3
            id="confirm-dialog-title"
            className="text-base font-bold text-brand-text-primary mb-1.5"
          >
            {title}
          </h3>
          <p className="text-sm text-brand-text-secondary leading-relaxed mb-6">
            {message}
          </p>

          {/* Divider */}
          <div className="h-px mb-6 bg-brand-border" />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary rounded-xl transition-colors cursor-pointer"
              style={{ background: '#F4F5F7', border: '1px solid #E5E7EB' }}
            >
              Keep It
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer hover:brightness-110 active:scale-[0.97]"
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.20)'
              }}
            >
              Delete Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animation injected via a style tag */}
      <style>{`
        @keyframes confirmSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
