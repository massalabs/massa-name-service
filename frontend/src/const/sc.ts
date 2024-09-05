import { fromMAS } from '@massalabs/massa-web3';

export const MAINNET_SC_ADDRESS = import.meta.env.VITE_MAINNET_SC_ADDRESS;
export const BUILDNET_SC_ADDRESS = import.meta.env.VITE_BUILDNET_SC_ADDRESS;

export const VESTING_SESSION_STORAGE_COST = fromMAS(2);
let defaultOpFees: bigint;
try {
  defaultOpFees = BigInt(import.meta.env.VITE_OP_FEES);
} catch (error) {
  console.error('Failed to parse VITE_OP_FEES', error);
  defaultOpFees = BigInt(0);
}
export const DEFAULT_OP_FEES = defaultOpFees;
