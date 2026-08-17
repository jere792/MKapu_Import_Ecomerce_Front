"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Pencil,
  Trash2,
  Tag,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Promocion = {
  id: number;
  producto_id: number;
  producto_nombre?: string;
  producto_code?: string;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
  created_at: string;
};

type ProductoSimple = {
  id: number;
  code: string;
  name: string;
};

type PromocionRow = Omit<Promocion, "producto_nombre" | "producto_code"> & {
  productos?: {
    name?: string | null;
    code?: string | null;
  } | null;
};

const PAGE_SIZE = 10;

const initialForm: {
  producto_id: number;
  producto_code: string;
  producto_nombre: string;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
} = {
  producto_id: 0,
  producto_code: "",
  producto_nombre: "",
  tipo_descuento: "porcentaje",
  valor_descuento: 0,
  fecha_inicio: "",
  fecha_fin: "",
  activo: true,
};

const C = {
  primary: "#f5a623",
  primaryHover: "#d4891a",
  primaryLight: "#fff8ee",
  primaryBorder: "#fcd48a",
  danger: "#dc2626",
  dangerLight: "rgba(220,38,38,0.08)",
  dangerHover: "rgba(220,38,38,0.16)",
  success: "#16a34a",
  successLight: "rgba(34,197,94,0.1)",
  blue: "#2563eb",
  blueLight: "rgba(37,99,235,0.08)",
  blueHover: "rgba(37,99,235,0.15)",
  text: "#1a1a1a",
  textMuted: "#6b7280",
  textFaint: "#9ca3af",
  bg: "#f8f7f4",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f0f0f0",
  headerBg: "#fafafa",
};

