"use client";

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
}: DataTableProps<T>) {
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
                  rows.map((row, i) => renderRow(row, i))
                )}
              </tbody>
            </table>
          </div>
          {footer}
        </>
      )}
    </div>
  );
}