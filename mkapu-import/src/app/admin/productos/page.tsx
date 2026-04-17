"use client";

import { useEffect, useState } from "react";
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
};

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
  price_caja: 0,
  unidad_caja: 0,
  price_mayorista: 0,
  unidad_mayorista: 0,
  featured: false,
  activo: true,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

async function load() {
  try {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    console.log("Usuario autenticado:", user?.email);

    // Cargar categorías PRIMERO - sin order si falla
    let catRes = await supabase
      .from("categorias")
      .select("id, name");

    if (catRes.error) {
      console.error("Error loading categorias:", catRes.error);
      // Intentar sin select específico
      catRes = await supabase.from("categorias").select("*");
    }

    console.log("Categorías cargadas:", catRes.data);
    console.log("Error categorías:", catRes.error);
    
    if (catRes.data && catRes.data.length > 0) {
      setCategorias(catRes.data || []);
    } else {
      console.warn("No categories found or error loading");
      setError("No se pudieron cargar las categorías");
    }

    // Luego cargar productos
    const prodRes = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: false });

    if (prodRes.error) {
      console.error("Error loading productos:", prodRes.error);
      setError(prodRes.error.message);
      return;
    }

    console.log("Productos cargados:", prodRes.data?.length);

    setRows((prodRes.data as Producto[]) || []);
  } catch (err) {
    console.error("Error:", err);
    setError(String(err));
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    console.log("Categorías actualizadas:", categorias);
  }, [categorias]);

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
    };

    const { error } = editId
      ? await supabase.from("productos").update(payload).eq("id", editId)
      : await supabase.from("productos").insert(payload);

    if (error) return alert(error.message);
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
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
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
  }

  // Filtrar por búsqueda y categoría
  const filtered = rows.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === "" || String(p.category) === selectedCategory;

    return matchSearch && matchCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = filtered.slice(startIndex, endIndex);

  // Resetear a página 1 cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const getCategoryName = (catId: string | number | null) => {
    if (!catId) return "—";

    const catIdStr = String(catId).toLowerCase().trim();
    const cat = categorias.find(
      (c) => String(c.id).toLowerCase().trim() === catIdStr
    );

    return cat ? cat.name : catIdStr;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <style>{`
        .field-input:focus { border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
        .field-input:hover { border-color: #ccc; }
        .row-hover:hover { background: #fafafa !important; }
        .btn-edit:hover { background: rgba(0,123,255,0.1) !important; color: #0056b3 !important; }
        .btn-delete:hover { background: rgba(220,53,69,0.1) !important; color: #a71d2a !important; }
        .btn-primary:hover { background: #e69510 !important; }
        .btn-new:hover { background: #e69510 !important; }
        .search-input:focus { border-color: #f5a623 !important; box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
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
          className="btn-new"
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
            transition: "background 0.15s",
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
                <label style={labelStyle}>Código *</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  placeholder="SKU-001"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  placeholder="Nombre del producto"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Categoría</label>
                <select
                  className="field-input"
                  style={inputStyle}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  disabled={categorias.length === 0}
                >
                  <option value="">Seleccionar...</option>
                  {categorias && categorias.length > 0 ? (
                    categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Cargando categorías...</option>
                  )}
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
                <label style={labelStyle}>Precio unitario (S/)</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Precio caja (S/)</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price_caja}
                  onChange={(e) =>
                    setForm({ ...form, price_caja: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Unidades por caja</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="number"
                  placeholder="0"
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
                <label style={labelStyle}>Precio mayorista (S/)</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
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
                <label style={labelStyle}>Unid. mayorista</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="number"
                  placeholder="0"
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
                <label style={labelStyle}>URL imagen</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Descripción</label>
              <textarea
                className="field-input"
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                placeholder="Descripción del producto..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
              {[
                { key: "featured" as const, label: "Producto destacado" },
                { key: "activo" as const, label: "Activo / visible" },
              ].map(({ key, label }) => (
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
                    checked={form[key]}
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

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  background: "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "background 0.15s",
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

      {/* Filtros */}
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
          className="search-input"
          style={{
            ...inputStyle,
            background: "#fff",
            border: "1px solid #e0e0e0",
            paddingLeft: "36px",
            flex: "1",
            minWidth: "200px",
          }}
          placeholder="Buscar por nombre, código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={{
            ...inputStyle,
            background: "#fff",
            border: "1px solid #e0e0e0",
            minWidth: "200px",
          }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.length > 0 ? (
            categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          ) : (
            <option disabled>Cargando categorías...</option>
          )}
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
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
          Cargando productos...
        </div>
      )}

      {!loading && (
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
                    colSpan={8}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#aaa",
                      fontSize: "0.875rem",
                    }}
                  >
                    {search || selectedCategory
                      ? "Sin resultados con estos filtros"
                      : "No hay productos aún"}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((p, i) => (
                  <tr
                    key={p.id}
                    className="row-hover"
                    style={{
                      borderBottom:
                        i < paginatedRows.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      background: "#fff",
                      transition: "background 0.1s",
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
                          fontFamily: "monospace",
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {p.featured && (
                          <span
                            style={{
                              background: "#fff8e6",
                              color: "#b07800",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              border: "1px solid #f5a62355",
                            }}
                          >
                            ★ Dest.
                          </span>
                        )}
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      S/ {p.price.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>
                      {p.price_caja ? (
                        `S/ ${p.price_caja.toFixed(2)}`
                      ) : (
                        <span style={{ color: "#ccc" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>
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
                          className="btn-edit"
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
                            transition: "all 0.15s",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
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
                            transition: "all 0.15s",
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

          {/* Pie de página con paginación */}
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
              Mostrando {startIndex + 1} - {Math.min(endIndex, filtered.length)}{" "}
              de {filtered.length}
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
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
                  transition: "all 0.15s",
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
                      transition: "all 0.15s",
                    }}
                  >
                    {page}
                  </button>
                )
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
                  transition: "all 0.15s",
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