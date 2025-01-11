import { strToBytes } from '@massalabs/massa-web3';

export const TARGET_KEY_PREFIX = [0x02];
export const DOMAIN_KEY_PREFIX = [0x03];
export const DOMAIN_SEPARATOR_KEY = [0x42];

export function getDomainKey(id: Uint8Array): Uint8Array {
  return Uint8Array.from([
    ...DOMAIN_SEPARATOR_KEY,
    ...DOMAIN_KEY_PREFIX,
    ...id,
  ]);
}

export function getTargetKey(domain: string): Uint8Array {
  return Uint8Array.from([
    ...DOMAIN_SEPARATOR_KEY,
    ...TARGET_KEY_PREFIX,
    ...strToBytes(domain),
  ]);
}
