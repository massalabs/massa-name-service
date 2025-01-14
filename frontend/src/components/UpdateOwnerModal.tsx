import { useState } from 'react';
import { ChangeModal } from './UpdateModal';
import { useMnsManagement } from '../hooks/useMnsManagement';

type UpdateOwnerModalProps = {
  isOpen: boolean;
  domain: string;
  owner: string;
  close: () => void;
};

export function UpdateOwnerModal({
  isOpen,
  domain,
  owner,
  close,
}: UpdateOwnerModalProps) {
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  const { changeOwnershipDnsEntry } = useMnsManagement();

  if (!isOpen) return null;

  return (
    <div>
      <ChangeModal
        onClose={close}
        title={`Transfer ownership of ${domain}.massa`}
        inputPlaceholder="Enter a new owner address"
        setInputValue={setNewOwnerAddress}
        onSave={() => {
          // TODO: await ?
          changeOwnershipDnsEntry({
            currentOwner: owner,
            newOwner: newOwnerAddress,
            domain: domain,
          });
          close();
        }}
      />
    </div>
  );
}
