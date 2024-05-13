import { useAccountStore } from '../lib/connectMassaWallets/store';
import { MNSClaim } from './MNSClaim';
import { MNSList } from './MNSList';

export function MNSManagement({ customClass }: { customClass?: string }) {
  const { connectedAccount, currentProvider } = useAccountStore();

  const connected = !!connectedAccount && !!currentProvider;
  return (
    <div className={customClass}>
      {!connected ? (
        <div>
          <h2 className="mas-h2 justify-center text-center">
            Please connect your wallet above
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y">
          <MNSClaim />
          <MNSList />
        </div>
      )}
    </div>
  );
}
