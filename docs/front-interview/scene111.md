---
title: 高频场景面试专题
createTime: 2025/04/29 09:54:54
---

## 1、如何在浏览器中执行100万个任务，并保证页面不卡顿？

**思路：** 任务分批做处理，避免主线程阻塞
直接在浏览器主线程一次性执行100万个任务，会导致页面卡顿甚至无响应。常用的做法是将任待下一帧或下一个空闲时间再继续。
**常用方案**
- requestAnimationFrame:每一帧处理一部分任务,适合动画、渲染相关任务，每帧执行，和页面刷新同步。 
- setTimeout/setInterval:通过定时器分批处理任务，间隔执行，避免长时间占用主线程,适合通用分批任务，兼容性好，但精度较低。
- MessageChanne:利用微任务队列，分批调度任务，性能优于setTimeout,适合需要更高精度的分批任务。
- requestldleCallback:浏览器空闲时才执行任务，适合低优先级、可延迟的任务，只有浏览器空闲时才执行。



## 2、如何在页面内一次性渲染10万条数据，并保证页面不卡顿？

**思路：** 避免一次性渲染全部数据，采用分批渲染、虚拟列表等技术优化渲染性能

**常用方案：**

### 1. 分批次渲染

将大量数据分成多个小批次，利用 `setTimeout` 或 `requestAnimationFrame` 在不同的事件循环中渲染。

```javascript
// 假设有10万条数据
const total = 100000;
const data = Array.from({ length: total }, (_, i) => ({ id: i, name: `Item ${i}` }));
const container = document.getElementById('container');
const batchSize = 500; // 每批渲染数量
const batchCount = Math.ceil(total / batchSize); // 总批次数

function renderBatch(batchIndex) {
  if (batchIndex >= batchCount) return;
  
  const fragment = document.createDocumentFragment();
  const start = batchIndex * batchSize;
  const end = Math.min(start + batchSize, total);
  
  for (let i = start; i < end; i++) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.textContent = data[i].name;
    fragment.appendChild(item);
  }
  
  container.appendChild(fragment);
  
  // 使用requestAnimationFrame在下一帧渲染下一批
  requestAnimationFrame(() => {
    renderBatch(batchIndex + 1);
  });
}

// 开始渲染
renderBatch(0);
```

### 2. 虚拟列表（Virtual List）

只渲染可视区域内的数据，当用户滚动时动态替换列表项内容。

```javascript
class VirtualList {
  constructor(options) {
    this.container = options.container;
    this.data = options.data;
    this.itemHeight = options.itemHeight;
    this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight) + 2; // 可见项+缓冲区
    this.scrollTop = 0;
    this.startIndex = 0;
    
    this.init();
  }
  
  init() {
    // 创建容器样式
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    // 创建内容区，高度等于所有项的总高度
    this.content = document.createElement('div');
    this.content.style.height = `${this.data.length * this.itemHeight}px`;
    this.content.style.position = 'relative';
    this.container.appendChild(this.content);
    
    // 创建可视项容器
    this.visibleList = document.createElement('div');
    this.content.appendChild(this.visibleList);
    
    // 监听滚动事件
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    
    // 初始渲染
    this.render();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }
  
  render() {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(this.startIndex + this.visibleCount, this.data.length);
    
    // 清空当前列表
    this.visibleList.innerHTML = '';
    
    // 添加可见项
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.style.position = 'absolute';
      item.style.top = `${i * this.itemHeight}px`;
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.data[i].name;
      
      this.visibleList.appendChild(item);
    }
  }
}

// 使用示例
const data = Array.from({ length: 100000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
const container = document.getElementById('container');
const virtualList = new VirtualList({
  container,
  data,
  itemHeight: 40
});
```

### 3. 时间分片 + DocumentFragment

使用 DocumentFragment 减少回流重绘，再结合时间分片处理。

```javascript
function renderWithTimeSlicing(data) {
  const container = document.getElementById('container');
  const total = data.length;
  const batchSize = 500;
  const batchCount = Math.ceil(total / batchSize);
  let batchIndex = 0;
  
  function process() {
    if (batchIndex >= batchCount) return;
    
    const fragment = document.createDocumentFragment();
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, total);
    
    for (let i = start; i < end; i++) {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.textContent = data[i].name;
      fragment.appendChild(item);
    }
    
    container.appendChild(fragment);
    batchIndex++;
    
    // 下一帧继续处理
    requestAnimationFrame(process);
  }
  
  process();
}
```

