// hooks/use-discount.ts
import { useState } from 'react';

export function useDiscount(
  originalPrice: number,
  discounts: Array<{
    code: string;
    description: string;
    amount: number;
    type: 'percentage' | 'fixed';
    valid_until: string;
    valid_from: string;
    max_uses: number;
  }>
) {
  const [inputCode, setInputCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(originalPrice);

  const applyDiscount = () => {
    setIsLoading(true);
    setError('');

    const discount = discounts.find((d) => d.code === inputCode);
    if (!discount) {
      setError('Código de descuento inválido');
      setAppliedDiscount(null);
      setDiscountAmount(0);
      setFinalPrice(originalPrice);
      setIsLoading(false);
      return;
    }

    // Validar fechas
    const today = new Date();
    const validFrom = new Date(discount.valid_from);
    const validUntil = new Date(discount.valid_until);

    if (today < validFrom || today > validUntil) {
      setError('El código de descuento es valido solo entre ' + discount.valid_from + ' y ' + discount.valid_until);
      setAppliedDiscount(null);
      setDiscountAmount(0);
      setFinalPrice(originalPrice);
      setIsLoading(false);
      return;
    }

    setAppliedDiscount(discount);

    let discountValue = 0;
    if (discount.type === 'percentage') {
      discountValue = (originalPrice * discount.amount) / 100;
    } else if (discount.type === 'fixed') {
      discountValue = discount.amount;
    }

    setDiscountAmount(discountValue);
    setFinalPrice(originalPrice - discountValue);
    setIsLoading(false);
  };

  const clearDiscount = () => {
    setAppliedDiscount(null);
    setDiscountAmount(0);
    setFinalPrice(originalPrice);
    setInputCode('');
    setError('');
  };

  return {
    inputCode,
    setInputCode,
    appliedDiscount,
    error,
    isLoading,
    applyDiscount,
    clearDiscount,
    discountAmount,
    finalPrice,
  };
}