import { Button, toast } from '@massalabs/react-ui-kit';
import { InputWithRightText } from './InputWithRightText';
import { useState } from 'react';
import { DnsGetAllocCostResponse, useWriteMNS } from '../utils/write-mns-sc';
import { useAccountStore } from '../lib/connectMassaWallets/store';
import { toMAS } from '@massalabs/massa-web3';

export function MNSClaim() {
  const [domain, setDomain] = useState<string>('');
  const { connectedAccount, massaClient } = useAccountStore();
  const { dnsAlloc, getAllocCost } = useWriteMNS(massaClient);
  const [allocCost, setAllocCost] = useState<DnsGetAllocCostResponse>({price: 0n});

  function claim() {
    if (!connectedAccount) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!allocCost.price) {
        toast.error('Invalid price');
        return;
    }
    dnsAlloc({
      domain,
      targetAddress: connectedAccount.address(),
      coins: allocCost.price,
    });
  }

  function onDomainChange(domain: string) {
    if (!connectedAccount) {
      toast.error('Please connect your wallet');
      return;
    }
    if (domain == '') {
        setAllocCost({price: 0n});
        return;
    }
    setDomain(domain);
    getAllocCost({
      domain,
      targetAddress: connectedAccount?.address() ?? '',
    }).then((cost) => {
        setAllocCost(cost);
    });
  }
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
          {
            allocCost.price !== null ? (
                <p className="mb-4 font-light text-neutral">
                Price {toMAS(allocCost.price).toFixed(4)} MAS
              </p>
            ) : (
                <p className="mb-4 font-light text-s-error">
                   {allocCost.error}
                </p>
            )
          }
        </div>
        <Button disabled={allocCost.price !== null ? false : true} onClick={() => claim()}>Claim</Button>
      </div>
    </div>
  );
}
