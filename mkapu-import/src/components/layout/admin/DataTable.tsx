"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn[];
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
  minWidth?: number | string;
  loading?: boolean;
  loadingText?: string;
  emptyNode?: ReactNode;
  emptyText?: string;
  emptyIcon?: ReactNode;
  footer?: ReactNode;
  banner?: ReactNode;
  pageSize?: number;
}

const thStyle: CSSProperties = {
  padding: "0.85rem 1rem",
  textAlign: "left",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

export default function DataTable<T>({
  columns,
  rows,
  renderRow,
  minWidth = "640px",
  loading = false,
  loadingText = "Cargando...",
  emptyNode,
  emptyText = "Sin registros",
  emptyIcon,
  footer,
  banner,
  pageSize,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = pageSize
    ? Math.max(1, Math.ceil(rows.length / pageSize))
    : 1;
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = pageSize ? (safePage - 1) * pageSize : 0;
  const visibleRows = pageSize
    ? rows.slice(pageStart, pageStart + pageSize)
    : rows;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes dt-spin { to { transform: rotate(360deg); } }`}</style>
      {banner}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "3rem 0",
            color: "#aaa",
            fontSize: "0.9rem",
          }}
        >
          <Loader2
            size={20}
            style={{ color: "#f5a623", animation: "dt-spin 0.8s linear infinite" }}
          />
          {loadingText}
        </div>
      ) : rows.length === 0 && emptyNode ? (
        emptyNode
      ) : (
        <>
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth,
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
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      style={{ ...thStyle, textAlign: c.align ?? "left" }}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "#aaa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          color: "#ccc",
                        }}
                      >
                        {emptyIcon}
                        <span style={{ fontSize: "0.9rem" }}>{emptyText}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, i) => renderRow(row, pageStart + i))
                )}
              </tbody>
            </table>
          </div>
          {footer}
          {pageSize && rows.length > 0 && (
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
                Mostrando {pageStart + 1}–
                {Math.min(pageStart + pageSize, rows.length)} de {rows.length}
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
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#666",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: safePage === 1 ? "not-allowed" : "pointer",
                    opacity: safePage === 1 ? 0.4 : 1,
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
                          safePage === page
                            ? "2px solid #f5a623"
                            : "1px solid #e0e0e0",
                        borderRadius: "6px",
                        background: safePage === page ? "#fff8e6" : "#fff",
                        color: safePage === page ? "#f5a623" : "#666",
                        fontSize: "0.8rem",
                        fontWeight: safePage === page ? 700 : 600,
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={safePage === totalPages}
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
                      safePage === totalPages ? "not-allowed" : "pointer",
                    opacity: safePage === totalPages ? 0.4 : 1,
                  }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}