import TextUtil from '../text-util';

describe('test util', () => {
  test('cut text', () => {
    const t1 = {
      input: 'When you are old and grey and full of sleep',
      output: 'When you are old',
    };

    const t2 = {
      input: 'when',
      output: 'when',
    };

    const t3 = {
      tail: 'ple',
      input: 'ap',
      output: 'apple',
    };

    expect(TextUtil.cutText(t1.input, 16)).toEqual(t1.output);
    expect(TextUtil.cutText(t2.input, 16)).toEqual(t2.output);
    expect(TextUtil.cutText(t3.input, 16, 'ple')).toEqual(t3.output);
  });

  test('filter xss', () => {
    const t1 = {
      input: '<html>',
      output: '&lt;html&gt;',
    };

    const t2 = {
      input: "'abc",
      output: "&#39;abc",
    };

    const t3 = {
      input: '"abc',
      output: '&#34;abc',
    };

    expect(TextUtil.filterXss(t1.input)).toEqual(t1.output);
    expect(TextUtil.filterXss(t2.input)).toEqual(t2.output);
    expect(TextUtil.filterXss(t3.input)).toEqual(t3.output);
  });
});
