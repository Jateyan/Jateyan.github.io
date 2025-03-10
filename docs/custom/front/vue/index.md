# Vue3 高级开发工程师面试知识点大纲

## 1. Vue3 核心概念

### 1.1 响应式系统

- **Proxy 与 Reactive 原理**

  <details>
  <summary>Proxy 与 Reactive 原理详解</summary>

  Vue3 的响应式系统基于 ES6 的 Proxy 实现。

  **1. Proxy 基本原理**
  ```js
  // 基础的响应式实现
  function reactive(target) {
    return new Proxy(target, {
      get(target, key, receiver) {
        // 依赖收集
        track(target, key)
        const res = Reflect.get(target, key, receiver)
        return isObject(res) ? reactive(res) : res
      },
      set(target, key, value, receiver) {
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)
        // 触发更新
        if(hasChanged(value, oldValue)) {
          trigger(target, key)
        }
        return result
      }
    })
  }
  ```

  **2. Reactive API 实现**
  ```js
  // reactive 对象的实现
  const reactiveMap = new WeakMap()

  function reactive(target) {
    // 非对象直接返回
    if(!isObject(target)) return target
    
    // 防止重复代理
    const existingProxy = reactiveMap.get(target)
    if(existingProxy) return existingProxy

    const proxy = new Proxy(target, {
      // handler 实现...
    })
    
    reactiveMap.set(target, proxy)
    return proxy
  }
  ```
  </details>

- **ref/reactive/toRef/toRefs 的区别与使用**

  <details>
  <summary>响应式 API 详解</summary>

  **1. ref**
  ```js
  // 用于基本类型的响应式
  const count = ref(0)
  console.log(count.value) // 0

  // 包装对象类型
  const obj = ref({ count: 0 })
  console.log(obj.value.count) // 0
  ```

  **2. reactive**
  ```js
  // 用于对象的响应式
  const state = reactive({
    count: 0,
    list: []
  })
  console.log(state.count) // 直接访问，无需.value
  ```

  **3. toRef**
  ```js
  const state = reactive({
    foo: 1,
    bar: 2
  })
  // 为源响应式对象上的属性新创建一个ref
  const fooRef = toRef(state, 'foo')
  
  // 保持引用关系
  state.foo++
  console.log(fooRef.value) // 2
  ```

  **4. toRefs**
  ```js
  const state = reactive({
    foo: 1,
    bar: 2
  })
  // 将响应式对象转换为普通对象，其中每个属性都是指向源对象相应属性的ref
  const stateRefs = toRefs(state)
  
  // 解构不会丢失响应性
  const { foo, bar } = stateRefs
  ```
  </details>

- **响应式数据的实现原理**

  <details>
  <summary>响应式系统实现原理详解</summary>

  **1. 依赖收集**
  ```js
  // 当前活跃的effect
  let activeEffect
  // 存储依赖关系
  const targetMap = new WeakMap()

  function track(target, key) {
    if(!activeEffect) return
    let depsMap = targetMap.get(target)
    if(!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if(!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
  }
  ```

  **2. 触发更新**
  ```js
  function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if(!depsMap) return
    
    const dep = depsMap.get(key)
    if(dep) {
      dep.forEach(effect => {
        effect()
      })
    }
  }
  ```
  </details>

- **响应式系统的优化**

  <details>
  <summary>性能优化策略详解</summary>

  **1. 懒收集**
  ```js
  // 只有在真正访问时才收集依赖
  function reactive(target) {
    return new Proxy(target, {
      get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver)
        // 访问时才收集依赖
        track(target, key)
        return res
      }
    })
  }
  ```

  **2. 缓存代理对象**
  ```js
  const proxyMap = new WeakMap()

  function reactive(target) {
    // 已代理的对象直接返回
    const existingProxy = proxyMap.get(target)
    if(existingProxy) {
      return existingProxy
    }
    
    const proxy = new Proxy(target, handler)
    proxyMap.set(target, proxy)
    return proxy
  }
  ```
  </details>

- **响应式陷阱及规避方案**

  <details>
  <summary>常见陷阱与解决方案</summary>

  **1. 解构丢失响应性**
  ```js
  const state = reactive({ count: 0 })
  
  // ❌ 错误用法：解构后丢失响应性
  const { count } = state
  
  // ✅ 正确用法：使用toRefs保持响应性
  const { count } = toRefs(state)
  ```

  **2. 数组索引的响应性**
  ```js
  const list = reactive([1, 2, 3])
  
  // ❌ 可能不会触发更新
  list[0] = 4
  
  // ✅ 使用数组方法
  list.splice(0, 1, 4)
  ```

  **3. 新属性添加**
  ```js
  const state = reactive({})
  
  // ❌ 新属性不具有响应性
  state.newProp = 1
  
  // ✅ 使用Object.assign或展开运算符
  Object.assign(state, { newProp: 1 })
  ```
  </details>

### 1.2 组合式 API

- **setup 函数的使用**

  <details>
  <summary>setup 函数详解</summary>

  ```vue
  <script>
  export default {
    setup(props, context) {
      // props 是响应式的，不能解构
      console.log(props)
      
      // context 包含 attrs, slots, emit
      const { attrs, slots, emit } = context
      
      // 定义响应式数据
      const count = ref(0)
      
      // 定义方法
      function increment() {
        count.value++
      }
      
      // 返回模板中可用的数据和方法
      return {
        count,
        increment
      }
    }
  }
  </script>
  ```
  **注意事项：**
  1. setup 函数在组件创建之前执行
  2. 不能使用 this，因为此时组件实例还未创建
  3. 返回的对象会暴露给模板和组件实例
  </details>

