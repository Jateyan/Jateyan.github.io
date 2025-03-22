---
title: 前端性能优化指南
description: 全面的前端性能优化策略与最佳实践
head:
  - - meta
    - name: keywords
      content: 前端性能优化, Web性能, 加载优化, 渲染优化, 资源优化, 缓存策略
---

# 前端性能优化指南

## 性能指标

### 核心指标
- [FCP (First Contentful Paint)](/engineering/performance/metrics.html#fcp)
- [LCP (Largest Contentful Paint)](/engineering/performance/metrics.html#lcp) 
- [FID (First Input Delay)](/engineering/performance/metrics.html#fid)
- [CLS (Cumulative Layout Shift)](/engineering/performance/metrics.html#cls)
- [TTI (Time to Interactive)](/engineering/performance/metrics.html#tti)
- [TBT (Total Blocking Time)](/engineering/performance/metrics.html#tbt)

### 指标监测工具
- [Lighthouse](/engineering/performance/tools.html#lighthouse)
- [Web Vitals](/engineering/performance/tools.html#web-vitals)
- [Performance API](/engineering/performance/tools.html#performance-api)
- [Core Web Vitals](/engineering/performance/tools.html#core-web-vitals)

## 网络优化

### 资源加载优化
- [HTTP/2 与 HTTP/3](/engineering/performance/network.html#http)
- [资源预加载技术](/engineering/performance/network.html#preload)
  - preload
  - prefetch
  - preconnect
  - dns-prefetch
- [资源压缩](/engineering/performance/network.html#compression)
  - Gzip/Brotli 压缩
  - 图片优化技术
  - SVG优化
- [CDN加速](/engineering/performance/network.html#cdn)
- [服务端推送](/engineering/performance/network.html#server-push)

### 缓存策略
- [浏览器缓存机制](/engineering/performance/caching.html#browser-cache)
- [HTTP缓存控制](/engineering/performance/caching.html#http-cache)
- [Service Worker 缓存](/engineering/performance/caching.html#service-worker)
- [Memory Cache 与 Disk Cache](/engineering/performance/caching.html#memory-disk-cache)
- [缓存最佳实践](/engineering/performance/caching.html#best-practices)

## 渲染优化

### 关键渲染路径优化
- [DOM 构建优化](/engineering/performance/rendering.html#dom)
- [CSSOM 构建优化](/engineering/performance/rendering.html#cssom)
- [JavaScript 执行优化](/engineering/performance/rendering.html#javascript)
- [渲染阻塞资源处理](/engineering/performance/rendering.html#render-blocking)
- [关键CSS内联](/engineering/performance/rendering.html#critical-css)

### 页面布局与重绘优化
- [避免布局抖动](/engineering/performance/layout.html#layout-thrashing)
- [分层与合成优化](/engineering/performance/layout.html#compositing)
- [硬件加速](/engineering/performance/layout.html#hardware-acceleration)
- [动画性能优化](/engineering/performance/layout.html#animations)
- [字体加载优化](/engineering/performance/layout.html#font-loading)

## JavaScript 优化

### 代码层面优化
- [代码分割](/engineering/performance/javascript.html#code-splitting)
- [Tree Shaking](/engineering/performance/javascript.html#tree-shaking)
- [懒加载与按需加载](/engineering/performance/javascript.html#lazy-loading)
- [Worker线程](/engineering/performance/javascript.html#web-workers)
- [内存泄漏防治](/engineering/performance/javascript.html#memory-leaks)
- [防抖与节流](/engineering/performance/javascript.html#debounce-throttle)

### 框架相关优化
- [React性能优化](/engineering/performance/frameworks.html#react)
  - 虚拟DOM优化
  - 组件懒加载
  - memo与useMemo
  - 状态管理优化
- [Vue性能优化](/engineering/performance/frameworks.html#vue)
  - 按需引入
  - 虚拟列表
  - keep-alive
  - 异步组件
- [Angular性能优化](/engineering/performance/frameworks.html#angular)
  - OnPush变更检测
  - 区域懒加载
  - 虚拟滚动
  - AOT编译

## 构建优化

### Webpack优化
- [减小构建体积](/engineering/performance/build-tools.html#webpack-size)
- [提升构建速度](/engineering/performance/build-tools.html#webpack-speed)
- [分包策略](/engineering/performance/build-tools.html#webpack-chunks)
- [缓存优化](/engineering/performance/build-tools.html#webpack-cache)

### Vite优化
- [ESBuild预构建](/engineering/performance/build-tools.html#vite-esbuild)
- [Rollup输出优化](/engineering/performance/build-tools.html#vite-rollup)
- [HMR性能优化](/engineering/performance/build-tools.html#vite-hmr)

## 实战案例

- [电商首页性能优化](/engineering/performance/case-studies.html#ecommerce)
- [数据大屏优化](/engineering/performance/case-studies.html#data-dashboard)
- [后台管理系统优化](/engineering/performance/case-studies.html#admin-system)
- [移动H5页面优化](/engineering/performance/case-studies.html#mobile-h5)
- [SSR应用优化](/engineering/performance/case-studies.html#ssr)

## 性能优化体系建设

- [性能预算](/engineering/performance/system.html#performance-budget)
- [CI/CD中的性能检测](/engineering/performance/system.html#ci-cd)
- [性能监控系统](/engineering/performance/system.html#monitoring)
- [前端监控指标体系](/engineering/performance/system.html#metrics-system)
- [持续优化流程](/engineering/performance/system.html#continuous-optimization) 