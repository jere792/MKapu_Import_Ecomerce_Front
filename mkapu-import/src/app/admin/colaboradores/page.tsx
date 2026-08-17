"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Colaborador } from "@/lib/queries";
import {
  Upload,
  CheckCircle,
  Pencil,
  Trash2,
  Users,
  Image,
  Video,
  ImageOff,
  VideoOff,
  ImagePlus,
  VideoIcon,
  PlusCircle,
  X,
} from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";

type ColabMedia = {
  id: number;
  colaborador_id: number;
  url: string;
  tipo: "imagen" | "video";
  orden: number;
  titulo: string | null;
};

type ColaboradorRow = Colaborador & {
  created_at?: string | null;
};

const initialForm = { name: "", logo_url: "", activo: true, orden: 0 };

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

export default function AdminColaboradoresPage() {
  const [rows, setRows] = useState<ColaboradorRow[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoName, setLogoName] = useState("");
  const [media, setMedia] = useState<ColabMedia[]>([]);
  const [mediaMap, setMediaMap] = useState<
    Record<number, { imgs: number; vids: number }>
  >({});
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);

    const [{ data: colabs }, { data: allMedia }] = await Promise.all([
      supabase
        .from("colaboradores")
        .select("*")
        .order("orden", { ascending: true }),
      supabase.from("colaborador_media").select("colaborador_id, tipo"),
    ]);

    setRows((colabs as ColaboradorRow[]) ?? []);

    const mapa: Record<number, { imgs: number; vids: number }> = {};
    for (const m of allMedia ?? []) {
      if (!mapa[m.colaborador_id]) {
        mapa[m.colaborador_id] = { imgs: 0, vids: 0 };
      }
      if (m.tipo === "imagen") mapa[m.colaborador_id].imgs++;
      else mapa[m.colaborador_id].vids++;
    }

    setMediaMap(mapa);
    setLoading(false);
  }

  async function loadMedia(id: number) {
    const { data } = await supabase
      .from("colaborador_media")
      .select("*")
      .eq("colaborador_id", id)
      .order("orden");

    setMedia(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setLogoName("");
    setMedia([]);
  }

  async function uploadFile(
    file: File,
    tipo: "imagen" | "video",
  ): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const folder =
      tipo === "imagen" ? "colaboradores/imagenes" : "colaboradores/videos";
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);
    const url = await uploadFile(file, "imagen");
    setUploading(false);
    return url;
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;

    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadingImg(true);
    const baseOrden = media.filter((m) => m.tipo === "imagen").length;

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], "imagen");
      if (url) {
        await supabase.from("colaborador_media").insert({
          colaborador_id: editId,
          url,
          tipo: "imagen",
          orden: baseOrden + i,
        });
      }
    }

    await loadMedia(editId);
    await load();
    setUploadingImg(false);
    if (imgRef.current) imgRef.current.value = "";
  }

  async function handleVidUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;

    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadingVid(true);
    const baseOrden = media.filter((m) => m.tipo === "video").length;

    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], "video");
      if (url) {
        await supabase.from("colaborador_media").insert({
          colaborador_id: editId,
          url,
          tipo: "video",
          orden: baseOrden + i,
        });
      }
    }

    await loadMedia(editId);
    await load();
    setUploadingVid(false);
    if (vidRef.current) vidRef.current.value = "";
  }

  async function deleteMedia(id: number) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await supabase.from("colaborador_media").delete().eq("id", id);
    if (editId) {
      await loadMedia(editId);
      await load();
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.logo_url.trim()) {
      return alert("Sube un logo para el colaborador");
    }

    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      url: null,
      activo: form.activo,
      orden: form.orden,
    };

    if (editId) {
      const { error } = await supabase
        .from("colaboradores")
        .update(payload)
        .eq("id", editId);

      if (error) return alert(error.message);

      setSuccessMsg("Colaborador actualizado correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
      resetForm();
      await load();
    } else {
      const { data, error } = await supabase
        .from("colaboradores")
        .insert(payload)
        .select()
        .single();

      if (error) return alert(error.message);

      setSuccessMsg("Colaborador creado correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditId(data.id);
      setForm({
        name: data.name,
        logo_url: data.logo_url ?? "",
        activo: data.activo,
        orden: data.orden,
      });
      setMedia([]);
      await load();
    }
  }

  function onEdit(c: ColaboradorRow) {
    setEditId(c.id);
    setForm({
      name: c.name,
      logo_url: c.logo_url ?? "",
      activo: c.activo,
      orden: c.orden,
    });
    setLogoName(c.logo_url ? "Logo ya subido" : "");
    loadMedia(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar colaborador? También se eliminará su media.")) {
      return;
    }

    await supabase.from("colaborador_media").delete().eq("colaborador_id", id);
    await supabase.from("colaboradores").delete().eq("id", id);
    await load();
  }

  async function persistOrder(list: ColaboradorRow[]) {
    setSavingOrder(true);

    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));

    setRows(reordered);

    await Promise.all(
      reordered.map((item) =>
        supabase
          .from("colaboradores")
          .update({ orden: item.orden })
          .eq("id", item.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const copy = [...rows];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    void persistOrder(copy);
  }

  function moveDown(index: number) {
    if (index === rows.length - 1) return;
    const copy = [...rows];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    void persistOrder(copy);
  }

  const imagenes = media.filter((m) => m.tipo === "imagen");
  const videos = media.filter((m) => m.tipo === "video");

  function onFocusInput(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        title="Colaboradores"
        icon={<Users size={18} />}
        description="Gestiona los colaboradores del negocio"
        actions={
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) setForm({ ...initialForm, orden: rows.length + 1 });
              if (showForm) resetForm();
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
            }}
          >
            {showForm ? (
              <>
                <X size={15} /> Cancelar
              </>
            ) : (
              <>
                <PlusCircle size={15} /> Nuevo colaborador
              </>
            )}
          </button>
        }
      />

      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderTop: "3px solid #f5a623",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.75rem",
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
            {editId ? "Editar colaborador" : "Nuevo colaborador"}
          </h2>

          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr auto",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Nombre *</label>
                <input
                  style={inp}
                  placeholder="Nombre del colaborador"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                />
              </div>

              <div>
                <label style={lbl}>Orden</label>
                <input
                  style={inp}
                  type="number"
                  value={form.orden}
                  onChange={(e) =>
                    setForm({ ...form, orden: Number(e.target.value) })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: "0.7rem",
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
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) =>
                      setForm({ ...form, activo: e.target.checked })
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
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Logo *</label>

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
                        animation: "spin 0.8s linear infinite",
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
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLogoName(file.name);
                  const url = await uploadLogo(file);
                  if (url) setForm((f) => ({ ...f, logo_url: url }));
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: editId ? "1.75rem" : 0,
              }}
            >
              <button
                type="submit"
                disabled={uploading}
                style={{
                  background: uploading ? "#e0b97a" : "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.7 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {editId ? (
                  <>
                    <CheckCircle size={15} /> Guardar cambios
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} /> Crear y añadir media
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <X size={15} /> Cancelar
              </button>
            </div>
          </form>

          {editId && (
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: "1.5rem",
              }}
            >
              <div style={{ marginBottom: "1.5rem" }}>
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
                    <Image size={15} color="#888" />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Imágenes del carrusel ({imagenes.length})
                    </span>
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
                      <Image size={20} color="#ddd" />
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

              <div>
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
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Videos del carrusel ({videos.length})
                    </span>
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
          )}
        </div>
      )}

      {!showForm &&
        (
<DataTable
            columns={[
              { key: "logo", label: "Logo" },
              { key: "nombre", label: "Nombre" },
              { key: "orden", label: "Orden" },
              { key: "imagenes", label: "Imágenes" },
              { key: "videos", label: "Videos" },
              { key: "estado", label: "Estado" },
              { key: "acciones", label: "Acciones" },
            ]}
            rows={rows}
            minWidth="980px"
            loading={loading}
            loadingText="Cargando colaboradores..."
            banner={
              savingOrder && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid #f0f0f0",
                    background: "#fff8e6",
                    color: "#b07800",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  Guardando orden...
                </div>
              )
            }
            emptyIcon={<Users size={32} />}
            emptyText="No hay colaboradores aún"
            footer={
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e8e8e8",
                  background: "#fafafa",
                  fontSize: "0.8rem",
                  color: "#aaa",
                }}
              >
                {rows.length} colaborador{rows.length !== 1 ? "es" : ""}{" "}
                registrado
                {rows.length !== 1 ? "s" : ""}
              </div>
            }
            renderRow={(c, i) => {
              const m = mediaMap[c.id] ?? { imgs: 0, vids: 0 };

              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom:
                      i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
                    background: "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      width: 120,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        width: 90,
                        height: 52,
                        borderRadius: "8px",
                        border: "1px solid #e8e8e8",
                        background: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {c.logo_url ? (
                        <img
                          src={c.logo_url}
                          alt={c.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "#ddd",
                            fontSize: "0.75rem",
                          }}
                        >
                          Sin logo
                        </span>
                      )}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: "0.9rem",
                      minWidth: 240,
                    }}
                  >
                    {c.name}
                  </td>

                   <td
                    style={{
                      padding: "0.9rem 1rem",
                      minWidth: 120,
                      whiteSpace: "nowrap",
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
                        disabled={i === 0 || savingOrder}
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
                        {c.orden}
                      </span>

                      <button
                        type="button"
                        onClick={() => moveDown(i)}
                        disabled={i === rows.length - 1 || savingOrder}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "6px",
                          border: "1px solid #e2e2e2",
                          background: "#fff",
                          cursor:
                            i === rows.length - 1 || savingOrder
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            i === rows.length - 1 || savingOrder
                              ? 0.35
                              : 1,
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

                  <td style={{ padding: "0.9rem 1rem" }}>
                    {m.imgs > 0 ? (
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
                        <ImagePlus size={12} strokeWidth={2} /> {m.imgs}
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
                        <ImageOff size={12} strokeWidth={1.5} /> Sin fotos
                      </span>
                    )}
                  </td>

                  <td style={{ padding: "0.9rem 1rem" }}>
                    {m.vids > 0 ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          background: "#f0fdf4",
                          color: "#16a34a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <VideoIcon size={12} strokeWidth={2} /> {m.vids}
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
                        <VideoOff size={12} strokeWidth={1.5} /> Sin videos
                      </span>
                    )}
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        background: c.activo
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: c.activo ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      minWidth: 120,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onEdit(c)}
                        title="Editar"
                        style={{
                          background: "rgba(245,166,35,0.1)",
                          color: "#f5a623",
                          border: "1px solid rgba(245,166,35,0.18)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => onDelete(c.id)}
                        title="Eliminar"
                        style={{
                          background: "rgba(220,53,69,0.08)",
                          color: "#dc3545",
                          border: "1px solid rgba(220,53,69,0.2)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
);
            }}
          />
        )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          form > div[style*="grid-template-columns: 3fr 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
