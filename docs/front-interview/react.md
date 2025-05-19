---
title: react
createTime: 2025/05/09 14:09:19
permalink: /article/422vfqit/
---

## 1.React的setState是同步还是异步，为什么？ 
React的setState在合成事件处理(会将多次的setState调用合并到一个更新批次)和生命周期方法中是异步的，在原生事件和定时器中是同步的。异步更新有助于优化性能，减少不必要的渲染。
React 18引入了自动批处理(Automatic Batching)，使所有setState调用默认都进行批处理，包括Promise、setTimeout等之前不会批处理的场景。

为什么采用异步更新机制：
- 性能优化：合并多次状态更新到一次渲染，减少不必要的重渲染。如果每次setState都同步更新DOM，连续多次setState会导致多次重渲染，极大影响性能。
- 一致性保证：确保组件内部状态与props保持一致性，当父组件向多个子组件传递props时，同步更新可能导致某些子组件接收到更新后的props，而其他子组件仍然使用旧props。
- 批处理更新：多个setState调用会被合并处理

如何获取更新后的状态：
- 使用setState的回调函数或componentDidUpdate生命周期

## 2、介绍react fiber?介绍一下为什么能实现空闲时执行低优先级任务？

React Fiber是React的协调引擎，允许React在浏览器主线程空闲时执行低优先级任务，通过时间切片技术将渲染工作分割成更小的任务块，从而实现任务的分片执行和优先级调度。

为什么能实现空闲时执行低优先级任务：
- requestIdleCallback模拟：React实现了自己的调度器(Scheduler)，类似于requestIdleCallback，但更可靠；
- 优先级调度：Fiber使用多级优先级系统，高优先级任务可以打断低优先级任务；
- 时间分片和让出策略：Fiber将长任务分解成小片段，每执行一个单元就检查是否需要让出控制权。

## 3、自定义Hook的设计与实现

自定义Hook是复用状态逻辑的函数，遵循Hook命名规范（以"use"开头），可以调用其他Hook。以下是几个常见自定义Hook的实现：

### useDebounce - 防抖Hook
```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用示例
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    // 仅在debouncedTerm变化时执行搜索
    searchAPI(debouncedTerm);
  }, [debouncedTerm]);
  
  return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />;
}
```

### useLocalStorage - 本地存储Hook
```jsx
function useLocalStorage(key, initialValue) {
  // 惰性初始化，只在组件挂载时读取localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // 更新localStorage并更新state
  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用示例
function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  
  return (
    <div className={darkMode ? 'dark-theme' : 'light-theme'}>
      <button onClick={() => setDarkMode(!darkMode)}>
        切换主题
      </button>
    </div>
  );
}
```

### useAsync - 异步操作Hook
```jsx
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { execute, status, value, error };
}

// 使用示例
function UserProfile({ userId }) {
  const { status, value: user, error } = useAsync(() => fetchUser(userId), true);
  
  if (status === 'pending') return <div>加载中...</div>;
  if (status === 'error') return <div>错误: {error.message}</div>;
  if (status === 'success') return <div>用户: {user.name}</div>;
  
  return null;
}
```

## 4、React的虚拟DOM及Diff算法

虚拟DOM(Virtual DOM)是React的核心概念，它是真实DOM的JavaScript对象表示。React使用虚拟DOM优化渲染性能，减少实际DOM操作。

### 虚拟DOM工作原理

1. **创建阶段**：当组件渲染时，React创建一个虚拟DOM树，表示UI的JavaScript对象
2. **Diff阶段**：当状态或属性变化时，React创建新的虚拟DOM树并与旧树进行比较(Diff)
3. **更新阶段**：基于Diff结果，React只更新实际变化的DOM节点

虚拟DOM节点结构简化示例：
```javascript
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: {
          children: 'Hello World'
        }
      },
      {
        type: 'p',
        props: {
          children: 'This is a paragraph'
        }
      }
    ]
  }
}
```

### React Diff算法的三个主要优化策略

1. **树级比较(Tree Diffing)**：
   - React采用同层比较策略，不会跨层级比较节点
   - 如果根节点类型不同，React会销毁旧树并重建新树
   - 复杂度从O(n³)降低到O(n)

