import {
  ArrowsRightLeftIcon,
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
import { useState } from 'react';
import {
  DnsChangeTargetParams,
  DnsDeleteParams,
  DnsTransferParams,
  DnsUserEntryListResult,
} from '../utils/write-mns-sc';
import { useAccountStore } from '../lib/connectMassaWallets/store';

interface MNSListProps {
  list: DnsUserEntryListResult[];
  listSpinning: boolean;
  deleteDnsEntry: (params: DnsDeleteParams) => void;
  changeTargetAddressDnsEntry: (params: DnsChangeTargetParams) => void;
  changeOwnershipDnsEntry: (params: DnsTransferParams) => void;
}

export function MNSList(props: MNSListProps) {
  const {
    list,
    listSpinning,
    deleteDnsEntry,
    changeTargetAddressDnsEntry,
    changeOwnershipDnsEntry,
  } = props;
  const { connectedAccount } = useAccountStore();
  const [changeTargetModalId, setChangeTargetModalId] = useState<string | null>(
    null,
  );

  const [changeOwnershipModalId, setChangeOwnershipModalId] = useState<{
    domain: string;
    tokenId: bigint;
  } | null>(null);
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  const [newTargetAddress, setNewTargetAddress] = useState<string>('');

  return (
    <div>
      <Accordion customClass="border-none" title="Owned MNS">
        {listSpinning ? (
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
            {changeOwnershipModalId && (
              <div className="fixed inset-0 flex items-center justify-center">
                <PopupModal onClose={() => setChangeOwnershipModalId(null)}>
                  <PopupModalHeader customClassHeader="mb-8">
                    <h2 className="mas-h2">
                      Transfer ownership of {changeOwnershipModalId.domain}
                      .massa
                    </h2>
                  </PopupModalHeader>
                  <PopupModalContent>
                    <p className="mas-body pb-2">New owner Address</p>
                    <Input
                      customClass="w-96 border-none mb-8"
                      placeholder="Enter a new owner address"
                      onChange={(e) => {
                        setNewOwnerAddress(e.target.value);
                      }}
                    />
                    <div className="flex flex-row-reverse pb-12">
                      <div className="w-32">
                        <Button
                          onClick={() => {
                            if (!connectedAccount) return;
                            changeOwnershipDnsEntry({
                              currentOwner: connectedAccount.address(),
                              newOwner: newOwnerAddress,
                              tokenId: changeOwnershipModalId.tokenId,
                            });
                            setChangeOwnershipModalId(null);
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
                      <p className="mas-body my-auto w-32">
                        {item.domain + '.massa'}
                      </p>
                      <ChevronDoubleRightIcon className="w-6" />
                      <Tooltip body={item.targetAddress}>
                        <p className="mas-body pr-4 my-auto w-28	">
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
                      <Tooltip body={<p className="mas-body">Change target</p>}>
                        <PencilIcon className="w-4 pt-1" />
                      </Tooltip>
                    </button>
                    <button
                      className="flex"
                      onClick={() => {
                        setChangeOwnershipModalId({
                          domain: item.domain,
                          tokenId: item.tokenId,
                        });
                      }}
                    >
                      <Tooltip
                        body={<p className="mas-body">Change ownership</p>}
                      >
                        <ArrowsRightLeftIcon className="w-4 pt-1" />
                      </Tooltip>
                    </button>
                    <button
                      className="flex"
                      onClick={() => {
                        deleteDnsEntry({ tokenId: item.tokenId });
                      }}
                    >
                      <Tooltip body={<p className="mas-body">Delete</p>}>
                        <TrashIcon className="w-4 mr-2 pt-1" />
                      </Tooltip>
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
