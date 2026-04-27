import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.RESEND_API_KEY;
    console.log("=== DEBUG RESEND KEY ===");
    console.log("¿Existe?:", !!key);
    console.log("Valor exacto leído:", key ? `${key.substring(0, 5)}... (Longitud: ${key.length})` : "VACÍO/UNDEFINED");
    const { nombre, email, telefono, asunto, mensaje } = await req.json();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; border-bottom: 3px solid #f5a623;">
          <h2 style="margin: 0; font-size: 22px; color: #f5a623;">NUEVO MENSAJE DE CONTACTO</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ede8e1;">
          <p style="color: #333; font-size: 15px;">Has recibido un nuevo mensaje desde el formulario de contacto de la web.</p>
          
          <div style="background: #f8f7f4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a1a1a;">
            <p style="margin: 8px 0;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
            <p style="margin: 8px 0;"><strong>Asunto:</strong> ${asunto || 'Sin asunto'}</p>
          </div>
          
          <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 13px; text-transform: uppercase; font-weight: bold;">Mensaje:</p>
            <p style="margin: 0; color: #333; line-height: 1.5; white-space: pre-wrap;">${mensaje}</p>
          </div>
        </div>
      </div>
    `;

    // Fetch directo a la API de Resend
    const resendReq = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Contacto Web <onboarding@resend.dev>',
        to: ['solvegrades@gmail.com'], 
        subject: `Nuevo mensaje de: ${nombre} - ${asunto || 'Contacto'}`,
        html: htmlContent,
        reply_to: email // Permite responder directamente al cliente desde tu cliente de correo
      })
    });

    const resendData = await resendReq.json();

    if (!resendReq.ok) {
      console.error("Error API Resend (Contacto):", resendData);
      return NextResponse.json({ error: "Fallo al enviar correo", detalles: resendData }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resendData });

  } catch (error) {
    console.error("Error interno del servidor (Contacto):", error);
    return NextResponse.json({ error: "Error en el servidor", detalle: String(error) }, { status: 500 });
  }
}