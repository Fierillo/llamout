import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // `params` es ahora un Promise
) {
  try {
    // Resolver el Promise para obtener los parámetros
    const { id: orderId } = await context.params;

    // Generar el QR code en formato PNG como un buffer
    const qrBuffer = await QRCode.toBuffer(orderId, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Retornar la imagen con los headers adecuados
    return new NextResponse(qrBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generando el QR:', error);
    return new NextResponse('Error generando el QR', { status: 500 });
  }
}