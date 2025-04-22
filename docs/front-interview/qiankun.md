---
title: qiankun
createTime: 2025/04/22 12:18:58
permalink: /article/el8kx6vq/
---

# qiankun微前端框架面试题集

## 基础概念

### 微前端的需求场景
从技术实现角度，微前端架构解决方案大概分为两类场景：
- 单实例：即同一时刻，只有一个子应用被展示，子应用具备一个完整的应用生命周期。通常基于 url 的变化来做子应用的切换。
- 多实例：同一时刻可展示多个子应用。通常使用 Web Components 方案来做子应用封装，子应用更像是一个业务组件而不是应用。




### 1. 什么是微前端？微前端解决了哪些问题？
微前端是一种将前端应用分解成更小、更简单的应用的架构风格，这些小型应用可以独立开发、测试和部署，同时还可以聚合为一个更大的应用。微前端解决的主要问题包括：
- 大型前端应用的复杂度管理
- 不同团队之间的独立开发与部署
- 技术栈的统一与兼容
- 旧系统与新系统的共存与迁移
- 避免巨石应用带来的开发效率下降

### 2. qiankun是什么？它有哪些主要特性？
qiankun是蚂蚁金服开源的一个基于single-spa的微前端实现库，其主要特性包括：
- 基于single-spa封装，提供了更加开箱即用的API
- 技术栈无关，任意技术栈的应用均可使用/接入
- HTML Entry的方式加载微应用，支持样式隔离和JS沙箱
- 资源预加载，在浏览器空闲时间预加载未打开的微应用资源
- umi插件，简化微应用的接入成本
- 自动运行时沙箱，确保微应用之间的全局变量和样式隔离

### 3. qiankun与其他微前端方案（如single-spa、micro-app等）相比有什么优势和劣势？
**优势：**
- 完善的沙箱机制，提供JS沙箱和CSS隔离
- HTML Entry方式加载应用，配置简单
- 父子应用通信机制完善
- 社区活跃，文档完善，应用案例丰富
- 提供了预加载能力

**劣势：**
- 基于single-spa，改造成本相对较高
- 子应用需要单独构建和部署
- 对于不支持CORS的第三方应用接入较困难
- 沙箱隔离并非100%完美，某些特殊场景下仍存在全局污染可能

## 原理实现

### 4. 详细解释qiankun的JS沙箱机制，它是如何实现的？
qiankun提供了三种沙箱实现：

1. **快照沙箱(SnapshotSandbox)**:
   - 原理：在应用切换时记录window对象快照，通过对比前后window对象差异来实现环境隔离
   - 适用场景：不支持Proxy的低版本浏览器
   - 缺点：无法支持多个实例同时运行

2. **代理沙箱(LegacySandbox)**:
   - 原理：使用ES6的Proxy劫持window对象，记录子应用对全局window的修改
   - 实现：通过设置windowSnapshot和modifyPropsMap两个Map记录修改
   - 缺点：仍然会污染原window，不适合多实例场景

3. **多实例代理沙箱(ProxySandbox)**:
   - 原理：为每个子应用创建独立的代理对象，所有操作都在代理对象上进行
   - 实现：通过Proxy代理对象，配合fakeWindow对象实现
   - 优点：完全隔离，支持多个微应用同时运行

沙箱机制的实现核心代码大致如下：
```javascript
class ProxySandbox {
  constructor() {
    const fakeWindow = {};
    const proxy = new Proxy(fakeWindow, {
      get(target, prop) {
        // 先从fakeWindow上找
        if (prop in target) {
          return target[prop];
        }
        // 否则从真实window上找
        return window[prop];
      },
      set(target, prop, value) {
        // 设置值时只修改fakeWindow
        target[prop] = value;
        return true;
      }
    });
    
    this.proxy = proxy;
  }
  
  active() {
    // 激活沙箱
  }
  
  inactive() {
    // 失活沙箱
  }
}
```

### 5. qiankun的CSS隔离是如何实现的？
qiankun提供了两种CSS隔离方式：

1. **严格隔离(strict模式)**:
   - 实现原理：通过Shadow DOM实现，为每个子应用创建一个独立的Shadow DOM节点
   - 优点：完全隔离，子应用样式不会影响主应用和其他子应用
   - 缺点：使用Shadow DOM后，一些第三方库可能会出现样式问题

