"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import ImageEditorModal from "@/components/layout/admin/ImageEditorModal";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Loader2,
  PlusCircle,
  Upload,
  X,
} from "lucide-react";

const initialForm = {
  title: "",
  descripcion: "",
  video_url: "",
  thumbnail: "",
  tipo: "video" as "video" | "vlog",
  activo: true,
};

interface VideoFormProps {
  mode: "create" | "edit";
  videoId?: number;
}

export default function VideoForm({ mode, videoId }: VideoFormProps) {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbnailName, setThumbnailName] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "edit" || !videoId) return;
    supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push("/admin/videos");
          return;
        }
        setForm({
          title: data.title,
          descripcion: data.descripcion ?? "",
          video_url: data.video_url ?? "",
          thumbnail: data.thumbnail ?? "",
          tipo: data.tipo,
          activo: data.activo,
        });
        setSelectedFileName(data.video_url ? "Video ya subido" : "");
        setThumbnailName(data.thumbnail ? "Portada cargada" : "");
        setLoading(false);
      });
  }, [mode, videoId, router]);

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

  async function uploadThumbnail(blob: Blob): Promise<string | null> {
    setUploadingThumb(true);

    const ext = (blob.type.split("/")[1] || "png").split("+")[0];
    const path = `videos/portadas/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, blob, { upsert: true, contentType: blob.type });

    setUploadingThumb(false);

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    if (!form.title.trim()) return alert("Título requerido");
    if (!form.video_url.trim()) return alert("Sube un archivo de video");

    const payload = {
      title: form.title,
      descripcion: form.descripcion || null,
      video_url: form.video_url,
      thumbnail: form.thumbnail || null,
      tipo: form.tipo,
      activo: form.activo,
    };

    setSaving(true);

    const { error } =
      mode === "edit" && videoId
        ? await supabase.from("videos").update(payload).eq("id", videoId)
        : await supabase.from("videos").insert(payload);

    setSaving(false);
    if (error) return alert(error.message);

    setSuccessMsg(
      mode === "create"
        ? "Video creado correctamente"
        : "Video actualizado correctamente",
    );
    setTimeout(() => setSuccessMsg(""), 3000);

    if (closeAfter) router.push("/admin/videos");
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
        .ap-btn--secondary{background:#f0f0f0;color:#555}
        .ap-btn--secondary:hover{background:#e6e6e6}
        .ap-btn--ghost{background:transparent;color:#888;border:1px solid #e0e0e0}
        .ap-btn--ghost:hover{background:#f5f5f5}
        .ap-btn--sm{padding:6px 12px;font-size:.8rem;border-radius:6px}
        .ap-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .ap-fblock{background:#fafafa;border:1px solid #e8e8e8;border-radius:12px;padding:16px;margin-bottom:16px}
        .ap-fblock__title{margin:0 0 14px;font-size:.72rem;font-weight:800;color:#1a1a1a;text-transform:uppercase;letter-spacing:.08em;padding-bottom:10px;border-bottom:1px solid #e8e8e8}
        .ap-fsub{padding:12px;background:#fff;border:1px solid #eef0f2;border-radius:8px;margin-bottom:12px}
        .ap-fsub:last-child{margin-bottom:0}
        .ap-fsub__title{margin:0 0 12px;font-size:.68rem;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.08em}
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
        @media (max-width: 768px) {
          form > div[style*="grid-template-columns: minmax(280px, 360px) 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
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
            mode === "create" ? "Nuevo video" : `Editar video #${videoId}`
          }
          icon={<Film size={18} />}
          description="Gestiona los videos de tus productos"
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/videos")}
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
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando video...</p>
          </div>
        ) : (
          <div className="ap-card ap-fadein">
            <form onSubmit={(e) => save(e)}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 360px) 1fr",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                {/* ── Video ─────────────────────────────────────────────── */}
                <div className="ap-fblock">
                  <h3 className="ap-fblock__title">Video</h3>
                  <div className="ap-fsub">
                    <h4 className="ap-fsub__title">Archivo de video</h4>

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

                    {form.video_url ? (
                      <>
                        <video
                          src={form.video_url}
                          controls
                          style={{
                            width: "100%",
                            maxWidth: "360px",
                            aspectRatio: "16 / 9",
                            objectFit: "contain",
                            borderRadius: "10px",
                            border: "1px solid #e8e8e8",
                            background: "#000",
                            display: "block",
                          }}
                        />

                        <div style={{ marginTop: "10px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: 600,
                              color: "#444",
                              fontSize: "0.875rem",
                            }}
                          >
                            <Film size={14} color="#999" />
                            {selectedFileName || "Video cargado"}
                          </div>

                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#999",
                              marginTop: "3px",
                            }}
                          >
                            MP4, WebM, MOV, AVI, MKV · máximo 50MB
                          </div>

                          {uploadProgress.startsWith("✓") && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "8px",
                                color: "#16a34a",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                              }}
                            >
                              <CheckCircle size={14} /> {uploadProgress}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => videoFileRef.current?.click()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#f0f0f0",
                            color: "#555",
                            border: "1px solid #e0e0e0",
                            padding: "6px 14px",
                            borderRadius: "7px",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            marginTop: "12px",
                          }}
                        >
                          <Upload size={13} />
                          Reemplazar video
                        </button>
                      </>
                    ) : (
                      <div
                        onClick={() => {
                          if (!uploadingVideo) videoFileRef.current?.click();
                        }}
                        style={{
                          border: "2px dashed #e0e0e0",
                          borderRadius: "12px",
                          padding: "1.75rem 1.5rem",
                          textAlign: "center",
                          cursor: uploadingVideo ? "not-allowed" : "pointer",
                          background: "#fafafa",
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
                                animation: "ap-spin 0.8s linear infinite",
                              }}
                            />
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
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ap-fsub">
                    <h4 className="ap-fsub__title">Portada (imagen)</h4>

                    <input
                      ref={thumbFileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (thumbFileRef.current) thumbFileRef.current.value =
                          "";
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCropSrc(
                            typeof reader.result === "string"
                              ? reader.result
                              : null,
                          );
                          setCropOpen(true);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />

                    <div
                      onClick={() =>
                        !uploadingThumb && thumbFileRef.current?.click()
                      }
                      style={{
                        border: form.thumbnail
                          ? "2px dashed #22c55e"
                          : "2px dashed #e0e0e0",
                        borderRadius: "12px",
                        padding: "1.25rem 1.5rem",
                        textAlign: "center",
                        cursor: uploadingThumb ? "not-allowed" : "pointer",
                        background: form.thumbnail ? "#f0fdf4" : "#fafafa",
                        transition: "all 0.2s",
                      }}
                    >
                      {uploadingThumb ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              border: "3px solid #f5a623",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "ap-spin 0.8s linear infinite",
                            }}
                          />
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "#b37400",
                              fontSize: "0.8rem",
                            }}
                          >
                            Subiendo imagen...
                          </p>
                        </div>
                      ) : form.thumbnail ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <img
                            src={form.thumbnail}
                            alt="portada"
                            style={{
                              height: 64,
                              maxWidth: "100%",
                              objectFit: "contain",
                              borderRadius: "6px",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <CheckCircle size={15} color="#22c55e" />
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 700,
                                color: "#16a34a",
                                fontSize: "0.8rem",
                              }}
                            >
                              {thumbnailName || "Portada cargada"}
                            </p>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.72rem",
                              color: "#22c55e",
                            }}
                          >
                            Haz clic para reemplazar
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <ImageIcon size={26} color="#ccc" />
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "#666",
                              fontSize: "0.82rem",
                            }}
                          >
                            Haz clic para subir la portada
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.72rem",
                              color: "#bbb",
                            }}
                          >
                            JPG, PNG, WEBP · opcional
                          </p>
                        </div>
                      )}
                    </div>

                    {form.thumbnail && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, thumbnail: "" }));
                          setThumbnailName("");
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(220,53,69,0.08)",
                          color: "#dc3545",
                          border: "1px solid rgba(220,53,69,0.2)",
                          padding: "5px 12px",
                          borderRadius: "7px",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          marginTop: "10px",
                        }}
                      >
                        <X size={13} />
                        Quitar portada
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Datos ─────────────────────────────────────────────── */}
                <div>
                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Datos del video</h3>
                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Información básica</h4>
                      <label className="ap-lbl">Título *</label>
                      <input
                        className="ap-inp"
                        placeholder="Ingresa el título"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        required
                      />

                      <label
                        className="ap-lbl"
                        style={{ marginTop: 14, marginBottom: 5 }}
                      >
                        Descripción
                      </label>
                      <textarea
                        className="ap-inp"
                        style={{ resize: "vertical", minHeight: "110px" }}
                        placeholder="Ingresa una descripción"
                        rows={4}
                        value={form.descripcion}
                        onChange={(e) =>
                          setForm({ ...form, descripcion: e.target.value })
                        }
                      />
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Configuración</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">Tipo</label>
                          <select
                            className="ap-inp"
                            value={form.tipo}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                tipo: e.target.value as "video" | "vlog",
                              })
                            }
                          >
                            <option value="video">Video</option>
                            <option value="vlog">Vlog</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className="ap-lbl"
                            style={{ display: "block", marginBottom: "9px" }}
                          >
                            Estado
                          </label>
                          <label className="ap-toggle">
                            <input
                              type="checkbox"
                              checked={form.activo}
                              onChange={(e) =>
                                setForm({ ...form, activo: e.target.checked })
                              }
                            />
                            <span className="ap-toggle__slider" />
                            <span>Activo</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Botones de guardado */}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
              }}
            >
              <button
                type="button"
                className="ap-btn ap-btn--primary"
                onClick={(e) => save(e as unknown as React.FormEvent)}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="ap-spin" />
                    Guardando...
                  </>
                ) : mode === "create" ? (
                  <>
                    <PlusCircle size={15} />
                    Crear video
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
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
                onClick={() => router.push("/admin/videos")}
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        <ImageEditorModal
          open={cropOpen}
          imageSrc={cropSrc}
          onCancel={() => {
            setCropOpen(false);
            setCropSrc(null);
          }}
          onConfirm={async (blob) => {
            const url = await uploadThumbnail(blob);
            if (url) {
              setForm((f) => ({ ...f, thumbnail: url }));
              setThumbnailName("Portada lista para guardar");
            }
            setCropOpen(false);
            setCropSrc(null);
          }}
        />
      </div>
    </>
  );
}