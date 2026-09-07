"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAppModal } from "@/context/AppModalContext";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import BannerTabs from "@/components/layout/admin/BannerTabs";
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Pencil,
  Upload,
  X,
} from "lucide-react";

type BannerConfig = {
  id: number;
  ruta: string;
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

export default function AdminBannersConfigPage() {
  const router = useRouter();

  const [configs, setConfigs] = useState<BannerConfig[]>([]);
  const [editConfig, setEditConfig] = useState<BannerConfig | null>(null);
  const [uploadingCfg, setUploadingCfg] = useState(false);
  const fileRefCfg = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const { confirm, alert: showAlert } = useAppModal();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("banners_config")
      .select("*")
      .order("ruta", { ascending: true });
    setConfigs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploadingCfg(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners/config");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload fallido");
      const data = await res.json();
      return data.url;
    } catch (error) {
      await showAlert({
        title: "Error",
        message: String(error),
        variant: "danger",
      });
      return null;
    } finally {
      setUploadingCfg(false);
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    const ok = await confirm({
      title: "¿Guardar estos cambios?",
      variant: "primary",
      confirmText: "Guardar",
    });
    if (!ok) return;
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
    if (error) {
      await showAlert({ title: "Error", message: error.message, variant: "danger" });
      return;
    }
    setSuccessMsg("Banner de página actualizado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    setEditConfig(null);
    await load();
  }

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
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
        title="Banners de páginas"
        icon={<LayoutGrid size={18} />}
        description="Configura los banners de fondo de cada página"
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

      <BannerTabs />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1.25rem",
        }}
      >
        {loading ? (
          <div
            className="ap-card"
            style={{ textAlign: "center", padding: "60px 0", color: "#888" }}
          >
            <Loader2 size={28} className="ap-spin" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando banners...</p>
          </div>
        ) : configs.length === 0 ? (
          <div
            className="ap-card"
            style={{ textAlign: "center", padding: "3rem", color: "#bbb" }}
          >
            No hay configuraciones de banners registradas.
          </div>
        ) : (
          configs.map((cfg) => (
            <div key={cfg.id} className="ap-card ap-fadein">
              {editConfig?.id === cfg.id ? (
                /* ── Formulario edición config ── */
                <form onSubmit={saveConfig}>
                  <div className="ap-fblock" style={{ marginBottom: 0 }}>
                    <h3 className="ap-fblock__title">
                      {cfg.ruta}
                    </h3>

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
                            value={editConfig.titulo}
                            onChange={(e) =>
                              setEditConfig({
                                ...editConfig,
                                titulo: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="ap-lbl">Subtítulo</label>
                          <input
                            className="ap-inp"
                            value={editConfig.subtitulo ?? ""}
                            onChange={(e) =>
                              setEditConfig({
                                ...editConfig,
                                subtitulo: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Imagen de fondo</h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          className="ap-inp"
                          style={{ flex: 1, minWidth: "180px" }}
                          placeholder="https://... o sube un archivo"
                          value={editConfig.image_url ?? ""}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              image_url: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => fileRefCfg.current?.click()}
                          disabled={uploadingCfg}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "9px 14px",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            background: uploadingCfg ? "#f0f0f0" : "#fafafa",
                            color: "#555",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: uploadingCfg ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
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
                            const url = await uploadImage(file);
                            if (url && editConfig)
                              setEditConfig((c) =>
                                c ? { ...c, image_url: url } : c,
                              );
                            if (fileRefCfg.current)
                              fileRefCfg.current.value = "";
                          }}
                        />
                      </div>

                      {editConfig.image_url ? (
                        <div
                          style={{
                            marginTop: "14px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "2px dashed #22c55e",
                            background: "#f0fdf4",
                            padding: "8px",
                          }}
                        >
                          <img
                            src={editConfig.image_url}
                            alt="preview"
                            style={{
                              width: "100%",
                              maxHeight: 160,
                              objectFit: "cover",
                              borderRadius: "6px",
                              display: "block",
                            }}
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: "14px",
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
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Configuración</h4>
                      <label className="ap-toggle">
                        <input
                          type="checkbox"
                          checked={editConfig.activo}
                          onChange={(e) =>
                            setEditConfig({
                              ...editConfig,
                              activo: e.target.checked,
                            })
                          }
                        />
                        <span className="ap-toggle__slider" />
                        <span>Activo</span>
                      </label>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      type="submit"
                      className="ap-btn ap-btn--primary"
                    >
                      <CheckCircle size={15} />
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="ap-btn ap-btn--ghost ap-btn--sm"
                      onClick={() => setEditConfig(null)}
                    >
                      <X size={14} />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Fila config (vista) ── */
                <div
                  style={{
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
                    {cfg.image_url ? (
                      <img
                        src={cfg.image_url}
                        alt={cfg.ruta}
                        style={{
                          width: 100,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e8e8e8",
                          display: "block",
                          background: "#f5f5f5",
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display =
                            "none";
                        }}
                      />
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
                      className="ap-btn ap-btn--secondary ap-btn--sm"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}