2. **组件级比较(Component Diffing)**：
   - 同类型组件会复用并更新节点
   - 不同类型组件会直接替换整个子树
   - 可使用`shouldComponentUpdate`或`React.memo`优化

3. **元素级比较(Element Diffing)**：
   - 同层级子元素通过key属性进行对比
   - 无key时采用列表索引（低效）
   - 有key时可以精确找到对应节点，实现元素复用

Diff算法示例：
```jsx
// 更新前
<div>
  <p key="A">First</p>
  <p key="B">Second</p>
</div>

// 更新后
<div>
  <p key="B">Second</p>
  <p key="A">First</p>
  <p key="C">Third</p>
</div>

// 有key时：React能识别出节点仅是位置变化，并新增一个节点
// 无key时：React会认为所有节点都需要更新
```

### 虚拟DOM的优劣势

**优势**：
- 跨平台：虚拟DOM可以渲染到不同平台(Web、Native)
- 批量更新：减少DOM操作次数，提高性能
- 声明式编程：开发者只需描述UI应该是什么样，不必关心如何更新

**劣势**：
- 初始渲染可能较慢
- 内存占用增加
- 简单场景下可能不如直接操作DOM高效

## 5、React组件通信方式

React组件间有多种通信方式，根据组件关系选择合适的方法：

### 1. Props传递（父子组件通信）

```jsx
// 父组件
function Parent() {
  const [message, setMessage] = useState('Hello');
  
  const handleChildMsg = (childMsg) => {
    console.log('来自子组件的消息:', childMsg);
  };
  
  return <Child message={message} onSendMsg={handleChildMsg} />;
}

// 子组件
function Child({ message, onSendMsg }) {
  return (
    <div>
      <p>来自父组件的消息: {message}</p>
      <button onClick={() => onSendMsg('Hi from child')}>
        发送消息给父组件
      </button>
    </div>
  );
}
```

### 2. Context API（跨层级组件通信）

```jsx
// 创建Context
const ThemeContext = React.createContext('light');

// 提供者
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}

// 消费者(使用useContext钩子)
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      切换主题
    </button>
  );
}
```

### 3. Redux/Mobx（全局状态管理）

```jsx
// Redux示例
// store.js
const initialState = { counter: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { counter: state.counter + 1 };
    case 'DECREMENT':
      return { counter: state.counter - 1 };
    default:
      return state;
  }
}

export const store = createStore(counterReducer);

// 组件A
function CounterDisplay() {
  const counter = useSelector(state => state.counter);
  return <div>计数: {counter}</div>;
}

// 组件B
function CounterControls() {
  const dispatch = useDispatch();
  
  return (
    <div>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>增加</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>减少</button>
    </div>
  );
}
```

### 4. 自定义事件（发布/订阅模式）

```jsx
// 简易事件总线
class EventBus {
  constructor() {
    this.events = {};
  }
  
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    return () => {
      this.events[event] = this.events[event]
        .filter(cb => cb !== callback);
    };
  }
  
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// 使用
const eventBus = new EventBus();

// 组件A
function ComponentA() {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('message', data => {
      console.log('ComponentA received:', data);
    });
    
    return unsubscribe;
  }, []);
  
  return <button onClick={() => eventBus.publish('message', 'Hello')}>
    发送消息
  </button>;
}

// 组件B
function ComponentB() {
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('message', data => {
      setMessage(data);
    });
    
    return unsubscribe;
  }, []);
  
  return <div>收到消息: {message}</div>;
}
```

### 5. Ref转发（直接访问组件实例或DOM）

```jsx
// 子组件
const ChildComponent = forwardRef((props, ref) => {
  const childMethod = () => {
    console.log('子组件方法被调用');
  };
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    childMethod
  }));
  
  return <div>子组件</div>;
});

// 父组件
function ParentComponent() {
  const childRef = useRef(null);
  
  const handleClick = () => {
    // 调用子组件方法
    childRef.current.childMethod();
  };
  
  return (
    <div>
      <ChildComponent ref={childRef} />
      <button onClick={handleClick}>调用子组件方法</button>
    </div>
  );
}
```

## 6、React Hooks原理与常见问题

React Hooks是React 16.8引入的特性，允许在函数组件中使用状态和其他React特性。

### Hooks内部原理

