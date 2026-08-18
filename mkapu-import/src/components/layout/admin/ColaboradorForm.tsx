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
  Image as ImageIcon,
  Loader2,
  PlusCircle,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";

type ColabMedia = {
  id: number;
  colaborador_id: number;
  url: string;
  tipo: "imagen" | "video";
  orden: number;
  titulo: string | null;
};

type ColaboradorFormData = {
  name: string;
  logo_url: string;
  activo: boolean;
  orden: number;
};

const initialForm: ColaboradorFormData = {
  name: "",
  logo_url: "",
  activo: true,
  orden: 0,
};

interface ColaboradorFormProps {
  mode: "create" | "edit";
  colaboradorId?: number;
}

export default function ColaboradorForm({
  mode,
  colaboradorId,
}: ColaboradorFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ColaboradorFormData>(initialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [media, setMedia] = useState<ColabMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState<"logo" | "carrusel" | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const cropQueueRef = useRef<File[]>([]);
  const carouselOrderRef = useRef(0);

  const activeId = mode === "edit" ? colaboradorId ?? null : createdId;

  async function loadMedia(id: number) {
    const { data } = await supabase
      .from("colaborador_media")
      .select("*")
      .eq("colaborador_id", id)
      .order("orden");

    setMedia((data ?? []) as ColabMedia[]);
  }

  useEffect(() => {
    if (mode !== "edit" || !colaboradorId) return;
    supabase
      .from("colaboradores")
      .select("*")
      .eq("id", colaboradorId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push("/admin/colaboradores");
          return;
        }
        setForm({
          name: data.name,
          logo_url: data.logo_url ?? "",
          activo: data.activo,
          orden: data.orden,
        });
        loadMedia(colaboradorId);
        setLoading(false);
      });
  }, [mode, colaboradorId, router]);

  async function uploadFile(
    blob: Blob,
    tipo: "imagen" | "video",
  ): Promise<string | null> {
    const ext = (blob.type.split("/")[1] || "png").split("+")[0];
    const folder =
      tipo === "imagen" ? "colaboradores/imagenes" : "colaboradores/videos";
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, blob, { upsert: true, contentType: blob.type });

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function uploadLogo(blob: Blob): Promise<string | null> {
    setUploading(true);
    const url = await uploadFile(blob, "imagen");
    setUploading(false);
    return url;
  }

  async function ensureCreated(): Promise<number | null> {
    if (activeId) return activeId;
    if (!form.name.trim()) return null;
    if (!form.logo_url.trim()) return null;

    const { count } = await supabase
      .from("colaboradores")
      .select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("colaboradores")
      .insert({
        name: form.name,
        logo_url: form.logo_url,
        url: null,
        activo: true,
        orden: (count ?? 0) + 1,
      })
      .select()
      .single();

    if (error || !data) return null;
    setCreatedId(data.id);
    return data.id;
  }

  function openNextCarouselEditor() {
    const next = cropQueueRef.current.shift();
    if (!next) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(typeof reader.result === "string" ? reader.result : null);
      setCropOpen(true);
    };
    reader.readAsDataURL(next);
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const id = await ensureCreated();
    if (!id) {
      alert("Completa primero el nombre y el logo del colaborador");
      return;
    }

    if (imgRef.current) imgRef.current.value = "";
    carouselOrderRef.current = media.filter((m) => m.tipo === "imagen").length;
    cropQueueRef.current = files;
    setUploadingImg(true);
    setCropMode("carrusel");
    openNextCarouselEditor();
  }

  async function handleVidUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const id = await ensureCreated();
    if (!id) {
      alert("Completa primero el nombre y el logo del colaborador");
      return;
    }

    setUploadingVid(true);
    const baseOrden = media.filter((m) => m.tipo === "video").length;

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], "video");
      if (url) {
        await supabase.from("colaborador_media").insert({
          colaborador_id: id,
          url,
          tipo: "video",
          orden: baseOrden + i,
        });
      }
    }

    await loadMedia(id);
    setUploadingVid(false);
    if (vidRef.current) vidRef.current.value = "";
  }

  async function deleteMedia(id: number) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await supabase.from("colaborador_media").delete().eq("id", id);
    if (activeId) {
      await loadMedia(activeId);
    }
  }

  async function save(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.logo_url.trim()) return alert("Sube un logo para el colaborador");

    setSaving(true);

    if (activeId) {
      const { error } = await supabase
        .from("colaboradores")
        .update({
          name: form.name,
          logo_url: form.logo_url,
          activo: form.activo,
          orden: form.orden,
        })
        .eq("id", activeId);

      setSaving(false);
      if (error) return alert(error.message);

      setSuccessMsg(
        mode === "create"
          ? "Colaborador creado correctamente"
          : "Colaborador actualizado correctamente",
      );
      setTimeout(() => setSuccessMsg(""), 3000);
      if (closeAfter) router.push("/admin/colaboradores");
      return;
    }

    const { count } = await supabase
      .from("colaboradores")
      .select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("colaboradores")
      .insert({
        name: form.name,
        logo_url: form.logo_url,
        url: null,
        activo: true,
        orden: (count ?? 0) + 1,
      })
      .select()
      .single();

    setSaving(false);
    if (error) return alert(error.message);

    setCreatedId(data.id);
    setSuccessMsg("Colaborador creado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);

    if (closeAfter) router.push("/admin/colaboradores");
  }

  const imagenes = media.filter((m) => m.tipo === "imagen");
  const videos = media.filter((m) => m.tipo === "video");

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
            mode === "create"
              ? "Nuevo colaborador"
              : `Editar colaborador #${colaboradorId}`
          }
          icon={<Users size={18} />}
          description="Gestiona los colaboradores del negocio"
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/colaboradores")}
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
            <Loader2
              size={28}
              className="ap-spin"
              style={{ marginBottom: 8 }}
            />
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando colaborador...</p>
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
                {/* ── Imagen ─────────────────────────────────────────────── */}
                <div className="ap-fblock">
                  <h3 className="ap-fblock__title">Imagen</h3>
                  <div className="ap-fsub">
                    <h4 className="ap-fsub__title">Logo del colaborador</h4>
                    <div
                      onClick={() => !uploading && fileRef.current?.click()}
                      style={{
                        border: form.logo_url
                          ? "2px dashed #22c55e"
                          : "2px dashed #e0e0e0",
                        borderRadius: "12px",
                        padding: "1.75rem 1.5rem",
                        textAlign: "center",
                        cursor: uploading ? "not-allowed" : "pointer",
                        background: form.logo_url ? "#f0fdf4" : "#fafafa",
                        transition: "all 0.2s",
                      }}
                    >
                      {uploading ? (
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
                              width: 28,
                              height: 28,
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
                              fontSize: "0.875rem",
                            }}
                          >
                            Subiendo imagen...
                          </p>
                        </div>
                      ) : form.logo_url ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <img
                            src={form.logo_url}
                            alt="preview"
                            style={{
                              height: 56,
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
                            <CheckCircle size={16} color="#22c55e" />
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 700,
                                color: "#16a34a",
                                fontSize: "0.875rem",
                              }}
                            >
                              {logoName || "Logo cargado"}
                            </p>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
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
                          <Upload size={28} color="#ccc" />
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "#666",
                              fontSize: "0.875rem",
                            }}
                          >
                            Haz clic para subir el logo
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              color: "#bbb",
                            }}
                          >
                            PNG, JPG, SVG, WEBP · Recomendado fondo transparente
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (fileRef.current) fileRef.current.value = "";
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCropSrc(
                            typeof reader.result === "string"
                              ? reader.result
                              : null,
                          );
                          setCropMode("logo");
                          setCropOpen(true);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                </div>

                {/* ── Datos ──────────────────────────────────────────────── */}
                <div>
                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Datos del colaborador</h3>
                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Información básica</h4>
                      <label className="ap-lbl">Nombre *</label>
                      <input
                        className="ap-inp"
                        placeholder="Nombre del colaborador"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              </form>

            <div className="ap-fblock" style={{ marginTop: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                <h3
                  className="ap-fblock__title"
                  style={{ margin: 0, padding: 0, border: "none" }}
                >
                  Carrusel
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: "#f0f0f0",
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Opcional
                </span>
              </div>

                <div className="ap-fsub">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ImageIcon size={15} color="#888" />
                      <h4
                        className="ap-fsub__title"
                        style={{ margin: 0, fontSize: ".72rem" }}
                      >
                        Imágenes del carrusel ({imagenes.length})
                      </h4>
                    </div>

                    <button
                      type="button"
                      disabled={uploadingImg}
                      onClick={() => imgRef.current?.click()}
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
                        cursor: uploadingImg ? "not-allowed" : "pointer",
                        opacity: uploadingImg ? 0.5 : 1,
                      }}
                    >
                      {uploadingImg ? "Subiendo..." : "Subir imágenes"}
                    </button>

                    <input
                      ref={imgRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleImgUpload}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {imagenes.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "12px 16px",
                          background: "#fafafa",
                          borderRadius: "8px",
                          border: "1px dashed #e0e0e0",
                          width: "100%",
                        }}
                      >
                        <ImageIcon size={20} color="#ddd" />
                        <span style={{ fontSize: "0.82rem", color: "#bbb" }}>
                          Sin imágenes aún — sube una o más arriba
                        </span>
                      </div>
                    ) : (
                      imagenes.map((m) => (
                        <div key={m.id} style={{ position: "relative" }}>
                          <img
                            src={m.url}
                            alt=""
                            style={{
                              width: 90,
                              height: 90,
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e0e0e0",
                              display: "block",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => deleteMedia(m.id)}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              background: "#dc3545",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              fontSize: "0.65rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="ap-fsub">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Video size={15} color="#888" />
                      <h4
                        className="ap-fsub__title"
                        style={{ margin: 0, fontSize: ".72rem" }}
                      >
                        Videos del carrusel ({videos.length})
                      </h4>
                    </div>

                    <button
                      type="button"
                      disabled={uploadingVid}
                      onClick={() => vidRef.current?.click()}
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
                        cursor: uploadingVid ? "not-allowed" : "pointer",
                        opacity: uploadingVid ? 0.5 : 1,
                      }}
                    >
                      {uploadingVid ? "Subiendo..." : "Subir videos"}
                    </button>

                    <input
                      ref={vidRef}
                      type="file"
                      accept="video/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleVidUpload}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {videos.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "12px 16px",
                          background: "#fafafa",
                          borderRadius: "8px",
                          border: "1px dashed #e0e0e0",
                          width: "100%",
                        }}
                      >
                        <Video size={20} color="#ddd" />
                        <span style={{ fontSize: "0.82rem", color: "#bbb" }}>
                          Sin videos aún — sube uno o más arriba
                        </span>
                      </div>
                    ) : (
                      videos.map((m) => (
                        <div key={m.id} style={{ position: "relative" }}>
                          <video
                            src={m.url}
                            muted
                            preload="metadata"
                            style={{
                              width: 90,
                              height: 90,
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e0e0e0",
                              display: "block",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => deleteMedia(m.id)}
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              background: "#dc3545",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              fontSize: "0.65rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
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
                  ) : mode === "create" && !activeId ? (
                    <>
                      <PlusCircle size={15} />
                      Crear colaborador
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
                  onClick={() => router.push("/admin/colaboradores")}
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
            cropQueueRef.current = [];
            setUploadingImg(false);
            setCropMode(null);
            setCropOpen(false);
            setCropSrc(null);
          }}
          onConfirm={async (blob) => {
            if (cropMode === "logo") {
              const url = await uploadLogo(blob);
              if (url) {
                setForm((f) => ({ ...f, logo_url: url }));
                setLogoName("Logo listo para guardar");
              }
              setCropMode(null);
              setCropOpen(false);
              setCropSrc(null);
              return;
            }

            if (cropMode === "carrusel" && activeId) {
              const url = await uploadFile(blob, "imagen");
              if (url) {
                await supabase.from("colaborador_media").insert({
                  colaborador_id: activeId,
                  url,
                  tipo: "imagen",
                  orden: carouselOrderRef.current++,
                });
              }

              setCropOpen(false);
              setCropSrc(null);

              if (cropQueueRef.current.length > 0) {
                openNextCarouselEditor();
              } else {
                setCropMode(null);
                setUploadingImg(false);
                await loadMedia(activeId);
              }
            }
          }}
        />
      </div>
    </>
  );
}