2. **宽松模式(experimental.css策略)**:
   - 实现原理：通过动态添加前缀选择器实现
   - 工作流程：
     1. 解析子应用的所有样式表
     2. 为每个CSS规则添加特定的前缀选择器
     3. 将处理后的样式表重新插入到DOM中
   - 优点：兼容性好，不依赖Shadow DOM
   - 缺点：性能开销较大，对于动态生成的样式处理不完善

### 6. qiankun如何处理子应用的生命周期？
qiankun基于single-spa，管理子应用的生命周期主要包括以下几个阶段：

1. **加载(load)**:
   - 通过HTML Entry方式请求入口HTML文件
   - 解析HTML，提取JS、CSS等资源
   - 预处理外部资源，转换成内联代码

2. **挂载(mount)**:
   - 创建并激活子应用沙箱环境
   - 执行子应用的bootstrap方法(如果有)
   - 执行子应用的mount方法，渲染应用
   - 应用CSS隔离策略

3. **卸载(unmount)**:
   - 执行子应用的unmount方法，清理DOM
   - 失活子应用沙箱
   - 移除子应用的样式影响

子应用需要导出这些生命周期方法：
```javascript
// 子应用入口
export async function bootstrap() {
  // 启动时调用一次
}

export async function mount(props) {
  // 挂载时调用
  ReactDOM.render(<App />, props.container);
}

export async function unmount(props) {
  // 卸载时调用
  ReactDOM.unmountComponentAtNode(props.container);
}
```

## 应用实践

### 7. 如何在qiankun中实现主应用和子应用的通信？
qiankun提供了多种应用间通信方式：

1. **Props传递**:
   - 主应用通过注册微应用时的props参数传递数据和方法
   ```javascript
   // 主应用
   registerMicroApp({
     name: 'app1',
     entry: '//localhost:8080',
     container: '#container',
     activeRule: '/app1',
     props: {
       data: 'shared data',
       methods: {
         onMainEvent: (data) => console.log(data)
       }
     }
   });
   
   // 子应用
   export function mount(props) {
     console.log(props.data); // 'shared data'
     props.methods.onMainEvent('from sub app');
   }
   ```

2. **全局状态管理**:
   - 使用qiankun提供的globalState进行通信
   ```javascript
   // 主应用
   import { initGlobalState } from 'qiankun';
   const actions = initGlobalState({ count: 0 });
   actions.onGlobalStateChange((state, prev) => console.log(state, prev));
   actions.setGlobalState({ count: 1 });
   
   // 子应用
   export function mount(props) {
     props.onGlobalStateChange((state) => console.log(state));
     props.setGlobalState({ count: 2 });
   }
   ```

3. **自定义事件通信**:
   - 通过自定义事件实现通信
   ```javascript
   // 自定义事件总线
   class EventBus {
     on(event, callback) {/*...*/}
     emit(event, data) {/*...*/}
     off(event, callback) {/*...*/}
   }
   const bus = new EventBus();
   
   // 主应用
   registerMicroApp({
     //...
     props: { bus }
   });
   bus.emit('event', data);
   
   // 子应用
   export function mount(props) {
     props.bus.on('event', handler);
   }
   ```

4. **共享库方式**:
   - 通过externals和shared配置共享依赖库

### 8. 如何解决qiankun中常见的跨域问题？
在qiankun微前端架构中，解决跨域问题的方法：

1. **开发环境配置CORS**:
   - 为子应用配置跨域响应头
   ```javascript
   // webpack配置
   devServer: {
     headers: {
       'Access-Control-Allow-Origin': '*',
     },
   }
   ```

2. **生产环境配置**:
   - 统一域名部署，将子应用部署到同一域名下的不同路径
   - 使用Nginx代理转发，解决跨域问题
   ```nginx
   # Nginx配置示例
   location /sub-app1/ {
     proxy_pass http://sub-app1-host/;
   }
   ```

3. **代理请求处理**:
   - 主应用采用代理方式请求子应用资源

4. **使用中间层**:
   - 引入BFF层，由服务端聚合各个子应用的资源

### 9. 在qiankun中，如何优化子应用的加载性能？
优化qiankun子应用加载性能的策略：

