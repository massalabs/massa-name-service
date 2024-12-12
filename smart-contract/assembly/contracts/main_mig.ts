import {
  Address,
  Context,
  Storage,
  balance,
  generateEvent,
  setBytecode,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToString,
  bytesToU256,
  stringToBytes,
  u256ToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  _update,
  _ownerOf,
  TOTAL_SUPPLY_KEY,
  _getOwnedTokensKeyPrefix,
  _increaseTotalSupply,
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
  Storage.set(buildLockedKey(), u256ToBytes(u256.Zero));
  Storage.set(TOTAL_SUPPLY_KEY, u256ToBytes(u256.Zero));
}

// DNS RELATED FUNCTIONS

const DOMAIN_SEPARATOR_KEY: StaticArray<u8> = [0x42];

const COUNTER_KEY: StaticArray<u8> = [0x00];
const TOKEN_ID_KEY_PREFIX: StaticArray<u8> = [0x01];
const TARGET_KEY_PREFIX: StaticArray<u8> = [0x02];
const DOMAIN_KEY_PREFIX: StaticArray<u8> = [0x03];
const ADDRESS_KEY_PREFIX: StaticArray<u8> = [0x04];
const LOCKED_KEY_PREFIX: StaticArray<u8> = [0x05];

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

function buildTokenIdKey(domain: string): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(
    TOKEN_ID_KEY_PREFIX.concat(stringToBytes(domain)),
  );
}

function buildDomainKey(tokenId: u256): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(
    DOMAIN_KEY_PREFIX.concat(u256ToBytes(tokenId)),
  );
}

function buildTargetKey(domain: string): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(
    TARGET_KEY_PREFIX.concat(stringToBytes(domain)),
  );
}

function buildAddressKey(address: string): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(
    ADDRESS_KEY_PREFIX.concat(stringToBytes(address)),
  );
}

function buildLockedKey(): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(LOCKED_KEY_PREFIX);
}

/**
 * Lock the contract
 */
export function dnsLock(_: StaticArray<u8>): void {
  _onlyOwner();
  Storage.set(buildLockedKey(), u256ToBytes(u256.Zero));
}

/**
 * Unlock the contract
 */
