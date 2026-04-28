import { describe, expect, it } from 'vitest';
import { generateId } from './id-generator';

describe('id-generator (title format, default)', () => {
  it('generates Pinyin from Chinese title (jieba first 3 segments)', () => {
    expect(generateId({ title: '算法导论', author: '', year: '' })).toBe('suanfadaolun');
    expect(generateId({ title: '基于深度学习的图像识别研究', author: '', year: '' })).toBe(
      'jiyushenduxuexi',
    );
    expect(generateId({ title: '分布式系统中的一致性算法研究', author: '', year: '' })).toBe(
      'fenbushixitongzhongde',
    );
  });

  it('strips digits and [_,;] from title before processing', () => {
    expect(generateId({ title: 'Test_Title with & ampersand', author: '', year: '' })).toBe(
      'TestTitlewith&ampersand',
    );
  });

  it('takes first 4 space-separated words for English titles', () => {
    expect(
      generateId({
        title: 'A Survey on Deep Learning for Image Classification',
        author: '',
        year: '',
      }),
    ).toBe('ASurveyonDeep');
    expect(generateId({ title: 'Multiline Test', author: '', year: '' })).toBe('MultilineTest');
  });
});

describe('id-generator (nameyear format)', () => {
  it('uses English surname directly + year', () => {
    expect(
      generateId({ title: 'X', author: 'Smith, John;Doe, Jane', year: '2022' }, 'nameyear'),
    ).toBe('Smith2022');
  });

  it('converts Chinese surname to capitalised pinyin syllables + year', () => {
    expect(generateId({ title: 'X', author: '潘紫麟', year: '2021' }, 'nameyear')).toBe(
      'PanZiLin2021',
    );
  });

  it('takes the first author when multiple are separated by ; or , or ，', () => {
    expect(generateId({ title: 'X', author: '王五;赵六', year: '2021' }, 'nameyear')).toBe(
      'WangWu2021',
    );
    expect(generateId({ title: 'X', author: 'Smith,John', year: '2020' }, 'nameyear')).toBe(
      'Smith2020',
    );
  });
});
