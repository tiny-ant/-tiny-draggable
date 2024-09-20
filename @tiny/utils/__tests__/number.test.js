import toFixed from '../number';

describe('toFixed number', () => {
  test('get normal ratio fields', () => {
    expect(toFixed(0.245)).toBe('0.25');
    expect(toFixed(0.244)).toBe('0.24');
    expect(toFixed(1.0000000000000547e22, 2)).toBe('1.0000000000000547e+22');
  });
});
