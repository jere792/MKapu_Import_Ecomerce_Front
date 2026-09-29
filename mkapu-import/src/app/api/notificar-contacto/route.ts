import { NextRequest, NextResponse } from "next/server";
import { getEmpresa } from "@/lib/get-empresa";

const FALLBACK_EMAIL = "mkapuperu@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, email, telefono, asunto, mensaje } = body;

    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    const empresa = await getEmpresa();
    const destinatario = empresa?.email || FALLBACK_EMAIL;

     const htmlInterno = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background-color: #f8f7f4;">
        
        <!-- Contenedor Principal -->
        <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
          
          <!-- Cabecera -->
          <div style="background-color: #1a1a1a; padding: 35px 20px; text-align: center; border-bottom: 4px solid #f5a623;">
            <span style="color: #f5a623; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">MKapu Import</span>
            <h2 style="margin: 10px 0 0; font-size: 24px; color: #ffffff; font-weight: 800; letter-spacing: -0.02em;">Nuevo Mensaje Web</h2>
          </div>

          <!-- Cuerpo del Correo -->
          <div style="padding: 30px 25px;">
            <p style="margin: 0 0 20px; color: #666; font-size: 15px; line-height: 1.6;">
              Tienes una nueva solicitud de contacto desde la página web. Aquí están los detalles del cliente:
            </p>

            <!-- Tabla de Datos -->
            <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; line-height: 1.6;">
                <tr>
                  <td width="30%" style="color: #888; font-weight: 600; padding-bottom: 10px;">Nombre:</td>
                  <td width="70%" style="color: #1a1a1a; font-weight: 700; padding-bottom: 10px;">${nombre}</td>
                </tr>
                <tr>
                  <td style="color: #888; font-weight: 600; padding-bottom: 10px;">Email:</td>
                  <td style="font-weight: 700; padding-bottom: 10px;">
                    <a href="mailto:${email}" style="color: #f5a623; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #888; font-weight: 600; padding-bottom: 10px;">Teléfono:</td>
                  <td style="color: #1a1a1a; font-weight: 500; padding-bottom: 10px;">${telefono || "No especificado"}</td>
                </tr>
                <tr>
                  <td style="color: #888; font-weight: 600;">Asunto:</td>
                  <td style="color: #1a1a1a; font-weight: 700; text-transform: uppercase; font-size: 13px;">
                    <span style="color: #c47d0e;">${asunto || "No especificado"}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Caja de Mensaje -->
            <h3 style="margin: 0 0 10px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.08em;">Mensaje</h3>
            <div style="background-color: #f8f7f4; border-left: 4px solid #f5a623; padding: 18px 20px; border-radius: 0 8px 8px 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${mensaje}</div>
          </div>

          <!-- Pie de página -->
          <div style="background-color: #fafafa; border-top: 1px solid #eaeaea; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">Este es un correo automático generado por el sistema de <strong>MKapu Import</strong>.</p>
          </div>

        </div>
      </div>
    `;

    const resendReq = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Contacto Web <onboarding@resend.dev>",
        to: [destinatario],
        subject: `Nuevo mensaje web de: ${nombre}`,
        html: htmlInterno,
      }),
    });

    const resendData = await resendReq.json();

    if (!resendReq.ok) {
      console.error("❌ Error de Resend:", resendData);
      return NextResponse.json(
        { error: "Fallo al enviar correo" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado correctamente",
    });
  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
