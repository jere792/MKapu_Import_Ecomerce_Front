import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
export const runtime = 'edge';
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { nombres, apellidos, email, tipo, ticket } = await req.json();

    const fechaRespuesta = new Date();
    fechaRespuesta.setDate(fechaRespuesta.getDate() + 30);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #f5a623; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">✅ Reclamación Recibida</h2>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 16px;">Hola <strong>${nombres} ${apellidos}</strong>,</p>
          <p style="color: #666; font-size: 14px;">Hemos recibido tu ${tipo} correctamente. Aquí están los detalles:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623;">
            <p style="margin: 8px 0;"><strong style="color: #333;">Número de ticket:</strong> <span style="color: #f5a623; font-weight: bold;">${ticket}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #333;">Tipo:</strong> ${tipo.toUpperCase()}</p>
            <p style="margin: 8px 0;"><strong style="color: #333;">Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong style="color: #333;">Fecha de recepción:</strong> ${new Date().toLocaleDateString("es-PE")}</p>
            <p style="margin: 8px 0;"><strong style="color: #333;">Respuesta antes de:</strong> ${fechaRespuesta.toLocaleDateString("es-PE")}</p>
          </div>

          <div style="background: #fff9e6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623;">
            <p style="color: #333; font-size: 13px; margin: 0;">
              <strong>📋 Según la Ley de Protección al Consumidor Peruana:</strong><br/>
              Nos comprometemos a responder tu ${tipo} dentro de <strong>30 días hábiles</strong>.
            </p>
          </div>

          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            Si tienes preguntas, contáctanos a través de WhatsApp o nuestro sitio web.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este es un correo automático. Por favor, no responder a esta dirección.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Mkapu Import" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Reclamación recibida - Ticket ${ticket}`,
      html: htmlContent,
    });

    console.log("Email enviado exitosamente a:", email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Error al enviar email" },
      { status: 500 }
    );
  }
}