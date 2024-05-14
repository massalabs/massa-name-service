import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Accordion, Spinner } from '@massalabs/react-ui-kit';
import { useAccountStore } from '../lib/connectMassaWallets/store';
import { useCallback, useEffect, useState } from 'react';
import { DnsUserEntryListResult, useWriteMNS } from '../utils/write-mns-sc';

export function MNSList() {
  const { massaClient, connectedAccount } = useAccountStore();
  const { getUserEntryList } = useWriteMNS(massaClient);
  const [spinning, setSpinning] = useState(false);
  const [list, setList] = useState<DnsUserEntryListResult[]>([]);

  const updateDnsEntryList = useCallback(async () => {
    if (connectedAccount && massaClient && !spinning) {
      setSpinning(true);
      getUserEntryList({ address: connectedAccount.address() }).then((entries) => {
        setList(entries);
        setSpinning(false);
      }).catch(() => {
        setSpinning(false);
      });
    }
  }, [massaClient]);

  useEffect(() => {
    updateDnsEntryList();
  }, [massaClient]);

  //TODO ADD SPINNER
  return (
    <div>
      <Accordion customClass="border-none" title="Entry list">
        {spinning ? (
          <div className="flex items-center justify-center">
            <Spinner />

          </div>
        ) : (<div>
          {list.map((item, idx) => (
            <div key={idx} className="bg-secondary rounded-xl p-4 mb-4">
              <div className="flex flex-row">
                <p className=" grow mas-body">{item.domain + '.massa'}</p>
                <PencilIcon className="w-4 mr-2" />
                <p className="text-neutral mr-4">Change target</p>
                <TrashIcon className="w-4 mr-2" />
                <p className="text-neutral">Delete</p>
              </div>
            </div>
          ))}
        </div>)}

      </Accordion>
    </div>
  );
}
