// create a new grpc client and export a getCLient function
import { PublicServiceClient } from '../proto-gen/massa/api/v1/public.client';
import { CHAIN_ID } from '@massalabs/massa-web3';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

const MAINNET_URL = 'http://mainnet.massa.net:33037';
const BUILDNET_URL = 'http://buildnet-explorer.massa.net:33037';

export function getClient(chainId: bigint) {
  let baseUrl = MAINNET_URL;
  if (chainId === CHAIN_ID.BuildNet) {
    baseUrl = BUILDNET_URL;
  }
  const transport = new GrpcWebFetchTransport({ baseUrl });
  return new PublicServiceClient(transport);
}
