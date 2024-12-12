import { SmartContract } from '@massalabs/massa-web3';
import { initProvider } from './utils';
import { MNS_CONTRACT } from './config';

const provider = await initProvider();
const contract = new SmartContract(provider, MNS_CONTRACT);

const op = await contract.call('dnsUnlock');
const events = await op.getSpeculativeEvents();

for (const event of events) {
  console.log('Unpause Events:', event.data);
}

console.log('Contract unpaused ! operation:', op.id);
