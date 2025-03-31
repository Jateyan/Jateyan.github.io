---
title: application-performance
createTime: 2025/03/29 16:57:22
permalink: /article/ydmlttah/
---

# Angular 应用性能优化

## 目录

- [首次加载优化](#首次加载优化)
- [运行时性能](#运行时性能)
- [内存管理](#内存管理)
- [变更检测优化](#变更检测优化)
- [网络请求优化](#网络请求优化)

## 首次加载优化

## 运行时性能

运行时性能关注应用在运行过程中的响应速度、平滑度和资源使用效率，对用户交互体验至关重要。

### 变更检测策略优化

Angular的变更检测机制是影响运行时性能的核心因素，优化它可显著提升应用响应性。

#### OnPush策略应用

默认变更检测策略会在每次事件后检查所有组件，而OnPush策略可以减少不必要的检测。

```typescript
// 使用OnPush变更检测策略的组件
@Component({
  selector: 'app-performance',
  template: `<div>{{data.value}}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceComponent {
  @Input() data: {value: string};
  
  // 组件只在以下情况更新:
  // 1. 输入属性引用变化(@Input引用改变，非内部属性变化)
  // 2. 组件或子组件触发事件
  // 3. 显式触发变更检测
  // 4. 通过Async管道观察到的Observable发出新值
}
```

#### 手动控制变更检测

在某些情况下，手动控制变更检测可以进一步优化性能。

```typescript
@Component({
  selector: 'app-manual-control',
  template: `
    <div>{{counter}}</div>
    <button (click)="increment()">增加</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualControlComponent {
  counter = 0;
  
  constructor(private cd: ChangeDetectorRef) {}
  
  increment() {
    this.counter++;
    // 手动标记组件需要检查，而不是触发整个组件树的检查
    this.cd.markForCheck();
    
    // 其他场景:
    // 立即检查此组件和子组件
    // this.cd.detectChanges();
    
    // 将组件从变更检测中分离(停止检测)
    // this.cd.detach();
    
    // 重新附加到变更检测
    // this.cd.reattach();
  }
}
```

#### 运行外任务分离

将耗时任务移至变更检测周期外执行，避免阻塞UI线程。

```typescript
@Component({
  selector: 'app-zone-optimization',
  template: `<div>{{status}}</div>`
})
export class ZoneOptimizationComponent {
  status = '准备就绪';
  
  constructor(private zone: NgZone) {}
  
  runExpensiveTask() {
    this.status = '处理中...';
    
    // 在Angular区域外执行耗时操作，不触发变更检测
    this.zone.runOutsideAngular(() => {
      // 执行耗时计算
      const result = this.performHeavyCalculation();
      
      // 完成后，回到Angular区域更新UI
      this.zone.run(() => {
        this.status = `完成!结果: ${result}`;
      });
    });
  }
  
  performHeavyCalculation() {
    // 模拟耗时操作
    const start = performance.now();
    let result = 0;
    for (let i = 0; i < 1000000000; i++) {
      result += Math.sqrt(i);
    }
    const end = performance.now();
    console.log(`计算耗时: ${end - start}ms`);
    return result;
  }
}
```

### 渲染性能优化

优化组件渲染是提升运行时性能的关键环节。

#### 虚拟滚动

处理长列表时，使用虚拟滚动仅渲染可视区域内的元素，显著提升性能。

```typescript
// app.module.ts
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [ScrollingModule]
})
export class AppModule {}

// 组件使用虚拟滚动
@Component({
  selector: 'app-virtual-scroll',
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{item.name}}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .viewport {
      height: 500px;
      width: 100%;
      border: 1px solid black;
    }
    .item {
      height: 50px;
      padding: 10px;
      box-sizing: border-box;
      border-bottom: 1px solid #ccc;
    }
  `]
})
export class VirtualScrollComponent {
  // 即使有10000项，也能保持流畅
  items = Array.from({length: 10000}).map((_, i) => ({
    id: i,
    name: `项目 #${i}`
  }));
}
```

#### 列表渲染优化

为ngFor添加trackBy函数，避免在数据更新时不必要的DOM重建。

```typescript
@Component({
  selector: 'app-track-by',
  template: `
    <ul>
      <!-- 使用trackBy避免整个列表重新渲染 -->
      <li *ngFor="let user of users; trackBy: trackByFn">
        {{user.name}}
      </li>
    </ul>
    <button (click)="refreshUsers()">刷新用户</button>
  `
})
export class TrackByComponent {
  users = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 3, name: '王五' }
  ];
  
  // 使用唯一标识(id)跟踪项目
  trackByFn(index: number, user: any): number {
    return user.id;
  }
  
  refreshUsers() {
    // 模拟API请求返回相同数据但内存中是新对象
    // 使用trackBy避免UI重新渲染
    this.users = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ];
  }
}
```

#### DOM操作优化

减少频繁DOM操作，必要时使用Renderer2进行优化。

```typescript
@Component({
  selector: 'app-dom-manipulation',
  template: `<div #container></div>`
})
export class DomManipulationComponent implements AfterViewInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  
  constructor(private renderer: Renderer2) {}
  
  ngAfterViewInit() {
    // 不好的实践:直接操作DOM
    // this.container.nativeElement.innerHTML = '<p>内容</p>';
    // this.container.nativeElement.style.color = 'red';
    
    // 推荐:使用Renderer2
    const p = this.renderer.createElement('p');
    const text = this.renderer.createText('内容');
    this.renderer.appendChild(p, text);
    this.renderer.appendChild(this.container.nativeElement, p);
    this.renderer.setStyle(p, 'color', 'red');
    
    // 批量DOM操作
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 100; i++) {
      const div = this.renderer.createElement('div');
      const text = this.renderer.createText(`项目 ${i}`);
      this.renderer.appendChild(div, text);
      this.renderer.appendChild(fragment, div);
    }
    // 一次性添加到DOM
    this.renderer.appendChild(this.container.nativeElement, fragment);
  }
}
```

### 事件处理优化

优化事件处理逻辑提升应用交互性能。

#### 事件委托

利用事件冒泡机制，在父元素上处理多个子元素的事件。

```typescript
@Component({
  selector: 'app-event-delegation',
  template: `
    <!-- 使用事件委托，避免为每个按钮单独添加事件监听器 -->
    <div (click)="handleClick($event)">
      <button data-action="save">保存</button>
      <button data-action="delete">删除</button>
      <button data-action="edit">编辑</button>
      <button data-action="view">查看</button>
    </div>
  `
})
export class EventDelegationComponent {
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // 检查是否点击的是按钮
    if (target.tagName === 'BUTTON') {
      const action = target.getAttribute('data-action');
      
      // 根据点击的按钮执行不同操作
      switch (action) {
        case 'save':
          console.log('执行保存操作');
          break;
        case 'delete':
          console.log('执行删除操作');
          break;
        case 'edit':
          console.log('执行编辑操作');
          break;
        case 'view':
          console.log('执行查看操作');
          break;
      }
    }
  }
}
```

#### 事件节流与防抖

对高频触发的事件使用节流与防抖技术，减少处理次数。

```typescript
@Component({
  selector: 'app-debounce-throttle',
  template: `
    <input 
      type="text" 
      placeholder="搜索(带防抖)"
      (input)="onSearchInput($event)">
      
    <div 
      (scroll)="onScroll($event)"
      style="height: 200px; overflow: auto">
      <div style="height: 2000px">滚动内容</div>
    </div>
  `
})
export class DebounceThrottleComponent {
  // 防抖: 延迟执行，如果指定时间内再次调用，则重新计时
  searchDebounce = this.debounce((term: string) => {
    console.log(`搜索: ${term}`);
    // 调用API进行搜索
  }, 300);
  
