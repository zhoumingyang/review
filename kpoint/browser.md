# 浏览器相关知识点

## 1. 浏览器渲染页面的过程
### 1.1 总体流程
1. DNS 解析
2. 建立 TCP 连接（含 TLS）
3. 发送 HTTP 请求
4. 接收 HTTP 响应（HTML、CSS、JS 等）
5. 渲染流程（核心）：
   - HTML 解析 → 构建 DOM 树
   - CSS 解析 → 构建 CSSOM 树
   - DOM + CSSOM → 合成 Render Tree
   - 布局（Layout）：计算元素尺寸和位置
   - 分层、分块（Layer/Tile）
   - 绘制（Paint）：绘制每个节点
   - 合成（Composite）：合成图层并显示在屏幕上
### 2.1 重点阶段详解
1. 解析阶段
- DOM 树构建
  - 浏览器解析 HTML 生成 DOM Tree
  - 遇到标签、属性、注释等逐个构建节点
  - document.write、script 标签会阻塞 DOM 构建
- CSSOM 树构建
  - 浏览器解析所有 CSS 样式（包括 style、外部 CSS、行内）
  - 生成 CSSOM（样式规则树）
2. 渲染树生成（Render Tree
- 将 DOM 节点与对应的 CSSOM 样式合并
- 不包括 display: none 的节点
- 得出每个可见元素的最终样式
3. 布局（Layout，也叫 Reflow）
- 根据 Render Tree 计算每个元素的几何信息（宽高、位置）
- 相对定位、嵌套布局都在此阶段确定位置
4. 分层 + 分块（Layer + Tile）
- 复杂节点会被单独分层（如 3D、动画、Transform、Fixed 元素）
- 每层会被切成多个小块（Tile）
5. 绘制（Paint）
- 将每个 Render Tree 节点“绘制”成实际像素（如背景、文本、边框）
- 各个图层在 GPU 中被渲染成位图（Rasterize）
6. 合成（Composite）
- 将各个图层按照正确的顺序、位置进行叠加
- 最终显示在屏幕上
### 2.2 总结
浏览器渲染过程主要分为：解析 HTML 构建 DOM 树，解析 CSS 构建 CSSOM，然后合并为渲染树（Render Tree），再进行布局计算元素位置，接着绘制每个节点并进行图层合成，最后显示在屏幕上。整个过程涉及 DOM、CSSOM、Layout、Paint 和 Composite，每个阶段都有性能优化的切入点，比如避免频繁 Reflow、减少不必要重绘、开启 GPU 合成层等。

---

## 2. 重绘和回流(重排) 的区别，什么情况会触发它们

### 2.1 核心概念：重排（Reflow）和重绘（Repaint）
| 概念                    | 描述                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **回流（重排 Reflow）** | 当元素的**几何属性**（尺寸、位置）发生变化，浏览器重新计算布局，涉及 Render Tree 的布局过程      |
| **重绘（Repaint）**     | 当元素**外观样式**发生变化（如颜色、背景、字体），但**几何属性不变**，浏览器会重新绘制元素的外观 |

### 2.2 区别总结
| 对比点           | 回流（Reflow）                       | 重绘（Repaint）                  |
| ---------------- | ------------------------------------ | -------------------------------- |
| 涉及内容         | 布局计算 + 渲染树更新                | 只影响样式或外观像素             |
| 性能开销         | ❗ 高（可能引发整页回流）             | 中等                             |
| 是否一定触发重绘 | ✅ 是                                 | ❌ 否（不会引起回流）             |
| 是否影响兄弟元素 | ✅ 可能影响（布局级联）               | ❌ 不影响                         |
| 举例             | 改变 `width`、`font-size`、`display` | 改变 `color`、`background-color` |

### 2.3 常见触发 Reflow 的操作
1. 修改布局相关样式
- width, height, padding, margin, border
- font-size, line-height
- display, position, top/left/right/bottom
2. DOM 操作
- 插入/删除节点：appendChild, removeChild
- 修改结构或属性：innerHTML, className, style.width = '100px'
3. 强制同步计算样式或布局
- element.offsetTop
- element.offsetHeight
- getComputedStyle(element).width

---

