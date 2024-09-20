# tinyBoard

#### 介绍

a flexiable layout library.

尝试更改 LayoutId 类型为非空，这可以优化一些不必要的判断

reLayout 调用场景:

1. drag: (rect)
2. resize: (rect)
3. drop:
   3.1 添加 (id)
   3.2 取消 (null, CANCEL)
   3.3 dragleave (null, CANCEL)
   3.4 dragover (point)
4. moving

### 测试

drop data 有 id
drop data 无 id，自动生成 id

极速调整高度（top、bottom）


selectMode = single | multiple

TODO: 能否实现两个实例共享同一个面板容器？这样可以实现多图层，例如一个用作布局层，另一个自由拖拽作为悬浮图层（或者再加上一个背景层）。（需要为不同的图层配置不同的元素选择器 selector，或者更简单的方案，在每个元素块上标记 data-layer-id 属性）

TODO: 即然拖放的块大小可以不同，在拖时应该生成一个虚拟的元素跟随鼠标（dragImage），以此来标示当前块的尺寸

TODO: 增加事务支持，开启事务后，所有操作都不自动提交，必须手动调用提交，这样可批量修改、增删布局元素。(现在已经是这种模式，外部控制 commitLayout 调用即可。)

TODO: 可否支持临时关闭 layout，允许以乱序添加？(开启事务即可)