1. **预加载策略**:
   - 启用qiankun的预加载功能
   ```javascript
   // 注册时启用预加载
   registerMicroApp({
     name: 'app1',
     entry: '//localhost:8080',
     container: '#container',
     activeRule: '/app1',
   }, {
     prefetch: true // 开启预加载
   });
   
   // 或全局配置
   start({
     prefetch: 'all', // 预加载所有子应用
     // 或
     prefetch: ['app1'], // 仅预加载指定应用
     // 或
     prefetch: true, // 按需预加载
   });
   ```

2. **资源优化**:
   - 子应用资源分割和懒加载
   - 提取公共依赖，避免重复加载
   - 使用webpack的externals和qiankun的shared配置共享依赖

3. **缓存策略**:
   - 合理设置子应用资源的缓存策略
   - 利用浏览器缓存机制

4. **应用加载策略**:
   - 配置子应用的加载超时时间和重试机制
   ```javascript
   start({
     sandbox: true,
     singular: true,
     timeoutThreshold: 5000, // 超时时间
   });
   ```

5. **按需加载子应用**:
   - 实现只在需要时才加载子应用的策略

## 高级问题

### 10. 在qiankun中如何处理路由冲突问题？
处理qiankun中的路由冲突：

1. **基于路由前缀的隔离**:
   - 每个子应用使用唯一的路由前缀
   ```javascript
   // 主应用
   registerMicroApp({
     name: 'app1',
     activeRule: '/app1',
     // ...
   });
   
   // 子应用路由配置(React Router)
   const routes = [
     { path: '/app1/page1', component: Page1 },
     { path: '/app1/page2', component: Page2 },
   ];
   ```

2. **路由状态同步**:
   - 实现主应用和子应用路由状态的双向同步
   - 监听路由变化事件，保持一致性

3. **使用history库**:
   - 统一使用history库管理路由状态
   ```javascript
   // 主应用
   import { createBrowserHistory } from 'history';
   const history = createBrowserHistory();
   // 共享给子应用
   
   // 子应用
   export function mount(props) {
     // 使用主应用传递的history对象
     const { history } = props;
   }
   ```

4. **哈希模式与历史模式混用**:
   - 主应用使用history模式，子应用使用hash模式避免冲突

### 11. qiankun的沙箱机制有哪些局限性？如何解决这些问题？
qiankun沙箱机制的局限性及解决方案：

1. **原生API和DOM API污染**:
   - 局限性：无法完全隔离原生API如setTimeout的修改
   - 解决方案：
     - 避免子应用修改原生API
     - 使用polyfill库替代直接修改原型链

2. **全局事件监听**:
   - 局限性：window上的事件监听会互相影响
   - 解决方案：
     - 子应用卸载时清理所有事件监听器
     ```javascript
     // 记录所有添加的事件
     const listeners = [];
     
     // 添加事件
     const originalAddEventListener = window.addEventListener;
     window.addEventListener = function(type, listener, options) {
       listeners.push({ type, listener, options });
       originalAddEventListener.call(window, type, listener, options);
     };
     
     // 卸载时清理
     export function unmount() {
       listeners.forEach(({ type, listener, options }) => {
         window.removeEventListener(type, listener, options);
       });
       listeners.length = 0;
     }
     ```

3. **localStorage/sessionStorage隔离**:
   - 局限性：无法原生隔离存储API
   - 解决方案：
     - 使用前缀区分不同应用的存储项
     ```javascript
     // 封装带前缀的localStorage
     function createPrefixedStorage(prefix) {
       return {
         getItem(key) {
           return localStorage.getItem(`${prefix}:${key}`);
         },
         setItem(key, value) {
           localStorage.setItem(`${prefix}:${key}`, value);
         },
         // ...其他方法
       };
     }
     
     // 子应用使用
     const storage = createPrefixedStorage('app1');
     ```

4. **第三方库兼容性问题**:
   - 局限性：某些库可能直接依赖window对象
   - 解决方案：
     - 修改这些库的使用方式
     - 在子应用中重写这些库的部分功能

### 12. 如何设计一个大型企业级微前端架构？qiankun在其中扮演什么角色？
设计大型企业级微前端架构：

1. **总体架构设计**:
   - 主框架层：负责应用注册、路由分发、全局状态管理
   - 微应用层：各个独立的业务子应用
   - 基础服务层：提供公共服务和基础设施
   - 中间层(BFF)：统一API聚合和数据处理

