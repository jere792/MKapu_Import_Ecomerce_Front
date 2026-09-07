"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAppModal } from "@/context/AppModalContext";
import type { Colaborador } from "@/lib/queries";
import {
  Pencil,
  Trash2,
  Users,
  ImageOff,
  VideoOff,
  ImagePlus,
  VideoIcon,
  PlusCircle,
} from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";

type ColaboradorRow = Colaborador & {
  created_at?: string | null;
};

export default function AdminColaboradoresPage() {
  const [rows, setRows] = useState<ColaboradorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaMap, setMediaMap] = useState<
    Record<number, { imgs: number; vids: number }>
  >({});
  const [savingOrder, setSavingOrder] = useState(false);
  const { confirm, alert: showAlert } = useAppModal();

  async function load() {
    setLoading(true);

    const [{ data: colabs }, { data: allMedia }] = await Promise.all([
      supabase
        .from("colaboradores")
        .select("*")
        .order("orden", { ascending: true }),
      supabase.from("colaborador_media").select("colaborador_id, tipo"),
    ]);

    setRows((colabs as ColaboradorRow[]) ?? []);

    const mapa: Record<number, { imgs: number; vids: number }> = {};
    for (const m of allMedia ?? []) {
      if (!mapa[m.colaborador_id]) {
        mapa[m.colaborador_id] = { imgs: 0, vids: 0 };
      }
      if (m.tipo === "imagen") mapa[m.colaborador_id].imgs++;
      else mapa[m.colaborador_id].vids++;
    }

    setMediaMap(mapa);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: number) {
    const _ok = await confirm({ title: "¿Eliminar colaborador?", message: "También se eliminará su media. Esta acción no se puede deshacer.", confirmText: "Eliminar", cancelText: "Cancelar", variant: "danger" });
    if (!_ok) return;

    await supabase.from("colaborador_media").delete().eq("colaborador_id", id);
    await supabase.from("colaboradores").delete().eq("id", id);
    await load();
  }

  async function persistOrder(list: ColaboradorRow[]) {
    setSavingOrder(true);

    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));

    setRows(reordered);

    await Promise.all(
      reordered.map((item) =>
        supabase
          .from("colaboradores")
          .update({ orden: item.orden })
          .eq("id", item.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const copy = [...rows];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    void persistOrder(copy);
  }

  function moveDown(index: number) {
    if (index === rows.length - 1) return;
    const copy = [...rows];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    void persistOrder(copy);
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
        title="Colaboradores"
        icon={<Users size={18} />}
        description="Gestiona los colaboradores del negocio"
        actions={
          <Link
            href="/admin/colaboradores/nuevo"
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
            }}
          >
            <PlusCircle size={15} /> Nuevo colaborador
          </Link>
        }
      />

      <DataTable
        columns={[
          { key: "logo", label: "Logo" },
          { key: "nombre", label: "Nombre" },
          { key: "orden", label: "Orden" },
          { key: "imagenes", label: "Imágenes" },
          { key: "videos", label: "Videos" },
          { key: "estado", label: "Estado" },
          { key: "acciones", label: "Acciones" },
        ]}
        rows={rows}
        pageSize={10}
        minWidth="980px"
        loading={loading}
        loadingText="Cargando colaboradores..."
        banner={
          savingOrder && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderBottom: "1px solid #f0f0f0",
                background: "#fff8e6",
                color: "#b07800",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              Guardando orden...
            </div>
          )
        }
        emptyIcon={<Users size={32} />}
        emptyText="No hay colaboradores aún"
        renderRow={(c, i) => {
          const m = mediaMap[c.id] ?? { imgs: 0, vids: 0 };

          return (
            <tr
              key={c.id}
              style={{
                borderBottom:
                  i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
                background: "#fff",
              }}
            >
              <td
                style={{
                  padding: "0.9rem 1rem",
                  width: 120,
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 52,
                    borderRadius: "8px",
                    border: "1px solid #e8e8e8",
                    background: "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {c.logo_url ? (
                    <img
                      src={c.logo_url}
                      alt={c.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "#ddd",
                        fontSize: "0.75rem",
                      }}
                    >
                      Sin logo
                    </span>
                  )}
                </div>
              </td>

              <td
                style={{
                  padding: "0.9rem 1rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "0.9rem",
                  minWidth: 240,
                }}
              >
                {c.name}
              </td>

              <td
                style={{
                  padding: "0.9rem 1rem",
                  minWidth: 120,
                  whiteSpace: "nowrap",
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
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "6px",
                      border: "1px solid #e2e2e2",
                      background: "#fff",
                      cursor:
                        i === 0 || savingOrder ? "not-allowed" : "pointer",
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
                    {c.orden}
                  </span>

                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === rows.length - 1 || savingOrder}
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

              <td style={{ padding: "0.9rem 1rem" }}>
                {m.imgs > 0 ? (
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
                    <ImagePlus size={12} strokeWidth={2} /> {m.imgs}
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
                    <ImageOff size={12} strokeWidth={1.5} /> Sin fotos
                  </span>
                )}
              </td>

              <td style={{ padding: "0.9rem 1rem" }}>
                {m.vids > 0 ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      background: "#f0fdf4",
                      color: "#16a34a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <VideoIcon size={12} strokeWidth={2} /> {m.vids}
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
                    <VideoOff size={12} strokeWidth={1.5} /> Sin videos
                  </span>
                )}
              </td>

              <td
                style={{
                  padding: "0.9rem 1rem",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    background: c.activo
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    color: c.activo ? "#16a34a" : "#dc2626",
                  }}
                >
                  {c.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td
                style={{
                  padding: "0.9rem 1rem",
                  minWidth: 120,
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link
                    href={`/admin/colaboradores/${c.id}/editar`}
                    title="Editar"
                    style={{
                      background: "rgba(245,166,35,0.1)",
                      color: "#f5a623",
                      border: "1px solid rgba(245,166,35,0.18)",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Pencil size={15} />
                  </Link>

                  <button
                    onClick={() => onDelete(c.id)}
                    title="Eliminar"
                    style={{
                      background: "rgba(220,53,69,0.08)",
                      color: "#dc3545",
                      border: "1px solid rgba(220,53,69,0.2)",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
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