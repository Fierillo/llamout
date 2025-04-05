'use client';

import { init } from '@instantdb/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import QRScanner from '@/components/ui/QRscanner';
import { sendEmail } from '@/lib/actions/email';
import { sendNOSTRMessage } from '@/lib/actions/nostr';

const APP_ID = process.env.INSTANTDB_KEY || '';
const db = init({ appId: APP_ID });

const CORRECT_PASSWORD = process.env.NEXT_CHECKIN_PASSWORD || 'gg';

export default function Page() {
  const query = { order: {}, customer: {} };
  const { isLoading, error, data } = db.useQuery(query);
  const [scanResult, setScanResult] = useState('');
  const [manualId, setManualId] = useState('');
  const [scanError, setScanError] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta');
      setPassword('');
    }
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-semibold">Ingresar Contraseña</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="p-2 border rounded w-64"
        />
        {authError && <p className="text-red-600">{authError}</p>}
        <Button onClick={handlePasswordSubmit} disabled={!password}>
          Entrar
        </Button>
      </div>
    );
  }

  // Loading screen
  if (isLoading) return <div className="p-4">Cargando...</div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-2xl font-semibold">Error</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }
  
  const handleCheckIn = async (orderId: string) => {
    setScanError('');
    if (!data || !data.order) {
      setScanError('Datos no cargados correctamente');
      return;
    }
    const orderExists = data.order.some((o: any) => o.id === orderId);
    if (!orderExists) {
      setScanError('ID de orden inválido');
      return;
    }
    try {
      await db.transact(
        db.tx.order[orderId].update({
          checkedIn: true,
          updatedAt: Date.now()
        })
      );
      setScanResult(orderId);
      setManualId('');
    } catch (error) {
      setScanError('Error al actualizar el check-in');
    }
  };

  const { order, customer } = data;
  const totalOrders = order.length;
  const paidOrders = order.filter((o: any) => o.paid).length;
  const checkedInOrders = order.filter((o: any) => o.checkedIn).length;

  const handleResend = (id: string) => {
    setIsResending(true);
    resendTicket(id);
    setTimeout(() => setIsResending(false), 2100);
  };

  // la funcion revisa si el cliente dejo email o pubkey
  async function resendTicket(orderId: string) {
    const orderData = order.find((o: any) => o.id === orderId);
    const customerData = customer.find((c: any) => c.id === orderData?.customer_id);
    if (customerData?.email) {
      await sendEmail(customerData.email, orderId)
    } else if (customerData?.pubkey) {
      await sendNOSTRMessage(customerData.pubkey, orderId)
    } else {
      console.error('No se encontró email ni pubkey para el cliente');
    }
  }

  return (
    <div className="p-4 space-y-6 bg-black">
      {/* Sección de check-in */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lector QR */}
        <QRScanner
          onScanSuccess={(result) => handleCheckIn(result)}
          onScanError={(error) => setScanError(error)}
        />
        {/* Entrada manual */}
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <h2 className="text-lg text-center font-semibold mb-4">Check-in Manual</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Ingresar ID de orden"
              className="flex-1 p-2 border rounded bg-black text-white"
            />
            <Button onClick={() => handleCheckIn(manualId)} disabled={!manualId}>
              Validar
            </Button>
          </div>
        </div>
      </div>

      {/* Retroalimentación */}
      {scanResult && (
        <div className="p-4 bg-green-200 rounded-lg">
          ✓ Check-in exitoso para orden: {scanResult}
        </div>
      )}
      {scanError && (
        <div className="p-4 bg-red-200 rounded-lg text-red-600">
          ✗ {scanError}
        </div>
      )}
      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Email/Pubkey</th>
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-center">¿Pagó? ({paidOrders}/{totalOrders})</th>
                <th className="p-3 text-center">Check-in ({checkedInOrders}/{totalOrders})</th>
                <th className="p-3 text-center">¿Reenviar?</th>
              </tr>
            </thead>
            <tbody>
              {order.map((theOrder: any) => {
                const customerData = customer.find((c: any) => c.id === theOrder.customer_id);
                return (
                  <tr key={theOrder.id} className="border-t">
                    <td
                      className="p-3 text-sm font-mono max-w-[200px] truncate cursor-pointer"
                      onClick={() => {
                        const text = theOrder.id;
                        navigator.clipboard.writeText(text);
                        alert("Texto copiado al portapapeles");
                      }}
                      title="Haz clic para copiar"
                    >
                      {theOrder.id}
                    </td>
                    <td className="p-3">
                      {new Date(theOrder.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td
                      className="p-3 max-w-[200px] truncate cursor-pointer"
                      onClick={() => {
                        const texto = customerData?.email || customerData?.pubkey;
                        navigator.clipboard.writeText(texto);
                        alert("Texto copiado al portapapeles");
                      }}
                      title="Haz clic para copiar"
                    >
                      {customerData?.email || <p className="text-purple-500 truncate">NOSTR: {customerData?.pubkey}</p>}
                    </td>
                    <td className="p-3">{theOrder.discountCode}</td>
                    <td className="p-3 text-center">{theOrder.paid ? 'SI' : 'NO'}</td>
                    <td className="p-3 text-center text-xl">{theOrder.checkedIn ? '✅' : '❌'}</td>
                    <td className="p-3 text-center text-2xl">
                      <Button
                        variant="ghost"
                        onClick={() => handleResend(theOrder.id)}
                        disabled={theOrder.checkedIn || !theOrder.paid || isResending}
                      >
                        {isResending? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <span className="text-4xl text-blue-500 hover:text-white hover:bg-blue-500">↻</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}