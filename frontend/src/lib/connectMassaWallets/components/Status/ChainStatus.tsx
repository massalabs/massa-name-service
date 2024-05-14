import { useAccountStore } from '../../store';
import { Connected } from './Connected';
import { Disconnected } from './Disconnected';

export function ChainStatus() {
  const { connectedAccount, currentProvider } = useAccountStore();

  const connected = !!connectedAccount && !!currentProvider;

  return <>{connected ? <Connected /> : <Disconnected />}</>;
}
