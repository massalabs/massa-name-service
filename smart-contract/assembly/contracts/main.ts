import {
  Address,
  Context,
  Storage,
  balance,
  getKeys,
  setBytecode,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToU256,
  stringToBytes,
  u256ToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  _update,
  _ownerOf,
  TOTAL_SUPPLY_KEY,
} from '@massalabs/sc-standards/assembly/contracts/MRC721/enumerable/MRC721Enumerable-internals';
import {
  transferFrom as _transferFrom,
  mrc721Constructor,
} from '@massalabs/sc-standards/assembly/contracts/MRC721/enumerable/MRC721Enumerable';
import {
  _onlyOwner,
  _isOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';

import { u256 } from 'as-bignum/assembly';

export function constructor(_: StaticArray<u8>): void {
  mrc721Constructor('MassaNameService', 'MNS');
  Storage.set(COUNTER_KEY, u256ToBytes(u256.Zero));
  Storage.set(lockedKey(), u256ToBytes(u256.Zero));
  Storage.set(TOTAL_SUPPLY_KEY, u256ToBytes(u256.Zero));
}

// DNS RELATED FUNCTIONS

const DOMAIN_SEPARATOR_KEY: StaticArray<u8> = [0x42];

const COUNTER_KEY: StaticArray<u8> = [0x00];
const TOKEN_ID_KEY_PREFIX: StaticArray<u8> = [0x01];
const TARGET_KEY_PREFIX: StaticArray<u8> = [0x02];
const DOMAIN_KEY_PREFIX: StaticArray<u8> = [0x03];
// const ADDRESS_KEY_PREFIX: StaticArray<u8> = [0x04];
const LOCKED_KEY_PREFIX: StaticArray<u8> = [0x05];
const ADDRESS_KEY_PREFIX_V2: StaticArray<u8> = [0x06];

// Be careful if we edit the values here to increase the price, it requires to change the refund
// logic in dnsFree function to avoid refunding more than the user paid with the old prices.
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

// @ts-ignore (fix for IDE)
@inline
function isNotNumber(c: i32): bool {
  const zero = 48;
  const nine = 57;
  return c < zero || c > nine;
}

// @ts-ignore (fix for IDE)
@inline
function isNotLowercaseLetter(c: i32): bool {
  const a = 97;
  const z = 122;
  return c < a || c > z;
}

// @ts-ignore (fix for IDE)
@inline
function isNotHyphen(c: i32): bool {
  return c != 45;
}

export function isValidDomain(domain: string): bool {
  if (domain.length < 2 || domain.length > 100) {
    return false;
  }
  for (let i = 0; i < domain.length; i++) {
    const c = domain.charCodeAt(i);
    // Must be lowercase or hyphen
    if (isNotNumber(c) && isNotLowercaseLetter(c) && isNotHyphen(c)) {
      return false;
    }
  }
  return true;
}

export function isValidTarget(target: string): bool {
  return target.length <= 150;
}

function domainToTokenIdKey(domainBytes: StaticArray<u8>): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(TOKEN_ID_KEY_PREFIX.concat(domainBytes));
}

function tokenIdToDomainKey(tokenIdBytes: StaticArray<u8>): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(DOMAIN_KEY_PREFIX.concat(tokenIdBytes));
}

function domainToTargetKey(domainBytes: StaticArray<u8>): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(TARGET_KEY_PREFIX.concat(domainBytes));
}

function targetToDomainKeyPrefix(
  targetBytes: StaticArray<u8>,
): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(ADDRESS_KEY_PREFIX_V2.concat(targetBytes));
}

function targetToDomainKey(
  targetBytes: StaticArray<u8>,
  domainBytes: StaticArray<u8>,
): StaticArray<u8> {
  return targetToDomainKeyPrefix(targetBytes).concat(domainBytes);
}

function lockedKey(): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(LOCKED_KEY_PREFIX);
}

/**
 * Lock the contract
 */
export function dnsLock(_: StaticArray<u8>): void {
  _onlyOwner();
  Storage.set(lockedKey(), u256ToBytes(u256.Zero));
}

/**
 * Unlock the contract
 */
export function dnsUnlock(_: StaticArray<u8>): void {
  _onlyOwner();
  Storage.del(lockedKey());
}

/**
 * Calculate the cost of the dns allocation
 * @param binaryArgs - (domain: string, target: string)
 *
 * @returns cost of the dns allocation as u64
 */
export function dnsAllocCost(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const domain = args
    .nextString()
    .expect('domain argument is missing or invalid');
  assert(isValidDomain(domain), 'Invalid domain');
  return u64ToBytes(calculateCreationCost(domain.length) + 100_000_000);
}

/**
 * Register a domain
 * @param binaryArgs - (domain: string, target: string)
 * @returns tokenId of the dns as u256
 */
