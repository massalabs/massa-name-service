import { SmartContract } from '@massalabs/massa-web3';
import { initProvider } from './utils';
import { MNS_CONTRACT } from './config';

const provider = await initProvider();

const contract = new SmartContract(provider, MNS_CONTRACT);

const op = await contract.call('dnsLock', undefined, { coins: 100000000n });
const events = await op.getSpeculativeEvents();

for (const event of events) {
  console.log('pause Events:', event.data);
}

console.log('Contract paused ! operation:', op.id);
