import { Args, Mas, SmartContract } from '@massalabs/massa-web3';
import { getScByteCode, initProvider } from './utils';

let events;

const provider = await initProvider();

console.log('Deploying contract...');

const byteCode = getScByteCode('build', 'main.wasm');

const name = 'Massa';
const constructorArgs = new Args().addString(name);

const contract = await SmartContract.deploy(
  provider,
  byteCode,
  constructorArgs,
  { coins: Mas.fromString('10'), waitFinalExecution: true },
);

console.log('Contract deployed at:', contract.address);

events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
