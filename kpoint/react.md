# react相关知识点

## 1. react类组件和函数组件的区别
### 1.1 对比总览
| 维度        | 类组件（Class Component）                | 函数组件（Function Component）           |
| --------- | ----------------------------------- | ---------------------------------- |
| 定义方式      | 使用 `class`，继承自 `React.Component`    | 使用普通的 JavaScript 函数                |
| 状态管理      | 使用 `this.state` 和 `this.setState()` | 使用 `useState()` 等 Hook             |
| 生命周期      | 使用类生命周期方法（如 `componentDidMount`）    | 使用 `useEffect()` 替代                |
| `this` 问题 | `this` 需要绑定（如构造函数中 `.bind(this)`)   | 无需 `this`，直接访问 props、state         |
| 可读性/简洁性   | 相对繁琐，有冗余代码                          | 简洁、函数式编程风格                         |
| Hook 使用   | ❌ 不支持                               | ✅ 支持所有 React Hook                  |
| 性能（小差异）   | 差别很小，主要取决于写法                        | 同上；函数组件可能更易优化（配合 memo/useCallback） |
| 代码复用      | HOC、render props 方案                 | 可使用自定义 Hook，实现更优雅的逻辑复用             |
| 是否推荐      | React 16.8 后不推荐新增使用                 | ✅ 官方推荐首选方式                         |
### 1.2 生命周期对比
| 生命周期行为                | 类组件方法                    | 函数组件中的写法（Hook）                                |
| --------------------- | ------------------------ | --------------------------------------------- |
| 挂载                    | `componentDidMount()`    | `useEffect(() => { ... }, [])`                |
| 更新                    | `componentDidUpdate()`   | `useEffect(() => { ... }, [dep])`             |
| 卸载                    | `componentWillUnmount()` | `useEffect(() => { return () => {...} }, [])` |
| shouldComponentUpdate | 可手动控制性能优化                | `React.memo` + `useMemo/useCallback`          |
### 1.3 总结
函数组件 + Hooks 能实现类组件无法优雅实现的逻辑复用、状态隔离和组合能力，具有更高的表达力、可维护性和可测试性
### 1.4 典型场景
1. 逻辑复用
类组件中想复用逻辑，只能用高阶组件（HOC）或 render props
```js
// render props：会产生组件嵌套地狱
<DataFetcher render={(data) => <Component data={data} />} />
```
```js
const data = useDataFetcher(url); // 逻辑复用像调用函数一样自然
```
2. 逻辑分散难管理
类组件中，一个副作用逻辑（如订阅 WebSocket）往往拆散在多个生命周期中：
```js
componentDidMount() {
  socket.subscribe();
}
componentDidUpdate() {
  if (someConditionChanged) socket.resubscribe();
}
componentWillUnmount() {
  socket.unsubscribe();
}
```
```js
useEffect(() => {
  socket.subscribe();
  return () => socket.unsubscribe();
}, [someCondition]);
```
3. 动态 Hook 组合
类组件里无法按条件引入一段状态逻辑，只能提前写好所有逻辑
```js
if (isEditMode) {
  useEditableLogic();
} else {
  useReadonlyLogic();
}
```
4. 使用多个状态逻辑时的隔离性和可测试性
函数组件通过多个 useState/useReducer 可以把逻辑拆得很干净：
```js
const [list, setList] = useListData();
const [searchTerm, setSearchTerm] = useSearch();
const [selected, setSelected] = useSelectedItem();
```
- 每个状态逻辑都可以封装成独立的自定义 Hook，天然解耦、易测试、易重用
- 类组件会把这些混在 this.state 中，难以拆分逻辑。
### 1.5 性能优化更清新
- 👁 逻辑更细粒度、透明：状态是显式的、Hook 是函数，能明确追踪每段逻辑
- 🔧 优化手段组合灵活：如 useMemo、useCallback、React.memo 配合使用，粒度精准
- 🧱 组件是纯函数（无副作用）更利于优化，例如 memoization、惰性渲染、避免不必要的重渲染
#### 类组件如何做性能优化
1. 使用 PureComponent
```js
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.value}</div>;
  }
}
```
- 自动进行浅比较（props 和 state）
- 但仅浅比较，引用类型变更（如数组、对象）容易触发误更新或误跳过
2. 使用 shouldComponentUpdate 手动控制更新
```js
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.value !== this.props.value;
  }
}
```
- 精细控制更新逻辑
- 可读性差、易错；多个 props 时逻辑庞杂，不利于维护
3. 使用不可变数据结构（配合 Redux、Immutable.js）
- 避免引用地址不变导致不更新
- 实际效果不如 Hook 直观
4. 总结类组件痛点
- 性能优化“隐藏”在生命周期中，不透明
- 易遗漏 shouldComponentUpdate，导致全量重渲染
- 多个状态、复杂依赖下，不易定位问题点
#### 函数式组件进行性能优化
1. React.memo(Component)
功能：对组件进行浅比较（Object.is），避免不必要的重渲染（等价于 PureComponent）
```js
const MyComponent = React.memo(function MyComponent({ value }) {
  return <div>{value}</div>;
});
```
推荐使用在纯显示型组件或 props 不经常变的组件中
2. useMemo()
功能：缓存计算结果，避免重复计算
```js
const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);
```
用于性能敏感的计算逻辑（如排序、过滤、大数据渲染）
3. useCallback()
功能：缓存函数引用，防止子组件因函数变化而重复渲染。
```js
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```
用于将回调传入 memo 化子组件时，保持引用稳
4. useTransition()、useDeferredValue()
功能：异步 UI 更新、延迟渲染，提升流畅度
```js
const deferredValue = useDeferredValue(searchTerm);
```
#### 总结对比
| 优化策略          | 类组件                     | 函数组件                              |
| ------------- | ----------------------- | --------------------------------- |
| 浅比较优化         | `PureComponent`         | `React.memo()`                    |
| 手动更新控制        | `shouldComponentUpdate` | `React.memo()` + props 控制         |
| 函数缓存          | 需要手动 bind 或定义函数         | ✅ `useCallback()`                 |
| 计算缓存          | 无                       | ✅ `useMemo()`                     |
| 异步渲染/延迟更新     | 无                       | ✅ `useTransition()` 等 React 18 特性 |
| 生命周期优化（副作用合并） | 拆在多个生命周期方法中             | ✅ `useEffect()` 集中管理副作用           |
| 性能分析与定位       | 难以精准定位、嵌套逻辑复杂           | ✅ 逻辑分明，易插桩与监控                     |
#### 最佳实践
- 默认使用函数组件，配合 React.memo 和 useCallback 是最稳妥的做法
- 状态拆分成多个 useState / useReducer，逻辑分离更利于优化
- 用 useMemo 缓存重计算数据，比如筛选、排序、转换
- 子组件不要传递新建的匿名函数（容易破坏 memo）
- 如果子组件 props 很复杂，考虑拆分成更小的 memo 化组件

