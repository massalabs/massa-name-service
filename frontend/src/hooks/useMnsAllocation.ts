import { useAccountStore, useHandleOperation } from '@massalabs/react-ui-kit';
import { useMnsStore } from '../store/mnsStore';
import { useMnsList } from './useMnsList';
import { insufficientFundsMessage } from './utils';
import {
  INVALID_MNS_ERROR_MESSAGE,
  UNEXPECTED_MNS_ERROR_MESSAGE,
} from '../const/errorMessages';
import { CLAIM_OP_MESSAGE } from '../const/operationMessages';
import { useEffect } from 'react';

export function useMnsAllocation() {
  const {
    mnsContract,
    newDomain,
    setNewDomain,
    mnsInputError,
    setMnsInputError,
    isPriceLoading,
    setIsPriceLoading,
    allocationCost,
    setAllocationCost,
  } = useMnsStore();

  const { handleOperation, isPending } = useHandleOperation();
  const { getUserDomains } = useMnsList();
  const { connectedAccount: provider } = useAccountStore();

  useEffect(() => {
    if (!mnsContract) return;
    onDomainInputChange(newDomain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mnsContract]);

  async function getAllocationCost(domain: string) {
    return await mnsContract.dnsAllocCost(domain);
  }

  async function claim() {
    if (!provider) return;

    const operation = await mnsContract.alloc(newDomain, provider.address, {
      coins: allocationCost,
    });

    await handleOperation(operation, CLAIM_OP_MESSAGE);

    getUserDomains(provider.address);
    setNewDomain('');
  }

  async function onDomainInputChange(domain: string) {
    if (!provider) return;
    setMnsInputError(null);
    setIsPriceLoading(true);
    setNewDomain(domain);

    if (!domain) {
      resetCostAndLoading();
      return;
    }

    // TODO: Should we get owner instead of target? or both?
    const target = await mnsContract.resolve(domain);
    if (target) {
      setMnsInputError(`Domain already linked to ${target}`);
      resetCostAndLoading();
      return;
    }

    try {
      const cost = await getAllocationCost(domain);
      const targetBalance = await provider.balance(false);

      if (cost > targetBalance) {
        setMnsInputError(insufficientFundsMessage(cost, targetBalance));
        resetCostAndLoading(cost);
        return;
      }

      setAllocationCost(cost);
    } catch (err) {
      handleCostError(err);
    } finally {
      setIsPriceLoading(false);
    }
  }

  function resetCostAndLoading(cost: bigint = 0n) {
    setAllocationCost(cost);
    setIsPriceLoading(false);
  }

  function handleCostError(error: unknown) {
    if (error instanceof Error && error.message.includes('Invalid domain')) {
      setMnsInputError(INVALID_MNS_ERROR_MESSAGE);
    } else {
      setMnsInputError(UNEXPECTED_MNS_ERROR_MESSAGE);
      console.error('Error fetching allocation cost', error);
    }
    resetCostAndLoading();
  }

  return {
    claim,
    onDomainInputChange,
    getUserDomains,
    getAllocationCost,
    allocationCost,
    isPriceLoading,
    mnsInputError,
    isPending,
    mnsContract,
    newDomain,
  };
}
