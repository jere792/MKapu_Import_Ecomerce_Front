export default function PoliticaDePrivacidad() {
  return (
    <main className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Política de Privacidad</h1>
        <p className="legal-page__updated">Última actualización: abril 2026</p>

        <section className="legal-page__section">
          <h2>1. Responsable del tratamiento</h2>
          <p>
            <strong>Mkapu Import</strong>, empresa registrada en el Perú con
            RUC activo, es responsable del banco de datos personales recopilados
            a través de este sitio web, en cumplimiento de la Ley N° 29733, Ley
            de Protección de Datos Personales, y su Reglamento (D.S.
            N° 003-2013-JUS).
          </p>
          <p>
            Contacto:{" "}
            <a href="mailto:contacto@mkapu.com">contacto@mkapu.com</a>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Datos que recopilamos</h2>
          <p>
            Al interactuar con nuestro sitio o al contactarnos vía WhatsApp,
            podemos recopilar los siguientes datos personales:
          </p>
          <ul>
            <li>Nombre y apellidos</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Correo electrónico</li>
            <li>Dirección de entrega (para envíos)</li>
            <li>RUC o razón social (si aplica)</li>
            <li>
              Datos de navegación (páginas visitadas, dispositivo, dirección IP)
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>3. Finalidad del tratamiento</h2>
          <p>Utilizamos tus datos personales para:</p>
          <ul>
            <li>Atender consultas y cotizaciones de productos.</li>
            <li>Procesar y coordinar pedidos de compra.</li>
            <li>Gestionar envíos y seguimiento de entregas.</li>
            <li>Brindar soporte técnico posventa.</li>
            <li>
              Enviarte información comercial sobre productos y promociones
              (solo si diste tu consentimiento).
            </li>
            <li>
              Cumplir con obligaciones legales y tributarias aplicables.
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>4. Consentimiento</h2>
          <p>
            Al contactarnos a través de WhatsApp o cualquier formulario de este
            sitio, el usuario otorga su consentimiento libre, informado y
            expreso para el tratamiento de sus datos personales conforme a los
            fines descritos en esta política, de acuerdo con el artículo 13 de
            la Ley N° 29733.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Compartición de datos</h2>
          <p>
            Mkapu Import no vende, alquila ni cede datos personales a terceros
            con fines comerciales. Podremos compartir datos únicamente con:
          </p>
          <ul>
            <li>
              Empresas de transporte o logística para gestionar envíos, bajo
              acuerdos de confidencialidad.
            </li>
            <li>
              Autoridades competentes cuando sea requerido por ley (SUNAT,
              INDECOPI, poder judicial, etc.).
            </li>
          </ul>
        </section>

        <section className="legal-page__section">
          <h2>6. Seguridad de los datos</h2>
          <p>
            Adoptamos medidas técnicas y organizativas razonables para proteger
            tus datos personales contra accesos no autorizados, pérdida,
            alteración o divulgación indebida, conforme al artículo 16 de la
            Ley N° 29733.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Conservación de datos</h2>
          <p>
            Los datos personales se conservarán durante el tiempo necesario para
            cumplir con la finalidad para la que fueron recopilados y por el
            período mínimo exigido por la normativa legal aplicable (por
            ejemplo, 5 años para documentos tributarios según SUNAT).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Derechos del titular (Derechos ARCO)</h2>
          <p>
            De conformidad con la Ley N° 29733, tienes derecho a:
          </p>
          <ul>
            <li>
              <strong>Acceso:</strong> conocer qué datos tuyos tratamos.
            </li>
            <li>
              <strong>Rectificación:</strong> corregir datos inexactos o
              incompletos.
            </li>
            <li>
              <strong>Cancelación:</strong> solicitar la eliminación de tus
              datos cuando ya no sean necesarios.
            </li>
            <li>
              <strong>Oposición:</strong> oponerte al tratamiento de tus datos
              para fines específicos.
            </li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escríbenos a{" "}
            <a href="mailto:contacto@mkapu.com">contacto@mkapu.com</a>{" "}
            indicando tu nombre completo, el derecho que deseas ejercer y
            adjuntando una copia de tu DNI. Responderemos en un plazo máximo de
            20 días hábiles.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Cookies y datos de navegación</h2>
          <p>
            Este sitio puede utilizar cookies y tecnologías similares para
            mejorar la experiencia de navegación y analizar el tráfico del
            sitio. Puedes configurar tu navegador para rechazar cookies, aunque
            esto podría afectar el funcionamiento de algunas funciones.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>10. Modificaciones a esta política</h2>
          <p>
            Mkapu Import se reserva el derecho de actualizar esta Política de
            Privacidad en cualquier momento. Cualquier cambio será publicado en
            esta página con la fecha de actualización correspondiente. Te
            recomendamos revisarla periódicamente.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>11. Autoridad de control</h2>
          <p>
            Si consideras que el tratamiento de tus datos no cumple con la
            normativa, puedes presentar una reclamación ante la Autoridad
            Nacional de Protección de Datos Personales del Ministerio de
            Justicia y Derechos Humanos del Perú, o ante el INDECOPI.
          </p>
        </section>
      </div>

      <style>{`
        .legal-page {
          background: #111;
          color: #ccc;
          min-height: 100vh;
          padding: 3rem 1.5rem;
        }

        .legal-page__container {
          max-width: 800px;
          margin: 0 auto;
        }

        .legal-page__title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .legal-page__updated {
          font-size: 0.8rem;
          color: #555;
          margin-bottom: 2.5rem;
        }

        .legal-page__section {
          margin-bottom: 2rem;
          border-left: 3px solid #f5a623;
          padding-left: 1.25rem;
        }

        .legal-page__section h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.6rem;
        }

        .legal-page__section p,
        .legal-page__section ul,
        .legal-page__section li {
          font-size: 0.9rem;
          line-height: 1.75;
          color: #aaa;
          margin-bottom: 0.5rem;
        }

        .legal-page__section ul {
          padding-left: 1.25rem;
        }

        .legal-page__section a {
          color: #f5a623;
          text-decoration: none;
        }

        .legal-page__section a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}