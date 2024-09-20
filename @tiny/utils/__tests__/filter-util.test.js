import { compareFilterIsConnect, getFilterGroups } from '../filter-util';
import filters from './__mocks__/filters';

describe('handle filter data', () => {
  test('compare two filter can be connect', () => {
    expect(compareFilterIsConnect(filters[0], filters[0])).toBeTruthy();
    expect(compareFilterIsConnect(filters[1], filters[0])).toBeFalsy();
    expect(compareFilterIsConnect(filters[1], filters[2])).toBeTruthy();
    expect(compareFilterIsConnect(filters[2], filters[1])).toBeFalsy();
    expect(compareFilterIsConnect(filters[3], filters[4])).toBeTruthy();
    expect(compareFilterIsConnect(filters[4], filters[5])).toBeTruthy();
    expect(compareFilterIsConnect(filters[6], filters[7])).toBeTruthy();
    expect(compareFilterIsConnect(filters[7], filters[6])).toBeTruthy();
  });

  test('get filter groups', () => {
    const { filterGroups, filterGroupsMap } = getFilterGroups(filters);
    expect(filterGroups.length).toBe(2);
    expect(filterGroupsMap[filters[0].id].name).toBe(filters[0].name);
  });
});
