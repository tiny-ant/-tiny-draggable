/**
 * 一些数据结构转换函数
 * 例如生成hash对象、生成树结构、生成字典对象等
 */

/**
 * transform the given tree structured plain list into a nested structure.
 * @param {Array<Object>} list the input object Array
 * @param {string} idProp This should be the property name of the unique key for each object in `list`.
 * @param {string} parentProp the property whose value equals another object's unique key value in `list`,
 * thus labelling a child relationship with that object.
 * @returns {Array} there maybe multiple tree objects, with nested structure, the returned array contains all of them.
 * NOTE! The object of type `T` in `list` must not have property `children`, or it will not work as expected.
 */
export function listToTreeData<
  T extends { [p in K | P]: string | number },
  K extends string,
  P extends string,
>(list: T[], idProp: K, parentProp: P) {
  const rootArr: T[] = []
  const map: Record<string | number, T & { children?: T[] }> = Object.create(null)

  list.forEach((item) => {
    const id = item[idProp]
    map[id] = { ...item }
  })

  list.forEach((item) => {
    const pid = item[parentProp]

    if (pid && map[pid]) {
      const { children = [] } = map[pid]

      children.push(item)
    } else {
      // this should be a root node
      rootArr.push(item)
    }
  })

  return rootArr
}

/**
 * Convert an array to a dictionary by mapping each item
 * into a dictionary key & value
 * @see https://github.com/sodiray/radash/blob/master/src/array.ts
 */
export const objectify = <T, Key extends string | number | symbol, Value = T>(
  array: readonly T[],
  getKey: (item: T) => Key,
  getValue: (item: T) => Value = (item) => item as unknown as Value
): Record<Key, Value> => {
  return array.reduce(
    (acc, item) => {
      acc[getKey(item)] = getValue(item)
      return acc
    },
    {} as Record<Key, Value>
  )
}

/**
 * create a object hash using the given key.
 * @param {Array<Object>} array of objects
 * @param {String} key the prop that identify each object in params `objArr`
 * @returns {Object} the object that holds hashes of elements in `objArr`
 * @example
 * const objArr = [{name: 'A'}, {name: 'B'}, {name: 3}];
 * const hash = hashByKey(objArr, 'name'); // => { A: { name: "A" }, B: { name: "B" }, 3: { name: 3 } }
 */
export function hashByKey<T extends Record<K, string | number>, K extends string>(
  objArr: T[],
  key: K
) {
  const hashMap: Record<string | number, T> = Object.create(null)

  objArr.forEach((item) => {
    hashMap[item[key]] = item
  })

  return hashMap
}

/**
 * transform an array of 2D tuples to a hash object.
 * @returns
 * A object mapping each unique value in the first position of the tuples to its corresponding value in the second position.
 * @example
 * hashByTuples(['a', 'A'], ['b', 'B']); // => { a: 'A', b: 'B' }
 */
export function hashByTuples<T>(arr2D: [KeyType, T][]): Record<KeyType, T> {
  const hashMap: Record<KeyType, T> = {}

  return arr2D.reduce((acc, next) => {
    acc[next[0]] = next[1]
    return acc
  }, hashMap)
}

/**
 * make a hash object with keys specified by the property `key` in each object T,
 * and values being the property `prop` of the same object.
 * @param arr
 * @param key
 * @param prop
 * @example
 * const objArr = [{ name: 'A', age: 24 }, { name: 'B', age: 32 }, { name: 'C', age: 20 }];
 * const hash = hashPropertyByKey(objArr, 'name', 'age'); // => { A: 24, B: 32, C: 20 }
 */
export function hashPropertyByKey<
  T extends { [p in K]: string | number } & { [y in P]: unknown },
  K extends string,
  P extends string,
>(arr: T[], key: K, prop: P) {
  const hashMap: Record<T[K], T[P]> = Object.create(null)

  return arr.reduce((map, item) => {
    if (item[prop]) {
      map[item[key]] = item[prop]
    }
    return map
  }, hashMap)
}

/**
 * a method to initialize a empty hash from a set of keys.
 * @param fn a callback to generate hash value for each key.
 * @param keys a array.
 * @returns
 */
export const makeHashFromKeys = <T>(
  keys: KeyType[],
  fn: (key: KeyType) => T
): Record<KeyType, T> => {
  const ret: Record<KeyType, T> = Object.create(null)

  return keys.reduce((map, key) => {
    map[key] = fn(key)
    return map
  }, ret)
}
