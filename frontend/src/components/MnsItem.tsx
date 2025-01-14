import {
  ChevronDoubleRightIcon,
  PencilIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Clipboard, Tooltip } from '@massalabs/react-ui-kit';

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
  const formatTextWithTooltip = (
    text: string,
    maxLength: number,
    suffix = '',
  ) => {
    const displayText =
      text.length > maxLength ? `${text.slice(0, maxLength)}${suffix}` : text;

    return (
      <div className="cursor-pointer">
        {text.length > maxLength ? (
          <Tooltip body={text}>
            <Clipboard rawContent={`${displayText}...`} />
          </Tooltip>
        ) : (
          <div className="w-fit hover:cursor-pointer">
            <Clipboard rawContent={displayText} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex grow justify-between bg-secondary rounded-xl p-4 mb-4 gap-6 cursor-pointer">
      <div className="w-1/3">
        {formatTextWithTooltip(`${item.domain}.massa`, 22)}
      </div>
      <ChevronDoubleRightIcon className="w-6" />
      <div className="w-1/4">
        {formatTextWithTooltip(item.targetAddress, 20)}
      </div>

      <div className="flex gap-2">
        <ActionButton
          onClick={onUpdateTarget}
          isPending={isPending}
          tooltip="Change target"
          Icon={PencilIcon}
        />
        <ActionButton
          onClick={onUpdateOwnership}
          isPending={isPending}
          tooltip="Change ownership"
          Icon={ArrowsRightLeftIcon}
        />
        <ActionButton
          onClick={onDelete}
          isPending={isPending}
          tooltip="Delete"
          Icon={TrashIcon}
        />
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  isPending,
  tooltip,
  Icon,
}: {
  onClick: () => void;
  isPending: boolean;
  tooltip: string;
  Icon: React.ElementType;
}) {
  return (
    <button
      className="flex-col justify-center align-middle"
      onClick={onClick}
      disabled={isPending}
    >
      <Tooltip body={<p className="mas-body">{tooltip}</p>}>
        <Icon className="w-4 pt-1" />
      </Tooltip>
    </button>
  );
}
