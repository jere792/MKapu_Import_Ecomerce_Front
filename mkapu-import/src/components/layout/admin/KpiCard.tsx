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
        border: "1px solid #efefef",
        borderRadius: "14px",
        padding: "1.2rem 1.3rem",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      {icon && (
        <span
          style={{
            position: "absolute",
            top: "-8px",
            right: "-6px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            color,
            opacity: 0.12,
            transform: "rotate(-8deg)",
          }}
        >
          {icon}
        </span>
      )}
      <p
        style={{
          position: "relative",
          margin: 0,
          fontSize: "2.2rem",
          fontWeight: 800,
          color: "#1a1a1a",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          position: "relative",
          margin: "8px 0 0",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#9a9a9a",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </p>
    </div>
  );
}