# 模块系统(NgModules)

Angular的模块系统是框架的核心组织机制，用于组织应用代码并提供编译上下文。本文档详细介绍NgModules的核心概念与应用实践。

## 目录

- [应用的模块化架构](#应用的模块化架构)
- [特性模块设计](#特性模块设计)
- [共享模块与核心模块](#共享模块与核心模块)
- [模块懒加载策略](#模块懒加载策略)

## 应用的模块化架构

NgModule是Angular应用的基础构建块，为组件、指令、管道和服务提供编译上下文。每个Angular应用都至少有一个根模块（通常命名为AppModule），用于引导应用启动。

### 模块的基本结构

NgModule由`@NgModule`装饰器定义，包含以下主要元数据：

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  // declarations：声明属于该模块的组件、指令和管道
  declarations: [AppComponent],
  
  // imports：导入其他模块，以便使用它们导出的声明
  imports: [BrowserModule],
  
  // exports：导出declarations中的部分声明，使导入本模块的其他模块可以使用
  exports: [],
  
  // providers：向依赖注入系统注册服务提供者
  providers: [],
  
  // bootstrap：定义应用的根组件，仅根模块需要设置
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 模块的职责

Angular模块系统鼓励关注点分离和模块化设计：

1. **根模块(AppModule)**：
   - 引导应用启动
   - 导入必要的浏览器模块
   - 声明全局组件
   - 配置全局服务

2. **功能模块**：
   - 围绕特定功能或业务领域组织代码
   - 促进代码复用
   - 实现按需加载

3. **共享模块**：
   - 提供可在多个功能模块中重用的组件和指令
   - 重新导出常用的Angular模块

4. **核心模块**：
   - 配置应用级服务
   - 提供单例服务和全局组件

### 模块解析

Angular使用分层注入器系统，模块导入形成一个依赖图：

```typescript
// 主模块
@NgModule({
  imports: [FeatureModuleA, FeatureModuleB], // 导入特性模块
  // ...
})
export class MainModule { }

// 特性模块A
@NgModule({
  imports: [SharedModule], // 依赖共享模块
  // ...
})
export class FeatureModuleA { }

// 特性模块B
@NgModule({
  imports: [SharedModule], // 也依赖共享模块
  // ...
})
export class FeatureModuleB { }
```

> **最佳实践**：保持模块的清晰边界，避免循环依赖，每个模块应该有明确的单一职责。

## 特性模块设计

特性模块是围绕特定功能或业务领域组织的代码集合，有助于保持应用结构清晰并支持懒加载优化。

### 特性模块的类型

Angular应用中可以设计多种类型的特性模块：

1. **领域特性模块**：
   - 围绕业务领域建立，如用户管理、订单处理等
   - 通常包含完整的视图组件、服务和模型

2. **路由特性模块**：
   - 配置自己的子路由
   - 专为懒加载设计
   - 通常与领域特性模块结合使用

3. **工具特性模块**：
   - 提供公共服务和功能
   - 不包含视图组件
   - 例如HTTP拦截器模块、认证模块等

4. **小部件特性模块**：
   - 提供可重用的UI组件
   - 专注于特定的UI功能
   - 例如日历组件、数据表格模块等

### 特性模块示例

```typescript
// users.module.ts - 用户管理特性模块
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserService } from './services/user.service';

@NgModule({
  // 声明该模块特有的组件
  declarations: [
    UserListComponent,
    UserDetailComponent,
    UserFormComponent
  ],
  // 导入所需的Angular模块和自定义模块
  imports: [
    CommonModule, // 提供ngIf、ngFor等常用指令
    ReactiveFormsModule, // 表单支持
    UsersRoutingModule // 用户模块的路由配置
  ],
  // 向依赖注入系统注册服务
  providers: [UserService],
  // 可选：导出部分组件供外部使用
  exports: [UserFormComponent]
})
export class UsersModule { }
```

### 特性模块路由配置

```typescript
// users-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '', // 特性模块的基础路径
    component: UserListComponent,
    canActivate: [AuthGuard] // 使用路由守卫控制访问
  },
  {
    path: ':id', // 用户详情路由
    component: UserDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // 注意使用forChild而非forRoot
  exports: [RouterModule]
})
export class UsersRoutingModule { }
```

> **最佳实践**：为每个特性模块创建单独的路由模块，使用`RouterModule.forChild()`方法配置子路由，确保路由与相应的功能紧密耦合。

## 共享模块与核心模块

在Angular应用中，共享模块和核心模块承担不同的职责，帮助组织代码和避免重复。

### 共享模块(SharedModule)

共享模块用于存放多个特性模块中重复使用的组件、指令和管道。它通常不提供服务，仅包含可重用的声明和重新导出常用模块。

```typescript
// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 自定义组件
import { LoadingSpinnerComponent } from './components/loading-spinner.component';
import { PageHeaderComponent } from './components/page-header.component';

// 自定义指令
import { HighlightDirective } from './directives/highlight.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';

// 自定义管道
import { FileSizePipe } from './pipes/file-size.pipe';

@NgModule({
  declarations: [
    // 组件
    LoadingSpinnerComponent,
    PageHeaderComponent,
    // 指令
    HighlightDirective,
    ClickOutsideDirective,
    // 管道
    FileSizePipe
  ],
  imports: [
    // 导入基础模块
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    // 重新导出Angular模块
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // 导出自定义组件、指令和管道
    LoadingSpinnerComponent,
    PageHeaderComponent,
    HighlightDirective,
    ClickOutsideDirective,
    FileSizePipe
  ]
})
export class SharedModule { }
```

共享模块的主要原则：
- 不包含服务提供者（避免多实例问题）
- 如需提供服务，应使用`forRoot()`模式
- 专注于可重用的UI元素

### 核心模块(CoreModule)

核心模块用于配置应用级服务和单例组件，如导航栏、页脚等。它应该只被AppModule导入一次。

```typescript
// core.module.ts
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// 全局组件
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';

// 应用级服务
import { AuthService } from './services/auth.service';
import { LoggingService } from './services/logging.service';

// HTTP拦截器
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  exports: [
    // 导出全局组件
    NavbarComponent,
    FooterComponent
  ],
  providers: [
    // 全局服务
    AuthService,
    LoggingService,
    // HTTP拦截器配置
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})
export class CoreModule {
  // 防止CoreModule被多次导入
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule已在AppModule中导入，不应重复导入！');
    }
  }
  
  // 可选：提供静态forRoot方法配置服务
  static forRoot() {
    return {
      ngModule: CoreModule,
      providers: [
        // 配置服务...
      ]
    };
  }
}
```

核心模块的主要原则：
- 只应被AppModule导入一次
- 包含应用级单例服务
- 包含全局组件，如导航栏
- 避免被其他特性模块直接依赖

> **最佳实践**：使用构造函数守卫防止CoreModule被多次导入，确保服务的单例性。

## 模块懒加载策略

懒加载是一种优化技术，允许按需加载应用程序的某些部分，而不是在初始加载时加载所有代码。这种方法可以显著减少应用的初始加载时间。

### 配置懒加载路由

在Angular中，懒加载是通过路由配置实现的：

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './shared/components/page-not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  
  // 懒加载用户模块
  { 
    path: 'users', 
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    // 可选：使用路由守卫控制访问
    canLoad: [AuthGuard]
  },
  
  // 懒加载产品模块
  { 
    path: 'products', 
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule) 
  },
  
  // 懒加载管理模块
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canLoad: [AdminGuard] // 管理员访问控制
  },
  
  // 通配符路由应放在最后
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // 预加载策略：可选配置
      preloadingStrategy: PreloadAllModules,
      // 其他配置选项...
      initialNavigation: 'enabledBlocking',
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 预加载策略

Angular提供多种预加载策略，平衡初始加载时间和后续导航体验：

1. **NoPreloading**（默认）：不预加载任何模块
2. **PreloadAllModules**：在初始导航完成后预加载所有懒加载模块
3. **自定义预加载策略**：根据特定条件选择性预加载

```typescript
// selective-preload.strategy.ts - 自定义预加载策略
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // 只预加载标记了preload=true的路由
    return route.data && route.data['preload'] ? load() : of(null);
  }
}

// 在路由配置中使用
const routes: Routes = [
  {
    path: 'frequently-used',
    loadChildren: () => import('./frequently-used/frequently-used.module').then(m => m.FrequentlyUsedModule),
    data: { preload: true } // 标记为预加载
  },
  {
    path: 'rarely-used',
    loadChildren: () => import('./rarely-used/rarely-used.module').then(m => m.RarelyUsedModule)
    // 不标记，不会预加载
  }
];

// 在AppRoutingModule中配置
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: SelectivePreloadStrategy
    })
  ],
  // ...
})
export class AppRoutingModule { }
```

### 懒加载的性能优势

懒加载特性模块带来多方面性能提升：

1. **减小初始包体积**：初始加载时只加载必要代码
2. **减少启动时间**：更快的首次内容绘制
3. **按需加载**：仅加载用户实际访问的功能
4. **更好的资源利用**：减少内存消耗和解析时间

### 懒加载的注意事项

实施懒加载策略时需注意：

1. **避免模块间的循环依赖**
2. **不在共享模块中提供服务**
3. **合理划分模块边界**，避免过度细分
4. **使用路由守卫控制访问权限**
5. **合理配置预加载策略**，平衡用户体验

> **最佳实践**：对于中大型应用，应默认使用懒加载架构；为常用功能配置预加载；使用性能监控工具评估懒加载效果。

---

通过合理设计模块系统，Angular应用可以实现更好的代码组织、团队协作和性能优化。遵循上述最佳实践，将帮助开发者构建高可维护性、高性能的企业级应用。 