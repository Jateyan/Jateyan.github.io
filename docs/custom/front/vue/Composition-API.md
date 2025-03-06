---
title: Composition-API
createTime: 2025/03/06 20:43:56
permalink: /article/j7dsrp78/
---
# Composition API

## 1. setup 函数

### 基础用法
`setup` 是 Composition API 的入口点，在组件被创建**之前**执行，此时组件实例尚未被创建。

```javascript
import { ref, onMounted } from 'vue'

export default {
  setup() {
    // 声明响应式状态
    const count = ref(0)
    
    // 方法
    function increment() {
      count.value++
    }
    
    // 生命周期钩子
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    // 返回值将暴露给模板和组件实例
    return {
      count,
      increment
    }
  }
}
```

### setup 参数
`setup` 函数接收两个参数：`props` 和 `context`

```javascript
export default {
  props: {
    title: String
  },
  setup(props, context) {
    // props 是响应式的
    console.log(props.title)
    
    // context 提供了emit, attrs, slots等属性
    const { emit, attrs, slots } = context
    
    // 使用emit触发事件
    function handleClick() {
      emit('custom-event', '数据')
    }
    
    return { handleClick }
  }
}
```

### &lt;script setup&gt; 语法
Vue 3.2+引入了更简洁的组合式API语法糖

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明的变量、函数自动暴露给模板使用
const count = ref(0)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

## 2. 生命周期钩子

### 对应关系
Composition API 中的生命周期钩子与 Options API 中的生命周期钩子对应关系:

| Options API | Composition API | 
|-------------|-----------------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |
| errorCaptured | onErrorCaptured |
| renderTracked | onRenderTracked |
| renderTriggered | onRenderTriggered |
| activated | onActivated |
| deactivated | onDeactivated |

### 使用示例
```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

export default {
  setup() {
    // 在组件被挂载之前调用
    onBeforeMount(() => {
      console.log('beforeMount')
    })

    // 在组件被挂载之后调用
    onMounted(() => {
      console.log('mounted')
    })

    // 在数据变化导致DOM重新渲染之前调用
    onBeforeUpdate(() => {
      console.log('beforeUpdate')
    })

    // 在数据变化导致DOM重新渲染之后调用
    onUpdated(() => {
      console.log('updated')
    })

    // 在组件卸载之前调用
    onBeforeUnmount(() => {
      console.log('beforeUnmount')
    })

    // 在组件卸载之后调用
    onUnmounted(() => {
      console.log('unmounted')
    })

    // <keep-alive>组件激活时调用
    onActivated(() => {
      console.log('activated')
    })

    // <keep-alive>组件停用时调用
    onDeactivated(() => {
      console.log('deactivated')
    })

    // 捕获后代组件错误时调用
    onErrorCaptured((err, instance, info) => {
      console.log('errorCaptured', err, instance, info)
      // 返回false阻止错误继续向上传播
      return false
    })
  }
}
```

## 3. 响应式API

### ref 
创建一个包含响应式数据的引用对象，适用于基本类型和对象

```javascript
import { ref, watch } from 'vue'

const count = ref(0)
const user = ref({ name: '张三' })

// 访问和修改值需要使用.value
console.log(count.value) // 0
count.value++

// 监听变化
watch(count, (newValue, oldValue) => {
  console.log(`count从${oldValue}变为${newValue}`)
})

// 模板中使用时不需要.value
// <div>{{ count }}</div>
// <div>{{ user.name }}</div>
```

### reactive
创建一个响应式对象，只对对象类型有效

```javascript
import { reactive, watch } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: '张三'
  }
})

// 直接读取和修改属性
console.log(state.count) // 0
state.count++
state.user.name = '李四'

// 监听整个对象
watch(state, (newState) => {
  console.log('状态已更新:', newState)
}, { deep: true })

// 监听特定属性
watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(`count从${oldValue}变为${newValue}`)
  }
)
```

### computed
创建计算属性

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// 只读计算属性
const doubleCount = computed(() => count.value * 2)

// 可写计算属性
const plusFive = computed({
  get: () => count.value + 5,
  set: (val) => {
    count.value = val - 5
  }
})

console.log(doubleCount.value) // 0
count.value = 1
console.log(doubleCount.value) // 2

plusFive.value = 10 // 会设置count.value为5
console.log(count.value) // 5
```

### watch与watchEffect
监听响应式数据变化

```javascript
import { ref, reactive, watch, watchEffect } from 'vue'

const count = ref(0)
const state = reactive({ name: '张三' })

// 监听ref
watch(count, (newValue, oldValue) => {
  console.log(`count: ${oldValue} -> ${newValue}`)
})

// 监听reactive的属性
watch(
  () => state.name,
  (newName, oldName) => {
    console.log(`name: ${oldName} -> ${newName}`)
  }
)

