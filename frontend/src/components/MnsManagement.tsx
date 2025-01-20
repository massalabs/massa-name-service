import { MNSClaim } from './MnsClaim';
import { MNSList } from './MnsList';
import { useAccountStore } from '@massalabs/react-ui-kit';

import { useEffect } from 'react';
import { useMnsStore } from '../store/mnsStore';

export function MNSManagement() {
  const { connectedAccount } = useAccountStore();
  const { setMnsContract } = useMnsStore();
  const { connectedAccount: provider, network } = useAccountStore();

  useEffect(() => {
    if (!provider || !network) return;
    setMnsContract(provider, network);
  }, [network, provider, setMnsContract]);

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
