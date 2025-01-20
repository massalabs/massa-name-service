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

  const onSave = async () => {
    changeOwnershipDnsEntry({
      currentOwner: owner,
      newOwner: newOwnerAddress,
      domain: domain,
    });
    close();
  };

  return (
    <div>
      <ChangeModal
        title={`Transfer ownership of ${domain}.massa`}
        inputPlaceholder="Enter a new owner address"
        setInputValue={setNewOwnerAddress}
        onSave={onSave}
        onClose={close}
      />
    </div>
  );
}
