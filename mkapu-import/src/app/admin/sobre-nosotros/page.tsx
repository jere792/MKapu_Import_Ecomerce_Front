"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import {
  Info,
  Pencil,
  PlusCircle,
  Trash2,
  ImageOff,
  ImagePlus,
} from "lucide-react";

type Seccion = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  orden: number;
  activo: boolean;
};

export default function AdminSobreNosotrosPage() {
  const [rows, setRows] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagenesMap, setImagenesMap] = useState<Record<number, number>>({});
  const [savingOrder, setSavingOrder] = useState(false);

  async function load() {
    setLoading(true);

    const [{ data: secciones }, { data: imgs }] = await Promise.all([
      supabase.from("quienes_somos_secciones").select("*").order("orden"),
      supabase.from("quienes_somos_imagenes").select("seccion_id"),
    ]);

    setRows(secciones ?? []);

    const mapa: Record<number, number> = {};
    for (const img of imgs ?? []) {
      mapa[img.seccion_id] = (mapa[img.seccion_id] ?? 0) + 1;
    }

    setImagenesMap(mapa);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function persistOrder(list: Seccion[]) {
    setSavingOrder(true);

    const reordered = list.map((s, i) => ({ ...s, orden: i + 1 }));
    setRows(reordered);

    await Promise.all(
      reordered.map((s) =>
        supabase
          .from("quienes_somos_secciones")
          .update({ orden: s.orden })
          .eq("id", s.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const copy = [...rows];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    void persistOrder(copy);
  }

  function moveDown(idx: number) {
    if (idx === rows.length - 1) return;
    const copy = [...rows];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    void persistOrder(copy);
  }

  async function onDelete(id: number) {
    if (
      !confirm("¿Eliminar esta sección? También se eliminarán sus imágenes.")
    ) {
      return;
    }

    await supabase.from("quienes_somos_imagenes").delete().eq("seccion_id", id);
    await supabase.from("quienes_somos_secciones").delete().eq("id", id);
    await load();
  }

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <SectionHeader
        title="Sobre Nosotros"
        icon={<Info size={18} />}
        description={'Gestiona las secciones de la página "Quiénes Somos"'}
        actions={
          <>
            {savingOrder && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#c47d00",
                  background: "#fff8e6",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Guardando orden...
              </span>
            )}

            <Link
              href="/admin/sobre-nosotros/nuevo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#f5a623",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.65rem 1.1rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <PlusCircle size={15} /> Nueva sección
            </Link>
          </>
        }
      />

      <DataTable
        columns={[
          { key: "titulo", label: "Título" },
          { key: "descripcion", label: "Descripción" },
          { key: "orden", label: "Orden" },
          { key: "imagenes", label: "Imágenes" },
          { key: "estado", label: "Estado" },
          { key: "acciones", label: "Acciones" },
        ]}
        rows={rows}
        pageSize={10}
        minWidth={700}
        loading={loading}
        loadingText="Cargando secciones..."
        emptyText="No hay secciones registradas"
        banner={
          savingOrder && (
            <div
              style={{
                padding: "0.6rem 1.25rem",
                background: "#fff8e6",
                borderBottom: "1px solid #ffe5a0",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#c47d00",
                  fontWeight: 600,
                }}
              >
                Guardando orden...
              </span>
            </div>
          )
        }
        renderRow={(s, i) => {
          const cantImg = imagenesMap[s.id] ?? 0;
          return (
            <tr
              key={s.id}
              style={{
                borderBottom:
                  i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <td
                style={{
                  padding: "0.9rem 1rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "0.9rem",
                  minWidth: 160,
                }}
              >
                {s.titulo || (
                  <span style={{ color: "#ccc", fontWeight: 400 }}>
                    Sin título
                  </span>
                )}
              </td>

              <td
                style={{
                  padding: "0.9rem 1rem",
                  color: "#555",
                  fontSize: "0.875rem",
                  maxWidth: 260,
                  minWidth: 160,
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {s.descripcion ? (
                    s.descripcion.replace(/<[^>]*>/g, "").slice(0, 90) +
                    (s.descripcion.length > 90 ? "..." : "")
                  ) : (
                    <span style={{ color: "#ccc" }}>—</span>
                  )}
                </span>
              </td>

              <td
                style={{
                  padding: "0.9rem 1rem",
                  textAlign: "center",
                  minWidth: 80,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0 || savingOrder}
                    title="Subir"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "6px",
                      border: "1px solid #e2e2e2",
                      background: "#fff",
                      cursor: i === 0 || savingOrder ? "not-allowed" : "pointer",
                      opacity: i === 0 || savingOrder ? 0.35 : 1,
                      fontWeight: 700,
                      color: "#666",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
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
                    {s.orden}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === rows.length - 1 || savingOrder}
                    title="Bajar"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "6px",
                      border: "1px solid #e2e2e2",
                      background: "#fff",
                      cursor:
                        i === rows.length - 1 || savingOrder
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        i === rows.length - 1 || savingOrder ? 0.35 : 1,
                      fontWeight: 700,
                      color: "#666",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    ↓
                  </button>
                </div>
              </td>

              <td style={{ padding: "0.9rem 1rem", minWidth: 130 }}>
                {cantImg > 0 ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      background: "#eef2ff",
                      color: "#4f46e5",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ImagePlus size={12} strokeWidth={2} /> {cantImg}
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      color: "#ccc",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ImageOff size={12} strokeWidth={1.5} /> Sin imágenes
                  </span>
                )}
              </td>

              <td style={{ padding: "0.9rem 1rem", minWidth: 110 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    background: s.activo
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    color: s.activo ? "#16a34a" : "#dc2626",
                  }}
                >
                  {s.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td style={{ padding: "0.9rem 1rem", minWidth: 100 }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link
                    href={`/admin/sobre-nosotros/${s.id}/editar`}
                    title="Editar sección"
                    style={{
                      background: "rgba(245,166,35,0.1)",
                      color: "#f5a623",
                      border: "1px solid rgba(245,166,35,0.18)",
                      padding: "7px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pencil size={15} />
                  </Link>

                  <button
                    onClick={() => onDelete(s.id)}
                    title="Eliminar sección"
                    style={{
                      background: "rgba(220,38,38,0.08)",
                      border: "1px solid rgba(220,38,38,0.2)",
                      borderRadius: "8px",
                      padding: "7px",
                      cursor: "pointer",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
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