import { Accordion, Spinner, useAccountStore } from '@massalabs/react-ui-kit';
import { useState } from 'react';
import { useMnsStore } from '../store/mnsStore';
import { useMnsManagement } from '../hooks/useMnsManagement';
import { MnsItem } from './MnsItem';
import { UpdateTargetModal } from './UpdateTargetModal';
import { UpdateOwnerModal } from './UpdateOwnerModal';

export function MNSList() {
  const { connectedAccount } = useAccountStore();
  const [domain, setDomain] = useState<string>('');
  const [ownershipModalOpen, setOwnershipModalOpen] = useState<boolean>(false);
  const [updateTargetModalOpen, setTargetModalOpen] = useState<boolean>(false);

  const { deleteDnsEntry, isPending } = useMnsManagement();
  const { listSpinning, list } = useMnsStore();

  const onUpdateTarget = (domain: string) => {
    setDomain(domain);
    setTargetModalOpen(true);
  };

  const onUpdateOwnership = (domain: string) => {
    setDomain(domain);
    setOwnershipModalOpen(true);
  };

  return (
    <div>
      <Accordion customClass="border-none" title="Owned MNS">
        {listSpinning ? (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div>
            <UpdateTargetModal
              isOpen={updateTargetModalOpen}
              close={() => setTargetModalOpen(false)}
              domain={domain}
            />
            <UpdateOwnerModal
              isOpen={ownershipModalOpen}
              close={() => setOwnershipModalOpen(false)}
              domain={domain}
              owner={connectedAccount!.address}
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
