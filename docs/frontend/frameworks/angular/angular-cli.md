---
title: Angular CLI工具
description: Angular命令行工具使用详解、项目脚手架生成、自定义配置与开发流程优化
head:
  -
    - meta
    -
      name: keywords
      content: Angular, CLI, 命令行工具, 项目生成, 构建优化, 开发工作流
createTime: 2025/03/22 23:52:03
permalink: /article/5fu67zld/
---

# Angular CLI工具

Angular CLI是官方的命令行界面工具，用于初始化、开发、脚手架和维护Angular应用。它大大简化了开发过程，标准化项目结构，并提供一致的开发体验。

## 安装与基础配置

### 全局安装

首先，需要全局安装Angular CLI以在任何项目中使用它：

```bash
# 安装最新版本
npm install -g @angular/cli

# 安装特定版本
npm install -g @angular/cli@14.2.0

# 验证安装
ng version
```

安装完成后，`ng version`命令输出类似：

```
Angular CLI: 14.2.0
Node: 16.17.0
Package Manager: npm 8.15.0
OS: win32 x64

Angular: 14.2.0
... animations, common, compiler, compiler-cli, core, forms
... platform-browser, platform-browser-dynamic, router

Package                      Version
------------------------------------------------------
@angular-devkit/architect    0.1402.0
@angular-devkit/core         14.2.0
@angular-devkit/schematics   14.2.0
@schematics/angular          14.2.0
rxjs                         7.5.6
typescript                   4.7.4
```

### 自动补全配置

为提高生产力，可以配置命令行的自动补全：

```bash
# Bash
ng completion script > ~/.angular-completion.bash
echo 'source ~/.angular-completion.bash' >> ~/.bashrc

# Zsh
ng completion script > ~/.angular-completion.zsh
echo 'source ~/.angular-completion.zsh' >> ~/.zshrc

# PowerShell
ng completion script | Out-File -Encoding UTF8 $PROFILE
```

## 项目创建与结构

### 新建项目

创建新的Angular应用：

```bash
# 基本用法
ng new my-app

# 带选项的创建
ng new enterprise-app --routing --style=scss --strict --skip-tests=false --skip-git=false

# 基于预设创建
ng new my-app --collection=@angular/material
```

**常用选项说明**：

| 选项 | 描述 | 默认值 |
|-----|------|-------|
| --routing | 添加路由模块 | false |
| --style | 设置样式文件类型(css/scss/sass/less) | css |
| --prefix | 设置自定义组件选择器前缀 | app |
| --skip-tests | 跳过生成测试文件 | false |
| --skip-git | 不初始化git仓库 | false |
| --strict | 启用TypeScript严格模式 | false |
| --inline-style | 组件使用内联样式 | false |
| --inline-template | 组件使用内联模板 | false |

### 项目结构详解

```
enterprise-app/
├── .vscode/                # VSCode配置
├── node_modules/           # 项目依赖
├── src/                    # 源代码
│   ├── app/                # 应用代码
│   │   ├── core/           # 核心功能模块
│   │   │   ├── guards/     # 路由守卫
│   │   │   ├── interceptors/ # HTTP拦截器
│   │   │   ├── services/   # 核心服务
│   │   │   └── core.module.ts # 核心模块
│   │   ├── features/       # 功能模块
│   │   ├── shared/         # 共享模块
│   │   ├── app-routing.module.ts # 根路由模块
│   │   ├── app.component.* # 根组件
│   │   └── app.module.ts   # 根模块
│   ├── assets/             # 静态资源
│   │   ├── images/         # 图片资源
│   │   ├── fonts/          # 字体资源
│   │   └── icons/          # 图标资源
│   ├── environments/       # 环境配置
│   │   ├── environment.ts  # 开发环境
│   │   └── environment.prod.ts # 生产环境
│   ├── index.html          # 主HTML文件
│   ├── main.ts             # 应用入口点
│   ├── polyfills.ts        # 浏览器兼容性补丁
│   └── styles.scss         # 全局样式
├── .browserslistrc         # 目标浏览器配置
├── .editorconfig           # 编辑器配置
├── .gitignore              # Git忽略文件
├── angular.json            # Angular工作区配置
├── karma.conf.js           # Karma测试配置
├── package.json            # 项目依赖与脚本
├── README.md               # 项目文档
├── tsconfig.app.json       # 应用TypeScript配置
├── tsconfig.json           # 基础TypeScript配置
└── tsconfig.spec.json      # 测试TypeScript配置
```

**关键文件说明**：

- **package.json**: 定义项目依赖和可执行脚本
- **angular.json**: Angular工作区配置，包含构建、测试和发布设置
- **tsconfig.json**: TypeScript编译器配置
- **src/main.ts**: 应用引导入口文件
- **src/app/app.module.ts**: 应用的根模块
- **src/app/app.component.ts**: 应用的根组件

```typescript
// src/main.ts - 应用入口
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

## CLI命令详解

Angular CLI提供了丰富的命令，简化了开发流程的各个方面。

### 开发命令

```bash
# 启动开发服务器
ng serve