- **生命周期钩子**

  <details>
  <summary>组合式 API 生命周期</summary>

  ```vue
  <script>
  import { onMounted, onUpdated, onUnmounted } from 'vue'

  export default {
    setup() {
      onMounted(() => {
        console.log('组件挂载')
      })
      
      onUpdated(() => {
        console.log('组件更新')
      })
      
      onUnmounted(() => {
        console.log('组件卸载')
      })
    }
  }
  </script>
  ```
  **生命周期对应关系：**
  - beforeCreate -> 使用 setup()
  - created -> 使用 setup()
  - beforeMount -> onBeforeMount
  - mounted -> onMounted
  - beforeUpdate -> onBeforeUpdate
  - updated -> onUpdated
  - beforeUnmount -> onBeforeUnmount
  - unmounted -> onUnmounted
  </details>

- **组合式函数(Composables)开发**

  <details>
  <summary>自定义组合式函数</summary>

  ```js
  // useCounter.js
  import { ref, computed } from 'vue'

  export function useCounter() {
    const count = ref(0)
    
    const double = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    function decrement() {
      count.value--
    }
    
    return {
      count,
      double,
      increment,
      decrement
    }
  }
  
  // 在组件中使用
  <script setup>
  import { useCounter } from './useCounter'
  
  const { count, double, increment } = useCounter()
  </script>
  ```
  **最佳实践：**
  1. 以 use 开头命名组合式函数
  2. 保持单一职责原则
  3. 返回响应式数据和方法
  </details>

- **Script Setup 语法糖**

  <details>
  <summary>Script Setup 使用指南</summary>

  ```vue
  <script setup>
  // 自动暴露顶层变量
  const msg = 'Hello Vue3!'
  
  // 自动注册组件
  import MyComponent from './MyComponent.vue'
  
  // 自动注册 props
  const props = defineProps({
    title: String
  })
  
  // 自动注册 emit
  const emit = defineEmits(['change'])
  
  // 自动注册 slots
  const slots = useSlots()
  
  // 自动注册 attrs
  const attrs = useAttrs()
  </script>
  ```
  **特性：**
  1. 更简洁的语法
  2. 更好的类型推断
  3. 更好的 IDE 支持
  4. 自动暴露顶层变量
  </details>

- **与 Options API 的对比**

  <details>
  <summary>组合式 API vs Options API</summary>

  | 特性 | 组合式 API | Options API |
  |------|------------|-------------|
  | 代码组织 | 按逻辑功能组织 | 按选项类型组织 |
  | 复用性 | 高度可复用 | 复用性有限 |
  | 类型支持 | 更好的 TypeScript 支持 | 支持有限 |
  | 学习曲线 | 较高 | 较低 |
  | 适用场景 | 复杂组件 | 简单组件 |
  
  **选择建议：**
  1. 新项目建议使用组合式 API
  2. 大型项目建议使用组合式 API
  3. 简单组件可以使用 Options API
  </details>

### 1.3 模板编译
- 模板编译原理
- 静态提升优化
- Block Tree 优化
- 动态节点收集
- 编译时优化策略

## 2. 状态管理

### 2.1 Pinia
- Store 的定义与使用
- Actions/State/Getters
- 持久化存储
- 模块化管理
- 与 Vuex 的对比

### 2.2 状态管理最佳实践
- 大型应用的状态管理策略
- 状态分割与组织
- 性能优化考虑
- 开发规范与约束

## 3. 性能优化

### 3.1 渲染优化
- 虚拟 DOM 优化
- 异步组件
- Suspense 组件应用
- Keep-alive 缓存
- 动态组件优化

### 3.2 构建优化
- Vite 构建配置
- Tree-shaking
- 代码分割
- 资源压缩
- 打包策略

## 4. 工程化实践

### 4.1 开发规范
- TypeScript 集成
- ESLint 配置
- 代码规范
- Git 工作流
- 单元测试

### 4.2 项目架构
- 模块化设计
- 路由设计
- 权限管理
- 微前端实践
- 组件设计原则

## 5. 高级特性

### 5.1 自定义指令
- 指令的生命周期
- 指令参数与修饰符
- 复杂指令开发
- 实际应用场景

### 5.2 插件开发
- 插件注册机制
- 全局功能扩展
- 自定义插件开发
- 插件设计原则

## 6. 生态系统集成

### 6.1 路由
- Vue Router 4.x
- 路由守卫
- 动态路由
- 路由元信息
- 导航解析流程

### 6.2 工具链
- Vite 特性与优势
- 开发环境优化
- 构建工具选择
- 部署策略

## 7. 服务端渲染

### 7.1 SSR
- Nuxt.js 3.0
- SSR 原理
- 同构应用开发
- 性能优化
- 部署考虑

### 7.2 静态站点生成
- VitePress
- 预渲染策略
- JAMStack 实践

## 8. 实战经验

### 8.1 最佳实践
- 大型项目架构经验
- 性能优化案例
- 疑难问题处理
- 团队协作经验

### 8.2 项目难点
- 复杂组件设计
- 状态管理难点
- 性能瓶颈处理
- 兼容性问题
