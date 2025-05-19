---
title: React全栈开发
description: React核心概念、Hooks模式、状态管理与最佳实践
head:
  - - meta
    - name: keywords
      content: React, Hooks, 组件设计, 状态管理, 性能优化, 服务端渲染
---

# React全栈开发

## React基础

### React核心概念
- **JSX语法**
  - JSX本质与原理
  
    JSX是JavaScript的语法扩展，允许在JavaScript中编写类似HTML的代码。它实际上是`React.createElement()`函数的语法糖，最终会被Babel等工具转换为React函数调用。

    ```jsx
    // JSX语法
    const element = <h1 className="greeting">Hello, world!</h1>;
    
    // 编译后的JavaScript
    const element = React.createElement(
      'h1',
      {className: 'greeting'},
      'Hello, world!'
    );
    ```

  - createElement函数
  
    createElement是React的核心API，接收三个参数：元素类型、属性对象和子元素。

    ```jsx
    // createElement基本语法
    React.createElement(
      type,      // 标签名或React组件
      props,     // 属性对象
      ...children // 子元素
    )
    
    // 创建嵌套元素
    const nestedElement = React.createElement(
      'div',
      { className: 'container' },
      React.createElement('h1', null, '标题'),
      React.createElement('p', null, '段落内容')
    );
    ```

  - 表达式与变量
  
    JSX中可以通过花括号`{}`嵌入任何JavaScript表达式。

    ```jsx
    const name = 'John';
    const element = <h1>Hello, {name}!</h1>;
    
    // 可以在属性中使用表达式
    const imgUrl = 'https://example.com/image.jpg';
    const imgElement = <img src={imgUrl} alt="示例图片" />;
    
    // 可以使用复杂表达式
    const element2 = <h2>{user.isLoggedIn ? `Welcome back, ${user.name}` : 'Please sign in'}</h2>;
    ```

  - 条件渲染
  
    JSX中实现条件渲染有多种方式。

    ```jsx
    // 1. 使用if语句（JSX外部）
    let content;
    if (isLoggedIn) {
      content = <UserGreeting />;
    } else {
      content = <GuestGreeting />;
    }
    
    // 2. 使用三元运算符
    const element = (
      <div>
        {isLoggedIn ? <UserGreeting /> : <GuestGreeting />}
      </div>
    );
    
    // 3. 使用逻辑与运算符实现"且"条件
    const element2 = (
      <div>
        {isLoggedIn && <UserDashboard />}
      </div>
    );
    
    // 4. 使用立即执行函数进行复杂条件逻辑
    const element3 = (
      <div>
        {(() => {
          if (status === 'loading') return <Loader />;
          if (status === 'error') return <ErrorMessage />;
          return <Content />;
        })()}
      </div>
    );
    ```

  - 列表渲染
  
    使用map方法可以高效地渲染列表元素。

    ```jsx
    const numbers = [1, 2, 3, 4, 5];
    
    // 基本列表渲染
    const listItems = (
      <ul>
        {numbers.map(number => (
          <li key={number.toString()}>
            {number}
          </li>
        ))}
      </ul>
    );
    
    // 组件列表渲染
    const todoItems = todos.map(todo => (
      <TodoItem 
        key={todo.id} 
        text={todo.text} 
        completed={todo.completed} 
      />
    ));
    
    // key的重要性: React使用key来识别元素，帮助高效更新虚拟DOM
    ```

- **组件基础**
  - 函数组件
  
    函数组件是最简单的React组件形式，本质上是接收props并返回React元素的JavaScript函数。

    ```jsx
    // 基本函数组件
    function Welcome(props) {
      return <h1>Hello, {props.name}</h1>;
    }
    
    // 使用箭头函数
    const Welcome = (props) => {
      return <h1>Hello, {props.name}</h1>;
    };
    
    // 使用组件
    const element = <Welcome name="Sara" />;
    
    // 解构props
    function Profile({ name, avatar, bio }) {
      return (
        <div className="profile">
          <img src={avatar} alt={name} />
          <h2>{name}</h2>
          <p>{bio}</p>
        </div>
      );
    }
    ```

  - 类组件对比
  
    类组件提供了更多功能，如状态和生命周期方法，但在Hooks引入后，函数组件的功能已经非常完备。

    ```jsx
    // 基本类组件
    class Welcome extends React.Component {
      render() {
        return <h1>Hello, {this.props.name}</h1>;
      }
    }
    
    // 带状态的类组件
    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
        this.increment = this.increment.bind(this); // 绑定this
      }
      
      increment() {
        this.setState({ count: this.state.count + 1 });
      }
      
      render() {
        return (
          <div>
            <p>Count: {this.state.count}</p>
            <button onClick={this.increment}>Increment</button>
          </div>
        );
      }
    }
    
    // 等效的函数组件（使用Hooks）
    function Counter() {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      );
    }
    ```

  - 组件生命周期
  
    类组件有多个生命周期方法，它们在组件的不同阶段被调用。

    ```jsx
    class LifecycleDemo extends React.Component {
      constructor(props) {
        super(props);
        this.state = { data: null };
        console.log('1. Constructor: 组件实例化');
      }
      
      static getDerivedStateFromProps(props, state) {
        console.log('2. getDerivedStateFromProps: 从props派生state');
        return null;
      }
      
      componentDidMount() {
        console.log('4. componentDidMount: 组件已挂载');
        // 通常在这里进行数据获取
        fetch('https://api.example.com/data')
          .then(response => response.json())
          .then(data => this.setState({ data }));
      }
      
      shouldComponentUpdate(nextProps, nextState) {
        console.log('5. shouldComponentUpdate: 判断是否应该更新');
        return true; // 返回false会阻止更新
      }
      
      getSnapshotBeforeUpdate(prevProps, prevState) {
        console.log('6. getSnapshotBeforeUpdate: 更新前获取快照');
        return null;
      }
      
      componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('7. componentDidUpdate: 组件已更新');
        // 可以在这里对DOM进行操作
      }
      
      componentWillUnmount() {
        console.log('8. componentWillUnmount: 组件即将卸载');
        // 清理工作：取消订阅、清除定时器等
      }
      
      render() {
        console.log('3. render: 渲染组件');
        return <div>Lifecycle Demo</div>;
      }
    }
    ```

  - 组件通信方式
  
    React组件间有多种通信方式。

    ```jsx
    // 1. 父组件向子组件传递props
    function Parent() {
      const [message, setMessage] = useState('Hello from parent');
      
      return <Child message={message} />;
    }
    
    function Child({ message }) {
      return <p>{message}</p>;
    }
    
    // 2. 子组件向父组件通信（通过回调函数）
    function Parent() {
      const [count, setCount] = useState(0);
      
      const handleIncrement = () => {
        setCount(count + 1);
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <Child onIncrement={handleIncrement} />
        </div>
      );
    }
    
    function Child({ onIncrement }) {
      return <button onClick={onIncrement}>Increment</button>;
    }
    
    // 3. 兄弟组件通信（通过共同的父组件）
    function Parent() {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <SiblingA count={count} />
          <SiblingB onIncrement={() => setCount(count + 1)} />
        </div>
      );
    }
    
    // 4. 使用Context API进行跨层级通信
    const ThemeContext = React.createContext('light');
    
    function App() {
      return (
        <ThemeContext.Provider value="dark">
          <Toolbar />
        </ThemeContext.Provider>
      );
    }
    
    function Toolbar() {
      return <ThemedButton />;
    }
    
    function ThemedButton() {
      const theme = useContext(ThemeContext);
      return <button className={theme}>Themed Button</button>;
    }
    ```

  - 渲染流程
  
    React的渲染流程包含多个步骤，从组件到真实DOM。

    ```jsx
    // React渲染流程简化图解
    /**
     * 1. JSX -> React.createElement() -> 虚拟DOM（React元素）
     * 2. 虚拟DOM -> 协调算法(Reconciliation) -> 找出差异
     * 3. 差异 -> 应用到真实DOM -> 浏览器渲染
     */
    
    // 渲染示例
    function App() {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
    
    // 每次状态更新，React会：
    // 1. 调用App函数得到新的React元素树
    // 2. 将新树与上一次渲染的树进行对比
    // 3. 计算需要更新的部分
    // 4. 只更新必要的DOM节点（在这个例子中，只更新p标签的内容）
    ```

- **Props与State**
  - Props传递与接收
  
    Props是React组件的输入，用于父组件向子组件传递数据。

    ```jsx
    // 基本props传递
    function ParentComponent() {
      return <ChildComponent name="John" age={25} isActive={true} />;
    }
    
    // 在子组件中接收props
    function ChildComponent(props) {
      return (
        <div>
          <p>Name: {props.name}</p>
          <p>Age: {props.age}</p>
          <p>Active: {props.isActive ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    
    // 使用解构接收props
    function ChildComponent({ name, age, isActive }) {
      return (
        <div>
          <p>Name: {name}</p>
          <p>Age: {age}</p>
          <p>Active: {isActive ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    
    // 默认props
    function Button({ text = 'Click me', onClick }) {
      return <button onClick={onClick}>{text}</button>;
    }
    
    // 类型检查（使用PropTypes）
    import PropTypes from 'prop-types';
    
    function Profile({ name, age }) {
      return (
        <div>
          <h2>{name}</h2>
          <p>Age: {age}</p>
        </div>
      );
    }
    
    Profile.propTypes = {
      name: PropTypes.string.isRequired,
      age: PropTypes.number
    };
    ```

  - State管理
  
    State是组件内部的可变数据，当state变化时会触发组件重新渲染。

    ```jsx
    // 类组件中的state
    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }
      
      increment = () => {
        // setState是异步的
        this.setState({ count: this.state.count + 1 });
      }
      
      // 使用函数形式的setState确保使用最新state
      incrementSafely = () => {
        this.setState(prevState => ({
          count: prevState.count + 1
        }));
      }
      
      // 批量更新state
      incrementTwice = () => {
        this.setState(prevState => ({ count: prevState.count + 1 }));
        this.setState(prevState => ({ count: prevState.count + 1 }));
      }
      
      render() {
        return (
          <div>
            <p>Count: {this.state.count}</p>
            <button onClick={this.increment}>Increment</button>
            <button onClick={this.incrementSafely}>Increment Safely</button>
            <button onClick={this.incrementTwice}>Increment Twice</button>
          </div>
        );
      }
    }
    
    // 函数组件中使用useState Hook
    function Counter() {
      const [count, setCount] = useState(0);
      
      // 基本更新
      const increment = () => {
        setCount(count + 1);
      };
      
      // 使用函数形式确保使用最新state
      const incrementSafely = () => {
        setCount(prevCount => prevCount + 1);
      };
      
      // 批量更新
      const incrementTwice = () => {
        setCount(prevCount => prevCount + 1);
        setCount(prevCount => prevCount + 1);
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
          <button onClick={incrementSafely}>Increment Safely</button>
          <button onClick={incrementTwice}>Increment Twice</button>
        </div>
      );
    }
    
    // 复杂状态管理（对象状态）
    function UserForm() {
      const [user, setUser] = useState({
        name: '',
        email: '',
        age: 0
      });
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 更新对象中的一个字段时，需要保留其他字段
        setUser(prevUser => ({
          ...prevUser,
          [name]: value
        }));
      };
      
      return (
        <form>
          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            name="age"
            type="number"
            value={user.age}
            onChange={handleChange}
            placeholder="Age"
          />
        </form>
      );
    }
    ```

  - 不可变数据
  
    React依赖不可变数据模式，即直接修改state会导致问题，应始终创建新的数据副本。

    ```jsx
    // 错误示例：直接修改数组
    function BadArrayUpdate() {
      const [items, setItems] = useState([1, 2, 3]);
      
      const addItem = () => {
        items.push(items.length + 1); // 错误：直接修改state
        setItems(items); // 不会触发重新渲染，因为引用没变
      };
      
      return (
        <div>
          <button onClick={addItem}>Add Item</button>
          <ul>
            {items.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      );
    }
    
    // 正确示例：创建新数组
    function GoodArrayUpdate() {
      const [items, setItems] = useState([1, 2, 3]);
      
      const addItem = () => {
        setItems([...items, items.length + 1]); // 正确：创建新数组
      };
      
      // 更多数组操作示例
      const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
      };
      
      const updateItem = (index, newValue) => {
        setItems(items.map((item, i) => i === index ? newValue : item));
      };
      
      return (
        <div>
          <button onClick={addItem}>Add Item</button>
          <ul>
            {items.map((item, index) => (
              <li key={item}>
                {item}
                <button onClick={() => removeItem(index)}>Remove</button>
                <button onClick={() => updateItem(index, item * 2)}>Double</button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    // 对象不可变更新
    function ObjectUpdateExample() {
      const [user, setUser] = useState({
        name: 'John',
        address: {
          city: 'New York',
          zipCode: '10001'
        }
      });
      
      // 更新嵌套对象属性
      const updateZipCode = (newZipCode) => {
        setUser({
          ...user,
          address: {
            ...user.address,
            zipCode: newZipCode
          }
        });
      };
      
      return (
        <div>
          <p>Name: {user.name}</p>
          <p>City: {user.address.city}</p>
          <p>Zip Code: {user.address.zipCode}</p>
          <input
            value={user.address.zipCode}
            onChange={(e) => updateZipCode(e.target.value)}
          />
        </div>
      );
    }
    ```

  - 单向数据流
  
    React中数据流是单向的，从父组件流向子组件，这使得应用更加可预测。

    ```jsx
    // 单向数据流示例
    function ParentComponent() {
      const [count, setCount] = useState(0);
      
      // 父组件控制数据，并将更新方法传递给子组件
      return (
        <div>
          <p>Parent Count: {count}</p>
          <ChildComponent 
            count={count} 
            onIncrement={() => setCount(count + 1)} 
          />
        </div>
      );
    }
    
    function ChildComponent({ count, onIncrement }) {
      // 子组件不能直接修改count，只能通过onIncrement回调
      return (
        <div>
          <p>Child Count: {count}</p>
          <button onClick={onIncrement}>Increment</button>
        </div>
      );
    }
    
    // 反面示例（不推荐）：双向绑定
    function BiDirectionalExample() {
      const [value, setValue] = useState('');
      
      return (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
    
    // 这个反面示例虽然很常见，但不是真正的反模式
    // 只是说明了单向流：state → 渲染 → 事件 → 更新state
    ```

  - Props drilling问题
  
    Props drilling是指为了将数据传递到深层嵌套组件，需要通过许多中间组件传递props的情况。

    ```jsx
    // Props drilling示例
    function App() {
      const [user, setUser] = useState({ name: 'John', theme: 'dark' });
      
      return (
        <div>
          <Header user={user} />
        </div>
      );
    }
    
    function Header({ user }) {
      // Header组件不需要user.theme，但必须传递它
      return (
        <div>
          <h1>Welcome, {user.name}</h1>
          <Nav user={user} />
        </div>
      );
    }
    
    function Nav({ user }) {
      // Nav组件也不需要user.theme，但必须传递它
      return (
        <nav>
          <NavItem user={user} />
        </nav>
      );
    }
    
    function NavItem({ user }) {
      // NavItem组件终于使用了user.theme
      return (
        <button className={user.theme}>
          Settings
        </button>
      );
    }
    
    // 解决方案1：使用Context API
    const ThemeContext = React.createContext();
    
    function AppWithContext() {
      const [user, setUser] = useState({ name: 'John', theme: 'dark' });
      
      return (
        <ThemeContext.Provider value={user.theme}>
          <div>
            <HeaderWithContext userName={user.name} />
          </div>
        </ThemeContext.Provider>
      );
    }
    
    function HeaderWithContext({ userName }) {
      return (
        <div>
          <h1>Welcome, {userName}</h1>
          <NavWithContext />
        </div>
      );
    }
    
    function NavWithContext() {
      return (
        <nav>
          <NavItemWithContext />
        </nav>
      );
    }
    
    function NavItemWithContext() {
      // 直接从Context获取theme，无需经过props传递
      const theme = useContext(ThemeContext);
      return (
        <button className={theme}>
          Settings
        </button>
      );
    }
    
    // 解决方案2：使用组合(Composition)
    function AppWithComposition() {
      const [user, setUser] = useState({ name: 'John', theme: 'dark' });
      
      // 直接将NavItem注入到需要的位置
      const navItem = <button className={user.theme}>Settings</button>;
      
      return (
        <div>
          <h1>Welcome, {user.name}</h1>
          <nav>
            {navItem}
          </nav>
        </div>
      );
    }
    ```

### 组件设计模式
- **组合模式**
  - children属性
  
    React的`children`属性允许组件像容器一样包含其他组件，提高了组件的灵活性和可复用性。

    ```jsx
    // 基本children属性使用
    function Card({ children, title }) {
      return (
        <div className="card">
          <div className="card-header">
            <h2>{title}</h2>
          </div>
          <div className="card-body">
            {children}
          </div>
        </div>
      );
    }
    
    // 使用Card组件
    function App() {
      return (
        <Card title="Welcome">
          <p>This is a card component that uses children.</p>
          <button>Click me</button>
        </Card>
      );
    }
    
    // 操作和检查children
    function ChildrenCounter({ children }) {
      // React.Children提供了处理children的工具
      const count = React.Children.count(children);
      
      return (
        <div>
          <p>There are {count} children:</p>
          <div className="children-container">
            {React.Children.map(children, child => (
              <div className="child-wrapper">
                {child}
              </div>
            ))}
          </div>
        </div>
      );
    }
    ```

  - 插槽实现
  
    React可以通过特定的props或对象来实现类似Vue插槽的功能，让组件更加灵活。

    ```jsx
    // 基本插槽实现
    function Layout({ header, content, footer }) {
      return (
        <div className="layout">
          <header className="header">{header}</header>
          <main className="content">{content}</main>
          <footer className="footer">{footer}</footer>
        </div>
      );
    }
    
    // 使用Layout组件
    function App() {
      return (
        <Layout
          header={<h1>My Website</h1>}
          content={<p>Welcome to my website!</p>}
          footer={<p>&copy; 2023 My Company</p>}
        />
      );
    }
    
    // 使用对象实现命名插槽
    function Tabs({ tabs }) {
      const [activeTab, setActiveTab] = useState(0);
      
      return (
        <div className="tabs">
          <div className="tabs-header">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={index === activeTab ? 'active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tabs-content">
            {tabs[activeTab].content}
          </div>
        </div>
      );
    }
    
    // 使用Tabs组件
    function App() {
      const tabs = [
        { label: 'Home', content: <HomeContent /> },
        { label: 'Profile', content: <ProfileContent /> },
        { label: 'Settings', content: <SettingsContent /> }
      ];
      
      return <Tabs tabs={tabs} />;
    }
    ```

  - 组合vs继承
  
    React推荐使用组合而非继承来复用组件逻辑。

    ```jsx
    // 避免使用继承的反面示例
    class Button extends React.Component {
      render() {
        return <button className="btn">{this.props.label}</button>;
      }
    }
    
    // 不推荐：继承Button创建PrimaryButton
    class PrimaryButton extends Button {
      render() {
        const button = super.render();
        return React.cloneElement(button, {
          className: button.props.className + ' btn-primary'
        });
      }
    }
    
    // 推荐：使用组合
    function Button({ primary, label, ...rest }) {
      const className = `btn ${primary ? 'btn-primary' : ''}`;
      return <button className={className} {...rest}>{label}</button>;
    }
    
    // 使用Button组件创建不同样式的按钮
    function App() {
      return (
        <div>
          <Button label="Normal Button" />
          <Button label="Primary Button" primary />
        </div>
      );
    }
    
    // 特殊场景：组合实现特殊功能
    function withTooltip(WrappedComponent) {
      return function TooltipComponent({ tooltip, ...props }) {
        const [showTooltip, setShowTooltip] = useState(false);
        
        return (
          <div 
            className="tooltip-container"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Component {...props} />
            {showTooltip && <div className="tooltip">{tooltip}</div>}
          </div>
        );
      };
    }
    
    const ButtonWithTooltip = withTooltip(Button);
    
    function App() {
      return (
        <ButtonWithTooltip 
          label="Hover me" 
          tooltip="This is a tooltip!" 
        />
      );
    }
    ```

  - 组件拆分原则
  
    合理拆分组件可以提高可维护性和复用性。

    ```jsx
    // 拆分前：一个大组件
    function UserProfile({ user }) {
      return (
        <div className="user-profile">
          <div className="header">
            <img src={user.avatar} alt={user.name} />
            <h2>{user.name}</h2>
          </div>
          <div className="stats">
            <div className="stat">
              <span>Followers</span>
              <span>{user.followers}</span>
            </div>
            <div className="stat">
              <span>Following</span>
              <span>{user.following}</span>
            </div>
            <div className="stat">
              <span>Posts</span>
              <span>{user.posts}</span>
            </div>
          </div>
          <div className="bio">
            <h3>Bio</h3>
            <p>{user.bio}</p>
          </div>
          <div className="recent-posts">
            <h3>Recent Posts</h3>
            {user.recentPosts.map(post => (
              <div key={post.id} className="post">
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // 拆分后：多个小组件
    function UserAvatar({ src, name }) {
      return <img src={src} alt={name} className="user-avatar" />;
    }
    
    function UserHeader({ user }) {
      return (
        <div className="header">
          <UserAvatar src={user.avatar} name={user.name} />
          <h2>{user.name}</h2>
        </div>
      );
    }
    
    function UserStats({ followers, following, posts }) {
      return (
        <div className="stats">
          <StatItem label="Followers" value={followers} />
          <StatItem label="Following" value={following} />
          <StatItem label="Posts" value={posts} />
        </div>
      );
    }
    
    function StatItem({ label, value }) {
      return (
        <div className="stat">
          <span>{label}</span>
          <span>{value}</span>
        </div>
      );
    }
    
    function UserBio({ bio }) {
      return (
        <div className="bio">
          <h3>Bio</h3>
          <p>{bio}</p>
        </div>
      );
    }
    
    function PostList({ posts }) {
      return (
        <div className="recent-posts">
          <h3>Recent Posts</h3>
          {posts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      );
    }
    
    function PostItem({ post }) {
      return (
        <div className="post">
          <h4>{post.title}</h4>
          <p>{post.excerpt}</p>
        </div>
      );
    }
    
    // 重构后的UserProfile组件
    function UserProfile({ user }) {
      return (
        <div className="user-profile">
          <UserHeader user={user} />
          <UserStats 
            followers={user.followers} 
            following={user.following} 
            posts={user.posts} 
          />
          <UserBio bio={user.bio} />
          <PostList posts={user.recentPosts} />
        </div>
      );
    }
    ```

  - 内容分发
  
    内容分发允许组件接收不同部分的内容并分发到对应位置。

    ```jsx
    // 内容分发示例
    function SplitPane({ left, right }) {
      return (
        <div className="split-pane">
          <div className="split-pane-left">{left}</div>
          <div className="split-pane-right">{right}</div>
        </div>
      );
    }
    
    function App() {
      return (
        <SplitPane
          left={<Navigation />}
          right={<Content />}
        />
      );
    }
    
    // 复杂内容分发
    function Dashboard({ header, sidebar, main, footer }) {
      return (
        <div className="dashboard">
          <header className="dashboard-header">{header}</header>
          <div className="dashboard-body">
            <aside className="dashboard-sidebar">{sidebar}</aside>
            <main className="dashboard-main">{main}</main>
          </div>
          <footer className="dashboard-footer">{footer}</footer>
        </div>
      );
    }
    
    function App() {
      return (
        <Dashboard
          header={<Header />}
          sidebar={<Sidebar />}
          main={<MainContent />}
          footer={<Footer />}
        />
      );
    }
    ```

- **高阶组件(HOC)**
  - HOC概念与原理
  
    高阶组件是接收一个组件并返回一个新组件的函数，用于复用组件逻辑。

    ```jsx
    // 高阶组件基本结构
    function withExample(WrappedComponent) {
      // 返回一个新的组件
      return function EnhancedComponent(props) {
        // 增强逻辑
        const enhancedProps = { ...props, extraProp: 'value' };
        
        // 渲染被包装的组件，传入增强后的props
        return <WrappedComponent {...enhancedProps} />;
      };
    }
    
    // 使用高阶组件
    function MyComponent({ extraProp, ...rest }) {
      return (
        <div>
          <p>Extra prop: {extraProp}</p>
          {/* 使用其他props */}
        </div>
      );
    }
    
    const EnhancedComponent = withExample(MyComponent);
    
    // 使用增强后的组件
    function App() {
      return <EnhancedComponent normalProp="Hello" />;
    }
    ```

  - 属性代理
  
    属性代理是HOC的一种模式，通过操作props来增强组件。

    ```jsx
    // 属性代理示例：添加额外props
    function withExtraProps(WrappedComponent) {
      return function EnhancedComponent(props) {
        const extraProps = {
          extraData: 'Some extra data',
          extraMethod: () => console.log('Extra method called')
        };
        
        return <WrappedComponent {...props} {...extraProps} />;
      };
    }
    
    // 属性代理示例：提取和添加props
    function withUserData(WrappedComponent) {
      return function UserDataComponent({ userId, ...rest }) {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
          // 假设fetchUser是一个API调用函数
          fetchUser(userId)
            .then(data => {
              setUser(data);
              setLoading(false);
            })
            .catch(error => {
              console.error(error);
              setLoading(false);
            });
        }, [userId]);
        
        // 处理加载状态
        if (loading) return <div>Loading...</div>;
        if (!user) return <div>Error loading user</div>;
        
        // 将获取到的user数据作为props传递
        return <WrappedComponent {...rest} user={user} />;
      };
    }
    
    // 使用withUserData
    function UserProfile({ user }) {
      return (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      );
    }
    
    const UserProfileWithData = withUserData(UserProfile);
    
    function App() {
      return <UserProfileWithData userId={123} />;
    }
    ```

  - 反向继承
  
    反向继承是HOC的另一种模式，可以访问被包装组件的内部状态和方法。

    ```jsx
    // 反向继承示例
    function withOverride(WrappedComponent) {
      // 返回一个继承自WrappedComponent的类
      return class extends WrappedComponent {
        render() {
          // 调用被包装组件的render方法
          const originalElement = super.render();
          
          // 修改渲染结果
          return React.cloneElement(originalElement, {
            className: `${originalElement.props.className || ''} enhanced-component`
          });
        }
      };
    }
    
    // 反向继承可以拦截生命周期方法
    function withLogLifecycle(WrappedComponent) {
      return class extends WrappedComponent {
        componentDidMount() {
          console.log(`${WrappedComponent.name} did mount`);
          if (super.componentDidMount) {
            super.componentDidMount();
          }
        }
        
        componentWillUnmount() {
          console.log(`${WrappedComponent.name} will unmount`);
          if (super.componentWillUnmount) {
            super.componentWillUnmount();
          }
        }
        
        render() {
          console.log(`${WrappedComponent.name} rendering`);
          return super.render();
        }
      };
    }
    
    // 反向继承可以拦截渲染流程
    function withConditionalRendering(WrappedComponent) {
      return class extends WrappedComponent {
        render() {
          // 检查特定条件
          if (this.props.isLoading) {
            return <div>Loading...</div>;
          }
          
          if (this.props.error) {
            return <div>Error: {this.props.error}</div>;
          }
          
          // 默认渲染
          return super.render();
        }
      };
    }
    ```

  - 常见HOC实现
  
    高阶组件有多种常见实现模式，用于不同场景。

    ```jsx
    // 1. 身份验证HOC
    function withAuth(WrappedComponent) {
      return function AuthComponent(props) {
        const { isAuthenticated, user } = useAuth(); // 假设有一个useAuth钩子
        
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        
        return <WrappedComponent {...props} user={user} />;
      };
    }
    
    // 2. 加载状态HOC
    function withLoading(WrappedComponent, loadingPropName = 'isLoading') {
      return function LoadingComponent(props) {
        if (props[loadingPropName]) {
          return <LoadingSpinner />;
        }
        
        return <WrappedComponent {...props} />;
      };
    }
    
    // 3. 错误边界HOC
    function withErrorBoundary(WrappedComponent) {
      return class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        
        componentDidCatch(error, errorInfo) {
          console.error('Error caught by boundary:', error, errorInfo);
          // 可以将错误发送到监控服务
        }
        
        render() {
          if (this.state.hasError) {
            return <ErrorDisplay error={this.state.error} />;
          }
          
          return <WrappedComponent {...this.props} />;
        }
      };
    }
    
    // 4. 样式注入HOC
    function withStyles(WrappedComponent, styles) {
      return function StyledComponent(props) {
        return <WrappedComponent {...props} style={{ ...props.style, ...styles }} />;
      };
    }
    
    // 使用样式注入HOC
    const RedButton = withStyles(Button, { backgroundColor: 'red', color: 'white' });
    ```

  - 多HOC组合
  
    可以组合多个HOC来叠加不同的功能增强。

    ```jsx
    // HOC组合示例
    // 注意：HOC的应用顺序是从右到左（从内到外）
    
    // 基础组件
    function UserProfile({ user, theme }) {
      return (
        <div className={`profile ${theme}`}>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      );
    }
    
    // 应用多个HOC
    const EnhancedUserProfile = withAuth(
      withLoading(
        withErrorBoundary(
          withUserData(UserProfile)
        ),
        'loadingUser'
      )
    );
    
    // 使用compose简化HOC组合
    // compose函数从右到左组合多个函数
    function compose(...funcs) {
      if (funcs.length === 0) {
        return arg => arg;
      }
      
      if (funcs.length === 1) {
        return funcs[0];
      }
      
      return funcs.reduce((a, b) => (...args) => a(b(...args)));
    }
    
    const enhance = compose(
      withAuth,
      withLoading,
      withErrorBoundary,
      withUserData
    );
    
    const EnhancedUserProfile = enhance(UserProfile);
    
    // 在实际应用中，可以使用第三方库如recompose
    // import { compose } from 'recompose';
    
    // 使用装饰器语法(需要Babel配置)
    /*
    @withAuth
    @withLoading
    @withErrorBoundary
    @withUserData
    class UserProfile extends React.Component {
      render() {
        const { user, theme } = this.props;
        return (
          <div className={`profile ${theme}`}>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        );
      }
    }
    */
    ```

