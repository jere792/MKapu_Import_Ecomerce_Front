"use client";
import { useState } from "react";

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg("");

    try {
      console.log("Enviando petición a /api/notificar-contacto...");
      
      const res = await fetch("/api/notificar-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const textData = await res.text();
      
      if (!res.ok) {
        console.error("Error del servidor:", textData);
        setErrorMsg("Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo más tarde.");
        setEnviando(false);
        return;
      }

      console.log("Mensaje enviado exitosamente.");
      setEnviando(false);
      setEnviado(true);

    } catch (err) {
      console.error("Error de red o AdBlocker:", err);
      setErrorMsg("No se pudo conectar con el servidor. Verifica tu conexión o desactiva tu bloqueador de anuncios.");
      setEnviando(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    fontSize: "0.92rem",
    border: "1.5px solid #ddd",
    borderRadius: "10px",
    outline: "none",
    background: "#fafafa",
    color: "#1a1a1a",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#444",
    marginBottom: "0.4rem",
    letterSpacing: "0.02em",
  };

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* HERO */}
      <section
        style={{
          background: "#1a1a1a",
          borderBottom: "3px solid #f5a623",
          padding: "3.5rem 1.5rem 3rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#f5a623",
            marginBottom: "0.75rem",
          }}
        >
          Estamos para ayudarte
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}
        >
          Contáctanos
        </h1>
        <p style={{ fontSize: "1rem", color: "#999", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
          ¿Tienes dudas sobre algún producto o quieres hacer un pedido especial?
          Escríbenos y te respondemos a la brevedad.
        </p>
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* INFO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div
              style={{
                background: "#1a1a1a",
                borderRadius: "16px",
                padding: "2rem",
                color: "#fff",
                border: "1px solid #2a2a2a",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1.5rem", color: "#f5a623" }}>
                Información de contacto
              </h2>
              {[
                { icon: "📍", label: "Dirección", value: "Lima, Perú" },
                { icon: "📞", label: "Teléfono / WhatsApp", value: "+51 999 999 999" },
                { icon: "📧", label: "Email", value: "ventas@mkapu.pe" },
                { icon: "🕘", label: "Horario", value: "Lun–Vie: 9am – 6pm\nSáb: 9am – 1pm" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.1rem" }}>
                  <span style={{ fontSize: "1.1rem", marginTop: "2px" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#ddd", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #ede8e1",
                padding: "1.5rem",
              }}
            >
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#444", marginBottom: "0.75rem" }}>
                Síguenos en redes
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {[
                  { label: "Instagram", href: "https://www.instagram.com/mkapu.import" },
                  { label: "Facebook", href: "https://www.facebook.com/mkapu.peru/?locale=es_LA" },
                  { label: "TikTok", href: "https://www.tiktok.com/@mkapu.import" },
                ].map((red) => (
                  <a
                    key={red.label}
                    href={red.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.45rem 0.9rem",
                      background: "#f8f7f4",
                      border: "1px solid #ede8e1",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#444",
                      textDecoration: "none",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#f5a623";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.borderColor = "#f5a623";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#f8f7f4";
                      (e.currentTarget as HTMLElement).style.color = "#444";
                      (e.currentTarget as HTMLElement).style.borderColor = "#ede8e1";
                    }}
                  >
                    {red.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* FORMULARIO */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #ede8e1",
              padding: "2rem",
            }}
          >
            {enviado ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.5rem" }}>
                  ¡Mensaje enviado!
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
                  Gracias por contactarnos. Te responderemos pronto a tu correo.
                </p>
                <button
                  onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" }); }}
                  style={{
                    padding: "0.6rem 1.5rem",
                    background: "#f5a623",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 0.25rem" }}>
                  Envíanos un mensaje
                </h2>
                
                {errorMsg && (
                  <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", border: "1px solid #fca5a5" }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input required name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#f5a623")} onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="+51 999 999 999" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#f5a623")} onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="tucorreo@email.com" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#f5a623")} onBlur={(e) => (e.target.style.borderColor = "#ddd")} />
                </div>

                <div>
                  <label style={labelStyle}>Asunto</label>
                  <select name="asunto" value={form.asunto} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">Seleccionar asunto...</option>
                    <option value="consulta">Consulta sobre producto</option>
                    <option value="pedido">Pedido especial</option>
                    <option value="garantia">Garantía / Postventa</option>
                    <option value="envio">Información de envío</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Mensaje *</label>
                  <textarea
                    required
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#f5a623")}
                    onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  style={{
                    padding: "0.8rem",
                    background: enviando ? "#ccc" : "#f5a623",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    cursor: enviando ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {enviando ? "Enviando..." : "Enviar mensaje →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}