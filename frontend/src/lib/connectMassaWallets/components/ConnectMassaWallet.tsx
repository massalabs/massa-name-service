import { useEffect, useState } from 'react';
import {
  MassaWallet as MassaWalletLogo,
  Tooltip,
} from '@massalabs/react-ui-kit';
import BearbyWallet from './BearbyWallet';
import SelectMassaWallet from './SelectMassaWallet';
import StationWallet from './StationWallet';
import SwitchWalletButton from './SwitchWalletButton';
import { ChainStatus } from './Status/ChainStatus';
import { useAccountStore } from '../store';
import Intl from '../i18n/i18n';
import { SUPPORTED_MASSA_WALLETS } from '../const';
import { BearbySvg } from './BearbySvg';

export const ConnectMassaWallet = () => {
  const { currentProvider, providers, setCurrentProvider, isFetching } =
    useAccountStore();

  const [selectedProvider, setSelectedProvider] = useState<
    SUPPORTED_MASSA_WALLETS | undefined
  >(currentProvider?.name() as SUPPORTED_MASSA_WALLETS);

  useEffect(() => {
    const provider = providers.find((p) => p.name() === selectedProvider);
    if (provider && !currentProvider) {
      setCurrentProvider(provider);
    }
  }, [providers, selectedProvider, currentProvider, setCurrentProvider]);

  if (!selectedProvider || isFetching)
    return (
      <SelectMassaWallet
        onClick={(providerName) => {
          setSelectedProvider(providerName);
          const provider = providers.find((p) => p.name() === providerName);
          if (provider) {
            setCurrentProvider(provider);
          }
        }}
      />
    );

  function renderWallet() {
    switch (selectedProvider) {
      case SUPPORTED_MASSA_WALLETS.MASSASTATION:
        return <StationWallet />;
      case SUPPORTED_MASSA_WALLETS.BEARBY:
        return <BearbyWallet />;
      default:
        // Should not happen
        return <>Error: no wallet selected</>;
    }
  }

  function renderSelectedWallet() {
    switch (selectedProvider) {
      case SUPPORTED_MASSA_WALLETS.MASSASTATION:
        return (
          <>
            <MassaWalletLogo size={28} />
            {Intl.t(`connect-wallet.${SUPPORTED_MASSA_WALLETS.MASSASTATION}`)}
          </>
        );
      case SUPPORTED_MASSA_WALLETS.BEARBY:
        return (
          <>
            <BearbySvg />
            {Intl.t(`connect-wallet.${SUPPORTED_MASSA_WALLETS.BEARBY}`)}
          </>
        );
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          {renderSelectedWallet()}
          <ChainStatus />
          {selectedProvider === SUPPORTED_MASSA_WALLETS.BEARBY && (
            <Tooltip
              customClass="mas-caption w-fit whitespace-nowrap"
              body={Intl.t('connect-wallet.card-destination.non-massa-wallet')}
            />
          )}
        </div>
        <SwitchWalletButton
          onClick={() => {
            setSelectedProvider(undefined);
            setCurrentProvider();
          }}
        />
      </div>
      {renderWallet()}
    </>
  );
};
