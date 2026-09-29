import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getEmpresa } from "@/lib/get-empresa";

const FALLBACK_EMAIL = "mkapuperu@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { 
      nombres, apellidos, email, tipo, ticket, 
      dni, direccion, telefono, producto, monto, descripcion, pedido 
    } = body;

    if (!email || !nombres) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const empresa = await getEmpresa();
    const destinatario = empresa?.email || FALLBACK_EMAIL;

    const fechaActual = new Date();
    const fechaRespuesta = new Date();
    fechaRespuesta.setDate(fechaRespuesta.getDate() + 15); 

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); 
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { height } = page.getSize();

    const drawText = (text: string, x: number, y: number, isBold = false, size = 10, maxWidth = 500) => {
      page.drawText(text || '', { 
        x, 
        y: height - y, 
        size, 
        font: isBold ? fontBold : fontNormal, 
        color: rgb(0, 0, 0),
        maxWidth,
        lineHeight: size * 1.2
      });
    };

    drawText('LIBRO DE RECLAMACIONES - HOJA DE RECLAMACIÓN', 140, 50, true, 12);
    drawText(`FECHA: ${fechaActual.toLocaleDateString('es-PE')}`, 50, 70, false);
    drawText(`N° TICKET: ${ticket}`, 400, 70, true);

    drawText(`PROVEEDOR: ${empresa?.razon_social || empresa?.nombre || 'MKAPU IMPORT S.A.C.'}`, 50, 100, true);
    drawText(`RUC: ${empresa?.ruc || '20613016946'}`, 50, 115, false);
    drawText(`DOMICILIO: ${empresa?.direccion || 'AV. LAS FLORES DE LA PRIMAVERA NRO. 1838...'}`, 50, 130, false);

    drawText('1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE', 50, 160, true);
    drawText(`NOMBRE: ${nombres} ${apellidos}`, 50, 180);
    drawText(`DNI/CE: ${dni || 'No especificado'}`, 350, 180);
    drawText(`DOMICILIO: ${direccion || 'No especificado'}`, 50, 195);
    drawText(`TELÉFONO: ${telefono || 'No especificado'}`, 50, 210);
    drawText(`E-MAIL: ${email}`, 350, 210);

    drawText('2. IDENTIFICACIÓN DEL BIEN CONTRATADO', 50, 240, true);
    drawText(`PRODUCTO / SERVICIO: ${producto || 'No especificado'}`, 50, 260);
    drawText(`MONTO RECLAMADO: S/ ${monto || '0.00'}`, 350, 260);

    drawText('3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR', 50, 290, true);
    drawText(`TIPO: ${String(tipo).toUpperCase()}`, 50, 310, true);
    drawText(`DETALLE: ${descripcion || 'No especificado'}`, 50, 330, false, 10, 490);
    drawText(`PEDIDO: ${pedido || 'No especificado'}`, 50, 410, false, 10, 490);

    drawText('4. OBSERVACIONES Y ACCIONES ADOPTADAS POR EL PROVEEDOR', 50, 490, true);
    drawText(`FECHA DE COMUNICACIÓN DE LA RESPUESTA: ${fechaRespuesta.toLocaleDateString('es-PE')}`, 50, 510);
    
    drawText('*La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.', 50, 750, false, 8, 490);
    drawText('* El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.', 50, 770, false, 8, 490);

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    const emailJsReq = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, 
        template_params: {
          nombres: nombres,
          apellidos: apellidos,
          email_cliente: email, 
          tipo: tipo,
          ticket: ticket,
          fecha_limite: fechaRespuesta.toLocaleDateString("es-PE")
        }
      })
    });

    if (!emailJsReq.ok) {
       const emailJsError = await emailJsReq.text();
       return NextResponse.json({ 
         error: "EmailJS bloqueó el envío en producción", 
         detalle: emailJsError 
       }, { status: 400 });
    }

    const htmlInterno = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #d9534f; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">🚨 Nuevo ${tipo} Registrado</h2>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <p><strong>Ticket:</strong> ${ticket}</p>
          <p><strong>Cliente:</strong> ${nombres} ${apellidos}</p>
          <p><strong>Email del cliente:</strong> ${email}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d9534f;">
            <p style="margin: 0;"><em>Se ha generado automáticamente la Hoja de Reclamación oficial y se ha enviado una copia al cliente. Tienes el documento adjunto a este correo.</em></p>
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
        from: 'Notificaciones Web <onboarding@resend.dev>',
        to: [destinatario], 
        subject: `🚨 ALERTA: Nuevo ${tipo} - Ticket ${ticket}`,
        html: htmlInterno,
        attachments: [
          {
            filename: `Reclamacion_${ticket}.pdf`,
            content: pdfBase64
          }
        ]
      })
    });

    const resendData = await resendReq.json();

    if (!resendReq.ok) {
      return NextResponse.json({ error: "Fallo al enviar alerta interna", detalles: resendData }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resendData, message: "Ambos correos procesados y PDF generado" });

  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor", detalle: String(error) }, { status: 500 });
  }
}