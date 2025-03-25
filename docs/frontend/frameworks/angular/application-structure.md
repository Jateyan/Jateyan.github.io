---
title: Angular应用结构最佳实践
description: Angular企业级应用的结构设计指南，包括模块划分原则、代码组织、文件命名约定和核心设施搭建
head:
  - - meta
    - name: keywords
      content: Angular, 应用结构, 模块划分, 代码组织, 命名规范, 核心设施
---
# Angular应用结构最佳实践

在构建企业级Angular应用时，良好的项目结构和代码组织是确保应用可维护性、可扩展性和协作效率的关键。本文档详细介绍了Angular企业级应用的结构设计最佳实践，包括模块划分原则、代码组织方式、文件命名约定以及核心设施的搭建方法。

通过遵循这些最佳实践，您将能够：

- 构建具有清晰结构的大型应用
- 提高团队协作效率
- 减少技术债务
- 简化应用维护和扩展
- 优化应用性能
- 提高代码质量和可测试性

## 目录

- [模块划分原则](#模块划分原则)
- [代码组织](#代码组织)
- [文件命名约定](#文件命名约定)
- [核心设施搭建](#核心设施搭建)
- [最佳实践总结](#最佳实践总结)
- [相关资源](#相关资源)

## 模块划分原则

Angular的模块化系统(NgModules)是应用结构的基础。合理的模块划分能够提高代码的可维护性、可复用性和加载性能。

### 模块类型划分

在企业级应用中，通常将Angular模块分为四种主要类型：

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|   AppModule       |---->|   CoreModule     |     |   SharedModule    |
|   (根模块)         |     |   (核心模块)      |     |   (共享模块)      |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
         |                                                   |
         |                                                   |
         v                                                   v
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|   FeatureModule1  |---->|   FeatureModule2  |---->|   FeatureModule3  |
|   (特性模块1)      |     |   (特性模块2)      |     |   (特性模块3)      |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +-------------------+
```

1. **根模块 (AppModule)**：
   - 应用的入口模块，负责引导应用
   - 导入所有必要的模块并配置全局提供者
   - 通常较小，仅包含基本的启动组件

2. **核心模块 (CoreModule)**：
   - 包含应用级的单例服务
   - 只应被AppModule导入一次
   - 包含全局组件、拦截器和守卫
   - 提供整个应用共享的功能

3. **共享模块 (SharedModule)**：
   - 包含可重用的组件、指令和管道
   - 可被多个特性模块导入
   - 不包含服务（除非使用`providedIn: 'root'`）
   - 导出所有需要共享的元素

4. **特性模块 (FeatureModule)**：
   - 聚焦于特定业务功能
   - 通常与路由配合实现懒加载
   - 导入所需的SharedModule
   - 不污染全局命名空间

下面是这些模块的具体实现示例：

#### 核心模块示例

```typescript
// core/core.module.ts
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// 导入核心服务
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { ErrorHandlerService } from './services/error-handler.service';

// 导入拦截器
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// 导入全局组件
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // 全局服务
    AuthService,
    ApiService,
    ErrorHandlerService,
    // 拦截器
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  exports: [
    // 导出全局使用的组件
    HeaderComponent,
    FooterComponent
  ]
})
export class CoreModule {
  // 防止CoreModule被多次导入
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule已被导入。CoreModule只应在AppModule中导入一次。');
    }
  }
}
```

核心模块应仅在AppModule中导入一次，确保应用中服务的单例性。构造函数中的防重复导入逻辑是一种常见的防御性编程技术。

#### 共享模块示例

```typescript
// shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material设计模块
import { MaterialModule } from './material.module';

// 共享组件
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { InputComponent } from './components/input/input.component';

// 共享指令
import { HighlightDirective } from './directives/highlight.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';

// 共享管道
import { FileSizePipe } from './pipes/file-size.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

const COMPONENTS = [
  ButtonComponent,
  CardComponent,
  InputComponent
];

const DIRECTIVES = [
  HighlightDirective,
  ClickOutsideDirective
];

const PIPES = [
  FileSizePipe,
  TimeAgoPipe
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    // 导出Angular通用模块
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    // 导出自定义元素
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ]
})
export class SharedModule { }
```

共享模块通常不提供服务，而是聚焦于导出可复用的组件、指令和管道。这种方式确保了组件的可重用性，同时避免服务被多次实例化。

#### 特性模块示例

```typescript
// features/products/products.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProductsRoutingModule } from './products-routing.module';

// 状态管理
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { productReducer } from './store/reducers';
import { ProductEffects } from './store/effects';

// 组件
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';

// 服务
import { ProductService } from './services/product.service';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ProductFormComponent,
    ProductFilterComponent
  ],
  imports: [
    SharedModule,
    ProductsRoutingModule,
    StoreModule.forFeature('products', productReducer),
    EffectsModule.forFeature([ProductEffects])
  ],
  providers: [
    // 特性级别的服务
    ProductService
  ]
})
export class ProductsModule { }
```

```typescript
// features/products/products-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