---

## 2. react函数组件有什么特性
### 2.1 一句话重点
React 函数组件是纯函数式声明 UI 的组件，天然支持 Hooks，用更简洁、组合化的方式构建组件逻辑，是现代 React 的核心组件模型
### 2.2 函数组件的核心特性
| 特性                  | 说明                                                 |
| ------------------- | -------------------------------------------------- |
| ✅ 本质是一个 JS 函数       | 以函数形式定义，参数是 `props`，返回值是 JSX（即 Virtual DOM）        |
| ✅ 无 `this`          | 不需要绑定 `this`，无实例，访问状态和方法更清晰                        |
| ✅ 支持 React Hooks    | 可以使用 `useState`、`useEffect` 等 Hook 添加状态、副作用等能力     |
| ✅ 无生命周期方法（类组件那套）    | 没有 `componentDidMount`，用 `useEffect` 替代            |
| ✅ 可组合性强             | 可以通过自定义 Hook 组织复杂逻辑，实现“逻辑复用”                       |
| ✅ 更易读、易测            | 函数本身无副作用、无隐藏状态，结构扁平，便于测试和调试                        |
| ✅ 更适合性能优化           | 与 `React.memo`、`useMemo`、`useCallback` 等优化方式天然适配   |
| ✅ 与 React 的未来特性兼容性好 | 如 Concurrent Mode、Server Components、React Forget 等 |
### 2.3 特性延伸解析
1. 是纯函数，但不是“纯粹的纯函数”
- 组件函数可以包含副作用（在 useEffect 中），也可以操作外部状态
- 但它的“渲染行为”是纯函数 —— 输入 props → 输出 UI
2. 每次渲染就是一次“函数执行”
- 函数组件没有“实例”，每次渲染都是重新执行组件函数
- Hook 状态由 React 框架在内部通过调用顺序关联管理
- 所以不能在条件中调用 Hook（Rules of Hooks）
3. 和 Hook 深度绑定
- 函数组件的能力主要来自 Hooks
- Hook 是让函数组件“有状态”的桥梁（之前函数组件是无状态组件）
### 2.4 hook规则
1. 只在最顶层调用 Hook
- 不要在循环、条件或嵌套函数中调用 Hooks
2. 只在函数组件或自定义 Hook 中调用 Hook
- 不要在普通函数、class、事件回调中调用 Hook

---

