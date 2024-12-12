import { SmartContract, Mas, Operation, rpcTypes } from '@massalabs/massa-web3';
import {
  getMigrateCounter,
  getScByteCode,
  getTokenCounter,
  initProvider,
} from './utils';
import { MNS_CONTRACT } from './config';

const provider = await initProvider();

const byteCode = getScByteCode('build', 'main_mig.wasm');
const contract = new SmartContract(provider, MNS_CONTRACT);

console.log(
  'Contract initial balance:',
  Mas.toString(await provider.client.getBalance(MNS_CONTRACT)),
);

let op: Operation;
let events: rpcTypes.OutputEvents;
op = await contract.call('upgradeSC', byteCode, {
  coins: Mas.fromString('3'),
  fee: Mas.fromString('0.1'),
});
events = await op.getFinalEvents();

for (const event of events) {
  console.log('upgradeSC Events:', event.data);
}
console.log('upgradeSC done ! operation:', op.id);

const counter = await getTokenCounter(provider, MNS_CONTRACT);
let migrateCount = 0n;
try {
  migrateCount = await getMigrateCounter(provider, MNS_CONTRACT);
} catch (e) {
  console.log('no migrate counter found');
}

while (migrateCount < counter) {
  console.log('migrating batch from tokenID', migrateCount.toString());
  op = await contract.call('migrate', undefined, {
    coins: Mas.fromString('30'),
    fee: Mas.fromString('0.1'),
  });

  events = await op.getFinalEvents();

  for (const event of events) {
    console.log('migrate Events:', event.data);
  }
  migrateCount = await getMigrateCounter(provider, MNS_CONTRACT);
  console.log('new migrate count:', migrateCount.toString());
}

console.log('Upgrade done ! operation:');

if (migrateCount === counter) {
  const cleaned = getScByteCode('build', 'main.wasm');

  op = await contract.call('upgradeSC', cleaned, {
    fee: Mas.fromString('0.1'),
  });
  events = await op.getFinalEvents();

  for (const event of events) {
    console.log('upgradeSC Events:', event.data);
  }
  console.log('upgradeSC done ! operation:', op.id);
}

console.log(
  'Contract Final balance:',
  Mas.toString(await provider.client.getBalance(MNS_CONTRACT)),
);
