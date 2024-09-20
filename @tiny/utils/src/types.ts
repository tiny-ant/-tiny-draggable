/**
 * 提供一些有用的typescript类型
 */

/**
 * 提取对象属性值的类型集，直接使用`T[keyof T]`是不够安全的，注意以下细节：
 * ```
 * type A = keyof 3; // => "toString" | "toLocaleString" | "toFixed" | "toExponential" | "toPrecision" | "valueOf"
 */
export declare type ObjectValues<T> = T extends object ? T[keyof T] : never

export declare type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>

export declare type PartialRequired<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

export type RecursivePartial<T> = {
  [P in keyof T]?: NonNullable<T[P]> extends object ? RecursivePartial<NonNullable<T[P]>> : T[P]
}

/**
 * DeepPartial
 * @desc Partial that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first?: {
 *   //     second?: {
 *   //       name?: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first: {
 *       second: {
 *         name: string;
 *       };
 *     };
 *   };
 *   type PartialNestedProps = DeepPartial<NestedProps>;
 */
export declare type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? _DeepPartialArray<U>
  : T extends object
  ? _DeepPartialObject<T>
  : T | undefined
/** @private */
export interface _DeepPartialArray<T> extends Array<DeepPartial<T>> {}
/** @private */
export declare type _DeepPartialObject<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