## 3. react类组件的state
### 3.1 一句话解释
在 React 类组件中，state 是一个对象，表示组件当前的状态，通过 this.setState() 方法更新，更新会触发组件重新渲染
### 3.2 state是什么？
- 是组件内部的私有数据
- 和 props 不同，props 是外部传入，state 是组件自己管理
- 在类组件中，必须通过 this.state 访问
### 3.3 setState是如何工作的
- 是异步更新（出于性能考虑，可能会合并多次调用）
- 会触发重新渲染（render 函数再次执行）
- 使用对象或函数形式
### 3.4 setState的批处理行为
- 在 React 合成事件、生命周期方法中是批量更新的（异步合并）
- 在 setTimeout、原生事件、Promise.then中可能是同步的
- React 18 开始，在大多数情况中都启用自动批处理
### 3.5 例子
1. 合成事件中 setState 是批量异步的
```js
class App extends React.Component {
  state = { count: 0 };

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    console.log('after setState:', this.state.count);
  };

  render() {
    console.log('render:', this.state.count);
    return <button onClick={this.handleClick}>Click</button>;
  }
}
```
- 两次 setState 被 批处理合并为一次
- this.state 在 console.log 时没有立即更新
- 只有在事件处理函数退出后，React 再统一执行 render
2. setTimeout 中 setState 是同步执行的
```js
class App extends React.Component {
  state = { count: 0 };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ count: this.state.count + 1 });
      this.setState({ count: this.state.count + 1 });
      console.log('after setState (timeout):', this.state.count);
    }, 0);
  }

  render() {
    console.log('render:', this.state.count);
    return <div>Count: {this.state.count}</div>;
  }
}
```
- 在 setTimeout 中，每次 setState 立即触发 render
- 两次 render 被执行了
- console.log 中 this.state.count === 2，说明两次都生效了
3. 原生 DOM 事件中 setState 也是同步执行
```js
componentDidMount() {
  document.getElementById('btn').addEventListener('click', () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    console.log('native event count:', this.state.count);
  });
}
```
### 3.6例子
| 场景                        | React 17 默认行为 | React 18 默认行为 |
| ------------------------- | ------------- | ------------- |
| React 合成事件                | ✅ 批处理         | ✅ 批处理         |
| 生命周期（如 componentDidMount） | ✅ 批处理         | ✅ 批处理         |
| setTimeout / Promise 回调   | ❌ 不批处理（同步）    | ✅ 自动批处理（需启用）  |
| 原生 DOM 事件                 | ❌ 不批处理（同步）    | ✅ 自动批处理（需启用）  |

---

## 4. react的底层渲染原理
### 4.1 一句话总结
构建 Fiber 树、调度更新、生成 Virtual DOM、Diff 比较、提交真实 DOM 操作。
### 4.2 总体流程总览
【更新触发】→【Render Phase（构建 Fiber 树）】→【Commit Phase（执行 DOM 更新）】
### 4.3 详细阶段拆解
1. 更新触发
- 比如 setState、useState 更新、props 变化、forceUpdat
- React 会将更新任务放入任务队列中，并通过调度器调度
2. Render Phase（渲染阶段）
这一阶段是纯计算阶段，会构建新的 Fiber 树，不涉及真实 DOM 操作
- 从根节点开始执行“工作单元”
- 每一个组件会生成一个对应的 Fiber 节点
- Fiber 是 React 内部维护的工作单元对象，包括组件状态、props、effect 等
- 递归构建子 Fiber 节点（类似于遍历组件树）
- 对比旧的 Fiber 树（即上一次 render）以找出变化
- 标记每个节点需要执行的 DOM 操作（Placement、Update、Deletion 等）
- 这个阶段是可以被中断的（可中断渲染）
3. Commit Phase（提交阶段）
真正进行 DOM 操作的阶段，不能被打断
- 遍历变化的 Fiber 节点
- 执行对应的 DOM 操作（插入、更新、删除）
- 触发生命周期/副作用函数
 - 类组件的 componentDidMount、componentDidUpdate
 - 函数组件的 useEffect、useLayoutEffect
- 更新 refs
4. Repaint（浏览器重绘）
- React 完成 DOM 更新后，交给浏览器执行重绘
- React 本身不管具体的渲染结果，它只关心 DOM 结构
### 4.4 Fiber 是什么
| 特性           | 说明                                                                    |
| ------------ | --------------------------------------------------------------------- |
| Fiber 是什么？   | React 用于表示组件状态的数据结构（JS 对象，替代原来的 Virtual DOM 节点）                       |
| 有哪些字段？       | `type`, `props`, `stateNode`, `child`, `sibling`, `return`, `flags` 等 |
| 为什么设计 Fiber？ | 解决旧版 Virtual DOM 无法中断、回退的问题，支持异步渲染、优先级控制                              |
| 具备什么能力？      | 可中断、可恢复、可优先级调度、结构更灵活                                                  |
### 4.5 更新调度与优先级机制
- React 内部有调度器（scheduler），用于根据任务的“优先级”执行更新
- 比如：
  - 用户输入（高优先级）
  - 数据请求（中优先级）
  - useDeferredValue、startTransition（低优先级）
### 4.6 整个流程图（文字版）
```text
用户交互 / setState
     ↓
调度任务（Scheduler）
     ↓
Render Phase（构建新 Fiber 树）
     ↓
Diff 与旧 Fiber 树
     ↓
标记变化（flags）
     ↓
Commit Phase（真实 DOM 操作 + 副作用）
     ↓
浏览器绘制
```
---

## 5. [react fiber](https://juejin.cn/post/7225957841319379005)
### 5.1 总结
React Fiber 是 React 16 引入的新架构，是一种可中断、可恢复、具备优先级的组件渲染机制，用来替代原先同步递归的 Virtual DOM Diff 实现，是 React 实现异步渲染和并发更新的基础
### 5.2 Fiber 是什么
- React 内部维护的一种 数据结构
- 它代表 UI 中的每一个组件、DOM 节点或文本节点
- 每一个 Fiber 是一个 JS 对象，叫做“Fiber 节点”
### 5.3 Fiber解决了什么问题
- 更新是同步、递归、不可中断的
- 大型组件树会导致长时间阻塞主线程（比如高帧动画卡顿）
- 无法优雅支持异步任务、用户打断、任务优先级等
### 5.4 Fiber的目标
| 目标          | 解释                                      |
| ----------- | --------------------------------------- |
| **可中断渲染**   | 可以将渲染任务拆成小块，浏览器空闲时继续处理（避免卡顿）            |
| **任务优先级调度** | 比如用户输入优先渲染，低优先级数据延迟渲染                   |
| **并发渲染支持**  | 支持 `startTransition`、`Suspense` 等异步渲染特性 |
| **更细粒度的控制** | 每个组件更新都能精确追踪和标记状态变化                     |
### 5.5 Fiber 的“双缓冲机制”
- 每次渲染时，React 会
 - 保留一份旧的 Fiber 树（current）
 - 构建一份新的 Fiber 树（workInProgress）
 - 在 Commit 阶段完成后，将新树设为 current

