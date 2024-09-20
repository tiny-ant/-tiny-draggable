import type EventBus from '@tiny/events'

export type Direction =
  | 't'
  | 'r'
  | 'b'
  | 'l'
  | 'tl'
  | 'tr'
  | 'bl'
  | 'br'
  | 'lt'
  | 'rt'
  | 'lb'
  | 'rb'

export type Point = { x: number; y: number }
export type Vector = { x: number; y: number }
export type Size = { width: number; height: number }

export type LayoutId = string

/**
 * 矩形对象，包含左上角位置和宽高属性
 */
export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface LayoutRect extends Rect {
  id: LayoutId
}

export interface Layout<T> {
  /** 仪表板布局块的唯一id */
  id: LayoutId
  /** 组合id，可选，相同组合id的块可以在点击时被整体选中并进行拖拽交互 */
  group?: string
  /** 归属虚拟图层名称，缺省为default */
  layer?: string
  /** 位置和大小 */
  rect: Rect
  /** 业务关联的数据，不会用到，外部可以根据当前块的id拿到该data数据以决定块内渲染什么内容 */
  data?: T
}

export interface InnerLayout<T> extends Layout<T> {
  status: {
    /** 是否被聚焦（置顶，并阻碍其它布局块的交互） */
    focused?: boolean
    /** 选中状态 */
    selected?: boolean
    /** 是否静态的（禁止选中以及拖拽交互） */
    static?: boolean
    /** 是否修饰元素（禁止任何交互） */
    // decorative?: boolean
  }
  /** 样式存储数据，根据拖拽交互和调用的算法生成，依赖于实现细节 */
  // style: React.CSSProperties
}

export type SizeLimit = [minW?: number, minH?: number, maxW?: number, maxH?: number]

export type SizeLimitHandle = (id: LayoutId) => SizeLimit

