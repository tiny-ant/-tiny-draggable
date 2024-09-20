import coreApi, { ServerResponse } from './apis'

type Timestamp = number;

type BookMark = {
  id: string;
  name: string;
  url: string;
  keyword?: string[];
  desc?: string;
  ctime: Timestamp;
}

/**
 * 保存（新增或更新）
 * @param args 书签对象
 * @returns 书签列表
 */
export function save(args: BookMark): Promise<any> {
  return coreApi.post('/bookmark/save', {
    data: args,
  })
}

/**
 * 查询书签列表
 * @param kwd 搜索输入，可部分匹配标题、关键字、描述
 * @returns 书签列表
 */
export function query<T extends BookMark[]>(kwd: string): Promise<ServerResponse<T>> {
  return coreApi.get('/bookmark/query', {
    searchParams: kwd,
  }).json<ServerResponse<T>>()
}
