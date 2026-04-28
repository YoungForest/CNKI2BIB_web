import { describe, expect, it } from 'vitest';
import { __test } from './serializer';

describe('serializer helpers', () => {
  it('escapes & and _', () => {
    expect(__test.escapeValue('a & b _ c')).toBe('a \\& b \\_ c');
    expect(__test.escapeValue('plain text')).toBe('plain text');
  });

  it('normalises field names: lowercase + remove spaces', () => {
    expect(__test.normaliseFieldName('Author Address')).toEqual(['authoraddress']);
    expect(__test.normaliseFieldName('Database Provider')).toEqual(['databaseprovider']);
  });

  it('keeps ISBN/ISSN uppercase', () => {
    expect(__test.normaliseFieldName('ISBN')).toEqual(['ISBN']);
    expect(__test.normaliseFieldName('ISSN')).toEqual(['ISSN']);
  });

  it('splits "X/Y" field name into two normalised names', () => {
    expect(__test.normaliseFieldName('ISBN/ISSN')).toEqual(['ISBN', 'ISSN']);
  });

  it('converts ; -> " and ", strips trailing ;, no comma replace for English authors', () => {
    expect(__test.fixupAuthor('Smith, John;Doe, Jane;')).toBe('Smith, John and Doe, Jane');
  });

  it('replaces , and ， with " and " for Chinese authors', () => {
    expect(__test.fixupAuthor('潘紫麟,刘庆鹏;')).toBe('潘紫麟 and 刘庆鹏');
  });
});
