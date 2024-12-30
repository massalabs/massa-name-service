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

const byteCode = getScByteCode('build', 'main_prev_dev.wasm');

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

let NB_BATCHS = 6;
while (NB_BATCHS--) {
  console.log('Mint batch...', NB_BATCHS);

  op = await contract.call('mintBatch', undefined, {
    coins: Mas.fromString('80'),
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
}

let NB_BATCHS_MIXED = 6;
while (NB_BATCHS_MIXED--) {
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
}
