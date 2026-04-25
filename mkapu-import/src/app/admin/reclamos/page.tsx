"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
  pendiente:  { label: "Pendiente",   bg: "#fde8e8", color: "#a71d2a", dot: "#dc3545" },
  en_proceso: { label: "En proceso",  bg: "#fff8e6", color: "#7a5000", dot: "#f5a623" },
  resuelto:   { label: "Resuelto",    bg: "#e8f7ee", color: "#1a7a3c", dot: "#28a745" },
};

export default function AdminReclamacionesPage() {
  const [rows, setRows] = useState<Reclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selected, setSelected] = useState<Reclamacion | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Estadísticas globales (contadores)
  const [stats, setStats] = useState({
    todos: 0,
    pendiente: 0,
    en_proceso: 0,
    resuelto: 0,
  });

  // Función para cargar los contadores sin descargar los datos (muy rápido)
  const loadStats = async () => {
    try {
      const [all, pend, proc, res] = await Promise.all([
        supabase.from("reclamaciones").select("*", { count: "exact", head: true }),
        supabase.from("reclamaciones").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
        supabase.from("reclamaciones").select("*", { count: "exact", head: true }).eq("estado", "en_proceso"),
        supabase.from("reclamaciones").select("*", { count: "exact", head: true }).eq("estado", "resuelto"),
      ]);

      setStats({
        todos: all.count || 0,
        pendiente: pend.count || 0,
        en_proceso: proc.count || 0,
        resuelto: res.count || 0,
      });
    } catch (err) {
      console.error("Error cargando estadísticas", err);
    }
  };

  // Reset a la página 1 cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado]);

  // Cargar datos paginados
  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reclamaciones")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filterEstado !== "todos") {
      query = query.eq("estado", filterEstado);
    }

    // Calcular rangos
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    query = query.range(from, to);

    const { data, count, error } = await query;
    
    if (error) {
      alert(error.message);
    } else {
      setRows((data as Reclamacion[]) || []);
      setTotalItems(count || 0);
    }
    setLoading(false);
  }, [filterEstado, currentPage, itemsPerPage]);

  // Cargar estadísticas y datos iniciales
  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateEstado(id: number, nuevoEstado: string) {
    const { error } = await supabase.from("reclamaciones").update({ estado: nuevoEstado }).eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      load(); // Recarga la tabla
      loadStats(); // Recarga los contadores
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
      }
    }
  }

  const estadoInfo = (estado: string) => ESTADOS[estado as keyof typeof ESTADOS] ?? ESTADOS.pendiente;

  // Cálculos para la UI del paginador
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <style>{`
        .filter-btn { padding: 7px 16px; border-radius: 20px; border: 1px solid #e0e0e0; background: #fff; color: #666; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .filter-btn:hover { border-color: #f5a623; color: #f5a623; }
        .filter-btn.active { background: #f5a623; border-color: #f5a623; color: #fff; }
        .row-hover:hover { background: #fafafa !important; cursor: pointer; }
        .estado-select { padding: 5px 10px; border-radius: 20px; border: none; font-size: 0.78rem; font-weight: 700; cursor: pointer; outline: none; }
        .btn-ver:hover { background: rgba(0,123,255,0.15) !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-box { background: #fff; border-radius: 16px; width: 100%; max-width: 540px; overflow: hidden; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>Reclamaciones</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>
            Gestiona y responde los tickets de clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { key: "todos",      label: "Total",      color: "#555",    bg: "#f5f5f5" },
          { key: "pendiente",  label: "Pendientes", color: "#a71d2a", bg: "#fde8e8" },
          { key: "en_proceso", label: "En proceso", color: "#7a5000", bg: "#fff8e6" },
          { key: "resuelto",   label: "Resueltos",  color: "#1a7a3c", bg: "#e8f7ee" },
        ].map(s => (
          <div key={s.key} style={{ background: s.bg, borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: s.color, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "1.75rem", fontWeight: 800, color: s.color }}>
              {stats[s.key as keyof typeof stats]}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { value: "todos",      label: "Todas" },
          { value: "pendiente",  label: "Pendientes" },
          { value: "en_proceso", label: "En proceso" },
          { value: "resuelto",   label: "Resueltas" },
        ].map(f => (
          <button key={f.value} className={`filter-btn ${filterEstado === f.value ? "active" : ""}`}
            onClick={() => setFilterEstado(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: "0.875rem" }}>Cargando...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: "0.875rem" }}>No hay reclamaciones con este filtro</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                  {["Ticket", "Cliente", "Email", "Tipo", "Estado", "Fecha", "Acción"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const es = estadoInfo(r.estado);
                  return (
                    <tr key={r.id} className="row-hover" onClick={() => setSelected(r)}
                      style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff", transition: "background 0.1s" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{ background: "#fff8e6", color: "#b07800", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "monospace", fontWeight: 700 }}>
                          {r.ticket}
                        </code>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>
                        {r.nombres} {r.apellidos}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#666" }}>{r.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#f0f0f0", color: "#444", padding: "2px 8px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>
                          {r.tipo}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                        <select
                          className="estado-select"
                          value={r.estado || "pendiente"}
                          onChange={e => updateEstado(r.id, e.target.value)}
                          style={{ background: es.bg, color: es.color }}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En proceso</option>
                          <option value="resuelto">Resuelto</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#999", whiteSpace: "nowrap" }}>
                        {new Date(r.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                        <button className="btn-ver" onClick={() => setSelected(r)} style={{
                          background: "rgba(0,123,255,0.08)", color: "#007bff",
                          border: "1px solid rgba(0,123,255,0.2)", padding: "5px 14px",
                          borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.15s",
                        }}>
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginador visual en el Footer de la tabla */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid #e8e8e8", background: "#fafafa", fontSize: "0.875rem", color: "#666", flexWrap: "wrap", gap: "12px" }}>
              <div>
                Mostrando {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: "6px", background: currentPage === 1 ? "#f5f5f5" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, fontSize: "0.8rem", fontWeight: 600, transition: "all 0.15s" }}
                >
                  ← Anterior
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{ padding: "6px 10px", border: currentPage === page ? "2px solid #f5a623" : "1px solid #e0e0e0", borderRadius: "6px", background: currentPage === page ? "#fff8e6" : "#fff", color: currentPage === page ? "#f5a623" : "#666", fontWeight: currentPage === page ? 700 : 600, cursor: "pointer", fontSize: "0.8rem", transition: "all 0.15s" }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  style={{ padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: "6px", background: currentPage === totalPages || totalPages === 0 ? "#f5f5f5" : "#fff", cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer", opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, fontSize: "0.8rem", fontWeight: 600, transition: "all 0.15s" }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal detalle */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <code style={{ background: "#fff8e6", color: "#b07800", padding: "3px 10px", borderRadius: "4px", fontSize: "0.85rem", fontFamily: "monospace", fontWeight: 700 }}>
                  {selected.ticket}
                </code>
                <p style={{ margin: "6px 0 0", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>
                  {selected.nombres} {selected.apellidos}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "#f0f0f0", border: "none", borderRadius: "6px", width: 32, height: 32, cursor: "pointer", fontSize: "1rem", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "DNI",      value: selected.dni },
                  { label: "Teléfono", value: selected.telefono },
                  { label: "Email",    value: selected.email },
                  { label: "Tipo",     value: selected.tipo },
                  { label: "Fecha",    value: new Date(selected.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }) },
                ].map(f => (
                  <div key={f.label} style={{ background: "#f7f7f5", borderRadius: "8px", padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</p>
                    <p style={{ margin: "3px 0 0", fontSize: "0.875rem", color: "#1a1a1a", fontWeight: 500 }}>{f.value || "—"}</p>
                  </div>
                ))}
                <div style={{ background: "#f7f7f5", borderRadius: "8px", padding: "10px 14px" }}>
                  <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</p>
                  <select
                    className="estado-select"
                    value={selected.estado}
                    onChange={e => updateEstado(selected.id, e.target.value)}
                    style={{ background: estadoInfo(selected.estado).bg, color: estadoInfo(selected.estado).color, marginTop: "4px" }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em" }}>Descripción</p>
                <div style={{ background: "#f7f7f5", borderRadius: "8px", padding: "14px", fontSize: "0.875rem", color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selected.descripcion || "Sin descripción"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
