export interface DnsAllocParams {
  domain: string;
  targetAddress: string;
  coins?: bigint;
}

export interface DnsTransferParams {
  currentOwner: string;
  newOwner: string;
  tokenId: bigint;
}

export interface DnsUserEntryListResult {
  domain: string;
  targetAddress: string;
  tokenId: bigint;
}
