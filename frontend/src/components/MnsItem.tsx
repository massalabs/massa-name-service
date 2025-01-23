import {
  ChevronDoubleRightIcon,
  PencilIcon,
  ArrowsRightLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Clipboard, Tooltip } from '@massalabs/react-ui-kit';

type MnsItemProps = {
  item: { domain: string; targetAddress: string };
  onUpdateTarget: () => void;
  onUpdateOwnership: () => void;
  onDelete: () => void;
  isPending: boolean;
};

export function MnsItem({
  item,
  onUpdateTarget,
  onUpdateOwnership,
  onDelete,
  isPending,
}: MnsItemProps) {
  const formatTextWithTooltip = (
    text: string,
    maxLength: number,
    suffix = '',
  ) => {
    const displayText =
      text.length > maxLength ? `${text.slice(0, maxLength)}${suffix}` : text;

    return (
      <>
        {text.length > maxLength ? (
          <Tooltip body={text}>
            <Clipboard
              rawContent={text}
              displayedContent={`${displayText}...`}
            />
          </Tooltip>
        ) : (
          <div className="w-fit">
            <Clipboard rawContent={text} displayedContent={displayText} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex grow justify-between bg-secondary rounded-xl p-4 mb-4 gap-6">
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

type ActionButtonProps = {
  onClick: () => void;
  isPending: boolean;
  tooltip: string;
  Icon: React.ElementType;
};

function ActionButton({
  onClick,
  isPending,
  tooltip,
  Icon,
}: ActionButtonProps) {
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
