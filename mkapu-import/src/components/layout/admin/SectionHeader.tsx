"use client";

import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function SectionHeader({
  title,
  icon,
  description,
  actions,
  children,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        marginBottom: "1.5rem",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid #ececec",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {icon && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "rgba(245,166,35,0.12)",
                color: "#f5a623",
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
          )}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
              }}
            >
              {title}
            </h1>
            {description && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#888",
                  margin: "0.25rem 0 0",
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {actions}
          </div>
        )}
      </div>

      {children && <div style={{ marginTop: "1rem" }}>{children}</div>}
    </div>
  );
}