import { ProductDetailResolver } from './resolvers/product-detail.resolver';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'new',
    component: ProductFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: ProductDetailComponent,
    resolve: {
      product: ProductDetailResolver
    }
  },
  {
    path: ':id/edit',
    component: ProductFormComponent,
    canActivate: [AuthGuard],
    resolve: {
      product: ProductDetailResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
```

特性模块是实现功能模块化的核心。每个特性模块都应该聚焦于一个特定业务功能，并配合路由实现懒加载，以优化应用性能。

### 模块依赖关系

模块之间的依赖关系决定了应用的结构和加载性能。正确的依赖关系可以防止循环依赖和重复导入。

以下是一个典型的模块依赖图：

```
           +------------+
           |            |
           | AppModule  |
           |            |
           +-----+------+
                 |
       +---------+---------+
       |                   |
+------v------+    +------v------+
|             |    |             |
| CoreModule  |    | SharedModule|
|             |    |             |
+-------------+    +------+------+
                          |
                 +--------v---------+
                 |                  |
          +------v------+    +------v------+
          |             |    |             |
          | Feature1    |    | Feature2    |
          | Module      |    | Module      |
          |             |    |             |
          +-------------+    +-------------+
```

#### 根模块配置

```typescript
// app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';

// 状态管理根配置
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers, metaReducers } from './store';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular基础模块
    BrowserModule,
    BrowserAnimationsModule,
    
    // 核心模块和路由模块
    CoreModule,
    AppRoutingModule,
    
    // 共享模块
    SharedModule,
    
    // 状态管理配置
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 根路由配置

```typescript
// app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'customers',
    loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule)
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // 预加载策略
      preloadingStrategy: PreloadAllModules,
      // 启用路由跟踪
      enableTracing: !environment.production
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

这种模块组织方式有以下优势：

1. **关注点分离**：每个模块都有明确的职责和边界
2. **懒加载支持**：特性模块可以通过路由懒加载，提高初始加载性能
3. **可维护性**：功能相关的代码聚集在一起，便于维护和扩展
4. **团队协作**：不同团队可以专注于不同的特性模块
5. **测试隔离**：模块边界清晰，便于单元测试和集成测试

通过遵循这些模块划分原则，您可以构建出结构清晰、易于维护和扩展的Angular企业级应用。

## 代码组织

良好的代码组织是保证项目可维护性和可扩展性的关键。Angular应用的代码组织应遵循"关注点分离"和"功能凝聚"原则，使代码结构清晰，便于团队协作和维护。

### 目录结构

企业级Angular应用的目录结构应该清晰地反映应用的模块化架构。以下是一个推荐的目录结构：

```
src/
├── app/                   # 应用代码
│   ├── core/              # 核心功能
│   │   ├── guards/        # 路由守卫
│   │   ├── interceptors/  # HTTP拦截器
│   │   ├── services/      # 核心服务
│   │   ├── models/        # 核心模型
│   │   └── core.module.ts # 核心模块定义
│   │
│   ├── shared/            # 共享功能
│   │   ├── components/    # 共享组件
│   │   ├── directives/    # 共享指令
│   │   ├── pipes/         # 共享管道
│   │   ├── utils/         # 工具函数
│   │   └── shared.module.ts # 共享模块定义
│   │
│   ├── features/          # 特性模块
│   │   ├── auth/          # 认证模块
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── auth-routing.module.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── products/      # 产品模块
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── store/
│   │   │   ├── products-routing.module.ts
│   │   │   └── products.module.ts
│   │   │
│   │   └── orders/        # 订单模块
│   │       ├── components/
│   │       ├── services/
│   │       ├── models/
│   │       ├── store/
│   │       ├── orders-routing.module.ts
│   │       └── orders.module.ts
│   │
│   ├── layout/            # 布局组件
│   │   ├── header/
│   │   ├── footer/
│   │   ├── sidebar/
│   │   └── layout.module.ts
│   │
│   ├── store/             # 全局状态管理
│   │   ├── actions/
│   │   ├── reducers/
│   │   ├── effects/
│   │   └── selectors/
│   │
│   ├── app-routing.module.ts  # 应用路由配置
│   ├── app.component.ts       # 应用根组件
│   └── app.module.ts          # 应用根模块
│
├── assets/                # 静态资源
│   ├── images/            # 图片资源
│   ├── fonts/             # 字体资源
│   ├── styles/            # 全局样式
│   │   ├── variables.scss  # 样式变量
│   │   ├── mixins.scss     # 样式混合
│   │   └── themes/         # 主题文件
│   │
│   └── i18n/              # 国际化文件
│
├── environments/          # 环境配置
│   ├── environment.ts     # 开发环境配置
│   └── environment.prod.ts # 生产环境配置
│
├── styles.scss            # 全局样式入口
├── main.ts                # 应用入口
├── index.html             # 主HTML文件
├── polyfills.ts           # 兼容性代码
└── test.ts                # 测试入口
```

这种目录结构有以下优点：

1. **层次分明**：清晰地反映了应用的模块化结构
2. **关注点分离**：各种类型的代码文件被组织到相应的目录中
3. **模块自治**：每个功能模块包含自己的组件、服务、模型等
4. **统一规范**：所有模块遵循相同的目录结构规范
5. **可扩展性**：新增功能模块时可以遵循现有模式
6. **易于导航**：开发人员可以快速找到所需的代码文件

### 特性模块组织

特性模块是实现业务功能的主要单元，每个特性模块应该是自包含的，拥有自己的组件、服务、模型和路由。以下是一个产品模块的详细组织结构：

```
features/
└── products/
    ├── components/              # 组件目录
    │   ├── product-list/        # 产品列表组件
    │   │   ├── product-list.component.ts
    │   │   ├── product-list.component.html
    │   │   └── product-list.component.scss
    │   │
    │   ├── product-detail/      # 产品详情组件
    │   │   ├── product-detail.component.ts
    │   │   ├── product-detail.component.html
    │   │   └── product-detail.component.scss
    │   │
    │   ├── product-form/        # 产品表单组件
    │   │   ├── product-form.component.ts
    │   │   ├── product-form.component.html
    │   │   └── product-form.component.scss
    │   │
    │   └── product-filter/      # 产品过滤组件
    │       ├── product-filter.component.ts
    │       ├── product-filter.component.html
    │       └── product-filter.component.scss
    │
    ├── services/                # 服务目录
    │   ├── product.service.ts   # 产品数据服务
    │   └── product-cache.service.ts # 产品缓存服务
    │
    ├── models/                  # 模型目录
    │   ├── product.model.ts     # 产品数据模型
    │   ├── product-filter.model.ts # 过滤器模型
    │   └── product-category.enum.ts # 产品类别枚举
    │
    ├── store/                   # 状态管理
    │   ├── actions/             # 动作定义
    │   │   └── product.actions.ts
    │   ├── reducers/            # 状态归约器
    │   │   ├── product.reducer.ts
    │   │   └── index.ts
    │   ├── effects/             # 副作用处理
    │   │   └── product.effects.ts
    │   └── selectors/           # 状态选择器
    │       └── product.selectors.ts
    │
    ├── guards/                  # 路由守卫
    │   └── product-data.guard.ts
    │
    ├── directives/              # 特有指令
    │   └── product-image.directive.ts
    │
    ├── pipes/                   # 特有管道
    │   └── product-price.pipe.ts
    │
    ├── products-routing.module.ts # 路由配置
    └── products.module.ts        # 模块定义
```

#### 组件划分示例

在特性模块中，组件应该按照功能进行划分，每个组件负责特定的UI交互和数据展示。

例如，产品列表组件的实现：

```typescript
// features/products/components/product-list/product-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ProductState } from '../../store/reducers';
import { selectAllProducts, selectProductsLoading } from '../../store/selectors/product.selectors';
import { loadProducts, deleteProduct } from '../../store/actions/product.actions';
import { Product } from '../../models/product.model';
import { ProductFilter } from '../../models/product-filter.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  currentFilter: ProductFilter = { category: null, searchTerm: '' };

  constructor(private store: Store<ProductState>) {
    this.products$ = this.store.select(selectAllProducts);
    this.loading$ = this.store.select(selectProductsLoading);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.store.dispatch(loadProducts({ filter: this.currentFilter }));
  }

  onFilterChange(filter: ProductFilter): void {
    this.currentFilter = filter;
    this.loadProducts();
  }

  onDeleteProduct(productId: string): void {
    if (confirm('确定要删除此产品吗？')) {
      this.store.dispatch(deleteProduct({ id: productId }));
    }
  }
}
```

对应的模板：

```html
<!-- features/products/components/product-list/product-list.component.html -->
<div class="product-list-container">
  <div class="product-list-header">
    <h1>产品管理</h1>
    <button routerLink="/products/new" class="add-button">添加产品</button>
  </div>

  <app-product-filter 
    [filter]="currentFilter" 
    (filterChange)="onFilterChange($event)">
  </app-product-filter>

  <div *ngIf="loading$ | async" class="loading-spinner">
    <mat-spinner diameter="50"></mat-spinner>
  </div>

  <div *ngIf="(products$ | async)?.length === 0 && !(loading$ | async)" class="no-products">
    没有找到匹配的产品
  </div>

  <div class="product-grid" *ngIf="!(loading$ | async)">
    <mat-card *ngFor="let product of products$ | async" class="product-card">
      <mat-card-header>
        <mat-card-title>{{ product.name }}</mat-card-title>
        <mat-card-subtitle>{{ product.category }}</mat-card-subtitle>
      </mat-card-header>
      
      <img mat-card-image [src]="product.imageUrl" alt="{{ product.name }}">
      
      <mat-card-content>
        <p>{{ product.description | slice:0:100 }}...</p>
        <p class="price">{{ product.price | currency:'CNY' }}</p>
      </mat-card-content>
      
      <mat-card-actions>
        <button mat-button [routerLink]="['/products', product.id]">查看</button>
        <button mat-button [routerLink]="['/products', product.id, 'edit']">编辑</button>
        <button mat-button color="warn" (click)="onDeleteProduct(product.id)">删除</button>
      </mat-card-actions>
    </mat-card>
  </div>
