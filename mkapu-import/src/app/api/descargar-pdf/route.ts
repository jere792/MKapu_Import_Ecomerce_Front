import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getEmpresa } from "@/lib/get-empresa";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ticket = searchParams.get("ticket");

    if (!ticket) {
      return new NextResponse("Ticket no proporcionado", { status: 400 });
    }

    const { data, error } = await admin.supabase
      .from("reclamaciones")
      .select("*")
      .eq("ticket", ticket)
      .single();

    if (error || !data) {
      return new NextResponse("Reclamación no encontrada", { status: 404 });
    }

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

    const empresa = await getEmpresa();

    const fechaRegistro = data.created_at ? new Date(data.created_at) : new Date();
    const fechaRespuesta = new Date(fechaRegistro);
    fechaRespuesta.setDate(fechaRespuesta.getDate() + 15);

    drawText('LIBRO DE RECLAMACIONES - HOJA DE RECLAMACIÓN', 140, 50, true, 12);
    drawText(`FECHA: ${fechaRegistro.toLocaleDateString('es-PE')}`, 50, 70, false);
    drawText(`N° TICKET: ${data.ticket}`, 400, 70, true);

    drawText(`PROVEEDOR: ${empresa?.razon_social || empresa?.nombre || 'MKAPU IMPORT S.A.C.'}`, 50, 100, true);
    drawText(`RUC: ${empresa?.ruc || '20613016946'}`, 50, 115, false);
    drawText(`DOMICILIO: ${empresa?.direccion || 'AV. LAS FLORES DE LA PRIMAVERA NRO. 1838...'}`, 50, 130, false);

    drawText('1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE', 50, 160, true);
    drawText(`NOMBRE: ${data.nombres} ${data.apellidos}`, 50, 180);
    drawText(`DNI/CE: ${data.dni || 'No especificado'}`, 350, 180);
    drawText(`DOMICILIO: ${data.direccion || 'No especificado'}`, 50, 195);
    drawText(`TELÉFONO: ${data.telefono || 'No especificado'}`, 50, 210);
    drawText(`E-MAIL: ${data.email}`, 350, 210);

    drawText('2. IDENTIFICACIÓN DEL BIEN CONTRATADO', 50, 240, true);
    drawText(`PRODUCTO / SERVICIO: ${data.producto || 'No especificado'}`, 50, 260);
    drawText(`MONTO RECLAMADO: S/ ${data.monto || '0.00'}`, 350, 260);

    drawText('3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR', 50, 290, true);
    drawText(`TIPO: ${String(data.tipo).toUpperCase()}`, 50, 310, true);
    drawText(`DETALLE: ${data.descripcion || 'No especificado'}`, 50, 330, false, 10, 490);
    drawText(`PEDIDO: ${data.pedido || 'No especificado'}`, 50, 410, false, 10, 490);

    drawText('4. OBSERVACIONES Y ACCIONES ADOPTADAS POR EL PROVEEDOR', 50, 490, true);
    drawText(`FECHA DE COMUNICACIÓN DE LA RESPUESTA: ${fechaRespuesta.toLocaleDateString('es-PE')}`, 50, 510);
    
    drawText('*La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.', 50, 750, false, 8, 490);
    drawText('* El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.', 50, 770, false, 8, 490);

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Reclamacion_${data.ticket}.pdf"`,
      },
    });

  } catch (error) {
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}