"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Marca } from "@/lib/queries";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import {
  PlusCircle,
  X,
  CheckCircle,
  Upload,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";

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

export default function AdminMarcasPage() {
  const [rows, setRows] = useState<Marca[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("marcas")
      .select("*")
      .order("orden", { ascending: true });

    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setLogoName("");
  }

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `marcas/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!confirm("¿Guardar estos cambios?")) return;

    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.logo_url.trim()) return alert("Sube un logo para la marca");

    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      activo: form.activo,
      orden: form.orden,
    };

    const { error } = editId
      ? await supabase.from("marcas").update(payload).eq("id", editId)
      : await supabase.from("marcas").insert(payload);

    if (error) return alert(error.message);

    setSuccessMsg(editId ? "Marca actualizada correctamente" : "Marca creada correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    resetForm();
    await load();
  }

  function onEdit(m: Marca) {
    setEditId(m.id);
    setForm({
      name: m.name,
      logo_url: m.logo_url ?? "",
      activo: m.activo,
      orden: m.orden,
    });
    setLogoName(m.logo_url ? "Logo ya subido" : "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar marca?")) return;
    await supabase.from("marcas").delete().eq("id", id);
    await load();
  }

  async function persistOrder(list: Marca[]) {
    setSavingOrder(true);

    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));

    setRows(reordered);

    await Promise.all(
      reordered.map((item) =>
        supabase.from("marcas").update({ orden: item.orden }).eq("id", item.id),
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
        title="Marcas"
        icon={<Tag size={18} />}
        description="Gestiona las marcas de tus productos"
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
                <PlusCircle size={15} /> Nueva marca
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
            {editId ? "Editar marca" : "Nueva marca"}
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
                  placeholder="Nombre de la marca"
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

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                    <PlusCircle size={15} /> Crear marca
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
        </div>
      )}

      {!showForm &&
        (loading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#aaa",
            }}
          >
            Cargando marcas...
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "logo", label: "Logo" },
              { key: "nombre", label: "Nombre" },
              { key: "orden", label: "Orden" },
              { key: "estado", label: "Estado" },
              { key: "acciones", label: "Acciones" },
            ]}
            rows={rows}
            minWidth="860px"
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
            emptyIcon={<Tag size={32} />}
            emptyText="No hay marcas aún"
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
                {rows.length} marca{rows.length !== 1 ? "s" : ""} registrada
                {rows.length !== 1 ? "s" : ""}
              </div>
            }
            renderRow={(m, i) => (
              <tr
                key={m.id}
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
                    {m.logo_url ? (
                      <img
                        src={m.logo_url}
                        alt={m.name}
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
                    minWidth: 240,
                  }}
                >
                  {m.name}
                </td>

                <td
                  style={{
                    padding: "0.9rem 1rem",
                    minWidth: 150,
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
                      {m.orden}
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

                <td
                  style={{
                    padding: "0.9rem 1rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: m.activo
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                      color: m.activo ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
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
                      onClick={() => onEdit(m)}
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
                      onClick={() => onDelete(m.id)}
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
            )}
          />
        ))}

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
