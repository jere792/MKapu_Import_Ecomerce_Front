"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { Pencil, Trash2, Eye, EyeOff, CheckCircle, Users } from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  created_at: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  activo: boolean;
}

const FORM_INICIAL: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  activo: true,
};

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

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchEmpleados();
  }, []);

  async function fetchEmpleados() {
    setLoading(true);
    const { data } = await supabase
      .from("empleados")
      .select("id, nombre, apellido, email, activo, created_at")
      .order("created_at", { ascending: false });

    setEmpleados(data ?? []);
    setLoading(false);
  }

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setError("");
    setShowPassword(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function abrirEditar(emp: Empleado) {
    setEditando(emp);
    setForm({
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      password: "",
      activo: emp.activo,
    });
    setError("");
    setShowPassword(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function guardar(e: React.FormEvent) {
    if (!confirm("¿Guardar estos cambios?")) return;
    e.preventDefault();
    setError("");

    if (!form.nombre || !form.email) {
      setError("Nombre y email son obligatorios.");
      return;
    }

    if (!editando && !form.password) {
      setError("La contraseña es obligatoria al crear un empleado.");
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        const updates: Partial<Empleado & { password: string }> = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          activo: form.activo,
        };

        if (form.password.trim()) {
          updates.password = await bcrypt.hash(form.password, 10);
        }

        const { error: err } = await supabase
          .from("empleados")
          .update(updates)
          .eq("id", editando.id);

        if (err) throw err;
      } else {
        const hash = await bcrypt.hash(form.password, 10);

        const { error: err } = await supabase.from("empleados").insert({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: hash,
          activo: form.activo,
        });

        if (err) throw err;
      }

      cancelForm();
      await fetchEmpleados();
      setSuccessMsg(editando ? "Empleado actualizado correctamente" : "Empleado creado correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al guardar.";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (
      !confirm("¿Eliminar este empleado? Esta acción no se puede deshacer.")
    ) {
      return;
    }

    await supabase.from("empleados").delete().eq("id", id);
    await fetchEmpleados();
  }

  async function toggleActivo(emp: Empleado) {
    await supabase
      .from("empleados")
      .update({ activo: !emp.activo })
      .eq("id", emp.id);

    await fetchEmpleados();
  }

  function cancelForm() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setShowForm(false);
    setError("");
    setShowPassword(false);
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
        title="Empleados"
        icon={<Users size={18} />}
        description="Gestiona los accesos al panel de administración"
        actions={
          <button
            onClick={() => {
              if (showForm) {
                cancelForm();
              } else {
                abrirCrear();
              }
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#d4891a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f5a623")}
          >
            {showForm ? "✕ Cancelar" : "+ Nuevo empleado"}
          </button>
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
            {editando ? "Editar empleado" : "Nuevo empleado"}
          </h2>

          {error && (
            <div
              style={{
                background: "#fff5f5",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                padding: "0.8rem 1rem",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={guardar}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Nombre *</label>
                <input
                  style={inp}
                  placeholder="Juan"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                />
              </div>

              <div>
                <label style={lbl}>Apellido</label>
                <input
                  style={inp}
                  placeholder="Pérez"
                  value={form.apellido}
                  onChange={(e) =>
                    setForm({ ...form, apellido: e.target.value })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Email *</label>
              <input
                type="email"
                style={inp}
                placeholder="empleado@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>
                Contraseña {editando ? "(dejar vacío para no cambiar)" : "*"}
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ ...inp, paddingRight: "2.5rem" }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required={!editando}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#444",
                  flexWrap: "wrap",
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

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={guardando}
                style={{
                  background: guardando ? "#e0b97a" : "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: guardando ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  opacity: guardando ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!guardando) e.currentTarget.style.background = "#d4891a";
                }}
                onMouseLeave={(e) => {
                  if (!guardando) e.currentTarget.style.background = "#f5a623";
                }}
              >
                {guardando
                  ? "Guardando..."
                  : editando
                    ? "Guardar cambios"
                    : "Crear empleado"}
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

      {!showForm && (
        <DataTable
        columns={[
          { key: "nombre", label: "Nombre" },
          { key: "email", label: "Email" },
          { key: "estado", label: "Estado" },
          { key: "creado", label: "Creado" },
          { key: "acciones", label: "Acciones" },
        ]}
        rows={empleados}
        pageSize={10}
        minWidth="760px"
        loading={loading}
        loadingText="Cargando empleados..."
        emptyText="No hay empleados registrados."
        renderRow={(emp, i) => (
          <tr
            key={emp.id}
            style={{
              borderBottom:
                i < empleados.length - 1 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <td
              style={{
                padding: "0.9rem 1rem",
                fontWeight: 600,
                color: "#1a1a1a",
                fontSize: "0.9rem",
                minWidth: 220,
              }}
            >
              {emp.nombre} {emp.apellido}
            </td>

            <td
              style={{
                padding: "0.9rem 1rem",
                color: "#555",
                fontSize: "0.875rem",
                minWidth: 240,
              }}
            >
              {emp.email}
            </td>

            <td
              style={{
                padding: "0.9rem 1rem",
                whiteSpace: "nowrap",
              }}
            >
              <button
                onClick={() => toggleActivo(emp)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background: emp.activo
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                  color: emp.activo ? "#16a34a" : "#dc2626",
                  transition: "all 0.2s",
                }}
              >
                {emp.activo ? "Activo" : "Inactivo"}
              </button>
            </td>

            <td
              style={{
                padding: "0.9rem 1rem",
                color: "#aaa",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              }}
            >
              {new Date(emp.created_at).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </td>

            <td
              style={{
                padding: "0.9rem 1rem",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => abrirEditar(emp)}
                  title="Editar"
                  style={{
                    background: "rgba(245,166,35,0.1)",
                    color: "#f5a623",
                    border: "1px solid rgba(245,166,35,0.18)",
                    padding: "6px 10px",
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
                  onClick={() => eliminar(emp.id)}
                  title="Eliminar"
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,53,69,0.2)",
                    borderRadius: "6px",
                    padding: "6px",
                    cursor: "pointer",
                    color: "#dc2626",
                    display: "flex",
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
        )}
      />
      )}

    </div>
  );
}
