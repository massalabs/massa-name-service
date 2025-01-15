import {
  toast,
  useAccountStore,
  useHandleOperation,
} from '@massalabs/react-ui-kit';

import { useMnsStore } from '../store/mnsStore';
import { Args } from '@massalabs/massa-web3';
import { DnsTransferParams } from '../utils/interface';
import { useMnsList } from './useMnsList';
import {
  DELETE_OP_MESSAGE,
  UPDATE_OWNER_OP_MESSAGE,
  UPDATE_TARGET_OP_MESSAGE,
} from '../const/operationMessages';

export function useMnsManagement() {
  const { setMnsContract, mnsContract } = useMnsStore();
  const { handleOperation, isPending } = useHandleOperation();
  const { getUserDomains } = useMnsList();
  const { connectedAccount: provider } = useAccountStore();
  // TODO: Check if provider is not null

  async function deleteDnsEntry(name: string) {
    if (!provider) return;

    try {
      const operation = await mnsContract.free(name);
      await handleOperation(operation, DELETE_OP_MESSAGE);
      await getUserDomains(provider.address);
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete Dns Entry');
    }
  }

  async function changeTargetAddressDnsEntry(
    domain: string,
    targetAddress: string,
  ) {
    if (!provider) return;
    // TODO: Check if really the name
    try {
      const operation = await mnsContract.updateTarget(domain, targetAddress);
      await handleOperation(operation, UPDATE_TARGET_OP_MESSAGE);

      // TODO: Domain are not fetched if balance is 0: Caused by the
      // readSc that fails if Address never made a transaction
      // Temporary fixed by using another address in the readSc
      await getUserDomains(provider.address);
    } catch (error) {
      console.log(error);
      toast.error('Failed to update');
    }
  }

  async function changeOwnershipDnsEntry({
    currentOwner,
    newOwner,
    domain,
  }: DnsTransferParams) {
    if (!provider) return;
    try {
      const operation = await mnsContract.transferFrom(
        currentOwner,
        newOwner,
        domain,
      );
      await handleOperation(operation, UPDATE_OWNER_OP_MESSAGE);
      await getUserDomains(provider.address);
    } catch (error) {
      console.log(error);
      toast.error('Failed to update Ownership');
    }
  }

  return {
    isPending,
    getUserDomains,
    changeOwnershipDnsEntry,
    deleteDnsEntry,
    changeTargetAddressDnsEntry,
    setMnsContract,
  };
}
