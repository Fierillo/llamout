import type { Metadata } from 'next';
import { CheckoutProvider } from '@/components/checkout/checkout-provider';
import { STORE, PRODUCT } from '@/mock';

export async function generateMetadata(): Promise<Metadata> {
  const store = STORE;
  return {
    title: `${store.name} | Checkout`,
  };
}

export default function Page() {
  const fixedProduct = {
    ...PRODUCT,
    discounts: PRODUCT.discounts.map((discount) => ({
      ...discount,
      code: discount.code ?? "", // Usa ?? para garantizar string, incluso si code es undefined o null
      type: (discount.type === "fixed" || discount.type === "percentage" ? discount.type : "fixed") as "fixed" | "percentage", // Aserción de tipo
      max_uses: 0, // Añadido explícitamente
    })),
  };

  return <CheckoutProvider store={{ ...STORE, lnaddress: STORE.lnaddress || "" }} product={fixedProduct} />;
}