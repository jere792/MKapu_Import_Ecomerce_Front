"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Empresa } from "@/lib/supabase";
import {
  Building2,
  Camera,
  CheckCircle,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import ImageEditorModal from "@/components/layout/admin/ImageEditorModal";
import { showToast } from "@/components/Toast";

const defaultData: Empresa = {
  id: 1,
  nombre: "",
  razon_social: null,
  ruc: null,
  direccion: null,
  logo: null,
  email: null,
  whatsapp: null,
  whatsapp_soporte: null,
  numero_reclamos: null,
  descripcion: null,
  horario_atencion: null,
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
};

export default function AdminEmpresaPage() {
  const [data, setData] = useState<Empresa>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/empresa");
      if (res.ok) {
        const row = await res.json();
        if (row) setData(row);
      }
    } catch (err) {
      console.error("Error loading empresa:", err);
    }
    setLoading(false);
  }

  function set(field: keyof Empresa, value: any) {
    setData({ ...data, [field]: value });
  }

  async function uploadLogo(blob: Blob): Promise<string | null> {
    setUploading(true);
    const ext = (blob.type.split("/")[1] || "png").split("+")[0];
    const path = `empresa/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, blob, { upsert: true, contentType: blob.type });

    setUploading(false);

    if (error) {
      showToast("Error al subir logo: " + error.message, "error");
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("¿Guardar estos cambios?")) return;
    if (!data.nombre.trim()) return showToast("El nombre es requerido", "error");

    setSaving(true);
    try {
      const res = await fetch("/api/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.nombre,
          razon_social: data.razon_social || null,
          ruc: data.ruc || null,
          direccion: data.direccion || null,
          logo: data.logo || null,
          email: data.email || null,
          whatsapp: data.whatsapp || null,
          whatsapp_soporte: data.whatsapp_soporte || null,
          numero_reclamos: data.numero_reclamos || null,
          descripcion: data.descripcion || null,
          horario_atencion: data.horario_atencion || null,
          instagram_url: data.instagram_url || null,
          facebook_url: data.facebook_url || null,
          tiktok_url: data.tiktok_url || null,
        }),
      });

      const result = await res.json();
      if (!res.ok)
        return showToast(
          "Error al guardar: " + (result.error || "desconocido"),
          "error",
        );
      setSuccessMsg("Datos guardados correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      showToast("Error al guardar: " + err, "error");
    }
    setSaving(false);
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
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
        .ap-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .ap-fblock{background:#fafafa;border:1px solid #e8e8e8;border-radius:12px;padding:16px;margin-bottom:16px}
        .ap-fblock__title{margin:0 0 14px;font-size:.72rem;font-weight:800;color:#1a1a1a;text-transform:uppercase;letter-spacing:.08em;padding-bottom:10px;border-bottom:1px solid #e8e8e8}
        .ap-fsub{padding:12px;background:#fff;border:1px solid #eef0f2;border-radius:8px;margin-bottom:12px}
        .ap-fsub:last-child{margin-bottom:0}
        .ap-fsub__title{margin:0 0 12px;font-size:.68rem;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.08em}
        @keyframes ap-spin{to{transform:rotate(360deg)}}
        .ap-spin{animation:ap-spin .8s linear infinite}
        @keyframes ap-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .ap-fadein{animation:ap-fadein .2s ease}
        .ap-field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media (max-width: 640px){.ap-field-row{grid-template-columns:1fr}}
        @media (max-width: 900px){.empresa-grid{grid-template-columns:1fr!important}}
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
          title="Configuración de empresa"
          icon={<Building2 size={18} />}
          description="Datos generales, logo y redes sociales del negocio"
        />

        {loading ? (
          <div
            className="ap-card"
            style={{ textAlign: "center", padding: "60px 0", color: "#888" }}
          >
            <Loader2 size={28} className="ap-spin" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: ".9rem" }}>
              Cargando datos de la empresa...
            </p>
          </div>
        ) : (
          <div className="ap-card ap-fadein">
            <form onSubmit={save}>
              <div
                className="empresa-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 340px) 1fr",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                {/* ── Imagen ─────────────────────────────────────────────── */}
                <div className="ap-fblock">
                  <h3 className="ap-fblock__title">Imagen</h3>
                  <div className="ap-fsub">
                    <h4 className="ap-fsub__title">Logo de la empresa</h4>

                    <div
                      onClick={() => !uploading && fileRef.current?.click()}
                      style={{
                        width: 160,
                        height: 160,
                        margin: "0 auto",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fafafa",
                        cursor: uploading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {uploading ? (
                        <Loader2
                          size={26}
                          className="ap-spin"
                          style={{ color: "#f5a623" }}
                        />
                      ) : data.logo ? (
                        <img
                          src={data.logo}
                          alt="Logo"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            color: "#ccc",
                          }}
                        >
                          <Upload size={24} />
                          <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            Haz clic para subir
                          </span>
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
                          setCropOpen(true);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "100%",
                        marginTop: "0.75rem",
                        background: uploading ? "#e0b97a" : "#f5a623",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.6rem 1.2rem",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: uploading ? "not-allowed" : "pointer",
                        opacity: uploading ? 0.7 : 1,
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2
                            size={16}
                            className="ap-spin"
                            style={{ color: "#fff" }}
                          />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Camera size={16} />
                          {data.logo ? "Editar foto" : "Subir foto"}
                        </>
                      )}
                    </button>

                    <p
                      style={{
                        margin: "0.75rem 0 0",
                        fontSize: "0.75rem",
                        color: "#bbb",
                        textAlign: "center",
                      }}
                    >
                      PNG, JPG, SVG, WEBP · Recomendado fondo transparente
                    </p>
                  </div>
                </div>

                {/* ── Datos ──────────────────────────────────────────────── */}
                <div>
                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Información general</h3>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Datos del negocio</h4>
                      <div className="ap-field-row">
                        <div>
                          <label className="ap-lbl">Nombre *</label>
                          <input
                            className="ap-inp"
                            placeholder="Nombre comercial"
                            value={data.nombre}
                            onChange={(e) => set("nombre", e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            required
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Razón social</label>
                          <input
                            className="ap-inp"
                            placeholder="MKAPU IMPORT S.A.C."
                            value={data.razon_social ?? ""}
                            onChange={(e) =>
                              set("razon_social", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">RUC</label>
                          <input
                            className="ap-inp"
                            placeholder="RUC"
                            value={data.ruc ?? ""}
                            onChange={(e) => set("ruc", e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Dirección</label>
                          <input
                            className="ap-inp"
                            placeholder="Dirección fiscal"
                            value={data.direccion ?? ""}
                            onChange={(e) => set("direccion", e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Presentación</h4>
                      <div className="ap-field-row">
                        <div>
                          <label className="ap-lbl">Descripción / Tagline</label>
                          <input
                            className="ap-inp"
                            placeholder="Equipos de importación para tu negocio"
                            value={data.descripcion ?? ""}
                            onChange={(e) =>
                              set("descripcion", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Horario de atención</label>
                          <input
                            className="ap-inp"
                            placeholder="Lun - Sáb 9:00 a 18:00"
                            value={data.horario_atencion ?? ""}
                            onChange={(e) =>
                              set("horario_atencion", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Redes Sociales</h3>
                    <div className="ap-fsub">
                      <div className="ap-field-row">
                        <div>
                          <label className="ap-lbl">Instagram URL</label>
                          <input
                            className="ap-inp"
                            placeholder="https://instagram.com/..."
                            value={data.instagram_url ?? ""}
                            onChange={(e) =>
                              set("instagram_url", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Facebook URL</label>
                          <input
                            className="ap-inp"
                            placeholder="https://facebook.com/..."
                            value={data.facebook_url ?? ""}
                            onChange={(e) =>
                              set("facebook_url", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">TikTok URL</label>
                          <input
                            className="ap-inp"
                            placeholder="https://tiktok.com/@..."
                            value={data.tiktok_url ?? ""}
                            onChange={(e) => set("tiktok_url", e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Contacto</h3>
                    <div className="ap-fsub">
                      <div className="ap-field-row">
                        <div>
                          <label className="ap-lbl">Email</label>
                          <input
                            className="ap-inp"
                            type="email"
                            placeholder="correo@empresa.com"
                            value={data.email ?? ""}
                            onChange={(e) => set("email", e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">WhatsApp (pedidos)</label>
                          <input
                            className="ap-inp"
                            placeholder="51987123456"
                            value={data.whatsapp ?? ""}
                            onChange={(e) => set("whatsapp", e.target.value)}
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">WhatsApp (soporte)</label>
                          <input
                            className="ap-inp"
                            placeholder="51987123456"
                            value={data.whatsapp_soporte ?? ""}
                            onChange={(e) =>
                              set("whatsapp_soporte", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Número de reclamos</label>
                          <input
                            className="ap-inp"
                            placeholder="Teléfono para reclamos"
                            value={data.numero_reclamos ?? ""}
                            onChange={(e) =>
                              set("numero_reclamos", e.target.value)
                            }
                            onFocus={onFocus}
                            onBlur={onBlur}
                          />
                        </div>
                      </div>
                    </div>
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
                  type="submit"
                  className="ap-btn ap-btn--primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="ap-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <ImageEditorModal
        open={cropOpen}
        imageSrc={cropSrc}
        onCancel={() => {
          setCropOpen(false);
          setCropSrc(null);
        }}
        onConfirm={async (blob) => {
          const url = await uploadLogo(blob);
          if (url) set("logo", url);
          setCropOpen(false);
          setCropSrc(null);
        }}
      />
    </>
  );
}