### 4. 使用框架提供的虚拟列表组件

现代前端框架提供了成熟的虚拟列表解决方案：

**React：**
```jsx
import { FixedSizeList } from 'react-window';

// 10万条数据
const data = Array.from({ length: 100000 }, (_, i) => ({ id: i, name: `Item ${i}` }));

// 单个列表项渲染函数
const Row = ({ index, style }) => (
  <div style={style} className="list-item">
    {data[index].name}
  </div>
);

// 渲染虚拟列表
function VirtualizedList() {
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={data.length}
      itemSize={40}
    >
      {Row}
    </FixedSizeList>
  );
}
```

**Vue：**
```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="40"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="list-item">{{ item.name }}</div>
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  components: { RecycleScroller },
  data() {
    return {
      items: Array.from({ length: 100000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
    }
  }
}
</script>
```

## 3、前端如何实现无感知刷新token？

**思路：** 利用拦截器和请求队列管理，在token过期时自动刷新并重试原请求

**方案实现：**

### 1. 基于 Axios 拦截器实现

```javascript
import axios from 'axios';

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 是否正在刷新token的标记
let isRefreshing = false;
// 请求队列，存储因token过期而挂起的请求
let requestsQueue = [];

// 刷新token的函数
async function refreshToken() {
  try {
    const res = await axios.post('/auth/refresh', {
      refresh_token: localStorage.getItem('refreshToken')
    });
    
    // 保存新token
    const { token, refreshToken } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    return token;
  } catch (error) {
    // 刷新token失败，可能需要重新登录
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return Promise.reject(error);
  }
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 为每个请求添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data;
  },
  async error => {
    if (!error.response) {
      return Promise.reject(error);
    }
    
    const { config, response } = error;
    
    // 如果是401错误（未授权，token过期）
    if (response.status === 401) {
      // 判断是否配置了重试，防止死循环
      if (!config || config.__retry) {
        return Promise.reject(error);
      }
      
      if (!isRefreshing) {
        // 开始刷新token
        isRefreshing = true;
        
        try {
          // 获取新token
          const newToken = await refreshToken();
          
          // 标记请求为已重试
          config.__retry = true;
          config.headers['Authorization'] = `Bearer ${newToken}`;
          
          // 重新发送队列中的请求
          requestsQueue.forEach(cb => cb(newToken));
          // 清空队列
          requestsQueue = [];
          
          // 重试当前请求
          return service(config);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 正在刷新token，将请求加入队列
        return new Promise(resolve => {
          requestsQueue.push(newToken => {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(service(config));
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default service;
```

### 2. 利用 HTTP 状态码和特定错误码判断

```javascript
// 判断token状态的工具函数
function isTokenExpired(error) {
  return (
    error.response &&
    (error.response.status === 401 ||
     (error.response.status === 200 && error.response.data.code === 'TOKEN_EXPIRED'))
  );
}
```

### 3. 前端根据JWT解析过期时间进行预刷新

```javascript
// 解析JWT获取过期时间
function getTokenExpirationTime(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // 转换为毫秒
  } catch (e) {
    return null;
  }
}

// 判断token是否即将过期(还有10分钟过期)
function isTokenSoonExpired() {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return true;
  
  // 如果token在10分钟内过期，判断为即将过期
  return Date.now() + 10 * 60 * 1000 > expirationTime;
}

// 在适当时机检查并预刷新token
async function checkAndRefreshToken() {
  if (isTokenSoonExpired()) {
    try {
      await refreshToken();
    } catch (error) {
      console.error('预刷新token失败', error);
    }
  }
}

// 可以在路由切换时调用
router.beforeEach((to, from, next) => {
  checkAndRefreshToken().then(() => next());
});
```

### 4. 完整的实际应用示例

