import {
  PopupModal,
  PopupModalHeader,
  PopupModalContent,
  Button,
  Input,
} from '@massalabs/react-ui-kit';

export function ChangeModal({
  onClose,
  title,
  inputPlaceholder,
  onSave,
  setInputValue,
}: {
  onClose: () => void;
  title: string;
  inputPlaceholder: string;
  onSave: () => void;
  setInputValue: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <PopupModal onClose={onClose}>
        <PopupModalHeader customClassHeader="mb-8">
          <h2 className="mas-h2">{title}</h2>
        </PopupModalHeader>
        <PopupModalContent>
          <p className="mas-body pb-2">Enter Address</p>
          <Input
            customClass="w-96 border-none mb-8"
            placeholder={inputPlaceholder}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="flex flex-row-reverse pb-12">
            <div className="w-32">
              <Button onClick={onSave}>
                <div>Save</div>
              </Button>
            </div>
          </div>
        </PopupModalContent>
      </PopupModal>
    </div>
  );
}
