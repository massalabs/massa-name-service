import { Accordion, Spinner, useAccountStore } from '@massalabs/react-ui-kit';
import { useEffect, useState } from 'react';
import { useMnsStore } from '../store/mnsStore';
import { useMnsManagement } from '../hooks/useMnsManagement';
import { MnsItem } from './MnsItem';
import { UpdateTargetModal } from './UpdateTargetModal';
import { UpdateOwnerModal } from './UpdateOwnerModal';
import { useMnsList } from '../hooks/useMnsList';

export function MNSList() {
  const { connectedAccount } = useAccountStore();
  const [domainToUpdate, setDomainToUpdate] = useState<string>('');
  const [ownershipModalOpen, setOwnershipModalOpen] = useState<boolean>(false);
  const [updateTargetModalOpen, setTargetModalOpen] = useState<boolean>(false);

  const { deleteDnsEntry, isPending } = useMnsManagement();
  const { getUserDomains } = useMnsList();

  const { listSpinning, list, mnsContract } = useMnsStore();

  const onUpdateTarget = (domain: string) => {
    setDomainToUpdate(domain);
    setTargetModalOpen(true);
  };

  const onUpdateOwnership = (domain: string) => {
    setDomainToUpdate(domain);
    setOwnershipModalOpen(true);
  };

  useEffect(() => {
    if (!mnsContract || !connectedAccount) return;
    getUserDomains(connectedAccount.address);
  }, [mnsContract, connectedAccount, getUserDomains]);

  if (!connectedAccount) {
    return null;
  }

  return (
    <div>
      <Accordion
        customClass="border-none"
        title={listSpinning ? 'Fetching...' : `Owned MNS  (${list.length})`}
      >
        {listSpinning ? (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div>
            <UpdateTargetModal
              isOpen={updateTargetModalOpen}
              close={() => setTargetModalOpen(false)}
              domain={domainToUpdate}
            />
            <UpdateOwnerModal
              isOpen={ownershipModalOpen}
              close={() => setOwnershipModalOpen(false)}
              domain={domainToUpdate}
              owner={connectedAccount.address}
            />

            {list.length === 0 ? (
              <div className="flex items-center justify-center">
                <p className="mas-body">No MNS found</p>
              </div>
            ) : (
              list.map((item, idx) => (
                <MnsItem
                  key={idx}
                  item={item}
                  isPending={isPending}
                  onUpdateTarget={() => onUpdateTarget(item.domain)}
                  onUpdateOwnership={() => onUpdateOwnership(item.domain)}
                  onDelete={() => deleteDnsEntry(item.domain)}
                />
              ))
            )}
          </div>
        )}
      </Accordion>
    </div>
  );
}
