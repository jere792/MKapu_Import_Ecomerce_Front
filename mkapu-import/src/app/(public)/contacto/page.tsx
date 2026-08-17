"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/context/EmpresaContext";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

type EmpresaData = {
  direccion: string | null;
  whatsapp_soporte: string | null;
  email: string | null;
  horario_atencion: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
};

const contactIcons = {
  direccion: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A1.5 1.5 0 0 1 4.5 4h2.382a1 1 0 0 1 .894.553l1.276 2.553a1 1 0 0 1-.217 1.162L7.5 9.5s1 2 3 4 4 3 4 3l1.232-1.335a1 1 0 0 1 1.162-.217l2.553 1.276A1 1 0 0 1 20 17.118V19.5A1.5 1.5 0 0 1 18.5 21C9.94 21 3 14.06 3 5.5z" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0-9.75 6.75L2.25 6.75" />
    </svg>
  ),
  horario: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
    </svg>
  ),
};

const contactFields: { key: keyof EmpresaData; label: string; iconKey: keyof typeof contactIcons }[] = [
  { key: "direccion", label: "Dirección", iconKey: "direccion" },
  { key: "whatsapp_soporte", label: "Teléfono / WhatsApp", iconKey: "whatsapp" },
  { key: "email", label: "Email", iconKey: "email" },
  { key: "horario_atencion", label: "Horario", iconKey: "horario" },
];

const socialDefaults: { label: string; key: keyof EmpresaData }[] = [
  { label: "Instagram", key: "instagram_url" },
  { label: "Facebook", key: "facebook_url" },
  { label: "TikTok", key: "tiktok_url" },
];

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  TikTok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  ),
};

const socialColors: Record<string, string> = {
  Instagram: "linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
  Facebook: "#1877F2",
  TikTok: "#000000",
};

const shimmer = "bg-[linear-gradient(90deg,#2a2a2a_25%,#3a3a3a_50%,#2a2a2a_75%)] bg-[length:200%_100%] animate-[ctShimmer_1.4s_ease-in-out_infinite]";

