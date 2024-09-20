/**
 * 从URL参数`url`中解析查询参数`key`的值，如果不存在，返回undefined
 * 注：不支持数组格式的参数名获取
 * 参考：
 * URL通用语法： scheme://user:password@host:port/path;params?query#frag
 *
 * @param {string} key
 * @param {string} [url=location.search] 一个完整URL，也可以是URL查询参数（须带问号）
 * @returns {string}
 *
 * @example
 * get('p1')
 * get('p1', '?p1=3')  // '3'
 */
export function get(key: string, url: string): string | undefined {
  let str = String(url).split('#')[0] // firstly, remove hash
  const pos = str.indexOf('?') + 1

  if (pos <= 0) {
    return undefined
  }

  str = `&${str.substring(pos)}` // then get the search string ( treat anything before the first '?' as domain )

  const reg = new RegExp(`&${key}(?:=([^&]*)|&|$)`)
  const match = str.match(reg)

  if (match) {
    try {
      return decodeURIComponent(match[1] || '')
    } catch (e) {
      return match[1]
    }
  }
  return undefined
}

/**
 * 从url的hash中获取某个参数值
 * @param key
 * @returns
 */
export function getFromHash(key: string, url?: string): string | undefined {
  const hash = url ? url.slice(url.indexOf('#')) : location.hash
  return get(key, hash.slice(1))
}

/**
 * 获取Url所有参数，作为对象返回( 参照URLSearchParams验证 )
 * 参考：
 * URL通用语法： scheme://user:password@host:port/path;params?query#frag
 *
 * @param {string} [url=location.search] 携带url参数格式的字符串。可以是完整url，也可以是URL查询参数(必须带上问号)
 * @param {boolean} options.stripHash 如果url中包含'#'字符，是否先丢弃hash串，默认为true（即默认情况下从location.search中解析参数）
 * @param {boolean} options.isParams 是否将url视为纯粹的查询参数串，具体区别请见如下示例
 * @returns {object} 解析后的
 *
 * @example
 * parse()        // collect all parameter-value pairs of current page URL
 * parse('?=a')      // {'': 'a'}
 * parse('a=b') // {}
 * parse('a=b', { isParams: true }) // { a: 'b' }
 * parse('/path/123', { isParams: true }) // { '/path/123': '' }
 * parse('?p1=A&p2=B')  // {p1: 'A', p2: 'B'}
 * parse('?p=B&x=y#list/1?a=b') // {p: 'B', x: 'y'}
 * parse('http://domain.com/?p1=a=b&b&&=b&&p2=c%26#d=e&f=g'); // {'p1': 'a=b', 'b': '', '': 'b', 'p2': 'c&'}
 */
export function parse<T extends Record<string, string>>(
  url: string = location.search,
  options: { stripHash?: boolean; isParams?: boolean } = { stripHash: true, isParams: false }
): Partial<T> {
  let keyValue
  const queryObj = {}
  const reg = /&([^=&]*)=?([^&]*)/g
  let str = options.stripHash ? url.split('#')[0] : url // firstly, remove hash

  const pos = str.indexOf('?') + 1

  if (!options.isParams && pos <= 0) {
    return {}
  }

  str = `&${str.substring(pos)}` // then get the search string ( treat anything before the first '?' as domain )

  // eslint-disable-next-line
  while ((keyValue = reg.exec(str)) != null) {
    if (keyValue[0] !== '&') {
      queryObj[keyValue[1]] = decodeURIComponent(keyValue[2])
    }
  }
  return queryObj
}

/**
 * 从url的hash部分解析地址参数
 * @param url 可选，可以是路由路径或完整的url
 * @returns
 */
export function parseFromHash<T extends Record<string, string>>(url?: string): Partial<T> {
  // const { hash } = new URL(url || location);
  const hash = url ? url.slice(url.indexOf('#')) : location.hash
  return parse(hash, { stripHash: false })
}

/**
 * 转换对象键值对为URL查询串
 * 与URLSearchParams处理方式一致
 *
 * @param {object} [obj={}]
 * @returns
 *
 * @example
 * var a = { name: undefined, ok: null, age: 0, is: false, title: 'io' }
 * stringify(a) // 'name=undefined&ok=null&age=0&is=false&title=io'
 */
export function stringify(obj = {}): string {
  return Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .map((k) => `${k}=${encodeURIComponent(obj[k])}`)
    .join('&')
}

/**
 * 设置Url查询参数（已存在的参数值将被覆盖），并返回新的url
 * NOTE! 如果查询参数在hash中，需设置第三个参数hashMode = true
 * @param {string} url 将被解析参数的url，也可以仅仅是包含url查询参数的字符串
 * @param {string | object} newParams 要添加或修改的参数的对象（或字符串）表示
 * @param {boolean} hashMode 要识别和修改的地址参数是否在hash上，默认为false。
 * （注意：如果`url`本身就是hash，不要设置此参数为true，仅当`url`中包含hash或者`url`是一个完整的URL表示时才需要设置此参数）
 * @returns {string} 新的url
 * @example
 * makeUrl('a=b', 'c=d') // a=b?c=d
 * makeUrl('?a=b', 'c=d') // ?a=b&c=d
 * makeUrl('?a=b', { a: 'c' }) // ?a=c
 * makeUrl('?a=b#/path?tab=A', { tab: 'B', edit: '1' }, true) // ?a=b#/path?tab=B&edit=1
 */
export function makeUrl(
  url: string,
  newParams: string | Record<string, string | number | undefined>,
  hashMode = false
): string {
  if (typeof newParams === 'string') {
    newParams = parse(newParams, { isParams: true, stripHash: false })
  }

  const hashIndex = url.indexOf('#')
  const baseUrl = hashIndex === -1 ? url : url.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex)

  if (hashMode) {
    // if (splitIndex === -1) {
    //   throw Error('makeUrl: hashMode should include hash in url');
    // }
    const query = Object.assign(parseFromHash(url), newParams)
    const qs = stringify(query)

    if (hashIndex === -1) {
      return `${baseUrl}#${qs ? '?' : ''}${qs}`
    } else {
      const hashQueryIndex = url.indexOf('?', hashIndex)

      if (hashQueryIndex === -1) {
        return `${url}${qs ? '?' : ''}${qs}`
      }
      return `${url.slice(0, hashQueryIndex)}${qs ? '?' : ''}${qs}`
    }
  }

  const query = Object.assign(parse(url), newParams)
  const qs = stringify(query)
  return `${baseUrl.split('?')[0]}${qs ? '?' : ''}${qs}${hash}`
}

/**
 * 自适应协议，防止跨域
 */
export function adapterProtocol(url: string) {
  return url.replace(/^https?:/, location.protocol)
}

export default {
  get,
  getFromHash,
  makeUrl,
  parse,
  parseFromHash,
  stringify,
}
