import { useAccountStore } from '@massalabs/react-ui-kit';
import { useEffect } from 'react';
import { useMnsStore } from '../store/mnsStore';
import { useMnsList } from './useMnsList';

export function useInit() {
  const { setMnsContract, mnsContract } = useMnsStore();
  const { getUserDomains } = useMnsList();
  const { connectedAccount: provider, network } = useAccountStore();

  useEffect(() => {
    if (!provider || !network) return;

    setMnsContract(provider, network);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, provider]);

  useEffect(() => {
    if (!mnsContract || !provider) return;
    getUserDomains(provider.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mnsContract]);
}