export default function ContactoPage() {
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const { empresa, loaded } = useEmpresa();
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", asunto: "", mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/contacto")
      .single()
      .then(({ data }) => setBanner(data));
  }, []);

  const heroTitulo = banner?.titulo || "Contáctanos";
  const heroSub = banner?.subtitulo || "¿Tienes dudas sobre algún producto o quieres hacer un pedido especial? Escríbenos y te respondemos a la brevedad.";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  const contactInfo = contactFields
    .filter((f) => empresa?.[f.key])
    .map((f) => ({
      label: f.label,
      icon: contactIcons[f.iconKey],
      value: empresa![f.key]!,
    }));

  const socialLinks = socialDefaults
    .filter((s) => empresa?.[s.key])
    .map((s) => ({ label: s.label, href: empresa![s.key]! }));

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/notificar-contacto", {
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
      setEnviando(false);
      setEnviado(true);
    } catch {
      setErrorMsg("No se pudo conectar con el servidor. Verifica tu conexión.");
      setEnviando(false);
    }
  }

  return (
    <main className="bg-[#f8f7f4] min-h-screen">
      <section className="relative w-full min-h-[320px] flex items-center justify-center bg-[#1a1a1a] overflow-hidden max-[520px]:min-h-[240px]">
        {heroImg && <Image src={heroImg} alt={heroTitulo} fill priority className="object-cover object-center" />}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.6)_100%)] z-[1]" />
        <div className="relative z-[2] text-center px-6 pt-16 pb-14 max-w-[680px] max-[520px]:pt-12 max-[520px]:pb-10 max-[520px]:px-5">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.18em] uppercase text-brand mb-3 px-4 py-1.5 border border-[rgba(245,166,35,0.3)] rounded-full bg-[rgba(245,166,35,0.08)]">Estamos para ayudarte</span>
          <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-black text-white tracking-[-0.03em] mb-4 leading-[1.05]">{heroTitulo}</h1>
          <p className="text-[1.05rem] text-white/70 mx-auto leading-relaxed max-w-[520px]">{heroSub}</p>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 py-20 pb-[120px] max-[900px]:py-[60px] max-[900px]:px-5 max-[900px]:pb-20 max-[520px]:py-10 max-[520px]:px-3.5 max-[520px]:pb-[60px]">
        {/* ── FORMULARIO + LATERAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-6">
          <div className="bg-white rounded-[28px] border border-[#ede8e1] shadow-[0_10px_40px_rgba(78,52,24,0.07)] p-8 max-[520px]:p-5 max-[520px]:rounded-[20px]">
            {enviado ? (
              <div className="text-center px-4 py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#25d366]/10 flex items-center justify-center animate-[megaIn_0.3s_ease]">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-[1.4rem] font-black text-[#1a1a1a] mb-2">¡Mensaje enviado!</h3>
                <p className="text-[0.9rem] text-[#666] mb-8 leading-relaxed max-w-[340px] mx-auto">Gracias por contactarnos. Te responderemos pronto a tu correo.</p>
                <button onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" }); }} className="bg-brand text-white px-7 py-3 border-0 rounded-xl font-extrabold text-[0.9rem] cursor-pointer transition-colors hover:bg-[#d4891a]">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-10 h-10 rounded-xl bg-[rgba(245,166,35,0.1)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0-9.75 6.75L2.25 6.75" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-[1.3rem] font-black text-[#1a1a1a] leading-tight">Envíanos un mensaje</h2>
                    <p className="text-[0.8rem] text-[#888]">Completa el formulario y te responderemos lo antes posible.</p>
                  </div>
                </div>

                {errorMsg && <div className="bg-[#fee2e2] text-[#b91c1c] px-4 py-3 rounded-[10px] text-[0.85rem] border border-[#fca5a5]">{errorMsg}</div>}

                <div className="grid grid-cols-1 min-[521px]:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8rem] font-bold text-[#444] tracking-[0.02em]">Nombre *</label>
                    <input required name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" className="w-full px-4 py-3 text-base border-[1.5px] border-[#ddd] rounded-[10px] outline-none bg-[#fafafa] text-[#1a1a1a] font-inherit transition-colors focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8rem] font-bold text-[#444] tracking-[0.02em]">Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="999 000 000" className="w-full px-4 py-3 text-base border-[1.5px] border-[#ddd] rounded-[10px] outline-none bg-[#fafafa] text-[#1a1a1a] font-inherit transition-colors focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-bold text-[#444] tracking-[0.02em]">Email *</label>
                  <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="tucorreo@email.com" className="w-full px-4 py-3 text-base border-[1.5px] border-[#ddd] rounded-[10px] outline-none bg-[#fafafa] text-[#1a1a1a] font-inherit transition-colors focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-bold text-[#444] tracking-[0.02em]">Asunto</label>
                  <select name="asunto" value={form.asunto} onChange={handleChange} className="w-full px-4 py-3 text-base border-[1.5px] border-[#ddd] rounded-[10px] outline-none bg-[#fafafa] text-[#1a1a1a] font-inherit transition-colors focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] cursor-pointer">
                    <option value="">Seleccionar asunto...</option>
                    <option value="consulta">Consulta sobre producto</option>
                    <option value="pedido">Pedido especial</option>
                    <option value="garantia">Garantía / Postventa</option>
                    <option value="envio">Información de envío</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-bold text-[#444] tracking-[0.02em]">Mensaje *</label>
                  <textarea required name="mensaje" value={form.mensaje} onChange={handleChange} placeholder="Escribe tu mensaje aquí..." rows={5} className="w-full px-4 py-3 text-base border-[1.5px] border-[#ddd] rounded-[10px] outline-none bg-[#fafafa] text-[#1a1a1a] font-inherit transition-colors focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] resize-y min-h-[120px]" />
                </div>

                <button type="submit" disabled={enviando} className={`w-full py-4 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-black cursor-pointer transition-all tracking-[0.02em] hover:bg-[#d4891a] hover:-translate-y-px shadow-[0_8px_20px_rgba(245,166,35,0.3)] ${enviando ? "bg-[#ccc] cursor-not-allowed !translate-y-0 !shadow-none" : ""}`}>
                  {enviando ? "Enviando..." : "Enviar mensaje →"}
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {loaded && (empresa?.whatsapp_soporte ?? "").replace(/\D/g, "") && (
              <a
                href={`https://wa.me/${(empresa?.whatsapp_soporte ?? "").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden rounded-[24px] bg-[#1a1a1a] text-white p-7 border border-[#2a2a2a] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
              >
                <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[rgba(37,211,102,0.18)] blur-3xl" aria-hidden />
                <div className="relative flex flex-col gap-4">
                  <span className="w-14 h-14 rounded-2xl bg-[#25d366] flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] font-black mb-1">¿Prefieres atención directa?</h3>
                    <p className="text-[0.8rem] text-[#aaa] leading-relaxed mb-4">Escríbenos por WhatsApp y te respondemos al instante.</p>
                    <span className="inline-flex items-center gap-2 text-[0.85rem] font-extrabold text-[#25d366]">
                      Abrir chat
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            )}

            <div className="bg-white rounded-[24px] border border-[#ede8e1] p-7">
              <h3 className="text-[0.95rem] font-black text-[#1a1a1a] mb-4">Escríbenos en nuestras redes</h3>
              <div className="flex gap-3 flex-wrap">
                {loaded ? (
                  socialLinks.map((red) => (
                    <a
                      key={red.label}
                      href={red.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={red.label}
                      title={red.label}
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white no-underline transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.14)]"
                      style={{ background: socialColors[red.label] || "#1a1a1a" }}
                    >
                      {socialIcons[red.label]}
                    </a>
                  ))
                ) : (
                  [0, 1, 2].map((i) => (
                    <span key={i} className="w-12 h-12 rounded-xl bg-[linear-gradient(90deg,#eee_25%,#f5f5f5_50%,#eee_75%)] bg-[length:200%_100%] animate-[ctShimmer_1.4s_ease-in-out_infinite]" />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── TARJETAS DE CONTACTO ── */}
        {loaded ? (
          <div className="bg-white rounded-[24px] border border-[#ede8e1] shadow-[0_8px_32px_rgba(78,52,24,0.06)] grid grid-cols-1 min-[521px]:grid-cols-2 mt-12 overflow-hidden">
            {contactInfo.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 px-6 py-5 transition-colors hover:bg-[#faf6f1] ${
                  i === 0 || i === 1 ? "border-b border-[#ede8e1]" : ""
                } ${i % 2 === 0 ? "min-[521px]:border-r min-[521px]:border-[#ede8e1]" : ""}`}
              >
                <span className="shrink-0 w-11 h-11 flex items-center justify-center bg-[rgba(245,166,35,0.1)] rounded-xl">{item.icon}</span>
                <div className="min-w-0">
                  <div className="text-[0.68rem] font-black text-[#9b8f82] uppercase tracking-[0.14em] mb-1">{item.label}</div>
                  <div className="text-[0.9rem] font-bold text-[#1a1a1a] leading-relaxed whitespace-pre-line break-words">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-[#ede8e1] grid grid-cols-1 min-[521px]:grid-cols-2 mt-12 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-6 py-5 ${
                  i === 0 || i === 1 ? "border-b border-[#ede8e1]" : ""
                } ${i % 2 === 0 ? "min-[521px]:border-r min-[521px]:border-[#ede8e1]" : ""}`}
              >
                <span className={`shrink-0 w-11 h-11 rounded-xl ${shimmer}`} />
                <div className="flex flex-col gap-1.5">
                  <div className={`w-[70px] h-2.5 rounded ${shimmer}`} />
                  <div className={`w-[140px] h-3 rounded ${shimmer}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}