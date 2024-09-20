import ky, { ResponsePromise } from 'ky'

export interface ServerResponse<T> {
  status: number;
  data: T | null;
  errors: { message: string; code: string; } | null
}

type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete'

type ApiFunc = (url: string, options?: any) => ResponsePromise

const HTTP_METHODS: HTTPMethod[] = ['get', 'post', 'put', 'patch', 'head', 'delete']

// type CoreFunc1 = ApiFunc & {
//   [p in HTTPMethod]: ApiFunc
// }
// interface CoreFunc2 extends ApiFunc {
//   [p in HTTPMethod]: ApiFunc
// }

interface CoreFunc extends ApiFunc {
  get: ApiFunc;
  post: ApiFunc;
  put: ApiFunc;
  patch: ApiFunc;
  head: ApiFunc;
  delete: ApiFunc;
}

const coreApi: any = function (url: string, options = {}): ResponsePromise {
  return ky(url, {
    prefixUrl: '/cdbi-api',
    ...options,
  })
}

HTTP_METHODS.forEach((method: HTTPMethod) => {
  coreApi[method] = (url: string, options: any = {}) => coreApi(url, { ...options, method })
})

export default coreApi as CoreFunc
