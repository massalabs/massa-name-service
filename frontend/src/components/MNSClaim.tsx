import { Button } from '@massalabs/react-ui-kit';
import { InputWithRightText } from './InputWithRightText';

export function MNSClaim() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <InputWithRightText
            customClass="w-96 border-none"
            rightText=".massa"
            placeholder="Enter a domain"
          />
          <p className="mb-4 font-light text-neutral">Price 0.0000 MAS</p>
        </div>
        <Button>Claim</Button>
      </div>
    </div>
  );
}
