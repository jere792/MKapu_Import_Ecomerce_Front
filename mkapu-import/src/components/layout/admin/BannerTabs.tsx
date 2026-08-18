"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image as ImageIcon, LayoutGrid } from "lucide-react";

export default function BannerTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/banners", label: "Carrusel", icon: <ImageIcon size={14} /> },
    {
      href: "/admin/banners/config",
      label: "Banners de páginas",
      icon: <LayoutGrid size={14} />,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        borderBottom: "2px solid #ebebeb",
        marginTop: "1rem",
        gap: "0.25rem",
      }}
    >
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "0.6rem 1.4rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              background: "transparent",
              color: active ? "#f5a623" : "#999",
              borderBottom: active
                ? "2px solid #f5a623"
                : "2px solid transparent",
              marginBottom: "-2px",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {t.icon}
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}