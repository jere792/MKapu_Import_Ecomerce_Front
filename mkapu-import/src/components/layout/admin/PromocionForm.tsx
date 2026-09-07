"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import { useAppModal } from "@/context/AppModalContext";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Loader2,
  Package,
  Search,
  Tag,
  X,
} from "lucide-react";

type ProductoSimple = {
  id: number;
  code: string;
  name: string;
  image_url: string | null;
};

type PromoExistente = {
  id: number;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
};

type PromocionFormData = {
  producto_id: number;
  producto_code: string;
  producto_nombre: string;
  producto_imagen: string;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
};

const initialForm: PromocionFormData = {
  producto_id: 0,
  producto_code: "",
  producto_nombre: "",
  producto_imagen: "",
  tipo_descuento: "porcentaje",
  valor_descuento: 0,
  fecha_inicio: "",
  fecha_fin: "",
  activo: true,
};

interface PromocionFormProps {
  mode: "create" | "edit";
  promocionId?: number;
}

export default function PromocionForm({ mode, promocionId }: PromocionFormProps) {
  const router = useRouter();
  const { confirm, alert: showAlert } = useAppModal();

  const [form, setForm] = useState<PromocionFormData>(initialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductoSimple[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [promoWarning, setPromoWarning] = useState<PromoExistente[]>([]);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !promocionId) return;
    supabase
      .from("promociones")
      .select("*, productos(name, code, image_url)")
      .eq("id", promocionId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push("/admin/promociones");
          return;
        }
        const prod = data.productos as {
          name?: string | null;
          code?: string | null;
          image_url?: string | null;
        } | null;
        setForm({
          producto_id: data.producto_id,
          producto_code: prod?.code ?? "",
          producto_nombre: prod?.name ?? "Producto eliminado",
          producto_imagen: prod?.image_url ?? "",
          tipo_descuento: data.tipo_descuento,
          valor_descuento: data.valor_descuento,
          fecha_inicio: data.fecha_inicio?.slice(0, 16) ?? "",
          fecha_fin: data.fecha_fin?.slice(0, 16) ?? "",
          activo: data.activo,
        });
        checkPromoConflict(data.producto_id);
        setLoading(false);
      });
  }, [mode, promocionId, router]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  async function searchProductos(q: string) {
    const { data } = await supabase
      .from("productos")
      .select("id, code, name, image_url")
      .or(`name.ilike.%${q}%,code.ilike.%${q}%`)
      .order("name")
      .limit(8);
    setSuggestions(data ?? []);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }

    setSuggestOpen(true);
    searchTimer.current = setTimeout(() => {
      searchProductos(value.trim());
    }, 250);
  }

  function selectProducto(p: ProductoSimple) {
    setForm((f) => ({
      ...f,
      producto_id: p.id,
      producto_code: p.code,
      producto_nombre: p.name,
      producto_imagen: p.image_url ?? "",
    }));
    setQuery("");
    setSuggestions([]);
    setSuggestOpen(false);
    checkPromoConflict(p.id);
  }

  async function checkPromoConflict(productoId: number) {
    if (!productoId) {
      setPromoWarning([]);
      return;
    }

    let query = supabase
      .from("promociones")
      .select("id, tipo_descuento, valor_descuento")
      .eq("producto_id", productoId)
      .eq("activo", true);

    if (mode === "edit" && promocionId) {
      query = query.neq("id", promocionId);
    }

    const { data } = await query;
    setPromoWarning((data ?? []) as PromoExistente[]);
  }

  function clearProducto() {
    setForm((f) => ({
      ...f,
      producto_id: 0,
      producto_code: "",
      producto_nombre: "",
      producto_imagen: "",
    }));
    setPromoWarning([]);
  }

  async function save(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();

    const confirmed = await confirm({
      title: "¿Guardar estos cambios?",
      message: "Se guardarán los cambios realizados.",
      confirmText: "Guardar",
      cancelText: "Cancelar",
      variant: "primary",
    });
    if (!confirmed) return;

    if (!form.producto_id) {
      await showAlert({
        title: "Selección requerida",
        message: "Selecciona un producto",
        variant: "warning",
      });
      return;
    }
    if (!form.valor_descuento || form.valor_descuento <= 0) {
      await showAlert({
        title: "Valor inválido",
        message: "Valor de descuento inválido",
        variant: "warning",
      });
      return;
    }
    if (form.tipo_descuento === "porcentaje" && form.valor_descuento > 100) {
      await showAlert({
        title: "Valor inválido",
        message: "El porcentaje no puede ser mayor a 100",
        variant: "warning",
      });
      return;
    }

    const payload: Record<string, unknown> = {
      producto_id: form.producto_id,
      tipo_descuento: form.tipo_descuento,
      valor_descuento: form.valor_descuento,
      activo: form.activo,
    };

    if (form.fecha_inicio) payload.fecha_inicio = form.fecha_inicio;
    if (form.fecha_fin) payload.fecha_fin = form.fecha_fin;

    setSaving(true);

    const { error } =
      mode === "edit" && promocionId
        ? await supabase.from("promociones").update(payload).eq("id", promocionId)
        : await supabase.from("promociones").insert(payload);

    setSaving(false);

    if (error) {
      await showAlert({
        title: "Error al guardar",
        message: error.message,
        variant: "danger",
      });
      return;
    }

    setSuccessMsg("Promoción guardada correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);

    if (closeAfter) router.push("/admin/promociones");
  }

  return (
    <>
      <style>{`
        .ap-inp{width:100%;padding:9px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:.875rem;background:#fff;color:#1a1a1a;outline:none;box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
        .ap-inp:focus{border-color:#f5a623;box-shadow:0 0 0 3px rgba(245,166,35,.12)}
        .ap-lbl{display:block;font-size:.7rem;font-weight:700;color:#aaa;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em}
        .ap-btn{display:inline-flex;align-items:center;gap:7px;border:none;border-radius:8px;font-weight:700;font-size:.875rem;cursor:pointer;padding:10px 20px;transition:background .15s,opacity .15s;text-decoration:none}
        .ap-btn--primary{background:#f5a623;color:#fff}
        .ap-btn--primary:hover{background:#e69510}
        .ap-btn--primary:disabled{background:#ccc;cursor:not-allowed}
        .ap-btn--secondary{background:#f0f0f0;color:#555}
        .ap-btn--secondary:hover{background:#e4e4e4}
        .ap-btn--ghost{background:transparent;color:#888;border:1px solid #e0e0e0}
        .ap-btn--ghost:hover{background:#f5f5f5}
        .ap-btn--sm{padding:6px 12px;font-size:.8rem;border-radius:6px}
        .ap-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:24px;margin-bottom:28px;border-top:3px solid #f5a623}
        .ap-fblock{background:#fafafa;border:1px solid #e8e8e8;border-radius:12px;padding:16px;margin-bottom:16px}
        .ap-fblock__title{margin:0 0 14px;font-size:.72rem;font-weight:800;color:#1a1a1a;text-transform:uppercase;letter-spacing:.08em;padding-bottom:10px;border-bottom:1px solid #e8e8e8}
        .ap-fsub{padding:12px;background:#fff;border:1px solid #eef0f2;border-radius:8px;margin-bottom:12px}
        .ap-fsub__title{margin:0 0 12px;font-size:.68rem;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.08em}
        .ap-suggest{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #e8e8e8;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.12);overflow:hidden;z-index:20;max-height:260px;overflow-y:auto}
        .ap-suggest__item{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:10px 12px;border:none;background:#fff;cursor:pointer;font-size:.85rem;color:#1a1a1a}
        .ap-suggest__item:hover{background:#fff8ee}
        .ap-suggest__item code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:.72rem;color:#6b7280;white-space:nowrap}
        .ap-suggest__img{width:32px;height:32px;border-radius:6px;object-fit:cover;flex-shrink:0;background:#f3f4f6;border:1px solid #e5e7eb}
        .ap-suggest__text{display:flex;flex-direction:column;gap:2px;min-width:0}
        .ap-suggest__text span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ap-suggest__empty{padding:12px;text-align:center;color:#9ca3af;font-size:.8rem}
        .ap-suggest-hint{margin:6px 0 0;font-size:.72rem;color:#bbb}
        .ap-selected{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px}
        .ap-selected__info{display:flex;align-items:center;gap:10px;min-width:0}
        .ap-selected__code{font-family:ui-monospace,monospace;font-size:.72rem;color:#16a34a;background:#f0fdf4;padding:2px 6px;border-radius:4px;align-self:flex-start}
        .ap-selected__name{font-size:.85rem;font-weight:600;color:#1a1a1a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ap-selected__remove{background:transparent;border:none;color:#9ca3af;cursor:pointer;padding:4px;border-radius:6px;display:inline-flex;flex-shrink:0}
        .ap-selected__remove:hover{background:#f3f4f6;color:#dc2626}
        .ap-selected__img{width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;background:#f3f4f6;border:1px solid #e5e7eb}
        .ap-selected__text{display:flex;flex-direction:column;gap:3px;min-width:0}
        .ap-selected__empty{margin:0;font-size:.8rem;color:#bbb}
        .ap-promo-warn{display:flex;align-items:flex-start;gap:8px;margin-top:10px;background:#fef3c7;border:1px solid rgba(245,158,11,.4);border-radius:10px;padding:10px 12px;font-size:.8rem;color:#92400e}
        .ap-promo-warn ul{margin:4px 0 0;padding-left:18px}
        .ap-promo-warn li{margin:2px 0}
        .ap-toggle{display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:.875rem;color:#555;user-select:none}
        .ap-toggle input{display:none}
        .ap-toggle__slider{width:44px;height:24px;background:#e0e0e0;border-radius:12px;position:relative;transition:background .2s;flex-shrink:0}
        .ap-toggle__slider::after{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .ap-toggle input:checked+.ap-toggle__slider{background:#22c55e}
        .ap-toggle input:checked+.ap-toggle__slider::after{transform:translateX(20px)}
        @keyframes ap-spin{to{transform:rotate(360deg)}}
        .ap-spin{animation:ap-spin .8s linear infinite}
        @keyframes ap-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .ap-fadein{animation:ap-fadein .2s ease}
      `}</style>

      <div
        style={{
          padding: "1.5rem 1.25rem 2.5rem",
          background: "#f8f7f4",
          minHeight: "100vh",
        }}
      >
        {successMsg && (
          <div
            style={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              zIndex: 9999,
              background: "#16a34a",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        <SectionHeader
          title={
            mode === "create" ? "Nueva promoción" : `Editar promoción #${promocionId}`
          }
          icon={<Tag size={18} />}
          description="Crea descuentos por producto"
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/promociones")}
            >
              <ArrowLeft size={14} />
              Volver al listado
            </button>
          }
        />

        {loading ? (
          <div
            className="ap-card"
            style={{ textAlign: "center", padding: "60px 0", color: "#888" }}
          >
            <Loader2 size={28} className="ap-spin" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando promoción...</p>
          </div>
        ) : (
          <div className="ap-card ap-fadein">
            <form onSubmit={save}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(320px, 440px) 1fr",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                {/* ── Producto ─────────────────────────────────────────── */}
                <div className="ap-fblock">
                  <h3 className="ap-fblock__title">Producto</h3>

                  <div className="ap-fsub">
                    <h4 className="ap-fsub__title">Buscar producto</h4>
                    <div style={{ position: "relative" }}>
                      <Search
                        size={15}
                        style={{
                          position: "absolute",
                          left: 11,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#ccc",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        className="ap-inp"
                        style={{ paddingLeft: 32 }}
                        placeholder="Nombre o código del producto..."
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => {
                          if (query.trim().length >= 3) setSuggestOpen(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setSuggestOpen(false), 150);
                        }}
                      />

                      {suggestOpen && query.trim().length >= 3 && (
                        <div className="ap-suggest">
                          {suggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className="ap-suggest__item"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectProducto(s);
                              }}
                            >
                              {s.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.image_url}
                                  alt={s.name}
                                  className="ap-suggest__img"
                                />
                              ) : (
                                <span className="ap-suggest__img" />
                              )}
                              <span className="ap-suggest__text">
                                <code>{s.code}</code>
                                <span>{s.name}</span>
                              </span>
                            </button>
                          ))}
                          {suggestions.length === 0 && (
                            <div className="ap-suggest__empty">
                              Sin coincidencias
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="ap-suggest-hint">
                      Escribe al menos 3 caracteres para ver sugerencias
                    </p>
                  </div>

                  <div className="ap-fsub">
                    <h4 className="ap-fsub__title">Producto seleccionado</h4>
                    {form.producto_id ? (
                      <div className="ap-selected">
                        <div className="ap-selected__info">
                          {form.producto_imagen ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={form.producto_imagen}
                              alt={form.producto_nombre}
                              className="ap-selected__img"
                            />
                          ) : (
                            <span className="ap-selected__img" />
                          )}
                          <span className="ap-selected__text">
                            <code className="ap-selected__code">
                              {form.producto_code}
                            </code>
                            <span className="ap-selected__name">
                              {form.producto_nombre}
                            </span>
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ap-selected__remove"
                          onClick={clearProducto}
                          title="Quitar producto"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="ap-selected__empty">
                        <Package size={16} style={{ marginRight: 4, verticalAlign: "text-bottom" }} />
                        Aún no has seleccionado un producto
                      </p>
                    )}

                    {promoWarning.length > 0 && (
                      <div className="ap-promo-warn">
                        <AlertCircle
                          size={15}
                          style={{ flexShrink: 0, marginTop: 1 }}
                        />
                        <div>
                          <strong>
                            Este producto ya tiene{" "}
                            {promoWarning.length === 1
                              ? "una promoción activa"
                              : `${promoWarning.length} promociones activas`}
                            :
                          </strong>
                          <ul>
                            {promoWarning.map((pr) => (
                              <li key={pr.id}>
                                {pr.tipo_descuento === "porcentaje"
                                  ? `${pr.valor_descuento}% de descuento`
                                  : `S/ ${pr.valor_descuento.toFixed(2)} de descuento`}
                                {mode === "edit" && pr.id === promocionId
                                  ? " (esta promoción)"
                                  : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Descuento ────────────────────────────────────────── */}
                <div>
                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Descuento</h3>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Configuración</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 14,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">Tipo de descuento</label>
                          <select
                            className="ap-inp"
                            value={form.tipo_descuento}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                tipo_descuento: e.target.value as
                                  | "porcentaje"
                                  | "monto_fijo",
                              })
                            }
                          >
                            <option value="porcentaje">Porcentaje (%)</option>
                            <option value="monto_fijo">Monto fijo (S/)</option>
                          </select>
                        </div>

                        <div>
                          <label className="ap-lbl">
                            Valor{" "}
                            <span style={{ fontWeight: 400, color: "#bbb" }}>
                              ({form.tipo_descuento === "porcentaje" ? "%" : "S/"})
                            </span>
                          </label>
                          <input
                            className="ap-inp"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={form.valor_descuento || ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                valor_descuento: Number(e.target.value),
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Vigencia y estado</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 14,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">
                            Fecha inicio{" "}
                            <span style={{ fontWeight: 400, color: "#bbb", textTransform: "none" }}>
                              (opcional)
                            </span>
                          </label>
                          <input
                            className="ap-inp"
                            type="datetime-local"
                            value={form.fecha_inicio}
                            onChange={(e) =>
                              setForm({ ...form, fecha_inicio: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="ap-lbl">
                            Fecha fin{" "}
                            <span style={{ fontWeight: 400, color: "#bbb", textTransform: "none" }}>
                              (opcional)
                            </span>
                          </label>
                          <input
                            className="ap-inp"
                            type="datetime-local"
                            value={form.fecha_fin}
                            onChange={(e) =>
                              setForm({ ...form, fecha_fin: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="ap-lbl">Estado</label>
                          <label className="ap-toggle">
                            <input
                              type="checkbox"
                              checked={form.activo}
                              onChange={(e) =>
                                setForm({ ...form, activo: e.target.checked })
                              }
                            />
                            <span className="ap-toggle__slider" />
                            <span>{form.activo ? "Activo" : "Inactivo"}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de guardado */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  className="ap-btn ap-btn--primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="ap-spin" />
                      Guardando...
                    </>
                  ) : mode === "create" ? (
                    <>
                      <CheckCircle2 size={15} />
                      Crear promoción
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Guardar cambios
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="ap-btn ap-btn--secondary"
                  onClick={(e) => save(e as unknown as React.FormEvent, true)}
                  disabled={saving}
                >
                  <CheckCircle size={15} />
                  Guardar y cerrar
                </button>

                <button
                  type="button"
                  className="ap-btn ap-btn--ghost ap-btn--sm"
                  onClick={() => router.push("/admin/promociones")}
                >
                  <X size={14} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}