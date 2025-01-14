// useMnsAlloc

import { useAccountStore, useHandleOperation } from '@massalabs/react-ui-kit';
import { useMnsStore } from '../store/mnsStore';
import { DnsAllocParams } from '../utils/interface';
import { useMnsList } from './useMnsList';
import { insufficientFundsMessage, OPERATION_MESSAGES } from './utils';

export function useMnsAllocation() {
  const {
    mnsContract,
    domain,
    setDomain,
    mnsInputError,
    setMnsInputError,
    isPriceLoading,
    setIsPriceLoading,
    allocCost,
    setAllocCost,
  } = useMnsStore();

  const { handleOperation, isPending } = useHandleOperation();
  const { getUserDomains } = useMnsList();
  const { connectedAccount: provider } = useAccountStore();

  async function getAllocationCost(params: DnsAllocParams) {
    try {
      return await mnsContract.dnsAllocCost(params.domain);
    } catch (error) {
      throw Error(
        'Name can only be 2-100 characters long and can contain only lowercase letters, numbers, and hyphens.',
      );
    }
  }

  async function claim() {
    if (!provider) return;

    const operation = await mnsContract.alloc(domain, provider.address, {
      coins: allocCost,
    });
    await handleOperation(operation, OPERATION_MESSAGES.claim);

    getUserDomains(provider.address);
    setDomain('');
  }

  async function onDomainInputChange(domain: string) {
    if (!provider) return;
    setMnsInputError(null);
    setIsPriceLoading(true);
    setDomain(domain);

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
      const cost = await getAllocationCost({
        domain,
        targetAddress: provider.address ?? '',
      });

      const targetBalance = await provider.balance(false);

      if (cost > targetBalance) {
        setMnsInputError(insufficientFundsMessage(cost, targetBalance));
        resetCostAndLoading(cost);
        return;
      }

      setAllocCost(cost);
    } catch (err) {
      handleCostError(err);
    } finally {
      setIsPriceLoading(false);
    }
  }

  function resetCostAndLoading(cost: bigint = 0n) {
    setAllocCost(cost);
    setIsPriceLoading(false);
  }

  function handleCostError(err: unknown) {
    if (err instanceof Error) {
      setMnsInputError(err.message);
    } else {
      if (err instanceof Error) {
        setMnsInputError(`An unexpected error occurred ${err.message} `);
      } else {
        setMnsInputError('An unexpected error occurred');
      }
    }

    resetCostAndLoading();
  }

  return {
    claim,
    onDomainInputChange,
    getUserDomains,
    allocCost,
    isPriceLoading,
    mnsInputError,
    isPending,
    mnsContract,
    domain,
  };
}
