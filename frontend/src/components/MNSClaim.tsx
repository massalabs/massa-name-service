import { Button, formatAmount } from '@massalabs/react-ui-kit';
import { InputWithRightText } from './InputWithRightText';
import { Mas } from '@massalabs/massa-web3';

import { useMnsAllocation } from '../hooks/useMnsAllocation';

export function MNSClaim() {
  const {
    onDomainInputChange,
    claim,
    mnsInputError,
    allocCost,
    isPriceLoading,
  } = useMnsAllocation();

  const isRegisterDisabled = !!mnsInputError || isPriceLoading || !allocCost;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <InputWithRightText
            customClass="w-96 border-none"
            rightText=".massa"
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
              Price {formatAmount(allocCost, Mas.NB_DECIMALS).full} MAS
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
