import { describe, expect, it } from 'vitest';
import { parseNoteExpress } from './parser';

describe('parser', () => {
  it('returns empty array on empty input', () => {
    expect(parseNoteExpress('')).toEqual([]);
    expect(parseNoteExpress('   \n\n  ')).toEqual([]);
  });

  it('parses single entry into a key/value Map', () => {
    const text = `{Reference Type}: Journal Article
{Title}: Hello World
{Author}: A;B;`;
    const entries = parseNoteExpress(text);
    expect(entries).toHaveLength(1);
    expect(entries[0].fields.get('Reference Type')).toBe('Journal Article');
    expect(entries[0].fields.get('Title')).toBe('Hello World');
    expect(entries[0].fields.get('Author')).toBe('A;B;');
  });

  it('splits multiple entries on {Reference Type} marker', () => {
    const text = `{Reference Type}: Journal Article
{Title}: First

{Reference Type}: Book
{Title}: Second`;
    const entries = parseNoteExpress(text);
    expect(entries).toHaveLength(2);
    expect(entries[0].fields.get('Title')).toBe('First');
    expect(entries[1].fields.get('Title')).toBe('Second');
  });

  it('merges continuation lines that do not start with `{`', () => {
    const text = `{Reference Type}: Journal Article
{Abstract}: Line one.
Line two.
Line three.
{Title}: T`;
    const entries = parseNoteExpress(text);
    // Newlines are removed but characters are preserved (matches Python regex behaviour)
    expect(entries[0].fields.get('Abstract')).toBe('Line one.Line two.Line three.');
  });

  it('preserves field insertion order via Map', () => {
    const text = `{Reference Type}: Journal Article
{Title}: T
{Author}: A
{Year}: 2020
{Custom}: X`;
    const entries = parseNoteExpress(text);
    const keys = Array.from(entries[0].fields.keys());
    expect(keys).toEqual(['Reference Type', 'Title', 'Author', 'Year', 'Custom']);
  });

  it('handles values containing colons', () => {
    const text = `{Reference Type}: Journal Article
{URL}: https://example.com:8080/path`;
    const entries = parseNoteExpress(text);
    expect(entries[0].fields.get('URL')).toBe('https://example.com:8080/path');
  });
});
