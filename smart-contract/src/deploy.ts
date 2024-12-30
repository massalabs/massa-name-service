import {
  Args,
  Mas,
  MAX_GAS_CALL,
  Operation,
  rpcTypes,
  SmartContract,
} from '@massalabs/massa-web3';
import { getScByteCode, initProvider } from './utils';
import { MNS_CONTRACT } from './config';

let events: rpcTypes.OutputEvents;
let op: Operation;

const provider = await initProvider();

console.log('Deploying contract...');

const byteCode = getScByteCode('build', 'main_prev.wasm');

const name = 'Massa';
const constructorArgs = new Args().addString(name);

const contract = await SmartContract.deploy(
  provider,
  byteCode,
  constructorArgs,
  { coins: Mas.fromString('20'), waitFinalExecution: false },
);

console.log('Contract deployed at:', contract.address);

events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
console.log(
  'Contract initial balance:',
  Mas.toString(await provider.client.getBalance(contract.address, false)),
);

console.log('Mint batch...');

// const contract = new SmartContract(provider, MNS_CONTRACT);
op = await contract.call('mintBatch', undefined, {
  coins: Mas.fromString('90'),
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getFinalEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}
console.log(
  'Contract balance after mintBatch:',
  Mas.toString(await provider.client.getBalance(contract.address)),
);
console.log('Mint batch...');

// const contract = new SmartContract(provider, MNS_CONTRACT);
op = await contract.call('mintBatch', undefined, {
  coins: Mas.fromString('90'),
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getFinalEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}

console.log(
  'Contract balance after mintBatch:',
  Mas.toString(await provider.client.getBalance(contract.address)),
);
console.log('Mint mixed target batch...');

op = await contract.call('mintBatchMixedTarget', undefined, {
  coins: Mas.fromString('95'),
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getFinalEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}
console.log(
  'Contract balance after mixed mintBatch:',
  Mas.toString(await provider.client.getBalance(contract.address)),
);
console.log('Mint mixed target batch...');

op = await contract.call('mintBatchMixedTarget', undefined, {
  coins: Mas.fromString('95'),
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getFinalEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}
console.log(
  'Contract balance after mixed mintBatch:',
  Mas.toString(await provider.client.getBalance(contract.address)),
);
console.log('Mint mixed target batch...');

op = await contract.call('mintBatchMixedTarget', undefined, {
  coins: Mas.fromString('95'),
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getFinalEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Mint mixed target batch...');

op = await contract.call('mintBatchMixedTarget', undefined, {
  coins: Mas.fromString('95'),
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getSpeculativeEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}

// let batchSize = 3000;

// while (true) {
//   op = await contract.call('migrate', new Args().addI32(BigInt(batchSize)), {
//     coins: Mas.fromString('20'),
//     fee: Mas.fromString('0.1'),
//   });

//   events = await op.getFinalEvents();

//   for (const event of events) {
//     console.log('migrate Events:', event.data);
//   }

//   if(events.some(event => event.data.includes('Migration done'))) {
//     console.log('Migration done ! yallahh:');
//     break;
//   }
// }
