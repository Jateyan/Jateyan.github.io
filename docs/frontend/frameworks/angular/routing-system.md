---
title: Angular路由系统
description: Angular应用中的路由系统指南，包括路由配置、参数传递、子路由设计、路由守卫和预加载策略
head:
  - - meta
    - name: keywords
      content: Angular, 路由, 导航, 路由守卫, 预加载, 参数传递
---
# Angular路由系统

本文档详细介绍了Angular应用中的路由系统，包括路由配置、参数传递、子路由设计、路由守卫以及预加载策略的实现。

## 路由系统概述

Angular的路由系统允许用户在应用的不同视图之间导航，而无需刷新整个页面。这是单页应用(SPA)的核心功能，使应用能够提供类似于多页面应用的用户体验，同时保持单页应用的性能优势。

```
+------------------------+     +-----------------------+     +------------------------+
|                        |     |                       |     |                        |
|  用户点击或程序导航     |---->|  Angular路由器解析URL |---->|  组件加载与视图渲染     |
|  (链接/命令式导航)      |     |  (匹配路由配置)       |     |  (router-outlet)       |
|                        |     |                       |     |                        |
+------------------------+     +-----------------------+     +------------------------+
          |                               |                             |
          v                               v                             v
+------------------------+     +-----------------------+     +------------------------+
|                        |     |                       |     |                        |
|  路由守卫               |     |  路由参数处理         |     |  预加载策略             |
|  (权限/数据验证)        |     |  (URL参数/查询参数)    |     |  (性能优化)            |
|                        |     |                       |     |                        |
+------------------------+     +-----------------------+     +------------------------+
```

## 目录

