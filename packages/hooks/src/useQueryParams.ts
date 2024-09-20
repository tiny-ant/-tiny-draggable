import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { stringify } from '@tiny/querystring'

/**
 * 解析以及设置URL中的查询参数
 * @returns 包含查询参数的对象
 */
export default function useQueryParams<T extends Record<string, string | number>>(): [
  Partial<T>,
  (value: Partial<T>, action?: 'replace' | 'push') => void,
] {
  const history = useHistory()
  const { pathname, search: searchStr } = useLocation()

  const query = useMemo((): Partial<T> => {
    if (!searchStr.startsWith('?')) {
      return {}
    }

    const sp = new URLSearchParams(searchStr)
    const query = {}
    Object.setPrototypeOf(query, null)

    // eslint-disable-next-line no-restricted-syntax
    for (const key of sp.keys()) {
      query[key] = sp.get(key)
    }

    return query
  }, [searchStr])

  const setQuery = useCallback(
    (newQuery: Record<string, unknown>, action: 'replace' | 'push' = 'replace') => {
      const oldKeys = Object.keys(query)
      const newKeys = Object.keys(newQuery)

      if (oldKeys.length === newKeys.length) {
        if (newKeys.every((key) => newQuery[key] === query[key])) {
          return
        }
      }
      const search = stringify(newQuery)

      if (action === 'replace') {
        history.replace({ pathname, search })
      } else {
        history.push({ pathname, search })
      }
    },
    [query, pathname]
  )

  return [query, setQuery]
}