export function dnsUnlock(_: StaticArray<u8>): void {
  _onlyOwner();
  Storage.del(buildLockedKey());
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
 * Register domain
 * @param binaryArgs - (domain: string, target: string)
 * @returns tokenId of the dns as u256
 */
export function dnsAlloc(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  if (Storage.has(buildLockedKey()) && !_isOwner(Context.caller().toString())) {
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
  const targetKey = buildTargetKey(domain);
  assert(!Storage.has(targetKey), 'Domain already registered');
  Storage.set(targetKey, stringToBytes(target));

  assert(Storage.has(COUNTER_KEY), 'Counter not initialized');
  const counter = bytesToU256(Storage.get(COUNTER_KEY));
  // Transfer ownership of the domain to the caller
  _update(owner, counter, '');

  Storage.set(buildDomainKey(counter), stringToBytes(domain));
  Storage.set(buildTokenIdKey(domain), u256ToBytes(counter));

  let entries: string[] = [];
  const addressKey = buildAddressKey(target);
  if (Storage.has(addressKey)) {
    entries = bytesToString(Storage.get(addressKey)).split(',');
  }
  entries.push(domain);
  Storage.set(addressKey, stringToBytes(entries.join(',')));

  // @ts-ignore (fix for IDE)
  Storage.set(COUNTER_KEY, u256ToBytes(counter + u256.One));
  const finalBalance = balance();
  const storageCosts = initialBalance - finalBalance;
  const totalCost = calculateCreationCost(domain.length) + storageCosts;
  const transferredCoins = Context.transferredCoins();
  assert(
    transferredCoins >= totalCost,
    'Insufficient funds to register domain. Provided:' +
      transferredCoins.toString() +
      '. Needed: ' +
      totalCost.toString() +
      '.',
  );
  if (transferredCoins > totalCost) {
    const amountToSend = transferredCoins - totalCost;
    transferCoins(Context.caller(), amountToSend);
  }
  return u256ToBytes(counter);
}

/**
 * Free domain and refund half of the registration fee
 * @param binaryArgs - (tokenId: u256)
 * @returns void
 */
export function dnsFree(binaryArgs: StaticArray<u8>): void {
  if (Storage.has(buildLockedKey()) && !_isOwner(Context.caller().toString())) {
    throw new Error('Free is locked');
  }
  const initialBalance = balance();
  const args = new Args(binaryArgs);
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');

  const domainKey = buildDomainKey(tokenId);
  assert(Storage.has(domainKey), 'Domain not registered');
  const owner = _ownerOf(tokenId);
  assert(new Address(owner) == Context.caller(), 'Only owner can free domain');

  const domain = bytesToString(Storage.get(domainKey));
  Storage.del(domainKey);
  // Transfer ownership of the domain to empty address
  _update('', tokenId, '');

  let targetKey = buildTargetKey(domain);
  let target = bytesToString(Storage.get(targetKey));
  let addressDomains = bytesToString(
    Storage.get(buildAddressKey(target)),
  ).split(',');
  const index = addressDomains.indexOf(domain);
  addressDomains.splice(index, 1);
  if (addressDomains.length == 0) {
    Storage.del(buildAddressKey(target));
  } else {
    Storage.set(
      buildAddressKey(target),
      stringToBytes(addressDomains.join(',')),
    );
  }

  Storage.del(targetKey);
  Storage.del(buildTokenIdKey(domain));
  const finalBalance = balance();
  const storageCostsRefunded = finalBalance - initialBalance;
  const refundTotal =
    calculateCreationCost(domain.length) / 2 +
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
  const target = Storage.get(buildTargetKey(domain));
  return target;
}

/** Get a list of domain associated with an address
 * @param args - (address: string)
 *
 * @returns List of domains as string separated by comma
 */
export function dnsReverseResolve(args: StaticArray<u8>): StaticArray<u8> {
  const argsObj = new Args(args);
  const address = argsObj
    .nextString()
    .expect('address argument is missing or invalid');
  return Storage.get(buildAddressKey(address));
}

/**
 * Update the target address associated with a domain. Only the owner can update the target.
 * @param binaryArgs - (domain: string, newTarget: string)
 */
export function dnsUpdateTarget(binaryArgs: StaticArray<u8>): void {
  if (Storage.has(buildLockedKey()) && !_isOwner(Context.caller().toString())) {
    throw new Error('Update Target is locked');
  }
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

  const previousTarget = bytesToString(Storage.get(buildTargetKey(domain)));
  const addressDomains = bytesToString(
    Storage.get(buildAddressKey(previousTarget)),
  ).split(',');
  const index = addressDomains.indexOf(domain);
  addressDomains.splice(index, 1);
  if (addressDomains.length == 0) {
    Storage.del(buildAddressKey(previousTarget));
  } else {
    Storage.set(
      buildAddressKey(previousTarget),
      stringToBytes(addressDomains.join(',')),
    );
  }

  let entries: string[] = [];
  const addressKey = buildAddressKey(newTarget);
  if (Storage.has(addressKey)) {
    entries = bytesToString(Storage.get(addressKey)).split(',');
  }
  entries.push(domain);
  Storage.set(addressKey, stringToBytes(entries.join(',')));

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
  if (!Storage.has(buildTokenIdKey(domain))) {
    throw new Error('Domain not found');
  }
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
  assert(!Storage.has(buildLockedKey()), 'Contract is locked');
  _transferFrom(binaryArgs);
}

// TEMP CODE
const MIGRATE_COUNTER_KEY: StaticArray<u8> = [0x06];

function migrateCounterdKey(): StaticArray<u8> {
  return DOMAIN_SEPARATOR_KEY.concat(MIGRATE_COUNTER_KEY);
}

export function migrate(_binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const BATCH_SIZE = 3000;

  let migrateCounter = u256.Zero;
  if (Storage.has(migrateCounterdKey())) {
    migrateCounter = bytesToU256(Storage.get(migrateCounterdKey()));
  }
  if (!Storage.has(TOTAL_SUPPLY_KEY)) {
    Storage.set(TOTAL_SUPPLY_KEY, u256ToBytes(u256.Zero));
  }
  const legacyCounter = bytesToU256(Storage.get(COUNTER_KEY)).toI32();

  const migrateCountStart = migrateCounter.toI32();
  let i = 0;
  let tokenBalanceAdded = 0;
  for (i = 0; i < BATCH_SIZE; i++) {
    const tokenIdI32 = i + migrateCountStart;
    const tokenId = u256.fromI32(tokenIdI32);

    if (tokenIdI32 >= legacyCounter) {
      generateEvent(`Reached total counter ${legacyCounter}`);
      break;
    }

    const owner = _ownerOf(tokenId);
    if (owner == '') {
      generateEvent(`Token ${tokenIdI32} has no owner. Skipping.`);
      continue;
    }
    tokenBalanceAdded += 1;

    // not exported
    // _addTokenToOwnerEnumeration(to, tokenId);
    const key = _getOwnedTokensKeyPrefix(owner).concat(u256ToBytes(tokenId));
    Storage.set(key, []);
  }

  _increaseTotalSupply(u256.fromI32(tokenBalanceAdded));

  // update migration counter
  Storage.set(
    migrateCounterdKey(),
    u256ToBytes(u256.fromI32(i + migrateCountStart)),
  );
  generateEvent(
    `Migrated ${i} tokens. Total migrated: ${i + migrateCountStart}`,
  );
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
