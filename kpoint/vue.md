# vue相关知识点

## 1. Vue组件更新过程

✅ 一句话总结：Vue 3 的组件更新过程，是由响应式系统追踪依赖 → 数据变化触发更新 → 通过调度器异步合并任务 → 执行 render 函数生成新的虚拟 DOM → diff 并更新真实 DOM 的过程

### 完整流程
#### 组件初始挂载阶段
- 调用组件的 setup()，初始化响应式数据（如 ref()、reactive()）
- setup() 返回的响应式状态会绑定到组件实例上
- Vue 自动将 render() 函数包裹在一个 effect() 中（即响应式副作用函数）
- 首次执行 render()，生成虚拟 DOM（VNode）树
- Vue 使用 patch() 方法将 VNode 映射成真实 DOM，完成挂载
#### 数据变化后触发更新
- 更新了一个响应式变量，会触发 trigger()，告诉 Vue 响应式依赖有变动
#### 响应式系统通知调度器 queueJob
- 将组件的 update job 推入调度队列
- 队列去重：一个组件的更新只会被排入一次
- 使用 Promise.then() 形成微任务合并多次修改
#### 下一轮微任务执行更新（flushJobs）
- Vue 调用调度器 flushJobs()
- 执行组件的更新逻辑 → 重新调用 render() 函数
- 生成新的 VNode 树
#### 虚拟 DOM Diff & Patch
- 使用新的 VNode 和旧的 VNode 进行对比（diff）
- 找出变化的部分
- 通过 patch flag 精确控制更新粒度（优化点）
- 最终只更新真实 DOM 中发生变动的部分（高性能）
#### 更新完成后调用生命周期钩子
- onUpdated() 等钩子会在 DOM 更新完成后执行
#### 总结
在 Vue 3 中，组件更新过程由响应式系统驱动。数据变化时，Vue 会通过 trigger() 通知副作用函数（如 render）发生变化，并将组件更新任务推入微任务队列中。之后统一执行所有更新任务，重新执行 render 生成新的虚拟 DOM，通过 diff 算法对比新旧节点，并利用 patch flag 精确地更新变化的部分 DOM。整个过程是异步、高效、细粒度的，也是 Vue 3 性能提升的重要体现。

---

## 2. Vue2和Vue3区别
### 2.1 核心差异
- **vu2**：响应式是通过 Object.defineProperty 劫持属性，这种方式不能监听新增属性和数组索引变动，需要 Vue.set
- **vu3**：基于 Proxy 实现响应式系统，无需手动调用 set，也能监听数组下标、对象新增属性
### 2.2 性能提升
- **更小的体积**：Vue 3 使用 Tree-shaking 友好的模块化架构（ESM），每个功能都作为独立模块到处，按需引入，Vue2所有的API都挂载在Vue的全局实例上
- **更快的渲染速度**：编译优化 + 编译时静态提升，首次渲染和更新性能更好
- **更低的内存占用**：响应式系统和虚拟 DOM 更高效
### 2.3 开发体验
- **vu2**：选项式 API（data、methods、computed、watch）
- **vu3**：组合式 API（setup()），hooks风格
### 2.4 Fragment支持
- **vu2**：组件必须有一个根节点
- **vu3**：允许组件返回多个根节点（Fragment）
### 2.5 Suspense（异步组件加载优化）
- **vu3**：类似 React 的 Suspense，用于处理异步组件加载状态
### 2.6 Teleport（传送门）
- **vu3**：允许将子组件渲染到 DOM 树的任意位置，常用于弹窗、模态框
### 2.7 生命周期对比
- **vue2**：beforeCreate、Created、beforeMount、mounted、beforeUpdate、updated、beforeDestory、destoryed
- **vue3**：setup、onBeforeMount、onMounted、onBeforeUpdate、onUpdated、onBeforeUnmount、onUnmounted（组合式API）

---

