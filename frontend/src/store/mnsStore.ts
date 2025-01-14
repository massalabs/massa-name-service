import { create } from 'zustand';
import { DnsUserEntryListResult } from '../utils/interface';
import {
  CHAIN_ID,
  JsonRpcProvider,
  MNS,
  Network,
  Provider,
} from '@massalabs/massa-web3';

function getMnsContract(provider: Provider, network: Network): MNS {
  // TODO: Bearby return chianId in number instead of bigint: We should handle this in wallet provider
  switch (BigInt(network.chainId)) {
    case CHAIN_ID.Buildnet:
      return MNS.buildnet(provider);
    case CHAIN_ID.Mainnet:
      return MNS.mainnet(provider);
    default:
      throw new Error('SC_ADDRESS not found for chainId : ' + network.chainId);
  }
}

interface MnsStoreState {
  mnsContract: MNS;
  list: DnsUserEntryListResult[];
  listSpinning: boolean;
  domain: string;
  allocCost: bigint;
  mnsInputError: string | null;
  isPriceLoading: boolean;

  setMnsContract: (provider: Provider, network: Network) => void;
  setList: (list: DnsUserEntryListResult[]) => void;
  setListSpinning: (listSpinning: boolean) => void;
  setDomain: (domain: string) => void;
  setAllocCost: (allocCost: bigint) => void;
  setMnsInputError: (error: string | null) => void;
  setIsPriceLoading: (isPriceLoading: boolean) => void;
}

const createMnsStore = () =>
  create<MnsStoreState>((set) => ({
    mnsContract: MNS.buildnet(JsonRpcProvider.buildnet()),
    list: [],
    listSpinning: false,
    domain: '',
    allocCost: 0n,
    isPriceLoading: false,
    mnsInputError: null,

    setMnsContract: (provider: Provider, network: Network) => {
      const contract = getMnsContract(provider, network);
      set({ mnsContract: contract });
    },

    setList: (list: DnsUserEntryListResult[]) => {
      set({ list });
    },

    setListSpinning: (listSpinning: boolean) => {
      set({ listSpinning });
    },

    setDomain: (domain: string) => {
      set({ domain });
    },

    setAllocCost: (allocCost: bigint) => {
      set({ allocCost });
    },

    setMnsInputError: (mnsInputError: string | null) => {
      set({ mnsInputError });
    },

    setIsPriceLoading: (isPriceLoading: boolean) => {
      set({ isPriceLoading });
    },
  }));

export const useMnsStore = createMnsStore();
