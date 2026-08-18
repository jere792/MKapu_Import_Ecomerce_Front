"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import ImageCropperModal from "@/components/layout/admin/ImageCropperModal";
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  Package,
  PlusCircle,
  Upload,
  X,
} from "lucide-react";

type Categoria = {
  id: string;
  name: string;
};

const initialForm = {
  code: "",
  name: "",
  price: 0,
  category: "",
  image_url: "",
  description: "",
  featured: false,
  activo: true,
  is_new: false,
  low_stock: false,
  agotado: false,
};

interface ProductoFormProps {
  mode: "create" | "edit";
  productId?: number;
}

export default function ProductoForm({ mode, productId }: ProductoFormProps) {
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("categorias")
      .select("id, name")
      .then(({ data }) => {
        if (data) setCategorias(data as Categoria[]);
      });
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    supabase
      .from("productos")
      .select("*")
      .eq("id", productId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.push("/admin/productos");
          return;
        }
        setForm({
          code: data.code ?? "",
          name: data.name ?? "",
          price: data.price ?? 0,
          category: String(data.category ?? ""),
          image_url: data.image_url ?? "",
          description: data.description ?? "",
          featured: data.featured ?? false,
          activo: data.activo ?? true,
          is_new: data.is_new ?? false,
          low_stock: data.low_stock ?? false,
          agotado: data.agotado ?? false,
        });
        setLoading(false);
      });
  }, [mode, productId, router]);

  async function uploadMainImage(file: File): Promise<string | null> {
    setUploading(true);

    const path = `productos/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (error) {
      alert(`Error: ${error.message}`);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  function closeCrop() {
    setCropOpen(false);
    if (cropSrc && cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropFile(null);
  }

  async function handleCropConfirm(blob: Blob, fileName: string) {
    const file = new File([blob], fileName, { type: blob.type });
    const url = await uploadMainImage(file);
    if (url) setForm((f) => ({ ...f, image_url: url }));
    closeCrop();
  }

  async function saveProducto(): Promise<number | null> {
    if (!form.name.trim()) {
      alert("Nombre requerido");
      return null;
    }

    if (!form.code.trim()) {
      alert("Código requerido");
      return null;
    }

    setSaving(true);

    const payload = {
      code: form.code,
      name: form.name,
      price: form.price,
      category: form.category || null,
      image_url: form.image_url || null,
      description: form.description || null,
      featured: form.featured,
      activo: form.activo,
      is_new: form.is_new,
      low_stock: form.low_stock,
      agotado: form.agotado,
    };

    if (mode === "edit" && productId) {
      const { error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", productId);

      setSaving(false);

      if (error) {
        alert(error.message);
        return null;
      }

      return productId;
    } else {
      const { data, error } = await supabase
        .from("productos")
        .insert(payload)
        .select("id")
        .single();

      setSaving(false);

      if (error) {
        alert(error.message);
        return null;
      }

      return data.id;
    }
  }

  async function handleSave(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    const id = await saveProducto();
    if (!id) return;

    setSuccessMsg(
      mode === "edit"
        ? "Producto actualizado correctamente"
        : "Producto creado correctamente",
    );
    setTimeout(() => setSuccessMsg(""), 3000);
    setSavedId(id);

    if (closeAfter) router.push("/admin/productos");
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
        .ap-btn--primary:disabled{background:#ccc;cursor:not-allowed}
        .ap-btn--secondary{background:#f0f0f0;color:#555}
        .ap-btn--secondary:hover{background:#e4e4e4}
        .ap-btn--ghost{background:transparent;color:#888;border:1px solid #e0e0e0}
        .ap-btn--ghost:hover{background:#f5f5f5}
        .ap-btn--sm{padding:6px 12px;font-size:.8rem;border-radius:6px}
        .ap-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:24px;margin-bottom:28px;border-top:3px solid #f5a623}
        .ap-section{background:#fafafa;border:1px solid #e8e8e8;border-radius:10px;padding:16px;margin-bottom:12px}
        .ap-fblock{background:#fafafa;border:1px solid #e8e8e8;border-radius:12px;padding:16px;margin-bottom:16px}
        .ap-fblock__title{margin:0 0 14px;font-size:.72rem;font-weight:800;color:#1a1a1a;text-transform:uppercase;letter-spacing:.08em;padding-bottom:10px;border-bottom:1px solid #e8e8e8}
        .ap-fsub{padding:12px;background:#fff;border:1px solid #eef0f2;border-radius:8px;margin-bottom:12px}
        .ap-fsub__title{margin:0 0 12px;font-size:.68rem;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.08em}
        .ap-uploader{position:relative;border:2px dashed #d9d9d9;border-radius:12px;background:#fff;overflow:hidden;cursor:pointer;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#bbb;transition:border-color .15s,background .15s}
        .ap-uploader:hover{border-color:#f5a623;background:#fffaf3}
        .ap-uploader img{width:100%;height:100%;object-fit:cover}
        .ap-uploader__text{margin:0;font-size:.85rem;font-weight:700;color:#999}
        .ap-uploader__hint{margin:0;font-size:.72rem;color:#bbb}
        .ap-uploader__badge{position:absolute;right:10px;bottom:10px;background:#f5a623;color:#fff;border-radius:8px;padding:7px 14px;font-size:.75rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,.18)}
        .ap-toggle{display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:.875rem;color:#555;user-select:none}
        .ap-toggle input{display:none}
        .ap-toggle__slider{width:44px;height:24px;background:#e0e0e0;border-radius:12px;position:relative;transition:background .2s;flex-shrink:0}
        .ap-toggle__slider::after{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .ap-toggle input:checked+.ap-toggle__slider{background:#22c55e}
        .ap-toggle input:checked+.ap-toggle__slider::after{transform:translateX(20px)}
        .ap-info-box{background:#fff8e6;border:1px solid #f5a62333;border-radius:10px;padding:14px 16px;text-align:center;font-size:.875rem;color:#b37400}
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
          title={mode === "create" ? "Nuevo producto" : `Editar producto #${productId}`}
          icon={<Package size={18} />}
          description={
            mode === "create"
              ? "Completa los datos y guarda para luego subir galería y videos"
              : "Modifica los campos y guarda los cambios"
          }
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/productos")}
            >
              <ArrowLeft size={14} />
              Volver al listado
            </button>
          }
        />

        {loading ? (
          <div className="ap-card" style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <Loader2 size={28} className="ap-spin" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando producto...</p>
          </div>
        ) : (
          <div className="ap-card ap-fadein">
            <form onSubmit={(e) => handleSave(e, false)}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 360px) 1fr",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                {/* ── Imagen principal ─────────────────────────────────── */}
                <div className="ap-fblock">
                  <h3 className="ap-fblock__title">Imagen principal</h3>

                  <div
                    className="ap-uploader"
                    role="button"
                    tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                  >
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt="Vista previa"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display = "none")
                        }
                      />
                    ) : (
                      <>
                        <ImageIcon size={42} strokeWidth={1.2} />
                        <p className="ap-uploader__text">
                          Haz clic para subir tu imagen
                        </p>
                        <p className="ap-uploader__hint">JPG o PNG</p>
                      </>
                    )}

                    <span className="ap-uploader__badge">
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="ap-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Subir
                        </>
                      )}
                    </span>
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
                      setCropSrc(URL.createObjectURL(file));
                      setCropFile(file);
                      setCropOpen(true);
                    }}
                  />
                </div>

                {/* ── Datos del producto ───────────────────────────────── */}
                <div>
                  <div className="ap-fblock">
                    <h3 className="ap-fblock__title">Datos del producto</h3>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Información básica</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 2fr 1fr",
                          gap: 16,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">Código</label>
                          <input
                            className="ap-inp"
                            placeholder="SKU-001"
                            value={form.code}
                            onChange={(e) =>
                              setForm({ ...form, code: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="ap-lbl">Nombre</label>
                          <input
                            className="ap-inp"
                            placeholder="Nombre del producto"
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="ap-lbl">Categoría</label>
                          <select
                            className="ap-inp"
                            value={form.category}
                            onChange={(e) =>
                              setForm({ ...form, category: e.target.value })
                            }
                          >
                            <option value="">Seleccionar...</option>
                            {categorias.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Precio y descripción</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 14,
                        }}
                      >
                        <div>
                          <label className="ap-lbl">Precio unitario (S/)</label>
                          <input
                            className="ap-inp"
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) =>
                              setForm({ ...form, price: Number(e.target.value) })
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="ap-lbl">Descripción</label>
                          <textarea
                            className="ap-inp"
                            style={{ minHeight: 80, resize: "vertical" }}
                            placeholder="Descripción del producto..."
                            value={form.description}
                            onChange={(e) =>
                              setForm({ ...form, description: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ap-fsub">
                      <h4 className="ap-fsub__title">Opciones</h4>
                      <div
                        style={{
                          display: "flex",
                          gap: 24,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {[
                          { key: "featured", label: "Destacado" },
                          { key: "is_new", label: "Nuevo" },
                          { key: "low_stock", label: "Últimas unidades" },
                        ].map(({ key, label }) => (
                          <label
                            key={key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: ".875rem",
                              color: "#555",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                form[key as keyof typeof form] as boolean
                              }
                              onChange={(e) =>
                                setForm({ ...form, [key]: e.target.checked })
                              }
                              style={{
                                width: 16,
                                height: 16,
                                accentColor: "#f5a623",
                              }}
                            />
                            {label}
                          </label>
                        ))}

                        <label className="ap-toggle">
                          <input
                            type="checkbox"
                            checked={form.activo}
                            onChange={(e) =>
                              setForm({ ...form, activo: e.target.checked })
                            }
                          />
                          <span className="ap-toggle__slider" />
                          <span>{form.activo ? "Activo" : "Inactivo"}</span>
                        </label>
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
                  ) : mode === "create" ? (
                    <>
                      <PlusCircle size={15} />
                      Crear y continuar
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Guardar cambios
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="ap-btn ap-btn--secondary"
                  onClick={(e) =>
                    handleSave(e as unknown as React.FormEvent, true)
                  }
                  disabled={saving}
                >
                  <CheckCircle size={15} />
                  Guardar y cerrar
                </button>

                <button
                  type="button"
                  className="ap-btn ap-btn--ghost ap-btn--sm"
                  onClick={() => router.push("/admin/productos")}
                >
                  <X size={14} />
                  Cancelar
                </button>
              </div>
            </form>

            {savedId && (
              <div
                className="ap-section ap-fadein"
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <p style={{ margin: 0, fontSize: ".875rem", color: "#555" }}>
                  Producto guardado. Ahora puedes gestionar su galería y videos.
                </p>

                <Link
                  href={`/admin/productos/${savedId}/media`}
                  className="ap-btn ap-btn--primary ap-btn--sm"
                  style={{ textDecoration: "none" }}
                >
                  <ImageIcon size={14} />
                  Ir a galería & videos
                </Link>
              </div>
            )}

            {!savedId && mode === "create" && (
              <div className="ap-info-box" style={{ marginTop: 16 }}>
                Primero guarda el producto para habilitar la galería de imágenes
                y videos.
              </div>
            )}
          </div>
        )}
      </div>

      <ImageCropperModal
        open={cropOpen}
        imageSrc={cropSrc}
        fileType={cropFile?.type || "image/jpeg"}
        onCancel={closeCrop}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}