import { Clipboard } from '@massalabs/react-ui-kit';
import { useAccountStore } from '../store';
import { maskAddress } from '../utils';

interface ConnectedAccountProps {
  maskLength?: number;
}

export function ConnectedAccount(props: ConnectedAccountProps) {
  const { maskLength } = props;
  const { connectedAccount } = useAccountStore();

  return (
    <div className="flex flex-col w-full">
      <Clipboard
        customClass="h-14 rounded-lg text-center !mas-body"
        rawContent={connectedAccount?.address() ?? ''}
        displayedContent={maskAddress(
          connectedAccount?.address() ?? '',
          maskLength ?? 15,
        )}
      />
    </div>
  );
}
