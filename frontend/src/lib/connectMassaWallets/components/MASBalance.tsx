import { useEffect, useState } from 'react';
import { fromMAS } from '@massalabs/massa-web3';
import { IAccountBalanceResponse } from '@massalabs/wallet-provider';
import Intl from '../i18n/i18n';
import { useAccountStore } from '../store';
import { massaToken } from '../const';
import { fetchMASBalance } from '../utils';
import { formatAmount } from '@massalabs/react-ui-kit';
import { FetchingLine } from './FetchingComponent';

export function MASBalance() {
  const [balance, setBalance] = useState<IAccountBalanceResponse>();

  const { connectedAccount } = useAccountStore();

  useEffect(() => {
    if (!connectedAccount) return;
    fetchMASBalance(connectedAccount).then((balance) => {
      setBalance(balance);
    });
  }, [connectedAccount, setBalance]);

  const formattedBalance = formatAmount(
    fromMAS(balance?.candidateBalance || '0').toString(),
    9,
  ).amountFormattedFull;

  return (
    <div className="flex gap-2 mas-body">
      {Intl.t('connect-wallet.connected-cards.wallet-balance')}
      {balance === undefined ? (
        <FetchingLine />
      ) : (
        <>
          {formattedBalance} {massaToken}
        </>
      )}
    </div>
  );
}
