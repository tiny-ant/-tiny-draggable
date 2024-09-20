export interface CookieProperties {
  /** cookie访问权限域名，默认为当前域名 */
  domain?: string
  /** 默认为 / */
  path?: string
  maxAge?: number
  /** 如果不设置，则默认为会话cookie */
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: boolean | string
}

// eslint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

/**
 * 读取cookie值
 *
 * @param {string} name cookie的名称
 * @returns {string}
 */
export function getCookie(name: string): string {
  const arr = document.cookie.match(new RegExp(`(?:^|;\\s?)${name}=([^;]*)(?:;|$)`))

  if (arr != null) {
    return decodeURIComponent(arr[1])
  }
  return ''
}

/**
 * @param {string} name cookie的名称
 * @param {string} value cookie的值
 * @param {object} options 属性配置
 * @returns {void}
 */
export function setCookie(name: string, value: string, options: CookieProperties = {}): void {
  // Note! 貌似一些手机端（例如iphone）不支持设置中文Cookie值，必须要encode
  let str = `${name}=${encodeURIComponent(value)}`

  if (options.domain) {
    if (!fieldContentRegExp.test(options.domain)) {
      throw new TypeError('domain is invalid')
    }
    str += `; Domain=${options.domain}`
  }
  if (options.path) {
    if (!fieldContentRegExp.test(options.path)) {
      throw new TypeError('path is invalid')
    }
    str += `; Path=${options.path}`
  }
  if (options.expires) {
    str += `; Expires=${options.expires.toUTCString()}`
  }
  const maxAge = Number(options.maxAge || 0)

  if (Number.isNaN(maxAge)) {
    throw new Error('maxAge should be a Number')
  } else if (maxAge > 0) {
    str += `; Max-Age=${Math.floor(maxAge)}`
  }
  if (options.httpOnly) {
    str += '; HttpOnly'
  }
  if (options.secure) {
    str += '; Secure'
  }
  if (options.sameSite) {
    const sameSite = options.sameSite === true ? 'strict' : String(options.sameSite).toLowerCase()
    switch (sameSite) {
      case 'lax':
        str += '; SameSite=Lax'
        break
      case 'strict':
        str += '; SameSite=Strict'
        break
      case 'none':
        str += '; SameSite=None'
        break
      default:
        throw new TypeError('option sameSite is invalid')
    }
  }
  document.cookie = str
}

/**
 * 删除cookie
 *
 * @param {string} name 要删除的cookie名称
 * @param {object} [options={}] 可通过domain和path限定删除哪个域和路径下的cookie
 * @see {@link setCookie}
 */
export function delCookie(name: string, options: CookieProperties = {}): void {
  options.expires = new Date(1970, 1, 1)
  setCookie(name, '', options)
}

export default {
  get: getCookie,
  set: setCookie,
  remove: delCookie,
}
