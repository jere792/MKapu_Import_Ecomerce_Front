"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

type Variant = "primary" | "danger";

interface AppConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AppConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: AppConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => confirmRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
      if (e.key === "Tab") {
        const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previousActiveRef.current?.focus?.();
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <>
      <style>{`
        .apm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1100;display:flex;align-items:center;justify-content:center;padding:20px;animation:apm-fade .15s ease}
        .apm-panel{background:#fff;border-radius:16px;width:100%;max-width:480px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;animation:apm-in .18s ease}
        @keyframes apm-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes apm-fade{from{opacity:0}to{opacity:1}}
        @keyframes apm-spin{to{transform:rotate(360deg)}}
        .apm-spin{animation:apm-spin .8s linear infinite}
        .apm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 20px 0 20px}
        .apm-head__icon{width:40px;height:40px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
        .apm-head__icon--primary{background:rgba(245,166,35,.12);color:#f5a623}
        .apm-head__icon--danger{background:rgba(220,53,69,.10);color:#dc3545}
        .apm-head__text{flex:1;min-width:0}
        .apm-head__title{margin:0;font-size:1rem;font-weight:800;color:#1a1a1a;line-height:1.3;letter-spacing:-.01em}
        .apm-head__msg{margin:6px 0 0;font-size:.875rem;color:#6b7280;line-height:1.5}
        .apm-close{background:transparent;border:none;color:#aaa;cursor:pointer;padding:6px;border-radius:8px;display:inline-flex;flex-shrink:0;transition:background .15s,color .15s}
        .apm-close:hover{background:#f5f5f5;color:#555}
        .apm-close:focus-visible{outline:2px solid #f5a623;outline-offset:2px}
        .apm-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 20px;background:#fafafa;border-top:1px solid #f0f0f0;margin-top:20px}
        .apm-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:none;border-radius:8px;font-weight:700;font-size:.875rem;cursor:pointer;padding:10px 18px;transition:background .15s,opacity .15s,box-shadow .15s;outline:none}
        .apm-btn:focus-visible{box-shadow:0 0 0 3px rgba(245,166,35,.25)}
        .apm-btn--ghost{background:#fff;color:#555;border:1px solid #e0e0e0}
        .apm-btn--ghost:hover{background:#f5f5f5}
        .apm-btn--primary{background:#f5a623;color:#fff}
        .apm-btn--primary:hover{background:#e69510}
        .apm-btn--danger{background:#dc3545;color:#fff}
        .apm-btn--danger:hover{background:#c92a3a}
        .apm-btn:disabled{opacity:.6;cursor:not-allowed}
        @media(max-width:480px){.apm-panel{max-width:100%}.apm-foot{flex-direction:column-reverse}.apm-btn{width:100%}}
      `}</style>

      <div
        ref={overlayRef}
        className="apm-overlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === overlayRef.current && !loading) onCancel();
        }}
      >
        <div
          className="apm-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apm-title"
          aria-describedby={message ? "apm-msg" : undefined}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="apm-head">
            <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
              <span className={`apm-head__icon apm-head__icon--${variant}`}>
                <AlertTriangle size={18} />
              </span>
              <div className="apm-head__text">
                <h2 id="apm-title" className="apm-head__title">
                  {title}
                </h2>
                {message && (
                  <p id="apm-msg" className="apm-head__msg">
                    {message}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              className="apm-close"
              onClick={onCancel}
              disabled={loading}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="apm-foot">
            <button
              ref={cancelRef}
              type="button"
              className="apm-btn apm-btn--ghost"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              type="button"
              className={`apm-btn ${variant === "danger" ? "apm-btn--danger" : "apm-btn--primary"}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <Loader2 size={15} className="apm-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
