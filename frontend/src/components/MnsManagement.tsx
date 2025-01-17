import { MNSClaim } from './MNSClaim';
import { MNSList } from './MNSList';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useInit } from '../hooks/useInit';

export function MNSManagement() {
  const { connectedAccount } = useAccountStore();
  useInit();

  const connected = !!connectedAccount;

  return (
    <div className="grow">
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
