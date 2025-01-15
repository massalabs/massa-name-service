import { Args, U256 } from '@massalabs/massa-web3';
import { useMnsStore } from '../store/mnsStore';

export function useMnsList() {
  const { setList, setListSpinning, readOnlyMnsContract, listSpinning } =
    useMnsStore();

  async function getUserDomains(userAddress: string) {
    setListSpinning(true);

    try {
      const resultBalance = await readOnlyMnsContract.read(
        'balanceOf',
        new Args().addString(userAddress),
      );

      if (resultBalance.info.error) {
        // TODO: Check if right error message
        throw Error('Failed to fetch balanceOf address not found');
      }

      const balance = U256.fromBytes(resultBalance.value);

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
      console.error('Failed to fetch user entries', error);
      setList([]);
    } finally {
      setListSpinning(false);
    }
  }

  return {
    getUserDomains,
    listSpinning,
  };
}
