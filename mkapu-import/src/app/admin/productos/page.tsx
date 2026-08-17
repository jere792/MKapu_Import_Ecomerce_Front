"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import {
  PlusCircle,
  X,
  CheckCircle,
  Loader2,
  Upload,
  Pencil,
  Trash2,
  Package,
  Search,
  Image as ImageIcon,
  Video,
  ImageOff,
  VideoOff,
  LayoutGrid,
  AlertCircle,
  List,
} from "lucide-react";

type Producto = {
  id: number;
  code: string;
  name: string;
  price: number;
  category: number | null;
  image_url: string | null;
  description: string | null;
  featured: boolean;
  activo: boolean;
  is_new: boolean;
  low_stock: boolean;
  agotado: boolean;
  imgCount?: number;
  vidCount?: number;
};

type Categoria = {
  id: string;
  name: string;
};

type ViewMode = "todos" | "completos" | "incompletos";
type FormMode = "list" | "create" | "edit";

const ITEMS_PER_PAGE = 10;

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

export default function AdminProductosPage() {
  const [rows, setRows] = useState<Producto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("list");
  const [viewMode, setViewMode] = useState<ViewMode>("todos");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompletos, setTotalCompletos] = useState(0);
  const [totalIncompletos, setTotalIncompletos] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase
      .from("categorias")
      .select("id, name")
      .then(({ data }) => {
        if (data) setCategorias(data as Categoria[]);
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("productos_con_media")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(from, to);

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%`,
      );
    }

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    const prodRes = await query;

    const products = ((prodRes.data as Producto[]) ?? []).map((p) => ({
      ...p,
      imgCount: (p as any).img_count ?? 0,
      vidCount: (p as any).vid_count ?? 0,
    }));

    if (products.length > 0) {
      const ids = products.map((p) => p.id);
      const { data: agRows } = await supabase
        .from("productos")
        .select("id, agotado")
        .in("id", ids);
      if (agRows) {
        const agMap = new Map(agRows.map((a: any) => [a.id, a.agotado]));
        for (const p of products) {
          if (agMap.has(p.id)) p.agotado = agMap.get(p.id) ?? p.agotado;
        }
      }
    }

    const { data: allCounts } = await supabase
      .from("productos_con_media")
      .select("img_count, vid_count")
      .eq("activo", true);

    const totalCompletos = (allCounts ?? []).filter(
      (p: any) => p.img_count > 0 && p.vid_count > 0,
    ).length;
    const totalIncompletos = (allCounts ?? []).length - totalCompletos;

    let finalProducts = products;
    const finalCount = prodRes.count ?? 0;

    if (viewMode === "completos") {
      finalProducts = products.filter(
        (p) => (p.imgCount ?? 0) > 0 && (p.vidCount ?? 0) > 0,
      );
    } else if (viewMode === "incompletos") {
      finalProducts = products.filter(
        (p) => (p.imgCount ?? 0) === 0 || (p.vidCount ?? 0) === 0,
      );
    }

    setRows(finalProducts);
    setTotalCount(finalCount);
    setTotalCompletos(totalCompletos);
    setTotalIncompletos(totalIncompletos);
    setLoading(false);
  }, [currentPage, search, selectedCategory, viewMode]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, viewMode]);

  function handleSearchInput(value: string) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
    }, 350);
  }

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

    if (editId) {
      const { error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", editId);

      setSaving(false);

      if (error) {
        alert(error.message);
        return null;
      }

      return editId;
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

    setSuccessMsg(editId ? "Producto actualizado correctamente" : "Producto creado correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    setSavedId(id);
    setEditId(id);
    await load();

    if (closeAfter) goToList();
  }

  function onEdit(p: Producto) {
    setEditId(p.id);
    setSavedId(null);
    setForm({
      code: p.code ?? "",
      name: p.name ?? "",
      price: p.price ?? 0,
      category: String(p.category ?? ""),
      image_url: p.image_url ?? "",
      description: p.description ?? "",
      featured: p.featured ?? false,
      activo: p.activo ?? true,
      is_new: p.is_new ?? false,
      low_stock: p.low_stock ?? false,
      agotado: p.agotado ?? false,
    });
    setFormMode("edit");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar producto?")) return;
    await supabase.from("productos").delete().eq("id", id);
    await load();
  }

  // ── NUEVO: toggle agotado directo desde la tabla ──────────────────────────
  async function toggleAgotado(p: Producto) {
    await supabase
      .from("productos")
      .update({ agotado: !p.agotado })
      .eq("id", p.id);
    await load();
  }

  function goToList() {
    setForm(initialForm);
    setEditId(null);
    setSavedId(null);
    setFormMode("list");
  }

  function openCreate() {
    setForm(initialForm);
    setEditId(null);
    setSavedId(null);
    setFormMode("create");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const getCategoryName = (catId: string | number | null) => {
    if (!catId) return "-";
    return (
      categorias.find((c) => String(c.id) === String(catId))?.name ??
      String(catId)
    );
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

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
        .ap-btn--edit{background:rgba(245,166,35,.1);color:#f5a623;border:1px solid rgba(245,166,35,.18)}
        .ap-btn--edit:hover{background:rgba(245,166,35,.2)}
        .ap-btn--delete{background:rgba(220,53,69,.07);color:#dc3545;border:1px solid rgba(220,53,69,.2)}
        .ap-btn--delete:hover{background:rgba(220,53,69,.15)}
        .ap-btn--media{background:rgba(99,102,241,.07);color:#6366f1;border:1px solid rgba(99,102,241,.2)}
        .ap-btn--media:hover{background:rgba(99,102,241,.15)}
        .ap-view-tabs{display:flex;gap:0;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;background:#f9f9f9}
        .ap-view-tab{display:flex;align-items:center;gap:7px;padding:9px 18px;border:none;background:transparent;font-size:.82rem;font-weight:700;color:#888;cursor:pointer;transition:all .15s;white-space:nowrap;border-right:1px solid #e0e0e0}
        .ap-view-tab:last-child{border-right:none}
        .ap-view-tab--active{background:#fff;color:#1a1a1a;box-shadow:inset 0 -2px 0 #f5a623}
        .ap-view-tab:hover:not(.ap-view-tab--active){background:#f0f0f0;color:#555}
        .ap-view-tab--warning.ap-view-tab--active{box-shadow:inset 0 -2px 0 #f59e0b;color:#b45309}
        .ap-view-tab--success.ap-view-tab--active{box-shadow:inset 0 -2px 0 #22c55e;color:#166534}
        .ap-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:20px;font-size:.7rem;font-weight:800;line-height:1}
        .ap-count--default{background:#f0f0f0;color:#666}
        .ap-count--success{background:#dcfce7;color:#166534}
        .ap-count--warning{background:#fef3c7;color:#b45309}
        .ap-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:24px;margin-bottom:28px;border-top:3px solid #f5a623}
        .ap-section{background:#fafafa;border:1px solid #e8e8e8;border-radius:10px;padding:16px;margin-bottom:12px}
        .ap-badge{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:.75rem;font-weight:700}
        .ap-table-wrap{background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:auto;width:100%}
        .ap-table{width:100%;min-width:1500px;border-collapse:collapse;font-size:.875rem}
        .ap-th{padding:12px 16px;text-align:left;font-size:.7rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;background:#fafafa;border-bottom:1px solid #e8e8e8}
        .ap-td{padding:12px 16px}
        .ap-row{border-bottom:1px solid #f0f0f0;background:#fff;transition:background .12s}
        .ap-row:last-child{border-bottom:none}
        .ap-row:hover{background:#fafafa !important}
        .ap-media-pip{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:.78rem;font-weight:700;white-space:nowrap}
        .ap-media-pip--ok{background:#eef2ff;color:#4f46e5}
        .ap-media-pip--empty{background:#f5f5f5;color:#ccc}
        .ap-media-pip--vid-ok{background:#f0fdf4;color:#16a34a}
        .ap-pager{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-top:1px solid #e8e8e8;background:#fafafa;font-size:.875rem;color:#888}
        .ap-page-btn{padding:6px 10px;border:1px solid #e0e0e0;border-radius:6px;background:#fff;color:#666;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s}
        .ap-page-btn:hover:not(:disabled){border-color:#f5a623;color:#f5a623}
        .ap-page-btn--active{border:2px solid #f5a623 !important;background:#fff8e6 !important;color:#f5a623 !important;font-weight:700 !important}
        .ap-page-btn:disabled{opacity:.4;cursor:not-allowed}
        .ap-info-box{background:#fff8e6;border:1px solid #f5a62333;border-radius:10px;padding:14px 16px;text-align:center;font-size:.875rem;color:#b37400}
        .ap-warn-box{background:#fef3c7;border:1px solid #f59e0b44;border-radius:10px;padding:14px 16px;font-size:.875rem;color:#92400e}
        .ap-row--incomplete{background:#fffbeb !important}
        .ap-row--incomplete:hover{background:#fef3c7 !important}
        /* ── toggle activo ── */
        .ap-toggle{display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:.875rem;color:#555;user-select:none}
        .ap-toggle input{display:none}
        .ap-toggle__slider{width:44px;height:24px;background:#e0e0e0;border-radius:12px;position:relative;transition:background .2s;flex-shrink:0}
        .ap-toggle__slider::after{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .ap-toggle input:checked+.ap-toggle__slider{background:#22c55e}
        .ap-toggle input:checked+.ap-toggle__slider::after{transform:translateX(20px)}
        /* ── check agotado ── */
        .ap-agotado-check{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;border:2px solid #d1d5db;background:#fff;cursor:pointer;transition:all .15s;flex-shrink:0}
        .ap-agotado-check--on{border-color:#dc2626;background:#dc2626}
        .ap-agotado-check:hover{opacity:.75}
        @keyframes ap-spin{to{transform:rotate(360deg)}}
        .ap-spin{animation:ap-spin .8s linear infinite}
        @keyframes ap-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .ap-fadein{animation:ap-fadein .2s ease}
      `}</style>

      <div
        ref={topRef}
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: 0,
          padding: "20px 24px",
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
        {/* ── FORMULARIO CREATE / EDIT ─────────────────────────────────────── */}
        {formMode !== "list" && (
          <div className="ap-card ap-fadein">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#1a1a1a",
                  }}
                >
                  {formMode === "create"
                    ? "Nuevo producto"
                    : `Editar producto #${editId}`}
                </h2>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: ".8rem",
                    color: "#aaa",
                  }}
                >
                  {formMode === "create"
                    ? "Completa los datos y guarda para luego subir galería y videos"
                    : "Modifica los campos y guarda los cambios"}
                </p>
              </div>

              <button
                className="ap-btn ap-btn--ghost ap-btn--sm"
                onClick={goToList}
              >
                <X size={14} />
                Volver al listado
              </button>
            </div>

            <form onSubmit={(e) => handleSave(e, false)}>
              {/* Fila 1: código / nombre / categoría */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label className="ap-lbl">Código</label>
                  <input
                    className="ap-inp"
                    placeholder="SKU-001"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="ap-lbl">Nombre</label>
                  <input
                    className="ap-inp"
                    placeholder="Nombre del producto"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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

              {/* Precio */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 16,
                  marginBottom: 16,
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
              </div>

              {/* Imagen principal */}
              <div style={{ marginBottom: 16 }}>
                <label className="ap-lbl">Imagen principal</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="ap-inp"
                    style={{ flex: 1 }}
                    placeholder="URL o sube un archivo..."
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                  />

                  <button
                    type="button"
                    className="ap-btn ap-btn--secondary"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => fileRef.current?.click()}
                  >
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
                      marginTop: 8,
                      height: 64,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1px solid #e0e0e0",
                    }}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                )}
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 16 }}>
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

              {/* Checkboxes */}
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  marginBottom: 20,
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
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.checked })
                      }
                      style={{ width: 16, height: 16, accentColor: "#f5a623" }}
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

              {/* Botones de guardado */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                  ) : formMode === "create" ? (
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
                  style={{ marginLeft: "auto" }}
                  onClick={goToList}
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

            {!savedId && formMode === "create" && (
              <div className="ap-info-box" style={{ marginTop: 16 }}>
                Primero guarda el producto para habilitar la galería de imágenes
                y videos.
              </div>
            )}
          </div>
        )}

        {/* ── LISTADO ─────────────────────────────────────────────────────── */}
        {formMode === "list" && (
          <div className="ap-fadein">
            {/* Header */}
            <SectionHeader
              title="Productos"
              icon={<Package size={18} />}
              description="Gestiona el catálogo de tus productos"
              actions={
                <button className="ap-btn ap-btn--primary" onClick={openCreate}>
                  <PlusCircle size={15} />
                  Nuevo producto
                </button>
              }
            />

            {/* Tabs de vista */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div className="ap-view-tabs">
                <button
                  className={`ap-view-tab ${viewMode === "todos" ? "ap-view-tab--active" : ""}`}
                  onClick={() => setViewMode("todos")}
                >
                  <List size={14} />
                  Todos
                  <span className="ap-count ap-count--default">
                    {totalCount}
                  </span>
                </button>

                <button
                  className={`ap-view-tab ap-view-tab--success ${viewMode === "completos" ? "ap-view-tab--active" : ""}`}
                  onClick={() => setViewMode("completos")}
                >
                  <LayoutGrid size={14} />
                  Con media
                  <span className="ap-count ap-count--success">
                    {totalCompletos}
                  </span>
                </button>

                <button
                  className={`ap-view-tab ap-view-tab--warning ${viewMode === "incompletos" ? "ap-view-tab--active" : ""}`}
                  onClick={() => setViewMode("incompletos")}
                >
                  <AlertCircle size={14} />
                  Sin media
                  <span className="ap-count ap-count--warning">
                    {totalIncompletos}
                  </span>
                </button>
              </div>

              {viewMode === "incompletos" && totalIncompletos > 0 && (
                <div
                  className="ap-warn-box"
                  style={{
                    flex: 1,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{totalIncompletos}</strong> producto
                    {totalIncompletos !== 1 ? "s" : ""} sin fotos o videos. Haz
                    clic en <strong>Media</strong> para completarlos.
                  </span>
                </div>
              )}
            </div>

            {/* Filtros */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#ccc",
                    pointerEvents: "none",
                  }}
                />
                <input
                  className="ap-inp"
                  style={{ paddingLeft: 32 }}
                  placeholder="Buscar por nombre o código..."
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                />
              </div>

              <select
                className="ap-inp"
                style={{ minWidth: 220, width: "auto" }}
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
                  className="ap-btn ap-btn--ghost ap-btn--sm"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setSelectedCategory("");
                  }}
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {/* Tabla */}
            <DataTable
              columns={[
                { key: "img", label: "Img" },
                { key: "codigo", label: "Código" },
                { key: "nombre", label: "Nombre" },
                { key: "precio", label: "Precio unit." },
                { key: "categoria", label: "Categoría" },
                { key: "badges", label: "Badges" },
                { key: "estado", label: "Estado" },
                { key: "agotado", label: "Agotado", align: "center" },
                { key: "media", label: "Media" },
                { key: "acciones", label: "Acciones" },
              ]}
              rows={rows}
              minWidth="1500px"
              loading={loading}
              loadingText="Cargando productos..."
              emptyIcon={<Package size={32} />}
              emptyText={
                search || selectedCategory
                  ? "Sin resultados para esa búsqueda"
                  : viewMode === "completos"
                    ? "Ningún producto tiene galería y video completos aún"
                    : viewMode === "incompletos"
                      ? "Todos los productos tienen media completa"
                      : "No hay productos aún"
              }
              renderRow={(p) => {
                        const hasImg = (p.imgCount ?? 0) > 0;
                        const hasVid = (p.vidCount ?? 0) > 0;
                        const incomplete = !hasImg || !hasVid;

                        return (
                          <tr
                            key={p.id}
                            className={`ap-row ${incomplete && viewMode === "incompletos" ? "ap-row--incomplete" : ""}`}
                          >
                            {/* Imagen miniatura */}
                            <td className="ap-td" style={{ width: 52 }}>
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt=""
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid #e0e0e0",
                                    display: "block",
                                  }}
                                  onError={(e) =>
                                    (e.target as HTMLImageElement).style
                                      .display === "none"
                                      ? null
                                      : ((
                                          e.target as HTMLImageElement
                                        ).style.display = "none")
                                  }
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: "#f0f0f0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Package
                                    size={16}
                                    style={{ color: "#ccc" }}
                                  />
                                </div>
                              )}
                            </td>

                            {/* Código */}
                            <td className="ap-td">
                              <code
                                style={{
                                  background: "#f5f5f5",
                                  padding: "2px 7px",
                                  borderRadius: 4,
                                  fontSize: ".78rem",
                                  color: "#555",
                                }}
                              >
                                {p.code}
                              </code>
                            </td>

                            {/* Nombre */}
                            <td
                              className="ap-td"
                              style={{
                                fontWeight: 600,
                                color: "#1a1a1a",
                                maxWidth: 220,
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

                            {/* Precio */}
                            <td
                              className="ap-td"
                              style={{ fontWeight: 600, whiteSpace: "nowrap" }}
                            >
                              S/ {p.price?.toFixed(2)}
                            </td>

                            {/* Categoría */}
                            <td className="ap-td">
                              <span
                                style={{
                                  background: "#f0f0f0",
                                  padding: "2px 8px",
                                  borderRadius: 20,
                                  fontSize: ".78rem",
                                  color: "#555",
                                }}
                              >
                                {getCategoryName(p.category)}
                              </span>
                            </td>

                            {/* Badges */}
                            <td className="ap-td">
                              <div
                                style={{
                                  display: "flex",
                                  gap: 4,
                                  flexWrap: "wrap",
                                }}
                              >
                                {p.featured && (
                                  <span
                                    className="ap-badge"
                                    style={{
                                      background: "#fff8e6",
                                      color: "#b07800",
                                      border: "1px solid #f5a62355",
                                    }}
                                  >
                                    Destacado
                                  </span>
                                )}
                                {p.is_new && (
                                  <span
                                    className="ap-badge"
                                    style={{
                                      background: "#e8f4ff",
                                      color: "#0066cc",
                                      border: "1px solid #0066cc33",
                                    }}
                                  >
                                    Nuevo
                                  </span>
                                )}
                                {p.low_stock && (
                                  <span
                                    className="ap-badge"
                                    style={{
                                      background: "#fff1f2",
                                      color: "#be123c",
                                      border: "1px solid #e11d4833",
                                    }}
                                  >
                                    Stock bajo
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Estado activo/inactivo */}
                            <td className="ap-td">
                              <span
                                className="ap-badge"
                                style={{
                                  background: p.activo ? "#e8f7ee" : "#fde8e8",
                                  color: p.activo ? "#1a7a3c" : "#a71d2a",
                                }}
                              >
                                {p.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>

                            {/* ── COLUMNA AGOTADO (nueva) ─────────────── */}
                            <td
                              className="ap-td"
                              style={{ textAlign: "center", width: 80 }}
                            >
                              <button
                                onClick={() => toggleAgotado(p)}
                                title={
                                  p.agotado
                                    ? "Marcar como disponible"
                                    : "Marcar como agotado"
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "2px 4px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  className={`ap-agotado-check ${p.agotado ? "ap-agotado-check--on" : ""}`}
                                >
                                  {p.agotado && (
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 12 12"
                                      fill="none"
                                    >
                                      <path
                                        d="M2 6l3 3 5-5"
                                        stroke="#fff"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </span>
                              </button>
                            </td>

                            {/* Media */}
                            <td className="ap-td">
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 6,
                                }}
                              >
                                {hasImg ? (
                                  <span className="ap-media-pip ap-media-pip--ok">
                                    <ImageIcon size={12} /> {p.imgCount}
                                  </span>
                                ) : (
                                  <span className="ap-media-pip ap-media-pip--empty">
                                    <ImageOff size={12} /> Sin fotos
                                  </span>
                                )}

                                {hasVid ? (
                                  <span className={`ap-media-pip ap-media-pip--vid-ok`}>
                                    <Video size={12} /> {p.vidCount}
                                  </span>
                                ) : (
                                  <span className="ap-media-pip ap-media-pip--empty">
                                    <VideoOff size={12} /> Sin videos
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Acciones */}
                            <td className="ap-td">
                              <div
                                style={{
                                  display: "flex",
                                  gap: 5,
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  className="ap-btn ap-btn--sm ap-btn--edit"
                                  onClick={() => onEdit(p)}
                                >
                                  <Pencil size={11} />
                                  Editar
                                </button>

                                <Link
                                  href={`/admin/productos/${p.id}/media`}
                                  className="ap-btn ap-btn--sm ap-btn--media"
                                  style={{ textDecoration: "none" }}
                                >
                                  <ImageIcon size={11} />
                                  Media
                                </Link>

                                <button
                                  className="ap-btn ap-btn--sm ap-btn--delete"
                                  onClick={() => onDelete(p.id)}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }}
              footer={
                <div className="ap-pager">
                  <span>
                    {totalCount === 0
                      ? "Sin resultados"
                      : `Mostrando ${startIndex + 1}–${Math.min(
                          startIndex + ITEMS_PER_PAGE,
                          totalCount,
                        )} de ${totalCount}`}
                  </span>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      className="ap-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page: number;

                      if (totalPages <= 7) page = i + 1;
                      else if (currentPage <= 4) page = i + 1;
                      else if (currentPage >= totalPages - 3)
                        page = totalPages - 6 + i;
                      else page = currentPage - 3 + i;

                      return (
                        <button
                          key={page}
                          className={`ap-page-btn ${currentPage === page ? "ap-page-btn--active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      className="ap-page-btn"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
