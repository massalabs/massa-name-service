import { useAccountStore } from '../store';
import { ConnectedAccount } from './ConnectedAccount';
import { MASBalance } from './MASBalance';
import { WalletError } from './WalletError';
import Intl from '../i18n/i18n';
import { BEARBY_INSTALL } from '../const';

export default function BearbyWallet() {
  const { connectedAccount } = useAccountStore();

  if (connectedAccount) {
    return (
      <div className="flex flex-col gap-4 mas-body">
        <ConnectedAccount />
        <MASBalance />
      </div>
    );
  }

  return (
    <WalletError
      description={Intl.t(
        'connect-wallet.card-destination.bearby-not-installed',
      )}
      link={BEARBY_INSTALL}
      linkLabel={Intl.t('connect-wallet.card-destination.get-bearby')}
    />
  );
}
