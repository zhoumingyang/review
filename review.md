## 一、网络相关
详见：[网络相关](./kpoint/net.md)
1. HTTPS协议，为什么HTTPS更安全？
2. HTTP缓存
3. DNS解析涉及到的协议
4. 应用层的协议
5. UDP协议
6. TCP3次握手，为什么一定需要3次握手
7. 在浏览器输入url后发生了什么
8. HTTP 请求和SSE 请求区别
9. HTTP/2 解决 HTTP/1.1什么问题
10. 请求头中包含哪些重要信息？
11. 如何通过请求头实现跨域资源共享（CORS）
12. 讲一下token、session和cookie
13. xss和csrf的理解以及解决方案
14. 常见的HTTP状态码有哪些？分别表示什么含义？
15. 如何利用前端缓存机制优化性能
16. url的结构
17. 端口是干什么用的
18. 负载均衡是怎么做的
19. axios底层原理
20. HTTPS他是非对称加密还是对称加密

## 二、浏览器相关
详见：[浏览器相关](./kpoint/browser.md)
1. 浏览器渲染页面的过程
2. 重绘和回流(重排) 的区别，什么情况会触发它们
3. 浏览器渲染JS是怎么解析的
4. 宏任务和微任务
5. 浏览器事件循环机制
6. cookie、localStorage、sessionStorage的区别
7. 浏览器中的线程和进程
8. 浏览器中的垃圾回收机制

## 三、JavaScript相关
详见：[JavaScript 语言](./kpoint/language.md)
1. 模块规范
2. es module有哪些引入和导出方式
3. require() 和 import 的本质区别
4. require导出的值拷贝
5. 闭包
6. 如何使用闭包，如何避免内存泄露
7. 原型链
8. 继承实现方式
9.  instanceof的原理
10. isPrototypeOf 是什么
11. Object.create(null) 有原型链吗
12. new是怎么创建实例的
13. 数据类型及判断数据类型方法
14. 引用数据类型和值类型的区别
15. typeof 和 instanceof的区别
16. null和undefined的区别
17. typeof null是什么，为什么
18. 箭头函数和普通函数的区别
19. 为什么箭头函数不能new
20. this指向
21. 何改变this，call, apply, bind
22. window对象和document对象分别是什么
23. 事件监听的时候会有冒泡捕获阶段，在事件触发的时候，他的生命周期是怎么样的
24. 点一个按钮，它是先经历捕获还是先冒泡
25. 什么场景下会去监听一个捕获阶段的一个事件，addEventListener默认它就是监听一个冒泡阶段的一个事件是吧
26. 如何阻止事件默认行为和事件冒泡
27. 有没有哪些事件不会冒泡
28. let 和 const 的区别，let、const作用域的底层原理
29. JS的内存回收机制
30. setTimeout为什么会不准
31. defer和async有什么区别
32. async函数中如何捕获错误
33. fetch是宏任务还是微任务
34. 对TS泛型的理解
35. type和interface的区别
36. array的底层怎么实现的
37. Array.prototype.sort()怎么实现的？它是稳定的还是不稳定的？为什么不稳定
38. 深拷贝和浅拷贝
39. 函数式编程的理解和优缺点

## 四、vue框架相关
详见：[Vue 相关](./kpoint/vue.md)
1. Vue的更新过程
2. Vue2和Vue3区别
3. vue3的编译优化
4. ref和reactive区别
5. ref.value的原理
6. ref嵌套对象深度监听的代价和优化方案
7. vue的双向数据绑定原理（v-model）
8. vue组件间通信
9. 状态管理（Pinia）持久化怎么实现
10. Vuex和pinia解决什么问题？如果不用它们，该如何解决
11. vue里面的computed和watch有什么区别
12. vue中的effect是什么？如何实现一个简单的响应式系统
13. watch里的immediate方法
14. Vue router的常用模式有哪些，有什么区别，它们的实现原理
15. 动态路由传参有哪些方式
16. 路由守卫里三个入参，from，to，next
17. nextTick的作用
18. 如何实现v-for
19. 常用的vue指令
20. 自定义指令实现
21. 虚拟DOM和Diff算法
22. vue为何采用异步渲染
23. vue3的调度系统
24. vue2的option api 中为什么data要是一个函数，而不是直接是一个对象
25. vue2、vue3分别是怎么实现watch侦听的，两者的区别
26. v-if 和 v-show的区别
27. vue2和vue3侦听数据的区别
28. v-for的key是用来干啥的
29. vue如何实现懒加载

## 五、React 框架相关
详见：[React 相关](./kpoint/react.md)
1. react类组件和函数组件的区别
2. react函数组件有什么特性
3. react类组件的state
4. react的底层渲染原理
5. react fiber是什么
6. react的任务调度机制是怎么样的，它是实现中断、恢复、优先级控制的
7. React常用的Hooks
8. useEffect的底层是什么
9. useEffect和useLayoutEffect的区别
10. 为什么useEffect无法获取最新的dom元素
11. useRef和useState底层区别
12. useEffect能监听useRef的值发生改变吗
13. useContext 触发更新的条件
14. react的useRef和vue3的ref区别
15. react可执行中断渲染从底层怎么做到的
16. React调度怎么做的
17. useRef，useMemo跟useCallback,优缺点、使用场景
18. react状态管理的几种方式
19. react、vue的差别
20. React组件之间通信了解哪几个
21. React里面Key的作用是什么
22. useEffect的依赖数组陷阱与执行时机
23. Hook的调用顺序与闭包问题
24. 如何在函数组件中模拟类组件生命周期
25. memo化组件和useCallback 优化传参
26. 自定义 Hook 的设计原则
27. 什么是高阶组件

## 六、工程化相关
详见：[工程化相关](./kpoint/engineering.md)
1. Vite是什么，和webpack有什么区别
2. 前端模块化理解
3. Loader 和 Plugin 在 Webpack 中的作用有何不同？举例说明常见应用场景
4. Webpack 热更新（HMR）的实现原理，包括客户端和服务端的协作流程
5. webpack 如何将模块规范统一
6. 如何优化网页的加载性能
7. webpack构建流程

## 七、CSS相关
详见：[CSS相关](./kpoint/css.md)
1. css怎么去实现垂直居中
2. 讲一下flex布局
3. flex：1是什么含义
4. css的transition有多少个属性
5. BFC的作用及触发条件，使用场景讲一下。
6. less的特性，和css的区别，常用的less功能
7. sass是什么
8. 样式隔离，就是我们经常在写样式的时候，有什么方式去避免样式冲突
9. 如何保证网页页面适配多平台？(CSS:响应式布局,流式布局,媒体查询,第三方库等实现)
10. 了解CSS预处理器吗
11. 知道几种选择器，详细说说
12. css的优先级排序
13. CSS的盒模型

## 八、polyfill实现
详见：[polyfill相关](./kpoint/polyfill.md)
1. 防抖和节流
2. promise理解，3种状态以及实现
3. Promise.all实现
4. 判断两个object是否相等
5. 加载图片的函数 loadImage
6. 监听事件on和触发事件emit
7. sleep实现
8. 数组