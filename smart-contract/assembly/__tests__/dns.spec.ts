import { Args, bytesToU256, bytesToU64, stringToBytes, u256ToBytes } from '@massalabs/as-types';
import {
  constructor,
  name,
  dns_alloc,
  dns_alloc_cost,
  dns_free,
  dns_resolve,
  dns_update_target,
  transferInternalCoins,
  getTokenIdFromDomain,
  getDomainFromTokenId,
  symbol,
  balanceOf,
  ownerOf,
  transferFrom,
} from '../contracts/main';
import {
  balance,
  changeCallStack,
  mockAdminContext,
  mockBalance,
  mockTransferredCoins,
  resetStorage,
} from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';

const owner = 'AU122Em8qkqegdLb1eyH8rdkSCNEf7RZLeTJve4Q2inRPGiTJ2xNv';
const target = 'AU12W92UyGW4Bd94BPniTq4Ra5yhiv6RvjazV2G9Q9GyekYkgqbme';
const domain = 'test';
// address of the contract set in vm-mock. must match with contractAddr of @massalabs/massa-as-sdk/vm-mock/vm.js
const scAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

function switchUser(user: string): void {
  changeCallStack(user + ' , ' + scAddress);
}

// TESTS DNS RELATED FUNCTIONS

describe('Test DNS allocation', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Testing success alloc', () => {
    let args_cost = new Args();
    args_cost.add(domain);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args_cost.serialize())));
    let args = new Args();
    args.add(domain);
    args.add(target);
    expect(dns_alloc(args.serialize())).toStrictEqual(u256ToBytes(u256.Zero));
  });
  test('Testing multiple alloc', () => {
    let args_cost = new Args();
    args_cost.add(domain);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args_cost.serialize())));
    let args = new Args();
    args.add(domain);
    args.add(target);
    expect(dns_alloc(args.serialize())).toStrictEqual(u256ToBytes(u256.Zero));
    let args2 = new Args();
    args2.add('test2');
    args2.add(target);
    expect(dns_alloc(args2.serialize())).toStrictEqual(u256ToBytes(u256.One));
  })
  throws('No funds sent', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    dns_alloc(args.serialize());
  });
  throws('Too low funds sent', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())) - 1_100_000_000);
    dns_alloc(args.serialize());
  });
  throws('Invalid domain', () => {
    let args = new Args();
    args.add('(invalid)');
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
  });
  throws('Domain already exists', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    dns_alloc(args.serialize());
  });
});

describe('Test DNS free', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test success free', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    const tokenId = bytesToU256(dns_alloc(args.serialize()));
    let args_free = new Args();
    args_free.add(tokenId);
    mockBalance(scAddress, bytesToU64(dns_alloc_cost(args.serialize())) / 2);
    dns_free(args_free.serialize());
  });
  throws('Domain not found', () => {
    let args = new Args();
    args.add(domain);
    dns_free(args.serialize());
  });
  throws('Not enough funds', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    const tokenId = bytesToU256(dns_alloc(args.serialize()));
    let args_free = new Args();
    args_free.add(tokenId);
    mockBalance(scAddress, bytesToU64(dns_alloc_cost(args.serialize())) / 4);
    dns_free(args_free.serialize());
  });
});

describe('Test DNS resolve', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test success resolve', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args_resolve = new Args();
    args_resolve.add(domain);
    expect(dns_resolve(args_resolve.serialize())).toStrictEqual(
      stringToBytes(target),
    );
  });
  throws('Domain not found', () => {
    let args = new Args();
    args.add(domain);
    dns_resolve(args.serialize());
  });
});

describe('Test DNS change target', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test success change target', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let new_target = 'AU12W92UyGW4Bd94BPniTq4Ra5yhiv6RvjazV2G9Q9GyekYkgqbme';
    let args_change = new Args();
    args_change.add(domain);
    args_change.add(new_target);
    dns_update_target(args_change.serialize());
    let args_resolve = new Args();
    args_resolve.add(domain);
    expect(dns_resolve(args_resolve.serialize())).toStrictEqual(
      stringToBytes(new_target),
    );
  });
  throws('Domain not found', () => {
    let args = new Args();
    args.add(domain);
    dns_update_target(args.serialize());
  });
  throws('Caller is not the owner', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args_change = new Args();
    args_change.add(domain);
    args_change.add(target);
    switchUser(target);
    dns_update_target(args_change.serialize());
  });
});

