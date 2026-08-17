"use client";

import Link from "next/link";
import { Home } from "lucide-react";

interface AdminBreadcrumbsProps {
  pathname: string;
}

const LABELS: Record<string, string> = {
  "/admin/productos": "Productos",
  "/admin/promociones": "Promociones",
  "/admin/marcas": "Marcas",
  "/admin/colaboradores": "Colaboradores",
  "/admin/videos": "Videos",
  "/admin/reclamos": "Reclamaciones",
  "/admin/empleados": "Empleados",
  "/admin/banners": "Banners",
  "/admin/blog": "Blog",
  "/admin/categorias": "Categorías",
  "/admin/sobre-nosotros": "Sobre Nosotros",
  "/admin/home": "Secciones Home",
  "/admin/empresa": "Configuración de empresa",
};

function getSegments(pathname: string): { label: string; href: string }[] {
  if (pathname === "/admin") return [{ label: "Panel", href: "/admin" }];

  const parts = pathname.split("/").filter(Boolean); // ["admin", "productos", ...]

  const segments: { label: string; href: string }[] = [];
  for (let i = 1; i < parts.length; i++) {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const key = "/" + parts.slice(0, i + 1).join("/");
    const label =
      LABELS[key] ??
      parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    segments.push({ label, href });
  }

  return segments;
}

export default function AdminBreadcrumbs({ pathname }: AdminBreadcrumbsProps) {
  const segments = getSegments(pathname);

  if (segments.length === 0) return null;

  return (
    <div
      style={{
        background: "#fff",
        padding: "10px 32px",
        borderBottom: "1px solid #e8e8e8",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        flexShrink: 0,
      }}
    >
      <Link
        href="/"
        title="Ir a tienda"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#9ca3af",
          textDecoration: "none",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f5a623")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        <Home size={14} />
        Tienda
      </Link>

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        return (
          <span
            key={seg.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "#d1d5db", fontSize: "0.8rem" }}>/</span>
            {isLast ? (
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                {seg.label}
              </span>
            ) : (
              <Link
                href={seg.href}
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5a623")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#6b7280")
                }
              >
                {seg.label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
