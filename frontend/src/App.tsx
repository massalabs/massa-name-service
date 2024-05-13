import { useState } from 'react'
import { ConnectMassaWallet } from './lib/connectMassaWallets/components/ConnectMassaWallet';
import './App.css'
import SwitchWalletButton from './lib/connectMassaWallets/components/SwitchWalletButton';
import { useAccountStore } from './lib/connectMassaWallets/store';
import { Card } from './components/Card';

function App() {

  const {
    connectedAccount,
    massaClient: client,
    currentProvider,
  } = useAccountStore();

  const connected = !!connectedAccount && !!currentProvider;

  return (
    <div className="sm:w-full md:max-w-4xl mx-auto">
      <div className="flex justify-between mb-2">
        <img
          src="/logo_massa.svg"
          alt="Massa logo"
          style={{ height: '64px' }}
        />
      </div>
      <div className="p-5">
        <section className="mb-4 p-2">
          <p className="mas-title mb-2">DNS Manager</p>
        </section>
        <section className="mb-10">
          <Card>
            <ConnectMassaWallet />
          </Card>
        </section>
        <section className="mb-10">
          {!connected ? (
            <Card>
              <h3 className="mas-h3">
                Connect a wallet to view your vesting sessions
              </h3>
            </Card>
          ) : (
            <Card>
              <h3 className="mas-h3">No active vesting sessions</h3>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

export default App
