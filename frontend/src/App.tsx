import { Card } from './components/Card';
import { FAQ } from './components/FAQ';
import { Button, ConnectMassaWallet, Toast } from '@massalabs/react-ui-kit';
import { MNSManagement } from './components/MNSManagement';

function App() {
  return (
    <>
      <Toast />
      <div className="sm:w-full md:max-w-4xl mx-auto mt-10">
        <div className="flex justify-between mb-2">
          <img
            src="/logo_massa.svg"
            alt="Massa logo"
            style={{ height: '64px' }}
          />
          <a target="_blank" href="https://www.purrfectuniverse.com/">
            <Button
              preIcon={<img src="/pu_logo.svg" alt="Purrfect Universe logo" />}
              customClass="w-40 mt-2 bg-primary border-none text-neutral "
            >
              <div className="flex items-center">Trade</div>
            </Button>
          </a>
        </div>
        <div className="p-5">
          <section className="mb-4 p-2">
            <p className="mas-title mb-2">MNS Manager</p>
          </section>
          <section className="mb-10">
            <Card>
              <ConnectMassaWallet />
            </Card>
          </section>
          <section className="mb-16">
            <Card customClass="flex items-center justify-center min-w-96 min-h-32">
              <MNSManagement />
            </Card>
          </section>
          <FAQ />
        </div>
      </div>
    </>
  );
}

export default App;
