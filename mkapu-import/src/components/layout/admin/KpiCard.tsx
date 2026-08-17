"use client";

import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: number;
  color: string;
  icon?: ReactNode;
}

export default function KpiCard({ label, value, color, icon }: KpiCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ececec",
        borderRadius: "14px",
        padding: "1rem 1.1rem",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: color,
          borderTopLeftRadius: 14,
          borderBottomLeftRadius: 14,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#8a8a8a",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "1.9rem",
              fontWeight: 800,
              color: color,
              lineHeight: 1,
            }}
          >
            {value}
          </p>
        </div>
        {icon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}