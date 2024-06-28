import axios from 'axios';

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
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }

  async getDomainsInfo(domains: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.url_api + '/dns/info', { params: { dns: domains } })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
}