## 3. vue3的编译优化
Vue 模板（template）最终会被编译成 render 函数
### 3.1 静态提升
把**模板中不会变的静态节点**在编译阶段提取为模块级常量，只在首次渲染时创建一次，后续复用，避免每次渲染都创建新的 vnode 对象  
Vue 3 编译器会静态分析每一个节点：  
- 没有绑定（如 :class、:style、v-if）的节点
- 没有动态内容（如插值 {{ }}）
- 没有自定义组件或事件监听器
#### Vue 3 编译器的“静态标记（PatchFlag）
| PatchFlag 名称 | 描述                  |
| -------------- | --------------------- |
| `TEXT`         | 动态文本节点          |
| `CLASS`        | 动态 class            |
| `STYLE`        | 动态 style            |
| `PROPS`        | 有动态 prop           |
| `NEED_PATCH`   | 需要 diff             |
| `HOISTED`      | 静态节点，不需要 diff |

---

## 4. ref和reactive区别
### 4.1 基本定义
| 特性     | `ref()`                    | `reactive()`                   |
| -------- | -------------------------- | ------------------------------ |
| 作用     | 包装一个值为响应式对象     | 将一个对象/数组转为响应式      |
| 参数类型 | 任意类型（基本类型或对象） | 只能是对象或数组               |
| 返回值   | 包含 `.value` 的对象       | 响应式的原始对象（代理 Proxy） |

### 4.2 核心区别对比
| 类型                                | `ref`                        | `reactive`                |
| ----------------------------------- | ---------------------------- | ------------------------- |
| 原始类型（string、number、boolean） | ✅ 推荐使用                   | ❌ 不支持（不会响应式）    |
| 对象/数组                           | ✅ 支持，但 `.value` 会包一层 | ✅ 更自然（无需 `.value`） |

### 4.3 类型推导 & 组合式 API 配合
- **基本类型**：使用 ref，如 ref(false)、ref(123)
- **复杂对象**：使用 reactive，避免 .value.xxx 的层级访问问题
- 组合式 API 中，经常会用 ref 来定义状态，然后搭配 computed、watch 使用。

### 4.4 reactive的局限性
- 不支持原始数据类型，仅支持对象
- 对reactive变量直接重新赋值会丢失响应性
- 直接结构赋值容易丢失响应性，配合toRefs使用，将reactive转换为ref对象

### 4.6 ref的两种用法
| 用法       | 场景                         | 示例                   | 是否响应式           |
| ---------- | ---------------------------- | ---------------------- | -------------------- |
| 响应式数据 | 响应式管理基本类型或引用类型 | `const count = ref(0)` | ✅ 是                 |
| 模板引用   | 获取 DOM 或子组件实例        | `<div ref="myDiv">`    | ❌ 否（默认非响应式） |
注意
- ref="xxx" 声明后，Vue 在组件渲染后（mounted）会自动将对应的 DOM 或子组件实例赋值给你定义的 ref 变量的 .value
- 它实际上不是响应式数据，只是在生命周期阶段赋值了一次

### 4.7 总结
| 维度       | `ref`                     | `reactive`            |
| ---------- | ------------------------- | --------------------- |
| 响应式原理 | `ref.value` 被 Proxy 代理 | 整个对象被 Proxy 代理 |
| 操作方式   | `.value` 读写             | 直接访问属性          |
| 模板中     | 自动解包 `.value`         | 正常使用              |
| 使用对象   | 包一层 `.value`           | 不需要                |
| 推荐用途   | 基本类型、函数返回值      | 表单数据、复杂结构    |

---

## 5. [ref.value的原理](https://juejin.cn/post/7378253430157295666)
ref中调用的是createRef(value, false)，在这个函数中，首先判断属性 __v_isRef 是否为 true，为 true 说明是 Ref 类型的值，直接返回；否则，返回的是 RefImpl 类的实例。  
RefImpl类中定义了get 函数和 set 函数。当我们对类实例的 value 属性取值和赋值时，就会触发这两个函数.  
在get函数中会执行trackRefValue，进行依赖收集  
在set函数中如果新值与旧值不同，则会触发新的赋值操作，执行toRective函数（非shadow及readonly情况下），并触发更新（triggerRefValue）  
如果set的值为一个对象，toRective会将其转换为Proxy对象

---

## 6. ref嵌套对象深度监听的代价和优化方案
1. 递归代理性能开销
- Vue 3 的 reactive 会在初始化时递归遍历对象所有嵌套字段
- 对于一个嵌套层级深或属性多的对象，每一层都创建一个 Proxy，这会
  - 增加内存占用
  - 降低初次创建性能
  - 不利于大型表单、复杂结构初始化（如后端返回的数据结构）
