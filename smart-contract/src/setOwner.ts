import { Args, Mas, SmartContract } from '@massalabs/massa-web3';
import { initProvider } from './utils';
import { MNS_CONTRACT } from './config';

const provider = await initProvider();

const contract = new SmartContract(provider, MNS_CONTRACT);

const NEW_OWNER = 'XXXXX';

const op = await contract.call('setOwner', new Args().addString(NEW_OWNER), {
  fee: Mas.fromString('0.1'),
});
const events = await op.getSpeculativeEvents();

for (const event of events) {
  console.log('SetOwner Events:', event.data);
}

console.log('Owner updated! operation:', op.id);
