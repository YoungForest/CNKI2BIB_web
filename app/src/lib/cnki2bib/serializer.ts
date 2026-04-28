/**
 * Entry-type definitions and BibTeX serialisation. Mirrors BibTexEntries.py.
 *
 * Each entry-type subclass:
 *   1. Matches a CnkiEntry via `rules` (key/value pairs that must all match).
 *   2. Promotes a fixed set of REQUIRED fields under fixed keys, in a fixed
 *      order (order matters for BibTeX output).
 *   3. The remainder become optional fields, written in the source order they
 *      appeared in the CNKI input (excluding "Reference Type"), with name
 *      normalisation:
 *        - "Foo Bar" -> "foobar"
 *        - "X/Y"     -> two fields "x" + "y"
 *        - "ISBN" / "ISSN" stay uppercase
 *   4. After all fields are collected, escape `&` -> `\&` and `_` -> `\_`
 *      across every value. For author, also normalise separators.
 */
import type { CnkiEntry } from './parser';
import { generateId, type IdFormat, type IdInputs } from './id-generator';

const HAN_RE = /[\u4e00-\u9fa5]/;
const NOT_LOWER = new Set(['ISBN', 'ISSN']);

interface BibEntry {
  type: string;
  id: string;
  fields: Map<string, string>;
}

interface EntryTypeSpec {
  type: string;
  rules: Array<Record<string, string>>;
  required?: (entry: CnkiEntry) => Array<[string, string]>;
  consumed?: (entry: CnkiEntry) => string[];
  preprocess?: (entry: CnkiEntry) => void;
}

function get(entry: CnkiEntry, key: string): string {
  return entry.fields.get(key) ?? '';
}

const ARTICLE: EntryTypeSpec = {
  type: 'Article',
  rules: [{ 'Reference Type': 'Journal Article' }],
  required: (e) => [
    ['author', get(e, 'Author')],
    ['title', get(e, 'Title')],
    ['journal', get(e, 'Journal')],
    ['year', get(e, 'Year')],
  ],
  consumed: () => ['Author', 'Title', 'Journal', 'Year'],
};

const BOOK: EntryTypeSpec = {
  type: 'Book',
  rules: [{ 'Reference Type': 'Book' }],
  preprocess: (e) => {
    // Python: cnkiNetEntry["month"] = cnkiNetEntry["Date"].split("-")[1]
    const date = get(e, 'Date');
    if (date.includes('-')) {
      e.fields.set('month', date.split('-')[1] ?? '');
    }
    if (e.fields.has('图书印刷版ISBN')) {
      e.fields.set('ISBN', e.fields.get('图书印刷版ISBN') ?? '');
      e.fields.delete('图书印刷版ISBN');
    }
  },
  required: (e) => [
    ['author', get(e, 'Author')],
    ['title', get(e, 'Title')],
    ['publisher', get(e, 'Publisher')],
    ['year', get(e, 'Date').split('-')[0] ?? ''],
  ],
  // NOTE: Python only marks Author/Title/Publisher recorded for Book (not Year).
  // That means "Year" remains unrecorded, but Book entries normally don't have
  // a separate Year field (they have Date), so Year never shows up as optional.
  consumed: () => ['Author', 'Title', 'Publisher'],
};

const MASTERS_THESIS: EntryTypeSpec = {
  type: 'MastersThesis',
  rules: [{ 'Reference Type': 'Thesis', 'Type of Work': '硕士' }],
  required: (e) => [
    ['author', get(e, 'Author')],
    ['title', get(e, 'Title')],
    ['school', get(e, 'Publisher')],
    ['year', get(e, 'Year')],
  ],
  consumed: () => ['Author', 'Title', 'Publisher', 'Year'],
};

const PHD_THESIS: EntryTypeSpec = {
  type: 'PhdThesis',
  rules: [{ 'Reference Type': 'Thesis', 'Type of Work': '博士' }],
  required: (e) => [
    ['author', get(e, 'Author')],
    ['title', get(e, 'Title')],
    ['school', get(e, 'Publisher')],
    ['year', get(e, 'Year')],
  ],
  consumed: () => ['Author', 'Title', 'Publisher', 'Year'],
};

const IN_PROCEEDINGS: EntryTypeSpec = {
  type: 'InProceedings',
  rules: [{ 'Reference Type': 'Conference Proceedings' }],
  required: (e) => [
    ['author', get(e, 'Author')],
    ['title', get(e, 'Title')],
    ['booktitle', get(e, 'Tertiary Title')],
    ['year', get(e, 'Year')],
  ],
  consumed: () => ['Author', 'Title', 'Tertiary Title', 'Year'],
};

