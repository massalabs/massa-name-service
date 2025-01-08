import {
  SmartContract,
  Mas,
  Operation,
  rpcTypes,
  Args,
} from '@massalabs/massa-web3';
import { getScByteCode, initProvider } from './utils';
import { MNS_CONTRACT } from './config';

const provider = await initProvider();

const byteCode = getScByteCode('build', 'main_prev.wasm');
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

console.log('Initialize migration');

op = await contract.call('initMig', byteCode, {
  fee: Mas.fromString('0.1'),
});
events = await op.getFinalEvents();

for (const event of events) {
  console.log('upgradeSC Events:', event.data);
}
console.log('Initialize done ! operation:', op.id);

let batchSize = 3000;
while (true) {
  op = await contract.call('migrate', new Args().addI32(BigInt(batchSize)), {
    coins: Mas.fromString('25'),
    fee: Mas.fromString('0.1'),
  });

  events = await op.getFinalEvents();

  for (const event of events) {
    console.log('migrate Events:', event.data);
  }

  if (events.some((event) => event.data.includes('Migration done'))) {
    console.log('Migration done ! yallahh:');
    break;
  }
}

console.log(
  'Contract Final balance:',
  Mas.toString(await provider.client.getBalance(MNS_CONTRACT)),
);
