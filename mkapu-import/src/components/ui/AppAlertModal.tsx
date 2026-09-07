"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type Variant = "info" | "warning" | "danger" | "success";

interface AppAlertModalProps {
  open: boolean;
  title: string;
  message?: string;
  variant?: Variant;
  buttonText?: string;
  onClose: () => void;
}

const VARIANT_ICON: Record<Variant, React.ReactNode> = {
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
  danger: <AlertCircle size={18} />,
  success: <CheckCircle2 size={18} />,
};

export default function AppAlertModal({
  open,
  title,
  message,
  variant = "info",
  buttonText = "Entendido",
  onClose,
}: AppAlertModalProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => btnRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <style>{`
        .apmA-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1100;display:flex;align-items:center;justify-content:center;padding:20px;animation:apmA-fade .15s ease}
        .apmA-panel{background:#fff;border-radius:16px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;animation:apmA-in .18s ease}
        @keyframes apmA-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes apmA-fade{from{opacity:0}to{opacity:1}}
        .apmA-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 20px 0 20px}
        .apmA-icon{width:40px;height:40px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
        .apmA-icon--info{background:rgba(59,130,246,.10);color:#2563eb}
        .apmA-icon--warning{background:rgba(245,166,35,.14);color:#b45309}
        .apmA-icon--danger{background:rgba(220,53,69,.10);color:#dc3545}
        .apmA-icon--success{background:rgba(34,197,94,.12);color:#16a34a}
        .apmA-text{flex:1;min-width:0}
        .apmA-title{margin:0;font-size:1rem;font-weight:800;color:#1a1a1a;line-height:1.3}
        .apmA-msg{margin:6px 0 0;font-size:.875rem;color:#6b7280;line-height:1.5;white-space:pre-wrap}
        .apmA-close{background:transparent;border:none;color:#aaa;cursor:pointer;padding:6px;border-radius:8px;display:inline-flex;flex-shrink:0;transition:background .15s,color .15s}
        .apmA-close:hover{background:#f5f5f5;color:#555}
        .apmA-close:focus-visible{outline:2px solid #f5a623;outline-offset:2px}
        .apmA-foot{display:flex;justify-content:flex-end;padding:16px 20px;background:#fafafa;border-top:1px solid #f0f0f0;margin-top:20px}
        .apmA-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:none;border-radius:8px;font-weight:700;font-size:.875rem;cursor:pointer;padding:10px 22px;transition:background .15s,box-shadow .15s;outline:none;min-width:110px}
        .apmA-btn:focus-visible{box-shadow:0 0 0 3px rgba(245,166,35,.25)}
        .apmA-btn--info{background:#2563eb;color:#fff}
        .apmA-btn--info:hover{background:#1d4ed8}
        .apmA-btn--warning{background:#f5a623;color:#fff}
        .apmA-btn--warning:hover{background:#e69510}
        .apmA-btn--danger{background:#dc3545;color:#fff}
        .apmA-btn--danger:hover{background:#c92a3a}
        .apmA-btn--success{background:#16a34a;color:#fff}
        .apmA-btn--success:hover{background:#15803d}
        @media(max-width:480px){.apmA-panel{max-width:100%}.apmA-btn{width:100%}}
      `}</style>

      <div
        className="apmA-overlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="apmA-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apmA-title"
          aria-describedby={message ? "apmA-msg" : undefined}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="apmA-head">
            <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
              <span className={`apmA-icon apmA-icon--${variant}`}>{VARIANT_ICON[variant]}</span>
              <div className="apmA-text">
                <h2 id="apmA-title" className="apmA-title">
                  {title}
                </h2>
                {message && (
                  <p id="apmA-msg" className="apmA-msg">
                    {message}
                  </p>
                )}
              </div>
            </div>
            <button type="button" className="apmA-close" onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

          <div className="apmA-foot">
            <button ref={btnRef} type="button" className={`apmA-btn apmA-btn--${variant}`} onClick={onClose}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
