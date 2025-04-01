// app/qr/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  try {
    // Generate QR code
    const qrBuffer = await QRCode.toBuffer(orderId, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Return QR code as image
    return new NextResponse(qrBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Error generating QR:', error);
    return new NextResponse('Error generating QR', { status: 500 });
  }
}