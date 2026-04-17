"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Package, AlertCircle, Home, LogOut, Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isLogin = pathname.includes("login");

  useEffect(() => {
    async function checkAuth() {
      if (isLogin) {
        setLoading(false);
        return;
      }

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
  }, [router, isLogin]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0f0f0f",
        fontSize: "1rem",
        color: "#f5a623",
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}>
        <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>Cargando...</span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const menuItems = [
    { name: "Productos", icon: Package, href: "/admin/productos" },
    { name: "Reclamaciones", icon: AlertCircle, href: "/admin/reclamos" },
  ];

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .admin-layout { display: flex; height: 100vh; overflow: hidden; background: #0f0f0f; }
        aside::-webkit-scrollbar { display: none; }
        .main-content::-webkit-scrollbar { display: none; }
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 10px 12px; color: #666; text-decoration: none; transition: all 0.2s; border-left: 3px solid transparent; border-radius: 0 8px 8px 0; font-size: 0.9rem; }
        .nav-link:hover { background: rgba(245,166,35,0.08); color: #f5a623; border-left-color: rgba(245,166,35,0.4); }
        .nav-link.active { background: rgba(245,166,35,0.12); color: #f5a623; border-left-color: #f5a623; }
        .btn-store { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 9px 12px; background: rgba(0,123,255,0.15); color: #4da3ff; border: 1px solid rgba(0,123,255,0.3); border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .btn-store:hover { background: rgba(0,123,255,0.25); border-color: rgba(0,123,255,0.5); }
        .btn-logout { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 9px 12px; background: rgba(220,53,69,0.12); color: #ff6b7a; border: 1px solid rgba(220,53,69,0.25); border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
        .btn-logout:hover { background: rgba(220,53,69,0.22); border-color: rgba(220,53,69,0.45); }
        .menu-toggle:hover { background: rgba(245,166,35,0.1); border-radius: 8px; }
      `}</style>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? "240px" : "64px",
          background: "#141414",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          overflowY: "auto",
          overflowX: "hidden",
          borderRight: "1px solid #222",
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{
            padding: sidebarOpen ? "20px 16px 18px" : "20px 0 18px",
            textAlign: "center",
            fontWeight: 800,
            fontSize: sidebarOpen ? "1rem" : "0.75rem",
            color: "#f5a623",
            borderBottom: "1px solid #222",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {sidebarOpen ? "Panel Admin" : "PA"}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}
                  title={!sidebarOpen ? item.name : undefined}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer buttons */}
          <div style={{ padding: "12px 8px 16px", borderTop: "1px solid #222", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/" className="btn-store" title={!sidebarOpen ? "Ir a tienda" : undefined}>
              <Home size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && "Ir a tienda"}
            </Link>
            <button onClick={logout} className="btn-logout" title={!sidebarOpen ? "Salir" : undefined}>
              <LogOut size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && "Salir"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f7f7f5" }}>
          {/* Topbar */}
          <div style={{
            background: "#fff",
            padding: "0 20px",
            height: "56px",
            borderBottom: "1px solid #e8e8e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#333", padding: "8px", display: "flex", alignItems: "center", transition: "all 0.2s" }}
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.01em" }}>
              Panel de Administración
            </span>
            <div style={{ width: "36px" }} />
          </div>

          {/* Content */}
          <div className="main-content" style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}