1. **链表存储**：React使用链表数据结构存储Hook状态
2. **执行顺序**：Hook严格依赖于固定的执行顺序
3. **闭包特性**：每次渲染都有自己独立的props和state
4. **Fiber节点**：Hook状态存储在组件对应的Fiber节点上

```javascript
// 简化的Hook内部实现原理展示
let hooks = []; // 存储组件的所有hooks
let currentHook = 0; // 当前处理的hook索引

// useState简化实现
function useState(initialState) {
  let pair = hooks[currentHook] || [initialState, null];
  hooks[currentHook] = pair;
  
  const setState = newState => {
    hooks[currentHook][0] = newState;
    rerender(); // 触发组件重渲染
  };
  
  return [pair[0], setState];
}

// 组件渲染
function Component() {
  currentHook = 0; // 重置hook索引
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');
  
  // ...组件逻辑
  
  return <div>{/* JSX */}</div>;
}
```

### Hooks规则及常见问题

1. **Hook规则**
   - 只在最顶层使用Hook，不要在循环、条件或嵌套函数中调用
   - 只在React函数组件或自定义Hook中调用Hook

2. **常见问题与解决方案**

   a. **闭包陷阱**
   ```jsx
   function Counter() {
     const [count, setCount] = useState(0);
     
     useEffect(() => {
       const timer = setInterval(() => {
         // 问题：永远只能访问到初始值0
         console.log(count);
         // 错误：setCount(count + 1); 
         
         // 正确：使用函数式更新
         setCount(prevCount => prevCount + 1);
       }, 1000);
       
       return () => clearInterval(timer);
     }, []); // 依赖为空数组
     
     return <div>{count}</div>;
   }
   ```
   
   b. **依赖项问题**
   ```jsx
   function SearchResults({ query }) {
     const [results, setResults] = useState([]);
     
     // 问题：依赖项缺失，query变化不会触发effect
     useEffect(() => {
       fetchResults(query).then(setResults);
     }, []); // 应该是[query]
     
     return <ResultList data={results} />;
   }
   ```
   
   c. **过度重渲染**
   ```jsx
   function Button({ onClick }) {
     // 问题：每次渲染都会创建新函数，导致子组件不必要的重渲染
     const handleClick = () => {
       console.log('Clicked');
       onClick();
     };
     
     // 解决：使用useCallback
     const memoizedHandleClick = useCallback(() => {
       console.log('Clicked');
       onClick();
     }, [onClick]);
     
     return <button onClick={memoizedHandleClick}>Click me</button>;
   }
   ```

### 常用Hooks使用技巧

1. **useState技巧**
   ```jsx
   // 复杂初始状态使用函数延迟计算
   const [state, setState] = useState(() => {
     const initialState = complexComputation();
     return initialState;
   });
   
   // 合并状态更新
   const [form, setForm] = useState({ name: '', email: '' });
   
   const handleChange = e => {
     setForm({
       ...form,
       [e.target.name]: e.target.value
     });
   };
   ```

2. **useEffect技巧**
   ```jsx
   // 依赖项处理
   function Component({ id, onDataChange }) {
     const stableOnDataChange = useCallback(onDataChange, []);
     
     useEffect(() => {
       const data = fetchData(id);
       stableOnDataChange(data);
     }, [id, stableOnDataChange]);
   }
   
   // 条件执行
   useEffect(() => {
     if (id) {
       fetchData(id);
     }
   }, [id]);
   ```

3. **useRef在Hooks间共享数据**
   ```jsx
   function CounterWithPrevious() {
     const [count, setCount] = useState(0);
     const prevCountRef = useRef();
     
     useEffect(() => {
       prevCountRef.current = count;
     });
     
     const prevCount = prevCountRef.current;
     
     return (
       <div>
         <p>当前: {count}, 之前: {prevCount}</p>
         <button onClick={() => setCount(count + 1)}>增加</button>
       </div>
     );
   }
   ```

## 7、React性能优化最佳实践

React应用性能优化涉及多个方面，以下是常见的优化策略：

### 1. 避免不必要的重渲染

a. **使用React.memo包装组件**
```jsx
// 仅当props变化时重渲染
const MemoizedComponent = React.memo(function MyComponent(props) {
  // 组件实现
});

// 自定义比较逻辑
const areEqual = (prevProps, nextProps) => {
  return prevProps.id === nextProps.id; // 仅比较id
};

const MemoizedWithCustomCompare = React.memo(MyComponent, areEqual);
```

