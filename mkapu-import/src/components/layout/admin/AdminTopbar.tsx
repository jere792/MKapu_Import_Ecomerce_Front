"use client";

import Link from "next/link";
import { Menu, Building2 } from "lucide-react";

interface AdminTopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pathname: string;
}

export default function AdminTopbar({
  sidebarOpen,
  setSidebarOpen,
  pathname,
}: AdminTopbarProps) {
  return (
    <div
      className="admin-topbar"
      style={{
        background: "#fff",
        padding: "0 20px",
        height: "56px",
        borderBottom: "1px solid #e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#333",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s",
        }}
      >
        <Menu size={20} />
      </button>
      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#1a1a1a",
          letterSpacing: "0.01em",
        }}
      >
        Panel de Administración
      </span>
      <Link
        href="/admin/empresa"
        title="Configurar empresa"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          color: pathname === "/admin/empresa" ? "#f5a623" : "#999",
          background: pathname === "/admin/empresa" ? "rgba(245,166,35,0.1)" : "transparent",
          transition: "all 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          if (pathname !== "/admin/empresa") {
            e.currentTarget.style.background = "rgba(245,166,35,0.08)";
            e.currentTarget.style.color = "#f5a623";
          }
        }}
        onMouseLeave={(e) => {
          if (pathname !== "/admin/empresa") {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#999";
          }
        }}
      >
        <Building2 size={20} />
      </Link>
    </div>
  );
}