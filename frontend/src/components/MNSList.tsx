import {
  ChevronDoubleRightIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  Accordion,
  Button,
  Input,
  PopupModal,
  PopupModalContent,
  PopupModalHeader,
  Spinner,
  Tooltip,
} from '@massalabs/react-ui-kit';
import { useAccountStore } from '../lib/connectMassaWallets/store';
import { useCallback, useEffect, useState } from 'react';
import { DnsUserEntryListResult, useWriteMNS } from '../utils/write-mns-sc';

export function MNSList() {
  const { massaClient, connectedAccount } = useAccountStore();
  const { getUserEntryList, deleteDnsEntry, changeTargetAddressDnsEntry } =
    useWriteMNS(massaClient);
  const [spinning, setSpinning] = useState(false);
  const [list, setList] = useState<DnsUserEntryListResult[]>([]);

  const [changeTargetModalId, setChangeTargetModalId] = useState<string | null>(
    null,
  );
  const [newTargetAddress, setNewTargetAddress] = useState<string>('');

  const updateDnsEntryList = useCallback(async () => {
    if (connectedAccount && massaClient && !spinning && !list.length) {
      setSpinning(true);
      getUserEntryList({ address: connectedAccount.address() })
        .then((entries) => {
          setList(entries);
          setSpinning(false);
        })
        .catch(() => {
          setSpinning(false);
        });
    }
  }, [massaClient, connectedAccount, spinning, getUserEntryList]);

  useEffect(() => {
    updateDnsEntryList();
  }, [massaClient, updateDnsEntryList]);

  return (
    <div>
      <Accordion customClass="border-none" title="Entry list">
        {spinning ? (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div>
            {changeTargetModalId && (
              <div className="fixed inset-0 flex items-center justify-center">
                <PopupModal onClose={() => setChangeTargetModalId(null)}>
                  <PopupModalHeader customClassHeader="mb-8">
                    <h2 className="mas-h2">
                      Change target address of {changeTargetModalId}.massa
                    </h2>
                  </PopupModalHeader>
                  <PopupModalContent>
                    <p className="mas-body pb-2">New target Address</p>
                    <Input
                      customClass="w-96 border-none mb-8"
                      placeholder="Enter a new target address"
                      onChange={(e) => {
                        setNewTargetAddress(e.target.value);
                      }}
                    />
                    <div className="flex flex-row-reverse pb-12">
                      <div className="w-32">
                        <Button
                          onClick={() => {
                            changeTargetAddressDnsEntry({
                              domain: changeTargetModalId,
                              targetAddress: newTargetAddress,
                            });
                            setChangeTargetModalId(null);
                          }}
                        >
                          <div>Save</div>
                        </Button>
                      </div>
                    </div>
                  </PopupModalContent>
                </PopupModal>
              </div>
            )}
            <div>
              {list.map((item, idx) => (
                <div key={idx} className="bg-secondary rounded-xl p-4 mb-4">
                  <div className="flex flex-row">
                    <div className="flex justify-between grow">
                      <p className="mas-body my-auto">
                        {item.domain + '.massa'}
                      </p>
                      <ChevronDoubleRightIcon className="w-6" />
                      <Tooltip body={item.targetAddress}>
                        <p className="mas-body pr-4 my-auto	">
                          {item.targetAddress.slice(0, 10)}...
                        </p>
                      </Tooltip>
                    </div>
                    <button
                      className="flex"
                      onClick={() => {
                        setChangeTargetModalId(item.domain);
                      }}
                    >
                      <PencilIcon className="w-5 mr-2 my-auto" />
                      <p className="mas-body mr-4 my-auto">Change target</p>
                    </button>
                    <button
                      className="flex"
                      onClick={() => {
                        deleteDnsEntry({ tokenId: item.tokenId });
                      }}
                    >
                      <TrashIcon className="w-5 mr-2 my-auto" />
                      <p className="mas-body my-auto">Delete</p>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Accordion>
    </div>
  );
}