---

## 6. react的任务调度机制
### 6.1 总结
React的任务调度机制基于 Scheduler 调度器（内部实现类似任务队列 + 优先级管理 + 时间切片）来实现中断、恢复和多优先级任务控制，是 Fiber 架构实现异步可中断渲染的基础
### 6.2 为什么需要任务调度机制
在 React 16 之前，更新是同步递归执行的：
- 一旦开始渲染，必须一路渲染到底，无法被打断
- 大型组件树更新会长时间阻塞主线程，造成卡顿，严重影响用户交互
- 无法区分任务优先级，UI响应不够灵敏
### 6.3 React 的调度机制目标
| 目标      | 解释                          |
| ------- | --------------------------- |
| ⏸ 可中断   | 渲染过程中可以暂停，让出主线程（响应用户事件等）    |
| 🔁 可恢复  | 中断后能从断点继续，不需要重头开始           |
| ⏳ 优先级调度 | 用户输入/动画 → 高优先级；数据加载 → 低优先级  |
| ⏱ 时间切片  | 限定任务每一帧执行时间，超过时间就中断，等下一帧再继续 |
### 6.4 React 调度器是如何实现的
- 是 React 内部的调度引擎
- 维护一个“任务优先队列”
- 每个任务都有
 - callback
 - priorityLevel
 - startTime
 - expirationTime
### 6.5 优先级分类
| 优先级             | 对应场景               | 失效时间（ms） |
| --------------- | ------------------ | -------- |
| `Immediate`     | `flushSync()` 强制同步 | -1       |
| `User-blocking` | 用户输入（拖拽、键盘、鼠标）     | 250      |
| `Normal`        | 默认异步任务             | 5000     |
| `Low`           | 后台更新，如日志记录         | 10000+   |
| `Idle`          | 不紧急，如预加载、离屏渲染      | 无限       |
### 6.6 时间切片机制（Time Slicing）
- React 每帧最多只占用 5ms 的计算时间
- 使用 requestIdleCallback（或内部实现如 MessageChannel）检测是否超时
- 如果任务超时，React会中断渲染，等下一帧继续构建Fiber树
### 6.7 渲染过程如何被调度
React 的渲染分为
1. Render Phase（可中断）：
  - 构建新的 Fiber 树
  - 每个组件都是一个“工作单元”
  - React 会根据时间预算（比如 5ms）处理一部分节点
  - 如果超时，就暂停，稍后继续 
2. Commit Phase（不可中断）：
  - 一旦提交开始，必须同步执行
  - 修改 DOM、执行副作用（useEffect）等
### 6.8 调度系统在什么场景生效
| 场景                                | 是否受调度控制 | 优先级管理 |
| --------------------------------- | ------- | ----- |
| `setState`（同步）                    | ✅       | ✅     |
| `useTransition`、`startTransition` | ✅       | ✅     |
| `flushSync()`                     | ✅       | ✅     |
| `useDeferredValue`                | ✅       | ✅     |
| 普通的 `setTimeout`                  | ❌       | ❌     |
| 原生事件处理                            | ❌       | ❌     |

---