export function dnsAlloc(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  if (Storage.has(lockedKey()) && !_isOwner(Context.caller().toString())) {
    throw new Error('Domain allocation is locked');
  }

  const initialBalance = balance();
  const args = new Args(binaryArgs);

  const domain = args
    .nextString()
    .expect('domain argument is missing or invalid');
  const target = args
    .nextString()
    .expect('target argument is missing or invalid');
  const owner = Context.caller().toString();

  assert(isValidDomain(domain), 'Invalid domain');
  assert(isValidTarget(target), 'Invalid target');
  assert(
    !Storage.has(domainToTargetKey(stringToBytes(domain))),
    'Domain already registered',
  );

  const counterBytes = Storage.get(COUNTER_KEY);

  const counter = bytesToU256(counterBytes);

  // Mint the token
  _update(owner, counter, '');

  // Store the domain and token ID
  const targetBytes = stringToBytes(target);
  const domainBytes = stringToBytes(domain);
  Storage.set(domainToTargetKey(domainBytes), targetBytes);
  Storage.set(targetToDomainKey(targetBytes, domainBytes), []);
  Storage.set(tokenIdToDomainKey(counterBytes), domainBytes);
  Storage.set(domainToTokenIdKey(domainBytes), counterBytes);
  // @ts-ignore (fix for IDE)
  Storage.set(COUNTER_KEY, u256ToBytes(counter + u256.One));

  const storageCosts = initialBalance - balance();
  const totalCost = calculateCreationCost(domain.length) + storageCosts;
  const transferredCoins = Context.transferredCoins();

  assert(
    transferredCoins >= totalCost,
    `Insufficient funds to register domain. Provided: ${transferredCoins.toString()}, Needed: ${totalCost.toString()}.`,
  );
  if (transferredCoins > totalCost) {
    transferCoins(Context.caller(), transferredCoins - totalCost);
  }
  return u256ToBytes(counter);
}

/**
 * Free domain and refund half of the registration fee
 * @param binaryArgs - (tokenId: u256)
 * @returns void
 */
export function dnsFree(binaryArgs: StaticArray<u8>): void {
  if (Storage.has(lockedKey()) && !_isOwner(Context.caller().toString())) {
    throw new Error('Free is locked');
  }

  const initialBalance = balance();
  const args = new Args(binaryArgs);
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');

  assert(
    new Address(_ownerOf(tokenId)) == Context.caller(),
    'Only owner can free domain',
  );

  // Burn the token
  _update('', tokenId, '');

  const tokenIdBytes = u256ToBytes(tokenId);
  // Retrieve the domain
  const idToDomainKey = tokenIdToDomainKey(tokenIdBytes);
  assert(Storage.has(idToDomainKey), 'Domain not registered');

  const domainBytes = Storage.get(idToDomainKey);

  // Retrieve and delete the target
  const domainToTargetK = domainToTargetKey(domainBytes);
  const targetBytes = Storage.get(domainToTargetK);

  // Delete all associated keys
  Storage.del(domainToTargetK);
  Storage.del(targetToDomainKey(targetBytes, domainBytes));
  Storage.del(idToDomainKey);
  Storage.del(domainToTokenIdKey(domainBytes));

  const finalBalance = balance();
  const storageCostsRefunded = finalBalance - initialBalance;

  const refundTotal =
    calculateCreationCost(domainBytes.length) / 2 +
    storageCostsRefunded +
    Context.transferredCoins();

  transferCoins(Context.caller(), refundTotal);
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

  return Storage.get(domainToTargetKey(stringToBytes(domain)));
}

/** Get a list of domain associated with an address
 * @param args - (targetAddress: string)
 *
 * @returns List of domains as string separated by comma
 */
export function dnsReverseResolve(args: StaticArray<u8>): StaticArray<u8> {
  const argsObj = new Args(args);
  const targetAddress = argsObj
    .nextString()
    .expect('address argument is missing or invalid');

  const prefix = targetToDomainKeyPrefix(stringToBytes(targetAddress));
  const keys = getKeys(prefix);

  const prefixLength = prefix.length;
  let domains: u8[] = [];

  for (let i = 0; i < keys.length; i++) {
    const domain = keys[i].slice(prefixLength);

    domains = domains.concat(domain);

    if (i < keys.length - 1) {
      domains.push(44 /* coma */);
    }
  }

  return StaticArray.fromArray(domains);
}

/**
 * Update the target address associated with a domain. Only the owner can update the target.
 * @param binaryArgs - (domain: string, newTarget: string)
 */
export function dnsUpdateTarget(binaryArgs: StaticArray<u8>): void {
  if (Storage.has(lockedKey()) && !_isOwner(Context.caller().toString())) {
    throw new Error('Update Target is locked');
  }

  const args = new Args(binaryArgs);
  const domain = args
    .nextString()
    .expect('domain argument is missing or invalid');

  const newTarget = args
    .nextString()
    .expect('target argument is missing or invalid');

  assert(isValidTarget(newTarget), 'Invalid target');

  const domainBytes = stringToBytes(domain);
  const tokenId = bytesToU256(Storage.get(domainToTokenIdKey(domainBytes)));
  const owner = _ownerOf(tokenId);

  assert(
    new Address(owner) == Context.caller(),
    'Only owner can update target',
  );

  // remove the old target
  const oldTarget = Storage.get(domainToTargetKey(domainBytes));
  Storage.del(targetToDomainKey(oldTarget, domainBytes));
  // Add the domain to the new target
  Storage.set(targetToDomainKey(stringToBytes(newTarget), domainBytes), []);
  // Update the target for the domain
  Storage.set(domainToTargetKey(domainBytes), stringToBytes(newTarget));
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
  const domainBytes = stringToBytes(domain);
  if (!Storage.has(domainToTokenIdKey(domainBytes))) {
    throw new Error('Domain not found');
  }
  return Storage.get(domainToTokenIdKey(domainBytes));
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
  const tokenIdBytes = u256ToBytes(tokenId);
  return Storage.get(tokenIdToDomainKey(tokenIdBytes));
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

export function transferFrom(binaryArgs: StaticArray<u8>): void {
  assert(!Storage.has(lockedKey()), 'Contract is locked');
  _transferFrom(binaryArgs);
}

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

export {
  isApprovedForAll,
  setApprovalForAll,
  getApproved,
  approve,
  balanceOf,
  symbol,
  name,
  totalSupply,
} from '@massalabs/sc-standards/assembly/contracts/MRC721/enumerable/MRC721Enumerable';
