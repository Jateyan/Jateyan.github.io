# 高级前端工程师面试大纲

## 一、基础知识

### HTML/CSS
- **HTML5新特性**
  - 语义化标签
  - Web Storage
  - Web Workers
  - Service Workers
  - WebSocket
  - Canvas vs SVG
- **CSS核心**
  - 盒模型与BFC
  - Flex布局与Grid布局
  - CSS变量与计算
  - 响应式设计
  - 移动端适配策略
  - CSS模块化方案对比
- **CSS3高级特性**
  - 动画与过渡
  - 3D变换
  - 滤镜与混合模式
  - 媒体查询
  - 自定义属性

### JavaScript进阶
- **语言特性**
  - 原型链与继承
  - 闭包与作用域
  - this指向详解
  - Event Loop机制
  - 异步编程模型
  - 函数式编程
- **ES6+**
  - Promise/async/await
  - Proxy与Reflect
  - 装饰器
  - 迭代器与生成器
  - Symbol类型应用
  - WeakMap/WeakSet使用场景
- **TypeScript**
  - 类型系统
  - 泛型
  - 高级类型
  - 类型推导
  - 类型守卫
  - 声明文件

## 二、框架与库

### Vue全家桶
- **Vue核心原理**
  - 响应式系统实现
  - 虚拟DOM与Diff算法
  - 模板编译过程
  - 组件化机制
  - 生命周期详解
- **Vue2与Vue3对比**
  - Composition API
  - 响应式系统重构
  - 性能优化点
  - TypeScript支持
- **Vue生态**
  - Vuex/Pinia状态管理
  - Vue Router路由方案
  - Nuxt.js服务端渲染
  - Vite构建工具

### React技术栈
- **React核心概念**
  - 虚拟DOM原理
  - Diff算法详解
  - Fiber架构
  - 调和过程
  - 生命周期变更原因
- **Hooks体系**
  - Hooks原理与实现
  - 常用Hooks分析
  - 自定义Hooks设计
  - Hooks最佳实践
- **状态管理**
  - Redux工作原理
  - Redux中间件机制
  - Mobx响应式原理
  - Context API使用场景
  - Recoil原子化状态
- **React生态**
  - React Router实现原理
  - Next.js SSR/SSG方案
  - 服务端组件

## 三、工程化与架构

### 微前端
- **架构设计**
  - 微前端解决方案对比
  - 应用间通信机制
  - 共享依赖处理
  - 应用隔离策略
- **实现方案**
  - Single-SPA原理
  - [qiankun/micro-app框架](./qiankun.md)
  - [Web Components方案](./web-components.md)
  - Module Federation联邦模块
- **工程实践**
  - 微前端下的CI/CD
  - 性能优化策略
  - 微前端治理

### 前端工程化
- **构建工具**
  - Webpack深入原理
  - Vite/Turbopack对比
  - Rollup与ESBuild
  - 模块化规范演进
- **性能优化**
  - 首屏加载优化
  - 资源加载策略
  - 渲染性能优化
  - 网络传输优化
  - 缓存策略设计
- **工程最佳实践**
  - 代码规范与自动化
  - Monorepo策略
  - 微服务前端设计
  - 大型项目架构设计
  - 前端发布系统

## 四、跨端与新技术

### 跨端技术
- **混合开发**
  - JSBridge原理
  - Hybrid架构设计
  - WebView性能优化
- **跨端框架**
  - React Native原理
  - Flutter vs RN
  - 小程序架构
  - Electron桌面应用

### 前沿技术
- **WebAssembly**
  - WASM工作原理
  - 与JavaScript协作
  - 应用场景分析
- **PWA技术栈**
  - Service Worker
  - 离线缓存策略
  - 推送通知
- **Web图形与3D**
  - Canvas性能优化
  - WebGL基础
  - Three.js应用
- **Web安全**
  - 常见攻击防御
  - CSP内容安全策略
  - HTTPS原理
  - 前端加密应用

## 五、软技能与系统设计

### 系统设计
- **前端架构设计**
  - 大型应用架构模式
  - 前后端分离设计
  - 微服务前端设计
  - BFF层设计
- **设计模式应用**
  - 组件设计模式
  - 状态管理模式
  - 通信模式

### 团队协作
- **技术管理**
  - 技术选型方法论
  - 团队规范制定
  - 代码评审实践
- **质量保障**
  - 前端测试策略
  - 自动化测试实践
  - 性能监控系统

## 六、实战题目

### 编码题目
- 手写Promise/EventEmitter
- 实现虚拟列表
- 设计无限滚动加载
- 实现大文件上传
- 手写Vue响应式系统

### 系统设计题
- 设计前端监控系统
- 实现微前端架构
- 设计组件库
- 大型表单解决方案
