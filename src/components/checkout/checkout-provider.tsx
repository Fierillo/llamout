'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SatoshiV2Icon } from '@bitcoin-design/bitcoin-icons-react/filled';

import { formatBigNumbers } from '@/lib/number';

import { Footer } from '@/components/footer';

import { CustomAccordion } from './custom-accordion';

import { StoreType, ProductType } from '@/types';
import { Skeleton } from '../ui/skeleton';

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

  return (
    <div className='flex-1 flex flex-col md:flex-row'>
      {/* Data */}
      <div className='flex flex-col w-full bg-foreground text-background'>
        <div className='flex flex-row gap-4 w-full h-14 px-4'>
          <div className='flex items-center gap-4 w-full max-w-xl mx-auto'>
            {store?.website ? (
              <Link className='flex items-center gap-2' href={store?.website}>
                {readOnly && !store?.image && <Skeleton className='w-8 h-8 bg-gray-200 rounded-full' />}
                {store?.image && (
                  <div className='relative overflow-hidden w-8 h-8 bg-background rounded-full'>
                    <img src={store?.image} alt={store?.name} />
                  </div>
                )}
                <div className='flex-1 flex'>
                  <span className='font-semibold tracking-tighter text-balance'>{store?.name}</span>
                </div>
              </Link>
            ) : (
              <div className='flex items-center gap-2'>
                {readOnly && !store?.image && <Skeleton className='w-8 h-8 bg-gray-200 rounded-full' />}
                {store?.image && (
                  <div className='relative overflow-hidden w-8 h-8 bg-background rounded-full'>
                    <img src={store?.image} alt={store?.name} />
                  </div>
                )}
                <div className='flex-1 flex'>
                  <span className='font-semibold tracking-tighter text-balance'>{store?.name}</span>
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
                <div className="text-right text-xl font-bold text-green-400">
                  {product?.price.toLocaleString('en-US')} {product?.currency}
                </div>
              </div>
              {readOnly && !product?.image && <Skeleton className='w-full h-[280px] bg-gray-200 rounded-xl' />}
              {product?.image && (
                <div className='relative overflow-hidden flex justify-center items-center max-h-[280px] rounded-xl'>
                  <img src={product?.image} alt={product?.name} />
                </div>
              )}

              {readOnly && !product?.description && <Skeleton className='w-[220px] h-[14px] bg-gray-200 rounded-xl' />}
              {product?.description && (
                <div className='flex flex-col gap-4'>
                  <p className='text-sm' dangerouslySetInnerHTML={{ __html: product?.description }} />
                </div>
              )}
            </div>

            {/* Divider */}
            {/* <div className='w-full h-[1px] bg-muted opacity-10'></div> */}

            {/* {product?.variants?.length > 0 && (
              <ProductVariants
                onChange={setSelected}
                selected={product?.variants[0]?.id}
                variants={product?.variants}
                disabled={disabled}
              />
            )} */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-col justify-center items-center w-full'>
        <div className='flex-1 flex w-full max-w-md h-full px-4 py-8 md:py-24'>
          <CustomAccordion readOnly={readOnly} quantity={quantity} store={store} product={product} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
