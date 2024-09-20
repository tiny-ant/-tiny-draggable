# This is vite based a project trying the interaction of varies of UI layout system, including theme.

including:

> splitter
> gridLayout
> win10 settings layout design.
> cssGrid layout designer.
> a layout template for app management system.
> a layout template for data business system.


# FAQ

调试babel:

```bash
BABEL_SHOW_CONFIG_FOR=./src/template-fc.tsx npx babel ./src/template-fc.tsx
```


#NOTE:

webComponent内容触发的事件设置composed属性，不让外部通过事件知道组件内部的DOM细节。



TODO:

* 移除babel-plugin-import，编译输出，查看`import { Button, Icon } from 'ink'`是否转译成：
  var ink = require('ink')
  var Button = ink.Button;
  var Icon = ink.Icon;

* antd组件为什么不直接import css ？

* 关于tree-shaking

  a.js: import b from 'b' 但未使用b, b文件中有全局修改DOM的代码，b的import会shaking掉还是b文件中的b模块被shaking掉？

  如果是仅仅shaking掉b文件中关于b模块的定义，那 import b from 'b'须被改写成 import 'b';



### references

https://youdata.163.com/index/manual/o/2Introduction_of_the_module/introduction.html

八叉树算法的改进，可以设定固定的颜色数
https://blog.csdn.net/zhigongjz/article/details/110818477

图像主题色提取算法
https://blog.csdn.net/shanglianlm/article/details/50051269

图片主题色提取算法小结 原文链接：http://xcoder.in/2014/09/17/theme-color-extract/
https://www.jianshu.com/p/8155dbf97afe

https://www.doc88.com/p-5327654299539.html


https://robotjs.io/docs/syntax  The only Node.js first Desktop Automation Library

30 分钟理解 CORB 是什么
旁路攻击（side-channel attacks）
预执行（speculation execution）
幽灵和熔断漏洞（Spectre & Meltdown）
CORB（Cross-Origin Read Blocking）
https://www.cnblogs.com/oneasdf/p/9525490.html


### react技术栈文档

https://v5.reactrouter.com/web/guides/quick-start
https://reactrouter.com/en/main/start/faq#faqs
