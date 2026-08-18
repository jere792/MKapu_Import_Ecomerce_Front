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
  Info,
  Loader2,
  PlusCircle,
  X,
} from "lucide-react";

type SeccionImagen = {
  id: number;
  seccion_id: number;
  url_imagen: string;
  orden: number;
};

type SeccionFormData = {
  titulo: string;
  descripcion: string;
  activo: boolean;
};

const initialForm: SeccionFormData = {
  titulo: "",
  descripcion: "",
  activo: true,
};

interface SobreNosotrosFormProps {
  mode: "create" | "edit";
  seccionId?: number;
}

export default function SobreNosotrosForm({
  mode,
  seccionId,
}: SobreNosotrosFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<SeccionFormData>(initialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [imagenes, setImagenes] = useState<SeccionImagen[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const imgRef = useRef<HTMLInputElement>(null);
  const cropQueueRef = useRef<File[]>([]);
  const imgOrderRef = useRef(0);

  const activeId = mode === "edit" ? seccionId ?? null : createdId;

  async function loadImagenes(id: number) {
    const { data } = await supabase
      .from("quienes_somos_imagenes")
      .select("*")
      .eq("seccion_id", id)
      .order("orden");

    setImagenes((data ?? []) as SeccionImagen[]);
  }

  useEffect(() => {
    if (mode !== "edit" || !seccionId) return;
    supabase
      .from("quienes_somos_secciones")
      .select("*")
      .eq("id", seccionId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push("/admin/sobre-nosotros");
          return;
        }
        setForm({
          titulo: data.titulo ?? "",
          descripcion: data.descripcion ?? "",
          activo: data.activo,
        });
        loadImagenes(seccionId);
        setLoading(false);
      });
  }, [mode, seccionId, router]);

  async function uploadFile(blob: Blob): Promise<string | null> {
    const ext = (blob.type.split("/")[1] || "png").split("+")[0];
    const path = `sobre-nosotros/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, blob, { upsert: true, contentType: blob.type });

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function ensureCreated(): Promise<number | null> {
    if (activeId) return activeId;

    const { count } = await supabase
      .from("quienes_somos_secciones")
      .select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("quienes_somos_secciones")
      .insert({
        titulo: form.titulo || null,
        descripcion: form.descripcion || null,
        orden: (count ?? 0) + 1,
        activo: true,
      })
      .select()
      .single();

    if (error || !data) return null;
    setCreatedId(data.id);
    return data.id;
  }

  function openNextImageEditor() {
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
      alert("Completa primero los datos de la sección");
      return;
    }

    if (imgRef.current) imgRef.current.value = "";
    imgOrderRef.current = imagenes.length;
    cropQueueRef.current = files;
    setUploadingImg(true);
    openNextImageEditor();
  }

  async function deleteImagen(id: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("quienes_somos_imagenes").delete().eq("id", id);
    if (activeId) await loadImagenes(activeId);
  }

  async function save(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    setSaving(true);

    if (activeId) {
      const { error } = await supabase
        .from("quienes_somos_secciones")
        .update({
          titulo: form.titulo || null,
          descripcion: form.descripcion || null,
          activo: form.activo,
        })
        .eq("id", activeId);

      setSaving(false);
      if (error) return alert(error.message);

      setSuccessMsg(
        mode === "create"
          ? "Sección creada correctamente"
          : "Sección actualizada correctamente",
      );
      setTimeout(() => setSuccessMsg(""), 3000);
      if (closeAfter) router.push("/admin/sobre-nosotros");
      return;
    }

    const { count } = await supabase
      .from("quienes_somos_secciones")
      .select("id", { count: "exact", head: true });

    const { data, error } = await supabase
      .from("quienes_somos_secciones")
      .insert({
        titulo: form.titulo || null,
        descripcion: form.descripcion || null,
        orden: (count ?? 0) + 1,
        activo: true,
      })
      .select()
      .single();

    setSaving(false);
    if (error) return alert(error.message);

    setCreatedId(data.id);
    setSuccessMsg("Sección creada correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);

    if (closeAfter) router.push("/admin/sobre-nosotros");
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
          title={mode === "create" ? "Nueva sección" : "Editar sección"}
          icon={<Info size={18} />}
          description='Gestiona las secciones de la página "Quiénes Somos"'
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/sobre-nosotros")}
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
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando sección...</p>
          </div>
        ) : (
          <div className="ap-card ap-fadein">
            <form onSubmit={(e) => save(e)}>
              <div className="ap-fblock">
                <h3 className="ap-fblock__title">Información de la sección</h3>

                <div className="ap-fsub">
                  <h4 className="ap-fsub__title">Información básica</h4>
                  <label className="ap-lbl">Título (opcional)</label>
                  <input
                    className="ap-inp"
                    placeholder="Ej: Nuestra Historia"
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                  />
                </div>

                <div className="ap-fsub">
                  <h4 className="ap-fsub__title">Descripción</h4>
                  <textarea
                    className="ap-inp"
                    style={{ minHeight: "140px", resize: "vertical" }}
                    placeholder="<p>Escribe el contenido de esta sección...</p>"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                  />
                  <span style={{ fontSize: "0.75rem", color: "#bbb" }}>
                    Puedes usar: &lt;strong&gt;, &lt;p&gt;, &lt;br&gt;,
                    &lt;ul&gt;, &lt;li&gt;, etc.
                  </span>
                </div>

                <div className="ap-fsub">
                  <h4 className="ap-fsub__title">Configuración</h4>
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
            </form>

            {/* ── Imágenes del carrusel ── */}
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
                  Imágenes del carrusel
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
                  <h4
                    className="ap-fsub__title"
                    style={{ margin: 0, fontSize: ".72rem" }}
                  >
                    Imágenes ({imagenes.length})
                  </h4>

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
                          src={m.url_imagen}
                          alt="Imagen de la sección"
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
                          onClick={() => deleteImagen(m.id)}
                          title="Eliminar imagen"
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
                    Crear sección
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
                onClick={() => router.push("/admin/sobre-nosotros")}
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
            setCropOpen(false);
            setCropSrc(null);
          }}
          onConfirm={async (blob) => {
            if (activeId) {
              const url = await uploadFile(blob);
              if (url) {
                await supabase.from("quienes_somos_imagenes").insert({
                  seccion_id: activeId,
                  url_imagen: url,
                  orden: imgOrderRef.current++ + 1,
                });
              }

              setCropOpen(false);
              setCropSrc(null);

              if (cropQueueRef.current.length > 0) {
                openNextImageEditor();
              } else {
                setUploadingImg(false);
                await loadImagenes(activeId);
              }
            }
          }}
        />
      </div>
    </>
  );
}