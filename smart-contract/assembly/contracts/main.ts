// The entry file of your WebAssembly module.
import {
  Address,
  Context,
  Storage,
  isDeployingContract,
  setBytecode,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  boolToByte,
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
import { u256 } from 'as-bignum/assembly';

/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param binaryArgs - Arguments serialized with Args
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(isDeployingContract());
  const name = 'MassaNameService';
  const symbol = 'MNS';
  _constructor(name, symbol);
  Storage.set(ADMIN_KEY, Context.caller().toString());
  Storage.set(COUNTER_KEY, u256ToBytes(u256.Zero));
  return;
}

// DNS RELATED FUNCTIONS

const COUNTER_KEY = stringToBytes('counter');
const ADMIN_KEY = 'admin';
const TOKEN_ID_KEY_PREFIX = 'token';
const TARGET_KEY_PREFIX = 'target';
const DOMAIN_KEY_PREFIX = 'domain';

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
  if (domain.length < 2) {
    return false;
  }
  for (let i = 0; i < domain.length; i++) {
    let c = domain.charCodeAt(i);
    if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 122) || c == 45)) {
      return false;
    }
  }
  return true;
}

function buildTokenIdKey(domain: string): StaticArray<u8> {
  return stringToBytes(TOKEN_ID_KEY_PREFIX + domain);
}

function buildDomainKey(tokenId: u256): string {
  return DOMAIN_KEY_PREFIX + tokenId.toString();
}

function buildTargetKey(domain: string): string {
  return TARGET_KEY_PREFIX + domain;
}

/**
 * Register domain
 * @param binaryArgs (domain: string, target: string)
 * @returns tokenId of the dns as u256
 */
export function dns_alloc(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  let args = new Args(binaryArgs);
  let domain = args.nextString().unwrap();
  let target = args.nextString().unwrap();
  let owner = Context.caller().toString();
  if (!isValidDomain(domain)) {
    throw new Error('Invalid domain');
  }
  let domainCost = calculateCreationCost(domain.length);
  let transferredCoins = Context.transferredCoins();
  if (transferredCoins < domainCost) {
    throw new Error(
      'Insufficient funds to register domain. Provided:' +
        transferredCoins.toString() +
        '. Needed: ' +
        domainCost.toString() +
        '.',
    );
  }
  let domainKey = buildTargetKey(domain);
  if (Storage.has(domainKey)) {
    throw new Error('Domain already registered');
  }
  Storage.set(domainKey, target);
  assert(Storage.has(COUNTER_KEY), 'Counter not initialized');
  let counter = bytesToU256(Storage.get(COUNTER_KEY));
  _update(owner, counter, '');
  Storage.set(buildDomainKey(counter), domain);
  Storage.set(buildTokenIdKey(domain), u256ToBytes(counter));
  // @ts-ignore (fix for IDE)
  Storage.set(COUNTER_KEY, u256ToBytes(counter + u256.One));
  return u256ToBytes(counter);
}

/**
 * Simulate domain registration
 * @param binaryArgs (domain: string)
 * @returns number of coins needed to register the domain (in nanoMAS)
 */
export function dns_alloc_cost(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  let args = new Args(binaryArgs);
  let domain = args.nextString().unwrap();
  if (!isValidDomain(domain)) {
    throw new Error('Invalid domain');
  }
  // Add 0.1 MAS for storage fees
  let domainCost = calculateCreationCost(domain.length) + 100_000_000;
  return u64ToBytes(domainCost);
}

/**
 * Free domain and refund half of the registration fee
 * @param binaryArgs (tokenId: u256)
 * @returns void
 */
export function dns_free(binaryArgs: StaticArray<u8>): void {
  let args = new Args(binaryArgs);
  let tokenId = args.nextU256().unwrap();
  let domainKey = buildDomainKey(tokenId);
  if (!Storage.has(domainKey)) {
    throw new Error('Domain not registered');
  }
  let owner = _ownerOf(tokenId);
  if (new Address(owner) != Context.caller()) {
    throw new Error('Only owner can free domain');
  }
  let domain = Storage.get(domainKey);
  Storage.del(domainKey);
  _update('', tokenId, '');
  Storage.del(buildTargetKey(domain));
  Storage.del(buildTokenIdKey(domain));
  transferCoins(Context.caller(), calculateRefund(domain.length));
  return;
}

/**
 * Get the target address associated with a domain
 * @param args (domain: string)
 * @returns Address target of the domain
 */
export function dns_resolve(args: StaticArray<u8>): StaticArray<u8> {
  const argsObj = new Args(args);
  const domain = argsObj
    .nextString()
    .expect('domain argument is missing or invalid');
  const target = Storage.get(buildTargetKey(domain));
  return stringToBytes(target);
}

/**
 * Update the target address associated with a domain. Only the owner can update the target.
 * @param binaryArgs (domain: string, newTarget: string)
 */
export function dns_update_target(binaryArgs: StaticArray<u8>): void {
  const argsObj = new Args(binaryArgs);
  const domain = argsObj
    .nextString()
    .expect('domain argument is missing or invalid');
  const newTarget = argsObj
    .nextString()
    .expect('target argument is missing or invalid');
  const tokenId = bytesToU256(Storage.get(buildTokenIdKey(domain)));
  const owner = _ownerOf(tokenId);
  if (new Address(owner) != Context.caller()) {
    throw new Error('Only owner can update target');
  }
  Storage.set(buildTargetKey(domain), newTarget);
}

/**
 * Upgrade the DNS smart contract bytecode
 * @param args new bytecode
 * @returns void
 */
export function upgradeSC(args: StaticArray<u8>): void {
  if (Context.caller() != new Address(Storage.get(ADMIN_KEY))) {
    return;
  }
  setBytecode(args);
}

/**
 * Transfer internal coins to another address
 * @param binaryArgs (to: string, amount: u64)
 * @returns void
 */
export function transferInternalCoins(binaryArgs: StaticArray<u8>): void {
  if (Context.caller() != new Address(Storage.get(ADMIN_KEY))) {
    throw new Error('Only admin can transfer internal coins');
  }
  const argsObj = new Args(binaryArgs);
  const to = argsObj.nextString().expect('to argument is missing or invalid');
  const amount = argsObj
    .nextU64()
    .expect('amount argument is missing or invalid');
  transferCoins(new Address(to), amount);
}

/**
 * Get the tokenId of the domain
 * @param binaryArgs (domain: string)
 * @returns tokenId of the domain as u256
 */
export function getTokenIdFromDomain(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const domain = args
    .nextString()
    .expect('domain argument is missing or invalid');
  return Storage.get(buildTokenIdKey(domain));
}

/**
 * Get the domain from the tokenId
 * @param binaryArgs (tokenId: u256)
 * @returns domain of the tokenId
 */
export function getDomainFromTokenId(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args
    .nextU256()
    .expect('tokenId argument is missing or invalid');
  return stringToBytes(Storage.get(buildDomainKey(tokenId)));
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
 * @param binaryArgs (address: string)
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
 * @param binaryArgs (tokenId: u256)
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
 * @param binaryArgs (from: string, to: string, tokenId: u256)
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
 * @param binaryArgs (to: string, tokenId: u256)
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
 * @param binaryArgs (to: string, approved: bool)
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
 * @param binaryArgs (tokenId: u256)
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
 * @param binaryArgs (owner: string, operator: string)
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