- [路由配置](#路由配置)
- [参数传递](#参数传递)
- [子路由设计](#子路由设计)
- [路由守卫](#路由守卫)
- [预加载策略](#预加载策略)

## 路由配置

路由配置是Angular路由系统的基础，它定义了URL路径与组件之间的映射关系，以及相关的导航规则。

### 基础路由配置

基础路由配置通常在应用的根模块或专门的路由模块中定义：

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: '首页' }
  },
  {
    path: 'products',
    component: ProductListComponent,
    data: { title: '产品列表' }
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    data: { title: '产品详情' }
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { title: '404' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    scrollPositionRestoration: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**路由配置属性详解**：

| 路由属性 | 说明 | 示例 |
|---------|------|------|
| path | URL路径，对应浏览器地址栏 | 'products', 'users/:id' |
| component | 匹配该路径时加载的组件 | ProductComponent |
| redirectTo | 重定向到其他路由路径 | '/home' |
| pathMatch | 路径匹配策略('full'或'prefix') | 'full' |
| children | 子路由配置数组 | [{path: 'detail', component: DetailComponent}] |
| loadChildren | 延迟加载子模块 | () => import('./products/products.module').then(m => m.ProductsModule) |
| data | 静态数据，可在组件中访问 | { title: '产品页' } |
| resolve | 路由解析器，预加载数据 | { product: ProductResolver } |
| canActivate | 路由守卫，控制路由访问权限 | [AuthGuard] |
| canDeactivate | 路由离开守卫，控制离开路由的条件 | [CanDeactivateGuard] |

**RouterModule.forRoot()配置选项**：

```
+------------------------------------------------------------+
| 常用配置选项                                                |
+------------------------------------------------------------+
| useHash        | 是否使用哈希模式(#)                         |
| enableTracing  | 是否启用路由调试跟踪                        |
| scrollPositionRestoration | 滚动位置恢复策略                 |
| preloadingStrategy | 预加载策略                             |
| onSameUrlNavigation | 相同URL导航策略                       |
| paramsInheritanceStrategy | 参数继承策略                    |
| errorHandler   | 路由错误处理函数                           |
+------------------------------------------------------------+
```

### 路由模块配置

特性模块中的路由配置通常使用forChild方法，这有助于模块化管理路由：

```typescript
// feature-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component: FeatureComponent,
    children: [
      {
        path: 'list',
        component: ListComponent
      },
      {
        path: 'detail/:id',
        component: DetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureRoutingModule { }
```

**forRoot与forChild区别**：

- `forRoot()`: 用于应用的根路由模块，配置主路由器，包含全局服务提供者
- `forChild()`: 用于特性模块中的路由配置，不包含全局服务提供者
- 一个应用中只能有一个`forRoot()`调用，但可以有多个`forChild()`调用

## 参数传递

参数传递是路由系统中至关重要的功能，它允许组件之间共享数据，并根据参数展示不同内容。

### 路由参数传递

路由参数是URL路径的一部分，通常用于标识特定资源：

```typescript
// 路由配置
const routes: Routes = [
  {
    path: 'products/:id',
    component: ProductDetailComponent
  }
];

// 组件实现
@Component({
  selector: 'app-product-detail',
  template: `
    <div *ngIf="product$ | async as product">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<Product>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.productService.getProduct(id);
      })
    );
  }
}
```

**路由参数处理方式对比**：

```
+--------------------------------------------+
| 参数访问方式         | 特点                 |
+--------------------+----------------------+
| route.snapshot.params | 静态访问，仅获取一次 |
| route.params       | 动态订阅，参数变化时更新 |
| route.snapshot.paramMap | 类型安全的静态访问 |
| route.paramMap     | 类型安全的动态订阅     |
+--------------------------------------------+
```

**使用paramMap的优势**：

1. **类型安全**：提供了get()、getAll()、has()等类型安全的方法
2. **空值处理**：内置处理参数不存在的情况
3. **多值支持**：可以处理同名的多个参数值

### 查询参数处理

查询参数通常出现在URL的?后面，用于筛选、排序或分页等操作：

```typescript
// 组件实现
@Component({
  selector: 'app-product-list',
  template: `
    <div class="filters">
      <input [(ngModel)]="searchTerm" (input)="updateSearch()">
      <select [(ngModel)]="sortBy" (change)="updateSort()">
        <option value="name">名称</option>
        <option value="price">价格</option>
      </select>
    </div>
    <div class="products">
      <div *ngFor="let product of products$ | async">
        {{ product.name }}
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  searchTerm: string = '';
  sortBy: string = 'name';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.products$ = this.route.queryParams.pipe(
      switchMap(params => {
        return this.productService.getProducts({
          search: params['search'] || '',
          sort: params['sort'] || 'name'
        });
      })
    );
  }

  updateSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge'
    });
  }

  updateSort(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: this.sortBy },
      queryParamsHandling: 'merge'
    });
  }
}
```

**queryParamsHandling选项**：

| 选项 | 说明 | 使用场景 |
|------|------|---------|
| 'merge' | 合并新参数与现有参数 | 更新部分筛选条件时保留其他条件 |
| 'preserve' | 保留现有参数，忽略新参数 | 导航时保留当前所有查询参数 |
| (默认) | 替换所有参数 | 完全重置筛选条件 |

**查询参数与路由参数比较**：

```
+-----------------------------------------------+
| 特性          | 路由参数              | 查询参数        |
+---------------+----------------------+---------------+
| URL位置       | 路径的一部分          | ?后面的键值对   |
| 适用场景      | 标识资源              | 过滤、排序、分页 |
| 必要性        | 通常是必需的          | 通常是可选的    |
| 访问方式      | paramMap             | queryParamMap |
| 持久化        | 通常需要显式保存      | 可以在URL中保留 |
+-----------------------------------------------+
```

## 子路由设计

子路由允许构建嵌套的UI结构，非常适合复杂的应用布局和多层级导航系统。

### 子路由配置

子路由通过在父路由的`children`属性中定义：

```typescript
// 父路由配置
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'users',
        component: UserListComponent
      },
      {
        path: 'roles',
        component: RoleListComponent
      },
      {
        path: '',
        redirectTo: 'users'
      }
    ]
  }
];

// 父组件模板
@Component({
  selector: 'app-admin',
  template: `
    <div class="admin-layout">
      <nav class="sidebar">
        <a routerLink="users" routerLinkActive="active">用户管理</a>
        <a routerLink="roles" routerLinkActive="active">角色管理</a>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 200px;
      padding: 20px;
      background: #f5f5f5;
    }
    .content {
      flex: 1;
      padding: 20px;
    }
    .active {
      color: blue;
      font-weight: bold;
    }
  `]
})
export class AdminComponent {}
```

**子路由工作原理**：

```
+---------------------------------------+
| 浏览器URL: /admin/users               |
+---------------------------------------+
         |
         v
+---------------------------------------+
| 匹配主路由: { path: 'admin', ... }    |
| 加载组件: AdminComponent              |
+---------------------------------------+
         |
         v
+---------------------------------------+
| 渲染AdminComponent                    |
| 包含<router-outlet>占位符             |
+---------------------------------------+
```

**子路由的优势**：

1. **模块化UI**：将相关功能组织在同一布局中
2. **共享布局**：子路由共享父组件的布局元素(如导航菜单、页眉页脚)
3. **层级导航**：支持多级导航结构
4. **独立工作区**：每个功能在独立的工作区中运行

## 路由守卫

路由守卫是一种控制路由访问的机制，可以基于用户权限、数据加载状态等条件决定是否允许导航。

### 认证守卫

认证守卫用于保护需要用户登录才能访问的路由：

```typescript
// 认证守卫
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
        }
        return isAuthenticated;
      })
    );
  }
}

// 路由配置
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'users',
        component: UserListComponent
      }
    ]
  }
];
```

**路由守卫类型**：

```
+--------------------------------------------------------------+
| 守卫类型                | 接口                 | 用途          |
+-------------------------+----------------------+--------------+
| 激活守卫                | CanActivate          | 控制是否可以访问路由 |
| 子路由激活守卫           | CanActivateChild     | 控制是否可以访问子路由 |
| 离开守卫                | CanDeactivate        | 控制是否可以离开当前路由 |
| 加载守卫                | CanLoad              | 控制是否可以加载延迟加载模块 |
| 数据解析器              | Resolve              | 在激活路由前预加载数据 |
+--------------------------------------------------------------+
```

**认证守卫流程**：

```
+---------------------+     +---------------------+
| 用户请求受保护路由    |---->| 检查用户是否已认证   |
+---------------------+     +---------+-----------+
                                      |
            +----------------------+  |
            |                      |  |
            v                      v  v
+---------------------+     +---------------------+
| 导航到登录页面       |<----+ 认证状态:           |
| 存储原始请求URL      |     | true/false         |
+---------------------+     +---------------------+
            |                        |
            |                        v
            |              +---------------------+
            |              | 允许导航到请求路由   |
            |              +---------------------+
            v
+---------------------+
| 用户登录后重定向     |
| 到原始请求URL       |
+---------------------+
```

### 数据预加载守卫

数据预加载守卫(Resolver)在路由激活前加载组件所需的数据，避免组件显示加载状态：

```typescript
// 数据预加载守卫
@Injectable({ providedIn: 'root' })
export class DataPreloadGuard implements Resolve<Product> {
  constructor(private productService: ProductService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Product> {
    const id = route.paramMap.get('id');
    return this.productService.getProduct(id);
  }
}

// 路由配置
const routes: Routes = [
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    resolve: {
      product: DataPreloadGuard
    }
  }
];

// 组件实现
@Component({
  selector: 'app-product-detail',
  template: `
    <div *ngIf="product">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.product = this.route.snapshot.data['product'];
  }
}
```

**数据预加载与组件内加载对比**：

| 特性 | 数据预加载(Resolver) | 组件内加载 |
|------|---------------------|-----------|
| 加载时机 | 组件激活前 | 组件初始化后 |
| 用户体验 | 无加载状态，数据直接可用 | 通常需要显示加载指示器 |
| 错误处理 | 集中在解析器中处理 | 分散在各个组件中 |
| 代码组织 | 数据加载逻辑与组件分离 | 数据加载逻辑在组件中 |
| 适用场景 | 数据是组件渲染的必要条件 | 数据非必需或可分批加载 |

**预加载守卫工作流程**：

```
+---------------------+     +---------------------+     +---------------------+
| 用户请求路由         |---->| 解析器(Resolver)    |---->| 数据加载成功        |
+---------------------+     | 开始加载数据        |     +----------+----------+
                            +---------------------+                |
                                      |                           |
                                      v                           v
                            +---------------------+     +---------------------+
                            | 数据加载失败        |     | 激活路由            |
                            | (可选导航到错误页)   |     | 数据可通过route.data|
                            +---------------------+     | 直接访问            |
                                                       +---------------------+
