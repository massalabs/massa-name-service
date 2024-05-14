import accountStore, { AccountStoreState } from './accountStore';
import { ProvidersListener } from '@massalabs/wallet-provider';
import { create } from 'zustand';

export const useAccountStore = create<AccountStoreState>((set, get) => ({
  ...accountStore(set, get),
}));

async function initAccountStore() {
  new ProvidersListener(2_000).subscribe((providers) => {
    useAccountStore.getState().setProviders(providers);
  });
}

async function initializeStores() {
  await initAccountStore();
}

initializeStores();
