
### 初始化

`
pnpm install

pnpm build:utils

`
## TODOS

1. The difference between HashRouter and BrowserRouter.

3. how did umi discovers a router slot ? how does it realize route nesting ?

4. How to use router hooks to realize authorization ? (onEnter & onLeave)

5. Vite uses rollup to produce the production bundle, what's the relationship between bable and rollup ? is babel a must dependency ?

6. 如何实现多语言配置化更改，无需发版更新？

## 接口规范

```json
{
  status: number;
  data: any;
  errors: { message: string; code: string; } | null
}
```

## 理解

connect 的其中两个参数 mapStateToProps、mapDispatchToProps 相当于 model，这个可以独立写到一个文件中再 import 进来。
但是 model 可能被多个组件共用，因此需要独立的管理。

## NOTE

withRouter(connect(...)(component)) 与 connect(...)(withRouter(component)) 的差别

## 参考

https://redux.js.org/
https://redux-toolkit.js.org/introduction/getting-started
https://react.jokcy.me/book/api/react-structure.html

【react-router】
https://reactrouter.com/web/guides/quick-start
https://reactrouter.com/web/api/Router/history-object
http://zhangdajia.com/2018/11/30/React-router-v4中BrowserRouter和HashRouter的区别/
https://zhuanlan.zhihu.com/p/27433116
https://github.com/reactjs/react-router-tutorial/tree/master/lessons/13-server-rendering
https://www.cnblogs.com/nangezi/p/11490778.html  react-router的BrowserHistory 和 HashHistory 的区别，如何解决使用BrowserHistory 引起的访问路径问题
https://www.cnblogs.com/cckui/p/11490372.html  React-router5.x 路由的使用及配置


https://babeljs.io/docs/en/babel-preset-react
https://babeljs.io/docs/en/babel-preset-typescript

http://www.ruanyifeng.com/blog/2020/12/fetch-tutorial.html
https://segmentfault.com/a/1190000017025003 Fetch API 简单封装

https://zhuanlan.zhihu.com/p/148534833 大型
https://zhuanlan.zhihu.com/p/162396347 TypeScript + React 最佳实践-第一节：Component 类型化
https://www.cnblogs.com/jsydb/p/9480216.html redux 和 react-redux 的使用详解
http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_two_async_operations.html

https://www.v2ex.com/t/724286 React Hooks 性能优化的正确姿势
https://segmentfault.com/a/1190000020616412?utm_source=tag-newest React Hooks 你真的用对了吗？

https://esbuild.github.io/

https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#jsx-factories



https://www.cnblogs.com/Grewer/p/13025589.html  小记 React Element 类型
https://www.cnblogs.com/cangqinglang/p/9947223.html  对React children 的深入理解

### 其它资源

https://developer.mozilla.org/zh-CN/docs/Web/CSS/blend-mode
https://bennettfeely.com/gradients/


### PNPM

添加一个本地依赖：

pnpm -F layouts -F ink add --workspace @tiny/dragmove@1.x

pnpm -F layouts add --workspace ink

注意最后的参数是包名（如果包含路径，路径也属于包名的一部分，包名在`package.json`文件中由name属性指定）

### FAQ

lerna.json中使用 `useWorkspaces: true` 选项后bootstrap将不会安装packages中的依赖。

@babel/eslint-parser
@babel/eslint-plugin


### eslint-plugin-prettier

Runs Prettier as an ESLint rule and reports differences as individual ESLint issues.

If your desired formatting does not match Prettier’s output, you should use a different tool such as prettier-eslint instead.

Please read [Integrating with linters](https://prettier.io/docs/en/integrating-with-linters.html) before installing.

### eslint-config-prettier

Turns off all rules that are unnecessary or might conflict with [Prettier].

This lets you use your favorite shareable config without letting its stylistic choices get in the way when using Prettier.

Note that this config only turns rules off, so it only makes sense using it together with some other config.


### 发布

https://docs.npmjs.com/cli/v7/using-npm/scope

associate a scope with a registry at login:
`
npm login --registry=http://reg.example.com --scope=@myco
`

associate a scope with a registry using npm config:
`
npm config set @myco:registry http://reg.example.com
`
