"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Contrast,
  Crop,
  Loader2,
  MousePointerClick,
  Sliders,
  Sun,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ImageEditorModalProps {
  open: boolean;
  imageSrc: string | null;
  fileType?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob, fileName: string) => Promise<void> | void;
}

type Tool = "recorte" | "ajustes";

const BRIGHT_RANGE = { min: 0.4, max: 1.8 };
const CONTRAST_RANGE = { min: 0.4, max: 2 };
const SATURATION_RANGE = { min: 0, max: 2 };

export default function ImageEditorModal({
  open,
  imageSrc,
  fileType = "image/jpeg",
  onCancel,
  onConfirm,
}: ImageEditorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    pos: { x: number; y: number };
    active: boolean;
  }>({ x: 0, y: 0, pos: { x: 0, y: 0 }, active: false });

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("recorte");
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [processing, setProcessing] = useState(false);

  const filters = [
    brightness !== 1 ? `brightness(${brightness})` : null,
    contrast !== 1 ? `contrast(${contrast})` : null,
    saturation !== 1 ? `saturate(${saturation})` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const resetCrop = useCallback(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.onload = () => {
      const el = containerRef.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (iw === 0 || ih === 0) return;
      const bs = Math.max(cw / iw, ch / ih) * 1.03;
      setNatural({ w: iw, h: ih });
      setBaseScale(bs);
      setScale(bs);
      setPos({ x: (cw - iw * bs) / 2, y: (ch - ih * bs) / 2 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (open) {
      setTool("recorte");
      setBrightness(1);
      setContrast(1);
      setSaturation(1);
      resetCrop();
    }
  }, [open, resetCrop]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const zoomAt = (cx: number, cy: number, factor: number) => {
    if (!natural) return;
    setScale((prev) => {
      const next = Math.min(baseScale * 10, Math.max(baseScale, prev * factor));
      const f = next / prev;
      setPos((p) => ({ x: cx - (cx - p.x) * f, y: cy - (cy - p.y) * f }));
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, pos, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    setPos({ x: d.pos.x + (e.clientX - d.x), y: d.pos.y + (e.clientY - d.y) });
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(
      e.clientX - rect.left,
      e.clientY - rect.top,
      e.deltaY < 0 ? 1.12 : 0.89,
    );
  };

  const handleConfirm = () => {
    if (!natural || !imgRef.current || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;

    let sx = -pos.x / scale;
    let sy = -pos.y / scale;
    let sw = cw / scale;
    let sh = ch / scale;

    sx = Math.max(0, sx);
    sy = Math.max(0, sy);
    sw = Math.min(natural.w - sx, sw);
    sh = Math.min(natural.h - sy, sh);
    if (sw <= 1 || sh <= 1) return;

    const outScale = Math.min(1, 1024 / Math.max(sw, sh));
    const outW = Math.max(1, Math.round(sw * outScale));
    const outH = Math.max(1, Math.round(sh * outScale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (filters) ctx.filter = filters;
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        setProcessing(true);
        try {
          await onConfirm(blob, "marca.jpg");
        } finally {
          setProcessing(false);
        }
      },
      fileType,
      0.92,
    );
  };

  if (!open || !imageSrc) return null;

  const pct = natural ? Math.round((scale / baseScale) * 100) : 100;

  const slider = (
    label: string,
    icon: React.ReactNode,
    value: number,
    onChange: (v: number) => void,
    min: number,
    max: number,
  ) => (
    <div className="oed-slider">
      <label>
        {icon}
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{Math.round(value * 100)}%</span>
    </div>
  );

  return (
    <>
      <style>{`
        .cropm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
        .cropm-panel{background:#fff;border-radius:16px;width:100%;max-width:640px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;animation:cropm-in .18s ease}
        @keyframes cropm-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes cropm-spin{to{transform:rotate(360deg)}}
        .cropm-spin{animation:cropm-spin .8s linear infinite}
        .cropm-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f0f0f0}
        .cropm-head h3{margin:0;font-size:.95rem;font-weight:800;color:#1a1a1a}
        .cropm-close{background:transparent;border:none;color:#aaa;cursor:pointer;padding:4px;border-radius:6px;display:inline-flex}
        .cropm-close:hover{background:#f5f5f5;color:#555}
        .cropm-body{padding:20px}
        .oed-switch{display:flex;gap:4px;background:#f3f4f6;border:1px solid #ececec;border-radius:10px;padding:4px;margin-bottom:16px}
        .oed-switch__btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:9px;border:none;border-radius:8px;background:transparent;color:#8a8a8a;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .15s}
        .oed-switch__btn--active{background:#fff;color:#1a1a1a;box-shadow:0 1px 4px rgba(0,0,0,.14)}
        .cropm-view{position:relative;overflow:hidden;border-radius:12px;background:#000;height:380px;cursor:grab;touch-action:none}
        .cropm-view:active{cursor:grabbing}
        .cropm-grid{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.5);background:repeating-linear-gradient(0deg,transparent 0 31px,rgba(255,255,255,.14) 31px 32px),repeating-linear-gradient(90deg,transparent 0 31px,rgba(255,255,255,.14) 31px 32px)}
        .cropm-hint{display:flex;align-items:center;justify-content:center;gap:6px;margin:12px 0 0;font-size:.78rem;color:#999}
        .cropm-zoom{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px}
        .cropm-zoombtn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:1px solid #e0e0e0;border-radius:8px;background:#fff;color:#555;cursor:pointer;transition:background .15s}
        .cropm-zoombtn:hover{background:#f5f5f5}
        .cropm-pct{font-size:.8rem;font-weight:700;color:#888;min-width:52px;text-align:center}
        .oed-ajustes{margin-top:14px;background:#fafafa;border:1px solid #f0f0f0;border-radius:12px;padding:4px 16px}
        .oed-slider{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #f0f0f0}
        .oed-slider:last-child{border-bottom:none}
        .oed-slider label{display:flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;color:#555;min-width:130px}
        .oed-slider label svg{color:#b45309}
        .oed-slider input{flex:1;-webkit-appearance:none;appearance:none;height:6px;border-radius:999px;background:linear-gradient(90deg,#fde68a,#f59e0b);outline:none;cursor:pointer}
        .oed-slider input::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #f59e0b;box-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer}
        .oed-slider input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #f59e0b;cursor:pointer}
        .oed-slider span{font-size:.78rem;font-weight:800;color:#92400e;min-width:44px;text-align:right}
        .cropm-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 20px;border-top:1px solid #f0f0f0;background:#fafafa}
        .cropm-btn{display:inline-flex;align-items:center;gap:7px;border:none;border-radius:8px;font-weight:700;font-size:.85rem;cursor:pointer;padding:9px 18px;transition:background .15s,opacity .15s}
        .cropm-btn--ghost{background:#fff;color:#888;border:1px solid #e0e0e0}
        .cropm-btn--ghost:hover{background:#f5f5f5}
        .cropm-btn--primary{background:#f5a623;color:#fff}
        .cropm-btn--primary:hover{background:#e69510}
        .cropm-btn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>

      <div
        className="cropm-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && !processing) onCancel();
        }}
      >
        <div className="cropm-panel">
          <div className="cropm-head">
            <h3>Editar imagen</h3>
            <button
              type="button"
              className="cropm-close"
              onClick={onCancel}
              disabled={processing}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="cropm-body">
            <div className="oed-switch">
              <button
                type="button"
                className={`oed-switch__btn ${tool === "recorte" ? "oed-switch__btn--active" : ""}`}
                onClick={() => setTool("recorte")}
              >
                <Crop size={15} />
                Recorte
              </button>
              <button
                type="button"
                className={`oed-switch__btn ${tool === "ajustes" ? "oed-switch__btn--active" : ""}`}
                onClick={() => setTool("ajustes")}
              >
                <Sliders size={15} />
                Ajustes
              </button>
            </div>

            {tool === "recorte" ? (
              <>
                <div
                  ref={containerRef}
                  className="cropm-view"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onWheel={onWheel}
                >
                  {natural ? (
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Imagen a editar"
                      draggable={false}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: natural.w,
                        height: natural.h,
                        maxWidth: "none",
                        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                        transformOrigin: "0 0",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        filter: filters || "none",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        fontSize: ".85rem",
                      }}
                    >
                      Cargando imagen...
                    </div>
                  )}
                  <div className="cropm-grid" />
                </div>

                <p className="cropm-hint">
                  <MousePointerClick size={14} />
                  Arrastra para mover · Usa la rueda para hacer zoom
                </p>

                <div className="cropm-zoom">
                  <button
                    type="button"
                    className="cropm-zoombtn"
                    onClick={() => {
                      const r = containerRef.current?.getBoundingClientRect();
                      zoomAt(
                        r ? (r.left + r.width) / 2 : 0,
                        r ? (r.top + r.height) / 2 : 0,
                        0.85,
                      );
                    }}
                    aria-label="Alejar"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="cropm-pct">{pct}%</span>
                  <button
                    type="button"
                    className="cropm-zoombtn"
                    onClick={() => {
                      const r = containerRef.current?.getBoundingClientRect();
                      zoomAt(
                        r ? (r.left + r.width) / 2 : 0,
                        r ? (r.top + r.height) / 2 : 0,
                        1.18,
                      );
                    }}
                    aria-label="Acercar"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="cropm-view" style={{ cursor: "default" }}>
                  {natural ? (
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Vista previa"
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        filter: filters || "none",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        fontSize: ".85rem",
                      }}
                    >
                      Cargando imagen...
                    </div>
                  )}
                </div>

                <p className="cropm-hint">
                  Vista previa con los ajustes aplicados
                </p>

                <div className="oed-ajustes">
                  {slider(
                    "Luminosidad",
                    <Sun size={15} />,
                    brightness,
                    setBrightness,
                    BRIGHT_RANGE.min,
                    BRIGHT_RANGE.max,
                  )}
                  {slider(
                    "Contraste",
                    <Contrast size={15} />,
                    contrast,
                    setContrast,
                    CONTRAST_RANGE.min,
                    CONTRAST_RANGE.max,
                  )}
                  {slider(
                    "Saturación",
                    <Sliders size={15} />,
                    saturation,
                    setSaturation,
                    SATURATION_RANGE.min,
                    SATURATION_RANGE.max,
                  )}
                </div>
              </>
            )}
          </div>

          <div className="cropm-foot">
            <button
              type="button"
              className="cropm-btn cropm-btn--ghost"
              onClick={onCancel}
              disabled={processing}
            >
              <X size={15} />
              Cancelar
            </button>
            <button
              type="button"
              className="cropm-btn cropm-btn--primary"
              onClick={handleConfirm}
              disabled={processing || !natural}
            >
              {processing ? (
                <>
                  <Loader2 size={15} className="cropm-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Aplicar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}