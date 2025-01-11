import { useEffect } from 'react';
import { MNSClaim } from './MNSClaim';
import { MNSList } from './MNSList';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useMnsStore } from '../store/mns';

export function MNSManagement() {
  const { connectedAccount, network } = useAccountStore();
  const { setMnsContract, mnsContract } = useMnsStore();

  useEffect(() => {
    if (connectedAccount && network) {
      setMnsContract(connectedAccount, network);
    }
  }, [connectedAccount, network, setMnsContract]);

  const connected = !!connectedAccount;

  return (
    <div className="grow">
      {!connected || !mnsContract ? (
        <div>
          <h2 className="mas-h2 justify-center text-center">
            Please connect your wallet above
          </h2>
        </div>
      ) : (
        <div className="flex flex-col divide-y">
          <MNSClaim provider={connectedAccount} />
          <MNSList provider={connectedAccount} />
        </div>
      )}
    </div>
  );
}
