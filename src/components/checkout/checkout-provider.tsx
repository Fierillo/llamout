'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SatoshiV2Icon } from '@bitcoin-design/bitcoin-icons-react/filled';
import { Footer } from '@/components/footer';
import { CustomAccordion } from './custom-accordion';
import { StoreType, ProductType } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { useDiscount } from '@/hooks/use-discount';
import { Button } from '../ui/button';
import { LoaderCircle, Tag, XCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PRODUCT } from '@/mock/index';
import { init } from '@instantdb/react';

const APP_ID = process.env.INSTANTDB_KEY || '';
const db = init({ appId: APP_ID });
const MAX_TICKETS = PRODUCT.quantity;

export function CheckoutProvider({
  store,
  product,
  readOnly = false,
}: {
  store: StoreType;
  product: ProductType;
  readOnly?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [ticketsSoldOut, setTicketsSoldOut] = useState(false);
  // Calcular precio original
  const originalPriceARS = (product?.price || 0) * quantity;
  const [isSubmited, setIsSubmited] = useState(false); 

  // Consulta específica para órdenes pagadas
  const { data } = db.useQuery({
    order: {
      $: {
        where: {
          paid: true,
        },
      },
    },
  });

  // Calcular tickets vendidos
  const ticketsSold = data ? data.order.length : 0;

  // Verificar si las entradas están agotadas
  useEffect(() => {
    if (ticketsSold >= MAX_TICKETS) {
      setTicketsSoldOut(true);
    } else {
      setTicketsSoldOut(false);
    }
  }, [ticketsSold]);

  // Usar el hook de descuento con los descuentos de PRODUCT
  const {
    inputCode,
    setInputCode,
    appliedDiscount,
    error: discountError,
    isLoading: isApplyingDiscount,
    applyDiscount: handleApplyDiscount,
    clearDiscount,
    discountAmount: discountAmountARS,
    finalPrice: finalPriceARS,
  } = useDiscount(
    originalPriceARS,
    PRODUCT.discounts as Array<{
      code: string;
      description: string;
      amount: number;
      type: 'fixed' | 'percentage';
      valid_until: string;
      valid_from: string;
      max_uses: number;
    }>
  );

  // Si las entradas están agotadas, mostrar el cartel
  if (ticketsSoldOut) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-black">
        <h2 className="text-6xl font-dark-souls text-red-600">ENTRADAS AGOTADAS</h2>
        <p className='text-2xl text-red-600 font-dark-souls'>No hay más entradas disponibles para este evento.</p>
      </div>
    );
  }

  const handleSubmited = () => {
    setIsSubmited(true);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Data */}
      <div
        className="flex flex-col w-full text-background"
        style={{
          backgroundImage: 'url(/images/rabbit_banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-row gap-4 w-full h-14 px-4">
          <div className="flex items-center gap-4 w-full max-w-xl mx-auto">
            {store?.website ? (
              <Link className="flex items-center gap-2" href={store?.website}>
                {readOnly && !store?.image && <Skeleton className="w-8 h-8 bg-gray-200 rounded-full" />}
                {store?.image && (
                  <div className="relative overflow-hidden w-8 h-8 bg-background rounded-full">
                    <img src={store?.image} alt={store?.name} />
                  </div>
                )}
                <div className="flex-1 flex">
                  <span className="font-semibold tracking-tighter text-balance">{store?.name}</span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {readOnly && !store?.image && <Skeleton className="w-8 h-8 bg-gray-200 rounded-full" />}
                {store?.image && (
                  <div className="relative overflow-hidden w-8 h-8 bg-background rounded-full">
                    <img src={store?.image} alt={store?.name} />
                  </div>
                )}
                <div className="flex-1 flex">
                  <span className="font-semibold tracking-tighter text-balance">{store?.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-6 w-full max-w-md mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-xl bg-black opacity-80 p-4">
              {/* Nombre del producto */}
              <div className="flex justify-between items-center">
                <h1 className="font-bold text-xl tracking-tighter text-balance">{product?.name}</h1>
                {/* Mostrar Precios */}
                <div className="text-right text-green-400">
                  {appliedDiscount && (
                    <p className="text-sm text-muted-foreground line-through">
                      {originalPriceARS.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </p>
                  )}
                  <p className="flex items-center justify-end text-lg tracking-tighter text-balance">
                    <span className="font-semibold">
                      {finalPriceARS.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </span>
                  </p>
                  {appliedDiscount && (
                    <p className="text-xs text-orange-400">
                      ¡Descuento del
                      {appliedDiscount.type === 'percentage'
                        ? ` ${appliedDiscount.amount}%!`
                        : `(-${discountAmountARS.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })})`}
                    </p> 
                  )}
                </div>
              </div>
              {readOnly && !product?.image && <Skeleton className="w-full h-[280px] bg-gray-200 rounded-xl" />}
              {product?.image && (
                <div className="relative overflow-hidden flex justify-center items-center max-h-[280px] rounded-xl">
                  <img src={product?.image} alt={product?.name} />
                </div>
              )}

              {readOnly && !product?.description && <Skeleton className="w-[220px] h-[14px] bg-gray-200 rounded-xl" />}
              {product?.description && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: product?.description }} />
                </div>
              )}
            </div>
            {/* Sección Código de Descuento */}
            {!readOnly && (
              <div className="flex flex-col gap-2 rounded-xl bg-black opacity-80 p-4">
                <Label htmlFor="discount-code">¿Tienes un código de descuento?</Label>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    id="discount-code"
                    type="text"
                    placeholder="Ej: RABBIT"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    disabled={isApplyingDiscount || !!appliedDiscount || isSubmited}
                    className="text-black"
                  />
                  {!appliedDiscount ? (
                    <Button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || !inputCode || isSubmited}
                      variant="secondary"
                      className='hover:bg-yellow-500 hover:text-white'
                    >
                      {isApplyingDiscount ? (
                        <LoaderCircle className="animate-spin mr-2" size={16} />
                      ) : (
                        <Tag className="mr-2" size={16} />
                      )}
                      Aplicar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={clearDiscount}
                      disabled={isSubmited}
                      variant="ghost"
                      size="icon"
                      title="Quitar descuento"
                    >
                      <XCircle className="text-red-500" size={20} />
                    </Button>
                  )}
                </div>
                {appliedDiscount
                ? (<p className='text-yellow-500'>{appliedDiscount.description}</p>) 
                : (discountError && <p className="text-sm text-red-500">{discountError}</p>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center items-center w-full">
        <div className="flex-1 flex w-full max-w-md h-full px-4 py-8 md:py-24">
          <CustomAccordion 
            readOnly={readOnly} 
            quantity={quantity} 
            store={store} 
            product={product} 
            price={finalPriceARS}
            onSubmited={handleSubmited}
          />
        </div>
        <Footer />
      </div>
    </div>
  );
}
