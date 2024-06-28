import axios from 'axios';

interface DomainInfo {
  domain: string;
  target_address: string;
  tokenId: bigint;
}

export class ExplorerApiClient {
  private url_api: string;

  constructor() {
    this.url_api = import.meta.env.VITE_EXPLORER_API_URL;
  }

  async getDomainOwnedByAddress(address: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.url_api + '/dns/addresses/owner', {
          params: { addresses: [address] },
        })
        .then((response) => {
          resolve(response.data[address]);
        })
        .catch((_error) => {
          reject("error getting domain owned by address");
        });
    });
  }

  async getDomainsInfo(domains: string[]): Promise<DomainInfo[]> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.url_api + '/dns/info', { params: { dns: domains } })
        .then((response) => {
          resolve(response.data);
        })
        .catch((_error) => {
          reject("error getting domains info");
        });
    });
  }
}
