import { create } from 'zustand';
import { DnsUserEntryListResult, DnsAllocParams } from '../utils/interface';
import {
  Account,
  Args,
  CHAIN_ID,
  JsonRpcProvider,
  MNS,
  Network,
  Provider,
  U256,
  bytesToStr,
} from '@massalabs/massa-web3';
import { getTargetKey, getDomainKey } from '../const/dataStoreKeys';

interface MnsStoreState {
  mnsContract: MNS;
  list: DnsUserEntryListResult[];
  listSpinning: boolean;
  resolve: (domain: string) => Promise<string>;
  getAllocationCost: (params: DnsAllocParams) => Promise<bigint>;
  getUserEntryList: (provider: Provider, userAddress: string) => Promise<void>;
  fetchDomains: (
    provider: Provider,
    tokenIdsBytes: Uint8Array[],
  ) => Promise<string[]>;
  fetchTargets: (provider: Provider, domains: string[]) => Promise<string[]>;
  setMnsContract: (provider: Provider, network: Network) => void;
}

const createMnsStore = () =>
  create<MnsStoreState>((set, get) => ({
    mnsContract: MNS.buildnet(JsonRpcProvider.buildnet()),
    list: [],
    listSpinning: false,

    resolve: async (domain: string) => {
      return await get().mnsContract.resolve(domain);
    },

    getAllocationCost: async (params: DnsAllocParams) => {
      try {
        return await get().mnsContract.dnsAllocCost(params.domain);
      } catch (error) {
        throw Error(
          'Name can only be 2-100 characters long and can contain only lowercase letters, numbers, and hyphens.',
        );
      }
    },

    getUserEntryList: async (provider: Provider, userAddress: string) => {
      set({ listSpinning: true });

      try {
        const resultBalance = await provider.readSC({
          target: get().mnsContract.address,
          func: 'balanceOf',
          parameter: new Args().addString(userAddress),
          // TODO: Check why readOnly fails when using caller with no transaction
          caller: 'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
        });

        console.log(resultBalance);

        const balance = U256.fromBytes(resultBalance.value);

        if (balance === 0n) {
          set({ list: [] });
          set({ listSpinning: false });
          return;
        }

        const filter = `ownedTokens${userAddress}`;
        const ownedKeys = await provider.getStorageKeys(
          get().mnsContract.address,
          filter,
          false,
        );

        if (!ownedKeys) {
          set({ list: [] });
          set({ listSpinning: false });
          return;
        }

        const tokenIdsBytes = ownedKeys.map((key) => key.slice(filter.length));
        const tokenIds = tokenIdsBytes.map((bytes) =>
          U256.fromBytes(Uint8Array.from(bytes)),
        );

        const domains = await get().fetchDomains(provider, tokenIdsBytes);
        const targets = await get().fetchTargets(provider, domains);

        const newList = domains.map((domain, index) => ({
          domain,
          targetAddress: targets[index],
          tokenId: tokenIds[index],
        }));

        set({ list: newList });
      } catch (error) {
        set({ list: [] });
      } finally {
        set({ listSpinning: false });
      }
    },

    async fetchDomains(
      provider: Provider,
      tokenIdsBytes: Uint8Array[],
    ): Promise<string[]> {
      const mnsContract = get().mnsContract;
      if (!mnsContract) {
        throw new Error('MNS contract not set');
      }
      const domainsDataStoreEntries = tokenIdsBytes.map((id) =>
        getDomainKey(id),
      );
      const domainsRes = await provider.readStorage(
        mnsContract.address,
        domainsDataStoreEntries,
        false,
      );
      return domainsRes.map(bytesToStr);
    },

    async fetchTargets(
      provider: Provider,
      domains: string[],
    ): Promise<string[]> {
      const mnsContract = get().mnsContract;
      if (!mnsContract) {
        throw new Error('MNS contract not set');
      }

      const targetDataStoreEntries = domains.map((d) => getTargetKey(d));

      const targetsRes = await provider.readStorage(
        mnsContract.address,
        targetDataStoreEntries,
        false,
      );

      return targetsRes.map(bytesToStr);
    },

    setMnsContract: (provider: Provider, network: Network) => {
      switch (network.chainId) {
        case CHAIN_ID.Buildnet:
          set({ mnsContract: MNS.buildnet(provider) });
          break;
        case CHAIN_ID.Mainnet:
          set({ mnsContract: MNS.mainnet(provider) });
          break;
        default:
          throw new Error(
            'SC_ADDRESS not found for chainId : ' + network.chainId,
          );
      }
    },
  }));

export const useMnsStore = createMnsStore();