```

## 预加载策略

预加载策略是一种优化技术，允许在应用空闲时预先加载延迟加载的模块，提高后续导航的响应速度。

### 自定义预加载策略

自定义预加载策略通过实现PreloadingStrategy接口来控制哪些模块应该被预加载：

```typescript
// 自定义预加载策略
@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadAllModules {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.['preload'] === false) {
      return of(null);
    }
    return load();
  }
}

// 路由配置
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: { preload: true }
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
    data: { preload: false }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: CustomPreloadingStrategy
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**预加载策略类型**：

```
+----------------------------------------------------+
| 预加载策略         | 行为                          |
+--------------------+-------------------------------+
| NoPreloading       | 不预加载任何模块(默认)         |
| PreloadAllModules  | 预加载所有延迟加载模块         |
| 自定义策略         | 基于特定条件选择性预加载模块   |
+----------------------------------------------------+
```

**常见预加载策略实现**：

1. **基于路由数据**：根据路由中的data属性决定是否预加载
2. **基于网络状态**：仅在WiFi连接时预加载
3. **基于用户交互**：用户hover时预加载相关模块
4. **基于优先级**：按优先级顺序预加载模块
5. **智能预加载**：分析用户行为模式预测可能的导航

### 路由事件监听

路由事件监听允许跟踪路由导航的整个生命周期，对于分析、调试和优化路由非常有用：

