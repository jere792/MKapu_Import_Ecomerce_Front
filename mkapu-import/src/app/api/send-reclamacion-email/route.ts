import { NextRequest, NextResponse } from "next/server";

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
        </div>
      </div>
    `;

    const resendReq = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Mkapu Import <onboarding@resend.dev>',
        to: [email],
        subject: `✅ Reclamación recibida - Ticket ${ticket}`,
        html: htmlContent
      })
    });

    const resendData = await resendReq.json();

    if (!resendReq.ok) {
      console.error("Fallo la API de Resend:", resendData);
      return NextResponse.json({ error: "Error de Resend", detalles: resendData }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resendData });

  } catch (error) {
    console.error("Error catastrofico en el servidor:", error);
    return NextResponse.json({ error: "Error interno del servidor", detalle: String(error) }, { status: 500 });
  }
}
