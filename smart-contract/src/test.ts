import * as dotenv from 'dotenv';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { getEnvVariable } from './utils';
import { deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';
import {
  Args,
  fromMAS,
  MAX_GAS_DEPLOYMENT,
  CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls,
  EOperationStatus,
  bytesToStr,
} from '@massalabs/massa-web3';

// Load .env file content into process.env
dotenv.config();

// Get environment variables
const publicApi = getEnvVariable('JSON_RPC_URL_PUBLIC');
const secretKey = getEnvVariable('WALLET_SECRET_KEY');
// Define deployment parameters
const chainId = CHAIN_ID.BuildNet; // Choose the chain ID corresponding to the network you want to deploy to

const testAccount = await WalletClient.getAccountFromSecretKey(secretKey);
if (!testAccount || !testAccount.address) {
  throw new Error('Account not found');
}
const client = await ClientFactory.createDefaultClient(
  DefaultProviderUrls.BUILDNET,
  chainId,
  true,
  testAccount,
);
// Claim dns
const domain = 'testaurelien';
const opId = await client.smartContracts().callSmartContract({
  coins: fromMAS(10),
  targetAddress: 'AS1Xxfwr9pzTXBKfkLKkZNjmJMWimgvpESRv5GdNhmeuc1mqB2JL',
  targetFunction: 'dnsAlloc',
  parameter: new Args().addString(domain).addString(testAccount.address),
  fee: fromMAS(0.01),
});
const status = await client
  .smartContracts()
  .awaitMultipleRequiredOperationStatus(opId, [
    EOperationStatus.SPECULATIVE_SUCCESS,
    EOperationStatus.SPECULATIVE_ERROR,
  ]);
if (!(status === EOperationStatus.SPECULATIVE_SUCCESS)) {
  const error = await client.smartContracts().getFilteredScOutputEvents({
    start: null,
    end: null,
    original_operation_id: opId,
    original_caller_address: null,
    emitter_address: null,
    is_final: null,
  });
}

const addressFetched = bytesToStr(
  (
    await client.smartContracts().readSmartContract({
      targetAddress: 'AS1Xxfwr9pzTXBKfkLKkZNjmJMWimgvpESRv5GdNhmeuc1mqB2JL',
      targetFunction: 'dnsResolve',
      parameter: new Args().addString(domain),
    })
  ).returnValue,
);
