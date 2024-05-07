// The entry file of your WebAssembly module.
import {
  Address,
  Context,
  Storage,
  balance,
  isDeployingContract,
  setBytecode,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  boolToByte,
  bytesToString,
  bytesToU256,
  stringToBytes,
  u256ToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  _approve,
  _balanceOf,
  _constructor,
  _getApproved,
  _isApprovedForAll,
  _name,
  _ownerOf,
  _setApprovalForAll,
  _symbol,
  _update,
  _transferFrom,
} from '@massalabs/sc-standards/assembly/contracts/NFT/NFT-internals';
import {
  _setOwner,
  _onlyOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import { u256 } from 'as-bignum/assembly';

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param _binaryArgs - Arguments serialized with Args (none)
 */
export function constructor(_binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(isDeployingContract());
  _constructor('MassaNameService', 'MNS');
  Storage.set(COUNTER_KEY, u256ToBytes(u256.Zero));
  _setOwner(Context.caller().toString());
  return;
}

// DNS RELATED FUNCTIONS

const COUNTER_KEY: StaticArray<u8> = [0x00];
const TOKEN_ID_KEY_PREFIX: StaticArray<u8> = [0x01];
const TARGET_KEY_PREFIX: StaticArray<u8> = [0x02];
const DOMAIN_KEY_PREFIX: StaticArray<u8> = [0x03];

function calculateCreationCost(sizeDomain: u64): u64 {
  if (sizeDomain <= 2) {
    return 10_000_000_000_000;
  } else if (sizeDomain == 3) {
    return 1_000_000_000_000;
  } else if (sizeDomain == 4) {
    return 100_000_000_000;
  } else if (sizeDomain == 5) {
    return 10_000_000_000;
  }
  return 1_000_000_000;
}

function calculateRefund(sizeDomain: u64): u64 {
  if (sizeDomain <= 2) {
    return 10_000_000_000_000 / 2;
  } else if (sizeDomain == 3) {
    return 1_000_000_000_000 / 2;
  } else if (sizeDomain == 4) {
    return 100_000_000_000 / 2;
  } else if (sizeDomain == 5) {
    return 10_000_000_000 / 2;
  }
  return 1_000_000_000 / 2;
}

function isValidDomain(domain: string): bool {
  if (domain.length < 2 || domain.length > 100) {
    return false;
  }
  for (let i = 0; i < domain.length; i++) {
    let c = domain.charCodeAt(i);
    // Must be lowercase or hyphen
    if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 122) || c == 45)) {
      return false;
    }
  }
  return true;
}

function buildTokenIdKey(domain: string): StaticArray<u8> {
  return TOKEN_ID_KEY_PREFIX.concat(stringToBytes(domain));
}

function buildDomainKey(tokenId: u256): StaticArray<u8> {
  return DOMAIN_KEY_PREFIX.concat(u256ToBytes(tokenId));
}

function buildTargetKey(domain: string): StaticArray<u8> {
  return TARGET_KEY_PREFIX.concat(stringToBytes(domain));
}

/**
 * Register domain
 * @param binaryArgs - (domain: string, target: string)
 * @returns tokenId of the dns as u256
 */
export function dnsAlloc(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  let initialBalance = balance();
  let args = new Args(binaryArgs);
  let domain = args.nextString().unwrap();
  let target = args.nextString().unwrap();
  let owner = Context.caller().toString();

  assert(isValidDomain(domain), 'Invalid domain');
  let targetKey = buildTargetKey(domain);
  assert(!Storage.has(targetKey), 'Domain already registered');
  Storage.set(targetKey, stringToBytes(target));

  assert(Storage.has(COUNTER_KEY), 'Counter not initialized');
  let counter = bytesToU256(Storage.get(COUNTER_KEY));
  _update(owner, counter, '');

  Storage.set(buildDomainKey(counter), stringToBytes(domain));
  Storage.set(buildTokenIdKey(domain), u256ToBytes(counter));
  // @ts-ignore (fix for IDE)
  Storage.set(COUNTER_KEY, u256ToBytes(counter + u256.One));
  let finalBalance = balance();
  let storageCosts = initialBalance - finalBalance;
  let domainCost = calculateCreationCost(domain.length) - storageCosts;
  let transferredCoins = Context.transferredCoins();
  assert(
    transferredCoins >= domainCost,
    'Insufficient funds to register domain. Provided:' +
      transferredCoins.toString() +
      '. Needed: ' +
      domainCost.toString() +
      '.',
  );
  return u256ToBytes(counter);
}

/**
 * Simulate domain registration
 * @param binaryArgs - (domain: string)
 * @returns number of coins needed to register the domain (in nanoMAS)
 */
export function dnsAllocCost(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  let args = new Args(binaryArgs);
  let domain = args.nextString().unwrap();
  assert(isValidDomain(domain), 'Invalid domain');

  // Add 0.1 MAS for storage fees
  let domainCost = calculateCreationCost(domain.length) + 100_000_000;
  return u64ToBytes(domainCost);
}

/**
 * Free domain and refund half of the registration fee
 * @param binaryArgs - (tokenId: u256)
 * @returns void
 */
