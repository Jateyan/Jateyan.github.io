---
title: Angular依赖注入系统
description: Angular DI系统原理、令牌机制、提供者配置与高级技巧详解
head:
  - - meta
    - name: keywords
      content: Angular, 依赖注入, DI, Provider, Injector, 层级注入, 令牌, 工厂提供者
---

# Angular依赖注入系统

依赖注入(DI)是Angular的核心特性之一，它是一种设计模式，允许类从外部源获取依赖，而不是自行创建它们。Angular的DI系统强大而灵活，为创建松耦合、可测试和可维护的应用提供了基础。

## 依赖注入基础

### 什么是依赖注入？

依赖注入是一种设计模式，它允许一个对象接收它所依赖的其他对象，而不是在对象内部创建这些依赖。

**不使用DI的代码示例**：

```typescript
// 紧耦合，难以测试
class UserService {
  private httpClient = new HttpClient();
  private logger = new Logger();
  
  getUsers() {
    this.logger.log('获取用户列表');
    return this.httpClient.get('/api/users');
  }
}
```

**使用DI的代码示例**：

```typescript
// 松耦合，易于测试和维护
@Injectable()
class UserService {
  constructor(
    private httpClient: HttpClient,
    private logger: LoggerService
  ) {}
  
  getUsers() {
    this.logger.log('获取用户列表');
    return this.httpClient.get('/api/users');
  }
}
```

### Angular DI的核心概念

Angular的依赖注入系统基于几个关键概念：

1. **令牌(Token)**: 用于标识和请求依赖的唯一标识符
2. **提供者(Provider)**: 告诉注入器如何创建或获取依赖的对象
3. **注入器(Injector)**: 维护一个依赖实例的容器，并负责创建服务实例
4. **依赖(Dependency)**: 一个服务需要的对象或值

## 依赖注入配置

### 基本注入配置

最简单的依赖注入配置是使用`@Injectable()`装饰器，它告诉Angular这个类可以被注入：

```typescript
// 服务的基本声明
@Injectable({
  providedIn: 'root' // 在应用根级别提供服务
})
export class DataService {
  getData() {
    return ['数据1', '数据2', '数据3'];
  }
}
```

### 依赖注入的位置

Angular的依赖可以在多个级别提供：

1. **根级别**: 全应用范围内的单例服务
2. **模块级别**: 对特定模块的所有组件可用
3. **组件级别**: 只对组件及其子组件可用

```typescript
// 根级别提供（推荐用于服务）
@Injectable({
  providedIn: 'root'
})
export class GlobalService { }

// 模块级别提供
@NgModule({
  providers: [FeatureService]
})
export class FeatureModule { }

// 组件级别提供
@Component({
  selector: 'app-special',
  providers: [SpecialService]
})
export class SpecialComponent { }
```

## 依赖注入令牌

令牌是依赖注入系统用来唯一标识一个依赖的。Angular支持多种类型的令牌：

### 类作为令牌

最常见的令牌类型是类本身：

```typescript
@Injectable()
export class UserService {
  getUsers() { return ['用户1', '用户2']; }
}

@Component({
  selector: 'app-user-list',
  template: `<div *ngFor="let user of users">{{user}}</div>`
})
export class UserListComponent {
  users: string[];
  
  // UserService类作为令牌
  constructor(private userService: UserService) {
    this.users = userService.getUsers();
  }
}
```

### InjectionToken

当需要注入非类值（如字符串、数字或对象）时，使用`InjectionToken`：

```typescript
// 定义令牌
export const API_URL = new InjectionToken<string>('api.url');

@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com/v1' }
  ]
})
export class AppModule { }

@Injectable()
export class ApiService {
  constructor(@Inject(API_URL) private apiUrl: string) {
    console.log(`API URL: ${apiUrl}`);
  }
}
```

### 字符串令牌

虽然可以使用字符串作为令牌，但不推荐，因为可能导致命名冲突：

```typescript
// 不推荐使用字符串令牌
@NgModule({
  providers: [
    { provide: 'API_URL', useValue: 'https://api.example.com/v1' }
  ]
})
export class AppModule { }

@Injectable()
export class ApiService {
  constructor(@Inject('API_URL') private apiUrl: string) {
    // 使用API URL
  }
}
```

## 提供者类型

Angular的依赖注入系统支持多种类型的提供者，每种类型都有特定的用例。

### useClass

`useClass`提供者告诉注入器通过实例化指定的类来创建依赖值：