2. **基础设施建设**:
   - 统一的组件库和设计系统
   - 微前端脚手架，简化子应用创建和接入
   - 公共依赖管理策略
   - 统一的构建和部署流程

3. **qiankun的定位**:
   - 作为微前端的运行时容器
   - 提供应用注册、沙箱隔离和通信机制
   - 不负责CI/CD、权限等更上层的问题

4. **扩展qiankun功能**:
   - 开发自定义插件扩展qiankun
   - 实现更细粒度的应用控制
   - 扩展监控和性能分析能力

5. **微前端治理**:
   - 子应用版本管理和灰度发布策略
   - 统一的监控和日志系统
   - 权限和用户体系设计
   - 子应用注册中心

### 13. 在使用qiankun过程中遇到过哪些问题？如何解决的？
常见问题及解决方案：

1. **样式冲突问题**:
   - 问题：尽管有沙箱，某些情况下仍会出现样式冲突
   - 解决：
     - 使用CSS Modules或命名空间
     - 配置更严格的CSS隔离策略
     - 使用Shadow DOM模式

2. **子应用加载失败**:
   - 问题：网络问题或配置错误导致子应用加载失败
   - 解决：
     - 实现加载状态显示和错误处理
     - 配置重试机制
     - 实现优雅的降级方案

3. **内存泄漏**:
   - 问题：子应用卸载时未清理资源导致内存泄漏
   - 解决：
     - 完善子应用的unmount逻辑
     - 监控内存使用情况
     - 定期强制刷新页面

4. **首屏加载性能**:
   - 问题：微前端架构导致首屏加载较慢
   - 解决：
     - 实现骨架屏
     - 优化主应用体积
     - 预加载关键子应用

5. **动态添加的DOM节点丢失**:
   - 问题：某些库动态添加的DOM节点在切换应用后丢失
   - 解决：
     - 修改添加节点的位置
     - 在子应用挂载点内而非body上添加节点

## 实战案例

### 14. 如何将一个现有的大型单体应用逐步迁移到qiankun微前端架构？
迁移策略：

1. **评估和规划阶段**:
   - 分析现有应用结构和业务模块
   - 确定拆分边界和优先级
   - 设计过渡期架构

2. **架构搭建**:
   - 搭建基于qiankun的主框架
   - 设计路由策略和应用通信机制
   - 建立公共依赖管理方案

3. **渐进式迁移**:
   - 优先抽取相对独立的模块作为子应用
   - 使用iframe作为过渡方案包装无法立即改造的模块
   - 新功能直接开发成微应用

4. **统一体验**:
   - 建立设计规范和组件库
   - 实现统一的用户认证和权限系统
   - 保持一致的交互体验

5. **运维和监控**:
   - 建立微前端专用的监控系统
   - 实现子应用的独立发布和回滚机制
   - 灰度发布能力建设

### 15. 如何评估微前端架构是否适合你的项目？什么情况下不应该使用qiankun？
评估微前端适用性：

**适合使用微前端的场景**:
- 大型复杂应用需要多团队协作开发
- 存在技术栈不统一的历史系统需要融合
- 需要渐进式升级或重构大型应用
- 业务模块相对独立，边界清晰
- 组织结构与业务领域划分一致

**不建议使用微前端的场景**:
- 小型应用或团队规模较小
- 项目处于初创阶段，需求变化频繁
- 技术栈完全统一且没有历史包袱
- 应用之间耦合度高，难以划分清晰边界
- 对首屏加载速度有极高要求
- 团队没有足够的工程化经验

### 16. 在qiankun的基础上，你会如何进一步增强微前端架构的能力？
增强微前端架构：

1. **构建自动化系统**:
   - 开发专用CLI工具简化子应用创建和配置
   - 建立统一的构建流程和规范
   - 实现子应用增量构建

2. **微前端管理平台**:
   - 开发应用注册中心，管理子应用配置和版本
   - 实现子应用的动态注册和配置
   - 提供可视化的应用关系和依赖图

3. **扩展监控能力**:
   - 实现细粒度的性能监控
   - 错误追踪和用户行为分析
   - 建立微前端专用监控指标

4. **增强通信机制**:
   - 开发更强大的状态管理解决方案
   - 实现基于事件总线的细粒度通信
   - 支持跨应用组件调用

5. **高级部署策略**:
   - 实现子应用的蓝绿部署
   - 基于用户画像的智能路由
   - 子应用按需动态部署