## 7. React常用的Hooks
### 7.1 总览
| Hook 名称               | 用途概述                    | 适用场景示例                        |
| --------------------- | ----------------------- | ----------------------------- |
| `useState`            | 定义本地状态                  | 计数器、表单输入、UI 状态（开关、加载等）        |
| `useEffect`           | 副作用处理（如请求、订阅、DOM 操作）    | 异步请求、事件监听、数据同步、清理逻辑           |
| `useRef`              | 获取 DOM 引用、持久化变量         | 操作 input、canvas，保存上一次的值等      |
| `useMemo`             | 缓存计算结果，避免重复计算           | 计算开销大的函数、依赖变化的值               |
| `useCallback`         | 缓存函数引用，避免子组件不必要渲染       | 传递函数 props 时与 React.memo 搭配使用 |
| `useContext`          | 获取上下文中的值                | 跨层组件通信，如主题、语言、用户信息            |
| `useReducer`          | 状态管理，适合复杂状态结构           | Redux 替代，管理对象型 state 或多状态联动   |
| `useLayoutEffect`     | 和 `useEffect` 类似，但同步触发  | DOM 更新前强制读取 DOM 信息（如尺寸、位置）    |
| `useImperativeHandle` | 与 `forwardRef` 搭配暴露实例方法 | 自定义组件对外暴露方法（如 `focus()`）      |
| `useTransition`       | 启用并发模式中的低优先级更新          | 搜索输入、防抖更新大数据列表                |
| `useDeferredValue`    | 延迟某些值的更新，提升响应速度         | 页面流畅性优化，如搜索结果延迟更新             |
| `useId`               | 生成唯一 ID（React 18 引入）    | SSR 中生成稳定 id，用于无障碍属性关联等       |
### 7.2 详细说明
1. useState
```js
const [count, setCount] = useState(0);
```
- 定义组件内的本地状态
- 多次调用可管理多个 state
- 异步更新，建议用函数式 setCount(prev => prev + 1)
2. useEffect
```js
useEffect(() => {
  fetchData();
  return () => cleanup(); // 清理副作用
}, [dep]);
```
- 替代 componentDidMount、componentDidUpdate、componentWillUnmount
- 每次依赖变化时运行
- 清理逻辑写在 return 里
3. useRef
```js
const inputRef = useRef(null);
<input ref={inputRef} />
```
- 获取 DOM 元素
- 存储在整个组件生命周期中都不会变化的“可变值
4. useMemo
```js
const expensiveValue = useMemo(() => compute(a, b), [a, b]);
```
- 避免每次 render 都重新执行开销大的函数
- 只有依赖变更时才会重新计算
5. useCallback
```js
const handleClick = useCallback(() => doSomething(), [deps]);
```
- 返回一个稳定引用的函数，避免传给子组件后导致不必要的 re-render
- 与 React.memo 配合使用效果最佳
6. useContext
```js
const theme = useContext(ThemeContext);
```
- 跨组件层级获取 context 的值
- 不再需要嵌套 <Consumer>
7. useReducer
```js
const [state, dispatch] = useReducer(reducer, initialState);
```
- 类似 Redux 思路
- 状态结构复杂或有多个状态联动时更清晰
8. useTransition
```js
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setValue(newValue); // 低优先级更新
});
```
- 控制哪些更新是“低优先级”的
- 比如输入框内容立即更新，数据列表稍后更新，提升交互体验
- 

--- 

## 8. useEffect的底层原理
### 8.1 一句话总结
useEffect 的底层实现是基于 Fiber 架构中的 effect list 机制，React 在 commit 阶段统一遍历 fiber 节点 执行副作用函数（effect hooks），并在合适的时机进行清理和重新注册
### 8.2 底层机制拆解
React 会在 Fiber 架构中维护一份「effect list」，每个 fiber 节点记录它在当前更新中产生的副作用（effect），这些副作用会在 commit 阶段统一执行
1. render 阶段
- useEffect 会在执行时
  - 创建一个 Hook 对象（内部结构如 { tag, create, destroy, deps }）
  - 将其挂到当前 fiber 的 updateQueue 上
  - 不会执行 effect（仅记录！）
2. commit 阶段（DOM 更新完毕后）
  - React 遍历所有 fiber，收集需要执行副作用的 hook
  - 判断依赖是否变化（depsChanged()）
  - 如果变化
    - 先执行上一次的清理函数（destroy）
    - 然后执行本次的副作用函数（create），并记录返回值作为下一次的 destroy
### 8.3 生命周期模拟图
| 类组件生命周期                | 函数组件 + useEffect 等效                        |
| ---------------------- | ------------------------------------------ |
| `componentDidMount`    | `useEffect(() => {}, [])`                  |
| `componentDidUpdate`   | `useEffect(() => {}, [deps])`              |
| `componentWillUnmount` | `useEffect(() => { return () => {} }, [])` |
### 8.4 useEffect 为什么异步（延后）执行
- 它不会阻塞 DOM 渲染
- 避免阻塞绘制帧（性能优化）
- 所以在 commit phase 之后，浏览器绘制之前 才执行
- 也因此你在 useEffect 中读写 DOM 时可能看到的是“旧的布局”
### 8.5 useLayoutEffect 与 useEffect 区别（底层视角）
| 对比项    | `useEffect`         | `useLayoutEffect`    |
| ------ | ------------------- | -------------------- |
| 执行时机   | 浏览器绘制之后             | 在 DOM 更新后、浏览器绘制前立即执行 |
| 是否阻塞渲染 | ❌ 否                 | ✅ 是                  |
| 使用场景   | 异步请求、订阅等副作用         | DOM 读写、测量、强制同步布局等    |
| 底层执行时机 | commit phase 之后（异步） | commit phase 之后（同步）  |

---

## 9. useEffect和useLayoutEffect的区别
### 9.1 一句话总结
1. useEffect 是异步执行的副作用 Hook，发生在浏览器绘制之后
2. useLayoutEffect 是同步执行的，在 DOM 变更之后但绘制之前执行，适合需要读取或同步操作 DOM 的场景
### 9.2 核心区别
| 对比项                      | `useEffect`                | `useLayoutEffect`   |
| ------------------------ | -------------------------- | ------------------- |
| 执行时机                     | **DOM 更新后，浏览器绘制后**（异步）     | **DOM 更新后，绘制前**（同步） |
| 是否阻塞浏览器绘制                | ❌ 否                        | ✅ 是                 |
| 适合场景                     | 异步请求、订阅、日志、事件绑定            | 读取 DOM、测量布局、同步修改样式  |
| 是否替代 `componentDidMount` | ✅ 是（在函数组件中）                | ✅ 是（但更早执行）          |
| 可能导致闪烁/抖动                | ✅ 有可能（样式变更滞后）              | ❌ 不会（在绘制前完成 DOM 操作） |
| 是否推荐优先使用                 | ✅ 是，90% 场景都推荐用 `useEffect` | ❌ 仅当必须同步处理 DOM 时使用  |
### 9.3 执行顺序
```text
render() → commit DOM → 
→ useLayoutEffect() 执行 → 浏览器绘制 →
→ useEffect() 执行（异步调度）
```
### 9.4 ref访问
| Hook              | 能否访问 DOM？ | 拿到的是不是最新 DOM？   | 是否会造成闪烁/布局错乱？ | 推荐用途              |
| ----------------- | --------- | --------------- | ------------- | ----------------- |
| `useEffect`       | ✅ 可以      | ❌ **不一定是最新的**   | ✅ **可能闪烁**    | 异步副作用、不关心布局       |
| `useLayoutEffect` | ✅ 可以      | ✅ 是**已更新的 DOM** | ❌ 不会闪烁        | 读取/同步操作 DOM、更精确控制 |