```typescript
// 基本使用
@NgModule({
  providers: [
    UserService // 简写，等同于{ provide: UserService, useClass: UserService }
  ]
})
export class AppModule { }

// 替换实现
@NgModule({
  providers: [
    { provide: LoggerService, useClass: ProductionLoggerService }
  ]
})
export class AppModule { }
```

### useValue

`useValue`提供者用于注入固定值，如配置对象、字符串或函数：

```typescript
// 注入配置对象
const SETTINGS = {
  theme: 'dark',
  animationEnabled: true,
  notificationsEnabled: false
};

@NgModule({
  providers: [
    { provide: APP_SETTINGS, useValue: SETTINGS }
  ]
})
export class AppModule { }
```

### useFactory

`useFactory`提供者允许动态创建依赖值，并且可以依赖其他服务：

```typescript
// 工厂函数提供者
function loggerFactory(isDev: boolean) {
  return isDev ? new DebugLogger() : new ProductionLogger();
}

@NgModule({
  providers: [
    {
      provide: LoggerService, 
      useFactory: loggerFactory,
      deps: [IS_DEV_MODE]
    }
  ]
})
export class AppModule { }
```

### useExisting

`useExisting`提供者创建现有服务的别名，允许通过不同的令牌访问同一个服务实例：

```typescript
@NgModule({
  providers: [
    OldService,
    { provide: NewService, useExisting: OldService }
  ]
})
export class AppModule { }
```

## 层级注入器

Angular的依赖注入系统是分层的，遵循组件树的结构。

### 注入器层级

Angular应用中有三个主要的注入器层级：

1. **平台注入器**: 管理平台特定的依赖
2. **根注入器**: 应用级注入器，由`NgModule`或`providedIn: 'root'`创建
3. **组件注入器**: 特定于组件及其子树的服务实例

```
┌───────────────────────────────────┐
│         平台注入器                │
│    Platform Injector               │
│    (platformBrowser)              │
├───────────────────────────────────┤
│         根注入器                  │
│    Root Injector                   │
│    (AppModule/providedIn:'root')  │
├───────────────────────────────────┤
│                                   │
│         ElementInjector树         │
│                                   │
│      ┌─────────────────┐          │
│      │  父组件注入器   │          │
│      └─────────────────┘          │
│              │                    │
│      ┌─────────────────┐          │
│      │  子组件注入器   │          │
│      └─────────────────┘          │
│              │                    │
│      ┌─────────────────┐          │
│      │  孙组件注入器   │          │
│      └─────────────────┘          │
│                                   │
└───────────────────────────────────┘
```
*Angular注入器层级结构*

### 解析规则

当组件请求依赖时，Angular解析规则如下：

1. 检查当前组件的注入器
2. 如果没有找到，检查父组件的注入器
3. 继续向上查找，直到根注入器
4. 如果在根注入器中未找到，检查平台注入器
5. 如果仍未找到，抛出错误

```typescript
@Component({
  selector: 'parent-comp',
  providers: [
    { provide: LogService, useClass: ParentLogService }
  ]
})
export class ParentComponent { }

@Component({
  selector: 'child-comp',
  providers: [] // 没有覆盖父组件的LogService
})
export class ChildComponent {
  constructor(private log: LogService) {
    // 此处注入的是ParentLogService的实例
  }
}

@Component({
  selector: 'override-child',
  providers: [
    { provide: LogService, useClass: ChildLogService }
  ]
})
export class OverrideChildComponent {
  constructor(private log: LogService) {
    // 此处注入的是ChildLogService的实例
  }
}
```

## 高级DI技术

### 多提供者令牌

对于一些场景，可能需要有多个服务实例对应同一个令牌，这可以通过`multi: true`选项实现：

```typescript
// 定义一个多提供者令牌
export const PLUGIN = new InjectionToken<Plugin[]>('app.plugin');

@NgModule({
  providers: [
    { provide: PLUGIN, useClass: AuthPlugin, multi: true },
    { provide: PLUGIN, useClass: LoggerPlugin, multi: true },
    { provide: PLUGIN, useClass: RouterPlugin, multi: true }
  ]
})
export class AppModule { }

@Injectable()
export class PluginManager {
  constructor(@Inject(PLUGIN) private plugins: Plugin[]) {
    // plugins是一个包含AuthPlugin、LoggerPlugin和RouterPlugin实例的数组
    plugins.forEach(plugin => plugin.initialize());
  }
}
```

### 可选依赖

某些情况下，服务可能依赖于可能不存在的服务，可以使用`@Optional()`装饰器标记这些依赖为可选的：

