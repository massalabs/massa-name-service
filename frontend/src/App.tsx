import { ConnectMassaWallet } from './lib/connectMassaWallets/components/ConnectMassaWallet';
import './App.css'
import { Card } from './components/Card';
import { FAQ, FAQData } from './components/FAQ';
import { Button } from '@massalabs/react-ui-kit';
import { MNSManagement } from './components/MNSManagement';

const faqData: FAQData[] = [
  {
    question: 'What is Massa Name Service ?',
    answer: 'Massa Name Service is a decentralized naming protocol that allows users to register a human-readable name for their Massa address. This name can be used to send and receive Massa, and to interact with smart contracts and dApps.'
  },
  {
    question: 'How do I register a name ?',
    answer: 'To register a name, you must connect your wallet and search for an available name. If the name is available, you can register it for a fee.'
  }
];

function App() {
  return (
    <div className="sm:w-full md:max-w-4xl mx-auto">
      <div className="flex justify-between mb-2">
        <img
          src="/logo_massa.svg"
          alt="Massa logo"
          style={{ height: '64px' }}
        />
        <Button preIcon={<img
          src="/pu_logo.svg"
          alt="Purrfect Universe logo"
        />} customClass="w-40 mt-2 bg-primary border-none text-neutral ">
        <div className="flex items-center">Trade</div>
      </Button>
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
        <Card customClass="min-w-96 min-h-64">
          <MNSManagement />
          </Card>
        </section>
        <FAQ data={faqData} />
      </div>
    </div>
  );
}

export default App
