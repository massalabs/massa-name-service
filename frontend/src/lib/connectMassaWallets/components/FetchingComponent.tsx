import Intl from '../i18n/i18n';

export function FetchingRound() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-s-success opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-s-success"></span>
    </span>
  );
}

interface FetchingCircleProps {
  height?: number;
  width?: number;
}

export function FetchingLine(props: FetchingCircleProps) {
  const { height = 2, width = 24 } = props;

  return (
    <div className={`shadow animate-pulse rounded-md w-${width} pt-0.5`}>
      <div className="flex">
        <div className="flex-1 space-y-6 py-1">
          <div className={`h-${height} bg-c-disabled-1 rounded`}></div>
        </div>
      </div>
    </div>
  );
}

export function FetchingStatus() {
  return (
    <div className="bg-tertiary rounded-full w-fit px-3 pb-0.5 opacity-30">
      {Intl.t('general.loading')}.
    </div>
  );
}
