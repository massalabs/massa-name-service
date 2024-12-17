import {
  getDomains,
  getOwner,
  getTokenCounter,
  getTotalSupply,
  initProvider,
} from './utils';
import { MNS_CONTRACT } from './config';

const provider = await initProvider();

const owner = await getOwner(provider);
console.log('Contract owner:', owner);

const count = await getTokenCounter(provider, MNS_CONTRACT);
console.log('COUNTER KEY:', count.toString());

const domainKeys = await getDomains(provider);
console.log('Total domains:', domainKeys.length);

try {
  const totalSupply = await getTotalSupply(provider);
  console.log('Total supply:', totalSupply.toString());
} catch (e) {
  console.log('No total supply found');
}
