---
nav:
  path: /hooks
  title: hooks
  order: 2
group:
  path: /hooks
  title: useRequest
  order: 3
---


## useRequest

一个调用接口的 hook，内部管理接口 loading 状态、返回数据和错误信息。

### 示例

```tsx
import React, { useState, useEffect } from "react";
import { useRequest } from "@tiny/hooks";
import "./style.css";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 模拟接口请求
async function mockApiCall(args) {
  await delay(Math.random() * 3000 + 100); // simulate network latency.

  return {
    params: args,
    data: [],
    errMsg: null,
  };
}

export default function() {
  const { run, loading } = useRequest(mockApiCall);
  const [page, setPage] = useState(1);

  useEffect(() => {
    run({ params: { page } });
  }, [page]);

  const loadMore = () => {
    if (loading) {
      return;
    }
    setPage(page + 1);
  };

  return (
    <div>
      {loading && <div>loading...</div>}
      {!loading && <div>received page {page} list data</div>}
      <button onClick={loadMore} disabled={loading}>
        Load More
      </button>
    </div>
  );
}
```
