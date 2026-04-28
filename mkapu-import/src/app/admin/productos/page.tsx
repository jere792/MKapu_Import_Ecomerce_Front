"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Producto = {
  id: number;
  code: string;
  name: string;
  price: number;
  category: string | number | null;
  image_url: string | null;
  stock: number | null;
  description: string | null;
  price_caja: number | null;
  unidad_caja: number | null;
  price_mayorista: number | null;
  unidad_mayorista: number | null;
  featured: boolean;
  activo: boolean;
  is_new: boolean;
};

type Categoria = { id: string; name: string };
type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
};

const initialForm = {
  code: "",
  name: "",
  price: 0,
  category: "",
  image_url: "",
  description: "",
  price_caja: 0,
  unidad_caja: 0,
  price_mayorista: 0,
  unidad_mayorista: 0,
  featured: false,
  activo: true,
  is_new: false,
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#888",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function AdminProductosPage() {
  const [rows, setRows] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [uploading, setUploading] = useState(false);
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categorias").select("id, name"),
        supabase
          .from("productos")
          .select("*")
          .order("id", { ascending: false }),
      ]);
      if (catRes.data) setCategorias(catRes.data);
      if (prodRes.error) {
        setError(prodRes.error.message);
        return;
      }
      setRows((prodRes.data as Producto[]) ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadImagenes(productoId: number) {
    const { data } = await supabase
      .from("producto_imagenes")
      .select("*")
      .eq("producto_id", productoId)
      .order("orden", { ascending: true });
    setImagenes(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadMainImage(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `productos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (error) {
      alert("Error subiendo imagen: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadGalleryImage(
    file: File,
    productoId: number,
    orden: number,
  ) {
    const ext = file.name.split(".").pop();
    const path = `productos/gallery/${productoId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("imagenes").getPublicUrl(path);
    await supabase.from("producto_imagenes").insert({
      producto_id: productoId,
      url_imagenes: data.publicUrl,
      orden,
    });
    loadImagenes(productoId);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId)
      return alert("Guarda el producto primero antes de subir galería.");
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    const baseOrden = imagenes.length;
    for (let i = 0; i < files.length; i++) {
      await uploadGalleryImage(files[i], editId, baseOrden + i);
    }
    setUploadingGallery(false);
    if (galleryRef.current) galleryRef.current.value = "";
  }

  async function deleteImagen(id: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("producto_imagenes").delete().eq("id", id);
    if (editId) loadImagenes(editId);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.code.trim()) return alert("Código requerido");

    const payload = {
      code: form.code,
      name: form.name,
      price: form.price,
      category: form.category || null,
      image_url: form.image_url || null,
      description: form.description || null,
      price_caja: form.price_caja || null,
      unidad_caja: form.unidad_caja || null,
      price_mayorista: form.price_mayorista || null,
      unidad_mayorista: form.unidad_mayorista || null,
      featured: form.featured,
      activo: form.activo,
      is_new: form.is_new,
    };

    const { error } = editId
      ? await supabase.from("productos").update(payload).eq("id", editId)
      : await supabase.from("productos").insert(payload);

    if (error) return alert(error.message);
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setImagenes([]);
    load();
  }

  function onEdit(p: Producto) {
    setEditId(p.id);
    setForm({
      code: p.code ?? "",
      name: p.name ?? "",
      price: p.price ?? 0,
      category: String(p.category ?? ""),
      image_url: p.image_url ?? "",
      description: p.description ?? "",
      price_caja: p.price_caja ?? 0,
      unidad_caja: p.unidad_caja ?? 0,
      price_mayorista: p.price_mayorista ?? 0,
      unidad_mayorista: p.unidad_mayorista ?? 0,
      featured: p.featured ?? false,
      activo: p.activo ?? true,
      is_new: p.is_new ?? false,
    });
    loadImagenes(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar producto?")) return;
    await supabase.from("productos").delete().eq("id", id);
    load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
    setImagenes([]);
  }

  const filtered = rows.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      selectedCategory === "" || String(p.category) === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const getCategoryName = (catId: string | number | null) => {
    if (!catId) return "—";
    return (
      categorias.find((c) => String(c.id) === String(catId))?.name ??
      String(catId)
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <style>{`
        .fi:focus { border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
        .rh:hover { background: #fafafa !important; }
        .be:hover { background: rgba(0,123,255,0.1) !important; color: #0056b3 !important; }
        .bd:hover { background: rgba(220,53,69,0.1) !important; color: #a71d2a !important; }
        .bp:hover { background: #e69510 !important; }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Productos
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>
            {rows.length} producto{rows.length !== 1 ? "s" : ""} registrado
            {rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="bp"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) cancelForm();
          }}
          style={{
            background: "#f5a623",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          {showForm ? "✕ Cancelar" : "+ Nuevo producto"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #f5a623",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#c33",
            fontSize: "0.875rem",
          }}
        >
          Error: {error}
        </div>
      )}

      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "28px",
            borderTop: "3px solid #f5a623",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            {editId ? "Editar producto" : "Nuevo producto"}
          </h2>
          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={lbl}>Código *</label>
                <input
                  className="fi"
                  style={inp}
                  placeholder="SKU-001"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={lbl}>Nombre *</label>
                <input
                  className="fi"
                  style={inp}
                  placeholder="Nombre del producto"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={lbl}>Categoría</label>
                <select
                  className="fi"
                  style={inp}
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={lbl}>Precio unitario (S/)</label>
                <input
                  className="fi"
                  style={inp}
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
                <label style={lbl}>Precio caja (S/)</label>
                <input
                  className="fi"
                  style={inp}
                  type="number"
                  step="0.01"
                  value={form.price_caja}
                  onChange={(e) =>
                    setForm({ ...form, price_caja: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label style={lbl}>Unidades por caja</label>
                <input
                  className="fi"
                  style={inp}
                  type="number"
                  value={form.unidad_caja}
                  onChange={(e) =>
                    setForm({ ...form, unidad_caja: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 2fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={lbl}>Precio mayorista (S/)</label>
                <input
                  className="fi"
                  style={inp}
                  type="number"
                  step="0.01"
                  value={form.price_mayorista}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price_mayorista: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label style={lbl}>Unid. mayorista</label>
                <input
                  className="fi"
                  style={inp}
                  type="number"
                  value={form.unidad_mayorista}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unidad_mayorista: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label style={lbl}>Imagen principal</label>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    className="fi"
                    style={{ ...inp, flex: 1 }}
                    placeholder="URL o sube archivo..."
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      background: "#f0f0f0",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "9px 14px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {uploading ? "Subiendo..." : "📁 Subir"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadMainImage(file);
                      if (url) setForm((f) => ({ ...f, image_url: url }));
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  />
                </div>
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    style={{
                      marginTop: "8px",
                      height: "64px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #e0e0e0",
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>Descripción</label>
              <textarea
                className="fi"
                style={{ ...inp, minHeight: "80px", resize: "vertical" }}
                placeholder="Descripción del producto..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              {(
                [
                  { key: "featured" as const, label: "⭐ Destacado" },
                  { key: "activo" as const, label: "✅ Activo" },
                  { key: "is_new" as const, label: "🆕 Nuevo" },
                ] as { key: keyof typeof form; label: string }[]
              ).map(({ key, label }) => (
                <label
                  key={key}
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
                    checked={form[key] as boolean}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.checked })
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#f5a623",
                      cursor: "pointer",
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>

            {editId && (
              <div
                style={{
                  marginBottom: "20px",
                  background: "#fafafa",
                  border: "1px solid #e8e8e8",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <label style={{ ...lbl, marginBottom: "10px" }}>
                  Galería de imágenes
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  {imagenes.map((img) => (
                    <div key={img.id} style={{ position: "relative" }}>
                      <img
                        src={img.url_imagenes}
                        alt=""
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteImagen(img.id)}
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
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    style={{
                      width: 72,
                      height: 72,
                      border: "2px dashed #e0e0e0",
                      borderRadius: "8px",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {uploadingGallery ? "⏳" : "+"}
                  </button>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleGalleryUpload}
                  />
                </div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#aaa" }}>
                  Puedes subir múltiples imágenes. Se muestran en la galería del
                  producto.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="bp"
                style={{
                  background: "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {editId ? "Guardar cambios" : "Crear producto"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  background: "#f0f0f0",
                  color: "#555",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          className="fi"
          style={{ ...inp, flex: 1, minWidth: "200px" }}
          placeholder="Buscar por nombre, código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={{ ...inp, minWidth: "200px" }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {(search || selectedCategory) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
            }}
            style={{
              background: "#f5a623",
              color: "#fff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          Cargando productos...
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
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
                  "ID",
                  "Código",
                  "Nombre",
                  "Precio unit.",
                  "Precio caja",
                  "Categoría",
                  "Badges",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#555",
                      fontSize: "0.75rem",
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
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#aaa",
                    }}
                  >
                    {search || selectedCategory
                      ? "Sin resultados"
                      : "No hay productos aún"}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((p, i) => (
                  <tr
                    key={p.id}
                    className="rh"
                    style={{
                      borderBottom:
                        i < paginatedRows.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      background: "#fff",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#aaa",
                        fontWeight: 600,
                      }}
                    >
                      #{p.id}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <code
                        style={{
                          background: "#f5f5f5",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          color: "#444",
                        }}
                      >
                        {p.code}
                      </code>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        maxWidth: 200,
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
                        {p.name}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                      S/ {p.price?.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>
                      {p.price_caja ? (
                        `S/ ${p.price_caja.toFixed(2)}`
                      ) : (
                        <span style={{ color: "#ccc" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: "#f0f0f0",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {getCategoryName(p.category)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        {p.featured && (
                          <span
                            style={{
                              background: "#fff8e6",
                              color: "#b07800",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #f5a62355",
                            }}
                          >
                            ★ Dest.
                          </span>
                        )}
                        {p.is_new && (
                          <span
                            style={{
                              background: "#e8f4ff",
                              color: "#0066cc",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #0066cc33",
                            }}
                          >
                            🆕 Nuevo
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          background: p.activo ? "#e8f7ee" : "#fde8e8",
                          color: p.activo ? "#1a7a3c" : "#a71d2a",
                        }}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="be"
                          onClick={() => onEdit(p)}
                          style={{
                            background: "rgba(0,123,255,0.08)",
                            color: "#007bff",
                            border: "1px solid rgba(0,123,255,0.2)",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="bd"
                          onClick={() => onDelete(p.id)}
                          style={{
                            background: "rgba(220,53,69,0.08)",
                            color: "#dc3545",
                            border: "1px solid rgba(220,53,69,0.2)",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderTop: "1px solid #e8e8e8",
              background: "#fafafa",
              fontSize: "0.875rem",
              color: "#666",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              Mostrando {startIndex + 1} –{" "}
              {Math.min(startIndex + itemsPerPage, filtered.length)} de{" "}
              {filtered.length}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  background: currentPage === 1 ? "#f5f5f5" : "#fff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                ← Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: "6px 10px",
                      border:
                        currentPage === page
                          ? "2px solid #f5a623"
                          : "1px solid #e0e0e0",
                      borderRadius: "6px",
                      background: currentPage === page ? "#fff8e6" : "#fff",
                      color: currentPage === page ? "#f5a623" : "#666",
                      fontWeight: currentPage === page ? 700 : 600,
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  background: currentPage === totalPages ? "#f5f5f5" : "#fff",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
