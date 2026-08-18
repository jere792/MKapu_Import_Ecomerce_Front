"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  PlusCircle,
  Upload,
  X,
} from "lucide-react";

const initialForm = {
  titulo: "",
  subtitulo: "",
  descripcion: "",
  eyebrow: "",
  titulo_completo: "",
  image_url: "",
  orden: 0,
  activo: true,
};

interface BannerFormProps {
  mode: "create" | "edit";
  bannerId?: number;
}

export default function BannerForm({ mode, bannerId }: BannerFormProps) {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "edit" && bannerId) {
      supabase
        .from("banners_carousel")
        .select("*")
        .eq("id", bannerId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            router.push("/admin/banners");
            return;
          }
          setForm({
            titulo: data.titulo ?? "",
            subtitulo: data.subtitulo ?? "",
            descripcion: data.descripcion ?? "",
            eyebrow: data.eyebrow ?? "",
            titulo_completo: data.titulo_completo ?? "",
            image_url: data.image_url,
            orden: data.orden,
            activo: data.activo,
          });
          setLoading(false);
        });
      return;
    }

    supabase
      .from("banners_carousel")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        setForm((f) => ({ ...f, orden: (count ?? 0) + 1 }));
      });
  }, [mode, bannerId, router]);

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners/carousel");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload fallido");
      const data = await res.json();
      return data.url;
    } catch (error) {
      alert("Error subiendo imagen: " + error);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;
    if (!form.image_url) return alert("Imagen requerida");

    const payload = {
      titulo: form.titulo || null,
      subtitulo: form.subtitulo || null,
      descripcion: form.descripcion || null,
      eyebrow: form.eyebrow || null,
      titulo_completo: form.titulo_completo || null,
      image_url: form.image_url,
      orden: form.orden,
      activo: form.activo,
    };

    setSaving(true);

    const { error } =
      mode === "edit" && bannerId
        ? await supabase
            .from("banners_carousel")
            .update(payload)
            .eq("id", bannerId)
        : await supabase.from("banners_carousel").insert(payload);

    setSaving(false);
    if (error) return alert(error.message);

    setSuccessMsg(
      mode === "create"
        ? "Slide creado correctamente"
        : "Slide actualizado correctamente",
    );
    setTimeout(() => setSuccessMsg(""), 3000);

    if (closeAfter) router.push("/admin/banners");
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
          title={mode === "create" ? "Nuevo slide" : "Editar slide"}
          icon={<ImageIcon size={18} />}
          description="Gestiona el carrusel principal"
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/banners")}
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
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando slide...</p>
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
                    <h4 className="ap-fsub__title">Imagen del slide *</h4>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file);
                        if (url) {
                          setForm((f) => ({ ...f, image_url: url }));
                        }
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    />

                    {form.image_url ? (
                      <div
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "2px dashed #22c55e",
                          background: "#f0fdf4",
                          padding: "8px",
                        }}
                      >
                        <img
                          src={form.image_url}
                          alt="preview"
                          style={{
                            width: "100%",
                            maxHeight: 160,
                            objectFit: "cover",
                            borderRadius: "6px",
                            display: "block",
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          borderRadius: "10px",
                          border: "2px dashed #e0e0e0",
                          background: "#fafafa",
                          padding: "1.5rem",
                          textAlign: "center",
                          color: "#bbb",
                          fontSize: "0.8rem",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ImageIcon size={22} />
                        Sin imagen aún
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "9px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          background: uploading ? "#f0f0f0" : "#fafafa",
                          color: "#555",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: uploading ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Upload size={14} />
                        {uploading ? "Subiendo..." : "Subir"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "9px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          background: "#fafafa",
                          color: "#999",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Contenido ─────────────────────────────────────────── */}
                <div>
                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Contenido del slide</h3>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Información</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">Título</label>
                          <input
                            className="ap-inp"
                            placeholder="Ej: Gran remate de verano"
                            value={form.titulo}
                            onChange={(e) =>
                              setForm({ ...form, titulo: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Subtítulo</label>
                          <input
                            className="ap-inp"
                            placeholder="Ej: Hasta 50% de descuento"
                            value={form.subtitulo}
                            onChange={(e) =>
                              setForm({ ...form, subtitulo: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <label className="ap-lbl" style={{ marginTop: 14 }}>
                        Descripción
                      </label>
                      <textarea
                        className="ap-inp"
                        style={{ minHeight: "80px", resize: "vertical" }}
                        placeholder="Texto completo para el slide..."
                        value={form.descripcion}
                        onChange={(e) =>
                          setForm({ ...form, descripcion: e.target.value })
                        }
                      />
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Textos del banner</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">Eyebrow</label>
                          <input
                            className="ap-inp"
                            placeholder="Ej: Equipos de importación · Lima, Perú"
                            value={form.eyebrow}
                            onChange={(e) =>
                              setForm({ ...form, eyebrow: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Título completo (HTML)</label>
                          <input
                            className="ap-inp"
                            placeholder="Ej: Equipos que<br/><em>Profesionales</em><br/>para tu negocio"
                            value={form.titulo_completo}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                titulo_completo: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Configuración</h4>
                      <label className="ap-lbl" style={{ marginBottom: "9px" }}>
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
                    Crear slide
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
                onClick={() => router.push("/admin/banners")}
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}