b. **useMemo缓存计算结果**
```jsx
function ProductList({ products, filter }) {
  // 仅当products或filter变化时重新计算
  const filteredProducts = useMemo(() => {
    console.log('过滤产品...');
    return products.filter(product => product.name.includes(filter));
  }, [products, filter]);
  
  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

c. **useCallback记忆回调函数**
```jsx
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // 避免每次渲染都创建新函数
  const handleClick = useCallback(() => {
    console.log('按钮被点击');
  }, []); // 空依赖数组，函数永远不变
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <ExpensiveChild onClick={handleClick} />
    </div>
  );
}
```

### 2. 大列表优化

a. **虚拟滚动**
```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>Item {items[index]}</div>
  );
  
  return (
    <FixedSizeList
      height={500}
      width={300}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
```

b. **列表项使用key优化更新**
```jsx
function ItemList({ items }) {
  return (
    <ul>
      {items.map(item => (
        // 使用稳定且唯一的key，避免使用索引
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 3. 代码分割和懒加载

a. **React.lazy和Suspense实现组件懒加载**
```jsx
import React, { Suspense, lazy } from 'react';

// 懒加载组件
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

b. **基于路由的代码分割**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

// 懒加载路由组件
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Contact = lazy(() => import('./Contact'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 4. 状态管理优化

a. **状态下移**：将状态尽可能下移到需要它的组件
```jsx
// 不好的做法：将状态放在顶层，所有子组件都重渲染
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Header />
      <Main count={count} setCount={setCount} />
      <Footer />
    </div>
  );
}

// 较好的做法：将状态下移到实际需要的组件
function App() {
  return (
    <div>
      <Header />
      <Main /> {/* 内部管理count状态 */}
      <Footer />
    </div>
  );
}
```

b. **使用Context优化props drilling**
```jsx
// 避免多层传递props
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  );
}

// 深层嵌套组件可直接访问user
function UserProfile() {
  const { user } = useContext(UserContext);
  return <div>{user.name}</div>;
}
```

### 5. 工具与实践

a. **使用Chrome React DevTools进行性能分析**
   - 使用Profiler分析组件渲染性能
   - 找出重渲染瓶颈

b. **使用React.StrictMode发现问题**
```jsx
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

c. **使用Lighthouse分析页面性能**

d. **避免不必要的内联函数和对象**
```jsx
// 不好的做法：每次渲染都创建新对象
function Component() {
  return <ChildComponent style={{ margin: 0 }} />;
}

// 较好的做法：使用常量
const styles = { margin: 0 };
function Component() {
  return <ChildComponent style={styles} />;
}
```

## 8、Redux核心概念与工作流程

Redux是一个可预测状态容器，基于Flux架构，常用于管理中大型React应用的状态。

### 三大原则

1. **单一数据源**：整个应用的状态存储在单个store的对象树中
2. **状态只读**：唯一改变状态的方法是触发action
3. **使用纯函数reducer**：描述如何根据action更新状态

### 核心概念

1. **Action**：描述发生了什么的普通JS对象
```javascript
{
  type: 'ADD_TODO',
  payload: {
    id: 1,
    text: '学习Redux',
    completed: false
  }
}
```

2. **Action Creator**：创建action的函数
```javascript
function addTodo(text) {
  return {
    type: 'ADD_TODO',
    payload: {
      id: Date.now(),
      text,
      completed: false
    }
  };
}
```

3. **Reducer**：根据action更新state的纯函数
```javascript
function todoReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}
```

4. **Store**：将action和reducer联系到一起的对象
```javascript
import { createStore } from 'redux';
const store = createStore(todoReducer);
```

5. **Dispatch**：将action发送到store的方法
```javascript
store.dispatch(addTodo('学习Redux'));
```

6. **Selector**：从store中提取特定数据的函数
```javascript
function getCompletedTodos(state) {
  return state.filter(todo => todo.completed);
}
```

### 数据流过程

Redux遵循严格的单向数据流：

1. **触发Action**：用户交互或系统事件触发action
2. **Dispatch**：将action发送到store
3. **Reducer处理**：reducer接收当前state和action，返回新state
4. **Store更新**：store更新状态
5. **UI更新**：订阅store的组件收到通知并更新

```
用户操作 → dispatch(action) → reducer(state, action) → 新state → 组件更新
```

### Redux与React集成

使用react-redux库集成Redux与React：

```jsx
// 创建store
const store = createStore(rootReducer);

// 提供store
function App() {
  return (
    <Provider store={store}>
      <TodoApp />
    </Provider>
  );
}

// 连接组件
function TodoList({ todos, toggleTodo }) {
  return (
    <ul>
      {todos.map(todo => (
        <li
          key={todo.id}
          onClick={() => toggleTodo(todo.id)}
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// 使用hooks连接Redux
function ConnectedTodoList() {
  // 获取状态
  const todos = useSelector(state => state.todos);
  // 获取dispatch
  const dispatch = useDispatch();
  
  const toggleTodo = id => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };
  
  return <TodoList todos={todos} toggleTodo={toggleTodo} />;
}
```

### Redux中间件

中间件提供了扩展Redux的能力，拦截action，支持异步操作等：

```javascript
// redux-thunk中间件示例
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

// 异步action creator
function fetchTodos() {
  return async dispatch => {
    dispatch({ type: 'FETCH_TODOS_REQUEST' });
    
    try {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      dispatch({ type: 'FETCH_TODOS_SUCCESS', payload: todos });
    } catch (error) {
      dispatch({ type: 'FETCH_TODOS_FAILURE', payload: error.message });
    }
  };
}

// 使用
store.dispatch(fetchTodos());
```

### Redux Toolkit

Redux Toolkit是Redux官方推荐的工具集，简化了Redux的使用：

```javascript
import { configureStore, createSlice } from '@reduxjs/toolkit';

// 创建slice
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      // 可以"直接修改"状态，内部使用Immer
      state.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }
  }
});

// 导出action creators
export const { addTodo, toggleTodo } = todosSlice.actions;

// 创建store
const store = configureStore({
  reducer: {
    todos: todosSlice.reducer
  }
});
```

## 9、React Router的工作原理与使用

React Router是React应用中实现路由的标准库，支持Web和原生应用。

### React Router 6核心概念

1. **路由类型**
   - `BrowserRouter`: 使用HTML5 history API
   - `HashRouter`: 使用URL hash部分
   - `MemoryRouter`: 在内存中管理历史记录，适用于测试和非浏览器环境

2. **路由匹配组件**
   - `Routes`: 路由匹配容器
   - `Route`: 定义路径与组件的映射关系

3. **导航组件**
   - `Link`: 声明式导航
   - `NavLink`: 带激活状态的Link
   - `Navigate`: 编程式重定向

4. **钩子函数**
   - `useParams`: 访问URL参数
   - `useNavigate`: 导航到其他路由
   - `useLocation`: 获取当前位置信息
   - `useSearchParams`: 获取和修改查询参数
   - `useMatch`: 判断路径是否匹配

### 基本路由设置

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet
} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/products">产品</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />}>
          <Route index element={<ProductsList />} />
          <Route path=":id" element={<ProductDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 嵌套路由

```jsx
// 父路由
function Products() {
  return (
    <div>
      <h1>产品页面</h1>
      <nav>
        <Link to="/products/featured">热门产品</Link>
        <Link to="/products/new">新产品</Link>
      </nav>
      
      {/* 子路由渲染在这里 */}
      <Outlet />
    </div>
  );
}

// App.jsx中的路由配置
<Routes>
  <Route path="/products" element={<Products />}>
    <Route index element={<AllProducts />} />
    <Route path="featured" element={<FeaturedProducts />} />
    <Route path="new" element={<NewProducts />} />
    <Route path=":id" element={<ProductDetail />} />
  </Route>
</Routes>
```

### 路由参数与查询参数

```jsx
import { useParams, useSearchParams } from 'react-router-dom';

function ProductDetail() {
  // 获取URL参数 (例如: /products/42)
  const { id } = useParams();
  
  // 获取查询参数 (例如: /products/42?color=red&size=large)
  const [searchParams] = useSearchParams();
  const color = searchParams.get('color');
  const size = searchParams.get('size');
  
  return (
    <div>
      <h2>产品 {id} 的详情</h2>
      {color && <p>颜色: {color}</p>}
      {size && <p>尺寸: {size}</p>}
    </div>
  );
}
```

### 编程式导航

```jsx
import { useNavigate } from 'react-router-dom';

function ProductForm() {
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const productId = await saveProduct();
    
    // 导航到新产品页面
    navigate(`/products/${productId}`, { 
      state: { fromForm: true },  // 传递状态
      replace: false              // 是否替换历史记录
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
      <button type="submit">保存</button>
      <button type="button" onClick={() => navigate(-1)}>返回</button>
    </form>
  );
}
```

### 保护路由(路由守卫)

```jsx
import { Navigate, useLocation } from 'react-router-dom';

// 需要认证的路由
function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = checkIfUserIsAuthenticated();
  
  if (!isAuthenticated) {
    // 重定向到登录页，保存尝试访问的路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 使用
<Routes>
  <Route path="/profile" element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  } />
</Routes>
```

### 路由数据加载和异步处理

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProduct(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadProduct();
  }, [id]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!product) return <div>产品不存在</div>;
  
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>价格: ${product.price}</p>
    </div>
  );
}
```

## 10、函数组件vs类组件

React提供两种主要的组件定义方式：函数组件和类组件。React团队越来越倾向于函数组件和Hooks，但理解两者区别仍然重要。

### 基本语法对比

**函数组件**
```jsx
import React, { useState, useEffect } from 'react';

