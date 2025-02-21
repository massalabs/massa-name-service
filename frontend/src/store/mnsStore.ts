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
  switch (BigInt(network.chainId)) {
    case CHAIN_ID.Buildnet:
      return MNS.buildnet(provider);
    case CHAIN_ID.Mainnet:
      return MNS.mainnet(provider);
    default:
      throw new Error('SC_ADDRESS not found for chainId : ' + network.chainId);
  }
}

export function getReadOnlyMnsContract(network: Network): MNS {
  switch (BigInt(network.chainId)) {
    case CHAIN_ID.Buildnet:
      return MNS.buildnet(JsonRpcProvider.buildnet());
    case CHAIN_ID.Mainnet:
      return MNS.mainnet(JsonRpcProvider.mainnet());
    default:
      throw new Error('SC_ADDRESS not found for chainId : ' + network.chainId);
  }
}

interface MnsStoreState {
  mnsContract: MNS;
  readOnlyMnsContract: MNS;
  list: DnsUserEntryListResult[];
  listSpinning: boolean;
  newDomain: string;
  allocationCost: bigint;
  mnsInputError: string | null;
  priceLoading: boolean;
  disableActions: boolean;

  setMnsContract: (provider: Provider, network: Network) => void;
  setList: (list: DnsUserEntryListResult[]) => void;
  setListSpinning: (listSpinning: boolean) => void;
  setNewDomain: (domain: string) => void;
  setAllocationCost: (allocationCost: bigint) => void;
  setMnsInputError: (error: string | null) => void;
  setPriceLoading: (priceLoading: boolean) => void;
}

const createMnsStore = () =>
  create<MnsStoreState>((set) => ({
    // MNS contract will be set by useInit
    mnsContract: MNS.buildnet(JsonRpcProvider.buildnet()),
    readOnlyMnsContract: MNS.buildnet(JsonRpcProvider.buildnet()),
    list: [],
    listSpinning: false,
    newDomain: '',
    allocationCost: 0n,
    priceLoading: false,
    mnsInputError: null,
    disableActions: false,

    setMnsContract: (provider: Provider, network: Network) => {
      const contract = getMnsContract(provider, network);
      const readOnlyContract = getReadOnlyMnsContract(network);
      set({ mnsContract: contract });
      set({ readOnlyMnsContract: readOnlyContract });
    },

    setList: (list: DnsUserEntryListResult[]) => {
      set({ list });
    },

    setListSpinning: (listSpinning: boolean) => {
      set({ listSpinning });
    },

    setNewDomain: (newDomain: string) => {
      set({ newDomain });
    },

    setAllocationCost: (allocationCost: bigint) => {
      set({ allocationCost });
    },

    setMnsInputError: (mnsInputError: string | null) => {
      set({ mnsInputError });
    },

    setPriceLoading: (priceLoading: boolean) => {
      set({ priceLoading });
    },
  }));

export const useMnsStore = createMnsStore();
