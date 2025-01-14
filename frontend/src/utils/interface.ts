export interface DnsTransferParams {
  currentOwner: string;
  newOwner: string;
  domain: string;
}

export interface DnsUserEntryListResult {
  domain: string;
  targetAddress: string;
}