### 17. qiankun在未来的发展趋势如何？它面临哪些挑战？
发展趋势与挑战：

**发展趋势**:
- 与WebComponents的融合，提供更原生的组件封装体验
- 更精细的资源控制和按需加载能力
- 与边缘计算结合，实现更智能的应用分发
- 更强大的隔离机制，减少应用间副作用
- 更完善的TypeScript支持和类型定义

**面临挑战**:
- 浏览器原生隔离机制的限制
- 整体架构复杂度提升带来的管理难题
- 前端框架快速迭代导致的兼容性问题
- 性能优化与架构灵活性的平衡
- 构建工具变革对资源加载策略的影响

### 18. 在大型微前端架构中，如何做好权限控制和用户认证？
权限控制和用户认证：

1. **统一认证中心**:
   - 实现基于OAuth2.0/OpenID Connect的单点登录
   - 使用JWT等token机制在应用间共享认证状态
   - 维护统一的用户会话

2. **权限模型设计**:
   - 基于RBAC或ABAC模型设计权限系统
   - 实现粗粒度(应用级)和细粒度(功能级)的权限控制
   - 设计权限数据结构，支持灵活配置

3. **前端权限实现**:
   - 主应用负责全局权限控制
   - 子应用负责内部细粒度权限
   - 基于权限动态加载子应用和路由

4. **权限同步机制**:
   - 权限变更实时推送
   - 定期校验权限有效性
   - 实现权限缓存与刷新策略

### 19. 如何在qiankun架构中实现全局的状态管理？
全局状态管理方案：

1. **基于qiankun自带的globalState**:
   ```javascript
   // 主应用
   import { initGlobalState } from 'qiankun';
   const initialState = { user: null, theme: 'light' };
   const actions = initGlobalState(initialState);
   
   // 监听全局状态变更
   actions.onGlobalStateChange((newState, prev) => {
     console.log('主应用状态变更:', newState, prev);
   });
   
   // 修改全局状态
   actions.setGlobalState({ theme: 'dark' });
   
   // 子应用
   export function mount(props) {
     // 监听全局状态变更
     props.onGlobalStateChange((state) => {
       console.log('子应用接收到状态:', state);
     });
     
     // 子应用修改全局状态
     props.setGlobalState({ theme: 'blue' });
   }
   ```

2. **自定义全局状态管理方案**:
   - 开发专用的状态管理库
   - 实现状态分片，不同子应用关注不同状态片段
   - 提供权限控制，限制应用对状态的修改范围

3. **基于现有状态管理库的扩展**:
   - 将Redux/Vuex/MobX等库进行封装
   - 实现子应用状态的隔离与共享
   - 提供中间件机制处理跨应用状态同步

4. **事件驱动的状态共享**:
   - 基于发布/订阅模式实现数据共享
   - 避免直接的状态依赖，降低耦合

### 20. 如何处理qiankun中的错误边界和容错机制？
错误处理与容错机制：

1. **应用级错误隔离**:
   - 利用React ErrorBoundary或Vue的errorCaptured
   - 子应用崩溃不影响主应用和其他子应用
   ```javascript
   // React错误边界组件
   class ErrorBoundary extends React.Component {
     state = { hasError: false, error: null };
     
     static getDerivedStateFromError(error) {
       return { hasError: true, error };
     }
     
     componentDidCatch(error, info) {
       console.error('子应用错误:', error, info);
     }
     
     render() {
       if (this.state.hasError) {
         return <div>子应用加载失败</div>;
       }
       return this.props.children;
     }
   }
   
   // 使用
   <ErrorBoundary>
     <div id="subapp-container"></div>
   </ErrorBoundary>
   ```

2. **生命周期错误处理**:
   - 捕获子应用生命周期函数中的错误
   ```javascript
   registerMicroApp({
     name: 'app1',
     // ...
     loader(loading) {
       // 加载状态处理
     },
     errorCallback(error) {
       // 错误处理
       console.error('子应用加载错误:', error);
     }
   });
   ```

3. **全局错误监控**:
   - 实现window.onerror和unhandledrejection全局捕获
   - 区分和标记不同应用的错误来源

4. **灾备方案**:
   - 子应用加载失败时的备用UI
   - 超时处理和重试机制
   - 应用级降级策略