</div>
```

样式文件：

```scss
/* features/products/components/product-list/product-list.component.scss */
.product-list-container {
  padding: 20px;

  .product-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
    }

    .add-button {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: #45a049;
      }
    }
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    margin: 50px 0;
  }

  .no-products {
    text-align: center;
    margin: 50px 0;
    color: #757575;
    font-size: 18px;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .product-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    mat-card-content {
      flex-grow: 1;
    }

    .price {
      font-weight: bold;
      color: #e91e63;
      font-size: 1.2em;
      margin-top: 10px;
    }
  }
}
```

这种组件组织方式有以下优点：

1. **高内聚**：每个组件专注于单一职责
2. **组件分层**：容器组件(如产品列表)处理数据逻辑，展示组件(如产品过滤器)专注于UI渲染
3. **状态管理集成**：容器组件与状态管理库(如NgRx)集成，处理数据流
4. **可复用性**：UI组件可在不同部分重复使用
5. **变更检测优化**：使用OnPush策略提高性能

### 代码组织的实践建议

在组织Angular应用代码时，可遵循以下实践建议：

1. **保持文件小巧**：每个文件只关注一个功能或组件
2. **按功能而非类型组织文件**：相关的组件、服务、模型应放在同一目录下
3. **实施桶模式（Barrel Pattern）**：使用index.ts文件导出目录中的内容
4. **遵循Angular风格指南**：采用官方推荐的命名和组织方式
5. **目录深度控制**：避免过深的目录结构，一般不超过4级
6. **公共代码抽取**：将多个模块共用的代码放入shared目录
7. **延迟加载考虑**：将大型功能模块设计为可延迟加载
8. **一致性原则**：在整个项目中保持一致的组织方式

例如，使用桶模式来简化导入：

```typescript
// features/products/models/index.ts
export * from './product.model';
export * from './product-filter.model';
export * from './product-category.enum';

