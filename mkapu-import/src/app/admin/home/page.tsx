"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppModal } from "@/context/AppModalContext";
import {
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
} from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";

type Categoria = { id: number; name: string; slug: string; activo: boolean };
type Seccion = {
  id: number;
  categoria_id: number;
  orden: number;
  activo: boolean;
};

export default function AdminHomePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const { confirm, alert: showAlert } = useAppModal();

  async function load() {
    setLoading(true);
    const [{ data: cats }, { data: secs }] = await Promise.all([
      supabase.from("categorias").select("*").eq("activo", true).order("name"),
      supabase.from("home_secciones").select("*").order("orden"),
    ]);
    setCategorias(cats ?? []);
    setSecciones(secs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const añadidos = new Set(secciones.map((s) => s.categoria_id));

  async function agregarCategoria(cat: Categoria) {
    if (añadidos.has(cat.id)) return;
    setSaving(true);
    const maxOrden =
      secciones.length > 0
        ? Math.max(...secciones.map((s) => s.orden)) + 1
        : 0;
    await supabase
      .from("home_secciones")
      .insert({ categoria_id: cat.id, orden: maxOrden, activo: true });
    await load();
    setSaving(false);
  }

  async function toggleActivo(sec: Seccion) {
    await supabase
      .from("home_secciones")
      .update({ activo: !sec.activo })
      .eq("id", sec.id);
    setSecciones((prev) =>
      prev.map((s) => (s.id === sec.id ? { ...s, activo: !s.activo } : s)),
    );
  }

  async function eliminar(sec: Seccion) {
    const _ok = await confirm({ title: "¿Quitar esta sección del home?", message: "Esta acción no se puede deshacer.", confirmText: "Eliminar", cancelText: "Cancelar", variant: "danger" });
    if (!_ok) return;
    await supabase.from("home_secciones").delete().eq("id", sec.id);
    setSecciones((prev) => prev.filter((s) => s.id !== sec.id));
  }

  async function persistOrder(list: Seccion[]) {
    setSaving(true);
    await Promise.all(
      list.map((s, i) =>
        supabase.from("home_secciones").update({ orden: i }).eq("id", s.id),
      ),
    );
    setSaving(false);
  }

  function onDragStart(idx: number) {
    setDragIdx(idx);
  }

  async function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordenado = [...secciones];
    const [moved] = reordenado.splice(dragIdx, 1);
    reordenado.splice(targetIdx, 0, moved);
    setSecciones(reordenado);
    setDragIdx(null);
    void persistOrder(reordenado);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const copy = [...secciones];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    setSecciones(copy);
    void persistOrder(copy);
  }

  function moveDown(idx: number) {
    if (idx === secciones.length - 1) return;
    const copy = [...secciones];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    setSecciones(copy);
    void persistOrder(copy);
  }

  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const noAñadidas = categorias.filter((c) => !añadidos.has(c.id));
  const categoriasVisibles = mostrarTodas ? noAñadidas : noAñadidas.slice(0, 6);

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <SectionHeader
        title="Secciones del Home"
        icon={<LayoutDashboard size={18} />}
        description={
          <>
            Elige qué categorías se muestran en la página principal y define su
            orden.
          </>
        }
        actions={
          saving && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "#fff8e6",
                color: "#c47d00",
                fontSize: "0.8rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              <Loader2
                size={14}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Guardando…
            </div>
          )
        }
      />

      {/* Categorías disponibles */}
      <section
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "#fafafa",
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          <p
            style={{
              margin: "0 0 0.25rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            Categorías disponibles
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
            Haz clic en una categoría para agregarla al home.
          </p>
        </div>

        {noAñadidas.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "#aaa",
              fontSize: "0.85rem",
            }}
          >
            ✅ Todas las categorías activas ya están en el home.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "10px",
                padding: "1.25rem",
              }}
            >
              {categoriasVisibles.map((cat) => (
                <button
                  key={cat.id}
                  disabled={saving}
                  onClick={() => agregarCategoria(cat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 16px",
                    borderRadius: 999,
                    border: "1.5px solid #e0d8d0",
                    background: "#fff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#444",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    opacity: saving ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.background = "#fff8ee";
                      e.currentTarget.style.borderColor = "#f5a623";
                      e.currentTarget.style.color = "#c47d00";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e0d8d0";
                    e.currentTarget.style.color = "#444";
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#c47d00",
                      fontWeight: 700,
                    }}
                  >
                    +
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>

            {noAñadidas.length > 6 && (
              <div
                style={{
                  padding: "0 1.25rem 1.25rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setMostrarTodas(!mostrarTodas)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    color: "#666",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.borderColor = "#f5a623";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  {mostrarTodas ? (
                    <>
                      Ver menos <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Ver más ({noAñadidas.length - 6}){" "}
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Tabla de secciones */}
      <DataTable
        columns={[
          { key: "categoria", label: "Categoría" },
          { key: "orden", label: "Orden", align: "center" },
          { key: "estado", label: "Estado" },
          { key: "acciones", label: "Acciones", align: "center" },
        ]}
        rows={secciones}
        pageSize={10}
        loading={loading}
        loadingText="Cargando secciones…"
        emptyText="Aún no has configurado secciones. Añade una categoría arriba."
        banner={
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "#fafafa",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#888",
                }}
              >
                Secciones en el home
              </span>
              <span
                style={{ marginLeft: 8, fontSize: "0.78rem", color: "#aaa" }}
              >
                ({secciones.length})
              </span>
            </div>
            <span
              style={{
                fontSize: "0.78rem",
                color: "#aaa",
                whiteSpace: "nowrap",
              }}
            >
              Arrastra o usa las flechas para reordenar
            </span>
          </div>
        }
        renderRow={(sec, idx) => {
          const cat = catMap[sec.categoria_id];
          const isFirst = idx === 0;
          const isLast = idx === secciones.length - 1;

                  return (
                    <tr
                      key={sec.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                      style={{
                        borderBottom:
                          idx < secciones.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        opacity: sec.activo ? 1 : 0.5,
                        cursor: "grab",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      {/* Categoría */}
                      <td style={{ padding: "0.9rem 1rem", minWidth: 200 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1a1a1a",
                            fontSize: "0.9rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cat?.name ?? "Categoría eliminada"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "#aaa",
                            fontFamily: "ui-monospace, monospace",
                            marginTop: 2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          /categoria/{cat?.slug}
                        </div>
                      </td>

                      {/* Columna Orden: ↑ número ↓ */}
                      <td
                        style={{
                          padding: "0.9rem 1rem",
                          textAlign: "center",
                          minWidth: 90,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => moveUp(idx)}
                            disabled={isFirst || saving}
                            title="Subir"
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "6px",
                              border: "1px solid #e2e2e2",
                              background: "#fff",
                              fontWeight: 700,
                              color: "#666",
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isFirst || saving ? "not-allowed" : "pointer",
                              opacity: isFirst ? 0.4 : 1,
                              padding: 0,
                            }}
                          >
                            ↑
                          </button>
                          <span
                            style={{
                              minWidth: "20px",
                              textAlign: "center",
                              fontWeight: 700,
                              color: "#555",
                              fontSize: "0.85rem",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveDown(idx)}
                            disabled={isLast || saving}
                            title="Bajar"
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "6px",
                              border: "1px solid #e2e2e2",
                              background: "#fff",
                              fontWeight: 700,
                              color: "#666",
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isLast || saving ? "not-allowed" : "pointer",
                              opacity: isLast ? 0.4 : 1,
                              padding: 0,
                            }}
                          >
                            ↓
                          </button>
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "0.9rem 1rem", minWidth: 110 }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            background: sec.activo ? "#ecfdf3" : "#fef2f2",
                            color: sec.activo ? "#166534" : "#b91c1c",
                          }}
                        >
                          {sec.activo ? "Visible" : "Oculta"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td
                        style={{
                          padding: "0.9rem 1rem",
                          textAlign: "center",
                          minWidth: 110,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {/* Toggle visibilidad */}
                          <button
                            onClick={() => toggleActivo(sec)}
                            title={sec.activo ? "Ocultar" : "Mostrar"}
                            style={{
                              background: "rgba(245,166,35,0.1)",
                              border: "none",
                              borderRadius: 6,
                              padding: 6,
                              cursor: "pointer",
                              color: "#f5a623",
                              display: "flex",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(245,166,35,0.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(245,166,35,0.1)")
                            }
                          >
                            {sec.activo ? (
                              <Eye size={15} />
                            ) : (
                              <EyeOff size={15} />
                            )}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => eliminar(sec)}
                            title="Eliminar"
                            style={{
                              background: "rgba(220,38,38,0.08)",
                              border: "none",
                              borderRadius: 6,
                              padding: 6,
                              cursor: "pointer",
                              color: "#dc2626",
                              display: "flex",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(220,38,38,0.18)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(220,38,38,0.08)")
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
</tr>
          );
        }}
      />
    </div>
  );
}
