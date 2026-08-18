"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, Users, PlusCircle } from "lucide-react";
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

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEmpleados() {
    setLoading(true);
    const { data } = await supabase
      .from("empleados")
      .select("id, nombre, apellido, email, activo, created_at")
      .order("created_at", { ascending: false });

    setEmpleados(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEmpleados();
  }, []);

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar este empleado? Esta acción no se puede deshacer.")) {
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

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <SectionHeader
        title="Empleados"
        icon={<Users size={18} />}
        description="Gestiona los accesos al panel de administración"
        actions={
          <Link
            href="/admin/empleados/nuevo"
            style={{
              display: "inline-flex",
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
              textDecoration: "none",
            }}
          >
            <PlusCircle size={15} /> Nuevo empleado
          </Link>
        }
      />

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
                <Link
                  href={`/admin/empleados/${emp.id}/editar`}
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
                >
                  <Pencil size={15} />
                </Link>

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
                    (e.currentTarget.style.background = "rgba(220,38,38,0.18)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(220,38,38,0.08)")
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}