  // 节流: 指定时间内最多执行一次
  scrollThrottle = this.throttle(() => {
    console.log('滚动处理');
    // 处理滚动逻辑
  }, 200);
  
  onSearchInput(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchDebounce(term);
  }
  
  onScroll(event: Event) {
    this.scrollThrottle();
  }
  
  // 防抖函数实现
  debounce(fn: Function, delay: number) {
    let timeoutId: any;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  
  // 节流函数实现
  throttle(fn: Function, limit: number) {
    let inThrottle: boolean;
    return function(...args: any[]) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}
```

### 运行时渲染优化对比

下表比较了不同Angular渲染优化技术的效果：

| 优化技术          | 适用场景                  | 性能提升      | 实现难度   | 副作用/注意事项             |
|------------------|---------------------------|---------------|------------|----------------------------|
| OnPush策略       | 数据稳定的展示型组件      | 30-60%        | 低         | 需要遵循不可变数据模式      |
| 虚拟滚动         | 长列表(>100项)           | 70-95%        | 中         | 初始设置稍复杂              |
| trackBy函数      | 频繁更新的列表           | 40-80%        | 低         | 几乎无副作用                |
| 事件委托         | 多个相似元素的事件处理    | 取决于元素数量 | 低         | 需要额外的事件筛选逻辑      |
| 防抖/节流        | 高频事件(输入、滚动、调整)| 50-90%        | 低         | 可能引入轻微响应延迟        |
| 运行外任务       | 密集计算、非UI任务       | 接近100%      | 中         | 使用不当可能导致状态不同步  |

## 内存管理

## 变更检测优化

变更检测是Angular应用性能的核心影响因素，理解并优化变更检测机制可大幅提升应用性能。

### 变更检测机制深入理解

Angular的变更检测基于Zone.js实现，深入理解其工作原理是优化的基础。

#### 变更检测工作原理

变更检测是Angular检查组件数据模型变化并更新DOM的过程。

```ascii
Angular变更检测流程:
┌─────────────────┐
│  触发事件/异步操作 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zone.js捕获事件  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Angular检测变化开始│
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ 从根组件开始检查  │─────▶│  检查当前组件   │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │               ┌────────┴────────┐
         │               │更新组件绑定的DOM │
         │               └────────┬────────┘
         │                        │
         │               ┌────────┴────────┐
         └───────────────┤  检查子组件     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ 变更检测完成    │
                         └─────────────────┘
```

#### 默认变更检测策略

默认情况下，Angular采用"CheckAlways"策略，每次事件触发后检查整个组件树。

```typescript
@Component({
  selector: 'app-default',
  template: `<div>{{data}}</div>`,
  // 默认使用CheckAlways策略，不需要显式指定
  // changeDetection: ChangeDetectionStrategy.Default
})
export class DefaultComponent {
  data = 'some data';
  
  constructor(private cd: ChangeDetectorRef) {
    // 默认策略下，任何异步事件后，此组件都会被检查
    setTimeout(() => {
      this.data = 'changed data';
      // 不需要手动触发变更检测
    }, 1000);
  }
}
```

#### 变更检测性能挑战

默认的变更检测策略在大型应用中可能导致性能问题：

1. 即使数据未变化也会检查所有组件
2. 组件树越大，检测开销越大
3. 频繁操作(如动画、滚动)会导致大量检测

### OnPush变更检测策略

OnPush变更检测策略是最常用的变更检测优化手段，可显著减少不必要的检测。

#### OnPush基本应用

OnPush策略让组件只在特定条件下才进行变更检测。

```typescript
@Component({
  selector: 'app-on-push',
  template: `
    <div>姓名: {{person.name}}</div>
    <div>年龄: {{person.age}}</div>
    <button (click)="updateAge()">增加年龄</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnPushComponent implements OnInit {
  @Input() person: {name: string, age: number};
  
  constructor(private cd: ChangeDetectorRef) {}
  
  ngOnInit() {
    // 这种直接修改对象属性的方式不会触发OnPush组件更新
    setTimeout(() => {
      this.person.age++;
      // 视图不会更新，因为引用没变
    }, 1000);
  }
  
  updateAge() {
    // 点击事件会触发变更检测，即使是OnPush策略
    this.person.age++;
    // 视图会更新，因为事件会触发检测
  }
}

// 父组件
@Component({
  selector: 'app-parent',
  template: `
    <app-on-push [person]="person"></app-on-push>
    <button (click)="updatePerson()">更新人员(新引用)</button>
    <button (click)="mutatePersonAge()">更新年龄(同引用)</button>
  `
})
export class ParentComponent {
  person = { name: '张三', age: 30 };
  
  updatePerson() {
    // 创建新引用，OnPush子组件会更新
    this.person = { ...this.person, age: this.person.age + 1 };
  }
  
  mutatePersonAge() {
    // 直接修改对象，OnPush子组件不会更新
    this.person.age++;
  }
}
```

#### OnPush检测触发条件

了解OnPush策略下触发变更检测的四种情况：

```typescript
@Component({
  selector: 'app-on-push-triggers',
  template: `
    <div>数据: {{data}}</div>
    <div>异步数据: {{asyncData | async}}</div>
    <button (click)="onClick()">点击事件</button>
    <button (click)="forceUpdate()">强制更新</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnPushTriggersComponent {
  @Input() data: string; // 输入属性
  asyncData = new BehaviorSubject<string>('初始数据');
  
  constructor(private cd: ChangeDetectorRef) {
    // OnPush组件在以下情况下会触发变更检测:
    // 1. 输入属性引用发生变化(@Input引用变化)
    // 2. 组件自身或子组件触发事件(如onClick)
    // 3. 显式调用变更检测(markForCheck或detectChanges)
    // 4. 使用async管道订阅的Observable发出新值
  }
  
  onClick() {
    // 事件处理会触发变更检测
    console.log('点击事件触发变更检测');
  }
  
  updateAsyncData() {
    // 通过async管道绑定的Observable发出新值会触发检测
    this.asyncData.next('更新的异步数据: ' + Date.now());
  }
  
  forceUpdate() {
    // 显式触发变更检测
    this.cd.markForCheck();
    // 或者
    // this.cd.detectChanges();
  }
}
```

#### 不可变数据模式

配合OnPush策略，采用不可变数据模式可以提高变更检测效率。

```typescript
@Component({
  selector: 'app-immutable-pattern',
  template: `
    <div>
      <h3>待办事项</h3>
      <ul>
        <li *ngFor="let todo of todos; trackBy: trackById">
          {{todo.title}}
          <button (click)="toggleTodo(todo.id)">
            {{todo.completed ? '完成' : '未完成'}}
          </button>
        </li>
      </ul>
      <input #newTodo>
      <button (click)="addTodo(newTodo.value)">添加</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImmutablePatternComponent {
  todos: {id: number, title: string, completed: boolean}[] = [
    {id: 1, title: '学习Angular', completed: false},
    {id: 2, title: '理解变更检测', completed: false}
  ];
  
  trackById(index: number, todo: any): number {
    return todo.id;
  }
  
  // 不可变模式 - 使用新引用替代修改
  toggleTodo(id: number) {
    // 创建新数组，保持原有引用不变
    this.todos = this.todos.map(todo => 
      todo.id === id 
        ? {...todo, completed: !todo.completed} // 创建修改项的新对象
        : todo // 保持其他项不变
    );
  }
  
  // 添加新项也使用不可变模式
  addTodo(title: string) {
    if (!title.trim()) return;
    
    // 创建新数组
    this.todos = [
      ...this.todos,
      {
        id: Date.now(), // 简单ID生成
        title: title.trim(),
        completed: false
      }
    ];
  }
}
```

### 变更检测手动控制

在某些特殊场景下，手动控制变更检测可实现更精细的性能优化。

#### 分离变更检测

将组件从自动变更检测中分离，完全控制何时检测变化。

```typescript
@Component({
  selector: 'app-detached-detection',
  template: `
    <div>计数: {{counter}}</div>
    <div>{{complexData.value}}</div>
    <button (click)="increment()">递增</button>
    <button (click)="calculate()">执行计算</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetachedDetectionComponent implements OnInit {
  counter = 0;
  complexData = {value: 0};
  
  constructor(private cd: ChangeDetectorRef) {}
  
  ngOnInit() {
    // 分离组件变更检测，不再自动检测变化
    this.cd.detach();
    
    // 每秒手动检测一次变化
    setInterval(() => {
      this.counter++;
      // 只有调用detectChanges时才会更新视图
      this.cd.detectChanges();
    }, 1000);
  }
  
  increment() {
    this.counter++;
    // 手动触发变更检测
    this.cd.detectChanges();
  }
  
  calculate() {
    // 执行耗时计算，但不立即更新UI
    this.complexData.value = this.performHeavyCalculation();
    
    // 使用requestAnimationFrame确保在下一帧更新UI，避免阻塞
    requestAnimationFrame(() => {
      this.cd.detectChanges();
    });
  }
  
  performHeavyCalculation(): number {
    // 模拟耗时计算
    console.log('执行耗时计算...');
    const start = performance.now();
    
    let result = 0;
    for (let i = 0; i < 100000000; i++) {
      result += Math.sqrt(i);
    }
    
    const end = performance.now();
    console.log(`计算耗时: ${end - start}ms`);
    return result;
  }
}
```

#### 检查一次模式

对于数据只需更新一次的场景，使用markForCheck标记组件，等待下一检测周期。

```typescript
@Component({
  selector: 'app-check-once',
  template: `<div>{{message}}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckOnceComponent implements OnInit {
  message = '加载中...';
  
  constructor(private cd: ChangeDetectorRef) {}
  
  ngOnInit() {
    // 模拟异步数据加载
    setTimeout(() => {
      this.message = '数据已加载!';
      
      // 不立即检测，而是标记组件需要在下一检测周期检查
      // 这样可以批量处理多个更新
      this.cd.markForCheck();
    }, 2000);
  }
}
```

#### 子树变更检测优化

优化子组件树的变更检测，避免整个应用重新渲染。

```typescript
@Component({
  selector: 'app-parent-container',
  template: `
    <div>
      <h2>父组件</h2>
      <div>父计数: {{parentCounter}}</div>
      <button (click)="incrementParent()">增加父计数</button>
      
      <app-child-tree [data]="childData"></app-child-tree>
      <button (click)="updateChildTree()">更新子树</button>
    </div>
  `
})
export class ParentContainerComponent {
  parentCounter = 0;
  childData = {value: 0};
  
  incrementParent() {
    this.parentCounter++;
  }
  
  updateChildTree() {
    // 创建新引用
    this.childData = {value: this.childData.value + 1};
  }
}

@Component({
  selector: 'app-child-tree',
  template: `
    <div>
      <h3>子组件树(OnPush)</h3>
      <div>接收数据: {{data.value}}</div>
      <div>内部计数: {{internalCounter}}</div>
      <button (click)="increment()">增加内部计数</button>
      
      <div *ngFor="let item of generateItems()">
        复杂项目 {{item}}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildTreeComponent {
  @Input() data: {value: number};
  internalCounter = 0;
  
  increment() {
    this.internalCounter++;
    // 事件会触发组件检测
  }
  
  // 在真实场景中，这个方法可能生成复杂的数据集
  generateItems(): number[] {
    console.log('子树生成项目列表');
    return Array(5).fill(0).map((_, i) => i);
  }
}
```

### 变更检测调试与分析

调试和分析变更检测行为可帮助识别性能瓶颈。

#### 变更检测可视化

使用工具可视化观察变更检测过程，识别过度检测情况。

```typescript
// 在main.ts中启用变更检测调试
import { enableDebugTools } from '@angular/platform-browser';

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(moduleRef => {
    // 启用调试工具
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    const componentRef = applicationRef.components[0];
    // 启用调试工具
    enableDebugTools(componentRef);
  })
  .catch(err => console.error(err));

// 在控制台使用
// ng.profiler.timeChangeDetection() 测量变更检测性能
// ng.profiler.timeChangeDetection({record: true}) 生成详细性能剖析
```

#### 性能监控

实现变更检测性能监控帮助识别问题组件。

```typescript
// change-detection-monitor.service.ts
@Injectable({
  providedIn: 'root'
})
export class ChangeDetectionMonitorService {
  monitorComponent(component: any, componentName: string) {
    const originalNgDoCheck = component.ngDoCheck;
    
    // 替换ngDoCheck以监控检测频率
    component.ngDoCheck = function() {
      console.time(`${componentName} 变更检测`);
      
      // 调用原始方法
      originalNgDoCheck && originalNgDoCheck.apply(this);
      
      console.timeEnd(`${componentName} 变更检测`);
    };
    
    return component;
  }
}

// 在组件中使用
@Component({ ... })
export class MonitoredComponent implements OnInit {
  constructor(private monitor: ChangeDetectionMonitorService) {}
  
  ngOnInit() {
    // 只在开发环境监控
    if (!environment.production) {
      this.monitor.monitorComponent(this, 'MonitoredComponent');
    }
  }
}
```

### 变更检测优化对比

不同变更检测优化策略的效果对比：

| 优化策略 | 性能提升 | 适用场景 | 复杂度 | 潜在风险 |
|---------|---------|---------|--------|---------|
| 默认策略 | 基准线 | 简单应用，组件数量少 | 低 | 大型应用性能下降 |
| OnPush策略 | 30-70% | 大多数展示型组件 | 中 | 数据更新不及时 |
| 不可变数据模式 | 40-60% | 配合OnPush使用 | 中 | 需要团队一致遵循 |
| 手动detach/检测 | 50-90% | 特定高性能需求场景 | 高 | 可能导致UI不更新 |
| 运行区域外任务 | 接近100% | CPU密集型计算 | 中 | 异步协调复杂 |
| 异步渲染优化 | 20-40% | 需要平滑渲染的UI | 中 | 增加代码复杂性 |

变更检测优化选择流程图：

```ascii
选择变更检测优化策略:
┌──────────────────────────┐
│  评估应用性能需求        │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐  否   ┌──────────────────────────┐
│  应用复杂度是否较高?     │──────▶│  使用默认变更检测        │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 是
            ▼
┌──────────────────────────┐
│  为所有组件应用OnPush    │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  是否有大量数据渲染?     │──────▶│  使用虚拟滚动 + 子树优化 │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  是否有CPU密集型操作?    │──────▶│  使用NgZone.runOutside   │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  是否需要精细控制更新?   │──────▶│  实现手动detach/检测     │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐
│  配合RxJS优化数据流      │
└──────────────────────────┘
```

## 网络请求优化

网络请求优化对提升Angular应用的响应速度和用户体验至关重要，尤其是在网络条件不佳的环境下。

### HTTP请求策略优化

良好的HTTP请求策略可以减少网络负载，提高应用响应速度。

#### HTTP请求合并

将多个相关HTTP请求合并为一个，减少请求次数。

```typescript
// 未优化：发送多个请求
@Injectable({
  providedIn: 'root'
})
export class UnoptimizedService {
  constructor(private http: HttpClient) {}
  
  getUserData(userId: string) {
    // 发送三个独立请求
    const userDetails$ = this.http.get<UserDetails>(`/api/users/${userId}`);
    const userPosts$ = this.http.get<Post[]>(`/api/users/${userId}/posts`);
    const userSettings$ = this.http.get<Settings>(`/api/users/${userId}/settings`);
    
    return {
      details: userDetails$,
      posts: userPosts$,
      settings: userSettings$
    };
  }
}

// 优化：使用API合并请求
@Injectable({
  providedIn: 'root'
})
export class OptimizedService {
  constructor(private http: HttpClient) {}
  
  getUserData(userId: string) {
    // 单个合并请求返回所有数据
    return this.http.get<{details: UserDetails, posts: Post[], settings: Settings}>(
      `/api/users/${userId}/combined`
    );
  }
}
```

#### 请求批处理

使用批处理技术合并多个独立请求。

```typescript
@Injectable({
  providedIn: 'root'
})
export class BatchRequestService {
  private batchQueue: {endpoint: string, data: any}[] = [];
  private batchingInProgress = false;
  private batchTimeout: any;
  
  constructor(private http: HttpClient) {}
  
  executeRequest<T>(endpoint: string, data: any): Observable<T> {
    return new Observable<T>(observer => {
      // 将请求添加到队列
      this.batchQueue.push({endpoint, data});
      
      // 如果没有进行中的批处理，启动一个
      if (!this.batchingInProgress) {
        this.batchingInProgress = true;
        
        // 使用短暂延迟收集批处理请求
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, 50); // 50ms批处理窗口
      }
      
      // 返回处理结果的逻辑
      // 实际实现需要映射批处理响应到各个请求
    });
  }
  
  private processBatch() {
    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchingInProgress = false;
    
    // 发送批处理请求
    this.http.post('/api/batch', {
      requests: currentBatch
    }).subscribe(responses => {
      // 分发响应到各个观察者
      // 此处简化处理
    });
  }
}
```

#### 请求优先级管理

根据用户体验需求设置网络请求优先级。

```typescript
@Injectable({
  providedIn: 'root'
})
export class PriorityRequestService {
  // 请求优先级枚举
  readonly Priority = {
    CRITICAL: 0,  // 关键请求(用户认证、主数据)
    HIGH: 1,      // 高优先级(视图数据)
    NORMAL: 2,    // 普通请求
    LOW: 3,       // 低优先级(统计、分析)
    IDLE: 4       // 空闲时发送(预加载、缓存填充)
  };
  
  private requestQueues: {[priority: number]: {request: Observable<any>, subject: Subject<any>}[]} = {
    0: [], 1: [], 2: [], 3: [], 4: []
  };
  
  private activeRequests = 0;
  private readonly MAX_CONCURRENT_REQUESTS = 6; // 最大并发请求数
  
  constructor(private http: HttpClient) {
    // 初始化请求处理
    this.processQueues();
  }
  
  request<T>(priority: number, url: string, options?: any): Observable<T> {
    const subject = new Subject<T>();
    
    // 创建请求配置但不立即执行
    const request = this.http.request<T>(
      options?.method || 'GET',
      url,
      options
    );
    
    // 将请求添加到对应优先级队列
    this.requestQueues[priority].push({
      request,
      subject
    });
    
    // 触发队列处理
    this.processQueues();
    
    // 返回subject作为observable
    return subject.asObservable();
  }
  
  private processQueues() {
    // 如果未达到最大并发数，处理队列
    if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
      // 按优先级顺序处理队列
      for (let priority = 0; priority <= 4; priority++) {
        const queue = this.requestQueues[priority];
        
        if (queue.length > 0) {
          const {request, subject} = queue.shift()!;
          this.activeRequests++;
          
          // 执行请求
          request.subscribe({
            next: (response) => {
              subject.next(response);
            },
            error: (error) => {
              subject.error(error);
            },
            complete: () => {
              subject.complete();
              this.activeRequests--;
              // 完成后继续处理队列
              this.processQueues();
            }
          });
          
          // 每次只处理一个请求
          break;
        }
      }
    }
  }
}
```

### 数据缓存策略

实现有效的缓存策略可大幅减少不必要的网络请求。

#### HTTP拦截器缓存

使用HTTP拦截器实现请求级缓存。

```typescript
// cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();
  private inProgressRequests = new Map<string, Subject<HttpEvent<any>>>();
  
  constructor() {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    // 检查是否有缓存控制头
    if (req.headers.has('Cache-Control') && req.headers.get('Cache-Control') === 'no-cache') {
      return this.sendRequest(req, next);
    }
    
    // 生成缓存键
    const cacheKey = this.createCacheKey(req);
    
    // 检查是否有缓存响应
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      // 返回缓存的响应
      return of(cachedResponse.clone());
    }
    
    // 检查是否有同样请求正在进行中
    const inProgress = this.inProgressRequests.get(cacheKey);
    if (inProgress) {
      // 复用进行中的请求
      return inProgress.asObservable();
    }
    
    // 发送请求并缓存结果
    return this.sendRequest(req, next, cacheKey);
  }
  
  private sendRequest(
    req: HttpRequest<any>, 
    next: HttpHandler,
    cacheKey?: string
  ): Observable<HttpEvent<any>> {
    // 如果要缓存，创建一个Subject共享响应
    if (cacheKey) {
      const inProgressSubject = new Subject<HttpEvent<any>>();
      this.inProgressRequests.set(cacheKey, inProgressSubject);
      
      return next.handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            // 缓存响应
            this.cache.set(cacheKey, event);
            // 完成进行中的请求
            inProgressSubject.next(event);
            inProgressSubject.complete();
            this.inProgressRequests.delete(cacheKey);
          }
        }),
        catchError(error => {
          // 处理错误
          inProgressSubject.error(error);
          this.inProgressRequests.delete(cacheKey);
          return throwError(() => error);
        }),
        // 确保只有一个订阅者处理原始observable
        share()
      );
    }
    
    // 不缓存的请求直接发送
    return next.handle(req);
  }
  