// 使用时可以简化导入
import { Product, ProductFilter, ProductCategory } from '../models';
```

按照这些代码组织原则，可以构建出结构清晰、易于维护和扩展的Angular企业级应用。

## 文件命名约定

在Angular项目中，一致的文件命名约定是保证代码可读性和可维护性的重要因素。合理的命名约定可以帮助开发者快速理解文件的用途，简化文件查找，并促进团队协作。

### 命名规范

Angular官方风格指南推荐使用符合特定模式的文件名，这种命名方式清晰地表明了文件的用途和类型。

以下是各类型文件的命名规范及示例：

| 文件类型 | 命名规范 | 示例 |
|---------|---------|------|
| 组件 | `feature-name.component.ts` | `product-list.component.ts` |
| 模板 | `feature-name.component.html` | `product-list.component.html` |
| 样式 | `feature-name.component.scss` | `product-list.component.scss` |
| 服务 | `feature-name.service.ts` | `product.service.ts` |
| 指令 | `feature-name.directive.ts` | `highlight.directive.ts` |
| 管道 | `feature-name.pipe.ts` | `currency-format.pipe.ts` |
| 模块 | `feature-name.module.ts` | `product.module.ts` |
| 路由 | `feature-name-routing.module.ts` | `product-routing.module.ts` |
| 模型/接口 | `feature-name.model.ts` | `product.model.ts` |
| 枚举 | `feature-name.enum.ts` | `product-status.enum.ts` |
| 常量 | `feature-name.constants.ts` | `api-endpoints.constants.ts` |
| 守卫 | `feature-name.guard.ts` | `auth.guard.ts` |
| 解析器 | `feature-name.resolver.ts` | `product-detail.resolver.ts` |
| 拦截器 | `feature-name.interceptor.ts` | `auth.interceptor.ts` |
| NgRx Actions | `feature-name.actions.ts` | `product.actions.ts` |
| NgRx Reducers | `feature-name.reducer.ts` | `product.reducer.ts` |
| NgRx Effects | `feature-name.effects.ts` | `product.effects.ts` |
| NgRx Selectors | `feature-name.selectors.ts` | `product.selectors.ts` |

#### 类命名

类名应使用驼峰命名法(PascalCase)，并且名称应与文件名匹配，同时添加类型后缀。

```typescript
// 组件命名
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  // 组件实现
}

// 服务命名
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // 服务实现
}

// 指令命名
@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  // 指令实现
}

// 管道命名
@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {
  // 管道实现
}

// 模型命名
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// 枚举命名
export enum ProductStatus {
  Draft = 'draft',
  Active = 'active',
  Inactive = 'inactive',
  Discontinued = 'discontinued'
}
```

#### 选择器命名

组件和指令的选择器应使用带前缀的短横线命名法(kebab-case)：

```typescript
// 组件选择器
@Component({
  selector: 'app-product-card', // 使用app前缀
  // ...
})
export class ProductCardComponent { }

// 指令选择器
@Directive({
  selector: '[appDraggable]', // 属性指令使用方括号
  // ...
})
export class DraggableDirective { }
```

在大型项目或组件库中，可以使用自定义前缀来区分不同的功能模块：

```typescript
// 公司组件库的选择器
@Component({
  selector: 'acme-data-table',
  // ...
})
export class DataTableComponent { }

// 特定领域组件的选择器
@Component({
  selector: 'admin-user-profile',
  // ...
})
export class UserProfileComponent { }
```

#### Angular CLI生成命令

可以使用Angular CLI命令快速生成符合命名约定的文件：

```bash
# 生成组件
ng generate component features/products/components/product-list

# 生成服务
ng generate service features/products/services/product

# 生成指令
ng generate directive shared/directives/highlight

# 生成管道
ng generate pipe shared/pipes/currency-format

# 生成模块
ng generate module features/products

# 生成特性模块(带路由)
ng generate module features/customers --routing
```

### 文件组织规范

除了命名约定，文件的内部组织也应该遵循一定的规范。每个文件应该有清晰的结构和组织方式，以提高可读性和可维护性。

#### 组件文件组织

组件可以使用内联模板和样式，也可以使用外部文件。对于简单的组件，内联方式更为简洁：

```typescript
// 简单组件的内联方式
@Component({
  selector: 'app-product-card',
  template: `
    <div class="product-card">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description | truncate:100 }}</p>
      <div class="price">{{ product.price | currency:'CNY' }}</div>
      <div class="actions">
        <button (click)="onViewDetails()">查看详情</button>
        <button (click)="onAddToCart()">加入购物车</button>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      padding: 16px;
      border: 1px solid #eee;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .price {
      font-weight: bold;
      color: #e91e63;
      font-size: 1.2em;
      margin: 10px 0;
    }
    
    .actions {
      display: flex;
      justify-content: space-between;
    }
    
    button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #3f51b5;
      color: white;
    }
    
    button:hover {
      background-color: #303f9f;
    }
  `]
})
export class ProductCardComponent {
  @Input() product: Product;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() addToCart = new EventEmitter<Product>();
  