# 指定端口和主机
ng serve --port 4201 --host 0.0.0.0

# 开启热模块替换
ng serve --hmr

# SSL模式
ng serve --ssl true --ssl-key ssl/server.key --ssl-cert ssl/server.crt

# 自动打开浏览器
ng serve --open
```

### 构建命令

```bash
# 开发环境构建
ng build

# 生产环境构建
ng build --configuration production

# 自定义环境构建
ng build --configuration staging

# 提取翻译文件
ng extract-i18n

# 源代码分析
ng lint

# 使用特定TSLint配置
ng lint --tslint-config=path/to/tslint.json
```

### 测试命令

```bash
# 运行单元测试
ng test

# 单次运行测试
ng test --watch=false

# 代码覆盖率报告
ng test --code-coverage

# 运行端到端测试
ng e2e

# 使用特定配置
ng e2e --configuration=production
```

### 帮助与信息命令

```bash
# 查看命令帮助
ng help

# 查看特定命令帮助
ng generate --help

# CLI版本
ng version

# 详细依赖信息
ng version --verbose
```

## 代码生成器系统

Angular CLI提供了强大的代码生成器，可快速搭建项目骨架。

### 组件生成

```bash
# 基本组件
ng generate component my-component

# 简写形式
ng g c my-component

# 指定模块 
ng g c features/dashboard/widgets/status-widget --module=features/dashboard/dashboard.module

# 不生成测试文件
ng g c shared/footer --skip-tests

# 带路径的命名
ng g c admin/users/user-profile

# 其他选项
ng g c shared/buttons/primary-button --change-detection=OnPush --export --prefix=lib
```

### 指令、管道和服务

```bash
# 生成指令
ng g directive shared/directives/highlight

# 生成管道
ng g pipe shared/pipes/filter

# 生成服务
ng g service core/services/auth

# 带测试的服务
ng g service core/services/logging --spec
```

### 模块生成

```bash
# 基本模块
ng g module features/products

# 带路由的模块
ng g module features/orders --routing

# 带路由和组件的模块
ng g module features/customers --routing --route=customers --module=app.module
```

### 完整的特性生成

```bash
# 特性模块 (包含组件、路由、模块)
ng g module features/inventory --route inventory --module app.module

# 完整示例 - 生成用户管理功能
ng g module features/users --routing --route=users --module=app.module
ng g c features/users/user-list --change-detection=OnPush
ng g c features/users/user-detail --change-detection=OnPush
ng g c features/users/user-form --change-detection=OnPush
ng g interface features/users/models/user
ng g service features/users/services/user
ng g class features/users/models/user-state
```

### 自定义代码生成器

```typescript
// 创建自定义Schematic
ng generate @angular-devkit/schematics:schematic my-component-schematic

// 自定义生成器示例 - collection.json
{
  "schematics": {
    "feature-module": {
      "description": "Creates a feature module with routing and components",
      "factory": "./feature-module/index",
      "schema": "./feature-module/schema.json"
    }
  }
}

// schema.json
{
  "properties": {
    "name": {
      "type": "string",
      "description": "Feature module name",
      "x-prompt": "What is the name of the feature module?"
    },
    "path": {
      "type": "string",
      "default": "features"
    }
  },
  "required": ["name"]
}
```

## 配置管理

### angular.json详解

`angular.json`文件是工作区配置，控制CLI的行为：

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "enterprise-app": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "changeDetection": "OnPush"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/enterprise-app",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": [],
            "allowedCommonJsDependencies": [
              "lodash",
              "chart.js"
            ]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "2mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "outputHashing": "all"
            },
            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": true,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            }
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "enterprise-app:build"
          },
          "configurations": {
            "production": {
              "browserTarget": "enterprise-app:build:production"
            },
            "staging": {
              "browserTarget": "enterprise-app:build:staging"
            }
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "main": "src/test.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.spec.json",
            "karmaConfig": "karma.conf.js",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          }
        },
        "lint": {
          "builder": "@angular-eslint/builder:lint",
          "options": {
            "lintFilePatterns": [
              "src/**/*.ts",
              "src/**/*.html"
            ]
          }
        }
      }
    }
  }
}
```

**重要配置区域**：

- **schematics**: 定义生成器默认选项
- **architect.build.options**: 构建选项配置 
- **architect.build.configurations**: 不同环境构建配置
- **architect.serve**: 开发服务器配置
- **budgets**: 性能预算配置，控制包大小

### 环境配置管理

Angular支持多环境配置，便于在不同环境间切换：

```typescript
// environments/environment.ts (默认开发环境)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  featureFlags: {
    newUserInterface: true,
    experimentalFeatures: true
  },
  auth: {
    clientId: 'dev-client-id',
    authority: 'https://dev-auth-server.com',
    redirectUri: 'http://localhost:4200/callback'
  },
  logging: {
    level: 'debug',
    console: true,
    server: false
  }
};

// environments/environment.staging.ts
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.example.com',
  featureFlags: {
    newUserInterface: true,
    experimentalFeatures: false
  },
  auth: {
    clientId: 'staging-client-id',
    authority: 'https://staging-auth-server.com',
    redirectUri: 'https://staging.example.com/callback'
  },
  logging: {
    level: 'info',
    console: true,
    server: true
  }
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  featureFlags: {
    newUserInterface: true,
    experimentalFeatures: false
  },
  auth: {
    clientId: 'prod-client-id',
    authority: 'https://auth.example.com',
    redirectUri: 'https://example.com/callback'
  },
  logging: {
    level: 'error',
    console: false,
    server: true
  }
};
```