2. 无访问不等于无成本
- 即使你不访问深度嵌套的对象值，vue也会立即递归，将所有对象都转换为响应式
3. 优化方案
- 使用shadowRef，内部嵌套对象不会转换为Proxy，没有深度递归监听
- 使用markRaw标记为“永不响应式”
- 手动拆分成原始数据对象

---

## 7. vue的双向数据绑定原理
Vue3 的双向数据绑定本质是响应式系统 + v-model 指令的结合  
1. 响应式系统（Proxy 实现）
- Vue3 用 Proxy 代理数据对象，拦截 get/set 操作
- 读取数据时（get）收集依赖，写入数据时（set）触发依赖更新
- 这样数据变化会自动通知视图更新，视图操作（如输入框输入）也能自动同步到数据
2. v-model实现原理(defineModel)
- v-model的本质是单向数据流+事件绑定的“封装语法糖”
- 模板中写的“v-model=x”会被编译为：
  - :value="x"（或指定prop）
  - @input="x = $event"（或@update:x） 
- defineModel是一个便利宏。编译器将其展开为以下内容：
  - 一个名为 modelValue 的 prop（const props = defineProps(['modelValue'])），本地 ref 的值与其同步
  - 一个名为 update:modelValue 的事件（const emit = defineEmits(['update:modelValue'])），当本地 ref 的值发生变更时触发
  - model = computed({ get: () => props.modelValue, set: val => emit('update:modelValue', val) })，拿到的是一个 computed 双向绑定的变量

---

## 8. vue组件间的通信
### 8.1 父子组件通信
- 父传子 → props
- 子传父 → emit
- 双向绑定 → v-model / defineModel
### 8.2 祖先与后代组件通信
## 8.2 provide / inject
- **provide / inject** 用于祖先与后代组件通信，不需要逐层传递 props，适合跨层级共享数据。
- 祖先组件通过 `provide` 提供数据，后代组件通过 `inject` 注入数据。
- 如果 `provide` 提供的是响应式数据（如 ref），`inject` 拿到的也是响应式的。

| 概念       | 说明                                                           |
| ---------- | -------------------------------------------------------------- |
| `provide`  | 在祖先组件中定义数据，并通过字符串 key 提供给后代组件          |
| `inject`   | 在后代组件中通过相同的 key 接收该数据                          |
| 跨层级传递 | ✅ 不需要逐层传递 props                                         |
| 响应式支持 | ✅ `inject` 拿到的是响应式的值（如果 `provide` 提供的是 `ref`） |
### 8.3 兄弟组件通信
- 通过共同的父组件中转
- 全局事件总线（eBus.emit，eBus.on）
- 状态管理（Pinia）
### 8.4 父组件操纵子组件
- ref + expose

---

## 9. 状态管理（Pinia）持久化怎么实现
1. **使用社区插件 pinia-plugin-persistedstate**
```js
// store/index.ts 或 main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
```

2. **使用持久化（只需加一行 persist: true）**
```js
// store/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {},
  }),
  persist: true  // ✅ 启用持久化
})
```

3. **使用 localStorage 或 sessionStorage 自定义策略**

```js
persist: {
  enabled: true,
  strategies: [
    {
      storage: localStorage, // 默认是 localStorage
      key: 'user-store',     // 存储的 key 名
    }
  ]
}
```
---

## 10. Vuex和pinia解决什么问题？如果不用它们，该如何解决
### 10.1 解决什么问题？
1. 多个组件间共享状态变得困难
- 用户登录信息、购物车数量、权限列表等
- 页面 A 修改了数据，页面 B 需要感知
- 兄弟组件之间传值困难，不能靠 props/emit
2. 组件状态**“提不动”**了
- 有些状态需要提升到 App 根组件甚至外部文件
3. 状态逻辑需要更规范
- 状态、修改方法分离（避免混乱）
- 可预测、可调试（例如 Vuex 的 time travel debugging）
### 10.2 替换方案
- props / emits
  - 适用于父子组件通信（单层级）
  - 缺点：跨层级麻烦、容易“传着传着就乱了”
- eventBus
  - 优点：轻量快速
  - 缺点：缺乏状态，调试困难，事件丢失无状态记录
- provide / inject
  - 适合树状结构中的祖孙通信
  - 可手动传递 store-like 对象
