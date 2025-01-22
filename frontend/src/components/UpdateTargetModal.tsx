import { useState } from 'react';
import { useMnsManagement } from '../hooks/useMnsManagement';
import { ChangeModal } from './UpdateModal';

type UpdateTargetModalProps = {
  isOpen: boolean;
  domain: string;
  close: () => void;
};

export function UpdateTargetModal({
  isOpen,
  domain,
  close,
}: UpdateTargetModalProps) {
  const [newTargetAddress, setNewTargetAddress] = useState<string>('');

  const { changeTargetAddressDnsEntry } = useMnsManagement();

  if (!isOpen) return null;

  const onSave = async () => {
    changeTargetAddressDnsEntry(domain, newTargetAddress);
    close();
  };

  return (
    <ChangeModal
      title={`Change target address of ${domain}.massa`}
      inputPlaceholder="Enter a new target address"
      setInputValue={setNewTargetAddress}
      onSave={onSave}
      onClose={close}
    />
  );
}