---

## 10. 为什么useEffect无法获取最新的dom元素
useLayoutEffect 和 useEffect 都能访问 DOM，但在读取布局信息时都可能遇到浏览器尚未 layout 的问题。不同的是，useLayoutEffect 执行早于浏览器绘制，因此你在里面更改样式不会造成视觉抖动。而在 useEffect 中修改样式，用户可能会先看到旧样式，造成“闪一下”的体验问题
### 总结
1. DOM 节点访问：useLayoutEffect 和 useEffect 都能访问
2. DOM 布局信息：两者都可能需要强制触发 layout 才能获取准确值
3. DOM 样式修改：useLayoutEffect 安全，useEffect 可能闪烁

---

## 11. useRef和useState底层区别
### 11.1 快速结论对比表
| 对比点                   | `useRef`                                           | `useState`                    |
| --------------------- | -------------------------------------------------- | ----------------------------- |
| **数据存储位置**            | 保存在 `fiber.memoizedState` 中（同 useState），但不会参与 diff | 同上                            |
| **值更新是否触发组件更新**       | ❌ 不触发组件更新                                          | ✅ 会触发组件重新 render              |
| **值在 render 中是否保持不变** | ✅ 是同一个 `ref.current` 对象                            | ❌ 每次 render 重新拿初始 state（闭包问题） |
| **用途**                | 存放**不会触发更新的持久数据**，或 DOM 引用                         | 存放**用于触发 UI 更新的数据**           |
| **React 是否跟踪它的变化**    | ❌ 不跟踪（mutable）                                     | ✅ 会跟踪（immutable），用于比较新旧值      |
| **适合存放的数据类型**         | 定时器ID、动画状态、滚动位置、DOM 引用等                            | UI 需要响应的数据，如输入框内容、tab选中状态等    |
### 11.2 底层原理分析
#### useState 底层原理
1. React 在初次渲染时调用 useState(initialValue)，在 Fiber 的链表中创建一个 Hook
```js
hook.memoizedState = initialValue;
```
2. 返回[state, setState]
3. 当 setState(newValue) 被调用时
 - React 比较旧值与新值
 - 若不同，则触发 re-render；
 - Fiber 重新执行 render 阶段，生成新的 Virtual DOM
 - 最终 commit 阶段更新真实 DOM
#### useRef 底层原理
1. 初次执行 useRef(initialValue)，也创建一个 Hook
```js
hook.memoizedState = { current: initialValue };
```
2. 返回这个 { current: ... } 对象，每次 render 都是同一个对象
3. 当你修改 ref.current，只是普通对象属性赋值，React 完全不会察觉，也不会 re-render

---

## 12. setState的闭包陷阱
### 12.1 什么是闭包陷阱
你在事件处理函数、setTimeout、副作用函数（如 useEffect）等异步代码中访问了某个 state 变量，但这个变量的值并不是你“以为的最新值”，而是它所属那次 render 的旧值
### 12.2 典型例子
```js
function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      console.log('count:', count); // ❌ 可能不是最新值
      setCount(count + 1);          // ❌ 可能加的是旧值
    }, 1000);
  };

  return <button onClick={handleClick}>Click me</button>;
}
```
- setTimeout(() => ...) 闭包中访问的 count 是 当前 render 中的变量
- 即使后续有新的 render，旧的闭包依然引用的是旧的 count
- 所以 count + 1 实际是基于旧值，加完后仍然是旧值 + 1，看似 set 了，实际没变
### 12.3 原因解释
| 原因              | 解释                                            |
| --------------- | --------------------------------------------- |
| 函数组件是普通函数       | 每次重新 render 就是一次新函数执行                         |
| 每次 render 的变量   | 都是当前执行上下文的快照，**不会自动变成“最新状态”**                 |
| 闭包引用的是老变量       | `setTimeout`、事件回调中引用的是**绑定闭包当时的变量快照**         |
| React 不帮你魔法更新闭包 | React 不会自动更新你闭包里的 `count`，你得自己获取最新值（如通过函数式更新） |
### 12.4 如何避免闭包陷阱
1. 使用函数式更新
```js
setCount(prev => prev + 1);
```
2. 使用useRef持久保存最新值
```js
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

setTimeout(() => {
  console.log(countRef.current); // ✅ 永远是最新的
}, 1000);
```

---

