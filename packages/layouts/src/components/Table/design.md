
## 表格设计

### 特性需求

* 纵横向表头支持单元格合并
* 纵横向表头支持固定滚动
* 自定义单元格渲染支持
* 支持按行/列排序
* 支持固定行/列
* 最佳列宽计算
* 列宽拖拽支持
* 行高拖拽支持
* 单元格支持自动换行

### 数据格式

```typescript

/** 单元格数据 */
type CellData = {
  /** 单元格x坐标 */
  x: number;
  /** 单元格y坐标 */
  y: number;
  /** 横向跨度，默认为1 */
  xspan?: number;
  /** 纵向跨度，默认为1 */
  yspan?: number;
  /** 单元格值 */
  value?: BaseTypes;
}

/** 列属性定义（这里的列对应无合并单元格情况下的一列 */
type ColumnProp = {
  /** 列宽度，必须指定 */
  width: number;
  /** 是否固定列（用于行表头、行末操作列固定） */
  fixed?: boolean;
  /** 是否隐藏列（高级功能） */
  hidden?: boolean;
}

/** 行属性定义 */
type RowProp = {
  /** 行高度，必须指定 */
  height: number;
  /** 是否固定行（用于列头） */
  fixed?: boolean;
}

type TableData = CellData[]

/** 表格组件属性 */

interface TableProps {
  /** 表格单元格数据（包含所有行和列的单元格数据） */
  data: CellData[];
  /** 列属性定义 */
  columnProps: ColumnProp[];
  /** 行属性定义 */
  rowProps: RowProp[];
}

/** 高阶表格组件包装 */
interface TableWrapper {
  /** 是否自动合并列单元格 */
  mergeHead?: boolean;
  /** 是否自动合并行表头单元格 */
  mergeRow?: boolean;
}

```



表格实例

```jsx

<Table />
```

### 样式配置

表格样式包含：

  1. 表头文字/背景 
  2. 表身文字/背景 
  3. 边框颜色
  4. 行背景色

样式定义分为以下三个层次：

* 支持与系统主题名称适配，例如指定主题名称 'light' 或者 'dark'；
* 表格自身支持配置不同风格，例如无边框风格、简约风格、隔行换色风格等；
* 支持表头、表身单独配置样式；


### 设计细节

1. 是否需要有行的概念？

因为单元格要支持自动换行，HTML结构上需要有行的概念，行内的单元格撑满行的高度，这样可保证同一行的所有单元格具有相同的高度。
但是如果有跨行的单元格合并发生，跨行的单元格高度计算又成了问题，总的来说，最佳做法是通过配置行高加以限制，允许单元格显示多行，但不保证显示完整内容。

另一种方案是使用`grid布局`，可以完美解决自动行高的问题，甚至列宽也不需要固定，但`grid布局`同样有缺陷，无法实现按需加载。

### roadmap

+ column & row fixed scrolling [done]
+ high performance & customized scrollbars [done]
+ theme support [done]
+ column resizing [done]
+ virtual column & row (行、列模拟，例如识别行的第一个和最后一个单元格) [doing]
+ custom cell render （例如指标区渲染为柱图）[doing]
