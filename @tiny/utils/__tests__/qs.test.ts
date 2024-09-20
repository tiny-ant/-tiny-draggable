import isEqual from 'lodash/isEqual';
import { parse, stringify } from '../qs';

interface ParseString {
  a: string;
  b: string;
}
describe('test parse string', () => {
  it('parse a correctly string', () => {
    const a = parse<ParseString>('a=11a&b=22a');
    expect(isEqual(a, { a: '11a', b: '22a' })).toBeTruthy();
  });
  it('parse string use seq', () => {
    const a = parse<ParseString>('a=11a?b=22a', '?');
    expect(isEqual(a, { a: '11a', b: '22a' })).toBeTruthy();
  });
  it('parse string use eq', () => {
    const a = parse<ParseString>('ae11a&be22a', '&', 'e');
    // console.log(a);
    expect(isEqual(a, { a: '11a', b: '22a' })).toBeTruthy();
  });
  it('parse string use maxKey', () => {
    const a = parse<ParseString>('a=11a&b=22a', '&', '=', { maxKeys: 1 });
    expect(isEqual(a, { a: '11a' })).toBeTruthy();
  });
  it('stringify obj', () => {
    const a = stringify({ a: '11a', b: '22a' });
    expect(a).toEqual('a=11a&b=22a');
  });
  it('stringify obj use seq', () => {
    const a = stringify({ a: '11a', b: '22a' }, '?');
    expect(a).toEqual('a=11a?b=22a');
  });
  it('stringify obj use eq', () => {
    const a = stringify({ a: '11a', b: '22a' }, '&', '/');
    expect(a).toEqual('a/11a&b/22a');
  });
});
