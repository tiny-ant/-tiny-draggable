import { useRef } from 'react';
import { throttle } from 'lodash-es';
import usePersistFn from './usePersistFn';
export default function useThrottle(fn, wait = 300, options) {
  return useRef(throttle(usePersistFn(fn), wait, options)).current;
}
;