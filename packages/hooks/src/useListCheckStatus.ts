import { useEffect, useMemo, useState } from 'react';

type Props<T> = {
  list: T[];
  key: string;
  disabledKeys?: string[];
};

export default function useListCheckStatus<T extends object>(props: Props<T>) {
  const { key, disabledKeys = [], list } = props;

  const checkableKeys = useMemo(() => {
    const allKeys = list.map(v => v[key]);

    return disabledKeys.length > 0 ? allKeys.filter(key => !disabledKeys.includes(key)) : allKeys;
  }, [list]);

  const checkStatusMap = useMemo(() => {
    return new Map(list.map(v => [v[key], false]));
  }, [list]);

  const [checkedCount, setCheckedCount] = useState(0);
  const [allChecked, setAllChecked] = useState<boolean | 'partial'>(false);

  // 当数据源列表项数量变动时，更新全选状态
  // useEffect(() => {
  //   setAllChecked(checkedCount === checkableKeys.length);
  // }, [list]);

  // 更新全选勾选状态
  const updateAllChecked = (count: number) => {
    if (count === 0) {
      setAllChecked(false);
    } else if (count === checkableKeys.length) {
      setAllChecked(true);
    } else {
      setAllChecked('partial');
    }
  };

  const onCheckChange = (checked: boolean, checkedKey: string) => {
    const newCheckedCount = checkedCount + (checked ? +1 : -1);
    checkStatusMap.set(checkedKey, checked);
    setCheckedCount(newCheckedCount);
    updateAllChecked(newCheckedCount);
  };

  const onCheckAllChange = (checked: boolean) => {
    checkableKeys.forEach(key => {
      checkStatusMap.set(key, checked);
    });
    setCheckedCount(checked ? checkableKeys.length : 0);
    setAllChecked(checked);
  };

  return {
    get checkedKeys() {
      if (checkedCount === 0) {
        return [];
      }
      return checkableKeys.filter(key => checkStatusMap.get(key));
    },
    get checkedList() {
      if (checkedCount === 0) {
        return [];
      }
      return list.filter(v => checkStatusMap.get(v[key]));
    },
    checkedCount,
    isChecked: (key: string) => checkStatusMap.get(key),
    allChecked, // 是否全选（或半选）
    onCheckChange,
    onCheckAllChange,
    resetCheck() {
      onCheckAllChange(false);
    },
  };
}
