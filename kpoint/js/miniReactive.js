/**
 * 实现一个mini响应式系统 
 */
let activeEffect = null; // 当前正在执行的副作用
let targetMap = new Map(); // 存储依赖关系：对象 -> 属性 -> effects 集合

/**
 * 依赖收集 
 */
const track = (target, key) => {
    if (!activeEffect) return

    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let deps = depsMap.get(key)
    if (!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }

    deps.add(activeEffect)
}

/**
 * 触发
 */
const trigger = (target, key) => {
    const depsMap = targetMap.get(target)
    if (!depsMap) return

    const deps = depsMap.get(key)
    if (!deps) return

    for (const effectFn of deps) {
        effectFn()
    }
}

function effect(fn) {
    activeEffect = fn;
    fn(); // 初次执行，进行依赖收集
    activeEffect = undefined;
}

function reactive(target) {
    return new Proxy(target, {
        get(obj, key, receiver) {
            track(obj, key)
            return Reflect.get(obj, key, receiver)
        },
        set(obj, key, value, receiver) {
            const result = Reflect.set(obj, key, value, receiver)
            trigger(obj, key)
            return result
        }
    });
}

const state = reactive({ count: 0 });

effect(() => {
    console.log('count is', state.count);
});

setInterval(() => {
    state.count++;
}, 3000);