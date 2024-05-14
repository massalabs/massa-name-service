import dot from 'dot-object';
import enUs from './en_US.json';
import { INTL } from '../const';

type Copy = Record<string, string | object>;

class I18n {
  private lang: string;
  private copy: Copy;

  constructor() {
    this.lang = this._getLang();
    this.copy = this._getCopy();
  }

  public t(key: string, interpolations?: Record<string, string>): string {
    const copy = this.copy;
    // we are using pick in order to make life easier when the day for plurals and copy with params arrives
    const result = dot.pick(key, copy);

    if (!result) {
      console.warn(`I18n::t:: No translation found for key ${key}`);
    }

    return interpolations
      ? this._interpolateKeys(result, interpolations)
      : result ?? key;
  }

  private _getLang(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('l');

    if (fromUrl) {
      localStorage.setItem('massa-station-lang', fromUrl);
    }

    return fromUrl || localStorage.getItem('massa-station-lang') || INTL.EN_us;
  }

  private _getCopy(): Copy {
    const lang = this.lang;

    if (lang === INTL.EN_us) {
      return enUs;
    } else {
      console.warn(
        `I18n::_getCopy:: We may not support yet ${lang}. Loading 'en_US' then... `,
      );
      return enUs;
    }
  }

  private _interpolateKeys(
    str: string,
    replacements: Record<string, string>,
    char1 = '{',
    char2 = '}',
  ): string {
    const regex = new RegExp(`${char1}[^${char2}]*${char2}`, 'g');

    return str.replace(regex, (match) => {
      const key = match.slice(1, -1);
      return replacements[key] ?? match;
    });
  }
}

const Intl = new I18n();
Object.freeze(Intl);

export default Intl;