## 13. useEffect能监听useRef的值发生改变吗
不能，React 的 useEffect 无法监听 useRef.current 的变化，useRef 是非响应式的，React 并不会追踪 ref.current 的变化。
### 13.1 详细解释
useRef 的本质
```js
const ref = useRef(0);
```
它返回的是一个稳定的对象
```js
{ current: 0 }
```
这个对象本身在组件生命周期中是恒定的，只会在初始 useRef() 时创建一次  
当你修改
```js
ref.current = 123;
```
---

## 14. useContext触发更新的条件
1. 使用了 useContext(MyContext)
组件必须主动调用 useContext(SomeContext) 才会订阅更新
2. 上层的 <Provider> 提供的 value 引用发生变化
```js
<MyContext.Provider value={someObject}>
```
- 如果 someObject 是新对象，或原始类型新值 → ✅ 更新
- 如果是同一个引用 → ❌ 不更新

---

## 15. react的useRef和vue3的ref区别
### 15.1 快速对比表
| 对比维度         | React `useRef`               | Vue 3 `ref`               |
| ------------ | ---------------------------- | ------------------------- |
| **是否响应式**    | ❌ 非响应式（更像“容器”）               | ✅ 响应式（由 Proxy 包装，能触发视图更新） |
| **用途核心**     | 持久保存任意变量或 DOM，不触发渲染          | 创建响应式数据，触发视图更新            |
| **值的访问方式**   | `.current`                   | `.value`                  |
| **是否触发组件更新** | ❌ 修改 `.current` 不触发组件 render | ✅ 修改 `.value` 会触发响应式依赖更新  |
| **内部实现机制**   | 普通 JS 对象，不受 React 追踪         | Proxy 包装的对象，受 Vue 响应系统追踪  |
| **典型用途**     | DOM 引用、保存定时器/中间状态、闭包数据       | 定义组件内部响应式变量               |

---

## 16. react组件之间的通信
### 16.1 常见的方式
| 序号 | 通信方式                          | 适用场景                 | 是否推荐       |
| -- | ----------------------------- | -------------------- | ---------- |
| 1  | `props` 传递                    | 父组件 → 子组件（最基本）       | ✅ 强烈推荐     |
| 2  | 回调函数传递（props 中）               | 子组件 → 父组件            | ✅ 推荐       |
| 3  | `Context` 上下文                 | 多层级跨组件传递，全局配置等       | ✅ 推荐       |
| 4  | `useRef` + `forwardRef`       | 父组件直接访问子组件的内部方法或 DOM | ✅ 推荐（复杂场景） |
| 5  | 全局状态管理（如 Redux、Zustand、Jotai） | 大型项目中组件共享复杂状态        | ✅ 推荐       |
| 6  | URL 参数、Router 状态              | 页面跳转、通信依赖路由参数        | ✅ 推荐       |
| 7  | 自定义事件 / EventBus              | 跨组件不嵌套、松耦合通信（不推荐滥用）  | ⚠️ 仅限极端情况  |
### 16.2 典型示例
1. ref通信（父操作子）
```js
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    sayHi: () => alert('hi'),
  }));
  return <div>Child</div>;
});

function Parent() {
  const childRef = useRef();
  return (
    <>
      <Child ref={childRef} />
      <button onClick={() => childRef.current.sayHi()}>Call</button>
    </>
  );
}
```
2. Router参数通信
```js
<Route path="/detail/:id" element={<Detail />} />

function Detail() {
  const { id } = useParams();
  return <p>ID: {id}</p>;
}
```

---

## 17. react状态管理的几种方式
### 17.1 常见方式
| 状态管理方式                    | 状态作用域     | 特点总结                       | 是否推荐                     |
| ------------------------- | --------- | -------------------------- | ------------------------ |
| `useState` / `useReducer` | 单个组件内部    | 简单轻量、局部状态                  | ✅ 推荐                     |
| `props + 回调`              | 父子组件间     | 基础单向数据流，易理解                | ✅ 推荐                     |
| `Context` + `useContext`  | 多层嵌套组件共享  | 跨层传值简洁，但**整个上下文更新会引发重新渲染** | ✅ 推荐（注意优化）               |
| 第三方状态管理（Redux 等）          | 跨模块全局状态   | 强一致性、可追踪调试、插件生态好           | ✅ 推荐（中大型项目）              |
| 轻量状态库（Zustand、Jotai）      | 灵活（局部或全局） | API 简洁、性能优秀、Hooks 风格       | ✅ 推荐                     |
| URL 路由状态                  | 页面跳转相关状态  | 利于深链接、刷新保留状态、浏览器前进后退       | ✅ 推荐（配合 useSearchParams） |
| 本地持久化状态（localStorage）     | 跨会话数据     | 数据持久化，但不具响应性               | ✅ 常配合其它状态使用              |
| 服务端状态（如 SWR、React Query）  | 异步远程数据    | 专门管理 API 请求、缓存、自动重试        | ✅ 推荐（远程数据）               |

---