  private createCacheKey(req: HttpRequest<any>): string {
    return `${req.method}-${req.urlWithParams}`;
  }
}

// 在app.module.ts中提供拦截器
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

#### 服务级数据缓存

在服务层实现更灵活的数据缓存策略。

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private cache = new Map<string, any>();
  private cacheTTL = new Map<string, number>(); // 缓存生命周期
  private DEFAULT_TTL = 5 * 60 * 1000; // 默认5分钟
  
  constructor(private http: HttpClient) {
    // 定期清理过期缓存
    setInterval(() => this.cleanExpiredCache(), 60000);
  }
  
  /**
   * 获取数据，优先使用缓存
   */
  getData<T>(url: string, options?: {
    ttl?: number, // 自定义TTL，毫秒
    forceRefresh?: boolean // 强制刷新
  }): Observable<T> {
    const cacheKey = url;
    const ttl = options?.ttl || this.DEFAULT_TTL;
    
    // 强制刷新或缓存不存在
    if (options?.forceRefresh || !this.cache.has(cacheKey)) {
      return this.http.get<T>(url).pipe(
        tap(data => {
          this.cache.set(cacheKey, data);
          this.cacheTTL.set(cacheKey, Date.now() + ttl);
        })
      );
    }
    
    // 检查缓存是否过期
    const expiryTime = this.cacheTTL.get(cacheKey) || 0;
    if (Date.now() > expiryTime) {
      // 缓存过期，获取新数据
      return this.http.get<T>(url).pipe(
        tap(data => {
          this.cache.set(cacheKey, data);
          this.cacheTTL.set(cacheKey, Date.now() + ttl);
        }),
        catchError(error => {
          // 请求失败时使用过期缓存
          console.warn('请求失败，使用过期缓存:', error);
          return of(this.cache.get(cacheKey));
        })
      );
    }
    
    // 返回缓存数据
    return of(this.cache.get(cacheKey));
  }
  
  /**
   * 清除特定URL的缓存
   */
  clearCache(url?: string) {
    if (url) {
      this.cache.delete(url);
      this.cacheTTL.delete(url);
    } else {
      // 清除所有缓存
      this.cache.clear();
      this.cacheTTL.clear();
    }
  }
  
  /**
   * 清理过期缓存
   */
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheTTL.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheTTL.delete(key);
      }
    }
  }
}
```

#### IndexedDB持久化缓存

对于需要离线访问的数据，使用IndexedDB实现持久化缓存。

```typescript
@Injectable({
  providedIn: 'root'
})
export class IndexedDBCacheService {
  private db: IDBDatabase | null = null;
  private DB_NAME = 'app_cache';
  private STORE_NAME = 'cached_requests';
  
