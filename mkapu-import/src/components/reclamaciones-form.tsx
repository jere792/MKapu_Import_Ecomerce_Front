"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type FormState = {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo: string;
  fecha_consumo: string;
  producto: string;
  monto: string;
  descripcion: string;
  pedido: string;
};

const INITIAL: FormState = {
  nombres: "",
  apellidos: "",
  dni: "",
  email: "",
  telefono: "",
  direccion: "",
  tipo: "queja",
  fecha_consumo: "",
  producto: "",
  monto: "",
  descripcion: "",
  pedido: "",
};

const inputClass = "bg-white border border-[#e0e0e0] rounded-[10px] px-3.5 py-2.5 text-[0.9rem] font-[DM_Sans,sans-serif] text-[#1a1a1a] outline-none transition-[border-color,box-shadow] duration-150 w-full placeholder:text-[#bbb] focus:border-brand focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]";

export default function ReclamacionesForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      if (
        !form.nombres || !form.apellidos || !form.dni || !form.email ||
        !form.telefono || !form.direccion || !form.descripcion || !form.pedido
      ) {
        setStatus("error");
        setErrorMsg("Por favor completa todos los campos requeridos.");
        return;
      }

      const { data, error } = await supabase
        .from("reclamaciones")
        .insert([
          {
            nombres: form.nombres.trim(),
            apellidos: form.apellidos.trim(),
            dni: form.dni.trim(),
            email: form.email.trim(),
            telefono: form.telefono.trim(),
            direccion: form.direccion.trim(),
            tipo: form.tipo,
            fecha_consumo: form.fecha_consumo || null,
            producto: form.producto.trim() || null,
            monto: form.monto ? Number(form.monto) : null,
            descripcion: form.descripcion.trim(),
            pedido: form.pedido.trim(),
          },
        ])
        .select();

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }

      const ticket = data?.[0]?.ticket;

      try {
        const emailRes = await fetch("/api/notificar-ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombres: form.nombres,
            apellidos: form.apellidos,
            email: form.email,
            tipo: form.tipo,
            ticket: ticket || "0000",
            dni: form.dni,
            direccion: form.direccion,
            telefono: form.telefono,
            producto: form.producto,
            monto: form.monto,
            descripcion: form.descripcion,
            pedido: form.pedido
          }),
        });

      } catch (err) {
        console.error("❌ Falló la petición a la API:", err);
      }

      setStatus("success");
    } catch (err) {
      console.error("Error:", err);
      setStatus("error");
      setErrorMsg("Ocurrió un error inesperado.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center px-8 py-16 max-w-[480px] mx-auto font-[DM_Sans,sans-serif]">
        <div className="w-[72px] h-[72px] rounded-full bg-[rgba(245,166,35,0.12)] flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-[Sora,sans-serif] text-[1.4rem] font-extrabold mb-2.5 text-[#1a1a1a]">Reclamación enviada</h2>
        <p className="text-[0.9rem] text-[#666] leading-[1.6] mb-5">
          Hemos registrado tu <strong>{form.tipo}</strong>. Te enviaremos un correo de confirmación a{" "}
          <strong>{form.email}</strong>.
        </p>
        <span className="inline-block bg-[rgba(245,166,35,0.1)] text-[#c47d0e] border border-[rgba(245,166,35,0.3)] rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold mb-8 tracking-[0.03em]">Respuesta en hasta 30 días hábiles</span>
        <button onClick={() => { setStatus("idle"); setForm(INITIAL); }} className="bg-transparent border-[1.5px] border-[#ddd] rounded-[10px] px-6 py-2.5 text-[0.88rem] font-semibold text-[#666] cursor-pointer transition-colors hover:border-brand hover:text-[#c47d0e]">
          Enviar otra reclamación
        </button>
      </div>
    );
  }

  return (
    <div className="font-[DM_Sans,sans-serif] max-w-[700px] mx-auto mt-12 px-6 pb-12 text-[#1a1a1a]">
      <div className="mb-10 relative pl-5 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brand before:rounded-[99px]">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand mb-1">mkapu import</div>
        <h1 className="font-[Sora,sans-serif] text-[1.75rem] font-extrabold leading-[1.2] text-[#1a1a1a] mb-2">Libro de Reclamaciones</h1>
        <p className="text-[0.88rem] text-[#666] leading-[1.6]">
          Completa el formulario y nos comunicaremos dentro de los plazos establecidos por la norma peruana.
        </p>
      </div>

      {status === "error" && (
        <div className="bg-[#fff0f0] border border-[#fca5a5] rounded-[10px] px-4 py-2.5 text-[0.85rem] text-[#b91c1c] mb-5">
          ⚠ {errorMsg || "Ocurrió un error. Intenta nuevamente."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Datos personales */}
        <div className="bg-[#f9f9f7] rounded-[16px] px-6 pt-6 pb-5 border border-[#ebebeb]">
          <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#999] mb-4 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
            </svg>
            Datos personales
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[520px]:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nombres" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Nombres <span className="text-brand ml-0.5">*</span></label>
              <input id="nombres" name="nombres" type="text" value={form.nombres} onChange={handleChange} required placeholder="Tus nombres" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="apellidos" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Apellidos <span className="text-brand ml-0.5">*</span></label>
              <input id="apellidos" name="apellidos" type="text" value={form.apellidos} onChange={handleChange} required placeholder="Tus apellidos" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dni" className="text-xs font-semibold text-[#555] tracking-[0.01em]">DNI <span className="text-brand ml-0.5">*</span></label>
              <input id="dni" name="dni" type="text" value={form.dni} onChange={handleChange} required placeholder="12345678" maxLength={8} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Email <span className="text-brand ml-0.5">*</span></label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="telefono" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Teléfono <span className="text-brand ml-0.5">*</span></label>
              <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} required placeholder="+51 999 999 999" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="direccion" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Dirección <span className="text-brand ml-0.5">*</span></label>
              <input id="direccion" name="direccion" type="text" value={form.direccion} onChange={handleChange} required placeholder="Tu dirección" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Tipo de reclamación */}
        <div className="bg-[#f9f9f7] rounded-[16px] px-6 pt-6 pb-5 border border-[#ebebeb]">
          <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#999] mb-4 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 2v8h12V4H2zm2 2h8v1H4V6zm0 2h5v1H4V8z" />
            </svg>
            Tipo de reclamación
          </div>
          <div className="grid grid-cols-2 gap-2.5 max-[520px]:grid-cols-1">
            {[
              { value: "queja", label: "Queja", desc: "Mala atención o servicio" },
              { value: "reclamo", label: "Reclamo", desc: "Producto o pedido con falla" },
            ].map((opt) => (
              <label key={opt.value} className={`relative flex flex-col items-center justify-center px-4 py-3 border-[1.5px] border-[#e0e0e0] rounded-xl cursor-pointer transition-all bg-white gap-1 overflow-hidden ${form.tipo === opt.value ? " border-brand bg-[rgba(245,166,35,0.06)]" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value={opt.value}
                  checked={form.tipo === opt.value}
                  onChange={handleChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                <span className={`font-semibold text-[0.88rem] transition-colors ${form.tipo === opt.value ? "text-[#c47d0e]" : "text-[#1a1a1a]"}`}>{opt.label}</span>
                <span className="text-[0.73rem] text-[#888] text-center">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="bg-[#f9f9f7] rounded-[16px] px-6 pt-6 pb-5 border border-[#ebebeb]">
          <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#999] mb-4 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1h10a1 1 0 0 1 1 1v1H2V2a1 1 0 0 1 1-1zM1 4h14v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4zm3 3v1h8V7H4zm0 2v1h5V9H4z" />
            </svg>
            Detalles del pedido
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[520px]:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pedido" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Número de pedido <span className="text-brand ml-0.5">*</span></label>
              <input id="pedido" name="pedido" type="text" value={form.pedido} onChange={handleChange} required placeholder="ORD-2024-001" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fecha_consumo" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Fecha de consumo</label>
              <input id="fecha_consumo" name="fecha_consumo" type="date" value={form.fecha_consumo} onChange={handleChange} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="producto" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Producto</label>
              <input id="producto" name="producto" type="text" value={form.producto} onChange={handleChange} placeholder="Nombre del producto" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="monto" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Monto (S/)</label>
              <input id="monto" name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} placeholder="0.00" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5 col-span-full">
              <label htmlFor="descripcion" className="text-xs font-semibold text-[#555] tracking-[0.01em]">Descripción detallada <span className="text-brand ml-0.5">*</span></label>
              <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} required rows={5} placeholder="Describe tu reclamación con el mayor detalle posible..." className={`${inputClass} resize-y min-h-[110px]`} />
            </div>
          </div>
        </div>

        <button type="submit" className="flex items-center justify-center gap-2 bg-brand text-white rounded-xl px-8 py-3.5 text-[0.95rem] font-[Sora,sans-serif] font-bold w-full transition-all hover:bg-[#d98e14] hover:-translate-y-px active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed" disabled={status === "loading"}>
          {status === "loading" ? (
            "Enviando..."
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.5 2L1 7.5l5 2 2 5 6.5-12.5z" />
              </svg>
              Enviar reclamación
            </>
          )}
        </button>

        <p className="text-center text-[0.75rem] text-[#aaa] leading-[1.5] [&_strong]:text-[#777]">
          Nos comprometemos a responder dentro de <strong>30 días hábiles</strong> según la norma peruana.
        </p>
      </form>
    </div>
  );
}