```javascript
// auth.js - 认证相关逻辑
class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.setupInterceptors();
  }
  
  // 订阅token刷新
  subscribeTokenRefresh(cb) {
    this.refreshSubscribers.push(cb);
  }
  
  // 执行被挂起的请求
  onTokenRefreshed(newToken) {
    this.refreshSubscribers.forEach(cb => cb(newToken));
    this.refreshSubscribers = [];
  }
  
  // 刷新token
  async refreshToken() {
    try {
      const response = await axios.post('/auth/refresh', {
        refresh_token: localStorage.getItem('refreshToken')
      });
      
      const { token, refreshToken } = response.data;
      this.setTokens(token, refreshToken);
      return token;
    } catch (error) {
      this.logout();
      return Promise.reject(error);
    }
  }
  
  // 设置token
  setTokens(token, refreshToken) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  // 登出
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  
  // 设置拦截器
  setupInterceptors() {
    axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // 如果是401错误且没有重试过
        if (isTokenExpired(error) && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 等待token刷新，之后重试请求
            return new Promise(resolve => {
              this.subscribeTokenRefresh(token => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(axios(originalRequest));
              });
            });
          }
          
          originalRequest._retry = true;
          this.isRefreshing = true;
          
          try {
            const newToken = await this.refreshToken();
            this.onTokenRefreshed(newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
}

export default new AuthService();
```

## 4、实现一个页面操作不会整页刷新的网站，并且能在浏览器前进、后退时正确响应？

**思路：** 使用前端路由技术，通过 History API 或 Hash 来管理页面状态和导航

**常用方案：**

### 1. 使用 History API 实现

History API 提供了对浏览器会话历史的访问，允许我们添加状态到历史记录中。

```javascript
class Router {
  constructor(routes) {
    this.routes = routes; // 路由映射
    this.currentPath = '/';
    
    // 监听 popstate 事件处理浏览器前进后退
    window.addEventListener('popstate', this.handlePopState.bind(this));
    
    // 拦截所有 a 标签点击事件
    document.addEventListener('click', this.handleClick.bind(this));
    
    // 初始化
    this.init();
  }
  
  init() {
    // 获取当前路径
    const path = window.location.pathname;
    this.navigate(path, false); // 不添加新历史记录
  }
  
  handlePopState(event) {
    // 浏览器前进后退时执行
    const path = window.location.pathname;
    this.renderContent(path);
  }
  
  handleClick(event) {
    // 拦截内部链接的点击
    if (event.target.tagName === 'A') {
      const href = event.target.getAttribute('href');
      
      // 只处理内部链接
      if (href && href.startsWith('/')) {
        event.preventDefault();
        this.navigate(href);
      }
    }
  }
  
  navigate(path, addToHistory = true) {
    this.currentPath = path;
    
    // 添加到历史记录
    if (addToHistory) {
      window.history.pushState({ path }, '', path);
    }
    
    // 渲染新内容
    this.renderContent(path);
  }
  
  renderContent(path) {
    const route = this.routes.find(route => route.path === path) || this.routes.find(route => route.path === '*');
    const contentDiv = document.getElementById('content');
    
    if (route) {
      // 如果路由是函数，执行获取内容
      if (typeof route.component === 'function') {
        contentDiv.innerHTML = route.component();
      } else {
        contentDiv.innerHTML = route.component;
      }
      
      // 更新页面标题
      if (route.title) {
        document.title = route.title;
      }
    }
  }
}

// 使用示例
const router = new Router([
  {
    path: '/',
    component: '<h1>首页</h1><p>这是首页内容</p>',
    title: '首页'
  },
  {
    path: '/about',
    component: '<h1>关于我们</h1><p>这是关于页面</p>',
    title: '关于'
  },
  {
    path: '/contact',
    component: '<h1>联系我们</h1><p>这是联系页面</p>',
    title: '联系'
  },
  {
    path: '*',
    component: '<h1>404 Not Found</h1><p>页面不存在</p>',
    title: '页面不存在'
  }
]);

// 提供API导航到新页面
function goTo(path) {
  router.navigate(path);
}
```

### 2. 使用 Hash 模式实现

通过 URL hash（#）来模拟不同页面。

