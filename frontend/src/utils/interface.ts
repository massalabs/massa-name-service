export interface DnsAllocParams {
  domain: string;
  targetAddress: string;
  coins?: bigint;
}

export interface DnsTransferParams {
  currentOwner: string;
  newOwner: string;
  domain: string;
}

export interface DnsUserEntryListResult {
  domain: string;
  targetAddress: string;
}
