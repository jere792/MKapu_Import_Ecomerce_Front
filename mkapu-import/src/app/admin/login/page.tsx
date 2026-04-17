"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("No tienes permisos de administrador.");
      setLoading(false);
      return;
    }

    router.push("/admin/productos");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5 0%, #fff 100%)",
        padding: "1rem",
        backgroundImage: `url('https://res.cloudinary.com/dxuk9bogw/image/upload/v1775939505/ebb81f5c-ffd5-40c8-9b4f-6b0de4dd9bd4.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
          padding: "3rem 2.5rem",
          maxWidth: "420px",
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: "0 0 0.5rem",
            }}
          >
            Admin Login
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#666",
              margin: 0,
            }}
          >
            Accede a tu panel de control
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee",
              border: "1px solid #f5a623",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              color: "#c33",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "1.25rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "0.5rem",
              }}
            >
              Usuario
            </label>
            <input
              type="email"
              placeholder="Ingresa tu usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#f5a623";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(245, 166, 35, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#333",
                marginBottom: "0.5rem",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#f5a623";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(245, 166, 35, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "#f5a623",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.85rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#b77c1b";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(245, 166, 35, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f5a623";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #eee",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#666",
          }}
        >
          ¿Olvidaste tu contraseña?{" "}
          <Link
            href="/"
            style={{
              color: "#f5a623",
              textDecoration: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Contacta soporte
          </Link>
        </div>
      </div>
    </div>
  );
}