import { Button, formatAmount } from '@massalabs/react-ui-kit';
import { InputWithRightText } from './InputWithRightText';
import { Mas, Provider } from '@massalabs/massa-web3';
import { useMnsClaim } from '../hooks/useMnsClaim';

interface MnsClaimProps {
  provider: Provider;
}

export function MNSClaim({ provider }: MnsClaimProps) {
  const { onDomainChange, claim, error, loadPrice, allocCost } =
    useMnsClaim(provider);

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <InputWithRightText
            customClass="w-96 border-none"
            rightText=".massa"
            placeholder="Enter a domain"
            onChange={(e) => {
              onDomainChange(e.target.value);
            }}
          />

          {error ? (
            <p className="mb-4 font-light text-s-error">{error}</p>
          ) : loadPrice ? (
            <p className="mb-4 font-light text-neutral">Loading price...</p>
          ) : (
            <p className="mb-4 font-light text-neutral">
              Price {formatAmount(allocCost, Mas.NB_DECIMALS).full} MAS
            </p>
          )}
        </div>
        <Button
          disabled={!!error || loadPrice || !allocCost}
          onClick={() => claim()}
        >
          Register
        </Button>
      </div>
    </div>
  );
}
