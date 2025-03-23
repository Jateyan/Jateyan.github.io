# 组件与模板

Angular的组件与模板系统是构建用户界面的核心，提供了声明式UI开发方式和强大的数据绑定能力。本文档详细介绍组件的生命周期、通信方式以及模板渲染机制。

## 目录

- [组件生命周期](#组件生命周期)
- [视图封装模式](#视图封装模式)
- [组件通信方式](#组件通信方式)
- [内容投影](#内容投影)
- [动态组件加载](#动态组件加载)

## 组件生命周期

待展开内容：这部分将详细介绍Angular组件的生命周期钩子、执行顺序、适用场景以及各个生命周期钩子的最佳实践。

## 视图封装模式

Angular提供了三种视图封装模式（ViewEncapsulation），用于控制组件样式的作用范围。这些模式决定了组件样式如何影响应用的其余部分，是实现组件样式隔离的关键机制。

### 封装模式概述

Angular支持的三种视图封装模式：

1. **Emulated**（默认）：模拟Shadow DOM，通过在元素上添加独特属性选择器实现样式隔离
2. **ShadowDom**：使用浏览器原生Shadow DOM API提供严格的样式隔离
3. **None**：不提供任何样式封装，组件样式全局生效

### 使用方式

在组件装饰器中指定封装模式：

```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-encapsulation-demo',
  template: `
    <div class="container">
      <h2>{{title}}</h2>
      <p>这是一个演示视图封装的组件</p>
    </div>
  `,
  styles: [`
    .container {
      border: 3px solid #ff4081;
      padding: 10px;
      margin: 10px;
      border-radius: 5px;
    }
    
    h2 {
      color: #ff4081;
    }
    
    p {
      font-size: 16px;
    }
  `],
  // 指定封装模式
  encapsulation: ViewEncapsulation.Emulated // 默认值，可以是Emulated、ShadowDom或None
})
export class EncapsulationDemoComponent {
  title = '视图封装演示';
}
```

### 各种封装模式的工作原理与应用场景

#### 1. ViewEncapsulation.Emulated (默认)

**工作原理**：
- Angular在编译时为组件中定义的样式添加独特的属性选择器
- 这些选择器确保样式只适用于组件自己的模板元素
- 模拟Shadow DOM行为，但兼容所有浏览器

**运行时生成的HTML示例**：

```html
<!-- 组件元素 -->
<app-encapsulation-demo _nghost-xya-5>
  <!-- 组件内部元素 -->
  <div class="container" _ngcontent-xya-5>
    <h2 _ngcontent-xya-5>视图封装演示</h2>
    <p _ngcontent-xya-5>这是一个演示视图封装的组件</p>
  </div>
</app-encapsulation-demo>
```

**生成的CSS**：

```css
.container[_ngcontent-xya-5] {
  border: 3px solid #ff4081;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
}

h2[_ngcontent-xya-5] {
  color: #ff4081;
}

p[_ngcontent-xya-5] {
  font-size: 16px;
}
```

**适用场景**：
- 大多数Angular应用的默认选择
- 当需要样式隔离但又要保持最大浏览器兼容性时
- 企业级应用的首选模式

#### 2. ViewEncapsulation.ShadowDom

**工作原理**：
- 使用浏览器原生Shadow DOM API
- 创建真正隔离的DOM子树
- 提供最严格的样式隔离

**适用场景**：
- 开发独立Web组件
- 需要完全样式隔离的场景
- 构建可嵌入第三方应用的微前端组件

```typescript
@Component({
  selector: 'app-shadow-dom-demo',
  template: `
    <div class="card">
      <h3>Shadow DOM封装</h3>
      <slot name="content">默认内容</slot>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      border: 2px dashed #3f51b5;
      padding: 5px;
    }
    .card {
      background: #f5f5f5;
      padding: 10px;
    }
    h3 {
      margin-top: 0;
      color: #3f51b5;
    }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ShadowDomDemoComponent {}
```

**注意事项**：
- 不是所有浏览器都支持Shadow DOM
- 使用`:host`、`:host-context`和`::slotted`选择器控制样式
- 外部样式无法穿透Shadow DOM边界（这是优势也是限制）

#### 3. ViewEncapsulation.None

**工作原理**：
- 不提供任何样式封装
- 组件样式添加到全局样式中
- 可能影响整个应用程序

```typescript
@Component({
  selector: 'app-no-encapsulation',
  template: `
    <div class="global-card">
      <h4>无封装组件</h4>
      <p>这些样式会影响整个应用</p>
    </div>
  `,
  styles: [`
    .global-card {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      padding: 15px;
      margin: 10px 0;
    }
    
    h4 {
      color: #2196f3;
      text-decoration: underline;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class NoEncapsulationComponent {}
```

**适用场景**：
- 定义全局样式主题
- 覆盖第三方库样式
- 创建全局样式组件（如一套UI组件库的基础样式）

### 混合多种封装模式

在实际应用中，通常会混合使用多种封装模式：

```typescript
// 主题组件 - 使用None封装设置全局样式
@Component({
  selector: 'app-theme',
  template: '<ng-content></ng-content>',
  styles: [`
    /* 全局颜色变量和基础样式 */
    :root {
      --primary-color: #673ab7;
      --accent-color: #ffd740;
      --warn-color: #f44336;
      --text-color: #212121;
      --background-color: #f5f5f5;
    }
    
    body {
      font-family: 'Roboto', sans-serif;
      color: var(--text-color);
      background-color: var(--background-color);
      margin: 0;
      padding: 0;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: var(--primary-color);
      color: white;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ThemeComponent {}

// 功能组件 - 使用默认Emulated封装
@Component({
  selector: 'app-feature',
  template: `
    <div class="feature-container">
      <h2>功能模块</h2>
      <div class="content">
        <ng-content></ng-content>
      </div>
      <button class="btn btn-primary">操作</button>
    </div>
  `,
  styles: [`
    .feature-container {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 16px;
    }
    
    .content {
      margin: 16px 0;
    }
    
    /* 这些样式只会应用到组件内部元素 */
    h2 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
  `]
  // 使用默认封装 ViewEncapsulation.Emulated
})
export class FeatureComponent {}

// Web组件 - 使用ShadowDom封装
@Component({
  selector: 'app-custom-element',
  template: `
    <div class="widget">
      <div class="header">
        <slot name="title">默认标题</slot>
      </div>
      <div class="body">
        <slot>默认内容</slot>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      border: 2px solid var(--primary-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .widget {
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background-color: var(--primary-color);
      color: white;
      padding: 12px;
    }
    
    .body {
      padding: 16px;
    }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class CustomElementComponent {}
```

### 视图封装的最佳实践

1. **选择合适的封装模式**：
   - 大多数组件使用默认的`Emulated`模式
   - 全局样式和主题使用`None`模式
   - 可能被第三方使用的独立组件考虑`ShadowDom`模式

2. **样式穿透**：当需要从父组件修改子组件样式时
   - 对于`Emulated`模式，使用特殊选择器：
     ```scss
     :ng-deep .child-component .element {
       color: red;
     }
     ```
   - 注意：`:ng-deep`在未来版本中可能被移除，谨慎使用

3. **宿主元素样式**：
   - 使用`:host`伪类选择器样式化组件宿主元素
     ```scss
     :host {
       display: block;
       margin: 10px;
     }
     
     :host(.active) {
       border-left: 3px solid green;
     }
     ```

4. **基于父组件条件的样式**：
   - 使用`:host-context`选择器
     ```scss
     :host-context(.theme-dark) {
       background-color: #333;
       color: white;
     }
     ```

5. **组件样式结构化**：
   - 使用BEM或其他CSS方法论组织组件内样式
   - 考虑使用SCSS/SASS嵌套规则提高可读性

6. **避免过度依赖全局样式**：
   - 尽量在组件内定义样式
   - 全局样式限制在主题和基础布局上

> **提示**：理解视图封装模式有助于构建更加模块化、可维护的组件样式系统，特别是在大型团队合作开发时。

## 组件通信方式

Angular应用由组件树组成，这些组件需要相互通信以协同工作。Angular提供多种组件间通信的方式，适用于不同的场景和关系。

### 1. 输入与输出属性（@Input/@Output）

适用于父子组件间的直接通信，是最基本的组件通信方式。

#### 输入属性 @Input

允许父组件向子组件传递数据：

```typescript
// 子组件
@Component({
  selector: 'app-child',
  template: `
    <div class="child">
      <h3>子组件</h3>
      <p>接收到的用户：{{ user?.name }}</p>
      <p>接收到的消息：{{ message }}</p>
    </div>
  `,
  styles: [`.child { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }`]
})
export class ChildComponent {
  // 基本输入属性
  @Input() message: string;
  
  // 对象类型输入属性
  @Input() user: {id: number, name: string};
  
  // 带别名的输入属性
  @Input('displayMode') mode: string;
  
  // 带默认值的输入属性
  @Input() showDetails = false;
  
  // 输入属性设置器，允许拦截和处理传入的值
  private _count = 0;
  @Input() 
  set count(value: number) {
    this._count = value;
    // 可以在这里执行额外逻辑，如验证或转换
    this.countChange.emit(this._count);
  }
  get count(): number {
    return this._count;
  }
  
  // 用于设置器示例
  @Output() countChange = new EventEmitter<number>();
}

// 父组件
@Component({
  selector: 'app-parent',
  template: `
    <div class="parent">
      <h2>父组件</h2>
      <button (click)="updateMessage()">更新消息</button>
      <button (click)="incrementCount()">增加计数</button>
      
      <app-child 
        [message]="parentMessage"
        [user]="currentUser"
        [displayMode]="'compact'"
        [showDetails]="true"
        [count]="counter"
        (countChange)="onCountChange($event)">
      </app-child>
    </div>
  `
})
export class ParentComponent {
  parentMessage = '来自父组件的消息';
  currentUser = {id: 1, name: '张三'};
  counter = 0;
  
  updateMessage() {
    this.parentMessage = `更新的消息 ${new Date().toLocaleTimeString()}`;
  }
  
  incrementCount() {
    this.counter++;
  }
  
  onCountChange(newCount: number) {
    console.log(`计数已更新为: ${newCount}`);
  }
}
```

#### 输出属性 @Output

允许子组件向父组件发送事件：

```typescript
// 子组件
@Component({
  selector: 'app-child',
  template: `
    <div>
      <h3>子组件</h3>
      <button (click)="sendNotification()">通知父组件</button>
      <button (click)="confirmAction()">确认操作</button>
      <div>
        <input [(ngModel)]="itemName" placeholder="新项名称">
        <button (click)="addNewItem()">添加项</button>
      </div>
    </div>
  `
})
export class ChildComponent {
  // 基本事件发射器
  @Output() notify = new EventEmitter<string>();
  
  // 带数据的事件发射器
  @Output() confirm = new EventEmitter<{action: string, time: Date}>();
  
  // 用于双向绑定的事件发射器(命名规则：属性名Change)
  @Input() itemName = '';
  @Output() itemNameChange = new EventEmitter<string>();
  
  // 自定义事件
  @Output() itemAdded = new EventEmitter<{name: string, id: number}>();
  
  private nextId = 1;
  
  sendNotification() {
    this.notify.emit('子组件发送的通知');
  }
  
  confirmAction() {
    this.confirm.emit({
      action: '用户确认',
      time: new Date()
    });
  }
  
  addNewItem() {
    if (this.itemName.trim()) {
      this.itemAdded.emit({
        name: this.itemName,
        id: this.nextId++
      });
      this.itemName = ''; // 清空输入
      this.itemNameChange.emit(''); // 通知父组件值已改变
    }
  }
}

// 父组件
@Component({
  selector: 'app-parent',
  template: `
    <div>
      <h2>父组件</h2>
      <p *ngIf="message">收到消息: {{ message }}</p>
      <p *ngIf="confirmationData">
        确认信息: {{ confirmationData.action }} 
        时间: {{ confirmationData.time | date:'medium' }}
      </p>
      <div>
        <h4>项列表</h4>
        <ul>
          <li *ngFor="let item of items">{{ item.name }}</li>
        </ul>
      </div>
      
      <app-child
        (notify)="onNotify($event)"
        (confirm)="onConfirm($event)"
        [(itemName)]="newItemName"
        (itemAdded)="onItemAdded($event)">
      </app-child>
      
      <p>当前输入: {{ newItemName }}</p>
    </div>
  `
})
export class ParentComponent {
  message: string;
  confirmationData: {action: string, time: Date};
  newItemName = '';
  items: {name: string, id: number}[] = [];
  
  onNotify(msg: string) {
    this.message = msg;
  }
  
  onConfirm(data: {action: string, time: Date}) {
    this.confirmationData = data;
  }
  
  onItemAdded(item: {name: string, id: number}) {
    this.items.push(item);
  }
}
```

#### 双向绑定 [(ngModel)]

使用[(ngModel)]实现双向绑定需要：
1. 导入FormsModule
2. 创建@Input属性
3. 创建同名+Change的@Output属性

```typescript
// 自定义双向绑定组件
@Component({
  selector: 'app-counter',
  template: `
    <div>
      <button (click)="decrement()">-</button>
      <span>{{ value }}</span>
      <button (click)="increment()">+</button>
    </div>
  `
})
export class CounterComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
  
  increment() {
    this.value++;
    this.valueChange.emit(this.value);
  }
  
  decrement() {
    if (this.value > 0) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }
}

// 使用组件
@Component({
  template: `
    <app-counter [(value)]="counterValue"></app-counter>
    <p>当前值: {{ counterValue }}</p>
  `
})
export class AppComponent {
  counterValue = 5;
}
```

### 2. 通过服务进行组件通信

适用于任意组件间通信，特别是非父子关系的组件。

#### 基本服务通信

```typescript
// 共享服务
@Injectable({
  providedIn: 'root' // 单例服务
})
export class SharedDataService {
  private message = new BehaviorSubject<string>('初始消息');
  
  // 公开的Observable，组件可以订阅
  currentMessage$ = this.message.asObservable();
  
  // 更新消息的方法
  updateMessage(newMessage: string) {
    this.message.next(newMessage);
  }
}

// 发送组件
@Component({
  selector: 'app-sender',
  template: `
    <div>
      <h3>发送组件</h3>
      <input [(ngModel)]="messageText" placeholder="输入消息">
      <button (click)="sendMessage()">发送</button>
    </div>
  `
})
export class SenderComponent {
  messageText = '';
  
  constructor(private dataService: SharedDataService) {}
  
  sendMessage() {
    if (this.messageText.trim()) {
      this.dataService.updateMessage(this.messageText);
      this.messageText = '';
    }
  }
}

// 接收组件
@Component({
  selector: 'app-receiver',
  template: `
    <div>
      <h3>接收组件</h3>
      <p *ngIf="message">收到消息: {{ message }}</p>
    </div>
  `
})
export class ReceiverComponent implements OnInit, OnDestroy {
  message: string;
  private subscription: Subscription;
  
  constructor(private dataService: SharedDataService) {}
  
  ngOnInit() {
    // 订阅消息变化
    this.subscription = this.dataService.currentMessage$.subscribe(
      msg => this.message = msg
    );
  }
  
  ngOnDestroy() {
    // 组件销毁时取消订阅，避免内存泄漏
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

#### 使用RxJS Subject变体

不同的Subject适用于不同场景：

```typescript
@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  // 普通Subject：不保留当前值，新订阅者不会收到以前的值
  private simpleSubject = new Subject<string>();
  simple$ = this.simpleSubject.asObservable();
  
  // BehaviorSubject：保留最新值，新订阅者会立即收到最新值
  private behaviorSubject = new BehaviorSubject<string>('初始值');
  behavior$ = this.behaviorSubject.asObservable();
  
  // ReplaySubject：保留指定数量的历史值，新订阅者会收到这些历史值
  private replaySubject = new ReplaySubject<string>(3); // 保留最近3个值
  replay$ = this.replaySubject.asObservable();
  
  // AsyncSubject：只在完成时发出最后一个值
  private asyncSubject = new AsyncSubject<string>();
  async$ = this.asyncSubject.asObservable();
  
  // 各种发送方法
  sendSimple(msg: string) {
    this.simpleSubject.next(msg);
  }
  
  sendBehavior(msg: string) {
    this.behaviorSubject.next(msg);
  }
  
  sendReplay(msg: string) {
    this.replaySubject.next(msg);
  }
  
  sendAsync(msg: string) {
    this.asyncSubject.next(msg);
  }
  
  completeAsync() {
    // AsyncSubject需要调用complete()才会发送最后一个值
    this.asyncSubject.complete();
  }
}
```

#### 状态管理服务

对于复杂应用，可以创建专门的状态管理服务：

```typescript
// 用户状态服务
@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  // 状态定义
  private readonly state = new BehaviorSubject<{
    user: User | null;
    isAuthenticated: boolean;
    permissions: string[];
    preferences: UserPreferences;
    lastActivity: Date;
  }>({
    user: null,
    isAuthenticated: false,
    permissions: [],
    preferences: { theme: 'light', language: 'zh' },
    lastActivity: new Date()
  });
  
  // 公开的可观察状态
  readonly state$ = this.state.asObservable();
  
  // 派生状态
  readonly user$ = this.state$.pipe(map(state => state.user));
  readonly isAuthenticated$ = this.state$.pipe(map(state => state.isAuthenticated));
  readonly permissions$ = this.state$.pipe(map(state => state.permissions));
  readonly theme$ = this.state$.pipe(map(state => state.preferences.theme));
  
  // 更新状态的方法
  login(user: User, token: string) {
    const currentState = this.state.getValue();
    
    // 确保不直接修改当前状态对象 - 保持不可变性
    this.state.next({
      ...currentState,
      user,
      isAuthenticated: true,
      lastActivity: new Date()
    });
    
    // 存储令牌等额外操作...
  }
  
  logout() {
    const currentState = this.state.getValue();
    this.state.next({
      ...currentState,
      user: null,
      isAuthenticated: false,
      permissions: [],
      lastActivity: new Date()
    });
    
    // 清除令牌等额外操作...
  }
  
  updatePreferences(newPreferences: Partial<UserPreferences>) {
    const currentState = this.state.getValue();
    this.state.next({
      ...currentState,
      preferences: {
        ...currentState.preferences,
        ...newPreferences
      },
      lastActivity: new Date()
    });
  }
}

// 接口定义
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
}
```

### 3. 路由参数通信

使用路由参数在页面间传递数据：

```typescript
// 发送页面
@Component({
  template: `
    <h2>产品列表</h2>
    <ul>
      <li *ngFor="let product of products">
        <a [routerLink]="['/products', product.id]" 
           [queryParams]="{category: product.category}">
          {{ product.name }}
        </a>
      </li>
    </ul>
    
    <button (click)="navigateProgram()">编程式导航</button>
  `
})
export class ProductListComponent {
  products = [
    { id: 1, name: '产品A', category: '电子产品' },
    { id: 2, name: '产品B', category: '家居' }
  ];
  
  constructor(private router: Router) {}
  
  navigateProgram() {
    // 编程式导航，传递参数
    this.router.navigate(
      ['/products', 3],
      { 
        queryParams: { category: '服装' },
        fragment: 'details',
        state: { data: '额外数据' } // 使用History API存储数据
      }
    );
  }
}

// 接收页面
@Component({
  template: `
    <h2>产品详情</h2>
    <div *ngIf="product">
      <p>ID: {{ product.id }}</p>
      <p>分类: {{ category }}</p>
      <p>片段: {{ fragment }}</p>
    </div>
    <button (click)="goBack()">返回</button>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any;
  category: string;
  fragment: string;
  extraData: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}
  
  ngOnInit() {
    // 方法1：使用快照（仅获取初始值）
    const id = this.route.snapshot.paramMap.get('id');
    
    // 方法2：订阅参数变化（响应式，当参数变化时会更新）
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      // 模拟获取产品数据
      this.product = { id };
    });
    
    // 获取查询参数
    this.route.queryParamMap.subscribe(queryParams => {
      this.category = queryParams.get('category');
    });
    
    // 获取URL片段
    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
    });
    
    // 获取History状态
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.extraData = navigation.extras.state['data'];
    }
  }
  
  goBack() {
    this.location.back();
  }
}

// 路由配置
const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent }
];
```

### 4. @ViewChild与@ContentChild

用于父组件直接访问子组件或内容投影元素：

```typescript
// 子组件
@Component({
  selector: 'app-child',
  template: `<p>子组件</p>`
})
export class ChildComponent {
  message = '子组件的消息';
  
  showMessage() {
    console.log(`显示消息: ${this.message}`);
    return this.message;
  }
}

// 父组件
@Component({
  selector: 'app-parent',
  template: `
    <div>
      <h2>父组件</h2>
      <button (click)="accessChildMethod()">调用子组件方法</button>
      <app-child #child1></app-child>
      <app-child></app-child>
    </div>
  `
})
export class ParentComponent implements AfterViewInit {
  // 通过模板变量引用
  @ViewChild('child1') child1: ChildComponent;
  
  // 通过组件类型引用第一个匹配的子组件
  @ViewChild(ChildComponent) childComp: ChildComponent;
  
  // 引用所有匹配的子组件
  @ViewChildren(ChildComponent) allChildren: QueryList<ChildComponent>;
  
  ngAfterViewInit() {
    // 视图初始化后，子组件引用可用
    console.log('子组件消息:', this.childComp.message);
    
    // 遍历所有子组件
    this.allChildren.forEach((child, index) => {
      console.log(`子组件 ${index}:`, child.message);
    });
    
    // 监听子组件变化
    this.allChildren.changes.subscribe(children => {
      console.log('子组件列表已更新', children);
    });
  }
  
  accessChildMethod() {
    const message = this.childComp.showMessage();
    alert(`从子组件获取消息: ${message}`);
  }
}
```

### 5. NgRx状态管理

对于大型应用，NgRx提供了基于Redux的完整状态管理方案：

```typescript
// 1. 定义Actions
export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// 2. 定义Reducer
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(login, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);

// 3. 定义Effects
@Injectable()
export class AuthEffects {
  login$ = createEffect(() => this.actions$.pipe(
    ofType(login),
    mergeMap(action => 
      this.authService.login(action.username, action.password).pipe(
        map(user => loginSuccess({ user })),
        catchError(error => of(loginFailure({ error: error.message })))
      )
    )
  ));
  
  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}
}

// 4. 定义Selectors
export const selectAuthState = (state: AppState) => state.auth;

export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectUser,
  user => !!user
);

// 5. 在组件中使用
@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="username" placeholder="用户名">
      <input formControlName="password" type="password" placeholder="密码">
      <button type="submit" [disabled]="loginForm.invalid || loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <div *ngIf="error" class="error">{{ error }}</div>
    </form>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading$ = this.store.select(state => state.auth.loading);
  error$ = this.store.select(state => state.auth.error);
  
  loading = false;
  error: string | null = null;
  private subscription = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  
  ngOnInit() {
    // 订阅状态变化
    this.subscription.add(
      this.loading$.subscribe(loading => this.loading = loading)
    );
    
    this.subscription.add(
      this.error$.subscribe(error => this.error = error)
    );
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.store.dispatch(login({ username, password }));
    }
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

### 6. Signal系统（Angular 16+）

Angular 16引入的Signals提供了更简单的响应式状态管理：

```typescript
// 信号服务
@Injectable({
  providedIn: 'root'
})
export class CounterSignalService {
  // 创建可写信号
  private readonly _count = signal(0);
  private readonly _history = signal<number[]>([]);
  
  // 公开只读信号
  readonly count = this._count.asReadonly();
  readonly history = this._history.asReadonly();
  
  // 创建计算信号（派生状态）
  readonly doubleCount = computed(() => this._count() * 2);
  readonly countIsEven = computed(() => this._count() % 2 === 0);
  readonly average = computed(() => {
    const history = this._history();
    return history.length ? 
      history.reduce((sum, value) => sum + value, 0) / history.length : 
      0;
  });
  
  increment() {
    // 更新信号值
    this._count.update(count => count + 1);
    this.updateHistory();
  }
  
  decrement() {
    this._count.update(count => count - 1);
    this.updateHistory();
  }
  
  reset() {
    // 设置信号值
    this._count.set(0);
    this._history.set([]);
  }
  
  private updateHistory() {
    this._history.update(history => [...history, this._count()]);
  }
}

// 使用信号的组件
@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h2>信号计数器</h2>
      <p>当前值: {{ counterService.count() }}</p>
      <p>双倍值: {{ counterService.doubleCount() }}</p>
      <p>是否偶数: {{ counterService.countIsEven() ? '是' : '否' }}</p>
      <p>平均值: {{ counterService.average() | number:'1.1-2' }}</p>
      
      <button (click)="counterService.decrement()">-</button>
      <button (click)="counterService.increment()">+</button>
      <button (click)="counterService.reset()">重置</button>
      
      <h3>历史记录</h3>
      <ul>
        <li *ngFor="let value of counterService.history()">{{ value }}</li>
      </ul>
    </div>
  `
})
export class CounterComponent {
  constructor(public counterService: CounterSignalService) {}
}
```

### 组件通信方式的选择指南

根据组件关系和数据特性选择合适的通信方式：

1. **父子组件通信**：
   - 父 → 子：首选 @Input
   - 子 → 父：首选 @Output
   - 双向绑定：使用 [(ngModel)] 语法

2. **祖先-后代组件通信**：
   - 方式一：通过中间组件层层传递（不推荐太深的层级）
   - 方式二：使用共享服务（推荐）
   - 方式三：使用依赖注入层级（如提供令牌）

3. **兄弟组件通信**：
   - 首选共享服务

4. **无关系组件通信**：
   - 服务 + RxJS Subject
   - NgRx全局状态管理
   - 路由参数（适合跨页面）

5. **根据数据性质选择**：
   - 简单、局部数据：@Input/@Output
   - 共享数据：服务
   - 应用级状态：NgRx/Signal
   - 配置数据：服务
   - 一次性通信：路由参数

> **最佳实践**：从简单开始，随着应用复杂度增加再采用更复杂的状态管理方案。小型应用通常Input/Output加上简单服务就足够了，大型企业应用可能需要NgRx这样的完整状态管理解决方案。

## 内容投影

内容投影（Content Projection）是Angular的一项强大特性，允许将父组件的内容"投影"到子组件的特定位置。这类似于传统Web开发中的"插槽"概念，极大增强了组件的可重用性和灵活性。

### 基本内容投影

最简单的内容投影使用单一的`<ng-content>`元素：

```typescript
// 卡片组件
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <div class="card-body">
        <!-- 这里是投影插槽，父组件的内容将显示在这里 -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .card-body {
      padding: 15px;
    }
  `]
})
export class CardComponent {}

// 父组件使用卡片组件
@Component({
  selector: 'app-parent',
  template: `
    <h2>基本内容投影示例</h2>
    
    <app-card>
      <!-- 这些内容将被投影到CardComponent的ng-content位置 -->
      <h3>用户资料</h3>
      <p>姓名: 张三</p>
      <p>邮箱: zhangsan@example.com</p>
    </app-card>
    
    <app-card>
      <!-- 每个卡片可以投影不同内容 -->
      <h3>订单信息</h3>
      <p>订单号: #12345</p>
      <p>金额: ¥199.00</p>
      <button>查看详情</button>
    </app-card>
  `
})
export class ParentComponent {}
```

### 多插槽投影

使用`select`属性创建多个投影插槽，按照选择器区分内容：

```typescript
// 高级卡片组件
@Component({
  selector: 'app-advanced-card',
  template: `
    <div class="card">
      <div class="card-header">
        <!-- 标题插槽 -->
        <ng-content select="[card-header]"></ng-content>
      </div>
      
      <div class="card-body">
        <!-- 主体内容插槽 -->
        <ng-content select="[card-body]"></ng-content>
      </div>
      
      <div class="card-footer">
        <!-- 底部插槽 -->
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .card-header {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
    }
    
    .card-body {
      padding: 15px;
    }
    
    .card-footer {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-top: 1px solid #ddd;
    }
  `]
})
export class AdvancedCardComponent {}

// 使用多插槽卡片
@Component({
  selector: 'app-multi-slot-demo',
  template: `
    <h2>多插槽投影示例</h2>
    
    <app-advanced-card>
      <!-- 使用card-header属性标识，内容将投影到对应插槽 -->
      <div card-header>
        <h3>产品详情</h3>
      </div>
      
      <!-- 使用card-body属性标识 -->
      <div card-body>
        <div class="product-info">
          <img src="product.jpg" alt="产品图片">
          <p><strong>智能手表 Pro</strong></p>
          <p>价格: ¥1299.00</p>
          <p>库存: 有货</p>
        </div>
      </div>
      
      <!-- 使用card-footer属性标识 -->
      <div card-footer>
        <button class="primary">加入购物车</button>
        <button class="secondary">收藏</button>
      </div>
    </app-advanced-card>
  `
})
export class MultiSlotDemoComponent {}
```

### 复杂选择器

`<ng-content>`支持多种CSS选择器来匹配内容：

```typescript
@Component({
  selector: 'app-complex-projection',
  template: `
    <div class="container">
      <!-- 按元素选择器投影 -->
      <div class="section">
        <h4>标题区域</h4>
        <ng-content select="h1, h2, h3"></ng-content>
      </div>
      
      <!-- 按CSS类选择器投影 -->
      <div class="section">
        <h4>主要内容</h4>
        <ng-content select=".main-content"></ng-content>
      </div>
      
      <!-- 按属性选择器投影 -->
      <div class="section">
        <h4>操作区域</h4>
        <ng-content select="[actions]"></ng-content>
      </div>
      
      <!-- 自定义组件选择器投影 -->
      <div class="section">
        <h4>自定义组件</h4>
        <ng-content select="app-custom-widget"></ng-content>
      </div>
      
      <!-- 默认插槽（未被其他选择器匹配的内容） -->
      <div class="section">
        <h4>其他内容</h4>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .section {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    
    h4 {
      margin-top: 0;
      color: #555;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
  `]
})
export class ComplexProjectionComponent {}

// 使用复杂投影组件
@Component({
  selector: 'app-usage-example',
  template: `
    <app-complex-projection>
      <!-- 匹配h1,h2,h3选择器 -->
      <h2>项目概述</h2>
      
      <!-- 匹配.main-content选择器 -->
      <div class="main-content">
        <p>这是项目的详细说明内容，将显示在主要内容区域。</p>
        <ul>
          <li>特性一</li>
          <li>特性二</li>
        </ul>
      </div>
      
      <!-- 匹配[actions]选择器 -->
      <div actions>
        <button>确认</button>
        <button>取消</button>
      </div>
      
      <!-- 匹配app-custom-widget选择器 -->
      <app-custom-widget></app-custom-widget>
      
      <!-- 未匹配上述任何选择器，将进入默认插槽 -->
      <p>这是额外信息，将显示在其他内容区域。</p>
    </app-complex-projection>
  `
})
export class UsageExampleComponent {}
```

### 条件投影

结合`ngIf`和`<ng-container>`实现条件内容投影：

```typescript
// 消息框组件
@Component({
  selector: 'app-message-box',
  template: `
    <div class="message-box" [ngClass]="type">
      <div class="icon" *ngIf="showIcon">
        <ng-content select="[icon]"></ng-content>
      </div>
      
      <div class="content">
        <div class="title" *ngIf="title">
          {{ title }}
        </div>
        
        <div class="body">
          <ng-content></ng-content>
        </div>
        
        <div class="actions" *ngIf="showActions">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
      
      <button class="close" *ngIf="closable" (click)="close()">×</button>
    </div>
  `,
  styles: [`
    .message-box {
      display: flex;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 16px;
    }
    
    .info { background-color: #e8f4fd; border-color: #b3e0ff; }
    .success { background-color: #e9f7ef; border-color: #b8e5c7; }
    .warning { background-color: #fef9e6; border-color: #fce5b1; }
    .error { background-color: #fce9e9; border-color: #f4b1b1; }
    
    .icon {
      margin-right: 12px;
      display: flex;
      align-items: center;
    }
    
    .content {
      flex: 1;
    }
    
    .title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .actions {
      margin-top: 12px;
    }
    
    .close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
    }
  `]
})
export class MessageBoxComponent {
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() title: string;
  @Input() message: string;
  @Input() showIcon = true;
  @Input() closable = false;
  @Output() closed = new EventEmitter<void>();
  
  close() {
    this.closed.emit();
  }
}

// 使用条件投影
@Component({
  selector: 'app-message-demo',
  template: `
    <app-message-box 
      type="success" 
      title="操作成功" 
      [closable]="true"
      (closed)="onMessageClosed()">
      <ng-container icon>
        <i class="fas fa-check-circle"></i>
      </ng-container>
      
      <p>数据已成功保存到系统。</p>
    </app-message-box>
    
    <app-message-box 
      type="warning" 
      title="验证警告" 
      [showActions]="true">
      <ng-container icon>
        <i class="fas fa-exclamation-triangle"></i>
      </ng-container>
      
      <p>您的账户还未验证，部分功能可能无法使用。</p>
      
      <div actions>
        <button>立即验证</button>
        <button>稍后提醒</button>
      </div>
    </app-message-box>
  `
})
export class MessageDemoComponent {
  onMessageClosed() {
    console.log('消息已关闭');
  }
}
```

### 投影内容的访问与操作

使用`@ContentChild`和`@ContentChildren`访问投影内容：

```typescript
// 标签组件
@Component({
  selector: 'app-tab-panel',
  template: `
    <div class="tab">
      <ng-content></ng-content>
    </div>
  `
})
export class TabPanelComponent {
  @Input() title: string;
  @Input() active = false;
}

// 标签容器组件
@Component({
  selector: 'app-tabs',
  template: `
    <div class="tabs-container">
      <div class="tabs-header">
        <div 
          *ngFor="let tab of tabs" 
          class="tab-title" 
          [class.active]="tab.active"
          (click)="selectTab(tab)">
          {{ tab.title }}
        </div>
      </div>
      
      <div class="tabs-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tabs-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .tabs-header {
      display: flex;
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }
    
    .tab-title {
      padding: 10px 15px;
      cursor: pointer;
    }
    
    .tab-title.active {
      background-color: white;
      border-bottom: 2px solid #1976d2;
      font-weight: bold;
    }
    
    .tabs-body {
      padding: 15px;
    }
  `]
})
export class TabsComponent implements AfterContentInit {
  // 查询投影内容中的所有TabPanelComponent实例
  @ContentChildren(TabPanelComponent) tabPanels: QueryList<TabPanelComponent>;
  
  // 跟踪所有标签
  tabs: TabPanelComponent[] = [];
  
  ngAfterContentInit() {
    // 初始化标签
    this.tabs = this.tabPanels.toArray();
    
    // 设置默认激活标签
    if (this.tabs.length && !this.tabs.find(tab => tab.active)) {
      setTimeout(() => {
        this.tabs[0].active = true;
      });
    }
    
    // 监听标签列表变化
    this.tabPanels.changes.subscribe(() => {
      this.tabs = this.tabPanels.toArray();
    });
  }
  
  selectTab(selectedTab: TabPanelComponent) {
    // 更新标签状态
    this.tabs.forEach(tab => {
      tab.active = (tab === selectedTab);
    });
  }
}

// 使用标签组件
@Component({
  selector: 'app-tabs-demo',
  template: `
    <h2>标签页示例</h2>
    
    <app-tabs>
      <app-tab-panel title="个人资料">
        <h3>个人资料</h3>
        <form>
          <div>
            <label>姓名:</label>
            <input type="text" value="张三">
          </div>
          <div>
            <label>邮箱:</label>
            <input type="email" value="zhangsan@example.com">
          </div>
        </form>
      </app-tab-panel>
      
      <app-tab-panel title="账户设置">
        <h3>账户设置</h3>
        <ul>
          <li>更改密码</li>
          <li>两步验证</li>
          <li>关联账号</li>
        </ul>
      </app-tab-panel>
      
      <app-tab-panel title="通知" [active]="true">
        <h3>通知设置</h3>
        <div>
          <label>
            <input type="checkbox" checked> 电子邮件通知
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox"> 短信通知
          </label>
        </div>
      </app-tab-panel>
    </app-tabs>
  `
})
export class TabsDemoComponent {}
```

### 使用ng-template进行投影

`<ng-template>`提供了更强大的内容投影功能，特别是针对需要动态渲染的内容：

```typescript
// 使用ng-template的列表组件
@Component({
  selector: 'app-data-list',
  template: `
    <div class="list-container">
      <ng-container *ngIf="items && items.length; else noItems">
        <div class="list-header" *ngIf="headerTemplate">
          <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
        </div>
        
        <div class="list-body">
          <div class="list-item" *ngFor="let item of items; let i = index">
            <!-- 使用指定的模板渲染每一项 -->
            <ng-container 
              *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}">
            </ng-container>
          </div>
        </div>
        
        <div class="list-footer" *ngIf="footerTemplate">
          <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
        </div>
      </ng-container>
    </div>
    
    <!-- 空数据模板 -->
    <ng-template #noItems>
      <div class="empty-state">
        <ng-container *ngIf="emptyTemplate; else defaultEmpty">
          <ng-container *ngTemplateOutlet="emptyTemplate"></ng-container>
        </ng-container>
      </div>
    </ng-template>
    
    <!-- 默认空状态 -->
    <ng-template #defaultEmpty>
      <div class="default-empty">
        <i class="icon-empty"></i>
        <p>没有数据</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .list-container {
      border: 1px solid #eee;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .list-header {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .list-body {
      padding: 0;
    }
    
    .list-item {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .list-item:last-child {
      border-bottom: none;
    }
    
    .list-footer {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-top: 1px solid #eee;
    }
    
    .empty-state {
      padding: 30px;
      text-align: center;
      color: #999;
    }
    
    .default-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 0;
    }
    
    .icon-empty {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 10px;
    }
  `]
})
export class DataListComponent {
  @Input() items: any[] = [];
  
  // 通过ContentChild获取各种模板引用
  @ContentChild('header') headerTemplate: TemplateRef<any>;
  @ContentChild('item') itemTemplate: TemplateRef<any>;
  @ContentChild('footer') footerTemplate: TemplateRef<any>;
  @ContentChild('empty') emptyTemplate: TemplateRef<any>;
}

// 使用模板投影的列表
@Component({
  selector: 'app-template-demo',
  template: `
    <h2>模板投影示例</h2>
    
    <!-- 有数据的列表 -->
    <app-data-list [items]="users">
      <!-- 定义头部模板 -->
      <ng-template #header>
        <div class="header-content">
          <h3>用户列表</h3>
          <button>添加用户</button>
        </div>
      </ng-template>
      
      <!-- 定义每项的模板 -->
      <ng-template #item let-user let-i="index">
        <div class="user-item">
          <div class="avatar">{{ user.name.charAt(0) }}</div>
          <div class="user-info">
            <h4>{{ user.name }} <small>(#{{ i + 1 }})</small></h4>
            <p>{{ user.email }}</p>
          </div>
          <div class="user-actions">
            <button>编辑</button>
            <button>删除</button>
          </div>
        </div>
      </ng-template>
      
      <!-- 定义底部模板 -->
      <ng-template #footer>
        <div class="footer-content">
          <span>显示 {{ users.length }} 个用户</span>
          <div class="pagination">
            <button>上一页</button>
            <span>第 1 页</span>
            <button>下一页</button>
          </div>
        </div>
      </ng-template>
    </app-data-list>
    
    <!-- 空数据的列表 -->
    <app-data-list [items]="[]">
      <!-- 自定义空状态模板 -->
      <ng-template #empty>
        <div class="custom-empty">
          <img src="empty-box.svg" alt="Empty box">
          <h4>暂无数据</h4>
          <p>您可以点击下方按钮添加新数据</p>
          <button class="add-btn">添加数据</button>
        </div>
      </ng-template>
    </app-data-list>
  `,
  styles: [`
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .user-item {
      display: flex;
      align-items: center;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
    }
    
    .user-info {
      flex: 1;
    }
    
    .user-actions {
      display: flex;
      gap: 8px;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .pagination {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .custom-empty {
      padding: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .custom-empty img {
      width: 100px;
      margin-bottom: 15px;
    }
    
    .add-btn {
      margin-top: 15px;
      padding: 8px 16px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class TemplateDemoComponent {
  users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
    { id: 3, name: '王五', email: 'wangwu@example.com' }
  ];
}
```

### 投影内容的生命周期

投影内容有自己的生命周期，了解这些可以避免常见陷阱：

1. **初始化顺序**：
   - 父组件先初始化
   - 然后初始化投影内容
   - 最后初始化子组件自身

2. **变更检测**：
   - 投影内容的变更检测属于父组件的职责
   - 子组件的OnPush策略不会阻止投影内容的更新

3. **AfterContent钩子**：
   - 使用`ngAfterContentInit`和`ngAfterContentChecked`处理投影内容
   - 在这些钩子中可以安全访问`@ContentChild`和`@ContentChildren`

```typescript
@Component({
  selector: 'app-lifecycle-demo',
  template: `
    <div class="container">
      <h3>生命周期演示</h3>
      <div class="content-area">
        <ng-content></ng-content>
      </div>
      <p>子组件内部消息: {{ message }}</p>
    </div>
  `
})
export class LifecycleDemoComponent implements 
  OnInit, AfterContentInit, AfterContentChecked, AfterViewInit {
  
  @ContentChild('projectedContent') projectedContent: ElementRef;
  message = '';
  
  constructor() {
    console.log('1. 子组件构造函数');
  }
  
  ngOnInit() {
    console.log('2. 子组件ngOnInit');
    console.log('   projected content 在这里可访问吗?', this.projectedContent);
  }
  
  ngAfterContentInit() {
    console.log('3. 子组件ngAfterContentInit - 投影内容已初始化');
    console.log('   projected content 现在可访问:', this.projectedContent);
    
    if (this.projectedContent) {
      // 安全地访问投影内容
      this.message = '成功访问投影内容!';
    }
  }
  
  ngAfterContentChecked() {
    console.log('4. 子组件ngAfterContentChecked - 投影内容已检查');
  }
  
  ngAfterViewInit() {
    console.log('5. 子组件ngAfterViewInit - 视图已初始化');
  }
}

// 使用演示
@Component({
  selector: 'app-parent-demo',
  template: `
    <h2>投影生命周期演示</h2>
    
    <app-lifecycle-demo>
      <div #projectedContent>
        <p>这是投影的内容</p>
        <button (click)="updateContent()">更新内容</button>
      </div>
    </app-lifecycle-demo>
  `
})
export class ParentDemoComponent implements OnInit {
  constructor() {
    console.log('父组件构造函数');
  }
  
  ngOnInit() {
    console.log('父组件ngOnInit');
  }
  
  updateContent() {
    console.log('父组件触发内容更新');
  }
}
```

### 投影内容的最佳实践

1. **结构清晰**：
   - 明确定义每个插槽的职责
   - 对插槽使用有意义的名称
   - 保持插槽层次不要过深

2. **默认内容**：
   - 为插槽提供合理的默认内容
   ```html
   <ng-content select="[header]">
     <ng-container *ngIf="!headerProjected">
       <h3>默认标题</h3>
     </ng-container>
   </ng-content>
   ```

3. **适当的封装**：
   - 不要过度依赖内容投影
   - 平衡灵活性和易用性

4. **组合模式**：
   - 使用内容投影实现组合模式，而非继承
   - 构建可组合的小型组件

5. **性能考虑**：
   - 投影大量内容时注意性能
   - 考虑使用虚拟滚动等优化技术

> **提示**：内容投影是构建灵活、可重用组件的关键技术，尤其适合开发组件库和复杂UI框架。深入理解投影机制可以编写出更具表现力和适应性的组件。

## 动态组件加载

动态组件加载是在运行时动态创建和渲染组件的技术，适用于构建灵活的UI，如模态框、弹出提示、动态表单等。Angular提供多种方式实现动态组件加载，从简单的条件渲染到完全程序化的组件创建。

### 1. 基本动态组件加载

使用`ComponentFactoryResolver`和`ViewContainerRef`动态创建组件：

```typescript
// 要动态加载的组件
@Component({
  selector: 'app-alert',
  template: `
    <div class="alert" [class]="alertType">
      <div class="alert-icon" *ngIf="showIcon">
        <i [class]="iconClass"></i>
      </div>
      <div class="alert-content">
        <div class="alert-title" *ngIf="title">{{ title }}</div>
        <div class="alert-message">{{ message }}</div>
      </div>
      <button class="alert-close" *ngIf="closable" (click)="close()">×</button>
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      align-items: flex-start;
    }
    
    .success { background-color: #f0f9eb; color: #67c23a; }
    .warning { background-color: #fdf6ec; color: #e6a23c; }
    .error { background-color: #fef0f0; color: #f56c6c; }
    .info { background-color: #f4f4f5; color: #909399; }
    
    .alert-icon {
      margin-right: 10px;
      font-size: 16px;
    }
    
    .alert-content {
      flex: 1;
    }
    
    .alert-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .alert-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.7;
    }
  `]
})
export class AlertComponent {
  @Input() alertType: 'success' | 'warning' | 'error' | 'info' = 'info';
  @Input() title: string;
  @Input() message: string;
  @Input() showIcon = true;
  @Input() closable = true;
  @Output() closed = new EventEmitter<void>();
  
  get iconClass(): string {
    switch(this.alertType) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      case 'info': 
      default: return 'fas fa-info-circle';
    }
  }
  
  close() {
    this.closed.emit();
  }
}

// 动态组件宿主服务
@Injectable({
  providedIn: 'root'
})
export class DynamicComponentService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector
  ) {}
  
  // 在指定容器内创建组件
  createComponent<T>(
    componentType: Type<T>,
    container: ViewContainerRef,
    inputs?: {[key: string]: any},
    outputs?: {[key: string]: (event: any) => void}
  ): ComponentRef<T> {
    // 清空容器
    container.clear();
    
    // 创建组件工厂
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(componentType);
    
    // 创建组件
    const componentRef = container.createComponent(componentFactory);
    
    // 设置输入属性
    if (inputs) {
      Object.keys(inputs).forEach(key => {
        componentRef.instance[key] = inputs[key];
      });
    }
    
    // 设置输出事件
    if (outputs) {
      Object.keys(outputs).forEach(key => {
        if (componentRef.instance[key] instanceof EventEmitter) {
          (componentRef.instance[key] as EventEmitter<any>)
            .subscribe(outputs[key]);
        }
      });
    }
    
    return componentRef;
  }
  
  // 在DOM中创建组件（不需要预先定义的容器）
  appendToDOM<T>(
    componentType: Type<T>,
    inputs?: {[key: string]: any},
    outputs?: {[key: string]: (event: any) => void}
  ): {
    componentRef: ComponentRef<T>,
    hostElement: HTMLElement
  } {
    // 创建组件工厂
    const componentFactory = this.componentFactoryResolver
      .resolveComponentFactory(componentType);
    
    // 创建组件
    const componentRef = componentFactory.create(this.injector);
    
    // 设置输入属性
    if (inputs) {
      Object.keys(inputs).forEach(key => {
        componentRef.instance[key] = inputs[key];
      });
    }
    
    // 设置输出事件
    if (outputs) {
      Object.keys(outputs).forEach(key => {
        if (componentRef.instance[key] instanceof EventEmitter) {
          (componentRef.instance[key] as EventEmitter<any>)
            .subscribe(outputs[key]);
        }
      });
    }
    
    // 创建宿主元素
    const hostElement = document.createElement('div');
    hostElement.appendChild(componentRef.location.nativeElement);
    document.body.appendChild(hostElement);
    
    // 将组件附加到应用程序
    this.applicationRef.attachView(componentRef.hostView);
    
    return {
      componentRef,
      hostElement
    };
  }
  
  // 销毁附加到DOM的组件
  destroyComponent<T>(ref: {
    componentRef: ComponentRef<T>,
    hostElement: HTMLElement
  }) {
    if (ref) {
      // 从应用程序中分离视图
      this.applicationRef.detachView(ref.componentRef.hostView);
      // 销毁组件
      ref.componentRef.destroy();
      // 移除宿主元素
      if (ref.hostElement.parentNode) {
        ref.hostElement.parentNode.removeChild(ref.hostElement);
      }
    }
  }
}

// 使用动态组件的宿主组件
@Component({
  selector: 'app-dynamic-component-demo',
  template: `
    <div class="demo-container">
      <h2>动态组件加载演示</h2>
      
      <div class="control-panel">
        <button (click)="createSuccessAlert()">显示成功提示</button>
        <button (click)="createWarningAlert()">显示警告提示</button>
        <button (click)="createErrorAlert()">显示错误提示</button>
      </div>
      
      <div class="alerts-container">
        <h3>在预定义容器中创建</h3>
        <div class="container">
          <!-- 组件将被动态加载到这里 -->
          <ng-template #alertContainer></ng-template>
        </div>
      </div>
      
      <div class="global-alerts">
        <h3>全局提示 (附加到DOM)</h3>
        <button (click)="createGlobalAlert()">创建全局提示</button>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .control-panel {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    
    .container {
      min-height: 100px;
      border: 1px dashed #ccc;
      padding: 10px;
      margin-bottom: 20px;
    }
  `]
})
export class DynamicComponentDemoComponent {
  @ViewChild('alertContainer', { read: ViewContainerRef }) 
  alertContainer: ViewContainerRef;
  
  private globalAlertRef: any;
  
  constructor(private dynamicComponentService: DynamicComponentService) {}
  
  createSuccessAlert() {
    this.dynamicComponentService.createComponent(
      AlertComponent,
      this.alertContainer,
      {
        alertType: 'success',
        title: '操作成功',
        message: '您的数据已成功保存。',
        showIcon: true,
        closable: true
      },
      {
        closed: () => {
          console.log('成功提示已关闭');
          this.alertContainer.clear();
        }
      }
    );
  }
  
  createWarningAlert() {
    this.dynamicComponentService.createComponent(
      AlertComponent,
      this.alertContainer,
      {
        alertType: 'warning',
        title: '注意',
        message: '此操作可能需要一段时间完成。',
        showIcon: true,
        closable: true
      },
      {
        closed: () => {
          console.log('警告提示已关闭');
          this.alertContainer.clear();
        }
      }
    );
  }
  
  createErrorAlert() {
    this.dynamicComponentService.createComponent(
      AlertComponent,
      this.alertContainer,
      {
        alertType: 'error',
        title: '出错了',
        message: '无法连接到服务器，请稍后重试。',
        showIcon: true,
        closable: true
      },
      {
        closed: () => {
          console.log('错误提示已关闭');
          this.alertContainer.clear();
        }
      }
    );
  }
  
  createGlobalAlert() {
    // 销毁之前的全局提示
    if (this.globalAlertRef) {
      this.dynamicComponentService.destroyComponent(this.globalAlertRef);
    }
    
    // 创建新的全局提示
    this.globalAlertRef = this.dynamicComponentService.appendToDOM(
      AlertComponent,
      {
        alertType: 'info',
        title: '全局提示',
        message: '这是一个全局提示，直接附加到DOM。',
        showIcon: true,
        closable: true
      },
      {
        closed: () => {
          console.log('全局提示已关闭');
          this.dynamicComponentService.destroyComponent(this.globalAlertRef);
          this.globalAlertRef = null;
        }
      }
    );
  }
  
  ngOnDestroy() {
    // 组件销毁时清理全局提示
    if (this.globalAlertRef) {
      this.dynamicComponentService.destroyComponent(this.globalAlertRef);
    }
  }
}
```

### 2. Angular 13+ 简化API

从Angular 13开始，动态组件创建API得到了简化：

```typescript
@Component({
  selector: 'app-modern-dynamic-demo',
  template: `
    <div class="demo-container">
      <h2>现代API动态组件演示</h2>
      <button (click)="createComponent()">创建组件</button>
      <div class="container">
        <ng-template #container></ng-template>
      </div>
    </div>
  `
})
export class ModernDynamicDemoComponent {
  @ViewChild('container', { read: ViewContainerRef }) 
  container: ViewContainerRef;
  
  createComponent() {
    // 清空容器
    this.container.clear();
    
    // 使用简化API创建组件
    const componentRef = this.container.createComponent(AlertComponent);
    
    // 设置输入属性
    componentRef.setInput('alertType', 'success');
    componentRef.setInput('title', '现代API示例');
    componentRef.setInput('message', '使用Angular 13+的简化API创建');
    
    // 监听输出事件
    componentRef.instance.closed.subscribe(() => {
      console.log('警告关闭');
      this.container.clear();
    });
    
    // 触发变更检测
    componentRef.changeDetectorRef.detectChanges();
  }
}
```

### 3. 使用ng-template和ngComponentOutlet

对于简单场景，使用`ngComponentOutlet`指令可以更方便地加载动态组件：

```typescript
@Component({
  selector: 'app-component-outlet-demo',
  template: `
    <div class="outlet-demo">
      <h2>ngComponentOutlet示例</h2>
      
      <div class="control-panel">
        <button (click)="component = components.alert">显示提示</button>
        <button (click)="component = components.card">显示卡片</button>
        <button (click)="component = null">清除</button>
      </div>
      
      <div class="component-container">
        <!-- 使用ngComponentOutlet加载动态组件 -->
        <ng-container *ngComponentOutlet="component"></ng-container>
      </div>
      
      <h3>带上下文的组件</h3>
      <div class="context-container" *ngFor="let item of items">
        <!-- 使用ngComponentOutlet和注入器加载组件 -->
        <ng-container 
          *ngComponentOutlet="components.card; 
                              injector: createInjector(item)">
        </ng-container>
      </div>
    </div>
  `
})
export class ComponentOutletDemoComponent {
  // 可用的组件类型
  components = {
    alert: AlertComponent,
    card: CardComponent
  };
  
  // 当前显示的组件
  component: Type<any> | null = null;
  
  // 模拟数据
  items = [
    { title: '项目一', content: '这是第一个项目的内容' },
    { title: '项目二', content: '这是第二个项目的内容' }
  ];
  
  constructor(private injector: Injector) {}
  
  // 创建自定义注入器传递数据给动态组件
  createInjector(data: any): Injector {
    return Injector.create({
      providers: [
        { provide: 'itemData', useValue: data }
      ],
      parent: this.injector
    });
  }
}

// 接收注入数据的卡片组件
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <div class="card-header">{{ data?.title || '默认标题' }}</div>
      <div class="card-body">{{ data?.content || '默认内容' }}</div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
      overflow: hidden;
    }
    
    .card-header {
      background-color: #f5f5f5;
      padding: 10px;
      font-weight: bold;
      border-bottom: 1px solid #ddd;
    }
    
    .card-body {
      padding: 15px;
    }
  `]
})
export class CardComponent {
  data: any;
  
  constructor(@Optional() @Inject('itemData') data: any) {
    this.data = data;
  }
}
```

### 4. 创建模态对话框服务

动态组件的一个常见用例是创建模态对话框服务：

```typescript
// 模态对话框组件
@Component({
  selector: 'app-modal',
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-container" [ngClass]="size">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button *ngIf="showClose" class="modal-close" (click)="close()">×</button>
        </div>
        
        <div class="modal-body">
          <ng-container *ngIf="contentTemplate"
                       [ngTemplateOutlet]="contentTemplate"
                       [ngTemplateOutletContext]="contentContext">
          </ng-container>
          
          <ng-container *ngIf="contentComponent"
                       [ngComponentOutlet]="contentComponent"
                       [ngComponentOutletInjector]="contentInjector">
          </ng-container>
          
          <div *ngIf="!contentTemplate && !contentComponent">{{ message }}</div>
        </div>
        
        <div class="modal-footer" *ngIf="showFooter">
          <button *ngIf="showCancel" 
                  class="btn btn-secondary" 
                  (click)="cancel()">{{ cancelText }}</button>
          <button class="btn btn-primary" 
                  (click)="confirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
    
    .modal-container {
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 500px;
      max-width: 90%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .modal-container.small { width: 300px; }
    .modal-container.large { width: 800px; }
    .modal-container.fullscreen { width: 95%; height: 95vh; }
    
    .modal-header {
      padding: 15px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-title {
      margin: 0;
      font-size: 18px;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.7;
    }
    
    .modal-body {
      padding: 15px;
      overflow-y: auto;
      flex: 1;
    }
    
    .modal-footer {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: #1976d2;
      color: white;
    }
    
    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
    }
  `]
})
export class ModalComponent {
  // 基本属性
  @Input() title = '对话框';
  @Input() message = '';
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  
  // 按钮控制
  @Input() showClose = true;
  @Input() showFooter = true;
  @Input() showCancel = true;
  @Input() confirmText = '确定';
  @Input() cancelText = '取消';
  @Input() closeOnBackdrop = true;
  
  // 动态内容
  @Input() contentTemplate: TemplateRef<any>;
  @Input() contentContext: any = {};
  @Input() contentComponent: Type<any>;
  @Input() contentInjector: Injector;
  
  // 事件
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  
  // 方法
  confirm() {
    this.confirmed.emit();
  }
  
  cancel() {
    this.canceled.emit();
  }
  
  close() {
    this.closed.emit();
  }
  
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && this.closeOnBackdrop) {
      this.close();
    }
  }
}

// 模态对话框服务
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalComponentRef: ComponentRef<ModalComponent> | null = null;
  
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}
  
  // 打开基本对话框
  open(options: {
    title?: string;
    message?: string;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    showClose?: boolean;
    showFooter?: boolean;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
    closeOnBackdrop?: boolean;
  } = {}): Observable<boolean> {
    return this.createModal(options);
  }
  
  // 打开确认对话框
  confirm(options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Observable<boolean> {
    return this.createModal({
      title: options.title || '确认',
      message: options.message,
      size: 'small',
      confirmText: options.confirmText || '确认',
      cancelText: options.cancelText || '取消'
    });
  }
  
  // 打开包含自定义组件的对话框
  openComponent<T>(
    component: Type<T>,
    options: {
      title?: string;
      size?: 'small' | 'medium' | 'large' | 'fullscreen';
      inputs?: {[key: string]: any};
    } = {}
  ): Observable<boolean> {
    // 创建自定义注入器传递输入数据
    const injector = options.inputs 
      ? Injector.create({
          providers: [
            { provide: 'COMPONENT_INPUTS', useValue: options.inputs }
          ],
          parent: this.injector
        })
      : this.injector;
    
    return this.createModal({
      title: options.title || '对话框',
      size: options.size || 'medium',
      contentComponent: component,
      contentInjector: injector
    });
  }
  
  // 打开包含模板的对话框
  openTemplate(
    template: TemplateRef<any>,
    context: any = {},
    options: {
      title?: string;
      size?: 'small' | 'medium' | 'large' | 'fullscreen';
    } = {}
  ): Observable<boolean> {
    return this.createModal({
      title: options.title || '对话框',
      size: options.size || 'medium',
      contentTemplate: template,
      contentContext: context
    });
  }
  
  // 创建和显示模态对话框
  private createModal(options: any = {}): Observable<boolean> {
    // 如果已有对话框，先关闭它
    this.closeModal();
    
    // 创建元素容器
    const containerElement = document.createElement('div');
    document.body.appendChild(containerElement);
    
    // 创建组件工厂
    const factory = this.componentFactoryResolver
      .resolveComponentFactory(ModalComponent);
    
    // 创建组件
    this.modalComponentRef = factory.create(this.injector, [], containerElement);
    
    // 设置输入属性
    const instance = this.modalComponentRef.instance;
    
    Object.keys(options).forEach(key => {
      instance[key] = options[key];
    });
    
    // 添加到应用程序视图
    this.appRef.attachView(this.modalComponentRef.hostView);
    
    // 创建结果Observable
    return new Observable<boolean>(observer => {
      const subscription = new Subscription();
      
      // 监听确认事件
      subscription.add(
        instance.confirmed.subscribe(() => {
          observer.next(true);
          observer.complete();
          this.closeModal();
        })
      );
      
      // 监听取消事件
      subscription.add(
        instance.canceled.subscribe(() => {
          observer.next(false);
          observer.complete();
          this.closeModal();
        })
      );
      
      // 监听关闭事件
      subscription.add(
        instance.closed.subscribe(() => {
          observer.next(false);
          observer.complete();
          this.closeModal();
        })
      );
      
      // 清理函数
      return () => {
        subscription.unsubscribe();
        this.closeModal();
      };
    });
  }
  
  // 关闭当前对话框
  private closeModal() {
    if (this.modalComponentRef) {
      // 分离视图
      this.appRef.detachView(this.modalComponentRef.hostView);
      
      // 销毁组件
      this.modalComponentRef.destroy();
      
      // 移除容器
      const element = this.modalComponentRef.location.nativeElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      this.modalComponentRef = null;
    }
  }
}

// 使用模态对话框服务
@Component({
  selector: 'app-modal-demo',
  template: `
    <div class="modal-demo">
      <h2>模态对话框演示</h2>
      
      <div class="demo-buttons">
        <button (click)="openBasicModal()">基本对话框</button>
        <button (click)="openConfirmModal()">确认对话框</button>
        <button (click)="openCustomComponent()">自定义组件对话框</button>
        <button (click)="openCustomTemplate()">自定义模板对话框</button>
      </div>
      
      <ng-template #customTemplate let-data>
        <div class="custom-template">
          <h3>自定义模板内容</h3>
          <p>可以包含复杂布局和交互</p>
          <div>
            <label>名称:</label>
            <input [(ngModel)]="data.name">
          </div>
          <div>
            <label>电子邮件:</label>
            <input [(ngModel)]="data.email">
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class ModalDemoComponent {
  @ViewChild('customTemplate') customTemplate: TemplateRef<any>;
  
  constructor(private modalService: ModalService) {}
  
  openBasicModal() {
    this.modalService.open({
      title: '基本对话框',
      message: '这是一个基本的模态对话框示例。',
      size: 'medium'
    }).subscribe(result => {
      console.log('对话框结果:', result);
    });
  }
  
  openConfirmModal() {
    this.modalService.confirm({
      title: '确认操作',
      message: '确定要删除这条记录吗？此操作不可撤销。'
    }).subscribe(confirmed => {
      if (confirmed) {
        console.log('用户确认了操作');
        // 执行删除操作
      } else {
        console.log('用户取消了操作');
      }
    });
  }
  
  openCustomComponent() {
    this.modalService.openComponent(UserFormComponent, {
      title: '用户信息',
      size: 'large',
      inputs: {
        userId: 123,
        mode: 'edit'
      }
    }).subscribe(saved => {
      if (saved) {
        console.log('用户信息已保存');
      }
    });
  }
  
  openCustomTemplate() {
    const context = {
      name: '',
      email: ''
    };
    
    this.modalService.openTemplate(
      this.customTemplate,
      context,
      { title: '自定义模板' }
    ).subscribe(result => {
      if (result) {
        console.log('保存的数据:', context);
      }
    });
  }
}

// 用于动态加载的自定义表单组件
@Component({
  selector: 'app-user-form',
  template: `
    <div class="user-form">
      <div *ngIf="loading">加载中...</div>
      
      <form *ngIf="!loading" [formGroup]="form">
        <div class="form-group">
          <label>用户名:</label>
          <input formControlName="username">
          <div class="error" *ngIf="form.get('username').invalid && form.get('username').touched">
            用户名是必填项
          </div>
        </div>
        
        <div class="form-group">
          <label>电子邮件:</label>
          <input formControlName="email" type="email">
          <div class="error" *ngIf="form.get('email').invalid && form.get('email').touched">
            请输入有效的电子邮件地址
          </div>
        </div>
        
        <div class="form-group">
          <label>角色:</label>
          <select formControlName="role">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
            <option value="editor">编辑</option>
          </select>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .error {
      color: red;
      font-size: 12px;
      margin-top: 5px;
    }
  `]
})
export class UserFormComponent implements OnInit {
  userId: number;
  mode: 'create' | 'edit' = 'create';
  
  form: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    @Optional() @Inject('COMPONENT_INPUTS') private inputs: any
  ) {
    // 从输入中获取数据
    if (this.inputs) {
      this.userId = this.inputs.userId;
      this.mode = this.inputs.mode || this.mode;
    }
    
    // 创建表单
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user']
    });
  }
  
  ngOnInit() {
    // 如果是编辑模式，加载用户数据
    if (this.mode === 'edit' && this.userId) {
      this.loadUserData();
    }
  }
  
  private loadUserData() {
    this.loading = true;
    // 模拟API调用
    setTimeout(() => {
      // 模拟数据
      const userData = {
        username: '张三',
        email: 'zhangsan@example.com',
        role: 'admin'
      };
      
      // 设置表单值
      this.form.patchValue(userData);
      this.loading = false;
    }, 1000);
  }
  
  // 获取表单数据（可由模态框服务在确认时调用）
  getData() {
    return this.form.valid ? this.form.value : null;
  }
  
  // 检查表单是否有效
  isValid() {
    return this.form.valid;
  }
}
```

### 动态组件加载最佳实践

1. **生命周期管理**：
   - 始终在合适的时机销毁组件，避免内存泄漏
   - 利用`OnDestroy`钩子清理资源

2. **性能考虑**：
   - 避免频繁创建和销毁组件
   - 考虑使用组件复用池
   - 对于常用组件，考虑预加载

3. **变更检测**：
   - 动态组件可能需要手动触发变更检测
   - 使用`ChangeDetectorRef.detectChanges()`确保视图更新

4. **错误处理**：
   - 实现适当的错误处理机制
   - 使用try/catch包装动态组件创建

5. **类型安全**：
   - 使用泛型确保类型安全
   - 使用接口定义动态组件的公共API

6. **模块化设计**：
   - 创建专门的服务封装动态组件逻辑
   - 将常用动态组件模式抽象为可重用服务

> **提示**：掌握动态组件加载技术可以构建更灵活、更模块化的应用程序。从简单的用例开始，随着需求增长逐步采用更复杂的模式。 