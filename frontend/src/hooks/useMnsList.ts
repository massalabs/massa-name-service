import { useCallback } from 'react';
import { toast } from '@massalabs/react-ui-kit';
import { useMnsStore } from '../store/mnsStore';

export function useMnsList() {
  const { setList, setListSpinning, readOnlyMnsContract, listSpinning } =
    useMnsStore();

  const getUserDomains = useCallback(
    async (userAddress: string) => {
      setListSpinning(true);

      try {
        const balance = await readOnlyMnsContract.balanceOf(userAddress);

        if (balance === 0n) {
          setList([]);
          setListSpinning(false);
          return;
        }

        const domains = await readOnlyMnsContract.getOwnedDomains(userAddress);
        const targets = await readOnlyMnsContract.getTargets(domains);

        const newList = domains.map((domain, index) => ({
          domain,
          targetAddress: targets[index],
        }));
        setList(newList);
      } catch (error) {
        console.error('Failed to fetch user domains', error);
        toast.error('Something went wrong, we could not fetch your domains');
        setList([]);
      } finally {
        setListSpinning(false);
      }
    },
    [readOnlyMnsContract, setList, setListSpinning],
  );

  return {
    getUserDomains,
    listSpinning,
  };
}
