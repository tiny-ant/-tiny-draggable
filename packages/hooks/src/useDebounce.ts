import { useRef } from 'react';
import { debounce } from 'lodash-es';
import usePersistFn from './usePersistFn';

export default function useDebounce(fn: (...args) => any, wait = 300, options) {
  return useRef(debounce(usePersistFn(fn), wait, options)).current;
}
