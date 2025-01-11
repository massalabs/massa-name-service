import { Button, formatAmount } from '@massalabs/react-ui-kit';
import { InputWithRightText } from './InputWithRightText';
import { Mas, Provider } from '@massalabs/massa-web3';
import { useMnsClaim } from '../hooks/useMnsClaim';
import { useEffect } from 'react';
import { useMnsStore } from '../store/mns';

interface MnsClaimProps {
  provider: Provider;
}

export function MNSClaim({ provider }: MnsClaimProps) {
  const { onDomainChange, claim, error, loadPrice, allocCost, domain } =
    useMnsClaim(provider);
  const { mnsContract } = useMnsStore();

  useEffect(() => {
    onDomainChange(domain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, mnsContract]);

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
              {/* TODO: fix to get the same behavior than prod */}
              Price {formatAmount(allocCost, Mas.NB_DECIMALS).preview} MAS
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
