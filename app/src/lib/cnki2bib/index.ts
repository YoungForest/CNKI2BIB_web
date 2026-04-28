import { parseNoteExpress } from './parser';
import { convertNoteExpressEntries, type ConvertOptions } from './serializer';

export { parseNoteExpress } from './parser';
export type { CnkiEntry, CnkiFields } from './parser';
export type { ConvertOptions } from './serializer';
export { convertNoteExpressEntries } from './serializer';
export { generateId, type IdFormat, type IdInputs } from './id-generator';
export { initJieba } from './jieba-loader';

/**
 * One-shot conversion: NoteExpress text -> BibTeX text.
 * Throws if the input cannot be parsed into at least one entry.
 */
export function cnkiToBib(input: string, options: ConvertOptions = {}): string {
  const entries = parseNoteExpress(input);
  if (entries.length === 0) {
    throw new Error(
      'No CNKI entries found in input. Make sure each entry starts with "{Reference Type}: ...".',
    );
  }
  return convertNoteExpressEntries(entries, options);
}