- 组合式 API 自建 Store
  - 缺点：你需要手动处理状态持久化、模块划分、DevTools 等功能
```js
// userStore.js
import { reactive } from 'vue'

const state = reactive({
  token: '',
  userInfo: {}
})

export function useUserStore() {
  return {
    state,
    setToken(token) {
      state.token = token
    }
  }
}
```

---

## 11. vue里面的computed和watch
### 11.1 概念和使用场景区别
| 特性     | `computed`                       | `watch`                                  |
| -------- | -------------------------------- | ---------------------------------------- |
| 用途     | 计算属性（值派生）               | 监听值变化（执行副作用）                 |
| 返回值   | 一个响应式“值”（getter）         | 无返回值，只做动作（callback）           |
| 是否缓存 | ✅ 缓存（依赖不变不会重新计算）   | ❌ 不缓存，每次变化都触发                 |
| 适合场景 | 复杂模板表达式、多个字段组合计算 | 异步请求、手动控制逻辑、监听路由、节流等 |
| 触发时机 | 用到时才自动计算（lazy）         | 源数据变化就立即触发                     |
- **computed本质**：基于 effect 的懒执行、副作用追踪、带缓存的包装器
- **watch本质**：基于 effect 的副作用监听器，响应变化立即执行回调

---

## 12. effect是什么？如何实现一个简单的响应式系统？
### 12.1 effect的概念
- effect就是一个“响应式追踪器”，它会在执行函数时记录依赖，并在依赖变化时重新触发这个函数
- effect(fn) 会执行你传入的 fn，并把其中读取到的响应式数据“追踪”起来，当这些数据发生变化时，fn 会自动重新执行，达到自动更新的目的
- vue3内部就是用 effect 来实现：
 - computed：计算属性，懒执行的effect（只有访问.value时执行）
 - watch：副作用，手动注册的副作用函数，依赖变化触发
 - watchEffect：自动追踪依赖、立即执行
 - 模板渲染更新，renderEffect，依赖变化自动更新 UI
 - 响应式组件状态更新
### 12.2 [实现一个mini响应式系统](./js/miniReactive.js)

---

## 13. watch里的immediate方法
- watch默认绑定，页面首次加载时，是不会执行的。只有值发生改变才会执行，如果想立即执行，则设置immediate为true

---

## 14. Vue router的常用模式有哪些，有什么区别，它们的实现原理
### 14.1 常用模式
1. Hash模式
- URL 格式：http://example.com/#/path
- 特点：
  -  使用 URL 的 hash（#）来模拟完整的 URL
  -  改变 hash 不会重新加载页面
  -  兼容性好，支持所有浏览器（包括 IE9 及以下）
  -  每一次改变hash（window.location.hash），都会在浏览器的访问历史中增加一个记录
2. History模式
- URL 格式：http://example.com/path
- 特点：
  - 利用 HTML5 History API（pushState、replaceState 和 popstate 事件）
  - URL 看起来更自然，没有 #
  - 需要服务器端支持，否则刷新页面会出现 404
3. Abstract 模式
- 使用场景：
  - 非浏览器环境（如 Node.js、Electron、NativeScript 等）
  - 不依赖浏览器的 API
- 特点
  - 在所有环境下都能工作
  - 路由信息保存在内存中
4. 区别
| 路由模式        | URL 示例                    | 是否刷新页面 | 依赖后端配置 | 原理                     |
| --------------- | --------------------------- | ------------ | ------------ | ------------------------ |
| `hash` 模式     | `http://example.com/#/home` | ❌ 否         | ❌ 否         | 基于 URL hash (`#`) 实现 |
| `history` 模式  | `http://example.com/home`   | ❌ 否         | ✅ 是         | HTML5 History API        |
| `abstract` 模式 | 无 URL（用于 SSR 或 Node）  | ❌ 否         | ❌ 否         | 内存模拟                 |

### [14.2 原理](./js/miniRoute.js)
1. Hash模式
- 通过改变location.hash( 注：只改变url的hash值而不是url的主体部分，顾不会刷新页面、不会发送http请求)，然后由浏览器监听事件onhashchange事件来监听hash值的变化并触发绑定的回调函数，从而来展示不同的页面内容
1. history模式
- 通过history interface 新增的pushState、replaceState方法以及现有的go、back、forward方法来改变url（注：可以改变url的主体部分,顾在直接访问嵌套路由时，必须配有该路径所对应的资源否则会出现404的情况，但可以通过vue的redirect重定向到index页面或者404页面，来解决此问题）,然后通过window.popState事件 来监听url变化并执行对应的回调函数，从而来展示不同的页面内容