```typescript
@Component({
  selector: 'app-greeting',
  template: `<p>{{message}}</p>`
})
export class GreetingComponent {
  message: string;
  
  constructor(@Optional() private userService: UserService) {
    this.message = userService 
      ? `欢迎, ${userService.getUsername()}!` 
      : '欢迎, 访客!';
  }
}
```

### 自定义注入器

在某些高级场景中，可能需要创建自定义注入器：

```typescript
// 创建自定义注入器
import { Injector } from '@angular/core';

@Component({
  selector: 'app-custom-injector',
  template: `<div>自定义注入器示例</div>`
})
export class CustomInjectorComponent {
  constructor(private injector: Injector) {
    // 创建子注入器
    const childInjector = Injector.create({
      providers: [
        { provide: LogService, useClass: SpecialLogService }
      ],
      parent: this.injector
    });
    
    // 从自定义注入器获取服务
    const logService = childInjector.get(LogService);
    logService.log('从自定义注入器获取服务');
  }
}
```

### 树摇晃优化

为了允许更好的树摇晃(tree-shaking)优化，优先使用`providedIn`而不是module providers数组：

```typescript
// 优化后的写法，支持更好的树摇晃
@Injectable({
  providedIn: 'root'
})
export class OptimizedService { }

// 或者仅在特定模块提供
@Injectable({
  providedIn: FeatureModule
})
export class FeatureOnlyService { }
```

## 性能考虑

### 服务实例化

Angular的注入系统是懒加载的，只有当服务被请求时才会实例化：

```typescript
@Injectable({
  providedIn: 'root'
})
export class LazyLoadedService {
  constructor() {
    console.log('LazyLoadedService初始化');
  }
}

// 只有当某个组件注入LazyLoadedService时，才会打印初始化消息
```

### 单例 vs 多实例

默认情况下，通过`providedIn: 'root'`提供的服务是单例的，但每个组件可以有自己的服务实例：

```typescript
// 全局单例
@Injectable({
  providedIn: 'root'
})
export class SingletonService { }

// 每个组件一个实例
@Component({
  selector: 'app-with-service',
  providers: [
    PerComponentService // 每个组件实例化一个新的PerComponentService
  ]
})
export class WithServiceComponent { }
```

## 最佳实践

### 组织服务

