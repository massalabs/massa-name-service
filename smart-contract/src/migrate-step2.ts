import {
  SmartContract,
  Mas,
  Operation,
  rpcTypes,
  Args,
  MAX_GAS_CALL,
} from '@massalabs/massa-web3';
import { getScByteCode, initProvider } from './utils';
import { MNS_CONTRACT } from './config';

let op: Operation;
let events: rpcTypes.OutputEvents;

const provider = await initProvider();
const contract = new SmartContract(provider, MNS_CONTRACT);

console.log(
  'Contract initial balance:',
  Mas.toString(await provider.client.getBalance(MNS_CONTRACT)),
);

const byteCode = getScByteCode('build', 'main_mig.wasm');

op = await contract.call('upgradeSC', byteCode, {
  coins: Mas.fromString('3'),
  fee: Mas.fromString('0.1'),
});
events = await op.getFinalEvents();

for (const event of events) {
  console.log('upgradeSC Events:', event.data);
}
console.log('upgradeSC done ! operation:', op.id);

console.log('cleaning old keys...');
op = await contract.call('clean', undefined, {
  fee: Mas.fromString('0.1'),
  maxGas: MAX_GAS_CALL,
});

events = await op.getSpeculativeEvents();
for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Upgrading new bytecode...');

const cleaned = getScByteCode('build', 'main.wasm');

op = await contract.call('upgradeSC', cleaned, {
  fee: Mas.fromString('0.1'),
});
events = await op.getFinalEvents();

for (const event of events) {
  console.log('upgradeSC Events:', event.data);
}
console.log('upgradeSC done ! operation:', op.id);

console.log(
  'Contract Final balance:',
  Mas.toString(await provider.client.getBalance(MNS_CONTRACT)),
);
