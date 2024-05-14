import { Tag } from '@massalabs/react-ui-kit';
import { tagTypes } from '../../const';
import Intl from '../../i18n/i18n';

export function Connected() {
  return (
    <Tag type={tagTypes.success}>{Intl.t('connect-wallet.tag.connected')}</Tag>
  );
}