describe('Test transfer internal coins', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test transfer internal coins', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args_transfer = new Args();
    args_transfer.add(target);
    args_transfer.add<u64>(1000);
    mockBalance(scAddress, 1000);
    transferInternalCoins(args_transfer.serialize());
    expect(balance()).toStrictEqual(0);
  });
  throws('Test transfer internal coins not allowed', () => {
    mockBalance(scAddress, 1000);
    switchUser(target);
    let args_transfer = new Args();
    args_transfer.add(target);
    args_transfer.add<u64>(1000);
    transferInternalCoins(args_transfer.serialize());
  })
})

describe('Test get domain from tokenId', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test get domain from tokenId', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    const tokenId = bytesToU256(dns_alloc(args.serialize()));
    let args_get = new Args();
    args_get.add(tokenId);
    expect(getDomainFromTokenId(args_get.serialize())).toStrictEqual(
      stringToBytes(domain),
    );
  });
  throws('TokenId not found', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args_get = new Args();
    args_get.add<u256>(u256.One);
    getDomainFromTokenId(args_get.serialize());
  });
})

describe('Test get tokenId from domain', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test get tokenId from domain', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    const tokenId = bytesToU256(dns_alloc(args.serialize()));
    let args_get = new Args();
    args_get.add(domain);
    expect(getTokenIdFromDomain(args_get.serialize())).toStrictEqual(
      u256ToBytes(tokenId),
    );
  });
  throws('Domain not found', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args_get = new Args();
    args_get.add('(invalid)');
    getTokenIdFromDomain(args_get.serialize());
  });
});

describe('Test NFT name', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test NFT name', () => {
    expect(name()).toStrictEqual(stringToBytes('MassaNameService'));
  });
})

// TESTS NFT RELATED FUNCTIONS

describe('Test NFT symbol', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test NFT symbol', () => {
    expect(symbol()).toStrictEqual(stringToBytes('MNS'));
  });
});

describe('Test NFT balanceOf', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test NFT balanceOf one elem', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    const tokenId = bytesToU256(dns_alloc(args.serialize()));
    let args_balance = new Args();
    args_balance.add(owner);
    expect(bytesToU256(balanceOf(args_balance.serialize()))).toStrictEqual(u256.One);
  });
  test('Test NFT balanceOf multiple elems', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args2 = new Args();
    args2.add('test2');
    args2.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args2.serialize())));
    dns_alloc(args2.serialize());
    let args_balance = new Args();
    args_balance.add(owner);
    expect(bytesToU256(balanceOf(args_balance.serialize()))).toStrictEqual(u256.fromU32(2));
  });
  test('No tokens owned', () => {
    let args_balance = new Args();
    args_balance.add(target);
    expect(bytesToU256(balanceOf(args_balance.serialize()))).toStrictEqual(u256.Zero);
  });
});

describe('Test NFT ownerOf', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test NFT ownerOf', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    const tokenId = bytesToU256(dns_alloc(args.serialize()));
    let args_owner = new Args();
    args_owner.add(tokenId);
    expect(ownerOf(args_owner.serialize())).toStrictEqual(stringToBytes(owner));
  });
  throws('TokenId not found', () => {
    let args_owner = new Args();
    args_owner.add<u256>(u256.One);
    ownerOf(args_owner.serialize());
  });
});

describe('Test NFT transferFrom', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
  });
  afterEach(() => {
    mockTransferredCoins(0);
    switchUser(owner);
  });
  test('Test NFT transferFrom success', () => {
    let args_transfer = new Args();
    args_transfer.add(owner);
    args_transfer.add(target);
    let tokenId = bytesToU256(getTokenIdFromDomain(new Args().add(domain).serialize()));
    args_transfer.add(tokenId);
    transferFrom(args_transfer.serialize());
    let args_owner = new Args();
    args_owner.add(tokenId);
    expect(ownerOf(args_owner.serialize())).toStrictEqual(stringToBytes(target));
  });
  throws('Caller is not the owner', () => {
    let args_transfer = new Args();
    args_transfer.add(owner);
    args_transfer.add(target);
    let tokenId = getTokenIdFromDomain(new Args().add(domain).serialize());
    args_transfer.add(tokenId);
    switchUser(target);
    transferFrom(args_transfer.serialize());
  });
  throws('TokenId not found', () => {
    let args_transfer = new Args();
    args_transfer.add(owner);
    args_transfer.add(target);
    let tokenId = u256.fromU32(1);
    args_transfer.add(tokenId);
    transferFrom(args_transfer.serialize());
  });
});