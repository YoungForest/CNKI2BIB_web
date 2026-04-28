/**
 * Generates BibTeX cite-keys from a CnkiEntry, matching the Python backend's
 * BibTexEntries.py logic so that existing .bib files keep working.
 *
 * Default mode = "title":
 *   - English title: take first <=4 space-split words, concatenate.
 *   - Chinese title: jieba.cut, take first <=3 segments, concatenate, then pinyin.
 *
 * Mode = "nameyear":
 *   - First author surname (before ;,，), pinyin if Chinese, + year.
 */
import { pinyin } from 'pinyin-pro';
import { jieba } from './jieba-loader';

export type IdFormat = 'title' | 'nameyear';

const HAN_RE = /[\u4e00-\u9fa5]/;

function isFullEnglish(s: string): boolean {
  return !HAN_RE.test(s);
}

function toPinyinJoined(s: string): string {
  // pinyin-pro defaults to lowercase, no tones when toneType: 'none'
  return pinyin(s, { toneType: 'none', separator: '' });
}

function generateTitleId(rawTitle: string): string {
  // Python: re.sub(r"[0-9]", "", title); re.sub(r"[_,;]", "", title)
  const stripped = rawTitle.replace(/[0-9]/g, '').replace(/[_,;]/g, '');

  if (isFullEnglish(stripped)) {
    const words = stripped.trim().split(/ +/).filter(Boolean);
    return words.slice(0, Math.min(words.length, 4)).join('');
  }

  // Python:
  //   title = title.replace(" ", "").replace("\u3000", "")
  //   titleWords = list(jieba.cut(title))
  //   stringForConvertToPinyin = "".join(titleWords[0:min(len(titleWords), 3)])
  //   self.ID = "".join(pinyin(stringForConvertToPinyin))
  const cleaned = stripped.replace(/ /g, '').replace(/\u3000/g, '');
  const segments = jieba.cut(cleaned, true);
  const headJoined = segments.slice(0, Math.min(segments.length, 3)).join('');
  return toPinyinJoined(headJoined);
}

function generateNameYearId(rawAuthor: string, year: string): string {
  // Python: cnkiNetEntry["Author"].split(";")[0].split(",")[0].split("，")[0]
  const firstSurname = rawAuthor.split(';')[0].split(',')[0].split('，')[0];
  const name = firstSurname.replace(/ /g, '').replace(/\u3000/g, '');

  if (isFullEnglish(name)) {
    return name + year;
  }
  // Python: "".join([i.title() for i in pinyin(name)])
  // pinyin-pro returns array when type:'array', each item lowercase. We need to
  // capitalise each pinyin syllable.
  const syllables = pinyin(name, { toneType: 'none', type: 'array' }) as string[];
  return syllables.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('') + year;
}

export interface IdInputs {
  title: string;
  author: string;
  year: string;
}

export function generateId(inputs: IdInputs, format: IdFormat = 'title'): string {
  if (format === 'nameyear') {
    return generateNameYearId(inputs.author ?? '', inputs.year ?? '');
  }
  return generateTitleId(inputs.title ?? '');
}
