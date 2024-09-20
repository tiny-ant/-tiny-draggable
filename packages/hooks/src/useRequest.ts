import { useState } from 'react';
import useDebounce from './useDebounce';

function useRequest(
  apiCall: (args: any) => Promise<any>,
  option?: {
    debounce?: boolean;
    debounceTime?: number;
  }
) {
  const { debounce = false, debounceTime = 300 } =
    option || {};
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{ data: any; errMsg: string | null; status: number; ok: boolean }>({
    ok: true,
    data: null,
    errMsg: null,
    status: 0,
  });

  const request = async args => {
    setLoading(true);
    let res;
    try {
      res = await apiCall(args);
    } catch (err) {
      res = err;
    }
    setLoading(false);
    setRes(res);
    return res;
  };
  const debounceRun = useDebounce(request, debounceTime);
  const run = debounce ? debounceRun.current : request;

  return {
    run,
    res,
    loading,
    errMsg: res?.errMsg || null,
  };
}
export default useRequest;
