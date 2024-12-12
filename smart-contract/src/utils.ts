import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  Account,
  bytesToStr,
  Provider,
  SmartContract,
  U256,
  Web3Provider,
} from '@massalabs/massa-web3';
import { IS_MAINNET, MNS_CONTRACT } from './config';
import 'dotenv/config';

export function getScByteCode(folderName: string, fileName: string): Buffer {
  // Obtain the current file name and directory paths
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(path.dirname(__filename));
  return readFileSync(path.join(__dirname, folderName, fileName));
}

export async function initProvider() {
  const account = await Account.fromEnv();
  return IS_MAINNET
    ? Web3Provider.mainnet(account)
    : Web3Provider.buildnet(account);
}

export const DOMAIN_SEPARATOR_KEY = [0x42];

export async function getTokenCounter(
  provider: Provider,
  contract: string,
): Promise<bigint> {
  const COUNTER_KEY = Uint8Array.from([0x0]);
  const counterData = await provider.readStorage(contract, [COUNTER_KEY]);
  return U256.fromBytes(counterData[0]);
}

export async function getMigrateCounter(
  provider: Provider,
  contract: string,
): Promise<bigint> {
  const MIGRATE_COUNTER_KEY_IDX = [0x06];
  const MIGRATE_COUNTER_KEY = Uint8Array.from([
    ...DOMAIN_SEPARATOR_KEY,
    ...MIGRATE_COUNTER_KEY_IDX,
  ]);
  const counterData = await provider.readStorage(contract, [
    MIGRATE_COUNTER_KEY,
  ]);
  return U256.fromBytes(counterData[0]);
}

export async function getDomains(provider: Provider): Promise<Uint8Array[]> {
  const TOKEN_ID_KEY_PREFIX = [0x1];
  const tokenIdsFilter = Uint8Array.from([
    ...DOMAIN_SEPARATOR_KEY,
    ...TOKEN_ID_KEY_PREFIX,
  ]);
  return provider.getStorageKeys(MNS_CONTRACT, tokenIdsFilter);
}

export async function getTotalSupply(provider: Provider): Promise<bigint> {
  const contract = new SmartContract(provider, MNS_CONTRACT);
  const { value } = await contract.read('totalSupply');
  return U256.fromBytes(value);
}

export async function getOwner(provider: Provider): Promise<string> {
  const contract = new SmartContract(provider, MNS_CONTRACT);
  const { value } = await contract.read('ownerAddress');
  return bytesToStr(value);
}
