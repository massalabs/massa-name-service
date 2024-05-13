import { Button, toast } from '@massalabs/react-ui-kit';
import { InputWithRightText } from './InputWithRightText';
import { useState } from 'react';
import { useWriteMNS } from '../utils/write-mns-sc';
import { useAccountStore } from '../lib/connectMassaWallets/store';

export function MNSClaim() {
    const [domain, setDomain] = useState<string>('');
    const { connectedAccount, massaClient } = useAccountStore();
    const { dnsAlloc, getAllocCost } = useWriteMNS(massaClient);
    const [price, setPrice] = useState<number>(0);

    function claim() {
        if (!connectedAccount) {
            toast.error('Please connect your wallet');
            return;
        }
        dnsAlloc({ domain, targetAddress: connectedAccount.address() });
    }

    function onDomainChange(domain: string) {
        if (!connectedAccount) {
            toast.error('Please connect your wallet');
            return;
        }
        setDomain(domain);
        getAllocCost({ domain, targetAddress: connectedAccount?.address() ?? '' }).then((cost) => {
            setPrice(cost);
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
                        onChange={(e) => { onDomainChange(e.target.value) }}
                    />
                    <p className="mb-4 font-light text-neutral">Price  MAS</p>
                </div>
                <Button
                    onClick={() => claim()}
                >Claim</Button>
            </div>
        </div>
    );
}
