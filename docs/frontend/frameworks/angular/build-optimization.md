---
title: build-optimization
createTime: 2025/03/29 17:12:23
permalink: /article/i7lhydnu/
---
# Angular 构建优化

## 目录

- [代码分割](#代码分割)
- [预编译](#预编译)
- [摇树优化](#摇树优化)
- [优化打包配置](#优化打包配置)
- [资源优化](#资源优化)

## 代码分割

代码分割是减小应用初始加载体积的重要技术，通过将代码拆分为多个小块按需加载，显著提升首次加载性能。

### 路由级代码分割

Angular内置支持基于路由的代码分割，是最常用的分割方式。

```typescript
// app-routing.module.ts 中实现懒加载路由
const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [AdminGuard] // 可选：权限控制
  },
  { 
    path: 'products', 
    loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) 
  }
];
```

路由级代码分割优势：
- 减少初始加载包体积
- 按用户访问路径加载
- 与Angular路由系统无缝集成
- 支持预加载策略

### 预加载策略

```typescript
// 配置预加载策略
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // 选项1：预加载所有懒加载模块
      preloadingStrategy: PreloadAllModules

      // 选项2：自定义预加载逻辑
      // preloadingStrategy: CustomPreloadingStrategy
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// 自定义预加载策略
@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // 只预加载标记了data.preload = true的路由
    return route.data && route.data.preload ? load() : of(null);
  }
}
```

### 组件级代码分割

除了路由级分割，Angular还可以实现组件级代码分割。

```typescript
// 组件懒加载服务
@Injectable({
  providedIn: 'root'
})
export class LazyComponentLoader {
  constructor(
    private injector: Injector,
    private compiler: Compiler
  ) {}

  async loadComponent(path: string): Promise<any> {
    // 动态导入组件模块
    const module = await import(path);
    const moduleFactory = await this.compiler.compileModuleAsync(module.LazyComponentModule);
    const moduleRef = moduleFactory.create(this.injector);
    
    // 获取组件工厂
    const componentFactory = moduleRef.componentFactoryResolver
                             .resolveComponentFactory(module.LazyComponent);
    
    return componentFactory;
  }
}

// 使用动态组件加载器
@Component({
  selector: 'app-container',
  template: `
    <ng-container #container></ng-container>
    <button (click)="loadLazyComponent()">加载组件</button>
  `
})
export class ContainerComponent {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  
  constructor(private lazyLoader: LazyComponentLoader) {}
  
  async loadLazyComponent() {
    // 仅在需要时才加载组件
    const componentFactory = await this.lazyLoader.loadComponent('./lazy/lazy.component');
    this.container.createComponent(componentFactory);
  }
}
```

### 应用代码分割策略

```ascii
Angular应用代码分割策略:
┌──────────────────────┐
│    应用入口模块      │
└──────────┬───────────┘
           │
           ├───────────────────┬───────────────────┬───────────────────┐
           │                   │                   │                   │
┌──────────▼───────┐  ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   核心模块        │  │  共享功能模块    │  │  懒加载模块1   │  │  懒加载模块2   │
│ (即时加载)        │  │  (即时加载)     │  │ (路由触发加载)  │  │ (路由触发加载) │
└──────────────────┘  └─────────────────┘  └────────────────┘  └────────────────┘
                                                  │                   │
                                           ┌──────▼──────┐    ┌──────▼──────┐
                                           │ 子功能模块1  │    │ 子功能模块2  │
                                           └─────────────┘    └─────────────┘
```

### 代码分割最佳实践

| 分割粒度 | 适用场景 | 实现难度 | 性能影响 |
|---------|---------|--------|---------|
| 路由级别 | 独立页面/功能 | 低 | 高效，初始加载减少50-80% |
| 功能模块级别 | 复杂功能组件 | 中 | 高效，按需加载提升体验 |
| 组件级别 | 复杂UI组件 | 高 | 适用于特定场景，需权衡实现复杂度 |
| 第三方库 | 大型依赖 | 中 | 显著减少主包体积 |

## 预编译

Angular应用的编译模式会直接影响应用的加载性能和运行时行为。

### JIT vs AOT编译

Angular支持两种编译模式：即时编译(JIT)和预先编译(AOT)。

```bash
# 开发模式，默认使用JIT
ng serve

# 生产模式，默认启用AOT
ng build --prod

# 显式指定AOT模式
ng build --aot
```

JIT与AOT比较：

| 特性 | JIT编译 | AOT编译 |
|-----|--------|--------|
| 编译时机 | 运行时在浏览器中 | 构建阶段 |
| 包体积 | 较大，包含编译器 | 较小，无需编译器 |
| 启动时间 | 较慢，需编译模板 | 更快，直接执行 |
| 开发体验 | 更快的构建 | 构建较慢但可发现更多错误 |
| 适用场景 | 开发环境 | 生产环境 |

### AOT优化技术

```typescript
// 禁用Angular装饰器保留，减小生产构建体积
// tsconfig.json
{
  "angularCompilerOptions": {
    "enableIvy": true,
    "annotation": false,
    "allowEmptyCodegenFiles": true
  }
}

// 确保组件使用AOT友好的写法
@Component({
  // 不使用动态绑定表达式（AOT友好）
  // template: '{{ dynamicProperty }}' // 不推荐
  
  // 使用静态绑定（AOT友好）
  template: '<div>{{ staticProperty }}</div>' // 推荐
})
export class MyComponent {
  staticProperty = 'Hello World';
  
  // 避免使用函数绑定
  getValue() {
    return 'Hello';
  }
}
```

### Ivy渲染引擎

Angular 9+使用Ivy作为默认渲染引擎，带来更多优化特性：

```typescript
// 启用Ivy编译器
// tsconfig.json
{
  "angularCompilerOptions": {
    "enableIvy": true
  }
}
```

Ivy优化特性：
- 增量DOM：只更新变化的DOM部分
- 树抖动改进：更有效地移除未使用代码
- 懒加载组件：更细粒度的代码分割
- 本地化移除：只包含应用需要的语言

### 预编译性能对比

| 编译模式 | 初始加载时间 | 应用体积 | 类型安全 | 运行时性能 |
|---------|------------|---------|---------|----------|
| JIT | 慢(额外120-300ms) | 大(额外500+KB) | 运行时检查 | 标准 |
| AOT | 快(省去编译时间) | 小(无编译器) | 构建时全面检查 | 略好 |
| AOT+Ivy | 非常快 | 最小(更好的树抖动) | 构建时全面检查 | 最佳 |

## 摇树优化

摇树优化(Tree Shaking)是减小应用体积的重要技术，通过移除未使用的代码，显著减少包体积。

### 摇树优化工作原理

摇树优化基于ES6模块的静态结构特性，在构建阶段分析并删除未使用的代码。

```typescript
// 导出方式对摇树优化的影响

// 好的实践：命名导出有利于摇树优化
export class MyService { /* ... */ }
export function helperFunction() { /* ... */ }

// 不好的实践：默认导出和整体导出不利于摇树优化
export default {
  MyService: class { /* ... */ },
  helperFunction: function() { /* ... */ }
};
```

### Angular中的摇树优化配置

```json
// package.json中启用摇树优化
{
  "name": "my-app",
  "version": "0.0.0",
  "sideEffects": false
}

// 或指定有副作用的文件
{
  "name": "my-app",
  "version": "0.0.0",
  "sideEffects": [
    "*.css",
    "*.scss",
    "src/polyfills.ts"
  ]
}
```

```typescript
// angular.json中优化构建配置
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}
```

### 编写友好的可摇树优化代码

```typescript
// 不利于摇树优化的代码
class MyUtil {
  static helperA() { /* ... */ }
  static helperB() { /* ... */ }
  static helperC() { /* ... */ }
}

// 导出整个类，即使只使用了其中一个方法，所有方法都会被包含
export { MyUtil };

// 有利于摇树优化的代码
export function helperA() { /* ... */ }
export function helperB() { /* ... */ }
export function helperC() { /* ... */ }

// 使用时只导入需要的函数
import { helperA } from './utils';
// helperB和helperC会被摇树优化删除
```

### 第三方库的摇树优化

```typescript
// 使用支持摇树优化的库导入方式
// 不好的方式
import * as _ from 'lodash';

// 好的方式
import { map, filter } from 'lodash-es';

// 最佳方式
import map from 'lodash-es/map';
import filter from 'lodash-es/filter';
```

### 第三方库优化策略

| 库类型 | 优化策略 | 预期效果 |
|--------|---------|---------|
| Moment.js | 使用Day.js/date-fns | 减少约300KB |
| Lodash | 使用lodash-es和按需导入 | 减少约200KB |
| RxJS | 使用pipeable操作符和按需导入 | 减少约60KB |
| NgBootstrap | 按需导入模块 | 减少约50KB |
| Material | 按需导入模块和主题 | 减少约100KB |

### 摇树优化效果分析

```ascii
未优化项目体积分布:
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  应用代码 (15%)  │  使用的第三方库代码 (45%)  │  未使用的第三方库代码 (40%)  │
│                                                         │
└─────────────────────────────────────────────────────────┘

优化后项目体积分布:
┌────────────────────────────────┐
│                                │
│  应用代码 (25%)  │  使用的第三方库代码 (75%)  │
│                                │
└────────────────────────────────┘
                                 ↑
              (体积减少30-50%)
```

## 优化打包配置

通过优化Angular应用的打包配置，可以显著改善构建性能和输出应用的质量。

### 生产环境构建配置

```bash
# 基本生产环境构建
ng build --prod

# 高级生产环境构建
ng build --prod --build-optimizer --vendor-chunk --named-chunks
```

```json
// angular.json 中的高级构建配置
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "6kb",
                  "maximumError": "10kb"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": true,
              "extractLicenses": true,
              "vendorChunk": true,
              "buildOptimizer": true,
              "aot": true
            }
          }
        }
      }
    }
  }
}
```

### 打包分析与监控

```bash
# 使用webpack-bundle-analyzer分析包体积
npm install --save-dev webpack-bundle-analyzer

# 在angular.json中添加打包分析配置
ng build --prod --stats-json
npx webpack-bundle-analyzer dist/my-app/stats.json
```

### 自定义打包优化

#### 自定义Webpack配置

```javascript
// webpack.config.js 扩展
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,  // 超过10KB的文件才会被压缩
      minRatio: 0.8,     // 压缩率
    }),
  ],
};
```

```json
// 在angular.json中集成自定义配置
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-builders/custom-webpack:browser",
          "options": {
            "customWebpackConfig": {
              "path": "./webpack.config.js"
            }
          }
        }
      }
    }
  }
}
```

#### 构建预算设置

```json
// 在angular.json中设置构建预算，防止包体积膨胀
{
  "budgets": [
    {
      "type": "initial",      // 初始加载体积
      "maximumWarning": "2mb",
      "maximumError": "5mb"
    },
    {
      "type": "anyComponentStyle", // 任意组件样式体积
      "maximumWarning": "6kb",
      "maximumError": "10kb"
    },
    {
      "type": "bundle",       // 指定包体积
      "name": "main",
      "maximumWarning": "1mb",
      "maximumError": "1.5mb"
    }
  ]
}
```

### 差异打包(Differential Loading)

为不同浏览器生成不同的包，现代浏览器使用更小的ES2015+包：

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "esnext"
  },
  "angularCompilerOptions": {
    "enableIvy": true
  }
}
```

```html
<!-- index.html (自动生成) -->
<script type="module" src="main-es2015.js"></script>
<script nomodule src="main-es5.js"></script>
```

### 构建优化策略比较

| 优化策略 | 构建时间影响 | 包体积影响 | 适用场景 |
|---------|------------|---------|---------|
| AOT编译 | 增加20-40% | 减少30%+ | 所有生产环境 |
| Build Optimizer | 增加10% | 减少15%+ | 生产环境 |
| 差异打包 | 增加30% | 现代浏览器减少20% | 支持多种浏览器 |
| 代码压缩 | 增加5-10% | 减少60-80% | 所有生产环境 |
| 源码映射 | 增加20% | 增加100%+ | 开发/调试环境 |

## 资源优化

优化应用的静态资源(图片、字体、样式等)，提升加载性能和用户体验。

### 图片优化

#### 图片资源自动优化

```bash
# 安装图片优化webpack插件
npm install --save-dev image-webpack-loader

# 在webpack配置中添加图片处理
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 65 },
              optipng: { enabled: true },
              pngquant: { quality: [0.65, 0.90], speed: 4 },
              gifsicle: { interlaced: false },
              webp: { quality: 75 }
            }
          }
        ]
      }
    ]
  }
};
```

#### 图片按需加载和图片CDN

```typescript
// 在组件中使用图片懒加载
@Component({
  selector: 'app-lazy-image',
  template: `
    <img [attr.src]="loaded ? imgSrc : ''" 
         [attr.loading]="'lazy'"
         (load)="onImageLoad()"
         [ngClass]="{'loading': !loaded}"
         [attr.alt]="altText">
    <div *ngIf="!loaded" class="placeholder"></div>
  `,
  styles: [`
    img.loading { display: none; }
    .placeholder {
      height: 200px;
      background-color: #f0f0f0;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class LazyImageComponent implements OnInit {
  @Input() imgSrc: string;
  @Input() altText: string;
  loaded = false;

  constructor() { }

  ngOnInit() {
    // 预加载大图
    if (this.imgSrc && this.imgSrc.endsWith('.jpg') || this.imgSrc.endsWith('.png')) {
      const img = new Image();
      img.src = this.imgSrc;
    }
  }

  onImageLoad() {
    this.loaded = true;
  }
}
```

### CSS优化

```typescript
// 在angular.json中配置CSS优化
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "optimization": {
              "styles": true,
              "fonts": true
            },
            "inlineStyles": {
              "include": ["first-style"]
            },
            "styles": [
              "src/styles.scss"
            ],
            "stylePreprocessorOptions": {
              "includePaths": [
                "src/scss/base",
                "src/scss/utils"
              ]
            }
          }
        }
      }
    }
  }
}
```

#### CSS代码分割和优化

```html
<!-- 关键CSS内联 -->
<style>
  /* 仅包含首屏渲染需要的关键样式 */
  body { margin: 0; font-family: sans-serif; }
  .header { height: 60px; background: #1976d2; color: white; }
  .loading { display: block; margin: 20px auto; }
</style>

<!-- 非关键CSS延迟加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

#### 组件样式优化

```typescript
// 使用组件级样式封装
@Component({
  selector: 'app-card',
  template: `<div class="card">...</div>`,
  // 仅包含组件必需样式
  styles: [`
    .card {
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      padding: 15px;
    }
  `],
  // 使用ShadowDom可实现完全样式隔离
  encapsulation: ViewEncapsulation.ShadowDom
})
export class CardComponent {}
```

### 字体优化

```css
/* 使用CSS中的font-display属性优化字体加载 */
@font-face {
  font-family: 'MyFont';
  src: url('/assets/fonts/myfont.woff2') format('woff2'),
       url('/assets/fonts/myfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* 关键属性：使用swap策略 */
}
```

```html
<!-- 在index.html中预加载关键字体 -->
<link rel="preload" href="assets/fonts/myfont.woff2" as="font" type="font/woff2" crossorigin>
```

### 资源缓存策略

```json
// angular.json中配置文件名哈希，优化缓存
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "outputHashing": "all", // 为所有文件添加内容哈希
            "extractCss": true,
            "subresourceIntegrity": true // 添加SRI哈希
          }
        }
      }
    }
  }
}
```

### 资源优化效果对比

| 资源类型 | 优化手段 | 优化前 | 优化后 | 加载时间改善 |
|---------|---------|-------|--------|------------|
| 图片 | 压缩+WebP格式+懒加载 | 1.5MB | 400KB | 70-80% |
| CSS | 代码分割+压缩+关键CSS内联 | 250KB | 70KB | 60-70% |
| 字体 | WOFF2格式+预加载+字体显示策略 | 300KB | 120KB | 40-60% |
| 图标 | SVG内联+图标字体替换 | 150KB | 30KB | 70-80% |
| 总资源 | 综合优化 | 2.2MB | 620KB | 60-75% | 