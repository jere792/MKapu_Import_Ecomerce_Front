"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/lib/queries";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import {
  Upload,
  CheckCircle,
  Film,
  Pencil,
  Trash2,
  PlusCircle,
  X,
} from "lucide-react";

const initialForm = {
  title: "",
  descripcion: "",
  video_url: "",
  tipo: "video" as "video" | "vlog",
  activo: true,
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

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#444",
  marginBottom: "0.4rem",
};

export default function AdminVideosPage() {
  const [rows, setRows] = useState<Video[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<"" | "video" | "vlog">("");

  const videoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function uploadVideo(file: File): Promise<string | null> {
    const MAX_MB = 50;

    if (file.size > MAX_MB * 1024 * 1024) {
      alert(
        `El archivo supera los ${MAX_MB}MB. Comprime el video e intenta de nuevo.`,
      );
      return null;
    }

    setUploadingVideo(true);
    setUploadProgress("Subiendo...");

    const ext = file.name.split(".").pop();
    const path = `videos/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    setUploadingVideo(false);

    if (error) {
      setUploadProgress("");
      alert("Error al subir: " + error.message);
      return null;
    }

    const url = supabase.storage.from("imagenes").getPublicUrl(path)
      .data.publicUrl;

    setUploadProgress("✓ Video subido correctamente");
    return url;
  }

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

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setUploadProgress("");
    setSelectedFileName("");
    if (videoFileRef.current) videoFileRef.current.value = "";
  }

  async function save(e: React.FormEvent) {
    if (!confirm("¿Guardar estos cambios?")) return;
    e.preventDefault();

    if (!form.title.trim()) return alert("Título requerido");
    if (!form.video_url.trim()) return alert("Sube un archivo de video");

    const payload = {
      title: form.title,
      descripcion: form.descripcion || null,
      video_url: form.video_url,
      tipo: form.tipo,
      activo: form.activo,
    };

    const { error } = editId
      ? await supabase.from("videos").update(payload).eq("id", editId)
      : await supabase.from("videos").insert(payload);

    if (error) return alert(error.message);

    const isEdit = !!editId;
    resetForm();
    await load();
    setSuccessMsg(isEdit ? "Video actualizado correctamente" : "Video creado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  function onEdit(v: Video) {
    setEditId(v.id);
    setForm({
      title: v.title,
      descripcion: v.descripcion ?? "",
      video_url: v.video_url ?? "",
      tipo: v.tipo,
      activo: v.activo,
    });
    setUploadProgress("");
    setSelectedFileName(v.video_url ? "Video ya subido" : "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    await load();
  }

  const filtered = filterTipo
    ? rows.filter((v) => v.tipo === filterTipo)
    : rows;

  function isVideo(url: string | null | undefined) {
    if (!url) return false;
    return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
  }

  function onFocusInput(
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      {successMsg && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: "#16a34a", color: "#fff", padding: "0.75rem 1.25rem",
          borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: "8px",
        }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      <SectionHeader
        title="Videos"
        icon={<Film size={18} />}
        description="Gestiona los videos de tus productos"
        actions={
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            style={{
              display: "flex",
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
            }}
          >
            {showForm ? (
              <>
                <X size={15} /> Cancelar
              </>
            ) : (
              <>
                <PlusCircle size={15} /> Nuevo video
              </>
            )}
          </button>
        }
      />

      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            borderTop: "3px solid #f5a623",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.25rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            {editId ? "Editar video" : "Nuevo video"}
          </h2>

          <form onSubmit={save}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Título *</label>
              <input
                style={inp}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ingresa el título"
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Descripción</label>
              <textarea
                style={{ ...inp, resize: "vertical", minHeight: "110px" }}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Ingresa una descripción"
                rows={4}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Tipo</label>
                <select
                  style={inp}
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo: e.target.value as "video" | "vlog",
                    })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="video">Video</option>
                  <option value="vlog">Vlog</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: "0.7rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#444",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) =>
                      setForm({ ...form, activo: e.target.checked })
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#f5a623",
                      cursor: "pointer",
                    }}
                  />
                  Activo
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Subir video *</label>

              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSelectedFileName(file.name);
                  const url = await uploadVideo(file);
                  if (url) {
                    setForm((prev) => ({ ...prev, video_url: url }));
                  }
                }}
              />

              <div
                onClick={() => {
                  if (!uploadingVideo) videoFileRef.current?.click();
                }}
                style={{
                  border: uploadProgress.startsWith("✓")
                    ? "2px dashed #22c55e"
                    : "2px dashed #e0e0e0",
                  borderRadius: "12px",
                  padding: "1.75rem 1.5rem",
                  textAlign: "center",
                  cursor: uploadingVideo ? "not-allowed" : "pointer",
                  background: uploadProgress.startsWith("✓")
                    ? "#f0fdf4"
                    : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {uploadingVideo ? (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        border: "3px solid #f5a623",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : uploadProgress.startsWith("✓") ? (
                    <CheckCircle size={28} color="#22c55e" />
                  ) : (
                    <Upload size={28} color="#f5a623" />
                  )}

                  <div style={{ fontWeight: 600, color: "#444" }}>
                    {uploadingVideo
                      ? "Subiendo video..."
                      : selectedFileName ||
                        "Haz clic para seleccionar un video"}
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "#999" }}>
                    MP4, WebM, MOV, AVI, MKV · máximo 50MB
                  </div>

                  {uploadProgress && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: uploadProgress.startsWith("✓")
                          ? "#22c55e"
                          : "#999",
                        fontWeight: 600,
                      }}
                    >
                      {uploadProgress}
                    </div>
                  )}
                </div>
              </div>

              {form.video_url && (
                <div style={{ marginTop: "12px" }}>
                  <video
                    src={form.video_url}
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "360px",
                      borderRadius: "10px",
                      border: "1px solid #e8e8e8",
                      background: "#000",
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={uploadingVideo}
                style={{
                  background: uploadingVideo ? "#e0b97a" : "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: uploadingVideo ? "not-allowed" : "pointer",
                  opacity: uploadingVideo ? 0.7 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {editId ? (
                  <>
                    <CheckCircle size={15} /> Guardar cambios
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} /> Crear video
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <X size={15} /> Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {(["", "video", "vlog"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              style={{
                padding: "7px 16px",
                borderRadius: "20px",
                border: filterTipo === t ? "none" : "1px solid #e0e0e0",
                background: filterTipo === t ? "#f5a623" : "#fff",
                color: filterTipo === t ? "#fff" : "#666",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t === "" ? "Todos" : t === "video" ? "Videos" : "Vlogs"}
            </button>
          ))}
        </div>
      )}

      {!showForm && (
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

              <td
                style={{ padding: "0.9rem 1rem", whiteSpace: "nowrap" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background:
                      v.tipo === "vlog" ? "#f0e8ff" : "#e8f0ff",
                    color: v.tipo === "vlog" ? "#7c3aed" : "#2563eb",
                  }}
                >
                  {v.tipo}
                </span>
              </td>

              <td
                style={{ padding: "0.9rem 1rem", whiteSpace: "nowrap" }}
              >
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
                  <button
                    onClick={() => onEdit(v)}
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
                  </button>

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
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          form > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
