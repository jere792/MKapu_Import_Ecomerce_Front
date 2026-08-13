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
        <div className="grid grid-cols-1 min-[901px]:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-5">
            <div className="bg-[#1a1a1a] rounded-[20px] p-8 text-white border border-[#2a2a2a] max-[520px]:p-6">
              <h2 className="text-[1.15rem] font-extrabold mb-6 text-brand">Información de contacto</h2>
              {loaded ? (
                contactInfo.map((item) => (
                  <div key={item.label} className="flex gap-3.5 mb-5 last:mb-0">
                    <span className="mt-0.5 shrink-0 w-9 h-9 flex items-center justify-center bg-[rgba(245,166,35,0.1)] rounded-[10px]">{item.icon}</span>
                    <div>
                      <div className="text-[0.7rem] font-bold text-[#888] uppercase tracking-[0.08em] mb-0.5">{item.label}</div>
                      <div className="text-[0.92rem] text-[#ddd] leading-relaxed whitespace-pre-line">{item.value}</div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3.5 mb-5 opacity-60">
                      <span className={`mt-0.5 shrink-0 w-9 h-9 rounded-[10px] ${shimmer}`} />
                      <div>
                        <div className={`w-[60px] h-2.5 rounded mb-1.5 ${shimmer}`} />
                        <div className={`w-[180px] h-3.5 rounded ${shimmer}`} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#ede8e1] p-6">
              <p className="text-[0.85rem] font-bold text-[#444] mb-3">Síguenos en redes</p>
              <div className="flex gap-2.5 flex-wrap">
                {loaded ? (
                  socialLinks.map((red) => (
                    <a key={red.label} href={red.href} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#f8f7f4] border border-[#ede8e1] rounded-lg text-[0.8rem] font-bold text-[#444] no-underline transition-colors hover:bg-brand hover:text-white hover:border-brand">
                      {red.label}
                    </a>
                  ))
                ) : (
                  <>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="inline-block w-20 h-8 rounded-lg bg-[linear-gradient(90deg,#eee_25%,#f5f5f5_50%,#eee_75%)] bg-[length:200%_100%] animate-[ctShimmer_1.4s_ease-in-out_infinite]" />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#ede8e1] p-8 shadow-[0_8px_32px_rgba(78,52,24,0.06)] max-[520px]:p-6">
            {enviado ? (
              <div className="text-center px-4 py-10">
                <h3 className="text-[1.25rem] font-extrabold text-[#1a1a1a] mb-2">¡Mensaje enviado!</h3>
                <p className="text-[0.9rem] text-[#666] mb-6 leading-relaxed">Gracias por contactarnos. Te responderemos pronto a tu correo.</p>
                <button onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" }); }} className="bg-brand text-white px-6 py-2.5 border-0 rounded-[10px] font-bold text-[0.9rem] cursor-pointer transition-colors hover:bg-[#d4891a]">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 className="text-[1.2rem] font-extrabold text-[#1a1a1a] mb-1">Envíanos un mensaje</h2>

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

                <button type="submit" disabled={enviando} className={`w-full py-3.5 bg-brand text-white border-0 rounded-xl text-[0.95rem] font-extrabold cursor-pointer transition-all tracking-[0.02em] hover:bg-[#d4891a] hover:-translate-y-px ${enviando ? "bg-[#ccc] cursor-not-allowed !translate-y-0" : ""}`}>
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