- **Render Props**
  - 实现原理
  
    Render Props是一种通过函数属性来共享组件间逻辑的模式，核心思想是将渲染逻辑委托给父组件。

    ```jsx
    // 基本的Render Props模式
    function DataProvider({ render }) {
      const [data, setData] = useState({ count: 0 });
      
      const increment = () => {
        setData(prevData => ({ count: prevData.count + 1 }));
      };
      
      // 调用传入的render函数，将状态和方法作为参数传递
      return render(data, { increment });
    }
    
    // 使用DataProvider组件
    function App() {
      return (
        <DataProvider 
          render={(data, { increment }) => (
            <div>
              <p>Count: {data.count}</p>
              <button onClick={increment}>Increment</button>
            </div>
          )}
        />
      );
    }
    
    // 使用children作为函数的变体
    function DataProvider({ children }) {
      const [data, setData] = useState({ count: 0 });
      
      const increment = () => {
        setData(prevData => ({ count: prevData.count + 1 }));
      };
      
      // 调用children作为函数
      return children(data, { increment });
    }
    
    // 使用基于children的Render Props
    function App() {
      return (
        <DataProvider>
          {(data, { increment }) => (
            <div>
              <p>Count: {data.count}</p>
              <button onClick={increment}>Increment</button>
            </div>
          )}
        </DataProvider>
      );
    }
    ```

  - 与HOC对比
  
    Render Props和HOC各有优势，适合不同的场景。

    ```jsx
    // 同样功能的HOC实现
    function withData(WrappedComponent) {
      return function WithData(props) {
        const [data, setData] = useState({ count: 0 });
        
        const increment = () => {
          setData(prevData => ({ count: prevData.count + 1 }));
        };
        
        // 传递props、data和方法给被包装组件
        return (
          <WrappedComponent
            {...props}
            data={data}
            increment={increment}
          />
        );
      };
    }
    
    // 使用HOC
    function Counter({ data, increment }) {
      return (
        <div>
          <p>Count: {data.count}</p>
          <button onClick={increment}>Increment</button>
        </div>
      );
    }
    
    const CounterWithData = withData(Counter);
    
    // 使用增强后的组件
    function App() {
      return <CounterWithData />;
    }
    
    // Render Props的优势：
    // 1. 避免了HOC的props命名冲突问题
    // 2. 更灵活的组合方式
    // 3. 更明确的数据流向
    
    // HOC的优势：
    // 1. 使用时更简洁
    // 2. 更容易组合多个高阶组件
    // 3. 可以使用装饰器语法（在类组件中）
    ```

  - 嵌套问题
  
    Render Props模式可能导致嵌套问题，但有解决方案。

    ```jsx
    // 嵌套问题示例
    function App() {
      return (
        <MouseTracker>
          {mouse => (
            <WindowSize>
              {size => (
                <ThemeContext.Consumer>
                  {theme => (
                    <div>
                      <p>Mouse position: {mouse.x}, {mouse.y}</p>
                      <p>Window size: {size.width}x{size.height}</p>
                      <p>Current theme: {theme}</p>
                    </div>
                  )}
                </ThemeContext.Consumer>
              )}
            </WindowSize>
          )}
        </MouseTracker>
      );
    }
    
    // 解决方案1：组合多个Render Props
    function CombinedProvider({ render }) {
      const [mouse, setMouse] = useState({ x: 0, y: 0 });
      const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
      
      useEffect(() => {
        const handleMouseMove = (e) => {
          setMouse({ x: e.clientX, y: e.clientY });
        };
        
        const handleResize = () => {
          setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('resize', handleResize);
        };
      }, []);
      
      return render({ mouse, size });
    }
    
    // 使用组合后的Provider
    function App() {
      return (
        <CombinedProvider 
          render={({ mouse, size }) => (
            <ThemeContext.Consumer>
              {theme => (
                <div>
                  <p>Mouse position: {mouse.x}, {mouse.y}</p>
                  <p>Window size: {size.width}x{size.height}</p>
                  <p>Current theme: {theme}</p>
                </div>
              )}
            </ThemeContext.Consumer>
          )}
        />
      );
    }
    
    // 解决方案2：使用Hooks替代
    function App() {
      const mouse = useMouse();
      const size = useWindowSize();
      const theme = useContext(ThemeContext);
      
      return (
        <div>
          <p>Mouse position: {mouse.x}, {mouse.y}</p>
          <p>Window size: {size.width}x{size.height}</p>
          <p>Current theme: {theme}</p>
        </div>
      );
    }
    ```

  - 实际应用场景
  
    Render Props在多种场景中非常有用。

    ```jsx
    // 1. 鼠标位置追踪
    function MouseTracker({ children }) {
      const [position, setPosition] = useState({ x: 0, y: 0 });
      
      useEffect(() => {
        const handleMouseMove = (event) => {
          setPosition({ x: event.clientX, y: event.clientY });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);
      
      return children(position);
    }
    
    // 自定义鼠标指针
    function App() {
      return (
        <MouseTracker>
          {mouse => (
            <div style={{ height: '100vh' }}>
              <div
                style={{
                  position: 'absolute',
                  left: mouse.x,
                  top: mouse.y,
                  width: 20,
                  height: 20,
                  background: 'red',
                  borderRadius: '50%'
                }}
              />
            </div>
          )}
        </MouseTracker>
      );
    }
    
    // 2. 表单控件封装
    function FormField({ name, label, render }) {
      const [value, setValue] = useState('');
      const [touched, setTouched] = useState(false);
      const [error, setError] = useState(null);
      
      const handleChange = (e) => {
        setValue(e.target.value);
      };
      
      const handleBlur = () => {
        setTouched(true);
        // 简单的验证
        if (!value && touched) {
          setError(`${label} is required`);
        } else {
          setError(null);
        }
      };
      
      return render({
        name,
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        touched,
        error
      });
    }
    
    // 使用FormField组件
    function LoginForm() {
      return (
        <form>
          <FormField
            name="username"
            label="Username"
            render={({ name, value, onChange, onBlur, touched, error }) => (
              <div>
                <label htmlFor={name}>Username:</label>
                <input
                  id={name}
                  name={name}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                {touched && error && <p className="error">{error}</p>}
              </div>
            )}
          />
          
          <FormField
            name="password"
            label="Password"
            render={({ name, value, onChange, onBlur, touched, error }) => (
              <div>
                <label htmlFor={name}>Password:</label>
                <input
                  id={name}
                  name={name}
                  type="password"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                {touched && error && <p className="error">{error}</p>}
              </div>
            )}
          />
          
          <button type="submit">Login</button>
        </form>
      );
    }
    ```

  - 性能考量
  
    Render Props有一些性能注意事项，但都有对应的解决方案。

    ```jsx
    // 潜在的性能问题：每次渲染都创建新的函数
    function List({ items }) {
      return (
        <DataProvider
          render={data => (
            <ul>
              {items.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
              <li>Data count: {data.count}</li>
            </ul>
          )}
        />
      );
    }
    
    // 解决方案1：将render函数提取出来
    function List({ items }) {
      // 定义一个组件来处理渲染
      const ListRenderer = ({ data }) => (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
          <li>Data count: {data.count}</li>
        </ul>
      );
      
      return (
        <DataProvider
          render={data => <ListRenderer data={data} items={items} />}
        />
      );
    }
    
    // 解决方案2：使用useCallback缓存render函数（在Hooks出现后）
    function List({ items }) {
      const renderList = useCallback(data => (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
          <li>Data count: {data.count}</li>
        </ul>
      ), [items]);
      
      return <DataProvider render={renderList} />;
    }
    
    // 解决方案3：使用组件组合而非函数
    function DataProvider({ children }) {
      const [data, setData] = useState({ count: 0 });
      
      const increment = () => {
        setData(prevData => ({ count: prevData.count + 1 }));
      };
      
      // 克隆children并传入props
      return React.cloneElement(children, { data, increment });
    }
    
    function List({ items, data }) {
      return (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
          <li>Data count: {data?.count}</li>
        </ul>
      );
    }
    
    function App() {
      const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
      
      return (
        <DataProvider>
          <List items={items} />
        </DataProvider>
      );
    }
    ```

### 事件处理
- **合成事件系统**
  - 事件委托机制
  - 与原生事件区别
  - 事件对象复用
  - 事件池概念
  - React 17事件变化
- **事件处理模式**
  - 事件绑定方式
  - this绑定解决方案
  - 参数传递
  - 事件防抖与节流
  - 自定义事件封装
- **表单处理**
  - 受控组件
  - 非受控组件
  - 表单状态管理
  - 表单验证模式
  - 动态表单

### 样式与主题
- **CSS-in-JS**
  - Styled-components
  - Emotion
  - JSS原理
  - 主题定制
  - 动态样式
- **CSS模块化**
  - CSS Modules
  - Sass/Less集成
  - PostCSS配置
  - 样式隔离
  - 全局样式管理
- **Tailwind与原子CSS**
  - Tailwind集成
  - 原子CSS理念
  - 按需加载优化
  - 样式扩展
  - 主题切换

## Hooks与函数式组件

