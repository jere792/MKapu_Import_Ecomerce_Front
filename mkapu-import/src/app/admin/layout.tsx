"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Toast from "@/components/Toast";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import AdminTopbar from "@/components/layout/admin/AdminTopbar";
import AdminBreadcrumbs from "@/components/layout/admin/AdminBreadcrumbs";
import { AppModalProvider } from "@/context/AppModalContext";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const adminId = localStorage.getItem("admin_id");

      if (!adminId) {
        if (isMounted) router.push("/login");
        return;
      }

      const { data: empleado } = await supabase
        .from("empleados")
        .select("id, activo")
        .eq("id", Number(adminId))
        .single();

      if (!isMounted) return;

      if (!empleado || !empleado.activo) {
        localStorage.removeItem("admin_id");
        localStorage.removeItem("admin_nombre");
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f0f0f",
          fontSize: "1rem",
          color: "#f5a623",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
          Cargando...
        </span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AppModalProvider>
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
        .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 998; }
        @media (max-width: 900px) {
          .admin-content { padding: 16px !important; }
          .admin-topbar { padding: 0 12px !important; }
        }
      `}</style>

      <div className="admin-layout">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <AdminSidebar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pathname={pathname}
        />

        {/* Main */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#f7f7f5",
            marginLeft: isMobile ? 0 : undefined,
          }}
        >
          <AdminTopbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            pathname={pathname}
          />

          <AdminBreadcrumbs pathname={pathname} />

          {/* Content */}
          <div
            className="main-content admin-content"
            style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}
          >
            {children}
          </div>
        </main>
      </div>
      <Toast />
    </AppModalProvider>
  );
}