  constructor() {
    this.initDatabase();
  }
  
  /**
   * 初始化IndexedDB数据库
   */
  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }
      
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        // 创建缓存存储
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'url' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBRequest).result;
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB初始化失败:', event);
        reject('IndexedDB初始化失败');
      };
    });
  }
  
  /**
   * 从缓存获取数据
   */
  async get<T>(url: string): Promise<{ data: T, timestamp: number } | null> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未初始化');
        return;
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(url);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = (event) => {
        console.error('获取缓存失败:', event);
        reject('获取缓存失败');
      };
    });
  }
  
  /**
   * 保存数据到缓存
   */
  async set<T>(url: string, data: T): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未初始化');
        return;
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put({
        url,
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      
      request.onerror = (event) => {
        console.error('保存缓存失败:', event);
        reject('保存缓存失败');
      };
    });
  }
  
  /**
   * 删除缓存
   */
  async delete(url: string): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未初始化');
        return;
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(url);
      
      request.onsuccess = () => resolve();
      
      request.onerror = (event) => {
        console.error('删除缓存失败:', event);
        reject('删除缓存失败');
      };
    });
  }
  
  /**
   * 清除过期缓存
   */
  async clearExpired(maxAge: number): Promise<void> {
    await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未初始化');
        return;
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.openCursor();
      const now = Date.now();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (now - cursor.value.timestamp > maxAge) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = (event) => {
        console.error('清除过期缓存失败:', event);
        reject('清除过期缓存失败');
      };
    });
  }
}
```

### 预加载与预获取

通过预加载和预获取技术提前获取数据，减少用户等待时间。

#### 数据预加载

预加载可能需要的数据，提升后续操作响应速度。

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataPreloadService {
  private preloadedData = new Map<string, any>();
  
  constructor(private http: HttpClient) {}
  
  /**
   * 预加载数据但不立即使用
   */
  preload<T>(url: string): Observable<T> {
    // 检查是否已预加载
    if (this.preloadedData.has(url)) {
      return of(this.preloadedData.get(url));
    }
    
    return this.http.get<T>(url).pipe(
      tap(data => {
        this.preloadedData.set(url, data);
      })
    );
  }
  
  /**
   * 获取数据，优先使用预加载结果
   */
  getData<T>(url: string): Observable<T> {
    if (this.preloadedData.has(url)) {
      // 使用预加载数据
      const data = this.preloadedData.get(url);
      // 清除预加载缓存(一次性使用)
      this.preloadedData.delete(url);
      return of(data);
    }
    
    // 未预加载，直接请求
    return this.http.get<T>(url);
  }
}

// 在路由解析前预加载数据
@Injectable({
  providedIn: 'root'
})
export class UserDataResolver implements Resolve<User> {
  constructor(
    private userService: UserService,
    private preloadService: DataPreloadService
  ) {}
  
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    const userId = route.paramMap.get('id');
    
    // 预加载用户可能需要的其他数据
    this.preloadService.preload(`/api/users/${userId}/posts`).subscribe();
    this.preloadService.preload(`/api/users/${userId}/friends`).subscribe();
    
    // 返回主数据
    return this.userService.getUser(userId);
  }
}
```

