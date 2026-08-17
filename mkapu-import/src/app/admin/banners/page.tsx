"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, Upload, ImageIcon, CheckCircle } from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";

type BannerCarousel = {
  id: number;
  titulo: string | null;
  subtitulo: string | null;
  descripcion: string | null;
  eyebrow: string | null;
  titulo_completo: string | null;
  image_url: string;
  orden: number;
  activo: boolean;
  created_at?: string | null;
};

type BannerConfig = {
  id: number;
  ruta: string;
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  border: "1px solid #e2e2e2",
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
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#555",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const initialCarousel = {
  titulo: "",
  subtitulo: "",
  descripcion: "",
  eyebrow: "",
  titulo_completo: "",
  image_url: "",
  orden: 0,
  activo: true,
};

export default function AdminBannersPage() {
  const [tab, setTab] = useState<"carousel" | "config">("carousel");

  const [carousel, setCarousel] = useState<BannerCarousel[]>([]);
  const [formC, setFormC] = useState(initialCarousel);
  const [editCId, setEditCId] = useState<number | null>(null);
  const [showFormC, setShowFormC] = useState(false);
  const [uploadingC, setUploadingC] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const fileRefC = useRef<HTMLInputElement>(null);

  const [configs, setConfigs] = useState<BannerConfig[]>([]);
  const [editConfig, setEditConfig] = useState<BannerConfig | null>(null);
  const [uploadingCfg, setUploadingCfg] = useState(false);
  const fileRefCfg = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  async function load() {
    setLoading(true);
    const [carRes, cfgRes] = await Promise.all([
      supabase
        .from("banners_carousel")
        .select("*")
        .order("orden", { ascending: true }),
      supabase
        .from("banners_config")
        .select("*")
        .order("ruta", { ascending: true }),
    ]);
    setCarousel(carRes.data ?? []);
    setConfigs(cfgRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImage(
    file: File,
    folder: string,
  ): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `banners/${folder}`);
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
    }
  }

  async function persistOrder(list: BannerCarousel[]) {
    setSavingOrder(true);
    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));
    setCarousel(reordered);
    await Promise.all(
      reordered.map((item) =>
        supabase
          .from("banners_carousel")
          .update({ orden: item.orden })
          .eq("id", item.id),
      ),
    );
    setSavingOrder(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const copy = [...carousel];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    void persistOrder(copy);
  }

  function moveDown(index: number) {
    if (index === carousel.length - 1) return;
    const copy = [...carousel];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    void persistOrder(copy);
  }

  async function saveCarousel(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("¿Guardar estos cambios?")) return;
    if (!formC.image_url) return alert("Imagen requerida");
    const payload = {
      titulo: formC.titulo || null,
      subtitulo: formC.subtitulo || null,
      descripcion: formC.descripcion || null,
      eyebrow: formC.eyebrow || null,
      titulo_completo: formC.titulo_completo || null,
      image_url: formC.image_url,
      orden: formC.orden,
      activo: formC.activo,
    };
    const { error } = editCId
      ? await supabase
          .from("banners_carousel")
          .update(payload)
          .eq("id", editCId)
      : await supabase.from("banners_carousel").insert(payload);
    if (error) return alert(error.message);
    setSuccessMsg(editCId ? "Slide actualizado correctamente" : "Slide creado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    setFormC(initialCarousel);
    setEditCId(null);
    setShowFormC(false);
    await load();
  }

  function onEditCarousel(b: BannerCarousel) {
    setEditCId(b.id);
    setFormC({
      titulo: b.titulo ?? "",
      subtitulo: b.subtitulo ?? "",
      descripcion: b.descripcion ?? "",
      eyebrow: b.eyebrow ?? "",
      titulo_completo: b.titulo_completo ?? "",
      image_url: b.image_url,
      orden: b.orden,
      activo: b.activo,
    });
    setShowFormC(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDeleteCarousel(id: number) {
    if (!confirm("¿Eliminar banner?")) return;
    await supabase.from("banners_carousel").delete().eq("id", id);
    await load();
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("¿Guardar estos cambios?")) return;
    if (!editConfig) return;
    const { error } = await supabase
      .from("banners_config")
      .update({
        titulo: editConfig.titulo,
        subtitulo: editConfig.subtitulo,
        image_url: editConfig.image_url,
        activo: editConfig.activo,
      })
      .eq("id", editConfig.id);
    if (error) return alert(error.message);
    setSuccessMsg("Banner de página actualizado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    setEditConfig(null);
    await load();
  }

  function onFocusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.12)";
  }

  function onBlurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "#e2e2e2";
    e.currentTarget.style.boxShadow = "none";
  }

  function formatFecha(fecha?: string | null) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* ─── Imagen con fallback visual ─── */
  function ThumbImg({
    src,
    alt,
    w = 88,
    h = 56,
  }: {
    src: string;
    alt?: string;
    w?: number;
    h?: number;
  }) {
    const [err, setErr] = useState(false);
    return err || !src ? (
      <div
        style={{
          width: w,
          height: h,
          borderRadius: "8px",
          border: "1px solid #e8e8e8",
          background: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          color: "#bbb",
        }}
      >
        <ImageIcon size={16} />
        <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>Sin imagen</span>
      </div>
    ) : (
      <img
        src={src}
        alt={alt ?? ""}
        onError={() => setErr(true)}
        style={{
          width: w,
          height: h,
          objectFit: "cover",
          borderRadius: "8px",
          border: "1px solid #e8e8e8",
          display: "block",
          background: "#f5f5f5",
        }}
      />
    );
  }

  /* ─── Estilos reutilizables ─── */
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e8e8e8",
    borderRadius: "12px",
    overflow: "hidden",
  };

  const btnPrimary: React.CSSProperties = {
    background: "#f5a623",
    color: "#fff",
    border: "none",
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background 0.18s",
  };

  const btnSecondary: React.CSSProperties = {
    padding: "0.6rem 1.1rem",
    borderRadius: "8px",
    border: "1px solid #e2e2e2",
    background: "#fafafa",
    color: "#555",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background 0.18s",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.85rem 1rem",
    verticalAlign: "middle",
  };

  return (
    <div
      style={{
        padding: "1.75rem 1.5rem 3rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      {successMsg && (<div style={{position:"fixed",top:"1rem",right:"1rem",zIndex:9999,background:"#16a34a",color:"#fff",padding:"0.75rem 1.25rem",borderRadius:"10px",fontWeight:600,fontSize:"0.875rem",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:"8px"}}><CheckCircle size={16}/> {successMsg}</div>)}

      {/* ── Header ── */}
      <SectionHeader
        title="Banners"
        icon={<ImageIcon size={18} />}
        description="Gestiona el carrusel principal y los banners de cada página"
      />

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #ebebeb",
          marginTop: "1rem",
          gap: "0.25rem",
        }}
      >
        {(["carousel", "config"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "config") {
                  setShowFormC(false);
                  setEditCId(null);
                  setFormC(initialCarousel);
                }
                if (t === "carousel") setEditConfig(null);
              }}
              style={{
                padding: "0.6rem 1.4rem",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                background: "transparent",
                color: active ? "#f5a623" : "#999",
                borderBottom: active
                  ? "2px solid #f5a623"
                  : "2px solid transparent",
                marginBottom: "-2px",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {t === "carousel" ? "Carrusel" : "Banners de páginas"}
            </button>
          );
        })}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div
          style={{
            ...card,
            padding: "4rem",
            textAlign: "center",
            color: "#bbb",
            fontSize: "0.875rem",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #f0f0f0",
              borderTop: "3px solid #f5a623",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          Cargando...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : tab === "carousel" ? (
        /* ══════════════════════════════
              TAB: CARRUSEL
           ══════════════════════════════ */
        <>
          {/* Barra superior */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{ fontSize: "0.875rem", color: "#666", fontWeight: 600 }}
              >
                {carousel.length} slide{carousel.length !== 1 ? "s" : ""}
              </span>
              {savingOrder && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#c47d00",
                    background: "#fff8e6",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontWeight: 600,
                    border: "1px solid #ffe5a0",
                  }}
                >
                  Guardando orden...
                </span>
              )}
            </div>

            <button
              style={showFormC ? { ...btnSecondary } : { ...btnPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = showFormC
                  ? "#f0f0f0"
                  : "#d4891a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showFormC
                  ? "#fafafa"
                  : "#f5a623";
              }}
              onClick={() => {
                if (showFormC) {
                  setShowFormC(false);
                  setEditCId(null);
                  setFormC(initialCarousel);
                } else {
                  setEditCId(null);
                  setFormC({ ...initialCarousel, orden: carousel.length + 1 });
                  setShowFormC(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              {showFormC ? "✕ Cancelar" : "+ Nuevo slide"}
            </button>
          </div>

          {/* ── Formulario crear/editar ── */}
          {showFormC && (
            <div
              style={{
                ...card,
                padding: "1.75rem",
                marginBottom: "1.5rem",
                borderTop: "3px solid #f5a623",
              }}
            >
              <h2
                style={{
                  margin: "0 0 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                {editCId ? "Editar slide" : "Nuevo slide"}
              </h2>

              <form onSubmit={saveCarousel}>
                {/* Fila 1: título + subtítulo */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label style={lbl}>Título</label>
                    <input
                      style={inp}
                      value={formC.titulo}
                      placeholder="Ej: Gran remate de verano"
                      onChange={(e) =>
                        setFormC({ ...formC, titulo: e.target.value })
                      }
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Subtítulo</label>
                    <input
                      style={inp}
                      value={formC.subtitulo}
                      placeholder="Ej: Hasta 50% de descuento"
                      onChange={(e) =>
                        setFormC({ ...formC, subtitulo: e.target.value })
                      }
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                </div>

                {/* Descripción larga */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lbl}>Descripción</label>
                  <textarea
                    style={{ ...inp, minHeight: "80px", resize: "vertical" }}
                    value={formC.descripcion}
                    placeholder="Texto completo para el slide..."
                    onChange={(e) =>
                      setFormC({ ...formC, descripcion: e.target.value })
                    }
                    onFocus={onFocusInput}
                    onBlur={onBlurInput}
                  />
                </div>

                {/* Fila: eyebrow + titulo_completo */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label style={lbl}>Eyebrow</label>
                    <input
                      style={inp}
                      value={formC.eyebrow}
                      placeholder="Ej: Equipos de importación · Lima, Perú"
                      onChange={(e) =>
                        setFormC({ ...formC, eyebrow: e.target.value })
                      }
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Título completo (HTML)</label>
                    <input
                      style={inp}
                      value={formC.titulo_completo}
                      placeholder='Ej: Equipos que&lt;br/&gt;&lt;em&gt;Profesionales&lt;/em&gt;&lt;br/&gt;para tu negocio'
                      onChange={(e) =>
                        setFormC({ ...formC, titulo_completo: e.target.value })
                      }
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                </div>

                {/* Fila 2: orden + activo */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label style={lbl}>Orden</label>
                    <input
                      style={inp}
                      type="number"
                      value={formC.orden}
                      onChange={(e) =>
                        setFormC({ ...formC, orden: Number(e.target.value) })
                      }
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      paddingBottom: "0.65rem",
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
                        fontWeight: 500,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formC.activo}
                        onChange={(e) =>
                          setFormC({ ...formC, activo: e.target.checked })
                        }
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: "#f5a623",
                          cursor: "pointer",
                        }}
                      />
                      Slide activo
                    </label>
                  </div>
                </div>

                {/* Imagen */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={lbl}>Imagen *</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      style={{ ...inp, flex: 1, minWidth: "180px" }}
                      placeholder="https://... o sube un archivo"
                      value={formC.image_url}
                      onChange={(e) =>
                        setFormC({ ...formC, image_url: e.target.value })
                      }
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefC.current?.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "0.6rem 0.9rem",
                        borderRadius: "8px",
                        border: "1px solid #e2e2e2",
                        background: uploadingC ? "#f0f0f0" : "#fafafa",
                        color: "#555",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: uploadingC ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s",
                      }}
                      disabled={uploadingC}
                    >
                      <Upload size={14} />
                      {uploadingC ? "Subiendo..." : "Subir"}
                    </button>
                    <input
                      ref={fileRefC}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingC(true);
                        const url = await uploadImage(file, "carousel");
                        setUploadingC(false);
                        if (url) setFormC((f) => ({ ...f, image_url: url }));
                        if (fileRefC.current) fileRefC.current.value = "";
                      }}
                    />
                  </div>

                  {formC.image_url && (
  <div
    style={{
      marginTop: "12px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #e8e8e8",
      background: "#f5f5f5",
      width: "25%",
      margin: "12px auto 0",
    }}
  >
    <img
      src={formC.image_url}
      alt="preview"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
      }}
      onError={(e) => {
        (e.currentTarget.parentElement as HTMLElement).style.display = "none";
      }}
    />
  </div>
)}
                      
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    style={btnPrimary}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#d4891a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f5a623")
                    }
                  >
                    {editCId ? "Guardar cambios" : "Crear slide"}
                  </button>
                  <button
                    type="button"
                    style={btnSecondary}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f0f0f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onClick={() => {
                      setShowFormC(false);
                      setEditCId(null);
                      setFormC(initialCarousel);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Tabla (se oculta cuando el formulario está abierto) ── */}
          {!showFormC && (
            <DataTable
              columns={[
                { key: "preview", label: "Preview" },
                { key: "titulo", label: "Título / Subtítulo" },
                { key: "fecha", label: "Fecha / Orden" },
                { key: "estado", label: "Estado" },
                { key: "acciones", label: "Acciones" },
              ]}
              rows={carousel}
              minWidth="700px"
              emptyText="No hay slides todavía. Crea el primero con &quot;+ Nuevo slide&quot;."
              renderRow={(b, i) => (
                <tr
                  key={b.id}
                  style={{
                    borderBottom:
                      i < carousel.length - 1 ? "1px solid #f2f2f2" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fdfcfb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Preview */}
                  <td style={tdStyle}>
                    <ThumbImg src={b.image_url} alt={b.titulo ?? ""} />
                  </td>

                  {/* Título */}
                  <td style={tdStyle}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#111",
                        fontSize: "0.9rem",
                        marginBottom: "2px",
                      }}
                    >
                      {b.titulo ?? (
                        <span
                          style={{ color: "#ccc", fontWeight: 400 }}
                        >
                          Sin título
                        </span>
                      )}
                    </div>
                    {b.subtitulo && (
                      <div
                        style={{ fontSize: "0.8rem", color: "#888" }}
                      >
                        {b.subtitulo}
                      </div>
                    )}
                  </td>

                  {/* Fecha + orden */}
                  <td style={tdStyle}>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#aaa",
                        marginBottom: "8px",
                      }}
                    >
                      {formatFecha(b.created_at)}
                    </div>
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
                        title="Subir"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "6px",
                          border: "1px solid #e2e2e2",
                          background: "#fff",
                          cursor:
                            i === 0 || savingOrder
                              ? "not-allowed"
                              : "pointer",
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
                          minWidth: "20px",
                          textAlign: "center",
                          fontWeight: 700,
                          color: "#555",
                          fontSize: "0.85rem",
                        }}
                      >
                        {b.orden}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveDown(i)}
                        disabled={
                          i === carousel.length - 1 || savingOrder
                        }
                        title="Bajar"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "6px",
                          border: "1px solid #e2e2e2",
                          background: "#fff",
                          cursor:
                            i === carousel.length - 1 || savingOrder
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            i === carousel.length - 1 || savingOrder
                              ? 0.35
                              : 1,
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

                  {/* Estado */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: b.activo
                          ? "rgba(34,197,94,0.09)"
                          : "rgba(239,68,68,0.09)",
                        color: b.activo ? "#16a34a" : "#dc2626",
                        border: `1px solid ${b.activo ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                      }}
                    >
                      {b.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onEditCarousel(b)}
                        title="Editar"
                        style={{
                          background: "rgba(245,166,35,0.08)",
                          border: "1px solid rgba(245,166,35,0.2)",
                          borderRadius: "7px",
                          padding: "6px 7px",
                          cursor: "pointer",
                          color: "#f5a623",
                          display: "flex",
                          transition:
                            "background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(245,166,35,0.16)";
                          e.currentTarget.style.borderColor =
                            "rgba(245,166,35,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(245,166,35,0.08)";
                          e.currentTarget.style.borderColor =
                            "rgba(245,166,35,0.2)";
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteCarousel(b.id)}
                        title="Eliminar"
                        style={{
                          background: "rgba(220,38,38,0.07)",
                          border: "1px solid rgba(220,38,38,0.18)",
                          borderRadius: "7px",
                          padding: "6px 7px",
                          cursor: "pointer",
                          color: "#dc2626",
                          display: "flex",
                          transition:
                            "background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(220,38,38,0.14)";
                          e.currentTarget.style.borderColor =
                            "rgba(220,38,38,0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(220,38,38,0.07)";
                          e.currentTarget.style.borderColor =
                            "rgba(220,38,38,0.18)";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          )}
        </>
      ) : (
        /* ══════════════════════════════
              TAB: BANNERS DE PÁGINAS
           ══════════════════════════════ */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {configs.length === 0 && (
            <div
              style={{
                ...card,
                padding: "3rem",
                textAlign: "center",
                color: "#bbb",
                fontSize: "0.875rem",
              }}
            >
              No hay configuraciones de banners registradas.
            </div>
          )}

          {configs.map((cfg) => (
            <div key={cfg.id} style={card}>
              {editConfig?.id === cfg.id ? (
                /* ── Formulario edición config ── */
                <form onSubmit={saveConfig} style={{ padding: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.25rem",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <code
                      style={{
                        background: "#f5f5f5",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        color: "#555",
                        border: "1px solid #eee",
                      }}
                    >
                      {cfg.ruta}
                    </code>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.875rem",
                        color: "#444",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editConfig.activo}
                        onChange={(e) =>
                          setEditConfig({
                            ...editConfig,
                            activo: e.target.checked,
                          })
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label style={lbl}>Título</label>
                      <input
                        style={inp}
                        value={editConfig.titulo}
                        onChange={(e) =>
                          setEditConfig({
                            ...editConfig,
                            titulo: e.target.value,
                          })
                        }
                        onFocus={onFocusInput}
                        onBlur={onBlurInput}
                        required
                      />
                    </div>
                    <div>
                      <label style={lbl}>Subtítulo</label>
                      <input
                        style={inp}
                        value={editConfig.subtitulo ?? ""}
                        onChange={(e) =>
                          setEditConfig({
                            ...editConfig,
                            subtitulo: e.target.value,
                          })
                        }
                        onFocus={onFocusInput}
                        onBlur={onBlurInput}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={lbl}>Imagen de fondo</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        style={{ ...inp, flex: 1, minWidth: "180px" }}
                        placeholder="https://... o sube un archivo"
                        value={editConfig.image_url ?? ""}
                        onChange={(e) =>
                          setEditConfig({
                            ...editConfig,
                            image_url: e.target.value,
                          })
                        }
                        onFocus={onFocusInput}
                        onBlur={onBlurInput}
                      />
                      <button
                        type="button"
                        onClick={() => fileRefCfg.current?.click()}
                        disabled={uploadingCfg}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "0.6rem 0.9rem",
                          borderRadius: "8px",
                          border: "1px solid #e2e2e2",
                          background: "#fafafa",
                          color: "#555",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: uploadingCfg ? "not-allowed" : "pointer",
                          transition: "background 0.15s",
                        }}
                      >
                        <Upload size={14} />
                        {uploadingCfg ? "Subiendo..." : "Subir"}
                      </button>
                      <input
                        ref={fileRefCfg}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingCfg(true);
                          const url = await uploadImage(file, "config");
                          setUploadingCfg(false);
                          if (url && editConfig)
                            setEditConfig((c) =>
                              c ? { ...c, image_url: url } : c,
                            );
                          if (fileRefCfg.current) fileRefCfg.current.value = "";
                        }}
                      />
                    </div>
{editConfig.image_url && (
  <div
    style={{
      marginTop: "12px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #e8e8e8",
      background: "#f5f5f5",
      width: "60%",
      margin: "12px auto 0",
    }}
  >
    <img
      src={editConfig.image_url}
      alt="preview"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
      }}
      onError={(e) => {
        (e.currentTarget.parentElement as HTMLElement).style.display = "none";
      }}
    />
  </div>
)}
   
                  </div>

                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    <button
                      type="submit"
                      style={btnPrimary}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#d4891a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#f5a623")
                      }
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      style={btnSecondary}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0f0f0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onClick={() => setEditConfig(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Fila config (vista) ── */
                <div
                  style={{
                    padding: "1.1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      flexWrap: "wrap",
                      flex: 1,
                    }}
                  >
                    {/* Thumbnail */}
                    {cfg.image_url ? (
                      <ThumbImg src={cfg.image_url} w={100} h={72} />
                    ) : (
                      <div
                        style={{
                          width: 100,
                          height: 72,
                          borderRadius: "8px",
                          border: "1px dashed #ddd",
                          background: "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ccc",
                        }}
                      >
                        <ImageIcon size={16} />
                      </div>
                    )}

                    <div>
                      <code
                        style={{
                          display: "inline-block",
                          background: "#f5f5f5",
                          padding: "2px 8px",
                          borderRadius: "5px",
                          fontSize: "0.75rem",
                          color: "#666",
                          border: "1px solid #eee",
                          marginBottom: "5px",
                        }}
                      >
                        {cfg.ruta}
                      </code>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#111",
                          fontSize: "0.9rem",
                        }}
                      >
                        {cfg.titulo}
                      </div>
                      {cfg.subtitulo && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#888",
                            marginTop: "2px",
                          }}
                        >
                          {cfg.subtitulo}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: cfg.activo
                          ? "rgba(34,197,94,0.09)"
                          : "rgba(239,68,68,0.09)",
                        color: cfg.activo ? "#16a34a" : "#dc2626",
                        border: `1px solid ${cfg.activo ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                      }}
                    >
                      {cfg.activo ? "Activo" : "Inactivo"}
                    </span>

                    <button
                      onClick={() => setEditConfig(cfg)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(245,166,35,0.08)",
                        border: "1px solid rgba(245,166,35,0.2)",
                        borderRadius: "7px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        color: "#f5a623",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(245,166,35,0.16)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(245,166,35,0.08)")
                      }
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
