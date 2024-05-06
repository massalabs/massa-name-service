import { Args, bytesToU64, stringToBytes } from '@massalabs/as-types';
import { constructor, name, dns_alloc, dns_alloc_cost, dns_free } from '../contracts/main';
import { balance, mockAdminContext, mockBalance, mockTransferredCoins, resetStorage } from '@massalabs/massa-as-sdk';

const target = "AU12W92UyGW4Bd94BPniTq4Ra5yhiv6RvjazV2G9Q9GyekYkgqbme";
const domain = "test";
// address of the contract set in vm-mock. must match with contractAddr of @massalabs/massa-as-sdk/vm-mock/vm.js
const scAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

describe('Test DNS allocation', () => {
  beforeEach(() => {
    resetStorage();
    mockAdminContext(true);
    constructor(new Args().serialize());
    mockAdminContext(false);
  });
  afterEach(() => {
    mockTransferredCoins(0);
  });
  test('Testing success alloc', () => {
    let args_cost = new Args();
    args_cost.add(domain);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args_cost.serialize())));
    let args = new Args();
    args.add(domain);
    args.add(target);
    dns_alloc(args.serialize());
  });
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
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())) - 1);
    dns_alloc(args.serialize());
  });
  throws('Invalid domain', () => {
    let args = new Args();
    args.add("(invalid)");
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
  })
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
  });
  test('Test success free', () => {
    let args = new Args();
    args.add(domain);
    args.add(target);
    mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
    dns_alloc(args.serialize());
    let args_free = new Args();
    args_free.add(domain);
    mockBalance(scAddress, bytesToU64(dns_alloc_cost(args.serialize())) / 2)
    dns_free(args_free.serialize());
  });
  throws('Domain not found', () => {
    let args = new Args();
    args.add(domain);
    dns_free(args.serialize());
  });
  // throws('Not enough funds', () => {
  //   let args = new Args();
  //   args.add(domain);
  //   args.add(target);
  //   mockTransferredCoins(bytesToU64(dns_alloc_cost(args.serialize())));
  //   dns_alloc(args.serialize());
  //   let args_free = new Args();
  //   args_free.add(domain);
  //   mockBalance(scAddress, bytesToU64(dns_alloc_cost(args.serialize())) / 2 - 1)
  //   dns_free(args_free.serialize());
  // });
});