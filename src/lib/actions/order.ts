'use server';

import { id } from '@instantdb/core';

import { db } from '@/config/instantdb';

interface AddOrder {
  customer_id: any;
  product_id: string;
  amount: number;
  currency: string;
  quantity: number;
  discountCode: string | null;
}

export async function addOrder(props: AddOrder): Promise<string> {
  const { customer_id, product_id, amount, currency, quantity, discountCode } = props;

  // TO-DO
  // validate customer_id && product_id

  const newId = id();

  await db.transact(
    db.tx.order[newId].update({
      customer_id,
      product_id,
      amount: amount ?? null,
      quantity: quantity ?? null,
      currency: currency ?? null,
      paid: false,
      checkedIn: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      discountCode: discountCode ?? null,
    }),
  );

  return newId;
}

export async function modifyOrder(id: any): Promise<{ error: string | null }> {
  if (!id) return { error: 'ID required' };

  await db.transact(
    db.tx.order[id].update({
      paid: true,
      updatedAt: Date.now(),
    }),
  );

  return { error: null };
}

/*export async function modifyOrder(
  orderId: string, 
  updates: { paid?: boolean; checkedIn?: boolean }
) {
  await db.transact(
    db.tx.order[orderId].update({
      ...updates,
      updatedAt: Date.now(),
    })
  );
}*/