#### 智能预测预加载

根据用户行为预测并预加载可能需要的数据。

```typescript
@Injectable({
  providedIn: 'root'
})
export class PredictivePreloadService {
  private userBehaviorPatterns = new Map<string, string[]>();
  
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // 监听路由变化
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.recordNavigation(event.url);
    });
  }
  
  /**
   * 记录用户导航模式
   */
  private recordNavigation(url: string) {
    // 获取最后一个页面
    const recentNavigations = this.getRecentNavigations();
    if (recentNavigations.length > 0) {
      const previousUrl = recentNavigations[recentNavigations.length - 1];
      
      // 记录从上一页到当前页的导航模式
      if (!this.userBehaviorPatterns.has(previousUrl)) {
        this.userBehaviorPatterns.set(previousUrl, []);
      }
      
      const patterns = this.userBehaviorPatterns.get(previousUrl)!;
      if (!patterns.includes(url)) {
        patterns.push(url);
        
        // 限制记录的模式数量
        if (patterns.length > 3) {
          patterns.shift();
        }
      }
    }
    
    // 保存当前导航
    const navigations = [...recentNavigations, url];
    if (navigations.length > 10) {
      navigations.shift();
    }
    localStorage.setItem('recentNavigations', JSON.stringify(navigations));
  }
  
  /**
   * 获取最近的导航历史
   */
  private getRecentNavigations(): string[] {
    try {
      const navigations = localStorage.getItem('recentNavigations');
      return navigations ? JSON.parse(navigations) : [];
    } catch {
      return [];
    }
  }
  
  /**
   * 预加载可能的下一页数据
   */
  preloadPredictedData() {
    const currentUrl = this.router.url;
    const predictedUrls = this.userBehaviorPatterns.get(currentUrl) || [];
    
    if (predictedUrls.length > 0) {
      // 预加载数据
      for (const url of predictedUrls) {
        this.preloadForRoute(url);
      }
    }
  }
  
  /**
   * 根据路由预加载相关数据
   */
  private preloadForRoute(url: string) {
    // 从路由配置解析API端点
    const routes = this.router.config;
    const matchedRoute = this.findMatchingRoute(url, routes);
    
    if (matchedRoute && matchedRoute.data && matchedRoute.data['preloadApis']) {
      const apis = matchedRoute.data['preloadApis'] as string[];
      for (const api of apis) {
        // 使用requestIdleCallback优化加载时机
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            this.http.get(api).subscribe();
          });
        } else {
          setTimeout(() => {
            this.http.get(api).subscribe();
          }, 0);
        }
      }
    }
  }
  
  /**
   * 查找匹配路由配置
   */
  private findMatchingRoute(url: string, routes: Routes): Route | null {
    // 简化实现，实际使用需要更复杂的路由匹配逻辑
    const urlPath = url.split('?')[0];
    
    for (const route of routes) {
      if (route.path && urlPath.startsWith('/' + route.path)) {
        return route;
      }
      
      // 检查子路由
      if (route.children) {
        const childMatch = this.findMatchingRoute(url, route.children);
        if (childMatch) return childMatch;
      }
    }
    
    return null;
  }
}

// 在路由配置中定义预加载API
const routes: Routes = [
  {
    path: 'users/:id',
    component: UserProfileComponent,
    data: {
      preloadApis: [
        '/api/users/:id',
        '/api/users/:id/posts'
      ]
    }
  }
];
```