## 15. 动态路由传参有哪些方式
1. 基于路径的参数
- 形式
```js
// 定义路由
{
  path: '/user/:id',
  component: User
}
```
- 访问方式
```js
this.$route.params.id
```
- 配合 router-link
```html
<router-link :to="`/user/${userId}`">用户详情</router-link>
```
2. 基于查询字符串参数
- 形式：路径保持静态，通过 ?key=value 方式传参
```js
// 定义路由
{
  path: '/search',
  component: Search
}
```
- 访问方式
```js
/search?keyword=vue&page=2
this.$route.query.keyword  // → "vue"
this.$route.query.page     // → "2"
```
- 配合 router-link
```html
<router-link :to="{ path: '/search', query: { keyword: 'vue', page: 2 }}">搜索</router-link>
```
3. props配置（解耦参数 & 组件）
- 用法1：props: true（仅支持 params
```js
{
  path: '/user/:id',
  component: User,
  props: true
}
```
- 用法2：props: route => ({ ... })（支持 query 或复杂转换）
```js
{
  path: '/search',
  component: Search,
  props: route => ({ keyword: route.query.keyword })
}
```
### 对比  
| 方式   | 参数获取方式       | URL表现形式               | 刷新/分享支持 | 适用场景             |
| ------ | ------------------ | ------------------------- | ------------- | -------------------- |
| params | this.$route.params | /user/123                 | 支持          | 必须参数、层级结构   |
| query  | this.$route.query  | /user?id=123              | 支持          | 可选参数、筛选条件   |
| props  | 组件 props 接收    | /user/123 或 /user?id=123 | 支持          | 组件解耦             |
| meta   | this.$route.meta   | 不体现在 URL              | 不支持        | 权限、描述等附加信息 |

---

## 16. 路由守卫里的3个参数：from、to、next
```js
router.beforeEach((to, from, next) => {
  // ...
})
```
- to —— 即将要进入的路由对象，包含你将要导航到的目标路由信息，如路径、参数、组件等。
- from —— 当前导航正要离开的路由对象。
- next() —— 控制导航是否允许进行，必须调用 next() 才会进入下一个钩子或跳转到目标路由。
### next使用方式
| 用法                       | 含义                           |
| -------------------------- | ------------------------------ |
| `next()`                   | ✅ 允许跳转                     |
| `next(false)`              | ❌ 中断导航，停留在当前页面     |
| `next('/login')`           | 👉 重定向到指定路径             |
| `next({ path: '/login' })` | 👉 重定向到指定路径（对象形式） |

---

## 17. nextTick的作用
- 当你更改了响应式数据，Vue 会异步地更新 DOM。如果你需要在 DOM 更新完成后立即执行某些操作（比如读取或操作 DOM 元素），就需要用 nextTick。
- Vue 内部采用了微任务队列（如 Promise.then()）来实现
```js
function nextTick(cb) {
  Promise.resolve().then(cb)
}
```
---

## 18. 如何实现v-for
### 18.1 底层实现原理
- Vue 会在编译阶段将 v-for 编译成 循环渲染函数（renderList），并追踪每项的 key 以便高效复用 DOM 节点。

---

## 19. 常用的vue指令
| 指令名      | 作用                        | 示例                                                           |
| ----------- | --------------------------- | -------------------------------------------------------------- |
| `v-bind`    | 动态绑定属性或 prop         | `:href="url"` 等价于 `v-bind:href="url"`                       |
| `v-model`   | 双向绑定表单元素            | `<input v-model="text" />`                                     |
| `v-if`      | 条件渲染（不渲染则移除）    | `<div v-if="show">A</div>`                                     |
| `v-else-if` | 条件渲染的 else if 分支     | `<div v-else-if="other">B</div>`                               |
| `v-else`    | 条件渲染的 else 分支        | `<div v-else>C</div>`                                          |
| `v-show`    | 条件展示（控制 `display`）  | `<div v-show="isVisible">D</div>`                              |
| `v-for`     | 列表渲染                    | `<li v-for="item in list" :key="item.id">{{ item.name }}</li>` |
| `v-on`      | 监听事件                    | `@click="handle"` 等价于 `v-on:click="handle"`                 |
| `v-slot`    | 插槽分发（插槽具名/作用域） | `<template v-slot:header>`                                     |
| `v-pre`     | 跳过当前元素的编译          | `<div v-pre>{{ raw }}</div>`                                   |
| `v-cloak`   | 防止模板闪现                | `<div v-cloak>待编译内容</div>`                                |
| `v-once`    | 只渲染一次，后续不再更新    | `<div v-once>{{ text }}</div>`                                 |


