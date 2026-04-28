"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Marca } from "@/lib/queries";

const initialForm = { name: "", logo_url: "", activo: true, orden: 0 };

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "0.875rem", background: "#fff", color: "#1a1a1a", outline: "none", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#888", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" };

export default function AdminMarcasPage() {
  const [rows, setRows] = useState<Marca[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("marcas").select("*").order("orden", { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `marcas/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { alert("Error: " + error.message); return null; }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nombre requerido");
    const payload = { name: form.name, logo_url: form.logo_url || null, activo: form.activo, orden: form.orden };
    const { error } = editId
      ? await supabase.from("marcas").update(payload).eq("id", editId)
      : await supabase.from("marcas").insert(payload);
    if (error) return alert(error.message);
    setForm(initialForm); setEditId(null); setShowForm(false); load();
  }

  function onEdit(m: Marca) {
    setEditId(m.id);
    setForm({ name: m.name, logo_url: m.logo_url ?? "", activo: m.activo, orden: m.orden });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar marca?")) return;
    await supabase.from("marcas").delete().eq("id", id);
    load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
      <style>{`.fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}.rh:hover{background:#fafafa!important}.be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}.bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}.bp:hover{background:#e69510!important}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>Marcas</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>{rows.length} marca{rows.length !== 1 ? "s" : ""} registrada{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="bp" onClick={() => { setShowForm(!showForm); if (showForm) { setEditId(null); setForm(initialForm); } }}
          style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
          {showForm ? "✕ Cancelar" : "+ Nueva marca"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "24px", marginBottom: "28px", borderTop: "3px solid #f5a623" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700 }}>{editId ? "Editar marca" : "Nueva marca"}</h2>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>Nombre *</label>
                <input className="fi" style={inp} placeholder="Nombre de la marca" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Orden</label>
                <input className="fi" style={inp} type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", color: "#444", paddingBottom: "9px" }}>
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} style={{ width: 16, height: 16, accentColor: "#f5a623" }} />
                  Activo
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={lbl}>Logo</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input className="fi" style={{ ...inp, flex: 1 }} placeholder="URL o sube archivo..." value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "9px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  {uploading ? "Subiendo..." : "📁 Subir"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadLogo(file);
                    if (url) setForm((f) => ({ ...f, logo_url: url }));
                    if (fileRef.current) fileRef.current.value = "";
                  }} />
              </div>
              {form.logo_url && <img src={form.logo_url} alt="preview" style={{ marginTop: "8px", height: "56px", objectFit: "contain", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "4px", background: "#f9f9f9" }} />}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="bp" style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                {editId ? "Guardar cambios" : "Crear marca"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(initialForm); }}
                style={{ background: "#f0f0f0", color: "#555", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Cargando...</div> : (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                {["Logo", "Nombre", "Orden", "Estado", "Acciones"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No hay marcas aún</td></tr>
              ) : rows.map((m, i) => (
                <tr key={m.id} className="rh" style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {m.logo_url ? <img src={m.logo_url} alt={m.name} style={{ height: 40, objectFit: "contain", borderRadius: "6px" }} /> : <span style={{ color: "#ccc", fontSize: "0.8rem" }}>Sin logo</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>{m.name}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{m.orden}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: m.activo ? "#e8f7ee" : "#fde8e8", color: m.activo ? "#1a7a3c" : "#a71d2a" }}>
                      {m.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="be" onClick={() => onEdit(m)} style={{ background: "rgba(0,123,255,0.08)", color: "#007bff", border: "1px solid rgba(0,123,255,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Editar</button>
                      <button className="bd" onClick={() => onDelete(m.id)} style={{ background: "rgba(220,53,69,0.08)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Eliminar</button>
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