### 网络性能监控与优化

监控和分析网络性能是持续优化的关键。

#### 请求性能跟踪

实现HTTP拦截器跟踪并分析请求性能。

```typescript
@Injectable()
export class PerformanceInterceptor implements HttpInterceptor {
  constructor() {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 记录请求开始时间
    const startTime = performance.now();
    
    return next.handle(req).pipe(
      finalize(() => {
        // 请求完成时计算耗时
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 记录性能数据
        this.logPerformance(req.url, req.method, duration);
        
        // 对于慢请求发出警告
        if (duration > 1000) {
          console.warn(`慢请求: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
        }
      })
    );
  }
  
  private logPerformance(url: string, method: string, duration: number) {
    // 提取API路径模式(如/api/users/123 -> /api/users/:id)
    const urlPattern = this.getUrlPattern(url);
    
    // 保存性能数据
    const performanceLog = this.getPerformanceLog();
    if (!performanceLog[urlPattern]) {
      performanceLog[urlPattern] = {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        minDuration: Infinity
      };
    }
    
    const stats = performanceLog[urlPattern];
    stats.count++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.minDuration = Math.min(stats.minDuration, duration);
    
    // 存储更新后的日志
    localStorage.setItem('http_performance_log', JSON.stringify(performanceLog));
  }
  
  private getUrlPattern(url: string): string {
    // 将URL参数替换为模式
    // 例如 /api/users/123 -> /api/users/:id
    return url.replace(/\/\d+(\/?)/g, '/:id$1');
  }
  
  private getPerformanceLog(): any {
    try {
      const log = localStorage.getItem('http_performance_log');
      return log ? JSON.parse(log) : {};
    } catch {
      return {};
    }
  }
}

