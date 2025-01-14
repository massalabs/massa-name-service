import { Button, formatAmount } from '@massalabs/react-ui-kit';
import { MnsInput } from './MnsInput';
import { Mas } from '@massalabs/massa-web3';

import { useMnsAllocation } from '../hooks/useMnsAllocation';

export function MNSClaim() {
  const {
    mnsInputError,
    allocationCost,
    isPriceLoading,
    claim,
    onDomainInputChange,
  } = useMnsAllocation();

  const isRegisterDisabled =
    !!mnsInputError || isPriceLoading || !allocationCost;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <MnsInput
            customClass="w-96 border-none"
            placeholder="Enter a domain"
            onChange={(e) => {
              onDomainInputChange(e.target.value);
            }}
          />

          {mnsInputError ? (
            <p className="mb-4 font-light text-s-error">{mnsInputError}</p>
          ) : isPriceLoading ? (
            <p className="mb-4 font-light text-neutral">Loading price...</p>
          ) : (
            <p className="mb-4 font-light text-neutral">
              Price {formatAmount(allocationCost, Mas.NB_DECIMALS).full} MAS
            </p>
          )}
        </div>
        <Button disabled={isRegisterDisabled} onClick={claim}>
          Register
        </Button>
      </div>
    </div>
  );
}
