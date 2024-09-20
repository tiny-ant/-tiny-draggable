import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener, useKeyPress, useMemoizedFn } from 'ahooks';

export default function useMultiSelect<T extends object>(data: T[], uniqueKey: keyof T) {
  const keyCodeRef = useRef<string>();
  const shiftStartKeyRef = useRef<string>(data[0] && String(data[0][uniqueKey]));
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const resetSelection = useMemoizedFn(() => {
    if (Object.keys(selected).length > 0) {
      setSelected({});
    }
    keyCodeRef.current = undefined;
    shiftStartKeyRef.current = data[0] && String(data[0][uniqueKey]);
  });

  useKeyPress('ctrl', () => {
    keyCodeRef.current = 'ctrl';
  });
  // mac系统 Command键
  useKeyPress('meta', () => {
    keyCodeRef.current = 'ctrl';
  });

  useKeyPress('shift', () => {
    keyCodeRef.current = 'shift';
  });

  useEventListener('keyup', ev => {
    if (['Shift', 'Control', 'Meta'].includes(ev.key)) {
      keyCodeRef.current = undefined;
    }
  });

  useEffect(() => {
    if (data.length > 0) {
      resetSelection();
    }
  }, [data]);

  const onItemClick = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>, item: T) => {
      const itemKey = String(item[uniqueKey]);
      const itemSelected = selected[itemKey];

      if (keyCodeRef.current === 'ctrl') {
        shiftStartKeyRef.current = itemKey;
        setSelected({ ...selected, [itemKey]: !itemSelected });
      } else if (keyCodeRef.current === 'shift') {
        let bounds = 0;
        const shiftSelected = {};

        if (itemKey === shiftStartKeyRef.current) {
          shiftSelected[itemKey] = true;
        } else {
          for (let i = 0, len = data.length; i < len; i++) {
            const vKey = String(data[i][uniqueKey]);

            if (vKey === shiftStartKeyRef.current || vKey === itemKey) {
              bounds++;
              shiftSelected[vKey] = true;
            }
            if (bounds === 1) {
              shiftSelected[vKey] = true;
            }
            if (bounds === 2) break;
          }
        }
        setSelected(shiftSelected);
      } else {
        shiftStartKeyRef.current = itemKey;
        setSelected({ [itemKey]: true });
      }
    },
    [selected]
  );

  const setSelectedKeys = (keys: string[]) => {
    const selected = keys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    setSelected(selected);
  };

  return {
    mapSelected: selected,
    selectedList: data.filter(v => selected[String(v[uniqueKey])]),
    setSelectedKeys,
    onItemClick,
    resetSelection,
  };
}