  onViewDetails(): void {
    this.viewDetails.emit(this.product.id);
  }
  
  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }
}
```

对于复杂的组件，应使用分离的文件来组织模板、样式和逻辑：

```typescript
// product-detail.component.ts
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product$: Observable<Product>;
  private destroy$ = new Subject<void>();
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }
  
  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => this.productService.getProduct(id)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: product => this.product$ = of(product),
      error: err => {
        this.snackBar.open('无法加载产品详情', '关闭', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }
  
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.snackBar.open('产品已添加到购物车', '关闭', { duration: 2000 });
  }
  
  goBack(): void {
    this.router.navigate(['/products']);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### 服务文件组织

服务应该聚焦于特定的功能领域，并遵循单一职责原则：

```typescript
// product.service.ts
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'api/products';
  
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }
  
  getProducts(filter?: ProductFilter): Observable<Product[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.category) {
        params = params.set('category', filter.category);
      }
      if (filter.searchTerm) {
        params = params.set('q', filter.searchTerm);
      }
    }
    
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      catchError(error => this.errorHandler.handleError('获取产品列表失败', error))
    );
  }
  
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => this.errorHandler.handleError('获取产品详情失败', error))
    );
  }
  
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(error => this.errorHandler.handleError('创建产品失败', error))
    );
  }
  
  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product).pipe(
      catchError(error => this.errorHandler.handleError('更新产品失败', error))
    );
  }
  
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => this.errorHandler.handleError('删除产品失败', error))
    );
  }
}
```

通过遵循这些命名约定和文件组织规范，可以提高代码的可读性、可维护性和协作效率，使团队成员能够快速理解和导航项目结构。

## 核心设施搭建

企业级Angular应用需要一系列核心设施来支持应用的稳定运行、错误处理、安全控制和性能优化。这些核心设施通常实现为服务、拦截器、守卫和工具类，集中在CoreModule中管理。

### 核心服务

核心服务是应用中的单例服务，为整个应用提供基础功能支持。

#### 错误处理服务

统一的错误处理机制可以有效捕获和处理应用中的各种错误，提供一致的用户体验和错误追踪能力。

```typescript
// core/services/error-handler.service.ts
import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService implements ErrorHandler {
  // 使用Injector避免循环依赖
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    const logger = this.injector.get(LoggerService);
    const notifier = this.injector.get(NotificationService);
    const router = this.injector.get(Router);
    
    let errorMessage: string;
    let stackTrace: string;
    
    if (error instanceof HttpErrorResponse) {
      // 处理HTTP错误
      if (error.status === 0) {
        // 网络错误或CORS错误
        errorMessage = '无法连接到服务器，请检查网络连接';
      } else if (error.status === 401) {
        // 未授权错误
        errorMessage = '您的登录已过期，请重新登录';
        // 导航到登录页
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: router.url } 
        });
      } else if (error.status === 403) {
        // 禁止访问错误
        errorMessage = '您没有权限执行此操作';
      } else if (error.status === 404) {
        // 资源不存在
        errorMessage = '请求的资源不存在';
      } else if (error.status >= 500) {
        // 服务器错误
        errorMessage = '服务器错误，请稍后再试';
      } else {
        // 其他HTTP错误
        errorMessage = error.error?.message || '发生错误，请稍后再试';
      }
      
      stackTrace = error.message;
      
      // 记录HTTP错误
      logger.error(`HTTP Error: ${error.status} ${error.statusText}`, {
        url: error.url,
        headers: error.headers.keys().map(key => `${key}: ${error.headers.get(key)}`),
        error: error.error,
        message: errorMessage
      });
    } else {
      // 处理客户端错误
      errorMessage = error.message || '发生未知错误';
      stackTrace = error.stack || '';
      
      // 记录客户端错误
      logger.error('Client Error:', {
        message: errorMessage,
        stack: stackTrace,
        name: error.name
      });
    }
    
    // 在非生产环境下将错误打印到控制台
    if (!environment.production) {
      console.error('Error occurred:', error);
    }
    
    // 显示用户友好的错误消息
    notifier.showError(errorMessage);
    
    // 如果有错误跟踪服务(如Sentry)，可以在此处上报错误
    this.reportErrorToMonitoringService(error, errorMessage, stackTrace);
  }
  
  private reportErrorToMonitoringService(error: any, errorMessage: string, stackTrace: string): void {
    // 集成错误监控服务，如Sentry
    // Sentry.captureException(error, {
    //   extra: {
    //     errorMessage,
    //     stackTrace
    //   }
    // });
  }
}
```

配合全局错误处理器:

```typescript
// app.module.ts
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandlerService } from './core/services/error-handler.service';

@NgModule({
  // ...
  providers: [
    { provide: ErrorHandler, useClass: ErrorHandlerService }
  ],
  // ...
})
export class AppModule { }
```

#### 日志服务

日志服务提供统一的日志记录接口，支持不同级别的日志记录和持久化：

```typescript
// core/services/logger.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// 日志级别
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Fatal = 4
}

// 日志条目接口
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  additional: any[];
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  // 配置日志级别，生产环境通常只记录Error及以上级别
  private logLevel: LogLevel = environment.production ? LogLevel.Error : LogLevel.Debug;
  
  // 日志存储，可以根据需要实现本地存储或发送到服务器
  private logs: LogEntry[] = [];
  
  constructor() { }
  
  debug(message: string, ...additional: any[]): void {
    this.log(LogLevel.Debug, message, additional);
  }
  
  info(message: string, ...additional: any[]): void {
    this.log(LogLevel.Info, message, additional);
  }
  
  warn(message: string, ...additional: any[]): void {
    this.log(LogLevel.Warn, message, additional);
  }
  
  error(message: string, ...additional: any[]): void {
    this.log(LogLevel.Error, message, additional);
  }
  
  fatal(message: string, ...additional: any[]): void {
    this.log(LogLevel.Fatal, message, additional);
  }
  
  private log(level: LogLevel, message: string, additional: any[]): void {
    if (level >= this.logLevel) {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        additional
      };
      
      this.logs.push(logEntry);
      
      // 控制台输出
      this.logToConsole(logEntry);
      
      // 持久化日志
      this.persistLog(logEntry);
    }
  }
  
  private logToConsole(log: LogEntry): void {
    if (!environment.production) {
      const color = this.getLogColor(log.level);
      const method = this.getConsoleMethod(log.level);
      
      console[method](
        `%c${LogLevel[log.level]} [${log.timestamp}]`,
        `color: ${color}; font-weight: bold`,
        log.message,
        ...log.additional
      );
    }
  }
  
  private getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.Debug:
        return 'gray';
      case LogLevel.Info:
        return 'blue';
      case LogLevel.Warn:
        return 'orange';
      case LogLevel.Error:
      case LogLevel.Fatal:
        return 'red';
      default:
        return 'black';
    }
  }
  
  private getConsoleMethod(level: LogLevel): string {
    switch (level) {
      case LogLevel.Debug:
        return 'debug';
      case LogLevel.Info:
        return 'info';
      case LogLevel.Warn:
        return 'warn';
      case LogLevel.Error:
      case LogLevel.Fatal:
        return 'error';
      default:
        return 'log';
    }
  }
  
  private persistLog(log: LogEntry): void {
    // 实现日志持久化逻辑
    // 可以将日志发送到服务器或存储在本地存储中
    if (log.level >= LogLevel.Error) {
      // 对于错误日志，可以立即发送到服务器
      this.sendLogToServer(log);
    } else {
      // 对于低级别日志，可以批量处理
      this.queueLogForBatch(log);
    }
  }
  
  private sendLogToServer(log: LogEntry): void {
    // 使用HTTP服务发送日志到服务器
    // 实际实现可能需要注入HttpClient
  }
  
  private queueLogForBatch(log: LogEntry): void {
    // 将日志加入队列，稍后批量发送
    // 可以使用定时器或在应用空闲时发送
  }
  
  // 获取当前日志
  getLogs(level?: LogLevel): LogEntry[] {
    return level !== undefined
      ? this.logs.filter(log => log.level >= level)
      : this.logs;
  }
  
  // 清除日志
  clearLogs(): void {
    this.logs = [];
  }
}
```

#### API服务

API服务封装HTTP请求逻辑，提供统一的API访问接口：

```typescript
// core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';

// API响应接口
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) { }
  
  // GET请求
  get<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      params: this.buildParams(params),
      headers: headers
    };
    
    this.logger.debug(`API GET request to ${endpoint}`, { params });
    
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, options).pipe(
      map(response => response.data),
      catchError(error => {
        this.logger.error(`API GET request to ${endpoint} failed`, error);
        return throwError(() => error);
      })
    );
  }
  
  // POST请求
  post<T>(endpoint: string, data?: any, headers?: HttpHeaders): Observable<T> {
    this.logger.debug(`API POST request to ${endpoint}`, { data });
    
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data, { headers }).pipe(
      map(response => response.data),
      catchError(error => {
        this.logger.error(`API POST request to ${endpoint} failed`, error);
        return throwError(() => error);
      })
    );
  }
  
  // PUT请求
  put<T>(endpoint: string, data?: any, headers?: HttpHeaders): Observable<T> {
    this.logger.debug(`API PUT request to ${endpoint}`, { data });
    
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data, { headers }).pipe(
      map(response => response.data),
      catchError(error => {
        this.logger.error(`API PUT request to ${endpoint} failed`, error);
        return throwError(() => error);
      })
    );
  }
  
  // DELETE请求
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    this.logger.debug(`API DELETE request to ${endpoint}`);
    
    return this.http.delete<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, { headers }).pipe(
      map(response => response.data),
      catchError(error => {
        this.logger.error(`API DELETE request to ${endpoint} failed`, error);
        return throwError(() => error);
      })
    );
  }
  
  // 构建查询参数
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return httpParams;
  }
}
```

### 拦截器配置

HTTP拦截器可以拦截和修改HTTP请求和响应，用于实现认证、日志记录、错误处理等功能。

#### 认证拦截器

```typescript
// core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  
  constructor(private authService: AuthService) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 跳过不需要认证的请求
    if (this.shouldSkipAuthHeader(request)) {
      return next.handle(request);
    }
    
    // 添加认证头
    const authRequest = this.addAuthHeader(request);
    
    // 处理请求并捕获错误
    return next.handle(authRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // 处理401未授权错误
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // 判断是否需要跳过认证头
  private shouldSkipAuthHeader(request: HttpRequest<any>): boolean {
    // 跳过认证和刷新token的请求
    const skippedUrls = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token'
    ];
    
    return skippedUrls.some(url => request.url.includes(url));
  }
  
  // 添加认证头
  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getAccessToken();
    
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return request;
  }
  
  // 处理401未授权错误
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      // 开始刷新Token流程
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      
      // 尝试刷新Token
      return this.authService.refreshToken().pipe(
        switchMap(token => {
          // 刷新成功，更新Token并重试原始请求
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          
          return next.handle(this.addAuthHeader(request));
        }),
        catchError(error => {
          // 刷新失败，需要重新登录
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // 等待Token刷新完成
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addAuthHeader(request));
        })
      );
    }
  }
}
```

#### 错误拦截器

```typescript
// core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // 可重试的HTTP方法
  private readonly retryMethods = ['GET'];
  // 最大重试次数
  private readonly maxRetries = 2;
  
  constructor(
    private router: Router,
    private logger: LoggerService,
    private notifier: NotificationService
  ) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 对GET请求进行自动重试
    return next.handle(request).pipe(
      // 可重试的请求才进行重试
      this.retryMethods.includes(request.method) ? retry(this.maxRetries) : retry(0),
      catchError((error: HttpErrorResponse) => {
        // 处理HTTP错误
        this.handleErrorResponse(error);
        
        // 传递错误
        return throwError(() => error);
      })
    );
  }
  
  private handleErrorResponse(error: HttpErrorResponse): void {
    if (error.status === 401) {
      // 未授权错误，导航到登录页
      this.handleUnauthorized();
    } else if (error.status === 403) {
      // 禁止访问错误，导航到无权限页面
      this.handleForbidden();
    } else if (error.status === 404) {
      // 资源不存在错误
      this.notifier.showError('请求的资源不存在');
    } else if (error.status >= 500) {
      // 服务器错误
      this.notifier.showError('服务器错误，请稍后再试');
    } else if (error.status === 0) {
      // 网络错误
      this.notifier.showError('无法连接到服务器，请检查网络连接');
    } else {
      // 其他HTTP错误
      const message = error.error?.message || '发生错误，请稍后再试';
      this.notifier.showError(message);
    }
    
    // 记录错误
    this.logger.error(`HTTP Error: ${error.status}`, {
      url: error.url,
      message: error.message,
      error: error.error
    });
  }
  
  private handleUnauthorized(): void {
    // 重定向到登录页，保存当前URL
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
  
  private handleForbidden(): void {
    // 重定向到无权限页面
    this.router.navigate(['/forbidden']);
  }
}
```

#### 缓存拦截器

```typescript
// core/interceptors/cache.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private readonly cacheMethods = ['GET'];
  private readonly excludedUrls: string[] = [
    '/auth/',
    '/realtime/'
  ];
  
  constructor(private cacheService: CacheService) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 只缓存GET请求，且排除特定URL
    if (!this.canCacheRequest(request)) {
      return next.handle(request);
    }
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(request);
    
    // 检查缓存
    const cachedResponse = this.cacheService.get(cacheKey);
    if (cachedResponse) {
      // 返回缓存的响应
      return of(cachedResponse);
    }
    
    // 继续处理请求并缓存响应
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // 缓存响应
          this.cacheService.set(cacheKey, event);
        }
      })
    );
  }
  
  private canCacheRequest(request: HttpRequest<any>): boolean {
    // 检查是否是可缓存的请求
    const isMethodCacheable = this.cacheMethods.includes(request.method);
    const isUrlExcluded = this.excludedUrls.some(url => request.url.includes(url));
    const hasNoCache = request.headers.get('Cache-Control') === 'no-cache';
    
    return isMethodCacheable && !isUrlExcluded && !hasNoCache;
  }
  
  private generateCacheKey(request: HttpRequest<any>): string {
    // 生成唯一的缓存键
    return `${request.method}-${request.urlWithParams}`;
  }
}
```

### 路由守卫

路由守卫用于控制路由的访问权限，实现认证、授权和数据预加载等功能。

#### 认证守卫

```typescript
// core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }
  
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> {
    const url = segments.map(s => `/${s.path}`).join('');
    return this.checkAuth(url);
  }
  
  private checkAuth(url: string): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        
        // 未认证，重定向到登录页
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: url }
        });
        
        return false;
      })
    );
  }
}
```

#### 权限守卫

```typescript
// core/guards/permission.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notifier: NotificationService
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // 获取路由数据中定义的所需权限
    const requiredPermissions = route.data['permissions'] as string[];
    
    // 检查用户是否拥有所需权限
    return this.checkPermissions(requiredPermissions, state.url);
  }
  
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }
  
  private checkPermissions(permissions: string[], url: string): Observable<boolean> {
    // 如果没有指定权限要求，则允许访问
    if (!permissions || permissions.length === 0) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }
    
    // 检查用户是否拥有所需的权限
    return this.authService.hasPermissions(permissions).pipe(
      tap(hasPermissions => {
        if (!hasPermissions) {
          // 用户没有所需权限，显示通知并重定向
          this.notifier.showWarning('您没有权限访问此页面');
          this.router.navigate(['/forbidden']);
        }
      })
    );
  }
}
```

#### 数据预加载守卫

```typescript
// core/guards/data-preload.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class DataPreloadGuard implements CanActivate {
  constructor(
    private store: Store,
    private notifier: NotificationService
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // 获取路由数据中定义的预加载操作
    const preloadAction = route.data['preloadAction'];
    
    // 如果没有定义预加载操作，则允许访问
    if (!preloadAction) {
      return of(true);
    }
    
    // 派发预加载Action
    this.store.dispatch(preloadAction);
    
    // 等待预加载完成
    const preloadSuccess$ = route.data['preloadSuccess$'];
    const preloadFailure$ = route.data['preloadFailure$'];
    
    if (!preloadSuccess$ || !preloadFailure$) {
      return of(true);
    }
    
    // 监听成功或失败事件
    return this.store.select(preloadSuccess$).pipe(
      map(() => true),
      catchError(error => {
        this.notifier.showError('无法加载所需数据');
        return of(false);
      })
    );
  }
}
```

通过这些核心设施的搭建，可以为Angular企业级应用提供坚实的基础架构，确保应用稳定、安全和高性能地运行。这些设施应集中在CoreModule中管理，确保它们只被实例化一次，并贯穿整个应用生命周期。

## 最佳实践总结

构建企业级Angular应用需要遵循一系列最佳实践，以确保应用的性能、可维护性和可扩展性。以下是关键最佳实践的总结：

### 1. 模块划分

```
┌────────────────────────────────────────────────────────┐
│ 模块划分原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 单一职责原则      │ 每个模块都有明确的、单一的职责     │
│ ✓ 懒加载设计        │ 特性模块设计为可懒加载，提高性能   │
│ ✓ 避免循环依赖      │ 保持清晰的单向依赖关系           │
│ ✓ 模块独立性        │ 减少模块间的耦合，提高重用性      │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **核心模块只导入一次**：确保CoreModule只在AppModule中导入一次
- **共享模块无状态**：SharedModule不应包含有状态服务
- **特性模块自包含**：每个特性模块包含自己的组件、服务和路由
- **懒加载与预加载**：实现路由懒加载，并根据需要配置预加载策略
- **公共依赖提升**：将多个特性模块共用的依赖提升到共享模块

### 2. 代码组织

```
┌────────────────────────────────────────────────────────┐
│ 代码组织原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 目录结构清晰      │ 反映应用的模块化架构              │
│ ✓ 功能模块化        │ 相关功能代码组织在一起            │
│ ✓ 共享代码复用      │ 避免代码重复，提高复用性          │
│ ✓ 关注点分离        │ UI逻辑与业务逻辑分离              │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **按功能组织文件**：相关的组件、服务和模型放在同一目录下
- **LIFT原则**：让文件易于定位(Locate)、识别(Identify)、保持扁平(Flat)和尽量精简(Try to be DRY)
- **组件分层**：将组件分为容器组件(处理数据)和展示组件(处理UI)
- **相关文件就近原则**：相关文件应放置在一起
- **目录深度控制**：避免过深的目录结构，一般不超过4级

### 3. 命名规范

```
┌────────────────────────────────────────────────────────┐
│ 命名规范原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 统一命名风格      │ 文件名、类名、变量名保持一致风格   │
│ ✓ 语义化命名        │ 名称应反映其用途和功能            │
│ ✓ 文件后缀规范      │ 使用标准后缀(.component、.service) │
│ ✓ 类型定义明确      │ 接口、枚举、类型保持明确的命名     │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **文件命名一致性**：使用特性名和类型作为文件名，如`product-list.component.ts`
- **类名与文件名匹配**：类名应与文件名匹配，如`ProductListComponent`
- **使用类型后缀**：为类添加类型后缀，如Component、Service、Directive
- **选择器前缀**：为组件选择器添加应用前缀，如`app-product-list`
- **描述性命名**：使用描述性名称，避免缩写和模糊命名

### 4. 核心设施

```
┌────────────────────────────────────────────────────────┐
│ 核心设施原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 错误处理机制      │ 统一的错误捕获和处理流程          │
│ ✓ 日志系统          │ 结构化的日志记录和管理            │
│ ✓ API封装           │ 统一的API通信层                  │
│ ✓ 安全控制          │ 认证、授权和数据保护机制          │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **全局错误处理**：实现ErrorHandler接口，统一处理应用错误
- **HTTP拦截器链**：设置拦截器处理认证、日志和错误
- **认证服务**：集中管理用户认证状态和Token
- **路由守卫**：实现路由访问控制和权限验证
- **环境配置**：使用环境文件管理不同环境的配置

### 5. 性能优化

```
┌────────────────────────────────────────────────────────┐
│ 性能优化原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 变更检测优化      │ 使用OnPush策略减少检测次数        │
│ ✓ 懒加载实现        │ 路由和组件懒加载减少初始加载时间   │
│ ✓ 内存管理          │ 正确管理订阅和大型数据集          │
│ ✓ 渲染性能          │ 使用trackBy、虚拟滚动等优化渲染   │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **变更检测策略**：对数据展示组件使用`ChangeDetectionStrategy.OnPush`
- **不可变数据模式**：使用不可变数据流，配合OnPush策略
- **懒加载路由**：实现路由级别的代码分割和懒加载
- **虚拟滚动**：对长列表使用虚拟滚动(CDK VirtualScroll)
- **订阅管理**：使用`takeUntil`模式或`AsyncPipe`管理订阅

### 6. 状态管理

```
┌────────────────────────────────────────────────────────┐
│ 状态管理原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 单一数据源        │ 集中管理应用状态                  │
│ ✓ 状态不可变性      │ 使用不可变更新模式                │
│ ✓ 分层状态设计      │ 全局状态与本地状态分离            │
│ ✓ 选择器模式        │ 使用选择器派生视图状态            │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **状态分层**：区分全局状态(如用户信息)和局部状态(如表单状态)
- **使用NgRx**：大型应用使用NgRx管理复杂状态
- **实体规范化**：使用EntityAdapter规范化集合数据
- **Effects隔离**：将副作用逻辑隔离在Effects中
- **状态选择器**：使用选择器获取和组合状态

### 7. 测试策略

```
┌────────────────────────────────────────────────────────┐
│ 测试策略原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 单元测试覆盖      │ 服务、管道、指令的单元测试        │
│ ✓ 组件测试         │ 隔离测试和集成测试组合            │
│ ✓ E2E关键流程测试   │ 关键业务流程的端到端测试          │
│ ✓ 测试数据隔离      │ 使用测试替身隔离外部依赖          │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **服务测试**：对服务逻辑进行单元测试，模拟HTTP请求
- **组件测试**：结合隔离测试和TestBed测试
- **路由测试**：测试路由配置和守卫
- **状态管理测试**：测试Actions、Reducers、Selectors和Effects
- **E2E测试**：使用Cypress或Playwright测试关键业务流程

### 8. 代码质量

```
┌────────────────────────────────────────────────────────┐
│ 代码质量原则                                            │
├────────────────────┬───────────────────────────────────┤
│ ✓ 代码规范         │ 一致的代码风格和实践              │
│ ✓ 静态分析         │ 使用ESLint、SonarQube等工具      │
│ ✓ 代码审查         │ 严格的PR审查流程                  │
│ ✓ 文档完备         │ 代码注释和API文档                 │
└────────────────────┴───────────────────────────────────┘
```

**核心实践：**

- **代码规范**：使用TSLint/ESLint强制代码风格
- **自动格式化**：使用Prettier自动格式化代码
- **提交钩子**：使用husky配置提交前检查
- **组件文档**：使用Compodoc生成组件文档
- **代码复杂度控制**：控制函数复杂度和文件大小

通过遵循这些最佳实践，开发团队可以构建出高质量、可维护且性能优秀的企业级Angular应用。记住，这些最佳实践应该根据项目的具体需求和团队的经验水平进行调整和应用。

## 相关资源

- [Angular风格指南](https://angular.io/guide/styleguide)
- [Angular模块设计](https://angular.io/guide/ngmodules)
- [Angular最佳实践](https://angular.io/guide/best-practices)
- [Angular项目结构](https://angular.io/guide/file-structure) 