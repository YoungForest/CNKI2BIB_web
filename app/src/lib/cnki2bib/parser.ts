/**
 * Parses CNKI NoteExpress text format into structured entries.
 * Mirrors the behavior of the Python backend's cnkiNetEntries.py.
 *
 * Format example:
 *   {Reference Type}: Journal Article
 *   {Title}: 计算机辅助导航技术在脊柱外科中的应用
 *   {Author}: 潘紫麟;刘庆鹏;
 */

export type CnkiFields = Map<string, string>;

export interface CnkiEntry {
  fields: CnkiFields;
}

const FIELD_LINE_RE = /^\{(.*?)\}:(.*)$/s;

/**
 * Normalises a multiline block:
 *   1. Collapse runs of newlines into a single newline.
 *   2. For any newline that is NOT followed by `{`, remove the newline (keep
 *      the following character). This merges continuation lines into the
 *      previous field's value.
 *
 * Replicates the Python:
 *   re.sub("\n+", "\n", block)
 *   re.sub("\n([^\{])", lambda m: m.group(1), block)
 *
 * The Python regex matches `\n` + one non-`{` char and replaces with just the
 * captured char, so the character is preserved while the newline is eaten.
 */
function normaliseBlock(block: string): string {
  let out = block.replace(/\n+/g, '\n');
  out = out.replace(/\n([^{])/g, '$1');
  return out;
}

function parseFieldLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const m = FIELD_LINE_RE.exec(trimmed);
  if (!m) return null;
  return [m[1].trim(), m[2].trim()];
}

/**
 * Parse the full NoteExpress text into one CnkiEntry per record.
 *
 * Records are separated by occurrences of `{Reference Type}` (case-sensitive).
 * The first split chunk before the first marker is discarded (matches Python's
 * `.split(...)[1:]`).
 */
export function parseNoteExpress(input: string): CnkiEntry[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const MARKER = '{Reference Type}';
  const chunks = trimmed.split(MARKER);
  const entries: CnkiEntry[] = [];

  for (let i = 1; i < chunks.length; i++) {
    const block = normaliseBlock((MARKER + chunks[i]).trim());
    const fields: CnkiFields = new Map();
    for (const line of block.split('\n')) {
      const parsed = parseFieldLine(line);
      if (parsed) fields.set(parsed[0], parsed[1]);
    }
    if (fields.size > 0) entries.push({ fields });
  }

  return entries;
}
