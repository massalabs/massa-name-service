import { Account, Web3Provider, MNS } from '@massalabs/massa-web3';
import { config } from 'dotenv';
config();

const MNS_CONTRACT = 'AS1qyye6EfPSvj8whjEeUCZepD3mnhYvaaLub65DGcF6jdxydBPs';

const account = await Account.fromEnv();
const provider = Web3Provider.buildnet(account);
const MNSContract = new MNS(provider, MNS_CONTRACT);

// Claim dns
const domain = 'testaurelienlol';

const op = await MNSContract.alloc(domain, provider.address, {
  coins: BigInt(1043000000),
});

const events = await op.getSpeculativeEvents();
if (events.length) {
  console.log(events.map((e) => e.data));
}

const domainOwner = await MNSContract.resolve(domain);

if (domainOwner === provider.address) {
  console.log('OK! Domain is owned by the current account');
} else {
  console.error('KO! Domain is not owned by the current account');
}
