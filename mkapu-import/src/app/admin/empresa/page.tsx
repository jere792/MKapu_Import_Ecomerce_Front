"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Empresa } from "@/lib/supabase";
import { Camera, Save, Building2 } from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import { showToast } from "@/components/Toast";

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

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `empresa/logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

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
      if (!res.ok) return showToast("Error al guardar: " + (result.error || "desconocido"), "error");
      showToast("Datos guardados correctamente", "success");
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>
        Cargando datos de la empresa...
      </div>
    );
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
        title="Configuración de empresa"
        icon={<Building2 size={18} />}
        description="Datos generales, logo y redes sociales del negocio"
      />

      <form onSubmit={save}>
        <div className="empresa-grid">
            {/* ─── ROW 1: Logo (left) + Info General (right) ─── */}
            <div className="empresa-card empresa-card-logo">
              <div
                style={{
                  width: 180,
                  height: 180,
                  margin: "0 auto 1rem",
                  borderRadius: "12px",
                  border: "2px solid #e8e8e8",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fafafa",
                }}
              >
                {data.logo ? (
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
                  <span style={{ color: "#ddd", fontSize: "0.85rem" }}>
                    Sin logo
                  </span>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadLogo(file);
                  if (url) set("logo", url);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
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
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
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
            </div>

            {/* Información general */}
            <div className="empresa-card empresa-card-info">
              <h2
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                Información general
              </h2>

              <div className="empresa-field-row">
                <div>
                  <label style={lbl}>Nombre *</label>
                  <input
                    style={inp}
                    placeholder="Nombre comercial"
                    value={data.nombre}
                    onChange={(e) => set("nombre", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required
                  />
                </div>
                <div>
                  <label style={lbl}>Razón social</label>
                  <input
                    style={inp}
                    placeholder="MKAPU IMPORT S.A.C."
                    value={data.razon_social ?? ""}
                    onChange={(e) => set("razon_social", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>RUC</label>
                  <input
                    style={inp}
                    placeholder="RUC"
                    value={data.ruc ?? ""}
                    onChange={(e) => set("ruc", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>Dirección</label>
                  <input
                    style={inp}
                    placeholder="Dirección fiscal"
                    value={data.direccion ?? ""}
                    onChange={(e) => set("direccion", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>Descripción / Tagline</label>
                  <input
                    style={inp}
                    placeholder="Equipos de importación para tu negocio"
                    value={data.descripcion ?? ""}
                    onChange={(e) => set("descripcion", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>Horario de atención</label>
                  <input
                    style={inp}
                    placeholder="Lun - Sáb 9:00 a 18:00"
                    value={data.horario_atencion ?? ""}
                    onChange={(e) => set("horario_atencion", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>
            </div>

            {/* ─── ROW 2: Redes (left) + Contacto (right) ─── */}
            <div className="empresa-card empresa-card-redes">
              <h2
                style={{
                  margin: "0 0 1rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                Redes Sociales
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label style={lbl}>Instagram URL</label>
                  <input
                    style={inp}
                    placeholder="https://instagram.com/..."
                    value={data.instagram_url ?? ""}
                    onChange={(e) => set("instagram_url", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>Facebook URL</label>
                  <input
                    style={inp}
                    placeholder="https://facebook.com/..."
                    value={data.facebook_url ?? ""}
                    onChange={(e) => set("facebook_url", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>TikTok URL</label>
                  <input
                    style={inp}
                    placeholder="https://tiktok.com/@..."
                    value={data.tiktok_url ?? ""}
                    onChange={(e) => set("tiktok_url", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="empresa-card empresa-card-contacto">
              <h2
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                Contacto
              </h2>

              <div className="empresa-field-row">
                <div>
                  <label style={lbl}>Email</label>
                  <input
                    style={inp}
                    type="email"
                    placeholder="correo@empresa.com"
                    value={data.email ?? ""}
                    onChange={(e) => set("email", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>WhatsApp (pedidos)</label>
                  <input
                    style={inp}
                    placeholder="51987123456"
                    value={data.whatsapp ?? ""}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>WhatsApp (soporte)</label>
                  <input
                    style={inp}
                    placeholder="51987123456"
                    value={data.whatsapp_soporte ?? ""}
                    onChange={(e) => set("whatsapp_soporte", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <label style={lbl}>Número de reclamos</label>
                  <input
                    style={inp}
                    placeholder="Teléfono para reclamos"
                    value={data.numero_reclamos ?? ""}
                    onChange={(e) => set("numero_reclamos", e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>
            </div>

            {/* ─── ROW 3: Save (right column only) ─── */}
            <div className="empresa-save">
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: saving ? "#e0b97a" : "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 2rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "#d4891a";
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.currentTarget.style.background = "#f5a623";
                }}
              >
                <Save size={16} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empresa-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.5rem;
        }

        .empresa-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
        }

        .empresa-card-logo {
          padding: 2rem 1.5rem 1.5rem;
          text-align: center;
        }

        .empresa-card-info {
          padding: 1.5rem;
        }

        .empresa-card-redes {
          padding: 1.25rem 1.5rem;
        }

        .empresa-card-contacto {
          padding: 1.5rem;
        }

        .empresa-save {
          grid-column: 2;
          display: flex;
          justify-content: flex-end;
        }

        .empresa-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 900px) {
          .empresa-grid {
            grid-template-columns: 1fr;
          }
          .empresa-save {
            grid-column: 1;
          }
          .empresa-card-logo {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .empresa-field-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
