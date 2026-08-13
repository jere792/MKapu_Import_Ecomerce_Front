"use client";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useEmpresa } from "@/context/EmpresaContext";

export default function Footer() {
  const { empresa } = useEmpresa();

  return (
    <footer className="bg-[#1a1a1a] text-[#ccc] mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-10 pb-6 flex gap-8 flex-wrap justify-between">
        <div className="flex flex-col gap-1">
          {empresa?.logo && (
            <img
              src={empresa.logo}
              alt={empresa.nombre || "MKapu Import"}
              className="h-[100px] w-[100px] block justify-center"
            />
          )}
          <p className="text-[0.8rem] text-[#888] mt-1 max-w-[220px]">
            {empresa?.descripcion || "Equipos de importación para tu negocio"}
          </p>
        </div>

        <div className="flex gap-12 flex-wrap">
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-1">Navegación</h4>
            <Link href="/" className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:text-white">
              Inicio
            </Link>
            <Link href="/productos" className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:text-white">
              Productos
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-1">Contacto</h4>
            <a
              href={`https://wa.me/${empresa?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:text-white hover:[color:#25d366]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <Link href="/contacto" className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:text-white">
              <Mail size={14} />
              Email
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-1">Legal</h4>
            <Link href="/terminos-y-condiciones" className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:text-white">
              Términos y Condiciones
            </Link>
            <Link href="/politica-de-privacidad" className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:text-white">
              Política de Privacidad
            </Link>
            <Link
              href="/reclamaciones"
              className="text-sm text-[#aaa] no-underline transition-colors flex items-center gap-1.5 hover:opacity-85"
            >
              <img
                src="https://res.cloudinary.com/dxuk9bogw/image/upload/v1776155530/7f85d794-58b5-47d0-850d-d06179563fb2.png"
                alt="Libro de Reclamaciones"
                className="w-[120px] h-auto rounded block mt-1"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] px-6 py-6 text-xs text-[#888]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6 flex-wrap">
          <p>© {new Date().getFullYear()} {empresa?.razon_social || "MKAPU IMPORT S.A.C."} Todos los derechos reservados.</p>
          <a
            href="https://www.instagram.com/solvegrades.com_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex opacity-70 transition-opacity hover:opacity-100"
          >
            <img
              src="https://res.cloudinary.com/dp1vgjhsq/image/upload/v1778834655/WhatsApp_Image_2026-05-15_at_3.21.36_AM-removebg-preview_wtgmkr.png"
              alt="Designed & Built by SolveGrades"
              className="h-[120px] w-auto block"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}