export function dnsFree(binaryArgs: StaticArray<u8>): void {
  let args = new Args(binaryArgs);
  let tokenId = args.nextU256().unwrap();

  let domainKey = buildDomainKey(tokenId);
  assert(Storage.has(domainKey), 'Domain not registered');
  let owner = _ownerOf(tokenId);
  assert(new Address(owner) == Context.caller(), 'Only owner can free domain');

  let domain = bytesToString(Storage.get(domainKey));
  Storage.del(domainKey);
  _update('', tokenId, '');
  Storage.del(buildTargetKey(domain));
  Storage.del(buildTokenIdKey(domain));
  transferCoins(Context.caller(), calculateRefund(domain.length));
  return;
}

/**
 * Get the target address associated with a domain
 * @param args - (domain: string)
 * @returns Address target of the domain
 */
export function dnsResolve(args: StaticArray<u8>): StaticArray<u8> {
  const argsObj = new Args(args);
  const domain = argsObj
    .nextString()
    .expect('domain argument is missing or invalid');
  const target = Storage.get(buildTargetKey(domain));
  return target;
}

/**
 * Update the target address associated with a domain. Only the owner can update the target.
 * @param binaryArgs - (domain: string, newTarget: string)
 */
export function dnsUpdateTarget(binaryArgs: StaticArray<u8>): void {
  const argsObj = new Args(binaryArgs);
  const domain = argsObj
    .nextString()
    .expect('domain argument is missing or invalid');
  const newTarget = argsObj
    .nextString()
    .expect('target argument is missing or invalid');

  const tokenId = bytesToU256(Storage.get(buildTokenIdKey(domain)));
  const owner = _ownerOf(tokenId);
  assert(
    new Address(owner) == Context.caller(),
    'Only owner can update target',
  );

  Storage.set(buildTargetKey(domain), stringToBytes(newTarget));
}

/**
 * Upgrade the DNS smart contract bytecode
 * @param args - new bytecode
 * @returns void
 */
export function upgradeSC(args: StaticArray<u8>): void {
  _onlyOwner();
  setBytecode(args);
}

/**
 * Transfer internal coins to another address
 * @param binaryArgs - (to: string, amount: u64)
 * @returns void
 */
export function transferInternalCoins(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const argsObj = new Args(binaryArgs);
  const to = argsObj.nextString().expect('to argument is missing or invalid');
  const amount = argsObj
    .nextU64()
    .expect('amount argument is missing or invalid');
  transferCoins(new Address(to), amount);
}

/**
 * Get the tokenId of the domain
 * @param binaryArgs - (domain: string)
 * @returns tokenId of the domain as u256
 */
export function getTokenIdFromDomain(
  binaryArgs: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const domain = args
    .nextString()
    .expect('domain argument is missing or invalid');
  return Storage.get(buildTokenIdKey(domain));
}

/**
 * Get the domain from the tokenId
 * @param binaryArgs - (tokenId: u256)
 * @returns domain of the tokenId
 */
export function getDomainFromTokenId(
  binaryArgs: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');
  return Storage.get(buildDomainKey(tokenId));
}

// NFT RELATED FUNCTIONS

/**
 * Get the name of the NFT collection
 * @returns name of the NFT collection
 */
export function name(): StaticArray<u8> {
  return stringToBytes(_name());
}

/**
 * Get the symbol of the NFT collection
 * @returns symbol of the NFT collection
 */
export function symbol(): StaticArray<u8> {
  return stringToBytes(_symbol());
}

/**
 * Returns the number of tokens owned by the address
 * @param binaryArgs - (address: string)
 * @returns Number of tokens owned by the address in u256 as bytes
 */
export function balanceOf(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args
    .nextString()
    .expect('address argument is missing or invalid');
  return u256ToBytes(_balanceOf(address));
}

/**
 * Get the owner of the token
 * @param binaryArgs - (tokenId: u256)
 * @returns Address of the owner of the token
 */
export function ownerOf(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');
  const owner = _ownerOf(tokenId);
  if (owner == '') {
    throw new Error('Token id not found');
  }
  return stringToBytes(owner);
}

/**
 * Transfer token from one address to another
 * @param binaryArgs - (from: string, to: string, tokenId: u256)
 */
export function transferFrom(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const from = args.nextString().expect('from argument is missing or invalid');
  const to = args.nextString().expect('to argument is missing or invalid');
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');
  _transferFrom(from, to, tokenId);
}

/**
 * Approve the address to transfer the token
 * @param binaryArgs - (to: string, tokenId: u256)
 */
export function approve(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const to = args.nextString().expect('to argument is missing or invalid');
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');
  _approve(to, tokenId);
}

/**
 * Set approval for all tokens of the owner
 * @param binaryArgs - (to: string, approved: bool)
 */
export function setApprovalForAll(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const to = args.nextString().expect('to argument is missing or invalid');
  const approved = args
    .nextBool()
    .expect('approved argument is missing or invalid');
  _setApprovalForAll(to, approved);
}

/**
 * Get the address approved to transfer the token or empty address if none
 * @param binaryArgs - (tokenId: u256)
 * @returns Address of the approved address
 */
export function getApproved(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');
  return stringToBytes(_getApproved(tokenId));
}

/**
 * Returns if the operator is approved to transfer the tokens of the owner
 * @param binaryArgs - (owner: string, operator: string)
 * @returns Bool as bytes
 */
export function isApprovedForAll(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const owner = args
    .nextString()
    .expect('owner argument is missing or invalid');
  const operator = args
    .nextString()
    .expect('operator argument is missing or invalid');
  return boolToByte(_isApprovedForAll(owner, operator));
}
