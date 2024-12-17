import { useEffect } from 'react';
import { useAccountStore } from '../lib/connectMassaWallets/store';
import { useWriteMNS } from '../utils/write-mns-sc';
import { MNSClaim } from './MNSClaim';
import { MNSList } from './MNSList';

interface MNSManagementProps {
  customClass?: string;
}

export function MNSManagement(props: MNSManagementProps) {
  const { customClass } = props;
  const { massaClient, connectedAccount, currentProvider, chainId } =
    useAccountStore();
  const {
    domainsList,
    listSpinning,
    getUserEntryList,
    dnsAlloc,
    getAllocCost,
    changeTargetAddressDnsEntry,
    deleteDnsEntry,
    changeOwnershipDnsEntry,
  } = useWriteMNS(massaClient);

  const connected = !!connectedAccount && !!currentProvider;

  useEffect(() => {
    if (!connectedAccount || !massaClient || listSpinning || !chainId) return;
    getUserEntryList({ address: connectedAccount.address() });
  }, [connectedAccount, massaClient, chainId, listSpinning, getUserEntryList]);
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
          <MNSClaim dnsAlloc={dnsAlloc} getAllocCost={getAllocCost} />
          <MNSList
            deleteDnsEntry={deleteDnsEntry}
            changeTargetAddressDnsEntry={changeTargetAddressDnsEntry}
            changeOwnershipDnsEntry={changeOwnershipDnsEntry}
            list={domainsList}
            listSpinning={listSpinning}
          />
        </div>
      )}
    </div>
  );
}
