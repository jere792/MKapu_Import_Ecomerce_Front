"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, Image as ImageIcon, ImageOff, ImagePlus, CheckCircle, Info } from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";

type Seccion = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  orden: number;
  activo: boolean;
};

type SeccionImagen = {
  id: number;
  seccion_id: number;
  url_imagen: string;
  orden: number;
};

const initialForm = { titulo: "", descripcion: "", orden: 1, activo: true };

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

export default function AdminSobreNosotrosPage() {
  const [rows, setRows] = useState<Seccion[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagenes, setImagenes] = useState<SeccionImagen[]>([]);
  const [imagenesMap, setImagenesMap] = useState<Record<number, number>>({});
  const [uploadingImg, setUploadingImg] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);

    const [{ data: secciones }, { data: imgs }] = await Promise.all([
      supabase.from("quienes_somos_secciones").select("*").order("orden"),
      supabase.from("quienes_somos_imagenes").select("seccion_id"),
    ]);

    setRows(secciones ?? []);

    const mapa: Record<number, number> = {};
    for (const img of imgs ?? []) {
      mapa[img.seccion_id] = (mapa[img.seccion_id] ?? 0) + 1;
    }

    setImagenesMap(mapa);
    setLoading(false);
  }

  async function loadImagenes(seccionId: number) {
    const { data } = await supabase
      .from("quienes_somos_imagenes")
      .select("*")
      .eq("seccion_id", seccionId)
      .order("orden");

    setImagenes(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImagen(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `sobre-nosotros/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Error subiendo imagen: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;

    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadingImg(true);

    const baseOrden = imagenes.length;

    for (let i = 0; i < files.length; i++) {
      const url = await uploadImagen(files[i]);
      if (url) {
        await supabase.from("quienes_somos_imagenes").insert({
          seccion_id: editId,
          url_imagen: url,
          orden: baseOrden + i + 1,
        });
      }
    }

    await loadImagenes(editId);
    await load();
    setUploadingImg(false);

    if (imgRef.current) imgRef.current.value = "";
  }

  async function deleteImagen(id: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("quienes_somos_imagenes").delete().eq("id", id);
    if (editId) await loadImagenes(editId);
    await load();
  }

  async function persistOrder(list: Seccion[]) {
    setSavingOrder(true);

    const reordered = list.map((s, i) => ({ ...s, orden: i + 1 }));
    setRows(reordered);

    await Promise.all(
      reordered.map((s) =>
        supabase
          .from("quienes_somos_secciones")
          .update({ orden: s.orden })
          .eq("id", s.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const copy = [...rows];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    void persistOrder(copy);
  }

  function moveDown(idx: number) {
    if (idx === rows.length - 1) return;
    const copy = [...rows];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    void persistOrder(copy);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    const payload = {
      titulo: form.titulo || null,
      descripcion: form.descripcion || null,
      orden: form.orden,
      activo: form.activo,
    };

    if (editId) {
      const { error } = await supabase
        .from("quienes_somos_secciones")
        .update(payload)
        .eq("id", editId);

      if (error) return alert(error.message);

      setSuccessMsg("Sección actualizada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
      cancelForm();
      await load();
    } else {
      const { data, error } = await supabase
        .from("quienes_somos_secciones")
        .insert(payload)
        .select()
        .single();

      if (error) return alert(error.message);

      setSuccessMsg("Sección creada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
      await load();

      setEditId(data.id);
      setForm({
        titulo: data.titulo ?? "",
        descripcion: data.descripcion ?? "",
        orden: data.orden ?? 1,
        activo: data.activo ?? true,
      });
      setImagenes([]);
      setShowForm(true);
    }
  }

  function onEdit(s: Seccion) {
    setEditId(s.id);
    setForm({
      titulo: s.titulo ?? "",
      descripcion: s.descripcion ?? "",
      orden: s.orden ?? 1,
      activo: s.activo ?? true,
    });
    void loadImagenes(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (
      !confirm("¿Eliminar esta sección? También se eliminarán sus imágenes.")
    ) {
      return;
    }

    await supabase.from("quienes_somos_imagenes").delete().eq("seccion_id", id);
    await supabase.from("quienes_somos_secciones").delete().eq("id", id);
    await load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
    setImagenes([]);
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
        title="Sobre Nosotros"
        icon={<Info size={18} />}
        description={'Gestiona las secciones de la página "Quiénes Somos"'}
        actions={
          <>
            {savingOrder && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#c47d00",
                  background: "#fff8e6",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Guardando orden...
              </span>
            )}

            <button
              onClick={() => {
                if (showForm) cancelForm();
                else setForm({ ...initialForm, orden: rows.length + 1 });
                setShowForm(!showForm);
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
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#d4891a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5a623")}
            >
              {showForm ? "✕ Cancelar" : "+ Nueva sección"}
            </button>
          </>
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
            {editId ? "Editar sección" : "Nueva sección"}
          </h2>

          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Título (opcional)</label>
                <input
                  style={inp}
                  placeholder="Ej: Nuestra Historia"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>Orden</label>
                <input
                  style={inp}
                  type="number"
                  min={1}
                  value={form.orden}
                  onChange={(e) =>
                    setForm({ ...form, orden: parseInt(e.target.value) || 1 })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>Estado</label>
                <select
                  style={inp}
                  value={form.activo ? "true" : "false"}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.value === "true" })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Descripción</label>
              <textarea
                style={{ ...inp, minHeight: "140px", resize: "vertical" }}
                placeholder="<p>Escribe el contenido de esta sección...</p>"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
              <span style={{ fontSize: "0.75rem", color: "#bbb" }}>
                Puedes usar: &lt;strong&gt;, &lt;p&gt;, &lt;br&gt;, &lt;ul&gt;,
                &lt;li&gt;, etc.
              </span>
            </div>

            <div
              style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label style={lbl}>Imágenes del carrusel</label>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#aaa" }}>
                    {editId
                      ? "Se mostrarán en carrusel en la sección"
                      : "Disponible después de crear la sección"}
                  </p>
                </div>

                {editId && (
                  <>
                    <button
                      type="button"
                      onClick={() => imgRef.current?.click()}
                      disabled={uploadingImg}
                      style={{
                        background: "#f0f0f0",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        opacity: uploadingImg ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ImageIcon size={14} />
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
                  </>
                )}
              </div>

              {editId ? (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {imagenes.map((img) => (
                    <div key={img.id} style={{ position: "relative" }}>
                      <img
                        src={img.url_imagen}
                        alt="Imagen de la sección"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteImagen(img.id)}
                        title="Eliminar imagen"
                        aria-label={`Eliminar imagen ${img.id}`}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {imagenes.length === 0 && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#bbb",
                        padding: "8px 0",
                      }}
                    >
                      Sin imágenes aún
                    </span>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 0",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: "#ececec",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ImageIcon size={32} color="#ccc" />
                  </div>

                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#bbb" }}>
                    Crea la sección primero y podrás
                    <br />
                    subir imágenes de inmediato.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  background: "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#d4891a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f5a623")
                }
              >
                {editId ? "Guardar cambios" : "Crear sección"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm &&
        (loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>
            Cargando secciones...
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e8e8e8",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: 700,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    {[
                      "Título",
                      "Descripción",
                      "Orden",
                      "Imágenes",
                      "Estado",
                      "Acciones",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.85rem 1rem",
                          textAlign: h === "Orden" ? "center" : "left",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#888",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "3rem",
                          textAlign: "center",
                          color: "#aaa",
                        }}
                      >
                        No hay secciones registradas.
                      </td>
                    </tr>
                  ) : (
                    rows.map((s, i) => {
                      const cantImg = imagenesMap[s.id] ?? 0;
                      const isFirst = i === 0;
                      const isLast = i === rows.length - 1;

                      return (
                        <tr
                          key={s.id}
                          style={{
                            borderBottom:
                              i < rows.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              fontSize: "0.9rem",
                              minWidth: 160,
                            }}
                          >
                            {s.titulo || (
                              <span style={{ color: "#ccc", fontWeight: 400 }}>
                                Sin título
                              </span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              color: "#555",
                              fontSize: "0.875rem",
                              maxWidth: 260,
                              minWidth: 160,
                            }}
                          >
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {s.descripcion ? (
                                s.descripcion
                                  .replace(/<[^>]*>/g, "")
                                  .slice(0, 90) +
                                (s.descripcion.length > 90 ? "..." : "")
                              ) : (
                                <span style={{ color: "#ccc" }}>—</span>
                              )}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              textAlign: "center",
                              minWidth: 80,
                            }}
                          >
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
                                disabled={isFirst || savingOrder}
                                title="Subir"
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: "6px",
                                  border: "1px solid #e2e2e2",
                                  background: "#fff",
                                  cursor:
                                    isFirst || savingOrder
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity: isFirst || savingOrder ? 0.35 : 1,
                                  fontWeight: 700,
                                  color: "#666",
                                  fontSize: "0.85rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
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
                                {s.orden}
                              </span>
                              <button
                                type="button"
                                onClick={() => moveDown(i)}
                                disabled={isLast || savingOrder}
                                title="Bajar"
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: "6px",
                                  border: "1px solid #e2e2e2",
                                  background: "#fff",
                                  cursor:
                                    isLast || savingOrder
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity: isLast || savingOrder ? 0.35 : 1,
                                  fontWeight: 700,
                                  color: "#666",
                                  fontSize: "0.85rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                ↓
                              </button>
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              textAlign: "left",
                              minWidth: 130,
                            }}
                          >
                            {cantImg > 0 ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 10px",
                                  borderRadius: "999px",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  background: "#eef2ff",
                                  color: "#4f46e5",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <ImagePlus size={12} strokeWidth={2} /> {cantImg}
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 10px",
                                  borderRadius: "999px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  background: "#f5f5f5",
                                  color: "#ccc",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <ImageOff size={12} strokeWidth={1.5} /> Sin imágenes
                              </span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              minWidth: 110,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                background: s.activo
                                  ? "rgba(34,197,94,0.1)"
                                  : "rgba(239,68,68,0.1)",
                                color: s.activo ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {s.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              minWidth: 100,
                            }}
                          >
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => onEdit(s)}
                                title="Editar sección"
                                aria-label={`Editar sección ${s.titulo ?? s.id}`}
                                style={{
                                  background: "rgba(245,166,35,0.1)",
                                  color: "#f5a623",
                                  border: "1px solid rgba(245,166,35,0.18)",
                                  padding: "7px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(245,166,35,0.2)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(245,166,35,0.1)")
                                }
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                onClick={() => onDelete(s.id)}
                                title="Eliminar sección"
                                aria-label={`Eliminar sección ${s.titulo ?? s.id}`}
                                style={{
                                  background: "rgba(220,38,38,0.08)",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "7px",
                                  cursor: "pointer",
                                  color: "#dc2626",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(220,38,38,0.18)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(220,38,38,0.08)")
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        ))}
    </div>
  );
}
