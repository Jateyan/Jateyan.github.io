# Vue 3 知识点大纲

## 一、Vue 3 核心概念

### 1. Vue 3 架构
- 采用 Monorepo 管理模式
- 源码组织结构变化
- 使用 TypeScript 重写
- 性能提升及优化策略

### 2. 响应式系统
- Proxy 替代 Object.defineProperty
- reactive 和 ref 的区别与使用
- computed 和 watch 的实现原理
- 响应式原理深度解析
- toRefs, toRef, unref 等工具函数使用

### 3. 组合式 API (Composition API)
- setup 函数及其使用场景
- 生命周期钩子在组合式 API 中的变化
- 与 Options API 的比较优势
- 组合式函数 (Composables) 的设计模式
- 实际应用中的最佳实践

### 4. 性能优化
- 静态树提升 (Static Tree Hoisting)
- 基于 Proxy 的响应式系统性能优势
- 片段 (Fragments) 减少 DOM 节点
- 编译优化 (静态属性提升、事件缓存等)
- 按需引入打包体积优化

## 二、Vue 3 新特性

### 1. 内置组件
- Teleport 组件用法及应用场景
- Suspense 组件异步加载
- Fragment 片段
- 异步组件的新写法

### 2. 新增 API
- createApp 替代 new Vue
- emits 选项声明事件
- v-model 的变化与多个 v-model 绑定
- 全局 API 的调整 (如 app.use, app.component 等)
- provide/inject 在组合式 API 中的使用

### 3. 模板与指令
- v-if 与 v-for 优先级变化
- v-bind 的变化 (合并行为)
- 多 v-model 支持
- 自定义指令的 API 变化

### 4. TypeScript 支持
- defineComponent 增强类型推断
- 类型声明和泛型使用
- 组件 props 的类型声明
- 事件的类型定义
- Volar 插件的使用与优势

## 三、Vue 3 与 Vue 2 的区别

### 1. 核心架构变化
- 源码架构对比
- API 风格对比
- 生命周期对比
- 性能差异

### 2. 迁移策略
- 兼容性问题及常见解决方案
- 迁移工具使用
- 渐进式迁移最佳实践
- 第三方库兼容性问题处理

## 四、状态管理与路由

### 1. Pinia 与 Vuex
- Pinia 与 Vuex 的区别
- 组合式 API 与状态管理的结合
- 状态管理最佳实践
- 持久化方案

### 2. Vue Router 4
- 路由守卫变化
- 组合式 API 中的路由使用
- 动态路由与权限控制
- 路由懒加载优化

## 五、实际应用与生态

### 1. 工程化
- Vite 构建工具的使用与优势
- 单元测试与 E2E 测试
- 代码规范与最佳实践
- CI/CD 部署策略

### 2. 组件设计
- 组件通信模式
- 组件封装与复用策略
- 基于组合式 API 的组件设计
- 高阶组件与组件插槽

### 3. 性能优化实践
- 大型应用性能优化策略
- 懒加载与代码分割
- 缓存策略
- 渲染性能优化技巧

### 4. SSR 与 SSG
- Vue 3 中的服务端渲染
- Nuxt 3 的使用与特点
- 静态站点生成
- 水合 (Hydration) 相关问题

## 六、常见面试问题

### 1. 原理类问题
- 谈谈对 MVVM 的理解
- Vue 3 响应式原理详解
- 虚拟 DOM 及 Diff 算法
- Vue 3 的编译优化

### 2. 实践类问题
- 大型项目的组件设计经验
- 如何处理性能瓶颈
- 项目中的状态管理方案设计
- 组件库设计与实现

### 3. 思考类问题
- Vue 3 相比于其他框架的优势
- 前端发展趋势的思考
- 如何选择适合的技术栈
- 团队协作与技术决策
