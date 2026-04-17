"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo-title">mkapu</span>
          <span className="footer__logo-sub">import</span>
          <p className="footer__tagline">
            Equipos de importación para tu negocio
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title">Navegación</h4>
            <Link href="/" className="footer__link">
              Inicio
            </Link>
            <Link href="/productos" className="footer__link">
              Productos
            </Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Contacto</h4>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link footer__link--wsp"
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
            <a href="mailto:contacto@mkapu.com" className="footer__link">
              contacto@mkapu.com
            </a>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Legal</h4>
            <Link href="/terminos-y-condiciones" className="footer__link">
              Términos y Condiciones
            </Link>
            <Link href="/politica-de-privacidad" className="footer__link">
              Política de Privacidad
            </Link>
            <Link
              href="/reclamaciones"
              className="footer__link footer__link--reclamos"
            >
              <img
                src="https://res.cloudinary.com/dxuk9bogw/image/upload/v1776155530/7f85d794-58b5-47d0-850d-d06179563fb2.png"
                alt="Libro de Reclamaciones"
                className="footer__reclamos-img"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          © {new Date().getFullYear()} MKAPU IMPORT S.A.C. Todos los derechos
          reservados. | Designed & Built by SolveGrades
        </p>
      </div>

      <style>{`
        .footer {
          background: #1a1a1a;
          color: #ccc;
          margin-top: auto;
        }

        .footer__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 1.5rem;
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: space-between;
        }

        .footer__brand {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .footer__logo-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          text-transform: lowercase;
        }

        .footer__logo-sub {
          font-size: 0.75rem;
          font-weight: 600;
          color: #f5a623;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-top: -4px;
        }

        .footer__tagline {
          font-size: 0.8rem;
          color: #888;
          margin-top: 0.4rem;
          max-width: 220px;
        }

        .footer__links {
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .footer__col {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer__col-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 0.25rem;
        }

        .footer__link {
          font-size: 0.85rem;
          color: #aaa;
          text-decoration: none;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .footer__link:hover {
          color: #fff;
        }

        .footer__link--wsp:hover {
          color: #25d366;
        }

        .footer__link--reclamos:hover {
          opacity: 0.85;
        }

        .footer__reclamos-img {
          width: 120px;
          height: auto;
          border-radius: 4px;
          display: block;
          margin-top: 0.25rem;
        }

        .footer__bottom {
          border-top: 1px solid #2a2a2a;
          text-align: center;
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          color: #555;
        }
      `}</style>
    </footer>
  );
}