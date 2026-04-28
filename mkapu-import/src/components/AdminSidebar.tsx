"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const menuItems = [
  { name: "Productos", icon: "📦", href: "/admin/productos" },
  { name: "Marcas", icon: "🏷️", href: "/admin/marcas" },
  { name: "Colaboradores", icon: "🤝", href: "/admin/colaboradores" },
  { name: "Videos", icon: "🎬", href: "/admin/videos" },
  { name: "Reclamaciones", icon: "📋", href: "/admin/reclamos" },
  { name: "Usuarios", icon: "👥", href: "/admin/usuarios" },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/admin/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (!profile || profile.role !== "admin") {
        router.push("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (loading || !isAuthenticated) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <aside
        style={{
          width: sidebarOpen ? "250px" : "70px",
          background: "#1a1a1a",
          color: "#fff",
          padding: "1.5rem 0",
          transition: "width 0.3s ease",
          height: "calc(100vh - 72px)",
          overflowY: "auto",
          borderRight: "1px solid #333",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "1.5rem 1rem",
            marginBottom: "1rem",
            textAlign: "center",
            fontSize: sidebarOpen ? "1rem" : "0.8rem",
            fontWeight: 700,
            color: "#f5a623",
            borderBottom: "1px solid #333",
            wordBreak: "break-word",
          }}
        >
          {sidebarOpen ? "Panel Admin" : "PA"}
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            padding: "0 0.5rem",
          }}
        >
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.875rem 1rem",
                  color: active ? "#f5a623" : "#aaa",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  background: active ? "rgba(245,166,35,0.15)" : "transparent",
                  borderLeft: active
                    ? "3px solid #f5a623"
                    : "3px solid transparent",
                  fontSize: sidebarOpen ? "0.95rem" : "1.2rem",
                  borderRadius: "0 8px 8px 0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,166,35,0.1)";
                  e.currentTarget.style.color = "#f5a623";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = active
                    ? "rgba(245,166,35,0.15)"
                    : "transparent";
                  e.currentTarget.style.color = active ? "#f5a623" : "#aaa";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "1rem 0.5rem",
            marginTop: "auto",
            borderTop: "1px solid #333",
          }}
        >
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: sidebarOpen ? "0.85rem" : "0.7rem",
              fontWeight: 600,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c82333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#dc3545";
            }}
          >
            <span>🚪</span>
            {sidebarOpen && "Salir"}
          </button>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          left: sidebarOpen ? "250px" : "70px",
          top: "72px",
          background: "#f5a623",
          color: "#fff",
          border: "none",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 999,
          transition: "left 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
        }}
      >
        {sidebarOpen ? "«" : "»"}
      </button>
    </>
  );
}