## 3. 浏览器渲染JS是怎么解析的
### 3.1 整体流程
- 浏览器解析 HTML，遇到script标签
- 下载 JS（如果是外部文件）
- 由 JS 引擎进行解析（语法分析）生成 AST
- 编译器将 AST 编译为字节码 / 中间代码
- 执行器执行字节码（必要时触发优化）
### 3.2 详细分阶段解释
1. 下载（HTML 解析阶段）
- 遇到script标签会阻塞 HTML 的解析
- 如果是外部脚本script src="..."，会发起请求获取 JS 文件
- 如果有 async 或 defer 属性，下载和执行行为会不同
2. 解析（Parse）
- 由 JS 引擎（如 V8）进行词法分析和语法分析
- 生成 抽象语法树（AST）
### 3.3 编译（Compile）
- V8 使用 即时编译（JIT）技术，即边编译边执行
- 会将 AST 编译成字节码（Bytecode）
- 热代码可能会被进一步优化成机器码（TurboFan 优化器）
### 执行（Execute）
- JS 引擎的解释器负责逐行执行字节码
- 遇到热路径（重复执行的代码）时，优化器会触发优化

---

## 4. 宏任务和微任务
### 4.1 总结
宏任务（Macro Task）和微任务（Micro Task）是 JavaScript 执行异步代码时调度任务的两类队列，它们共同构成了事件循环（Event Loop）机制的核心
### 4.2 概念
| 类型   | 示例代码                                                                        | 执行时机                                       |
| ------ | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| 宏任务 | `setTimeout`, `setInterval`, `setImmediate`, `MessageChannel`, 整个 script 脚本 | 每轮事件循环开始时从宏任务队列取出一个任务执行 |
| 微任务 | `Promise.then`, `MutationObserver`, `queueMicrotask`                            | 当前宏任务执行完后立即执行微任务队列           |
### 4.3 执行顺序：事件循环流程
```js
执行一个宏任务（如 script）：
    → 执行过程中产生微任务（Promise.then）
        → 微任务队列清空
    → 执行下一个宏任务
```
```js
console.log('start')

setTimeout(() => {
  console.log('timeout')
}, 0)

Promise.resolve().then(() => {
  console.log('promise1')
}).then(() => {
  console.log('promise2')
})

console.log('end')

// 输出
// start
// end
// promise1
// promise2
// timeout
```
### 4.4 区别
| 对比项   | 微任务（Micro Task）            | 宏任务（Macro Task）   |
| ----- | -------------------------- | ----------------- |
| 执行时机  | 每个宏任务执行完后，立即执行所有微任务        | 每轮事件循环处理一个宏任务     |
| 优先级   | 高（会先于宏任务执行）                | 低                 |
| 是否可嵌套 | ✅ 微任务中可添加更多微任务             | ✅ 宏任务中也可继续添加任务    |
| 应用场景  | `Promise.then()` 逻辑处理、状态更新 | 定时器、UI 渲染、网络请求回调等 |

---

## 5. 浏览器事件循环机制 
### 5.1 概念
浏览器事件循环机制（Event Loop）是 JavaScript 处理异步任务和调度执行顺序的核心机制，它确保 JS 在单线程模型下高效执行
### 5.1 为什么需要事件循环
JavaScript 是单线程语言，为了不阻塞 UI 渲染，异步任务（如 DOM 事件、AJAX、定时器等）必须排队等待执行，而不是立刻执行，事件循环机制就是调度这些任务的系统，让它们在合适的时机进入执行栈
### 5.2 事件循环基本概念
| 组成部分                  | 说明                                                   |
| --------------------- | ---------------------------------------------------- |
| **调用栈（Call Stack）**   | JS 同步代码执行的主线程                                        |
| **任务队列（Task Queue）**  | 存放异步回调任务的地方                                          |
| **宏任务队列（Macro Task）** | 如 `setTimeout`、`setInterval`、`script`                |
| **微任务队列（Micro Task）** | 如 `Promise.then`、`MutationObserver`、`queueMicrotask` |
| **事件循环（Event Loop）**  | 一种循环机制：取任务 → 执行 → 取任务...                             |
### 5.3 事件循环执行流程
1. 执行一个宏任务（如 script 脚本）
2. 执行过程中产生的微任务推入微任务队列
3. 当前宏任务执行完 → 立即执行所有微任务
4. 执行完微任务 → 浏览器尝试渲染页面
5. 开始下一个宏任务
6. 重复步骤 1~5
### 5.4 浏览器任务队列结构
```txt
[ Call Stack ]           => JS 执行栈（每次只执行一个任务）

[ Macro Task Queue ]     => 宏任务队列（script、setTimeout、事件）
    ⬇ 事件循环主线程从此队列取任务执行

[ Micro Task Queue ]     => 微任务队列（Promise.then、MutationObserver）
    ⬆ 每次宏任务执行完后立即清空此队列
```
### 5.5 浏览器每帧渲染配合事件循环的节奏
1. 执行宏任务（比如事件、定时器）
2. 清空微任务队列
3. 执行 UI 渲染（layout → paint → composite）
4. 进入下一轮事件循环