// 在AppModule中提供拦截器
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PerformanceInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

#### 自适应网络策略

根据网络条件调整数据加载策略。

```typescript
@Injectable({
  providedIn: 'root'
})
export class NetworkAwareService {
  // 网络状态
  private connectionType: string = 'unknown';
  private isOnline: boolean = true;
  
  // 网络状态变化通知
  private connectionChange = new BehaviorSubject<{
    online: boolean,
    connectionType: string
  }>({ online: true, connectionType: 'unknown' });
  
  constructor() {
    this.initNetworkListeners();
  }
  
  /**
   * 初始化网络监听器
   */
  private initNetworkListeners() {
    // 监听在线/离线状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectionStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectionStatus();
    });
    
    // 如果支持，监听连接类型变化
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      
      this.connectionType = conn.effectiveType || 'unknown';
      
      conn.addEventListener('change', () => {
        this.connectionType = conn.effectiveType || 'unknown';
        this.updateConnectionStatus();
      });
    }
    
    // 初始更新
    this.updateConnectionStatus();
  }
  
  /**
   * 更新并通知连接状态变化
   */
  private updateConnectionStatus() {
    this.connectionChange.next({
      online: this.isOnline,
      connectionType: this.connectionType
    });
  }
  
  /**
   * 获取当前网络状态
   */
  getNetworkStatus() {
    return {
      online: this.isOnline,
      connectionType: this.connectionType
    };
  }
  
  /**
   * 订阅网络状态变化
   */
  onConnectionChange() {
    return this.connectionChange.asObservable();
  }
  
  /**
   * 根据网络状态调整请求参数
   */
  getRequestOptions() {
    const options: any = {};
    
    // 根据网络状态调整
    if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
      // 低质量网络
      options.params = {
        ...options.params,
        // 请求低分辨率资源
        quality: 'low',
        // 减少分页大小
        limit: 10
      };
    } else if (this.connectionType === '3g') {
      // 中等质量网络
      options.params = {
        ...options.params,
        quality: 'medium',
        limit: 20
      };
    } else {
      // 高质量网络
      options.params = {
        ...options.params,
        quality: 'high',
        limit: 50
      };
    }
    
    return options;
  }
  
  /**
   * 根据网络质量决定预加载策略
   */
  shouldPreload(): boolean {
    // 离线状态不预加载
    if (!this.isOnline) return false;
    
    // 低质量网络不预加载
    if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
      return false;
    }
    
    return true;
  }
}

// 使用网络感知服务
@Component({
  template: `
    <div>
      <div *ngIf="isLoading">加载中...</div>
      <div *ngIf="isOffline" class="offline-message">
        您当前处于离线状态，显示的是缓存数据
      </div>
      
      <ul>
        <li *ngFor="let item of items">{{item.name}}</li>
      </ul>
      
      <!-- 根据网络状态调整UI -->
      <div *ngIf="isSlowConnection" class="quality-switch">
        <button (click)="enableLowDataMode()">
          切换到低流量模式
        </button>
      </div>
    </div>
  `
})
export class NetworkAwareComponent implements OnInit {
  items: any[] = [];
  isLoading = true;
  isOffline = false;
  isSlowConnection = false;
  
  constructor(
    private dataService: DataService,
    private network: NetworkAwareService
  ) {}
  
  ngOnInit() {
    // 监听网络变化
    this.network.onConnectionChange().subscribe(status => {
      this.isOffline = !status.online;
      this.isSlowConnection = ['slow-2g', '2g', '3g'].includes(status.connectionType);
      
      // 网络恢复时刷新数据
      if (status.online && this.isOffline) {
        this.loadData();
      }
    });
    
    this.loadData();
  }
  
  loadData() {
    this.isLoading = true;
    
    // 获取适合当前网络的请求选项
    const options = this.network.getRequestOptions();
    
    this.dataService.getItems(options).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe(data => {
      this.items = data;
    });
  }
  
  enableLowDataMode() {
    // 切换到低数据模式
    localStorage.setItem('lowDataMode', 'true');
    // 重新加载数据
    this.loadData();
  }
}
```