## 20. 自定义指令实现
```js
// Vue 3 全局注册
const app = createApp(App)

app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})
```

```js
app.directive('color', {
  mounted(el, binding) {
    el.style.color = binding.value
  }
})
```

```js
app.directive('draggable', {
  mounted(el) {
    el.style.position = 'absolute'
    el.style.cursor = 'move'

    el.onmousedown = e => {
      const disX = e.clientX - el.offsetLeft
      const disY = e.clientY - el.offsetTop

      document.onmousemove = moveEvent => {
        el.style.left = moveEvent.clientX - disX + 'px'
        el.style.top = moveEvent.clientY - disY + 'px'
      }

      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
  unmounted(el) {
    el.onmousedown = null
  }
})
```

---

## 21. [虚拟DOM和Diff算法](https://juejin.cn/post/7010594233253888013)
### 21.1 虚拟DOM
- 虚拟 DOM 简单说就是 用JS对象来模拟 DOM 结构
```js
{
  tag:'div',
  props:{ id:'app', class:'container' },
  children: [
    { tag: 'h1', children:'沐华' }
  ]
}
```
- **tag**：必选。是标签,也可以是组件，或者函数
- **props**：非必选。就是这个标签上的属性和方法（id、class等）
- **children**：非必选。标签的内容或者子节点，如果是文本节点就是字符串，如果有子节点就是数组
### 21.2 为什么要使用虚拟DOM
原生 DOM 有非常多的属性和事件，就算是创建一个空div也要付出不小的代价。而使用虚拟 DOM 来提升性能的点在于 DOM 发生变化的时候，通过 diff 算法和数据改变前的 DOM 对比，计算出需要更改的 DOM，然后只对变化的 DOM 进行操作，而不是更新整个视图。
### 21.3 diff算法
- 概念： diff算法在vue里叫做**patch**，通过新旧虚拟 DOM 对比，找出最小变化的地方转为进行 DOM 操作  
- 首次渲染： 在页面**首次渲染**的时候会调用一次 patch 并创建新的 vnode，不会进行更深层次的比较。  
- 数据变化： 在组件中**数据发生变化**时，会触发 setter 然后通过 Notify 通知 Watcher，对应的 Watcher 会通知更新并执行更新函数，它会执行 render 函数获取新的虚拟 DOM，然后执行 patch 对比上次渲染结果的老的虚拟 DOM，并计算出最小的变化，然后再去根据这个最小的变化去更新真实的 DOM
#### diff算法优化
1. 只比较同一层级，不跨级比较。diff 过程只会把vnode树同一层级的 DOM 进行比较
2. 比较标签名。同一层级的同一位置的标签名不同，就直接移除老的虚拟 DOM 对应的节点，不继续按这个树状结构做深度比较
3. 比较key。标签名相同，key 也相同，就会认为是相同节点，也不继续按这个树状结构做深度比较
4. key的作用：
  - 为高效更新虚拟DOM，它可以非常精确的找到相同节点，因此 patch 过程会非常高效
  - vue 在 patch 过程中会判断两个节点是不是相同节点时，key 是一个必要条件
  - Vue 判断两个节点是否相同时主要判断两者的元素类型和 key 等，如果不设置 key，就可能永远认为这两个是相同节点，只能去做更新操作，就造成大量不必要的 DOM 更新操作