### Hooks基础
- **useState**
  - 状态声明
  
    useState是React最基本的Hook，用于在函数组件中添加状态。

    ```jsx
    // 基本用法
    import React, { useState } from 'react';
    
    function Counter() {
      // 声明一个名为count的state变量，初始值为0
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
    
    // 使用多个state变量
    function UserForm() {
      const [name, setName] = useState('');
      const [age, setAge] = useState(0);
      const [email, setEmail] = useState('');
      
      return (
        <form>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            type="number"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            placeholder="Age"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
        </form>
      );
    }
    
    // 使用对象state
    function ComplexForm() {
      const [formData, setFormData] = useState({
        name: '',
        age: 0,
        email: ''
      });
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,    // 保留其他字段
          [name]: value   // 更新当前字段
        });
      };
      
      return (
        <form>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </form>
      );
    }
    ```

  - 函数式更新
  
    当新状态依赖于之前的状态时，应该使用函数式更新。

    ```jsx
    // 不安全的更新方式（可能导致状态丢失）
    function Counter() {
      const [count, setCount] = useState(0);
      
      // 如果这个函数被快速调用多次，可能不会正确更新
      const increment = () => {
        setCount(count + 1); // 依赖于当前的count值
      };
      
      // 连续调用increment可能无法得到预期结果
      const incrementTwice = () => {
        increment();
        increment(); // 可能仍然使用相同的count值
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
          <button onClick={incrementTwice}>Increment Twice</button>
        </div>
      );
    }
    
    // 安全的函数式更新
    function Counter() {
      const [count, setCount] = useState(0);
      
      // 使用函数式更新，总是基于最新的state
      const increment = () => {
        setCount(prevCount => prevCount + 1);
      };
      
      // 连续调用会正确更新
      const incrementTwice = () => {
        increment();
        increment(); // 会正确获取上一次更新后的值
      };
      
      // 更复杂的函数式更新
      const incrementByAmount = (amount) => {
        setCount(prevCount => prevCount + amount);
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
          <button onClick={incrementTwice}>Increment Twice</button>
          <button onClick={() => incrementByAmount(5)}>Add 5</button>
        </div>
      );
    }
    
    // 对象状态的函数式更新
    function UserProfileEditor() {
      const [profile, setProfile] = useState({
        name: 'John',
        age: 30,
        skills: ['JavaScript', 'React']
      });
      
      // 安全地更新嵌套对象
      const addSkill = (skill) => {
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: [...prevProfile.skills, skill]
        }));
      };
      
      // 安全地替换特定索引的元素
      const updateSkill = (index, newSkill) => {
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: prevProfile.skills.map((skill, i) => 
            i === index ? newSkill : skill
          )
        }));
      };
      
      return (
        <div>
          <h2>{profile.name}, {profile.age}</h2>
          <ul>
            {profile.skills.map((skill, index) => (
              <li key={index}>
                {skill}
                <button onClick={() => updateSkill(index, skill + ' (Advanced)')}>
                  Upgrade
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => addSkill('TypeScript')}>Add TypeScript</button>
        </div>
      );
    }
    ```

  - 惰性初始化
  
    对于计算成本高的初始化状态，可以使用惰性初始化。

    ```jsx
    // 直接初始化（每次渲染都会执行复杂计算）
    function UserList() {
      // 下面的代码在每次渲染时都会执行，即使初始值只需要一次
      const [users, setUsers] = useState(
        Array(1000).fill().map((_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`
        }))
      );
      
      // 组件逻辑...
    }
    
    // 惰性初始化（只在第一次渲染时执行）
    function UserList() {
      const [users, setUsers] = useState(() => {
        console.log('Initializing users - this runs only once');
        // 复杂计算只在初始渲染时执行
        return Array(1000).fill().map((_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`
        }));
      });
      
      // 组件逻辑...
    }
    
    // 从localStorage读取初始值的常见用例
    function SavedCounter() {
      const [count, setCount] = useState(() => {
        // 尝试从localStorage读取，如果不存在则使用默认值
        const savedCount = localStorage.getItem('count');
        return savedCount !== null ? Number(savedCount) : 0;
      });
      
      // 保存到localStorage
      useEffect(() => {
        localStorage.setItem('count', count.toString());
      }, [count]);
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      );
    }
    ```

  - 多状态管理
  
    对于复杂状态，有多种管理方式。

    ```jsx
    // 方式1：多个独立状态
    function UserProfile() {
      const [name, setName] = useState('');
      const [age, setAge] = useState(0);
      const [email, setEmail] = useState('');
      const [address, setAddress] = useState('');
      
      // 每个字段有独立的更新函数
      const handleNameChange = (e) => setName(e.target.value);
      const handleAgeChange = (e) => setAge(Number(e.target.value));
      const handleEmailChange = (e) => setEmail(e.target.value);
      const handleAddressChange = (e) => setAddress(e.target.value);
      
      // 组件代码...
    }
    
    // 方式2：单一对象状态
    function UserProfile() {
      const [user, setUser] = useState({
        name: '',
        age: 0,
        email: '',
        address: ''
      });
      
      // 通用的更新函数
      const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({
          ...user,
          [name]: name === 'age' ? Number(value) : value
        });
      };
      
      // 组件代码...
    }
    
    // 方式3：useReducer管理复杂状态（预览）
    function userReducer(state, action) {
      switch (action.type) {
        case 'UPDATE_FIELD':
          return { ...state, [action.field]: action.value };
        case 'RESET':
          return { name: '', age: 0, email: '', address: '' };
        default:
          return state;
      }
    }
    
    function UserProfile() {
      const [user, dispatch] = useReducer(userReducer, {
        name: '',
        age: 0,
        email: '',
        address: ''
      });
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch({
          type: 'UPDATE_FIELD',
          field: name,
          value: name === 'age' ? Number(value) : value
        });
      };
      
      const handleReset = () => {
        dispatch({ type: 'RESET' });
      };
      
      // 组件代码...
    }
    ```

  - 状态重置时机
  
    了解状态重置的时机对于正确使用useState很重要。

    ```jsx
    // 示例：何时状态会被重置
    function Counter({ initialCount = 0 }) {
      // 组件重新渲染不会重置状态
      const [count, setCount] = useState(initialCount);
      
      // initialCount改变不会导致state重置
      // useState只在组件第一次渲染时使用初始值
      
      // 重置计数器
      const reset = () => setCount(initialCount);
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    }
    
    // 示例：当key改变时状态会重置
    function App() {
      const [userId, setUserId] = useState(1);
      
      return (
        <div>
          <button onClick={() => setUserId(userId + 1)}>
            Switch User
          </button>
          
          {/* key改变会导致UserProfile完全卸载并重新挂载，状态重置 */}
          <UserProfile key={userId} userId={userId} />
        </div>
      );
    }
    
    // 示例：组件卸载会导致状态丢失
    function ToggleCounter() {
      const [showCounter, setShowCounter] = useState(true);
      
      return (
        <div>
          <button onClick={() => setShowCounter(!showCounter)}>
            {showCounter ? 'Hide' : 'Show'} Counter
          </button>
          
          {showCounter && <Counter />}
          {/* Counter被卸载后，再次挂载会使用初始状态 */}
        </div>
      );
    }
    
    // 跨组件实例保留状态
    function App() {
      // 将状态提升到父组件
      const [count, setCount] = useState(0);
      const [showCounter, setShowCounter] = useState(true);
      
      return (
        <div>
          <button onClick={() => setShowCounter(!showCounter)}>
            {showCounter ? 'Hide' : 'Show'} Counter
          </button>
          
          {showCounter && (
            <div>
              <p>Count: {count}</p>
              <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
          )}
          {/* 即使UI组件卸载，状态仍然保留在App组件中 */}
        </div>
      );
    }
    ```

- **useEffect**
  - 副作用处理
  
    useEffect用于在函数组件中执行副作用操作，如数据获取、订阅或手动DOM操作。

    ```jsx
    // 基本用法
    import React, { useState, useEffect } from 'react';
    
    function Example() {
      const [count, setCount] = useState(0);
      
      // 类似于componentDidMount和componentDidUpdate
      useEffect(() => {
        // 更新文档标题
        document.title = `You clicked ${count} times`;
      });
      
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
    
    // 数据获取示例
    function UserProfile({ userId }) {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        // 定义异步函数
        async function fetchUserData() {
          try {
            setLoading(true);
            // 假设fetchUser是一个API调用
            const userData = await fetchUser(userId);
            setUser(userData);
            setError(null);
          } catch (err) {
            setError('Failed to fetch user data');
            setUser(null);
          } finally {
            setLoading(false);
          }
        }
        
        // 调用异步函数
        fetchUserData();
      }, [userId]); // 仅在userId变化时重新获取
      
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error}</div>;
      if (!user) return <div>No user data</div>;
      
      return (
        <div>
          <h1>{user.name}</h1>
          <p>Email: {user.email}</p>
        </div>
      );
    }
    
    // DOM操作示例
    function AutoFocusInput() {
      const inputRef = useRef(null);
      
      useEffect(() => {
        // 自动聚焦输入框
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, []); // 空依赖数组，仅在挂载时执行一次
      
      return <input ref={inputRef} type="text" />;
    }
    ```

  - 依赖数组
  
    依赖数组控制useEffect执行的时机。

    ```jsx
    // 每次渲染后都执行（没有依赖数组）
    useEffect(() => {
      console.log('This runs after every render');
    });
    
    // 仅在挂载时执行（空依赖数组）
    useEffect(() => {
      console.log('This runs only on mount');
    }, []);
    
    // 仅在特定依赖变化时执行
    useEffect(() => {
      console.log(`Count changed to: ${count}`);
    }, [count]); // 仅在count变化时执行
    
    // 多个依赖项
    useEffect(() => {
      console.log(`User ID: ${userId}, Page: ${page}`);
      fetchData(userId, page);
    }, [userId, page]); // 当userId或page变化时执行
    
    // 使用引用类型依赖的问题
    function Example({ options }) {
      useEffect(() => {
        console.log('Options changed', options);
      }, [options]); // 警告：每次渲染options可能都是新对象
      
      // 解决方案：使用具体的原始值作为依赖
      useEffect(() => {
        console.log('Selected option changed', options.selected);
      }, [options.selected]); // 只在options.selected变化时执行
    }
    
    // 使用useCallback和useMemo稳定依赖
    function SearchResults() {
      const [query, setQuery] = useState('');
      const [page, setPage] = useState(1);
      
      // 使用useMemo稳定对象引用
      const searchParams = useMemo(() => ({
        query,
        page
      }), [query, page]);
      
      // 使用useCallback稳定函数引用
      const fetchResults = useCallback(() => {
        fetchSearchResults(query, page);
      }, [query, page]);
      
      useEffect(() => {
---
title: React全栈开发
description: React核心概念、Hooks模式、状态管理与最佳实践
head:
  - - meta
    - name: keywords
      content: React, Hooks, 组件设计, 状态管理, 性能优化, 服务端渲染
---

# React全栈开发

## React基础

### React核心概念
- **JSX语法**
  - JSX本质与原理
  
    JSX是JavaScript的语法扩展，允许在JavaScript中编写类似HTML的代码。它实际上是`React.createElement()`函数的语法糖，最终会被Babel等工具转换为React函数调用。

    ```jsx
    // JSX语法
    const element = <h1 className="greeting">Hello, world!</h1>;
    
    // 编译后的JavaScript
    const element = React.createElement(
      'h1',
      {className: 'greeting'},
      'Hello, world!'
    );
    ```

  - createElement函数
  
    createElement是React的核心API，接收三个参数：元素类型、属性对象和子元素。

    ```jsx
    // createElement基本语法
    React.createElement(
      type,      // 标签名或React组件
      props,     // 属性对象
      ...children // 子元素
    )
    
    // 创建嵌套元素
    const nestedElement = React.createElement(
      'div',
      { className: 'container' },
      React.createElement('h1', null, '标题'),
      React.createElement('p', null, '段落内容')
    );
    ```

  - 表达式与变量
  
    JSX中可以通过花括号`{}`嵌入任何JavaScript表达式。

    ```jsx
    const name = 'John';
    const element = <h1>Hello, {name}!</h1>;
    
    // 可以在属性中使用表达式
    const imgUrl = 'https://example.com/image.jpg';
    const imgElement = <img src={imgUrl} alt="示例图片" />;
    
    // 可以使用复杂表达式
    const element2 = <h2>{user.isLoggedIn ? `Welcome back, ${user.name}` : 'Please sign in'}</h2>;
    ```

  - 条件渲染
  
    JSX中实现条件渲染有多种方式。

    ```jsx
    // 1. 使用if语句（JSX外部）
    let content;
    if (isLoggedIn) {
      content = <UserGreeting />;
    } else {
      content = <GuestGreeting />;
    }
    
    // 2. 使用三元运算符
    const element = (
      <div>
        {isLoggedIn ? <UserGreeting /> : <GuestGreeting />}
      </div>
    );
    
    // 3. 使用逻辑与运算符实现"且"条件
    const element2 = (
      <div>
        {isLoggedIn && <UserDashboard />}
      </div>
    );
    
    // 4. 使用立即执行函数进行复杂条件逻辑
    const element3 = (
      <div>
        {(() => {
          if (status === 'loading') return <Loader />;
          if (status === 'error') return <ErrorMessage />;
          return <Content />;
        })()}
      </div>
    );
    ```

  - 列表渲染
  
    使用map方法可以高效地渲染列表元素。

    ```jsx
    const numbers = [1, 2, 3, 4, 5];
    
    // 基本列表渲染
    const listItems = (
      <ul>
        {numbers.map(number => (
          <li key={number.toString()}>
            {number}
          </li>
        ))}
      </ul>
    );
    
    // 组件列表渲染
    const todoItems = todos.map(todo => (
      <TodoItem 
        key={todo.id} 
        text={todo.text} 
        completed={todo.completed} 
      />
    ));
    
    // key的重要性: React使用key来识别元素，帮助高效更新虚拟DOM
    ```

- **组件基础**
  - 函数组件
  
    函数组件是最简单的React组件形式，本质上是接收props并返回React元素的JavaScript函数。

    ```jsx
    // 基本函数组件
    function Welcome(props) {
      return <h1>Hello, {props.name}</h1>;
    }
    
    // 使用箭头函数
    const Welcome = (props) => {
      return <h1>Hello, {props.name}</h1>;
    };
    
    // 使用组件
    const element = <Welcome name="Sara" />;
    
    // 解构props
    function Profile({ name, avatar, bio }) {
      return (
        <div className="profile">
          <img src={avatar} alt={name} />
          <h2>{name}</h2>
          <p>{bio}</p>
        </div>
      );
    }
    ```

  - 类组件对比
  
    类组件提供了更多功能，如状态和生命周期方法，但在Hooks引入后，函数组件的功能已经非常完备。

    ```jsx
    // 基本类组件
    class Welcome extends React.Component {
      render() {
        return <h1>Hello, {this.props.name}</h1>;
      }
    }
    
    // 带状态的类组件
    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
        this.increment = this.increment.bind(this); // 绑定this
      }
      
      increment() {
        this.setState({ count: this.state.count + 1 });
      }
      
      render() {
        return (
          <div>
            <p>Count: {this.state.count}</p>
            <button onClick={this.increment}>Increment</button>
          </div>
        );
      }
    }
    
    // 等效的函数组件（使用Hooks）
    function Counter() {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      );
    }
    ```

  - 组件生命周期
  
    类组件有多个生命周期方法，它们在组件的不同阶段被调用。

    ```jsx
    class LifecycleDemo extends React.Component {
      constructor(props) {
        super(props);
        this.state = { data: null };
        console.log('1. Constructor: 组件实例化');
      }
      
      static getDerivedStateFromProps(props, state) {
        console.log('2. getDerivedStateFromProps: 从props派生state');
        return null;
      }
      
      componentDidMount() {
        console.log('4. componentDidMount: 组件已挂载');
        // 通常在这里进行数据获取
        fetch('https://api.example.com/data')
          .then(response => response.json())
          .then(data => this.setState({ data }));
      }
      
      shouldComponentUpdate(nextProps, nextState) {
        console.log('5. shouldComponentUpdate: 判断是否应该更新');
        return true; // 返回false会阻止更新
      }
      
      getSnapshotBeforeUpdate(prevProps, prevState) {
        console.log('6. getSnapshotBeforeUpdate: 更新前获取快照');
        return null;
      }
      
      componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('7. componentDidUpdate: 组件已更新');
        // 可以在这里对DOM进行操作
      }
      
      componentWillUnmount() {
        console.log('8. componentWillUnmount: 组件即将卸载');
        // 清理工作：取消订阅、清除定时器等
      }
      
      render() {
        console.log('3. render: 渲染组件');
        return <div>Lifecycle Demo</div>;
      }
    }
    ```

  - 组件通信方式
  
    React组件间有多种通信方式。

    ```jsx
    // 1. 父组件向子组件传递props
    function Parent() {
      const [message, setMessage] = useState('Hello from parent');
      
      return <Child message={message} />;
    }
    
    function Child({ message }) {
      return <p>{message}</p>;
    }
    
    // 2. 子组件向父组件通信（通过回调函数）
    function Parent() {
      const [count, setCount] = useState(0);
      
      const handleIncrement = () => {
        setCount(count + 1);
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <Child onIncrement={handleIncrement} />
        </div>
      );
    }
    
    function Child({ onIncrement }) {
      return <button onClick={onIncrement}>Increment</button>;
    }
    
    // 3. 兄弟组件通信（通过共同的父组件）
    function Parent() {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <SiblingA count={count} />
          <SiblingB onIncrement={() => setCount(count + 1)} />
        </div>
      );
    }
    
    // 4. 使用Context API进行跨层级通信
    const ThemeContext = React.createContext('light');
    
    function App() {
      return (
        <ThemeContext.Provider value="dark">
          <Toolbar />
        </ThemeContext.Provider>
      );
    }
    
    function Toolbar() {
      return <ThemedButton />;
    }
    
    function ThemedButton() {
      const theme = useContext(ThemeContext);
      return <button className={theme}>Themed Button</button>;
    }
    ```

  - 渲染流程
  
    React的渲染流程包含多个步骤，从组件到真实DOM。

    ```jsx
    // React渲染流程简化图解
    /**
     * 1. JSX -> React.createElement() -> 虚拟DOM（React元素）
     * 2. 虚拟DOM -> 协调算法(Reconciliation) -> 找出差异
     * 3. 差异 -> 应用到真实DOM -> 浏览器渲染
     */
    
    // 渲染示例
    function App() {
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
    
    // 每次状态更新，React会：
    // 1. 调用App函数得到新的React元素树
    // 2. 将新树与上一次渲染的树进行对比
    // 3. 计算需要更新的部分
    // 4. 只更新必要的DOM节点（在这个例子中，只更新p标签的内容）
    ```

- **Props与State**
  - Props传递与接收
  
    Props是React组件的输入，用于父组件向子组件传递数据。

    ```jsx
    // 基本props传递
    function ParentComponent() {
      return <ChildComponent name="John" age={25} isActive={true} />;
    }
    
    // 在子组件中接收props
    function ChildComponent(props) {
      return (
        <div>
          <p>Name: {props.name}</p>
          <p>Age: {props.age}</p>
          <p>Active: {props.isActive ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    
    // 使用解构接收props
    function ChildComponent({ name, age, isActive }) {
      return (
        <div>
          <p>Name: {name}</p>
          <p>Age: {age}</p>
          <p>Active: {isActive ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    
    // 默认props
    function Button({ text = 'Click me', onClick }) {
      return <button onClick={onClick}>{text}</button>;
    }
    
    // 类型检查（使用PropTypes）
    import PropTypes from 'prop-types';
    
    function Profile({ name, age }) {
      return (
        <div>
          <h2>{name}</h2>
          <p>Age: {age}</p>
        </div>
      );
    }
    
    Profile.propTypes = {
      name: PropTypes.string.isRequired,
      age: PropTypes.number
    };
    ```

  - State管理
  
    State是组件内部的可变数据，当state变化时会触发组件重新渲染。

    ```jsx
    // 类组件中的state
    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }
      
      increment = () => {
        // setState是异步的
        this.setState({ count: this.state.count + 1 });
      }
      
      // 使用函数形式的setState确保使用最新state
      incrementSafely = () => {
        this.setState(prevState => ({
          count: prevState.count + 1
        }));
      }
      
      // 批量更新state
      incrementTwice = () => {
        this.setState(prevState => ({ count: prevState.count + 1 }));
        this.setState(prevState => ({ count: prevState.count + 1 }));
      }
      
      render() {
        return (
          <div>
            <p>Count: {this.state.count}</p>
            <button onClick={this.increment}>Increment</button>
            <button onClick={this.incrementSafely}>Increment Safely</button>
            <button onClick={this.incrementTwice}>Increment Twice</button>
          </div>
        );
      }
    }
    
    // 函数组件中使用useState Hook
    function Counter() {
      const [count, setCount] = useState(0);
      
      // 基本更新
      const increment = () => {
        setCount(count + 1);
      };
      
      // 使用函数形式确保使用最新state
      const incrementSafely = () => {
        setCount(prevCount => prevCount + 1);
      };
      
      // 批量更新
      const incrementTwice = () => {
        setCount(prevCount => prevCount + 1);
        setCount(prevCount => prevCount + 1);
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
          <button onClick={incrementSafely}>Increment Safely</button>
          <button onClick={incrementTwice}>Increment Twice</button>
        </div>
      );
    }
    
    // 复杂状态管理（对象状态）
    function UserForm() {
      const [user, setUser] = useState({
        name: '',
        email: '',
        age: 0
      });
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 更新对象中的一个字段时，需要保留其他字段
        setUser(prevUser => ({
          ...prevUser,
          [name]: value
        }));
      };
      
      return (
        <form>
          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            name="age"
            type="number"
            value={user.age}
            onChange={handleChange}
            placeholder="Age"
          />
        </form>
      );
    }
    ```

  - 不可变数据
  
    React依赖不可变数据模式，即直接修改state会导致问题，应始终创建新的数据副本。

    ```jsx
    // 错误示例：直接修改数组
    function BadArrayUpdate() {
      const [items, setItems] = useState([1, 2, 3]);
      
      const addItem = () => {
        items.push(items.length + 1); // 错误：直接修改state
        setItems(items); // 不会触发重新渲染，因为引用没变
      };
      
      return (
        <div>
          <button onClick={addItem}>Add Item</button>
          <ul>
            {items.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      );
    }
    
    // 正确示例：创建新数组
    function GoodArrayUpdate() {
      const [items, setItems] = useState([1, 2, 3]);
      
      const addItem = () => {
        setItems([...items, items.length + 1]); // 正确：创建新数组
      };
      
      // 更多数组操作示例
      const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
      };
      
      const updateItem = (index, newValue) => {
        setItems(items.map((item, i) => i === index ? newValue : item));
      };
      
      return (
        <div>
          <button onClick={addItem}>Add Item</button>
          <ul>
            {items.map((item, index) => (
              <li key={item}>
                {item}
                <button onClick={() => removeItem(index)}>Remove</button>
                <button onClick={() => updateItem(index, item * 2)}>Double</button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    // 对象不可变更新
    function ObjectUpdateExample() {
      const [user, setUser] = useState({
        name: 'John',
        address: {
          city: 'New York',
          zipCode: '10001'
        }
      });
      
      // 更新嵌套对象属性
      const updateZipCode = (newZipCode) => {
        setUser({
          ...user,
          address: {
            ...user.address,
            zipCode: newZipCode
          }
        });
      };
      
      return (
        <div>
          <p>Name: {user.name}</p>
          <p>City: {user.address.city}</p>
          <p>Zip Code: {user.address.zipCode}</p>
          <input
            value={user.address.zipCode}
            onChange={(e) => updateZipCode(e.target.value)}
          />
        </div>
      );
    }
    ```

  - 单向数据流
  
    React中数据流是单向的，从父组件流向子组件，这使得应用更加可预测。

    ```jsx
    // 单向数据流示例
    function ParentComponent() {
      const [count, setCount] = useState(0);
      
      // 父组件控制数据，并将更新方法传递给子组件
      return (
        <div>
          <p>Parent Count: {count}</p>
          <ChildComponent 
            count={count} 
            onIncrement={() => setCount(count + 1)} 
          />
        </div>
      );
    }
    
    function ChildComponent({ count, onIncrement }) {
      // 子组件不能直接修改count，只能通过onIncrement回调
      return (
        <div>
          <p>Child Count: {count}</p>
          <button onClick={onIncrement}>Increment</button>
        </div>
      );
    }
    
    // 反面示例（不推荐）：双向绑定
    function BiDirectionalExample() {
      const [value, setValue] = useState('');
      
      return (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
    
    // 这个反面示例虽然很常见，但不是真正的反模式
    // 只是说明了单向流：state → 渲染 → 事件 → 更新state
    ```

  - Props drilling问题
  
    Props drilling是指为了将数据传递到深层嵌套组件，需要通过许多中间组件传递props的情况。

    ```jsx
    // Props drilling示例
    function App() {
      const [user, setUser] = useState({ name: 'John', theme: 'dark' });
      
      return (
        <div>
          <Header user={user} />
        </div>
      );
    }
    
    function Header({ user }) {
      // Header组件不需要user.theme，但必须传递它
      return (
        <div>
          <h1>Welcome, {user.name}</h1>
          <Nav user={user} />
        </div>
      );
    }
    
    function Nav({ user }) {
      // Nav组件也不需要user.theme，但必须传递它
      return (
        <nav>
          <NavItem user={user} />
        </nav>
      );
    }
    
    function NavItem({ user }) {
      // NavItem组件终于使用了user.theme
      return (
        <button className={user.theme}>
          Settings
        </button>
      );
    }
    
    // 解决方案1：使用Context API
    const ThemeContext = React.createContext();
    
    function AppWithContext() {
      const [user, setUser] = useState({ name: 'John', theme: 'dark' });
      
      return (
        <ThemeContext.Provider value={user.theme}>
          <div>
            <HeaderWithContext userName={user.name} />
          </div>
        </ThemeContext.Provider>
      );
    }
    
    function HeaderWithContext({ userName }) {
      return (
        <div>
          <h1>Welcome, {userName}</h1>
          <NavWithContext />
        </div>
      );
    }
    
    function NavWithContext() {
      return (
        <nav>
          <NavItemWithContext />
        </nav>
      );
    }
    
    function NavItemWithContext() {
      // 直接从Context获取theme，无需经过props传递
      const theme = useContext(ThemeContext);
      return (
        <button className={theme}>
          Settings
        </button>
      );
    }
    
    // 解决方案2：使用组合(Composition)
    function AppWithComposition() {
      const [user, setUser] = useState({ name: 'John', theme: 'dark' });
      
      // 直接将NavItem注入到需要的位置
      const navItem = <button className={user.theme}>Settings</button>;
      
      return (
        <div>
          <h1>Welcome, {user.name}</h1>
          <nav>
            {navItem}
          </nav>
        </div>
      );
    }
    ```

### 组件设计模式
- **组合模式**
  - children属性
  
    React的`children`属性允许组件像容器一样包含其他组件，提高了组件的灵活性和可复用性。

    ```jsx
    // 基本children属性使用
    function Card({ children, title }) {
      return (
        <div className="card">
          <div className="card-header">
            <h2>{title}</h2>
          </div>
          <div className="card-body">
            {children}
          </div>
        </div>
      );
    }
    
    // 使用Card组件
    function App() {
      return (
        <Card title="Welcome">
          <p>This is a card component that uses children.</p>
          <button>Click me</button>
        </Card>
      );
    }
    
    // 操作和检查children
    function ChildrenCounter({ children }) {
      // React.Children提供了处理children的工具
      const count = React.Children.count(children);
      
      return (
        <div>
          <p>There are {count} children:</p>
          <div className="children-container">
            {React.Children.map(children, child => (
              <div className="child-wrapper">
                {child}
              </div>
            ))}
          </div>
        </div>
      );
    }
    ```

  - 插槽实现
  
    React可以通过特定的props或对象来实现类似Vue插槽的功能，让组件更加灵活。

    ```jsx
    // 基本插槽实现
    function Layout({ header, content, footer }) {
      return (
        <div className="layout">
          <header className="header">{header}</header>
          <main className="content">{content}</main>
          <footer className="footer">{footer}</footer>
        </div>
      );
    }
    
    // 使用Layout组件
    function App() {
      return (
        <Layout
          header={<h1>My Website</h1>}
          content={<p>Welcome to my website!</p>}
          footer={<p>&copy; 2023 My Company</p>}
        />
      );
    }
    
    // 使用对象实现命名插槽
    function Tabs({ tabs }) {
      const [activeTab, setActiveTab] = useState(0);
      
      return (
        <div className="tabs">
          <div className="tabs-header">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={index === activeTab ? 'active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tabs-content">
            {tabs[activeTab].content}
          </div>
        </div>
      );
    }
    
    // 使用Tabs组件
    function App() {
      const tabs = [
        { label: 'Home', content: <HomeContent /> },
        { label: 'Profile', content: <ProfileContent /> },
        { label: 'Settings', content: <SettingsContent /> }
      ];
      
      return <Tabs tabs={tabs} />;
    }
    ```

  - 组合vs继承
  
    React推荐使用组合而非继承来复用组件逻辑。

    ```jsx
    // 避免使用继承的反面示例
    class Button extends React.Component {
      render() {
        return <button className="btn">{this.props.label}</button>;
      }
    }
    
    // 不推荐：继承Button创建PrimaryButton
    class PrimaryButton extends Button {
      render() {
        const button = super.render();
        return React.cloneElement(button, {
          className: button.props.className + ' btn-primary'
        });
      }
    }
    
    // 推荐：使用组合
    function Button({ primary, label, ...rest }) {
      const className = `btn ${primary ? 'btn-primary' : ''}`;
      return <button className={className} {...rest}>{label}</button>;
    }
    
    // 使用Button组件创建不同样式的按钮
    function App() {
      return (
        <div>
          <Button label="Normal Button" />
          <Button label="Primary Button" primary />
        </div>
      );
    }
    
    // 特殊场景：组合实现特殊功能
    function withTooltip(WrappedComponent) {
      return function TooltipComponent({ tooltip, ...props }) {
        const [showTooltip, setShowTooltip] = useState(false);
        
        return (
          <div 
            className="tooltip-container"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Component {...props} />
            {showTooltip && <div className="tooltip">{tooltip}</div>}
          </div>
        );
      };
    }
    
    const ButtonWithTooltip = withTooltip(Button);
    
    function App() {
      return (
        <ButtonWithTooltip 
          label="Hover me" 
          tooltip="This is a tooltip!" 
        />
      );
    }
    ```

  - 组件拆分原则
  
    合理拆分组件可以提高可维护性和复用性。

    ```jsx
    // 拆分前：一个大组件
    function UserProfile({ user }) {
      return (
        <div className="user-profile">
          <div className="header">
            <img src={user.avatar} alt={user.name} />
            <h2>{user.name}</h2>
          </div>
          <div className="stats">
            <div className="stat">
              <span>Followers</span>
              <span>{user.followers}</span>
            </div>
            <div className="stat">
              <span>Following</span>
              <span>{user.following}</span>
            </div>
            <div className="stat">
              <span>Posts</span>
              <span>{user.posts}</span>
            </div>
          </div>
          <div className="bio">
            <h3>Bio</h3>
            <p>{user.bio}</p>
          </div>
          <div className="recent-posts">
            <h3>Recent Posts</h3>
            {user.recentPosts.map(post => (
              <div key={post.id} className="post">
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // 拆分后：多个小组件
    function UserAvatar({ src, name }) {
      return <img src={src} alt={name} className="user-avatar" />;
    }
    
    function UserHeader({ user }) {
      return (
        <div className="header">
          <UserAvatar src={user.avatar} name={user.name} />
          <h2>{user.name}</h2>
        </div>
      );
    }
    
    function UserStats({ followers, following, posts }) {
      return (
        <div className="stats">
          <StatItem label="Followers" value={followers} />
          <StatItem label="Following" value={following} />
          <StatItem label="Posts" value={posts} />
        </div>
      );
    }
    
    function StatItem({ label, value }) {
      return (
        <div className="stat">
          <span>{label}</span>
          <span>{value}</span>
        </div>
      );
    }
    
    function UserBio({ bio }) {
      return (
        <div className="bio">
          <h3>Bio</h3>
          <p>{bio}</p>
        </div>
      );
    }
    
    function PostList({ posts }) {
      return (
        <div className="recent-posts">
          <h3>Recent Posts</h3>
          {posts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      );
    }
    
    function PostItem({ post }) {
      return (
        <div className="post">
          <h4>{post.title}</h4>
          <p>{post.excerpt}</p>
        </div>
      );
    }
    
    // 重构后的UserProfile组件
    function UserProfile({ user }) {
      return (
        <div className="user-profile">
          <UserHeader user={user} />
          <UserStats 
            followers={user.followers} 
            following={user.following} 
            posts={user.posts} 
          />
          <UserBio bio={user.bio} />
          <PostList posts={user.recentPosts} />
        </div>
      );
    }
    ```

  - 内容分发
  
    内容分发允许组件接收不同部分的内容并分发到对应位置。

    ```jsx
    // 内容分发示例
    function SplitPane({ left, right }) {
      return (
        <div className="split-pane">
          <div className="split-pane-left">{left}</div>
          <div className="split-pane-right">{right}</div>
        </div>
      );
    }
    
    function App() {
      return (
        <SplitPane
          left={<Navigation />}
          right={<Content />}
        />
      );
    }
    
    // 复杂内容分发
    function Dashboard({ header, sidebar, main, footer }) {
      return (
        <div className="dashboard">
          <header className="dashboard-header">{header}</header>
          <div className="dashboard-body">
            <aside className="dashboard-sidebar">{sidebar}</aside>
            <main className="dashboard-main">{main}</main>
          </div>
          <footer className="dashboard-footer">{footer}</footer>
        </div>
      );
    }
    
    function App() {
      return (
        <Dashboard
          header={<Header />}
          sidebar={<Sidebar />}
          main={<MainContent />}
          footer={<Footer />}
        />
      );
    }
    ```

- **高阶组件(HOC)**
  - HOC概念与原理
  
    高阶组件是接收一个组件并返回一个新组件的函数，用于复用组件逻辑。

    ```jsx
    // 高阶组件基本结构
    function withExample(WrappedComponent) {
      // 返回一个新的组件
      return function EnhancedComponent(props) {
        // 增强逻辑
        const enhancedProps = { ...props, extraProp: 'value' };
        
        // 渲染被包装的组件，传入增强后的props
        return <WrappedComponent {...enhancedProps} />;
      };
    }
    
    // 使用高阶组件
    function MyComponent({ extraProp, ...rest }) {
      return (
        <div>
          <p>Extra prop: {extraProp}</p>
          {/* 使用其他props */}
        </div>
      );
    }
    
    const EnhancedComponent = withExample(MyComponent);
    
    // 使用增强后的组件
    function App() {
      return <EnhancedComponent normalProp="Hello" />;
    }
    ```

  - 属性代理
  
    属性代理是HOC的一种模式，通过操作props来增强组件。

    ```jsx
    // 属性代理示例：添加额外props
    function withExtraProps(WrappedComponent) {
      return function EnhancedComponent(props) {
        const extraProps = {
          extraData: 'Some extra data',
          extraMethod: () => console.log('Extra method called')
        };
        
        return <WrappedComponent {...props} {...extraProps} />;
      };
    }
    
    // 属性代理示例：提取和添加props
    function withUserData(WrappedComponent) {
      return function UserDataComponent({ userId, ...rest }) {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
          // 假设fetchUser是一个API调用函数
          fetchUser(userId)
            .then(data => {
              setUser(data);
              setLoading(false);
            })
            .catch(error => {
              console.error(error);
              setLoading(false);
            });
        }, [userId]);
        
        // 处理加载状态
        if (loading) return <div>Loading...</div>;
        if (!user) return <div>Error loading user</div>;
        
        // 将获取到的user数据作为props传递
        return <WrappedComponent {...rest} user={user} />;
      };
    }
    
    // 使用withUserData
    function UserProfile({ user }) {
      return (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      );
    }
    
    const UserProfileWithData = withUserData(UserProfile);
    
    function App() {
      return <UserProfileWithData userId={123} />;
    }
    ```

  - 反向继承
  
    反向继承是HOC的另一种模式，可以访问被包装组件的内部状态和方法。

    ```jsx
    // 反向继承示例
    function withOverride(WrappedComponent) {
      // 返回一个继承自WrappedComponent的类
      return class extends WrappedComponent {
        render() {
          // 调用被包装组件的render方法
          const originalElement = super.render();
          
          // 修改渲染结果
          return React.cloneElement(originalElement, {
            className: `${originalElement.props.className || ''} enhanced-component`
          });
        }
      };
    }
    
    // 反向继承可以拦截生命周期方法
    function withLogLifecycle(WrappedComponent) {
      return class extends WrappedComponent {
        componentDidMount() {
          console.log(`${WrappedComponent.name} did mount`);
          if (super.componentDidMount) {
            super.componentDidMount();
          }
        }
        
        componentWillUnmount() {
          console.log(`${WrappedComponent.name} will unmount`);
          if (super.componentWillUnmount) {
            super.componentWillUnmount();
          }
        }
        
        render() {
          console.log(`${WrappedComponent.name} rendering`);
          return super.render();
        }
      };
    }
    
    // 反向继承可以拦截渲染流程
    function withConditionalRendering(WrappedComponent) {
      return class extends WrappedComponent {
        render() {
          // 检查特定条件
          if (this.props.isLoading) {
            return <div>Loading...</div>;
          }
          
          if (this.props.error) {
            return <div>Error: {this.props.error}</div>;
          }
          
          // 默认渲染
          return super.render();
        }
      };
    }
    ```

  - 常见HOC实现
  
    高阶组件有多种常见实现模式，用于不同场景。

    ```jsx
    // 1. 身份验证HOC
    function withAuth(WrappedComponent) {
      return function AuthComponent(props) {
        const { isAuthenticated, user } = useAuth(); // 假设有一个useAuth钩子
        
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        
        return <WrappedComponent {...props} user={user} />;
      };
    }
    
    // 2. 加载状态HOC
    function withLoading(WrappedComponent, loadingPropName = 'isLoading') {
      return function LoadingComponent(props) {
        if (props[loadingPropName]) {
          return <LoadingSpinner />;
        }
        
        return <WrappedComponent {...props} />;
      };
    }
    
    // 3. 错误边界HOC
    function withErrorBoundary(WrappedComponent) {
      return class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        
        componentDidCatch(error, errorInfo) {
          console.error('Error caught by boundary:', error, errorInfo);
          // 可以将错误发送到监控服务
        }
        
        render() {
          if (this.state.hasError) {
            return <ErrorDisplay error={this.state.error} />;
          }
          
          return <WrappedComponent {...this.props} />;
        }
      };
    }
    
    // 4. 样式注入HOC
    function withStyles(WrappedComponent, styles) {
      return function StyledComponent(props) {
        return <WrappedComponent {...props} style={{ ...props.style, ...styles }} />;
      };
    }
    
    // 使用样式注入HOC
    const RedButton = withStyles(Button, { backgroundColor: 'red', color: 'white' });
    ```

  - 多HOC组合
  
    可以组合多个HOC来叠加不同的功能增强。

    ```jsx
    // HOC组合示例
    // 注意：HOC的应用顺序是从右到左（从内到外）
    
    // 基础组件
    function UserProfile({ user, theme }) {
      return (
        <div className={`profile ${theme}`}>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      );
    }
    
    // 应用多个HOC
    const EnhancedUserProfile = withAuth(
      withLoading(
        withErrorBoundary(
          withUserData(UserProfile)
        ),
        'loadingUser'
      )
    );
    
    // 使用compose简化HOC组合
    // compose函数从右到左组合多个函数
    function compose(...funcs) {
      if (funcs.length === 0) {
        return arg => arg;
      }
      
      if (funcs.length === 1) {
        return funcs[0];
      }
      
      return funcs.reduce((a, b) => (...args) => a(b(...args)));
    }
    
    const enhance = compose(
      withAuth,
      withLoading,
      withErrorBoundary,
      withUserData
    );
    
    const EnhancedUserProfile = enhance(UserProfile);
    
    // 在实际应用中，可以使用第三方库如recompose
    // import { compose } from 'recompose';
    
    // 使用装饰器语法(需要Babel配置)
    /*
    @withAuth
    @withLoading
    @withErrorBoundary
    @withUserData
    class UserProfile extends React.Component {
      render() {
        const { user, theme } = this.props;
        return (
          <div className={`profile ${theme}`}>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        );
      }
    }
    */
    ```

- **Render Props**
  - 实现原理
  
    Render Props是一种通过函数属性来共享组件间逻辑的模式，核心思想是将渲染逻辑委托给父组件。

    ```jsx
    // 基本的Render Props模式
    function DataProvider({ render }) {
      const [data, setData] = useState({ count: 0 });
      
      const increment = () => {
        setData(prevData => ({ count: prevData.count + 1 }));
      };
      
      // 调用传入的render函数，将状态和方法作为参数传递
      return render(data, { increment });
    }
    
    // 使用DataProvider组件
    function App() {
      return (
        <DataProvider 
          render={(data, { increment }) => (
            <div>
              <p>Count: {data.count}</p>
              <button onClick={increment}>Increment</button>
            </div>
          )}
        />
      );
    }
    
    // 使用children作为函数的变体
    function DataProvider({ children }) {
      const [data, setData] = useState({ count: 0 });
      
      const increment = () => {
        setData(prevData => ({ count: prevData.count + 1 }));
      };
      
      // 调用children作为函数
      return children(data, { increment });
    }
    
    // 使用基于children的Render Props
    function App() {
      return (
        <DataProvider>
          {(data, { increment }) => (
            <div>
              <p>Count: {data.count}</p>
              <button onClick={increment}>Increment</button>
            </div>
          )}
        </DataProvider>
      );
    }
    ```

  - 与HOC对比
  
    Render Props和HOC各有优势，适合不同的场景。

    ```jsx
    // 同样功能的HOC实现
    function withData(WrappedComponent) {
      return function WithData(props) {
        const [data, setData] = useState({ count: 0 });
        
        const increment = () => {
          setData(prevData => ({ count: prevData.count + 1 }));
        };
        
        // 传递props、data和方法给被包装组件
        return (
          <WrappedComponent
            {...props}
            data={data}
            increment={increment}
          />
        );
      };
    }
    
    // 使用HOC
    function Counter({ data, increment }) {
      return (
        <div>
          <p>Count: {data.count}</p>
          <button onClick={increment}>Increment</button>
        </div>
      );
    }
    
    const CounterWithData = withData(Counter);
    
    // 使用增强后的组件
    function App() {
      return <CounterWithData />;
    }
    
    // Render Props的优势：
    // 1. 避免了HOC的props命名冲突问题
    // 2. 更灵活的组合方式
    // 3. 更明确的数据流向
    
    // HOC的优势：
    // 1. 使用时更简洁
    // 2. 更容易组合多个高阶组件
    // 3. 可以使用装饰器语法（在类组件中）
    ```

  - 嵌套问题
  
    Render Props模式可能导致嵌套问题，但有解决方案。

    ```jsx
    // 嵌套问题示例
    function App() {
      return (
        <MouseTracker>
          {mouse => (
            <WindowSize>
              {size => (
                <ThemeContext.Consumer>
                  {theme => (
                    <div>
                      <p>Mouse position: {mouse.x}, {mouse.y}</p>
                      <p>Window size: {size.width}x{size.height}</p>
                      <p>Current theme: {theme}</p>
                    </div>
                  )}
                </ThemeContext.Consumer>
              )}
            </WindowSize>
          )}
        </MouseTracker>
      );
    }
    
    // 解决方案1：组合多个Render Props
    function CombinedProvider({ render }) {
      const [mouse, setMouse] = useState({ x: 0, y: 0 });
      const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
      
      useEffect(() => {
        const handleMouseMove = (e) => {
          setMouse({ x: e.clientX, y: e.clientY });
        };
        
        const handleResize = () => {
          setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('resize', handleResize);
        };
      }, []);
      
      return render({ mouse, size });
    }
    
    // 使用组合后的Provider
    function App() {
      return (
        <CombinedProvider 
          render={({ mouse, size }) => (
            <ThemeContext.Consumer>
              {theme => (
                <div>
                  <p>Mouse position: {mouse.x}, {mouse.y}</p>
                  <p>Window size: {size.width}x{size.height}</p>
                  <p>Current theme: {theme}</p>
                </div>
              )}
            </ThemeContext.Consumer>
          )}
        />
      );
    }
    
    // 解决方案2：使用Hooks替代
    function App() {
      const mouse = useMouse();
      const size = useWindowSize();
      const theme = useContext(ThemeContext);
      
      return (
        <div>
          <p>Mouse position: {mouse.x}, {mouse.y}</p>
          <p>Window size: {size.width}x{size.height}</p>
          <p>Current theme: {theme}</p>
        </div>
      );
    }
    ```

  - 实际应用场景
  
    Render Props在多种场景中非常有用。

    ```jsx
    // 1. 鼠标位置追踪
    function MouseTracker({ children }) {
      const [position, setPosition] = useState({ x: 0, y: 0 });
      
      useEffect(() => {
        const handleMouseMove = (event) => {
          setPosition({ x: event.clientX, y: event.clientY });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);
      
      return children(position);
    }
    
    // 自定义鼠标指针
    function App() {
      return (
        <MouseTracker>
          {mouse => (
            <div style={{ height: '100vh' }}>
              <div
                style={{
                  position: 'absolute',
                  left: mouse.x,
                  top: mouse.y,
                  width: 20,
                  height: 20,
                  background: 'red',
                  borderRadius: '50%'
                }}
              />
            </div>
          )}
        </MouseTracker>
      );
    }
    
    // 2. 表单控件封装
    function FormField({ name, label, render }) {
      const [value, setValue] = useState('');
      const [touched, setTouched] = useState(false);
      const [error, setError] = useState(null);
      
      const handleChange = (e) => {
        setValue(e.target.value);
      };
      
      const handleBlur = () => {
        setTouched(true);
        // 简单的验证
        if (!value && touched) {
          setError(`${label} is required`);
        } else {
          setError(null);
        }
      };
      
      return render({
        name,
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        touched,
        error
      });
    }
    
    // 使用FormField组件
    function LoginForm() {
      return (
        <form>
          <FormField
            name="username"
            label="Username"
            render={({ name, value, onChange, onBlur, touched, error }) => (
              <div>
                <label htmlFor={name}>Username:</label>
                <input
                  id={name}
                  name={name}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                {touched && error && <p className="error">{error}</p>}
              </div>
            )}
          />
          
          <FormField
            name="password"
            label="Password"
            render={({ name, value, onChange, onBlur, touched, error }) => (
              <div>
                <label htmlFor={name}>Password:</label>
                <input
                  id={name}
                  name={name}
                  type="password"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                {touched && error && <p className="error">{error}</p>}
              </div>
            )}
          />
          
          <button type="submit">Login</button>
        </form>
      );
    }
    ```

  - 性能考量
  
    Render Props有一些性能注意事项，但都有对应的解决方案。

    ```jsx
    // 潜在的性能问题：每次渲染都创建新的函数
    function List({ items }) {
      return (
        <DataProvider
          render={data => (
            <ul>
              {items.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
              <li>Data count: {data.count}</li>
            </ul>
          )}
        />
      );
    }
    
    // 解决方案1：将render函数提取出来
    function List({ items }) {
      // 定义一个组件来处理渲染
      const ListRenderer = ({ data }) => (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
          <li>Data count: {data.count}</li>
        </ul>
      );
      
      return (
        <DataProvider
          render={data => <ListRenderer data={data} items={items} />}
        />
      );
    }
    
    // 解决方案2：使用useCallback缓存render函数（在Hooks出现后）
    function List({ items }) {
      const renderList = useCallback(data => (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
          <li>Data count: {data.count}</li>
        </ul>
      ), [items]);
      
      return <DataProvider render={renderList} />;
    }
    
    // 解决方案3：使用组件组合而非函数
    function DataProvider({ children }) {
      const [data, setData] = useState({ count: 0 });
      
      const increment = () => {
        setData(prevData => ({ count: prevData.count + 1 }));
      };
      
      // 克隆children并传入props
      return React.cloneElement(children, { data, increment });
    }
    
    function List({ items, data }) {
      return (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
          <li>Data count: {data?.count}</li>
        </ul>
      );
    }
    
    function App() {
      const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
      
      return (
        <DataProvider>
          <List items={items} />
        </DataProvider>
      );
    }
    ```

### 事件处理
- **合成事件系统**
  - 事件委托机制
  - 与原生事件区别
  - 事件对象复用
  - 事件池概念
  - React 17事件变化
- **事件处理模式**
  - 事件绑定方式
  - this绑定解决方案
  - 参数传递
  - 事件防抖与节流
  - 自定义事件封装
- **表单处理**
  - 受控组件
  - 非受控组件
  - 表单状态管理
  - 表单验证模式
  - 动态表单

### 样式与主题
- **CSS-in-JS**
  - Styled-components
  - Emotion
  - JSS原理
  - 主题定制
  - 动态样式
- **CSS模块化**
  - CSS Modules
  - Sass/Less集成
  - PostCSS配置
  - 样式隔离
  - 全局样式管理
- **Tailwind与原子CSS**
  - Tailwind集成
  - 原子CSS理念
  - 按需加载优化
  - 样式扩展
  - 主题切换

## Hooks与函数式组件

### Hooks基础
- **useState**
  - 状态声明
  
    useState是React最基本的Hook，用于在函数组件中添加状态。

    ```jsx
    // 基本用法
    import React, { useState } from 'react';
    
    function Counter() {
      // 声明一个名为count的state变量，初始值为0
      const [count, setCount] = useState(0);
      
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
    
    // 使用多个state变量
    function UserForm() {
      const [name, setName] = useState('');
      const [age, setAge] = useState(0);
      const [email, setEmail] = useState('');
      
      return (
        <form>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            type="number"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            placeholder="Age"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
        </form>
      );
    }
    
    // 使用对象state
    function ComplexForm() {
      const [formData, setFormData] = useState({
        name: '',
        age: 0,
        email: ''
      });
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,    // 保留其他字段
          [name]: value   // 更新当前字段
        });
      };
      
      return (
        <form>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
        </form>
      );
    }
    ```

  - 函数式更新
  
    当新状态依赖于之前的状态时，应该使用函数式更新。

    ```jsx
    // 不安全的更新方式（可能导致状态丢失）
    function Counter() {
      const [count, setCount] = useState(0);
      
      // 如果这个函数被快速调用多次，可能不会正确更新
      const increment = () => {
        setCount(count + 1); // 依赖于当前的count值
      };
      
      // 连续调用increment可能无法得到预期结果
      const incrementTwice = () => {
        increment();
        increment(); // 可能仍然使用相同的count值
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
          <button onClick={incrementTwice}>Increment Twice</button>
        </div>
      );
    }
    
    // 安全的函数式更新
    function Counter() {
      const [count, setCount] = useState(0);
      
      // 使用函数式更新，总是基于最新的state
      const increment = () => {
        setCount(prevCount => prevCount + 1);
      };
      
      // 连续调用会正确更新
      const incrementTwice = () => {
        increment();
        increment(); // 会正确获取上一次更新后的值
      };
      
      // 更复杂的函数式更新
      const incrementByAmount = (amount) => {
        setCount(prevCount => prevCount + amount);
      };
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
          <button onClick={incrementTwice}>Increment Twice</button>
          <button onClick={() => incrementByAmount(5)}>Add 5</button>
        </div>
      );
    }
    
    // 对象状态的函数式更新
    function UserProfileEditor() {
      const [profile, setProfile] = useState({
        name: 'John',
        age: 30,
        skills: ['JavaScript', 'React']
      });
      
      // 安全地更新嵌套对象
      const addSkill = (skill) => {
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: [...prevProfile.skills, skill]
        }));
      };
      
      // 安全地替换特定索引的元素
      const updateSkill = (index, newSkill) => {
        setProfile(prevProfile => ({
          ...prevProfile,
          skills: prevProfile.skills.map((skill, i) => 
            i === index ? newSkill : skill
          )
        }));
      };
      
      return (
        <div>
          <h2>{profile.name}, {profile.age}</h2>
          <ul>
            {profile.skills.map((skill, index) => (
              <li key={index}>
                {skill}
                <button onClick={() => updateSkill(index, skill + ' (Advanced)')}>
                  Upgrade
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => addSkill('TypeScript')}>Add TypeScript</button>
        </div>
      );
    }
    ```

  - 惰性初始化
  
    对于计算成本高的初始化状态，可以使用惰性初始化。

    ```jsx
    // 直接初始化（每次渲染都会执行复杂计算）
    function UserList() {
      // 下面的代码在每次渲染时都会执行，即使初始值只需要一次
      const [users, setUsers] = useState(
        Array(1000).fill().map((_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`
        }))
      );
      
      // 组件逻辑...
    }
    
    // 惰性初始化（只在第一次渲染时执行）
    function UserList() {
      const [users, setUsers] = useState(() => {
        console.log('Initializing users - this runs only once');
        // 复杂计算只在初始渲染时执行
        return Array(1000).fill().map((_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`
        }));
      });
      
      // 组件逻辑...
    }
    
    // 从localStorage读取初始值的常见用例
    function SavedCounter() {
      const [count, setCount] = useState(() => {
        // 尝试从localStorage读取，如果不存在则使用默认值
        const savedCount = localStorage.getItem('count');
        return savedCount !== null ? Number(savedCount) : 0;
      });
      
      // 保存到localStorage
      useEffect(() => {
        localStorage.setItem('count', count.toString());
      }, [count]);
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      );
    }
    ```

  - 多状态管理
  
    对于复杂状态，有多种管理方式。

    ```jsx
    // 方式1：多个独立状态
    function UserProfile() {
      const [name, setName] = useState('');
      const [age, setAge] = useState(0);
      const [email, setEmail] = useState('');
      const [address, setAddress] = useState('');
      
      // 每个字段有独立的更新函数
      const handleNameChange = (e) => setName(e.target.value);
      const handleAgeChange = (e) => setAge(Number(e.target.value));
      const handleEmailChange = (e) => setEmail(e.target.value);
      const handleAddressChange = (e) => setAddress(e.target.value);
      
      // 组件代码...
    }
    
    // 方式2：单一对象状态
    function UserProfile() {
      const [user, setUser] = useState({
        name: '',
        age: 0,
        email: '',
        address: ''
      });
      
      // 通用的更新函数
      const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({
          ...user,
          [name]: name === 'age' ? Number(value) : value
        });
      };
      
      // 组件代码...
    }
    
    // 方式3：useReducer管理复杂状态（预览）
    function userReducer(state, action) {
      switch (action.type) {
        case 'UPDATE_FIELD':
          return { ...state, [action.field]: action.value };
        case 'RESET':
          return { name: '', age: 0, email: '', address: '' };
        default:
          return state;
      }
    }
    
    function UserProfile() {
      const [user, dispatch] = useReducer(userReducer, {
        name: '',
        age: 0,
        email: '',
        address: ''
      });
      
      const handleChange = (e) => {
        const { name, value } = e.target;
        dispatch({
          type: 'UPDATE_FIELD',
          field: name,
          value: name === 'age' ? Number(value) : value
        });
      };
      
      const handleReset = () => {
        dispatch({ type: 'RESET' });
      };
      
      // 组件代码...
    }
    ```

  - 状态重置时机
  
    了解状态重置的时机对于正确使用useState很重要。

    ```jsx
    // 示例：何时状态会被重置
    function Counter({ initialCount = 0 }) {
      // 组件重新渲染不会重置状态
      const [count, setCount] = useState(initialCount);
      
      // initialCount改变不会导致state重置
      // useState只在组件第一次渲染时使用初始值
      
      // 重置计数器
      const reset = () => setCount(initialCount);
      
      return (
        <div>
          <p>Count: {count}</p>
          <button onClick={() => setCount(count + 1)}>Increment</button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    }
    
    // 示例：当key改变时状态会重置
    function App() {
      const [userId, setUserId] = useState(1);
      
      return (
        <div>
          <button onClick={() => setUserId(userId + 1)}>
            Switch User
          </button>
          
          {/* key改变会导致UserProfile完全卸载并重新挂载，状态重置 */}
          <UserProfile key={userId} userId={userId} />
        </div>
      );
    }
    
    // 示例：组件卸载会导致状态丢失
    function ToggleCounter() {
      const [showCounter, setShowCounter] = useState(true);
      
      return (
        <div>
          <button onClick={() => setShowCounter(!showCounter)}>
            {showCounter ? 'Hide' : 'Show'} Counter
          </button>
          
          {showCounter && <Counter />}
          {/* Counter被卸载后，再次挂载会使用初始状态 */}
        </div>
      );
    }
    
    // 跨组件实例保留状态
    function App() {
      // 将状态提升到父组件
      const [count, setCount] = useState(0);
      const [showCounter, setShowCounter] = useState(true);
      
      return (
        <div>
          <button onClick={() => setShowCounter(!showCounter)}>
            {showCounter ? 'Hide' : 'Show'} Counter
          </button>
          
          {showCounter && (
            <div>
              <p>Count: {count}</p>
              <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
          )}
          {/* 即使UI组件卸载，状态仍然保留在App组件中 */}
        </div>
      );
    }
    ```

- **useEffect**
  - 副作用处理
  
    useEffect用于在函数组件中执行副作用操作，如数据获取、订阅或手动DOM操作。

    ```jsx
    // 基本用法
    import React, { useState, useEffect } from 'react';
    
    function Example() {
      const [count, setCount] = useState(0);
      
      // 类似于componentDidMount和componentDidUpdate
      useEffect(() => {
        // 更新文档标题
        document.title = `You clicked ${count} times`;
      });
      
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
    
    // 数据获取示例
    function UserProfile({ userId }) {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        // 定义异步函数
        async function fetchUserData() {
          try {
            setLoading(true);
            // 假设fetchUser是一个API调用
            const userData = await fetchUser(userId);
            setUser(userData);
            setError(null);
          } catch (err) {
            setError('Failed to fetch user data');
            setUser(null);
          } finally {
            setLoading(false);
          }
        }
        
        // 调用异步函数
        fetchUserData();
      }, [userId]); // 仅在userId变化时重新获取
      
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error}</div>;
      if (!user) return <div>No user data</div>;
      
      return (
        <div>
          <h1>{user.name}</h1>
          <p>Email: {user.email}</p>
        </div>
      );
    }
    
    // DOM操作示例
    function AutoFocusInput() {
      const inputRef = useRef(null);
      
      useEffect(() => {
        // 自动聚焦输入框
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, []); // 空依赖数组，仅在挂载时执行一次
      
      return <input ref={inputRef} type="text" />;
    }
    ```

  - 依赖数组
  
    依赖数组控制useEffect执行的时机。

    ```jsx
    // 每次渲染后都执行（没有依赖数组）
    useEffect(() => {
      console.log('This runs after every render');
    });
    
    // 仅在挂载时执行（空依赖数组）
    useEffect(() => {
      console.log('This runs only on mount');
    }, []);
    
    // 仅在特定依赖变化时执行
    useEffect(() => {
      console.log(`Count changed to: ${count}`);
    }, [count]); // 仅在count变化时执行
    
    // 多个依赖项
    useEffect(() => {
      console.log(`User ID: ${userId}, Page: ${page}`);
      fetchData(userId, page);
    }, [userId, page]); // 当userId或page变化时执行
    
    // 使用引用类型依赖的问题
    function Example({ options }) {
      useEffect(() => {
        console.log('Options changed', options);
      }, [options]); // 警告：每次渲染options可能都是新对象
      
      // 解决方案：使用具体的原始值作为依赖
      useEffect(() => {
        console.log('Selected option changed', options.selected);
      }, [options.selected]); // 只在options.selected变化时执行
    }
    
    // 使用useCallback和useMemo稳定依赖
    function SearchResults() {
      const [query, setQuery] = useState('');
      const [page, setPage] = useState(1);
      
      // 使用useMemo稳定对象引用
      const searchParams = useMemo(() => ({
        query,
        page
      }), [query, page]);
      
      // 使用useCallback稳定函数引用
      const fetchResults = useCallback(() => {
        fetchSearchResults(query, page);
      }, [query, page]);
      
      useEffect(() => {
        fetchResults();
      }, [fetchResults]); // 依赖稳定的函数引用
    }
    ```

  - 清理函数
  
    useEffect可以返回一个清理函数，在组件卸载或依赖变化前执行。

    ```jsx
    // 基本清理示例
    function Timer() {
      const [seconds, setSeconds] = useState(0);
      
      useEffect(() => {
        const timer = setInterval(() => {
          setSeconds(s => s + 1);
        }, 1000);
        
        // 返回清理函数
        return () => {
          clearInterval(timer); // 清理定时器
          console.log('Timer cleaned up');
        };
      }, []); // 仅在挂载和卸载时执行
      
      return <div>Seconds: {seconds}</div>;
    }
    
    // 订阅示例
    function EventListener({ eventName, handler }) {
      useEffect(() => {
        console.log(`Subscribing to ${eventName}`);
        window.addEventListener(eventName, handler);
        
        // 清理订阅
        return () => {
          console.log(`Unsubscribing from ${eventName}`);
          window.removeEventListener(eventName, handler);
        };
      }, [eventName, handler]); // 依赖变化时先清理再重新订阅
      
      return null;
    }
    
    // 资源获取和取消
    function SearchResults({ query }) {
      const [results, setResults] = useState([]);
      const [loading, setLoading] = useState(false);
      
      useEffect(() => {
        // 跳过空查询
        if (!query.trim()) return;
        
        let isCancelled = false; // 用于处理竞态条件
        setLoading(true);
        
        fetch(`https://api.example.com/search?q=${query}`)
          .then(response => response.json())
          .then(data => {
            if (!isCancelled) { // 仅在未取消时更新状态
              setResults(data);
              setLoading(false);
            }
          })
          .catch(error => {
            if (!isCancelled) {
              console.error(error);
              setLoading(false);
            }
          });
        
        // 清理函数：标记为已取消
        return () => {
          isCancelled = true;
        };
      }, [query]);
      
      return (
        <div>
          {loading ? <p>Loading...</p> : (
            <ul>
              {results.map(item => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    ```

  - 执行时机
  
    理解useEffect的执行时机对于正确使用它至关重要。

    ```jsx
    // 执行顺序示例
    function ExecutionOrder() {
      console.log('1. Component render');
      
      useEffect(() => {
        console.log('4. Effect with no dependencies');
      });
      
      useEffect(() => {
        console.log('3. Effect with empty dependencies');
      }, []);
      
      useEffect(() => {
        console.log('5. Effect with dependencies', count);
      }, [count]);
      
      useLayoutEffect(() => {
        console.log('2. Layout effect runs synchronously before browser paint');
      });
      
      // 输出顺序：
      // 1. Component render
      // 2. Layout effect runs synchronously before browser paint
      // 3. Effect with empty dependencies
      // 4. Effect with no dependencies
      // 5. Effect with dependencies
    }
    
    // 条件执行
    function ConditionalFetch({ shouldFetch, userId }) {
      useEffect(() => {
        if (!shouldFetch) return;
        
        // 仅在shouldFetch为true时获取数据
        fetchUserData(userId);
      }, [shouldFetch, userId]);
    }
    
    // 不要在effect内部使用会引起组件重新渲染的状态更新而不控制依赖
    function BadExample() {
      const [count, setCount] = useState(0);
      
      // 这会导致无限循环！
      useEffect(() => {
        setCount(count + 1); // 更新状态触发重新渲染
      }); // 没有依赖数组，每次渲染后都执行
      
      return <div>{count}</div>;
    }
    
    // 解决方案：添加适当的依赖或使用函数式更新
    function GoodExample1() {
      const [count, setCount] = useState(0);
      
      // 使用空依赖数组，仅执行一次
      useEffect(() => {
        setCount(count + 1);
      }, []); // 仅在挂载时执行
      
      return <div>{count}</div>;
    }
    
    function GoodExample2() {
      const [count, setCount] = useState(0);
      
      // 使用函数式更新避免依赖count
      useEffect(() => {
        setCount(c => c + 1);
      }, []); // 仅在挂载时执行
      
      return <div>{count}</div>;
    }
    ```

  - 替代生命周期
  
    useEffect可以替代类组件中的多种生命周期方法。

    ```jsx
    // componentDidMount替代
    useEffect(() => {
      console.log('Component mounted');
      // 初始化代码，类似componentDidMount
      
      // 可选的清理函数，类似componentWillUnmount
      return () => {
        console.log('Component will unmount');
      };
    }, []); // 空依赖数组，仅在挂载和卸载时执行
    
    // componentDidUpdate替代
    useEffect(() => {
      console.log('count updated:', count);
      // 响应特定props或state变化，类似componentDidUpdate
    }, [count]); // 仅在count变化时执行
    
    // 组合多个生命周期
    function LifecycleDemo() {
      // 挂载和卸载
      useEffect(() => {
        console.log('Mounted');
        return () => console.log('Unmounting');
      }, []);
      
      // props变化
      useEffect(() => {
        console.log('Props changed:', props);
      }, [props.id, props.name]);
      
      // 状态变化
      useEffect(() => {
        console.log('State changed:', count);
      }, [count]);
    }
    
    // 特殊情况：替代componentDidCatch
    // 注意：截至目前，useEffect不能替代错误边界功能
    // 需要使用类组件和componentDidCatch/getDerivedStateFromError
    class ErrorBoundary extends React.Component {
      state = { hasError: false, error: null };
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        logErrorToService(error, errorInfo);
      }
      
      render() {
        if (this.state.hasError) {
          return <div>Something went wrong.</div>;
        }
        return this.props.children;
      }
    }
    
    // useEffect与getSnapshotBeforeUpdate和useLayoutEffect的区别
    function ScrollPositionExample() {
      const listRef = useRef();
      const [items, setItems] = useState([]);
      
      // 类似getSnapshotBeforeUpdate，但在浏览器绘制前同步执行
      useLayoutEffect(() => {
        if (listRef.current) {
          // 保存滚动位置
          const scrollPos = listRef.current.scrollHeight - listRef.current.scrollTop;
          
          // DOM更新后恢复相对滚动位置
          listRef.current.scrollTop = listRef.current.scrollHeight - scrollPos;
        }
      }, [items]); // 在items变化后，浏览器绘制前执行
      
      return (
        <div 
          ref={listRef} 
          style={{ height: '200px', overflow: 'auto' }}
        >
          {items.map(item => <div key={item.id}>{item.text}</div>)}
        </div>
      );
    }
    ```

- **useContext**
  - Context创建
  
    Context提供了一种在组件树中共享数据的方式，而不必显式地通过每层组件传递props。

    ```jsx
    // 创建Context
    import React, { createContext, useContext, useState } from 'react';
    
    // 创建Context对象，可以提供默认值
    const ThemeContext = createContext('light');
    
    // 在DevTools中显示有意义的名称
    ThemeContext.displayName = 'ThemeContext';
    
    // 创建带有初始状态的Context
    const UserContext = createContext({
      user: null,
      isAuthenticated: false
    });
    
    // 创建多个Context
    const LocaleContext = createContext('en');
    const ConfigContext = createContext({ version: '1.0.0' });
    
    // 使用TypeScript定义类型
    interface ThemeContextType {
      theme: string;
      toggleTheme: () => void;
    }
    
    const TypedThemeContext = createContext<ThemeContextType | undefined>(undefined);
    ```

  - Provider模式
  
    Provider组件用于向子组件提供Context值。

    ```jsx
    // 基本Provider用法
    function App() {
      const [theme, setTheme] = useState('light');
      
      return (
        <ThemeContext.Provider value={theme}>
          <div className={`app ${theme}`}>
            <Header />
            <Main />
            <Footer />
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              Toggle Theme
            </button>
          </div>
        </ThemeContext.Provider>
      );
    }
    
    // 嵌套Provider
    function App() {
      const [theme, setTheme] = useState('light');
      const [user, setUser] = useState(null);
      
      return (
        <ThemeContext.Provider value={theme}>
          <UserContext.Provider value={{ user, isAuthenticated: !!user }}>
            <AppContent />
          </UserContext.Provider>
        </ThemeContext.Provider>
      );
    }
    
    // 创建Provider组件和Context Hook
    function ThemeProvider({ children }) {
      const [theme, setTheme] = useState('light');
      
      const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
      };
      
      // 提供theme值和切换函数
      const value = { theme, toggleTheme };
      
      return (
        <TypedThemeContext.Provider value={value}>
          {children}
        </TypedThemeContext.Provider>
      );
    }
    
    // 自定义Hook以简化使用
    function useTheme() {
      const context = useContext(TypedThemeContext);
      if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
      }
      return context;
    }
    
    // 完整示例
    function App() {
      return (
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      );
    }
    
    function AppContent() {
      const { theme, toggleTheme } = useTheme();
      
      return (
        <div className={`app ${theme}`}>
          <h1>当前主题: {theme}</h1>
          <button onClick={toggleTheme}>切换主题</button>
        </div>
      );
    }
    ```

  - 消费Context
  
    可以通过useContext Hook轻松获取Context值。

    ```jsx
    // 使用useContext Hook
    function ThemedButton() {
      // 使用useContext访问Context值
      const theme = useContext(ThemeContext);
      
      return (
        <button className={`button-${theme}`}>
          主题按钮
        </button>
      );
    }
    
    // 使用多个Context
    function Profile() {
      const theme = useContext(ThemeContext);
      const { user, isAuthenticated } = useContext(UserContext);
      const locale = useContext(LocaleContext);
      
      if (!isAuthenticated) {
        return <LoginPrompt locale={locale} />;
      }
      
      return (
        <div className={`profile-${theme}`}>
          <h2>{user.name}</h2>
          <p>{locale === 'en' ? 'Welcome back!' : '欢迎回来!'}</p>
        </div>
      );
    }
    
    // 对比：类组件中使用Context
    class ThemedButtonClass extends React.Component {
      static contextType = ThemeContext; // 仅支持单个Context
      
      render() {
        const theme = this.context;
        return (
          <button className={`button-${theme}`}>
            主题按钮
          </button>
        );
      }
    }
    
    // 或者使用Consumer组件
    class ThemedButtonWithConsumer extends React.Component {
      render() {
        return (
          <ThemeContext.Consumer>
            {theme => (
              <button className={`button-${theme}`}>
                主题按钮
              </button>
            )}
          </ThemeContext.Consumer>
        );
      }
    }
    
    // 使用Consumer组合多个Context（可在类组件中使用）
    function MultiContextConsumer() {
      return (
        <ThemeContext.Consumer>
          {theme => (
            <UserContext.Consumer>
              {({ user }) => (
                <div className={`profile-${theme}`}>
                  {user ? <h2>{user.name}</h2> : <p>请登录</p>}
                </div>
              )}
            </UserContext.Consumer>
          )}
        </ThemeContext.Consumer>
      );
    }
    ```

  - 性能考量
  
    使用Context时需要注意性能问题，尤其是对于频繁更新的值。

    ```jsx
    // 性能问题示例
    function App() {
      const [theme, setTheme] = useState('light');
      const [count, setCount] = useState(0);
      
      // 每次count更新，整个context value都会变化
      // 导致所有消费Context的组件重新渲染
      return (
        <ThemeContext.Provider value={{ theme, count }}>
          <Counter />
          <ThemedButton />
        </ThemeContext.Provider>
      );
    }
    
    function Counter() {
      const { count, theme } = useContext(ThemeContext);
      // 即使只用到count，但theme变化时也会重新渲染
      return <div>计数: {count}</div>;
    }
    
    // 解决方案1：拆分Context
    const ThemeContext = createContext('light');
    const CountContext = createContext(0);
    
    function App() {
      const [theme, setTheme] = useState('light');
      const [count, setCount] = useState(0);
      
      return (
        <ThemeContext.Provider value={theme}>
          <CountContext.Provider value={count}>
            <Counter />
            <ThemedButton />
          </CountContext.Provider>
        </ThemeContext.Provider>
      );
    }
    
    function Counter() {
      // 只订阅CountContext，不受ThemeContext变化影响
      const count = useContext(CountContext);
      return <div>计数: {count}</div>;
    }
    
    // 解决方案2：使用memo避免不必要的重渲染
    const MemoizedCounter = React.memo(function Counter() {
      const { count } = useContext(ThemeContext);
      return <div>计数: {count}</div>;
    });
    
    // 解决方案3：拆分状态和更新函数
    const ThemeStateContext = createContext('light');
    const ThemeUpdateContext = createContext(() => {});
    
    function ThemeProvider({ children }) {
      const [theme, setTheme] = useState('light');
      
      return (
        <ThemeStateContext.Provider value={theme}>
          <ThemeUpdateContext.Provider value={setTheme}>
            {children}
          </ThemeUpdateContext.Provider>
        </ThemeStateContext.Provider>
      );
    }
    
    // 使用不同的Hook来分别获取状态和更新函数
    function useThemeState() {
      return useContext(ThemeStateContext);
    }
    
    function useThemeUpdate() {
      return useContext(ThemeUpdateContext);
    }
    
    // 消费组件只订阅需要的部分
    function ThemedComponent() {
      const theme = useThemeState(); // 只订阅主题状态
      return <div className={theme}>主题内容</div>;
    }
    
    function ThemeToggler() {
      const setTheme = useThemeUpdate(); // 只订阅更新函数
      return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>切换主题</button>;
    }
    ```

  - 与Redux对比
  
    Context API和Redux各有优缺点，适用于不同场景。

    ```jsx
    // Context + useReducer：类似Redux的状态管理
    // 创建初始状态和reducer
    const initialState = { count: 0, user: null };
    
    function appReducer(state, action) {
      switch (action.type) {
        case 'INCREMENT':
          return { ...state, count: state.count + 1 };
        case 'DECREMENT':
          return { ...state, count: state.count - 1 };
        case 'SET_USER':
          return { ...state, user: action.payload };
        default:
          return state;
      }
    }
    
    // 创建Context
    const StateContext = createContext();
    const DispatchContext = createContext();
    
    // 创建Provider
    function AppProvider({ children }) {
      const [state, dispatch] = useReducer(appReducer, initialState);
      
      return (
        <StateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>
            {children}
          </DispatchContext.Provider>
        </StateContext.Provider>
      );
    }
    
    // 创建自定义Hooks
    function useState() {
      const state = useContext(StateContext);
      if (state === undefined) {
        throw new Error('useState必须在AppProvider内部使用');
      }
      return state;
    }
    
    function useDispatch() {
      const dispatch = useContext(DispatchContext);
      if (dispatch === undefined) {
        throw new Error('useDispatch必须在AppProvider内部使用');
      }
      return dispatch;
    }
    
    // 使用
    function Counter() {
      const { count } = useState();
      const dispatch = useDispatch();
      
      return (
        <div>
          <p>计数: {count}</p>
          <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
          <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
        </div>
      );
    }
    
    function UserProfile() {
      const { user } = useState();
      const dispatch = useDispatch();
      
      const login = () => {
        // 模拟登录
        dispatch({ 
          type: 'SET_USER', 
          payload: { id: 1, name: '张三' } 
        });
      };
      
      return (
        <div>
          {user ? (
            <p>欢迎, {user.name}!</p>
          ) : (
            <button onClick={login}>登录</button>
          )}
        </div>
      );
    }
    
    function App() {
      return (
        <AppProvider>
          <Counter />
          <UserProfile />
        </AppProvider>
      );
    }
    
    // Context API vs Redux
    /**
     * Context API优势：
     * 1. 内置于React，无需额外依赖
     * 2. 简单场景下设置更少
     * 3. 与Hooks无缝集成
     * 
     * Redux优势：
     * 1. 专为大型应用设计，有成熟的状态管理模式
     * 2. 强大的开发工具和中间件生态
     * 3. 更好的性能优化（如选择器）
     * 4. 时间旅行调试等高级功能
     * 5. 更严格的状态更新约束
     */
    ```

### 高级Hooks
- **useReducer**
  - reducer模式
  
    useReducer是React提供的一个Hook，用于处理复杂的状态逻辑。它基于Redux的设计理念，使用reducer模式管理状态。

    ```jsx
    // useReducer的基本用法
    import React, { useReducer } from 'react';
    
    // 定义初始状态
    const initialState = { count: 0 };
    
    // 定义reducer函数
    function reducer(state, action) {
      switch (action.type) {
        case 'increment':
          return { count: state.count + 1 };
        case 'decrement':
          return { count: state.count - 1 };
        case 'reset':
          return initialState;
        default:
          throw new Error('未知的action类型');
      }
    }
    
    function Counter() {
      // 使用useReducer，返回当前状态和dispatch函数
      const [state, dispatch] = useReducer(reducer, initialState);
      
      return (
        <div>
          <p>计数: {state.count}</p>
          <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
          <button onClick={() => dispatch({ type: 'decrement' })}>减少</button>
          <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
        </div>
      );
    }
    ```

    `reducer`模式的核心理念是将状态更新逻辑从组件中抽离出来，通过纯函数处理状态变化，使得状态变化可预测且易于测试。

    ```
    +----------------+        +--------------+
    |                |        |              |
    |  Component     |        |   Reducer    |
    |                |        |              |
    +-------+--------+        +-------+------+
            |                         |
            | dispatch(action)        |
            +------------------------>|
            |                         |
            |                         | 根据action计算新状态
            |                         |
            | 新状态                   |
            |<------------------------+
            |                         |
            v                         |
    +----------------+                |
    | UI重新渲染      |                |
    +----------------+                |
    ```

  - action设计
  
    action是描述状态变化的对象，合理设计action结构能够让状态管理更加清晰。

    ```jsx
    // 简单的action设计
    dispatch({ type: 'increment' }); // 仅包含类型
    
    // 带有负载(payload)的action
    dispatch({ type: 'set_count', payload: 10 });
    
    // 多字段payload
    dispatch({ 
      type: 'update_user', 
      payload: { name: '张三', age: 30 } 
    });
    
    // 使用action创建函数
    function increment() {
      return { type: 'increment' };
    }
    
    function updateUser(name, age) {
      return { 
        type: 'update_user', 
        payload: { name, age } 
      };
    }
    
    // 使用action创建函数
    dispatch(increment());
    dispatch(updateUser('张三', 30));
    ```

    Action设计的最佳实践：
    
    1. **类型常量**：使用常量而非字符串字面量定义action类型，避免拼写错误。
    
    ```jsx
    // 定义action类型常量
    const ACTIONS = {
      INCREMENT: 'increment',
      DECREMENT: 'decrement',
      RESET: 'reset',
      UPDATE_USER: 'update_user'
    };
    
    // 使用常量
    dispatch({ type: ACTIONS.INCREMENT });
    ```
    
    2. **标准化结构**：采用Flux Standard Action(FSA)规范，让action结构一致。
    
    ```jsx
    // FSA规范的action结构
    {
      type: 'ACTION_TYPE',    // 必需，表示action类型
      payload: {},            // 可选，包含数据
      error: false,           // 可选，表示是否是错误action
      meta: {}                // 可选，额外信息
    }
    
    // 示例
    dispatch({
      type: 'fetch_user_failure',
      payload: new Error('网络错误'),
      error: true,
      meta: { userId: 123 }
    });
    ```

  - 状态复杂度
  
    随着状态复杂度增加，我们需要更结构化的方式来管理状态。

    ```jsx
    // 复杂状态示例
    const initialState = {
      user: {
        name: '',
        email: '',
        isLoggedIn: false
      },
      preferences: {
        theme: 'light',
        notifications: true
      },
      todos: [],
      ui: {
        isLoading: false,
        activeModal: null,
        selectedIds: []
      }
    };
    
    // 处理复杂状态的reducer
    function appReducer(state, action) {
      switch (action.type) {
        case 'login_success':
          return {
            ...state,
            user: {
              ...state.user,
              ...action.payload,
              isLoggedIn: true
            }
          };
          
        case 'update_preferences':
          return {
            ...state,
            preferences: {
              ...state.preferences,
              ...action.payload
            }
          };
          
        case 'add_todo':
          return {
            ...state,
            todos: [...state.todos, action.payload]
          };
          
        case 'toggle_loading':
          return {
            ...state,
            ui: {
              ...state.ui,
              isLoading: action.payload
            }
          };
          
        default:
          return state;
      }
    }
    ```

    对于更复杂的状态，可以采用**拆分reducer**的策略：

    ```jsx
    // 拆分reducer处理不同状态域
    function userReducer(state, action) {
      switch (action.type) {
        case 'login_success':
          return {
            ...state,
            ...action.payload,
            isLoggedIn: true
          };
        case 'logout':
          return {
            name: '',
            email: '',
            isLoggedIn: false
          };
        default:
          return state;
      }
    }
    
    function preferencesReducer(state, action) {
      switch (action.type) {
        case 'update_preferences':
          return {
            ...state,
            ...action.payload
          };
        case 'reset_preferences':
          return {
            theme: 'light',
            notifications: true
          };
        default:
          return state;
      }
    }
    
    // 组合子reducer的根reducer
    function rootReducer(state, action) {
      return {
        user: userReducer(state.user, action),
        preferences: preferencesReducer(state.preferences, action),
        todos: todosReducer(state.todos, action),
        ui: uiReducer(state.ui, action)
      };
    }
    
    // 在组件中使用
    function App() {
      const [state, dispatch] = useReducer(rootReducer, initialState);
      // ... 使用state和dispatch
    }
    ```

    结构化复杂状态的核心示意图：

    ```
    应用状态
    ├── 用户状态 (userReducer)
    │   ├── 名称
    │   ├── 邮箱
    │   └── 登录状态
    ├── 偏好设置 (preferencesReducer)
    │   ├── 主题
    │   └── 通知设置
    ├── 待办事项 (todosReducer)
    │   └── 待办列表
    └── UI状态 (uiReducer)
        ├── 加载状态
        ├── 激活的模态框
        └── 选中项ID列表
    ```

  - 与useState对比
  
    useReducer和useState各有优缺点，适合不同的场景。

    ```jsx
    // 使用useState管理相关状态
    function Counter() {
      const [count, setCount] = useState(0);
      const [step, setStep] = useState(1);
      
      const increment = () => setCount(count + step);
      const decrement = () => setCount(count - step);
      const updateStep = (e) => setStep(Number(e.target.value));
      
      return (
        <div>
          <p>计数: {count}</p>
          <input 
            type="number" 
            value={step} 
            onChange={updateStep} 
            min="1"
          />
          <button onClick={increment}>增加</button>
          <button onClick={decrement}>减少</button>
        </div>
      );
    }
    
    // 使用useReducer管理相关状态
    function counterReducer(state, action) {
      switch (action.type) {
        case 'increment':
          return { ...state, count: state.count + state.step };
        case 'decrement':
          return { ...state, count: state.count - state.step };
        case 'set_step':
          return { ...state, step: action.payload };
        default:
          return state;
      }
    }
    
    function Counter() {
      const [state, dispatch] = useReducer(counterReducer, { count: 0, step: 1 });
      
      return (
        <div>
          <p>计数: {state.count}</p>
          <input 
            type="number" 
            value={state.step} 
            onChange={(e) => dispatch({ 
              type: 'set_step', 
              payload: Number(e.target.value) 
            })}
            min="1"
          />
          <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
          <button onClick={() => dispatch({ type: 'decrement' })}>减少</button>
        </div>
      );
    }
    ```

    对比表格：

    | 特性 | useState | useReducer |
    |-----|----------|------------|
    | 适用场景 | 简单的独立状态 | 复杂的相关状态逻辑 |
    | 代码组织 | 分散在组件中 | 集中在reducer函数中 |
    | 可测试性 | 较难单独测试 | 纯函数易于测试 |
    | 状态追踪 | 需手动实现 | action提供状态变化记录 |
    | 代码量 | 简单场景代码少 | 需要更多样板代码 |
    | 状态复杂度 | 状态越多，逻辑越分散 | 复杂状态下更有条理 |
    | 优化性能 | 需依赖额外手段 | dispatch函数稳定，不需优化 |

    使用useReducer的适用场景：
    
    1. 状态逻辑复杂且包含多个子值
    2. 下一个状态依赖于之前的状态
    3. 需要在组件树深处更新状态
    4. 状态更新逻辑需要被复用
    5. 需要更好的测试状态逻辑

  - 异步action处理
  
    处理异步操作是状态管理中常见的需求，useReducer本身不直接支持异步action，但可以通过一些模式实现。

    ```jsx
    // 基本异步操作模式
    function dataFetchReducer(state, action) {
      switch (action.type) {
        case 'fetch_start':
          return { ...state, isLoading: true, error: null };
        case 'fetch_success':
          return { 
            ...state, 
            isLoading: false, 
            data: action.payload, 
            error: null 
          };
        case 'fetch_error':
          return { 
            ...state, 
            isLoading: false, 
            error: action.payload 
          };
        default:
          return state;
      }
    }
    
    function DataFetchingComponent() {
      const [state, dispatch] = useReducer(dataFetchReducer, {
        data: null,
        isLoading: false,
        error: null
      });
      
      useEffect(() => {
        const fetchData = async () => {
          dispatch({ type: 'fetch_start' });
          try {
            const response = await fetch('https://api.example.com/data');
            const data = await response.json();
            dispatch({ type: 'fetch_success', payload: data });
          } catch (error) {
            dispatch({ type: 'fetch_error', payload: error.message });
          }
        };
        
        fetchData();
      }, []);
      
      if (state.isLoading) return <div>加载中...</div>;
      if (state.error) return <div>错误: {state.error}</div>;
      
      return (
        <div>
          {state.data && (
            <ul>
              {state.data.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    ```

    更复杂的异步处理可以使用**自定义中间件**模式，类似Redux的中间件：

    ```jsx
    // 定义一个简单的中间件系统
    function applyMiddleware(reducer, ...middlewares) {
      return (state, action) => {
        // 如果action是函数，执行它并传入dispatch和state
        if (typeof action === 'function') {
          const dispatch = (innerAction) => 
            middlewares.forEach(middleware => middleware(innerAction));
          
          return action(dispatch, () => state);
        }
        
        // 普通action直接走reducer
        return reducer(state, action);
      };
    }
    
    // 使用中间件处理异步action
    function AsyncComponent() {
      const reducer = (state, action) => {
        switch (action.type) {
          case 'fetch_start':
            return { ...state, isLoading: true };
          case 'fetch_success':
            return { 
              ...state, 
              isLoading: false, 
              data: action.payload 
            };
          case 'fetch_error':
            return { 
              ...state, 
              isLoading: false, 
              error: action.payload 
            };
          default:
            return state;
        }
      };
      
      // 使用中间件增强的reducer
      const enhancedReducer = applyMiddleware(reducer);
      
      const [state, dispatch] = useReducer(enhancedReducer, {
        data: null,
        isLoading: false,
        error: null
      });
      
      const fetchData = () => {
        // 定义一个异步action创建器
        const fetchDataAction = async (dispatch) => {
          dispatch({ type: 'fetch_start' });
          
          try {
            const response = await fetch('https://api.example.com/data');
            const data = await response.json();
            dispatch({ type: 'fetch_success', payload: data });
          } catch (error) {
            dispatch({ type: 'fetch_error', payload: error.message });
          }
        };
        
        // 派发异步action
        dispatch(fetchDataAction);
      };
      
      return (
        <div>
          <button onClick={fetchData} disabled={state.isLoading}>
            {state.isLoading ? '加载中...' : '获取数据'}
          </button>
          
          {state.error && <div>错误: {state.error}</div>}
          
          {state.data && (
            <ul>
              {state.data.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    ```

    异步状态流程图：

    ```
    +----------------+       +----------------+       +----------------+
    |                |       |                |       |                |
    | 空闲状态       |------>| 加载状态       |------>| 完成/错误状态  |
    | isLoading:false|       | isLoading:true |       | isLoading:false|
    | data: null     |       | data: null     |       | data: [...]    |
    | error: null    |       | error: null    |       | error: null/msg|
    |                |       |                |       |                |
    +----------------+       +----------------+       +----------------+
            ^                                                 |
            |                                                 |
            +-------------------------------------------------+
                             重新加载
    ```

- **useCallback/useMemo**
  - 引用相等性
  
    在JavaScript中，对象和函数是引用类型，即使内容相同，每次创建都会产生新的引用，这在React的依赖数组中会导致不必要的重新渲染。

    ```jsx
    // 引用相等性问题示例
    function Component() {
      // 每次渲染时都会创建新的函数引用
      const handleClick = () => {
        console.log('点击了按钮');
      };
      
      // 每次渲染时都会创建新的对象引用
      const user = { name: '张三', age: 30 };
      
      return (
        <div>
          {/* ChildComponent会在每次父组件渲染时重新渲染 */}
          <ChildComponent onClick={handleClick} data={user} />
        </div>
      );
    }
    
    // 使用memo优化的子组件
    const ChildComponent = React.memo(({ onClick, data }) => {
      console.log('ChildComponent渲染');
      return (
        <button onClick={onClick}>
          {data.name}, {data.age}
        </button>
      );
    });
    
    // 问题：即使ChildComponent使用了React.memo，
    // 由于每次渲染时onClick和data都是新的引用，
    // 所以memo的优化失效了
    ```

    文本说明：

    ```
    组件重新渲染
          │
          ▼
    重新创建函数和对象
          │
          ▼
    传递新引用给子组件
          │
          ▼
    React.memo比较props
          │
          ▼
    发现引用不同（即使内容相同）
          │
          ▼
    子组件重新渲染
    ```

  - 记忆化优化
  
    useCallback和useMemo钩子可以帮助我们在多次渲染之间保持引用的稳定性。

    ```jsx
    // useCallback优化函数引用
    function OptimizedComponent() {
      // 使用useCallback记忆化函数，只有依赖项变化时才会创建新函数
      const handleClick = useCallback(() => {
        console.log('点击了按钮');
      }, []); // 空依赖数组，函数引用永远不变
      
      // 使用useMemo记忆化对象，只有依赖项变化时才会创建新对象
      const user = useMemo(() => {
        return { name: '张三', age: 30 };
      }, []); // 空依赖数组，对象引用永远不变
      
      return (
        <div>
          {/* 现在ChildComponent只会在特定条件下重新渲染 */}
          <ChildComponent onClick={handleClick} data={user} />
        </div>
      );
    }
    
    // useCallback与useMemo的区别
    
    // useCallback记忆化回调函数
    const memoizedCallback = useCallback(
      () => {
        doSomething(a, b);
      },
      [a, b], // 只有a或b变化时，才会重新创建回调函数
    );
    
    // useMemo记忆化计算结果
    const memoizedValue = useMemo(
      () => {
        return computeExpensiveValue(a, b);
      },
      [a, b], // 只有a或b变化时，才会重新计算
    );
    
    // 记忆化值与普通值的区别
    function SearchComponent({ query }) {
      // 昂贵计算的非优化版本 - 每次渲染都会重新计算
      const filteredItems = filterItems(query);
      
      // 优化版本 - 只有query变化时才会重新计算
      const memoizedItems = useMemo(() => filterItems(query), [query]);
      
      return (
        <div>
          <p>搜索结果：{memoizedItems.length}条</p>
          <ul>
            {memoizedItems.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      );
    }
    ```

    优化前后的执行流程：

    ```
    未优化：                      优化后：
    组件渲染 ───────┐            组件渲染 ───────┐
        │          │                │          │
        ▼          │                ▼          │
    创建新函数/对象   │            检查依赖是否变化 │
        │          │                │          │
        ▼          │                ▼          │
    传递给子组件     │            否 ◄─── 是     │
        │          │            │          │  │
        ▼          │            │          ▼  │
    子组件执行       │            │      创建新的  │
    memo比较        │            │      函数/对象 │
        │          │            │          │  │
        ▼          │            │          ▼  │
    判断为不同       │            │      存储新    │
    引用重新渲染     │            │      引用      │
        │          │            │          ▼  │
        ▼          │            │      返回新    │
    渲染完成 ◄───────┘            │      引用      │
                                 │          │  │
                                 ▼          ▼  │
                             返回记忆化的引用    │
                                 │             │
                                 ▼             │
                             传递给子组件        │
                                 │             │
                                 ▼             │
                             子组件执行         │
                             memo比较          │
                                 │             │
                                 ▼             │
                             判断为相同         │
                             引用不重新渲染      │
                                 │             │
                                 ▼             │
                             渲染完成 ◄─────────┘
    ```

  - 依赖收集
  
    正确设置依赖数组是使用useCallback和useMemo的关键。

    ```jsx
    // 依赖收集示例
    function UserProfile({ userId, onProfileUpdate }) {
      const [user, setUser] = useState(null);
      
      // 依赖userId的回调函数
      const fetchUserData = useCallback(async () => {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      }, [userId]); // 只有userId变化时才重新创建函数
      
      // 依赖user和onProfileUpdate的回调函数
      const handleSubmit = useCallback((formData) => {
        // 更新用户资料
        const updatedUser = { ...user, ...formData };
        onProfileUpdate(updatedUser);
      }, [user, onProfileUpdate]);
      
      // 依赖user的计算值
      const userStats = useMemo(() => {
        if (!user) return null;
        
        // 假设这是一个昂贵的计算
        return {
          postsCount: user.posts?.length || 0,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0
        };
      }, [user]);
      
      // 使用这些记忆化的值和函数
      useEffect(() => {
        fetchUserData();
      }, [fetchUserData]);
      
      if (!user) return <div>加载中...</div>;
      
      return (
        <div>
          <h2>{user.name}</h2>
          <p>帖子数: {userStats.postsCount}</p>
          <p>粉丝数: {userStats.followersCount}</p>
          <p>关注数: {userStats.followingCount}</p>
          <UserForm initialData={user} onSubmit={handleSubmit} />
        </div>
      );
    }
    ```

    依赖收集的最佳实践：

    1. **需要什么就依赖什么**：在依赖数组中包含所有回调函数内部使用的变量。
    2. **避免不必要的依赖**：不要包含不变的值（如常量）或不使用的值。
    3. **使用函数式更新**：对于依赖状态的操作，使用函数式更新可以移除依赖。
    4. **将对象依赖拆分为原始值**：尽量依赖原始值而非对象。

    ```jsx
    // 避免对整个对象的依赖
    // 不推荐
    const handleClick = useCallback(() => {
      console.log(user.name, user.age);
    }, [user]); // 依赖整个user对象
    
    // 推荐
    const handleClick = useCallback(() => {
      console.log(name, age);
    }, [name, age]); // 只依赖所需的原始值
    
    // 使用函数式更新避免依赖
    // 不推荐
    const increment = useCallback(() => {
      setCount(count + 1);
    }, [count]); // 依赖count
    
    // 推荐
    const increment = useCallback(() => {
      setCount(prevCount => prevCount + 1);
    }, []); // 不依赖任何状态
    ```

    依赖收集错误的常见模式：

    ```jsx
    // 错误：遗漏依赖
    const handleClick = useCallback(() => {
      console.log(user.name); // 使用了user
    }, []); // 但依赖数组中没有包含user
    
    // 错误：过多依赖
    const constantValue = 42;
    const handleClick = useCallback(() => {
      console.log(constantValue);
    }, [constantValue]); // 不需要依赖常量
    
    // 错误：依赖无关值
    const handleClick = useCallback(() => {
      console.log('Click');
    }, [user]); // 回调中没有使用user，不需要依赖
    ```

  - 过度优化问题
  
    滥用useCallback和useMemo可能导致过度优化和代码复杂性增加。

    ```jsx
    // 过度优化示例
    function OverOptimizedComponent() {
      // 不必要的优化：简单计算不需要useMemo
      const double = useMemo(() => 2 * 2, []);
      
      // 不必要的优化：简单字符串拼接
      const greeting = useMemo(() => `你好，世界`, []);
      
      // 不必要的优化：不传递给子组件的函数
      const handleLocalClick = useCallback(() => {
        console.log('本地点击，不传递给子组件');
      }, []);
      
      // 不必要的缓存：创建简单对象
      const style = useMemo(() => ({ color: 'red' }), []);
      
      return (
        <div style={style} onClick={handleLocalClick}>
          {greeting} {double}
        </div>
      );
    }
    ```

    优化成本与收益的考量：

    ```
                 ^
    性能提升      |              理想区域
                 |          ┌─────────┐
                 |          │         │
                 |          │         │
                 |          │         │
                 |          │         │
    ─────────────┼──────────┼─────────┼─────────────►
                 |          │         │     复杂度
                 |          │         │
                 |  过度优化区域       │
                 |          │         │
                 |          └─────────┘
    ```

    何时使用记忆化的指导原则：

    1. **优先考虑基本的React优化**：保持组件小而专注，避免不必要的重渲染。
    2. **子组件接收对象或函数props**：特别是当子组件使用React.memo时。
    3. **计算成本高昂**：当计算结果需要大量处理且依赖很少变化。
    4. **作为其他Hook的依赖**：当作为useEffect等hook的依赖项时。
    5. **避免过早优化**：先测量性能，确认瓶颈再优化。

    何时不使用记忆化：

    ```jsx
    // 不需要记忆化的情况
    
    // 1. 原始值（字符串、数字、布尔值）props
    <Button text="点击我" count={5} isActive={true} />
    
    // 2. 简单的计算
    const total = price * quantity;
    
    // 3. 不传递给子组件的处理函数
    function handleLocalClick() {
      // 仅在当前组件使用
    }
    
    // 4. 没有使用React.memo的子组件
    function ParentComponent() {
      const handler = () => console.log('点击');
      return <ChildComponent onClick={handler} />;
    }
    
    // 5. 每次渲染都需要重新计算的值
    const currentTime = new Date().toLocaleTimeString();
    ```

  - 实际应用场景
  
    useCallback和useMemo在实际开发中的常见应用场景。

    ```jsx
    // 场景1：优化列表渲染性能
    function TodoList({ todos, onToggle, onDelete }) {
      // 记忆化item切换函数，避免每个item重新渲染
      const handleToggle = useCallback((id) => {
        onToggle(id);
      }, [onToggle]);
      
      // 记忆化item删除函数
      const handleDelete = useCallback((id) => {
        onDelete(id);
      }, [onDelete]);
      
      return (
        <ul>
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      );
    }
    
    // 使用React.memo优化子组件
    const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
      console.log(`渲染: ${todo.title}`);
      
      return (
        <li>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.title}
          </span>
          <button onClick={() => onDelete(todo.id)}>删除</button>
        </li>
      );
    });
    ```

    ```jsx
    // 场景2：避免昂贵的重复计算
    function DataGrid({ data, filter, sortBy }) {
      // 使用useMemo优化数据处理逻辑
      const processedData = useMemo(() => {
        console.log('处理数据...');
        
        // 假设这些是昂贵的操作
        let result = data;
        
        // 过滤数据
        if (filter) {
          result = result.filter(item => 
            item.name.includes(filter) || item.description.includes(filter)
          );
        }
        
        // 排序数据
        if (sortBy) {
          result = [...result].sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
          });
        }
        
        return result;
      }, [data, filter, sortBy]); // 仅在这些依赖变化时重新计算
      
      return (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    ```

    ```jsx
    // 场景3：作为其他Hook的依赖项
    function SearchComponent({ initialQuery = '' }) {
      const [query, setQuery] = useState(initialQuery);
      const [results, setResults] = useState([]);
      
      // 使用useCallback稳定fetchResults函数引用
      const fetchResults = useCallback(async (searchQuery) => {
        const response = await fetch(`/api/search?q=${searchQuery}`);
        const data = await response.json();
        setResults(data);
      }, []);
      
      // 使用稳定的fetchResults作为useEffect的依赖
      useEffect(() => {
        if (query.length > 2) {
          fetchResults(query);
        }
      }, [query, fetchResults]);
      
      const handleChange = (e) => {
        setQuery(e.target.value);
      };
      
      return (
        <div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="搜索..."
          />
          <ul>
            {results.map(item => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      );
    }
    ```

    ```jsx
    // 场景4：自定义Hook中的函数稳定性
    function useAPI(endpoint) {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      
      // 使用useCallback创建稳定的函数引用
      const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(endpoint);
          const result = await response.json();
          setData(result);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, [endpoint]);
      
      // 使用useCallback创建稳定的更新函数
      const updateData = useCallback(async (updates) => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          const result = await response.json();
          setData(result);
          return result;
        } catch (err) {
          setError(err.message);
          return null;
        } finally {
          setLoading(false);
        }
      }, [endpoint]);
      
      // 返回稳定的函数引用
      return {
        data,
        loading,
        error,
        fetchData,
        updateData
      };
    }
    
    // 使用自定义Hook
    function UserProfile({ userId }) {
      const {
        data: user,
        loading,
        error,
        fetchData,
        updateData
      } = useAPI(`/api/users/${userId}`);
      
      useEffect(() => {
        fetchData();
      }, [fetchData]);
      
      const handleUpdateProfile = async (updates) => {
        const result = await updateData(updates);
        if (result) {
          alert('个人资料已更新！');
        }
      };
      
      if (loading) return <div>加载中...</div>;
      if (error) return <div>错误: {error}</div>;
      if (!user) return <div>未找到用户</div>;
      
      return (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <ProfileForm user={user} onSubmit={handleUpdateProfile} />
        </div>
      );
    }
    ```

- **useRef**
  - 引用DOM
  
    useRef钩子提供了一种方式来访问DOM节点或在组件渲染周期之间持久化可变值。

    ```jsx
    // 基本的DOM引用
    import React, { useRef, useEffect } from 'react';
    
    function TextInputWithFocus() {
      // 创建一个ref对象
      const inputRef = useRef(null);
      
      useEffect(() => {
        // 在组件挂载后，自动聚焦输入框
        inputRef.current.focus();
      }, []);
      
      return (
        <input
          ref={inputRef} // 将ref对象分配给DOM元素
          type="text"
          placeholder="我会自动获得焦点"
        />
      );
    }
    ```

    ```jsx
    // 复杂DOM操作示例
    function VideoPlayer({ src }) {
      const videoRef = useRef(null);
      
      const handlePlay = () => {
        // 访问DOM方法
        videoRef.current.play();
      };
      
      const handlePause = () => {
        // 访问DOM方法
        videoRef.current.pause();
      };
      
      const handleStop = () => {
        // 结合多个DOM操作
        const video = videoRef.current;
        video.pause();
        video.currentTime = 0;
      };
      
      const handleJump = (seconds) => {
        // 修改DOM属性
        videoRef.current.currentTime += seconds;
      };
      
      return (
        <div>
          <video ref={videoRef} src={src} />
          <div className="controls">
            <button onClick={handlePlay}>播放</button>
            <button onClick={handlePause}>暂停</button>
            <button onClick={handleStop}>停止</button>
            <button onClick={() => handleJump(-10)}>-10秒</button>
            <button onClick={() => handleJump(10)}>+10秒</button>
          </div>
        </div>
      );
    }
    ```

    引用DOM的核心流程：

    ```
    +----------------+       +----------------+       +----------------+
    |                |       |                |       |                |
    | 创建ref对象    |------>| 分配给DOM元素  |------>| 通过.current   |
    | useRef(null)   |       | ref={myRef}    |       | 访问DOM节点    |
    |                |       |                |       |                |
    +----------------+       +----------------+       +----------------+
    ```

  - 保存实例变量
  
    useRef不仅可以引用DOM元素，还可以用来保存任何可变值，这些值在组件重新渲染时保持不变。

    ```jsx
    // 存储任意值
    function StopWatch() {
      const [time, setTime] = useState(0);
      // 使用ref保存定时器ID
      const timerRef = useRef(null);
      // 使用ref保存前一个状态
      const prevTimeRef = useRef(0);
      
      useEffect(() => {
        // 更新前一个时间
        prevTimeRef.current = time;
      }, [time]);
      
      const handleStart = () => {
        if (timerRef.current !== null) return;
        
        timerRef.current = setInterval(() => {
          setTime(t => t + 1);
        }, 1000);
      };
      
      const handlePause = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
      };
      
      const handleReset = () => {
        handlePause();
        setTime(0);
      };
      
      // 使用ref计算差值
      const diff = time - prevTimeRef.current;
      
      return (
        <div>
          <p>当前时间: {time}秒</p>
          <p>时间变化: {diff}秒</p>
          <button onClick={handleStart}>开始</button>
          <button onClick={handlePause}>暂停</button>
          <button onClick={handleReset}>重置</button>
        </div>
      );
    }
    ```

    useRef与useState的比较：

    | 特性 | useRef | useState |
    |------|--------|----------|
    | 值更新触发渲染 | 否 | 是 |
    | 修改方式 | 直接修改.current | 通过setter函数 |
    | 使用场景 | 存储不影响UI的值 | 存储影响UI渲染的状态 |
    | 读取时机 | 任何时候 | 渲染周期内 |
    | 共享状态 | 仅组件内部 | 可传递给子组件 |

    ```jsx
    // 何时使用useState与useRef
    function Counter() {
      // 使用state存储需要渲染的值
      const [count, setCount] = useState(0);
      
      // 使用ref存储不需要触发渲染更新的值
      const renderCountRef = useRef(0);
      
      // 记录组件渲染次数
      useEffect(() => {
        renderCountRef.current += 1;
      });
      
      return (
        <div>
          <p>计数: {count}</p>
          <p>组件已渲染 {renderCountRef.current} 次</p>
          <button onClick={() => setCount(count + 1)}>增加</button>
        </div>
      );
    }
    ```

  - 跨渲染周期
  
    useRef的一个关键特性是它可以在组件的整个生命周期内保持相同的引用，即使组件重新渲染也不会改变。

    ```jsx
    // 在渲染之间保持数据
    function IntervalExample() {
      // 渲染时创建的变量在下次渲染时会重新创建
      const renderedValue = { value: 0 };
      
      // useRef创建的对象在整个生命周期中保持相同的引用
      const stableRef = useRef({ value: 0 });
      
      useEffect(() => {
        const intervalId = setInterval(() => {
          // 更新ref值不会触发重新渲染
          stableRef.current.value += 1;
          
          // 强制打印当前值
          console.log('定时器值:', stableRef.current.value);
          
          // renderedValue将始终为原始值，因为闭包捕获的是
          // 创建时的值，而不是最新的值
          console.log('渲染值:', renderedValue.value);
        }, 1000);
        
        return () => clearInterval(intervalId);
      }, []);
      
      return (
        <div>
          <p>Ref值: {stableRef.current.value}</p>
          <p>每次渲染都会创建新的值: {renderedValue.value}</p>
          <p>注意：Ref值只在控制台更新，不会触发重新渲染</p>
        </div>
      );
    }
    ```

    useRef解决闭包陷阱：

    ```jsx
    // 闭包陷阱示例
    function ClosureProblem() {
      const [count, setCount] = useState(0);
      
      // 错误：使用state但没有依赖它
      useEffect(() => {
        const intervalId = setInterval(() => {
          // 这个闭包始终"记住"初始的count值
          console.log(`Count value: ${count}`);
          setCount(count + 1); // 总是基于初始count值增加
        }, 1000);
        
        return () => clearInterval(intervalId);
      }, []); // 缺少对count的依赖
      
      return <div>Count: {count}</div>;
    }
    
    // 使用useRef解决闭包问题
    function ClosureFixWithRef() {
      const [count, setCount] = useState(0);
      const countRef = useRef(count);
      
      // 保持ref与state同步
      useEffect(() => {
        countRef.current = count;
      }, [count]);
      
      useEffect(() => {
        const intervalId = setInterval(() => {
          // 通过ref访问最新的count值
          const currentCount = countRef.current;
          console.log(`Count value: ${currentCount}`);
          setCount(currentCount + 1); // 基于最新值增加
        }, 1000);
        
        return () => clearInterval(intervalId);
      }, []); // 不需要依赖count
      
      return <div>Count: {count}</div>;
    }
    ```

    useRef与事件处理的结合：

    ```jsx
    // 在事件处理中使用最新状态
    function SearchWithDelay() {
      const [query, setQuery] = useState('');
      const [results, setResults] = useState([]);
      const latestQueryRef = useRef('');
      
      // 保持ref与state同步
      useEffect(() => {
        latestQueryRef.current = query;
      }, [query]);
      
      const handleSearch = () => {
        // 模拟API调用延迟
        setTimeout(() => {
          // 在回调中使用ref获取最新的query值
          const currentQuery = latestQueryRef.current;
          console.log(`Searching for: ${currentQuery}`);
          
          // 模拟结果
          setResults([
            `Result 1 for ${currentQuery}`,
            `Result 2 for ${currentQuery}`,
            `Result 3 for ${currentQuery}`
          ]);
        }, 1000);
      };
      
      return (
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索..."
          />
          <button onClick={handleSearch}>搜索</button>
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      );
    }
    ```

  - forwardRef转发
  
    forwardRef允许组件将其接收到的ref转发给其子组件，这在创建可重用组件库时特别有用。

    ```jsx
    // 基本的ref转发
    import React, { forwardRef, useRef } from 'react';
    
    // 使用forwardRef创建可接收ref的组件
    const CustomInput = forwardRef((props, ref) => {
      return <input ref={ref} {...props} />;
    });
    
    function Form() {
      // 创建一个ref
      const inputRef = useRef(null);
      
      const focusInput = () => {
        // 通过ref直接访问CustomInput内部的input元素
        inputRef.current.focus();
      };
      
      return (
        <div>
          {/* 将ref传递给CustomInput组件 */}
          <CustomInput
            ref={inputRef}
            type="text"
            placeholder="转发的ref"
          />
          <button onClick={focusInput}>聚焦输入框</button>
        </div>
      );
    }
    ```

    复杂组件中的ref转发：

    ```jsx
    // 转发ref到特定子元素
    const FancyButton = forwardRef((props, ref) => {
      return (
        <div className="fancy-button-container">
          <button
            ref={ref} // 将ref转发到内部的button元素
            className="fancy-button"
            {...props}
          >
            {props.children}
          </button>
        </div>
      );
    });
    
    // 使用转发的ref
    function App() {
      const buttonRef = useRef(null);
      
      const handleClick = () => {
        buttonRef.current.focus();
        console.log('Button clicked via ref!');
      };
      
      return (
        <div>
          <FancyButton ref={buttonRef} onClick={handleClick}>
            点击我
          </FancyButton>
          <button onClick={() => buttonRef.current.click()}>
            通过ref点击按钮
          </button>
        </div>
      );
    }
    ```

    结合TypeScript的ref转发：

    ```tsx
    // TypeScript中的ref转发
    import React, { forwardRef, useRef, RefObject } from 'react';
    
    // 定义组件Props类型
    interface CustomButtonProps {
      primary?: boolean;
      children: React.ReactNode;
      onClick?: () => void;
    }
    
    // 使用forwardRef，并指定ref类型
    const CustomButton = forwardRef<
      HTMLButtonElement,
      CustomButtonProps
    >((props, ref) => {
      const { primary, children, ...rest } = props;
      
      return (
        <button
          ref={ref}
          className={primary ? 'primary-button' : 'secondary-button'}
          {...rest}
        >
          {children}
        </button>
      );
    });
    
    // 指定组件显示名称
    CustomButton.displayName = 'CustomButton';
    
    // 使用TypeScript类型化的ref
    function App() {
      const buttonRef = useRef<HTMLButtonElement>(null);
      
      const focusButton = () => {
        if (buttonRef.current) {
          buttonRef.current.focus();
        }
      };
      
      return (
        <div>
          <CustomButton ref={buttonRef} primary>
            主按钮
          </CustomButton>
          <button onClick={focusButton}>聚焦主按钮</button>
        </div>
      );
    }
    ```

  - useImperativeHandle
  
    useImperativeHandle钩子允许在使用ref时自定义暴露给父组件的实例值，这提供了更细粒度的控制。

    ```jsx
    // 基本用法
    import React, { useRef, useImperativeHandle, forwardRef } from 'react';
    
    // 创建自定义暴露API的组件
    const CustomInput = forwardRef((props, ref) => {
      // 内部ref
      const inputRef = useRef(null);
      
      // 定义暴露给父组件的值和方法
      useImperativeHandle(ref, () => ({
        // 自定义方法
        focus: () => {
          inputRef.current.focus();
        },
        // 自定义属性
        value: () => inputRef.current.value,
        // 自定义方法
        clear: () => {
          inputRef.current.value = '';
        }
      }));
      
      return <input ref={inputRef} {...props} />;
    });
    
    // 使用CustomInput
    function ImperativeHandleExample() {
      const inputRef = useRef(null);
      
      const handleClick = () => {
        // 访问自定义暴露的方法
        inputRef.current.focus();
      };
      
      const handleClear = () => {
        // 访问自定义暴露的方法
        inputRef.current.clear();
      };
      
      const handleLog = () => {
        // 访问自定义暴露的属性方法
        console.log('当前值:', inputRef.current.value());
      };
      
      return (
        <div>
          <CustomInput ref={inputRef} placeholder="Type something..." />
          <button onClick={handleClick}>聚焦</button>
          <button onClick={handleClear}>清空</button>
          <button onClick={handleLog}>日志</button>
        </div>
      );
    }
    ```

    在复杂组件中使用useImperativeHandle：

    ```jsx
    // 复杂组件示例 - 表单验证
    const FormField = forwardRef((props, ref) => {
      const { label, name, required, validateFn, ...rest } = props;
      
      const inputRef = useRef(null);
      const [error, setError] = useState('');
      
      // 验证函数
      const validate = () => {
        if (required && !inputRef.current.value) {
          setError(`${label}不能为空`);
          return false;
        }
        
        // 自定义验证
        if (validateFn && !validateFn(inputRef.current.value)) {
          setError(`${label}验证失败`);
          return false;
        }
        
        setError('');
        return true;
      };
      
      // 暴露自定义方法给父组件
      useImperativeHandle(ref, () => ({
        // 原始DOM节点
        inputElement: inputRef.current,
        // 自定义方法
        validate,
        // 获取值
        getValue: () => inputRef.current.value,
        // 设置值
        setValue: (value) => {
          inputRef.current.value = value;
        },
        // 聚焦并选中所有文本
        focusAndSelect: () => {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }));
      
      return (
        <div className="form-field">
          <label htmlFor={name}>{label} {required && '*'}</label>
          <input
            ref={inputRef}
            id={name}
            name={name}
            onBlur={validate}
            {...rest}
          />
          {error && <div className="error">{error}</div>}
        </div>
      );
    });
    
    // 使用FormField组件
    function SignupForm() {
      const emailRef = useRef(null);
      const passwordRef = useRef(null);
      
      const handleSubmit = (e) => {
        e.preventDefault();
        
        // 验证所有字段
        const isEmailValid = emailRef.current.validate();
        const isPasswordValid = passwordRef.current.validate();
        
        if (isEmailValid && isPasswordValid) {
          const formData = {
            email: emailRef.current.getValue(),
            password: passwordRef.current.getValue()
          };
          
          console.log('表单提交:', formData);
          // 提交表单...
        }
      };
      
      return (
        <form onSubmit={handleSubmit}>
          <FormField
            ref={emailRef}
            label="邮箱"
            name="email"
            type="email"
            required
            validateFn={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
          />
          
          <FormField
            ref={passwordRef}
            label="密码"
            name="password"
            type="password"
            required
            validateFn={(value) => value.length >= 8}
          />
          
          <div className="form-actions">
            <button type="submit">注册</button>
            <button
              type="button"
              onClick={() => {
                // 使用暴露的API
                emailRef.current.setValue('');
                passwordRef.current.setValue('');
              }}
            >
              重置
            </button>
          </div>
        </form>
      );
    }
    ```

    UseImperativeHandle工作流程图：

    ```
    +-----------------+      +------------------+      +----------------+
    |                 |      |                  |      |                |
    | 父组件创建ref   |----->| 传递ref给子组件  |----->| 子组件使用     |
    |                 |      |                  |      | forwardRef接收 |
    +-----------------+      +------------------+      +----------------+
                                                              |
                                                              v
    +-----------------+      +------------------+      +----------------+
    |                 |      |                  |      |                |
    | 父组件通过ref   |<-----| 父组件获得自定义 |<-----| 子组件使用     |
    | 访问自定义API   |      | API的访问权限    |      | useImperative  |
    |                 |      |                  |      | Handle定义API  |
    +-----------------+      +------------------+      +----------------+
    ```

### 自定义Hooks
- **自定义Hook设计**
  - 命名规范
  
    自定义Hook是一种复用状态逻辑的函数，必须以"use"开头，遵循React Hook的规则。

    ```jsx
    // 自定义Hook的命名规范
    
    // 正确的命名（以use开头）
    function useCounter(initialValue = 0) {
      const [count, setCount] = useState(initialValue);
      
      const increment = () => setCount(count + 1);
      const decrement = () => setCount(count - 1);
      const reset = () => setCount(initialValue);
      
      return { count, increment, decrement, reset };
    }
    
    // 错误的命名（没有以use开头）
    function getCounter(initialValue = 0) { // 应该命名为useCounter
      const [count, setCount] = useState(initialValue);
      // ...
    }
    
    // 使用自定义Hook
    function CounterComponent() {
      const { count, increment, decrement, reset } = useCounter(10);
      
      return (
        <div>
          <p>计数: {count}</p>
          <button onClick={increment}>+1</button>
          <button onClick={decrement}>-1</button>
          <button onClick={reset}>重置</button>
        </div>
      );
    }
    ```

    命名约定的作用：
    
    1. **可识别性**：以"use"开头，让React和其他开发者识别为Hook
    2. **规则提示**：提醒开发者遵循Hook规则（只在顶层调用，只在React函数中调用）
    3. **语义明确**：表明函数会使用其他Hook，有状态逻辑或副作用
    4. **发现问题**：静态分析工具可以检查以"use"开头的函数是否遵循Hook规则

  - 提取共享逻辑
  
    自定义Hook的主要目的是提取和复用组件间的状态逻辑，而不是复用UI。

    ```jsx
    // 未使用自定义Hook的重复逻辑
    function UserList() {
      const [users, setUsers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        setLoading(true);
        fetch('/api/users')
          .then(res => res.json())
          .then(data => {
            setUsers(data);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }, []);
      
      // 渲染逻辑...
    }
    
    function ProductList() {
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        setLoading(true);
        fetch('/api/products')
          .then(res => res.json())
          .then(data => {
            setProducts(data);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }, []);
      
      // 渲染逻辑...
    }
    
    // 使用自定义Hook提取共享逻辑
    function useFetch(url) {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        let isMounted = true;
        
        setLoading(true);
        fetch(url)
          .then(res => res.json())
          .then(data => {
            if (isMounted) {
              setData(data);
              setLoading(false);
            }
          })
          .catch(err => {
            if (isMounted) {
              setError(err.message);
              setLoading(false);
            }
          });
          
        return () => {
          isMounted = false;
        };
      }, [url]);
      
      return { data, loading, error };
    }
    
    // 使用自定义Hook简化后的组件
    function UserList() {
      const { data: users, loading, error } = useFetch('/api/users');
      
      if (loading) return <div>加载中...</div>;
      if (error) return <div>错误: {error}</div>;
      
      return (
        <ul>
          {users && users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      );
    }
    
    function ProductList() {
      const { data: products, loading, error } = useFetch('/api/products');
      
      if (loading) return <div>加载中...</div>;
      if (error) return <div>错误: {error}</div>;
      
      return (
        <div className="products-grid">
          {products && products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }
    ```

    提取逻辑的核心原则：
    
    ```
    +-------------------+                  +------------------+
    |                   |                  |                  |
    |  识别重复逻辑     |----------------->|  提取为独立函数  |
    |                   |                  |                  |
    +-------------------+                  +------------------+
              |                                      |
              |                                      |
              v                                      v
    +-------------------+                  +------------------+
    |                   |                  |                  |
    |  添加必要参数和   |<-----------------|  确定输入和输出  |
    |  返回值           |                  |                  |
    +-------------------+                  +------------------+
              |
              |
              v
    +-------------------+
    |                   |
    |  确保逻辑内聚     |
    |  和单一职责       |
    |                   |
    +-------------------+
    ```

  - 复用与组合
  
    自定义Hook的强大之处在于可以组合使用多个Hook，创建更复杂的逻辑。

    ```jsx
    // 简单的自定义Hook
    function useLocalStorage(key, initialValue) {
      // 懒初始化状态，从localStorage读取
      const [storedValue, setStoredValue] = useState(() => {
        try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : initialValue;
        } catch (error) {
          console.error(error);
          return initialValue;
        }
      });
      
      // 自定义setter，更新state并同步到localStorage
      const setValue = value => {
        try {
          // 允许传入函数（类似useState）
          const valueToStore =
            value instanceof Function ? value(storedValue) : value;
            
          setStoredValue(valueToStore);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(error);
        }
      };
      
      return [storedValue, setValue];
    }
    
    // 组合多个Hook创建更复杂的自定义Hook
    function usePersistedState(key, initialState) {
      const [state, setState] = useLocalStorage(key, initialState);
      const [isPersisted, setPersisted] = useState(true);
      
      // 添加额外的持久化状态功能
      const persistState = () => {
        setPersisted(true);
      };
      
      const clearPersistedState = () => {
        window.localStorage.removeItem(key);
        setPersisted(false);
      };
      
      return {
        state,
        setState,
        isPersisted,
        persistState,
        clearPersistedState
      };
    }
    
    // 使用多个自定义Hook实现更复杂的功能
    function UserPreferences() {
      const { 
        state: preferences, 
        setState: setPreferences,
        isPersisted,
        clearPersistedState
      } = usePersistedState('user-preferences', {
        theme: 'light',
        fontSize: 'medium',
        notifications: true
      });
      
      // 使用另一个自定义Hook追踪窗口大小
      const { width } = useWindowSize();
      
      // 根据窗口大小自动调整字体大小
      useEffect(() => {
        if (width < 768 && preferences.fontSize === 'medium') {
          setPreferences({ ...preferences, fontSize: 'small' });
        }
      }, [width, preferences, setPreferences]);
      
      // 组件UI...
      return (
        <div>
          <h2>用户偏好设置</h2>
          <div>
            <label>
              主题:
              <select
                value={preferences.theme}
                onChange={e => 
                  setPreferences({...preferences, theme: e.target.value})
                }
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </label>
          </div>
          {/* 其他偏好设置... */}
          <div>
            {isPersisted ? (
              <button onClick={clearPersistedState}>清除保存的偏好</button>
            ) : (
              <div>偏好设置未保存</div>
            )}
          </div>
        </div>
      );
    }
    ```

  - 封装第三方库
  
    自定义Hook是封装和整合第三方库的理想方式，让其更好地适配React的生命周期和组件模型。

    ```jsx
    // 封装D3.js库的自定义Hook示例
    import { useRef, useEffect, useState } from 'react';
    import * as d3 from 'd3';
    
    // 创建简单的D3柱状图Hook
    function useD3BarChart(data, width, height) {
      const svgRef = useRef(null);
      const [isRendered, setIsRendered] = useState(false);
      
      useEffect(() => {
        if (!svgRef.current || !data || data.length === 0) return;
        
        // 清除之前的图表
        d3.select(svgRef.current).selectAll('*').remove();
        
        // 设置边距和图表区域
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // 创建SVG
        const svg = d3.select(svgRef.current)
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // 创建比例尺
        const x = d3.scaleBand()
          .domain(data.map(d => d.label))
          .range([0, innerWidth])
          .padding(0.1);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.value)])
          .nice()
          .range([innerHeight, 0]);
        
        // 添加x轴
        svg.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));
        
        // 添加y轴
        svg.append('g')
          .call(d3.axisLeft(y));
        
        // 添加柱状图
        svg.selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => x(d.label))
          .attr('y', d => y(d.value))
          .attr('width', x.bandwidth())
          .attr('height', d => innerHeight - y(d.value))
          .attr('fill', 'steelblue');
          
        setIsRendered(true);
        
        // 清理函数
        return () => {
          d3.select(svgRef.current).selectAll('*').remove();
          setIsRendered(false);
        };
      }, [data, width, height]);
      
      return { svgRef, isRendered };
    }
    
    // 在React组件中使用D3封装Hook
    function BarChart({ data }) {
      const { svgRef, isRendered } = useD3BarChart(
        data,
        600,
        400
      );
      
      return (
        <div className="chart-container">
          <svg ref={svgRef}></svg>
          {!isRendered && <p>加载图表中...</p>}
        </div>
      );
    }
    
    // 使用组件
    function Dashboard() {
      const [salesData, setSalesData] = useState([
        { label: '一月', value: 45 },
        { label: '二月', value: 30 },
        { label: '三月', value: 60 },
        { label: '四月', value: 25 },
        { label: '五月', value: 50 }
      ]);
      
      return (
        <div>
          <h2>月度销售数据</h2>
          <BarChart data={salesData} />
        </div>
      );
    }
    ```
    
    封装第三方库的注意事项：
    
    1. **生命周期管理**：确保在适当时机初始化和清理库资源
    2. **状态同步**：保持React状态与第三方库状态的同步
    3. **依赖控制**：谨慎管理Hook的依赖数组，避免不必要的重新创建
    4. **错误处理**：增加适当的错误边界和防御性代码
    5. **抽象适度**：提供足够的自定义能力，但不过度抽象

  - 测试策略
  
    测试自定义Hook需要特殊的方法，因为Hook只能在React函数组件或其他Hook中调用。

    ```jsx
    // 测试自定义Hook的策略
    
    // 方法1：创建测试组件
    // useCounter.test.js
    import { render, screen, fireEvent } from '@testing-library/react';
    import { renderHook, act } from '@testing-library/react-hooks';
    import useCounter from './useCounter';
    
    // 方式1：创建测试包装组件
    test('should increment counter', () => {
      // 创建一个测试组件
      function TestComponent() {
        const { count, increment } = useCounter(0);
        return (
          <div>
            <span data-testid="count-value">{count}</span>
            <button onClick={increment}>Increment</button>
          </div>
        );
      }
      
      // 渲染测试组件
      render(<TestComponent />);
      
      // 验证初始状态
      expect(screen.getByTestId('count-value').textContent).toBe('0');
      
      // 触发操作
      fireEvent.click(screen.getByText('Increment'));
      
      // 验证结果
      expect(screen.getByTestId('count-value').textContent).toBe('1');
    });
    
    // 方式2：使用renderHook辅助函数（推荐）
    test('should increment counter using renderHook', () => {
      // 渲染Hook
      const { result } = renderHook(() => useCounter(0));
      
      // 验证初始状态
      expect(result.current.count).toBe(0);
      
      // 在act中执行操作
      act(() => {
        result.current.increment();
      });
      
      // 验证结果
      expect(result.current.count).toBe(1);
    });
    
    // 测试更复杂的场景
    test('should handle async operations', async () => {
      // 使用mockResolvedValue模拟异步操作
      const fetchMock = jest.fn().mockResolvedValue({ data: [1, 2, 3] });
      
      // 渲染使用异步逻辑的Hook
      const { result, waitForNextUpdate } = renderHook(() => 
        useDataFetching(fetchMock)
      );
      
      // 验证初始状态
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      
      // 等待异步操作完成
      await waitForNextUpdate();
      
      // 验证更新后的状态
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([1, 2, 3]);
    });
    
    // 测试Hook重渲染
    test('should update when dependencies change', () => {
      // 使用initialProps模拟props变化
      const { result, rerender } = renderHook(
        ({ id }) => useUserData(id),
        { initialProps: { id: 1 } }
      );
      
      // 验证使用id=1的结果
      expect(result.current.userId).toBe(1);
      
      // 重新渲染Hook，使用不同的props
      rerender({ id: 2 });
      
      // 验证使用id=2的结果
      expect(result.current.userId).toBe(2);
    });
    ```

    自定义Hook的测试原则：
    
    1. **隔离测试**：独立测试Hook逻辑，不与UI组件混合
    2. **模拟依赖**：使用Jest mock替换外部依赖（如API调用）
    3. **状态变化**：确保状态更新正确反映在返回值中
    4. **边界情况**：测试错误处理、空值和边界条件
    5. **副作用验证**：确认副作用（如localStorage更新）按预期执行

- **常用自定义Hooks**
  - 表单处理Hook
  
    表单处理是React应用中常见的需求，自定义Hook可以简化表单状态管理和验证。

    ```jsx
    // 基本的表单处理Hook
    function useForm(initialValues = {}) {
      const [values, setValues] = useState(initialValues);
      const [errors, setErrors] = useState({});
      const [touched, setTouched] = useState({});
      const [isSubmitting, setIsSubmitting] = useState(false);
      
      // 重置表单
      const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
      }, [initialValues]);
      
      // 设置字段值
      const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues(prevValues => ({
          ...prevValues,
          [name]: value
        }));
      }, []);
      
      // 设置自定义值
      const setFieldValue = useCallback((name, value) => {
        setValues(prevValues => ({
          ...prevValues,
          [name]: value
        }));
      }, []);
      
      // 标记字段为已触摸
      const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prevTouched => ({
          ...prevTouched,
          [name]: true
        }));
      }, []);
      
      // 提交表单
      const handleSubmit = useCallback((onSubmit, validate) => {
        return (e) => {
          if (e) e.preventDefault();
          
          // 标记所有字段为已触摸
          const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          );
          setTouched(allTouched);
          
          // 如果提供了验证函数，执行验证
          if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
            
            // 如果有错误，不提交
            if (Object.keys(validationErrors).length > 0) {
              return;
            }
          }
          
          setIsSubmitting(true);
          
          // 执行提交回调
          if (onSubmit) {
            Promise.resolve(onSubmit(values))
              .finally(() => {
                setIsSubmitting(false);
              });
          }
        };
      }, [values]);
      
      return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        resetForm
      };
    }
    
    // 使用自定义表单Hook
    function LoginForm() {
      const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue
      } = useForm({
        email: '',
        password: '',
        rememberMe: false
      });
      
      // 表单验证函数
      const validate = (values) => {
        const errors = {};
        
        if (!values.email) {
          errors.email = '邮箱是必填项';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
          errors.email = '邮箱格式不正确';
        }
        
        if (!values.password) {
          errors.password = '密码是必填项';
        } else if (values.password.length < 6) {
          errors.password = '密码长度不能小于6位';
        }
        
        return errors;
      };
      
      // 表单提交处理
      const onSubmit = async (values) => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('登录信息:', values);
          alert('登录成功！');
        } catch (error) {
          console.error('登录失败:', error);
        }
      };
      
      return (
        <form onSubmit={handleSubmit(onSubmit, validate)}>
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? 'error' : ''}
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? 'error' : ''}
            />
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={values.rememberMe}
              onChange={(e) => setFieldValue('rememberMe', e.target.checked)}
            />
            <label htmlFor="rememberMe">记住我</label>
          </div>
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '登录中...' : '登录'}
          </button>
        </form>
      );
    }
    ```

    表单处理的进阶版本：支持嵌套对象和数组：

    ```jsx
    // 增强版表单Hook - 支持嵌套字段
    function useFormAdvanced(initialValues = {}) {
      const [values, setValues] = useState(initialValues);
      
      // 获取嵌套字段的值（支持 'user.address.street' 这样的路径）
      const getNestedValue = useCallback((obj, path) => {
        return path.split('.').reduce((acc, part) => {
          return acc && acc[part] !== undefined ? acc[part] : undefined;
        }, obj);
      }, []);
      
      // 设置嵌套字段的值
      const setNestedValue = useCallback((obj, path, value) => {
        const parts = path.split('.');
        const newObj = { ...obj };
        
        let current = newObj;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (current[part] === undefined) {
            // 如果下一部分是数字，创建数组，否则创建对象
            const isNextPartNumber = !isNaN(Number(parts[i + 1]));
            current[part] = isNextPartNumber ? [] : {};
          }
          current = current[part];
        }
        
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
        
        return newObj;
      }, []);
      
      // 处理字段变化
      const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        
        setValues(prevValues => 
          setNestedValue(prevValues, name, fieldValue)
        );
      }, [setNestedValue]);
      
      // 设置字段值（支持嵌套路径）
      const setFieldValue = useCallback((name, value) => {
        setValues(prevValues => 
          setNestedValue(prevValues, name, value)
        );
      }, [setNestedValue]);
      
      // 处理数组字段操作
      const arrayHelpers = useCallback((name) => {
        return {
          push: (value) => {
            setValues(prevValues => {
              const array = getNestedValue(prevValues, name) || [];
              return setNestedValue(
                prevValues,
                name,
                [...array, value]
              );
            });
          },
          remove: (index) => {
            setValues(prevValues => {
              const array = getNestedValue(prevValues, name) || [];
              return setNestedValue(
                prevValues,
                name,
                array.filter((_, i) => i !== index)
              );
            });
          },
          swap: (indexA, indexB) => {
            setValues(prevValues => {
              const array = getNestedValue(prevValues, name) || [];
              const newArray = [...array];
              const temp = newArray[indexA];
              newArray[indexA] = newArray[indexB];
              newArray[indexB] = temp;
              return setNestedValue(prevValues, name, newArray);
            });
          }
        };
      }, [getNestedValue, setNestedValue]);
      
      // 其他基本功能（错误处理、提交等）...
      
      return {
        values,
        handleChange,
        setFieldValue,
        arrayHelpers,
        getNestedValue
        // 其他返回值...
      };
    }
    
    // 使用嵌套表单示例
    function RegistrationForm() {
      const { 
        values, 
        handleChange, 
        setFieldValue,
        arrayHelpers,
        getNestedValue
      } = useFormAdvanced({
        name: '',
        email: '',
        address: {
          street: '',
          city: '',
          zipCode: ''
        },
        skills: []
      });
      
      const skillsArray = arrayHelpers('skills');
      
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('表单数据:', values);
      };
      
      return (
        <form onSubmit={handleSubmit}>
          <div>
            <label>姓名:</label>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label>邮箱:</label>
            <input
              name="email"
              value={values.email}
              onChange={handleChange}
            />
          </div>
          
          <fieldset>
            <legend>地址信息</legend>
            
            <div>
              <label>街道:</label>
              <input
                name="address.street"
                value={getNestedValue(values, 'address.street') || ''}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label>城市:</label>
              <input
                name="address.city"
                value={getNestedValue(values, 'address.city') || ''}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label>邮编:</label>
              <input
                name="address.zipCode"
                value={getNestedValue(values, 'address.zipCode') || ''}
                onChange={handleChange}
              />
            </div>
          </fieldset>
          
          <fieldset>
            <legend>技能</legend>
            
            <button 
              type="button" 
              onClick={() => skillsArray.push('')}
            >
              添加技能
            </button>
            
            {values.skills && values.skills.map((skill, index) => (
              <div key={index}>
                <input
                  name={`skills.${index}`}
                  value={skill}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => skillsArray.remove(index)}
                >
                  删除
                </button>
              </div>
            ))}
          </fieldset>
          
          <button type="submit">提交</button>
        </form>
      );
    }
    ```

  - 网络请求Hook
  
    网络请求是前端应用的核心需求，自定义Hook可以统一处理加载状态、错误和数据缓存。

    ```jsx
    // 基本的网络请求Hook
    function useFetch(url, options = {}) {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      
      useEffect(() => {
        // 如果没有URL，不执行
        if (!url) return;
        
        let isMounted = true;
        const controller = new AbortController();
        const { signal } = controller;
        
        const fetchData = async () => {
          setLoading(true);
          
          try {
            const response = await fetch(url, { 
              signal, 
              ...options 
            });
            
            if (!response.ok) {
              throw new Error(`网络请求错误: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (isMounted) {
              setData(result);
              setError(null);
            }
          } catch (error) {
            if (isMounted && error.name !== 'AbortError') {
              setError(error.message);
              setData(null);
            }
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        };
        
        fetchData();
        
        // 清理函数
        return () => {
          isMounted = false;
          controller.abort();
        };
      }, [url, options.method, options.body]);
      
      return { data, loading, error };
    }
    
    // 使用网络请求Hook
    function UserProfile({ userId }) {
      const { data: user, loading, error } = useFetch(
        userId ? `/api/users/${userId}` : null
      );
      
      if (loading) return <div>加载中...</div>;
      if (error) return <div>错误: {error}</div>;
      if (!user) return <div>未找到用户</div>;
      
      return (
        <div className="user-profile">
          <h2>{user.name}</h2>
          <p>邮箱: {user.email}</p>
          <p>角色: {user.role}</p>
        </div>
      );
    }
    ```

    带缓存和重新获取功能的网络请求Hook：

    ```jsx
    // 高级网络请求Hook - 带缓存和重新获取功能
    function useDataFetching() {
      // 使用ref存储缓存数据
      const cache = useRef({});
      
      // 定义获取数据的函数
      const fetchData = useCallback(async (url, options = {}) => {
        const cacheKey = `${url}${JSON.stringify(options)}`;
        
        // 创建状态对象
        const fetchState = {
          loading: true,
          data: null,
          error: null
        };
        
        // 获取数据更新的回调函数
        const onStateChange = options.onStateChange || (() => {});
        
        // 使用缓存数据（如果有且未禁用缓存）
        if (!options.skipCache && cache.current[cacheKey]) {
          fetchState.loading = false;
          fetchState.data = cache.current[cacheKey].data;
          onStateChange({ ...fetchState });
          
          // 如果不需要后台刷新，直接返回缓存的数据
          if (!options.refreshInBackground) {
            return fetchState;
          }
        }
        
        // 更新加载状态
        if (!options.refreshInBackground) {
          fetchState.loading = true;
          onStateChange({ ...fetchState });
        }
        
        try {
          // 执行请求
          const response = await fetch(url, {
            ...options.fetchOptions
          });
          
          if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
          }
          
          const data = await response.json();
          
          // 更新状态
          fetchState.loading = false;
          fetchState.data = data;
          fetchState.error = null;
          
          // 更新缓存
          if (!options.skipCache) {
            cache.current[cacheKey] = {
              data,
              timestamp: Date.now()
            };
          }
          
          onStateChange({ ...fetchState });
        } catch (error) {
          fetchState.loading = false;
          fetchState.error = error.message;
          onStateChange({ ...fetchState });
        }
        
        return fetchState;
      }, []);
      
      // 清除特定或全部缓存
      const clearCache = useCallback((url) => {
        if (url) {
          // 清除特定URL的缓存
          Object.keys(cache.current).forEach(key => {
            if (key.startsWith(url)) {
              delete cache.current[key];
            }
          });
        } else {
          // 清除所有缓存
          cache.current = {};
        }
      }, []);
      
      return { fetchData, clearCache, cache: cache.current };
    }
    
    // 在组件中使用高级网络请求Hook
    function UserDashboard() {
      const [state, setState] = useState({
        loading: false,
        data: null,
        error: null
      });
      const { fetchData, clearCache } = useDataFetching();
      
      // 获取用户列表
      const loadUsers = useCallback(async (refresh = false) => {
        await fetchData('/api/users', {
          skipCache: refresh,
          onStateChange: setState
        });
      }, [fetchData]);
      
      // 首次加载
      useEffect(() => {
        loadUsers();
      }, [loadUsers]);
      
      return (
        <div>
          <h2>用户列表</h2>
          
          <div className="actions">
            <button 
              onClick={() => loadUsers(true)} 
              disabled={state.loading}
            >
              刷新
            </button>
            <button onClick={() => clearCache('/api/users')}>
              清除缓存
            </button>
          </div>
          
          {state.loading && <div>加载中...</div>}
          {state.error && <div className="error">{state.error}</div>}
          
          {state.data && (
            <ul className="user-list">
              {state.data.map(user => (
                <li key={user.id}>
                  <span>{user.name}</span>
                  <span>{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    ```

    SWR模式（Stale-While-Revalidate）的数据获取Hook：

    ```jsx
    // 实现SWR模式的自定义Hook
    function useSWR(key, fetcher, options = {}) {
      const {
        refreshInterval,
        dedupingInterval = 2000,
        revalidateOnFocus = true,
        revalidateOnReconnect = true,
        initialData
      } = options;
      
      // 定义状态
      const [data, setData] = useState(initialData);
      const [error, setError] = useState(null);
      const [isValidating, setIsValidating] = useState(false);
      
      // 使用useRef记录重要状态
      const keyRef = useRef(key);
      const unmountedRef = useRef(false);
      const lastFetchedAtRef = useRef(0);
      
      // 定义数据获取函数
      const fetchData = useCallback(async () => {
        // 如果没有key或fetcher，不执行
        if (!key || !fetcher) return false;
        
        // 检查防抖间隔
        const now = Date.now();
        if (now - lastFetchedAtRef.current < dedupingInterval) {
          return false;
        }
        
        // 避免在组件卸载后继续执行
        if (unmountedRef.current) return false;
        
        // 标记开始验证
        setIsValidating(true);
        lastFetchedAtRef.current = now;
        
        try {
          // 调用fetcher函数获取数据
          const newData = await fetcher(key);
          
          // 避免更新已卸载的组件
          if (unmountedRef.current) return false;
          
          // 更新数据和状态
          setData(newData);
          setError(null);
          return true;
        } catch (err) {
          // 避免更新已卸载的组件
          if (unmountedRef.current) return false;
          
          setError(err);
          return false;
        } finally {
          if (!unmountedRef.current) {
            setIsValidating(false);
          }
        }
      }, [key, fetcher, dedupingInterval]);
      
      // 当key或fetcher改变时重新获取
      useEffect(() => {
        if (keyRef.current !== key) {
          keyRef.current = key;
          fetchData();
        }
      }, [key, fetchData]);
      
      // 定期刷新
      useEffect(() => {
        if (!refreshInterval || !key) return () => {};
        
        const timer = setInterval(() => {
          fetchData();
        }, refreshInterval);
        
        return () => clearInterval(timer);
      }, [refreshInterval, key, fetchData]);
      
      // 焦点重新获取
      useEffect(() => {
        if (!revalidateOnFocus || !key) return () => {};
        
        const handleFocus = () => {
          fetchData();
        };
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
      }, [revalidateOnFocus, key, fetchData]);
      
      // 网络重连重新获取
      useEffect(() => {
        if (!revalidateOnReconnect || !key) return () => {};
        
        const handleReconnect = () => {
          fetchData();
        };
        
        window.addEventListener('online', handleReconnect);
        return () => window.removeEventListener('online', handleReconnect);
      }, [revalidateOnReconnect, key, fetchData]);
      
      // 组件卸载时标记
      useEffect(() => {
        return () => {
          unmountedRef.current = true;
        };
      }, []);
      
      // 手动重新验证方法
      const revalidate = useCallback(() => {
        return fetchData();
      }, [fetchData]);
      
      return {
        data,
        error,
        isValidating,
        revalidate
      };
    }
    
    // 使用SWR模式的Hook
    function ProductPage({ productId }) {
      const { data, error, isValidating, revalidate } = useSWR(
        productId ? `/api/products/${productId}` : null,
        async (url) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error('获取商品信息失败');
          return response.json();
        },
        {
          refreshInterval: 60000, // 每分钟刷新一次
          revalidateOnFocus: true
        }
      );
      
      if (error) return <div>错误: {error.message}</div>;
      if (!data && isValidating) return <div>加载商品信息...</div>;
      if (!data) return <div>没有商品信息</div>;
      
      return (
        <div className="product-details">
          <h1>{data.name}</h1>
          <p className="price">¥{data.price}</p>
          <p className="description">{data.description}</p>
          
          {isValidating && <span className="loading-indicator">刷新中...</span>}
          
          <button onClick={revalidate}>刷新商品信息</button>
        </div>
      );
    }
    ```

  - 媒体查询Hook
  
    媒体查询Hook可以帮助响应式地适应不同屏幕尺寸和设备特性。

    ```jsx
    // 基本的媒体查询Hook
    function useMediaQuery(query) {
      // 创建一个状态来跟踪媒体查询是否匹配
      const [matches, setMatches] = useState(false);
      
      useEffect(() => {
        // 创建MediaQueryList对象
        const mediaQuery = window.matchMedia(query);
        
        // 设置初始匹配状态
        setMatches(mediaQuery.matches);
        
        // 创建事件监听器
        const handler = (event) => {
          setMatches(event.matches);
        };
        
        // 添加事件监听器
        mediaQuery.addEventListener('change', handler);
        
        // 清理函数
        return () => {
          mediaQuery.removeEventListener('change', handler);
        };
      }, [query]); // 仅在查询字符串改变时重新执行
      
      return matches;
    }
    
    // 使用媒体查询Hook的组件
    function ResponsiveComponent() {
      const isMobile = useMediaQuery('(max-width: 767px)');
      const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
      const isDesktop = useMediaQuery('(min-width: 1024px)');
      
      return (
        <div className="responsive-content">
          <h2>响应式布局</h2>
          
          {isMobile && (
            <div className="mobile-layout">
              <p>移动设备布局</p>
              <MobileMenu />
            </div>
          )}
          
          {isTablet && (
            <div className="tablet-layout">
              <p>平板设备布局</p>
              <TabletSidebar />
            </div>
          )}
          
          {isDesktop && (
            <div className="desktop-layout">
              <p>桌面设备布局</p>
              <DesktopNavigation />
            </div>
          )}
        </div>
      );
    }
    ```

    创建预定义断点的Hook：

    ```jsx
    // 基于常用断点的媒体查询Hook
    function useBreakpoints() {
      // 预定义断点
      const breakpoints = {
        xs: '(max-width: 575px)',
        sm: '(min-width: 576px) and (max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 991px)',
        lg: '(min-width: 992px) and (max-width: 1199px)',
        xl: '(min-width: 1200px) and (max-width: 1399px)',
        xxl: '(min-width: 1400px)'
      };
      
      // 使用useMediaQuery检查每个断点
      const breakpointMatches = {
        xs: useMediaQuery(breakpoints.xs),
        sm: useMediaQuery(breakpoints.sm),
        md: useMediaQuery(breakpoints.md),
        lg: useMediaQuery(breakpoints.lg),
        xl: useMediaQuery(breakpoints.xl),
        xxl: useMediaQuery(breakpoints.xxl)
      };
      
      // 当前匹配的最大断点
      const currentBreakpoint = Object.keys(breakpointMatches).find(
        key => breakpointMatches[key]
      ) || 'xs';
      
      // 辅助函数，检查是否大于等于某个断点
      const up = (breakpoint) => {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
        const targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex >= targetIndex;
      };
      
      // 辅助函数，检查是否小于等于某个断点
      const down = (breakpoint) => {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
        const targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex <= targetIndex;
      };
      
      // 辅助函数，检查是否在两个断点之间
      const between = (start, end) => {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
        const startIndex = breakpointOrder.indexOf(start);
        const endIndex = breakpointOrder.indexOf(end);
        return currentIndex >= startIndex && currentIndex <= endIndex;
      };
      
      return {
        breakpoints,
        breakpointMatches,
        currentBreakpoint,
        up,
        down,
        between
      };
    }
    
    // 使用增强的媒体查询Hook
    function ResponsiveLayout() {
      const {
        currentBreakpoint,
        up,
        down,
        between
      } = useBreakpoints();
      
      return (
        <div className="layout">
          <header className={`header ${down('md') ? 'mobile-header' : 'desktop-header'}`}>
            <h1>响应式网站</h1>
            {up('md') ? <DesktopMenu /> : <MobileMenuIcon />}
          </header>
          
          <main className="content">
            <h2>当前断点: {currentBreakpoint}</h2>
            
            {down('xs') && <p>仅在超小屏幕上显示</p>}
            {between('sm', 'md') && <p>在小到中等屏幕上显示</p>}
            {up('lg') && <p>仅在大屏幕及以上显示</p>}
            
            <div className="grid" style={{
              gridTemplateColumns: `repeat(${
                down('sm') ? 1 : up('xl') ? 4 : up('md') ? 3 : 2
              }, 1fr)`
            }}>
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="grid-item">项目 {i + 1}</div>
              ))}
            </div>
          </main>
        </div>
      );
    }
    ```

    结合主题模式的媒体查询Hook：

    ```jsx
    // 结合主题模式的媒体查询Hook
    function usePrefersColorScheme() {
      // 检测系统颜色模式偏好
      const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
      
      // 存储用户的主题选择
      const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        
        // 如果有保存的主题，使用保存的主题
        // 否则，依据系统偏好
        if (savedTheme) {
          return savedTheme;
        }
        
        return prefersDark ? 'dark' : 'light';
      });
      
      // 设置主题并保存到localStorage
      const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
      }, []);
      
      // 切换主题
      const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
      }, [theme, setTheme]);
      
      // 当系统偏好改变时，如果没有手动设置，就跟随系统
      useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          setThemeState(prefersDark ? 'dark' : 'light');
        }
      }, [prefersDark]);
      
      return {
        theme,
        setTheme,
        toggleTheme,
        systemPrefersDark: prefersDark
      };
    }
    
    // 使用主题模式的组件
    function ThemeAwareApp() {
      const { theme, toggleTheme, systemPrefersDark } = usePrefersColorScheme();
      
      // 为body添加对应主题的类
      useEffect(() => {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
      }, [theme]);
      
      return (
        <div className="app">
          <header>
            <h1>主题感知应用</h1>
            <div className="theme-toggle">
              <span>当前主题: {theme}</span>
              <button onClick={toggleTheme}>
                切换到{theme === 'light' ? '深色' : '浅色'}主题
              </button>
              <div className="system-theme">
                系统偏好: {systemPrefersDark ? '深色' : '浅色'}
              </div>
            </div>
          </header>
          
          <main>
            <p>这个组件会根据用户偏好或系统设置调整主题。</p>
          </main>
        </div>
      );
    }
    ```

  - 动画Hook
  
    自定义动画Hook可以简化React中的动画实现，提高可复用性。

    ```jsx
    // 使用requestAnimationFrame的基本动画Hook
    function useAnimation(duration = 1000, delay = 0) {
      const [progress, setProgress] = useState(0);
      const [isRunning, setIsRunning] = useState(false);
      const animationRef = useRef(null);
      const startTimeRef = useRef(null);
      
      // 启动动画
      const start = useCallback(() => {
        setIsRunning(true);
        startTimeRef.current = null;
        
        const animate = (timestamp) => {
          if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
          }
          
          const elapsed = timestamp - startTimeRef.current;
          
          // 计算动画进度 (0-1)
          if (elapsed < delay) {
            // 如果在延迟期内，保持0进度
            setProgress(0);
          } else {
            // 超过延迟后，计算实际进度
            const timeProgress = Math.min((elapsed - delay) / duration, 1);
            setProgress(timeProgress);
          }
          
          // 如果动画未完成，继续执行
          if (elapsed - delay < duration) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // 动画完成
            setProgress(1);
            setIsRunning(false);
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      }, [duration, delay]);
      
      // 停止动画
      const stop = useCallback(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        setIsRunning(false);
      }, []);
      
      // 重置动画
      const reset = useCallback(() => {
        stop();
        setProgress(0);
      }, [stop]);
      
      // 组件卸载时清理
      useEffect(() => {
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }, []);
      
      return { progress, isRunning, start, stop, reset };
    }
    
    // 使用动画Hook的组件
    function ProgressBar() {
      const { progress, isRunning, start, reset } = useAnimation(2000);
      
      return (
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${progress * 100}%` }}
          />
          <div className="controls">
            <button 
              onClick={isRunning ? reset : start}
            >
              {isRunning ? '重置' : '启动'}
            </button>
            <span>{Math.round(progress * 100)}%</span>
          </div>
        </div>
      );
    }
    ```

    弹簧动画Hook：

    ```jsx
    // 使用弹性动画的Hook
    function useSpring(config = {}) {
      const {
        tension = 180,  // 弹簧张力
        friction = 12,  // 摩擦力
        initialValue = 0,  // 初始值
        targetValue = 1,   // 目标值
        precision = 0.01   // 停止精度
      } = config;
      
      const [value, setValue] = useState(initialValue);
      const [isAnimating, setIsAnimating] = useState(false);
      const animationRef = useRef(null);
      
      // 上一帧的状态
      const stateRef = useRef({
        value: initialValue,
        velocity: 0
      });
      
      // 开始动画
      const animate = useCallback((target = targetValue) => {
        // 如果当前值已接近目标值，不需要动画
        if (Math.abs(stateRef.current.value - target) < precision) {
          setValue(target);
          stateRef.current.value = target;
          stateRef.current.velocity = 0;
          setIsAnimating(false);
          return;
        }
        
        setIsAnimating(true);
        
        let lastTime;
        
        const step = (now) => {
          if (!lastTime) {
            lastTime = now;
            animationRef.current = requestAnimationFrame(step);
            return;
          }
          
          const dt = (now - lastTime) / 1000; // 转换为秒
          lastTime = now;
          
          // 弹簧力计算 
          const springForce = tension * (target - stateRef.current.value);
          // 阻尼力计算
          const dampingForce = -friction * stateRef.current.velocity;
          // 总力
          const force = springForce + dampingForce;
          // 加速度 = 力 / 质量（此处假定质量为1）
          const acceleration = force;
          
          // 更新速度和位置
          stateRef.current.velocity += acceleration * dt;
          stateRef.current.value += stateRef.current.velocity * dt;
          
          // 更新状态
          setValue(stateRef.current.value);
          
          // 检查是否接近目标且速度很低，如果是则停止动画
          if (
            Math.abs(stateRef.current.value - target) < precision &&
            Math.abs(stateRef.current.velocity) < precision
          ) {
            setValue(target);
            stateRef.current.value = target;
            stateRef.current.velocity = 0;
            setIsAnimating(false);
          } else {
            // 继续动画
            animationRef.current = requestAnimationFrame(step);
          }
        };
        
        animationRef.current = requestAnimationFrame(step);
      }, [targetValue, tension, friction, precision]);
      
      // 停止动画
      const stop = useCallback(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        setIsAnimating(false);
      }, []);
      
      // 重置动画
      const reset = useCallback(() => {
        stop();
        setValue(initialValue);
        stateRef.current.value = initialValue;
        stateRef.current.velocity = 0;
      }, [stop, initialValue]);
      
      // 组件卸载时清理
      useEffect(() => {
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }, []);
      
      return {
        value,
        isAnimating,
        animate,
        stop,
        reset
      };
    }
    
    // 使用弹簧动画效果的组件
    function SpringAnimation() {
      const [target, setTarget] = useState(0);
      const { value, animate } = useSpring({
        tension: 120,
        friction: 14,
        initialValue: 0
      });
      
      // 点击页面中的位置来设置目标位置
      const handleClick = (e) => {
        const newTarget = e.clientX / window.innerWidth;
        setTarget(newTarget);
        animate(newTarget);
      };
      
      return (
        <div 
          className="spring-container"
          onClick={handleClick}
          style={{ height: '200px', cursor: 'pointer' }}
        >
          <div 
            className="ball"
            style={{
              transform: `translateX(${value * 100}%)`,
              position: 'relative',
              top: '50%',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'blue'
            }}
          />
          <div className="instructions">
            点击页面上的任意位置，小球将会以弹簧动画效果移动
          </div>
        </div>
      );
    }
    ```

    CSS动画和过渡Hook：

    ```jsx
    // CSS动画和过渡Hook
    function useTransition(
      show,
      {
        timeout = 300,
        mountOnEnter = false,
        unmountOnExit = true,
        appear = false,
        enter = true,
        exit = true,
        onEnter,
        onEntering,
        onEntered,
        onExit,
        onExiting,
        onExited
      } = {}
    ) {
      // 定义可能的状态
      const UNMOUNTED = 'unmounted';
      const EXITED = 'exited';
      const ENTERING = 'entering';
      const ENTERED = 'entered';
      const EXITING = 'exiting';
      
      // 使用状态来跟踪当前过渡状态
      const [state, setState] = useState(() => {
        let initialState;
        if (!show && unmountOnExit) {
          initialState = UNMOUNTED;
        } else if (!show && exit) {
          initialState = EXITED;
        } else if (show && appear) {
          initialState = ENTERING;
        } else {
          initialState = ENTERED;
        }
        return initialState;
      });
      
      // 使用ref避免闭包陷阱
      const prevShowRef = useRef(show);
      
      useEffect(() => {
        let timeoutId;
        let nextState = null;
        const prevShow = prevShowRef.current;
        
        if (prevShow !== show) {
          prevShowRef.current = show;
          
          if (show) {
            // 显示元素
            if (unmountOnExit && state === UNMOUNTED) {
              nextState = EXITED;
            }
            if (state === EXITED) {
              if (typeof onEnter === 'function') onEnter();
              nextState = ENTERING;
            }
          } else {
            // 隐藏元素
            if (state === ENTERED) {
              if (typeof onExit === 'function') onExit();
              nextState = EXITING;
            }
          }
          
          // 设置下一个状态
          if (nextState !== null) {
            setState(nextState);
            
            // 如果是进入状态，在下一帧更新为ENTERED
            if (nextState === ENTERING) {
              timeoutId = setTimeout(() => {
                setState(ENTERED);
                if (typeof onEntered === 'function') onEntered();
              }, timeout);
            }
            
            // 如果是退出状态，在timeout后更新为EXITED或UNMOUNTED
            if (nextState === EXITING) {
              timeoutId = setTimeout(() => {
                if (unmountOnExit) {
                  setState(UNMOUNTED);
                } else {
                  setState(EXITED);
                }
                if (typeof onExited === 'function') onExited();
              }, timeout);
            }
          }
        }
        
        return () => {
          clearTimeout(timeoutId);
        };
      }, [
        show, state, timeout, unmountOnExit,
        onEnter, onEntering, onEntered,
        onExit, onExiting, onExited
      ]);
      
      // 确定元素是否应该被挂载
      const mountElement = 
        state !== UNMOUNTED &&
        (mountOnEnter ? state !== EXITED : true);
      
      return {
        mountElement,
        state
      };
    }
    
    // 使用过渡Hook的简单组件
    function FadeTransition({ show, children }) {
      const { mountElement, state } = useTransition(show, {
        timeout: 300,
        unmountOnExit: true
      });
      
      if (!mountElement) {
        return null;
      }
      
      const stateStyles = {
        exited: { opacity: 0 },
        entering: { opacity: 0, transition: 'opacity 300ms ease-in' },
        entered: { opacity: 1, transition: 'opacity 300ms ease-in' },
        exiting: { opacity: 0, transition: 'opacity 300ms ease-out' }
      };
      
      return (
        <div style={{ ...stateStyles[state] }}>
          {children}
        </div>
      );
    }
    
    // 使用FadeTransition组件
    function ModalExample() {
      const [isOpen, setIsOpen] = useState(false);
      
      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '关闭' : '打开'}弹窗
          </button>
          
          <FadeTransition show={isOpen}>
            <div className="modal">
              <div className="modal-content">
                <h2>模态窗口</h2>
                <p>这个模态窗口使用了淡入淡出的过渡效果。</p>
                <button onClick={() => setIsOpen(false)}>关闭</button>
              </div>
            </div>
          </FadeTransition>
        </div>
      );
    }
    ```

  - 本地存储Hook
  
    本地存储Hook可以简化与浏览器存储API的交互，提供序列化和类型安全。

    ```jsx
    // 基本的localStorage Hook
    function useLocalStorage(key, initialValue) {
      // 创建状态，懒初始化从localStorage读取
      const [storedValue, setStoredValue] = useState(() => {
        try {
          // 从localStorage获取值
          const item = window.localStorage.getItem(key);
          // 如果存在则解析，否则返回初始值
          return item ? JSON.parse(item) : initialValue;
        } catch (error) {
          // 如果有错误，使用初始值
          console.error(`Error reading localStorage key "${key}":`, error);
          return initialValue;
        }
      });
      
      // 返回一个包装版本的useState的setter
      const setValue = useCallback((value) => {
        try {
          // 支持函数形式和直接形式
          const valueToStore =
            value instanceof Function ? value(storedValue) : value;
          // 保存到state
          setStoredValue(valueToStore);
          // 保存到localStorage
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }, [key, storedValue]);
      
      // 移除项目的方法
      const removeItem = useCallback(() => {
        try {
          window.localStorage.removeItem(key);
          setStoredValue(initialValue);
        } catch (error) {
          console.error(`Error removing localStorage key "${key}":`, error);
        }
      }, [key, initialValue]);
      
      return [storedValue, setValue, removeItem];
    }
    
    // 使用localStorage Hook的组件
    function UserPreferences() {
      const [preferences, setPreferences, resetPreferences] = useLocalStorage(
        'user-preferences',
        {
          theme: 'light',
          fontSize: 'medium',
          showNotifications: true
        }
      );
      
      const handleThemeChange = (e) => {
        setPreferences(prev => ({
          ...prev,
          theme: e.target.value
        }));
      };
      
      const handleFontSizeChange = (e) => {
        setPreferences(prev => ({
          ...prev,
          fontSize: e.target.value
        }));
      };
      
      const toggleNotifications = () => {
        setPreferences(prev => ({
          ...prev,
          showNotifications: !prev.showNotifications
        }));
      };
      
      return (
        <div className="preferences">
          <h2>用户偏好设置</h2>
          
          <div className="preference-group">
            <label>主题：</label>
            <select 
              value={preferences.theme} 
              onChange={handleThemeChange}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
          </div>
          
          <div className="preference-group">
            <label>字体大小：</label>
            <select 
              value={preferences.fontSize} 
              onChange={handleFontSizeChange}
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          
          <div className="preference-group">
            <label>
              <input
                type="checkbox"
                checked={preferences.showNotifications}
                onChange={toggleNotifications}
              />
              显示通知
            </label>
          </div>
          
          <button onClick={resetPreferences}>
            重置为默认设置
          </button>
        </div>
      );
    }
    ```

    增强版存储Hook，支持多种存储类型：

    ```jsx
    // 增强版存储Hook，支持多种存储类型
    function useStorage(key, initialValue, options = {}) {
      const {
        storage = 'local', // 'local', 'session', 'memory'
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        expiry = null  // 过期时间（秒）
      } = options;
      
      // 内存存储（用于fallback，当localStorage不可用）
      const memoryStorageRef = useRef(new Map());
      
      // 获取正确的存储对象
      const getStorageObject = useCallback(() => {
        if (storage === 'local') {
          try {
            // 测试localStorage是否可用
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return localStorage;
          } catch (e) {
            console.warn('localStorage不可用，回退到内存存储');
            return null;
          }
        } else if (storage === 'session') {
          try {
            // 测试sessionStorage是否可用
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return sessionStorage;
          } catch (e) {
            console.warn('sessionStorage不可用，回退到内存存储');
            return null;
          }
        }
        return null; // 使用内存存储
      }, [storage]);
      
      // 使用ref来保存最新的过期选项
      const expiryRef = useRef(expiry);
      useEffect(() => {
        expiryRef.current = expiry;
      }, [expiry]);
      
      // 从存储中获取项
      const getStoredItem = useCallback(() => {
        const storageObject = getStorageObject();
        
        try {
          let valueToReturn = initialValue;
          
          if (storageObject) {
            const item = storageObject.getItem(key);
            if (item) {
              const parsed = deserialize(item);
              
              // 检查过期时间
              if (
                parsed &&
                parsed._expiry &&
                parsed._expiry < new Date().getTime()
              ) {
                // 已过期，删除并返回初始值
                storageObject.removeItem(key);
              } else {
                valueToReturn = parsed && parsed._value !== undefined
                  ? parsed._value
                  : parsed;
              }
            }
          } else {
            // 使用内存存储
            const memoryValue = memoryStorageRef.current.get(key);
            if (memoryValue !== undefined) {
              const { _value, _expiry } = memoryValue;
              
              // 检查过期时间
              if (_expiry && _expiry < new Date().getTime()) {
                // 已过期，删除并返回初始值
                memoryStorageRef.current.delete(key);
              } else {
                valueToReturn = _value;
              }
            }
          }
          
          return valueToReturn;
        } catch (error) {
          console.error(`获取存储项 "${key}" 时出错:`, error);
          return initialValue;
        }
      }, [key, initialValue, getStorageObject, deserialize]);
      
      // 创建状态，从存储中获取初始值
      const [storedValue, setStoredValue] = useState(getStoredItem);
      
      // 修改存储项的函数
      const setValue = useCallback((value) => {
        try {
          // 允许value是函数，类似于useState
          const valueToStore = value instanceof Function 
            ? value(storedValue) 
            : value;
          
          // 保存到状态
          setStoredValue(valueToStore);
          
          // 计算过期时间（如果有）
          let expiryTime = null;
          if (expiryRef.current) {
            expiryTime = new Date().getTime() + expiryRef.current * 1000;
          }
          
          // 准备要存储的数据
          const dataToStore = expiryTime
            ? { _value: valueToStore, _expiry: expiryTime }
            : valueToStore;
          
          const storageObject = getStorageObject();
          if (storageObject) {
            // 保存到Web存储API
            storageObject.setItem(key, serialize(dataToStore));
          } else {
            // 保存到内存存储
            memoryStorageRef.current.set(key, {
              _value: valueToStore,
              ...(expiryTime && { _expiry: expiryTime })
            });
          }
        } catch (error) {
          console.error(`设置存储项 "${key}" 时出错:`, error);
        }
      }, [key, storedValue, getStorageObject, serialize]);
      
      // 移除存储项的函数
      const removeItem = useCallback(() => {
        try {
          const storageObject = getStorageObject();
          if (storageObject) {
            storageObject.removeItem(key);
          } else {
            memoryStorageRef.current.delete(key);
          }
          setStoredValue(initialValue);
        } catch (error) {
          console.error(`移除存储项 "${key}" 时出错:`, error);
        }
      }, [key, initialValue, getStorageObject]);
      
      // 监听storage事件，以便在其他标签页更改时同步更新
      useEffect(() => {
        if (storage === 'local' || storage === 'session') {
          const handleStorageChange = (e) => {
            if (e.key === key) {
              // 重新从存储中获取值
              setStoredValue(getStoredItem());
            }
          };
          
          window.addEventListener('storage', handleStorageChange);
          return () => {
            window.removeEventListener('storage', handleStorageChange);
          };
        }
      }, [key, storage, getStoredItem]);
      
      return [storedValue, setValue, removeItem];
    }
    
    // 使用增强版存储Hook
    function CacheExample() {
      // 使用带过期时间的存储
      const [cachedData, setCachedData, clearCache] = useStorage(
        'api-data',
        null,
        {
          storage: 'local',
          expiry: 3600, // 1小时过期
          // 自定义序列化处理
          serialize: (data) => JSON.stringify(data, null, 2),
          deserialize: (str) => {
            try {
              return JSON.parse(str);
            } catch (e) {
              console.error('反序列化失败', e);
              return null;
            }
          }
        }
      );
      
      const fetchData = async () => {
        try {
          const response = await fetch('https://api.example.com/data');
          const data = await response.json();
          setCachedData(data);
        } catch (error) {
          console.error('获取数据失败', error);
        }
      };
      
      return (
        <div>
          <h2>缓存数据示例</h2>
          
          <div className="actions">
            <button onClick={fetchData}>获取并缓存数据</button>
            <button onClick={clearCache}>清除缓存</button>
          </div>
          
          <div className="data-display">
            <h3>当前缓存的数据:</h3>
            <pre>
              {cachedData 
                ? JSON.stringify(cachedData, null, 2) 
                : '没有缓存数据'}
            </pre>
          </div>
        </div>
      );
    }
    ```

- **副作用管理**
  - 异步操作
  - 取消订阅
  - 竞态处理
  - 重试逻辑
  - 缓存策略

### Hooks最佳实践
- **依赖管理**
  - 避免依赖地狱
  - 优化依赖项
  - 避免对象字面量
  - 稳定引用
  - 常见问题排查
- **状态管理策略**
  - 状态提升
  - 状态分割
  - 复杂状态拆分
  - Context + Reducer
  - 原子化状态
- **Hook陷阱**
  - 循环中使用
  - 条件调用
  - 闭包陷阱
  - 过度使用问题
  - 性能调试

## 状态管理

### Redux生态
- **Redux核心概念**
  - Store设计
  - Action规范
  - Reducer原则
  - 中间件机制
  - 单向数据流
- **Redux工具链**
  - Redux Toolkit
  - Reselect选择器
  - Immer不可变更新
  - Redux DevTools
  - 异步处理方案
- **React-Redux**
  - Provider组件
  - connect高阶组件
  - useSelector钩子
  - useDispatch钩子
  - 性能优化策略

### Mobx与响应式
- **Mobx核心概念**
  - 可观察状态
  - Actions处理
  - Computed计算值
  - Reaction响应
  - 与Redux对比
- **Mobx与React集成**
  - Observer组件
  - useObserver钩子
  - 装饰器语法
  - 异步处理
  - 状态结构设计
- **响应式状态管理**
  - 细粒度更新
  - 派生状态
  - 副作用管理
  - 状态隔离
  - 性能优化

### 服务状态管理
- **React Query**
  - 查询与变更
  - 缓存机制
  - 请求状态
  - 预取与复用
  - 乐观更新
- **SWR策略**
  - 缓存与重新验证
  - 错误处理
  - 依赖请求
  - 轮询机制
  - 全局配置
- **Apollo Client**
  - GraphQL集成
  - 查询组件
  - 变更处理
  - 本地状态
  - 缓存策略

### Zustand与轻量状态
- **Zustand基础**
  - 简约API
  - 状态订阅
  - 异步操作
  - 中间件
  - 与Redux对比
- **状态分片**
  - 模块化状态
  - 选择器优化
  - 组合stores
  - 与Context配合
  - 持久化方案
- **小型状态库**
  - Jotai原子状态
  - Recoil状态树
  - Valtio代理状态
  - XState状态机
  - 选型对比

## 路由与数据获取

### React Router
- **路由基础**
  - BrowserRouter
  - Routes与Route
  - 导航与链接
  - 动态路由
  - 嵌套路由
- **路由功能**
  - 参数处理
  - 查询字符串
  - 重定向
  - 路由守卫
  - 鉴权路由
- **高级应用**
  - 延迟加载
  - 滚动恢复
  - 路由状态持久化
  - 路由动画
  - 自定义历史管理

### 数据获取模式
- **请求库选择**
  - Fetch API
  - Axios
  - SuperAgent
  - ky
  - 最佳实践
- **数据获取Hook**
  - 请求状态管理
  - 错误处理
  - 取消请求
  - 缓存策略
  - 轮询与刷新
- **API管理**
  - API层设计
  - 请求拦截
  - 响应处理
  - 模拟数据
  - 环境切换

### REST与GraphQL
- **RESTful架构**
  - 资源设计
  - 请求方法
  - 状态码处理
  - 数据格式
  - API版本
- **GraphQL客户端**
  - Schema理解
  - Query与Mutation
  - Fragment复用
  - 订阅实现
  - 缓存控制
- **数据规范化**
  - 关系数据处理
  - 扁平化状态
  - 数据范式化
  - 状态同步
  - 反范式化策略

## 组件库与UI

### 组件设计系统
- **设计系统原则**
  - 一致性设计
  - 原子设计法
  - 组件封装层次
  - 可组合性
  - 可扩展性
- **组件API设计**
  - Props接口设计
  - 默认值处理
  - 类型定义
  - 文档驱动开发
  - 版本兼容
- **主题与变量**
  - Design token
  - 主题切换
  - 变量设计
  - 响应式主题
  - 主题扩展

### 常用组件库
- **Material UI**
  - 组件体系
  - 样式定制
  - 主题配置
  - 响应式设计
  - 性能优化
- **Ant Design**
  - 企业级组件
  - 表单系统
  - 布局组件
  - 数据展示
  - 国际化支持
- **Chakra UI**
  - 样式系统
  - 可访问性
  - Hook API
  - 响应式工具
  - 自定义主题

### 表单与验证
- **React Hook Form**
  - 非受控组件
  - 验证集成
  - 表单状态
  - 字段数组
  - 性能优化
- **Formik**
  - 表单状态管理
  - 错误处理
  - 字段验证
  - 提交处理
  - 嵌套表单
- **验证策略**
  - Yup
  - Zod
  - 自定义验证
  - 异步验证
  - 错误信息定制

### 数据可视化
- **Charts与图表**
  - Recharts
  - Victory
  - Chart.js
  - D3集成
  - 响应式图表
- **交互式数据**
  - 拖拽排序
  - 虚拟滚动
  - 无限加载
  - 数据网格
  - 树状结构
- **地图与空间数据**
  - React地图库
  - 矢量图层
  - 地理数据处理
  - 交互事件
  - 性能优化

## 性能优化

### 渲染优化
- **减少重渲染**
  - React.memo使用
  - shouldComponentUpdate
  - PureComponent应用
  - 不可变数据优化
  - key的正确使用
- **代码分割**
  - 动态import
  - React.lazy
  - Suspense处理
  - 基于路由的分割
  - 命名导出分割
- **组件懒加载**
  - 视口监测加载
  - 交互触发加载
  - 预加载策略
  - 加载状态处理
  - 错误边界保护

### 状态优化
- **状态设计**
  - 状态归一化
  - 状态隔离
  - 最小状态原则
  - 派生状态处理
  - 状态提升
- **上下文优化**
  - Context分割
  - 选择性订阅
  - 子树渲染优化
  - Provider组织策略
  - 消费者模式
- **副作用管理**
  - useEffect依赖优化
  - useCallback合理应用
  - useMemo计算缓存
  - 自定义Hook封装
  - 异步操作组织

### 资源优化
- **资源加载**
  - 图片懒加载
  - 资源预加载
  - 字体优化
  - 代码分割策略
  - 动态导入
- **构建优化**
  - 打包分析
  - Tree Shaking
  - 外部依赖优化
  - 代码压缩
  - 持久化缓存

## 高级特性

### 服务端渲染
- **SSR架构**
  - 服务端渲染原理
  - 数据预取策略
  - 代码共享模式
  - 同构应用设计
  - 水合过程管理
- **Next.js框架**
  - Pages路由体系
  - App Router架构
  - 静态生成(SSG)
  - 增量静态再生成
  - 中间件应用
- **性能考量**
  - 缓存策略
  - 流式渲染
  - 选择性水合
  - 渲染策略选择
  - 首屏加载优化

### 状态管理高级模式
- **Redux生态系统**
  - Redux Toolkit最佳实践
  - 中间件设计
  - 异步Action处理
  - 不可变更新模式
  - 选择器模式与记忆化
- **Zustand状态管理**
  - 轻量化状态设计
  - 状态分片
  - 中间件使用
  - 异步集成
  - 与React集成优化
- **Jotai/Recoil原子化状态**
  - 原子设计模式
  - 派生原子
  - 异步原子
  - 原子群组
  - 原子持久化

### React并发模式
- **并发特性**
  - 时间切片
  - 优先级调度
  - Suspense机制
  - 转场效果
  - 选择性水合
- **业务场景应用**
  - 长列表渲染
  - 大型表单处理
  - 数据可视化
  - 复杂计算
  - 并行数据加载
- **错误处理**
  - 错误边界设计
  - 错误恢复策略
  - 降级渲染
  - 优雅失败
  - 监控与报告

### 前端微服务
- **微前端架构**
  - 微前端设计原则
  - 应用拆分策略
  - 沙箱隔离
  - 样式隔离
  - 微应用通信
- **模块联邦**
  - Module Federation设置
  - 远程组件加载
  - 共享依赖管理
  - 版本控制
  - 动态远程加载
- **状态共享**
  - 跨应用状态管理
  - 事件总线
  - 跨微应用通信
  - 全局状态隔离
  - 统一认证授权

## 实践指南

### 工程化最佳实践
- **项目结构**
  - 特性驱动开发
  - 原子设计组件
  - 文件组织策略
  - 扁平化与嵌套化
  - 可伸缩文件架构
- **代码质量**
  - ESLint规则配置
  - TypeScript类型设计
  - 代码评审流程
  - 自动化测试集成
  - CI/CD流水线
- **构建系统**
  - Webpack高级配置
  - Vite加速开发
  - 环境变量管理
  - 多环境构建
  - 部署优化

### 组件设计模式
- **组合模式**
  - 组件组合原则
  - Compound Components
  - Render Props模式
  - 高阶组件模式
  - Hook组合
- **状态共享模式**
  - 提升状态模式
  - 容器/展示模式
  - 提供者/消费者模式
  - 状态机模式
  - Command模式
- **行为重用模式**
  - 自定义Hook设计
  - 可控与非可控组件
  - 适配器模式
  - 装饰器模式
  - 策略模式

### 交互与体验
- **动效设计**
  - 过渡动画实现
  - 基于状态的动画
  - 手势交互
  - 基于物理的动画
  - 微交互设计
- **表单处理**
  - 复杂表单架构
  - 表单验证策略
  - 表单性能优化
  - 字段级别渲染控制
  - 动态表单设计
- **无障碍设计**
  - ARIA属性应用
  - 焦点管理
  - 键盘导航
  - 屏幕阅读器兼容
  - 色彩对比度

### 测试策略
- **单元测试**
  - 组件测试策略
  - Hook测试
  - 状态测试
  - 模拟与存根
  - 测试覆盖率
- **集成测试**
  - 组件交互测试
  - 路由测试
  - API集成测试
  - 状态流测试
  - 事件测试
- **E2E测试**
  - Cypress测试
  - Playwright自动化
  - 用户流程测试
  - 视觉回归测试
  - 性能测试

### 安全实践
- **前端安全防御**
  - XSS防护
  - CSRF防护
  - 依赖安全
  - 安全的API调用
  - 敏感信息处理
- **认证授权**
- **React渲染机制**
  - 虚拟DOM原理
  - 协调算法
  - 更新批处理
  - 渲染过程
  - Fiber架构
- **组件优化**
  - React.memo
  - PureComponent
  - shouldComponentUpdate
  - 列表优化
  - 避免不必要渲染
- **并发模式**
  - 并发渲染
  - useTransition
  - useDeferredValue
  - 优先级调度
  - Suspense机制

### 代码分割
- **懒加载**
  - React.lazy
  - 动态导入
  - 路由级代码分割
  - 组件级代码分割
  - 预加载策略
- **Webpack优化**
  - 包分析
  - 分包策略
  - Tree Shaking
  - 缓存优化
  - 预加载与预获取
- **缓存优化**
  - 构建缓存
  - 运行时缓存
  - Chunk命名
  - 模块联邦
  - DLL插件

### 性能监控
- **性能度量**
  - 核心Web指标
  - React DevTools
  - 性能分析器
  - 瓶颈识别
  - Lighthouse集成
- **React Profiler**
  - 组件分析
  - 渲染计数
  - 耗时检测
  - 可视化结果
  - 优化建议
- **性能监控工具**
  - 用户体验监控
  - 错误边界
  - 错误跟踪
  - 性能报告
  - A/B测试

### 大数据渲染
- **虚拟列表**
  - react-window
  - react-virtualized
  - 滚动优化
  - 动态高度
  - 容器缓存
- **分片渲染**
  - 时间切片
  - 请求动画帧
  - 任务调度
  - 批量处理
  - 优先级渲染
- **数据处理优化**
  - 大数据结构
  - 内存管理
  - 计算缓存
  - worker线程处理
  - 增量计算

## 服务端渲染与静态站点

### Next.js框架
- **页面与路由**
  - 文件系统路由
  - 动态路由
  - 路由钩子
  - 中间件
  - 导航与预加载
- **数据获取**
  - getServerSideProps
  - getStaticProps
  - getStaticPaths
  - Incremental Static Regeneration
  - SWR客户端
- **样式与资源**
  - CSS模块
  - Sass支持
  - 图像优化
  - 字体优化
  - 静态资源

### Gatsby静态站点
- **内容源**
  - GraphQL层
  - 数据源插件
  - Markdown处理
  - CMS集成
  - 本地数据
- **构建过程**
  - 页面生成
  - 图像处理
  - 性能优化
  - 预渲染
  - 增量构建
- **插件生态**
  - 常用插件
  - 主题系统
  - SEO优化
  - PWA功能
  - 第三方集成

### 服务端渲染原理
- **SSR实现**
  - renderToString
  - hydration过程
  - 状态传输
  - 代码拆分
  - 流式渲染
- **同构开发**
  - 环境适配
  - API封装
  - 路由匹配
  - 状态管理
  - 服务端生命周期
- **性能优化**
  - 缓存策略
  - 静态优化
  - 选择性渲染
  - 流式传输
  - CDN部署

## 测试与部署

### React测试
- **单元测试**
  - Jest配置
  - 组件测试
  - Hook测试
  - 模拟与存根
  - 快照测试
- **React Testing Library**
  - 用户交互测试
  - 查询方法
  - 事件触发
  - 异步测试
  - 可访问性测试
- **集成测试**
  - 组件集成
  - 路由测试
  - 状态管理测试
  - API模拟
  - 端到端测试

### 部署策略
- **静态部署**
  - Netlify
  - Vercel
  - GitHub Pages
  - AWS S3
  - 部署配置
- **容器化部署**
  - Docker设置
  - Docker Compose
  - 多阶段构建
  - Kubernetes部署
  - CI/CD流程
- **无服务函数**
  - API路由
  - 无服务部署
  - 边缘函数
  - 环境变量
  - 函数边界

### 性能监控与分析
- **前端监控**
  - 实时监控
  - 性能指标
  - 错误捕获
  - 用户行为
  - 资源加载
- **性能分析**
  - 性能预算
  - 回归测试
  - 性能基准
  - 持续监控
  - 优化策略
- **可靠性工程**
  - 容错设计
  - 健康检查
  - 恢复策略
  - 降级方案
  - 线上调试

## React生态系统

### React 18特性
- **并发渲染**
  - 并发特性
  - 启用方式
  - 新API支持
  - 迁移策略
  - 响应式更新
- **Suspense扩展**
  - 数据加载
  - 流式SSR
  - 服务端组件
  - 停顿机制
  - 边界处理
- **自动批处理**
  - 更新合并
  - 实现机制
  - 优化效果
  - 边缘情况
  - 开发工具

### 跨平台React
- **React Native**
  - 组件系统
  - 原生模块
  - 样式处理
  - 导航方案
  - 性能优化
- **React Native Web**
  - 共享代码
  - 平台适配
  - 样式统一
  - 响应式设计
  - 手势处理
- **Electron与Tauri**
  - 桌面应用架构
  - IPC通信
  - 原生功能
  - 打包发布
  - 安全考量

### Web Components集成
- **自定义元素**
  - 创建与使用
  - 生命周期
  - Props与属性
  - 事件处理
  - 样式封装
- **React与Web Components**
  - 互操作性
  - 事件映射
  - ref转发
  - 封装策略
  - 框架共存
- **Micro Frontends**
  - 应用集成
  - 运行时组合
  - 共享依赖
  - 跨框架通信
  - 独立部署

### React未来展望
- **服务器组件**
  - 客户端与服务端分离
  - 数据获取模式
  - 渲染策略
  - 代码分割
  - 安全性考量
- **编译优化**
  - 编译时优化
  - 静态分析
  - 自动记忆化
  - 运行时优化
  - 构建工具集成
- **React发展方向**
  - 核心团队动向
  - 未来API设计
  - 社区趋势
  - 框架对比
  - 学习路线图 