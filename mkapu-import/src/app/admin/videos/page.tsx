"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/lib/queries";

const initialForm = { title: "", descripcion: "", youtube_id: "", video_url: "", tipo: "video" as "video" | "vlog", thumbnail: "", activo: true };

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "0.875rem", background: "#fff", color: "#1a1a1a", outline: "none", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#888", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" };

export default function AdminVideosPage() {
  const [rows, setRows] = useState<Video[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<"" | "video" | "vlog">("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Título requerido");
    if (!form.youtube_id.trim() && !form.video_url.trim()) return alert("Ingresa un YouTube ID o URL de video");
    const payload = {
      title: form.title, descripcion: form.descripcion || null,
      youtube_id: form.youtube_id || null, video_url: form.video_url || null,
      tipo: form.tipo, thumbnail: form.thumbnail || null, activo: form.activo,
    };
    const { error } = editId
      ? await supabase.from("videos").update(payload).eq("id", editId)
      : await supabase.from("videos").insert(payload);
    if (error) return alert(error.message);
    setForm(initialForm); setEditId(null); setShowForm(false); load();
  }

  function onEdit(v: Video) {
    setEditId(v.id);
    setForm({
      title: v.title, descripcion: v.descripcion ?? "",
      youtube_id: v.youtube_id ?? "", video_url: v.video_url ?? "",
      tipo: v.tipo, thumbnail: v.thumbnail ?? "", activo: v.activo,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    load();
  }

  const filtered = filterTipo ? rows.filter((v) => v.tipo === filterTipo) : rows;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <style>{`.fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}.rh:hover{background:#fafafa!important}.be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}.bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}.bp:hover{background:#e69510!important}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>Videos</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>{rows.length} video{rows.length !== 1 ? "s" : ""} registrado{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="bp" onClick={() => { setShowForm(!showForm); if (showForm) { setEditId(null); setForm(initialForm); } }}
          style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo video"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "24px", marginBottom: "28px", borderTop: "3px solid #f5a623" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700 }}>{editId ? "Editar video" : "Nuevo video"}</h2>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>Título *</label>
                <input className="fi" style={inp} placeholder="Título del video" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Tipo</label>
                <select className="fi" style={inp} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as "video" | "vlog" })}>
                  <option value="video">Video</option>
                  <option value="vlog">Vlog</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", color: "#444", paddingBottom: "9px" }}>
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#f5a623" }} />
                  Activo
                </label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>YouTube ID</label>
                <input className="fi" style={inp} placeholder="ej: dQw4w9WgXcQ" value={form.youtube_id} onChange={(e) => setForm({ ...form, youtube_id: e.target.value })} />
                <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#aaa" }}>Extraído de la URL: youtube.com/watch?v=<strong>ID</strong></p>
              </div>
              <div>
                <label style={lbl}>URL de video (alternativa)</label>
                <input className="fi" style={inp} placeholder="https://..." value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={lbl}>Descripción</label>
                <textarea className="fi" style={{ ...inp, minHeight: "72px", resize: "vertical" }} placeholder="Descripción breve..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div>
                <label style={lbl}>Thumbnail (URL)</label>
                <input className="fi" style={inp} placeholder="https://... (opcional)" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
                {form.youtube_id && !form.thumbnail && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#aaa" }}>Se usará thumbnail de YouTube automáticamente.</p>
                )}
              </div>
            </div>

            {form.youtube_id && (
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Preview</label>
                <img src={`https://img.youtube.com/vi/${form.youtube_id}/mqdefault.jpg`} alt="thumb" style={{ height: 80, borderRadius: "8px", border: "1px solid #e0e0e0" }} />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="bp" style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                {editId ? "Guardar cambios" : "Crear video"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(initialForm); }}
                style={{ background: "#f0f0f0", color: "#555", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["", "video", "vlog"] as const).map((t) => (
          <button key={t} onClick={() => setFilterTipo(t)}
            style={{ padding: "7px 16px", borderRadius: "8px", border: filterTipo === t ? "2px solid #f5a623" : "1px solid #e0e0e0", background: filterTipo === t ? "#fff8e6" : "#fff", color: filterTipo === t ? "#f5a623" : "#666", fontWeight: filterTipo === t ? 700 : 500, cursor: "pointer", fontSize: "0.85rem" }}>
            {t === "" ? "Todos" : t === "video" ? "Videos" : "Vlogs"}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Cargando...</div> : (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                {["Thumb", "Título", "Tipo", "YouTube ID", "Estado", "Acciones"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No hay videos aún</td></tr>
              ) : filtered.map((v, i) => (
                <tr key={v.id} className="rh" style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {v.youtube_id ? (
                      <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt={v.title} style={{ width: 72, height: 44, objectFit: "cover", borderRadius: "6px" }} />
                    ) : <span style={{ color: "#ccc", fontSize: "0.8rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a", maxWidth: 260 }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                    {v.descripcion && <span style={{ fontSize: "0.78rem", color: "#999", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.descripcion}</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: v.tipo === "vlog" ? "#f0e8ff" : "#e8f0ff", color: v.tipo === "vlog" ? "#7c3aed" : "#2563eb" }}>
                      {v.tipo}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {v.youtube_id ? <code style={{ background: "#f5f5f5", padding: "2px 7px", borderRadius: "4px", fontSize: "0.8rem", color: "#444" }}>{v.youtube_id}</code> : <span style={{ color: "#ccc" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: v.activo ? "#e8f7ee" : "#fde8e8", color: v.activo ? "#1a7a3c" : "#a71d2a" }}>
                      {v.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="be" onClick={() => onEdit(v)} style={{ background: "rgba(0,123,255,0.08)", color: "#007bff", border: "1px solid rgba(0,123,255,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Editar</button>
                      <button className="bd" onClick={() => onDelete(v.id)} style={{ background: "rgba(220,53,69,0.08)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}