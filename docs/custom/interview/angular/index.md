# Angular 核心大纲

## 1. Angular 核心概念

### 1.1 架构

#### 1.1.1 Angular 整体架构介绍

- **八大核心构建模块**
  1. **模块(Modules)**

     - 应用的基本构建块
     - 特性模块的划分策略
     - 共享模块的设计原则
     - 延迟加载模块的实现
  2. **组件(Components)**

     - 视图的控制器
     - 组件树的设计
     - 组件通信策略
     - 生命周期管理
  3. **模板(Templates)**

     - 声明式HTML视图
     - 数据绑定语法
     - 模板表达式
     - 模板引用变量
  4. **元数据(Metadata)**

     - 装饰器的作用和类型
     - @Component 配置项
     - @Injectable 配置
     - 自定义装饰器
  5. **数据绑定(Data Binding)**

     - 插值表达式 {{}}
     - 属性绑定 []
     - 事件绑定 ()
     - 双向绑定 [()]
  6. **指令(Directives)**

     - 结构型指令的实现
     - 属性型指令的应用
     - 自定义指令开发
     - 指令的生命周期
  7. **服务(Services)**

     - 业务逻辑封装
     - 数据共享方案
     - 服务的作用域
     - 单例模式实现
  8. **依赖注入(DI)**

     - 注入器层级关系
     - 提供者配置方式
     - 服务实例化策略
     - 循环依赖处理

#### 1.1.2 模块化设计 (NgModule)

- **@NgModule 装饰器的关键属性**

  ```typescript
  @NgModule({
    declarations: [
      AppComponent,
      HomeComponent,
      // 声明本模块的组件、指令、管道
    ],
    imports: [
      BrowserModule,
      HttpClientModule,
      // 导入其他需要的模块
    ],
    exports: [
      SharedComponent,
      CommonDirective,
      // 导出可供其他模块使用的组件等
    ],
    providers: [
      UserService,
      {
        provide: API_CONFIG,
        useValue: environment.apiConfig
      },
      // 服务提供者配置
    ],
    bootstrap: [AppComponent] // 根组件
  })
  ```
- **模块类型及最佳实践**

  1. **根模块(Root Module)**

     ```typescript
     @NgModule({
       imports: [
         BrowserModule,
         CoreModule,
         SharedModule,
         AppRoutingModule
       ],
       declarations: [AppComponent],
       bootstrap: [AppComponent]
     })
     export class AppModule { }
     ```
  2. **特性模块(Feature Module)**

     ```typescript
     @NgModule({
       imports: [
         CommonModule,
         SharedModule,
         FeatureRoutingModule
       ],
       declarations: [
         FeatureComponent,
         FeatureListComponent
       ]
     })
     export class FeatureModule { }
     ```
  3. **共享模块(Shared Module)**

     ```typescript
     @NgModule({
       imports: [CommonModule],
       declarations: [
         SharedComponent,
         HighlightDirective,
         TrimPipe
       ],
       exports: [
         SharedComponent,
         HighlightDirective,
         TrimPipe
       ]
     })
     export class SharedModule { }
     ```
  4. **核心模块(Core Module)**

     ```typescript
     @NgModule({
       imports: [CommonModule],
       providers: [
         AuthService,
         {
           provide: HTTP_INTERCEPTORS,
           useClass: AuthInterceptor,
           multi: true
         }
       ]
     })
     export class CoreModule {
       constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
         if (parentModule) {
           throw new Error('CoreModule已经加载，只能在AppModule中导入！');
         }
       }
     }
     ```

#### 1.1.3 组件化开发

- **组件树结构设计**

  ```typescript
  @Component({
    selector: 'app-parent',
    template: `
      <div class="parent">
        <app-child
          [data]="parentData"
          (childEvent)="handleChildEvent($event)">
        </app-child>
      </div>
    `
  })
  export class ParentComponent {
    parentData = { message: 'Hello from parent' };

    handleChildEvent(event: any) {
      console.log('Child event:', event);
    }
  }
  ```
- **组件设计原则**

  1. **单一职责**

     - 每个组件只负责一个特定功能
     - 避免组件过于臃肿
     - 合理拆分组件
  2. **高内聚低耦合**

     - 组件内部逻辑紧密相关
     - 减少组件间的依赖
     - 使用服务共享数据
  3. **可重用性**

     - 设计通用组件
     - 提供灵活的配置项
     - 考虑组件的扩展性
  4. **可测试性**

     - 依赖注入便于测试
     - 避免直接操作DOM
     - 提供测试钩子

#### 1.1.4 依赖注入系统

- **分层注入器树**

  ```typescript
  // 1. 平台注入器 - 所有应用共享
  platformBrowserDynamic().bootstrapModule(AppModule);

  // 2. 根注入器 - 应用级别
  @NgModule({
    providers: [
      {
        provide: APP_CONFIG,
        useValue: { apiUrl: 'https://api.example.com' }
      },
      LoggerService
    ]
  })
  export class AppModule { }

  // 3. 模块注入器 - 特性模块级别
  @NgModule({
    providers: [
      UserService,
      {
        provide: FEATURE_FLAG,
        useValue: { enableNewUI: true }
      }
    ]
  })
  export class UserModule { }

  // 4. 组件注入器 - 组件及其子组件
  @Component({
    selector: 'app-user-list',
    providers: [
      // 这个UserService实例会覆盖模块中提供的实例，仅在此组件树中有效
      {
        provide: UserService,
        useClass: SpecialUserService
      }
    ]
  })
  export class UserListComponent { }
  ```

- **注入器作用域**

  ```typescript
  // 1. root 作用域 - 应用级单例
  @Injectable({
    providedIn: 'root'  // 全局单例，懒加载
  })
  export class DataService {
    constructor(private http: HttpClient) {
      console.log('DataService初始化');
    }
  }

  // 2. platform 作用域 - 多个应用共享
  @Injectable({
    providedIn: 'platform'  // 在同一页面的多个Angular应用间共享
  })
  export class SharedService {
    // 可用于微前端架构中的应用间通信
  }

  // 3. any 作用域 - 每个懒加载模块独立实例
  @Injectable({
    providedIn: 'any'  // 每个懒加载模块都有自己的实例
  })
  export class FeatureService {
    // 对于急性加载模块共享同一个实例
    // 对于懒加载模块各自有独立实例
  }

  // 4. 特定模块作用域
  @Injectable({
    providedIn: UserModule  // 仅在UserModule中可用
  })
  export class UserSpecificService { }
  ```

- **提供者类型**

  ```typescript
  // 1. useClass - 类提供者
  @NgModule({
    providers: [
      // 简写形式
      UserService,
      
      // 完整形式
      { provide: UserService, useClass: UserService },

      // 使用替代实现
      { 
        provide: UserService, 
        useClass: environment.production ? UserService : MockUserService 
      },

      // 抽象类的实现
      { 
        provide: AbstractAuthService, 
        useClass: FirebaseAuthService 
      }
    ]
  })
  export class AppModule { }

  // 2. useValue - 值提供者
  @NgModule({
    providers: [
      // 常量值
      {
        provide: 'API_URL',
        useValue: 'https://api.example.com'
      },
      
      // 使用InjectionToken（推荐）
      {
        provide: API_CONFIG,
        useValue: {
          url: 'https://api.example.com',
          timeout: 3000,
          retryCount: 3
        }
      },
      
      // 模拟服务
      {
        provide: UserService,
        useValue: {
          getUsers: () => of([{ id: 1, name: 'Test' }]),
          getUserById: (id) => of({ id, name: 'Test' })
        }
      }
    ]
  })
  export class AppModule { }

  // 使用InjectionToken
  export const API_CONFIG = new InjectionToken<ApiConfig>('api.config');
  
  // 注入使用
  constructor(@Inject(API_CONFIG) private apiConfig: ApiConfig) { }

  // 3. useFactory - 工厂提供者
  @NgModule({
    providers: [
      {
        provide: UserService,
        useFactory: (http: HttpClient, config: AppConfig) => {
          if (config.production) {
            return new RealUserService(http);
          } else {
            return new MockUserService();
          }
        },
        deps: [HttpClient, AppConfig]  // 工厂函数的依赖
      },
      
      // 带条件的提供者
      {
        provide: 'CACHE_SIZE',
        useFactory: (isProduction: boolean) => {
          return isProduction ? 10000 : 1000;
        },
        deps: [['isProduction']]  // 使用字符串令牌
      }
    ]
  })
  export class AppModule { }
  
  // 4. useExisting - 别名提供者
  @NgModule({
    providers: [
      LoggerService,  // 原始服务
      {
        provide: AbstractLogger,  // 抽象令牌
        useExisting: LoggerService  // 使用已存在的服务实例
      }
    ]
  })
  export class AppModule { }
  ```

- **循环依赖处理**

  ```typescript
  // 1. 使用 forwardRef 解决循环依赖
  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) { }
    
    getDataFromA() {
      return 'Data from A';
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(@Inject(forwardRef(() => ServiceA)) private serviceA: ServiceA) { }
    
    getDataFromB() {
      return 'Data from B + ' + this.serviceA.getDataFromA();
    }
  }

  // 2. 使用接口打破循环依赖
  export interface DataProvider {
    getData(): string;
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceA implements DataProvider {
    getData() {
      return 'Data from A';
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(@Inject(SERVICE_A_TOKEN) private dataProvider: DataProvider) { }
    
    process() {
      const data = this.dataProvider.getData();
      return 'Processed: ' + data;
    }
  }

  // 令牌
  export const SERVICE_A_TOKEN = new InjectionToken<DataProvider>('service.a');

  // 提供者配置
  @NgModule({
    providers: [
      ServiceA,
      ServiceB,
      { provide: SERVICE_A_TOKEN, useExisting: ServiceA }
    ]
  })
  export class AppModule { }
  ```

#### 1.1.5 Zone.js 和变更检测机制

- **Zone.js 的工作原理**

  ```typescript
  // 1. Zone.js 拦截异步操作示例
  // zone-demo.ts
  import 'zone.js';

  // 创建自定义 Zone
  const monitorZone = Zone.current.fork({
    name: 'monitor',
    onInvokeTask: (parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) => {
      console.log(`开始执行: ${task.type} - ${task.source}`);
      
      // 执行原始任务
      const result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
      
      console.log(`执行完成: ${task.type} - ${task.source}`);
      return result;
    }
  });

  // 在自定义Zone中执行代码
  monitorZone.run(() => {
    setTimeout(() => {
      console.log('定时器回调执行');
    }, 1000);

    fetch('https://api.example.com/data')
      .then(response => {
        console.log('网络请求完成');
        return response.json();
      });
  });

  // 2. Angular NgZone 用法示例
  @Component({/*...*/})
  export class AppComponent {
    constructor(private ngZone: NgZone) {
      // 在 Angular Zone 外执行
      this.ngZone.runOutsideAngular(() => {
        // 这里的代码不会触发变更检测
        setInterval(() => {
          this.updateChartData();
        }, 1000);
      });
      
      // 需要时手动触发变更检测
      this.ngZone.run(() => {
        // 这里的代码会触发变更检测
        this.updateComponentState();
      });
    }
  }

  // 3. 了解Zone.js如何与Angular变更检测结合
  // Angular引导过程中：
  platformBrowserDynamic().bootstrapModule(AppModule, {
    ngZone: 'zone.js'  // 默认值，使用Zone.js
    // ngZone: 'noop'  // 禁用Zone.js，需要手动触发变更检测
    // ngZone: new NgZone({...})  // 自定义NgZone
  });
  ```

- **变更检测策略详解**

  ```typescript
  // 1. Default 策略
  @Component({
    selector: 'app-default',
    template: `
      <div>Count: {{ count }}</div>
      <button (click)="increment()">Increment</button>
    `,
    changeDetection: ChangeDetectionStrategy.Default  // 默认值
  })
  export class DefaultComponent {
    count = 0;
    
    increment() {
      this.count++;  // 自动触发变更检测
    }
    
    ngOnInit() {
      setTimeout(() => {
        this.count++;  // Zone.js会自动触发变更检测
      }, 1000);
    }
  }

  // 2. OnPush 策略详解
  @Component({
    selector: 'app-onpush',
    template: `
      <div>User: {{ user.name }}</div>
      <button (click)="refresh()">Refresh</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class OnPushComponent implements OnInit {
    @Input() user: User;
    
    constructor(private cd: ChangeDetectorRef) {}
    
    ngOnInit() {
      // 以下操作不会触发变更检测
      setTimeout(() => {
        this.user.name = 'Updated Name';  // 修改对象属性不会触发OnPush检测
        
        // 需要手动触发变更检测
        this.cd.markForCheck();  // 标记组件及其祖先需要检查
      }, 1000);
    }
    
    refresh() {
      // 以下几种情况会触发OnPush组件的检测:
      
      // 1. 输入属性引用变化（新对象）
      this.user = { ...this.user, name: 'New Name' };
      
      // 2. 组件事件触发（此方法由模板中的事件绑定调用）
      
      // 3. 手动触发检测
      this.cd.detectChanges();  // 仅检测该组件及其子组件
      
      // 4. 使用AsyncPipe（在模板中）
    }
  }
  ```

- **手动控制变更检测**

  ```typescript
  @Component({
    selector: 'app-performance',
    template: `
      <div>{{ data.value }}</div>
      <div>Rendering: {{ renderCount }}</div>
      <button (click)="update()">Update</button>
      <button (click)="detach()">Detach</button>
      <button (click)="reattach()">Reattach</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class PerformanceComponent implements OnInit {
    data = { value: 0 };
    renderCount = 0;
    private intervalId: any;
    
    constructor(
      private cd: ChangeDetectorRef,
      private ngZone: NgZone
    ) {}
    
    ngOnInit() {
      // 完全控制变更检测
      this.cd.detach();  // 分离变更检测器
      
      this.ngZone.runOutsideAngular(() => {
        // 在Angular Zone外运行，不会自动触发变更检测
        this.intervalId = setInterval(() => {
          this.data.value++;
          
          // 每5次更新才手动更新视图一次
          if (this.data.value % 5 === 0) {
            this.ngZone.run(() => {
              this.renderCount++;
              this.cd.detectChanges();  // 手动触发检测
            });
          }
        }, 1000);
      });
    }
    
    update() {
      this.data = { value: this.data.value + 100 };
      this.renderCount++;
      this.cd.detectChanges();
    }
    
    detach() {
      this.cd.detach();
    }
    
    reattach() {
      this.cd.reattach();
    }
    
    ngOnDestroy() {
      clearInterval(this.intervalId);
    }
  }
  ```

- **变更检测优化实战**

  ```typescript
  // 1. 使用 OnPush + Immutable 对象
  @Component({
    selector: 'app-user-list',
    template: `
      <div *ngFor="let user of users; trackBy: trackByUserId">
        {{ user.name }}
      </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class UserListComponent {
    @Input() users: User[];
    
    trackByUserId(index: number, user: User): number {
      return user.id;  // 使用唯一ID避免不必要的DOM更新
    }
    
    // 添加用户（不可变更新）
    addUser(user: User) {
      this.users = [...this.users, user];  // 创建新数组引用
    }
    
    // 更新用户（不可变更新）
    updateUser(updatedUser: User) {
      this.users = this.users.map(user => 
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      );
    }
  }

  // 2. 使用 ChangeDetectorRef 精细控制大型应用
  @Component({
    selector: 'app-dashboard',
    template: `
      <app-header [user]="currentUser"></app-header>
      <app-sidebar [menuItems]="menuItems"></app-sidebar>
      <app-content>
        <app-widget [data]="widgetData"></app-widget>
      </app-content>
      <app-footer></app-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class DashboardComponent implements OnInit, AfterViewInit {
    currentUser: User;
    menuItems: MenuItem[];
    widgetData: any[];
    
    @ViewChild(WidgetComponent) widget: WidgetComponent;
    
    constructor(
      private cd: ChangeDetectorRef,
      private dataService: DataService
    ) {}
    
    ngOnInit() {
      // 只在数据变化时更新视图
      this.dataService.currentUser$.pipe(
        distinctUntilChanged()
      ).subscribe(user => {
        this.currentUser = user;
        this.cd.markForCheck();
      });
    }
    
    ngAfterViewInit() {
      // 为高性能组件设置独立的更新策略
      this.widget.cd.detach();  // 分离子组件的变更检测器
      
      // 设置更新间隔
      setInterval(() => {
        this.widget.cd.detectChanges();  // 每10秒更新一次widget组件
      }, 10000);
    }
    
    refreshDashboard() {
      // 手动触发整个视图更新
      this.cd.detectChanges();
    }
  }
  ```

### 1.2 组件（Components）

#### 1.2.1 组件生命周期钩子详解

- **钩子执行顺序与用途**

  ```typescript
  @Component({
    selector: 'app-lifecycle',
    template: '<div>{{data}}</div>'
  })
  export class LifecycleComponent implements 
    OnChanges, OnInit, DoCheck, 
    AfterContentInit, AfterContentChecked, 
    AfterViewInit, AfterViewChecked, 
    OnDestroy {
    
    @Input() data: string;
    
    constructor() {
      console.log('1. 构造函数执行');
      // 注意: 此时@Input()属性还未初始化
      // 适合进行基本的初始化和依赖注入
    }
    
    ngOnChanges(changes: SimpleChanges) {
      console.log('2. ngOnChanges', changes);
      // 当输入属性(@Input)变化时触发
      // 首次初始化时也会触发
      // changes参数包含变化的属性信息
      
      if (changes['data']) {
        console.log('之前的值:', changes['data'].previousValue);
        console.log('当前的值:', changes['data'].currentValue);
        console.log('首次变化?', changes['data'].firstChange);
      }
    }
    
    ngOnInit() {
      console.log('3. ngOnInit');
      // 组件初始化完成，输入属性设置完毕
      // 适合执行初始化逻辑、数据获取等
      // 只调用一次
    }
    
    ngDoCheck() {
      console.log('4. ngDoCheck');
      // 每次变更检测周期都会触发
      // 可用于自定义变更检测
      // 注意: 频繁调用，谨慎使用
    }
    
    ngAfterContentInit() {
      console.log('5. ngAfterContentInit');
      // 组件投影内容（ng-content）初始化完成后触发
      // 只调用一次
    }
    
    ngAfterContentChecked() {
      console.log('6. ngAfterContentChecked');
      // 每次检查组件投影内容后调用
      // 首次调用发生在ngAfterContentInit之后
    }
    
    ngAfterViewInit() {
      console.log('7. ngAfterViewInit');
      // 组件视图及其子视图初始化完成后调用
      // 此时可安全操作视图和子视图
      // 只调用一次
    }
    
    ngAfterViewChecked() {
      console.log('8. ngAfterViewChecked');
      // 每次检查组件视图及其子视图后调用
      // 首次调用发生在ngAfterViewInit之后
    }
    
    ngOnDestroy() {
      console.log('9. ngOnDestroy');
      // 组件销毁前调用
      // 适合清理资源、取消订阅等
    }
  }
  ```

- **关键钩子详解**

  1. **ngOnInit**

     ```typescript
     @Component({/*...*/})
     export class UserProfileComponent implements OnInit {
       user: User;
       
       constructor(private userService: UserService) {
         // 不要在构造函数中执行复杂逻辑
         console.log('UserProfileComponent 实例化');
       }
       
       ngOnInit() {
         // 适合异步数据获取
         this.userService.getUser().subscribe(user => {
           this.user = user;
         });
         
         // 复杂初始化逻辑
         this.initializeComponent();
       }
       
       private initializeComponent() {
         // 其他初始化逻辑
       }
     }
     ```

  2. **ngOnChanges**

     ```typescript
     @Component({
       selector: 'app-data-display',
       template: '<div>{{processedData}}</div>'
     })
     export class DataDisplayComponent implements OnChanges {
       @Input() data: any;
       @Input() config: DisplayConfig;
       
       processedData: string;
       
       ngOnChanges(changes: SimpleChanges) {
         // 响应式处理输入属性变化
         if (changes['data'] || changes['config']) {
           this.processData();
         }
         
         // 根据前后值变化执行特定逻辑
         if (changes['data'] && !changes['data'].firstChange) {
           const prev = changes['data'].previousValue;
           const curr = changes['data'].currentValue;
           
           if (prev.id !== curr.id) {
             console.log('数据ID已变更，重新加载相关信息');
             this.loadRelatedInfo(curr.id);
           }
         }
       }
       
       private processData() {
         if (!this.data || !this.config) return;
         
         // 根据输入属性处理数据
         this.processedData = this.config.showDetail 
           ? `${this.data.name}: ${this.data.description}`
           : this.data.name;
       }
       
       private loadRelatedInfo(id: number) {
         // 加载关联数据
       }
     }
     ```

  3. **ngAfterViewInit**

     ```typescript
     @Component({
       selector: 'app-chart',
       template: '<div #chartContainer style="width:100%; height:400px;"></div>'
     })
     export class ChartComponent implements AfterViewInit {
       @ViewChild('chartContainer') chartContainer: ElementRef;
       
       @Input() chartData: any[];
       
       private chart: any; // 第三方图表实例
       
       constructor(private chartService: ChartService) {}
       
       ngAfterViewInit() {
         // 视图初始化完成后，可安全操作DOM
         // 初始化第三方库
         this.chart = this.chartService.createChart(
           this.chartContainer.nativeElement
         );
         
         // 设置数据
         if (this.chartData) {
           this.updateChart();
         }
         
         // 注意：在这里修改视图相关属性可能会出现ExpressionChangedAfterItHasBeenCheckedError
         // setTimeout可以避免这个错误，但不是最佳实践
         setTimeout(() => {
           this.chart.setOption({ title: '更新的标题' });
         });
       }
       
       private updateChart() {
         if (this.chart && this.chartData) {
           this.chart.setData(this.chartData);
         }
       }
       
       ngOnDestroy() {
         // 清理第三方库资源
         if (this.chart) {
           this.chart.destroy();
         }
       }
     }
     ```

  4. **ngOnDestroy**

     ```typescript
     @Component({/*...*/})
     export class ResourceManagerComponent implements OnInit, OnDestroy {
       private subscription: Subscription = new Subscription();
       private intervalId: any;
       
       constructor(
         private dataService: DataService,
         private zone: NgZone,
         private elementRef: ElementRef
       ) {}
       
       ngOnInit() {
         // 1. 管理Observable订阅
         const sub1 = this.dataService.getData().subscribe(/*...*/);
         this.subscription.add(sub1);
         
         const sub2 = this.dataService.getEvents().subscribe(/*...*/);
         this.subscription.add(sub2);
         
         // 2. 设置定时器
         this.zone.runOutsideAngular(() => {
           this.intervalId = setInterval(() => {
             // 定时执行的代码
           }, 5000);
         });
         
         // 3. 添加DOM事件监听
         this.elementRef.nativeElement.addEventListener('click', this.handleClick);
       }
       
       // 绑定事件处理器
       private handleClick = (event: Event) => {
         console.log('元素被点击', event);
       };
       
       ngOnDestroy() {
         // 1. 取消所有订阅
         this.subscription.unsubscribe();
         
         // 2. 清除定时器
         if (this.intervalId) {
           clearInterval(this.intervalId);
         }
         
         // 3. 移除事件监听器
         this.elementRef.nativeElement.removeEventListener('click', this.handleClick);
         
         // 4. 通知后台清理资源
         this.dataService.releaseResources();
       }
     }
     ```

- **生命周期钩子高级使用**

  1. **takeUntil 模式 - 自动取消订阅**

     ```typescript
     @Component({/*...*/})
     export class SmartComponent implements OnInit, OnDestroy {
       private destroy$ = new Subject<void>();
       data: any[] = [];
       status = '';
       
       constructor(private dataService: DataService) {}
       
       ngOnInit() {
         // 使用takeUntil操作符自动取消订阅
         // 所有Observable都会在组件销毁时自动取消订阅
         
         this.dataService.getData()
           .pipe(takeUntil(this.destroy$))
           .subscribe(data => {
             this.data = data;
           });
           
         this.dataService.getStatus()
           .pipe(
             filter(status => status !== 'pending'),
             takeUntil(this.destroy$)
           )
           .subscribe(status => {
             this.status = status;
           });
       }
       
       ngOnDestroy() {
         // 发出信号并完成Subject
         this.destroy$.next();
         this.destroy$.complete();
       }
     }
     ```

  2. **处理异步操作和ExpressionChangedAfterItHasBeenCheckedError**

     ```typescript
     @Component({
       selector: 'app-async-example',
       template: `
         <div>Status: {{status}}</div>
         <child [data]="childData"></child>
       `
     })
     export class AsyncExampleComponent implements OnInit, AfterViewInit {
       status = 'loading';
       childData = null;
       
       @ViewChild(ChildComponent) child: ChildComponent;
       
       constructor(private cd: ChangeDetectorRef) {}
       
       ngOnInit() {
         // 异步操作
         setTimeout(() => {
           this.status = 'loaded';
           // 异步更新状态后手动触发变更检测
           this.cd.detectChanges();
         }, 1000);
       }
       
       ngAfterViewInit() {
         // 错误方式：直接修改会导致ExpressionChangedAfterItHasBeenCheckedError
         // this.childData = { name: 'updated data' };
         
         // 正确方式1：使用setTimeout推迟到下一个JavaScript事件循环
         setTimeout(() => {
           this.childData = { name: 'updated data' };
         });
         
         // 正确方式2：使用markForCheck (对于OnPush组件)
         /* 
         this.childData = { name: 'updated data' };
         this.cd.markForCheck();
         */
         
         // 正确方式3：分离变更检测器后手动触发
         /*
         this.cd.detach();
         this.childData = { name: 'updated data' };
         this.cd.detectChanges();
         this.cd.reattach();
         */
       }
     }
     ```

  3. **使用DoCheck实现自定义变更检测**

     ```typescript
     @Component({
       selector: 'app-custom-detection',
       template: `<div *ngIf="hasChanged">对象数据已变化!</div>`,
       changeDetection: ChangeDetectionStrategy.OnPush
     })
     export class CustomDetectionComponent implements DoCheck {
       @Input() complexObject: any;
       hasChanged = false;
       
       // 存储对象的前一个状态
       private previousObjectJson: string;
       
       ngOnChanges(changes: SimpleChanges) {
         if (changes['complexObject']) {
           // 保存新值的引用对象
           this.previousObjectJson = JSON.stringify(this.complexObject);
           this.hasChanged = false;
         }
       }
       
       ngDoCheck() {
         // 深度比较对象变化
         // 注意: 此方法在每个变更检测周期都会调用，性能敏感
         if (this.complexObject && this.previousObjectJson) {
           const currentObjectJson = JSON.stringify(this.complexObject);
           
           if (currentObjectJson !== this.previousObjectJson) {
             console.log('检测到对象内部属性变化');
             this.hasChanged = true;
             this.previousObjectJson = currentObjectJson;
           }
         }
       }
     }
     ```

- **生命周期钩子最佳实践**

  | 钩子 | 最佳用途 | 避免做的事 |
  |------|----------|-----------|
  | constructor | 基本初始化、依赖注入 | 复杂计算、API调用、DOM操作 |
  | ngOnChanges | 响应输入属性变化、数据转换 | 触发其他组件更新、重量级计算 |
  | ngOnInit | 初始化逻辑、数据获取、订阅Observable | 直接操作子组件 |
  | ngDoCheck | 自定义变更检测(谨慎使用) | 执行耗时操作(影响性能) |
  | ngAfterContentInit | 操作ng-content投影内容 | 修改可能触发变更检测的属性 |
  | ngAfterViewInit | DOM操作、集成第三方库、使用ViewChild | 直接修改绑定属性(会引发错误) |
  | ngOnDestroy | 清理资源、取消订阅、移除事件监听器 | 触发新的异步操作 |

  ```typescript
  @Component({/*...*/})
  export class BestPracticeComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    
    constructor(private service: DataService) {
      // 仅进行依赖注入和简单初始化
    }
    
    ngOnInit() {
      // 使用统一模式管理订阅
      this.service.getData()
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          // 处理数据
        });
    }
    
    ngOnDestroy() {
      // 统一清理模式
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
  ```

- **常见问题与解决方案**

  1. **ExpressionChangedAfterItHasBeenCheckedError**

     ```typescript
     // 问题: 在AfterViewInit中改变了被模板引用的属性
     ngAfterViewInit() {
       // 错误: 直接修改
       this.isVisible = true; // 将引发错误
       
       // 解决方案1: 使用setTimeout
       setTimeout(() => {
         this.isVisible = true;
       });
       
       // 解决方案2: 使用markForCheck和ApplicationRef.tick
       this.isVisible = true;
       this.appRef.tick();
     }
     ```

  2. **内存泄漏**

     ```typescript
     // 问题: 未取消订阅
     ngOnInit() {
       // 错误: 没有保存引用以便后续取消
       this.service.getData().subscribe(data => {
         this.data = data;
       });
       
       // 解决方案1: 保存并取消
       this.subscription = this.service.getData().subscribe(/*...*/);
       
       // 解决方案2: takeUntil模式
       this.service.getData()
         .pipe(takeUntil(this.destroy$))
         .subscribe(/*...*/);
     }
     ```

  3. **变更检测性能问题**

     ```typescript
     // 问题: DoCheck和频繁触发的生命周期钩子中执行重量级操作
     ngDoCheck() {
       // 错误: 每个变更检测周期执行重量级操作
       this.expensiveCalculation();
       
       // 解决方案: 限流或条件执行
       if (this.shouldUpdate()) {
         this.expensiveCalculation();
       }
     }
     
     // 使用OnPush策略减少检测频率
     @Component({
       /*...*/
       changeDetection: ChangeDetectionStrategy.OnPush
     })
     ```

#### 1.2.2 @Input() 和 @Output() 装饰器

- **@Input() 装饰器基础**

  ```typescript
  // 基本用法
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

- **@Input() 高级用法**

  ```typescript
  // 1. 使用getter与setter拦截输入属性变化
  @Component({/*...*/})
  export class TemperatureConverterComponent {
    // 私有属性保存实际值
    private _celsius: number = 0;
    
    // celsius输入属性的getter
    get celsius(): number {
      return this._celsius;
    }
    
    // celsius输入属性的setter
    @Input()
    set celsius(value: number) {
      this._celsius = value;
      // 当celsius值变化时自动更新fahrenheit值
      this._fahrenheit = this.convertCtoF(value);
    }
    
    // 另一个私有属性
    private _fahrenheit: number = 32;
    
    // fahrenheit输入属性的getter
    get fahrenheit(): number {
      return this._fahrenheit;
    }
    
    // fahrenheit输入属性的setter
    @Input()
    set fahrenheit(value: number) {
      this._fahrenheit = value;
      // 当fahrenheit值变化时自动更新celsius值
      this._celsius = this.convertFtoC(value);
    }
    
    // 转换函数
    private convertCtoF(c: number): number {
      return c * 9 / 5 + 32;
    }
    
    private convertFtoC(f: number): number {
      return (f - 32) * 5 / 9;
    }
  }
  
  // 2. 转换和验证输入值
  @Component({/*...*/})
  export class ProductComponent {
    private _price: number;
    
    @Input()
    set price(value: any) {
      // 转换输入值
      const numericValue = Number(value);
      
      // 验证输入值
      if (isNaN(numericValue) || numericValue < 0) {
        console.warn('Invalid price value, using 0 instead');
        this._price = 0;
      } else {
        this._price = numericValue;
      }
    }
    
    get price(): number {
      return this._price;
    }
    
    // 格式化的价格（依赖于price输入属性）
    get formattedPrice(): string {
      return `¥${this._price.toFixed(2)}`;
    }
  }
  
  // 3. 深拷贝输入对象以避免引用问题
  @Component({/*...*/})
  export class DataDisplayComponent implements OnChanges {
    // 原始输入对象
    @Input() config: any;
    
    // 本地处理过的副本
    private _localConfig: any;
    
    ngOnChanges(changes: SimpleChanges) {
      if (changes['config']) {
        // 创建深拷贝避免引用修改
        this._localConfig = JSON.parse(JSON.stringify(this.config));
        
        // 应用额外的默认值
        this._localConfig.showHeader = this._localConfig.showHeader ?? true;
        this._localConfig.maxItems = this._localConfig.maxItems ?? 10;
      }
    }
    
    // 组件内部使用_localConfig而非直接使用config
  }
  ```

- **@Output() 装饰器基础**

  ```typescript
  // 1. 基本用法
  @Component({
    selector: 'app-counter',
    template: `
      <div>
        <p>Current Count: {{ count }}</p>
        <button (click)="increment()">+</button>
        <button (click)="decrement()">-</button>
        <button (click)="reset()">Reset</button>
      </div>
    `
  })
  export class CounterComponent {
    count = 0;
    
    // 基本事件输出
    @Output() countChange = new EventEmitter<number>();
    
    // 自定义事件名称
    @Output('resetEvent') resetEmitter = new EventEmitter<void>();
    
    increment() {
      this.count++;
      this.countChange.emit(this.count);
    }
    
    decrement() {
      this.count--;
      this.countChange.emit(this.count);
    }
    
    reset() {
      this.count = 0;
      this.countChange.emit(this.count);
      this.resetEmitter.emit();
    }
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-counter 
        (countChange)="onCountChange($event)"
        (resetEvent)="onReset()">
      </app-counter>
      <p>最新计数: {{ latestCount }}</p>
    `
  })
  export class ParentComponent {
    latestCount = 0;
    
    onCountChange(newCount: number) {
      this.latestCount = newCount;
      console.log('计数已更改:', newCount);
    }
    
    onReset() {
      console.log('计数器已重置');
    }
  }
  ```

- **@Output() 高级用法**

  ```typescript
  // 1. 发送复杂数据
  @Component({
    selector: 'app-search',
    template: `
      <div>
        <input [(ngModel)]="searchTerm" />
        <select [(ngModel)]="searchType">
          <option value="name">名称</option>
          <option value="id">ID</option>
          <option value="tag">标签</option>
        </select>
        <button (click)="doSearch()">搜索</button>
      </div>
    `
  })
  export class SearchComponent {
    searchTerm = '';
    searchType = 'name';
    
    // 发送复杂对象数据
    @Output() search = new EventEmitter<SearchCriteria>();
    
    doSearch() {
      const criteria: SearchCriteria = {
        term: this.searchTerm,
        type: this.searchType,
        timestamp: new Date(),
        filters: this.getActiveFilters()
      };
      
      this.search.emit(criteria);
    }
    
    private getActiveFilters() {
      // 返回当前活动的过滤器配置
      return { /* ... */ };
    }
  }
  
  // 2. 使用Observable创建高级事件流
  @Component({/*...*/})
  export class AdvancedComponent implements OnInit {
    // 使用Subject作为事件源
    private itemSelectSubject = new Subject<any>();
    
    // 暴露为Output的Observable
    @Output() itemSelect = this.itemSelectSubject.asObservable();
    
    // 另一个使用操作符转换的输出
    @Output() itemSelectDebounced = this.itemSelectSubject.pipe(
      debounceTime(300), // 防抖动
      distinctUntilChanged() // 仅当值变化时触发
    );
    
    ngOnInit() {
      // 初始化组件逻辑...
    }
    
    selectItem(item: any) {
      // 使用Subject发送事件
      this.itemSelectSubject.next(item);
    }
  }
  
  // 3. 多流合并为单一输出
  @Component({/*...*/})
  export class MergedEventsComponent implements OnInit {
    // 不同的事件源
    private clickSubject = new Subject<MouseEvent>();
    private hoverSubject = new Subject<MouseEvent>();
    private keySubject = new Subject<KeyboardEvent>();
    
    // 合并为单一交互事件流
    @Output() userInteraction = merge(
      this.clickSubject.pipe(map(e => ({ type: 'click', event: e }))),
      this.hoverSubject.pipe(map(e => ({ type: 'hover', event: e }))),
      this.keySubject.pipe(map(e => ({ type: 'key', event: e })))
    );
    
    onClick(event: MouseEvent) {
      this.clickSubject.next(event);
    }
    
    onHover(event: MouseEvent) {
      this.hoverSubject.next(event);
    }
    
    onKeyEvent(event: KeyboardEvent) {
      this.keySubject.next(event);
    }
  }
  ```

- **双向数据绑定 [(ngModel)]**

  ```typescript
  // 1. 创建支持双向绑定的组件
  @Component({
    selector: 'app-custom-input',
    template: `
      <div class="custom-input">
        <label>{{ label }}</label>
        <input 
          [value]="value" 
          (input)="onInput($event)"
          [disabled]="disabled" />
      </div>
    `
  })
  export class CustomInputComponent {
    // 输入属性
    @Input() value: string;
    @Input() label: string = '';
    @Input() disabled: boolean = false;
    
    // 与输入属性对应的输出事件(必须命名为inputChange)
    @Output() valueChange = new EventEmitter<string>();
    
    onInput(event: Event) {
      const input = event.target as HTMLInputElement;
      // 获取新值并发出事件
      this.value = input.value;
      this.valueChange.emit(this.value);
    }
  }
  
  // 2. 在父组件中使用双向绑定
  @Component({
    selector: 'app-form',
    template: `
      <div class="form">
        <!-- 使用双向绑定语法 [(value)]="name" -->
        <app-custom-input 
          [(value)]="name" 
          label="姓名">
        </app-custom-input>
        
        <p>当前输入的姓名: {{ name }}</p>
      </div>
    `
  })
  export class FormComponent {
    name = '';
  }
  
  // 3. 原生NgModel示例 - 表单控件组件实现
  @Component({
    selector: 'app-rating',
    template: `
      <div class="rating">
        <span 
          *ngFor="let star of stars; let i = index"
          [class.filled]="i < value"
          (click)="setValue(i + 1)">
          ★
        </span>
      </div>
    `,
    providers: [
      // 注册为NG_VALUE_ACCESSOR以支持NgModel
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RatingComponent),
        multi: true
      }
    ]
  })
  export class RatingComponent implements ControlValueAccessor {
    // 内部状态
    value: number = 0;
    disabled: boolean = false;
    stars = [1, 2, 3, 4, 5];
    
    // 回调函数，由Angular表单系统注入
    private onChange: (value: number) => void = () => {};
    private onTouched: () => void = () => {};
    
    // 设置新值
    setValue(value: number) {
      if (this.disabled) return;
      
      this.value = value;
      this.onChange(this.value);
      this.onTouched();
    }
    
    // ControlValueAccessor接口实现
    writeValue(value: number): void {
      this.value = value;
    }
    
    registerOnChange(fn: any): void {
      this.onChange = fn;
    }
    
    registerOnTouched(fn: any): void {
      this.onTouched = fn;
    }
    
    setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
    }
  }
  
  // 4. 使用ControlValueAccessor创建的组件
  @Component({
    template: `
      <form>
        <!-- 可以与ngModel、formControl、formControlName一起使用 -->
        <app-rating [(ngModel)]="userRating" name="rating"></app-rating>
        <p>您的评分: {{ userRating }}</p>
      </form>
    `
  })
  export class RatingFormComponent {
    userRating = 3;
  }
  ```

- **@Input/@Output 结合NgOnChanges**

  ```typescript
  @Component({
    selector: 'app-data-table',
    template: `
      <table>
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{ col.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of processedData">
            <td *ngFor="let col of columns">
              {{ row[col.field] }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button (click)="prevPage()" [disabled]="currentPage === 1">上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="currentPage === totalPages">下一页</button>
      </div>
    `
  })
  export class DataTableComponent implements OnChanges {
    // 输入属性
    @Input() data: any[] = [];
    @Input() columns: {field: string, title: string}[] = [];
    @Input() pageSize: number = 10;
    @Input() sortBy: string = '';
    @Input() filterCriteria: any = null;
    
    // 输出事件
    @Output() pageChange = new EventEmitter<number>();
    @Output() rowSelect = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<void>();
    
    // 内部状态
    currentPage: number = 1;
    totalPages: number = 1;
    processedData: any[] = [];
    
    ngOnChanges(changes: SimpleChanges) {
      // 任何影响数据显示的输入变化都需要重新处理数据
      if (changes['data'] || changes['pageSize'] || 
          changes['sortBy'] || changes['filterCriteria']) {
        
        this.processData();
        
        // 如果数据变更导致当前页无效，则重置到第一页
        if (changes['data'] && !changes['data'].firstChange) {
          const prevDataLength = changes['data'].previousValue?.length || 0;
          const newDataLength = changes['data'].currentValue?.length || 0;
          
          if (prevDataLength !== newDataLength) {
            this.currentPage = 1;
            this.pageChange.emit(this.currentPage);
          }
        }
      }
    }
    
    private processData() {
      if (!this.data || !this.data.length) {
        this.processedData = [];
        this.totalPages = 1;
        return;
      }
      
      // 应用过滤
      let filteredData = this.data;
      if (this.filterCriteria) {
        filteredData = this.applyFilter(filteredData);
      }
      
      // 应用排序
      if (this.sortBy) {
        filteredData = this.applySort(filteredData);
      }
      
      // 计算总页数
      this.totalPages = Math.ceil(filteredData.length / this.pageSize);
      
      // 确保当前页有效
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
      
      // 应用分页
      const startIndex = (this.currentPage - 1) * this.pageSize;
      this.processedData = filteredData.slice(startIndex, startIndex + this.pageSize);
    }
    
    private applyFilter(data: any[]): any[] {
      // 具体的过滤逻辑
      return data.filter(item => {
        // 实现过滤条件
        return true; // 示例，需替换为实际逻辑
      });
    }
    
    private applySort(data: any[]): any[] {
      // 具体的排序逻辑
      return [...data].sort((a, b) => {
        // 实现排序逻辑
        return 0; // 示例，需替换为实际逻辑
      });
    }
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.processData();
        this.pageChange.emit(this.currentPage);
      }
    }
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.processData();
        this.pageChange.emit(this.currentPage);
      }
    }
    
    selectRow(row: any) {
      this.rowSelect.emit(row);
    }
    
    refreshData() {
      this.refresh.emit();
    }
  }
  ```

- **输入/输出属性最佳实践**

  1. **命名约定**

     ```typescript
     @Component({/*...*/})
     export class BestPracticeComponent {
       // 输入属性使用名词或形容词
       @Input() userName: string;
       @Input() isDisabled: boolean;
       @Input() primaryColor: string;
       
       // 输出属性使用动词+名词的事件命名
       @Output() valueChange = new EventEmitter<string>();
       @Output() buttonClick = new EventEmitter<void>();
       @Output() userSelect = new EventEmitter<User>();
     }
     ```

  2. **默认值与输入验证**

     ```typescript
     @Component({/*...*/})
     export class ConfigurableComponent implements OnInit {
       // 提供合理的默认值
       @Input() maxItems: number = 10;
       @Input() theme: 'light' | 'dark' = 'light';
       @Input() refreshInterval: number = 60000; // 毫秒
       
       ngOnInit() {
         // 验证数值范围
         if (this.maxItems < 1 || this.maxItems > 100) {
           console.warn('maxItems超出有效范围，重置为默认值10');
           this.maxItems = 10;
         }
         
         // 确保刷新间隔合理
         if (this.refreshInterval < 5000) {
           console.warn('refreshInterval太小可能导致性能问题，设置为最小值5000ms');
           this.refreshInterval = 5000;
         }
       }
     }
     ```

  3. **文档注释**

     ```typescript
     @Component({/*...*/})
     export class DocumentedComponent {
       /**
        * 用户角色控制访问权限
        * @default 'user'
        */
       @Input() role: 'user' | 'admin' | 'guest' = 'user';
       
       /**
        * 设置组件主题样式
        * @example
        * <app-documented [theme]="'dark'"></app-documented>
        */
       @Input() theme: string;
       
       /**
        * 当数据加载完成时触发
        * @event
        * @emits {DataLoadResult} 加载结果对象，包含数据和状态
        */
       @Output() loadComplete = new EventEmitter<DataLoadResult>();
     }
     ```

  4. **输入属性变更保护**

     ```typescript
     @Component({/*...*/})
     export class ProtectedInputComponent implements OnChanges {
       // 公开的输入属性
       @Input() config: AppConfig;
       
       // 组件内部使用的私有副本
       private _safeConfig: AppConfig;
       
       ngOnChanges(changes: SimpleChanges) {
         if (changes['config']) {
           // 创建安全的不可变副本
           this._safeConfig = this.createImmutableConfig(this.config);
         }
       }
       
       private createImmutableConfig(source: AppConfig): AppConfig {
         // 创建深拷贝以防止外部修改影响内部状态
         const safeCopy = JSON.parse(JSON.stringify(source || {}));
         
         // 添加默认值
         return {
           showHeader: true,
           maxItems: 10,
           theme: 'default',
           ...safeCopy
         };
       }
       
       // 组件内部始终使用_safeConfig而非直接使用config
       get headerVisible(): boolean {
         return this._safeConfig?.showHeader;
       }
     }
     ```

  5. **事件处理最佳实践**

     ```typescript
     @Component({/*...*/})
     export class EventBestPracticeComponent {
       // 1. 使用正确的事件类型
       @Output() selectionChange = new EventEmitter<{id: number, selected: boolean}>();
       
       // 2. 提供聚合事件和细粒度事件
       @Output() errorOccurred = new EventEmitter<Error>(); // 一般错误
       @Output() networkError = new EventEmitter<Error>(); // 特定类型错误
       
       handleError(error: Error) {
         // 总是发出通用错误
         this.errorOccurred.emit(error);
         
         // 根据条件发出特定错误
         if (error instanceof HttpErrorResponse) {
           this.networkError.emit(error);
         }
       }
       
       // 3. 避免过于频繁的事件发送
       @Output() textChange = new EventEmitter<string>();
       @Output() textChangeDebounced = new EventEmitter<string>();
       
       private textChangeSubject = new Subject<string>();
       
       ngOnInit() {
         // 创建节流后的事件
         this.textChangeSubject.pipe(
           debounceTime(300) // 300ms内的变化将被合并
         ).subscribe(text => {
           this.textChangeDebounced.emit(text);
         });
       }
       
       onTextInput(text: string) {
         // 立即发出(适用于实时预览)
         this.textChange.emit(text);
         
         // 节流发出(适用于搜索或昂贵操作)
         this.textChangeSubject.next(text);
       }
     }
     ```

#### 1.2.3 ViewChild 和 ContentChild

- **ViewChild基础**

  ```typescript
  @Component({
    selector: 'app-parent',
    template: `
      <div>
        <h2>父组件</h2>
        <!-- DOM元素引用 -->
        <div #header>Header区域</div>
        
        <!-- 组件引用 -->
        <app-child #childComponent></app-child>
        
        <button (click)="accessChild()">访问子组件</button>
      </div>
    `
  })
  export class ParentComponent implements AfterViewInit {
    // 使用模板引用变量获取引用
    @ViewChild('header') headerElement: ElementRef;
    
    // 使用模板引用变量获取组件引用
    @ViewChild('childComponent') child: ChildComponent;
    
    // 通过组件类型获取引用(不需要模板引用变量)
    @ViewChild(ChildComponent) childComponentByType: ChildComponent;
    
    // 获取到组件实例
    accessChild() {
      // 调用子组件方法
      this.child.sayHello();
      
      // 访问子组件属性
      console.log('Child message:', this.child.message);
      
      // 直接操作DOM (一般不推荐，但有时必要)
      this.headerElement.nativeElement.style.color = 'blue';
    }
    
    ngAfterViewInit() {
      // 注意：视图初始化后才能访问视图查询结果
      console.log('View initialized');
      console.log('Header element:', this.headerElement);
      console.log('Child component:', this.child);
    }
  }
  ```

- **ViewChild引用类型**

  ```typescript
  @Component({
    selector: 'app-reference-demo',
    template: `
      <div>
        <div #divElement>DOM元素</div>
        <app-child #childComp></app-child>
        <ng-template #tpl>模板内容</ng-template>
        <input #inputRef type="text">
      </div>
    `
  })
  export class ReferenceDemoComponent implements AfterViewInit {
    // 1. 默认获取ElementRef
    @ViewChild('divElement') div: ElementRef;
    
    // 2. 使用read选项指定引用类型
    // 获取DOM元素的不同引用类型
    @ViewChild('divElement', { read: ElementRef }) divAsElement: ElementRef;
    @ViewChild('divElement', { read: ViewContainerRef }) 
    divAsContainer: ViewContainerRef; // 动态加载组件的容器
    
    // 3. 模板引用
    @ViewChild('tpl') template: TemplateRef<any>;
    
    // 4. 原生DOM元素
    @ViewChild('inputRef', { read: ElementRef }) inputElementRef: ElementRef;
    
    // 等效于:
    @ViewChild('inputRef') inputElement: ElementRef<HTMLInputElement>;
    
    ngAfterViewInit() {
      // ElementRef包含对DOM元素的引用
      console.log('Div native element:', this.div.nativeElement);
      
      // 强类型化的HTMLInputElement访问
      this.inputElement.nativeElement.focus();
      this.inputElement.nativeElement.value = '预填充内容';
      
      // 使用ViewContainerRef加载动态内容
      const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicComponent);
      this.divAsContainer.createComponent(factory);
      
      // 渲染TemplateRef内容
      this.viewContainer.createEmbeddedView(this.template);
    }
    
    constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private viewContainer: ViewContainerRef
    ) {}
  }
  ```

- **静态和动态查询**

  ```typescript
  @Component({
    selector: 'app-query-timing',
    template: `
      <div>
        <!-- 固定存在的元素 -->
        <div #staticDiv>Static Content</div>
        
        <!-- 条件显示的元素 -->
        <div *ngIf="showDynamic" #dynamicDiv>Dynamic Content</div>
      </div>
    `
  })
  export class QueryTimingComponent implements OnInit, AfterViewInit {
    showDynamic = false;
    
    // 静态查询 - 在ngOnInit之前可用
    @ViewChild('staticDiv', { static: true })
    staticElement: ElementRef;
    
    // 动态查询(默认) - 在AfterViewInit之前可用
    @ViewChild('dynamicDiv')
    dynamicElement: ElementRef;  // { static: false } 是默认值
    
    ngOnInit() {
      // 静态查询结果在这里可用
      console.log('OnInit - Static element:', this.staticElement); // 有效
      console.log('OnInit - Dynamic element:', this.dynamicElement); // undefined
      
      // 三秒后显示动态内容
      setTimeout(() => {
        this.showDynamic = true;
      }, 3000);
    }
    
    ngAfterViewInit() {
      // 两种查询都在这里可用 (如果元素存在)
      console.log('AfterViewInit - Static element:', this.staticElement);
      console.log('AfterViewInit - Dynamic element:', this.dynamicElement); // 仍为undefined，因为showDynamic=false
      
      // 监听动态元素变化
      this.changeDetector.changes.subscribe(() => {
        console.log('View updated - Dynamic element:', this.dynamicElement);
      });
    }
    
    constructor(private changeDetector: ChangeDetectorRef) {}
  }
  ```

- **ViewChildren - 多元素查询**

  ```typescript
  @Component({
    selector: 'app-list-parent',
    template: `
      <div>
        <app-list-item *ngFor="let item of items" [data]="item"></app-list-item>
        <button (click)="addItem()">添加项目</button>
      </div>
    `
  })
  export class ListParentComponent implements AfterViewInit {
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' }
    ];
    
    // 查询所有ListItemComponent实例
    @ViewChildren(ListItemComponent)
    listItems: QueryList<ListItemComponent>;
    
    ngAfterViewInit() {
      // QueryList提供一个可观察的接口
      console.log('初始项目数量:', this.listItems.length);
      
      // 转换为数组进行操作
      const itemsArray = this.listItems.toArray();
      itemsArray.forEach((item, index) => {
        console.log(`项目 ${index}:`, item.data);
      });
      
      // 监听列表变化
      this.listItems.changes.subscribe(items => {
        console.log('列表已更新，当前项目数:', items.length);
      });
    }
    
    addItem() {
      const newId = this.items.length + 1;
      this.items.push({ id: newId, name: `项目${newId}` });
    }
  }
  
  @Component({
    selector: 'app-list-item',
    template: `<div>{{data?.name}}</div>`
  })
  export class ListItemComponent {
    @Input() data: any;
  }
  ```

- **ContentChild基础**

  ```typescript
  // 子组件(接收内容投影)
  @Component({
    selector: 'app-card',
    template: `
      <div class="card">
        <div class="card-header">
          <ng-content select="[header]"></ng-content>
        </div>
        <div class="card-body">
          <ng-content></ng-content>
        </div>
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    `
  })
  export class CardComponent implements AfterContentInit {
    // 查询投影内容中的元素
    @ContentChild('titleContent') titleContent: ElementRef;
    
    // 查询投影内容中的组件
    @ContentChild(HeaderComponent) headerComponent: HeaderComponent;
    
    ngAfterContentInit() {
      // 内容初始化后可以访问投影内容
      console.log('投影的标题元素:', this.titleContent);
      
      if (this.headerComponent) {
        console.log('投影的头部组件:', this.headerComponent);
        // 可以访问头部组件的公共API
        this.headerComponent.highlight();
      }
    }
  }
  
  // 父组件(提供内容投影)
  @Component({
    selector: 'app-content-demo',
    template: `
      <app-card>
        <div header>
          <h2 #titleContent>卡片标题</h2>
          <app-header></app-header>
        </div>
        
        <div>这是卡片的主体内容</div>
        
        <button footer>操作按钮</button>
      </app-card>
    `
  })
  export class ContentDemoComponent {}
  
  // 头部组件
  @Component({
    selector: 'app-header',
    template: `<div>自定义头部</div>`
  })
  export class HeaderComponent {
    highlight() {
      console.log('HeaderComponent: highlight方法被调用');
    }
  }
  ```

- **ContentChildren - 多内容查询**

  ```typescript
  // Tab容器组件
  @Component({
    selector: 'app-tabs',
    template: `
      <div class="tabs">
        <!-- 标签页标题区域 -->
        <div class="tab-headers">
          <div 
            *ngFor="let tab of tabComponents; let i = index"
            class="tab-header"
            [class.active]="selectedIndex === i"
            (click)="selectTab(i)">
            {{ tab.title }}
          </div>
        </div>
        
        <!-- 标签页内容区域 -->
        <div class="tab-body">
          <ng-content></ng-content>
        </div>
      </div>
    `
  })
  export class TabsComponent implements AfterContentInit {
    // 查询所有的TabComponent
    @ContentChildren(TabComponent)
    tabComponents: QueryList<TabComponent>;
    
    selectedIndex = 0;
    
    ngAfterContentInit() {
      // 内容初始化后配置标签页
      console.log('标签页数量:', this.tabComponents.length);
      
      // 默认显示第一个标签页内容，隐藏其他标签页
      this.updateTabVisibility();
      
      // 监听标签页变化
      this.tabComponents.changes.subscribe(() => {
        console.log('标签页已更新');
        this.updateTabVisibility();
      });
    }
    
    selectTab(index: number) {
      this.selectedIndex = index;
      this.updateTabVisibility();
    }
    
    private updateTabVisibility() {
      this.tabComponents.forEach((tab, index) => {
        // 只显示选中的标签页内容
        tab.active = index === this.selectedIndex;
      });
    }
  }
  
  // 单个标签页组件
  @Component({
    selector: 'app-tab',
    template: `
      <div *ngIf="active" class="tab-content">
        <ng-content></ng-content>
      </div>
    `
  })
  export class TabComponent {
    @Input() title: string;
    active = false;
  }
  
  // 父组件（使用标签页）
  @Component({
    selector: 'app-tab-demo',
    template: `
      <app-tabs>
        <app-tab title="个人信息">
          <h3>个人信息标签页</h3>
          <p>用户详情内容...</p>
        </app-tab>
        
        <app-tab title="账户设置">
          <h3>账户设置标签页</h3>
          <p>设置选项...</p>
        </app-tab>
        
        <app-tab title="通知">
          <h3>通知标签页</h3>
          <p>通知列表...</p>
        </app-tab>
      </app-tabs>
    `
  })
  export class TabDemoComponent {}
  ```

- **内容投影生命周期**

  ```typescript
  @Component({
    selector: 'app-lifecycle-demo',
    template: `
      <div>
        <h2>生命周期顺序示例</h2>
        <app-container>
          <app-content-child></app-content-child>
        </app-container>
      </div>
    `
  })
  export class LifecycleDemoComponent {}
  
  @Component({
    selector: 'app-container',
    template: `
      <div class="container">
        <p>容器组件</p>
        <ng-content></ng-content>
      </div>
    `
  })
  export class ContainerComponent implements 
    OnInit, 
    AfterContentInit, 
    AfterContentChecked,
    AfterViewInit, 
    AfterViewChecked {
    
    @ContentChild(ContentChildComponent) 
    contentChild: ContentChildComponent;
    
    @ViewChild('ownContent') ownContent: ElementRef;
    
    constructor() {
      console.log('[Container] 1. 构造函数');
    }
    
    ngOnInit() {
      console.log('[Container] 2. ngOnInit');
      console.log('  - contentChild:', this.contentChild); // 未定义
      console.log('  - ownContent:', this.ownContent); // 未定义
    }
    
    ngAfterContentInit() {
      console.log('[Container] 3. ngAfterContentInit');
      console.log('  - contentChild:', this.contentChild); // 已定义
      console.log('  - ownContent:', this.ownContent); // 未定义
    }
    
    ngAfterContentChecked() {
      console.log('[Container] 4. ngAfterContentChecked');
    }
    
    ngAfterViewInit() {
      console.log('[Container] 5. ngAfterViewInit');
      console.log('  - contentChild:', this.contentChild); // 已定义
      console.log('  - ownContent:', this.ownContent); // 已定义
    }
    
    ngAfterViewChecked() {
      console.log('[Container] 6. ngAfterViewChecked');
    }
  }
  
  @Component({
    selector: 'app-content-child',
    template: `<p>投影内容组件</p>`
  })
  export class ContentChildComponent implements OnInit {
    ngOnInit() {
      console.log('[ContentChild] ngOnInit - 在Container的ngOnInit之前执行');
    }
  }
  ```

- **最佳实践和常见问题**

  ```typescript
  // 1. 避免在订阅外部修改ContentChild/ViewChild
  @Component({/*...*/})
  export class BestPracticeComponent implements AfterViewInit {
    @ViewChild('myInput') input: ElementRef<HTMLInputElement>;
    
    ngAfterViewInit() {
      // 问题: 直接在AfterViewInit中修改视图属性
      // 会导致ExpressionChangedAfterItHasBeenCheckedError
      // this.input.nativeElement.value = 'New Value'; // 可能导致错误
      
      // 解决方案1: 使用setTimeout推迟到下一个变更检测周期
      setTimeout(() => {
        this.input.nativeElement.value = 'New Value';
      });
      
      // 解决方案2: 对于非绑定属性，使用原生DOM API
      this.input.nativeElement.setAttribute('data-initialized', 'true');
    }
  }
  
  // 2. 处理可能为空的查询
  @Component({/*...*/})
  export class NullSafeComponent implements AfterViewInit {
    // 可能为空的查询（例如，*ngIf条件不满足时）
    @ViewChild('conditionalElement') element?: ElementRef;
    
    ngAfterViewInit() {
      // 使用可选链操作符
      const width = this.element?.nativeElement.offsetWidth;
      
      // 或使用if检查
      if (this.element) {
        this.element.nativeElement.classList.add('initialized');
      }
    }
  }
  
  // 3. 处理动态变化的内容
  @Component({/*...*/})
  export class DynamicContentComponent implements AfterContentInit {
    @ContentChildren(ItemComponent) items: QueryList<ItemComponent>;
    
    ngAfterContentInit() {
      // 初始设置
      this.configureItems();
      
      // 监听将来的变化
      this.items.changes.subscribe(() => {
        console.log('Content children变化了');
        this.configureItems();
      });
    }
    
    private configureItems() {
      // 处理当前所有的items
      this.items.forEach((item, index) => {
        item.position = index;
      });
    }
  }
  
  // 4. 查询时结合使用forwardRef避免循环引用
  // 当出现互相引用的组件时
  @Component({
    selector: 'app-circular',
    template: `<div>与CircularChildComponent互相引用</div>`
  })
  export class CircularParentComponent {
    @ViewChild(forwardRef(() => CircularChildComponent))
    childComponent: CircularChildComponent;
  }
  
  @Component({
    selector: 'app-circular-child',
    template: `<div>引用父组件</div>`
  })
  export class CircularChildComponent {
    @ViewChild(forwardRef(() => CircularParentComponent))
    parentComponent: CircularParentComponent;
  }
  
  // 5. 通过选择器灵活查询
  @Component({/*...*/})
  export class SelectorQueryComponent implements AfterViewInit {
    // 使用CSS选择器语法查询
    @ViewChildren('header, footer, .important')
    importantElements: QueryList<ElementRef>;
    
    // 组合多种选择器
    @ContentChildren('button[primary], button.accent')
    specialButtons: QueryList<ElementRef>;
    
    ngAfterViewInit() {
      console.log('找到的重要元素:', this.importantElements.length);
      console.log('找到的特殊按钮:', this.specialButtons.length);
    }
  }
  ```

- **ViewChild与ContentChild对比**

  | 特性 | ViewChild/ViewChildren | ContentChild/ContentChildren |
  |------|------------------------|------------------------------|
  | 查询范围 | 组件模板中的元素和子组件 | 通过ng-content投影到组件中的元素和子组件 |
  | 可用阶段 | AfterViewInit和AfterViewChecked | AfterContentInit和AfterContentChecked |
  | 主要用途 | 访问组件视图中的DOM和子组件 | 访问和控制投影内容 |
  | 典型用例 | 操作视图元素、调用子组件方法 | 实现可复合组件、处理投影内容 |

  ```typescript
  // 使用ContentChild实现可组合组件
  @Component({
    selector: 'app-advanced-select',
    template: `
      <div class="select-container">
        <!-- 头部区域，使用默认或投影内容 -->
        <div class="select-header">
          <ng-content select="[select-header]">
          </ng-content>
          
          <!-- 无投影内容时显示的默认样式 -->
          <div *ngIf="!hasCustomHeader" class="default-header">
            {{ label || 'Select an option' }}
          </div>
        </div>
        
        <!-- 下拉选项区域 -->
        <div *ngIf="isOpen" class="options-list">
          <ng-content select="app-select-option"></ng-content>
          
          <!-- 无选项时的提示 -->
          <div *ngIf="!hasOptions" class="no-options">
            无可用选项
          </div>
        </div>
      </div>
    `
  })
  export class AdvancedSelectComponent implements AfterContentInit {
    @Input() label: string;
    
    // 检查是否有自定义头部
    @ContentChild('customHeader') customHeader: any;
    get hasCustomHeader(): boolean {
      return !!this.customHeader;
    }
    
    // 获取所有选项组件
    @ContentChildren(SelectOptionComponent)
    options: QueryList<SelectOptionComponent>;
    
    get hasOptions(): boolean {
      return this.options?.length > 0;
    }
    
    isOpen = false;
    
    ngAfterContentInit() {
      // 配置选项组件
      if (this.hasOptions) {
        // 设置选择事件监听
        this.options.forEach(option => {
          option.selected$.subscribe(() => {
            this.handleOptionSelected(option);
          });
        });
        
        // 监听选项变化
        this.options.changes.subscribe(() => {
          // 重新配置选项...
        });
      }
    }
    
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    }
    
    private handleOptionSelected(option: SelectOptionComponent) {
      // 取消选择其他选项
      this.options.forEach(o => {
        if (o !== option) {
          o.isSelected = false;
        }
      });
      
      // 关闭下拉菜单
      this.isOpen = false;
    }
  }
  
  @Component({
    selector: 'app-select-option',
    template: `
      <div 
        class="option" 
        [class.selected]="isSelected"
        (click)="select()">
        <ng-content></ng-content>
      </div>
    `
  })
  export class SelectOptionComponent {
    @Input() value: any;
    
    private _isSelected = false;
    
    get isSelected(): boolean {
      return this._isSelected;
    }
    
    set isSelected(value: boolean) {
      this._isSelected = value;
    }
    
    // 选择事件流
    private selectedSubject = new Subject<void>();
    selected$ = this.selectedSubject.asObservable();
    
    select() {
      this._isSelected = true;
      this.selectedSubject.next();
    }
  }
  
  // 使用复合组件
  @Component({
    selector: 'app-select-demo',
    template: `
      <app-advanced-select>
        <!-- 自定义头部 -->
        <div select-header #customHeader>
          <span class="custom-header">
            <i class="icon-user"></i> 选择用户
          </span>
        </div>
        
        <!-- 选项 -->
        <app-select-option [value]="1">张三</app-select-option>
        <app-select-option [value]="2">李四</app-select-option>
        <app-select-option [value]="3">王五</app-select-option>
      </app-advanced-select>
    `
  })
  export class SelectDemoComponent {}
  ```

#### 1.2.4 组件通信方式

- **父组件向子组件通信**

  ```typescript
  // 1. 使用@Input装饰器
  
  // 子组件
  @Component({
    selector: 'app-child',
    template: `
      <div class="child">
        <h3>子组件</h3>
        <p>接收到的数据: {{ data | json }}</p>
        <p>接收到的配置: {{ config?.showHeader ? '显示' : '隐藏' }}标题</p>
      </div>
    `
  })
  export class ChildComponent {
    // 基本数据输入
    @Input() data: any;
    
    // 复杂对象输入
    @Input() config: {
      showHeader: boolean;
      theme: string;
      maxItems?: number;
    };
    
    // 带setter的输入属性
    private _items: string[] = [];
    
    @Input() 
    set items(items: string[]) {
      this._items = items || [];
      // 输入属性变化时执行额外逻辑
      this.itemsChanged();
    }
    
    get items(): string[] {
      return this._items;
    }
    
    private itemsChanged() {
      console.log('Items changed to:', this._items);
    }
  }
  
  // 父组件
  @Component({
    selector: 'app-parent',
    template: `
      <div class="parent">
        <h2>父组件</h2>
        <button (click)="updateData()">更新数据</button>
        
        <!-- 传递数据给子组件 -->
        <app-child 
          [data]="parentData"
          [config]="componentConfig"
          [items]="dataItems">
        </app-child>
      </div>
    `
  })
  export class ParentComponent {
    parentData = {
      id: 1,
      name: '示例数据'
    };
    
    componentConfig = {
      showHeader: true,
      theme: 'light'
    };
    
    dataItems = ['项目1', '项目2', '项目3'];
    
    updateData() {
      // 更新对象引用，触发子组件输入属性变化
      this.parentData = { ...this.parentData, name: '更新的数据' };
      
      // 添加新项目
      this.dataItems = [...this.dataItems, '新项目'];
      
      // 修改配置
      this.componentConfig = {
        ...this.componentConfig,
        showHeader: !this.componentConfig.showHeader
      };
    }
  }
  ```

- **子组件向父组件通信**

  ```typescript
  // 1. 使用@Output装饰器和EventEmitter
  
  // 子组件
  @Component({
    selector: 'app-child',
    template: `
      <div class="child">
        <h3>子组件</h3>
        <input [(ngModel)]="inputValue" placeholder="输入内容">
        <button (click)="sendData()">发送到父组件</button>
        <button (click)="notifyDelete()">删除</button>
      </div>
    `
  })
  export class ChildComponent {
    inputValue: string = '';
    
    // 定义输出事件
    @Output() dataChange = new EventEmitter<string>();
    
    // 带自定义事件对象的输出
    @Output() itemDelete = new EventEmitter<{id: number, confirm: boolean}>();
    
    // 使用别名的输出事件
    @Output('valueUpdate') valueEmitter = new EventEmitter<any>();
    
    // 发送简单数据
    sendData() {
      if (this.inputValue) {
        this.dataChange.emit(this.inputValue);
      }
    }
    
    // 发送复杂数据
    notifyDelete() {
      const deleteEvent = {
        id: 123,
        confirm: window.confirm('确定要删除吗?')
      };
      
      this.itemDelete.emit(deleteEvent);
    }
    
    // 发送复杂对象
    sendValue(value: any) {
      this.valueEmitter.emit({
        value,
        timestamp: new Date(),
        source: 'child-component'
      });
    }
  }
  
  // 父组件
  @Component({
    selector: 'app-parent',
    template: `
      <div class="parent">
        <h2>父组件</h2>
        <p *ngIf="receivedData">收到的数据: {{ receivedData }}</p>
        
        <!-- 监听子组件事件 -->
        <app-child 
          (dataChange)="handleDataChange($event)"
          (itemDelete)="handleItemDelete($event)"
          (valueUpdate)="handleValueUpdate($event)">
        </app-child>
      </div>
    `
  })
  export class ParentComponent {
    receivedData: string;
    
    handleDataChange(data: string) {
      this.receivedData = data;
      console.log('收到子组件数据:', data);
    }
    
    handleItemDelete(event: {id: number, confirm: boolean}) {
      console.log('删除项目:', event);
      if (event.confirm) {
        // 执行删除逻辑
        console.log(`删除ID为${event.id}的项目`);
      }
    }
    
    handleValueUpdate(eventData: any) {
      console.log('值更新事件:', eventData);
      // 处理带时间戳的数据
    }
  }
  ```

- **双向数据绑定**

  ```typescript
  // 1. 使用[(ngModel)]语法
  
  // 自定义组件实现双向绑定
  @Component({
    selector: 'app-counter',
    template: `
      <div class="counter">
        <button (click)="decrement()">-</button>
        <span>{{ value }}</span>
        <button (click)="increment()">+</button>
      </div>
    `
  })
  export class CounterComponent {
    // 输入属性
    @Input() value: number = 0;
    
    // 输出事件(必须命名为valueChange才能双向绑定)
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
  
  // 父组件使用双向绑定
  @Component({
    selector: 'app-parent',
    template: `
      <div class="parent">
        <h2>双向绑定示例</h2>
        <p>当前计数: {{ counter }}</p>
        
        <!-- 使用双向绑定语法 -->
        <app-counter [(value)]="counter"></app-counter>
        
        <!-- 等价于: -->
        <!-- 
        <app-counter 
          [value]="counter" 
          (valueChange)="counter = $event">
        </app-counter>
        -->
      </div>
    `
  })
  export class ParentComponent {
    counter = 5;
  }
  
  // 2. 使用ControlValueAccessor实现表单双向绑定
  @Component({
    selector: 'app-custom-input',
    template: `
      <div class="custom-input">
        <input 
          [value]="value" 
          (input)="onInputChange($event)"
          [disabled]="disabled" />
      </div>
    `,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CustomInputComponent),
        multi: true
      }
    ]
  })
  export class CustomInputComponent implements ControlValueAccessor {
    value: string = '';
    disabled: boolean = false;
    
    // ControlValueAccessor回调函数
    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};
    
    // 当用户输入时触发
    onInputChange(event: Event) {
      const value = (event.target as HTMLInputElement).value;
      this.value = value;
      this.onChange(value);
      this.onTouched();
    }
    
    // ControlValueAccessor接口实现
    writeValue(value: string): void {
      this.value = value || '';
    }
    
    registerOnChange(fn: any): void {
      this.onChange = fn;
    }
    
    registerOnTouched(fn: any): void {
      this.onTouched = fn;
    }
    
    setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
    }
  }
    
  // 在表单中使用自定义输入控件
  @Component({
    selector: 'app-form',
    template: `
      <div class="form">
        <h2>表单示例</h2>
        <form [formGroup]="userForm">
          <label>用户名:</label>
          <!-- 在表单中使用自定义控件 -->
          <app-custom-input formControlName="username"></app-custom-input>
          
          <div *ngIf="username.invalid && username.touched">
            用户名是必填的
          </div>
        </form>
        
        <p>表单值: {{ userForm.value | json }}</p>
      </div>
    `
  })
  export class FormComponent implements OnInit {
    userForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.userForm = this.fb.group({
        username: ['', Validators.required]
      });
    }
    
    get username() {
      return this.userForm.get('username');
    }
  }
  ```

- **通过服务通信**

  ```typescript
  // 1. 使用共享服务
  
  // 共享数据服务
  @Injectable({
    providedIn: 'root'  // 应用级单例
  })
  export class SharedDataService {
    // 使用BehaviorSubject存储当前值并提供初始值
    private dataSubject = new BehaviorSubject<any>({
      items: [],
      lastUpdated: null
    });
    
    // 将Subject转为Observable以防止外部直接调用next()
    data$ = this.dataSubject.asObservable();
    
    // 更新数据的方法
    updateData(newData: any) {
      // 获取当前数据
      const currentData = this.dataSubject.getValue();
      
      // 合并并更新数据
      const updatedData = {
        ...currentData,
        ...newData,
        lastUpdated: new Date()
      };
      
      // 发出新的数据
      this.dataSubject.next(updatedData);
    }
    
    // 添加项目
    addItem(item: any) {
      const currentData = this.dataSubject.getValue();
      
      this.dataSubject.next({
        ...currentData,
        items: [...currentData.items, item],
        lastUpdated: new Date()
      });
    }
    
    // 重置数据
    resetData() {
      this.dataSubject.next({
        items: [],
        lastUpdated: null
      });
    }
  }
  
  // 组件A - 发送方
  @Component({
    selector: 'app-sender',
    template: `
      <div class="sender">
        <h3>发送组件</h3>
        <input [(ngModel)]="newItemName" placeholder="项目名称">
        <button (click)="addItem()">添加项目</button>
        <button (click)="resetItems()">重置</button>
      </div>
    `
  })
  export class SenderComponent {
    newItemName = '';
    
    constructor(private sharedDataService: SharedDataService) {}
    
    addItem() {
      if (this.newItemName.trim()) {
        const newItem = {
          id: Date.now(),
          name: this.newItemName,
          createdAt: new Date()
        };
        
        this.sharedDataService.addItem(newItem);
        this.newItemName = '';
      }
    }
    
    resetItems() {
      this.sharedDataService.resetData();
    }
  }
  
  // 组件B - 接收方
  @Component({
    selector: 'app-receiver',
    template: `
      <div class="receiver">
        <h3>接收组件</h3>
        <p *ngIf="lastUpdated">最后更新: {{ lastUpdated | date:'medium' }}</p>
        
        <ul>
          <li *ngFor="let item of items">
            {{ item.name }}
          </li>
        </ul>
        
        <p *ngIf="items.length === 0">暂无数据</p>
      </div>
    `
  })
  export class ReceiverComponent implements OnInit, OnDestroy {
    items: any[] = [];
    lastUpdated: Date | null = null;
    
    private subscription: Subscription;
    
    constructor(private sharedDataService: SharedDataService) {}
    
    ngOnInit() {
      // 订阅服务数据变化
      this.subscription = this.sharedDataService.data$
        .subscribe(data => {
          this.items = data.items;
          this.lastUpdated = data.lastUpdated;
        });
    }
    
    ngOnDestroy() {
      // 别忘了取消订阅
      this.subscription.unsubscribe();
    }
  }
  
  // 2. 使用状态服务模式
  
  // 状态接口
  interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    preferences: UserPreferences;
    notifications: Notification[];
  }
  
  // 初始状态
  const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    preferences: { theme: 'light', fontSize: 'normal' },
    notifications: []
  };
  
  // 应用状态服务
  @Injectable({
    providedIn: 'root'
  })
  export class AppStateService {
    // 完整状态Subject
    private state = new BehaviorSubject<AppState>(initialState);
    
    // 公开完整状态流
    state$ = this.state.asObservable();
    
    // 派生状态选择器
    user$ = this.state$.pipe(
      map(state => state.user),
      distinctUntilChanged()
    );
    
    isAuthenticated$ = this.state$.pipe(
      map(state => state.isAuthenticated),
      distinctUntilChanged()
    );
    
    preferences$ = this.state$.pipe(
      map(state => state.preferences),
      distinctUntilChanged()
    );
    
    notifications$ = this.state$.pipe(
      map(state => state.notifications)
    );
    
    // 状态更新方法
    
    // 更新用户信息
    updateUser(user: User) {
      this.updateState({
        user,
        isAuthenticated: !!user
      });
    }
    
    // 更新偏好设置
    updatePreferences(preferences: Partial<UserPreferences>) {
      const currentState = this.state.getValue();
      
      this.updateState({
        preferences: {
          ...currentState.preferences,
          ...preferences
        }
      });
    }
    
    // 添加通知
    addNotification(notification: Notification) {
      const currentState = this.state.getValue();
      
      this.updateState({
        notifications: [
          ...currentState.notifications,
          notification
        ]
      });
    }
    
    // 清除通知
    clearNotifications() {
      this.updateState({
        notifications: []
      });
    }
    
    // 登出
    logout() {
      this.updateState({
        user: null,
        isAuthenticated: false,
        notifications: []
      });
    }
    
    // 私有辅助方法来更新状态
    private updateState(partialState: Partial<AppState>) {
      // 获取当前状态
      const currentState = this.state.getValue();
      
      // 合并并发出新状态
      this.state.next({
        ...currentState,
        ...partialState
      });
    }
  }
  
  // 使用状态服务的组件
  @Component({/*...*/})
  export class ProfileComponent implements OnInit, OnDestroy {
    user: User | null = null;
    preferences: UserPreferences;
    
    private subscriptions = new Subscription();
    
    constructor(private appState: AppStateService) {}
    
    ngOnInit() {
      // 使用takeUntil模式更优雅
      const sub1 = this.appState.user$.subscribe(user => {
        this.user = user;
      });
      
      const sub2 = this.appState.preferences$.subscribe(prefs => {
        this.preferences = prefs;
      });
      
      this.subscriptions.add(sub1);
      this.subscriptions.add(sub2);
    }
    
    updateTheme(theme: string) {
      this.appState.updatePreferences({ theme });
    }
    
    ngOnDestroy() {
      this.subscriptions.unsubscribe();
    }
  }
  ```

- **本地变量与ViewChild**

  ```typescript
  // 1. 使用模板引用变量
  
  @Component({
    selector: 'app-parent',
    template: `
      <div class="parent">
        <h2>通过模板变量通信</h2>
        
        <!-- #child是一个模板引用变量 -->
        <app-child #child></app-child>
        
        <button (click)="child.sayHello()">调用子组件方法</button>
        <button (click)="showChildData(child)">显示子组件数据</button>
      </div>
    `
  })
  export class ParentComponent {
    showChildData(childComponent: ChildComponent) {
      console.log('子组件数据:', childComponent.data);
      
      // 直接访问子组件公共方法和属性
      childComponent.data = '更新的数据';
      childComponent.refresh();
    }
  }
  
  @Component({
    selector: 'app-child',
    template: `
      <div class="child">
        <h3>子组件</h3>
        <p>数据: {{ data }}</p>
      </div>
    `
  })
  export class ChildComponent {
    data = '原始数据';
    
    sayHello() {
      alert(`Hello from child! Data: ${this.data}`);
    }
    
    refresh() {
      console.log('刷新子组件');
    }
  }
  
  // 2. 使用ViewChild访问子组件
  
  @Component({
    selector: 'app-parent',
    template: `
      <div class="parent">
        <h2>通过ViewChild通信</h2>
        <app-counter></app-counter>
        <button (click)="incrementCounter()">父组件增加计数</button>
        <button (click)="resetCounter()">重置计数</button>
      </div>
    `
  })
  export class ParentComponent implements AfterViewInit {
    // 通过类型查询子组件
    @ViewChild(CounterComponent) 
    counterComponent: CounterComponent;
    
    // 也可以使用模板引用变量
    // @ViewChild('counter') counterComponent: CounterComponent;
    
    ngAfterViewInit() {
      // 视图初始化后可以安全访问
      console.log('初始计数:', this.counterComponent.count);
      
      // 注意：在AfterViewInit中修改绑定属性需要处理变更检测错误
      setTimeout(() => {
        this.counterComponent.count = 10;
      });
    }
    
    incrementCounter() {
      this.counterComponent.increment();
    }
    
    resetCounter() {
      this.counterComponent.reset();
    }
  }
  
  @Component({
    selector: 'app-counter',
    template: `
      <div class="counter">
        <h3>计数器组件</h3>
        <p>当前计数: {{ count }}</p>
        <button (click)="increment()">增加</button>
      </div>
    `
  })
  export class CounterComponent {
    count = 0;
    
    increment() {
      this.count++;
    }
    
    reset() {
      this.count = 0;
    }
  }
  ```

- **通过路由参数通信**

  ```typescript
  // 1. 使用路由参数传递数据
  
  // 发送组件
  @Component({
    selector: 'app-product-list',
    template: `
      <div class="products">
        <h2>产品列表</h2>
        <ul>
          <li *ngFor="let product of products">
            {{ product.name }}
            <!-- 使用路由参数导航 -->
            <button [routerLink]="['/product', product.id]">查看详情</button>
            
            <!-- 或者使用路由导航 -->
            <button (click)="viewProduct(product.id)">查看详情</button>
          </li>
        </ul>
      </div>
    `
  })
  export class ProductListComponent {
    products = [
      { id: 1, name: '产品A' },
      { id: 2, name: '产品B' },
      { id: 3, name: '产品C' }
    ];
    
    constructor(private router: Router) {}
    
    viewProduct(id: number) {
      // 导航到详情页并传递ID参数
      this.router.navigate(['/product', id]);
      
      // 带查询参数
      // this.router.navigate(['/product', id], {
      //   queryParams: { source: 'list', filter: 'active' }
      // });
    }
  }
  
  // 接收组件
  @Component({
    selector: 'app-product-detail',
    template: `
      <div class="product-detail" *ngIf="product">
        <h2>产品详情</h2>
        <p>ID: {{ product.id }}</p>
        <p>名称: {{ product.name }}</p>
        <p>描述: {{ product.description }}</p>
        
        <p *ngIf="source">来源: {{ source }}</p>
        
        <button (click)="goBack()">返回</button>
      </div>
    `
  })
  export class ProductDetailComponent implements OnInit {
    product: any;
    source: string;
    
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private productService: ProductService
    ) {}
    
    ngOnInit() {
      // 1. 获取路径参数(一次性读取)
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadProduct(id);
      
      // 2. 获取查询参数(一次性读取)
      this.source = this.route.snapshot.queryParamMap.get('source');
      
      // 3. 订阅参数变化(响应式处理)
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        this.loadProduct(id);
      });
      
      // 4. 订阅查询参数变化
      this.route.queryParamMap.subscribe(params => {
        this.source = params.get('source');
      });
    }
    
    loadProduct(id: number) {
      // 获取产品数据(实际应用中通常从服务获取)
      this.productService.getProduct(id).subscribe(product => {
        this.product = product;
      });
    }
    
    goBack() {
      this.router.navigate(['/products']);
    }
  }
  
  // 路由配置
  const routes: Routes = [
    { path: 'products', component: ProductListComponent },
    { path: 'product/:id', component: ProductDetailComponent }
  ];
  ```

- **使用NgRx进行状态管理**

  ```typescript
  // 1. 使用NgRx进行高级状态管理

  // 状态接口
  export interface UserState {
    users: User[];
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
  }

  // 初始状态
  export const initialState: UserState = {
    users: [],
    selectedUser: null,
    loading: false,
    error: null
  };

  // 定义Actions
  export const loadUsers = createAction('[User] Load Users');
  export const loadUsersSuccess = createAction(
    '[User] Load Users Success',
    props<{ users: User[] }>()
  );
  export const loadUsersFailure = createAction(
    '[User] Load Users Failure',
    props<{ error: string }>()
  );
  export const selectUser = createAction(
    '[User] Select User',
    props<{ userId: number }>()
  );

  // Reducer
  export const userReducer = createReducer(
    initialState,
    on(loadUsers, state => ({
      ...state,
      loading: true,
      error: null
    })),
    on(loadUsersSuccess, (state, { users }) => ({
      ...state,
      loading: false,
      users,
      error: null
    })),
    on(loadUsersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),
    on(selectUser, (state, { userId }) => ({
      ...state,
      selectedUser: state.users.find(user => user.id === userId) || null
    }))
  );

  // Selectors
  export const selectUserState = createFeatureSelector<UserState>('users');
  export const selectAllUsers = createSelector(
    selectUserState,
    state => state.users
  );
  export const selectSelectedUser = createSelector(
    selectUserState,
    state => state.selectedUser
  );
  export const selectUserLoading = createSelector(
    selectUserState,
    state => state.loading
  );
  export const selectUserError = createSelector(
    selectUserState,
    state => state.error
  );

  // Effects
  @Injectable()
  export class UserEffects {
    loadUsers$ = createEffect(() => this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() => this.userService.getUsers().pipe(
        map(users => loadUsersSuccess({ users })),
        catchError(error => of(loadUsersFailure({ 
          error: error.message || '加载用户失败' 
        })))
      ))
    ));

    constructor(
      private actions$: Actions,
      private userService: UserService
    ) {}
  }

  // 组件中使用Store
  @Component({
    selector: 'app-user-list',
    template: `
      <div>
        <h2>用户列表</h2>
        
        <div *ngIf="loading$ | async" class="loading">加载中...</div>
        <div *ngIf="error$ | async as error" class="error">{{ error }}</div>
        
        <ul *ngIf="users$ | async as users">
          <li *ngFor="let user of users"
              [class.selected]="(selectedUser$ | async)?.id === user.id"
              (click)="selectUser(user.id)">
            {{ user.name }}
          </li>
        </ul>
        
        <button (click)="loadUsers()">刷新用户</button>
      </div>
    `
  })
  export class UserListComponent implements OnInit {
    users$ = this.store.select(selectAllUsers);
    selectedUser$ = this.store.select(selectSelectedUser);
    loading$ = this.store.select(selectUserLoading);
    error$ = this.store.select(selectUserError);
    
    constructor(private store: Store) {}
    
    ngOnInit() {
      this.loadUsers();
    }
    
    loadUsers() {
      this.store.dispatch(loadUsers());
    }
    
    selectUser(userId: number) {
      this.store.dispatch(selectUser({ userId }));
    }
  }

  // 用户详情组件
  @Component({
    selector: 'app-user-detail',
    template: `
      <div *ngIf="selectedUser$ | async as user">
        <h3>用户详情</h3>
        <p>ID: {{ user.id }}</p>
        <p>名称: {{ user.name }}</p>
        <p>邮箱: {{ user.email }}</p>
      </div>
    `
  })
  export class UserDetailComponent {
    selectedUser$ = this.store.select(selectSelectedUser);
    
    constructor(private store: Store) {}
  }
  ```

- **组件通信最佳实践**

  | 通信方式 | 适用场景 | 优点 | 缺点 |
  |---------|---------|------|------|
  | @Input/@Output | 父子组件直接通信 | 简单直接、类型安全 | 仅限于父子关系、多层级需要逐级传递 |
  | 服务 | 任意组件间通信 | 解耦组件、可跨模块 | 服务设计复杂度高、需处理订阅生命周期 |
  | ViewChild | 父组件访问子组件 | 直接访问方法和属性 | 强耦合、依赖组件生命周期 |
  | 路由参数 | 页面间通信 | 与URL状态一致、可分享和书签 | 仅适用于路由导航场景、数据量有限 |
  | NgRx | 复杂应用的状态管理 | 可预测状态、单向数据流、性能优化 | 样板代码多、学习曲线陡 |

  ```typescript
  // 最佳实践示例

  // 1. 使用接口定义组件输入和输出
  export interface UserListConfig {
    pageSize: number;
    showAvatar: boolean;
    sortField?: string;
    filterBy?: string;
  }

  export interface UserSelectedEvent {
    user: User;
    index: number;
    source: string;
  }

  @Component({
    selector: 'app-user-list',
    template: `...`
  })
  export class UserListComponent {
    @Input() users: User[] = [];
    @Input() config: UserListConfig;
    @Output() userSelected = new EventEmitter<UserSelectedEvent>();
    
    selectUser(user: User, index: number) {
      this.userSelected.emit({
        user,
        index,
        source: 'list-component'
      });
    }
  }

  // 2. 分层设计 - 使用数据服务和状态服务分离关注点
  
  // 数据服务 - 负责API通信
  @Injectable({
    providedIn: 'root'
  })
  export class UserDataService {
    constructor(private http: HttpClient) {}
    
    getUsers(): Observable<User[]> {
      return this.http.get<User[]>('/api/users');
    }
    
    getUserById(id: number): Observable<User> {
      return this.http.get<User>(`/api/users/${id}`);
    }
    
    createUser(user: User): Observable<User> {
      return this.http.post<User>('/api/users', user);
    }
    
    // 其他数据操作...
  }
  
  // 状态服务 - 负责缓存和状态管理
  @Injectable({
    providedIn: 'root'
  })
  export class UserStateService {
    private userCache = new Map<number, User>();
    private usersSubject = new BehaviorSubject<User[]>([]);
    private selectedUserSubject = new BehaviorSubject<User | null>(null);
    
    // 公开的Observable
    users$ = this.usersSubject.asObservable();
    selectedUser$ = this.selectedUserSubject.asObservable();
    
    constructor(private userDataService: UserDataService) {}
    
    loadUsers() {
      return this.userDataService.getUsers().pipe(
        tap(users => {
          // 更新缓存
          users.forEach(user => this.userCache.set(user.id, user));
          // 更新状态
          this.usersSubject.next(users);
        })
      );
    }
    
    selectUser(userId: number) {
      // 尝试从缓存获取
      let user = this.userCache.get(userId);
      
      if (user) {
        this.selectedUserSubject.next(user);
        return of(user);
      } else {
        // 从API获取并缓存
        return this.userDataService.getUserById(userId).pipe(
          tap(user => {
            this.userCache.set(user.id, user);
            this.selectedUserSubject.next(user);
          })
        );
      }
    }
    
    // 其他状态操作...
  }
  
  // 3. 组件智能/傻瓜分离模式
  
  // 智能组件 - 处理数据获取和状态
  @Component({
    selector: 'app-users-page',
    template: `
      <div>
        <h1>用户管理</h1>
        
        <!-- 将数据和事件传递给展示组件 -->
        <app-user-list
          [users]="users$ | async"
          [config]="listConfig"
          (userSelected)="onUserSelected($event)">
        </app-user-list>
        
        <app-user-detail
          [user]="selectedUser$ | async"
          (userUpdated)="onUserUpdated($event)">
        </app-user-detail>
      </div>
    `
  })
  export class UsersPageComponent implements OnInit {
    users$ = this.userState.users$;
    selectedUser$ = this.userState.selectedUser$;
    
    listConfig: UserListConfig = {
      pageSize: 10,
      showAvatar: true,
      sortField: 'name'
    };
    
    constructor(private userState: UserStateService) {}
    
    ngOnInit() {
      this.userState.loadUsers().subscribe();
    }
    
    onUserSelected(event: UserSelectedEvent) {
      this.userState.selectUser(event.user.id).subscribe();
    }
    
    onUserUpdated(user: User) {
      // 处理更新逻辑...
    }
  }
  
  // 傻瓜组件 - 纯展示和用户交互
  @Component({
    selector: 'app-user-detail',
    template: `
      <div *ngIf="user" class="user-detail">
        <h2>{{ user.name }}</h2>
        <div class="user-fields">
          <label>
            Email:
            <input [(ngModel)]="editingUser.email" />
          </label>
          <!-- 其他字段... -->
        </div>
        
        <div class="actions">
          <button (click)="save()">保存</button>
          <button (click)="cancel()">取消</button>
        </div>
      </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class UserDetailComponent implements OnChanges {
    @Input() user: User | null = null;
    @Output() userUpdated = new EventEmitter<User>();
    
    editingUser: User = {} as User;
    
    ngOnChanges(changes: SimpleChanges) {
      if (changes['user'] && this.user) {
        // 创建副本避免直接修改输入属性
        this.editingUser = { ...this.user };
      }
    }
    
    save() {
      this.userUpdated.emit(this.editingUser);
    }
    
    cancel() {
      this.editingUser = { ...this.user as User };
    }
  }
  ```

#### 1.2.5 动态组件加载

- **动态组件基础概念**

  ```typescript
  // 动态组件加载是指在运行时（而非编译时）动态创建和渲染组件的技术
  // 主要应用场景：
  // 1. 弹窗、模态框、提示框等交互组件
  // 2. 根据条件或用户操作动态渲染不同内容
  // 3. 插件系统和可扩展界面
  // 4. 内容管理系统的动态区块
  ```

- **ViewContainerRef和ComponentFactoryResolver方法**

  ```typescript
  // 动态组件 - 将被动态加载
  @Component({
    selector: 'app-dynamic',
    template: `
      <div class="dynamic-component">
        <h3>{{ title }}</h3>
        <p>{{ content }}</p>
        <button (click)="close()">关闭</button>
      </div>
    `
  })
  export class DynamicComponent implements OnInit, OnDestroy {
    // 输入数据
    title: string = '默认标题';
    content: string = '默认内容';
    
    // 输出事件 - 通知宿主组件
    closeEvent = new EventEmitter<void>();
    
    ngOnInit() {
      console.log('动态组件已初始化');
    }
    
    close() {
      this.closeEvent.emit();
    }
    
    ngOnDestroy() {
      console.log('动态组件已销毁');
    }
  }

  // 宿主组件 - 负责加载动态组件
  @Component({
    selector: 'app-host',
    template: `
      <div class="container">
        <h2>宿主组件</h2>
        <button (click)="createDynamicComponent()">
          创建动态组件
        </button>
        
        <!-- 动态组件将被插入到这个容器中 -->
        <ng-container #dynamicContainer></ng-container>
      </div>
    `
  })
  export class HostComponent {
    // 获取一个ViewContainerRef实例，作为动态组件的容器
    @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
    container: ViewContainerRef;
    
    // 用于存储当前活动的组件引用，以便后续移除
    private componentRef: ComponentRef<DynamicComponent> | null = null;
    
    constructor(
      private componentFactoryResolver: ComponentFactoryResolver
    ) {}
    
    createDynamicComponent() {
      // 如果已有组件，先清除
      if (this.componentRef) {
        this.componentRef.destroy();
      }
      
      // 1. 解析组件工厂
      const componentFactory = this.componentFactoryResolver
        .resolveComponentFactory(DynamicComponent);
      
      // 2. 使用容器创建组件
      this.componentRef = this.container.createComponent(componentFactory);
      
      // 3. 设置组件实例的输入属性
      const instance = this.componentRef.instance;
      instance.title = '动态创建的标题';
      instance.content = '这个组件是在运行时动态创建的！';
      
      // 4. 订阅组件的输出事件
      instance.closeEvent.subscribe(() => {
        this.removeDynamicComponent();
      });
    }
    
    removeDynamicComponent() {
      if (this.componentRef) {
        // 销毁组件，触发其ngOnDestroy生命周期
        this.componentRef.destroy();
        this.componentRef = null;
      }
    }
    
    ngOnDestroy() {
      // 确保在宿主组件销毁时，动态组件也被正确销毁
      this.removeDynamicComponent();
    }
  }
  ```

- **Angular 13+ 简化的动态组件创建**

  ```typescript
  // Angular 13及更高版本中的简化方法
  @Component({/*...*/})
  export class ModernHostComponent {
    @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
    container: ViewContainerRef;
    
    private componentRef: ComponentRef<DynamicComponent> | null = null;
    
    createDynamicComponent() {
      // 清除现有组件
      if (this.componentRef) {
        this.componentRef.destroy();
      }
      
      // 直接创建组件，无需ComponentFactoryResolver
      this.componentRef = this.container.createComponent(DynamicComponent);
      
      // 设置属性并绑定事件
      const instance = this.componentRef.instance;
      instance.title = '简化API创建的组件';
      instance.content = 'Angular 13+的简化API更易用！';
      
      instance.closeEvent.subscribe(() => {
        this.removeDynamicComponent();
      });
    }
    
    removeDynamicComponent() {
      if (this.componentRef) {
        this.componentRef.destroy();
        this.componentRef = null;
      }
    }
  }
  ```

- **使用ngComponentOutlet指令**

  ```typescript
  // ngComponentOutlet提供了一种更声明式的方法来加载动态组件
  @Component({
    selector: 'app-outlet-host',
    template: `
      <div class="container">
        <h2>ngComponentOutlet示例</h2>
        <button (click)="toggleComponent()">切换组件</button>
        
        <!-- 使用ngComponentOutlet加载动态组件 -->
        <ng-container 
          *ngComponentOutlet="currentComponent; 
                              injector: customInjector;
                              content: projectedContent">
        </ng-container>
      </div>
    `
  })
  export class OutletHostComponent implements OnInit {
    // 可以动态切换的组件类型
    componentA = ComponentA;
    componentB = ComponentB;
    currentComponent: Type<any> = this.componentA;
    
    // 创建自定义注入器，用于依赖注入
    customInjector: Injector;
    
    // 为内容投影准备的模板
    projectedContent: any[][];
    
    constructor(
      private injector: Injector,
      private viewContainerRef: ViewContainerRef
    ) {}
    
    ngOnInit() {
      // 创建自定义注入器，包含额外的依赖
      this.customInjector = Injector.create({
        providers: [
          {
            provide: COMPONENT_DATA,
            useValue: { title: 'Outlet标题', message: 'Outlet消息' }
          }
        ],
        parent: this.injector // 继承父注入器
      });
      
      // 设置投影内容(可选)
      const template = this.createContentTemplate();
      if (template) {
        this.projectedContent = [[template]];
      }
    }
    
    createContentTemplate() {
      // 创建要投影到动态组件的内容模板
      const factory = this.viewContainerRef.createEmbeddedView(
        this.footerTemplate
      );
      return factory.rootNodes;
    }
    
    @ViewChild('footer', { static: true })
    footerTemplate: TemplateRef<any>;
    
    toggleComponent() {
      // 在两个组件之间切换
      this.currentComponent = 
        this.currentComponent === this.componentA ? 
        this.componentB : this.componentA;
    }
  }
  
  // 用于注入数据的令牌
  export const COMPONENT_DATA = new InjectionToken<any>('COMPONENT_DATA');
  
  // 目标组件A
  @Component({
    template: `
      <div class="component-a">
        <h3>组件 A</h3>
        <p>标题: {{ data.title }}</p>
        <p>消息: {{ data.message }}</p>
        <ng-content></ng-content>
      </div>
    `
  })
  export class ComponentA {
    constructor(@Inject(COMPONENT_DATA) public data: any) {}
  }
  
  // 目标组件B
  @Component({
    template: `
      <div class="component-b">
        <h3>组件 B</h3>
        <p>另一种样式的组件</p>
        <p>标题: {{ data.title }}</p>
        <ng-content></ng-content>
      </div>
    `
  })
  export class ComponentB {
    constructor(@Inject(COMPONENT_DATA) public data: any) {}
  }
  ```

- **动态组件服务封装**

  ```typescript
  // 创建一个通用的动态组件服务
  @Injectable({
    providedIn: 'root'
  })
  export class DynamicComponentService {
    private rootViewContainer: ViewContainerRef;
    
    // 设置根视图容器
    setRootViewContainer(viewContainerRef: ViewContainerRef) {
      this.rootViewContainer = viewContainerRef;
    }
    
    // 添加动态组件
    addDynamicComponent<T>(
      componentType: Type<T>,
      config?: {
        inputs?: { [key: string]: any };
        outputs?: { [key: string]: (event: any) => void };
        index?: number;
      }
    ): ComponentRef<T> {
      if (!this.rootViewContainer) {
        throw new Error('需要先调用setRootViewContainer设置根视图容器');
      }
      
      // 创建组件
      const componentRef = this.rootViewContainer.createComponent<T>(
        componentType,
        { index: config?.index }
      );
      
      // 设置输入属性
      if (config?.inputs) {
        Object.keys(config.inputs).forEach(inputName => {
          componentRef.instance[inputName] = config.inputs[inputName];
        });
      }
      
      // 绑定输出事件
      if (config?.outputs) {
        Object.keys(config.outputs).forEach(outputName => {
          componentRef.instance[outputName].subscribe(
            config.outputs[outputName]
          );
        });
      }
      
      return componentRef;
    }
    
    // 移除动态组件
    removeDynamicComponent(componentRef: ComponentRef<any>) {
      componentRef.destroy();
    }
    
    // 清空所有动态组件
    clear() {
      if (this.rootViewContainer) {
        this.rootViewContainer.clear();
      }
    }
  }
  
  // 在应用组件中使用该服务
  @Component({
    selector: 'app-dynamic-root',
    template: `
      <div class="app-container">
        <h1>动态组件服务示例</h1>
        <button (click)="createModal()">打开模态框</button>
        <button (click)="createToast()">显示提示</button>
        
        <!-- 动态组件将被插入到这里 -->
        <ng-container #dynamicComponentContainer></ng-container>
      </div>
    `
  })
  export class DynamicRootComponent implements AfterViewInit {
    @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
    dynamicComponentContainer: ViewContainerRef;
    
    private modalRef: ComponentRef<ModalComponent>;
    
    constructor(private dynamicComponentService: DynamicComponentService) {}
    
    ngAfterViewInit() {
      // 设置根视图容器
      this.dynamicComponentService.setRootViewContainer(
        this.dynamicComponentContainer
      );
    }
    
    createModal() {
      // 使用服务创建模态框组件
      this.modalRef = this.dynamicComponentService.addDynamicComponent(
        ModalComponent,
        {
          inputs: {
            title: '重要通知',
            message: '这是一个动态创建的模态框。',
            showClose: true
          },
          outputs: {
            close: () => this.closeModal()
          }
        }
      );
    }
    
    closeModal() {
      if (this.modalRef) {
        this.dynamicComponentService.removeDynamicComponent(this.modalRef);
        this.modalRef = null;
      }
    }
    
    createToast() {
      // 创建一个会自动消失的提示组件
      const toastRef = this.dynamicComponentService.addDynamicComponent(
        ToastComponent,
        {
          inputs: {
            message: '操作成功！',
            type: 'success',
            duration: 3000
          }
        }
      );
      
      // 指定时间后自动移除
      setTimeout(() => {
        this.dynamicComponentService.removeDynamicComponent(toastRef);
      }, 3000);
    }
  }
  ```

- **实现模态框服务**

  ```typescript
  // 设计一个通用的模态框服务
  @Injectable({
    providedIn: 'root'
  })
  export class ModalService {
    private modalContainer: ViewContainerRef;
    private modals: Map<string, ComponentRef<any>> = new Map();
    
    // 设置模态框容器
    setContainer(container: ViewContainerRef) {
      this.modalContainer = container;
    }
    
    // 打开模态框
    open<T, D = any, R = any>(
      component: Type<T>,
      config?: {
        id?: string;
        data?: D;        // 传入模态框的数据
        backdropClose?: boolean; // 点击背景关闭
      }
    ): ModalRef<R> {
      if (!this.modalContainer) {
        throw new Error('请先设置模态框容器');
      }
      
      // 创建唯一ID
      const id = config?.id || `modal-${Date.now()}`;
      
      // 创建外层包装组件
      const overlayRef = this.modalContainer.createComponent(ModalOverlayComponent);
      overlayRef.instance.backdropClose = config?.backdropClose ?? true;
      
      // 创建实际内容组件
      const componentRef = overlayRef.instance.contentContainer.createComponent(component);
      
      // 如果有数据，注入到组件
      if (config?.data && componentRef.instance['data'] !== undefined) {
        componentRef.instance['data'] = config.data;
      }
      
      // 创建控制器对象，用于返回给调用者
      const modalRef = new ModalRef<R>(id, componentRef, overlayRef);
      
      // 设置关闭事件
      overlayRef.instance.close.subscribe(() => {
        this.close(id);
      });
      
      // 存储引用
      this.modals.set(id, overlayRef);
      
      return modalRef;
    }
    
    // 关闭指定模态框
    close(id: string, result?: any) {
      const modalRef = this.modals.get(id);
      if (modalRef) {
        // 发送结果
        if (modalRef.instance.contentComponentRef && 
            modalRef.instance.contentComponentRef.instance['modalRef']) {
          modalRef.instance.contentComponentRef.instance['modalRef'].close(result);
        }
        
        // 销毁组件
        modalRef.destroy();
        this.modals.delete(id);
      }
    }
    
    // 关闭所有模态框
    closeAll() {
      this.modals.forEach((modal, id) => {
        modal.destroy();
      });
      this.modals.clear();
    }
  }
  
  // 模态框引用类 - 提供给调用者使用
  export class ModalRef<R = any> {
    // 关闭后的结果
    private afterClosedSubject = new Subject<R>();
    afterClosed$ = this.afterClosedSubject.asObservable();
    
    constructor(
      public id: string,
      public componentRef: ComponentRef<any>,
      public overlayRef: ComponentRef<ModalOverlayComponent>
    ) {
      // 将modalRef注入到组件实例
      if (componentRef.instance) {
        componentRef.instance['modalRef'] = this;
      }
    }
    
    // 关闭并返回结果
    close(result?: R) {
      this.afterClosedSubject.next(result);
      this.afterClosedSubject.complete();
    }
  }
  
  // 模态框覆盖层组件
  @Component({
    template: `
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-content">
            <ng-container #contentContainer></ng-container>
          </div>
        </div>
      </div>
    `,
    styles: [`
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal-container {
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        padding: 20px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
      }
    `]
  })
  export class ModalOverlayComponent {
    @ViewChild('contentContainer', { read: ViewContainerRef, static: true })
    contentContainer: ViewContainerRef;
    
    contentComponentRef: ComponentRef<any>;
    backdropClose = true;
    
    @Output() close = new EventEmitter<void>();
    
    onBackdropClick(event: MouseEvent) {
      if (this.backdropClose) {
        this.close.emit();
        event.preventDefault();
      }
    }
  }
  ```

- **组件注册**

  ```typescript
  // 应用中需要确保动态组件被正确地声明和注册
  
  // 1. 在模块中声明和注册动态组件
  @NgModule({
    declarations: [
      ModalComponent,
      AlertComponent,
      ToastComponent,
      // 所有可能动态加载的组件
    ],
    imports: [
      CommonModule,
      // 其他必要模块...
    ],
    // 重要: Angular 9+的Ivy渲染引擎不再需要entryComponents
    // 但Angular 8及以下版本需要在这里注册
    entryComponents: [
      ModalComponent,
      AlertComponent,
      ToastComponent,
      // 所有可能动态加载的组件
    ]
  })
  export class DynamicComponentsModule { }
  
  // 2. 使用standalone组件（Angular 14+）
  @Component({
    selector: 'app-standalone-dynamic',
    standalone: true, // 声明为独立组件
    imports: [
      CommonModule,
      ReactiveFormsModule,
      // 其他需要的模块或组件
    ],
    template: `
      <div class="standalone-component">
        <h3>独立动态组件</h3>
        <p>这个组件不需要在模块中声明</p>
      </div>
    `
  })
  export class StandaloneDynamicComponent {
    // 组件逻辑...
  }
  ```

- **最佳实践与常见问题**

  ```typescript
  // 1. 组件不显示的问题
  // 问题: 组件创建了但没有显示
  // 解决方案: 检查ViewContainerRef是否正确，是否调用了detectChanges
  
  @Component({/*...*/})
  export class TroubleshootComponent {
    @ViewChild('container', { read: ViewContainerRef })
    container: ViewContainerRef;
    
    createComponent() {
      const componentRef = this.container.createComponent(DynamicComponent);
      
      // 重要: 手动触发变更检测以确保组件渲染
      componentRef.changeDetectorRef.detectChanges();
    }
  }
  
  // 2. 输入属性不生效
  // 问题: 设置的输入属性没有生效
  // 解决方案: 设置属性后手动调用检测
  
  setComponentInputs(componentRef: ComponentRef<any>, inputs: any) {
    // 设置所有输入属性
    Object.keys(inputs).forEach(key => {
      componentRef.instance[key] = inputs[key];
    });
    
    // 重要: 属性更新后需要触发变更检测
    componentRef.changeDetectorRef.detectChanges();
  }
  
  // 3. 内存泄漏
  // 问题: 动态组件被移除但资源未释放
  // 解决方案: 确保正确销毁组件和清理订阅
  
  export class MemoryLeakExample {
    private componentRefs: ComponentRef<any>[] = [];
    private subscriptions = new Subscription();
    
    addComponent() {
      const componentRef = this.container.createComponent(DynamicComponent);
      this.componentRefs.push(componentRef);
      
      // 订阅组件事件
      const sub = componentRef.instance.event.subscribe(() => {
        // 处理事件...
      });
      
      // 将订阅添加到集合中
      this.subscriptions.add(sub);
    }
    
    removeComponent(index: number) {
      if (index >= 0 && index < this.componentRefs.length) {
        // 销毁组件 - 这会触发组件的ngOnDestroy
        this.componentRefs[index].destroy();
        // 从数组中移除
        this.componentRefs.splice(index, 1);
      }
    }
    
    ngOnDestroy() {
      // 清理所有组件
      this.componentRefs.forEach(ref => ref.destroy());
      this.componentRefs = [];
      
      // 取消所有订阅
      this.subscriptions.unsubscribe();
    }
  }
  ```

- **性能优化策略**

  ```typescript
  // 1. 组件池 - 重用组件实例而不是频繁创建销毁
  @Injectable({
    providedIn: 'root'
  })
  export class ComponentPoolService {
    private pools: Map<Type<any>, ComponentRef<any>[]> = new Map();
    
    constructor(private viewContainerRef: ViewContainerRef) {}
    
    // 从池中获取组件，没有则创建
    getComponent<T>(componentType: Type<T>): ComponentRef<T> {
      // 确保该类型存在一个池
      if (!this.pools.has(componentType)) {
        this.pools.set(componentType, []);
      }
      
      const pool = this.pools.get(componentType);
      
      // 从池中取出一个可用组件
      if (pool.length > 0) {
        const componentRef = pool.pop() as ComponentRef<T>;
        // 重置组件状态
        if (typeof componentRef.instance['reset'] === 'function') {
          componentRef.instance['reset']();
        }
        return componentRef;
      }
      
      // 没有可用组件，创建新的
      return this.viewContainerRef.createComponent(componentType);
    }
    
    // 释放组件回池
    releaseComponent<T>(componentRef: ComponentRef<T>) {
      const componentType = componentRef.componentType;
      
      // 获取组件对应的池
      if (!this.pools.has(componentType)) {
        this.pools.set(componentType, []);
      }
      
      const pool = this.pools.get(componentType);
      
      // 将组件从DOM中分离，但不销毁
      this.viewContainerRef.detach(
        this.viewContainerRef.indexOf(componentRef.hostView)
      );
      
      // 放回池中
      pool.push(componentRef);
    }
    
    // 清空池
    clearPool() {
      this.pools.forEach(pool => {
        pool.forEach(componentRef => {
          componentRef.destroy();
        });
      });
      this.pools.clear();
    }
  }
  
  // 2. 懒加载动态组件
  // 通过懒加载动态加载组件，减少初始加载时间
  @Injectable({
    providedIn: 'root'
  })
  export class LazyComponentLoader {
    constructor(private injector: Injector) {}
    
    // 懒加载组件
    async loadComponent(path: string): Promise<Type<any>> {
      // 动态导入组件模块
      const module = await import(path);
      
      // 返回组件类型
      return module.default || module.MainComponent;
    }
  }
  ```

#### 1.2.6 Shadow DOM 和 View Encapsulation

- **Shadow DOM 概念与原理**

  ```typescript
  // Shadow DOM 是 Web Components 标准的核心部分
  // 它允许将隐藏的 DOM 树附加到常规 DOM 树中的元素上
  // 主要特点:
  // 1. DOM 隔离 - Shadow DOM 内部的元素不会影响外部
  // 2. 样式隔离 - Shadow DOM 内的样式不会泄漏到外部
  // 3. 简化 CSS - 可以使用更简单的选择器而不担心冲突
  // 4. 组合 - 可以将多个 Shadow DOM 和常规 DOM 组合在一起
  ```

- **Angular 中的视图封装模式**

  ```typescript
  // Angular 提供了三种视图封装策略，通过 @Component 装饰器的 encapsulation 属性设置
  
  // 1. ViewEncapsulation.Emulated (默认)
  @Component({
    selector: 'app-emulated',
    template: `<h2>Emulated Encapsulation</h2>
               <p>This component uses emulated encapsulation</p>`,
    styles: [`
      h2 { color: red; }
      p { font-style: italic; }
    `],
    encapsulation: ViewEncapsulation.Emulated
  })
  export class EmulatedComponent { }
  // 特点:
  // - 模拟 Shadow DOM 的行为
  // - 通过为元素添加特殊属性选择器实现样式隔离
  // - 兼容性最好，适用于所有浏览器
  // - 编译后的 HTML 会包含类似 _ngcontent-lmn-c12 的属性
  
  // 2. ViewEncapsulation.ShadowDom
  @Component({
    selector: 'app-shadow-dom',
    template: `<h2>Shadow DOM Encapsulation</h2>
               <p>This component uses real Shadow DOM</p>`,
    styles: [`
      h2 { color: blue; }
      p { font-weight: bold; }
    `],
    encapsulation: ViewEncapsulation.ShadowDom
  })
  export class ShadowDomComponent { }
  // 特点:
  // - 使用浏览器原生 Shadow DOM API
  // - 完全隔离的 DOM 和 CSS
  // - 需要浏览器支持 Shadow DOM v1 规范
  // - 无法从外部直接访问组件内部元素
  
  // 3. ViewEncapsulation.None
  @Component({
    selector: 'app-no-encapsulation',
    template: `<h2>No Encapsulation</h2>
               <p>This component has no encapsulation</p>`,
    styles: [`
      h2 { color: green; }
      p { text-decoration: underline; }
    `],
    encapsulation: ViewEncapsulation.None
  })
  export class NoEncapsulationComponent { }
  // 特点:
  // - 没有样式隔离
  // - 组件样式会应用到整个应用
  // - 样式会被添加到文档的 <head> 中
  // - 适用于全局样式或主题组件
  ```

- **封装模式的选择策略**

  ```typescript
  // 选择合适的封装模式取决于以下因素:
  
  // 1. 组件的用途
  //    - 可重用组件库: ViewEncapsulation.Emulated 或 ShadowDom
  //    - 应用特定组件: 可以使用默认的 Emulated
  //    - 全局样式组件: ViewEncapsulation.None
  
  // 2. 浏览器兼容性要求
  //    - 需要最广泛兼容性: ViewEncapsulation.Emulated
  //    - 只支持现代浏览器: 可以考虑 ViewEncapsulation.ShadowDom
  
  // 3. 样式复杂度
  //    - 复杂的样式隔离需求: ViewEncapsulation.ShadowDom
  //    - 简单的样式需求: ViewEncapsulation.Emulated 通常足够
  
  // 4. 与第三方库集成
  //    - 需要访问组件内部: 避免使用 ViewEncapsulation.ShadowDom
  //    - 需要应用全局样式: 考虑 ViewEncapsulation.None
  ```

- **样式穿透技术**

  ```typescript
  // 有时需要从父组件修改子组件的样式，可以使用以下技术:
  
  // 1. 使用 ::ng-deep 组合器 (不推荐，已废弃但仍可用)
  @Component({
    selector: 'app-parent',
    template: `<app-child></app-child>`,
    styles: [`
      ::ng-deep .child-class {
        color: red !important;
      }
    `]
  })
  
  // 2. 使用 :host-context() 选择器
  @Component({
    selector: 'app-child',
    template: `<div class="content">Child content</div>`,
    styles: [`
      :host-context(.theme-dark) .content {
        background-color: #333;
        color: white;
      }
    `]
  })
  
  // 3. 使用 CSS 变量实现主题定制
  @Component({
    selector: 'app-themed',
    template: `<div class="themed-component">Themed content</div>`,
    styles: [`
      .themed-component {
        color: var(--primary-text-color, black);
        background-color: var(--primary-bg-color, white);
        border: 1px solid var(--border-color, #ccc);
      }
    `]
  })
  // 在父组件或全局样式中设置变量:
  // :root {
  //   --primary-text-color: #333;
  //   --primary-bg-color: #f5f5f5;
  //   --border-color: #ddd;
  // }
  ```

- **Shadow DOM 的高级用法**

  ```typescript
  // 1. 访问 Shadow DOM 元素
  @Component({
    selector: 'app-shadow-access',
    template: `
      <div #shadowContent>Shadow DOM content</div>
      <button (click)="modifyShadowContent()">Modify</button>
    `,
    encapsulation: ViewEncapsulation.ShadowDom
  })
  export class ShadowAccessComponent {
    @ViewChild('shadowContent') shadowContent: ElementRef;
    
    modifyShadowContent() {
      // 直接访问 Shadow DOM 中的元素
      if (this.shadowContent && this.shadowContent.nativeElement) {
        this.shadowContent.nativeElement.textContent = 'Modified content';
        this.shadowContent.nativeElement.style.color = 'red';
      }
    }
  }
  
  // 2. 从组件外部访问 Shadow DOM (需谨慎使用)
  @Component({
    selector: 'app-parent',
    template: `
      <app-shadow-child #child></app-shadow-child>
      <button (click)="accessChildShadowDom()">Access Child</button>
    `
  })
  export class ParentComponent {
    @ViewChild('child', { read: ElementRef }) childElem: ElementRef;
    
    accessChildShadowDom() {
      // 获取子组件的 Shadow Root
      const childElement = this.childElem.nativeElement;
      const shadowRoot = childElement.shadowRoot;
      
      // 如果使用 ViewEncapsulation.ShadowDom，可以访问 shadowRoot
      if (shadowRoot) {
        const heading = shadowRoot.querySelector('h2');
        if (heading) {
          heading.style.fontSize = '24px';
        }
      }
    }
  }
  ```

- **性能考虑与最佳实践**

  ```typescript
  // 1. 性能影响
  // - ViewEncapsulation.Emulated: 在大型应用中可能导致较大的CSS文件
  // - ViewEncapsulation.ShadowDom: 在组件数量很多时可能有轻微性能影响
  // - ViewEncapsulation.None: 样式冲突风险高，但CSS体积较小
  
  // 2. 最佳实践
  
  // 组件库开发
  @Component({
    selector: 'lib-button',
    template: `
      <button class="lib-btn" [class.lib-btn-primary]="primary">
        <ng-content></ng-content>
      </button>
    `,
    styles: [`
      .lib-btn {
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
      }
      .lib-btn-primary {
        background-color: var(--primary-color, #007bff);
        color: white;
      }
    `],
    encapsulation: ViewEncapsulation.ShadowDom
  })
  export class LibButtonComponent {
    @Input() primary: boolean = false;
  }
  
  // 应用特定组件
  @Component({
    selector: 'app-dashboard-widget',
    templateUrl: './dashboard-widget.component.html',
    styleUrls: ['./dashboard-widget.component.scss'],
    // 使用默认的 Emulated 封装
  })
  export class DashboardWidgetComponent {
    // 组件逻辑
  }
  
  // 全局样式组件
  @Component({
    selector: 'app-theme-provider',
    template: '<ng-content></ng-content>',
    styles: [`
      /* 全局主题变量 */
      :host {
        --primary-color: #3f51b5;
        --secondary-color: #ff4081;
        --text-color: #333;
        --bg-color: #f5f5f5;
      }
      
      /* 暗黑模式 */
      :host(.dark-theme) {
        --primary-color: #7986cb;
        --secondary-color: #ff80ab;
        --text-color: #eee;
        --bg-color: #303030;
      }
    `],
    encapsulation: ViewEncapsulation.None
  })
  export class ThemeProviderComponent {
    @Input() set darkMode(value: boolean) {
      if (value) {
        this.elementRef.nativeElement.classList.add('dark-theme');
      } else {
        this.elementRef.nativeElement.classList.remove('dark-theme');
      }
    }
    
    constructor(private elementRef: ElementRef) {}
  }
  ```

### 1.3 指令（Directives）

#### 1.3.1 结构型指令（*ngIf, *ngFor, *ngSwitch）

- **结构型指令基础**

  ```typescript
  // 结构型指令的星号(*)语法糖
  // 这两种写法是等价的:
  
  // 简写形式（使用*语法糖）
  <div *ngIf="condition">内容</div>
  
  // 完整形式（ng-template）
  <ng-template [ngIf]="condition">
    <div>内容</div>
  </ng-template>
  ```

- ***ngIf 指令详解**

  ```typescript
  // 1. 基本用法
  @Component({
    selector: 'app-if-demo',
    template: `
      <div *ngIf="isVisible">这个内容会根据条件显示或隐藏</div>
      <button (click)="toggleVisibility()">切换显示</button>
    `
  })
  export class IfDemoComponent {
    isVisible = true;
    
    toggleVisibility() {
      this.isVisible = !this.isVisible;
    }
  }
  
  // 2. 带else条件
  @Component({
    selector: 'app-if-else-demo',
    template: `
      <div *ngIf="isLoggedIn; else loggedOut">
        欢迎回来，{{ username }}！
      </div>
      
      <ng-template #loggedOut>
        请登录以继续操作。
      </ng-template>
    `
  })
  export class IfElseDemoComponent {
    isLoggedIn = false;
    username = '张三';
  }
  
  // 3. 带then和else条件
  @Component({
    selector: 'app-if-then-else-demo',
    template: `
      <div *ngIf="userRole === 'admin'; then adminTpl else userTpl"></div>
      
      <ng-template #adminTpl>
        <div class="admin-panel">管理员面板</div>
      </ng-template>
      
      <ng-template #userTpl>
        <div class="user-view">普通用户视图</div>
      </ng-template>
    `
  })
  export class IfThenElseDemoComponent {
    userRole = 'user'; // 'admin' 或 'user'
  }
  
  // 4. 使用as存储条件结果
  @Component({
    selector: 'app-if-as-demo',
    template: `
      <div *ngIf="userInfo$ | async as user; else loading">
        <h2>{{ user.name }}</h2>
        <p>Email: {{ user.email }}</p>
      </div>
      
      <ng-template #loading>
        <div class="loading">加载用户信息中...</div>
      </ng-template>
    `
  })
  export class IfAsDemoComponent {
    userInfo$ = this.userService.getUserInfo();
    
    constructor(private userService: UserService) {}
  }
  ```

- ***ngFor 指令详解**

  ```typescript
  // 1. 基本用法
  @Component({
    selector: 'app-for-demo',
    template: `
      <ul>
        <li *ngFor="let item of items">{{ item.name }}</li>
      </ul>
    `
  })
  export class ForDemoComponent {
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' }
    ];
  }
  
  // 2. 使用索引
  @Component({
    selector: 'app-for-index-demo',
    template: `
      <ul>
        <li *ngFor="let item of items; let i = index">
          {{ i + 1 }}. {{ item.name }}
        </li>
      </ul>
    `
  })
  export class ForIndexDemoComponent {
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' }
    ];
  }
  
  // 3. 使用trackBy提高性能
  @Component({
    selector: 'app-for-trackby-demo',
    template: `
      <ul>
        <li *ngFor="let item of items; trackBy: trackById">
          {{ item.name }}
        </li>
      </ul>
      <button (click)="refreshItems()">刷新列表</button>
    `
  })
  export class ForTrackByDemoComponent {
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' }
    ];
    
    trackById(index: number, item: any): number {
      return item.id; // 使用唯一ID作为跟踪标识
    }
    
    refreshItems() {
      // 模拟从服务器获取新数据
      this.items = [
        { id: 1, name: '项目1 (已更新)' },
        { id: 2, name: '项目2 (已更新)' },
        { id: 3, name: '项目3 (已更新)' },
        { id: 4, name: '项目4 (新增)' }
      ];
    }
  }
  
  // 4. 使用其他局部变量
  @Component({
    selector: 'app-for-vars-demo',
    template: `
      <ul>
        <li *ngFor="let item of items; 
                    let i = index; 
                    let first = first; 
                    let last = last; 
                    let even = even; 
                    let odd = odd"
            [class.first]="first"
            [class.last]="last"
            [class.even]="even"
            [class.odd]="odd">
          {{ i + 1 }}. {{ item.name }}
          <span *ngIf="first">(第一项)</span>
          <span *ngIf="last">(最后一项)</span>
        </li>
      </ul>
    `
  })
  export class ForVarsDemoComponent {
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' },
      { id: 4, name: '项目4' }
    ];
  }
  
  // 5. 嵌套ngFor
  @Component({
    selector: 'app-nested-for-demo',
    template: `
      <div *ngFor="let group of dataGroups">
        <h3>{{ group.name }}</h3>
        <ul>
          <li *ngFor="let item of group.items">
            {{ item.name }}
          </li>
        </ul>
      </div>
    `
  })
  export class NestedForDemoComponent {
    dataGroups = [
      {
        name: '分组1',
        items: [
          { id: 1, name: '项目1-1' },
          { id: 2, name: '项目1-2' }
        ]
      },
      {
        name: '分组2',
        items: [
          { id: 3, name: '项目2-1' },
          { id: 4, name: '项目2-2' }
        ]
      }
    ];
  }
  ```

- ***ngSwitch 指令详解**

  ```typescript
  // 1. 基本用法
  @Component({
    selector: 'app-switch-demo',
    template: `
      <div [ngSwitch]="userRole">
        <div *ngSwitchCase="'admin'">管理员视图</div>
        <div *ngSwitchCase="'editor'">编辑者视图</div>
        <div *ngSwitchCase="'viewer'">查看者视图</div>
        <div *ngSwitchDefault>访客视图</div>
      </div>
      
      <select [(ngModel)]="userRole">
        <option value="admin">管理员</option>
        <option value="editor">编辑者</option>
        <option value="viewer">查看者</option>
        <option value="guest">访客</option>
      </select>
    `
  })
  export class SwitchDemoComponent {
    userRole = 'guest';
  }
  
  // 2. 复杂条件
  @Component({
    selector: 'app-complex-switch-demo',
    template: `
      <div [ngSwitch]="true">
        <div *ngSwitchCase="userRole === 'admin' && isActive">
          活跃管理员视图
        </div>
        <div *ngSwitchCase="userRole === 'admin' && !isActive">
          非活跃管理员视图
        </div>
        <div *ngSwitchCase="userRole === 'user' && isActive">
          活跃用户视图
        </div>
        <div *ngSwitchCase="userRole === 'user' && !isActive">
          非活跃用户视图
        </div>
        <div *ngSwitchDefault>
          未知用户类型
        </div>
      </div>
    `
  })
  export class ComplexSwitchDemoComponent {
    userRole = 'admin';
    isActive = true;
  }
  
  // 3. 使用模板引用
  @Component({
    selector: 'app-template-switch-demo',
    template: `
      <div [ngSwitch]="currentView">
        <ng-container *ngSwitchCase="'list'" 
                      [ngTemplateOutlet]="listView">
        </ng-container>
        <ng-container *ngSwitchCase="'grid'" 
                      [ngTemplateOutlet]="gridView">
        </ng-container>
        <ng-container *ngSwitchDefault 
                      [ngTemplateOutlet]="defaultView">
        </ng-container>
      </div>
      
      <ng-template #listView>
        <div class="list-view">
          <div *ngFor="let item of items">
            {{ item.name }} - 列表视图
          </div>
        </div>
      </ng-template>
      
      <ng-template #gridView>
        <div class="grid-view">
          <div class="grid-item" *ngFor="let item of items">
            {{ item.name }} - 网格视图
          </div>
        </div>
      </ng-template>
      
      <ng-template #defaultView>
        <div class="default-view">
          请选择视图类型
        </div>
      </ng-template>
      
      <div class="view-controls">
        <button (click)="currentView = 'list'">列表视图</button>
        <button (click)="currentView = 'grid'">网格视图</button>
      </div>
    `
  })
  export class TemplateSwitchDemoComponent {
    currentView = 'list';
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' },
      { id: 3, name: '项目3' }
    ];
  }
  ```

- **结构型指令性能优化**

  ```typescript
  // 1. 使用OnPush变更检测策略
  @Component({
    selector: 'app-performance-demo',
    template: `
      <div>
        <ul>
          <li *ngFor="let item of items; trackBy: trackById">
            {{ item.name }}
          </li>
        </ul>
      </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class PerformanceDemoComponent {
    @Input() items: any[] = [];
    
    trackById(index: number, item: any): number {
      return item.id;
    }
  }
  
  // 2. 避免不必要的DOM操作
  @Component({
    selector: 'app-optimization-demo',
    template: `
      <!-- 不好的做法: 频繁切换会导致DOM重建 -->
      <div *ngIf="isVisible" class="content">内容</div>
      
      <!-- 更好的做法: 使用[hidden]属性 -->
      <div [hidden]="!isVisible" class="content">内容</div>
      
      <!-- 对于大型内容或需要完全移除的情况，使用ngIf -->
      <div *ngIf="showLargeContent">
        <!-- 大量内容或重型组件 -->
      </div>
    `
  })
  export class OptimizationDemoComponent {
    isVisible = true;
    showLargeContent = false;
  }
  
  // 3. 避免深层嵌套的ngFor
  @Component({
    selector: 'app-nested-optimization',
    template: `
      <!-- 不好的做法: 三层嵌套循环 -->
      <div *ngFor="let section of data">
        <div *ngFor="let group of section.groups">
          <div *ngFor="let item of group.items">
            {{ item.name }}
          </div>
        </div>
      </div>
      
      <!-- 更好的做法: 拆分为组件 -->
      <app-section *ngFor="let section of data" 
                  [section]="section">
      </app-section>
    `
  })
  export class NestedOptimizationComponent {
    data = [/* 复杂嵌套数据 */];
  }
  
  // 4. 条件渲染大型列表
  @Component({
    selector: 'app-conditional-list',
    template: `
      <div>
        <ng-container *ngIf="isDataLoaded">
          <div *ngFor="let item of items; trackBy: trackById">
            {{ item.name }}
          </div>
        </ng-container>
      </div>
    `
  })
  export class ConditionalListComponent {
    items: any[] = [];
    isDataLoaded = false;
    
    trackById(index: number, item: any): number {
      return item.id;
    }
    
    loadData() {
      // 加载数据后再设置标志
      this.dataService.getItems().subscribe(data => {
        this.items = data;
        this.isDataLoaded = true;
      });
    }
  }
  ```

- **自定义结构型指令**

  ```typescript
  // 1. 创建自定义结构型指令
  @Directive({
    selector: '[appRepeat]'
  })
  export class RepeatDirective {
    constructor(
      private templateRef: TemplateRef<any>,
      private viewContainer: ViewContainerRef
    ) {}
    
    @Input() set appRepeat(count: number) {
      // 清除现有视图
      this.viewContainer.clear();
      
      // 根据count创建多个视图
      for (let i = 0; i < count; i++) {
        // 创建嵌入视图并传递上下文
        this.viewContainer.createEmbeddedView(this.templateRef, {
          $implicit: i,  // 隐式值
          index: i       // 命名值
        });
      }
    }
  }
  
  // 使用自定义结构型指令
  @Component({
    selector: 'app-custom-directive-demo',
    template: `
      <div>
        <div *appRepeat="3; let i = index">
          这是第 {{ i + 1 }} 个重复项
        </div>
      </div>
    `
  })
  export class CustomDirectiveDemoComponent {}
  
  // 2. 创建条件结构型指令
  @Directive({
    selector: '[appIfNot]'
  })
  export class IfNotDirective {
    private hasView = false;
    
    constructor(
      private templateRef: TemplateRef<any>,
      private viewContainer: ViewContainerRef
    ) {}
    
    @Input() set appIfNot(condition: boolean) {
      // 当条件为false时显示内容
      if (!condition && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (condition && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    }
  }
  
  // 使用自定义条件指令
  @Component({
    selector: 'app-if-not-demo',
    template: `
      <div>
        <p *appIfNot="isLoggedIn">
          请登录以查看内容
        </p>
        
        <button (click)="toggleLogin()">
          {{ isLoggedIn ? '登出' : '登录' }}
        </button>
      </div>
    `
  })
  export class IfNotDemoComponent {
    isLoggedIn = false;
    
    toggleLogin() {
      this.isLoggedIn = !this.isLoggedIn;
    }
  }
  ```

- **结构型指令最佳实践**

  ```typescript
  // 1. 使用ng-container避免额外的DOM元素
  @Component({
    selector: 'app-container-demo',
    template: `
      <!-- 不好的做法: 额外的div元素 -->
      <div *ngIf="isVisible">
        <p>一些内容</p>
      </div>
      
      <!-- 更好的做法: 使用ng-container -->
      <ng-container *ngIf="isVisible">
        <p>一些内容</p>
      </ng-container>
      
      <!-- 组合多个结构型指令 -->
      <ng-container *ngIf="items.length > 0">
        <div *ngFor="let item of items">
          {{ item.name }}
        </div>
      </ng-container>
    `
  })
  export class ContainerDemoComponent {
    isVisible = true;
    items = [
      { id: 1, name: '项目1' },
      { id: 2, name: '项目2' }
    ];
  }
  
  // 2. 使用ng-template和ngTemplateOutlet复用模板
  @Component({
    selector: 'app-template-reuse-demo',
    template: `
      <ng-template #itemTemplate let-item>
        <div class="item">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </ng-template>
      
      <div class="featured-items">
        <h2>推荐项目</h2>
        <ng-container *ngFor="let item of featuredItems">
          <ng-container 
            [ngTemplateOutlet]="itemTemplate"
            [ngTemplateOutletContext]="{ $implicit: item }">
          </ng-container>
        </ng-container>
      </div>
      
      <div class="regular-items">
        <h2>普通项目</h2>
        <ng-container *ngFor="let item of regularItems">
          <ng-container 
            [ngTemplateOutlet]="itemTemplate"
            [ngTemplateOutletContext]="{ $implicit: item }">
          </ng-container>
        </ng-container>
      </div>
    `
  })
  export class TemplateReuseComponent {
    featuredItems = [
      { id: 1, name: '特色项目1', description: '这是一个特色项目' },
      { id: 2, name: '特色项目2', description: '这是另一个特色项目' }
    ];
    
    regularItems = [
      { id: 3, name: '普通项目1', description: '这是一个普通项目' },
      { id: 4, name: '普通项目2', description: '这是另一个普通项目' }
    ];
  }
  
  // 3. 条件渲染的最佳实践
  @Component({
    selector: 'app-conditional-best-practices',
    template: `
      <!-- 简单条件使用ngIf -->
      <div *ngIf="isLoggedIn">
        欢迎回来，{{ username }}
      </div>
      
      <!-- 多条件使用ngSwitch -->
      <div [ngSwitch]="userRole">
        <div *ngSwitchCase="'admin'">管理员面板</div>
        <div *ngSwitchCase="'user'">用户面板</div>
        <div *ngSwitchDefault>访客面板</div>
      </div>
      
      <!-- 使用ng-container组合条件 -->
      <ng-container *ngIf="isLoggedIn">
        <ng-container *ngIf="hasPermission">
          <button>执行操作</button>
        </ng-container>
      </ng-container>
      
      <!-- 使用ng-template和变量存储条件结果 -->
      <ng-container *ngIf="userInfo$ | async as user; else loading">
        <h2>{{ user.name }}</h2>
      </ng-container>
      
      <ng-template #loading>
        <div class="spinner">加载中...</div>
      </ng-template>
    `
  })
  export class ConditionalBestPracticesComponent {
    isLoggedIn = true;
    username = '张三';
    userRole = 'admin';
    hasPermission = true;
    userInfo$ = this.userService.getCurrentUser();
    
    constructor(private userService: UserService) {}
  }
  ```

#### 1.3.2 属性型指令（[ngClass], [ngStyle]）

- **[ngClass] 指令**

  ```typescript
  // 基本用法
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

- **[ngStyle] 指令**

  ```typescript
  // 基本用法
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

#### 1.3.3 自定义指令开发

- **自定义指令基础**

  ```typescript
  // 自定义指令的创建
  @Directive({
    selector: '[appHighlight]'
  })
  export class HighlightDirective {
    constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
  }
  
  // 在模板中使用自定义指令
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

- **自定义指令的输入和输出**

  ```typescript
  // 自定义指令的输入和输出
  @Directive({
    selector: '[appHighlight]'
  })
  export class HighlightDirective {
    @Input() highlightColor: string;
    @Output() highlightEvent = new EventEmitter<void>();
    
    constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
    
    @HostListener('mouseenter') onMouseEnter() {
      this.el.nativeElement.style.backgroundColor = this.highlightColor;
      this.highlightEvent.emit();
    }
  }
  
  // 在模板中使用自定义指令
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

- **自定义指令的生命周期钩子**

  ```typescript
  // 自定义指令的生命周期钩子
  @Directive({
    selector: '[appHighlight]'
  })
  export class HighlightDirective {
    constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
    
    ngOnInit() {
      console.log('HighlightDirective初始化');
    }
    
    ngOnDestroy() {
      console.log('HighlightDirective销毁');
    }
  }
  
  // 在模板中使用自定义指令
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

- **自定义指令的上下文**

  ```typescript
  // 自定义指令的上下文
  @Directive({
    selector: '[appHighlight]'
  })
  export class HighlightDirective {
    constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
  }
  
  // 在模板中使用自定义指令
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

- **自定义指令的依赖注入**

  ```typescript
  // 自定义指令的依赖注入
  @Directive({
    selector: '[appHighlight]'
  })
  export class HighlightDirective {
    constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
  }
  
  // 在模板中使用自定义指令
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

#### 1.3.4 指令生命周期

- **指令的生命周期钩子**

  ```typescript
  // 指令的生命周期钩子
  @Directive({
    selector: '[appHighlight]'
  })
  export class HighlightDirective {
    constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
    
    ngOnInit() {
      console.log('HighlightDirective初始化');
    }
    
    ngOnDestroy() {
      console.log('HighlightDirective销毁');
    }
  }
  
  // 在模板中使用自定义指令
  @Component({
    selector: 'app-user-profile',
    template: `
      <div class="profile">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Role: {{ role }}</p>
      </div>
    `
  })
  export class UserProfileComponent {
    // 基本输入属性
    @Input() name: string;
    
    // 带默认值的输入属性
    @Input() age = 25;
    
    // 带别名的输入属性（在父组件中使用[userRole]而非[role]）
    @Input('userRole') role: string = 'Guest';
  }
  
  // 在父组件中使用
  @Component({
    selector: 'app-parent',
    template: `
      <app-user-profile 
        [name]="userName"
        [age]="userAge"
        [userRole]="userRole">
      </app-user-profile>
    `
  })
  export class ParentComponent {
    userName = '张三';
    userAge = 30;
    userRole = 'Admin';
  }
  ```

### 1.4 服务与依赖注入（Services & DI）

#### 1.4.1 依赖注入原理

::: details 依赖注入的概念
依赖注入(Dependency Injection，简称DI)是一种设计模式，用于实现控制反转(IoC)。在Angular中，它是一个核心特性，允许类从外部源获取依赖，而不是自己创建它们。

**核心理念：**

- **分离关注点**：组件只需要声明它需要什么，而不需要关心如何获取或创建
- **提高解耦**：组件与其依赖实现细节隔离
- **集中管理**：依赖的实例化和生命周期由框架管理
- **可配置性**：可以在不同环境中灵活替换依赖的具体实现

**Angular DI的特点：**

```typescript
// 不使用DI的传统方式
class UserComponent {
  private userService: UserService;
  
  constructor() {
    // 直接创建依赖，导致强耦合
    this.userService = new UserService(new HttpClient(), new Logger());
  }
}

// 使用Angular DI的方式
@Component({/*...*/})
class UserComponent {
  constructor(private userService: UserService) {
    // Angular自动注入依赖，无需关心如何创建
  }
}
```

在Angular中，依赖注入系统使应用程序更具可测试性、可维护性和可扩展性。
:::

::: details 依赖注入的实现方式
Angular的依赖注入系统通过以下几种方式实现：

**1. 构造函数注入**

最常用的方式，Angular检查构造函数参数并自动注入依赖：

```typescript
@Component({
  selector: 'app-user-list',
  template: '...'
})
export class UserListComponent {
  users: User[] = [];
  
  constructor(
    private userService: UserService, 
    private logger: LoggerService
  ) {
    // 依赖已被注入，可直接使用
    this.logger.log('UserListComponent已创建');
  }
  
  ngOnInit() {
    this.userService.getUsers()
      .subscribe(users => this.users = users);
  }
}
```

**2. @Injectable() 装饰器**

用于标记可以被注入的服务类：

```typescript
@Injectable({
  providedIn: 'root' // 指定注入作用域
})
export class DataService {
  // 服务实现...
}
```

**3. 工厂函数**

适用于需要在创建服务实例时进行条件判断或额外配置：

```typescript
const dataServiceFactory = (http: HttpClient, config: AppConfig) => {
  if (config.useMockData) {
    return new MockDataService();
  }
  return new RealDataService(http);
};

@NgModule({
  providers: [
    {
      provide: DataService,
      useFactory: dataServiceFactory,
      deps: [HttpClient, AppConfig]
    }
  ]
})
export class AppModule { }
```

**4. InjectionToken**

处理非类依赖（如配置对象、常量值）：

```typescript
export const API_URL = new InjectionToken<string>('api.url');

@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com/v1' }
  ]
})
export class AppModule { }

// 在组件中使用
@Component({/*...*/})
class ApiComponent {
  constructor(@Inject(API_URL) private apiUrl: string) {
    console.log(`Using API URL: ${this.apiUrl}`);
  }
}
```

**5. 提供者语法**

Angular提供了多种注册依赖的方式：

```typescript
@NgModule({
  providers: [
    UserService, // 简写形式，等价于{ provide: UserService, useClass: UserService }
    { provide: UserService, useClass: EnhancedUserService }, // 类提供者
    { provide: 'API_KEY', useValue: 'abc123' }, // 值提供者
    { provide: LoggerService, useExisting: ConsoleLoggerService }, // 别名提供者
  ]
})
```
:::

::: details 依赖注入的分层结构
Angular的依赖注入系统是分层的，具有清晰的继承关系：

**1. 注入器层级**

```
Platform Injector (平台级)
   ↓
Root Injector (根级)
   ↓
Module Injectors (模块级)
   ↓
Component Injectors (组件级)
```

**2. 注入器解析过程**

当组件请求依赖时，Angular会：
1. 先在组件注入器中查找
2. 如果没找到，向上查找父组件注入器
3. 继续向上至模块注入器
4. 然后是根注入器
5. 最后是平台注入器
6. 如果所有层级都未找到，则抛出错误或返回默认值

**示例：解析过程可视化**

```typescript
@Component({
  selector: 'parent-component',
  providers: [
    { provide: DataService, useClass: ParentDataService }
  ]
})
class ParentComponent {
  constructor(private dataService: DataService) {
    // 注入ParentDataService实例
  }
}

@Component({
  selector: 'child-component',
  providers: [
    // 为此组件及其子组件重新提供DataService
    { provide: DataService, useClass: ChildDataService }
  ]
})
class ChildComponent {
  constructor(private dataService: DataService) {
    // 注入ChildDataService实例，覆盖了父级提供的实例
  }
}

@Component({
  selector: 'grandchild-component'
  // 未提供DataService
})
class GrandchildComponent {
  constructor(private dataService: DataService) {
    // 从最近的祖先(ChildComponent)获取ChildDataService实例
  }
}
```

这种层级结构使得Angular能够精确控制服务的范围和生命周期，非常适合创建复杂的组件树层次结构。
:::

::: details 依赖注入的优点
Angular依赖注入机制带来以下核心优势：

**1. 提高代码的可测试性**

```typescript
// 使用DI的组件可以轻松模拟依赖
describe('UserComponent', () => {
  let component: UserComponent;
  let mockUserService: jasmine.SpyObj<UserService>;
  
  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockUserService.getUsers.and.returnValue(of([{id: 1, name: 'Test User'}]));
    
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    });
    
    component = TestBed.createComponent(UserComponent).componentInstance;
  });
  
  it('should load users from service', () => {
    component.ngOnInit();
    expect(mockUserService.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(1);
  });
});
```

**2. 减少代码的耦合度**
- 组件依赖接口而非具体实现
- 实现变更时无需修改消费者代码
- 支持按需切换不同实现

**3. 提高代码的可维护性**
- 职责清晰划分：组件专注于视图逻辑，服务专注于业务逻辑
- 依赖集中管理：在一处配置，多处使用
- 代码更易于理解：构造函数清晰展示组件的依赖关系

**4. 提高代码的可扩展性**
- 容易替换实现：比如从本地存储切换到远程API
- 支持特性切换：通过不同的provider实现功能开关
- 跨应用共享服务：多个Angular应用可共享同一个服务实例

**5. 支持懒加载和按需实例化**
- 服务可以按需实例化，减少初始加载时间
- 通过providedIn配置，服务可以随模块懒加载
- 可以根据条件创建不同的服务实例

**实际应用场景：**

```typescript
// 开发环境使用mock数据，生产环境使用真实API
@NgModule({
  providers: [
    {
      provide: DataService,
      useClass: environment.production ? ApiDataService : MockDataService
    }
  ]
})
export class AppModule { }
```
:::

#### 1.4.2 服务的作用域

- **服务的作用域**

  在Angular中，服务的作用域决定了服务实例的生命周期和可见范围。合理设置服务作用域对于应用性能和状态管理至关重要。Angular提供了多种服务作用域选项：

  **1. root 作用域 - 全局单例**
  
  这是最常用的作用域，在整个应用中只创建一个服务实例。适用于需要在应用各部分共享数据或状态的服务。

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private users: User[] = [];
    
    constructor(private http: HttpClient) { }
    
    getUsers(): Observable<User[]> {
      return this.http.get<User[]>('/api/users').pipe(
        tap(users => this.users = users),
        shareReplay(1)
      );
    }
  }
  ```

  **2. platform 作用域 - 多个应用共享**
  
  当在同一页面运行多个Angular应用时使用，允许这些应用共享同一个服务实例。

  ```typescript
  @Injectable({
    providedIn: 'platform'
  })
  export class GlobalConfigService {
    private config: AppConfig;
    
    constructor() {
      // 初始化全局配置
      this.config = {
        apiUrl: 'https://api.example.com',
        theme: 'default'
      };
    }
    
    getConfig(): AppConfig {
      return this.config;
    }
  }
  ```

  **3. any 作用域 - 每个懒加载模块独立实例**
  
  为每个注入服务的懒加载模块创建独立的服务实例，适用于需要模块级隔离的状态管理。

  ```typescript
  @Injectable({
    providedIn: 'any'
  })
  export class FeatureStateService {
    private state: FeatureState = { isEnabled: false };
    
    enableFeature(): void {
      this.state.isEnabled = true;
    }
    
    getState(): FeatureState {
      return this.state;
    }
  }
  ```

  **4. 特定模块作用域**
  
  在特定模块的providers数组中提供服务，服务实例的生命周期与模块相同。

  ```typescript
  @Injectable()
  export class ProductService {
    private products: Product[] = [];
    
    constructor(private http: HttpClient) { }
    
    getProducts(): Observable<Product[]> {
      return this.http.get<Product[]>('/api/products');
    }
  }

  @NgModule({
    imports: [CommonModule, HttpClientModule],
    declarations: [ProductListComponent, ProductDetailComponent],
    providers: [ProductService] // 模块级服务
  })
  export class ProductModule { }
  ```

  **5. 组件级作用域**
  
  在组件的providers数组中提供服务，每个组件实例都会创建自己的服务实例。

  ```typescript
  @Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    providers: [UserProfileService] // 组件级服务
  })
  export class UserProfileComponent implements OnInit {
    userData: UserData;
    
    constructor(private userProfileService: UserProfileService) { }
    
    ngOnInit(): void {
      this.userProfileService.loadUserData()
        .subscribe(data => this.userData = data);
    }
  }
  ```

  **作用域选择最佳实践：**

  - 对于全局状态管理、认证服务等需要在整个应用共享的服务，使用`root`作用域
  - 对于特定功能模块的状态管理，使用模块级作用域或`any`作用域
  - 对于与特定组件紧密耦合的服务，使用组件级作用域
  - 使用`platform`作用域时要谨慎，确保多应用间共享状态是真正需要的

- **服务实例化策略**

  Angular的依赖注入系统提供了多种服务实例化策略，使开发者能够灵活地控制服务的创建方式。

  <details>
  <summary>1. useClass - 类提供者</summary>
  
  用于指定一个类作为服务的实现。当请求该服务时，Angular会创建该类的新实例。
  
  ```typescript
  // 基本用法
  @NgModule({
    providers: [
      { provide: Logger, useClass: Logger } // 简写形式: Logger
    ]
  })
  
  // 替换实现
  @NgModule({
    providers: [
      { provide: Logger, useClass: BetterLogger } // 用BetterLogger替代Logger
    ]
  })
  
  // 条件替换
  @NgModule({
    providers: [
      { 
        provide: Logger, 
        useClass: environment.production ? ProductionLogger : DevelopmentLogger 
      }
    ]
  })
  ```
  
  </details>

  <details>
  <summary>2. useValue - 值提供者</summary>
  
  用于提供一个预先创建的对象或值，而不是类。适用于配置对象、常量或模拟服务。
  
  ```typescript
  // 配置对象
  const API_CONFIG = {
    endpoint: 'https://api.example.com',
    apiKey: 'your-api-key',
    timeout: 3000
  };
  
  @NgModule({
    providers: [
      { provide: 'ApiConfig', useValue: API_CONFIG }
    ]
  })
  
  // 使用InjectionToken处理非类依赖
  export const API_ENDPOINT = new InjectionToken<string>('api.endpoint');
  
  @NgModule({
    providers: [
      { provide: API_ENDPOINT, useValue: 'https://api.example.com/v1' }
    ]
  })
  
  // 在组件中注入
  @Component({/*...*/})
  class ApiConsumer {
    constructor(@Inject(API_ENDPOINT) private apiUrl: string) {
      console.log(`API URL: ${this.apiUrl}`);
    }
  }
  
  // 模拟服务(用于测试)
  const mockUserService = {
    getCurrentUser: () => of({ id: 1, name: '测试用户' }),
    isAuthenticated: () => true
  };
  
  TestBed.configureTestingModule({
    providers: [
      { provide: UserService, useValue: mockUserService }
    ]
  });
  ```
  
  </details>

  <details>
  <summary>3. useFactory - 工厂提供者</summary>
  
  用于动态创建服务实例，可以基于条件逻辑或其他依赖来决定创建什么样的实例。
  
  ```typescript
  // 基本工厂函数
  function loggerFactory() {
    return new Logger();
  }
  
  @NgModule({
    providers: [
      { provide: Logger, useFactory: loggerFactory }
    ]
  })
  
  // 带依赖的工厂函数
  function databaseFactory(http: HttpClient, config: AppConfig) {
    if (config.inMemoryDb) {
      return new InMemoryDatabase();
    } else {
      return new HttpDatabase(http, config.apiUrl);
    }
  }
  
  @NgModule({
    providers: [
      {
        provide: Database,
        useFactory: databaseFactory,
        deps: [HttpClient, AppConfig] // 声明工厂函数的依赖
      }
    ]
  })
  
  // 异步初始化服务
  function configServiceFactory(http: HttpClient): Promise<ConfigService> {
    return http.get<AppConfig>('/api/config')
      .toPromise()
      .then(config => new ConfigService(config));
  }
  
  @NgModule({
    providers: [
      {
        provide: APP_INITIALIZER,
        useFactory: (configService: ConfigService) => () => configService.load(),
        deps: [ConfigService],
        multi: true
      },
      {
        provide: ConfigService,
        useFactory: configServiceFactory,
        deps: [HttpClient]
      }
    ]
  })
  ```
  
  </details>

  <details>
  <summary>4. useExisting - 别名提供者</summary>
  
  创建一个服务的别名，使得同一个服务实例可以通过不同的令牌进行注入。
  
  ```typescript
  // 创建服务别名
  @NgModule({
    providers: [
      LoggerService, // 提供原始服务
      { provide: Logger, useExisting: LoggerService } // Logger成为LoggerService的别名
    ]
  })
  
  // 接口适配
  @Injectable({ providedIn: 'root' })
  export class NewUserService {
    // 新API实现
  }
  
  @NgModule({
    providers: [
      // 保持向后兼容性，旧代码仍可使用OldUserService
      { provide: 'OldUserService', useExisting: NewUserService }
    ]
  })
  
  // 在组件中使用
  @Component({/*...*/})
  class UserComponent {
    // 两个变量引用同一个服务实例
    constructor(
      private logger: Logger,
      private loggerService: LoggerService
    ) {
      // logger === loggerService 为true
      console.log(logger === loggerService); // true
    }
  }
  ```
  
  </details>

  <details>
  <summary>5. 实际应用场景与最佳实践</summary>
  
  ```typescript
  // 特性切换
  const FEATURE_FLAGS = new InjectionToken<Record<string, boolean>>('FEATURE_FLAGS');
  
  @NgModule({
    providers: [
      {
        provide: FEATURE_FLAGS,
        useValue: {
          enableNewUI: true,
          enableAnalytics: environment.production,
          experimentalFeatures: false
        }
      },
      {
        provide: UserInterface,
        useFactory: (flags: Record<string, boolean>) => {
          return flags.enableNewUI ? new NewUserInterface() : new LegacyUserInterface();
        },
        deps: [FEATURE_FLAGS]
      }
    ]
  })
  
  // 多环境配置
  @Injectable({ providedIn: 'root' })
  export class EnvironmentService {
    constructor(@Inject(ENVIRONMENT) public env: Environment) {}
  }
  
  // 在不同的环境模块中提供不同的配置
  @NgModule({
    providers: [
      { provide: ENVIRONMENT, useValue: devEnvironment }
    ]
  })
  export class DevEnvironmentModule {}
  
  @NgModule({
    providers: [
      { provide: ENVIRONMENT, useValue: prodEnvironment }
    ]
  })
  export class ProdEnvironmentModule {}
  
  // 根据环境导入相应模块
  @NgModule({
    imports: [
      environment.production ? ProdEnvironmentModule : DevEnvironmentModule
    ]
  })
  export class AppModule {}
  ```
  
  </details>

- **循环依赖处理**

  <details>
  <summary>循环依赖解决方案</summary>
  
  在 Angular 应用中，循环依赖是一个常见的问题，特别是在复杂应用中。当两个或多个类相互依赖时，就会出现循环依赖问题。Angular 提供了几种解决方案：

  #### 1. 使用 forwardRef 解决循环依赖

  `forwardRef` 允许我们引用尚未定义的依赖项。

  ```typescript
  import { Injectable, forwardRef, Inject } from '@angular/core';

  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
    
    getDataFromA(): string {
      return '来自 ServiceA 的数据';
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(@Inject(forwardRef(() => ServiceA)) private serviceA: ServiceA) {}
    
    getDataFromB(): string {
      const dataFromA = this.serviceA.getDataFromA();
      return `ServiceB 处理了 ${dataFromA}`;
    }
  }
  ```

  #### 2. 使用接口打破循环依赖

  通过引入接口或抽象类来解耦服务之间的直接依赖关系。

  ```typescript
  // 定义接口
  export interface IServiceA {
    getDataFromA(): string;
  }

  export interface IServiceB {
    getDataFromB(): string;
  }

  // 实现服务
  @Injectable({ providedIn: 'root' })
  export class ServiceA implements IServiceA {
    constructor(private serviceB: IServiceB) {}
    
    getDataFromA(): string {
      return '来自 ServiceA 的数据';
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceB implements IServiceB {
    private serviceA: IServiceA;
    
    // 使用 setter 注入，避免构造函数循环依赖
    setServiceA(serviceA: IServiceA) {
      this.serviceA = serviceA;
    }
    
    getDataFromB(): string {
      if (this.serviceA) {
        const dataFromA = this.serviceA.getDataFromA();
        return `ServiceB 处理了 ${dataFromA}`;
      }
      return '无法获取 ServiceA 数据';
    }
  }

  // 在模块中配置
  @NgModule({
    providers: [
      ServiceA,
      ServiceB,
      {
        provide: APP_INITIALIZER,
        useFactory: (serviceA: ServiceA, serviceB: ServiceB) => {
          return () => {
            // 手动设置依赖关系
            serviceB.setServiceA(serviceA);
          };
        },
        deps: [ServiceA, ServiceB],
        multi: true
      }
    ]
  })
  export class AppModule {}
  ```

  #### 3. 使用事件或消息总线模式

  通过事件或消息总线解耦服务之间的直接依赖。

  ```typescript
  @Injectable({ providedIn: 'root' })
  export class EventBusService {
    private eventBus = new Subject<{event: string, data: any}>();
    
    emit(event: string, data: any) {
      this.eventBus.next({event, data});
    }
    
    on(event: string): Observable<any> {
      return this.eventBus.pipe(
        filter(e => e.event === event),
        map(e => e.data)
      );
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    constructor(private eventBus: EventBusService) {
      this.eventBus.on('B_EVENT').subscribe(data => {
        console.log('ServiceA 收到来自 ServiceB 的数据:', data);
      });
    }
    
    sendToB() {
      this.eventBus.emit('A_EVENT', '来自 ServiceA 的数据');
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(private eventBus: EventBusService) {
      this.eventBus.on('A_EVENT').subscribe(data => {
        console.log('ServiceB 收到来自 ServiceA 的数据:', data);
        this.processAndRespond(data);
      });
    }
    
    private processAndRespond(data: string) {
      const processed = `ServiceB 处理了 ${data}`;
      this.eventBus.emit('B_EVENT', processed);
    }
  }
  ```

  #### 4. 使用懒加载解决循环依赖

  通过延迟加载依赖项来避免循环依赖问题。

  ```typescript
  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    private serviceB: ServiceB;
    
    // 使用 Injector 延迟获取依赖
    constructor(private injector: Injector) {}
    
    // 懒加载 ServiceB
    private getServiceB(): ServiceB {
      if (!this.serviceB) {
        this.serviceB = this.injector.get(ServiceB);
      }
      return this.serviceB;
    }
    
    getDataFromA(): string {
      return '来自 ServiceA 的数据';
    }
    
    getDataFromB(): string {
      return this.getServiceB().getDataFromB();
    }
  }

  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    private serviceA: ServiceA;
    
    constructor(private injector: Injector) {}
    
    // 懒加载 ServiceA
    private getServiceA(): ServiceA {
      if (!this.serviceA) {
        this.serviceA = this.injector.get(ServiceA);
      }
      return this.serviceA;
    }
    
    getDataFromB(): string {
      return '来自 ServiceB 的数据';
    }
    
    getDataFromA(): string {
      return this.getServiceA().getDataFromA();
    }
  }
  ```
  
  循环依赖通常表明设计可能存在问题，最佳实践是重构代码以避免循环依赖。但在某些情况下，使用上述技术可以有效解决循环依赖问题。
  </details>

#### 1.4.3 Provider 配置

Angular 的依赖注入系统提供了多种配置提供者的方式，使开发者能够灵活地管理依赖。

<details>
<summary><strong>Provider 配置详解</strong></summary>

Angular 提供了四种主要的 Provider 配置方式，每种方式适用于不同的场景：

1. **useClass - 类提供者**

   当需要为令牌提供一个类的实例时使用。这是最常见的提供者类型。

   ```typescript
   // 基本用法
   @NgModule({
     providers: [
       { provide: Logger, useClass: Logger }
     ]
   })
   
   // 简写形式
   @NgModule({
     providers: [Logger]
   })
   
   // 使用不同的实现类
   @NgModule({
     providers: [
       { provide: Logger, useClass: BetterLogger }
     ]
   })
   ```

2. **useValue - 值提供者**

   当需要提供一个已存在的对象、字符串、数字或函数等值时使用。

   ```typescript
   // 提供配置对象
   const CONFIG = {
     apiUrl: 'http://api.example.com',
     timeout: 3000
   };
   
   @NgModule({
     providers: [
       { provide: 'CONFIG', useValue: CONFIG }
     ]
   })
   
   // 在组件中使用
   @Component({...})
   export class AppComponent {
     constructor(@Inject('CONFIG') private config: any) {
       console.log(config.apiUrl); // http://api.example.com
     }
   }
   ```

3. **useFactory - 工厂提供者**

   当需要动态创建依赖值时使用，可以基于其他依赖或配置进行条件创建。

   ```typescript
   // 定义工厂函数
   function loggerFactory(isProduction: boolean) {
     return isProduction 
       ? new ProductionLogger() 
       : new DevelopmentLogger();
   }
   
   // 配置提供者
   @NgModule({
     providers: [
       { 
         provide: Logger,
         useFactory: () => loggerFactory(environment.production),
         deps: [] // 工厂函数的依赖
       }
     ]
   })
   
   // 带依赖的工厂
   @NgModule({
     providers: [
       { 
         provide: UserService,
         useFactory: (http: HttpClient, config: Config) => {
           return new UserService(http, config.apiUrl);
         },
         deps: [HttpClient, Config] // 注入到工厂函数的依赖
       }
     ]
   })
   ```

4. **useExisting - 别名提供者**

   当需要为已存在的服务创建别名时使用，使同一个服务实例可以通过不同的令牌访问。

   ```typescript
   @NgModule({
     providers: [
       LoggerService,
       // OldLogger 是 LoggerService 的别名
       { provide: OldLogger, useExisting: LoggerService }
     ]
   })
   
   // 在组件中使用
   @Component({...})
   export class AppComponent {
     constructor(
       private logger: LoggerService,
       private oldLogger: OldLogger
     ) {
       // logger 和 oldLogger 引用同一个实例
       console.log(logger === oldLogger); // true
     }
   }
   ```
</details>

<details>
<summary><strong>循环依赖处理</strong></summary>

循环依赖是指两个或多个类相互依赖的情况，这在 Angular 中可能导致问题。Angular 提供了几种解决循环依赖的方法：

1. **使用 forwardRef 解决循环依赖**

   `forwardRef` 允许引用尚未定义的依赖，解决编译时的循环引用问题。

   ```typescript
   import { Injectable, forwardRef, Inject } from '@angular/core';
   
   @Injectable({ providedIn: 'root' })
   export class ServiceA {
     constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
     
     getDataFromA(): string {
       return '来自 ServiceA 的数据';
     }
     
     getDataFromB(): string {
       return this.serviceB.getDataFromB();
     }
   }
   
   @Injectable({ providedIn: 'root' })
   export class ServiceB {
     constructor(@Inject(forwardRef(() => ServiceA)) private serviceA: ServiceA) {}
     
     getDataFromB(): string {
       return '来自 ServiceB 的数据';
     }
     
     getDataFromA(): string {
       return this.serviceA.getDataFromA();
     }
   }
   ```

2. **使用 Injector 延迟注入**

   通过 Injector 手动获取依赖，避免构造函数中的循环依赖。

   ```typescript
   import { Injectable, Injector } from '@angular/core';
   
   @Injectable({ providedIn: 'root' })
   export class ServiceA {
     private serviceB: ServiceB;
     
     constructor(private injector: Injector) {}
     
     // 懒加载 ServiceB
     private getServiceB(): ServiceB {
       if (!this.serviceB) {
         this.serviceB = this.injector.get(ServiceB);
       }
       return this.serviceB;
     }
     
     getDataFromA(): string {
       return '来自 ServiceA 的数据';
     }
     
     getDataFromB(): string {
       return this.getServiceB().getDataFromB();
     }
   }
   
   @Injectable({ providedIn: 'root' })
   export class ServiceB {
     private serviceA: ServiceA;
     
     constructor(private injector: Injector) {}
     
     // 懒加载 ServiceA
     private getServiceA(): ServiceA {
       if (!this.serviceA) {
         this.serviceA = this.injector.get(ServiceA);
       }
       return this.serviceA;
     }
     
     getDataFromB(): string {
       return '来自 ServiceB 的数据';
     }
     
     getDataFromA(): string {
       return this.getServiceA().getDataFromA();
     }
   }
   ```

3. **使用接口打破循环依赖**

   通过引入接口或抽象类，重构代码以避免直接的循环依赖。

   ```typescript
   // 定义接口
   export interface IServiceA {
     getDataFromA(): string;
   }
   
   export interface IServiceB {
     getDataFromB(): string;
   }
   
   // 实现服务
   @Injectable({ providedIn: 'root' })
   export class ServiceA implements IServiceA {
     constructor(private serviceB: IServiceB) {}
     
     getDataFromA(): string {
       return '来自 ServiceA 的数据';
     }
     
     getDataFromB(): string {
       return this.serviceB.getDataFromB();
     }
   }
   
   @Injectable({ providedIn: 'root' })
   export class ServiceB implements IServiceB {
     constructor() {}
     
     getDataFromB(): string {
       return '来自 ServiceB 的数据';
     }
   }
   
   // 在模块中提供
   @NgModule({
     providers: [
       { provide: ServiceA, useClass: ServiceA },
       { provide: 'IServiceB', useClass: ServiceB }
     ]
   })
   ```

4. **重构设计以避免循环依赖**

   最佳实践是重新设计服务结构，例如引入中介服务或事件总线。

   ```typescript
   // 中介服务
   @Injectable({ providedIn: 'root' })
   export class MediatorService {
     getDataFromA(): string {
       return '来自 ServiceA 的数据';
     }
     
     getDataFromB(): string {
       return '来自 ServiceB 的数据';
     }
   }
   
   // 使用中介服务
   @Injectable({ providedIn: 'root' })
   export class ServiceA {
     constructor(private mediator: MediatorService) {}
     
     getDataFromB(): string {
       return this.mediator.getDataFromB();
     }
   }
   
   @Injectable({ providedIn: 'root' })
   export class ServiceB {
     constructor(private mediator: MediatorService) {}
     
     getDataFromA(): string {
       return this.mediator.getDataFromA();
     }
   }
   ```

循环依赖通常表明设计可能存在问题，最佳实践是重构代码以避免循环依赖。但在某些情况下，使用上述技术可以有效解决循环依赖问题。
</details>

#### 1.4.4 多级注入器

- **多级注入器**

  <details>
  <summary>Angular 注入器层级结构详解</summary>
  
  Angular 依赖注入系统采用层级结构的注入器树，从上到下形成一个注入器链，每个注入器负责在其作用域内解析依赖。

  #### 1. 平台注入器 (Platform Injector)

  ```typescript
  // 平台注入器是最顶层的注入器，负责所有应用共享的服务
  // 通常在使用 platformBrowserDynamic() 启动应用时创建
  
  import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
  
  // 可以提供平台级服务
  const platformProviders = [
    { provide: 'PLATFORM_ID', useValue: 'browser' },
    { provide: 'GLOBAL_CONFIG', useValue: globalConfig }
  ];
  
  // 创建平台并启动应用
  platformBrowserDynamic(platformProviders)
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
  ```

  #### 2. 根注入器 (Root Injector)

  ```typescript
  // 根注入器在应用启动时创建，管理应用级别的服务
  // 通过 AppModule 的 providers 或 providedIn: 'root' 配置
  
  @Injectable({
    providedIn: 'root' // 在根注入器中提供服务
  })
  export class AuthService {
    // 应用级别的认证服务
    isAuthenticated(): boolean {
      return localStorage.getItem('token') !== null;
    }
  }
  
  // 或在 AppModule 中提供
  @NgModule({
    imports: [BrowserModule],
    declarations: [AppComponent],
    providers: [
      AuthService,
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
  })
  export class AppModule { }
  ```

  #### 3. 模块注入器 (Module Injector)

  ```typescript
  // 每个 NgModule 都有自己的注入器
  // 特性模块的注入器是根注入器的子注入器
  
  @NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [ProductListComponent, ProductDetailComponent],
    providers: [
      ProductService, // 模块级服务
      { provide: ProductConfig, useValue: { showPrices: true } }
    ]
  })
  export class ProductModule { }
  
  // 懒加载模块有独立的注入器实例
  const routes: Routes = [
    { 
      path: 'admin', 
      loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) 
    }
  ];
  ```

  #### 4. 组件注入器 (Component Injector)

  ```typescript
  // 每个组件都可以有自己的注入器
  // 组件注入器是其父组件注入器的子注入器
  
  @Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    providers: [
      UserProfileService, // 组件级服务
      { provide: 'COMPONENT_ID', useValue: 'user-profile-123' }
    ]
  })
  export class UserProfileComponent {
    constructor(
      private userProfileService: UserProfileService,
      @Inject('COMPONENT_ID') private componentId: string
    ) { }
  }
  
  // 子组件可以访问父组件提供的服务
  @Component({
    selector: 'app-user-details',
    template: `<div>用户详情</div>`,
    // 没有提供自己的 providers
  })
  export class UserDetailsComponent {
    constructor(
      // 从父组件注入器解析
      private userProfileService: UserProfileService
    ) { }
  }
  ```

  #### 注入器解析规则

  当组件请求依赖时，Angular 按以下顺序查找：
  1. 组件自身的注入器
  2. 父组件的注入器，一直向上到根组件
  3. 模块的注入器
  4. 根注入器
  5. 平台注入器

  如果在整个链上都找不到依赖，Angular 将抛出错误。

  ```typescript
  // 示例：依赖解析过程
  @Component({
    selector: 'app-child',
    template: `<div>子组件</div>`,
    providers: [{ provide: 'LOCAL_CONFIG', useValue: { theme: 'dark' } }]
  })
  export class ChildComponent {
    constructor(
      @Inject('LOCAL_CONFIG') private localConfig: any, // 从组件注入器获取
      private authService: AuthService, // 从根注入器获取
      private productService: ProductService // 从模块注入器获取
    ) {
      console.log('本地配置:', localConfig);
      console.log('认证状态:', authService.isAuthenticated());
      productService.getProducts().subscribe(products => {
        console.log('产品列表:', products);
      });
    }
  }
  ```
  </details>

- **注入器作用域**

  <details>
  <summary>Angular 注入器作用域详解</summary>
  
  Angular 提供了多种注入器作用域，使开发者能够精确控制服务实例的生命周期和可见性。

  #### 1. root 作用域 - 应用级单例

  ```typescript
  // 在整个应用中只有一个实例，所有组件和服务共享同一个实例
  
  @Injectable({
    providedIn: 'root' // 应用级单例
  })
  export class GlobalStateService {
    private state = new BehaviorSubject<AppState>({ isLoading: false });
    
    state$ = this.state.asObservable();
    
    updateState(newState: Partial<AppState>): void {
      this.state.next({ ...this.state.getValue(), ...newState });
    }
  }
  
  // 在任何组件中使用
  @Component({/*...*/})
  export class HeaderComponent {
    isLoading$ = this.stateService.state$.pipe(
      map(state => state.isLoading)
    );
    
    constructor(private stateService: GlobalStateService) { }
  }
  
  // 在另一个组件中使用同一个实例
  @Component({/*...*/})
  export class FooterComponent {
    constructor(private stateService: GlobalStateService) {
      // 与 HeaderComponent 中的是同一个实例
    }
    
    showLoader(): void {
      this.stateService.updateState({ isLoading: true });
    }
  }
  ```

  #### 2. platform 作用域 - 多个应用共享

  ```typescript
  // 在同一个页面上运行的多个 Angular 应用之间共享服务实例
  
  @Injectable({
    providedIn: 'platform' // 平台级单例
  })
  export class CrossAppService {
    private sharedData = new BehaviorSubject<any>(null);
    
    sharedData$ = this.sharedData.asObservable();
    
    shareData(data: any): void {
      this.sharedData.next(data);
      console.log('数据已在应用间共享:', data);
    }
  }
  
  // 在第一个应用中
  // app1.module.ts
  @NgModule({/*...*/})
  export class App1Module {
    constructor(private crossAppService: CrossAppService) {
      // 使用共享服务
      this.crossAppService.shareData({ source: 'App1', timestamp: Date.now() });
    }
  }
  
  // 在第二个应用中
  // app2.module.ts
  @NgModule({/*...*/})
  export class App2Module {
    constructor(private crossAppService: CrossAppService) {
      // 接收来自 App1 的数据
      this.crossAppService.sharedData$.subscribe(data => {
        console.log('App2 收到共享数据:', data);
      });
    }
  }
  ```

  #### 3. any 作用域 - 每个懒加载模块独立实例

  ```typescript
  // 在每个使用该服务的模块中创建一个新实例
  // 特别适用于懒加载模块，确保每个懒加载模块有自己的服务实例
  
  @Injectable({
    providedIn: 'any' // 模块级实例
  })
  export class FeatureStateService {
    private state = new BehaviorSubject<FeatureState>({ initialized: false });
    
    state$ = this.state.asObservable();
    
    constructor() {
      console.log('FeatureStateService 实例已创建');
    }
    
    initialize(): void {
      this.state.next({ initialized: true });
    }
  }
  
  // 在主模块中使用
  @Component({/*...*/})
  export class MainComponent {
    constructor(private featureState: FeatureStateService) {
      // 主模块的实例
    }
  }
  
  // 在懒加载模块中
  @NgModule({
    imports: [CommonModule],
    declarations: [FeatureComponent]
  })
  export class FeatureModule {
    constructor(private featureState: FeatureStateService) {
      // 懒加载模块的独立实例
      this.featureState.initialize();
    }
  }
  
  // 路由配置
  const routes: Routes = [
    { 
      path: 'feature', 
      loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule) 
    }
  ];
  ```

  #### 4. 特定模块作用域

  ```typescript
  // 在特定模块中提供服务，服务实例的生命周期与模块相同
  
  @Injectable()
  export class AdminService {
    private permissions = new BehaviorSubject<string[]>([]);
    
    permissions$ = this.permissions.asObservable();
    
    constructor(private http: HttpClient) {
      console.log('AdminService 实例已创建');
      this.loadPermissions();
    }
    
    private loadPermissions(): void {
      this.http.get<string[]>('/api/admin/permissions')
        .subscribe(perms => this.permissions.next(perms));
    }
    
    hasPermission(perm: string): Observable<boolean> {
      return this.permissions$.pipe(
        map(perms => perms.includes(perm))
      );
    }
  }
  
  @NgModule({
    imports: [CommonModule, HttpClientModule, AdminRoutingModule],
    declarations: [AdminDashboardComponent, UserManagementComponent],
    providers: [
      AdminService // 模块级服务
    ]
  })
  export class AdminModule { }
  
  // 在模块组件中使用
  @Component({/*...*/})
  export class UserManagementComponent {
    canEditUsers$ = this.adminService.hasPermission('users.edit');
    
    constructor(private adminService: AdminService) { }
  }
  ```

  #### 作用域选择指南

  - 使用 `root` 作用域：
    - 全局状态管理
    - 认证服务
    - 日志服务
    - 全局配置服务

  - 使用 `platform` 作用域：
    - 微前端架构中的共享服务
    - 多应用通信服务
    - 共享资源管理

  - 使用 `any` 作用域：
    - 特性模块的状态管理
    - 需要在懒加载模块中隔离的服务
    - 模块级缓存服务

  - 使用特定模块作用域：
    - 仅在特定功能模块中使用的服务
    - 需要在模块边界内封装的业务逻辑
    - 模块特定的API服务
  </details>
- **提供者类型**

  <details>
  <summary>Angular 依赖注入提供者类型详解</summary>
  
  Angular 依赖注入系统提供了多种提供者类型，用于灵活地配置如何创建和提供服务实例。

  #### 1. useClass - 类提供者

  最常见的提供者类型，用于指定一个类作为依赖的实现。

  ```typescript
  // 基本用法
  @NgModule({
    providers: [
      UserService // 简写形式，等同于 { provide: UserService, useClass: UserService }
    ]
  })
  
  // 替换实现
  @NgModule({
    providers: [
      { provide: Logger, useClass: ProductionLogger } // 使用 ProductionLogger 替代 Logger
    ]
  })
  
  // 在环境配置中使用不同实现
  @NgModule({
    providers: [
      {
        provide: ApiService,
        useClass: environment.production ? ProdApiService : MockApiService
      }
    ]
  })
  ```

  #### 2. useValue - 值提供者

  用于提供一个固定值、对象或函数作为依赖。

  ```typescript
  // 提供配置对象
  const APP_CONFIG = {
    apiEndpoint: 'https://api.example.com',
    pageSize: 10,
    enableCache: true
  };
  
  @NgModule({
    providers: [
      { provide: 'APP_CONFIG', useValue: APP_CONFIG }
    ]
  })
  
  // 在组件中使用
  @Component({/*...*/})
  class AppComponent {
    constructor(@Inject('APP_CONFIG') private config: any) {
      console.log(config.apiEndpoint); // https://api.example.com
    }
  }
  
  // 提供函数或第三方库
  @NgModule({
    providers: [
      { provide: 'WINDOW', useValue: window },
      { provide: 'MOMENT', useValue: moment }
    ]
  })
  ```

  #### 3. useFactory - 工厂提供者

  用于动态创建依赖实例，可以基于其他依赖或运行时条件创建实例。

  ```typescript
  // 基本工厂函数
  function loggerFactory(isProduction: boolean) {
    return isProduction 
      ? new ProductionLogger() 
      : new DevelopmentLogger();
  }
  
  @NgModule({
    providers: [
      {
        provide: Logger,
        useFactory: () => loggerFactory(environment.production)
      }
    ]
  })
  
  // 带依赖的工厂函数
  function databaseFactory(http: HttpClient, config: AppConfig) {
    if (config.inMemoryDb) {
      return new InMemoryDatabase();
    } else {
      return new RemoteDatabase(http, config.apiUrl);
    }
  }
  
  @NgModule({
    providers: [
      {
        provide: Database,
        useFactory: databaseFactory,
        deps: [HttpClient, AppConfig] // 工厂函数的依赖
      }
    ]
  })
  
  // 异步初始化服务
  function initializeAppFactory(configService: ConfigService) {
    return () => configService.loadConfig().toPromise();
  }
  
  @NgModule({
    providers: [
      {
        provide: APP_INITIALIZER,
        useFactory: initializeAppFactory,
        deps: [ConfigService],
        multi: true
      }
    ]
  })
  ```

  #### 4. useExisting - 别名提供者

  用于为已存在的服务创建别名，使多个令牌指向同一个服务实例。

  ```typescript
  // 创建接口别名
  @Injectable({ providedIn: 'root' })
  export class LoggerService implements LoggerInterface {
    log(message: string) { console.log(message); }
  }
  
  @NgModule({
    providers: [
      LoggerService,
      { provide: 'LoggerInterface', useExisting: LoggerService } // 创建别名
    ]
  })
  
  // 向后兼容
  @NgModule({
    providers: [
      NewUserService,
      { provide: LegacyUserService, useExisting: NewUserService } // 旧代码仍可使用 LegacyUserService
    ]
  })
  
  // 多接口实现
  @Injectable({ providedIn: 'root' })
  export class DataService implements ReadableData, WritableData {
    // 实现两个接口的方法
  }
  
  @NgModule({
    providers: [
      DataService,
      { provide: ReadableData, useExisting: DataService },
      { provide: WritableData, useExisting: DataService }
    ]
  })
  ```

  #### 5. multi 提供者

  允许多个提供者使用相同的令牌，常用于可扩展的插件架构。

  ```typescript
  // HTTP 拦截器示例
  @NgModule({
    providers: [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: LoggingInterceptor,
        multi: true
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: CachingInterceptor,
        multi: true
      }
    ]
  })
  
  // 自定义插件系统
  const PLUGIN_TOKEN = new InjectionToken<Plugin[]>('PLUGINS');
  
  @NgModule({
    providers: [
      { provide: PLUGIN_TOKEN, useClass: FeaturePlugin, multi: true },
      { provide: PLUGIN_TOKEN, useClass: AnalyticsPlugin, multi: true },
      { provide: PLUGIN_TOKEN, useClass: ThemePlugin, multi: true }
    ]
  })
  
  // 在服务中使用多提供者
  @Injectable({ providedIn: 'root' })
  export class PluginManager {
    constructor(@Inject(PLUGIN_TOKEN) private plugins: Plugin[]) {
      // plugins 是一个包含所有插件实例的数组
      plugins.forEach(plugin => plugin.initialize());
    }
  }
  ```

  通过灵活组合这些提供者类型，Angular 依赖注入系统可以满足各种复杂场景的需求，实现高度可配置和可测试的应用架构。
  </details>

- **循环依赖处理**

  <details>
  <summary>Angular 循环依赖解决方案详解</summary>
  
  循环依赖是指两个或多个类相互依赖的情况，这在 Angular 中可能导致运行时错误或编译错误。以下是几种解决循环依赖的方法：

  #### 1. 使用 forwardRef 解决循环依赖

  `forwardRef` 允许引用尚未定义的依赖，解决编译时的循环引用问题。

  ```typescript
  import { Injectable, forwardRef, Inject } from '@angular/core';
  
  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
    
    getDataFromA(): string {
      return '来自 ServiceA 的数据';
    }
    
    getDataFromB(): string {
      return this.serviceB.getDataFromB();
    }
  }
  
  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(@Inject(forwardRef(() => ServiceA)) private serviceA: ServiceA) {}
    
    getDataFromB(): string {
      return '来自 ServiceB 的数据';
    }
    
    getDataFromA(): string {
      return this.serviceA.getDataFromA();
    }
  }
  ```

  #### 2. 使用 Injector 延迟注入

  通过 Injector 手动获取依赖，避免构造函数中的循环依赖。

  ```typescript
  import { Injectable, Injector } from '@angular/core';
  
  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    private serviceB: ServiceB;
    
    constructor(private injector: Injector) {}
    
    // 懒加载 ServiceB
    private getServiceB(): ServiceB {
      if (!this.serviceB) {
        this.serviceB = this.injector.get(ServiceB);
      }
      return this.serviceB;
    }
    
    getDataFromA(): string {
      return '来自 ServiceA 的数据';
    }
    
    getDataFromB(): string {
      return this.getServiceB().getDataFromB();
    }
  }
  
  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    private serviceA: ServiceA;
    
    constructor(private injector: Injector) {}
    
    // 懒加载 ServiceA
    private getServiceA(): ServiceA {
      if (!this.serviceA) {
        this.serviceA = this.injector.get(ServiceA);
      }
      return this.serviceA;
    }
    
    getDataFromB(): string {
      return '来自 ServiceB 的数据';
    }
    
    getDataFromA(): string {
      return this.getServiceA().getDataFromA();
    }
  }
  ```

  #### 3. 使用接口打破循环依赖

  通过引入接口或抽象类，重构代码以避免直接的循环依赖。

  ```typescript
  // 定义接口
  export interface IServiceA {
    getDataFromA(): string;
  }
  
  export interface IServiceB {
    getDataFromB(): string;
  }
  
  // 实现服务
  @Injectable({ providedIn: 'root' })
  export class ServiceA implements IServiceA {
    constructor(@Inject('IServiceB') private serviceB: IServiceB) {}
    
    getDataFromA(): string {
      return '来自 ServiceA 的数据';
    }
    
    getDataFromB(): string {
      return this.serviceB.getDataFromB();
    }
  }
  
  @Injectable({ providedIn: 'root' })
  export class ServiceB implements IServiceB {
    constructor() {}
    
    getDataFromB(): string {
      return '来自 ServiceB 的数据';
    }
  }
  
  // 在模块中提供
  @NgModule({
    providers: [
      { provide: ServiceA, useClass: ServiceA },
      { provide: 'IServiceB', useClass: ServiceB }
    ]
  })
  ```

  #### 4. 使用事件总线或状态管理

  通过引入事件总线或状态管理服务，解耦相互依赖的服务。

  ```typescript
  // 事件总线服务
  @Injectable({ providedIn: 'root' })
  export class EventBusService {
    private events = new Subject<{type: string, payload: any}>();
    
    events$ = this.events.asObservable();
    
    emit(type: string, payload: any) {
      this.events.next({type, payload});
    }
    
    on(eventType: string): Observable<any> {
      return this.events$.pipe(
        filter(event => event.type === eventType),
        map(event => event.payload)
      );
    }
  }
  
  // 使用事件总线的服务
  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    constructor(private eventBus: EventBusService) {
      this.eventBus.on('DATA_FROM_B').subscribe(data => {
        console.log('ServiceA received:', data);
      });
    }
    
    sendDataToB() {
      this.eventBus.emit('DATA_FROM_A', '来自 ServiceA 的数据');
    }
  }
  
  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(private eventBus: EventBusService) {
      this.eventBus.on('DATA_FROM_A').subscribe(data => {
        console.log('ServiceB received:', data);
        this.respondToA();
      });
    }
    
    respondToA() {
      this.eventBus.emit('DATA_FROM_B', '来自 ServiceB 的数据');
    }
  }
  ```

  #### 5. 使用中介者模式

  引入中介服务作为中间人，协调相互依赖的服务之间的通信。

  ```typescript
  // 中介服务
  @Injectable({ providedIn: 'root' })
  export class MediatorService {
    private dataFromA: string;
    private dataFromB: string;
    
    setDataFromA(data: string) {
      this.dataFromA = data;
    }
    
    setDataFromB(data: string) {
      this.dataFromB = data;
    }
    
    getDataFromA(): string {
      return this.dataFromA || '来自 ServiceA 的默认数据';
    }
    
    getDataFromB(): string {
      return this.dataFromB || '来自 ServiceB 的默认数据';
    }
  }
  
  // 使用中介服务
  @Injectable({ providedIn: 'root' })
  export class ServiceA {
    constructor(private mediator: MediatorService) {
      this.mediator.setDataFromA('来自 ServiceA 的数据');
    }
    
    getDataFromB(): string {
      return this.mediator.getDataFromB();
    }
  }
  
  @Injectable({ providedIn: 'root' })
  export class ServiceB {
    constructor(private mediator: MediatorService) {
      this.mediator.setDataFromB('来自 ServiceB 的数据');
    }
    
    getDataFromA(): string {
      return this.mediator.getDataFromA();
    }
  }
  ```

  #### 最佳实践建议

  1. **重新评估设计**：循环依赖通常是设计问题的征兆，考虑重构服务结构
  2. **职责分离**：确保每个服务有明确的单一职责
  3. **依赖方向**：建立清晰的依赖方向，避免双向依赖
  4. **共享模型**：将共享数据模型提取到单独的模块中
  5. **使用事件驱动**：考虑使用事件驱动架构代替直接依赖

  通过以上技术，可以有效解决 Angular 应用中的循环依赖问题，但最佳实践是通过良好的架构设计从根本上避免循环依赖。
  </details>

#### 1.4.5 服务单例模式

- **服务单例模式**

  <details>
  <summary>Angular 服务单例模式详解</summary>
  
  Angular 的依赖注入系统默认采用单例模式来管理服务实例，确保在指定的注入器范围内只存在一个服务实例。这种模式有助于共享状态、减少资源消耗并简化组件间通信。

  #### 1. 使用 @Injectable 装饰器创建单例服务

  ```typescript
  // 使用 providedIn: 'root' 创建应用级单例
  @Injectable({
    providedIn: 'root' // 在根注入器中提供服务，确保应用范围内单例
  })
  export class UserStateService {
    private userState = new BehaviorSubject<UserState>({ loggedIn: false });
    
    userState$ = this.userState.asObservable();
    
    constructor(private http: HttpClient) {
      console.log('UserStateService 实例已创建 - 应用中只会看到一次此消息');
    }
    
    login(credentials: Credentials): Observable<boolean> {
      return this.http.post<LoginResponse>('/api/login', credentials).pipe(
        tap(response => {
          if (response.success) {
            this.userState.next({ 
              loggedIn: true, 
              username: response.username,
              permissions: response.permissions 
            });
          }
        }),
        map(response => response.success)
      );
    }
    
    logout(): Observable<void> {
      return this.http.post<void>('/api/logout', {}).pipe(
        tap(() => {
          this.userState.next({ loggedIn: false });
        })
      );
    }
  }
  ```

  #### 2. 在模块中提供单例服务

  ```typescript
  // 在特定模块中提供单例服务
  @Injectable()
  export class FeatureService {
    private data: FeatureData[] = [];
    
    constructor() {
      console.log('FeatureService 实例已创建 - 在此模块中只会看到一次');
    }
    
    getData(): FeatureData[] {
      return [...this.data]; // 返回数据副本以避免外部修改
    }
    
    addData(item: FeatureData): void {
      this.data.push(item);
    }
  }
  
  @NgModule({
    imports: [CommonModule],
    declarations: [FeatureComponent],
    providers: [
      FeatureService // 在模块级别提供服务，确保模块内单例
    ]
  })
  export class FeatureModule { }
  ```

  #### 3. 单例服务的生命周期管理

  ```typescript
  // 使用 OnDestroy 接口管理服务资源
  @Injectable({
    providedIn: 'root'
  })
  export class ResourceManagerService implements OnDestroy {
    private resources: Resource[] = [];
    private subscription = new Subscription();
    
    constructor(private dataService: DataService) {
      // 订阅数据源
      this.subscription.add(
        this.dataService.getResourceUpdates().subscribe(
          updates => this.processUpdates(updates)
        )
      );
    }
    
    addResource(resource: Resource): void {
      this.resources.push(resource);
    }
    
    private processUpdates(updates: ResourceUpdate[]): void {
      // 处理资源更新
    }
    
    ngOnDestroy(): void {
      // 清理资源，防止内存泄漏
      this.subscription.unsubscribe();
      this.resources.forEach(resource => resource.release());
      console.log('ResourceManagerService 被销毁');
    }
  }
  ```

  #### 4. 单例服务的优势与使用场景

  **优势：**
  - **状态共享**：在应用的不同部分之间共享状态
  - **资源复用**：避免重复创建昂贵的资源
  - **协调通信**：作为组件间通信的中介
  - **缓存数据**：缓存远程数据以提高性能

  **最佳使用场景：**
  - 用户认证和授权服务
  - 全局状态管理
  - 配置服务
  - 日志服务
  - API通信服务
  - 缓存服务

  #### 5. 单例服务的测试

  ```typescript
  // 单例服务的单元测试
  describe('UserStateService', () => {
    let service: UserStateService;
    let httpMock: HttpTestingController;
    
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [UserStateService]
      });
      
      service = TestBed.inject(UserStateService);
      httpMock = TestBed.inject(HttpTestingController);
    });
    
    afterEach(() => {
      httpMock.verify(); // 确保没有未处理的请求
    });
    
    it('应该在登录成功后更新用户状态', () => {
      // 安排
      const credentials = { username: 'test', password: 'password' };
      const response = { success: true, username: 'test', permissions: ['read'] };
      let currentState: UserState | undefined;
      
      // 行动
      service.userState$.subscribe(state => {
        currentState = state;
      });
      
      service.login(credentials).subscribe();
      
      const req = httpMock.expectOne('/api/login');
      expect(req.request.method).toBe('POST');
      req.flush(response);
      
      // 断言
      expect(currentState).toBeDefined();
      expect(currentState?.loggedIn).toBeTrue();
      expect(currentState?.username).toBe('test');
    });
  });
  ```

  #### 6. 避免单例服务的常见陷阱

  - **过度使用全局状态**：可能导致应用难以理解和测试
  - **副作用管理**：确保服务中的副作用被正确处理
  - **循环依赖**：避免服务之间的循环依赖
  - **测试隔离**：在测试中正确重置服务状态

  单例服务是 Angular 应用架构的重要组成部分，合理使用可以显著提高应用的可维护性和性能。
  </details>

## 2. 高级特性

### 2.1 响应式编程（RxJS）

#### 2.1.1 Observable 和 Subject

- **Observable**

  <details>
  <summary>Observable 详解</summary>
  
  Observable 是 RxJS 中的核心概念，它代表一个可观察的数据流，能够随时间发出多个值。Observable 特别适合处理异步操作，如HTTP请求、用户输入事件等。

  **基本用法：**
  ```typescript
  import { Observable } from 'rxjs';

  // 创建一个简单的Observable
  const observable = new Observable<number>(subscriber => {
    subscriber.next(1);      // 发出值1
    subscriber.next(2);      // 发出值2
    setTimeout(() => {
      subscriber.next(3);    // 1秒后发出值3
      subscriber.complete(); // 完成Observable
    }, 1000);
  });

  // 订阅Observable
  const subscription = observable.subscribe({
    next: value => console.log(`接收到值: ${value}`),
    error: err => console.error(`发生错误: ${err}`),
    complete: () => console.log('Observable完成')
  });

  // 取消订阅
  setTimeout(() => {
    subscription.unsubscribe();
    console.log('已取消订阅');
  }, 2000);
  ```

  **Observable的特点：**
  - **惰性执行**：只有被订阅时才会执行
  - **可多次订阅**：每次订阅都会独立执行
  - **支持多种数据类型**：可以发出任何类型的值
  - **可取消**：通过unsubscribe()方法可以随时取消订阅
  - **支持操作符链式调用**：可以通过操作符对数据流进行转换和处理

  **常见创建方法：**
  ```typescript
  import { of, from, fromEvent, interval } from 'rxjs';

  // of: 将参数转换为Observable序列
  const ofObs = of(1, 2, 3);
  
  // from: 将数组、Promise或可迭代对象转换为Observable
  const fromObs = from([4, 5, 6]);
  
  // fromEvent: 将DOM事件转换为Observable
  const clickObs = fromEvent(document, 'click');
  
  // interval: 创建定时发出递增数字的Observable
  const intervalObs = interval(1000); // 每秒发出一个递增的数字
  ```
  </details>

- **Subject**

  <details>
  <summary>Subject 详解</summary>
  
  Subject 是一种特殊类型的 Observable，它既可以作为Observable被订阅，又可以作为Observer发出值。这使得Subject成为在多个观察者之间共享数据的理想选择。

  **基本用法：**
  ```typescript
  import { Subject } from 'rxjs';

  // 创建一个Subject
  const subject = new Subject<number>();

  // 添加两个观察者
  subject.subscribe({
    next: value => console.log(`观察者1收到: ${value}`)
  });
  
  subject.subscribe({
    next: value => console.log(`观察者2收到: ${value}`)
  });

  // 发出值
  subject.next(1);  // 两个观察者都会收到1
  subject.next(2);  // 两个观察者都会收到2
  
  // 完成Subject
  subject.complete();
  ```

  **Subject的主要类型：**

  1. **普通Subject**：不保存历史值，新订阅者只能接收到订阅后发出的值

  2. **BehaviorSubject**：保存最新值，新订阅者会立即收到最近发出的值
  ```typescript
  import { BehaviorSubject } from 'rxjs';
  
  // 创建BehaviorSubject，需要提供初始值
  const behaviorSubject = new BehaviorSubject<number>(0);
  
  behaviorSubject.subscribe(value => console.log(`第一个观察者: ${value}`));
  // 输出: "第一个观察者: 0"
  
  behaviorSubject.next(1);
  // 输出: "第一个观察者: 1"
  
  // 新订阅者会立即收到最新值1
  behaviorSubject.subscribe(value => console.log(`第二个观察者: ${value}`));
  // 输出: "第二个观察者: 1"
  ```

  3. **ReplaySubject**：可以重放指定数量的历史值
  ```typescript
  import { ReplaySubject } from 'rxjs';
  
  // 创建ReplaySubject，缓存最近3个值
  const replaySubject = new ReplaySubject<number>(3);
  
  replaySubject.next(1);
  replaySubject.next(2);
  replaySubject.next(3);
  replaySubject.next(4);
  
  // 新订阅者会收到最近的3个值：2, 3, 4
  replaySubject.subscribe(value => console.log(`收到重放值: ${value}`));
  ```

  4. **AsyncSubject**：只在完成时发出最后一个值
  ```typescript
  import { AsyncSubject } from 'rxjs';
  
  const asyncSubject = new AsyncSubject<number>();
  
  asyncSubject.subscribe(value => console.log(`收到值: ${value}`));
  
  asyncSubject.next(1);
  asyncSubject.next(2);
  asyncSubject.next(3);
  
  // 只有在complete()后，观察者才会收到最后一个值3
  asyncSubject.complete();
  // 输出: "收到值: 3"
  ```

  **在Angular中的应用场景：**
  - 组件间通信
  - 状态管理
  - 事件总线
  - 缓存服务

  ```typescript
  // 简单的状态服务示例
  import { Injectable } from '@angular/core';
  import { BehaviorSubject, Observable } from 'rxjs';

  interface AppState {
    isLoggedIn: boolean;
    username: string | null;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class StateService {
    private initialState: AppState = {
      isLoggedIn: false,
      username: null
    };
    
    private state$ = new BehaviorSubject<AppState>(this.initialState);
    
    // 公开只读的Observable
    getState(): Observable<AppState> {
      return this.state$.asObservable();
    }
    
    // 更新状态
    updateState(newState: Partial<AppState>): void {
      this.state$.next({
        ...this.state$.value,
        ...newState
      });
    }
    
    // 登录
    login(username: string): void {
      this.updateState({
        isLoggedIn: true,
        username
      });
    }
    
    // 登出
    logout(): void {
      this.updateState(this.initialState);
    }
  }
  ```
  </details>

#### 2.1.2 常用操作符

- **操作符**

  <details>
  <summary>RxJS 操作符详解</summary>
  
  操作符是 RxJS 的精髓，它们允许以声明式的方式组合复杂的异步逻辑。操作符接收 Observable 作为输入，并返回一个新的 Observable 作为输出。

  **转换类操作符：**
  ```typescript
  import { of, map, scan, pluck } from 'rxjs';

  // map: 映射每个值
  const source$ = of(1, 2, 3);
  const mapped$ = source$.pipe(
    map(x => x * 10)
  );
  // 输出: 10, 20, 30
  mapped$.subscribe(val => console.log(val));

  // scan: 累加器，类似数组的 reduce
  const sum$ = source$.pipe(
    scan((acc, curr) => acc + curr, 0)
  );
  // 输出: 1, 3, 6
  sum$.subscribe(val => console.log(val));
  ```

  **过滤类操作符：**
  ```typescript
  import { interval, filter, take, takeUntil, debounceTime, fromEvent } from 'rxjs';

  // filter: 过滤满足条件的值
  interval(1000).pipe(
    filter(x => x % 2 === 0),
    take(5)  // 只取前5个值
  ).subscribe(x => console.log(`偶数: ${x}`));

  // debounceTime: 防抖，等待指定时间后才发出最新值
  const input = document.querySelector('input');
  fromEvent(input, 'input').pipe(
    debounceTime(300)  // 300ms内无新输入才发出
  ).subscribe(() => console.log('用户停止输入'));
  ```

  **组合类操作符：**
  ```typescript
  import { merge, concat, combineLatest, forkJoin, of, timer } from 'rxjs';

  const first$ = of('A', 'B');
  const second$ = of(1, 2);

  // merge: 合并多个Observable，按时间顺序发出值
  merge(first$, second$).subscribe(val => console.log(`合并: ${val}`));
  // 输出: A, B, 1, 2 (或交错顺序)

  // concat: 按顺序连接多个Observable
  concat(first$, second$).subscribe(val => console.log(`连接: ${val}`));
  // 输出: A, B, 1, 2 (严格顺序)
  ```

  **高阶映射操作符：**
  ```typescript
  import { of, mergeMap, switchMap, concatMap, from, delay } from 'rxjs';

  const outer$ = of('A', 'B');
  
  // mergeMap: 将每个值映射为Observable并合并结果
  outer$.pipe(
    mergeMap(x => from([1, 2]).pipe(
      map(y => `${x}${y}`),
      delay(100)
    ))
  ).subscribe(val => console.log(`mergeMap: ${val}`));
  // 可能输出: A1, A2, B1, B2 (或交错顺序)

  // switchMap: 切换到最新的内部Observable
  outer$.pipe(
    switchMap(x => from([1, 2]).pipe(
      map(y => `${x}${y}`),
      delay(100)
    ))
  ).subscribe(val => console.log(`switchMap: ${val}`));
  // 如果B发出得足够快，可能输出: B1, B2 (A的结果被取消)
  ```

  **错误处理操作符：**
  ```typescript
  import { of, catchError, throwError, retry } from 'rxjs';

  const errorSource$ = throwError(() => new Error('发生错误'));
  
  errorSource$.pipe(
    catchError(error => {
      console.log(`捕获错误: ${error.message}`);
      return of('恢复值');
    })
  ).subscribe({
    next: val => console.log(`结果: ${val}`),
    error: err => console.log(`这不会执行，因为错误已被处理`)
  });
  ```

  **实用操作符：**
  ```typescript
  import { tap, finalize, timeout, delay } from 'rxjs';

  of(1, 2, 3).pipe(
    tap(x => console.log(`处理值: ${x}`)),  // 副作用，不改变流
    delay(1000),                           // 延迟1秒
    timeout(2000),                         // 如果2秒内没完成则报错
    finalize(() => console.log('完成清理')) // 无论如何都会执行
  ).subscribe({
    next: val => console.log(`结果: ${val}`),
    complete: () => console.log('完成')
  });
  ```

  **选择合适的操作符：**

  | 场景 | 推荐操作符 |
  |------|------------|
  | 转换每个值 | `map`, `pluck` |
  | 过滤值 | `filter`, `take`, `first`, `last` |
  | 累积值 | `scan`, `reduce` |
  | 处理时序 | `debounceTime`, `throttleTime`, `auditTime` |
  | HTTP请求 | `switchMap`(取消旧请求), `mergeMap`(并行请求), `concatMap`(顺序请求) |
  | 错误处理 | `catchError`, `retry`, `retryWhen` |
  | 资源管理 | `finalize`, `using` |
  | 条件执行 | `iif`, `defaultIfEmpty` |

  操作符的选择直接影响应用的响应性能和资源使用效率，合理使用是构建高质量Angular应用的关键。
  </details>

#### 2.1.3 错误处理

- **错误处理**

  <details>
  <summary>RxJS错误处理详解</summary>
  
  在响应式编程中，错误处理是确保应用稳定性的关键环节。RxJS提供了多种操作符来优雅地处理Observable流中的错误。

  **基本错误处理操作符：**

  ```typescript
  import { of, throwError, catchError, retry, retryWhen, delay, take } from 'rxjs';

  // 1. catchError - 捕获并恢复错误
  throwError(() => new Error('数据加载失败'))
    .pipe(
      catchError(error => {
        console.error('捕获到错误:', error.message);
        // 返回一个新的Observable作为恢复值
        return of('备用数据');
      })
    )
    .subscribe({
      next: value => console.log('结果:', value),  // 输出: 结果: 备用数据
      complete: () => console.log('完成')
    });

  // 2. retry - 在失败时重试整个序列
  throwError(() => new Error('临时网络错误'))
    .pipe(
      retry(3),  // 最多重试3次
      catchError(error => {
        console.error('重试3次后仍然失败:', error.message);
        return of('无法恢复，使用缓存数据');
      })
    )
    .subscribe(value => console.log(value));

  // 3. retryWhen - 高级重试策略
  throwError(() => new Error('服务器暂时不可用'))
    .pipe(
      retryWhen(errors => 
        errors.pipe(
          // 实现指数退避重试策略
          delay(1000),  // 延迟1秒后重试
          take(3),      // 最多重试3次
        )
      ),
      catchError(error => {
        console.error('智能重试后仍然失败:', error.message);
        return of('所有重试策略均已耗尽');
      })
    )
    .subscribe(value => console.log(value));
  ```

  **在Angular服务中的实际应用：**

  ```typescript
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, throwError } from 'rxjs';
  import { catchError, retry, timeout } from 'rxjs/operators';

  @Injectable({
    providedIn: 'root'
  })
  export class DataService {
    constructor(private http: HttpClient) {}

    getUsers(): Observable<any[]> {
      return this.http.get<any[]>('https://api.example.com/users')
        .pipe(
          timeout(5000),  // 5秒超时
          retry(2),       // 失败时重试2次
          catchError(error => {
            // 根据错误类型处理
            if (error.status === 404) {
              console.error('资源不存在');
            } else if (error.name === 'TimeoutError') {
              console.error('请求超时');
            } else {
              console.error('未知错误', error);
            }
            // 返回空数组或抛出自定义错误
            return throwError(() => new Error(`获取用户数据失败: ${error.message}`));
          })
        );
    }
  }
  ```

  **错误处理最佳实践：**

  1. **始终捕获错误** - 未处理的错误会导致整个Observable流终止
  2. **提供恢复策略** - 使用备用数据、缓存或空值
  3. **实现智能重试** - 对于网络请求，考虑使用退避策略
  4. **区分错误类型** - 针对不同错误类型采取不同处理方式
  5. **集中式错误处理** - 考虑使用拦截器统一处理HTTP错误
  6. **记录错误** - 便于调试和监控

  错误处理不仅是防御性编程的一部分，也是提升用户体验的关键。良好的错误处理策略能够使应用在面对异常情况时保持稳定和可用。
  </details>

#### 2.1.4 取消订阅和内存泄漏

- **取消订阅**

  <details>
  <summary>取消订阅的重要性与实现方式</summary>
  
  在Angular应用中，未正确取消订阅是导致内存泄漏的主要原因之一。当组件被销毁时，如果其订阅的Observable仍在活动状态，就会造成内存泄漏。

  **手动取消订阅：**

  ```typescript
  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { DataService } from './data.service';
  import { Subscription } from 'rxjs';

  @Component({
    selector: 'app-example',
    template: '<div>{{data}}</div>'
  })
  export class ExampleComponent implements OnInit, OnDestroy {
    data: any;
    private subscription: Subscription;

    constructor(private dataService: DataService) {}

    ngOnInit() {
      // 保存订阅引用
      this.subscription = this.dataService.getData().subscribe(
        result => this.data = result,
        error => console.error('获取数据失败', error)
      );
    }

    ngOnDestroy() {
      // 组件销毁时取消订阅
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  }
  ```

  **使用操作符自动取消订阅：**

  ```typescript
  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { DataService } from './data.service';
  import { Subject } from 'rxjs';
  import { takeUntil, take } from 'rxjs/operators';

  @Component({
    selector: 'app-example',
    template: '<div>{{data}}</div>'
  })
  export class ExampleComponent implements OnInit, OnDestroy {
    data: any;
    private destroy$ = new Subject<void>();

    constructor(private dataService: DataService) {}

    ngOnInit() {
      // 方法1：使用takeUntil操作符
      this.dataService.getData()
        .pipe(takeUntil(this.destroy$))
        .subscribe(result => this.data = result);

      // 方法2：使用take操作符（只获取指定次数的值）
      this.dataService.getData()
        .pipe(take(1))
        .subscribe(result => console.log('只获取一次:', result));
    }

    ngOnDestroy() {
      // 发出信号通知所有takeUntil操作符
      this.destroy$.next();
      // 完成Subject本身
      this.destroy$.complete();
    }
  }
  ```

  **常用的取消订阅操作符：**

  | 操作符 | 描述 |
  |--------|------|
  | `takeUntil(notifier)` | 发出源Observable的值，直到notifier Observable发出值 |
  | `take(count)` | 只发出源Observable的前count个值 |
  | `first()` | 只发出第一个值（等同于take(1)） |
  | `takeWhile(predicate)` | 当predicate函数返回false时停止发出值 |
  | `filter()` | 虽然不会取消订阅，但可以过滤不需要的值 |
  </details>

- **内存泄漏**

  <details>
  <summary>RxJS中的内存泄漏问题与解决方案</summary>
  
  在Angular应用中，RxJS相关的内存泄漏主要来源于以下几个方面：

  **1. 未取消的订阅**

  当组件被销毁但其订阅仍然活跃时，会导致内存泄漏。这是最常见的问题。

  ```typescript
  // 错误示例 - 未取消订阅
  ngOnInit() {
    this.interval$ = interval(1000).subscribe(val => {
      this.count = val;
      console.log(val);
    });
  }
  // 组件销毁时，interval会继续运行
  ```

  **2. 长时间运行的Observable**

  某些Observable（如`interval`、`timer`或HTTP长轮询）如果不正确管理，会长时间运行并消耗资源。

  **3. 事件监听器**

  使用`fromEvent`创建的Observable如果不取消订阅，会导致事件监听器泄漏。

  **4. Subject未完成**

  创建的Subject如果不调用complete()，可能会导致内存泄漏。

  **解决方案：**

  ```typescript
  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { interval, fromEvent, Subject, Subscription } from 'rxjs';
  import { takeUntil, takeWhile, finalize } from 'rxjs/operators';

  @Component({
    selector: 'app-memory-leak-demo',
    template: `
      <button #btn>点击我</button>
      <div>计数: {{count}}</div>
    `
  })
  export class MemoryLeakDemoComponent implements OnInit, OnDestroy {
    count = 0;
    private alive = true;
    private destroy$ = new Subject<void>();
    private subscriptions = new Subscription();

    constructor() {}

    ngOnInit() {
      // 方法1: 使用takeUntil
      interval(1000).pipe(
        takeUntil(this.destroy$),
        finalize(() => console.log('interval已清理'))
      ).subscribe(val => this.count = val);

      // 方法2: 使用takeWhile
      interval(1000).pipe(
        takeWhile(() => this.alive),
        finalize(() => console.log('第二个interval已清理'))
      ).subscribe();

      // 方法3: 使用Subscription集合
      const sub = interval(1000).subscribe();
      this.subscriptions.add(sub);

      // 处理DOM事件
      const btn = document.querySelector('#btn');
      if (btn) {
        fromEvent(btn, 'click')
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => console.log('按钮点击'));
      }
    }

    ngOnDestroy() {
      // 清理方法1的订阅
      this.destroy$.next();
      this.destroy$.complete();

      // 清理方法2的订阅
      this.alive = false;

      // 清理方法3的订阅
      this.subscriptions.unsubscribe();
    }
  }
  ```

  **内存泄漏检测工具：**

  1. Chrome DevTools的Memory面板
  2. Angular DevTools扩展
  3. 使用Zone.js的ngZone.onUnstable和ngZone.onStable事件监控异步操作
  4. RxJS的`finalize`操作符用于调试订阅清理

  **最佳实践：**

  1. 始终实现OnDestroy接口并取消所有订阅
  2. 优先使用声明式方法（如AsyncPipe）自动管理订阅
  3. 对于手动订阅，使用takeUntil模式或Subscription集合
  4. 避免在服务中创建长时间运行的Observable，除非它们是有意设计为应用程序生命周期级别的
  5. 使用finalize操作符确认清理逻辑被执行
  </details>

#### 2.1.5 高阶操作符（switchMap, mergeMap, concatMap）

- **高阶操作符**

  ```typescript
  // 高阶操作符是 RxJS 中的一个重要概念
  // 它们用于对 Observable 进行复杂的转换和操作
  // 常用的操作符包括: switchMap, mergeMap, concatMap, etc.
  ```

### 2.2 表单处理

#### 2.2.1 模板驱动表单

- **基本概念与特点**

  - 以HTML表单为中心构建
  - 使用`ngModel`指令实现双向绑定
  - 表单验证基于HTML5原生验证属性
  - 由`FormsModule`提供支持
  - 适合简单场景和快速原型开发

- **关键指令与使用方式**

  <details>
  <summary>核心指令介绍</summary>
  
  | 指令 | 选择器 | 作用 |
  |------|--------|------|
  | `NgForm` | `form` | 自动应用到`<form>`标签，创建顶级`FormGroup`实例 |
  | `NgModel` | `[ngModel]` | 创建`FormControl`实例并绑定到表单控件 |
  | `NgModelGroup` | `[ngModelGroup]` | 创建表单控件组，生成嵌套的`FormGroup` |
  | `NgSubmit` | `(ngSubmit)` | 当表单提交时触发 |
  | `RequiredValidator` | `required` | 必填字段验证 |
  | `PatternValidator` | `pattern` | 正则表达式验证 |
  | `MinLengthValidator` | `minlength` | 最小长度验证 |
  | `MaxLengthValidator` | `maxlength` | 最大长度验证 |
  
  </details>

- **模板驱动表单实现示例**

  <details>
  <summary>基本表单示例代码</summary>
  
  ```typescript
  // 导入FormsModule
  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { FormsModule } from '@angular/forms';
  import { AppComponent } from './app.component';
  
  @NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
  })
  export class AppModule { }
  ```
  
  ```typescript
  // 组件类
  import { Component } from '@angular/core';
  
  @Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html'
  })
  export class UserFormComponent {
    user = {
      name: '',
      email: '',
      password: ''
    };
  
    onSubmit() {
      console.log('表单提交数据:', this.user);
      // 处理表单提交
    }
  }
  ```
  
  ```html
  <!-- 模板文件 user-form.component.html -->
  <form #userForm="ngForm" (ngSubmit)="onSubmit()" novalidate>
    <div class="form-group">
      <label for="name">姓名</label>
      <input 
        type="text" 
        id="name" 
        name="name"
        [(ngModel)]="user.name" 
        #name="ngModel"
        required 
        minlength="2"
        class="form-control">
  
      <div *ngIf="name.invalid && (name.dirty || name.touched)" class="text-danger">
        <div *ngIf="name.errors?.['required']">姓名是必填项</div>
        <div *ngIf="name.errors?.['minlength']">姓名至少需要2个字符</div>
      </div>
    </div>
  
    <div class="form-group">
      <label for="email">邮箱</label>
      <input 
        type="email" 
        id="email" 
        name="email"
        [(ngModel)]="user.email" 
        #email="ngModel"
        required 
        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
        class="form-control">
  
      <div *ngIf="email.invalid && (email.dirty || email.touched)" class="text-danger">
        <div *ngIf="email.errors?.['required']">邮箱是必填项</div>
        <div *ngIf="email.errors?.['pattern']">请输入有效的邮箱地址</div>
      </div>
    </div>
  
    <div class="form-group">
      <label for="password">密码</label>
      <input 
        type="password" 
        id="password" 
        name="password"
        [(ngModel)]="user.password" 
        #password="ngModel"
        required 
        minlength="6"
        class="form-control">
  
      <div *ngIf="password.invalid && (password.dirty || password.touched)" class="text-danger">
        <div *ngIf="password.errors?.['required']">密码是必填项</div>
        <div *ngIf="password.errors?.['minlength']">密码至少需要6个字符</div>
      </div>
    </div>
  
    <button type="submit" [disabled]="userForm.invalid" class="btn btn-primary">提交</button>
  </form>
  ```
  
  </details>

- **表单验证状态与CSS类**

  <details>
  <summary>状态类与样式控制</summary>
  
  Angular会根据表单控件的状态自动添加以下CSS类：
  
  | CSS类 | 触发条件 | 说明 |
  |-------|---------|------|
  | `ng-valid` | 控件通过验证 | 可用于显示成功状态 |
  | `ng-invalid` | 控件未通过验证 | 可用于显示错误状态 |
  | `ng-pristine` | 控件值未改变 | 初始状态 |
  | `ng-dirty` | 控件值已改变 | 用户已输入内容 |
  | `ng-untouched` | 控件未获得过焦点 | 用户未交互 |
  | `ng-touched` | 控件已获得过焦点 | 用户已交互 |
  | `ng-pending` | 异步验证正在进行中 | 等待验证结果 |
  
  应用示例：
  
  ```css
  /* 验证状态样式 */
  .ng-valid[required], .ng-valid.required {
    border-left: 5px solid #42A948; /* 绿色 */
  }
  
  .ng-invalid:not(form) {
    border-left: 5px solid #a94442; /* 红色 */
  }
  
  .ng-pending {
    border-left: 5px solid #e3a21a; /* 黄色 */
  }
  ```
  
  </details>

- **访问表单值和状态**

  <details>
  <summary>获取表单数据</summary>
  
  ```html
  <!-- 模板中访问表单值和状态 -->
  <form #userForm="ngForm" (ngSubmit)="onSubmit()">
    <!-- 表单内容... -->
    
    <div class="debug-info" *ngIf="isDebug">
      <h4>表单状态</h4>
      <p>表单有效: {{userForm.valid}}</p>
      <p>表单已修改: {{userForm.dirty}}</p>
      <p>表单已触摸: {{userForm.touched}}</p>
      <p>表单值: {{userForm.value | json}}</p>
    </div>
  </form>
  ```
  
  ```typescript
  // 组件中访问表单实例
  import { Component, ViewChild } from '@angular/core';
  import { NgForm } from '@angular/forms';
  
  @Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html'
  })
  export class UserFormComponent {
    @ViewChild('userForm') userForm!: NgForm;
    isDebug = false;
    
    resetForm() {
      this.userForm.resetForm();
    }
    
    setDefault() {
      // 设置默认值
      this.userForm.form.patchValue({
        name: '张三',
        email: 'zhangsan@example.com'
      });
    }
    
    onSubmit() {
      if (this.userForm.valid) {
        console.log('表单值:', this.userForm.value);
        // 提交表单处理逻辑
      }
    }
  }
  ```
  
  </details>

- **嵌套表单组**

  <details>
  <summary>使用ngModelGroup创建嵌套表单</summary>
  
  ```html
  <form #userForm="ngForm" (ngSubmit)="onSubmit()">
    <!-- 个人信息组 -->
    <div ngModelGroup="personalInfo" #personalInfo="ngModelGroup">
      <h3>个人信息 <span *ngIf="personalInfo.invalid" class="text-danger">*</span></h3>
      
      <div class="form-group">
        <label for="name">姓名</label>
        <input type="text" id="name" name="name" [(ngModel)]="user.personalInfo.name" required class="form-control">
      </div>
      
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" id="email" name="email" [(ngModel)]="user.personalInfo.email" required class="form-control">
      </div>
    </div>
    
    <!-- 地址信息组 -->
    <div ngModelGroup="address" #address="ngModelGroup">
      <h3>地址信息 <span *ngIf="address.invalid" class="text-danger">*</span></h3>
      
      <div class="form-group">
        <label for="street">街道</label>
        <input type="text" id="street" name="street" [(ngModel)]="user.address.street" required class="form-control">
      </div>
      
      <div class="form-group">
        <label for="city">城市</label>
        <input type="text" id="city" name="city" [(ngModel)]="user.address.city" required class="form-control">
      </div>
      
      <div class="form-group">
        <label for="zip">邮编</label>
        <input type="text" id="zip" name="zip" [(ngModel)]="user.address.zip" pattern="[0-9]{6}" class="form-control">
      </div>
    </div>
    
    <button type="submit" [disabled]="userForm.invalid" class="btn btn-primary">提交</button>
  </form>
  ```
  
  ```typescript
  // 组件中的数据结构
  export class UserFormComponent {
    user = {
      personalInfo: {
        name: '',
        email: ''
      },
      address: {
        street: '',
        city: '',
        zip: ''
      }
    };
    
    onSubmit() {
      console.log('提交数据:', this.user);
      // 处理表单提交
    }
  }
  ```
  
  </details>

- **自定义验证器**

  <details>
  <summary>创建自定义表单验证器</summary>
  
  ```typescript
  // 自定义验证器指令
  import { Directive, Input } from '@angular/core';
  import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';
  
  // 验证器函数
  export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? {'forbiddenName': {value: control.value}} : null;
    };
  }
  
  // 验证器指令
  @Directive({
    selector: '[appForbiddenName]',
    providers: [{
      provide: NG_VALIDATORS, 
      useExisting: ForbiddenNameValidatorDirective, 
      multi: true
    }]
  })
  export class ForbiddenNameValidatorDirective implements Validator {
    @Input('appForbiddenName') forbiddenName = '';
  
    validate(control: AbstractControl): {[key: string]: any} | null {
      return this.forbiddenName ? 
        forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control) : null;
    }
  }
  ```
  
  ```html
  <!-- 在模板中使用自定义验证器 -->
  <div class="form-group">
    <label for="username">用户名</label>
    <input 
      type="text" 
      id="username" 
      name="username"
      [(ngModel)]="user.username" 
      #username="ngModel"
      required
      appForbiddenName="admin"
      class="form-control">
  
    <div *ngIf="username.invalid && (username.dirty || username.touched)" class="text-danger">
      <div *ngIf="username.errors?.['required']">用户名是必填项</div>
      <div *ngIf="username.errors?.['forbiddenName']">不能使用 "{{username.errors?.['forbiddenName'].value}}" 作为用户名</div>
    </div>
  </div>
  ```
  
  </details>

- **最佳实践与优缺点对比**

  <details>
  <summary>模板驱动表单的优缺点</summary>
  
  **优点：**
  
  1. **上手简单**：语法直观，类似于传统的HTML表单
  2. **快速开发**：适合简单表单和原型开发
  3. **自动双向绑定**：通过[(ngModel)]轻松实现
  4. **HTML验证集成**：直接使用HTML5验证属性
  5. **降低学习曲线**：对Angular初学者友好
  
  **缺点：**
  
  1. **可测试性较弱**：由于表单逻辑位于模板中，单元测试难度较大
  2. **复杂表单处理能力有限**：对于动态表单或复杂验证逻辑不够灵活
  3. **表单状态难以精确控制**：对表单的细粒度控制不如响应式表单
  4. **异步验证支持有限**：实现复杂的异步验证较困难
  5. **可扩展性较差**：随着表单复杂度增加，代码可维护性下降
  
  **适用场景：**
  
  - 简单的表单需求（如登录、注册表单）
  - 静态表单结构（不需要动态添加/删除表单控件）
  - 快速原型设计阶段
  - 团队对Angular不太熟悉时
  
  </details>

- **与响应式表单的比较**

  <details>
  <summary>模板驱动表单 vs 响应式表单</summary>
  
  | 特性 | 模板驱动表单 | 响应式表单 |
  |------|------------|-----------|
  | **表单模型创建** | 隐式创建，由Angular根据指令自动创建 | 显式创建，在组件类中使用FormBuilder |
  | **数据模型** | 非结构化的，松散的 | 结构化的，可预测的 |
  | **可预测性** | 异步，模板渲染后创建表单模型 | 同步，表单模型直接在组件中定义 |
  | **表单验证** | 基于指令的验证 | 基于函数的验证 |
  | **可测试性** | 难以单元测试 | 易于单元测试 |
  | **复杂表单** | 不适合复杂表单 | 适合复杂、动态表单 |
  | **代码分布** | 表单逻辑主要在模板中 | 表单逻辑主要在组件类中 |
  | **变更追踪** | `[(ngModel)]`表达式 | `valueChanges`和`statusChanges`可观察对象 |
  | **使用场景** | 简单场景、静态表单 | 复杂场景、动态表单 |
  | **关键模块** | `FormsModule` | `ReactiveFormsModule` |
  
  **代码对比：**
  
  模板驱动表单：
  ```html
  <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
    <input name="username" [(ngModel)]="login.username" required>
    <input name="password" [(ngModel)]="login.password" required>
    <button type="submit" [disabled]="loginForm.invalid">登录</button>
  </form>
  ```
  
  响应式表单：
  ```typescript
  // 组件类
  this.loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  ```
  
  ```html
  <!-- 模板 -->
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <input formControlName="username">
    <input formControlName="password">
    <button type="submit" [disabled]="loginForm.invalid">登录</button>
  </form>
  ```
  
  </details>

#### 2.2.2 响应式表单

- **FormGroup 和 FormControl**

  <details>
  <summary>响应式表单基础概念</summary>
  
  响应式表单是Angular中处理用户输入的一种强大方式，它基于显式的、不可变的数据模型，使表单状态可预测且易于测试。

  **核心类：**

  | 类 | 描述 |
  |---|---|
  | `FormControl` | 跟踪单个表单控件的值和验证状态 |
  | `FormGroup` | 跟踪一组FormControl实例的值和状态 |
  | `FormArray` | 跟踪FormControl、FormGroup或FormArray实例数组的值和状态 |
  | `FormBuilder` | 用于创建表单控件的工厂类，简化表单创建 |
  | `AbstractControl` | 所有表单控件类的基类，提供共同的API |

  **基本使用流程：**

  1. 导入ReactiveFormsModule
  2. 在组件类中定义表单模型
  3. 在模板中将表单模型与HTML元素绑定
  4. 监听表单状态变化并处理提交
  </details>

  <details>
  <summary>表单模型创建</summary>
  
  在响应式表单中，表单模型是在组件类中显式定义的，这使得表单逻辑更加集中和可测试。

  **手动创建表单模型：**

  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormGroup, FormControl, Validators } from '@angular/forms';

  @Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html'
  })
  export class UserProfileComponent implements OnInit {
    // 定义表单组
    profileForm!: FormGroup;

    ngOnInit() {
      // 初始化表单模型
      this.profileForm = new FormGroup({
        // 创建单个表单控件
        firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        // 嵌套表单组
        address: new FormGroup({
          street: new FormControl(''),
          city: new FormControl(''),
          zipCode: new FormControl('', [Validators.pattern(/^\d{6}$/)])
        })
      });
    }

    onSubmit() {
      if (this.profileForm.valid) {
        console.log('表单提交数据:', this.profileForm.value);
        // 处理表单提交
      } else {
        // 标记所有控件为touched，触发验证错误显示
        this.markFormGroupTouched(this.profileForm);
      }
    }

    // 递归标记表单组中所有控件为touched
    markFormGroupTouched(formGroup: FormGroup) {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```

  **使用FormBuilder创建表单模型：**

  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';

  @Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html'
  })
  export class UserProfileComponent implements OnInit {
    profileForm!: FormGroup;

    // 注入FormBuilder服务
    constructor(private fb: FormBuilder) {}

    ngOnInit() {
      // 使用FormBuilder简化表单创建
      this.profileForm = this.fb.group({
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        // 嵌套表单组
        address: this.fb.group({
          street: [''],
          city: [''],
          zipCode: ['', [Validators.pattern(/^\d{6}$/)]]
        })
      });
    }

    onSubmit() {
      if (this.profileForm.valid) {
        console.log('表单提交数据:', this.profileForm.value);
      }
    }
  }
  ```
  </details>

  <details>
  <summary>表单控件绑定</summary>
  
  在响应式表单中，我们使用特定的指令将表单模型与HTML元素绑定起来。

  **主要绑定指令：**

  | 指令 | 选择器 | 作用 |
  |------|--------|------|
  | `FormControlDirective` | `[formControl]` | 将单个FormControl绑定到表单元素 |
  | `FormGroupDirective` | `[formGroup]` | 将FormGroup绑定到form元素 |
  | `FormControlName` | `[formControlName]` | 在FormGroup内部绑定控件 |
  | `FormGroupName` | `[formGroupName]` | 绑定嵌套的FormGroup |
  | `FormArrayName` | `[formArrayName]` | 绑定FormArray |

  **模板绑定示例：**

  ```html
  <!-- 绑定表单组到form元素 -->
  <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
    
    <!-- 绑定单个表单控件 -->
    <div class="form-group">
      <label for="firstName">姓氏</label>
      <input 
        id="firstName" 
        type="text" 
        formControlName="firstName" 
        class="form-control">
      
      <!-- 错误信息显示 -->
      <div *ngIf="profileForm.get('firstName')?.invalid && 
                 (profileForm.get('firstName')?.dirty || 
                  profileForm.get('firstName')?.touched)" 
           class="text-danger">
        <div *ngIf="profileForm.get('firstName')?.errors?.['required']">
          姓氏是必填项
        </div>
        <div *ngIf="profileForm.get('firstName')?.errors?.['maxlength']">
          姓氏不能超过50个字符
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="lastName">名字</label>
      <input 
        id="lastName" 
        type="text" 
        formControlName="lastName" 
        class="form-control">
    </div>

    <div class="form-group">
      <label for="email">邮箱</label>
      <input 
        id="email" 
        type="email" 
        formControlName="email" 
        class="form-control">
    </div>

    <!-- 绑定嵌套表单组 -->
    <div formGroupName="address">
      <h3>地址信息</h3>
      
      <div class="form-group">
        <label for="street">街道</label>
        <input 
          id="street" 
          type="text" 
          formControlName="street" 
          class="form-control">
      </div>
      
      <div class="form-group">
        <label for="city">城市</label>
        <input 
          id="city" 
          type="text" 
          formControlName="city" 
          class="form-control">
      </div>
      
      <div class="form-group">
        <label for="zipCode">邮编</label>
        <input 
          id="zipCode" 
          type="text" 
          formControlName="zipCode" 
          class="form-control">
      </div>
    </div>

    <button type="submit" [disabled]="profileForm.invalid" class="btn btn-primary">
      提交
    </button>
  </form>
  ```

  **独立表单控件绑定：**

  ```html
  <!-- 不在FormGroup内的独立控件 -->
  <input [formControl]="nameControl">
  <div>当前值: {{ nameControl.value }}</div>
  ```

  ```typescript
  // 组件类中定义独立控件
  nameControl = new FormControl('初始值', Validators.required);
  ```
  </details>

  <details>
  <summary>值和状态访问</summary>
  
  响应式表单提供了丰富的API来访问和操作表单的值和状态。

  **获取和设置表单值：**

  ```typescript
  // 获取整个表单的值
  const formValue = this.profileForm.value;
  console.log('表单值:', formValue);

  // 获取单个控件的值
  const firstName = this.profileForm.get('firstName')?.value;
  console.log('姓氏:', firstName);

  // 获取嵌套控件的值
  const zipCode = this.profileForm.get('address.zipCode')?.value;
  console.log('邮编:', zipCode);

  // 设置整个表单的值（必须提供完整的值对象）
  this.profileForm.setValue({
    firstName: '张',
    lastName: '三',
    email: 'zhangsan@example.com',
    address: {
      street: '人民路',
      city: '北京',
      zipCode: '100000'
    }
  });

  // 部分更新表单值
  this.profileForm.patchValue({
    firstName: '李',
    lastName: '四',
    address: {
      city: '上海'
    }
  });

  // 重置表单
  this.profileForm.reset(); // 重置为初始空值
  this.profileForm.reset({  // 重置为指定值
    firstName: '默认姓氏',
    lastName: '默认名字'
  });
  ```

  **访问表单状态：**

  ```typescript
  // 检查表单有效性
  console.log('表单是否有效:', this.profileForm.valid);
  console.log('表单是否无效:', this.profileForm.invalid);

  // 检查表单状态
  console.log('表单是否已修改:', this.profileForm.dirty);
  console.log('表单是否未修改:', this.profileForm.pristine);
  console.log('表单是否已触摸:', this.profileForm.touched);
  console.log('表单是否未触摸:', this.profileForm.untouched);
  console.log('表单是否正在提交:', this.profileForm.pending);

  // 获取特定控件的状态
  const emailControl = this.profileForm.get('email');
  if (emailControl) {
    console.log('邮箱是否有效:', emailControl.valid);
    console.log('邮箱错误:', emailControl.errors);
  }

  // 获取所有错误
  console.log('表单所有错误:', this.getFormValidationErrors(this.profileForm));
  ```

  **辅助方法获取所有表单错误：**

  ```typescript
  getFormValidationErrors(form: FormGroup): any[] {
    const result: any[] = [];
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control instanceof FormGroup) {
        result.push(...this.getFormValidationErrors(control));
      }
      const controlErrors = control?.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach(keyError => {
          result.push({
            control: key,
            error: keyError,
            value: controlErrors[keyError]
          });
        });
      }
    });
    return result;
  }
  ```

  **监听值和状态变化：**

  ```typescript
  ngOnInit() {
    // 创建表单...

    // 监听整个表单的值变化
    this.profileForm.valueChanges.subscribe(value => {
      console.log('表单值变化:', value);
    });

    // 监听整个表单的状态变化
    this.profileForm.statusChanges.subscribe(status => {
      console.log('表单状态变化:', status); // 'VALID', 'INVALID', 'PENDING', 'DISABLED'
    });

    // 监听特定控件的值变化
    this.profileForm.get('email')?.valueChanges.subscribe(value => {
      console.log('邮箱值变化:', value);
    });

    // 监听特定控件的状态变化
    this.profileForm.get('email')?.statusChanges.subscribe(status => {
      console.log('邮箱状态变化:', status);
    });
  }
  ```
  </details>

  <details>
  <summary>表单构建器使用</summary>
  
  FormBuilder是Angular提供的一个工具类，用于简化表单创建过程。它提供了一组工厂方法，使表单模型的创建更加简洁。

  **基本用法：**

  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

  @Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html'
  })
  export class RegistrationComponent implements OnInit {
    registrationForm!: FormGroup;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
      this.createForm();
    }

    createForm() {
      // 使用FormBuilder创建表单
      this.registrationForm = this.fb.group({
        // 控件定义: [初始值, 同步验证器, 异步验证器]
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        
        // 嵌套表单组
        personalInfo: this.fb.group({
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          age: [null, [Validators.required, Validators.min(18)]]
        }),
        
        // 表单数组
        phoneNumbers: this.fb.array([
          this.fb.control('', Validators.required)
        ]),
        
        // 条件验证
        newsletter: [false],
        interests: this.fb.array([])
      }, {
        // 表单级验证器
        validators: this.passwordMatchValidator
      });

      // 条件验证示例
      this.registrationForm.get('newsletter')?.valueChanges.subscribe(checked => {
        const interestsArray = this.registrationForm.get('interests') as FormArray;
        
        if (checked) {
          interestsArray.push(this.fb.control('', Validators.required));
        } else {
          interestsArray.clear();
        }
      });
    }

    // 自定义表单级验证器
    passwordMatchValidator(form: FormGroup) {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    }

    // 获取表单数组控件
    get phoneNumbers() {
      return this.registrationForm.get('phoneNumbers') as FormArray;
    }

    get interests() {
      return this.registrationForm.get('interests') as FormArray;
    }

    // 添加电话号码字段
    addPhoneNumber() {
      this.phoneNumbers.push(this.fb.control('', Validators.required));
    }

    // 删除电话号码字段
    removePhoneNumber(index: number) {
      this.phoneNumbers.removeAt(index);
    }

    onSubmit() {
      if (this.registrationForm.valid) {
        console.log('注册表单数据:', this.registrationForm.value);
        // 处理表单提交
      } else {
        // 标记所有控件为touched，触发验证错误显示
        this.markFormGroupTouched(this.registrationForm);
      }
    }

    // 递归标记表单组中所有控件为touched
    markFormGroupTouched(formGroup: FormGroup) {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        } else if (control instanceof FormArray) {
          for (let i = 0; i < control.length; i++) {
            const arrayControl = control.at(i);
            if (arrayControl instanceof FormGroup) {
              this.markFormGroupTouched(arrayControl);
            } else {
              arrayControl.markAsTouched();
            }
          }
        }
      });
    }
  }
  ```

  **对应的模板：**

  ```html
  <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="username">用户名</label>
      <input id="username" type="text" formControlName="username" class="form-control">
      <div *ngIf="registrationForm.get('username')?.invalid && 
                 registrationForm.get('username')?.touched" 
           class="text-danger">
        <div *ngIf="registrationForm.get('username')?.errors?.['required']">
          用户名是必填项
        </div>
        <div *ngIf="registrationForm.get('username')?.errors?.['minlength']">
          用户名至少需要3个字符
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="email">邮箱</label>
      <input id="email" type="email" formControlName="email" class="form-control">
    </div>

    <div class="form-group">
      <label for="password">密码</label>
      <input id="password" type="password" formControlName="password" class="form-control">
    </div>

    <div class="form-group">
      <label for="confirmPassword">确认密码</label>
      <input id="confirmPassword" type="password" formControlName="confirmPassword" class="form-control">
      <div *ngIf="registrationForm.errors?.['passwordMismatch'] && 
                 registrationForm.get('confirmPassword')?.touched" 
           class="text-danger">
        密码和确认密码不匹配
      </div>
    </div>

    <div formGroupName="personalInfo">
      <h3>个人信息</h3>
      
      <div class="form-group">
        <label for="firstName">姓氏</label>
        <input id="firstName" type="text" formControlName="firstName" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="lastName">名字</label>
        <input id="lastName" type="text" formControlName="lastName" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="age">年龄</label>
        <input id="age" type="number" formControlName="age" class="form-control">
      </div>
    </div>

    <div>
      <h3>电话号码 
        <button type="button" (click)="addPhoneNumber()" class="btn btn-sm btn-secondary">
          添加
        </button>
      </h3>
      
      <div formArrayName="phoneNumbers">
        <div *ngFor="let phone of phoneNumbers.controls; let i = index" class="form-group">
          <label [for]="'phone-' + i">电话 #{{i + 1}}</label>
          <div class="input-group">
            <input [id]="'phone-' + i" [formControlName]="i" class="form-control">
            <div class="input-group-append">
              <button type="button" (click)="removePhoneNumber(i)" class="btn btn-danger">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-check">
      <input id="newsletter" type="checkbox" formControlName="newsletter" class="form-check-input">
      <label for="newsletter" class="form-check-label">订阅新闻通讯</label>
    </div>

    <div *ngIf="registrationForm.get('newsletter')?.value" formArrayName="interests">
      <h3>兴趣爱好</h3>
      <div *ngFor="let interest of interests.controls; let i = index" class="form-group">
        <label [for]="'interest-' + i">兴趣 #{{i + 1}}</label>
        <input [id]="'interest-' + i" [formControlName]="i" class="form-control">
      </div>
    </div>

    <button type="submit" class="btn btn-primary">注册</button>
  </form>

  <!-- 调试信息 -->
  <div *ngIf="isDebugMode">
    <h3>表单值</h3>
    <pre>{{ registrationForm.value | json }}</pre>
    
    <h3>表单状态</h3>
    <p>有效: {{ registrationForm.valid }}</p>
    <p>已修改: {{ registrationForm.dirty }}</p>
    <p>已触摸: {{ registrationForm.touched }}</p>
  </div>
  ```

  **FormBuilder的主要方法：**

  | 方法 | 描述 | 等价于 |
  |------|------|--------|
  | `control(value, validators?)` | 创建FormControl | `new FormControl(value, validators)` |
  | `group(controlsConfig, options?)` | 创建FormGroup | `new FormGroup(controls, options)` |
  | `array(controlsConfig, validators?)` | 创建FormArray | `new FormArray(controls, validators)` |

  FormBuilder不仅简化了表单创建语法，还提供了一致的API来处理各种表单场景，从简单的登录表单到复杂的动态表单。
  </details>
- **表单验证**

  Angular提供了强大的表单验证机制，可以确保用户输入的数据符合应用程序的要求。

  <details>
  <summary>同步验证器</summary>
  
  同步验证器是立即执行的验证函数，Angular内置了多种常用的同步验证器。

  ```typescript
  import { FormBuilder, Validators } from '@angular/forms';

  @Component({...})
  export class RegisterComponent {
    registrationForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_-]*$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      age: [null, [
        Validators.required,
        Validators.min(18),
        Validators.max(120)
      ]]
    });

    constructor(private fb: FormBuilder) {}
    
    // 获取表单控件的错误信息
    getErrorMessage(controlName: string): string {
      const control = this.registrationForm.get(controlName);
      if (control?.errors) {
        if (control.errors['required']) return '此字段为必填项';
        if (control.errors['email']) return '请输入有效的电子邮件地址';
        if (control.errors['minlength']) return `最少需要${control.errors['minlength'].requiredLength}个字符`;
        if (control.errors['maxlength']) return `最多允许${control.errors['maxlength'].requiredLength}个字符`;
        if (control.errors['pattern']) return '包含无效字符';
        if (control.errors['min']) return `最小值为${control.errors['min'].min}`;
        if (control.errors['max']) return `最大值为${control.errors['max'].max}`;
      }
      return '';
    }
  }
  ```

  **常用内置验证器：**
  
  | 验证器 | 描述 |
  |-------|------|
  | `Validators.required` | 确保字段不为空 |
  | `Validators.email` | 验证是否为有效的电子邮件格式 |
  | `Validators.pattern(regex)` | 根据正则表达式验证值 |
  | `Validators.minLength(n)` | 验证最小长度 |
  | `Validators.maxLength(n)` | 验证最大长度 |
  | `Validators.min(n)` | 验证最小数值 |
  | `Validators.max(n)` | 验证最大数值 |
  | `Validators.requiredTrue` | 验证值是否为true（用于复选框） |
  | `Validators.nullValidator` | 不执行验证（占位符） |
  </details>

  <details>
  <summary>异步验证器</summary>
  
  异步验证器用于需要进行异步操作的验证，如检查用户名或邮箱是否已被注册。

  ```typescript
  import { FormBuilder, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
  import { Observable, of } from 'rxjs';
  import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';
  import { HttpClient } from '@angular/common/http';

  @Component({...})
  export class RegisterComponent {
    registrationForm = this.fb.group({
      username: ['', 
        [Validators.required, Validators.minLength(4)],
        [this.usernameExistsValidator()]
      ],
      email: ['', 
        [Validators.required, Validators.email],
        [this.emailExistsValidator()]
      ]
    });

    constructor(
      private fb: FormBuilder,
      private http: HttpClient
    ) {}
    
    // 异步验证器：检查用户名是否已存在
    usernameExistsValidator(): AsyncValidatorFn {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return of(control.value).pipe(
          debounceTime(500), // 防抖，避免频繁请求
          switchMap(username => {
            // 如果为空则跳过验证
            if (!username) return of(null);
            
            return this.http.get<boolean>(`/api/check-username?username=${username}`).pipe(
              map(exists => exists ? { usernameExists: true } : null),
              catchError(() => of(null)) // 出错时不阻止表单提交
            );
          })
        );
      };
    }
    
    // 异步验证器：检查邮箱是否已存在
    emailExistsValidator(): AsyncValidatorFn {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return of(control.value).pipe(
          debounceTime(500),
          switchMap(email => {
            if (!email) return of(null);
            
            return this.http.get<boolean>(`/api/check-email?email=${email}`).pipe(
              map(exists => exists ? { emailExists: true } : null),
              catchError(() => of(null))
            );
          })
        );
      };
    }
    
    // 显示异步验证器的状态
    isFieldPending(fieldName: string): boolean {
      const control = this.registrationForm.get(fieldName);
      return control ? control.pending : false;
    }
  }
  ```

  **异步验证器的关键点：**
  
  1. 异步验证器必须返回一个Promise或Observable
  2. 使用`debounceTime`减少不必要的API调用
  3. 验证通过返回`null`，失败返回错误对象
  4. 可以通过控件的`pending`属性显示验证状态
  5. 异步验证器在同步验证器通过后才会执行
  </details>

  <details>
  <summary>自定义验证器</summary>
  
  自定义验证器允许你实现特定业务逻辑的验证规则。

  ```typescript
  import { FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

  @Component({...})
  export class RegisterComponent {
    registrationForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      phoneNumber: ['', [
        Validators.required,
        this.phoneNumberValidator()
      ]],
      birthDate: ['', [
        Validators.required,
        this.ageRangeValidator(18, 100)
      ]]
    });

    constructor(private fb: FormBuilder) {}
    
    // 自定义验证器：密码强度
    passwordStrengthValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        
        if (!value) {
          return null;
        }
        
        const hasUpperCase = /[A-Z]+/.test(value);
        const hasLowerCase = /[a-z]+/.test(value);
        const hasNumeric = /[0-9]+/.test(value);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
        
        const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
        
        return !passwordValid ? {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar
          }
        } : null;
      };
    }
    
    // 自定义验证器：手机号码
    phoneNumberValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        
        if (!value) {
          return null;
        }
        
        // 中国手机号验证规则
        const isValid = /^1[3-9]\d{9}$/.test(value);
        
        return isValid ? null : { invalidPhone: true };
      };
    }
    
    // 自定义验证器：年龄范围（基于出生日期）
    ageRangeValidator(min: number, max: number): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        
        if (!value) {
          return null;
        }
        
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < min) {
          return { minAge: { required: min, actual: age } };
        }
        
        if (age > max) {
          return { maxAge: { required: max, actual: age } };
        }
        
        return null;
      };
    }
    
    // 获取密码强度错误信息
    getPasswordStrengthError(): string {
      const control = this.registrationForm.get('password');
      if (control?.errors?.['passwordStrength']) {
        const errors = control.errors['passwordStrength'];
        let message = '密码必须包含：';
        if (!errors.hasUpperCase) message += ' 大写字母';
        if (!errors.hasLowerCase) message += ' 小写字母';
        if (!errors.hasNumeric) message += ' 数字';
        if (!errors.hasSpecialChar) message += ' 特殊字符';
        return message;
      }
      return '';
    }
  }
  ```

  **创建自定义验证器的最佳实践：**
  
  1. 验证器应该是纯函数，不依赖外部状态
  2. 验证通过返回`null`，失败返回描述性错误对象
  3. 验证器应该处理空值情况（通常返回`null`）
  4. 使用工厂函数创建可配置的验证器
  5. 错误对象应包含足够信息以便显示有用的错误消息
  </details>

  <details>
  <summary>跨字段验证</summary>
  
  跨字段验证用于验证多个表单控件之间的关系，如密码确认、日期范围等。

  ```typescript
  import { FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

  @Component({...})
  export class RegisterComponent {
    registrationForm = this.fb.group({
      passwordGroup: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator }),
      
      dateRange: this.fb.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required]
      }, { validators: this.dateRangeValidator })
    });

    constructor(private fb: FormBuilder) {}
    
    // 跨字段验证器：密码匹配
    passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    }
    
    // 跨字段验证器：日期范围
    dateRangeValidator(group: AbstractControl): ValidationErrors | null {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;
      
      if (!startDate || !endDate) return null;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return start < end ? null : { invalidDateRange: true };
    }
    
    // 获取密码组的错误信息
    getPasswordGroupError(): string {
      const group = this.registrationForm.get('passwordGroup');
      if (group?.errors?.['passwordMismatch']) {
        return '两次输入的密码不匹配';
      }
      return '';
    }
    
    // 获取日期范围的错误信息
    getDateRangeError(): string {
      const group = this.registrationForm.get('dateRange');
      if (group?.errors?.['invalidDateRange']) {
        return '结束日期必须晚于开始日期';
      }
      return '';
    }
    
    // 更复杂的跨字段验证：信用卡到期日期
    creditCardExpiryValidator(): ValidatorFn {
      return (group: AbstractControl): ValidationErrors | null => {
        const month = group.get('expiryMonth')?.value;
        const year = group.get('expiryYear')?.value;
        
        if (!month || !year) return null;
        
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // getMonth() 返回 0-11
        const currentYear = today.getFullYear();
        
        // 转换为数字
        const expiryMonth = +month;
        const expiryYear = +year;
        
        if (expiryYear < currentYear) {
          return { expired: true };
        }
        
        if (expiryYear === currentYear && expiryMonth < currentMonth) {
          return { expired: true };
        }
        
        return null;
      };
    }
  }
  ```

  **HTML模板示例：**

  ```html
  <form [formGroup]="registrationForm">
    <!-- 密码组 -->
    <div formGroupName="passwordGroup">
      <div class="form-group">
        <label for="password">密码</label>
        <input id="password" type="password" formControlName="password" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input id="confirmPassword" type="password" formControlName="confirmPassword" class="form-control">
      </div>
      
      <div *ngIf="getPasswordGroupError()" class="alert alert-danger">
        {{ getPasswordGroupError() }}
      </div>
    </div>
    
    <!-- 日期范围 -->
    <div formGroupName="dateRange">
      <div class="form-group">
        <label for="startDate">开始日期</label>
        <input id="startDate" type="date" formControlName="startDate" class="form-control">
      </div>
      
      <div class="form-group">
        <label for="endDate">结束日期</label>
        <input id="endDate" type="date" formControlName="endDate" class="form-control">
      </div>
      
      <div *ngIf="getDateRangeError()" class="alert alert-danger">
        {{ getDateRangeError() }}
      </div>
    </div>
  </form>
  ```

  **跨字段验证的关键点：**
  
  1. 跨字段验证器应用于FormGroup而非单个控件
  2. 可以通过`{ validators: myValidator }`选项添加到FormGroup
  3. 验证器可以访问组内的所有控件
  4. 错误会附加到FormGroup上，而不是单个控件
  5. 可以结合使用多个验证器处理复杂场景
  </details>

#### 2.2.3 动态表单

- **动态创建表单控件**

  <details>
  <summary>根据后端数据动态生成表单</summary>
  
  ```typescript
  interface DynamicFormConfig {
    controlType: 'input' | 'select' | 'checkbox' | 'radio' | 'textarea';
    name: string;
    label: string;
    value?: any;
    required?: boolean;
    validators?: ValidatorFn[];
    options?: {value: any, label: string}[];
    disabled?: boolean;
    placeholder?: string;
  }
  
  @Component({
    selector: 'app-dynamic-form',
    template: `
      <form [formGroup]="dynamicForm" (ngSubmit)="onSubmit()">
        <div *ngFor="let field of formConfig" class="form-group">
          <label [for]="field.name">{{field.label}}</label>
          
          <!-- 输入框 -->
          <input *ngIf="field.controlType === 'input'" 
                 [type]="field.type || 'text'"
                 [id]="field.name"
                 [formControlName]="field.name"
                 [placeholder]="field.placeholder || ''"
                 class="form-control">
          
          <!-- 下拉选择框 -->
          <select *ngIf="field.controlType === 'select'"
                  [id]="field.name"
                  [formControlName]="field.name"
                  class="form-control">
            <option value="">请选择</option>
            <option *ngFor="let opt of field.options" [value]="opt.value">
              {{opt.label}}
            </option>
          </select>
          
          <!-- 文本域 -->
          <textarea *ngIf="field.controlType === 'textarea'"
                    [id]="field.name"
                    [formControlName]="field.name"
                    [placeholder]="field.placeholder || ''"
                    class="form-control">
          </textarea>
          
          <!-- 单选按钮组 -->
          <div *ngIf="field.controlType === 'radio'" class="radio-group">
            <div *ngFor="let opt of field.options" class="form-check">
              <input type="radio" 
                     [id]="field.name + '_' + opt.value"
                     [value]="opt.value"
                     [formControlName]="field.name"
                     class="form-check-input">
              <label [for]="field.name + '_' + opt.value" class="form-check-label">
                {{opt.label}}
              </label>
            </div>
          </div>
          
          <!-- 复选框 -->
          <div *ngIf="field.controlType === 'checkbox'" class="form-check">
            <input type="checkbox"
                   [id]="field.name"
                   [formControlName]="field.name"
                   class="form-check-input">
            <label [for]="field.name" class="form-check-label">
              {{field.label}}
            </label>
          </div>
          
          <!-- 错误提示 -->
          <div *ngIf="isFieldInvalid(field.name)" class="text-danger">
            <div *ngIf="getControl(field.name).errors?.['required']">
              {{field.label}}是必填项
            </div>
            <div *ngIf="getControl(field.name).errors?.['email']">
              请输入有效的邮箱地址
            </div>
            <div *ngIf="getControl(field.name).errors?.['minlength']">
              {{field.label}}长度不能小于{{getControl(field.name).errors?.['minlength'].requiredLength}}个字符
            </div>
            <!-- 其他错误类型... -->
          </div>
        </div>
        
        <button type="submit" [disabled]="dynamicForm.invalid" class="btn btn-primary">
          提交
        </button>
      </form>
    `
  })
  export class DynamicFormComponent implements OnInit {
    @Input() formConfig: DynamicFormConfig[] = [];
    dynamicForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.createForm();
    }
    
    createForm() {
      const formControls: {[key: string]: AbstractControl} = {};
      
      this.formConfig.forEach(field => {
        // 创建验证器数组
        const validators: ValidatorFn[] = [];
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.validators) {
          validators.push(...field.validators);
        }
        
        // 创建表单控件
        formControls[field.name] = new FormControl(
          {value: field.value || '', disabled: field.disabled}, 
          validators
        );
      });
      
      this.dynamicForm = this.fb.group(formControls);
    }
    
    getControl(name: string): AbstractControl {
      return this.dynamicForm.get(name);
    }
    
    isFieldInvalid(name: string): boolean {
      const control = this.getControl(name);
      return control.invalid && (control.dirty || control.touched);
    }
    
    onSubmit() {
      if (this.dynamicForm.valid) {
        console.log('表单数据:', this.dynamicForm.value);
        // 处理表单提交...
      } else {
        // 标记所有字段为touched，显示验证错误
        Object.keys(this.dynamicForm.controls).forEach(key => {
          const control = this.dynamicForm.get(key);
          control.markAsTouched();
        });
      }
    }
  }
  ```
  
  **使用示例：**
  
  ```typescript
  @Component({
    selector: 'app-user-form',
    template: `<app-dynamic-form [formConfig]="userFormConfig"></app-dynamic-form>`
  })
  export class UserFormComponent implements OnInit {
    userFormConfig: DynamicFormConfig[] = [];
    
    constructor(private http: HttpClient) {}
    
    ngOnInit() {
      // 从API获取表单配置
      this.http.get<DynamicFormConfig[]>('/api/form-config').subscribe(
        config => {
          this.userFormConfig = config;
          
          // 或者手动设置表单配置
          this.userFormConfig = [
            {
              controlType: 'input',
              name: 'username',
              label: '用户名',
              required: true,
              validators: [Validators.minLength(3)]
            },
            {
              controlType: 'input',
              name: 'email',
              label: '邮箱',
              required: true,
              validators: [Validators.email]
            },
            {
              controlType: 'select',
              name: 'role',
              label: '角色',
              options: [
                {value: 'admin', label: '管理员'},
                {value: 'user', label: '普通用户'},
                {value: 'guest', label: '访客'}
              ]
            },
            {
              controlType: 'checkbox',
              name: 'subscribe',
              label: '订阅新闻邮件',
              value: false
            }
          ];
        }
      );
    }
  }
  ```
  </details>

- **动态验证规则**

  <details>
  <summary>根据业务规则动态应用验证器</summary>
  
  ```typescript
  @Component({
    selector: 'app-dynamic-validation',
    template: `
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <!-- 用户类型选择 -->
        <div class="form-group">
          <label>用户类型</label>
          <select formControlName="userType" class="form-control">
            <option value="personal">个人用户</option>
            <option value="business">企业用户</option>
          </select>
        </div>
        
        <!-- 个人用户字段 -->
        <div *ngIf="userType.value === 'personal'">
          <div class="form-group">
            <label for="idNumber">身份证号</label>
            <input id="idNumber" type="text" formControlName="idNumber" class="form-control">
            <div *ngIf="idNumber.invalid && idNumber.touched" class="text-danger">
              <div *ngIf="idNumber.errors?.['required']">身份证号是必填项</div>
              <div *ngIf="idNumber.errors?.['pattern']">身份证号格式不正确</div>
            </div>
          </div>
        </div>
        
        <!-- 企业用户字段 -->
        <div *ngIf="userType.value === 'business'">
          <div class="form-group">
            <label for="businessLicense">营业执照号</label>
            <input id="businessLicense" type="text" formControlName="businessLicense" class="form-control">
            <div *ngIf="businessLicense.invalid && businessLicense.touched" class="text-danger">
              <div *ngIf="businessLicense.errors?.['required']">营业执照号是必填项</div>
              <div *ngIf="businessLicense.errors?.['pattern']">营业执照号格式不正确</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="taxId">税务登记号</label>
            <input id="taxId" type="text" formControlName="taxId" class="form-control">
            <div *ngIf="taxId.invalid && taxId.touched" class="text-danger">
              <div *ngIf="taxId.errors?.['required']">税务登记号是必填项</div>
            </div>
          </div>
        </div>
        
        <button type="submit" [disabled]="userForm.invalid" class="btn btn-primary">提交</button>
      </form>
    `
  })
  export class DynamicValidationComponent implements OnInit {
    userForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.userForm = this.fb.group({
        userType: ['personal'],
        idNumber: [''],
        businessLicense: [''],
        taxId: ['']
      });
      
      // 监听用户类型变化，动态应用验证规则
      this.userType.valueChanges.subscribe(userType => {
        this.updateValidators(userType);
      });
      
      // 初始化验证规则
      this.updateValidators(this.userType.value);
    }
    
    updateValidators(userType: string) {
      // 清除所有验证器
      this.idNumber.clearValidators();
      this.businessLicense.clearValidators();
      this.taxId.clearValidators();
      
      if (userType === 'personal') {
        // 个人用户验证规则
        this.idNumber.setValidators([
          Validators.required,
          Validators.pattern(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/)
        ]);
      } else if (userType === 'business') {
        // 企业用户验证规则
        this.businessLicense.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/)
        ]);
        this.taxId.setValidators([Validators.required]);
      }
      
      // 更新验证状态
      this.idNumber.updateValueAndValidity();
      this.businessLicense.updateValueAndValidity();
      this.taxId.updateValueAndValidity();
    }
    
    // 获取表单控件的便捷访问器
    get userType() { return this.userForm.get('userType'); }
    get idNumber() { return this.userForm.get('idNumber'); }
    get businessLicense() { return this.userForm.get('businessLicense'); }
    get taxId() { return this.userForm.get('taxId'); }
    
    onSubmit() {
      if (this.userForm.valid) {
        console.log('表单数据:', this.userForm.value);
        // 处理表单提交...
      } else {
        // 标记所有字段为touched，显示验证错误
        Object.keys(this.userForm.controls).forEach(key => {
          const control = this.userForm.get(key);
          control.markAsTouched();
        });
      }
    }
  }
  ```
  
  **自定义异步验证器示例：**
  
  ```typescript
  // 用户名唯一性检查验证器
  export function usernameValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // 如果为空，不进行验证
      if (!control.value) {
        return of(null);
      }
      
      // 添加防抖，避免频繁请求
      return timer(500).pipe(
        switchMap(() => userService.checkUsernameExists(control.value)),
        map(exists => exists ? { usernameExists: true } : null),
        catchError(() => of({ serverError: true }))
      );
    };
  }
  
  // 在组件中使用
  @Component({
    // ...
  })
  export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    
    constructor(
      private fb: FormBuilder,
      private userService: UserService
    ) {}
    
    ngOnInit() {
      this.registerForm = this.fb.group({
        username: ['', {
          validators: [Validators.required, Validators.minLength(3)],
          asyncValidators: [usernameValidator(this.userService)],
          updateOn: 'blur' // 失去焦点时触发验证，减少请求次数
        }],
        // 其他字段...
      });
    }
  }
  ```
  </details>

- **动态表单数组**

  <details>
  <summary>动态添加和删除表单控件</summary>
  
  ```typescript
  @Component({
    selector: 'app-dynamic-form-array',
    template: `
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <h3>产品信息</h3>
        
        <div class="form-group">
          <label for="name">产品名称</label>
          <input id="name" type="text" formControlName="name" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="category">产品类别</label>
          <select id="category" formControlName="category" class="form-control">
            <option value="">请选择类别</option>
            <option value="electronics">电子产品</option>
            <option value="clothing">服装</option>
            <option value="food">食品</option>
          </select>
        </div>
        
        <h4>产品规格 <button type="button" (click)="addSpecification()" class="btn btn-sm btn-primary">添加规格</button></h4>
        
        <div formArrayName="specifications">
          <div *ngFor="let spec of specifications.controls; let i = index" [formGroupName]="i" class="card mb-3 p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="mb-0">规格 #{{i + 1}}</h5>
              <button type="button" (click)="removeSpecification(i)" class="btn btn-sm btn-danger">
                删除
              </button>
            </div>
            
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label [for]="'size_' + i">尺寸</label>
                  <input [id]="'size_' + i" type="text" formControlName="size" class="form-control">
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="form-group">
                  <label [for]="'color_' + i">颜色</label>
                  <input [id]="'color_' + i" type="text" formControlName="color" class="form-control">
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="form-group">
                  <label [for]="'price_' + i">价格</label>
                  <input [id]="'price_' + i" type="number" formControlName="price" class="form-control">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label [for]="'stock_' + i">库存</label>
              <input [id]="'stock_' + i" type="number" formControlName="stock" class="form-control">
            </div>
            
            <!-- 嵌套的动态表单数组 -->
            <div class="mt-3">
              <h6>
                附加选项
                <button type="button" (click)="addOption(i)" class="btn btn-sm btn-outline-primary ml-2">
                  添加选项
                </button>
              </h6>
              
              <div formArrayName="options">
                <div *ngFor="let option of getOptions(i).controls; let j = index" 
                     [formGroupName]="j" 
                     class="row align-items-center mb-2">
                  <div class="col-md-5">
                    <input type="text" formControlName="name" placeholder="选项名称" class="form-control">
                  </div>
                  <div class="col-md-5">
                    <input type="number" formControlName="extraCost" placeholder="额外费用" class="form-control">
                  </div>
                  <div class="col-md-2">
                    <button type="button" (click)="removeOption(i, j)" class="btn btn-sm btn-outline-danger">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="specifications.length === 0" class="alert alert-info">
          请添加至少一个产品规格
        </div>
        
        <button type="submit" [disabled]="productForm.invalid || specifications.length === 0" class="btn btn-success mt-3">
          保存产品
        </button>
      </form>
      
      <div class="mt-4">
        <h5>表单数据预览：</h5>
        <pre>{{ productForm.value | json }}</pre>
      </div>
    `
  })
  export class DynamicFormArrayComponent implements OnInit {
    productForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.productForm = this.fb.group({
        name: ['', Validators.required],
        category: ['', Validators.required],
        specifications: this.fb.array([])
      });
      
      // 初始添加一个规格
      this.addSpecification();
    }
    
    // 获取规格FormArray
    get specifications() {
      return this.productForm.get('specifications') as FormArray;
    }
    
    // 创建新规格
    createSpecification(): FormGroup {
      return this.fb.group({
        size: ['', Validators.required],
        color: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        options: this.fb.array([])
      });
    }
    
    // 添加规格
    addSpecification() {
      this.specifications.push(this.createSpecification());
    }
    
    // 删除规格
    removeSpecification(index: number) {
      this.specifications.removeAt(index);
    }
    
    // 获取特定规格的选项FormArray
    getOptions(specIndex: number): FormArray {
      return this.specifications.at(specIndex).get('options') as FormArray;
    }
    
    // 创建新选项
    createOption(): FormGroup {
      return this.fb.group({
        name: ['', Validators.required],
        extraCost: [0, [Validators.required, Validators.min(0)]]
      });
    }
    
    // 添加选项
    addOption(specIndex: number) {
      this.getOptions(specIndex).push(this.createOption());
    }
    
    // 删除选项
    removeOption(specIndex: number, optionIndex: number) {
      this.getOptions(specIndex).removeAt(optionIndex);
    }
    
    // 提交表单
    onSubmit() {
      if (this.productForm.valid && this.specifications.length > 0) {
        console.log('产品数据:', this.productForm.value);
        // 处理表单提交...
      } else {
        // 标记所有字段为touched，显示验证错误
        this.markFormGroupTouched(this.productForm);
      }
    }
    
    // 递归标记表单组的所有控件为touched
    markFormGroupTouched(formGroup: FormGroup | FormArray) {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control instanceof FormControl) {
          control.markAsTouched();
        } else if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```
  
  **批量操作FormArray的实用方法：**
  
  ```typescript
  // 批量添加多个项目
  addMultipleItems(items: any[]) {
    const formArray = this.productForm.get('specifications') as FormArray;
    
    // 方法1：一次性添加多个控件
    const formGroups = items.map(item => this.fb.group({
      size: [item.size || '', Validators.required],
      color: [item.color || ''],
      price: [item.price || 0, [Validators.required, Validators.min(0)]],
      stock: [item.stock || 0, [Validators.required, Validators.min(0)]],
      options: this.fb.array([])
    }));
    
    // 使用patchValue更新现有控件，添加新控件
    if (formArray.length === 0) {
      // 如果数组为空，直接设置
      formGroups.forEach(group => formArray.push(group));
    } else {
      // 更新现有控件并添加新控件
      const existingLength = formArray.length;
      const newItemsLength = items.length;
      
      // 更新现有控件
      for (let i = 0; i < Math.min(existingLength, newItemsLength); i++) {
        formArray.at(i).patchValue(items[i]);
      }
      
      // 添加新控件
      if (newItemsLength > existingLength) {
        for (let i = existingLength; i < newItemsLength; i++) {
          formArray.push(formGroups[i]);
        }
      }
      
      // 删除多余控件
      if (existingLength > newItemsLength) {
        for (let i = existingLength - 1; i >= newItemsLength; i--) {
          formArray.removeAt(i);
        }
      }
    }
  }
  
  // 清空FormArray
  clearFormArray() {
    const formArray = this.productForm.get('specifications') as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  
  // 根据条件过滤FormArray中的项目
  filterItems(predicate: (item: any, index: number) => boolean) {
    const formArray = this.productForm.get('specifications') as FormArray;
    const itemsToRemove: number[] = [];
    
    // 找出要删除的索引
    formArray.controls.forEach((control, index) => {
      if (!predicate(control.value, index)) {
        itemsToRemove.push(index);
      }
    });
    
    // 从后向前删除，避免索引变化问题
    for (let i = itemsToRemove.length - 1; i >= 0; i--) {
      formArray.removeAt(itemsToRemove[i]);
    }
  }
  ```
  </details>

- **条件字段显示**

  <details>
  <summary>根据表单值动态显示/隐藏字段</summary>
  
  在响应式表单中，我们经常需要根据某些字段的值来动态显示或隐藏其他字段。这种条件逻辑可以通过组合使用表单控件的值观察和Angular的结构型指令来实现。
  
  **基本实现方式：**
  
  ```typescript
  @Component({
    selector: 'app-conditional-form',
    template: `
      <form [formGroup]="userForm">
        <!-- 用户类型选择 -->
        <div class="form-group">
          <label>用户类型</label>
          <select formControlName="userType" class="form-control">
            <option value="individual">个人用户</option>
            <option value="company">企业用户</option>
          </select>
        </div>
        
        <!-- 个人用户字段 -->
        <div *ngIf="userForm.get('userType')?.value === 'individual'" class="form-group">
          <label>身份证号</label>
          <input type="text" formControlName="idNumber" class="form-control">
        </div>
        
        <!-- 企业用户字段 -->
        <ng-container *ngIf="userForm.get('userType')?.value === 'company'">
          <div class="form-group">
            <label>企业名称</label>
            <input type="text" formControlName="companyName" class="form-control">
          </div>
          
          <div class="form-group">
            <label>统一社会信用代码</label>
            <input type="text" formControlName="businessLicense" class="form-control">
          </div>
        </ng-container>
        
        <!-- 共同字段 -->
        <div class="form-group">
          <label>联系电话</label>
          <input type="tel" formControlName="phone" class="form-control">
        </div>
      </form>
    `
  })
  export class ConditionalFormComponent implements OnInit {
    userForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.userForm = this.fb.group({
        userType: ['individual'],
        idNumber: [''],
        companyName: [''],
        businessLicense: [''],
        phone: ['', Validators.required]
      });
      
      // 监听用户类型变化，动态调整验证器
      this.userForm.get('userType')?.valueChanges.subscribe(userType => {
        if (userType === 'individual') {
          this.userForm.get('idNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{18}$/)]);
          this.userForm.get('companyName')?.clearValidators();
          this.userForm.get('businessLicense')?.clearValidators();
        } else {
          this.userForm.get('idNumber')?.clearValidators();
          this.userForm.get('companyName')?.setValidators(Validators.required);
          this.userForm.get('businessLicense')?.setValidators([Validators.required, Validators.pattern(/^[0-9A-Z]{18}$/)]);
        }
        
        // 更新验证状态
        this.userForm.get('idNumber')?.updateValueAndValidity();
        this.userForm.get('companyName')?.updateValueAndValidity();
        this.userForm.get('businessLicense')?.updateValueAndValidity();
      });
    }
  }
  ```
  
  **高级实现：使用FormGroup嵌套**
  
  ```typescript
  @Component({
    selector: 'app-advanced-conditional-form',
    template: `
      <form [formGroup]="profileForm">
        <div class="form-group">
          <label>用户类型</label>
          <select formControlName="userType" class="form-control">
            <option value="individual">个人用户</option>
            <option value="company">企业用户</option>
          </select>
        </div>
        
        <!-- 个人用户表单组 -->
        <div formGroupName="individualInfo" *ngIf="profileForm.get('userType')?.value === 'individual'">
          <h4>个人信息</h4>
          <div class="form-group">
            <label>姓名</label>
            <input type="text" formControlName="fullName" class="form-control">
          </div>
          <div class="form-group">
            <label>身份证号</label>
            <input type="text" formControlName="idNumber" class="form-control">
          </div>
        </div>
        
        <!-- 企业用户表单组 -->
        <div formGroupName="companyInfo" *ngIf="profileForm.get('userType')?.value === 'company'">
          <h4>企业信息</h4>
          <div class="form-group">
            <label>企业名称</label>
            <input type="text" formControlName="companyName" class="form-control">
          </div>
          <div class="form-group">
            <label>统一社会信用代码</label>
            <input type="text" formControlName="businessLicense" class="form-control">
          </div>
          <div class="form-group">
            <label>联系人</label>
            <input type="text" formControlName="contactPerson" class="form-control">
          </div>
        </div>
        
        <button type="submit" [disabled]="!isFormValid()" class="btn btn-primary">提交</button>
      </form>
    `
  })
  export class AdvancedConditionalFormComponent implements OnInit {
    profileForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.profileForm = this.fb.group({
        userType: ['individual'],
        individualInfo: this.fb.group({
          fullName: ['', Validators.required],
          idNumber: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]]
        }),
        companyInfo: this.fb.group({
          companyName: ['', Validators.required],
          businessLicense: ['', [Validators.required, Validators.pattern(/^[0-9A-Z]{18}$/)]],
          contactPerson: ['', Validators.required]
        })
      });
      
      // 监听用户类型变化，启用/禁用相应的表单组
      this.profileForm.get('userType')?.valueChanges.subscribe(userType => {
        if (userType === 'individual') {
          this.profileForm.get('individualInfo')?.enable();
          this.profileForm.get('companyInfo')?.disable();
        } else {
          this.profileForm.get('individualInfo')?.disable();
          this.profileForm.get('companyInfo')?.enable();
        }
      });
      
      // 初始化时触发一次，确保正确的表单组被启用
      const initialUserType = this.profileForm.get('userType')?.value;
      if (initialUserType === 'individual') {
        this.profileForm.get('companyInfo')?.disable();
      } else {
        this.profileForm.get('individualInfo')?.disable();
      }
    }
    
    // 根据当前用户类型判断表单是否有效
    isFormValid(): boolean {
      const userType = this.profileForm.get('userType')?.value;
      if (userType === 'individual') {
        return this.profileForm.get('individualInfo')?.valid || false;
      } else {
        return this.profileForm.get('companyInfo')?.valid || false;
      }
    }
    
    // 提交时只获取相关的表单数据
    getFormValue() {
      const userType = this.profileForm.get('userType')?.value;
      const baseInfo = { userType };
      
      if (userType === 'individual') {
        return {
          ...baseInfo,
          ...this.profileForm.get('individualInfo')?.value
        };
      } else {
        return {
          ...baseInfo,
          ...this.profileForm.get('companyInfo')?.value
        };
      }
    }
  }
  ```
  
  **最佳实践：**
  
  1. **使用嵌套FormGroup**：将相关字段组织在一起，便于整体启用/禁用
  2. **动态验证器**：根据条件添加或移除验证器
  3. **使用valueChanges**：监听控制条件变化，动态调整表单结构
  4. **禁用而非移除**：使用disable()而不是完全移除控件，保留表单结构
  5. **提交时过滤**：只提交相关的表单数据，避免发送不必要的字段
  6. **使用getter简化模板**：创建计算属性简化模板中的条件判断
  
  ```typescript
  // 使用getter简化模板访问
  get isIndividual(): boolean {
    return this.profileForm.get('userType')?.value === 'individual';
  }
  
  get isCompany(): boolean {
    return this.profileForm.get('userType')?.value === 'company';
  }
  ```
  
  然后在模板中可以简化为：
  
  ```html
  <div formGroupName="individualInfo" *ngIf="isIndividual">
    <!-- 个人用户字段 -->
  </div>
  
  <div formGroupName="companyInfo" *ngIf="isCompany">
    <!-- 企业用户字段 -->
  </div>
  ```
  </details>

#### 2.2.4 表单数组（FormArray）

- **动态添加/删除控件**

  <details>
  <summary>动态管理表单控件数组</summary>
  
  FormArray是Angular响应式表单中用于管理动态数量表单控件的强大工具。它特别适合处理列表、表格等需要动态添加或删除行项目的场景。
  
  **基本用法示例：**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
  
  @Component({
    selector: 'app-dynamic-form',
    template: `
      <form [formGroup]="skillsForm" (ngSubmit)="onSubmit()">
        <h3>技能列表</h3>
        
        <!-- 显示所有技能输入框 -->
        <div formArrayName="skills">
          <div *ngFor="let skill of skillsArray.controls; let i = index" class="skill-row">
            <div [formGroupName]="i" class="form-row">
              <div class="form-group col-md-5">
                <label [for]="'skillName-' + i">技能名称</label>
                <input 
                  [id]="'skillName-' + i" 
                  type="text" 
                  formControlName="name" 
                  class="form-control"
                  placeholder="如：Angular、React">
                <div *ngIf="skill.get('name')?.invalid && skill.get('name')?.touched" class="text-danger">
                  技能名称为必填项
                </div>
              </div>
              
              <div class="form-group col-md-5">
                <label [for]="'skillLevel-' + i">熟练度</label>
                <select 
                  [id]="'skillLevel-' + i" 
                  formControlName="level" 
                  class="form-control">
                  <option value="beginner">入门</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                  <option value="expert">专家</option>
                </select>
              </div>
              
              <div class="form-group col-md-2 d-flex align-items-end">
                <button 
                  type="button" 
                  class="btn btn-danger" 
                  (click)="removeSkill(i)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 添加新技能按钮 -->
        <button type="button" class="btn btn-primary mt-2" (click)="addSkill()">
          添加技能
        </button>
        
        <!-- 提交按钮 -->
        <div class="mt-3">
          <button 
            type="submit" 
            class="btn btn-success" 
            [disabled]="skillsForm.invalid">
            保存技能列表
          </button>
        </div>
        
        <!-- 表单调试信息 -->
        <div class="mt-3">
          <pre>表单状态: {{ skillsForm.status }}</pre>
          <pre>表单值: {{ skillsForm.value | json }}</pre>
        </div>
      </form>
    `
  })
  export class DynamicFormComponent implements OnInit {
    skillsForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.skillsForm = this.fb.group({
        skills: this.fb.array([])
      });
      
      // 初始添加一个空技能项
      this.addSkill();
    }
    
    // 获取skills FormArray的getter
    get skillsArray(): FormArray {
      return this.skillsForm.get('skills') as FormArray;
    }
    
    // 创建新的技能FormGroup
    createSkillFormGroup(): FormGroup {
      return this.fb.group({
        name: ['', Validators.required],
        level: ['intermediate'] // 默认值
      });
    }
    
    // 添加新技能
    addSkill(): void {
      this.skillsArray.push(this.createSkillFormGroup());
    }
    
    // 删除指定索引的技能
    removeSkill(index: number): void {
      this.skillsArray.removeAt(index);
    }
    
    // 提交表单
    onSubmit(): void {
      if (this.skillsForm.valid) {
        console.log('提交的技能列表:', this.skillsForm.value.skills);
        // 这里可以调用服务发送数据到后端
      } else {
        // 标记所有控件为touched，触发验证错误显示
        this.markFormGroupTouched(this.skillsForm);
      }
    }
    
    // 递归标记表单组的所有控件为touched
    markFormGroupTouched(formGroup: FormGroup | FormArray): void {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```
  
  **关键方法说明：**
  
  1. **创建FormArray**：使用`this.fb.array([])`创建空的FormArray
  2. **添加控件**：使用`push()`方法添加新的FormGroup到数组
  3. **删除控件**：使用`removeAt(index)`方法删除指定位置的控件
  4. **访问控件**：使用`at(index)`方法获取特定位置的控件
  5. **遍历控件**：在模板中使用`*ngFor`遍历`controls`属性
  </details>

- **批量操作**

  <details>
  <summary>FormArray的批量操作技巧</summary>
  
  在处理FormArray时，我们经常需要对多个表单控件进行批量操作，如批量添加、批量更新、批量验证等。以下是一些常用的批量操作技巧：
  
  **批量添加控件示例：**
  
  ```typescript
  @Component({
    selector: 'app-batch-form-array',
    template: `
      <form [formGroup]="productForm">
        <h3>产品规格列表</h3>
        
        <div formArrayName="specifications">
          <div *ngFor="let spec of specificationsArray.controls; let i = index" class="spec-row">
            <div [formGroupName]="i" class="form-row">
              <div class="form-group col-md-4">
                <label [for]="'specName-' + i">规格名称</label>
                <input [id]="'specName-' + i" type="text" formControlName="name" class="form-control">
              </div>
              
              <div class="form-group col-md-4">
                <label [for]="'specValue-' + i">规格值</label>
                <input [id]="'specValue-' + i" type="text" formControlName="value" class="form-control">
              </div>
              
              <div class="form-group col-md-2">
                <label [for]="'specPrice-' + i">价格调整</label>
                <input [id]="'specPrice-' + i" type="number" formControlName="priceAdjustment" class="form-control">
              </div>
              
              <div class="form-group col-md-2 d-flex align-items-end">
                <div class="form-check">
                  <input 
                    [id]="'specSelected-' + i" 
                    type="checkbox" 
                    [formControlName]="'selected'" 
                    class="form-check-input">
                  <label [for]="'specSelected-' + i" class="form-check-label">选择</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 批量操作按钮 -->
        <div class="button-group mt-3">
          <button type="button" class="btn btn-primary mr-2" (click)="addSpecification()">
            添加规格
          </button>
          
          <button type="button" class="btn btn-success mr-2" (click)="loadPredefinedSpecs()">
            加载预设规格
          </button>
          
          <button type="button" class="btn btn-warning mr-2" (click)="updateAllPrices()">
            批量调整价格
          </button>
          
          <button type="button" class="btn btn-danger mr-2" (click)="removeSelectedSpecs()">
            删除选中项
          </button>
          
          <button type="button" class="btn btn-info mr-2" (click)="selectAll()">
            全选
          </button>
          
          <button type="button" class="btn btn-secondary" (click)="clearAll()">
            清空所有
          </button>
        </div>
      </form>
    `
  })
  export class BatchFormArrayComponent implements OnInit {
    productForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.productForm = this.fb.group({
        specifications: this.fb.array([])
      });
      
      // 初始添加一个空规格
      this.addSpecification();
    }
    
    get specificationsArray(): FormArray {
      return this.productForm.get('specifications') as FormArray;
    }
    
    // 创建单个规格表单组
    createSpecification(): FormGroup {
      return this.fb.group({
        name: ['', Validators.required],
        value: ['', Validators.required],
        priceAdjustment: [0],
        selected: [false]
      });
    }
    
    // 添加单个规格
    addSpecification(): void {
      this.specificationsArray.push(this.createSpecification());
    }
    
    // 批量加载预定义规格
    loadPredefinedSpecs(): void {
      const predefinedSpecs = [
        { name: '颜色', value: '红色', priceAdjustment: 10, selected: false },
        { name: '颜色', value: '蓝色', priceAdjustment: 15, selected: false },
        { name: '尺寸', value: 'S', priceAdjustment: 0, selected: false },
        { name: '尺寸', value: 'M', priceAdjustment: 20, selected: false },
        { name: '尺寸', value: 'L', priceAdjustment: 40, selected: false }
      ];
      
      // 清空现有规格
      this.clearAll();
      
      // 批量添加预定义规格
      predefinedSpecs.forEach(spec => {
        const specGroup = this.fb.group({
          name: [spec.name, Validators.required],
          value: [spec.value, Validators.required],
          priceAdjustment: [spec.priceAdjustment],
          selected: [spec.selected]
        });
        
        this.specificationsArray.push(specGroup);
      });
    }
    
    // 批量更新所有价格（增加10%）
    updateAllPrices(): void {
      const controls = this.specificationsArray.controls;
      
      controls.forEach((control: AbstractControl) => {
        if (control instanceof FormGroup) {
          const currentPrice = control.get('priceAdjustment')?.value || 0;
          const newPrice = currentPrice * 1.1; // 增加10%
          control.get('priceAdjustment')?.setValue(Math.round(newPrice));
        }
      });
    }
    
    // 删除所有选中的规格
    removeSelectedSpecs(): void {
      const controls = this.specificationsArray.controls;
      
      // 从后向前遍历，避免删除项后索引变化问题
      for (let i = controls.length - 1; i >= 0; i--) {
        const control = controls[i] as FormGroup;
        if (control.get('selected')?.value === true) {
          this.specificationsArray.removeAt(i);
        }
      }
    }
    
    // 全选所有规格
    selectAll(): void {
      const controls = this.specificationsArray.controls;
      
      controls.forEach((control: AbstractControl) => {
        if (control instanceof FormGroup) {
          control.get('selected')?.setValue(true);
        }
      });
    }
    
    // 清空所有规格
    clearAll(): void {
      while (this.specificationsArray.length !== 0) {
        this.specificationsArray.removeAt(0);
      }
    }
  }
  ```
  
  **高级批量操作技巧：**
  
  ```typescript
  // 批量设置值（不触发验证）
  setSpecifications(specs: any[]): void {
    const formGroups = specs.map(spec => this.fb.group(spec));
    const formArray = this.fb.array(formGroups);
    this.productForm.setControl('specifications', formArray);
  }
  
  // 批量更新值（触发验证）
  updateSpecifications(specs: any[]): void {
    // 先确保FormArray长度匹配
    this.resizeFormArray(this.specificationsArray, specs.length);
    
    // 然后更新每个控件的值
    specs.forEach((spec, index) => {
      (this.specificationsArray.at(index) as FormGroup).patchValue(spec);
    });
  }
  
  // 调整FormArray大小
  resizeFormArray(formArray: FormArray, newSize: number): void {
    const currentSize = formArray.length;
    
    if (currentSize === newSize) {
      return;
    }
    
    if (currentSize > newSize) {
      // 需要删除多余的控件
      for (let i = currentSize - 1; i >= newSize; i--) {
        formArray.removeAt(i);
      }
    } else {
      // 需要添加新控件
      for (let i = currentSize; i < newSize; i++) {
        formArray.push(this.createSpecification());
      }
    }
  }
  
  // 过滤FormArray
  filterSpecifications(predicate: (spec: any) => boolean): void {
    const specs = this.specificationsArray.value;
    const filteredSpecs = specs.filter(predicate);
    this.setSpecifications(filteredSpecs);
  }
  
  // 排序FormArray
  sortSpecifications(compareFn: (a: any, b: any) => number): void {
    const specs = [...this.specificationsArray.value];
    specs.sort(compareFn);
    this.setSpecifications(specs);
  }
  ```
  
  **批量验证技巧：**
  
  ```typescript
  // 自定义FormArray验证器 - 确保至少有一个规格
  static minSpecifications(min: number = 1) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      
      return control.length < min ? { 'minSpecifications': { required: min, actual: control.length } } : null;
    };
  }
  
  // 自定义FormArray验证器 - 确保没有重复规格
  static uniqueSpecifications() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      
      const specs = control.value;
      const uniqueKeys = new Set();
      const duplicates: string[] = [];
      
      specs.forEach((spec: any) => {
        const key = `${spec.name}-${spec.value}`;
        if (uniqueKeys.has(key)) {
          duplicates.push(key);
        } else {
          uniqueKeys.add(key);
        }
      });
      
      return duplicates.length > 0 ? { 'duplicateSpecifications': { duplicates } } : null;
    };
  }
  
  // 应用这些验证器
  ngOnInit() {
    this.productForm = this.fb.group({
      specifications: this.fb.array([], [
        BatchFormArrayComponent.minSpecifications(1),
        BatchFormArrayComponent.uniqueSpecifications()
      ])
    });
    
    // 初始添加一个空规格
    this.addSpecification();
  }
  ```
  </details>

- **嵌套表单组**

  <details>
  <summary>在FormArray中嵌套复杂表单结构</summary>
  
  在复杂表单场景中，我们经常需要在FormArray中嵌套FormGroup，甚至是嵌套另一个FormArray，以构建多层次的表单结构。这在处理复杂数据结构如订单、产品配置等场景中非常有用。
  
  **嵌套FormGroup示例：**
  
  ```typescript
  @Component({
    selector: 'app-nested-form-array',
    template: `
      <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
        <h3>订单信息</h3>
        
        <!-- 客户信息 -->
        <div formGroupName="customer" class="customer-info mb-4">
          <h4>客户信息</h4>
          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="name">姓名</label>
              <input id="name" type="text" formControlName="name" class="form-control">
            </div>
            <div class="form-group col-md-6">
              <label for="email">邮箱</label>
              <input id="email" type="email" formControlName="email" class="form-control">
            </div>
          </div>
        </div>
        
        <!-- 订单项列表 -->
        <div formArrayName="items">
          <h4>订单项目</h4>
          
          <div *ngFor="let item of itemsArray.controls; let i = index" class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">项目 #{{i + 1}}</h5>
              <button type="button" class="btn btn-sm btn-danger" (click)="removeItem(i)">删除</button>
            </div>
            
            <div [formGroupName]="i" class="card-body">
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label [for]="'productName-' + i">产品名称</label>
                  <input [id]="'productName-' + i" type="text" formControlName="productName" class="form-control">
                </div>
                
                <div class="form-group col-md-3">
                  <label [for]="'quantity-' + i">数量</label>
                  <input [id]="'quantity-' + i" type="number" formControlName="quantity" class="form-control" min="1">
                </div>
                
                <div class="form-group col-md-3">
                  <label [for]="'unitPrice-' + i">单价</label>
                  <input [id]="'unitPrice-' + i" type="number" formControlName="unitPrice" class="form-control" min="0">
                </div>
              </div>
              
              <!-- 嵌套的选项FormArray -->
              <div formArrayName="options">
                <h6>产品选项</h6>
                
                <div *ngFor="let option of getOptionsArray(i).controls; let j = index" class="form-row align-items-center mb-2">
                  <div [formGroupName]="j" class="col-11">
                    <div class="form-row">
                      <div class="col-md-5">
                        <input type="text" formControlName="name" class="form-control" placeholder="选项名称">
                      </div>
                      
                      <div class="col-md-5">
                        <input type="text" formControlName="value" class="form-control" placeholder="选项值">
                      </div>
                      
                      <div class="col-md-2">
                        <div class="form-check">
                          <input type="checkbox" formControlName="selected" class="form-check-input">
                          <label class="form-check-label">选择</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-1">
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeOption(i, j)">
                      &times;
                    </button>
                  </div>
                </div>
                
                <button type="button" class="btn btn-sm btn-outline-primary mt-2" (click)="addOption(i)">
                  添加选项
                </button>
              </div>
            </div>
          </div>
          
          <button type="button" class="btn btn-primary" (click)="addItem()">
            添加项目
          </button>
        </div>
        
        <!-- 提交按钮 -->
        <div class="mt-4">
          <button type="submit" class="btn btn-success" [disabled]="orderForm.invalid">
            提交订单
          </button>
        </div>
        
        <!-- 表单调试信息 -->
        <div class="mt-3">
          <pre>表单状态: {{ orderForm.status }}</pre>
          <pre>表单值: {{ orderForm.value | json }}</pre>
        </div>
      </form>
    `
  })
  export class NestedFormArrayComponent implements OnInit {
    orderForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.orderForm = this.fb.group({
        customer: this.fb.group({
          name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
        }),
        items: this.fb.array([])
      });
      
      // 初始添加一个订单项
      this.addItem();
    }
    
    // 获取items FormArray
    get itemsArray(): FormArray {
      return this.orderForm.get('items') as FormArray;
    }
    
    // 获取特定项目的options FormArray
    getOptionsArray(itemIndex: number): FormArray {
      return (this.itemsArray.at(itemIndex) as FormGroup).get('options') as FormArray;
    }
    
    // 创建订单项FormGroup
    createItem(): FormGroup {
      return this.fb.group({
        productName: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        options: this.fb.array([])
      });
    }
    
    // 创建选项FormGroup
    createOption(): FormGroup {
      return this.fb.group({
        name: [''],
        value: [''],
        selected: [false]
      });
    }
    
    // 添加订单项
    addItem(): void {
      this.itemsArray.push(this.createItem());
      
      // 默认添加一个空选项
      this.addOption(this.itemsArray.length - 1);
    }
    
    // 删除订单项
    removeItem(index: number): void {
      this.itemsArray.removeAt(index);
    }
    
    // 添加选项到指定订单项
    addOption(itemIndex: number): void {
      this.getOptionsArray(itemIndex).push(this.createOption());
    }
    
    // 从指定订单项中删除选项
    removeOption(itemIndex: number, optionIndex: number): void {
      this.getOptionsArray(itemIndex).removeAt(optionIndex);
    }
    
    // 提交表单
    onSubmit(): void {
      if (this.orderForm.valid) {
        console.log('订单数据:', this.orderForm.value);
        // 这里可以调用服务发送数据到后端
        
        // 计算订单总价
        const total = this.calculateOrderTotal();
        console.log('订单总价:', total);
      } else {
        // 标记所有控件为touched，触发验证错误显示
        this.markFormGroupTouched(this.orderForm);
      }
    }
    
    // 计算订单总价
    calculateOrderTotal(): number {
      let total = 0;
      const items = this.orderForm.value.items;
      
      items.forEach((item: any) => {
        total += item.quantity * item.unitPrice;
      });
      
      return total;
    }
    
    // 递归标记表单组的所有控件为touched
    markFormGroupTouched(formGroup: FormGroup | FormArray): void {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```
  
  **处理嵌套表单的关键点：**
  
  1. **层级结构**：使用多层`formGroupName`和`formArrayName`指令
  2. **获取嵌套控件**：使用辅助方法如`getOptionsArray()`获取深层嵌套的FormArray
  3. **索引管理**：在嵌套循环中使用不同变量名（如`i`和`j`）避免混淆
  4. **递归处理**：使用递归函数处理任意深度的嵌套表单（如`markFormGroupTouched`）
  5. **数据转换**：提交前可能需要转换嵌套数据结构以匹配API要求
  </details>

- **数组验证**

  <details>
  <summary>FormArray的验证策略</summary>
  
  FormArray不仅可以管理动态表单控件，还可以应用多种验证策略，包括对整个数组的验证和对数组中各个控件的验证。
  
  **1. 数组级别验证**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
  
  // 自定义验证器：验证数组至少包含一个元素
  export function minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      
      return control.length >= min ? null : { minArrayLength: { required: min, actual: control.length } };
    };
  }
  
  // 自定义验证器：验证数组中至少有一个选中项
  export function atLeastOneChecked(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      
      const checked = control.controls.some(item => item.get('selected')?.value === true);
      return checked ? null : { atLeastOneChecked: true };
    };
  }
  
  @Component({
    selector: 'app-array-validation',
    template: `
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <h3>产品特性</h3>
        
        <div formArrayName="features">
          <div *ngFor="let feature of featuresArray.controls; let i = index" class="feature-row">
            <div [formGroupName]="i" class="form-row">
              <div class="form-group col-md-5">
                <input type="text" formControlName="name" class="form-control" placeholder="特性名称">
                <div *ngIf="feature.get('name')?.invalid && feature.get('name')?.touched" class="text-danger">
                  特性名称为必填项
                </div>
              </div>
              
              <div class="form-group col-md-2">
                <button type="button" class="btn btn-danger" (click)="removeFeature(i)">删除</button>
              </div>
            </div>
          </div>
          
          <div *ngIf="featuresArray.invalid && featuresArray.touched && featuresArray.errors?.['minArrayLength']" class="alert alert-danger">
            至少需要添加 {{featuresArray.errors?.['minArrayLength'].required}} 个产品特性
          </div>
          
          <button type="button" class="btn btn-secondary" (click)="addFeature()">添加特性</button>
        </div>
        
        <h3 class="mt-4">选择配件</h3>
        
        <div formArrayName="accessories">
          <div *ngFor="let accessory of accessoriesArray.controls; let i = index" class="form-check">
            <div [formGroupName]="i">
              <input type="checkbox" [id]="'accessory-' + i" formControlName="selected" class="form-check-input">
              <label [for]="'accessory-' + i" class="form-check-label">
                {{accessory.get('name')?.value}} (¥{{accessory.get('price')?.value}})
              </label>
            </div>
          </div>
          
          <div *ngIf="accessoriesArray.invalid && accessoriesArray.touched && accessoriesArray.errors?.['atLeastOneChecked']" class="alert alert-danger">
            请至少选择一个配件
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary mt-3" [disabled]="productForm.invalid">提交</button>
      </form>
    `
  })
  export class ArrayValidationComponent implements OnInit {
    productForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.productForm = this.fb.group({
        // 产品特性数组，至少需要一个特性
        features: this.fb.array([], [minArrayLength(1)]),
        
        // 配件选择数组，至少选择一个
        accessories: this.fb.array([
          this.createAccessory('标准电源适配器', 99),
          this.createAccessory('扩展坞', 299),
          this.createAccessory('保护套', 149),
          this.createAccessory('蓝牙鼠标', 199)
        ], [atLeastOneChecked()])
      });
      
      // 初始添加一个空特性
      this.addFeature();
    }
    
    // 获取特性FormArray
    get featuresArray(): FormArray {
      return this.productForm.get('features') as FormArray;
    }
    
    // 获取配件FormArray
    get accessoriesArray(): FormArray {
      return this.productForm.get('accessories') as FormArray;
    }
    
    // 创建特性FormGroup
    createFeature(): FormGroup {
      return this.fb.group({
        name: ['', Validators.required],
        description: ['']
      });
    }
    
    // 创建配件FormGroup
    createAccessory(name: string, price: number): FormGroup {
      return this.fb.group({
        name: [name],
        price: [price],
        selected: [false]
      });
    }
    
    // 添加特性
    addFeature(): void {
      this.featuresArray.push(this.createFeature());
    }
    
    // 删除特性
    removeFeature(index: number): void {
      this.featuresArray.removeAt(index);
    }
    
    onSubmit(): void {
      if (this.productForm.valid) {
        console.log('产品数据:', this.productForm.value);
        
        // 处理选中的配件
        const selectedAccessories = this.productForm.value.accessories
          .filter((acc: any) => acc.selected)
          .map((acc: any) => ({ name: acc.name, price: acc.price }));
          
        console.log('选中的配件:', selectedAccessories);
      } else {
        // 标记所有控件为touched，触发验证错误显示
        this.markFormGroupTouched(this.productForm);
      }
    }
    
    // 递归标记表单组的所有控件为touched
    markFormGroupTouched(formGroup: FormGroup | FormArray): void {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```
  
  **2. 数组元素验证**
  
  除了对整个数组的验证，我们还可以对数组中的每个元素应用验证规则：
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
  
  // 自定义验证器：验证数字是否在指定范围内
  function numberInRange(min: number, max: number) {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      if (isNaN(value) || value < min || value > max) {
        return { 'range': { min, max, actual: value } };
      }
      return null;
    };
  }
  
  @Component({
    selector: 'app-shopping-cart',
    template: `
      <form [formGroup]="cartForm" (ngSubmit)="onSubmit()">
        <h3>购物车</h3>
        
        <div formArrayName="items">
          <div *ngFor="let item of itemsArray.controls; let i = index" class="card mb-3">
            <div class="card-body" [formGroupName]="i">
              <div class="form-group">
                <label [for]="'product-' + i">产品名称</label>
                <input [id]="'product-' + i" type="text" formControlName="productName" class="form-control">
                <div *ngIf="item.get('productName')?.invalid && item.get('productName')?.touched" class="text-danger">
                  <div *ngIf="item.get('productName')?.errors?.['required']">产品名称为必填项</div>
                </div>
              </div>
              
              <div class="form-group">
                <label [for]="'quantity-' + i">数量</label>
                <input [id]="'quantity-' + i" type="number" formControlName="quantity" class="form-control">
                <div *ngIf="item.get('quantity')?.invalid && item.get('quantity')?.touched" class="text-danger">
                  <div *ngIf="item.get('quantity')?.errors?.['required']">数量为必填项</div>
                  <div *ngIf="item.get('quantity')?.errors?.['range']">
                    数量必须在 {{item.get('quantity')?.errors?.['range'].min}} 到 
                    {{item.get('quantity')?.errors?.['range'].max}} 之间
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label [for]="'price-' + i">单价</label>
                <input [id]="'price-' + i" type="number" formControlName="unitPrice" class="form-control">
                <div *ngIf="item.get('unitPrice')?.invalid && item.get('unitPrice')?.touched" class="text-danger">
                  <div *ngIf="item.get('unitPrice')?.errors?.['required']">单价为必填项</div>
                  <div *ngIf="item.get('unitPrice')?.errors?.['min']">单价不能小于 {{item.get('unitPrice')?.errors?.['min'].min}}</div>
                </div>
              </div>
              
              <button type="button" class="btn btn-danger" (click)="removeItem(i)">删除</button>
            </div>
          </div>
          
          <button type="button" class="btn btn-secondary" (click)="addItem()">添加商品</button>
        </div>
        
        <div *ngIf="itemsArray.length === 0" class="alert alert-info">
          购物车为空，请添加商品
        </div>
        
        <div *ngIf="itemsArray.length > 0" class="mt-3">
          <h4>总计: ¥{{calculateTotal()}}</h4>
          <button type="submit" class="btn btn-primary" [disabled]="cartForm.invalid">结算</button>
        </div>
      </form>
    `
  })
  export class ShoppingCartComponent implements OnInit {
    cartForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.cartForm = this.fb.group({
        items: this.fb.array([])
      });
      
      // 初始添加一个空商品
      this.addItem();
    }
    
    // 获取商品FormArray
    get itemsArray(): FormArray {
      return this.cartForm.get('items') as FormArray;
    }
    
    // 创建商品FormGroup
    createItem(): FormGroup {
      return this.fb.group({
        productName: ['', Validators.required],
        quantity: [1, [Validators.required, numberInRange(1, 10)]],
        unitPrice: [0, [Validators.required, Validators.min(0.01)]]
      });
    }
    
    // 添加商品
    addItem(): void {
      this.itemsArray.push(this.createItem());
    }
    
    // 删除商品
    removeItem(index: number): void {
      this.itemsArray.removeAt(index);
    }
    
    // 计算总价
    calculateTotal(): number {
      let total = 0;
      
      for (let i = 0; i < this.itemsArray.length; i++) {
        const item = this.itemsArray.at(i);
        const quantity = item.get('quantity')?.value || 0;
        const unitPrice = item.get('unitPrice')?.value || 0;
        
        total += quantity * unitPrice;
      }
      
      return total;
    }
    
    onSubmit(): void {
      if (this.cartForm.valid) {
        console.log('购物车数据:', this.cartForm.value);
        console.log('总价:', this.calculateTotal());
        // 这里可以调用服务提交订单
      } else {
        // 标记所有控件为touched，触发验证错误显示
        this.markFormGroupTouched(this.cartForm);
      }
    }
    
    // 递归标记表单组的所有控件为touched
    markFormGroupTouched(formGroup: FormGroup | FormArray): void {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```
  
  **3. 动态验证规则**
  
  根据业务需求动态调整数组验证规则：
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
  
  @Component({
    selector: 'app-dynamic-validation',
    template: `
      <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>订单类型</label>
          <select formControlName="orderType" class="form-control">
            <option value="standard">标准订单</option>
            <option value="bulk">批量订单</option>
          </select>
        </div>
        
        <div formArrayName="items">
          <h4>订单项目</h4>
          
          <div *ngFor="let item of itemsArray.controls; let i = index" class="card mb-2">
            <div class="card-body" [formGroupName]="i">
              <div class="form-group">
                <label [for]="'item-' + i">商品名称</label>
                <input [id]="'item-' + i" type="text" formControlName="name" class="form-control">
              </div>
              
              <div class="form-group">
                <label [for]="'quantity-' + i">数量</label>
                <input [id]="'quantity-' + i" type="number" formControlName="quantity" class="form-control">
                <div *ngIf="item.get('quantity')?.invalid && item.get('quantity')?.touched" class="text-danger">
                  <div *ngIf="item.get('quantity')?.errors?.['min']">
                    数量不能小于 {{item.get('quantity')?.errors?.['min'].min}}
                  </div>
                  <div *ngIf="item.get('quantity')?.errors?.['max']">
                    数量不能大于 {{item.get('quantity')?.errors?.['max'].max}}
                  </div>
                </div>
              </div>
              
              <button type="button" class="btn btn-sm btn-danger" (click)="removeItem(i)">删除</button>
            </div>
          </div>
          
          <div *ngIf="itemsArray.invalid && itemsArray.errors?.['minItems']" class="alert alert-danger">
            {{orderForm.get('orderType')?.value === 'bulk' ? '批量订单至少需要3个商品' : '标准订单至少需要1个商品'}}
          </div>
          
          <button type="button" class="btn btn-secondary" (click)="addItem()">添加商品</button>
        </div>
        
        <button type="submit" class="btn btn-primary mt-3" [disabled]="orderForm.invalid">提交订单</button>
      </form>
    `
  })
  export class DynamicValidationComponent implements OnInit {
    orderForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.orderForm = this.fb.group({
        orderType: ['standard'],
        items: this.fb.array([], this.minItemsValidator())
      });
      
      // 监听订单类型变化，调整验证规则
      this.orderForm.get('orderType')?.valueChanges.subscribe(orderType => {
        // 更新数组验证器
        this.itemsArray.setValidators(this.minItemsValidator());
        this.itemsArray.updateValueAndValidity();
        
        // 更新每个商品的数量验证器
        this.itemsArray.controls.forEach(control => {
          control.get('quantity')?.setValidators(this.getQuantityValidators(orderType));
          control.get('quantity')?.updateValueAndValidity();
        });
      });
      
      // 初始添加一个空商品
      this.addItem();
    }
    
    // 获取商品FormArray
    get itemsArray(): FormArray {
      return this.orderForm.get('items') as FormArray;
    }
    
    // 创建商品FormGroup
    createItem(): FormGroup {
      const orderType = this.orderForm.get('orderType')?.value;
      
      return this.fb.group({
        name: ['', Validators.required],
        quantity: [1, this.getQuantityValidators(orderType)]
      });
    }
    
    // 根据订单类型获取数量验证器
    getQuantityValidators(orderType: string): ValidatorFn[] {
      if (orderType === 'bulk') {
        return [Validators.required, Validators.min(10), Validators.max(1000)];
      } else {
        return [Validators.required, Validators.min(1), Validators.max(10)];
      }
    }
    
    // 根据订单类型创建最小商品数量验证器
    minItemsValidator(): ValidatorFn {
      return (control: FormArray) => {
        const orderType = this.orderForm?.get('orderType')?.value;
        const minItems = orderType === 'bulk' ? 3 : 1;
        
        return control.length >= minItems ? null : { minItems: true };
      };
    }
    
    // 添加商品
    addItem(): void {
      this.itemsArray.push(this.createItem());
    }
    
    // 删除商品
    removeItem(index: number): void {
      this.itemsArray.removeAt(index);
    }
    
    onSubmit(): void {
      if (this.orderForm.valid) {
        console.log('订单数据:', this.orderForm.value);
      } else {
        this.markFormGroupTouched(this.orderForm);
      }
    }
    
    // 递归标记表单组的所有控件为touched
    markFormGroupTouched(formGroup: FormGroup | FormArray): void {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }
  ```
  
  **FormArray验证的最佳实践：**
  
  1. **分层验证**：同时应用数组级别验证和元素级别验证
  2. **动态验证**：根据业务规则动态调整验证器
  3. **自定义验证器**：创建特定业务场景的验证器函数
  4. **错误展示**：为不同级别的错误提供清晰的错误信息
  5. **验证触发**：使用`markFormGroupTouched`等方法确保验证错误正确显示
  6. **性能考虑**：对于大型数组，考虑优化验证逻辑以提高性能
  
  通过这些技术，可以构建出既灵活又严格的表单数组验证系统，满足各种复杂业务场景的需求。
  </details>

#### 2.2.5 最佳实践

- **表单状态管理**

  <details>
  <summary>有效管理表单状态的策略</summary>
  
  表单状态管理是构建高质量Angular应用的关键环节，良好的状态管理可以提升用户体验并简化开发流程。
  
  **1. 集中式状态管理**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { BehaviorSubject, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  interface FormState {
    values: any;
    dirty: boolean;
    valid: boolean;
    submitted: boolean;
    submitting: boolean;
    errors: any;
  }
  
  @Component({
    selector: 'app-form-state-manager',
    template: `
      <form [formGroup]="userForm" (ngSubmit)="submitForm()">
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" type="text" formControlName="username" class="form-control">
          <div *ngIf="showFieldError('username')" class="text-danger">
            {{ getFieldError('username') }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" type="email" formControlName="email" class="form-control">
          <div *ngIf="showFieldError('email')" class="text-danger">
            {{ getFieldError('email') }}
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="(formState$ | async)?.submitting">
            {{ (formState$ | async)?.submitting ? '提交中...' : '提交' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="resetForm()" [disabled]="!(formState$ | async)?.dirty">
            重置
          </button>
        </div>
        
        <!-- 表单状态指示器 -->
        <div class="form-status mt-3">
          <div *ngIf="(formState$ | async)?.submitted && (formState$ | async)?.valid" class="alert alert-success">
            表单提交成功！
          </div>
          <div *ngIf="(formState$ | async)?.submitted && !(formState$ | async)?.valid" class="alert alert-danger">
            表单验证失败，请检查输入。
          </div>
        </div>
      </form>
    `
  })
  export class FormStateManagerComponent implements OnInit {
    userForm: FormGroup;
    
    // 使用BehaviorSubject管理表单状态
    private formStateSubject = new BehaviorSubject<FormState>({
      values: {},
      dirty: false,
      valid: false,
      submitted: false,
      submitting: false,
      errors: {}
    });
    
    // 暴露为Observable供模板订阅
    formState$: Observable<FormState> = this.formStateSubject.asObservable();
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.initForm();
      this.subscribeToFormChanges();
    }
    
    initForm() {
      this.userForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]]
      });
    }
    
    subscribeToFormChanges() {
      // 监听表单值和状态变化
      this.userForm.valueChanges.subscribe(() => {
        this.updateFormState();
      });
      
      this.userForm.statusChanges.subscribe(() => {
        this.updateFormState();
      });
      
      // 初始化表单状态
      this.updateFormState();
    }
    
    updateFormState() {
      const currentState = this.formStateSubject.value;
      
      this.formStateSubject.next({
        ...currentState,
        values: this.userForm.value,
        dirty: this.userForm.dirty,
        valid: this.userForm.valid,
        errors: this.getFormErrors()
      });
    }
    
    getFormErrors() {
      const errors: any = {};
      
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control && control.errors) {
          errors[key] = control.errors;
        }
      });
      
      return errors;
    }
    
    showFieldError(fieldName: string): boolean {
      const control = this.userForm.get(fieldName);
      return control ? (control.invalid && (control.dirty || control.touched)) : false;
    }
    
    getFieldError(fieldName: string): string {
      const control = this.userForm.get(fieldName);
      if (!control || !control.errors) return '';
      
      if (control.errors['required']) return `${fieldName}是必填项`;
      if (control.errors['minlength']) return `${fieldName}长度不能少于${control.errors['minlength'].requiredLength}个字符`;
      if (control.errors['email']) return '请输入有效的邮箱地址';
      
      return '输入无效';
    }
    
    submitForm() {
      // 更新提交状态
      this.formStateSubject.next({
        ...this.formStateSubject.value,
        submitted: true,
        submitting: true
      });
      
      if (this.userForm.invalid) {
        // 标记所有字段为touched，显示错误
        Object.keys(this.userForm.controls).forEach(key => {
          const control = this.userForm.get(key);
          control?.markAsTouched();
        });
        
        // 更新状态，结束提交过程
        this.formStateSubject.next({
          ...this.formStateSubject.value,
          submitting: false
        });
        
        return;
      }
      
      // 模拟API调用
      setTimeout(() => {
        console.log('表单提交成功:', this.userForm.value);
        
        // 更新状态，结束提交过程
        this.formStateSubject.next({
          ...this.formStateSubject.value,
          submitting: false
        });
        
        // 可选：重置表单
        // this.resetForm();
      }, 1500);
    }
    
    resetForm() {
      this.userForm.reset();
      
      this.formStateSubject.next({
        values: {},
        dirty: false,
        valid: false,
        submitted: false,
        submitting: false,
        errors: {}
      });
    }
  }
  ```
  
  **2. 使用服务管理复杂表单状态**
  
  ```typescript
  // form-state.service.ts
  import { Injectable } from '@angular/core';
  import { BehaviorSubject, Observable } from 'rxjs';
  import { FormGroup } from '@angular/forms';
  
  export interface FormState {
    values: any;
    dirty: boolean;
    valid: boolean;
    submitted: boolean;
    submitting: boolean;
    errors: any;
    savedDraft?: any;
  }
  
  @Injectable({
    providedIn: 'root'
  })
  export class FormStateService {
    private formStateSubject = new BehaviorSubject<FormState>({
      values: {},
      dirty: false,
      valid: false,
      submitted: false,
      submitting: false,
      errors: {}
    });
    
    formState$: Observable<FormState> = this.formStateSubject.asObservable();
    
    constructor() {}
    
    // 初始化表单状态
    initFormState(initialState?: Partial<FormState>) {
      const defaultState: FormState = {
        values: {},
        dirty: false,
        valid: false,
        submitted: false,
        submitting: false,
        errors: {}
      };
      
      this.formStateSubject.next({
        ...defaultState,
        ...initialState
      });
    }
    
    // 更新表单状态
    updateFormState(form: FormGroup) {
      const currentState = this.formStateSubject.value;
      
      this.formStateSubject.next({
        ...currentState,
        values: form.value,
        dirty: form.dirty,
        valid: form.valid,
        errors: this.getFormErrors(form)
      });
    }
    
    // 保存草稿
    saveDraft(formValue: any) {
      const currentState = this.formStateSubject.value;
      
      this.formStateSubject.next({
        ...currentState,
        savedDraft: formValue
      });
      
      // 可以同时保存到localStorage
      localStorage.setItem('formDraft', JSON.stringify(formValue));
    }
    
    // 加载草稿
    loadDraft(): any {
      const currentState = this.formStateSubject.value;
      return currentState.savedDraft || JSON.parse(localStorage.getItem('formDraft') || 'null');
    }
    
    // 开始提交
    startSubmit() {
      const currentState = this.formStateSubject.value;
      
      this.formStateSubject.next({
        ...currentState,
        submitted: true,
        submitting: true
      });
    }
    
    // 结束提交
    endSubmit(success: boolean = true) {
      const currentState = this.formStateSubject.value;
      
      this.formStateSubject.next({
        ...currentState,
        submitting: false,
        // 如果成功，可以清除草稿
        savedDraft: success ? null : currentState.savedDraft
      });
      
      if (success) {
        localStorage.removeItem('formDraft');
      }
    }
    
    // 获取表单错误
    private getFormErrors(form: FormGroup): any {
      const errors: any = {};
      
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        if (control instanceof FormGroup) {
          const nestedErrors = this.getFormErrors(control);
          if (Object.keys(nestedErrors).length > 0) {
            errors[key] = nestedErrors;
          }
        } else if (control && control.errors) {
          errors[key] = control.errors;
        }
      });
      
      return errors;
    }
    
    // 获取当前状态
    getCurrentState(): FormState {
      return this.formStateSubject.value;
    }
    
    // 重置表单状态
    resetState() {
      this.initFormState();
      localStorage.removeItem('formDraft');
    }
  }
  ```
  
  **3. 表单状态持久化**
  
  ```typescript
  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { Subscription } from 'rxjs';
  import { debounceTime } from 'rxjs/operators';
  
  @Component({
    selector: 'app-persistent-form',
    template: `
      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
        <!-- 表单字段 -->
        <div class="form-group">
          <label for="name">姓名</label>
          <input id="name" type="text" formControlName="name" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" type="email" formControlName="email" class="form-control">
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="registrationForm.invalid">提交</button>
          <button type="button" class="btn btn-secondary" (click)="loadSavedForm()">加载上次编辑</button>
          <button type="button" class="btn btn-danger" (click)="clearSavedForm()">清除保存的数据</button>
        </div>
      </form>
    `
  })
  export class PersistentFormComponent implements OnInit, OnDestroy {
    registrationForm: FormGroup;
    private formValueSubscription: Subscription;
    private readonly STORAGE_KEY = 'registration_form_data';
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.initForm();
      this.setupFormPersistence();
      this.loadSavedForm();
    }
    
    ngOnDestroy() {
      if (this.formValueSubscription) {
        this.formValueSubscription.unsubscribe();
      }
    }
    
    initForm() {
      this.registrationForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      });
    }
    
    setupFormPersistence() {
      // 使用debounceTime减少存储操作频率
      this.formValueSubscription = this.registrationForm.valueChanges
        .pipe(debounceTime(500))
        .subscribe(value => {
          if (this.registrationForm.dirty) {
            this.saveFormData(value);
          }
        });
    }
    
    saveFormData(formData: any) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        formData,
        timestamp: new Date().toISOString()
      }));
    }
    
    loadSavedForm() {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        try {
          const { formData, timestamp } = JSON.parse(savedData);
          this.registrationForm.patchValue(formData);
          
          // 可以显示上次保存时间
          const savedDate = new Date(timestamp);
          console.log(`加载了保存于 ${savedDate.toLocaleString()} 的表单数据`);
        } catch (e) {
          console.error('加载保存的表单数据失败', e);
        }
      }
    }
    
    clearSavedForm() {
      localStorage.removeItem(this.STORAGE_KEY);
      this.registrationForm.reset();
    }
    
    onSubmit() {
      if (this.registrationForm.valid) {
        console.log('提交表单数据:', this.registrationForm.value);
        
        // 提交成功后清除保存的数据
        this.clearSavedForm();
      }
    }
  }
  ```
  
  **4. 表单状态管理最佳实践**
  
  - **分离关注点**：将表单状态逻辑与UI逻辑分离
  - **使用Observable**：利用RxJS管理表单状态流
  - **状态不可变性**：总是创建新的状态对象而不是修改现有状态
  - **状态持久化**：对重要表单实现自动保存功能
  - **错误集中处理**：统一管理和显示表单错误
  - **加载状态管理**：明确跟踪表单的加载和提交状态
  - **表单重置策略**：提供清晰的重置机制，区分完全重置和部分重置
  - **状态历史**：对复杂表单考虑实现撤销/重做功能
  - **表单分段**：将大型表单拆分为多个子表单，分别管理状态
  - **性能优化**：使用`OnPush`变更检测策略和纯管道优化渲染性能
  </details>

- **错误处理策略**

  <details>
  <summary>表单错误处理的最佳实践</summary>
  
  有效的表单错误处理对于提升用户体验至关重要。Angular提供了多种机制来管理和显示表单错误，以下是一些最佳实践和实现方式。
  
  **1. 集中式错误处理服务**
  
  ```typescript
  import { Injectable } from '@angular/core';
  import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
  
  @Injectable({
    providedIn: 'root'
  })
  export class FormErrorService {
    // 错误消息映射表
    private errorMessages: {[key: string]: string} = {
      required: '此字段为必填项',
      email: '请输入有效的电子邮箱地址',
      minlength: '输入内容长度不足',
      maxlength: '输入内容超出最大长度',
      pattern: '输入格式不正确',
      passwordMismatch: '两次密码输入不一致',
      uniqueUsername: '用户名已被占用',
      // 可根据需要扩展更多错误类型
    };
    
    // 获取特定控件的错误消息
    getControlErrorMessage(control: AbstractControl): string {
      if (!control || !control.errors || !control.touched) {
        return '';
      }
      
      // 获取第一个错误
      const firstErrorKey = Object.keys(control.errors)[0];
      const error = control.errors[firstErrorKey];
      
      // 处理带参数的错误消息
      if (firstErrorKey === 'minlength') {
        return `最少需要 ${error.requiredLength} 个字符，当前为 ${error.actualLength} 个字符`;
      } else if (firstErrorKey === 'maxlength') {
        return `最多允许 ${error.requiredLength} 个字符，当前为 ${error.actualLength} 个字符`;
      }
      
      // 返回标准错误消息
      return this.errorMessages[firstErrorKey] || '输入无效';
    }
    
    // 检查控件是否有错误且已被触碰
    hasError(control: AbstractControl): boolean {
      return control && control.invalid && control.touched;
    }
    
    // 标记整个表单的所有控件为已触碰，用于提交时显示所有错误
    markFormGroupTouched(formGroup: FormGroup): void {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control) {
          control.markAsTouched();
          
          if (control instanceof FormGroup) {
            this.markFormGroupTouched(control);
          }
        }
      });
    }
    
    // 获取表单中所有错误的摘要
    getFormErrorsSummary(formGroup: FormGroup): string[] {
      const errors: string[] = [];
      
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control && control.invalid) {
          const errorMessage = this.getControlErrorMessage(control);
          if (errorMessage) {
            errors.push(`${key}: ${errorMessage}`);
          }
        }
      });
      
      return errors;
    }
  }
  ```
  
  **2. 通用错误显示组件**
  
  ```typescript
  import { Component, Input } from '@angular/core';
  import { AbstractControl } from '@angular/forms';
  import { FormErrorService } from './form-error.service';
  
  @Component({
    selector: 'app-form-error',
    template: `
      <div *ngIf="errorService.hasError(control)" class="error-message">
        {{ errorService.getControlErrorMessage(control) }}
      </div>
    `,
    styles: [`
      .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    `]
  })
  export class FormErrorComponent {
    @Input() control: AbstractControl;
    
    constructor(public errorService: FormErrorService) {}
  }
  ```
  
  **3. 实际应用示例**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { FormErrorService } from './form-error.service';
  
  @Component({
    selector: 'app-registration-form',
    template: `
      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
        <div class="alert alert-danger" *ngIf="showFormErrors">
          <p>表单包含以下错误：</p>
          <ul>
            <li *ngFor="let error of formErrorsSummary">{{ error }}</li>
          </ul>
        </div>
        
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" type="text" formControlName="username" class="form-control">
          <app-form-error [control]="registrationForm.get('username')"></app-form-error>
        </div>
        
        <div class="form-group">
          <label for="email">电子邮箱</label>
          <input id="email" type="email" formControlName="email" class="form-control">
          <app-form-error [control]="registrationForm.get('email')"></app-form-error>
        </div>
        
        <div formGroupName="passwordGroup">
          <div class="form-group">
            <label for="password">密码</label>
            <input id="password" type="password" formControlName="password" class="form-control">
            <app-form-error [control]="registrationForm.get('passwordGroup.password')"></app-form-error>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" class="form-control">
            <app-form-error [control]="registrationForm.get('passwordGroup.confirmPassword')"></app-form-error>
          </div>
          
          <!-- 组级别错误 -->
          <div *ngIf="passwordGroup.errors?.passwordMismatch && passwordGroup.touched" class="error-message">
            两次密码输入不一致
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary">注册</button>
      </form>
    `
  })
  export class RegistrationFormComponent implements OnInit {
    registrationForm: FormGroup;
    showFormErrors = false;
    
    constructor(
      private fb: FormBuilder,
      private errorService: FormErrorService
    ) {}
    
    ngOnInit() {
      this.registrationForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        passwordGroup: this.fb.group({
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator })
      });
    }
    
    // 自定义验证器：检查密码是否匹配
    passwordMatchValidator(group: FormGroup): ValidationErrors | null {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    }
    
    get passwordGroup() {
      return this.registrationForm.get('passwordGroup');
    }
    
    get formErrorsSummary(): string[] {
      return this.errorService.getFormErrorsSummary(this.registrationForm);
    }
    
    onSubmit() {
      if (this.registrationForm.valid) {
        console.log('表单提交成功:', this.registrationForm.value);
        // 处理表单提交逻辑
        this.showFormErrors = false;
      } else {
        // 标记所有控件为touched以显示错误
        this.errorService.markFormGroupTouched(this.registrationForm);
        this.showFormErrors = true;
        console.log('表单包含错误，无法提交');
      }
    }
  }
  ```
  
  **4. 异步验证错误处理**
  
  ```typescript
  import { Injectable } from '@angular/core';
  import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
  import { Observable, of } from 'rxjs';
  import { catchError, debounceTime, distinctUntilChanged, first, map, switchMap } from 'rxjs/operators';
  import { HttpClient } from '@angular/common/http';
  
  @Injectable({
    providedIn: 'root'
  })
  export class UniqueUsernameValidator implements AsyncValidator {
    constructor(private http: HttpClient) {}
    
    validate(control: AbstractControl): Observable<ValidationErrors | null> {
      return of(control.value).pipe(
        debounceTime(500),  // 等待用户停止输入
        distinctUntilChanged(),  // 仅当值变化时才发送请求
        switchMap(username => 
          this.http.get<boolean>(`/api/check-username?username=${username}`).pipe(
            map(isAvailable => isAvailable ? null : { uniqueUsername: true }),
            catchError(() => of({ serverError: true }))  // 处理服务器错误
          )
        ),
        first()  // 完成后自动完成Observable
      );
    }
  }
  ```
  
  **5. 错误处理最佳实践**
  
  1. **即时反馈**：在用户输入时提供即时的错误反馈，而不是等到表单提交
  2. **清晰的错误消息**：提供具体、易懂的错误信息，避免技术术语
  3. **视觉提示**：使用颜色、图标等视觉元素突出显示错误
  4. **集中管理**：使用服务集中管理错误消息，便于维护和国际化
  5. **分层处理**：区分字段级错误、表单组错误和表单级错误
  6. **异步验证处理**：优雅处理异步验证，包括加载状态和错误状态
  7. **可访问性**：确保错误信息对屏幕阅读器友好，使用aria属性
  8. **防止过早验证**：避免在用户完成输入前显示错误
  9. **表单提交错误汇总**：提交时显示所有错误的摘要
  10. **服务器错误整合**：将服务器返回的错误与客户端验证错误统一处理
  
  通过实施这些策略，可以显著提升表单的用户体验，减少用户填写表单时的挫折感，并提高表单完成率。
  </details>
- **性能优化**

  <details>
  <summary>Angular表单性能优化策略</summary>
  
  在处理大型复杂表单时，性能优化变得尤为重要。以下是一些提升Angular表单性能的关键策略和实现方式。
  
  **1. 使用OnPush变更检测策略**
  
  ```typescript
  import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  
  @Component({
    selector: 'app-optimized-form',
    templateUrl: './optimized-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush // 使用OnPush策略
  })
  export class OptimizedFormComponent implements OnInit {
    userForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.userForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        preferences: this.fb.group({
          theme: ['light'],
          notifications: [true]
        })
      });
    }
  }
  ```
  
  **2. 延迟验证（Debounce）**
  
  ```typescript
  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { Subject } from 'rxjs';
  import { debounceTime, takeUntil } from 'rxjs/operators';
  
  @Component({
    selector: 'app-debounced-form',
    template: `
      <form [formGroup]="searchForm">
        <input type="text" formControlName="searchTerm" placeholder="搜索...">
        <div *ngIf="isSearching">搜索中...</div>
        <div *ngIf="results.length">
          <div *ngFor="let result of results">{{result.name}}</div>
        </div>
      </form>
    `
  })
  export class DebouncedFormComponent implements OnInit, OnDestroy {
    searchForm: FormGroup;
    isSearching = false;
    results: any[] = [];
    private destroy$ = new Subject<void>();
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.searchForm = this.fb.group({
        searchTerm: ['']
      });
      
      // 使用debounceTime延迟处理输入
      this.searchForm.get('searchTerm')?.valueChanges
        .pipe(
          debounceTime(300), // 等待300ms再处理
          takeUntil(this.destroy$)
        )
        .subscribe(term => {
          if (term) {
            this.performSearch(term);
          } else {
            this.results = [];
          }
        });
    }
    
    performSearch(term: string) {
      this.isSearching = true;
      // 模拟API调用
      setTimeout(() => {
        this.results = [
          { id: 1, name: `结果 ${term}-1` },
          { id: 2, name: `结果 ${term}-2` },
          { id: 3, name: `结果 ${term}-3` }
        ];
        this.isSearching = false;
      }, 500);
    }
    
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
  ```
  
  **3. 表单分段加载**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  
  @Component({
    selector: 'app-segmented-form',
    template: `
      <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
        <!-- 第一部分：基本信息 -->
        <div *ngIf="currentStep === 1">
          <h3>基本信息</h3>
          <div formGroupName="basicInfo">
            <div class="form-group">
              <label for="name">姓名</label>
              <input id="name" type="text" formControlName="name" class="form-control">
            </div>
            <div class="form-group">
              <label for="email">邮箱</label>
              <input id="email" type="email" formControlName="email" class="form-control">
            </div>
          </div>
          <button type="button" (click)="nextStep()" [disabled]="!basicInfoValid">下一步</button>
        </div>
        
        <!-- 第二部分：详细信息 -->
        <div *ngIf="currentStep === 2">
          <h3>详细信息</h3>
          <div formGroupName="detailInfo">
            <div class="form-group">
              <label for="address">地址</label>
              <input id="address" type="text" formControlName="address" class="form-control">
            </div>
            <div class="form-group">
              <label for="phone">电话</label>
              <input id="phone" type="tel" formControlName="phone" class="form-control">
            </div>
          </div>
          <button type="button" (click)="prevStep()">上一步</button>
          <button type="button" (click)="nextStep()" [disabled]="!detailInfoValid">下一步</button>
        </div>
        
        <!-- 第三部分：确认信息 -->
        <div *ngIf="currentStep === 3">
          <h3>确认信息</h3>
          <div>
            <p><strong>姓名:</strong> {{registrationForm.get('basicInfo.name')?.value}}</p>
            <p><strong>邮箱:</strong> {{registrationForm.get('basicInfo.email')?.value}}</p>
            <p><strong>地址:</strong> {{registrationForm.get('detailInfo.address')?.value}}</p>
            <p><strong>电话:</strong> {{registrationForm.get('detailInfo.phone')?.value}}</p>
          </div>
          <button type="button" (click)="prevStep()">上一步</button>
          <button type="submit" [disabled]="registrationForm.invalid">提交</button>
        </div>
      </form>
    `
  })
  export class SegmentedFormComponent implements OnInit {
    registrationForm: FormGroup;
    currentStep = 1;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.registrationForm = this.fb.group({
        basicInfo: this.fb.group({
          name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
        }),
        detailInfo: this.fb.group({
          address: ['', Validators.required],
          phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
        })
      });
    }
    
    get basicInfoValid(): boolean {
      return this.registrationForm.get('basicInfo')?.valid || false;
    }
    
    get detailInfoValid(): boolean {
      return this.registrationForm.get('detailInfo')?.valid || false;
    }
    
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    }
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    }
    
    onSubmit() {
      if (this.registrationForm.valid) {
        console.log('表单提交:', this.registrationForm.value);
        // 处理表单提交逻辑
      }
    }
  }
  ```
  
  **4. 使用纯管道优化表单数据展示**
  
  ```typescript
  import { Pipe, PipeTransform } from '@angular/core';
  
  @Pipe({
    name: 'formErrors',
    pure: true // 确保是纯管道
  })
  export class FormErrorsPipe implements PipeTransform {
    transform(errors: any, fieldName: string): string {
      if (!errors) {
        return '';
      }
      
      // 根据错误类型返回对应的错误消息
      if (errors.required) {
        return `${fieldName}是必填项`;
      } else if (errors.email) {
        return `请输入有效的电子邮箱地址`;
      } else if (errors.minlength) {
        return `${fieldName}至少需要${errors.minlength.requiredLength}个字符`;
      } else if (errors.pattern) {
        return `${fieldName}格式不正确`;
      }
      
      return '输入无效';
    }
  }
  
  // 在组件中使用
  @Component({
    selector: 'app-optimized-errors',
    template: `
      <div class="form-group">
        <label for="email">邮箱</label>
        <input id="email" type="email" formControlName="email" class="form-control">
        <div *ngIf="emailControl.invalid && emailControl.touched" class="text-danger">
          {{ emailControl.errors | formErrors:'邮箱' }}
        </div>
      </div>
    `
  })
  export class OptimizedErrorsComponent {
    @Input() emailControl: FormControl;
  }
  ```
  
  **5. 使用虚拟滚动处理大型表单数组**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { ScrollingModule } from '@angular/cdk/scrolling';
  
  @Component({
    selector: 'app-virtual-scroll-form',
    template: `
      <form [formGroup]="largeForm">
        <h3>大型数据表单 ({{itemsArray.length}} 项)</h3>
        
        <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
          <div *cdkVirtualFor="let item of itemsArray.controls; let i = index" class="item-row">
            <div [formGroupName]="i" class="form-row">
              <div class="form-group">
                <label [for]="'name-' + i">名称</label>
                <input [id]="'name-' + i" type="text" formControlName="name" class="form-control">
              </div>
              <div class="form-group">
                <label [for]="'value-' + i">值</label>
                <input [id]="'value-' + i" type="number" formControlName="value" class="form-control">
              </div>
            </div>
          </div>
        </cdk-virtual-scroll-viewport>
        
        <button type="button" (click)="addItems(100)">添加100项</button>
        <button type="submit" [disabled]="largeForm.invalid">提交</button>
      </form>
    `,
    styles: [`
      .viewport {
        height: 400px;
        width: 100%;
        border: 1px solid #ccc;
      }
      .item-row {
        height: 50px;
        padding: 5px;
        border-bottom: 1px solid #eee;
      }
    `]
  })
  export class VirtualScrollFormComponent implements OnInit {
    largeForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.largeForm = this.fb.group({
        items: this.fb.array([])
      });
      
      // 初始添加一些项目
      this.addItems(100);
    }
    
    get itemsArray(): FormArray {
      return this.largeForm.get('items') as FormArray;
    }
    
    createItem(): FormGroup {
      return this.fb.group({
        name: ['', Validators.required],
        value: [0, [Validators.required, Validators.min(0)]]
      });
    }
    
    addItems(count: number) {
      for (let i = 0; i < count; i++) {
        const index = this.itemsArray.length;
        const newItem = this.createItem();
        // 预填充一些值以避免全部验证错误
        newItem.patchValue({
          name: `项目 ${index + 1}`,
          value: Math.floor(Math.random() * 100)
        });
        this.itemsArray.push(newItem);
      }
    }
  }
  ```
  
  **6. 表单控件懒加载**
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  
  @Component({
    selector: 'app-lazy-form-controls',
    template: `
      <form [formGroup]="productForm">
        <div class="form-group">
          <label for="name">产品名称</label>
          <input id="name" type="text" formControlName="name" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="category">产品类别</label>
          <select id="category" formControlName="category" class="form-control">
            <option value="">-- 选择类别 --</option>
            <option value="electronics">电子产品</option>
            <option value="clothing">服装</option>
            <option value="food">食品</option>
          </select>
        </div>
        
        <!-- 根据类别动态加载不同的表单控件 -->
        <ng-container *ngIf="productForm.get('category')?.value">
          <div [ngSwitch]="productForm.get('category')?.value">
            <!-- 电子产品特有字段 -->
            <div *ngSwitchCase="'electronics'" formGroupName="details">
              <div class="form-group">
                <label for="brand">品牌</label>
                <input id="brand" type="text" formControlName="brand" class="form-control">
              </div>
              <div class="form-group">
                <label for="warranty">保修期(月)</label>
                <input id="warranty" type="number" formControlName="warranty" class="form-control">
              </div>
            </div>
            
            <!-- 服装特有字段 -->
            <div *ngSwitchCase="'clothing'" formGroupName="details">
              <div class="form-group">
                <label for="size">尺码</label>
                <select id="size" formControlName="size" class="form-control">
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>
              <div class="form-group">
                <label for="material">材质</label>
                <input id="material" type="text" formControlName="material" class="form-control">
              </div>
            </div>
            
            <!-- 食品特有字段 -->
            <div *ngSwitchCase="'food'" formGroupName="details">
              <div class="form-group">
                <label for="expiryDate">保质期</label>
                <input id="expiryDate" type="date" formControlName="expiryDate" class="form-control">
              </div>
              <div class="form-group">
                <label for="storage">存储条件</label>
                <input id="storage" type="text" formControlName="storage" class="form-control">
              </div>
            </div>
          </div>
        </ng-container>
      </form>
    `
  })
  export class LazyFormControlsComponent implements OnInit {
    productForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.productForm = this.fb.group({
        name: ['', Validators.required],
        category: [''],
        // 初始不包含details组
        details: this.fb.group({})
      });
      
      // 监听类别变化，动态调整details表单组
      this.productForm.get('category')?.valueChanges.subscribe(category => {
        // 根据选择的类别创建不同的表单控件
        if (category === 'electronics') {
          this.productForm.setControl('details', this.fb.group({
            brand: ['', Validators.required],
            warranty: [12, [Validators.required, Validators.min(0)]]
          }));
        } else if (category === 'clothing') {
          this.productForm.setControl('details', this.fb.group({
            size: ['M', Validators.required],
            material: ['', Validators.required]
          }));
        } else if (category === 'food') {
          this.productForm.setControl('details', this.fb.group({
            expiryDate: ['', Validators.required],
            storage: ['常温', Validators.required]
          }));
        } else {
          // 重置为空表单组
          this.productForm.setControl('details', this.fb.group({}));
        }
      });
    }
  }
  ```
  
  **7. 表单性能优化最佳实践**
  
  1. **使用OnPush变更检测**：减少不必要的变更检测周期
  2. **延迟验证**：使用debounceTime减少频繁验证
  3. **分段加载**：将大型表单拆分为多个步骤
  4. **使用纯管道**：优化表单数据的展示逻辑
  5. **虚拟滚动**：处理大型表单数组
  6. **懒加载控件**：根据需要动态创建表单控件
  7. **减少表单状态计算**：缓存表单状态计算结果
  8. **优化验证器**：确保验证器高效执行
  9. **使用trackBy**：优化ngFor循环中的DOM更新
  10. **避免深层嵌套**：减少表单结构的复杂性
  11. **使用表单构建器**：利用FormBuilder创建表单
  12. **内存管理**：及时销毁不再需要的订阅和引用
  
  通过实施这些优化策略，可以显著提升Angular表单的性能，特别是在处理大型复杂表单时。
  </details>
- **测试策略**

  <details>
  <summary>Angular表单测试策略</summary>
  
  测试是确保表单功能正确性和可靠性的关键环节。以下是Angular表单测试的全面策略和实践方法。
  
  **1. 单元测试表单组件**
  
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { ReactiveFormsModule } from '@angular/forms';
  import { By } from '@angular/platform-browser';
  import { UserFormComponent } from './user-form.component';
  
  describe('UserFormComponent', () => {
    let component: UserFormComponent;
    let fixture: ComponentFixture<UserFormComponent>;
    
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [UserFormComponent],
        imports: [ReactiveFormsModule]
      }).compileComponents();
      
      fixture = TestBed.createComponent(UserFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
    
    it('应该创建表单组件', () => {
      expect(component).toBeTruthy();
    });
    
    it('初始状态下表单应该无效', () => {
      expect(component.userForm.valid).toBeFalsy();
    });
    
    it('填写所有必填字段后表单应该有效', () => {
      const nameControl = component.userForm.get('name');
      const emailControl = component.userForm.get('email');
      
      nameControl?.setValue('张三');
      emailControl?.setValue('zhangsan@example.com');
      
      expect(component.userForm.valid).toBeTruthy();
    });
    
    it('邮箱格式错误时应该显示错误信息', () => {
      const emailControl = component.userForm.get('email');
      
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();
      
      const errorElement = fixture.debugElement.query(
        By.css('.email-error')
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent)
        .toContain('请输入有效的电子邮箱地址');
    });
    
    it('提交按钮在表单无效时应该禁用', () => {
      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      ).nativeElement;
      
      expect(submitButton.disabled).toBeTruthy();
      
      // 填写表单
      component.userForm.get('name')?.setValue('张三');
      component.userForm.get('email')?.setValue('zhangsan@example.com');
      fixture.detectChanges();
      
      expect(submitButton.disabled).toBeFalsy();
    });
  });
  ```
  
  **2. 测试表单验证器**
  
  ```typescript
  import { FormControl } from '@angular/forms';
  import { passwordStrengthValidator } from './validators';
  
  describe('自定义验证器测试', () => {
    it('密码强度验证器应该拒绝弱密码', () => {
      const control = new FormControl('123456');
      const result = passwordStrengthValidator(control);
      
      expect(result).toEqual({ weakPassword: true });
    });
    
    it('密码强度验证器应该接受强密码', () => {
      const control = new FormControl('Str0ng@P@ssw0rd');
      const result = passwordStrengthValidator(control);
      
      expect(result).toBeNull();
    });
    
    it('密码强度验证器应该检查长度要求', () => {
      const control = new FormControl('Abc1@');
      const result = passwordStrengthValidator(control);
      
      expect(result).toEqual({ weakPassword: true });
    });
  });
  ```
  
  **3. 测试异步验证器**
  
  ```typescript
  import { fakeAsync, tick } from '@angular/core/testing';
  import { FormControl } from '@angular/forms';
  import { of } from 'rxjs';
  import { delay } from 'rxjs/operators';
  import { UniqueUsernameValidator } from './async-validators';
  
  describe('异步验证器测试', () => {
    let validator: UniqueUsernameValidator;
    let httpClientSpy: { get: jasmine.Spy };
    
    beforeEach(() => {
      httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
      validator = new UniqueUsernameValidator(httpClientSpy as any);
    });
    
    it('应该验证用户名是否可用', fakeAsync(() => {
      const control = new FormControl('newuser');
      
      // 模拟HTTP响应
      httpClientSpy.get.and.returnValue(of(true).pipe(delay(100)));
      
      let result: any = null;
      validator.validate(control).subscribe(value => {
        result = value;
      });
      
      tick(600); // 等待debounceTime(500)和延迟的100ms
      
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        '/api/check-username?username=newuser'
      );
      expect(result).toBeNull(); // 用户名可用，返回null
    }));
    
    it('应该检测到用户名已存在', fakeAsync(() => {
      const control = new FormControl('existinguser');
      
      // 模拟HTTP响应
      httpClientSpy.get.and.returnValue(of(false).pipe(delay(100)));
      
      let result: any = null;
      validator.validate(control).subscribe(value => {
        result = value;
      });
      
      tick(600);
      
      expect(result).toEqual({ uniqueUsername: true });
    }));
  });
  ```
  
  **4. 集成测试表单交互**
  
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { ReactiveFormsModule } from '@angular/forms';
  import { By } from '@angular/platform-browser';
  import { RegistrationFormComponent } from './registration-form.component';
  import { FormErrorsComponent } from './form-errors.component';
  
  describe('表单集成测试', () => {
    let component: RegistrationFormComponent;
    let fixture: ComponentFixture<RegistrationFormComponent>;
    
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [RegistrationFormComponent, FormErrorsComponent],
        imports: [ReactiveFormsModule]
      }).compileComponents();
      
      fixture = TestBed.createComponent(RegistrationFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
    
    it('应该在表单提交时调用onSubmit方法', () => {
      spyOn(component, 'onSubmit');
      
      // 填写表单
      component.registrationForm.get('name')?.setValue('张三');
      component.registrationForm.get('email')?.setValue('zhangsan@example.com');
      component.registrationForm.get('password')?.setValue('Str0ng@P@ssw0rd');
      fixture.detectChanges();
      
      // 提交表单
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('submit', null);
      
      expect(component.onSubmit).toHaveBeenCalled();
    });
    
    it('应该在表单字段变化时更新验证状态', () => {
      const emailInput = fixture.debugElement.query(
        By.css('input[formControlName="email"]')
      ).nativeElement;
      
      // 输入无效邮箱
      emailInput.value = 'invalid-email';
      emailInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      
      // 检查错误消息
      const errorElement = fixture.debugElement.query(
        By.css('.email-error')
      );
      expect(errorElement).toBeTruthy();
      
      // 修正为有效邮箱
      emailInput.value = 'valid@example.com';
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      // 错误消息应该消失
      const errorElementAfterFix = fixture.debugElement.query(
        By.css('.email-error')
      );
      expect(errorElementAfterFix).toBeFalsy();
    });
  });
  ```
  
  **5. 测试动态表单**
  
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { ReactiveFormsModule } from '@angular/forms';
  import { By } from '@angular/platform-browser';
  import { DynamicFormComponent } from './dynamic-form.component';
  
  describe('动态表单测试', () => {
    let component: DynamicFormComponent;
    let fixture: ComponentFixture<DynamicFormComponent>;
    
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DynamicFormComponent],
        imports: [ReactiveFormsModule]
      }).compileComponents();
      
      fixture = TestBed.createComponent(DynamicFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
    
    it('应该根据选择的类别动态创建表单控件', () => {
      // 选择电子产品类别
      const categoryControl = component.productForm.get('category');
      categoryControl?.setValue('electronics');
      fixture.detectChanges();
      
      // 检查是否创建了电子产品特有的表单控件
      const detailsGroup = component.productForm.get('details');
      expect(detailsGroup?.get('brand')).toBeTruthy();
      expect(detailsGroup?.get('warranty')).toBeTruthy();
      
      // 切换到服装类别
      categoryControl?.setValue('clothing');
      fixture.detectChanges();
      
      // 检查表单控件是否更新
      expect(detailsGroup?.get('size')).toBeTruthy();
      expect(detailsGroup?.get('material')).toBeTruthy();
      expect(detailsGroup?.get('brand')).toBeFalsy(); // 电子产品的控件应该消失
    });
    
    it('应该正确验证动态创建的表单控件', () => {
      // 选择食品类别
      component.productForm.get('category')?.setValue('food');
      fixture.detectChanges();
      
      // 检查必填字段验证
      const detailsGroup = component.productForm.get('details');
      expect(detailsGroup?.valid).toBeFalsy();
      
      // 填写必填字段
      detailsGroup?.get('expiryDate')?.setValue('2023-12-31');
      detailsGroup?.get('storage')?.setValue('冷藏');
      
      expect(detailsGroup?.valid).toBeTruthy();
    });
  });
  ```
  
  **6. 表单测试最佳实践**
  
  1. **隔离测试**：单独测试表单验证逻辑，与UI渲染分离
  2. **模拟用户交互**：测试用户输入、焦点变化和表单提交
  3. **测试边界情况**：测试空值、极限值和特殊字符
  4. **验证错误消息**：确保错误消息正确显示和隐藏
  5. **测试异步验证**：使用fakeAsync和tick处理异步验证
  6. **测试表单重置**：验证表单重置功能正常工作
  7. **测试表单状态**：验证pristine、dirty、touched等状态变化
  8. **测试表单提交**：验证提交处理和错误处理
  9. **测试动态表单**：验证动态添加和删除控件的逻辑
  10. **测试表单性能**：对大型复杂表单进行性能测试
  
  通过全面的测试策略，可以确保Angular表单在各种情况下都能正常工作，提高应用的质量和可靠性。
  </details>

#### 2.2.6 实战技巧

- **复杂表单处理**

  <details>
  <summary>复杂表单处理技巧</summary>
  
  处理复杂表单是Angular开发中的常见挑战，以下是一些实用技巧和最佳实践。
  
  **1. 表单拆分与组合**
  
  对于大型复杂表单，将其拆分为多个小型组件是提高可维护性的关键策略：
  
  ```typescript
  // 主表单组件
  @Component({
    selector: 'app-complex-form',
    template: `
      <form [formGroup]="mainForm" (ngSubmit)="onSubmit()">
        <app-personal-info [parentForm]="mainForm"></app-personal-info>
        <app-address-info [parentForm]="mainForm"></app-address-info>
        <app-payment-info [parentForm]="mainForm"></app-payment-info>
        <button type="submit" [disabled]="mainForm.invalid">提交</button>
      </form>
    `
  })
  export class ComplexFormComponent implements OnInit {
    mainForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.mainForm = this.fb.group({
        // 主表单可以为空，子组件会添加各自的表单组
      });
    }
    
    onSubmit() {
      if (this.mainForm.valid) {
        console.log('表单数据:', this.mainForm.value);
      }
    }
  }
  
  // 子表单组件示例
  @Component({
    selector: 'app-personal-info',
    template: `
      <div [formGroup]="personalInfoForm">
        <h3>个人信息</h3>
        <div class="form-group">
          <label for="name">姓名</label>
          <input id="name" formControlName="name" class="form-control">
          <div *ngIf="name.invalid && name.touched" class="error">
            请输入有效姓名
          </div>
        </div>
        <!-- 其他个人信息字段 -->
      </div>
    `
  })
  export class PersonalInfoComponent implements OnInit {
    @Input() parentForm: FormGroup;
    personalInfoForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.personalInfoForm = this.fb.group({
        name: ['', Validators.required],
        age: [null, [Validators.required, Validators.min(18)]],
        email: ['', [Validators.required, Validators.email]]
      });
      
      // 将子表单添加到父表单
      this.parentForm.addControl('personalInfo', this.personalInfoForm);
    }
    
    get name() { return this.personalInfoForm.get('name'); }
  }
  ```
  
  **2. 动态表单数组处理**
  
  处理可变数量的表单项是复杂表单的常见需求：
  
  ```typescript
  @Component({
    selector: 'app-dynamic-form-array',
    template: `
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">产品名称</label>
          <input id="name" formControlName="name" class="form-control">
        </div>
        
        <div formArrayName="variants">
          <h3>产品变体 <button type="button" (click)="addVariant()">添加变体</button></h3>
          
          <div *ngFor="let variant of variants.controls; let i = index" [formGroupName]="i" class="variant-form">
            <div class="form-group">
              <label [for]="'color-'+i">颜色</label>
              <input [id]="'color-'+i" formControlName="color" class="form-control">
            </div>
            
            <div class="form-group">
              <label [for]="'size-'+i">尺寸</label>
              <input [id]="'size-'+i" formControlName="size" class="form-control">
            </div>
            
            <div class="form-group">
              <label [for]="'price-'+i">价格</label>
              <input [id]="'price-'+i" formControlName="price" type="number" class="form-control">
            </div>
            
            <button type="button" (click)="removeVariant(i)" class="btn-remove">删除</button>
          </div>
        </div>
        
        <button type="submit" [disabled]="productForm.invalid">保存产品</button>
      </form>
    `
  })
  export class DynamicFormArrayComponent implements OnInit {
    productForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.productForm = this.fb.group({
        name: ['', Validators.required],
        variants: this.fb.array([this.createVariant()])
      });
    }
    
    get variants() {
      return this.productForm.get('variants') as FormArray;
    }
    
    createVariant(): FormGroup {
      return this.fb.group({
        color: ['', Validators.required],
        size: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]]
      });
    }
    
    addVariant() {
      this.variants.push(this.createVariant());
    }
    
    removeVariant(index: number) {
      this.variants.removeAt(index);
    }
    
    onSubmit() {
      if (this.productForm.valid) {
        console.log('产品数据:', this.productForm.value);
      }
    }
  }
  ```
  
  **3. 条件验证**
  
  根据表单中其他字段的值动态调整验证规则：
  
  ```typescript
  @Component({
    selector: 'app-conditional-validation',
    template: `
      <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="shippingMethod">配送方式</label>
          <select id="shippingMethod" formControlName="shippingMethod" class="form-control">
            <option value="standard">标准配送</option>
            <option value="express">快递配送</option>
            <option value="pickup">自提</option>
          </select>
        </div>
        
        <div *ngIf="shippingForm.get('shippingMethod')?.value !== 'pickup'" formGroupName="address">
          <h3>配送地址</h3>
          <div class="form-group">
            <label for="street">街道</label>
            <input id="street" formControlName="street" class="form-control">
            <div *ngIf="street.invalid && street.touched" class="error">
              请输入有效的街道地址
            </div>
          </div>
          
          <div class="form-group">
            <label for="city">城市</label>
            <input id="city" formControlName="city" class="form-control">
            <div *ngIf="city.invalid && city.touched" class="error">
              请输入有效的城市
            </div>
          </div>
          
          <div class="form-group">
            <label for="zipCode">邮编</label>
            <input id="zipCode" formControlName="zipCode" class="form-control">
            <div *ngIf="zipCode.invalid && zipCode.touched" class="error">
              请输入有效的邮编
            </div>
          </div>
        </div>
        
        <div *ngIf="shippingForm.get('shippingMethod')?.value === 'pickup'" formGroupName="pickupInfo">
          <h3>自提信息</h3>
          <div class="form-group">
            <label for="storeLocation">自提点</label>
            <select id="storeLocation" formControlName="storeLocation" class="form-control">
              <option value="store1">门店1 - 北京市海淀区</option>
              <option value="store2">门店2 - 北京市朝阳区</option>
              <option value="store3">门店3 - 北京市西城区</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="pickupDate">自提日期</label>
            <input id="pickupDate" type="date" formControlName="pickupDate" class="form-control">
            <div *ngIf="pickupDate.invalid && pickupDate.touched" class="error">
              请选择有效的自提日期
            </div>
          </div>
        </div>
        
        <button type="submit" [disabled]="shippingForm.invalid">提交订单</button>
      </form>
    `
  })
  export class ConditionalValidationComponent implements OnInit {
    shippingForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.shippingForm = this.fb.group({
        shippingMethod: ['standard', Validators.required],
        address: this.fb.group({
          street: [''],
          city: [''],
          zipCode: ['']
        }),
        pickupInfo: this.fb.group({
          storeLocation: [''],
          pickupDate: [null]
        })
      });
      
      // 监听配送方式变化，动态调整验证规则
      this.shippingForm.get('shippingMethod')?.valueChanges.subscribe(method => {
        if (method === 'pickup') {
          this.clearValidators(this.shippingForm.get('address') as FormGroup);
          this.setPickupValidators();
        } else {
          this.setAddressValidators();
          this.clearValidators(this.shippingForm.get('pickupInfo') as FormGroup);
        }
      });
      
      // 初始设置验证规则
      this.setAddressValidators();
    }
    
    setAddressValidators() {
      const addressGroup = this.shippingForm.get('address') as FormGroup;
      addressGroup.get('street')?.setValidators(Validators.required);
      addressGroup.get('city')?.setValidators(Validators.required);
      addressGroup.get('zipCode')?.setValidators([
        Validators.required, 
        Validators.pattern(/^\d{6}$/)
      ]);
      
      Object.keys(addressGroup.controls).forEach(key => {
        addressGroup.get(key)?.updateValueAndValidity();
      });
    }
    
    setPickupValidators() {
      const pickupGroup = this.shippingForm.get('pickupInfo') as FormGroup;
      pickupGroup.get('storeLocation')?.setValidators(Validators.required);
      pickupGroup.get('pickupDate')?.setValidators(Validators.required);
      
      Object.keys(pickupGroup.controls).forEach(key => {
        pickupGroup.get(key)?.updateValueAndValidity();
      });
    }
    
    clearValidators(group: FormGroup) {
      Object.keys(group.controls).forEach(key => {
        group.get(key)?.clearValidators();
        group.get(key)?.updateValueAndValidity();
      });
    }
    
    get street() { return this.shippingForm.get('address.street'); }
    get city() { return this.shippingForm.get('address.city'); }
    get zipCode() { return this.shippingForm.get('address.zipCode'); }
    get pickupDate() { return this.shippingForm.get('pickupInfo.pickupDate'); }
    
    onSubmit() {
      if (this.shippingForm.valid) {
        console.log('订单信息:', this.shippingForm.value);
      }
    }
  }
  ```
  
  **4. 自定义表单控件**
  
  创建可重用的自定义表单控件，实现ControlValueAccessor接口：
  
  ```typescript
  // 自定义评分控件
  @Component({
    selector: 'app-rating-input',
    template: `
      <div class="rating-container" [class.disabled]="disabled">
        <span class="star" *ngFor="let star of stars; let i = index"
              [class.filled]="i < value"
              (click)="onStarClick(i + 1)">
          ★
        </span>
      </div>
    `,
    styles: [`
      .rating-container {
        display: inline-block;
      }
      .star {
        font-size: 24px;
        color: #ddd;
        cursor: pointer;
      }
      .star.filled {
        color: gold;
      }
      .disabled .star {
        cursor: not-allowed;
      }
    `],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RatingInputComponent),
        multi: true
      }
    ]
  })
  export class RatingInputComponent implements ControlValueAccessor {
    stars: number[] = [0, 1, 2, 3, 4];
    value = 0;
    disabled = false;
    
    onChange: any = () => {};
    onTouched: any = () => {};
    
    onStarClick(rating: number) {
      if (!this.disabled) {
        this.value = rating;
        this.onChange(this.value);
        this.onTouched();
      }
    }
    
    // ControlValueAccessor接口实现
    writeValue(value: number): void {
      this.value = value || 0;
    }
    
    registerOnChange(fn: any): void {
      this.onChange = fn;
    }
    
    registerOnTouched(fn: any): void {
      this.onTouched = fn;
    }
    
    setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
    }
  }
  
  // 在表单中使用自定义控件
  @Component({
    selector: 'app-product-review',
    template: `
      <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">标题</label>
          <input id="title" formControlName="title" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="comment">评论内容</label>
          <textarea id="comment" formControlName="comment" class="form-control"></textarea>
        </div>
        
        <div class="form-group">
          <label>评分</label>
          <app-rating-input formControlName="rating"></app-rating-input>
          <div *ngIf="reviewForm.get('rating').invalid && reviewForm.get('rating').touched" class="error">
            请给出评分
          </div>
        </div>
        
        <button type="submit" [disabled]="reviewForm.invalid">提交评论</button>
      </form>
    `
  })
  export class ProductReviewComponent implements OnInit {
    reviewForm: FormGroup;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.reviewForm = this.fb.group({
        title: ['', Validators.required],
        comment: ['', [Validators.required, Validators.minLength(10)]],
        rating: [0, [Validators.required, Validators.min(1)]]
      });
    }
    
    onSubmit() {
      if (this.reviewForm.valid) {
        console.log('评论数据:', this.reviewForm.value);
      }
    }
  }
  ```
  
  **5. 表单状态管理与恢复**
  
  管理复杂表单的状态，包括保存草稿和恢复表单：
  
  ```typescript
  @Component({
    selector: 'app-form-state-management',
    template: `
      <form [formGroup]="surveyForm" (ngSubmit)="onSubmit()">
        <h2>用户调查表</h2>
        
        <!-- 表单内容 -->
        <div formGroupName="personalInfo">
          <h3>个人信息</h3>
          <div class="form-group">
            <label for="name">姓名</label>
            <input id="name" formControlName="name" class="form-control">
          </div>
          <div class="form-group">
            <label for="age">年龄</label>
            <input id="age" type="number" formControlName="age" class="form-control">
          </div>
        </div>
        
        <div formGroupName="preferences">
          <h3>偏好设置</h3>
          <div class="form-group">
            <label for="favoriteColor">喜欢的颜色</label>
            <input id="favoriteColor" formControlName="favoriteColor" class="form-control">
          </div>
          <div class="form-group">
            <label for="favoriteFood">喜欢的食物</label>
            <input id="favoriteFood" formControlName="favoriteFood" class="form-control">
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" (click)="saveDraft()">保存草稿</button>
          <button type="button" (click)="loadDraft()">加载草稿</button>
          <button type="button" (click)="resetForm()">重置表单</button>
          <button type="submit" [disabled]="surveyForm.invalid">提交</button>
        </div>
      </form>
    `
  })
  export class FormStateManagementComponent implements OnInit {
    surveyForm: FormGroup;
    private readonly STORAGE_KEY = 'survey_draft';
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.initForm();
      this.loadDraftOnInit();
    }
    
    initForm() {
      this.surveyForm = this.fb.group({
        personalInfo: this.fb.group({
          name: ['', Validators.required],
          age: [null, [Validators.required, Validators.min(18)]]
        }),
        preferences: this.fb.group({
          favoriteColor: [''],
          favoriteFood: ['']
        })
      });
    }
    
    saveDraft() {
      const formState = this.surveyForm.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formState));
      alert('草稿已保存');
    }
    
    loadDraft() {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        const formState = JSON.parse(savedState);
        this.surveyForm.patchValue(formState);
        alert('草稿已加载');
      } else {
        alert('没有找到保存的草稿');
      }
    }
    
    loadDraftOnInit() {
      // 页面加载时自动恢复草稿
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        try {
          const formState = JSON.parse(savedState);
          this.surveyForm.patchValue(formState);
          console.log('已自动恢复表单草稿');
        } catch (e) {
          console.error('恢复草稿失败', e);
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
    
    resetForm() {
      this.surveyForm.reset();
      localStorage.removeItem(this.STORAGE_KEY);
      alert('表单已重置，草稿已删除');
    }
    
    onSubmit() {
      if (this.surveyForm.valid) {
        console.log('提交的调查数据:', this.surveyForm.value);
        // 提交成功后清除草稿
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    
    ngOnDestroy() {
      // 可选：离开页面时自动保存草稿
      if (this.surveyForm.dirty) {
        this.saveDraft();
      }
    }
  }
  ```
  
  通过这些技巧和实践，可以有效地处理Angular中的复杂表单需求，提高代码的可维护性和用户体验。
  </details>
- **表单值变化监听**

  <details>
  <summary>表单值变化监听技巧</summary>
  
  在Angular表单开发中，监听表单值变化是一个常见需求，可以用于实现实时验证、联动控制和数据同步等功能。
  
  **1. 监听整个表单的值变化**
  
  ```typescript
  @Component({
    selector: 'app-form-value-changes',
    template: `
      <form [formGroup]="userForm">
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" formControlName="username" class="form-control">
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" formControlName="email" class="form-control">
        </div>
        <div class="form-group">
          <label for="role">角色</label>
          <select id="role" formControlName="role" class="form-control">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
      </form>
      
      <div class="current-values">
        <h3>当前表单值:</h3>
        <pre>{{ formValues | json }}</pre>
      </div>
    `
  })
  export class FormValueChangesComponent implements OnInit, OnDestroy {
    userForm: FormGroup;
    formValues: any;
    private valueChangesSubscription: Subscription;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.userForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['user']
      });
      
      // 监听整个表单的值变化
      this.valueChangesSubscription = this.userForm.valueChanges
        .pipe(
          // 防抖，避免频繁触发
          debounceTime(300),
          // 过滤掉重复值
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe(values => {
          console.log('表单值变化:', values);
          this.formValues = values;
          
          // 可以在这里执行其他操作，如保存草稿、发送API请求等
          this.saveDraft(values);
        });
    }
    
    saveDraft(formData: any) {
      // 保存表单草稿的逻辑
      localStorage.setItem('userFormDraft', JSON.stringify(formData));
    }
    
    ngOnDestroy() {
      // 组件销毁时取消订阅，避免内存泄漏
      if (this.valueChangesSubscription) {
        this.valueChangesSubscription.unsubscribe();
      }
    }
  }
  ```
  
  **2. 监听特定表单控件的值变化**
  
  ```typescript
  @Component({
    selector: 'app-control-value-changes',
    template: `
      <form [formGroup]="productForm">
        <div class="form-group">
          <label for="category">产品类别</label>
          <select id="category" formControlName="category" class="form-control">
            <option value="">-- 选择类别 --</option>
            <option value="electronics">电子产品</option>
            <option value="clothing">服装</option>
            <option value="food">食品</option>
          </select>
        </div>
        
        <div class="form-group" *ngIf="showBrandField">
          <label for="brand">品牌</label>
          <input id="brand" formControlName="brand" class="form-control">
        </div>
        
        <div class="form-group" *ngIf="showSizeField">
          <label for="size">尺寸</label>
          <select id="size" formControlName="size" class="form-control">
            <option value="S">小号 (S)</option>
            <option value="M">中号 (M)</option>
            <option value="L">大号 (L)</option>
            <option value="XL">加大号 (XL)</option>
          </select>
        </div>
        
        <div class="form-group" *ngIf="showExpiryField">
          <label for="expiryDate">保质期</label>
          <input id="expiryDate" type="date" formControlName="expiryDate" class="form-control">
        </div>
      </form>
    `
  })
  export class ControlValueChangesComponent implements OnInit, OnDestroy {
    productForm: FormGroup;
    showBrandField = false;
    showSizeField = false;
    showExpiryField = false;
    
    private categorySubscription: Subscription;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.productForm = this.fb.group({
        category: [''],
        brand: [''],
        size: ['M'],
        expiryDate: [null]
      });
      
      // 监听类别字段的值变化
      this.categorySubscription = this.productForm.get('category')?.valueChanges
        .subscribe(category => {
          this.updateFormBasedOnCategory(category);
        });
    }
    
    updateFormBasedOnCategory(category: string) {
      // 重置所有条件字段的显示状态
      this.showBrandField = false;
      this.showSizeField = false;
      this.showExpiryField = false;
      
      // 根据类别调整表单
      switch(category) {
        case 'electronics':
          this.showBrandField = true;
          this.productForm.get('brand')?.setValidators(Validators.required);
          this.productForm.get('size')?.clearValidators();
          this.productForm.get('expiryDate')?.clearValidators();
          break;
        case 'clothing':
          this.showSizeField = true;
          this.productForm.get('size')?.setValidators(Validators.required);
          this.productForm.get('brand')?.clearValidators();
          this.productForm.get('expiryDate')?.clearValidators();
          break;
        case 'food':
          this.showExpiryField = true;
          this.productForm.get('expiryDate')?.setValidators(Validators.required);
          this.productForm.get('brand')?.clearValidators();
          this.productForm.get('size')?.clearValidators();
          break;
        default:
          // 清除所有验证器
          this.productForm.get('brand')?.clearValidators();
          this.productForm.get('size')?.clearValidators();
          this.productForm.get('expiryDate')?.clearValidators();
      }
      
      // 更新验证状态
      this.productForm.get('brand')?.updateValueAndValidity();
      this.productForm.get('size')?.updateValueAndValidity();
      this.productForm.get('expiryDate')?.updateValueAndValidity();
    }
    
    ngOnDestroy() {
      if (this.categorySubscription) {
        this.categorySubscription.unsubscribe();
      }
    }
  }
  ```
  
  **3. 使用statusChanges监听表单状态变化**
  
  ```typescript
  @Component({
    selector: 'app-form-status-changes',
    template: `
      <form [formGroup]="registrationForm">
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" formControlName="username" class="form-control">
          <div *ngIf="username.invalid && username.touched" class="error">
            用户名是必填项
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" formControlName="email" class="form-control">
          <div *ngIf="email.invalid && email.touched" class="error">
            请输入有效的邮箱地址
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" type="password" formControlName="password" class="form-control">
          <div *ngIf="password.invalid && password.touched" class="error">
            密码至少需要8个字符
          </div>
        </div>
        
        <button type="submit" [disabled]="registrationForm.invalid">注册</button>
      </form>
      
      <div class="form-status">
        当前表单状态: <strong>{{ formStatus }}</strong>
      </div>
    `
  })
  export class FormStatusChangesComponent implements OnInit, OnDestroy {
    registrationForm: FormGroup;
    formStatus: string = '';
    private statusSubscription: Subscription;
    
    constructor(private fb: FormBuilder) {}
    
    ngOnInit() {
      this.registrationForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
      
      // 监听表单状态变化
      this.statusSubscription = this.registrationForm.statusChanges
        .pipe(
          distinctUntilChanged()
        )
        .subscribe(status => {
          this.formStatus = status;
          console.log('表单状态变化:', status);
          
          if (status === 'VALID') {
            // 表单变为有效时的处理
            console.log('表单验证通过，可以提交');
          }
        });
    }
    
    get username() { return this.registrationForm.get('username'); }
    get email() { return this.registrationForm.get('email'); }
    get password() { return this.registrationForm.get('password'); }
    
    ngOnDestroy() {
      if (this.statusSubscription) {
        this.statusSubscription.unsubscribe();
      }
    }
  }
  ```
  
  **4. 高级技巧：组合多个表单控件的观察**
  
  ```typescript
  @Component({
    selector: 'app-combined-form-changes',
    template: `
      <form [formGroup]="shippingForm">
        <div class="form-group">
          <label for="country">国家/地区</label>
          <select id="country" formControlName="country" class="form-control">
            <option value="CN">中国</option>
            <option value="US">美国</option>
            <option value="JP">日本</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="province">省份/州</label>
          <select id="province" formControlName="province" class="form-control">
            <option *ngFor="let province of provinces" [value]="province.code">
              {{ province.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="city">城市</label>
          <select id="city" formControlName="city" class="form-control">
            <option *ngFor="let city of cities" [value]="city.code">
              {{ city.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="zipCode">邮政编码</label>
          <input id="zipCode" formControlName="zipCode" class="form-control">
        </div>
      </form>
    `
  })
  export class CombinedFormChangesComponent implements OnInit, OnDestroy {
    shippingForm: FormGroup;
    provinces: Array<{code: string, name: string}> = [];
    cities: Array<{code: string, name: string}> = [];
    
    private subscriptions = new Subscription();
    
    constructor(
      private fb: FormBuilder,
      private locationService: LocationService
    ) {}
    
    ngOnInit() {
      this.shippingForm = this.fb.group({
        country: ['CN', Validators.required],
        province: ['', Validators.required],
        city: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
      });
      
      // 监听国家变化，更新省份列表
      const countryChanges = this.shippingForm.get('country')?.valueChanges.pipe(
        tap(country => {
          this.shippingForm.get('province')?.setValue('');
          this.shippingForm.get('city')?.setValue('');
          this.loadProvinces(country);
        })
      );
      
      // 监听省份变化，更新城市列表
      const provinceChanges = this.shippingForm.get('province')?.valueChanges.pipe(
        tap(province => {
          if (province) {
            this.shippingForm.get('city')?.setValue('');
            this.loadCities(this.shippingForm.get('country')?.value, province);
          } else {
            this.cities = [];
          }
        })
      );
      
      // 组合多个观察对象
      if (countryChanges && provinceChanges) {
        this.subscriptions.add(countryChanges.subscribe());
        this.subscriptions.add(provinceChanges.subscribe());
        
        // 初始加载
        this.loadProvinces(this.shippingForm.get('country')?.value);
      }
    }
    
    loadProvinces(country: string) {
      // 模拟从服务加载省份数据
      this.locationService.getProvinces(country).subscribe(data => {
        this.provinces = data;
      });
    }
    
    loadCities(country: string, province: string) {
      // 模拟从服务加载城市数据
      this.locationService.getCities(country, province).subscribe(data => {
        this.cities = data;
      });
    }
    
    ngOnDestroy() {
      // 取消所有订阅
      this.subscriptions.unsubscribe();
    }
  }
  ```
  
  **5. 表单值变化监听的最佳实践**
  
  1. **使用适当的操作符**：使用`debounceTime`、`distinctUntilChanged`等操作符优化变化监听
  2. **合理管理订阅**：使用`Subscription`对象或`SubSink`库管理订阅，避免内存泄漏
  3. **分离关注点**：将表单值变化处理逻辑分离到单独的方法中
  4. **考虑性能影响**：对于大型表单，考虑只监听关键字段而非整个表单
  5. **使用异步验证器**：对于需要API验证的字段，使用异步验证器而非手动监听
  6. **结合状态管理**：在大型应用中，考虑结合NgRx等状态管理库处理表单状态
  7. **避免循环更新**：在值变化处理中修改表单值时，注意避免循环触发
  8. **使用patchValue而非setValue**：当只需更新部分字段时，使用patchValue避免错误
  
  通过合理使用表单值变化监听，可以实现更加灵活和响应式的表单交互体验。
  </details>
- **表单重置策略**

  <details>
  <summary>表单重置策略最佳实践</summary>

  表单重置是Angular表单开发中的一个重要环节,需要考虑多个方面以确保正确的重置行为。以下是表单重置的最佳实践和实现方案。

  **1. 基础重置策略**

  ```typescript
  @Component({
    selector: 'app-form-reset-demo',
    template: `
      <form [formGroup]="demoForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>用户名</label>
          <input formControlName="username">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input formControlName="email">
        </div>
        <button type="submit">提交</button>
        <button type="button" (click)="resetForm()">重置</button>
      </form>
    `
  })
  export class FormResetDemoComponent {
    demoForm: FormGroup;

    constructor(private fb: FormBuilder) {
      this.demoForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      });
    }

    resetForm() {
      // 简单重置
      this.demoForm.reset();
      
      // 重置为指定默认值
      this.demoForm.reset({
        username: '',
        email: ''
      });
    }
  }
  ```

  **2. 高级重置策略**

  ```typescript
  @Component({
    selector: 'app-advanced-reset',
    template: `
      <form [formGroup]="advancedForm">
        <div formGroupName="personalInfo">
          <input formControlName="name">
          <input formControlName="age">
        </div>
        <div formArrayName="hobbies">
          <div *ngFor="let hobby of hobbies.controls; let i=index">
            <input [formControlName]="i">
          </div>
        </div>
        <button (click)="resetWithStrategy()">重置</button>
      </form>
    `
  })
  export class AdvancedResetComponent {
    advancedForm: FormGroup;

    constructor(private fb: FormBuilder) {
      this.advancedForm = this.fb.group({
        personalInfo: this.fb.group({
          name: [''],
          age: [null]
        }),
        hobbies: this.fb.array([])
      });
    }

    get hobbies() {
      return this.advancedForm.get('hobbies') as FormArray;
    }

    resetWithStrategy() {
      // 1. 保存某些字段值
      const savedAge = this.advancedForm.get('personalInfo.age')?.value;
      
      // 2. 重置表单
      this.advancedForm.reset();
      
      // 3. 恢复保存的值
      this.advancedForm.patchValue({
        personalInfo: {
          age: savedAge
        }
      });

      // 4. 清空FormArray
      while (this.hobbies.length) {
        this.hobbies.removeAt(0);
      }
    }
  }
  ```

  **3. 重置策略最佳实践**

  1. **状态重置**
  - 重置表单值
  - 重置验证状态(pristine/dirty/touched等)
  - 清除错误信息

  2. **数据保留**
  - 选择性保留某些字段值
  - 维护表单历史记录
  - 实现撤销/重做功能

  3. **关联处理**
  - 重置相关的UI状态
  - 清理相关的订阅
  - 重置关联的组件状态

  4. **异步处理**
  - 处理异步验证器的重置
  - 取消进行中的异步操作
  - 重置加载状态

  5. **用户体验**
  - 提供重置确认机制
  - 支持部分重置功能
  - 提供重置反馈

  通过合理运用这些重置策略，可以确保表单在重置时的行为符合预期，提供良好的用户体验。
  </details>

  <details>
  <summary>表单重置策略最佳实践</summary>

  表单重置是一个常见需求,需要考虑多个方面以确保正确的重置行为。以下是表单重置的最佳实践和实现方案。

  **1. 基本表单重置**

  ```typescript
  @Component({
    selector: 'app-form-reset',
    template: `
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>用户名</label>
          <input formControlName="username">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input formControlName="email">
        </div>
        <button type="submit">提交</button>
        <button type="button" (click)="resetForm()">重置</button>
      </form>
    `
  })
  export class FormResetComponent {
    userForm: FormGroup;

    constructor(private fb: FormBuilder) {
      this.userForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      });
    }

    resetForm() {
      // 重置为初始值
      this.userForm.reset();
      // 或重置为指定值
      this.userForm.reset({
        username: '',
        email: ''
      });
    }
  }
  ```

  **2. 自定义重置策略**

  ```typescript
  export class AdvancedFormResetComponent {
    private initialFormState: any;

    ngOnInit() {
      this.initForm();
      // 保存初始状态
      this.initialFormState = this.userForm.value;
    }

    // 自定义重置方法
    customReset() {
      // 重置为初始状态
      this.userForm.patchValue(this.initialFormState);
      // 重置表单状态
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsUntouched();
        control?.markAsPristine();
      });
      // 清除验证错误
      this.userForm.setErrors(null);
    }
  }
  ```

  **3. 部分重置策略**

  ```typescript
  export class PartialResetComponent {
    resetPartialForm() {
      // 只重置特定字段
      const partialReset = {
        address: '',
        phone: ''
      };
      this.userForm.patchValue(partialReset);
      
      // 重置特定FormGroup
      const addressGroup = this.userForm.get('address') as FormGroup;
      addressGroup.reset();
    }
  }
  ```

  **4. 重置表单数组**

  ```typescript
  export class FormArrayResetComponent {
    resetFormArray() {
      const skillsArray = this.userForm.get('skills') as FormArray;
      // 清空数组
      while (skillsArray.length) {
        skillsArray.removeAt(0);
      }
      // 添加一个空项
      skillsArray.push(this.fb.control(''));
    }
  }
  ```

  **5. 重置最佳实践**

  1. **保存初始状态**：记录表单的初始值
  2. **状态重置**：重置touched、dirty等状态
  3. **验证重置**：清除验证错误
  4. **自定义重置**：根据业务需求定制重置行为
  5. **异步重置**：处理异步数据加载的重置
  6. **条件重置**：根据条件选择性重置
  7. **联动重置**：处理表单间的联动重置
  8. **确认机制**：添加重置确认机制
  9. **重置回调**：提供重置前后的钩子函数
  10. **状态恢复**：提供撤销重置的功能

  通过合理的重置策略，可以确保表单在重置时的行为符合用户预期，提高用户体验。
  </details>
- **状态持久化**

  <details>
  <summary>表单状态持久化最佳实践</summary>

  表单状态持久化是一种保存和恢复表单数据的机制,可以提升用户体验,避免数据丢失。以下是实现表单状态持久化的常用方案和最佳实践。

  **1. LocalStorage持久化**

  ```typescript
  @Component({
    selector: 'app-form-persistence',
    template: `
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>用户名</label>
          <input formControlName="username">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input formControlName="email">
        </div>
        <button type="submit">提交</button>
        <button type="button" (click)="saveDraft()">保存草稿</button>
        <button type="button" (click)="loadDraft()">加载草稿</button>
      </form>
    `
  })
  export class FormPersistenceComponent implements OnInit {
    private readonly STORAGE_KEY = 'user_form_draft';
    userForm: FormGroup;

    constructor(private fb: FormBuilder) {
      this.userForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      });
    }

    ngOnInit() {
      // 自动加载草稿
      this.loadDraft();
      
      // 自动保存
      this.userForm.valueChanges.pipe(
        debounceTime(1000) // 防抖
      ).subscribe(() => {
        this.saveDraft();
      });
    }

    saveDraft() {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userForm.value));
    }

    loadDraft() {
      const draft = localStorage.getItem(this.STORAGE_KEY);
      if (draft) {
        this.userForm.patchValue(JSON.parse(draft));
      }
    }
  }
  ```

  **2. IndexedDB持久化**

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class FormStorageService {
    private db: IDBDatabase;
    
    async initDB() {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('FormDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        
        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          db.createObjectStore('forms', { keyPath: 'id' });
        };
      });
    }

    async saveForm(id: string, data: any) {
      const transaction = this.db.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      await store.put({ id, data });
    }

    async loadForm(id: string): Promise<any> {
      const transaction = this.db.transaction(['forms'], 'readonly');
      const store = transaction.objectStore('forms');
      return store.get(id);
    }
  }
  ```

  **3. 会话存储持久化**

  ```typescript
  @Component({
    selector: 'app-session-persistence',
    template: `
      <form [formGroup]="tempForm">
        <!-- 表单内容 -->
      </form>
    `
  })
  export class SessionPersistenceComponent implements OnInit {
    tempForm: FormGroup;
    
    constructor(private fb: FormBuilder) {
      this.tempForm = this.fb.group({
        // 表单控件定义
      });
    }
    
    ngOnInit() {
      // 从会话存储恢复
      const savedState = sessionStorage.getItem('temp_form');
      if (savedState) {
        this.tempForm.patchValue(JSON.parse(savedState));
      }
      
      // 自动保存到会话存储
      this.tempForm.valueChanges.subscribe(value => {
        sessionStorage.setItem('temp_form', JSON.stringify(value));
      });
    }
  }
  ```

  **4. 持久化最佳实践**

  1. **选择合适的存储方式**
     - LocalStorage: 适用于小型数据,持久保存
     - SessionStorage: 适用于临时数据
     - IndexedDB: 适用于大型数据,复杂查询
  
  2. **数据安全性**
     - 敏感数据加密存储
     - 定期清理过期数据
     - 控制存储大小
  
  3. **性能优化**
     - 使用防抖控制保存频率
     - 增量保存大型表单
     - 异步处理存储操作
  
  4. **用户体验**
     - 提供手动保存/加载选项
     - 显示保存状态提示
     - 支持放弃更改功能
  
  5. **错误处理**
     - 优雅降级
     - 存储失败提示
     - 数据恢复机制

  通过合理的持久化策略,可以有效提升表单的用户体验,避免数据丢失问题。
  </details>

### 2.3 路由

- **路由配置和参数传递**

  <details>
  <summary>路由配置和参数传递详解</summary>

  Angular路由系统提供了强大的路由配置和参数传递功能。以下是详细说明和最佳实践。

  **1. 基础路由配置**

  ```typescript
  // app-routing.module.ts
  const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: '**', component: NotFoundComponent }
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
  ```

  **2. 参数传递方式**

  ```typescript
  // 1. 路径参数
  @Component({/*...*/})
  export class ProductDetailComponent implements OnInit {
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit() {
      // 获取路径参数
      this.route.params.subscribe(params => {
        const productId = params['id'];
        // 加载产品详情
      });
    }
  }

  // 2. 查询参数
  @Component({/*...*/})
  export class ProductListComponent {
    constructor(private router: Router) {}
    
    navigateToProducts() {
      this.router.navigate(['/products'], {
        queryParams: { category: 'electronics', sort: 'price' }
      });
    }
  }

  // 3. 状态参数
  navigateWithState() {
    this.router.navigate(['/products'], {
      state: { data: { source: 'search' } }
    });
  }
  ```

  **3. 路由配置高级特性**

  ```typescript
  const routes: Routes = [
    {
      path: 'admin',
      component: AdminComponent,
      children: [
        { path: 'users', component: UserManagementComponent },
        { path: 'settings', component: SettingsComponent }
      ],
      data: { roles: ['ADMIN'] }
    }
  ];
  ```

  **4. 路由参数处理最佳实践**

  ```typescript
  @Component({/*...*/})
  export class ProductComponent implements OnInit {
    private destroy$ = new Subject<void>();

    constructor(
      private route: ActivatedRoute,
      private productService: ProductService
    ) {}

    ngOnInit() {
      // 组合处理多个参数
      combineLatest([
        this.route.params,
        this.route.queryParams
      ]).pipe(
        takeUntil(this.destroy$),
        map(([params, queryParams]) => ({
          id: params['id'],
          category: queryParams['category']
        }))
      ).subscribe(combinedParams => {
        // 处理参数
      });
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
  ```

  **5. 路由事件处理**

  ```typescript
  constructor(private router: Router) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 处理路由导航完成事件
    });
  }
  ```
  </details>

- **路由守卫**

  <details>
  <summary>路由守卫详解</summary>

  路由守卫用于控制路由的访问权限和导航行为，Angular提供了多种类型的守卫。

  **1. CanActivate守卫**

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
    constructor(
      private authService: AuthService,
      private router: Router
    ) {}

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): boolean | UrlTree {
      if (this.authService.isAuthenticated()) {
        return true;
      }
      
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }
  }
  ```

  **2. CanDeactivate守卫**

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class UnsavedChangesGuard implements CanDeactivate<FormComponent> {
    canDeactivate(
      component: FormComponent,
      currentRoute: ActivatedRouteSnapshot,
      currentState: RouterStateSnapshot,
      nextState?: RouterStateSnapshot
    ): boolean | Observable<boolean> {
      if (component.form.dirty) {
        return confirm('有未保存的更改，确定要离开吗？');
      }
      return true;
    }
  }
  ```

  **3. Resolve守卫**

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class ProductResolver implements Resolve<Product> {
    constructor(private productService: ProductService) {}

    resolve(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<Product> {
      const id = route.paramMap.get('id');
      return this.productService.getProduct(id).pipe(
        catchError(error => {
          console.error('数据加载失败', error);
          return EMPTY;
        })
      );
    }
  }
  ```

  **4. 路由守卫配置**

  ```typescript
  const routes: Routes = [
    {
      path: 'admin',
      component: AdminComponent,
      canActivate: [AuthGuard],
      canActivateChild: [AdminGuard],
      children: [
        {
          path: 'products/edit/:id',
          component: ProductEditComponent,
          canDeactivate: [UnsavedChangesGuard],
          resolve: {
            product: ProductResolver
          }
        }
      ]
    }
  ];
  ```

  **5. 组合多个守卫**

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
      const requiredRole = route.data['role'];
      return this.authService.hasRole(requiredRole);
    }
  }

  // 路由配置
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  }
  ```
  </details>
- **路由解析器(Resolver)**

  <details>
  <summary>路由解析器详解</summary>

  路由解析器用于在激活路由之前预先获取数据,避免组件在渲染时出现数据加载延迟的问题。

  **1. 基本用法**

  ```typescript
  // product-resolver.service.ts
  @Injectable({
    providedIn: 'root'
  })
  export class ProductResolver implements Resolve<Product> {
    constructor(private productService: ProductService) {}

    // 实现resolve方法,返回数据或Observable
    resolve(route: ActivatedRouteSnapshot): Observable<Product> {
      // 从路由参数获取产品ID
      const productId = route.paramMap.get('id');
      
      // 调用服务获取数据
      return this.productService.getProduct(productId).pipe(
        // 处理错误情况
        catchError(error => {
          console.error('数据加载失败', error);
          return EMPTY;
        })
      );
    }
  }
  ```

  **2. 在路由中使用解析器**

  ```typescript
  // app-routing.module.ts
  const routes: Routes = [
    {
      path: 'products/:id',
      component: ProductDetailComponent,
      resolve: {
        // 配置解析器,product将作为路由数据的key
        product: ProductResolver
      }
    }
  ];
  ```

  **3. 在组件中使用解析的数据**

  ```typescript
  // product-detail.component.ts
  @Component({
    template: `
      <div *ngIf="product">
        <h2>{{product.name}}</h2>
        <p>{{product.description}}</p>
        <span>价格: {{product.price | currency:'CNY'}}</span>
      </div>
    `
  })
  export class ProductDetailComponent implements OnInit {
    product: Product;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
      // 从路由数据中获取已解析的产品信息
      this.product = this.route.snapshot.data['product'];
      
      // 或者订阅数据变化
      this.route.data.subscribe(data => {
        this.product = data['product'];
      });
    }
  }
  ```
  </details>

- **子路由(Child Routes)**

  <details>
  <summary>子路由配置与使用详解</summary>

  子路由允许我们创建层次化的路由结构,实现更复杂的导航需求。

  **1. 基本配置**

  ```typescript
  // app-routing.module.ts
  const routes: Routes = [
    {
      path: 'admin',
      component: AdminComponent,
      children: [  // 定义子路由
        {
          path: 'dashboard',
          component: DashboardComponent
        },
        {
          path: 'users',
          component: UserListComponent
        },
        {
          path: 'products',
          children: [  // 嵌套子路由
            {
              path: '',
              component: ProductListComponent
            },
            {
              path: 'new',
              component: ProductCreateComponent
            },
            {
              path: ':id',
              component: ProductDetailComponent
            }
          ]
        }
      ]
    }
  ];
  ```

  **2. 父组件模板**

  ```typescript
  // admin.component.ts
  @Component({
    template: `
      <nav>
        <a routerLink="./dashboard">仪表盘</a>
        <a routerLink="./users">用户管理</a>
        <a routerLink="./products">产品管理</a>
      </nav>
      
      <!-- 子路由出口 -->
      <router-outlet></router-outlet>
    `
  })
  export class AdminComponent {}
  ```

  **3. 子路由导航**

  ```typescript
  // product-list.component.ts
  @Component({
    template: `
      <h2>产品列表</h2>
      <ul>
        <li *ngFor="let product of products">
          <!-- 相对路径导航 -->
          <a [routerLink]="['./', product.id]">{{product.name}}</a>
        </li>
      </ul>
      
      <!-- 编程式导航 -->
      <button (click)="createProduct()">新建产品</button>
    `
  })
  export class ProductListComponent {
    products: Product[];

    constructor(private router: Router,
                private route: ActivatedRoute) {}

    createProduct() {
      // 使用相对路径导航
      this.router.navigate(['new'], { relativeTo: this.route });
    }
  }
  ```

  **4. 路由参数传递**

  ```typescript
  // product-detail.component.ts
  @Component({
    template: `
      <div *ngIf="product">
        <h3>{{product.name}}</h3>
        <button (click)="goBack()">返回列表</button>
      </div>
    `
  })
  export class ProductDetailComponent implements OnInit {
    product: Product;

    constructor(
      private route: ActivatedRoute,
      private router: Router
    ) {}

    ngOnInit() {
      // 获取路由参数
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        // 加载产品数据...
      });
    }

    goBack() {
      // 返回上级路由
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
  ```
  </details>
- **懒加载模块**

  <details>
  <summary>懒加载模块详解</summary>

  懒加载是一种优化技术,可以延迟加载应用中的某些部分,直到实际需要时才加载。这可以显著减少初始加载时间。

  **1. 配置懒加载模块**

  ```typescript
  // app-routing.module.ts
  const routes: Routes = [
    {
      path: 'admin',
      // 使用loadChildren实现懒加载
      loadChildren: () => import('./admin/admin.module')
        .then(m => m.AdminModule)
    },
    {
      path: 'products',
      loadChildren: () => import('./products/products.module')
        .then(m => m.ProductsModule)
    }
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
  ```

  **2. 特性模块配置**

  ```typescript
  // admin/admin.module.ts
  const routes: Routes = [
    {
      path: '', // 注意这里是空字符串
      component: AdminComponent,
      children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'users', component: UserListComponent }
      ]
    }
  ];

  @NgModule({
    declarations: [AdminComponent, DashboardComponent, UserListComponent],
    imports: [
      CommonModule,
      RouterModule.forChild(routes) // 使用forChild而不是forRoot
    ]
  })
  export class AdminModule { }
  ```

  **3. 预加载策略**

  ```typescript
  // app-routing.module.ts
  import { PreloadAllModules } from '@angular/router';

  @NgModule({
    imports: [
      RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules // 预加载所有模块
      })
    ]
  })
  export class AppRoutingModule { }
  ```

  **4. 自定义预加载策略**

  ```typescript
  // custom-preload.strategy.ts
  @Injectable({
    providedIn: 'root'
  })
  export class CustomPreloadStrategy implements PreloadAllModules {
    preload(route: Route, load: () => Observable<any>): Observable<any> {
      // 根据route.data中的preload标志决定是否预加载
      return route.data && route.data['preload'] ? load() : EMPTY;
    }
  }

  // 在路由配置中使用
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: { preload: true }
  }
  ```
  </details>

- **路由事件**

  <details>
  <summary>路由事件监听与处理</summary>

  Angular提供了一系列路由事件,可以用来跟踪路由的生命周期和实现各种导航功能。

  **1. 基本路由事件监听**

  ```typescript
  @Component({
    selector: 'app-root',
    template: `
      <div *ngIf="loading" class="loading-indicator">加载中...</div>
      <router-outlet></router-outlet>
    `
  })
  export class AppComponent implements OnInit {
    loading = false;

    constructor(private router: Router) {
      // 监听所有路由事件
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.loading = true;
          console.log('导航开始');
        }
        if (event instanceof NavigationEnd) {
          this.loading = false;
          console.log('导航结束');
        }
        if (event instanceof NavigationError) {
          this.loading = false;
          console.error('导航错误:', event.error);
        }
      });
    }
  }
  ```

  **2. 过滤特定路由事件**

  ```typescript
  import { filter } from 'rxjs/operators';

  @Component({/*...*/})
  export class AppComponent implements OnInit {
    constructor(private router: Router) {
      // 只监听NavigationEnd事件
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        // 处理导航结束事件
        console.log('当前URL:', event.url);
      });
    }
  }
  ```

  **3. 路由事件处理服务**

  ```typescript
  @Injectable({
    providedIn: 'root'
  })
  export class RouteService {
    private navigationEnd = new Subject<string>();
    navigationEnd$ = this.navigationEnd.asObservable();

    constructor(private router: Router) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects)
      ).subscribe(url => {
        this.navigationEnd.next(url);
        // 可以在这里执行页面访问统计等操作
        this.logPageView(url);
      });
    }

    private logPageView(url: string) {
      // 实现页面访问统计逻辑
      console.log(`页面访问: ${url}`);
    }
  }
  ```

  **4. 路由事件的应用场景**

  ```typescript
  @Component({
    selector: 'app-navigation',
    template: `
      <nav>
        <a [routerLink]="['/home']">首页</a>
        <a [routerLink]="['/products']">产品</a>
      </nav>
      <div *ngIf="loading" class="progress-bar"></div>
    `
  })
  export class NavigationComponent implements OnInit, OnDestroy {
    loading = false;
    private subscription: Subscription;

    constructor(private router: Router) {
      // 组合多个路由事件处理
      this.subscription = merge(
        this.router.events.pipe(
          filter(event => event instanceof NavigationStart),
          map(() => true)
        ),
        this.router.events.pipe(
          filter(event => 
            event instanceof NavigationEnd || 
            event instanceof NavigationError || 
            event instanceof NavigationCancel
          ),
          map(() => false)
        )
      ).subscribe(loading => this.loading = loading);
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
  }
  ```
  </details>

### 2.4 状态管理

- **NgRx 架构**

  <details>
  <summary>NgRx架构详解</summary>

  NgRx是Angular的状态管理框架,基于Redux模式实现,用于处理复杂的状态管理需求。

  **1. 核心概念**

  - Store: 应用的单一数据源,保存整个应用的状态树
  - Action: 描述状态变更的意图
  - Reducer: 处理状态变更的纯函数
  - Effect: 处理副作用
  - Selector: 获取状态的函数

  **2. 基本架构示例**

  ```typescript
  // 定义状态接口
  interface AppState {
    count: number;
    user: User;
  }

  // 定义Actions
  enum CountActionTypes {
    INCREMENT = '[Counter] Increment',
    DECREMENT = '[Counter] Decrement',
  }

  export class IncrementAction implements Action {
    readonly type = CountActionTypes.INCREMENT;
    constructor(public payload: number) {}
  }

  export class DecrementAction implements Action {
    readonly type = CountActionTypes.DECREMENT;
    constructor(public payload: number) {}
  }

  export type CountActions = IncrementAction | DecrementAction;

  // 定义Reducer
  export const initialState: AppState = {
    count: 0,
    user: null
  };

  export function counterReducer(
    state = initialState,
    action: CountActions
  ): AppState {
    switch (action.type) {
      case CountActionTypes.INCREMENT:
        return {
          ...state,
          count: state.count + action.payload
        };
      case CountActionTypes.DECREMENT:
        return {
          ...state,
          count: state.count - action.payload
        };
      default:
        return state;
    }
  }
  ```

  **3. 在组件中使用**

  ```typescript
  @Component({
    selector: 'app-counter',
    template: `
      <div>
        Count: {{ count$ | async }}
        <button (click)="increment()">+</button>
        <button (click)="decrement()">-</button>
      </div>
    `
  })
  export class CounterComponent {
    count$: Observable<number>;

    constructor(private store: Store<AppState>) {
      // 使用select获取状态
      this.count$ = store.select(state => state.count);
    }

    increment() {
      // 分发action
      this.store.dispatch(new IncrementAction(1));
    }

    decrement() {
      this.store.dispatch(new DecrementAction(1));
    }
  }
  ```
  </details>

- **Store 和 Action**

  <details>
  <summary>Store和Action详解</summary>

  Store是状态容器,Action是改变状态的触发器。

  **1. Store配置**

  ```typescript
  // app.module.ts
  @NgModule({
    imports: [
      StoreModule.forRoot({
        counter: counterReducer,
        user: userReducer
      }),
      // 开发工具支持
      StoreDevtoolsModule.instrument({
        maxAge: 25 // 保留最近25次操作记录
      })
    ]
  })
  export class AppModule { }
  ```

  **2. Action定义**

  ```typescript
  // user.actions.ts
  export enum UserActionTypes {
    LOAD_USERS = '[User] Load Users',
    LOAD_USERS_SUCCESS = '[User] Load Users Success',
    LOAD_USERS_FAILURE = '[User] Load Users Failure'
  }

  export class LoadUsers implements Action {
    readonly type = UserActionTypes.LOAD_USERS;
  }

  export class LoadUsersSuccess implements Action {
    readonly type = UserActionTypes.LOAD_USERS_SUCCESS;
    constructor(public payload: User[]) {}
  }

  export class LoadUsersFailure implements Action {
    readonly type = UserActionTypes.LOAD_USERS_FAILURE;
    constructor(public payload: Error) {}
  }

  export type UserActions = LoadUsers | LoadUsersSuccess | LoadUsersFailure;
  ```
  </details>

- **Reducer**

  <details>
  <summary>Reducer详解</summary>

  Reducer是一个纯函数,用于处理状态变更。

  ```typescript
  // user.reducer.ts
  export interface UserState {
    users: User[];
    loading: boolean;
    error: Error | null;
  }

  const initialState: UserState = {
    users: [],
    loading: false,
    error: null
  };

  export function userReducer(
    state = initialState,
    action: UserActions
  ): UserState {
    switch (action.type) {
      case UserActionTypes.LOAD_USERS:
        return {
          ...state,
          loading: true
        };
      case UserActionTypes.LOAD_USERS_SUCCESS:
        return {
          ...state,
          loading: false,
          users: action.payload
        };
      case UserActionTypes.LOAD_USERS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      default:
        return state;
    }
  }

  // 创建selector
  export const selectUserState = (state: AppState) => state.user;
  export const selectUsers = createSelector(
    selectUserState,
    (state: UserState) => state.users
  );
  export const selectLoading = createSelector(
    selectUserState,
    (state: UserState) => state.loading
  );
  ```
  </details>
- **Effects 处理副作用**

  <details>
  <summary>Effects 详解与最佳实践</summary>

  Effects 用于处理异步操作和副作用,如 HTTP 请求、与外部服务交互等。它可以监听特定的 Action,执行副作用操作,并分发新的 Action。

  ```typescript
  // user.effects.ts
  @Injectable()
  export class UserEffects {
    // 注入依赖
    constructor(
      private actions$: Actions,
      private userService: UserService
    ) {}

    // 加载用户列表的 Effect
    loadUsers$ = createEffect(() => 
      this.actions$.pipe(
        // 监听加载用户 action
        ofType(UserActionTypes.LOAD_USERS),
        // 处理并发请求
        mergeMap(() => this.userService.getUsers()
          .pipe(
            // 请求成功,分发成功 action
            map(users => ({ 
              type: UserActionTypes.LOAD_USERS_SUCCESS, 
              payload: users 
            })),
            // 请求失败,分发失败 action
            catchError(error => of({ 
              type: UserActionTypes.LOAD_USERS_FAILURE,
              payload: error
            }))
          ))
      )
    );

    // 创建用户的 Effect
    createUser$ = createEffect(() =>
      this.actions$.pipe(
        ofType(UserActionTypes.CREATE_USER),
        mergeMap((action: any) => 
          this.userService.createUser(action.payload).pipe(
            map(user => ({
              type: UserActionTypes.CREATE_USER_SUCCESS,
              payload: user
            })),
            catchError(error => of({
              type: UserActionTypes.CREATE_USER_FAILURE, 
              payload: error
            }))
          )
        )
      )
    );
  }
  ```

  </details>

- **Selector 选择器**

  <details>
  <summary>Selector 详解与使用技巧</summary>

  Selector 是一个纯函数,用于从 Store 中提取和组合状态片段。它可以实现状态的记忆化,提高性能。

  ```typescript
  // user.selectors.ts
  
  // 基础选择器
  export const selectUserState = (state: AppState) => state.user;

  // 派生选择器
  export const selectAllUsers = createSelector(
    selectUserState,
    (state: UserState) => state.users
  );

  export const selectUserById = (userId: number) => createSelector(
    selectAllUsers,
    (users: User[]) => users.find(user => user.id === userId)
  );

  // 组合选择器
  export const selectUserWithRoles = createSelector(
    selectAllUsers,
    selectRoles,
    (users: User[], roles: Role[]) => {
      return users.map(user => ({
        ...user,
        role: roles.find(role => role.id === user.roleId)
      }));
    }
  );

  // 带参数的选择器
  export const selectUsersByRole = (roleId: string) => createSelector(
    selectAllUsers,
    (users: User[]) => users.filter(user => user.roleId === roleId)
  );
  ```

  </details>

- **状态持久化**

  <details>
  <summary>状态持久化实现方案</summary>

  状态持久化可以保存应用状态到本地存储,在页面刷新后恢复状态。

  ```typescript
  // storage.metareducer.ts
  export function storageMetaReducer<S, A extends Action = Action>(
    reducer: ActionReducer<S, A>
  ) {
    const STORAGE_KEY = 'app-state';
    
    return function(state: S, action: A): S {
      const nextState = reducer(state, action);
      
      // 保存状态到 localStorage
      if (action.type !== '@ngrx/store/init') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }
      
      return nextState;
    };
  }

  // 配置 MetaReducer
  @NgModule({
    imports: [
      StoreModule.forRoot(reducers, {
        metaReducers: [storageMetaReducer]
      })
    ]
  })
  export class AppModule {}

  // 初始化时恢复状态
  export function rehydrateState() {
    const STORAGE_KEY = 'app-state';
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
    } catch (e) {
      console.error('Failed to rehydrate state', e);
    }
    return undefined;
  }
  ```

  </details>

## 3. 性能优化

### 3.1 变更检测优化

- **变更检测策略(ChangeDetectionStrategy)**

  <details>
  <summary>变更检测策略详解</summary>

  Angular的变更检测机制用于检测组件数据的变化并更新视图。合理使用变更检测策略可以显著提升应用性能。

  **1. Default策略**
  ```typescript
  @Component({
    selector: 'app-default',
    template: `
      <div>{{data}}</div>
    `,
    changeDetection: ChangeDetectionStrategy.Default // 默认策略
  })
  export class DefaultComponent {
    data = 'test';
  }
  ```

  **2. OnPush策略**
  ```typescript
  @Component({
    selector: 'app-onpush',
    template: `
      <div>{{data}}</div>
      <button (click)="updateData()">更新数据</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class OnPushComponent {
    @Input() data: string; // 输入属性

    constructor(private cd: ChangeDetectorRef) {}

    updateData() {
      // 手动触发变更检测
      this.cd.markForCheck();
    }
  }
  ```
  </details>

- **OnPush 策略最佳实践**

  <details>
  <summary>OnPush策略使用详解</summary>

  OnPush策略可以显著减少变更检测的执行次数，提高性能。

  ```typescript
  @Component({
    selector: 'app-performance',
    template: `
      <div>
        <h2>{{title}}</h2>
        <div *ngFor="let item of items">
          {{item.name}}
        </div>
      </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class PerformanceComponent {
    @Input() items: Item[]; // 不可变数据
    
    // 更新数据的正确方式
    updateItems() {
      this.items = [...this.items, newItem]; // 创建新引用
    }
  }
  ```
  </details>

- **trackBy函数优化**

  <details>
  <summary>trackBy函数使用详解</summary>

  使用trackBy函数可以优化ngFor的性能，避免不必要的DOM重渲染。

  ```typescript
  @Component({
    selector: 'app-list',
    template: `
      <div *ngFor="let item of items; trackBy: trackByFn">
        {{item.name}}
      </div>
    `
  })
  export class ListComponent {
    items: any[] = [];

    // 自定义trackBy函数
    trackByFn(index: number, item: any): number {
      return item.id; // 使用唯一标识作为trackBy值
    }
  }
  ```
  </details>

- **NgZone优化**

  <details>
  <summary>NgZone优化详解</summary>

  NgZone用于管理Angular的变更检测，合理使用可以避免不必要的检测。

  ```typescript
  @Component({
    selector: 'app-zone',
    template: `<div>{{data}}</div>`
  })
  export class ZoneComponent {
    data: string;

    constructor(private ngZone: NgZone) {
      // 在NgZone外运行
      ngZone.runOutsideAngular(() => {
        // 不触发变更检测的操作
        setInterval(() => {
          this.heavyComputation();
        }, 1000);
      });
    }

    // 需要更新视图时
    updateView() {
      this.ngZone.run(() => {
        this.data = 'updated';
      });
    }
  }
  ```
  </details>

- **纯管道使用**

  <details>
  <summary>纯管道使用详解</summary>

  纯管道可以提供更好的性能，因为它们只在输入值发生变化时才重新计算。

  ```typescript
  @Pipe({
    name: 'filter',
    pure: true // 声明为纯管道
  })
  export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
      if (!items || !searchText) {
        return items;
      }
      
      return items.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
  }

  // 使用示例
  @Component({
    template: `
      <input [(ngModel)]="searchText">
      <div *ngFor="let item of items | filter:searchText">
        {{item.name}}
      </div>
    `
  })
  export class SearchComponent {
    items = [];
    searchText = '';
  }
  ```
  </details>

### 3.2 加载优化

- **懒加载策略**

  <details>
  <summary>懒加载策略详解</summary>

  懒加载是一种优化技术,可以显著减少应用的初始加载时间。通过将应用拆分成多个模块,仅在需要时才加载相应模块。

  **1. 基本配置**
  ```typescript
  // app-routing.module.ts
  const routes: Routes = [
    {
      path: 'admin',
      loadChildren: () => import('./admin/admin.module')
        .then(m => m.AdminModule)
    }
  ];
  ```

  **2. 子模块配置**
  ```typescript
  // admin/admin.module.ts
  const routes: Routes = [
    {
      path: '',
      component: AdminComponent,
      children: [
        { path: 'users', component: UserListComponent },
        { path: 'settings', component: SettingsComponent }
      ]
    }
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    declarations: [AdminComponent, UserListComponent, SettingsComponent]
  })
  export class AdminModule { }
  ```
  </details>

- **预加载策略**

  <details>
  <summary>预加载策略详解</summary>

  预加载可以在应用空闲时提前加载模块,平衡初始加载时间和后续访问速度。

  **1. 全量预加载**
  ```typescript
  // app-routing.module.ts
  import { PreloadAllModules } from '@angular/router';

  @NgModule({
    imports: [
      RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules
      })
    ]
  })
  export class AppRoutingModule { }
  ```

  **2. 自定义预加载**
  ```typescript
  // custom-preload.strategy.ts
  @Injectable()
  export class CustomPreloadStrategy implements PreloadAllModules {
    preload(route: Route, load: () => Observable<any>): Observable<any> {
      // 根据route.data.preload判断是否预加载
      return route.data?.preload ? load() : EMPTY;
    }
  }
  ```
  </details>

- **Tree-Shaking**

  <details>
  <summary>Tree-Shaking详解</summary>

  Tree-Shaking是一种通过移除未使用代码来优化打包体积的技术。

  **1. 配置优化**
  ```json
  // angular.json
  {
    "projects": {
      "app": {
        "architect": {
          "build": {
            "options": {
              "optimization": true,
              "aot": true
            }
          }
        }
      }
    }
  }
  ```

  **2. 代码编写建议**
  ```typescript
  // 推荐写法 - 便于Tree-Shaking
  export class MyService { }
  
  // 不推荐 - 可能影响Tree-Shaking
  window['MyService'] = MyService;
  ```
  </details>

- **代码分割**

  <details>
  <summary>代码分割策略详解</summary>

  代码分割可以将应用拆分成更小的块,实现按需加载。

  **1. 路由级分割**
  ```typescript
  const routes: Routes = [
    {
      path: 'feature',
      loadChildren: () => import('./feature/feature.module')
        .then(m => m.FeatureModule),
      data: { preload: true }
    }
  ];
  ```

  **2. 组件级分割**
  ```typescript
  @Component({
    template: `
      <ng-container *ngIf="component$ | async as component">
        <ng-container *ngComponentOutlet="component"></ng-container>
      </ng-container>
    `
  })
  export class DynamicComponent {
    component$ = import('./lazy.component').then(m => m.LazyComponent);
  }
  ```
  </details>

- **资源压缩**

  <details>
  <summary>资源压缩策略详解</summary>

  资源压缩是减小应用体积的重要手段。

  **1. 生产环境配置**
  ```json
  // angular.json
  {
    "configurations": {
      "production": {
        "optimization": true,
        "outputHashing": "all",
        "sourceMap": false,
        "namedChunks": false,
        "extractLicenses": true,
        "vendorChunk": false,
        "buildOptimizer": true,
        "budgets": [
          {
            "type": "initial",
            "maximumWarning": "2mb",
            "maximumError": "5mb"
          }
        ]
      }
    }
  }
  ```

  **2. Gzip压缩**
  ```typescript
  // server.js
  const compression = require('compression');
  app.use(compression()); // 启用gzip压缩
  ```
  </details>

### 3.3 渲染优化

- **Virtual Scrolling**

  <details>
  <summary>Virtual Scrolling详解</summary>

  Virtual Scrolling是一种优化大型列表渲染性能的技术,只渲染当前视口可见的项目。

  ```typescript
  // app.module.ts
  import { ScrollingModule } from '@angular/cdk/scrolling';

  @NgModule({
    imports: [ScrollingModule]
  })
  export class AppModule { }

  // virtual-scroll.component.ts
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
        height: 400px; // 设置视口高度
        width: 100%;
      }
      .item {
        height: 50px; // 每项高度
        border-bottom: 1px solid #eee;
      }
    `]
  })
  export class VirtualScrollComponent {
    // 模拟大量数据
    items = Array.from({length: 10000}).map((_, i) => ({
      id: i,
      name: `Item #${i}`
    }));
  }
  ```
  </details>

- **内存管理**

  <details>
  <summary>内存管理最佳实践</summary>

  合理的内存管理对于应用性能至关重要。

  ```typescript
  @Component({
    selector: 'app-memory',
    template: `
      <div>
        <button (click)="loadData()">加载数据</button>
        <div *ngFor="let item of data$ | async">{{item.name}}</div>
      </div>
    `
  })
  export class MemoryComponent implements OnDestroy {
    private destroy$ = new Subject<void>();
    data$ = new BehaviorSubject<any[]>([]);

    constructor(private dataService: DataService) {
      // 使用takeUntil操作符自动取消订阅
      this.dataService.getData().pipe(
        takeUntil(this.destroy$)
      ).subscribe(data => {
        this.data$.next(data);
      });
    }

    ngOnDestroy() {
      // 组件销毁时清理资源
      this.destroy$.next();
      this.destroy$.complete();
      this.data$.complete();
    }
  }
  ```
  </details>

- **DOM操作优化**

  <details>
  <summary>DOM操作优化详解</summary>

  优化DOM操作可以显著提升应用性能。

  ```typescript
  @Component({
    selector: 'app-dom-optimization',
    template: `
      <div #container>
        <ng-container *ngFor="let item of items; trackBy: trackByFn">
          <div class="item">{{item.name}}</div>
        </ng-container>
      </div>
    `
  })
  export class DomOptimizationComponent {
    @ViewChild('container') container: ElementRef;
    
    // 使用trackBy优化ngFor
    trackByFn(index: number, item: any): number {
      return item.id;
    }

    // 批量DOM更新
    updateItems() {
      // 使用requestAnimationFrame优化视觉更新
      requestAnimationFrame(() => {
        this.items = [...this.items, newItem];
      });
    }
  }
  ```
  </details>

- **SSR（Server-Side Rendering）**

  <details>
  <summary>SSR实现详解</summary>

  服务端渲染可以提升首屏加载速度和SEO效果。

  ```typescript
  // app.server.module.ts
  @NgModule({
    imports: [
      AppModule,
      ServerModule,
    ],
    bootstrap: [AppComponent],
  })
  export class AppServerModule {}

  // server.ts
  import 'zone.js/dist/zone-node';
  import { ngExpressEngine } from '@nguniversal/express-engine';
  import * as express from 'express';
  import { AppServerModule } from './src/main.server';

  const app = express();

  // 设置服务端渲染引擎
  app.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  app.set('view engine', 'html');
  app.set('views', './dist/browser');

  // 服务静态文件
  app.get('*.*', express.static('./dist/browser'));

  // 所有路由通过Universal处理
  app.get('*', (req, res) => {
    res.render('index', { req });
  });
  ```
  </details>

- **PWA实现**

  <details>
  <summary>PWA实现详解</summary>

  PWA可以提供接近原生应用的体验。

  ```typescript
  // app.module.ts
  import { ServiceWorkerModule } from '@angular/service-worker';

  @NgModule({
    imports: [
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        registrationStrategy: 'registerWhenStable:30000'
      })
    ]
  })
  export class AppModule {}

  // manifest.webmanifest
  {
    "name": "My Angular PWA",
    "short_name": "PWA",
    "theme_color": "#1976d2",
    "background_color": "#fafafa",
    "display": "standalone",
    "scope": "./",
    "start_url": "./",
    "icons": [
      {
        "src": "assets/icons/icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png"
      }
      // ... 其他尺寸的图标
    ]
  }
  ```
  </details>

## 4. 测试

### 4.1 单元测试

- Jasmine 框架
- TestBed 配置
- 组件测试
- 服务测试
- 异步测试

### 4.2 E2E测试

- Protractor
- Cypress
- 测试用例编写
- 测试覆盖率

## 5. 工程化

### 5.1 构建和部署

- Angular CLI
- 环境配置
- 打包优化
- CI/CD 集成
- Docker 部署

### 5.2 最佳实践

- 项目结构组织
- 代码规范
- Git 工作流
- 文档管理
- 版本控制

## 6. 新特性和趋势

### 6.1 Angular 最新版本特性
### 6.2 Ivy 渲染引擎
### 6.3 Standalone Components
### 6.4 Signal 响应式系统
### 6.5 Web Components 集成

## 7. 实战经验

### 7.1 架构设计

#### 7.1.1 大型应用架构设计
```typescript
// 1. 模块划分策略
@NgModule({
  imports: [
    CoreModule,           // 核心功能
    SharedModule,         // 共享功能
    FeatureAModule,      // 业务功能A
    FeatureBModule,      // 业务功能B
    StateModule.forRoot()// 状态管理
  ]
})
export class AppModule { }

// 2. 路由设计
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'feature-a',
        loadChildren: () => import('./features/feature-a/feature-a.module')
          .then(m => m.FeatureAModule)
      }
    ]
  }
];
```

#### 7.1.2 微前端实践
```typescript
// 1. Single-SPA 配置
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgZone } from '@angular/core';
import { 
  singleSpaAngular,
  getSingleSpaExtraProviders 
} from 'single-spa-angular';

const lifecycles = singleSpaAngular({
  bootstrapFunction: () =>
    platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule),
  template: '<app-root />',
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;

// 2. 应用间通信
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventBus = new BehaviorSubject<any>(null);

  emit(event: any) {
    this.eventBus.next(event);
  }

  on<T>(): Observable<T> {
    return this.eventBus.asObservable();
  }
}
```

#### 7.1.3 组件库开发
```typescript
// 1. 组件库结构
@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    // ...其他基础组件
  ],
  exports: [
    ButtonComponent,
    InputComponent
  ]
})
export class UIModule { }

// 2. 主题系统
// styles/_variables.scss
$primary-color: #007bff;
$secondary-color: #6c757d;

// 3. 组件封装
@Component({
  selector: 'lib-button',
  template: `
    <button 
      [class]="'btn-' + type"
      [disabled]="loading">
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Input() loading = false;
}
```

#### 7.1.4 性能监控系统
```typescript
// 1. 性能指标收集
@Injectable({ providedIn: 'root' })
export class PerformanceMonitorService {
  private metrics = new BehaviorSubject<PerformanceMetrics>(null);

  constructor() {
    this.collectMetrics();
  }

  private collectMetrics() {
    // 收集首次渲染时间
    this.observeFirstPaint();
    // 收集交互响应时间
    this.observeInteractions();
    // 收集内存使用情况
    this.observeMemoryUsage();
  }

  private observeFirstPaint() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      this.metrics.next({
        firstPaint: entries[0].startTime,
        // ...其他指标
      });
    });

    observer.observe({ entryTypes: ['paint'] });
  }
}

// 2. 错误追踪
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorService: ErrorService) {}

  handleError(error: Error) {
    this.errorService.log({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent
    });
  }
}
```

### 7.2 常见问题解决

#### 7.2.1 内存泄漏排查
```typescript
// 1. 订阅管理
export class Component implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // 处理数据
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// 2. 定时器清理
export class TimerComponent implements OnDestroy {
  private timerId: number;

  startTimer() {
    this.clearTimer(); // 先清理之前的定时器
    this.timerId = window.setInterval(() => {
      // 定时任务
    }, 1000);
  }

  private clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
```

#### 7.2.2 性能瓶颈分析
```typescript
// 1. 变更检测优化
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  @Input() data: any;
  
  constructor(private cd: ChangeDetectorRef) {}

  // 手动触发变更检测
  updateView() {
    this.cd.detectChanges();
  }
}

// 2. 大数据列表优化
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50">
      <div *cdkVirtualFor="let item of items">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualScrollComponent {
  items = Array.from({length: 10000}).map((_, i) => ({
    id: i,
    name: `Item ${i}`
  }));
}
```

#### 7.2.3 跨域处理
```typescript
// 1. 代理配置 (proxy.conf.json)
{
  "/api": {
    "target": "http://api.example.com",
    "secure": false,
    "changeOrigin": true
  }
}

// 2. CORS 处理
@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const corsReq = req.clone({
      headers: req.headers
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    });
    return next.handle(corsReq);
  }
}
```

#### 7.2.4 安全性考虑
```typescript
// 1. XSS 防护
@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  constructor(private sanitizer: DomSanitizer) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          return event.clone({
            body: this.sanitizeBody(event.body)
          });
        }
        return event;
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (typeof body === 'string') {
      return this.sanitizer.sanitize(SecurityContext.HTML, body);
    }
    return body;
  }
}

// 2. CSRF 保护
@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      req = req.clone({
        headers: req.headers.set('X-CSRF-TOKEN', csrfToken)
      });
    }
    return next.handle(req);
  }
}
```
