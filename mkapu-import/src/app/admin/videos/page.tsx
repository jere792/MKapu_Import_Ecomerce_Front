"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/lib/queries";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import {
  Film,
  Pencil,
  Trash2,
  PlusCircle,
  Clapperboard,
  Video as VideoIcon,
  List,
} from "lucide-react";

export default function AdminVideosPage() {
  const [rows, setRows] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<"" | "video" | "vlog">("");

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    await load();
  }

  const filtered = filterTipo
    ? rows.filter((v) => v.tipo === filterTipo)
    : rows;

  const totalCount = rows.length;
  const videoCount = rows.filter((v) => v.tipo === "video").length;
  const vlogCount = rows.filter((v) => v.tipo === "vlog").length;

  function isVideo(url: string | null | undefined) {
    if (!url) return false;
    return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
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
        title="Videos"
        icon={<Film size={18} />}
        description="Gestiona los videos de tus productos"
        actions={
          <Link
            href="/admin/videos/nuevo"
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
            <PlusCircle size={15} /> Nuevo video
          </Link>
        }
      />

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
            className={`ap-view-tab ${filterTipo === "" ? "ap-view-tab--active" : ""}`}
            onClick={() => setFilterTipo("")}
          >
            <List size={14} />
            Todos
            <span className="ap-count ap-count--default">{totalCount}</span>
          </button>

          <button
            className={`ap-view-tab ap-view-tab--success ${filterTipo === "video" ? "ap-view-tab--active" : ""}`}
            onClick={() => setFilterTipo("video")}
          >
            <VideoIcon size={14} />
            Videos
            <span className="ap-count ap-count--success">{videoCount}</span>
          </button>

          <button
            className={`ap-view-tab ap-view-tab--warning ${filterTipo === "vlog" ? "ap-view-tab--active" : ""}`}
            onClick={() => setFilterTipo("vlog")}
          >
            <Clapperboard size={14} />
            Vlogs
            <span className="ap-count ap-count--warning">{vlogCount}</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "media", label: "Media" },
          { key: "titulo", label: "Título" },
          { key: "tipo", label: "Tipo" },
          { key: "estado", label: "Estado" },
          { key: "acciones", label: "Acciones" },
        ]}
        rows={filtered}
        pageSize={10}
        minWidth="860px"
        loading={loading}
        loadingText="Cargando videos..."
        emptyIcon={<Film size={32} color="#ccc" />}
        emptyText="No hay videos aún"
        renderRow={(v, i) => (
          <tr
            key={v.id}
            style={{
              borderBottom:
                i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
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
              {v.video_url && isVideo(v.video_url) ? (
                <video
                  src={v.video_url}
                  style={{
                    width: 96,
                    height: 54,
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    objectFit: "cover",
                    background: "#000",
                  }}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 54,
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ddd",
                    background: "#fafafa",
                  }}
                >
                  <Film size={20} />
                </div>
              )}
            </td>

            <td
              style={{
                padding: "0.9rem 1rem",
                maxWidth: 320,
                minWidth: 260,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontSize: "0.9rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {v.title}
              </span>

              {v.descripcion && (
                <span
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    color: "#aaa",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "2px",
                  }}
                >
                  {v.descripcion}
                </span>
              )}
            </td>

            <td style={{ padding: "0.9rem 1rem", whiteSpace: "nowrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "2px 10px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: v.tipo === "vlog" ? "#f0e8ff" : "#e8f0ff",
                  color: v.tipo === "vlog" ? "#7c3aed" : "#2563eb",
                }}
              >
                {v.tipo}
              </span>
            </td>

            <td style={{ padding: "0.9rem 1rem", whiteSpace: "nowrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background: v.activo
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                  color: v.activo ? "#16a34a" : "#dc2626",
                }}
              >
                {v.activo ? "Activo" : "Inactivo"}
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
                  href={`/admin/videos/${v.id}/editar`}
                  title="Editar"
                  style={{
                    background: "rgba(245,166,35,0.1)",
                    color: "#f5a623",
                    border: "1px solid rgba(245,166,35,0.18)",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                >
                  <Pencil size={15} />
                </Link>

                <button
                  onClick={() => onDelete(v.id)}
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
        )}
      />

      <style>{`
        .ap-view-tabs{display:flex;gap:0;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;background:#f9f9f9}
        .ap-view-tab{display:flex;align-items:center;gap:7px;padding:9px 18px;border:none;background:transparent;font-size:.82rem;font-weight:700;color:#888;cursor:pointer;transition:all .15s;white-space:nowrap;border-right:1px solid #e0e0e0}
        .ap-view-tab:last-child{border-right:none}
        .ap-view-tab--active{background:#fff;color:#1a1a1a;box-shadow:inset 0 -2px 0 #f5a623}
        .ap-view-tab:hover:not(.ap-view-tab--active){background:#f0f0f0;color:#555}
        .ap-view-tab--warning.ap-view-tab--active{box-shadow:inset 0 -2px 0 #f59e0b;color:#b45309}
        .ap-view-tab--success.ap-view-tab--active{box-shadow:inset 0 -2px 0 #22c55e;color:#166534}
        .ap-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:20px;font-size:.7rem;font-weight:800;line-height:1}
        .ap-count--default{background:#f0f0f0;color:#666}
        .ap-count--success{background:#dcfce7;color:#166534}
        .ap-count--warning{background:#fef3c7;color:#b45309}
      `}</style>
    </div>
  );
}