export type RectLimit = {
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export interface PluginHooks {
  // compactDirection: Direction; // TODO: 使用位与操作 DIRECTION.LEFT & DIRECTION.BOTTOM

  /** 矩形块加工函数，由插件定义如何规范化一个元素块的位置和尺寸，例如和栅格对齐或添加其它限制 */
  rectSetter(rect: Rect): Rect
  /** 样式转换器函数，由插件定义如何将矩形块转换为可呈现的CSS样式 */
  // styleSetter(rect: Rect): React.CSSProperties
  /** 更新指示块的位置和大小 */
  updateShadowRect(id: string, rect: Rect): void
  /**
   * 布局算法
   * @param interactiveRects 交互状态中的元素
   * @param layoutRects 所有元素块（在算法内部根据需要对元素块的图层进行过滤处理）
   * @returns 所有块的正确位置
   */
  layoutHandler(interactiveRects: LayoutRect[], layoutRects: LayoutRect[]): LayoutRect[]
}

export interface BoardProps<T> {
  /** 是否只读，如果为true，将屏蔽选中、拖拽、resize等插件行为 */
  readonly?: boolean
  /** 是否支持多选 */
  multiple?: boolean
  /** 仪表板数据 */
  data: Layout<T>[]
  /** 控制交互过程中的布局算法节流 */
  throttleTiming?: number
  /** 是否开启平滑拖拽效果(如果关闭，拖拽块将始终与指示块同步) */
  smoothDrag?: boolean
  /**
   * 提供一个回调时机，标示一次即将更改仪表板布局的交互过程的开始（拖拽、resize等）。
   * 该回调每一次触发都表明仪表板实例刚刚完成各元素从界面计算样式到`LayoutRect`数据结构的转换。
   */
  onLayoutActivated?(): void
  /**
   * do stuff every time an layout change is commited
   * @param data the changed layout data which you can make a persistent storage.
   */
  onLayoutUpdated(data: Layout<T>[]): void
}

export interface BoardInstance<T> {
  /**
   * 仪表板包含的所有元素块数据
   */
  layoutData: Layout<T>[]

  getWidth(): number
  /** 返回仪表板容器元素 */
  getContainer(): HTMLElement | null
  /**
   * 获取仪表板实例的某个flag开关状态
   */
  isEnabled(propKey: 'readonly' | 'multiple' | 'smoothDrag'): boolean
  /**
   * 开始一次与面板的交互
   * 在更改面板布局之前必须先调用该函数（状态更改除外，例如选择状态、只读状态变更）
   */
  activate(): void
  /**
   * 取消本次交互更改，调用该方法后，仪表板布局的临时更改将被撤销，布局回退到本次activate时的状态。
   * 调用该方法将触发onLayoutCancelled回调，但不会触发`onLayoutUpdated`回调
   */
  cancel(): void
  /**
   * 提交交互更改，一般情况下，你可以在鼠标放开后调用该方法以将布局变更通知给外部（调用将触发`onLayoutUpdated`回调）。
   * @param changedRects 可选，在提交之前显式地更新某些块，并根据这些块的变动进行布局重排；如果没有该参数，则对所有元素块进行布局重排。
   */
  commit(changedRects?: LayoutRect[]): void
  /**
   * 清除元素块选中态
   */
  clearSelection(): void
  /**
   * 设置选中的元素块
   * @param ids 元素块的id
   */
  setSelection(ids: LayoutId | LayoutId[]): void
  /**
   * 判断元素块是否选中
   * @param id 元素块的id
   */
  isSelected(id: string): boolean
  /**
   * 切换元素块选中状态
   * @param id 元素块的id
   */
  toogleSelected(id: string): void
  /**
   * 向仪表板中添加一个元素块
   * @param item 要添加的块对应的数据
   * @param rect 待添加块的尺寸位置信息，如果省略，将由组件内部决定显示位置
   */
  addLayoutItem(item: Layout<T>, rect?: Rect): void
  /**
   * 从仪表板中删除一个元素块
   * @param item 要删除的块对应的id
   */
  removeLayoutItem(id: LayoutId): void
  /**
   * 更新某个布局块
   * @param itemId 要更新的块的唯一标识
   * @param rect 更新itemId对应块的当前尺寸或位置
   * @param extraProps 提供一个扩展选项，该参数允许外部在更新布局块时携带额外的数据在`Layout`数据结构中，
   * 在实际业务中可能需要将额外的属性保存到服务端。
   * TODO: 不对外开放
   */
  updateLayoutItem(rect: LayoutRect, extraProps?: Record<string, unknown>): Layout<T> | null
  /**
   * 通过对象扩展语法将仪表板相关事件绑定到组件实例上
   * @example
   * <Board {...instance.getBoardProps()} />
   */
  getBoardProps(): Record<string, unknown> | null
  /**
   * 通过对象扩展语法将仪表板内容块相关事件绑定到组件实例上
   * @example
   * <LayoutItem {...instance.getItemProps()} />
   */
  getItemProps(item: Layout<T>): Record<string, unknown> | null
  /**
   * 通过对象扩展语法将仪表板内容块拖拽事件绑定到元素上
   * 注意这里扩展的props从 getItemProps 中独立出来，从而可以将拖拽行为绑定到任意元素上，实现自定义拖拽手柄
   * @example
   * <div className="drag-handle" {...instance.getDragProps()} />
   */
  getDragProps(item: Layout<T>): Record<string, unknown> | null
  /**
   * 通过对象扩展语法将仪表板内容块resize交互事件绑定到元素上
   * 注意这里扩展的props从 getItemProps 中独立出来，从而可以将resize行为绑定到任意元素上，自由定义resize交互
   * @example
   * <div className="resize-handle" data-direction="br" {...instance.getResizeProps(item)} />
   */
  getResizeProps(item: Layout<T>): React.HTMLAttributes<HTMLElement> | null
  /**
   * 返回仪表板容器尺寸信息
   * @param purge 是否重新计算DOM元素渲染尺寸
   */
  // getBounds(purge?: boolean): Rect
  /**
   * 将Rect类型的数据结构转换为对应的CSS样式（内部调用styleSetter转换）（暂未用到）
   * @param rect 表示尺寸信息的`Rect`对象结构
   */
  getStyleObject(rect: Rect): React.CSSProperties
  /**
   * 对仪表板内的元素重新排版
   * NOTE! 该方法一般不在外部中直接调用，在实现一些扩展的hooks时可能需要用到
   * @param changedRects 该参数代表触发布局变更的内容块的最新尺寸和位置信息，参数值分以下三种情形：
   * 1. 参数值为null，直接调用仪表板实例所配置的布局算法进行布局刷新
   * 2. 参数非空但id为空，则新增一个虚拟块（视觉不可见）置于参数指定的临时位置，与其它已存在的块共同参与布局调整
   * 3. 参数非空且id非空，则将id对应的内容块更新到指定的位置，并调用布局算法进行布局刷新
   *
   * @param immediately 是否立即更新布局数据模型，如果是，当id为空时将生成一个新的块（id随机生成）加入到面板中
   */
  reLayout(changedRects?: LayoutRect[], immediately?: boolean): void
  /**
   * TODO: 提取到`useDrop`
   * 从外部拖放内容到仪表板时，添加一个临时的内容块，该方法可在外部拖拽开始时调用，实现细节依赖于`useDrop`插件。
   * @param item
   * @param rect
   */
  // TODO: 参数rect是否可改为完整LayoutRect结构？
  // setDropData(item: Layout<T>, rect: Partial<Rect>): void
  /**
   * 给当前仪表板实例添加一个插件
   * @param plugin 插件函数，实际上是一个react-hooks，内部可定义自身state，在内部对当前实例做扩展处理
   */
  // extend(plugin: (inst: BoardInstance<T>) => void): void
  [propName: string]: any
}

export type Plugin<T> = (
  /** 提供一组方法的集合 */
  instance: BoardInstance<T>,
  hooks: PluginHooks,
  emitter: EventBus<InstanceEvents>
) => void

export type UseBoard = <T>(options: BoardProps<T>, ...plugins: Plugin<T>[]) => BoardInstance<T>

export type InstanceEvents = {
  'resizer::show'(rect: Rect): void
  'shadow::update'(id: string, rect: Rect): void
  'shadow::hide'(): void
}