```typescript
// 路由事件监听服务
@Injectable({ providedIn: 'root' })
export class RouteEventService {
  constructor(private router: Router) {
    this.setupRouteEvents();
  }

  private setupRouteEvents(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('路由导航完成:', event.url);
      // 更新页面标题
      this.updatePageTitle(event);
      // 发送分析事件
      this.sendAnalytics(event);
    });
  }

  private updatePageTitle(event: NavigationEnd): void {
    const route = this.router.routerState.root;
    route.data.subscribe(data => {
      if (data['title']) {
        document.title = `${data['title']} - 应用名称`;
      }
    });
  }

  private sendAnalytics(event: NavigationEnd): void {
    // 发送页面访问统计
    console.log('发送分析事件:', event.url);
  }
}
```

**主要路由事件类型**：

```
+--------------------------------------------------------+
| 事件类型              | 触发时机                        |
+-----------------------+--------------------------------+
| NavigationStart       | 导航开始                        |
| RouteConfigLoadStart  | 开始加载延迟加载路由配置         |
| RouteConfigLoadEnd    | 完成加载延迟加载路由配置         |
| RoutesRecognized      | 路由匹配完成                    |
| GuardsCheckStart      | 开始检查路由守卫                |
| GuardsCheckEnd        | 完成检查路由守卫                |
| ResolveStart          | 开始解析路由数据                |
| ResolveEnd            | 完成解析路由数据                |
| NavigationEnd         | 导航成功完成                    |
| NavigationCancel      | 导航被取消                      |
| NavigationError       | 导航过程中发生错误              |
+--------------------------------------------------------+
```

**路由事件应用场景**：

1. **页面标题更新**：根据路由数据动态更新页面标题
2. **分析跟踪**：记录用户导航模式和页面访问数据
3. **加载指示器**：在导航开始时显示，完成时隐藏
4. **权限审计**：记录权限检查和访问尝试
5. **性能监控**：测量路由导航的各个阶段耗时

## 最佳实践总结

1. **路由配置**
   - 使用模块化路由配置
   - 实现路由数据传递
   - 配置通配符路由
   - 优化路由性能

2. **参数处理**
   - 使用参数订阅
   - 处理查询参数
   - 实现参数验证
   - 优化参数更新

3. **子路由设计**
   - 合理组织路由层级
   - 实现路由出口
   - 处理默认路由
   - 优化导航体验

4. **路由守卫**
   - 实现认证保护
   - 数据预加载
   - 权限控制
   - 导航控制

5. **预加载策略**
   - 自定义预加载规则
   - 优化加载性能
   - 实现按需加载
   - 监控加载状态

## 相关资源

- [Angular路由文档](https://angular.io/guide/router)
- [路由最佳实践](https://angular.io/guide/router-tutorial)
- [路由守卫指南](https://angular.io/guide/router-tutorial-toh#milestone-5-route-guards)
- [预加载策略](https://angular.io/guide/router-tutorial-toh#milestone-6-asynchronous-routing) 