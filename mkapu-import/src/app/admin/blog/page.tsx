"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import {
  FileText,
  ImageOff,
  ImagePlus,
  Pencil,
  PlusCircle,
  Trash2,
  VideoIcon,
  VideoOff,
} from "lucide-react";

type BlogPost = {
  id: number;
  titulo: string;
  descripcion: string | null;
  contenido: string | null;
  fecha_publicacion: string;
  orden: number;
  activo: boolean;
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function AdminBlogPage() {
  const [rows, setRows] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mediaMap, setMediaMap] = useState<
    Record<number, { imgs: number; vids: number }>
  >({});
  const [savingOrder, setSavingOrder] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: posts }, { data: imgs }, { data: vids }] = await Promise.all(
      [
        supabase.from("vlog_posts").select("*").order("orden"),
        supabase.from("vlog_imagenes").select("vlog_post_id"),
        supabase.from("vlog_videos").select("vlog_post_id"),
      ],
    );
    setRows(posts ?? []);
    const mapa: Record<number, { imgs: number; vids: number }> = {};
    for (const img of imgs ?? []) {
      if (!mapa[img.vlog_post_id]) mapa[img.vlog_post_id] = { imgs: 0, vids: 0 };
      mapa[img.vlog_post_id].imgs++;
    }
    for (const vid of vids ?? []) {
      if (!mapa[vid.vlog_post_id]) mapa[vid.vlog_post_id] = { imgs: 0, vids: 0 };
      mapa[vid.vlog_post_id].vids++;
    }
    setMediaMap(mapa);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function persistOrder(list: BlogPost[]) {
    setSavingOrder(true);
    const reordered = list.map((p, i) => ({ ...p, orden: i + 1 }));
    setRows(reordered);
    await Promise.all(
      reordered.map((p) =>
        supabase.from("vlog_posts").update({ orden: p.orden }).eq("id", p.id),
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
      !confirm(
        "¿Eliminar este post? También se eliminarán sus imágenes y videos.",
      )
    )
      return;
    await supabase.from("vlog_imagenes").delete().eq("vlog_post_id", id);
    await supabase.from("vlog_videos").delete().eq("vlog_post_id", id);
    await supabase.from("vlog_posts").delete().eq("id", id);
    await load();
  }

  function onFocusInput(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
  }

  const filtered = rows.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <SectionHeader
        title="Blog"
        icon={<FileText size={18} />}
        description="Crea y gestiona las publicaciones del blog"
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
                }}
              >
                Guardando orden...
              </span>
            )}
            <Link
              href="/admin/blog/nuevo"
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
              <PlusCircle size={15} /> Nuevo post
            </Link>
          </>
        }
      />

      <div style={{ marginBottom: "1rem" }}>
        <input
          style={{ ...inp, maxWidth: 380 }}
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
        />
      </div>

      <DataTable
        columns={[
          { key: "titulo", label: "Título" },
          { key: "descripcion", label: "Descripción" },
          { key: "fecha", label: "Fecha" },
          { key: "orden", label: "Orden" },
          { key: "imagenes", label: "Imágenes" },
          { key: "videos", label: "Videos" },
          { key: "estado", label: "Estado" },
          { key: "acciones", label: "Acciones" },
        ]}
        rows={filtered}
        pageSize={10}
        minWidth={700}
        loading={loading}
        loadingText="Cargando posts..."
        emptyText={search ? "Sin resultados" : "No hay posts aún"}
        renderRow={(p, i) => {
          const media = mediaMap[p.id] ?? { imgs: 0, vids: 0 };
          return (
            <tr
              key={p.id}
              style={{
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {/* Título */}
              <td
                style={{
                  padding: "0.9rem 1rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "0.9rem",
                  maxWidth: 180,
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
                  {p.titulo}
                </span>
              </td>

              {/* Descripción */}
              <td
                style={{
                  padding: "0.9rem 1rem",
                  color: "#555",
                  fontSize: "0.875rem",
                  maxWidth: 200,
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
                  {p.descripcion || <span style={{ color: "#ccc" }}>—</span>}
                </span>
              </td>

              {/* Fecha */}
              <td
                style={{
                  padding: "0.9rem 1rem",
                  color: "#666",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                }}
              >
                {new Date(p.fecha_publicacion).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              {/* Orden + Mover */}
              <td style={{ padding: "0.6rem 1rem", textAlign: "center" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0 || savingOrder}
                    title="Subir"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
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
                      transition: "background 0.15s",
                    }}
                  >
                    ↑
                  </button>
                  <span
                    style={{
                      minWidth: 20,
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#555",
                      fontSize: "0.85rem",
                    }}
                  >
                    {p.orden}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === rows.length - 1 || savingOrder}
                    title="Bajar"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
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
                      transition: "background 0.15s",
                    }}
                  >
                    ↓
                  </button>
                </div>
              </td>

              {/* Imágenes badge */}
              <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                {media.imgs > 0 ? (
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
                    <ImagePlus size={12} strokeWidth={2} /> {media.imgs}
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

              {/* Videos badge */}
              <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                {media.vids > 0 ? (
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
                    <VideoIcon size={12} strokeWidth={2} /> {media.vids}
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

              {/* Estado */}
              <td style={{ padding: "0.9rem 1rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    background: p.activo
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    color: p.activo ? "#16a34a" : "#dc2626",
                  }}
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              {/* Acciones */}
              <td style={{ padding: "0.9rem 1rem" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link
                    href={`/admin/blog/${p.id}/editar`}
                    title="Editar"
                    style={{
                      background: "rgba(245,166,35,0.1)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      color: "#f5a623",
                      display: "flex",
                      transition: "background 0.2s",
                    }}
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => onDelete(p.id)}
                    title="Eliminar"
                    style={{
                      background: "rgba(220,38,38,0.08)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      color: "#dc2626",
                      display: "flex",
                      transition: "background 0.2s",
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