// 监听多个来源
watch(
  [count, () => state.name],
  ([newCount, newName], [oldCount, oldName]) => {
    console.log(`count: ${oldCount} -> ${newCount}`)
    console.log(`name: ${oldName} -> ${newName}`)
  }
)

// 深度监听
watch(state, (newState, oldState) => {
  console.log('state变化:', newState)
}, { deep: true })

// 立即执行
watch(count, (newValue) => {
  console.log(`立即执行: count = ${newValue}`)
}, { immediate: true })

// watchEffect会自动收集依赖并立即执行
watchEffect(() => {
  console.log(`count: ${count.value}`)
  console.log(`name: ${state.name}`)
  // 会在count或state.name变化时重新执行
})

// 停止监听
const stopWatch = watch(count, () => {})
stopWatch() // 手动停止监听

// 在DOM更新后执行
watchEffect(
  () => {
    // 访问更新后的DOM
    console.log(document.querySelector('#app').innerHTML)
  },
  { flush: 'post' }
)
```

## 4. 组合式函数(Composables)

### 创建可复用的组合式函数
将相关的逻辑封装为可重用的函数

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  const doubleCount = computed(() => count.value * 2)
  
  return {
    count,
    increment,
    decrement,
    doubleCount
  }
}
```

### 使用组合式函数
```vue
<script setup>
import { useCounter } from './useCounter'

// 在组件中使用
const { count, increment, decrement, doubleCount } = useCounter(10)
</script>

<template>
  <div>
    <p>计数: {{ count }}</p>
    <p>双倍: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>
```

### 更复杂的例子：异步数据获取
```javascript
// useFetch.js
import { ref, computed, watch } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)
  
  async function fetchData() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP错误：${response.status}`)
      }
      data.value = await response.json()
    } catch (err) {
      error.value = err.message || '获取数据失败'
    } finally {
      loading.value = false
    }
  }
  
  // 立即执行一次
  fetchData()
  
  // 暴露重新获取数据的方法
  function refresh() {
    return fetchData()
  }
  
  // 计算属性：是否有数据
  const hasData = computed(() => !!data.value)
  
  return {
    data,
    error,
    loading,
    refresh,
    hasData
  }
}
```

使用：
```vue
<script setup>
import { useFetch } from './useFetch'
import { computed } from 'vue'

const { data, error, loading, refresh } = useFetch('https://jsonplaceholder.typicode.com/users')