## 18. 自定义 Hook 的设计原则
### 18.1 什么是自定义Hook
自定义 Hook 是一个以 use 开头的函数，用于封装组件中可复用的状态逻辑、生命周期副作用或交互逻辑。
```js
function useXXX() {
  // 使用其他 Hook，比如 useState、useEffect
  return ...
}
```
### 18.2 设计原则
1. 必须以use开头
- React会根据函数名识别它是一个 Hook
- 如果不以 use 开头，eslint-plugin-react-hooks 会报错
- 这是 React 能正确跟踪 Hook 调用顺序的前提
2. 只能在最外层调用其他 Hook
- 自定义 Hook 内部可以调用 useState、useEffect 等，但必须在函数体顶层调用
- 不能在 if、for、回调中调用 Hook
- 遵循 React Hook 的“调用顺序一致”原则
3. 封装逻辑而非UI
- 自定义 Hook 应该专注于“逻辑”，而不是“渲染”
- 不要返回 JSX，而是返回数据、方法、状态
4. 支持可配置参数
- 将“易变部分”作为参数传入
### 18.3 设计原则表格
| 原则                  | 核心解释                                         |
| ------------------- | -------------------------------------------- |
| 1️⃣ 命名以 `use` 开头    | 遵循 React 规则，Hook 检测机制依赖于此命名                  |
| 2️⃣ 仅在函数组件/Hook 中调用 | 避免在循环、条件、普通函数中调用，确保调用顺序一致                    |
| 3️⃣ 封装单一职责          | 每个 Hook 只做一件事，便于组合与测试                        |
| 4️⃣ 参数控制 Hook 行为    | 将“变化点”通过参数注入，使 Hook 更通用                      |
| 5️⃣ 返回明确 API        | 返回对象结构明确（如 `{ data, loading, error }`），增强可读性 |
| 6️⃣ 内部可使用其它 Hook    | 允许嵌套调用 `useState`、`useEffect` 等内置 Hook       |
| 7️⃣ 避免副作用泄漏         | 用 `useEffect` 清理定时器、监听器等副作用，防止内存泄漏           |
| 8️⃣ 保持状态隔离          | 每次调用 Hook 时，状态是私有且不共享的                       |
| 9️⃣ 类型定义清晰（TS 项目）   | 对参数和返回值添加泛型支持和类型定义，提高代码可靠性                   |
| 🔟 高度可测试性           | 尽可能将副作用与逻辑分离，方便单元测试                          |

---

## 19. 如何在函数组件中模拟类组件生命周期
### 19.1 模拟对照表
| 类组件生命周期                    | 函数组件中模拟方式（Hook）              |
| -------------------------- | ---------------------------- |
| `constructor`              | `useRef` + 初始状态              |
| `componentDidMount`        | `useEffect(..., [])`         |
| `componentDidUpdate`       | `useEffect(..., [依赖])`       |
| `componentWillUnmount`     | `useEffect` 中 return 清理函数    |
| `shouldComponentUpdate`    | `React.memo` / 自定义 props 比较  |
| `getDerivedStateFromProps` | 手动在 `useEffect` 中监听 props    |
| `getSnapshotBeforeUpdate`  | `useLayoutEffect` + `useRef` |
### 19.2 示例代码
1. componentDidMount
```js
useEffect(() => {
  console.log('组件挂载完成');
}, []);
```
- 空依赖数组，表示只在初次渲染后执行一次
2. componentDidUpdate
```js
useEffect(() => {
  console.log('组件更新了 count');
}, [count]);
```
- 依赖 count，在 count 改变时执行，组件mount时也会执行一次
3. componentWillUnmount
```js
useEffect(() => {
  return () => {
    console.log('组件即将卸载');
  };
}, []);
```
- return 的函数在组件卸载时执行
4. 模拟componentDidMount + componentDidUpdate
```js
const isFirst = useRef(true);
useEffect(() => {
  if (isFirst.current) {
    isFirst.current = false;
    console.log('首次挂载');
  } else {
    console.log('更新阶段');
  }
}, [someProp]);
```
- useRef用来判断是否是第一次渲染
5. getSnapshotBeforeUpdate
```js
const prevHeight = useRef(0);
useLayoutEffect(() => {
  prevHeight.current = divRef.current.offsetHeight;
}, [someValue]);
```
- 在 DOM 更新前读取 DOM 状态。
### 19.3 清理函数的执行
1. 依赖项变化时
- 每次依赖项发生变化，React会先执行上一次的清理函数，再执行新的副作用函数。
2. 组件卸载时（unmount）
- 组件被销毁时，React 会自动调用最后一次的 清理函数，相当于 componentWillUnmount。

---

## 20. React里面Key的作用
### 20.1 总结
React 中的 key 是用于标识列表中元素身份的唯一标识，核心目的是提升虚拟 DOM 的 diff 效率。它帮助 React 精准判断哪些节点需要创建、更新或删除。我们推荐使用稳定、唯一的值（如数据 ID）作为 key，而不推荐使用数组下标，因为顺序变化时可能导致组件错误复用，进而引发 UI 闪烁或状态错乱问题。
### 20.2 为什么需要key
当使用map渲染一组元素时
```js
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```
如果没有 key，或所有元素的 key 都一样，React 在更新列表时只能按顺序比较每一项，一旦中间插入/删除某项，就可能导致错误复用和性能浪费。
### 20.3 有key和没key的区别
组件[A, B, C]更改为[B, C, D]
1. 有key
```js
key: A → 被删除  
key: D → 被添加  
key: B/C → 复用
```
2. 无key
```js
React 可能复用错位置：
- A → 变成 B（错误复用）
- B → 变成 C（错误复用）
- C → 变成 D（错误复用）
```
---


