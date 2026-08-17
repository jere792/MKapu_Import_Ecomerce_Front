"use client";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useEmpresa } from "@/context/EmpresaContext";

export default function MapaLocal() {
  const { empresa } = useEmpresa();
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    if (empresa?.direccion) setDireccion(empresa.direccion);
  }, [empresa]);

  const address = direccion || "San Juan de Lurigancho, Lima, Perú";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=17&output=embed`;

  return (
    <section className="py-20 px-6 bg-[#0d0d0d]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-[1fr_1.6fr] gap-12 items-center max-md:grid-cols-1 max-md:gap-8">
        <div>
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-3">Encuéntranos</span>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-black text-white m-0 mb-4 leading-[1.15]">Visita nuestra tienda</h2>
          <p className="flex items-center gap-2.5 text-[0.95rem] text-[#ccc] mb-3 font-semibold">
            <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-brand/15 text-brand">
              <MapPin size={18} />
            </span>
            {address}
          </p>
          <p className="text-[0.9rem] text-[#888] leading-[1.65] m-0 mb-7">
            Contamos con showroom para que puedas ver los equipos en persona
            antes de comprar.
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-[10px] font-bold text-[0.9rem] no-underline transition-colors hover:bg-[#d4891a]"
          >
            Cómo llegar →
          </a>
        </div>

        <div className="h-[400px] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)] max-md:h-[280px]">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Mkapu Import"
          />
        </div>
      </div>
    </section>
  );
}