### 网络优化策略对比

不同网络优化策略的效果和适用场景对比：

| 优化策略 | 适用场景 | 性能提升 | 实现复杂度 | 注意事项 |
|---------|---------|---------|-----------|---------|
| HTTP缓存 | 所有GET请求 | 60-90% | 低 | 需注意缓存失效 |
| 请求合并 | 相关数据加载 | 50-70% | 中 | 需后端支持 |
| 请求批处理 | 高频小请求 | 40-80% | 高 | 错误处理复杂 |
| IndexedDB缓存 | 离线访问 | 90-100% | 高 | 数据同步挑战 |
| 预加载 | 有明确导航流程 | 30-60% | 低 | 可能浪费带宽 |
| 优先级管理 | 复杂页面加载 | 感知提升40-70% | 中 | 优先级设计重要 |
| 自适应网络策略 | 移动应用 | 因网络而异 | 高 | 需设计多套UI |

### 网络优化选择流程

根据应用需求选择合适的网络优化策略：

```ascii
选择网络优化策略:
┌──────────────────────────┐
│  评估应用网络需求        │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  数据有明确的时效性?     │──────▶│  设计合理的HTTP缓存策略  │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  需要离线访问功能?       │──────▶│  实现IndexedDB持久化     │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  有相互关联的多个API?    │──────▶│  实现请求合并/批处理     │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐  是   ┌──────────────────────────┐
│  应用在移动环境使用?     │──────▶│  实现自适应网络策略      │
└───────────┬──────────────┘       └──────────────────────────┘
            │ 否
            ▼
┌──────────────────────────┐
│  实现基础HTTP缓存        │
└──────────────────────────┘
``` 