#### vue2源码解析
```js
// 判读vnode是否相同
function sameVnode (a, b) {
  return (
    a.key === b.key &&  // key 是不是一样
    a.asyncFactory === b.asyncFactory && ( // 是不是异步组件
      (
        a.tag === b.tag && // 标签是不是一样
        a.isComment === b.isComment && // 是不是注释节点
        isDef(a.data) === isDef(b.data) && // 内容数据是不是一样
        sameInputType(a, b) // 判断 input 的 type 是不是一样
      ) || (
        isTrue(a.isAsyncPlaceholder) && // 判断区分异步组件的占位符否存在
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```
#### vue3 diff的优化
- 事件缓存：将事件缓存，可以理解为变成静态的了
- 添加静态标记：Vue2 是全量 Diff，Vue3 是静态标记 + 非全量 Diff
- 静态提升：创建静态节点时保存，后续直接复用
- 使用最长递增子序列优化了对比流程：Vue2 里在 updateChildren() 函数里对比变更，在 Vue3 里这一块的逻辑主要在 patchKeyedChildren() 函数里
1. 事件缓存
```js
<button @click="handleClick">按钮</button>
```
编译后
```js
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => (_ctx.handleClick && _ctx.handleClick(...args)))
  }, "按钮"))
}
```
onClick 会先读取缓存，如果缓存没有的话，就把传入的事件存到缓存里，可以理解为变成静态节点了
2. 静态标记
```js
export const enum PatchFlags {
  TEXT = 1 ,  // 动态文本节点
  CLASS = 1 << 1,  // 2   动态class
  STYLE = 1 << 2,  // 4   动态style
  PROPS = 1 << 3,  // 8   除去class/style以外的动态属性
  FULL_PROPS = 1 << 4,       // 16  有动态key属性的节点，当key改变时，需进行完整的diff比较
  HYDRATE_EVENTS = 1 << 5,   // 32  有监听事件的节点
  STABLE_FRAGMENT = 1 << 6,  // 64  一个不会改变子节点顺序的fragment (一个组件内多个根元素就会用fragment包裹)
  KEYED_FRAGMENT = 1 << 7,   // 128 带有key属性的fragment或部分子节点有key
  UNKEYEN_FRAGMENT = 1 << 8, // 256  子节点没有key的fragment
  NEED_PATCH = 1 << 9,       // 512  一个节点只会进行非props比较
  DYNAMIC_SLOTS = 1 << 10,   // 1024   动态slot
  HOISTED = -1,  // 静态节点 
  BAIL = -2      // 表示 Diff 过程中不需要优化
}
```
```js
<div id="app">
    <div>沐华</div>
    <p>{{ age }}</p>
</div>
```
编译后
```js
const _hoisted_1 = { id: "app" }
const _hoisted_2 = /*#__PURE__*/_createElementVNode("div", null, "沐华", -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _hoisted_2,
    _createElementVNode("p", null, _toDisplayString(_ctx.age), 1 /* TEXT */)
  ]))
}
```
其中-1就是静态节点，1则为动态文本节点，patch过程会跳过静态节点
3. 静态提升
Vue3 中会把这个不参与更新的元素保存起来，只创建一次，之后在每次渲染的时候不停地复用，例如_hoisted_2仅创建一次，之后仅复用
4. vue3中的patchkeyedChildren
- 头和头比较
- 尾和尾比较
- 基于最长递增子序列进行移动/添加/删除
- 例如：
  -  老的 children：[ a, b, c, d, e, f, g ]
  -  新的 children：[ a, b, f, c, d, e, h, g ]
  -  先进行头和头比，发现不同就结束循环，得到 [ a, b ]
  -  再进行尾和尾比，发现不同就结束循环，得到 [ g ]
  -  再保存没有比较过的节点 [ f, c, d, e, h ]，并通过 newIndexToOldIndexMap 拿到在数组里对应的下标，生成数组 [ 5, 2, 3, 4, -1 ]，-1 是老数组里没有的就说明是新增
  -  然后再拿取出数组里的最长递增子序列，也就是 [ 2, 3, 4 ] 对应的节点 [ c, d, e ]
  -  然后只需要把其他剩余的节点，基于 [ c, d, e ] 的位置进行移动/新增/删除就可以
  -  在新的顺序中，最长递增子序列表示：这些节点在旧 DOM 中的位置是顺序递增的，因此它们无需移动，其余节点则需要“插入”或“移动”，这样可以最小化 DOM 操作次数

--- 

