---
nav:
  path: /hooks
  title: hooks
  order: 2
group:
  path: /hooks
  title: useDebounce
  order: 2
---

## useDebounce

_贡献者：肖宇_

防抖 hook

## 代码演示

```jsx
/**
 * title: 基本用法
 * desc: 频繁调用 handleClickDecounce，但只会在所有点击完成 1s 后执行一次。
 * hideActions: ["CSB", "EXTERNAL"]
 */
import React, { useState, useCallback, useRef } from 'react';
import { useDebounce } from '@tiny/hooks';

let fref = 0;

function ft() {
  console.log('calling ft');

  return function fn() {
    console.log('inner func called');
  }
}

export default function() {
  const [count, setCount] = useState(0);
  const tmpRef = useRef(ft());

  console.log(fref === tmpRef.current);

  fref = tmpRef.current;

  const handleClickDecounce = useDebounce(() => {
    setCount(count + 1);
  }, 1000);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClickDecounce}>click debounce</button>
    </div>
  );
}
```

## API

```ts
const debouncedFn = useDebounce(
  fn: (...args: any[]) => any,
  wait?: number,
  options?: object
);
```

### 参数

| 参数    | 说明                                         | 类型                    | 默认值 |
| ------- | -------------------------------------------- | ----------------------- | ------ |
| fn      | 需要防抖执行的函数                           | (...args: any[]) => any | -      |
| wait    | 需要延迟的毫秒数。                           | number                  | 300    |
| options | lodash 的 DebounceSettings，详见下面 Options | object                  | -      |

### Options

> [options.leading=false](boolean): 指定在延迟开始前调用。
> <br>[options.maxWait](number): 设置 func 允许被延迟的最大值。
> <br>[options.trailing=true](boolean): 指定在延迟结束后调用。
