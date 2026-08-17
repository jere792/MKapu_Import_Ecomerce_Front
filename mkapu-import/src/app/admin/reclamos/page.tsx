"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, ChevronLeft, CheckCircle, AlertCircle, Inbox, Clock3, Timer, CircleCheck } from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import KpiCard from "@/components/layout/admin/KpiCard";
import DataTable from "@/components/layout/admin/DataTable";

type Reclamacion = {
  id: number;
  ticket: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: string;
  descripcion: string;
  estado: string;
  created_at: string;
};

const ESTADOS = {
  pendiente: { label: "Pendiente", bg: "#fff7ed", color: "#c2410c" },
  en_proceso: { label: "En proceso", bg: "#fffbeb", color: "#b45309" },
  resuelto: { label: "Resuelto", bg: "#f0fdf4", color: "#15803d" },
};

function estadoInfo(estado: string) {
  return ESTADOS[estado as keyof typeof ESTADOS] ?? ESTADOS.pendiente;
}

export default function AdminReclamacionesPage() {
  const [rows, setRows] = useState<Reclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selected, setSelected] = useState<Reclamacion | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    todos: 0,
    pendiente: 0,
    en_proceso: 0,
    resuelto: 0,
  });

  async function loadStats() {
    const [all, pend, proc, res] = await Promise.all([
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pendiente"),
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "en_proceso"),
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "resuelto"),
    ]);

    setStats({
      todos: all.count || 0,
      pendiente: pend.count || 0,
      en_proceso: proc.count || 0,
      resuelto: res.count || 0,
    });
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado]);

  useEffect(() => {
    loadStats();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("reclamaciones")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filterEstado !== "todos") {
      query = query.eq("estado", filterEstado);
    }

    const from = (currentPage - 1) * itemsPerPage;
    query = query.range(from, from + itemsPerPage - 1);

    const { data, count, error } = await query;

    if (!error) {
      setRows((data as Reclamacion[]) || []);
      setTotalItems(count || 0);
    }

    setLoading(false);
  }, [filterEstado, currentPage]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateEstado(id: number, nuevoEstado: string) {
    const { error } = await supabase
      .from("reclamaciones")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (!error) {
      load();
      loadStats();
      setSuccessMsg("Estado actualizado correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);

      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
      }
    }
  }

  function onVer(r: Reclamacion) {
    setSelected(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onBack() {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

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
      {selected ? (
        <>
            <SectionHeader
            title="Detalle de reclamación"
            icon={<AlertCircle size={18} />}
            description={
              <code
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  background: "#fff8e6",
                  color: "#b07800",
                  padding: "2px 10px",
                  borderRadius: "4px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                {selected.ticket}
              </code>
            }
            actions={
              <button
                onClick={onBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "0.65rem 1rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                <ChevronLeft size={16} /> Volver
              </button>
            }
          />

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderTop: "3px solid #f5a623",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}
                >
                  {selected.nombres} {selected.apellidos}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.85rem",
                    color: "#888",
                  }}
                >
                  {selected.email}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                  }}
                >
                  Cambiar estado
                </label>

                <select
                  value={selected.estado}
                  onChange={(e) => updateEstado(selected.id, e.target.value)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "20px",
                    border: "none",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: estadoInfo(selected.estado).bg,
                    color: estadoInfo(selected.estado).color,
                  }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {[
                  { label: "DNI", value: selected.dni },
                  { label: "Teléfono", value: selected.telefono },
                  { label: "Tipo", value: selected.tipo },
                  {
                    label: "Fecha",
                    value: new Date(selected.created_at).toLocaleDateString(
                      "es-PE",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    ),
                  },
                  {
                    label: "Estado actual",
                    value: estadoInfo(selected.estado).label,
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    style={{
                      background: "#f7f7f5",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {f.label}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.875rem",
                        color: "#1a1a1a",
                        fontWeight: 500,
                      }}
                    >
                      {f.value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Descripción
                </p>

                <div
                  style={{
                    background: "#f7f7f5",
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#333",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selected.descripcion || "Sin descripción"}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <SectionHeader
            title="Reclamaciones"
            icon={<AlertCircle size={18} />}
            description="Gestiona y responde los tickets de clientes"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <KpiCard
              label="Total"
              value={stats.todos}
              color="#1a1a1a"
              icon={<Inbox size={18} />}
            />
            <KpiCard
              label="Pendientes"
              value={stats.pendiente}
              color="#c2410c"
              icon={<Clock3 size={18} />}
            />
            <KpiCard
              label="En proceso"
              value={stats.en_proceso}
              color="#b45309"
              icon={<Timer size={18} />}
            />
            <KpiCard
              label="Resueltos"
              value={stats.resuelto}
              color="#15803d"
              icon={<CircleCheck size={18} />}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "todos", label: "Todas" },
              { value: "pendiente", label: "Pendientes" },
              { value: "en_proceso", label: "En proceso" },
              { value: "resuelto", label: "Resueltas" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterEstado(f.value)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  border:
                    filterEstado === f.value ? "none" : "1px solid #e0e0e0",
                  background: filterEstado === f.value ? "#f5a623" : "#fff",
                  color: filterEstado === f.value ? "#fff" : "#666",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <DataTable
            columns={[
              { key: "ticket", label: "Ticket" },
              { key: "cliente", label: "Cliente" },
              { key: "email", label: "Email" },
              { key: "tipo", label: "Tipo" },
              { key: "estado", label: "Estado" },
              { key: "fecha", label: "Fecha" },
              { key: "acciones", label: "" },
            ]}
            rows={rows}
            minWidth="980px"
            loading={loading}
            loadingText="Cargando..."
            emptyText="No hay reclamaciones con este filtro"
            footer={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderTop: "1px solid #e8e8e8",
                  background: "#fafafa",
                  fontSize: "0.875rem",
                  color: "#888",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <span>
                  Mostrando {totalItems === 0 ? 0 : startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, totalItems)} de{" "}
                  {totalItems}
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      background: "#fff",
                      color: "#666",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.4 : 1,
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
                          background:
                            currentPage === page ? "#fff8e6" : "#fff",
                          color: currentPage === page ? "#f5a623" : "#666",
                          fontSize: "0.8rem",
                          fontWeight: currentPage === page ? 700 : 600,
                          cursor: "pointer",
                        }}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      background: "#fff",
                      color: "#666",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor:
                        currentPage === totalPages
                          ? "not-allowed"
                          : "pointer",
                      opacity: currentPage === totalPages ? 0.4 : 1,
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            }
            renderRow={(r, i) => {
              const es = estadoInfo(r.estado);

              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom:
                      i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                  onClick={() => onVer(r)}
                >
                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <code
                      style={{
                        background: "#fff8e6",
                        color: "#b07800",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {r.ticket}
                    </code>
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      fontSize: "0.9rem",
                      minWidth: 220,
                    }}
                  >
                    {r.nombres} {r.apellidos}
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      color: "#666",
                      fontSize: "0.875rem",
                      minWidth: 240,
                    }}
                  >
                    {r.email}
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
                        padding: "2px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: "#f0f0f0",
                        color: "#555",
                      }}
                    >
                      {r.tipo}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={r.estado || "pendiente"}
                      onChange={(e) =>
                        updateEstado(r.id, e.target.value)
                      }
                      style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        border: "none",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: es.bg,
                        color: es.color,
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      color: "#aaa",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(r.created_at).toLocaleDateString(
                      "es-PE",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </td>

                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onVer(r)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(245,166,35,0.1)",
                        color: "#f5a623",
                        border: "1px solid rgba(245,166,35,0.18)",
                        padding: "5px 12px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Eye size={12} /> Ver
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        </>
      )}
    </div>
  );
}