TODO: 能否增加拖拽目标选项，值为： indicator(拖拽阴影，目标跟随）|target(拖拽目标块，阴影跟随）


TODO: 默认携带基本样式？

test resize top，向上调整高度使 top 超过上方矩形，是否会发生交换？
**resize变化过程中，应该始终拿拖拽块与其它块在拖拽开始时的初始状态作对比进行布局**，这样在发生交换的临界点来回跳跃时才能保持正常结果。

test 栅格设置很大，大于矩形块的高度时，拖拽体验是否变化？

### 交互规范

activateLayout(id)

// add, remove, update, stack...

commitLayout()

test:
activateLayout(id) + commitLayout(null)
activateLayout(null) + commitLayout()

props.onLayoutUpdated 内部布局变化，提交时触发
hooks.onLayoutUpdated 传入 props 发生改变时触发

### 添加元素

1. 手动添加

```js
instance.addLayoutItem(itemData, rect?)

// 或

// itemData.style为已转换单位
instance.setLayoutData([...instance.layoutData, itemData])
```

### 删除元素

```js
instance.removeLayoutItem(itemData.id)

// 或

instance.setLayoutData(layoutData.filter((o) => o.id !== itemData.id))
```

#### 软件架构

软件架构说明

特性支持：

1. 限制拖拽(bounds)
2. 限制 resize（最大/最小长宽，参见 RGL 的 minW, minH, maxW, maxH）
3. 自定义存储格式（外部实例自己实现？）
4. 开启/关闭碰撞检测
5. 压缩方向 (垂直|水平|NONE)
6. multi select 支持
7. 多图层支持

使用场景：

1. 任意拖拽(无网格)
2. 网格拖拽
3. 禁用拖拽，只读布局
4. 分列排列（列对齐，高度不一）
5. 分行排列（行对齐，宽度不一）
6. 向左浮动+横向无限延申

应用：

推箱子
流程图
页面布局
模块导航页面布局
网格设计
相册拼图

### hooks 设计

#### useBoard(options: BoardOptions, ...plugins: Plugin[])

useBoard({...}, [
  [useSelection, { multiple: true }],
  [useDrag, { noOverflow: false }]
])

#### useBoxItem (private)

#### useDragger ( autoFit ? )

无论仪表盘支持单选/多选，或者支持多指同时拖拽（触摸屏），都能在外部定义相关的状态。因此，该 hook 不关心 item 选中的问题。

TODO: test 随机生成大量矩形，调用 compactLayout，测试性能

#### useResizer

```js
useResizer()
```

#### userFlowUpLayout

#### useRuler

#### useLayer

使用图层

```js

type Layer = {
  addChild(item); // 将对象分配到图层
  remove(item); // 从图层剔除对象
  rename(name); // 重命名图层
  destroy(); // 销毁图层
}

type hook = {
  addLayer({ id?: number; name?: string; }) // 创建图层
  getLayer(id): Layer // 获取图层
  removeLayer(id) // 删除图层
}

```

## 设计特性

## 场景验证

1. 全屏(等比)
2. 多选(支持鼠标框选)、组合
3. 组件间对齐、重叠
4. 组件间间距  （外层实例包装实现）
5. 自动排列/浮动(层级关系)
6. 背景



## 最小能力(相互独立)

1. 布局规则
   1. 浮动用 div 上下排序，适应所有场景。提供一个工具获取和编辑和其他 div 的关系
   2. 栅格(自动排序)
      1. 转定位算法
2. 磁铁/吸附，图表单位开关 (移动时、缩放时)，场景：其他图表边距、上/下居中
3. 添加组件
   1. 图表/控件初始宽高、位置
4. 图表切换浮动/自动排列
5. 自动排列
   1. 相对定位
      1.  (考虑使用transform以得到更好的性能)，百分比 / 坐标(精度/直观更高？需要适配resize)
      2. 现有方案
   2. 全局图表间距(栅格padding模拟)
6. 浮动
   1. 图表间对齐功能(靠左、居中、居右)
   2. 图表组合
7. 等比缩放(基础宽度，每个组件存储原始宽度，通过当前页面实际宽度得到真实宽度？)
8. 拖拽/缩放
   1. 图表是否有效拖动检测
   2. 碰撞检测
   3. 拖拽预览
   4. 多图表拖拽(多选拖拽、组合拖拽)
   5. 组合内各自支持拖动缩放
9. 选中
   1. 多选选中态
   2. 图表组合内单图表选中态
   3. 组合(组合之后，向上移动到被组合元素内能够达到的最高层级)
10. 鼠标框选
11. tab页
    1. 拖进拖出判断?
    2. 复用仪表盘逻辑？



## 数据结构

1. 仪表板
   1. width？
2. 组件
   1. ltx、lty、rbx、rby、width?、height?
   2. isFloat、groupId、isSelected
   3. widgetData
3. 组件广播
   1. eventKey
   2. lazyLoad


## 参考

https://www.npmjs.com/package/react-perfect-zoom
https://www.npmjs.com/package/scrollbooster (see demo)

HTML DOM closest
HTML DOM after
HTML DOM before
HTML DOM insertAdjacentElement
HTML DOM insertAdjacentHTML
HTML DOM insertAdjacentText
HTML DOM insertBefore
HTML DOM replaceWith
HTML DOM remove
HTML DOM removeChild
HTML DOM replaceChild
HTML DOM append
HTML DOM prepend
HTML DOM queueMicrotask
HTML DOM getClientRects
HTML DOM isEqualNode
HTML DOM isSameNode

https://demo.statusfy.co/ 山水插画（排版演示）

React 教程
https://cloud.tencent.com/developer/doc/1201

https://zh-hans.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
https://zh-hans.reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
https://zh-hans.reactjs.org/docs/react-api.html
https://zh-hans.reactjs.org/docs/hooks-reference.html#usecallback

https://codepen.io/netsi1964/full/QbLLGW/?__cf_chl_jschl_tk__=48ecd4548dd862a4d5e170a194c330be0cacd344-1578881401-0-AUwCokLTrid9hX8XO7RveOZxcdcnMTxP6-ELKNzSA1F4SWnc91piIYcq0QF9Gt3pb5389cB0q-9zVAPXXbZbANrjdwDRs4AF-0uza-KlSFH9SmicfwBKVfSGbgf-2HhVHjXCIETvDXS6HmLjx_0BwIGSPXzrs1oPQrFRVXPuBBZTtnb1L3UfM1EZ0Cu-o8XfoubtTlEFjErZ6XjBfjWw13lcmc7XzLfUlnGUQMtiCEHawBgWBG4EcyEfQyziLfLFTKMTavNByFPDn33fQIgWQ0zUeCC23B_d6qUzrsdnfrxkFom8xQopSkaTwj-jsRWF203Wgq6DWT3LdU5bhaDF66t0_mPwq5Hmw4vomMs1_mz9

https://react-dnd.github.io/react-dnd/docs/overview

A tool for managing JavaScript projects with multiple packages.
https://lerna.js.org/

enzyme.js 安装使用:一个用于 React 的 JavaScript 测试工具
http://www.fly63.com/nav/321

如何使用 React.lazy 和 Suspense 进行组件延迟加载(翻译)
https://www.jianshu.com/p/61d6920c9e8f

https://www.cnblogs.com/shihaiying/p/11657760.html

https://www.veer.com/topic/115/

# TMP Code

// 寻找拖拽可移动的矩形区域
getAvailableRectIfExist = (x, y) => {
// note!
// 直到指针移出当前矩形遮罩区域，才寻找新的区域，
// 这样可以避免指针来回穿过区域边界线时导致的遮罩层区域反复变化

    const { containerRect, rects } = this;

    const leftRects = [{ top: 0, right: 0, bottom: containerRect.height }];
    const rightRects = [{ top: 0, bottom: containerRect.height, left: containerRect.width }];
    const topRects = [{ right: containerRect.width, bottom: 0, left: 0 }];
    const bottomRects = [{ top: containerRect.height, right: containerRect.width, left: 0 }];

    const matchedRects = [];

    rects.forEach(r => {
      if (r.left > x) {
        rightRects.push(r);
      } else if (r.right < x) {
        leftRects.push(r);
      }

      if (r.top > y) {
        bottomRects.push(r);
      } else if (r.bottom < y) {
        topRects.push(r);
      }
    });

    // 算法：
    // 对任意满足 rR.left - rL.right >= maskWidth 的 rL, rR
    // 对与水平区间<rL.right, rR.left>有交汇的矩形集合S，在S中寻找满足以下条件的矩形 rT, rB：
    // rB.top - rT.bottom >= maskHeight
    // 如果<rL.right, rT.bottom, rR.left, rB.top>构成的矩形区域与
    // rL, rR, rT, rB 之外的所有矩形都无交集，则该区域即构成一个可移动区域
    // 最后，选取一个最佳可移动区域，满足可移动的中心坐标最接近鼠标位置

    let left;
    let top;
    let right;
    let bottom;

    leftRects.forEach(r1 => {
      rightRects.forEach(r2 => {
        if (r2.left - r1.right >= this.maskWidth) {
          left = r1.right;
          right = r2.left;

          // r.left < right && r.right > left 为矩形与水平区间<left, right>有交汇的充分必要条件
          const intersectedTopRects = topRects.filter(
            r => r.left < right && r.right > left && (r.bottom < r1.bottom && r.bottom < r2.bottom)
          );
          const intersectedBottomRects = bottomRects.filter(
            r => r.left < right && r.right > left && (r.top > r1.top && r.top > r2.top)
          );

          intersectedTopRects.forEach(r3 => {
            intersectedBottomRects.forEach(r4 => {
              if (r4.top - r3.bottom >= this.maskHeight) {
                bottom = r4.top;
                top = r3.bottom;

                const targetRect = { left, top, right, bottom };

                if (rects.every(r => isRectIsolated(r, targetRect))) {
                  matchedRects.push(targetRect);
                }
              }
            });
          });
        }
      });
    });

    if (matchedRects.length === 0) {
      return null;
    }

    const cursorRect = {
      left: Math.max(0, x - this.maskWidth / 2),
      top: Math.max(0, y - this.maskHeight / 2),
      right: Math.min(containerRect.width, x + this.maskWidth / 2),
      bottom: Math.min(containerRect.height, y + this.maskHeight / 2),
    };

    // 选取与cursorRect相交面积取大的那一个
    let maxCrossArea = 0; // The rect having maximium cross area with `cursorRect` as the best one
    let bestRect = null;

    matchedRects.forEach(r => {
      r.width = r.right - r.left;
      r.height = r.bottom - r.top;

      const crossWidth = r.left < cursorRect.left ? r.right - cursorRect.left : cursorRect.right - r.left;
      const crossHeight = r.left < cursorRect.left ? r.right - cursorRect.left : cursorRect.right - r.left;

      const area = crossWidth * crossHeight;

      if (area > maxCrossArea) {
        bestRect = r;
        maxCrossArea = area;
      }
    });

    availableRect = bestRect;

    this.drawShadowRect(x, y);

    return bestRect;

};
