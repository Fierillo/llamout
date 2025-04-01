import { getPublicKey, nip04, finalizeEvent, type Event, nip19 } from 'nostr-tools';
import { SimplePool } from 'nostr-tools/pool';

const RELAYS = [
  'wss://relay.current.fyi',
  'wss://nostr.wine',
  'wss://purplepag.es',
  'wss://relay.damus.io',
];

// Crash if there isn't NOSTR private key declared in .env
if (!process.env.NEXT_NOSTR_PRIVATE_KEY) {
  throw new Error('NEXT_NOSTR_PRIVATE_KEY environment variable is not set');
}

const senderPrivateKey = process.env.NEXT_NOSTR_PRIVATE_KEY;
const decodedPrivateKey = /^[0-9a-fA-F]{64}$/.test(senderPrivateKey)
  ? senderPrivateKey
  : nip19.decode(senderPrivateKey).data as string;

const senderPublicKey = getPublicKey(Uint8Array.from(Buffer.from(decodedPrivateKey, 'hex')));

// Turn NIP-05 to hex
async function resolveNIP05(nip05: string): Promise<string> {
  const [localPart, domain] = nip05.split('@');
  if (!localPart || !domain) throw new Error('NIP-05 format invalid');

  const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Response error in NIP-05: ${response.statusText}`);

  const data = await response.json();
  const pubkey = data.names?.[localPart];
  if (!pubkey || !/^[0-9a-fA-F]{64}$/.test(pubkey)) throw new Error('Invalid or not found pubkey in NIP-05');
  return pubkey;
}

// Normalize NIP-05, npub formats to hex
async function normalizePubkey(input: string): Promise<string> {
  if (/^[0-9a-fA-F]{64}$/.test(input)) return input;
  if (input.startsWith('npub')) return nip19.decode(input).data as string;
  if (input.includes('@')) return await resolveNIP05(input);
  throw new Error('Pubkey format unsupported: should be hex, npub o NIP-05');
}

// Send NOSTR message
export async function sendNOSTRMessage(userPubKey: string, orderId: string): Promise<boolean> {
  // Normalize pubkey
  const normalizedPubkey = await normalizePubkey(userPubKey);
  // Create QR
  const qrContent = `https://cowork.lacrypta.ar/qr/${encodeURIComponent(orderId)}`;
  const message = `
  ¡Tu ticket para el Martes de Cowork de La Crypta!
  \n
  🎟 Código de ticket: 
  ${orderId}
  \n
  🔍 Escanea este QR para el check-in:
  ${qrContent}
  \n
  ¡Gracias por tu colaboración! 🫡`;

  // Encrypt message
  const encryptedContent = await nip04.encrypt(decodedPrivateKey, normalizedPubkey, message);

  // Create event 4 (private message)
  const event: Event = {
    kind: 4,
    pubkey: senderPublicKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['p', normalizedPubkey]],
    content: encryptedContent,
    id: '',
    sig: ''
  };

  // Sign event
  const signedEvent = finalizeEvent(event, Uint8Array.from(Buffer.from(decodedPrivateKey, 'hex')));

  // Send message to relays
  const pool = new SimplePool();
  try {
    const publishPromises = pool.publish(RELAYS, signedEvent);
    const results = await Promise.allSettled(publishPromises);

    const success = results.some(result => result.status === 'fulfilled');
    if (success) {
      console.log(`Message sent successfully at ${normalizedPubkey} via pool of relays`);
      return true;
    } else {
      throw new Error('Event rejected by all the relays');
    }
  } catch (error) {
    console.error('General error trying to send the message:', error);
    throw error;
  } finally {
    pool.close(RELAYS);
  }
}