## 21. vue为何要采用异步渲染
Vue在更新DOM时是异步执行的，只要侦听到数据变化，Vue将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更，如果同一个watcher被多次触发，只会被推入到队列中一次，这种在缓冲时去除重复数据对于避免不必要的计算和DOM操作是非常重要的，然后，在下一个的事件循环tick中，Vue刷新队列并执行实际(已去重的)工作，Vue在内部对异步队列尝试使用原生的Promise.then、MutationObserver和setImmediate，如果执行环境不支持，则会采用setTimeout(fn, 0)代替  
Vue采用异步渲染（也称为异步更新 / 异步 DOM 更新），主要是为了性能优化和避免重复渲染。这个设计背后的核心思想是：批量合并多次数据变更，只执行一次 DOM 更新  
### 提高性能，减少 DOM 操作次数
- DOM 是性能瓶颈。多次修改数据会导致多次 render → patch → DOM，若同步执行，性能极差
- Vue 会把多次数据变更收集起来，然后在 同一个事件循环的“下一个微任务”中统一执行更新，从而避免频繁地触发 DOM 更新
- 避免重复渲染，防止状态抖动。同步渲染可能在某些场景下造成“前一帧刚更新完，又被下一次覆盖”，最终渲染是无意义的，但资源已浪费。异步队列策略避免了这种“状态抖动
- 保持视图与数据一致性。Vue 保证一个“tick”内数据变更只会更新一次视图，避免中间态显示，从而提升一致性体验
### Vue 的异步渲染过程
- 响应式数据变化时，触发 watcher.update()，将当前组件的更新任务 加入异步更新队列（queue
- Vue 内部通过 nextTick() 把 DOM 更新任务放到 微任务队列中
- 等当前同步代码执行完后，统一执行队列里的 patch 操作

---

## 22. [vue3的调度系统](https://juejin.cn/post/7055848604933554207)
vue利用调度算法，保证 Vue 组件渲染过程的正确性以及 API 的执行顺序的正确性
1. vue调度算法使用了3个队列
- 组件DOM更新前队列（pre队列），执行组件 DOM 更新之前的任务，先进先出，queuePreFlushCb，执行watch的回调函数
- 组件DOM更新队列（组件异步更新队列），执行组件 DOM 更新，允许插队，按 id 从小到大执行，queueJob，执行组件DOM更新
- 组件DOM更新后队列（post队列），执行组件 DOM 更新之后的任务，允许插队，按 id 从小到大执行，queuePostFlushCb，执行update的回调函数
- 队列会在当前浏览器任务的所有 js 代码执行完成后,才开始依次执行 Pre 队列、queue 列、Post 队列
2. 组件的DOM更新
- 实际上是调用 instance.update 函数，该函数会对比组件 data 更新前的 VNode 和组件 data 更新后的 VNode，对比之间的差异，修改差异部分的 DOM。该过程叫 **patch**，比较 vnode 的方法叫 **diff 算法**
- instance 是指 Vue 内部的组件实例
- instance.update是深度更新，即除了会更新组件本身，还会递归调用子组件的 instance.update ，因此，这个过程会更新整个组件树
- 响应式数据更新并不是组件DOM更新，而是执行queueJob(instance.update)，将组件任务加入到队列，数据是立即更改，但组件渲染回延后
3. 队列的优先级控制
- 父组件优先级高于子组件，必须先更新父组件，才能更新子组件，因为父组件可能会传参给子组件（作为子组件的属性）。
- 新加入的job的jobId大于队列最后一个id，则添加在队列尾部，否则利用二分查找添加到正确的位置。
4. Post 队列的优先级机制
- mounted、updated 等生命周期，它们有个共同特点，就是需要等 DOM 更新后，再执行
- watchPostEffect API，用户手动设置 watch 回调在 DOM 更新之后执行
- 必须要在用户编写的回调函数执行前，把模板引用的值更新
5. 失效任务
- 当组件被卸载（unmounted）时，其对应的 Job 会失效，因为不需要再更新该组件了。失效的任务，在取出队列时，不会被执行。
6. 删除任务
- 在父组件深度更新完成之后，不需要再重复更新子组件，更新前，需要将组件的 Job 从队列中删除
7. job递归
-  Job 在更新组件 DOM 的过程中，依赖的响应式变量发生变化，又调用 queueJob 把自身的 Job 加入到队列中