const shadow = {
  card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.68rem 0.9rem",
  border: `1px solid ${C.border}`,
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: C.surface,
  color: C.text,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: C.textMuted,
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

function Badge({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        color,
        background: bg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function IconBtn({
  onClick,
  title,
  color,
  bg,
  bgHover,
  border,
  children,
}: {
  onClick: () => void;
  title: string;
  color: string;
  bg: string;
  bgHover: string;
  border?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: bg,
        border: border || "none",
        borderRadius: 7,
        padding: "6px 7px",
        cursor: "pointer",
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = bg)}
    >
      {children}
    </button>
  );
}

function PaginationButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0.5rem 0.8rem",
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        background: disabled ? "#f9fafb" : C.surface,
        color: disabled ? C.textFaint : C.textMuted,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "0.82rem",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

const Th = ({
  children,
  center,
  width,
}: {
  children: React.ReactNode;
  center?: boolean;
  width?: number;
}) => (
  <th
    style={{
      padding: "0.8rem 1rem",
      textAlign: center ? "center" : "left",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: "#888",
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      whiteSpace: "nowrap",
      width,
      background: C.headerBg,
      borderBottom: `1px solid ${C.border}`,
    }}
  >
    {children}
  </th>
);

export default function AdminPromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [productos, setProductos] = useState<ProductoSimple[]>([]);
  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [codeSearch, setCodeSearch] = useState("");
  const [codeStatus, setCodeStatus] = useState<
    "idle" | "found" | "not_found" | "searching"
  >("idle");
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pageRange = useMemo(() => {
    const from = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, totalItems);
    return { from, to };
  }, [page, totalItems]);

  async function loadPromociones(pageToLoad = page, currentSearch = search) {
    setLoading(true);

    const from = (pageToLoad - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("promociones")
      .select("*, productos(name, code)", { count: "exact" })
      .order("id", { ascending: false });

    if (currentSearch.trim()) {
      query = query.or(
        `tipo_descuento.ilike.%${currentSearch}%,productos.name.ilike.%${currentSearch}%,productos.code.ilike.%${currentSearch}%`,
      );
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      alert(error.message);
      setPromociones([]);
      setTotalItems(0);
      setLoading(false);
      return;
    }

    const mapped = ((data as PromocionRow[]) ?? []).map((p) => ({
      ...p,
      producto_nombre: p.productos?.name ?? "Producto eliminado",
      producto_code: p.productos?.code ?? "",
      productos: undefined,
    }));

    setPromociones(mapped);
    setTotalItems(count ?? 0);
    setLoading(false);
  }

  async function loadProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("id, code, name")
      .order("code");

    if (error) {
      alert(error.message);
      return;
    }

    setProductos(data ?? []);
  }

  useEffect(() => {
    loadProductos();
  }, []);

  useEffect(() => {
    loadPromociones(page, search);
  }, [page, search]);

  async function buscarPorCodigo(code: string) {
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setCodeStatus("idle");
      setForm((f) => ({
        ...f,
        producto_id: 0,
        producto_nombre: "",
        producto_code: "",
      }));
      return;
    }

    setCodeStatus("searching");

    const { data } = await supabase
      .from("productos")
      .select("id, code, name")
      .ilike("code", trimmed)
      .single();

    if (data) {
      setCodeStatus("found");
      setForm((f) => ({
        ...f,
        producto_id: data.id,
        producto_nombre: data.name,
        producto_code: data.code,
      }));
    } else {
      setCodeStatus("not_found");
      setForm((f) => ({
        ...f,
        producto_id: 0,
        producto_nombre: "",
        producto_code: "",
      }));
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    if (!form.producto_id) return alert("Ingresa un código de producto válido");
    if (!form.valor_descuento || form.valor_descuento <= 0)
      return alert("Valor de descuento inválido");
    if (form.tipo_descuento === "porcentaje" && form.valor_descuento > 100)
      return alert("El porcentaje no puede ser mayor a 100");

    const payload: Record<string, any> = {
      producto_id: form.producto_id,
      tipo_descuento: form.tipo_descuento,
      valor_descuento: form.valor_descuento,
      activo: form.activo,
    };

    if (form.fecha_inicio) payload.fecha_inicio = form.fecha_inicio;
    if (form.fecha_fin) payload.fecha_fin = form.fecha_fin;

    setSaving(true);

    const { error } = editId
      ? await supabase.from("promociones").update(payload).eq("id", editId)
      : await supabase.from("promociones").insert(payload);

    setSaving(false);

    if (error) return alert(error.message);

    cancelForm();
    setSuccessMsg("Promoción guardada correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    setPage(1);
    loadPromociones(1, search);
  }

  function onEdit(p: Promocion) {
    const prod = productos.find((pr) => pr.id === p.producto_id);

    setEditId(p.id);
    setCodeSearch(prod?.code ?? p.producto_code ?? "");
    setCodeStatus(prod || p.producto_code ? "found" : "idle");
    setForm({
      producto_id: p.producto_id,
      producto_code: prod?.code ?? p.producto_code ?? "",
      producto_nombre: p.producto_nombre ?? "",
      tipo_descuento: p.tipo_descuento,
      valor_descuento: p.valor_descuento,
      fecha_inicio: p.fecha_inicio?.slice(0, 16) ?? "",
      fecha_fin: p.fecha_fin?.slice(0, 16) ?? "",
      activo: p.activo,
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar esta promoción?")) return;

    const { error } = await supabase.from("promociones").delete().eq("id", id);
    if (error) return alert(error.message);

    const nextPage = promociones.length === 1 && page > 1 ? page - 1 : page;
    setPage(nextPage);
    loadPromociones(nextPage, search);
  }

  async function toggleActivo(p: Promocion) {
    const { error } = await supabase
      .from("promociones")
      .update({ activo: !p.activo })
      .eq("id", p.id);

    if (error) return alert(error.message);

    loadPromociones(page, search);
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setCodeSearch("");
    setCodeStatus("idle");
    setShowForm(false);
  }

  function onFocusInput(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    e.currentTarget.style.borderColor = C.primary;
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.12)";
  }

  function onBlurInput(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    e.currentTarget.style.borderColor = C.border;
    e.currentTarget.style.boxShadow = "none";
  }

  function formatDate(d: string | null) {
    if (!d) return "—";

    return new Date(d).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatValor(p: Promocion) {
    return p.tipo_descuento === "porcentaje"
      ? `${p.valor_descuento}%`
      : `S/ ${p.valor_descuento.toFixed(2)}`;
  }

  const codeInputBorderColor =
    codeStatus === "found"
      ? C.success
      : codeStatus === "not_found"
        ? C.danger
        : C.border;

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: C.bg,
        minHeight: "100vh",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {successMsg && (<div style={{position:"fixed",top:"1rem",right:"1rem",zIndex:9999,background:"#16a34a",color:"#fff",padding:"0.75rem 1.25rem",borderRadius:"10px",fontWeight:600,fontSize:"0.875rem",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:"8px"}}><CheckCircle size={16}/> {successMsg}</div>)}
      <PageHeader
        title="Promociones"
        subtitle="Gestiona descuentos de productos con paginación"
        actions={
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) cancelForm();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: showForm ? "#f3f4f6" : C.primary,
              color: showForm ? C.textMuted : "#fff",
              border: showForm ? `1px solid ${C.border}` : "none",
              borderRadius: "10px",
              padding: "0.65rem 1.2rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.18s",
              boxShadow: showForm ? "none" : "0 2px 8px rgba(245,166,35,0.35)",
            }}
            onMouseEnter={(e) => {
              if (!showForm) e.currentTarget.style.background = C.primaryHover;
            }}
            onMouseLeave={(e) => {
              if (!showForm) e.currentTarget.style.background = C.primary;
            }}
          >
            {showForm ? (
              <>✕ Cancelar</>
            ) : (
              <>
                <Tag size={15} /> + Nueva promoción
              </>
            )}
          </button>
        }
      />

      {showForm && (
        <div
          style={{
            background: C.surface,
            borderRadius: "12px",
            padding: "1.75rem",
            marginBottom: "1.5rem",
            border: "1px solid #e8e8e8",
            borderTop: `3px solid ${C.primary}`,
          }}
        >
          <h2
            style={{
              margin: "0 0 1.4rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: C.text,
            }}
          >
            {editId ? "Editar promoción" : "Nueva promoción"}
          </h2>

          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Código de producto *</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{
                      ...inp,
                      fontFamily: "ui-monospace, monospace",
                      borderColor: codeInputBorderColor,
                      paddingRight: "2.2rem",
                      ...(codeStatus === "found"
                        ? { boxShadow: "0 0 0 3px rgba(22,163,74,0.1)" }
                        : {}),
                      ...(codeStatus === "not_found"
                        ? { boxShadow: "0 0 0 3px rgba(220,38,38,0.1)" }
                        : {}),
                    }}
                    placeholder="Ej: PRD-001"
                    value={codeSearch}
                    onChange={(e) => {
                      setCodeSearch(e.target.value);
                      setCodeStatus("idle");
                      setForm((f) => ({
                        ...f,
                        producto_id: 0,
                        producto_nombre: "",
                      }));
                    }}
                    onBlur={() => buscarPorCodigo(codeSearch)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        buscarPorCodigo(codeSearch);
                      }
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    {codeStatus === "found" && (
                      <CheckCircle2 size={16} color={C.success} />
                    )}
                    {codeStatus === "not_found" && (
                      <XCircle size={16} color={C.danger} />
                    )}
                    {codeStatus === "searching" && (
                      <span style={{ fontSize: "0.7rem", color: C.textFaint }}>
                        ...
                      </span>
                    )}
                  </div>
                </div>

                {codeStatus === "found" && (
                  <p
                    style={{
                      margin: "0.3rem 0 0",
                      fontSize: "0.78rem",
                      color: C.success,
                      fontWeight: 600,
                    }}
                  >
                    ✓ {form.producto_nombre}
                  </p>
                )}

                {codeStatus === "not_found" && (
                  <p
                    style={{
                      margin: "0.3rem 0 0",
                      fontSize: "0.78rem",
                      color: C.danger,
                      fontWeight: 600,
                    }}
                  >
                    Código no encontrado
                  </p>
                )}
              </div>

              <div>
                <label style={lbl}>Tipo descuento</label>
                <select
                  style={inp}
                  value={form.tipo_descuento}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo_descuento: e.target.value as
                        | "porcentaje"
                        | "monto_fijo",
                    })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto_fijo">Monto fijo (S/)</option>
                </select>
              </div>

              <div>
                <label style={lbl}>
                  Valor <span style={{ color: C.textFaint, fontWeight: 400 }}>({form.tipo_descuento === "porcentaje" ? "%" : "S/"})</span>
                </label>
                <input
                  style={inp}
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
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <label style={lbl}>
                  Fecha inicio <span style={{ color: C.textFaint, fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </label>
                <input
                  style={inp}
                  type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>
                  Fecha fin <span style={{ color: C.textFaint, fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </label>
                <input
                  style={inp}
                  type="datetime-local"
                  value={form.fecha_fin}
                  onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>Estado</label>
                <select
                  style={inp}
                  value={form.activo ? "true" : "false"}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.value === "true" })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: C.primary,
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.5rem",
                  borderRadius: "9px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.65 : 1,
                  boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
                  transition: "background 0.18s",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = C.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.primary;
                }}
              >
                {saving
                  ? "Guardando..."
                  : editId
                    ? "Guardar cambios"
                    : "Crear promoción"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "9px",
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  color: C.textMuted,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.headerBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = C.surface)
                }
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <div style={{ position: "relative", maxWidth: 380, width: "100%" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: C.textFaint,
                  pointerEvents: "none",
                }}
              />
              <input
                style={{ ...inp, paddingLeft: "34px" }}
                placeholder="Buscar por producto, código o tipo..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    setSearch(searchInput.trim());
                  }
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setPage(1);
                  setSearch(searchInput.trim());
                }}
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: "9px",
                  border: "none",
                  background: C.primary,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Buscar
              </button>

              {search && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  style={{
                    padding: "0.65rem 1rem",
                    borderRadius: "9px",
                    border: `1px solid ${C.border}`,
                    background: C.surface,
                    color: C.textMuted,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div
              style={{
                background: C.surface,
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                color: C.textFaint,
                border: "1px solid #e8e8e8",
              }}
            >
              Cargando promociones...
            </div>
          ) : (
            <div
              style={{
                background: C.surface,
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
                overflow: "hidden",
              }}
            >
              <div
                style={
                  {
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                  } as React.CSSProperties
                }
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 680,
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <Th>Producto</Th>
                      <Th>Descuento</Th>
                      <Th>Vigencia</Th>
                      <Th>Estado</Th>
                      <Th center>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {promociones.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            color: C.textFaint,
                            fontSize: "0.9rem",
                          }}
                        >
                          {search
                            ? "Sin resultados para esa búsqueda"
                            : "No hay promociones aún"}
                        </td>
                      </tr>
                    ) : (
                      promociones.map((p, i) => (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom:
                              i < promociones.length - 1
                                ? `1px solid ${C.borderLight}`
                                : "none",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = C.headerBg)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "0.95rem 1rem", minWidth: 200 }}>
                            {p.producto_code && (
                              <span
                                style={{
                                  fontFamily: "ui-monospace, monospace",
                                  fontSize: "0.75rem",
                                  color: C.textFaint,
                                  marginRight: 6,
                                  background: "#f3f4f6",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                {p.producto_code}
                              </span>
                            )}
                            <span
                              style={{
                                fontWeight: 600,
                                color: C.text,
                                fontSize: "0.875rem",
                              }}
                            >
                              {p.producto_nombre}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "0.95rem 1rem",
                              minWidth: 110,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                background: C.primaryLight,
                                color: C.primaryHover,
                                border: `1px solid ${C.primaryBorder}`,
                                padding: "3px 10px",
                                borderRadius: "7px",
                                fontSize: "0.85rem",
                                fontWeight: 800,
                              }}
                            >
                              <Tag size={12} />
                              {formatValor(p)}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "0.95rem 1rem",
                              fontSize: "0.82rem",
                              color: C.textMuted,
                              minWidth: 170,
                            }}
                          >
                            {p.fecha_inicio || p.fecha_fin ? (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                <span>
                                  <span
                                    style={{
                                      fontSize: "0.72rem",
                                      color: C.textFaint,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.05em",
                                    }}
                                  >
                                    Desde:{" "}
                                  </span>
                                  {formatDate(p.fecha_inicio)}
                                </span>
                                <span>
                                  <span
                                    style={{
                                      fontSize: "0.72rem",
                                      color: C.textFaint,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.05em",
                                    }}
                                  >
                                    Hasta:{" "}
                                  </span>
                                  {formatDate(p.fecha_fin)}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: C.textFaint }}>
                                Sin fecha límite
                              </span>
                            )}
                          </td>

                          <td style={{ padding: "0.95rem 1rem", minWidth: 110 }}>
                            <button
                              onClick={() => toggleActivo(p)}
                              title="Click para cambiar estado"
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                              }}
                            >
                              <Badge
                                color={p.activo ? C.success : C.danger}
                                bg={
                                  p.activo
                                    ? C.successLight
                                    : "rgba(220,38,38,0.1)"
                                }
                              >
                                {p.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </button>
                          </td>

                          <td style={{ padding: "0.95rem 1rem", minWidth: 100 }}>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                justifyContent: "center",
                              }}
                            >
                              <IconBtn
                                onClick={() => onEdit(p)}
                                title="Editar"
                                color="#f5a623"
                                bg="rgba(245,166,35,0.1)"
                                bgHover="rgba(245,166,35,0.18)"
                                border="1px solid rgba(245,166,35,0.18)"
                              >
                                <Pencil size={14} />
                              </IconBtn>

                              <IconBtn
                                onClick={() => onDelete(p.id)}
                                title="Eliminar"
                                color={C.danger}
                                bg={C.dangerLight}
                                bgHover={C.dangerHover}
                              >
                                <Trash2 size={14} />
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${C.border}`,
                  background: C.headerBg,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "0.78rem", color: C.textFaint }}>
                  Mostrando {pageRange.from}-{pageRange.to} de {totalItems} promoción
                  {totalItems !== 1 ? "es" : ""}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: C.textMuted }}>
                    Página {page} de {totalPages}
                  </span>

                  <PaginationButton
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={14} /> Anterior
                  </PaginationButton>

                  <PaginationButton
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Siguiente <ChevronRight size={14} />
                  </PaginationButton>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
