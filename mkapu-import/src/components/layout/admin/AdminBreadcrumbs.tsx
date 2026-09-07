"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

function getSegments(
  pathname: string,
  productCode: string | null,
  productId: string | null,
): { label: string; href: string }[] {
  if (pathname === "/admin") return [{ label: "Panel", href: "/admin" }];

  const parts = pathname.split("/").filter(Boolean); // ["admin", "productos", ...]

  const segments: { label: string; href: string }[] = [];
  for (let i = 1; i < parts.length; i++) {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const key = "/" + parts.slice(0, i + 1).join("/");
    let label: string;
    if (
      productId &&
      productCode &&
      parts[i] === productId &&
      parts[i - 1] === "productos"
    ) {
      label = productCode;
    } else if (
      productId &&
      parts[i] === productId &&
      parts[i - 1] === "productos"
    ) {
      label = `Producto #${productId}`;
    } else {
      label =
        LABELS[key] ??
        parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    segments.push({ label, href });
  }

  return segments;
}

export default function AdminBreadcrumbs({ pathname }: AdminBreadcrumbsProps) {
  const [productCode, setProductCode] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const isProductoRoute =
      parts.length >= 3 && parts[0] === "admin" && parts[1] === "productos";
    const candidateId = isProductoRoute ? parts[2] : null;
    const isNumericId = candidateId ? /^\d+$/.test(candidateId) : false;

    if (!isNumericId || !candidateId) {
      setProductId(null);
      setProductCode(null);
      return;
    }

    if (productId === candidateId && productCode !== null) return;

    setProductId(candidateId);
    setProductCode(null);

    let cancelled = false;
    supabase
      .from("productos")
      .select("code")
      .eq("id", Number(candidateId))
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.code) setProductCode(data.code as string);
        else setProductCode(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, productId, productCode]);

  const segments = getSegments(pathname, productCode, productId);

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
