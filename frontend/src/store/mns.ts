import { create } from 'zustand';
import { DnsUserEntryListResult, DnsAllocParams } from '../utils/interface';
import {
  Args,
  CHAIN_ID,
  JsonRpcProvider,
  MNS,
  Network,
  Provider,
  U256,
} from '@massalabs/massa-web3';

interface MnsStoreState {
  mnsContract: MNS;
  list: DnsUserEntryListResult[];
  listSpinning: boolean;
  getAllocationCost: (params: DnsAllocParams) => Promise<bigint>;
  getUserDomains: (provider: Provider, userAddress: string) => Promise<void>;
  setMnsContract: (provider: Provider, network: Network) => void;
}

const createMnsStore = () =>
  create<MnsStoreState>((set, get) => ({
    mnsContract: MNS.buildnet(JsonRpcProvider.buildnet()),
    list: [],
    listSpinning: false,

    getAllocationCost: async (params: DnsAllocParams) => {
      try {
        return await get().mnsContract.dnsAllocCost(params.domain, {
          // TODO: Check why readOnly fails when using caller with no transaction
          // caller: 'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
        });
      } catch (error) {
        throw Error(
          'Name can only be 2-100 characters long and can contain only lowercase letters, numbers, and hyphens.',
        );
      }
    },

    getUserDomains: async (provider: Provider, userAddress: string) => {
      set({ listSpinning: true });
      try {
        const resultBalance = await provider.readSC({
          target: get().mnsContract.address,
          func: 'balanceOf',
          parameter: new Args().addString(userAddress),
          // TODO: Check why readOnly fails when using caller with no transaction
          // caller: 'AU1dvPZNjcTQfNQQuysWyxLLhEzw4kB9cGW2RMMVAQGrkzZHqWGD',
        });

        if (resultBalance.info.error) {
          // TODO: Check if right error message
          throw Error('Failed to fetch balanceOf address not found');
        }

        const balance = U256.fromBytes(resultBalance.value);

        if (balance === 0n) {
          set({ list: [] });
          set({ listSpinning: false });
          return;
        }

        const domains = await get().mnsContract.getOwnedDomains(userAddress);
        const targets = await get().mnsContract.getTargets(domains);
        const tokenIds = await get().mnsContract.getTokenIds(domains);
        const newList = domains.map((domain, index) => ({
          domain,
          targetAddress: targets[index],
          tokenId: tokenIds[index],
        }));
        set({ list: newList });
      } catch (error) {
        console.error('Failed to fetch user entries', error);
        set({ list: [] });
      } finally {
        set({ listSpinning: false });
      }
    },

    setMnsContract: (provider: Provider, network: Network) => {
      // TODO: Bearby return chianId in number instead of bigint: Maybe we should handle this in wallet provider
      switch (BigInt(network.chainId)) {
        case CHAIN_ID.Buildnet:
          set({ mnsContract: MNS.buildnet(provider) });
          break;
        case CHAIN_ID.Mainnet:
          set({ mnsContract: MNS.mainnet(provider) });
          break;
        default:
          set({ mnsContract: MNS.buildnet(provider) });
          throw new Error(
            'SC_ADDRESS not found for chainId : ' + network.chainId,
          );
      }
    },
  }));

export const useMnsStore = createMnsStore();
