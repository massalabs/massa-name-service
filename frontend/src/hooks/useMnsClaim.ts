import { formatAmount, useHandleOperation } from '@massalabs/react-ui-kit';
import { useEffect, useState } from 'react';
import { useMnsStore } from '../store/mns';
import { Mas, Provider } from '@massalabs/massa-web3';

export function useMnsClaim(provider: Provider) {
  const [domain, setDomain] = useState<string>('');
  const { mnsContract, getAllocationCost, getUserDomains } = useMnsStore();

  const { handleOperation } = useHandleOperation();
  const [allocCost, setAllocCost] = useState<bigint>(0n);
  const [error, setError] = useState<string | null>(null);
  const [loadPrice, setLoadPrice] = useState<boolean>(false);

  useEffect(() => {
    onDomainChange(domain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, mnsContract]);

  async function claim() {
    const operation = await mnsContract.alloc(domain, provider.address, {
      coins: allocCost,
    });

    await handleOperation(operation, {
      pending: 'Entry registering in progress',
      success: 'Successfully registered',
      error: 'Failed to register',
    });

    getUserDomains(provider, provider.address);
    setDomain('');
  }

  async function onDomainChange(domain: string) {
    setError(null);
    setLoadPrice(true);
    setDomain(domain);

    if (!domain) {
      resetCostAndLoading();
      return;
    }

    // TODO: Should we get owner instead of target? or both?
    const target = await mnsContract.resolve(domain);
    if (target) {
      setError(`Domain already linked to ${target}`);
      resetCostAndLoading();
      return;
    }

    try {
      const cost = await getAllocationCost({
        domain,
        targetAddress: provider?.address ?? '',
      });

      const targetBalance = await provider?.balance(false);

      if (cost > targetBalance) {
        setError(insufficientFundsMessage(cost, targetBalance));
        resetCostAndLoading(cost);
        return;
      }

      setAllocCost(cost);
    } catch (err) {
      handleCostError(err);
    } finally {
      setLoadPrice(false);
    }
  }

  function resetCostAndLoading(cost: bigint = 0n) {
    setAllocCost(cost);
    setLoadPrice(false);
  }

  function insufficientFundsMessage(cost: bigint, balance: bigint) {
    return `The price of the domain is ${
      formatAmount(cost, Mas.NB_DECIMALS).preview
    } MAS. Your balance is ${
      formatAmount(balance, Mas.NB_DECIMALS).preview
    } MAS. Please top up your account.`;
  }

  function handleCostError(err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      if (err instanceof Error) {
        setError(`An unexpected error occurred ${err.message} `);
      } else {
        setError('An unexpected error occurred');
      }
    }

    resetCostAndLoading();
  }

  return {
    domain,
    error,
    loadPrice,
    allocCost,
    claim,
    onDomainChange,
  };
}
