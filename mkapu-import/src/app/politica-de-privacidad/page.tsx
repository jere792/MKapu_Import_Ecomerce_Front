import LegalSection from "@/components/LegalSection";

export default function PoliticaDePrivacidad() {
  return (
    <main className="bg-[#111] text-[#ccc] min-h-screen px-6 py-12">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[2rem] font-black text-white mb-1">Política de Privacidad</h1>
        <p className="text-[0.8rem] text-[#555] mb-10">Última actualización: abril 2026</p>

        <LegalSection title="1. Responsable del tratamiento">
          <p>
            <strong>Mkapu Import</strong>, empresa registrada en el Perú con RUC
            activo, es responsable del banco de datos personales recopilados a
            través de este sitio web, en cumplimiento de la Ley N° 29733, Ley de
            Protección de Datos Personales, y su Reglamento (D.S. N°
            003-2013-JUS).
          </p>
          <p>
            Contacto:{" "}
            <a href="mailto:marlomauriciop1@gmail.com">
              marlomauriciop1@gmail.com
            </a>
          </p>
        </LegalSection>

        <LegalSection title="2. Datos que recopilamos">
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
        </LegalSection>

        <LegalSection title="3. Finalidad del tratamiento">
          <p>Utilizamos tus datos personales para:</p>
          <ul>
            <li>Atender consultas y cotizaciones de productos.</li>
            <li>Procesar y coordinar pedidos de compra.</li>
            <li>Gestionar envíos y seguimiento de entregas.</li>
            <li>Brindar soporte técnico posventa.</li>
            <li>
              Enviarte información comercial sobre productos y promociones (solo
              si diste tu consentimiento).
            </li>
            <li>Cumplir con obligaciones legales y tributarias aplicables.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Consentimiento">
          <p>
            Al contactarnos a través de WhatsApp o cualquier formulario de este
            sitio, el usuario otorga su consentimiento libre, informado y
            expreso para el tratamiento de sus datos personales conforme a los
            fines descritos en esta política, de acuerdo con el artículo 13 de
            la Ley N° 29733.
          </p>
        </LegalSection>

        <LegalSection title="5. Compartición de datos">
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
        </LegalSection>

        <LegalSection title="6. Seguridad de los datos">
          <p>
            Adoptamos medidas técnicas y organizativas razonables para proteger
            tus datos personales contra accesos no autorizados, pérdida,
            alteración o divulgación indebida, conforme al artículo 16 de la Ley
            N° 29733.
          </p>
        </LegalSection>

        <LegalSection title="7. Conservación de datos">
          <p>
            Los datos personales se conservarán durante el tiempo necesario para
            cumplir con la finalidad para la que fueron recopilados y por el
            período mínimo exigido por la normativa legal aplicable (por
            ejemplo, 5 años para documentos tributarios según SUNAT).
          </p>
        </LegalSection>

        <LegalSection title="8. Derechos del titular (Derechos ARCO)">
          <p>De conformidad con la Ley N° 29733, tienes derecho a:</p>
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
            <a href="mailto:marlomauriciop1@gmail.com">
              marlomauriciop1@gmail.com
            </a>{" "}
            indicando tu nombre completo, el derecho que deseas ejercer y
            adjuntando una copia de tu DNI. Responderemos en un plazo máximo de
            20 días hábiles.
          </p>
        </LegalSection>

        <LegalSection title="9. Cookies y datos de navegación">
          <p>
            Este sitio puede utilizar cookies y tecnologías similares para
            mejorar la experiencia de navegación y analizar el tráfico del
            sitio. Puedes configurar tu navegador para rechazar cookies, aunque
            esto podría afectar el funcionamiento de algunas funciones.
          </p>
        </LegalSection>

        <LegalSection title="10. Modificaciones a esta política">
          <p>
            Mkapu Import se reserva el derecho de actualizar esta Política de
            Privacidad en cualquier momento. Cualquier cambio será publicado en
            esta página con la fecha de actualización correspondiente. Te
            recomendamos revisarla periódicamente.
          </p>
        </LegalSection>

        <LegalSection title="11. Autoridad de control">
          <p>
            Si consideras que el tratamiento de tus datos no cumple con la
            normativa, puedes presentar una reclamación ante la Autoridad
            Nacional de Protección de Datos Personales del Ministerio de
            Justicia y Derechos Humanos del Perú, o ante el INDECOPI.
          </p>
        </LegalSection>
      </div>
    </main>
  );
}