function Counter(props) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `点击了 ${count} 次`;
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**类组件**
```jsx
import React, { Component } from 'react';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  componentDidUpdate() {
    document.title = `点击了 ${this.state.count} 次`;
  }
  
  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```

### 主要区别

1. **状态管理**
   - 函数组件：使用useState和useReducer钩子
   - 类组件：使用this.state和this.setState()

2. **生命周期**
   - 函数组件：使用useEffect等Hook模拟生命周期
   - 类组件：使用componentDidMount、componentDidUpdate等方法
   
   ```jsx
   // 类组件生命周期
   componentDidMount() {
     // 组件挂载后
   }
   
   componentDidUpdate(prevProps, prevState) {
     // 组件更新后
   }
   
   componentWillUnmount() {
     // 组件卸载前
   }
   
   // 函数组件等效实现
   useEffect(() => {
     // componentDidMount
     
     return () => {
       // componentWillUnmount
     };
   }, []); // 空依赖数组
   
   useEffect(() => {
     // componentDidUpdate(特定依赖变化时)
   }, [dependency]);
   ```

3. **this关键字**
   - 函数组件：没有this，不需要绑定
   - 类组件：使用this访问props和state，需处理this绑定问题

4. **代码风格**
   - 函数组件：更简洁，逻辑按功能组织
   - 类组件：逻辑分散在生命周期方法中

