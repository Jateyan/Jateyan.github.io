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

  ```typescript
  // Angular 提供了多种服务作用域
  // 1. root 作用域 - 全局单例
  // 2. platform 作用域 - 多个应用共享
  // 3. any 作用域 - 每个懒加载模块独立实例
  // 4. 特定模块作用域
  ```

- **服务实例化策略**

  ```typescript
  // Angular 提供了多种服务实例化策略
  // 1. useClass - 类提供者
  // 2. useValue - 值提供者
  // 3. useFactory - 工厂提供者
  // 4. useExisting - 别名提供者
  ```

- **循环依赖处理**

  ```typescript
  // Angular 提供了多种处理循环依赖的方法
  // 1. 使用 forwardRef 解决循环依赖
  // 2. 使用接口打破循环依赖
  ```

#### 1.4.3 Provider 配置

- **Provider 配置**

  ```typescript
  // Angular 提供了多种 Provider 配置方式
  // 1. useClass - 类提供者
  // 2. useValue - 值提供者
  // 3. useFactory - 工厂提供者
  // 4. useExisting - 别名提供者
  ```

- **循环依赖处理**

  ```typescript
  // Angular 提供了多种处理循环依赖的方法
  // 1. 使用 forwardRef 解决循环依赖
  // 2. 使用接口打破循环依赖
  ```

#### 1.4.4 多级注入器

- **多级注入器**

  ```typescript
  // Angular 提供了多级注入器，用于处理复杂的依赖关系
  // 1. 平台注入器 - 所有应用共享
  // 2. 根注入器 - 应用级别
  // 3. 模块注入器 - 特性模块级别
  // 4. 组件注入器 - 组件及其子组件
  ```

- **注入器作用域**

  ```typescript
  // Angular 提供了多种注入器作用域
  // 1. root 作用域 - 应用级单例
  // 2. platform 作用域 - 多个应用共享
  // 3. any 作用域 - 每个懒加载模块独立实例
  // 4. 特定模块作用域
  ```

- **提供者类型**

  ```typescript
  // Angular 提供了多种提供者类型
  // 1. useClass - 类提供者
  // 2. useValue - 值提供者
  // 3. useFactory - 工厂提供者
  // 4. useExisting - 别名提供者
  ```

- **循环依赖处理**

  ```typescript
  // Angular 提供了多种处理循环依赖的方法
  // 1. 使用 forwardRef 解决循环依赖
  // 2. 使用接口打破循环依赖
  ```

#### 1.4.5 服务单例模式

- **服务单例模式**

  ```typescript
  // Angular 提供了服务单例模式，用于确保服务在应用中只有一个实例
  // 1. 使用 @Injectable 装饰器
  // 2. 使用 providedIn 属性
  ```

## 2. 高级特性

### 2.1 响应式编程（RxJS）

#### 2.1.1 Observable 和 Subject

- **Observable**

  ```typescript
  // Observable 是 RxJS 中的核心概念之一
  // 它表示一个可观察的对象，可以发出一系列的值
  // 主要用于处理异步数据流
  ```

- **Subject**

  ```typescript
  // Subject 是 Observable 的一种特殊类型
  // 它可以同时作为事件源和事件目标
  // 主要用于在多个观察者之间共享数据
  ```

#### 2.1.2 常用操作符

- **操作符**

  ```typescript
  // 操作符是 RxJS 中的一个重要概念
  // 它们用于对 Observable 进行转换和操作
  // 常用的操作符包括: map, filter, mergeMap, switchMap, concatMap, take, takeUntil, etc.
  ```

#### 2.1.3 错误处理

- **错误处理**

  ```typescript
  // 错误处理是 RxJS 中的一个重要概念
  // 它们用于处理 Observable 中的错误
  // 常用的错误处理操作符包括: catchError, retry, etc.
  ```

#### 2.1.4 取消订阅和内存泄漏

- **取消订阅**

  ```typescript
  // 取消订阅是 RxJS 中的一个重要概念
  // 它们用于停止 Observable 的订阅
  // 常用的取消订阅操作符包括: take, takeUntil, etc.
  ```

- **内存泄漏**

  ```typescript
  // 内存泄漏是 RxJS 中的一个重要概念
  // 它们用于处理 Observable 中的内存泄漏问题
  // 常用的内存泄漏处理操作符包括: take, takeUntil, etc.
  ```

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

  - 表单模型创建
  - 表单控件绑定
  - 值和状态访问
  - 表单构建器使用
- **表单验证**

  - 同步验证器
  - 异步验证器
  - 自定义验证器
  - 跨字段验证

#### 2.2.3 动态表单

- **动态创建表单控件**
- **动态验证规则**
- **动态表单数组**
- **条件字段显示**

#### 2.2.4 表单数组（FormArray）

- **动态添加/删除控件**
- **批量操作**
- **嵌套表单组**
- **数组验证**

#### 2.2.5 最佳实践

- **表单状态管理**
- **错误处理策略**
- **性能优化**
- **测试策略**

#### 2.2.6 实战技巧

- **复杂表单处理**
- **表单值变化监听**
- **表单重置策略**
- **状态持久化**

### 2.3 路由

- 路由配置和参数传递
- 路由守卫
- 路由解析器
- 子路由
- 懒加载模块
- 路由事件

### 2.4 状态管理

- NgRx 架构
- Store, Action, Reducer
- Effects 处理副作用
- Selector 选择器
- 状态持久化

## 3. 性能优化

### 3.1 变更检测优化

- ChangeDetectionStrategy
- OnPush 策略
- trackBy 函数
- NgZone 优化
- 纯管道使用

### 3.2 加载优化

- 懒加载策略
- 预加载策略
- Tree-Shaking
- 代码分割
- 资源压缩

### 3.3 渲染优化

- Virtual Scrolling
- 内存管理
- DOM 操作优化
- SSR（Server-Side Rendering）
- PWA 实现

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