// 可以组合多个composables
const userNames = computed(() => {
  return data.value?.map(user => user.name) || []
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <div v-else>
      <h2>用户列表</h2>
      <ul>
        <li v-for="name in userNames" :key="name">{{ name }}</li>
      </ul>
      <button @click="refresh">刷新</button>
    </div>
  </div>
</template>
```

## 5. 依赖注入

### provide和inject
在组件树中共享数据，无需通过props传递

```javascript
// 父组件 ParentComponent.vue
<script setup>
import { provide, ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 提供一个值
provide('message', '你好，世界')

// 提供一个响应式值
const count = ref(0)
provide('count', count)

// 提供一个方法
function incrementCount() {
  count.value++
}
provide('incrementCount', incrementCount)
</script>

<template>
  <div>
    <p>父组件计数: {{ count }}</p>
    <ChildComponent />
  </div>
</template>
```

```javascript
// 子组件 ChildComponent.vue
<script setup>
import { inject } from 'vue'

// 注入值
const message = inject('message')

// 注入响应式值
const count = inject('count')

// 注入方法
const incrementCount = inject('incrementCount')

// 使用默认值
const defaultValue = inject('不存在的值', '默认值')
</script>

<template>
  <div>
    <p>消息: {{ message }}</p>
    <p>子组件计数: {{ count }}</p>
    <button @click="incrementCount">增加</button>
  </div>
</template>
```

### 响应式依赖注入最佳实践
使用readonly防止注入方修改值

```javascript
// 父组件
<script setup>
import { provide, ref, readonly } from 'vue'

const count = ref(0)
// 提供只读版本，防止子组件修改
provide('count', readonly(count))

// 提供更新方法
function setCount(value) {
  count.value = value
}
provide('setCount', setCount)
</script>
```

```javascript
// 子组件
<script setup>
import { inject } from 'vue'

const count = inject('count')
const setCount = inject('setCount')

// count.value++ // 无效，因为count是只读的
// 必须通过提供的方法修改
function increment() {
  setCount(count.value + 1)
}
</script>
```

## 6. 组合式API与Options API对比

### 同一个组件的两种实现

**Options API实现:**
```javascript
export default {
  data() {
    return {
      firstName: '张',
      lastName: '三',
      searchQuery: ''
    }
  },
  computed: {
    fullName() {
      return this.firstName + this.lastName
    },
    filteredUsers() {
      return this.users.filter(user => 
        user.name.includes(this.searchQuery)
      )
    }
  },
  methods: {
    getUserData() {
      // 获取用户数据
    },
    updateSearch(query) {
      this.searchQuery = query
    }
  },
  mounted() {
    this.getUserData()
  }
}
```

**Composition API实现:**
```javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 用户名逻辑
    const firstName = ref('张')
    const lastName = ref('三')
    const fullName = computed(() => firstName.value + lastName.value)
    
    // 搜索逻辑
    const searchQuery = ref('')
    const users = ref([])
    const filteredUsers = computed(() => 
      users.value.filter(user => user.name.includes(searchQuery.value))
    )
    
    function updateSearch(query) {
      searchQuery.value = query
    }
    
    // 数据获取逻辑
    async function getUserData() {
      // 获取用户数据
    }
    
    onMounted(() => {
      getUserData()
    })
    
    return {
      // 暴露给模板的属性和方法
      firstName,
      lastName,
      fullName,
      searchQuery,
      filteredUsers,
      updateSearch
    }
  }
}
```

### 优缺点对比

**Composition API 优点:**
1. **更好的逻辑复用** - 可以轻松提取和重用逻辑
2. **更好的类型推导** - 对TypeScript友好，提供更好的类型检查
3. **更小的打包体积** - 更好的树摇动支持
4. **按功能组织代码** - 相关逻辑可以放在一起，提高可维护性

**Options API 优点:**
1. **对新手更友好** - 结构直观，容易理解
2. **代码组织固定** - 强制的选项结构，减少风格差异

## 7. 性能优化技巧

### 使用shallowRef和shallowReactive
当不需要深层响应性时，使用浅层响应式APl

```javascript
import { shallowRef, shallowReactive } from 'vue'

// 只有state.value的改变会被跟踪
// 不会深层次跟踪对象内部属性
const state = shallowRef({ count: 0 })

// 修改整个对象会触发更新
state.value = { count: 1 } // 触发更新

// 修改内部属性不会触发更新
state.value.count = 2 // 不触发更新

// 同样，shallowReactive只跟踪对象顶层属性
const user = shallowReactive({
  name: '张三',
  profile: { age: 25 }
})

// 这会触发更新
user.name = '李四'

// 这不会触发更新
user.profile.age = 30
```

### 使用v-once和v-memo
跳过不需要重新渲染的内容

```vue
<template>
  <!-- 只渲染一次，之后永远不变 -->
  <div v-once>
    <h1>站点标题</h1>
    <p>静态内容</p>
  </div>
  
  <!-- 只有当id变化时才会重新渲染 -->
  <div v-memo="[item.id]">
    <ComplexComponent :item="item" />
  </div>
  
  <!-- 多个依赖项 -->
  <div v-memo="[user.id, user.role]">
    {{ expensiveComputation(user) }}
  </div>
</template>
```

### defineAsyncComponent
异步加载组件，减少首屏加载时间

```javascript
import { defineAsyncComponent } from 'vue'

// 简单用法
const AsyncComponent = defineAsyncComponent(() => 
  import('./components/HeavyComponent.vue')
)

// 高级用法，带加载和错误处理
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200, // 显示加载组件前的延迟毫秒
  timeout: 3000, // 超时时间
  suspensible: true, // 与Suspense兼容
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry() // 重试加载
    } else {
      fail() // 最终失败
    }
  }
})
```

### 自定义值的变化侦测
使用自定义比较函数，避免不必要的更新

```javascript
import { ref, watch, computed } from 'vue'

const items = ref([1, 2, 3])

// 仅当数组长度变化时触发回调
watch(
  () => items.value,
  (newItems, oldItems) => {
    console.log('数组长度变化了')
  },
  { 
    deep: true,
    flush: 'post',
    // 自定义比较函数
    onTrack(e) {
      console.log('正在跟踪：', e)
    },
    onTrigger(e) {
      console.log('被触发：', e)
    }
  }
)

// 使用计算属性缓存复杂计算结果
const expensiveResult = computed(() => {
  console.log('执行复杂计算')
  return items.value.map(item => {
    // 复杂计算...
    return item * item
  })
})
```

### 使用Suspense和动态导入
优化加载体验

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => 
  import('./components/DataFetchingComponent.vue')
)
</script>
```

异步组件：
```vue
<!-- DataFetchingComponent.vue -->
<script setup>
import { ref } from 'vue'

// 在组件setup中使用异步操作
const data = ref(null)

// async setup
const response = await fetch('https://api.example.com/data')
data.value = await response.json()
</script>

<template>
  <div>
    <h2>异步获取的数据</h2>
    <pre>{{ data }}</pre>
  </div>
</template>
```
