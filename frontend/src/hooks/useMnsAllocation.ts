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
    readOnlyMnsContract,
    newDomain,
    mnsInputError,
    priceLoading,
    allocationCost,
    setNewDomain,
    setMnsInputError,
    setPriceLoading,
    setAllocationCost,
  } = useMnsStore();

  const { handleOperation, isPending } = useHandleOperation();
  const { getUserDomains } = useMnsList();
  const { connectedAccount: provider, refreshBalance } = useAccountStore();

  useEffect(() => {
    if (!mnsContract) return;
    // Update Alloc price or error message when mnsContract changes (if account changes)
    onDomainInputChange(newDomain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mnsContract]);

  async function getAllocationCost(domain: string) {
    return await readOnlyMnsContract.dnsAllocCost(domain);
  }

  async function claim() {
    if (!provider) return;

    const operation = await mnsContract.alloc(newDomain, provider.address, {
      coins: allocationCost,
    });

    await handleOperation(operation, CLAIM_OP_MESSAGE);

    getUserDomains(provider.address);
    setNewDomain('');
    refreshBalance(false);
  }

  async function onDomainInputChange(domain: string) {
    if (!provider) return;
    setMnsInputError(null);
    setPriceLoading(true);
    setNewDomain(domain);

    if (!domain) {
      resetCostAndLoading();
      return;
    }

    const target = await readOnlyMnsContract.resolve(domain);
    if (target) {
      setMnsInputError(`Domain already linked to ${target}`);
      resetCostAndLoading();
      return;
    }

    try {
      const cost = await getAllocationCost(domain);
      const resultBalance = await readOnlyMnsContract.provider.balanceOf([
        provider.address.toString(),
      ]);

      const targetBalance = resultBalance[0];

      if (cost > targetBalance.balance) {
        setMnsInputError(insufficientFundsMessage(cost, targetBalance.balance));
        resetCostAndLoading(cost);
        return;
      }

      setAllocationCost(cost);
    } catch (err) {
      handleCostError(err);
    } finally {
      setPriceLoading(false);
    }
  }

  function resetCostAndLoading(cost: bigint = 0n) {
    setAllocationCost(cost);
    setPriceLoading(false);
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
    priceLoading,
    mnsInputError,
    isPending,
    mnsContract,
    newDomain,
  };
}
