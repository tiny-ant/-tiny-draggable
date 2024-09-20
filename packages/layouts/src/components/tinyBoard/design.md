
### 架构设计要求

**1.图层**

* DOM结构上没有实际的图层概念，每一个仪表板内容块可以自带一个`layer`属性，由该属性归类达到图层的效果。

一个完整的布局仪表盘，其内容块可划分三层**虚拟图层**：背景层、中间内容层、浮动层。
三个虚拟图层可通过DOM节点顺序实现相对的层叠关系，每个块可通过`layer`属性指定所属图层。

**2.组合**

组合与图层的关系：
组合不对应实际的渲染容器，允许组合外的元素块的渲染层叠位置穿插在组合子元素之间。**是否保证组合内容在层叠关系上作为一个整体，由组合功能插件决定。**

**3.插件**
* 支持创建插件，插件可以是一个自带界面渲染的react组件，也可以扩展图表块或仪表板容器的功能

**3.布局算法**
* 每一个被交互的布局块在受控制的过程中都有一个“替身”与之同时存在，这个“替身”被称为“指示块”，指示块用以标明此刻对应的交互块的正确位置，而每一种布局算法的目标都是**处理所有指示块以及所有不受控的布局块**。需要注意的是，指示块在视觉上可能不可见，但这对布局算法是透明的。
每一个图层绑定一种布局算法。

### 设计原则

### 数据结构

每一个layoutItem对应的数据结构如下：

```typescript
export type Layout<T> = {
  /** 前端生成唯一id */
  id: string
  /** 前端生成唯一组合id，可选 */
  group?: string
  /** 归属虚拟图层名称，缺省为default */
  layer?: string
  /** 样式存储数据，根据拖拽交互和调用的算法生成，依赖于实现细节 */
  style: React.CSSProperties
  /* 携带业务数据 */
  data: T
}
```

```typescript
export type Provider = {
  getItemProps(): any;
  getDragProps(): any;
  getBoardProps(): any;
  getResizerProps(): any;
}
```


### 使用示例

```typescript
type Props = {
  multiple: boolean;
  // defineLayout: {
  //   rectSetter: ...,
  //   styleSetter: ...,
  //   layoutHandler: ...,
  // },
  defineLayers: {
    float: DefaultLayout,
    grid: CompactLayout,
    ground: DefaultLayout,
  }
  useInnerStyle: boolean; // 使用rect渲染可以避免某些布局（例如grid布局）无法产生动画效果的问题
}

/**
* @method createBoard(plugins: Plugin[]): (props: Props) => JSX.Element
*/

const TinyBoard = createBoard(plugins)
const boardRef = useRef(null)

// instance 为对外暴露方法
const instance = boardRef.current?.getInstance()

return (
  <TinyBoard {...props} ref={boardRef} />
);
```

```js
TinyBoard.resgisterLayout('xxxLayout', () => {
  // layout algorithm
})
```


1. 每一个layout算法都是一个普通的算法库，而不是react-hook，可以根据初始化参数进行算法库的按需调用
2. indicators提供 show/hide/update三个方法，将与data一起渲染，并继承layoutItems的属性以保证基本样式一致（例如圆角设置）


### 试验

ListLayout

左list + 右list，每个list中的item通过设置zIndex上下交错，左右list水平重叠时产生拼接或割裂效果。

TODO:

Layout结构中的style是否可以不限定成CSSProperties，例如可直接存储为`style: { w: 4, h: 3 }`这样的网格数据，而在渲染数据项界面的时候提供一个`getStyleObject()`的转换函数，强制返回CSSProperties类型。

### 实验

**实验一**

力传导可视效果实验：大量小方块整齐排列，拖动方块时，以方块背景色深浅变化表示其所受力大小，并且每经过一个方块，力的传导都有固定损失。当拖动方向为垂直或水平时，力传导为单向，否则为水平+垂直两个方向。

**实验二**

方块下坠动画

大小不一的方块，在下坠过程中宽度变大同时高度变小，但面积保持不变，最后堆叠在底部。


**实验三**

思维导图流程图工具


### 交互过程

activateLayout => user actions (drag/resize/...) => reLayout => commitLayout / cancelLayout

**activateLayout**

组件内部会重新获取最新的仪表板状态（仪表板容器以及每个内容块的尺寸位置信息），用以接下来的交互计算

**users actions**

用户交互动作改变某些块的尺寸或位置、层叠状态等信息，这些被改变的块首先通过`rectSetter`处理成`LayoutRect`结构数据，再输入给styleSetter转换器转换成内容块的最终样式信息。

**reLayout**

组件内部封装的布局方法，基础组件仅仅封装了布局块的数据传递与保存细节，布局算法通过`layoutHandler`方法暴露给插件实现。

**`commitLayout` 与 `cancelLayout`**

必须调用其中一种方法，告诉组件本次交互变更是提交还是取消。

