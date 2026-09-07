"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAppModal } from "@/context/AppModalContext";
import {
  Pencil,
  Trash2,
  Tag,
  ChevronLeft,
  ChevronRight,
  List,
  CheckCircle2,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import ProductFiltersBar, {
  type FilterCategory,
} from "@/components/layout/admin/ProductFiltersBar";

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

type PromocionRow = Omit<Promocion, "producto_nombre" | "producto_code"> & {
  productos?: {
    name?: string | null;
    code?: string | null;
  } | null;
};

const PAGE_SIZE = 10;

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
  text: "#1a1a1a",
  textMuted: "#6b7280",
  textFaint: "#9ca3af",
  bg: "#f8f7f4",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f0f0f0",
  headerBg: "#fafafa",
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

export default function AdminPromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categorias, setCategorias] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<"todas" | "activas" | "vencidas">(
    "todas",
  );
  const [totalActivas, setTotalActivas] = useState(0);
  const [totalVencidas, setTotalVencidas] = useState(0);
  const [totalTodas, setTotalTodas] = useState(0);
  const { confirm, alert: showAlert } = useAppModal();

  const nowISO = new Date().toISOString().replace(/\.\d{3}/, "");

  useEffect(() => {
    supabase
      .from("categorias")
      .select("id, name")
      .then(({ data }) => {
        if (data) setCategorias(data as FilterCategory[]);
      });
  }, []);

  useEffect(() => {
    supabase
      .from("promociones")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setTotalTodas(count ?? 0));

    supabase
      .from("promociones")
      .select("id", { count: "exact", head: true })
      .eq("activo", true)
      .or(`fecha_fin.is.null,fecha_fin.gte.${nowISO}`)
      .then(({ count }) => setTotalActivas(count ?? 0));

    supabase
      .from("promociones")
      .select("id", { count: "exact", head: true })
      .lt("fecha_fin", nowISO)
      .then(({ count }) => setTotalVencidas(count ?? 0));
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pageRange = useMemo(() => {
    const from = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, totalItems);
    return { from, to };
  }, [page, totalItems]);

  async function loadPromociones(
    pageToLoad = page,
    currentSearch = search,
    currentView = viewMode,
    currentCategory = selectedCategory,
  ) {
    setLoading(true);

    const from = (pageToLoad - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("promociones")
      .select("*, productos(name, code)", { count: "exact" })
      .order("id", { ascending: false });

    if (currentView === "activas") {
      query = query
        .eq("activo", true)
        .or(`fecha_fin.is.null,fecha_fin.gte.${nowISO}`);
    } else if (currentView === "vencidas") {
      query = query.lt("fecha_fin", nowISO);
    }

    if (currentSearch.trim()) {
      query = query.or(
        `productos.name.ilike.%${currentSearch}%,productos.code.ilike.%${currentSearch}%`,
      );
    }

    if (currentCategory) {
      query = query.eq("productos.category", currentCategory);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      await showAlert({ title: "Error", message: error.message, variant: "danger" });
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

  useEffect(() => {
    loadPromociones(page, search, viewMode, selectedCategory);
  }, [page, search, viewMode, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [viewMode, search, selectedCategory]);

  async function onDelete(id: number) {
    const _ok = await confirm({ title: "¿Eliminar esta promoción?", message: "Esta acción no se puede deshacer.", confirmText: "Eliminar", cancelText: "Cancelar", variant: "danger" });
    if (!_ok) return;

    const { error } = await supabase.from("promociones").delete().eq("id", id);
    if (error) { await showAlert({ title: "Error", message: error.message, variant: "danger" }); return; }

    const nextPage = promociones.length === 1 && page > 1 ? page - 1 : page;
    setPage(nextPage);
    loadPromociones(nextPage, search);
  }

  async function toggleActivo(p: Promocion) {
    const { error } = await supabase
      .from("promociones")
      .update({ activo: !p.activo })
      .eq("id", p.id);

    if (error) { await showAlert({ title: "Error", message: error.message, variant: "danger" }); return; }

    loadPromociones(page, search);
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

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <style>{`
        .ap-view-tabs{display:flex;gap:0;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;background:#f9f9f9}
        .ap-view-tab{display:flex;align-items:center;gap:7px;padding:9px 18px;border:none;background:transparent;font-size:.82rem;font-weight:700;color:#888;cursor:pointer;transition:all .15s;white-space:nowrap;border-right:1px solid #e0e0e0}
        .ap-view-tab:last-child{border-right:none}
        .ap-view-tab--active{background:#fff;color:#1a1a1a;box-shadow:inset 0 -2px 0 #f5a623}
        .ap-view-tab:hover:not(.ap-view-tab--active){background:#f0f0f0;color:#555}
        .ap-view-tab--success.ap-view-tab--active{box-shadow:inset 0 -2px 0 #22c55e;color:#166534}
        .ap-view-tab--warning.ap-view-tab--active{box-shadow:inset 0 -2px 0 #f59e0b;color:#b45309}
        .ap-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:20px;font-size:.7rem;font-weight:800;line-height:1}
        .ap-count--default{background:#f0f0f0;color:#666}
        .ap-count--success{background:#dcfce7;color:#166534}
        .ap-count--warning{background:#fef3c7;color:#b45309}
      `}</style>

      <PageHeader
        title="Promociones"
        icon={<Tag size={18} />}
        description="Gestiona descuentos de productos"
        actions={
          <Link
            href="/admin/promociones/nuevo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: C.primary,
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.65rem 1.2rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(245,166,35,0.35)",
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            <Tag size={15} /> + Nueva promoción
          </Link>
        }
      />

      {/* Tabs de vista */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div className="ap-view-tabs">
          <button
            className={`ap-view-tab ${viewMode === "todas" ? "ap-view-tab--active" : ""}`}
            onClick={() => setViewMode("todas")}
          >
            <List size={14} />
            Todas
            <span className="ap-count ap-count--default">{totalTodas}</span>
          </button>

          <button
            className={`ap-view-tab ap-view-tab--success ${viewMode === "activas" ? "ap-view-tab--active" : ""}`}
            onClick={() => setViewMode("activas")}
          >
            <CheckCircle2 size={14} />
            Activas
            <span className="ap-count ap-count--success">{totalActivas}</span>
          </button>

          <button
            className={`ap-view-tab ap-view-tab--warning ${viewMode === "vencidas" ? "ap-view-tab--active" : ""}`}
            onClick={() => setViewMode("vencidas")}
          >
            <Clock size={14} />
            Vencidas
            <span className="ap-count ap-count--warning">{totalVencidas}</span>
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <ProductFiltersBar
          categories={categorias}
          search={search}
          onSearch={setSearch}
          category={selectedCategory}
          onCategory={setSelectedCategory}
          placeholder="Buscar por nombre o código del producto..."
        />
      </div>

      <DataTable
        columns={[
          { key: "producto", label: "Producto" },
          { key: "descuento", label: "Descuento" },
          { key: "vigencia", label: "Vigencia" },
          { key: "estado", label: "Estado" },
          { key: "acciones", label: "Acciones", align: "center" },
        ]}
        rows={promociones}
        minWidth="680px"
        loading={loading}
        loadingText="Cargando promociones..."
        emptyText={
          search
            ? "Sin resultados para esa búsqueda"
            : viewMode === "activas"
              ? "No hay promociones activas"
              : viewMode === "vencidas"
                ? "No hay promociones vencidas"
                : "No hay promociones aún"
        }
        footer={
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
        }
        renderRow={(p, i) => (
          <tr
            key={p.id}
            style={{
              borderBottom:
                i < promociones.length - 1
                  ? `1px solid ${C.borderLight}`
                  : "none",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.headerBg)}
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
                <span style={{ color: C.textFaint }}>Sin fecha límite</span>
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
                  bg={p.activo ? C.successLight : "rgba(220,38,38,0.1)"}
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
                <Link
                  href={`/admin/promociones/${p.id}/editar`}
                  title="Editar"
                  style={{
                    display: "flex",
                    background: "rgba(245,166,35,0.1)",
                    border: "1px solid rgba(245,166,35,0.18)",
                    borderRadius: 7,
                    padding: "6px 7px",
                    cursor: "pointer",
                    color: "#f5a623",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,166,35,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(245,166,35,0.1)")
                  }
                >
                  <Pencil size={14} />
                </Link>

                <button
                  onClick={() => onDelete(p.id)}
                  title="Eliminar"
                  style={{
                    display: "flex",
                    background: C.dangerLight,
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 7px",
                    cursor: "pointer",
                    color: C.danger,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.dangerHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = C.dangerLight)
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}