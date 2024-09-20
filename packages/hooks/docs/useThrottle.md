---
nav:
  path: /hooks
  title: hooks
  order: 2
group:
  path: /hooks
  title: useThrottle
  order: 2
---

## useThrottle

_贡献者：肖宇_

防抖 hook

## 代码演示

```jsx
/**
 * title: 基本用法
 * desc: 频繁调用 handleClickThrottle，只会每间隔 500ms 执行一次。
 * hideActions: ["CSB", "EXTERNAL"]
 */
import React, { useState, useCallback, useRef } from 'react';
import { useThrottle } from '@tiny/hooks';

export default function() {
  const [count, setCount] = useState(0);

  const handleClickThrottle = useThrottle(() => {
    setCount(count + 1);
  }, 1000);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClickThrottle}>click throttle</button>
    </div>
  );
}
```

## API

```ts
const throttledFn = useThrottle(
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
| options | lodash 的 ThrottleSettings，详见下面 Options | object                  | -      |

### Options

> [options.leading=false](boolean): 指定在延迟开始前调用。
> <br>[options.maxWait](number): 设置 func 允许被延迟的最大值。
> <br>[options.trailing=true](boolean): 指定在延迟结束后调用。
