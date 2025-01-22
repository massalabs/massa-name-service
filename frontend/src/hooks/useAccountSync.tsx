import { useCallback, useEffect, useRef } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';
import { getWallets } from '@massalabs/wallet-provider';

type SavedAccount = {
  address: string;
  providerName: string;
};

const EMPTY_ACCOUNT: SavedAccount = {
  address: '',
  providerName: '',
};

const useAccountSync = () => {
  const initializedRef = useRef(false);
  const { connectedAccount, setCurrentWallet } = useAccountStore();
  const [savedAccount, setSavedAccount] = useLocalStorage<SavedAccount>(
    'saved-account',
    EMPTY_ACCOUNT,
  );

  const findAccountInWallets = useCallback(async (address: string) => {
    const wallets = await getWallets();
    for (const wallet of wallets) {
      const accounts = await wallet.accounts();
      const matchingAccount = accounts.find((acc) => acc.address === address);
      if (matchingAccount) {
        return { account: matchingAccount, wallet };
      }
    }
    return null;
  }, []);

  const restoreSavedAccount = useCallback(async () => {
    if (!savedAccount.address) return;

    const storedAccount = await findAccountInWallets(savedAccount.address);
    if (storedAccount) {
      const { wallet, account } = storedAccount;
      setCurrentWallet(wallet, account);
    }
  }, [savedAccount.address, findAccountInWallets, setCurrentWallet]);

  useEffect(() => {
    const isNewAccount =
      connectedAccount && connectedAccount.address !== savedAccount.address;

    if (isNewAccount) {
      const { address, providerName } = connectedAccount;
      setSavedAccount({ address, providerName });
    }
  }, [connectedAccount, savedAccount.address, setSavedAccount]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      restoreSavedAccount();
    }
  }, [restoreSavedAccount]);

  return { setSavedAccount };
};

export default useAccountSync;
