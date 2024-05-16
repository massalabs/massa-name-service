import { InputMessage, InputProps } from '@massalabs/react-ui-kit';
import { debounce } from 'lodash';

export interface InputWithRightTextProps extends InputProps {
  rightText: string;
}

export function InputWithRightText(props: InputWithRightTextProps) {
  const {
    error,
    warning,
    success,
    onChange,
    disable,
    customClass,
    rightText,
    ...rest
  } = props;

  const disabledClass = disable ? 'border-0' : '';
  const errorClass = error ? 'border-s-error' : '';
  const warningClass = warning ? 'border-s-warning' : '';
  const successClass = success ? 'border-s-success' : '';
  const messageClass =
    errorClass || warningClass || successClass || disabledClass;

  let debouncedOnChange = onChange;
  if (onChange) {
    debouncedOnChange = debounce(onChange, 350);
  }
  return (
    <div className="flex-row">
      <div className="grid-cols-2">
        <div className="inline h-12">
          <input
            data-testid="password-input"
            className={`w-full default-input h-12 pl-3 pr-10 mb-1 ${messageClass} ${customClass}`}
            type="text"
            disabled={disable}
            onChange={debouncedOnChange}
            {...rest}
          />
        </div>
        <div className="inline -ml-16">
          <button
            type="button"
            className="w-10 h-10 bg-transparent mas-body text-tertiary"
            data-testid="password-icon"
            disabled={true}
          >
            {rightText}
          </button>
        </div>
        <InputMessage error={error} warning={warning} success={success} />
      </div>
    </div>
  );
}
