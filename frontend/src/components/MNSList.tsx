// TODO GLOBAL: ReadSc fails if the address never made a transaction:
// Error: Error: callSC failed: estimating Call SC gas cost for function
// 'dnsFree' at 'AS12qKAVjU1nr66JSkQ6N4Lqu4iwuVc6rAbRTrxFoynPrPdP1sj3G':
// ReadOnlyCall error: readonly call failed: Runtime error: spending address
// AU12rtqcVoXeu1g4xAJ36LKVMhE84DtAMjhUETieQBdR6RXbseBEN not found, caller
// address is AU12rtqcVoXeu1g4xAJ36LKVMhE84DtAMjhUETieQBdR6RXbseBEN and coins are 0

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
  toast,
  Tooltip,
  useHandleOperation,
  useWriteSmartContract,
} from '@massalabs/react-ui-kit';
import { useEffect, useState } from 'react';
import { Args, Provider } from '@massalabs/massa-web3';
import { DnsTransferParams } from '../utils/interface';
import { useMnsStore } from '../store/mnsStore';

interface MNSListProps {
  provider: Provider;
}

export function MNSList({ provider }: MNSListProps) {
  const [changeTargetModalId, setChangeTargetModalId] = useState<string | null>(
    null,
  );

  const [changeOwnershipModalId, setChangeOwnershipModalId] = useState<{
    domain: string;
    tokenId: bigint;
  } | null>(null);

  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');
  const [newTargetAddress, setNewTargetAddress] = useState<string>('');
  const { callSmartContract } = useWriteSmartContract(provider);
  const { handleOperation, isPending } = useHandleOperation();

  const { getUserDomains, listSpinning, list, mnsContract } = useMnsStore();

  useEffect(() => {
    getUserDomains(provider, provider.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.address]);

  async function deleteDnsEntry(name: string) {
    try {
      const operation = await mnsContract.free(name);
      await handleOperation(operation, {
        pending: 'Entry deleting in progress',
        success: 'Successfully deleted',
        error: 'Failed to delete',
      });
      await getUserDomains(provider, provider.address);
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete');
    }
  }

  async function changeTargetAddressDnsEntry(
    domain: string,
    targetAddress: string,
  ) {
    // TODO: Check if really the name
    try {
      const operation = await mnsContract.updateTarget(domain, targetAddress);
      await handleOperation(operation, {
        pending: 'Updating target address in progress',
        success: 'Successfully updated',
        error: 'Failed to update',
      });

      // TODO: Domain are not fetched if balance is 0: Caused by the
      // readSc that fails if Address never made a transaction
      // Temporary fixed by using another address in the readSc
      await getUserDomains(provider, provider.address);
    } catch (error) {
      toast.error('Failed to update');
    }
  }

  async function changeOwnershipDnsEntry({
    currentOwner,
    newOwner,
    tokenId,
  }: DnsTransferParams) {
    let args = new Args()
      .addString(currentOwner)
      .addString(newOwner)
      .addU256(BigInt(tokenId));

    await callSmartContract(
      'transferFrom',
      mnsContract.address,
      args.serialize(),
      {
        pending: 'Updating ownership in progress',
        success: 'Successfully updated',
        error: 'Failed to update',
      },
    );

    await getUserDomains(provider, provider.address);
  }

  // How to not reload all the list if delete or add a new entry but just update the list?
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
                            changeTargetAddressDnsEntry(
                              changeTargetModalId,
                              newTargetAddress,
                            );
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
                            if (!provider) return;
                            changeOwnershipDnsEntry({
                              currentOwner: provider.address,
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
              {list.length === 0 && (
                <div className="flex items-center justify-center">
                  <p className="mas-body">No MNS found</p>
                </div>
              )}
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
                    <div className="flex gap-2">
                      <button
                        className="flex"
                        onClick={() => {
                          setChangeTargetModalId(item.domain);
                        }}
                        disabled={isPending}
                      >
                        <Tooltip
                          body={<p className="mas-body">Change target</p>}
                        >
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
                        disabled={isPending}
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
                          deleteDnsEntry(item.domain);
                        }}
                        disabled={isPending}
                      >
                        <Tooltip body={<p className="mas-body">Delete</p>}>
                          <TrashIcon className="w-4 mr-2 pt-1" />
                        </Tooltip>
                      </button>
                    </div>
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
