"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  AlertCircle,
  Home,
  LogOut,
  Tag,
  Users,
  Video,
  Image,
  FileText,
  FolderTree,
  Info,
  LayoutDashboard,
  Percent,
  Building2,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Productos", icon: Package, href: "/admin/productos" },
  { name: "Promociones", icon: Percent, href: "/admin/promociones" },
  { name: "Marcas", icon: Tag, href: "/admin/marcas" },
  { name: "Colaboradores", icon: Users, href: "/admin/colaboradores" },
  { name: "Videos", icon: Video, href: "/admin/videos" },
  { name: "Reclamaciones", icon: AlertCircle, href: "/admin/reclamos" },
  { name: "Empleados", icon: Users, href: "/admin/empleados" },
  { name: "Banners", icon: Image, href: "/admin/banners" },
  { name: "Blog", icon: FileText, href: "/admin/blog" },
  { name: "Categorías", icon: FolderTree, href: "/admin/categorias" },
  { name: "Sobre Nosotros", icon: Info, href: "/admin/sobre-nosotros" },
  { name: "Secciones Home", icon: LayoutDashboard, href: "/admin/home" },
];

interface AdminSidebarProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pathname: string;
}

export default function AdminSidebar({
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  pathname,
}: AdminSidebarProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [empresaLogo, setEmpresaLogo] = useState<string>("");

  useEffect(() => {
    setUserName(localStorage.getItem("admin_nombre") || "");
  }, []);

  useEffect(() => {
    fetch("/api/empresa")
      .then((res) => (res.ok ? res.json() : null))
      .then((row) => {
        if (row?.logo) setEmpresaLogo(row.logo);
      })
      .catch(() => {});
  }, []);

  function logout() {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_nombre");
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: isMobile ? (sidebarOpen ? "280px" : "0px") : (sidebarOpen ? "240px" : "64px"),
        background: "#141414",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        overflow: "hidden",
        borderRight: isMobile && !sidebarOpen ? "none" : "1px solid #222",
        flexShrink: 0,
        position: isMobile ? "fixed" : "static",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 999,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: isMobile ? "20px 16px 14px" : (sidebarOpen ? "20px 16px 14px" : "20px 0 14px"),
          textAlign: "center",
          borderBottom: isMobile || sidebarOpen ? "1px solid #222" : "none",
          whiteSpace: "nowrap",
          visibility: isMobile || sidebarOpen ? "visible" : "hidden",
        }}
      >
        {isMobile || sidebarOpen ? (
          <img
            src={empresaLogo}
            alt="MKAPU"
            style={{ height: "38px", maxWidth: "100%", objectFit: "contain" }}
          />
        ) : (
          <span style={{ fontWeight: 800, fontSize: "0.75rem", color: "#f5a623", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            PA
          </span>
        )}
      </div>

      {/* Close button on mobile */}
      {isMobile && sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "absolute",
            top: "18px",
            right: "12px",
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={18} />
        </button>
      )}

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: isMobile || sidebarOpen ? "12px 8px" : "12px 4px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          opacity: isMobile || sidebarOpen ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "active" : ""}`}
              title={!sidebarOpen && !isMobile ? item.name : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {(sidebarOpen || isMobile) && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer buttons */}
      <div
        style={{
          padding: isMobile || sidebarOpen ? "12px 8px 16px" : "12px 4px 16px",
          borderTop: isMobile || sidebarOpen ? "1px solid #222" : "none",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          opacity: isMobile || sidebarOpen ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        <Link
          href="/admin/empresa"
          className={`nav-link ${pathname === "/admin/empresa" ? "active" : ""}`}
          title={!sidebarOpen && !isMobile ? "Configuración de empresa" : undefined}
          style={{ borderRadius: "8px", borderLeft: "none" }}
        >
          <Building2 size={18} style={{ flexShrink: 0 }} />
          {(sidebarOpen || isMobile) && "Configuración de empresa"}
        </Link>
        <Link
          href="/"
          className="btn-store"
          title={!sidebarOpen && !isMobile ? "Ir a tienda" : undefined}
        >
          <Home size={16} style={{ flexShrink: 0 }} />
          {(sidebarOpen || isMobile) && "Ir a tienda"}
        </Link>
        <button
          onClick={logout}
          className="btn-logout"
          title={!sidebarOpen && !isMobile ? "Salir" : undefined}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {(sidebarOpen || isMobile) && "Salir"}
        </button>

        {isMobile || sidebarOpen ? (
          <div
            style={{
              padding: "12px 8px 4px",
              borderTop: "1px solid #222",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(245,166,35,0.15)",
                color: "#f5a623",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {userName ? userName.charAt(0).toUpperCase() : "?"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#f5a623",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userName || "Administrador"}
              </div>
              <div style={{ fontSize: "0.65rem", color: "#888" }}>Administrador</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "none" }} />
        )}
      </div>
    </aside>
  );
}