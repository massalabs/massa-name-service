import { Dropdown } from '@massalabs/react-ui-kit';
import { IAccount } from '@massalabs/wallet-provider';
import { useAccountStore } from '../store';

export function StationSelectAccount() {
  const [accounts, connectedAccount, setConnectedAccount] = useAccountStore(
    (state) => [
      state.accounts,
      state.connectedAccount,
      state.setConnectedAccount,
    ],
  );

  const selectedAccountKey: number = (accounts || []).findIndex(
    (account) => account.name() === connectedAccount?.name(),
  );

  const onAccountChange = async (account: IAccount) => {
    setConnectedAccount(account);
  };

  return (
    <Dropdown
      select={selectedAccountKey}
      options={(accounts || []).map((account: IAccount) => {
        return {
          item: account.name(),
          onClick: () => onAccountChange(account),
        };
      })}
    />
  );
}
