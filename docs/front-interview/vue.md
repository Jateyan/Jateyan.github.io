---
title: vue
createTime: 2025/05/05 11:19:25
permalink: /article/qbhcm38w/
---

## 1、vue的生命周期有哪些及每个生命周期做了什么？
- beforeCreate -> 使用 setup()
- created -> 使用 setup()
- beforeMount -> onBeforeMount
- mounted -> onMounted ： 可以使用$refs属性对Dom进行操作
- beforeUpdate -> onBeforeUpdate
- updated -> onUpdated
- beforeDestroy -> onBeforeUnmount
- destroyed -> onUnmounted
- errorCaptured -> onErrorCaptured

## 2、vue响应式原理是什么？vue3的响应式有何不同？

响应式原理:

- 1、Vue2.x 在初始化数据时，会使用Object.defineProperty重新定义data中的所有属性，当页面使用对应属性时，首先会进行依赖收集(收集当前组件的watcher)如果属性发生变化会通知相关依赖进行更新操作(发布订阅);
- 2、Vue3.x改用Proxy替代Object.defineProperty。因为Proxy可以直接监听对象和数组的变化，并且有多达13种拦截方法。并且作为新标准将受到浏览器厂商重点持续的性能优化。

Proxy只会代理对象的第一层，那么Vue3又是怎样处理这个问题的呢？
- 判断当前Reflect.get的返回值是否为Object，如果是则再通过reactive方法做代理， 这样就实现了深度观测

监测数组的时候可能触发多次get/set，那么如何防止触发多次呢？
- 我们可以判断key是否为当前被代理对象target自身属性，也可以判断旧值与新值是否相等，只有满足以上两个条件之一时，才有可能执行trigger

## 3、angular响应式原理？
Angular的响应式原理基于变更检测(Change Detection)机制，与Vue和React的响应式系统有明显区别，Angular使用Zone.js拦截异步操作触发变更检测，而非数据劫持。变更检测策略：Default，OnPush。

 异步事件发生--->Zone.js 捕获---->NgZone运行markForCheck---->ApplicationRef.tick()触发检测---->从根组件向下遍历组件树 ---->检查每个组件模板绑定的表达式---- 发现变化则更新相应DOM节点