**核心服务**：应用全局使用的单例服务，如身份验证或数据存储：

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 全局单例的身份验证服务
}
```

**特性服务**：仅在特定功能模块中使用的服务：

```typescript
@Injectable({
  providedIn: FeatureModule
})
export class FeatureService {
  // 仅在FeatureModule中可用
}
```

**组件服务**：仅由特定组件及其子组件使用的服务：

```typescript
@Component({
  selector: 'app-dashboard',
  providers: [DashboardService]
})
export class DashboardComponent {
  // DashboardService仅对DashboardComponent及其子组件可用
}
```

### 服务设计原则

1. **单一责任**: 每个服务应该只有一个责任
2. **接口分离**: 提供多个专注的服务，而不是一个大而全的服务
3. **依赖倒置**: 依赖于抽象，而不是具体实现

```typescript
// 设计良好的服务示例
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logService: LogService
  ) {}
  
  getUsers() {
    this.logService.log('获取用户');
    const token = this.authService.getToken();
    return this.http.get('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

### 测试设计

依赖注入使测试变得简单，因为可以轻松模拟依赖：

```typescript
describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  
  beforeEach(() => {
    // 创建服务的spy对象
    const spy = jasmine.createSpyObj('UserService', ['getUsers']);
    
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('应该从服务获取用户', () => {
    userServiceSpy.getUsers.and.returnValue(of(['用户1', '用户2']));
    fixture.detectChanges();
    expect(component.users.length).toBe(2);
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });
});
```

## 依赖注入常见问题

### 循环依赖

循环依赖是指两个或多个服务相互依赖，这可能导致问题：

```typescript
// 循环依赖示例（避免这样做）
@Injectable({
  providedIn: 'root'
})
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable({
  providedIn: 'root'
})
export class ServiceB {
  constructor(private serviceA: ServiceA) {}
}
```

**解决方案**：

1. 重构以消除循环依赖
2. 使用`@Inject(forwardRef(() => Service))`

```typescript
// 使用forwardRef解决循环依赖
@Injectable({
  providedIn: 'root'
})
export class ServiceA {
  constructor(@Inject(forwardRef(() => ServiceB)) private serviceB: ServiceB) {}
}

@Injectable({
  providedIn: 'root'
})
export class ServiceB {
  constructor(private serviceA: ServiceA) {}
}
```

### 没有提供的依赖

当请求一个没有提供的依赖时，Angular会抛出错误：

```
Error: No provider for ServiceX!
```

**解决方案**：

1. 确保服务被正确提供
2. 使用`@Optional()`如果依赖是可选的
3. 检查模块导入，确保包含了必要的模块

### 在服务中使用组件

服务通常不应该依赖于组件，因为这会导致循环依赖和紧耦合：

```typescript
// 避免这种模式
@Injectable({
  providedIn: 'root'
})
export class BadService {
  constructor(private component: SomeComponent) {
    // 这不是好的做法
  }
}
```

**解决方案**：

1. 使用事件或观察者模式从组件通信到服务
2. 重新思考责任分离

## 实践案例

### 身份验证服务示例

一个完整的身份验证服务实现：

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(AUTH_CONFIG) private config: AuthConfig,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // 浏览器环境下从本地存储恢复用户信息
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }
  
  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/auth/login`, { 
      username, password 
    }).pipe(
      map(response => {
        const user: User = {
          id: response.userId,
          username,
          token: response.token,
          roles: response.roles
        };
        
        // 存储用户信息
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }
  
  logout(): void {
    // 清除用户信息
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.roles.includes(role);
  }
  
  getToken(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.token : null;
  }
}

// 配置令牌和接口
export interface AuthConfig {
  apiUrl: string;
  tokenName: string;
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('auth.config');

// 在模块中提供配置
@NgModule({
  providers: [
    {
      provide: AUTH_CONFIG,
      useValue: {
        apiUrl: 'https://api.example.com',
        tokenName: 'jwt_token'
      }
    }
  ]
})
export class AppModule { }
```

### 多租户服务示例

一个支持多租户的服务实现：

```typescript
// 定义租户接口和令牌
export interface Tenant {
  id: string;
  name: string;
  apiUrl: string;
  theme: string;
}

export const CURRENT_TENANT = new InjectionToken<Tenant>('app.current_tenant');

// 工厂提供者创建当前租户
export function tenantFactory(tenantService: TenantService) {
  // 从URL或本地存储确定当前租户
  const tenantId = getCurrentTenantIdFromUrl() || getStoredTenantId();
  return tenantService.getTenantById(tenantId);
}

@NgModule({
  providers: [
    TenantService,
    {
      provide: CURRENT_TENANT,
      useFactory: tenantFactory,
      deps: [TenantService]
    }
  ]
})
export class AppModule { }

// 使用租户信息的API服务
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(@Inject(CURRENT_TENANT) private tenant: Tenant) { }
  
  getUrl(endpoint: string): string {
    return `${this.tenant.apiUrl}/${endpoint}`;
  }
  
  get(endpoint: string): Observable<any> {
    return this.http.get(this.getUrl(endpoint));
  }
  
  // 其他HTTP方法...
}

// 基于租户的主题服务
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(@Inject(CURRENT_TENANT) private tenant: Tenant) {
    this.applyTheme(tenant.theme);
  }
  
  private applyTheme(themeName: string): void {
    // 应用主题逻辑
    document.body.className = `theme-${themeName}`;
  }
}
```

## 总结

Angular的依赖注入系统是框架最强大的特性之一，掌握它可以帮助你构建更灵活、可维护和可测试的应用。关键要点包括：

1. **合理使用提供位置**：根据服务的作用域选择适当的提供位置
2. **遵循最佳实践**：单一责任原则、接口分离原则和依赖倒置原则
3. **利用各种令牌类型**：类令牌、InjectionToken和多提供者
4. **理解注入器层级**：知道Angular如何解析依赖可以避免常见问题
5. **应用性能优化**：使用providedIn语法可以获得更好的树摇晃优化

通过正确应用依赖注入，你可以创建出结构清晰、易于测试和维护的Angular应用。

```
┌────────────────────┐   定义   ┌────────────────────┐
│                    │◄────────│                    │
│    服务类定义      │          │  @Injectable()     │
│                    │          │  装饰器           │
└────────────────────┘          └────────────────────┘
          │
          │ 提供
          ▼
┌────────────────────┐
│     提供者注册     │
│                    │
│  - providedIn      │
│  - NgModule        │
│  - Component       │
└────────────────────┘
          │
          │ 注入
          ▼
┌────────────────────┐   查找   ┌────────────────────┐
│                    │────────▶│                    │
│  组件构造函数      │          │     注入器树       │
│  constructor()     │◄────────│                    │
└────────────────────┘   实例   └────────────────────┘
          │
          │ 使用
          ▼
┌────────────────────┐
│                    │
│   依赖的服务实例   │
│                    │
└────────────────────┘
```
*Angular依赖注入流程图* 