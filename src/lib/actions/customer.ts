'use server';

import { id } from '@instantdb/core';

import { db } from '@/config/instantdb';

export async function addCustomer(props: {
  store_id: string;
  name: string;
  email: string;
  pubkey: string;
  newsletter: boolean;
}): Promise<string> {
  const { store_id, name, email, pubkey, newsletter } = props;

  // TO-DO
  // validate: store_id

  // Find if customer exist
  const query = {
    customer: {
      $: {
        where: {
          email: email ?? null,
          pubkey: pubkey ?? null,
        },
      },
    },
  };

  // @ts-ignore
  const { customer } = await db.query(query);

  if (customer && customer.length > 0) {
    return customer[0]?.id;
  }

  // If not exist, create
  const newId = id();

  await db.transact(
    db.tx.customer[newId].update({
      store_id,

      name: name ?? null,
      email: email ?? null,
      pubkey: pubkey ?? null,
      createdAt: Date.now(),
    }),
  );

  return newId;
}