```javascript
class HashRouter {
  constructor(routes) {
    this.routes = routes;
    
    // 监听 hashchange 事件
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
    
    // 初始化
    this.init();
  }
  
  init() {
    // 如果没有hash，默认转到#/
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      // 否则触发一次 hashchange
      this.handleHashChange();
    }
  }
  
  handleHashChange() {
    const hash = window.location.hash.substring(1) || '/';
    this.renderContent(hash);
  }
  
  navigate(path) {
    window.location.hash = path;
  }
  
  renderContent(path) {
    const route = this.routes.find(route => route.path === path) || this.routes.find(route => route.path === '*');
    const contentDiv = document.getElementById('content');
    
    if (route) {
      if (typeof route.component === 'function') {
        contentDiv.innerHTML = route.component();
      } else {
        contentDiv.innerHTML = route.component;
      }
      
      if (route.title) {
        document.title = route.title;
      }
    }
  }
}

// 使用示例
const router = new HashRouter([
  {
    path: '/',
    component: '<h1>首页</h1><p>这是首页内容</p>',
    title: '首页'
  },
  {
    path: '/about',
    component: '<h1>关于我们</h1><p>这是关于页面</p>',
    title: '关于'
  },
  {
    path: '/contact',
    component: '<h1>联系我们</h1><p>这是联系页面</p>',
    title: '联系'
  },
  {
    path: '*',
    component: '<h1>404 Not Found</h1><p>页面不存在</p>',
    title: '页面不存在'
  }
]);

// 导航API
function goTo(path) {
  router.navigate(path);
}
```

### 3. 使用现代前端框架的路由解决方案

**React Router:**
```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/contact">联系</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return <h1>首页</h1>;
}

function About() {
  return <h1>关于页面</h1>;
}

function Contact() {
  return <h1>联系页面</h1>;
}

function NotFound() {
  return <h1>页面不存在</h1>;
}
```

**Vue Router:**
```javascript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: '首页' } },
    { path: '/about', component: About, meta: { title: '关于' } },
    { path: '/contact', component: Contact, meta: { title: '联系' } },
    { path: '/:pathMatch(.*)*', component: NotFound, meta: { title: '404' } }
  ]
});

// 处理页面标题
router.afterEach((to) => {
  document.title = to.meta.title || '默认标题';
});

// Vue 组件
const Home = { template: '<h1>首页</h1>' };
const About = { template: '<h1>关于页面</h1>' };
const Contact = { template: '<h1>联系页面</h1>' };
const NotFound = { template: '<h1>页面不存在</h1>' };
```

### 4. 处理页面状态的保存和恢复

在SPA中，页面前进后退时，需要保存和恢复页面状态（如滚动位置、表单数据等）。

```javascript
// 保存页面状态
function savePageState(path) {
  // 收集当前页面状态
  const state = {
    scrollPosition: window.scrollY,
    formData: collectFormData(),
    path
  };
  
  // 将状态存入history
  window.history.replaceState(state, '', path);
}

// 恢复页面状态
function restorePageState(state) {
  if (!state) return;
  
  // 恢复滚动位置
  setTimeout(() => {
    window.scrollTo(0, state.scrollPosition || 0);
  }, 100); // 延迟一点以确保DOM已更新
  
  // 恢复表单数据
  if (state.formData) {
    fillFormData(state.formData);
  }
}

// 收集表单数据的辅助函数
function collectFormData() {
  const forms = document.querySelectorAll('form');
  const formData = {};
  
  forms.forEach((form, index) => {
    formData[`form-${index}`] = new FormData(form);
  });
  
  return formData;
}

// 填充表单数据的辅助函数
function fillFormData(formData) {
  Object.keys(formData).forEach(formKey => {
    const form = document.querySelectorAll('form')[parseInt(formKey.split('-')[1])];
    if (!form) return;
    
    for (const [key, value] of formData[formKey].entries()) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = value;
    }
  });
}

// 路由器中使用
class Router {
  // ...之前的代码
  
  navigate(path, addToHistory = true) {
    // 在离开当前页面前保存状态
    savePageState(this.currentPath);
    
    this.currentPath = path;
    
    if (addToHistory) {
      window.history.pushState({ path }, '', path);
    }
    
    this.renderContent(path);
  }
  
  handlePopState(event) {
    const state = event.state || {};
    const path = state.path || window.location.pathname;
    
    this.currentPath = path;
    this.renderContent(path);
    
    // 恢复页面状态
    restorePageState(state);
  }
}