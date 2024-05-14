import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Accordion } from '@massalabs/react-ui-kit';
import { useAccountStore } from '../lib/connectMassaWallets/store';

const list = ['testAurelien', 'testMassa'];

export function MNSList() {
  const { massaClient } = useAccountStore();
  
  return (
    <div>
      <Accordion customClass="border-none" title="Entry list">
        {list.map((item, idx) => (
          <div key={idx} className="bg-secondary rounded-xl p-4 mb-4">
            <div className="flex flex-row">
              <p className=" grow mas-body">{item + '.massa'}</p>
              <PencilIcon className="w-4 mr-2" />
              <p className="text-neutral mr-4">Change target</p>
              <TrashIcon className="w-4 mr-2" />
              <p className="text-neutral">Delete</p>
            </div>
          </div>
        ))}
      </Accordion>
    </div>
  );
}
