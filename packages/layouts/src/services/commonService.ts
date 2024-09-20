import coreApi, { ServerResponse } from './apis'

type UserList = { userId: string; userName: string }

export function addUser(args: { userId: string; }): Promise<any> {
  return coreApi('/user/add', {
    searchParams: args,
  })
}

export function getUser<T extends UserList[]>(): Promise<ServerResponse<T>> {
  return coreApi('/user/get').json<ServerResponse<T>>()
}
