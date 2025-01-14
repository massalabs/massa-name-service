import {
  ChevronDoubleRightIcon,
  PencilIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from '@massalabs/react-ui-kit';

export function MnsItem({
  item,
  onUpdateTarget,
  onUpdateOwnership,
  onDelete,
  isPending,
}: {
  item: { domain: string; targetAddress: string };
  onUpdateTarget: () => void;
  onUpdateOwnership: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="bg-secondary rounded-xl p-4 mb-4">
      <div className="flex flex-row">
        <div className="flex justify-between grow">
          <p className="mas-body my-auto w-32">{item.domain}.massa</p>
          <ChevronDoubleRightIcon className="w-6" />
          <Tooltip body={item.targetAddress}>
            <p className="mas-body pr-4 my-auto w-28">
              {item.targetAddress.slice(0, 10)}...
            </p>
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <button
            className="flex"
            onClick={onUpdateTarget}
            disabled={isPending}
          >
            <Tooltip body={<p className="mas-body">Change target</p>}>
              <PencilIcon className="w-4 pt-1" />
            </Tooltip>
          </button>
          <button
            className="flex"
            onClick={onUpdateOwnership}
            disabled={isPending}
          >
            <Tooltip body={<p className="mas-body">Change ownership</p>}>
              <ArrowsRightLeftIcon className="w-4 pt-1" />
            </Tooltip>
          </button>
          <button className="flex" onClick={onDelete} disabled={isPending}>
            <Tooltip body={<p className="mas-body">Delete</p>}>
              <TrashIcon className="w-4 mr-2 pt-1" />
            </Tooltip>
          </button>
        </div>
      </div>
    </div>
  );
}