const MISC: EntryTypeSpec = {
  type: 'Misc',
  rules: [],
  required: () => [],
  consumed: () => [],
};

const SPECIFIED_TYPES = [ARTICLE, BOOK, MASTERS_THESIS, PHD_THESIS, IN_PROCEEDINGS];

function matchesRule(entry: CnkiEntry, rule: Record<string, string>): boolean {
  for (const [k, v] of Object.entries(rule)) {
    if (get(entry, k) !== v) return false;
  }
  return true;
}

function pickType(entry: CnkiEntry): EntryTypeSpec {
  for (const spec of SPECIFIED_TYPES) {
    if (spec.rules.some((r) => matchesRule(entry, r))) return spec;
  }
  return MISC;
}

function normaliseFieldName(name: string): string[] {
  // Python: saveFieldNames = fieldName.split("/")
  //         saveFieldName = "".join(saveFieldName.strip().split(" ")).replace(",", "")
  //         if saveFieldName not in NOT_SET_LOWER_FIELD_NAME_LIST:
  //             saveFieldName = saveFieldName.lower()
  return name.split('/').map((part) => {
    const cleaned = part.trim().split(/ +/).join('').replace(/,/g, '');
    return NOT_LOWER.has(cleaned) ? cleaned : cleaned.toLowerCase();
  });
}

function escapeValue(value: string): string {
  // Python: replace(r"&", r"\&").replace(r"_", r"\_")
  return value.replace(/&/g, '\\&').replace(/_/g, '\\_');
}

function fixupAuthor(value: string): string {
  // Python:
  //   self["author"].strip(";").replace(";;", " and ").replace(";", " and ")
  //   if not full English: replace "," and "，" with " and "
  let out = value.replace(/^;+|;+$/g, '');
  out = out.replace(/;;/g, ' and ').replace(/;/g, ' and ');
  if (HAN_RE.test(out)) {
    out = out.replace(/,/g, ' and ').replace(/，/g, ' and ');
  }
  return out;
}

function buildOptionalFields(entry: CnkiEntry, consumedKeys: Set<string>): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [origKey, value] of entry.fields) {
    if (consumedKeys.has(origKey)) continue;
    if (origKey === 'Reference Type') continue;
    if (origKey === '') continue;
    for (const normalised of normaliseFieldName(origKey)) {
      out.push([normalised, value]);
    }
  }
  return out;
}

function buildBibEntry(entry: CnkiEntry, idFormat: IdFormat): BibEntry {
  const spec = pickType(entry);
  spec.preprocess?.(entry);

  const required = spec.required?.(entry) ?? [];
  const consumed = new Set(spec.consumed?.(entry) ?? []);

  const fields = new Map<string, string>();
  for (const [k, v] of required) fields.set(k, v);
  for (const [k, v] of buildOptionalFields(entry, consumed)) {
    fields.set(k, v);
  }

  // Author fixup happens BEFORE escaping (Python order matters).
  if (fields.has('author')) {
    fields.set('author', fixupAuthor(fields.get('author') ?? ''));
  }
  // Escape every value
  for (const [k, v] of fields) fields.set(k, escapeValue(v));

  const idInputs: IdInputs = {
    title: get(entry, 'Title'),
    author: get(entry, 'Author'),
    year: get(entry, 'Year'),
  };
  const id = generateId(idInputs, idFormat);

  return { type: spec.type, id, fields };
}

function bibEntryToString(b: BibEntry): string {
  let out = '@' + b.type + '{' + b.id + ',\n';
  for (const [k, v] of b.fields) {
    out += `\t${k} = {${v}},\n`;
  }
  out += '}\n\n';
  return out;
}

export interface ConvertOptions {
  idFormat?: IdFormat;
}

export function convertNoteExpressEntries(
  entries: CnkiEntry[],
  options: ConvertOptions = {},
): string {
  const fmt = options.idFormat ?? 'title';
  let out = '';
  for (const e of entries) {
    out += bibEntryToString(buildBibEntry(e, fmt));
  }
  return out;
}

// Re-export test-only internals via this barrel for unit testing.
export const __test = {
  pickType,
  normaliseFieldName,
  escapeValue,
  fixupAuthor,
};
