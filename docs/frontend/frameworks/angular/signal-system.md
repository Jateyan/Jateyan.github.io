---
title: Angular Signal信号系统
description: Angular信号系统详解：创建、更新、计算信号及与组件的集成最佳实践
head:
  -
    - meta
    -
      name: keywords
      content: Angular, Signal, 信号系统, 响应式编程, 状态管理, 计算信号
createTime: 2025/03/24 13:03:37
permalink: /article/43looq9p/
---

# Angular Signal信号系统

## 目录

- [信号创建与更新](#信号创建与更新)
- [计算信号](#计算信号)
- [信号与组件集成](#信号与组件集成)
- [Signal与RxJS比较](#signal与rxjs比较)
- [最佳实践与性能优化](#最佳实践与性能优化)

## 信号创建与更新

Signal是Angular 16引入的全新响应式原语，提供了一种声明式的状态管理方式。

### 1. 信号基础概念

Signal的核心是一个保存值的可调用引用，当值变化时会自动通知依赖者。

```
[信号] → [依赖追踪] → [自动更新]
   ↑          |          |
   └─────────变更────────┘
```

Signal的核心优势：
- 细粒度更新
- 精确的依赖跟踪
- 同步执行模型
- 内置优化的变更检测

### 2. 创建信号

**基本信号创建**：

```typescript
import { signal } from '@angular/core';

// 创建一个可写信号
const count = signal(0);  // 初始值为0

// 读取信号值
console.log(count());  // 输出: 0

// 简单信号使用示例
@Component({
  selector: 'app-counter',
  template: `
    <div>当前计数: {{ count() }}</div>
    <button (click)="increment()">增加</button>
  `
})
export class CounterComponent {
  count = signal(0);
  
  increment() {
    // 更新信号值
    this.count.update(value => value + 1);
  }
}
```

### 3. 信号更新方法

Angular提供了三种更新信号的主要方法：

1. **set方法** - 直接设置新值
2. **update方法** - 基于当前值计算新值
3. **mutate方法** - 直接修改对象/数组（慎用）

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <div>
      <h2>{{ user().name }}</h2>
      <p>年龄: {{ user().age }}</p>
      <p>职业: {{ user().occupation }}</p>
      
      <button (click)="updateAge()">增加年龄</button>
      <button (click)="changeName()">修改姓名</button>
      <button (click)="addSkill()">添加技能</button>
    </div>
  `
})
export class UserProfileComponent {
  // 对象类型信号
  user = signal({
    name: '张三',
    age: 30,
    occupation: '开发工程师',
    skills: ['JavaScript', 'TypeScript', 'Angular']
  });
  
  // 使用set方法 - 替换整个对象
  changeName() {
    this.user.set({
      ...this.user(),  // 保留其他属性
      name: '李四'     // 只修改姓名
    });
  }
  
  // 使用update方法 - 基于当前值更新
  updateAge() {
    this.user.update(user => ({
      ...user,
      age: user.age + 1
    }));
  }
  
  // 使用mutate方法 - 直接修改对象（仅在特定场景使用）
  addSkill() {
    this.user.mutate(user => {
      user.skills.push('RxJS');
    });
  }
}
```

### 4. 信号与对象/数组

处理复杂数据结构时的最佳实践：

```typescript
// 产品列表管理示例
@Component({
  selector: 'app-product-manager',
  template: `
    <div>
      <h2>产品列表</h2>
      <ul>
        <li *ngFor="let product of products()">
          {{ product.name }} - ¥{{ product.price }}
          <button (click)="removeProduct(product.id)">删除</button>
        </li>
      </ul>
      
      <button (click)="addProduct()">添加产品</button>
      <button (click)="discountAll()">全部打折</button>
    </div>
  `
})
export class ProductManagerComponent {
  // 产品列表信号
  products = signal<Product[]>([
    { id: 1, name: '笔记本电脑', price: 5999 },
    { id: 2, name: '智能手机', price: 3999 }
  ]);
  
  // 添加产品 - 不可变更新模式
  addProduct() {
    const newProduct = { 
      id: Date.now(), 
      name: '新产品' + Math.floor(Math.random() * 100), 
      price: Math.floor(Math.random() * 1000) + 1000 
    };
    
    // 创建新数组而非修改原数组
    this.products.update(products => [...products, newProduct]);
  }
  
  // 删除产品
  removeProduct(id: number) {
    this.products.update(products => 
      products.filter(product => product.id !== id)
    );
  }
  
  // 批量更新 - 所有产品打八折
  discountAll() {
    this.products.update(products => 
      products.map(product => ({
        ...product,
        price: Math.round(product.price * 0.8)
      }))
    );
  }
}

// 推荐的不可变更新模式
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-manager',
  template: `<div>任务管理器</div>`
})
export class TaskManagerComponent {
  tasks = signal<Task[]>([]);
  
  // ✅ 好的实践：创建新对象/数组
  addTask(text: string) {
    this.tasks.update(tasks => [
      ...tasks,
      { id: Date.now(), text, completed: false }
    ]);
  }
  
  // ✅ 好的实践：使用map创建新数组
  toggleTask(id: number) {
    this.tasks.update(tasks => 
      tasks.map(task => 
        task.id === id 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  }
  
  // ❌ 避免的实践：直接修改对象
  badToggleTask(id: number) {
    // 错误示范：直接修改数组中的对象
    const tasks = this.tasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.tasks.set(tasks); // 不会触发更新因为引用没变!
    }
  }
}
```

### 5. 信号的选择性更新机制

Signal的一个重要优势是其选择性更新机制，即只有在值实际变化时才触发更新。

```typescript
@Component({
  selector: 'app-optimized',
  template: `<div>优化示例</div>`
})
export class OptimizedComponent {
  counter = signal(0);
  
  // 即使多次调用，如果值没变，也不会触发更新
  setToZero() {
    this.counter.set(0); // 假设当前值已经是0
    // 不会触发依赖更新，因为值没有变化
  }
  
  // 自定义判断值是否变化的等价检查
  user = signal({ name: '张三', age: 30 }, { equal: customEqual });
  
  updateUser() {
    this.user.set({ name: '张三', age: 30 });
    // 使用customEqual函数来判断是否需要更新
  }
}

// 自定义等价检查函数
function customEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  return JSON.stringify(a) === JSON.stringify(b);
}
```

## 计算信号

计算信号是基于其他信号自动派生的只读信号，当依赖信号更新时，计算信号自动重新计算。

### 1. 计算信号基础

计算信号使用`computed`函数创建，接受一个计算函数作为参数。

```text
[信号A] ─┐
         │
[信号B] ─┼─> [计算函数] ─> [计算信号C]
         │
[信号C] ─┘
```

**基本示例**：

```typescript
import { signal, computed } from '@angular/core';

// 创建基础信号
const width = signal(5);
const height = signal(10);

// 创建计算信号
const area = computed(() => width() * height());

console.log(area()); // 输出: 50

// 更新依赖信号
width.set(7);
console.log(area()); // 输出: 70
```

### 2. 计算信号的懒计算和缓存优化

计算信号具有内置的性能优化特性：

1. **懒计算** - 只在被读取时才计算
2. **缓存** - 依赖未变化时重用上次结果
3. **细粒度依赖跟踪** - 自动检测和跟踪所有依赖

```typescript
@Component({
  selector: 'app-shopping-cart',
  template: `
    <div>
      <h2>购物车</h2>
      <ul>
        <li *ngFor="let item of cartItems()">
          {{ item.name }} - ¥{{ item.price }} x {{ item.quantity }}
        </li>
      </ul>
      
      <div>总价: ¥{{ totalPrice() }}</div>
      <div>商品数量: {{ itemCount() }}</div>
      <div *ngIf="hasDiscount()">已享受折扣!</div>
      
      <button (click)="addItem()">添加商品</button>
    </div>
  `
})
export class ShoppingCartComponent {
  // 基础信号
  cartItems = signal<CartItem[]>([
    { id: 1, name: '商品A', price: 100, quantity: 2 },
    { id: 2, name: '商品B', price: 200, quantity: 1 }
  ]);
  
  discountThreshold = signal(500);
  
  // 计算信号1：总价
  totalPrice = computed(() => {
    console.log('计算总价'); // 可验证缓存优化
    return this.cartItems().reduce(
      (sum, item) => sum + item.price * item.quantity, 
      0
    );
  });
  
  // 计算信号2：商品总数量
  itemCount = computed(() => {
    return this.cartItems().reduce(
      (count, item) => count + item.quantity, 
      0
    );
  });
  
  // 计算信号3：依赖另一个计算信号
  hasDiscount = computed(() => {
    return this.totalPrice() > this.discountThreshold();
  });
  
  addItem() {
    const newItem = { 
      id: Date.now(), 
      name: '新商品', 
      price: Math.floor(Math.random() * 100) + 50,
      quantity: 1
    };
    
    this.cartItems.update(items => [...items, newItem]);
  }
}
```

### 3. 计算信号的复杂依赖关系

计算信号可以构建复杂的响应式网络，实现高级数据转换：

```typescript
@Component({
  selector: 'app-data-explorer',
  template: `
    <div>
      <div>
        <label>最小价格: </label>
        <input type="number" [value]="minPrice()" 
               (input)="setMinPrice($event)">
      </div>
      
      <div>
        <label>最大价格: </label>
        <input type="number" [value]="maxPrice()" 
               (input)="setMaxPrice($event)">
      </div>
      
      <div>
        <label>排序方式: </label>
        <select [value]="sortBy()" (change)="setSortBy($event)">
          <option value="name">名称</option>
          <option value="price">价格</option>
        </select>
      </div>
      
      <div>过滤后商品数: {{ filteredProducts().length }}</div>
      <div>价格区间: {{ priceRange() }}</div>
      
      <ul>
        <li *ngFor="let product of displayedProducts()">
          {{ product.name }} - ¥{{ product.price }}
        </li>
      </ul>
    </div>
  `
})
export class DataExplorerComponent {
  // 基础数据信号
  allProducts = signal<Product[]>([
    { id: 1, name: '产品A', price: 100, category: '电子' },
    { id: 2, name: '产品B', price: 200, category: '家居' },
    { id: 3, name: '产品C', price: 300, category: '电子' },
    { id: 4, name: '产品D', price: 150, category: '服装' },
    { id: 5, name: '产品E', price: 250, category: '服装' }
  ]);
  
  // 筛选条件信号
  minPrice = signal(0);
  maxPrice = signal(1000);
  selectedCategory = signal<string | null>(null);
  sortBy = signal<'name' | 'price'>('name');
  
  // 第一层计算: 价格过滤
  filteredByPrice = computed(() => {
    return this.allProducts().filter(product => 
      product.price >= this.minPrice() && 
      product.price <= this.maxPrice()
    );
  });
  
  // 第二层计算: 类别过滤
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    if (!category) return this.filteredByPrice();
    
    return this.filteredByPrice().filter(
      product => product.category === category
    );
  });
  
  // 第三层计算: 排序
  displayedProducts = computed(() => {
    const sorted = [...this.filteredProducts()];
    
    if (this.sortBy() === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => a.price - b.price);
    }
    
    return sorted;
  });
  
  // 附加计算信号: 价格区间描述
  priceRange = computed(() => {
    return `¥${this.minPrice()} - ¥${this.maxPrice()}`;
  });
  
  // 更新方法
  setMinPrice(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      this.minPrice.set(value);
    }
  }
  
  setMaxPrice(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      this.maxPrice.set(value);
    }
  }
  
  setSortBy(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'price';
    this.sortBy.set(value);
  }
  
  selectCategory(category: string | null) {
    this.selectedCategory.set(category);
  }
}
```

### 4. 计算信号的依赖边界

计算信号会自动追踪其计算函数内直接或间接引用的信号。

```text
├── 计算函数作用域
│   │
│   ├── signal() ───┐
│   │               │
│   ├── computedA() ┼── 这些都会被追踪为依赖
│   │               │
│   └── computedB() ┘
│
└── 计算函数外部调用的方法中的signal() ── 不会被追踪为依赖
```

**依赖追踪示例**：

```typescript
// 信号依赖边界示例
@Component({
  selector: 'app-dependency-demo',
  template: `<div>依赖边界演示</div>`
})
export class DependencyDemoComponent {
  // 基础信号
  a = signal(1);
  b = signal(2);
  c = signal(3);
  
  // ✅ 会追踪a和b作为依赖
  sum = computed(() => this.a() + this.b());
  
  // ✅ 会追踪a、b和sum作为依赖
  result = computed(() => this.sum() * this.a() * this.b());
  
  // ❌ 不会追踪c作为依赖!
  badResult = computed(() => {
    const value = this.getValueFromC();
    return this.a() + value;
  });
  
  // 外部方法中的信号读取不会被追踪
  private getValueFromC(): number {
    return this.c() * 2;
  }
  
  // ✅ 正确方式: 将所有信号读取都放在计算函数内
  goodResult = computed(() => {
    return this.a() + this.c() * 2;
  });
}
```

## 信号与组件集成

信号系统与Angular组件框架的集成，实现响应式UI。

### 1. 信号驱动的组件开发

Angular 16+支持在组件模板中直接使用信号，无需使用异步管道。

```typescript
@Component({
  selector: 'app-signal-counter',
  template: `
    <div>
      <!-- 直接在模板中使用信号 -->
      <h2>当前计数: {{ count() }}</h2>
      <button (click)="increment()">+1</button>
      <button (click)="decrement()">-1</button>
      <button (click)="reset()">重置</button>
      
      <!-- 使用计算信号 -->
      <p>计数的平方: {{ countSquared() }}</p>
      <p>状态: {{ status() }}</p>
    </div>
  `,
  // 使用OnPush变更检测策略
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalCounterComponent {
  // 基础状态信号
  count = signal(0);
  
  // 计算信号
  countSquared = computed(() => this.count() * this.count());
  status = computed(() => {
    const current = this.count();
    if (current > 0) return '正数';
    if (current < 0) return '负数';
    return '零';
  });
  
  // 信号更新方法
  increment() {
    this.count.update(c => c + 1);
  }
  
  decrement() {
    this.count.update(c => c - 1);
  }
  
  reset() {
    this.count.set(0);
  }
}
```

### 2. 信号与Angular表单集成

将信号与Angular表单功能结合使用：

```typescript
@Component({
  selector: 'app-signal-form',
  template: `
    <form (submit)="submitForm($event)">
      <div>
        <label for="name">姓名:</label>
        <input 
          id="name" 
          type="text" 
          [value]="formState().name" 
          (input)="updateName($event)"
        >
        <div *ngIf="nameErrors()">
          {{ nameErrors() }}
        </div>
      </div>
      
      <div>
        <label for="email">邮箱:</label>
        <input 
          id="email" 
          type="email" 
          [value]="formState().email" 
          (input)="updateEmail($event)"
        >
        <div *ngIf="emailErrors()">
          {{ emailErrors() }}
        </div>
      </div>
      
      <div>
        <label for="age">年龄:</label>
        <input 
          id="age" 
          type="number" 
          [value]="formState().age" 
          (input)="updateAge($event)"
        >
        <div *ngIf="ageErrors()">
          {{ ageErrors() }}
        </div>
      </div>
      
      <button type="submit" [disabled]="!isFormValid()">提交</button>
    </form>
    
    <div *ngIf="isSubmitted()">
      <h3>表单已提交!</h3>
      <pre>{{ formState() | json }}</pre>
    </div>
  `
})
export class SignalFormComponent {
  // 表单状态信号
  formState = signal({
    name: '',
    email: '',
    age: 0
  });
  
  // 提交状态
  isSubmitted = signal(false);
  
  // 表单验证 - 计算信号
  nameErrors = computed(() => {
    const name = this.formState().name;
    if (!name) return '姓名不能为空';
    if (name.length < 2) return '姓名至少需要2个字符';
    return '';
  });
  
  emailErrors = computed(() => {
    const email = this.formState().email;
    if (!email) return '邮箱不能为空';
    if (!/\S+@\S+\.\S+/.test(email)) return '邮箱格式不正确';
    return '';
  });
  
  ageErrors = computed(() => {
    const age = this.formState().age;
    if (age < 18) return '年龄必须大于或等于18';
    if (age > 120) return '年龄不能超过120';
    return '';
  });
  
  // 整体表单验证
  isFormValid = computed(() => {
    return !this.nameErrors() && !this.emailErrors() && !this.ageErrors();
  });
  
  // 更新方法
  updateName(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.formState.update(state => ({
      ...state,
      name: value
    }));
  }
  
  updateEmail(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.formState.update(state => ({
      ...state,
      email: value
    }));
  }
  
  updateAge(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.formState.update(state => ({
      ...state,
      age: isNaN(value) ? 0 : value
    }));
  }
  
  submitForm(event: Event) {
    event.preventDefault();
    if (this.isFormValid()) {
      console.log('表单提交:', this.formState());
      this.isSubmitted.set(true);
    }
  }
}
```

### 3. 信号与组件生命周期钩子

信号系统与组件生命周期集成的最佳实践：

```typescript
@Component({
  selector: 'app-lifecycle-signals',
  template: `
    <div>
      <h2>用户资料</h2>
      <div *ngIf="isLoading()">加载中...</div>
      <div *ngIf="error()">
        错误: {{ error() }}
        <button (click)="retry()">重试</button>
      </div>
      
      <div *ngIf="user()">
        <h3>{{ user()?.name }}</h3>
        <p>邮箱: {{ user()?.email }}</p>
        <p>最后更新: {{ lastUpdated() | date:'medium' }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LifecycleSignalsComponent implements OnInit, OnDestroy {
  // 状态信号
  user = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  lastUpdated = signal(new Date());
  
  // 注入服务
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    // 组件初始化时加载数据
    this.loadUserData();
    
    // 设置定时刷新
    this.refreshInterval = setInterval(() => {
      this.loadUserData();
    }, 60000); // 每分钟刷新
  }
  
  private refreshInterval: any;
  
  ngOnDestroy() {
    // 清理定时器
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  
  loadUserData() {
    // 重置状态
    this.isLoading.set(true);
    this.error.set(null);
    
    this.userService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user.set(userData);
        this.lastUpdated.set(new Date());
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || '加载用户数据失败');
        this.isLoading.set(false);
      }
    });
  }
  
  retry() {
    this.loadUserData();
  }
}
```

### 4. 信号与组件通信

信号在父子组件和服务间通信中的应用：

```text
父组件 ──[Input信号]──> 子组件
  ^                      |
  |                      |
  └───[Output事件]────────┘
```

**父子组件通信示例**：

```typescript
// 子组件
@Component({
  selector: 'app-todo-item',
  template: `
    <div class="todo-item" [class.completed]="todo().completed">
      <input type="checkbox" 
             [checked]="todo().completed"
             (change)="toggleComplete()">
      
      <span>{{ todo().text }}</span>
      
      <button (click)="deleteItem()">删除</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent {
  // 输入信号
  @Input({ required: true }) todo!: Signal<TodoItem>;
  
  // 输出事件
  @Output() complete = new EventEmitter<boolean>();
  @Output() delete = new EventEmitter<void>();
  
  toggleComplete() {
    this.complete.emit(!this.todo().completed);
  }
  
  deleteItem() {
    this.delete.emit();
  }
}

// 父组件
@Component({
  selector: 'app-todo-list',
  template: `
    <div>
      <h2>待办事项 ({{ completedCount() }}/{{ todos().length }})</h2>
      
      <div>
        <input #newTodo type="text" placeholder="添加新任务">
        <button (click)="addTodo(newTodo.value); newTodo.value=''">
          添加
        </button>
      </div>
      
      <app-todo-item
        *ngFor="let todo of todos(); let i = index"
        [todo]="toSignal(todo)"
        (complete)="updateComplete(i, $event)"
        (delete)="deleteTodo(i)">
      </app-todo-item>
    </div>
  `
})
export class TodoListComponent {
  // 列表状态
  todos = signal<TodoItem[]>([
    { id: 1, text: '学习Angular信号', completed: false },
    { id: 2, text: '完成项目文档', completed: true }
  ]);
  
  // 计算衍生状态
  completedCount = computed(() => 
    this.todos().filter(todo => todo.completed).length
  );
  
  // 创建单个Todo的信号
  toSignal(todo: TodoItem): Signal<TodoItem> {
    return computed(() => todo);
  }
  
  // 更新方法
  addTodo(text: string) {
    if (!text.trim()) return;
    
    const newTodo: TodoItem = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    
    this.todos.update(todos => [...todos, newTodo]);
  }
  
  updateComplete(index: number, completed: boolean) {
    this.todos.update(todos => 
      todos.map((todo, i) => 
        i === index ? { ...todo, completed } : todo
      )
    );
  }
  
  deleteTodo(index: number) {
    this.todos.update(todos => 
      todos.filter((_, i) => i !== index)
    );
  }
}
```

### 5. 信号驱动的服务

使用信号创建共享状态服务：

```typescript
// 信号状态服务
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // 主题信号
  private themeSignal = signal<'light' | 'dark'>('light');
  
  // 只读信号 - 对外暴露
  readonly theme: Signal<'light' | 'dark'> = this.themeSignal.asReadonly();
  
  // 派生信号 - 计算CSS类
  readonly themeClass = computed(() => `theme-${this.theme()}`);
  
  // 切换主题
  toggleTheme() {
    this.themeSignal.update(current => 
      current === 'light' ? 'dark' : 'light'
    );
    
    // 保存到本地存储
    localStorage.setItem('theme', this.theme());
  }
  
  // 直接设置主题
  setTheme(theme: 'light' | 'dark') {
    this.themeSignal.set(theme);
    localStorage.setItem('theme', theme);
  }
  
  // 初始化主题
  initTheme() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.themeSignal.set(savedTheme);
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSignal.set(prefersDark ? 'dark' : 'light');
    }
  }
}

// 使用主题服务的组件
@Component({
  selector: 'app-themed',
  template: `
    <div [class]="themeService.themeClass()">
      <h2>当前主题: {{ themeService.theme() }}</h2>
      <button (click)="themeService.toggleTheme()">
        切换到{{ themeService.theme() === 'light' ? '暗色' : '亮色' }}主题
      </button>
    </div>
  `
})
export class ThemedComponent implements OnInit {
  constructor(public themeService: ThemeService) {}
  
  ngOnInit() {
    this.themeService.initTheme();
  }
}
```

## Signal与RxJS比较

## 最佳实践与性能优化 