5. **性能**
   - 函数组件：内存占用更小，没有实例创建开销
   - 类组件：创建实例，稍微占用更多内存

6. **逻辑复用**
   - 函数组件：使用自定义Hook复用逻辑
   - 类组件：使用HOC或render props

7. **捕获值特性**
   - 函数组件：函数闭包捕获渲染时的props和state
   - 类组件：总是使用最新的this.props和this.state

### 捕获值的例子

**函数组件中的闭包特性**
```jsx
function ProfilePage({ user }) {
  const showMessage = () => {
    alert(`Hello, ${user.name}`);
  };
  
  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };
  
  return <button onClick={handleClick}>Follow</button>;
}
```
当用户点击按钮后，即使ProfilePage组件接收到新的user prop，3秒后显示的消息仍然使用点击时的user值。

**类组件中的最新引用**
```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert(`Hello, ${this.props.user.name}`);
  };
  
  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };
  
  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```
这里3秒后显示的消息将使用最新的this.props.user，可能已经改变。

### 使用场景推荐

1. **推荐使用函数组件的场景**
   - 新项目开发
   - 简单展示组件
   - 需要使用Hooks特性
   - 性能敏感场景
   - 逻辑需要按功能组织

2. **类组件仍然适用的场景**
   - 维护老项目
   - 需要使用错误边界(Error Boundaries)
   - 团队更熟悉类组件

### React团队的建议

React团队明确表示函数组件+Hooks是React的未来发展方向，因为：
- 函数组件更符合React的理念
- 便于代码分割和树摇动(tree-shaking)
- 逻辑组织更清晰，按关注点分离
- 为未来的优化和并发特性做准备