**定义新环境的步骤**：

1. 创建新的环境文件，如`environment.qa.ts`
2. 在`angular.json`中添加配置：

```json
"configurations": {
  "qa": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.qa.ts"
      }
    ],
    "optimization": true,
    "outputHashing": "all",
    "sourceMap": true
  }
}
```

3. 在package.json中添加便捷脚本：

```json
"scripts": {
  "start:qa": "ng serve --configuration=qa",
  "build:qa": "ng build --configuration=qa"
}
```

## 高级功能与优化

### 自定义构建器

可以创建自定义构建器(builders)扩展Angular CLI功能：

```typescript
// 自定义构建器示例
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

interface Options extends JsonObject {
  command: string;
  args?: string[];
}

export default createBuilder<Options>((options, context) => {
  return new Promise<BuilderOutput>((resolve) => {
    context.logger.info(`Executing command: ${options.command}`);
    
    // 执行自定义构建逻辑
    // ...
    
    resolve({ success: true });
  });
});
```

### 性能优化配置

**构建优化选项**：

```json
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    "optimization": true,
    "outputHashing": "all",
    "sourceMap": false,
    "namedChunks": false,
    "aot": true,
    "extractLicenses": true,
    "vendorChunk": false,
    "buildOptimizer": true,
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
    ]
  }
}
```

**常用优化技术**：

- **源码地图策略**:
```json
"sourceMap": {
  "hidden": true,
  "scripts": true,
  "styles": true
}
```

- **构建缓存启用**:
```json
"options": {
  "cache": true
}
```

- **构建并行化**:
```json
"options": {
  "buildOptimizer": true,
  "optimization": {
    "scripts": true,
    "styles": true,
    "fonts": true
  },
  "progress": false,
  "parallel": true
}
```

### 自定义Webpack配置

对于高级场景，可以扩展默认的Webpack配置：

```javascript
// extra-webpack.config.js
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};
```

在`angular.json`中引用自定义配置：

```json
"architect": {
  "build": {
    "builder": "@angular-builders/custom-webpack:browser",
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.js"
      }
    }
  },
  "serve": {
    "builder": "@angular-builders/custom-webpack:dev-server",
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.js"
      }
    }
  }
}
```

## 工作流优化

### Git挂钩集成

使用Husky和lint-staged优化提交工作流：

```bash
# 安装依赖
npm install husky lint-staged --save-dev
```

配置package.json：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "ng test --watch=false"
    }
  },
  "lint-staged": {
    "src/**/*.ts": [
      "ng lint --fix",
      "prettier --write"
    ],
    "src/**/*.html": [
      "prettier --write"
    ],
    "src/**/*.scss": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

### CI/CD管道配置

**GitHub Actions示例**：

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Test
      run: npm test -- --watch=false --browsers=ChromeHeadless
    
    - name: Build
      run: npm run build -- --configuration production
    
    - name: Deploy to staging
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      run: |
        # Deploy to staging environment
        npm run deploy:staging
```

### 快速原型开发

使用Angular CLI的原型功能快速测试想法：

```bash
# 安装原型依赖
npm install -g @angular/cli @schematics/angular

# 创建独立组件
ng generate component my-widget --inline-template --inline-style --standalone

# 创建原型项目
ng new prototype-app --minimal --skip-git --style=scss --routing=false
```

## 总结

Angular CLI不仅是一个简单的项目生成工具，它是一个全面的开发环境，涵盖了Angular应用开发生命周期的各个方面。通过合理使用CLI提供的功能，可以显著提高开发效率，保持代码质量，并简化部署流程。

```
┌─────────────────────────────────────────────────────┐
│               Angular CLI 开发工作流                │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│  初始化项目    │     │  生成代码       │
│                │     │                 │
│ ng new app-name│────▶│ ng generate     │
└─────────────────┘     └─────────────────┘
                             │
                             ▼
┌─────────────────┐     ┌─────────────────┐
│  本地开发      │     │  测试           │
│                │◀───▶│                 │
│ ng serve       │     │ ng test         │
└─────────────────┘     └─────────────────┘
       │                      │
       ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│  代码质量      │     │  构建生产版本   │
│                │     │                 │
│ ng lint        │────▶│ ng build --prod │
└─────────────────┘     └─────────────────┘
                             │
                             ▼
                     ┌─────────────────┐
                     │  部署应用      │
                     │                 │
                     │ (CI/CD系统)     │
                     └─────────────────┘
```
*图: Angular CLI工作流涵盖了从项目创建、开发、测试到构建部署的完整生命周期。* 