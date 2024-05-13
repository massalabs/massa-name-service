import { useAccountStore } from '../lib/connectMassaWallets/store';
import { MNSClaim } from './MNSClaim';
import { MNSList } from './MNSList';

interface MNSManagementProps {
  customClass?: string;
}

export function MNSManagement(props: MNSManagementProps) {
  const { customClass } = props;
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
        <div className="flex flex-col divide-y">
          <MNSClaim />
          <MNSList />
        </div>
      )}
    </div>
  );
}
