"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import { useAppModal } from "@/context/AppModalContext";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  PlusCircle,
  UserCog,
  X,
} from "lucide-react";

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmar: string;
  activo: boolean;
}

const FORM_INICIAL: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  confirmar: "",
  activo: true,
};

interface EmpleadoFormProps {
  mode: "create" | "edit";
  empleadoId?: number;
}

export default function EmpleadoForm({
  mode,
  empleadoId,
}: EmpleadoFormProps) {
  const router = useRouter();
  const { confirm } = useAppModal();

  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [loading, setLoading] = useState(mode === "edit");
  const [guardando, setGuardando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !empleadoId) return;
    supabase
      .from("empleados")
      .select("id, nombre, apellido, email, activo, created_at")
      .eq("id", empleadoId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          router.push("/admin/empleados");
          return;
        }
        setForm({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: "",
          confirmar: "",
          activo: data.activo,
        });
        setLoading(false);
      });
  }, [mode, empleadoId, router]);

  async function guardar(e: React.FormEvent, closeAfter = false) {
    e.preventDefault();
    const confirmed = await confirm({
      title: "¿Guardar estos cambios?",
      message: "Se guardarán los cambios realizados.",
      confirmText: "Guardar",
      cancelText: "Cancelar",
      variant: "primary",
    });
    if (!confirmed) return;
    setError("");

    if (!form.nombre || !form.email) {
      setError("Nombre y email son obligatorios.");
      return;
    }

    if (mode !== "edit") {
      if (!form.password) {
        setError("La contraseña es obligatoria al crear un empleado.");
        return;
      }
    }

    if (form.password.trim() !== form.confirmar.trim()) {
      setError("La contraseña y su confirmación no coinciden.");
      return;
    }

    setGuardando(true);

    try {
      if (mode === "edit" && empleadoId) {
        const updates: Record<string, unknown> = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          activo: form.activo,
        };

        if (form.password.trim()) {
          updates.password = await bcrypt.hash(form.password, 10);
        }

        const { error: err } = await supabase
          .from("empleados")
          .update(updates)
          .eq("id", empleadoId);

        if (err) throw err;
      } else {
        const hash = await bcrypt.hash(form.password, 10);

        const { error: err } = await supabase.from("empleados").insert({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: hash,
          activo: form.activo,
        });

        if (err) throw err;
      }

      setSuccessMsg(
        mode === "edit"
          ? "Empleado actualizado correctamente"
          : "Empleado creado correctamente",
      );
      setTimeout(() => setSuccessMsg(""), 3000);

      if (closeAfter) router.push("/admin/empleados");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al guardar.";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <style>{`
        .ap-inp{width:100%;padding:9px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:.875rem;background:#fff;color:#1a1a1a;outline:none;box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
        .ap-inp:focus{border-color:#f5a623;box-shadow:0 0 0 3px rgba(245,166,35,.12)}
        .ap-lbl{display:block;font-size:.7rem;font-weight:700;color:#aaa;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em}
        .ap-btn{display:inline-flex;align-items:center;gap:7px;border:none;border-radius:8px;font-weight:700;font-size:.875rem;cursor:pointer;padding:10px 20px;transition:background .15s,opacity .15s;text-decoration:none}
        .ap-btn--primary{background:#f5a623;color:#fff}
        .ap-btn--primary:hover{background:#e69510}
        .ap-btn--secondary{background:#f0f0f0;color:#555}
        .ap-btn--secondary:hover{background:#e6e6e6}
        .ap-btn--ghost{background:transparent;color:#888;border:1px solid #e0e0e0}
        .ap-btn--ghost:hover{background:#f5f5f5}
        .ap-btn--sm{padding:6px 12px;font-size:.8rem;border-radius:6px}
        .ap-card{background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .ap-fblock{background:#fafafa;border:1px solid #e8e8e8;border-radius:12px;padding:16px;margin-bottom:16px}
        .ap-fblock__title{margin:0 0 14px;font-size:.72rem;font-weight:800;color:#1a1a1a;text-transform:uppercase;letter-spacing:.08em;padding-bottom:10px;border-bottom:1px solid #e8e8e8}
        .ap-fsub{padding:12px;background:#fff;border:1px solid #eef0f2;border-radius:8px;margin-bottom:12px}
        .ap-fsub:last-child{margin-bottom:0}
        .ap-fsub__title{margin:0 0 12px;font-size:.68rem;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:.08em}
        .ap-toggle{display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:.875rem;color:#555;user-select:none}
        .ap-toggle input{display:none}
        .ap-toggle__slider{width:44px;height:24px;background:#e0e0e0;border-radius:12px;position:relative;transition:background .2s;flex-shrink:0}
        .ap-toggle__slider::after{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
        .ap-toggle input:checked+.ap-toggle__slider{background:#22c55e}
        .ap-toggle input:checked+.ap-toggle__slider::after{transform:translateX(20px)}
        @keyframes ap-spin{to{transform:rotate(360deg)}}
        .ap-spin{animation:ap-spin .8s linear infinite}
        @keyframes ap-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .ap-fadein{animation:ap-fadein .2s ease}
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          padding: "1.5rem 1.25rem 2.5rem",
          background: "#f8f7f4",
          minHeight: "100vh",
        }}
      >
        {successMsg && (
          <div
            style={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              zIndex: 9999,
              background: "#16a34a",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.875rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        <SectionHeader
          title={
            mode === "create" ? "Nuevo empleado" : `Editar empleado #${empleadoId}`
          }
          icon={<UserCog size={18} />}
          description="Gestiona los accesos al panel de administración"
          actions={
            <button
              className="ap-btn ap-btn--ghost ap-btn--sm"
              onClick={() => router.push("/admin/empleados")}
            >
              <ArrowLeft size={14} />
              Volver al listado
            </button>
          }
        />

        {loading ? (
          <div
            className="ap-card"
            style={{ textAlign: "center", padding: "60px 0", color: "#888" }}
          >
            <Loader2 size={28} className="ap-spin" style={{ marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: ".9rem" }}>Cargando empleado...</p>
          </div>
        ) : (
          <div className="ap-card ap-fadein">
            {error && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "0.8rem 1rem",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={(e) => guardar(e)}>
              <div className="ap-fblock">
                <h3 className="ap-fblock__title">Datos del empleado</h3>

                <div className="ap-fsub">
                  <h4 className="ap-fsub__title">Información básica</h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label className="ap-lbl">Nombre *</label>
                      <input
                        className="ap-inp"
                        placeholder="Juan"
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nombre: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="ap-lbl">Apellido</label>
                      <input
                        className="ap-inp"
                        placeholder="Pérez"
                        value={form.apellido}
                        onChange={(e) =>
                          setForm({ ...form, apellido: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <label className="ap-lbl" style={{ marginTop: 14 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    className="ap-inp"
                    placeholder="empleado@correo.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="ap-fsub">
                  <h4 className="ap-fsub__title">Credenciales</h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label className="ap-lbl">
                        Contraseña{" "}
                        {mode === "edit"
                          ? "(dejar vacío para no cambiar)"
                          : "*"}
                      </label>

                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="ap-inp"
                          style={{ paddingRight: "2.5rem" }}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                          }
                          required={mode !== "edit"}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#aaa",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="ap-lbl">
                        Confirmar contraseña{" "}
                        {mode === "edit" ? "" : "*"}
                      </label>

                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="ap-inp"
                          style={{ paddingRight: "2.5rem" }}
                          placeholder="••••••••"
                          value={form.confirmar}
                          onChange={(e) =>
                            setForm({ ...form, confirmar: e.target.value })
                          }
                          required={mode !== "edit"}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#aaa",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ap-fsub">
                  <h4 className="ap-fsub__title">Configuración</h4>
                  <label className="ap-toggle">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={(e) =>
                        setForm({ ...form, activo: e.target.checked })
                      }
                    />
                    <span className="ap-toggle__slider" />
                    <span>Activo</span>
                  </label>
                </div>
              </div>
            </form>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "flex-end",
                marginTop: "1.5rem",
              }}
            >
              <button
                type="button"
                className="ap-btn ap-btn--primary"
                onClick={(e) =>
                  guardar(e as unknown as React.FormEvent)
                }
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <Loader2 size={15} className="ap-spin" />
                    Guardando...
                  </>
                ) : mode === "create" ? (
                  <>
                    <PlusCircle size={15} />
                    Crear empleado
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Guardar cambios
                  </>
                )}
              </button>

              <button
                type="button"
                className="ap-btn ap-btn--secondary"
                onClick={(e) =>
                  guardar(e as unknown as React.FormEvent, true)
                }
                disabled={guardando}
              >
                <CheckCircle size={15} />
                Guardar y cerrar
              </button>

              <button
                type="button"
                className="ap-btn ap-btn--ghost ap-btn--sm"
                onClick={() => router.push("/admin/empleados")}
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}