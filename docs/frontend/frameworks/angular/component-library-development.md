---
title: Angular组件库开发
description: 设计系统集成、API设计、版本控制、文档生成、示例开发、多主题支持与测试
head:
  - - meta
    - name: keywords
      content: Angular, 组件库, 设计系统, 主题定制, API设计, 版本控制, 组件测试
---

# Angular组件库开发

企业级Angular应用需要统一、高质量的组件库，以提高开发效率和保持产品的一致性。本文档将介绍如何构建专业的Angular组件库，从设计系统集成到组件测试的全流程指南。

## 目录

- [设计系统集成](#设计系统实现与集成)
  - [组件实现设计系统](#组件实现设计系统)
  - [设计系统与组件库架构](#设计系统与组件库架构)
  - [设计系统同步工具](#设计系统同步工具)
  - [响应式设计集成](#响应式设计集成)
- [API设计原则](#api设计原则)
  - [一致性原则](#一致性原则)
  - [最小API表面积](#最小api表面积)
  - [类型安全](#类型安全)
  - [属性命名约定](#属性命名约定)
  - [组合API设计图示](#组件api设计图示)
  - [优雅降级](#优雅降级)
  - [组件通信模式](#组件通信模式)
  - [API版本演进](#api版本演进)
- [版本控制](#版本控制)
  - [语义化版本控制](#语义化版本控制)
  - [版本发布流程](#版本发布流程)
  - [版本管理工具](#版本管理工具)
  - [废弃与迁移策略](#废弃与迁移策略)
  - [更新日志管理](#更新日志管理)
  - [多包管理](#多包管理)
  - [向后兼容性测试](#向后兼容性测试)
- [文档生成](#文档生成)
  - [文档工具选择](#文档工具选择)
  - [MDX文档](#mdx文档)
  - [自动API文档生成](#自动api文档生成)
  - [文档站点架构](#文档站点架构)
  - [交互式示例](#交互式示例)
  - [版本化文档](#版本化文档)
  - [自动化文档部署](#自动化文档部署)
  - [文档可访问性](#文档可访问性)
  - [文档搜索功能](#文档搜索功能)
- [示例开发](#示例开发)
  - [示例类型](#示例类型)
  - [示例应用](#示例应用)
  - [交互式演示](#交互式演示)
  - [代码示例](#代码示例)
  - [代码片段组件](#代码片段组件)
  - [在线沙箱环境](#在线沙箱环境)
  - [集成测试与示例](#集成测试与示例)
  - [复杂示例](#复杂示例)
  - [最佳实践示例](#最佳实践示例)
  - [示例最佳实践](#示例最佳实践)
- [多主题支持](#多主题支持)
  - [主题系统架构](#主题系统架构)
  - [CSS变量实现](#css变量实现)
  - [Sass Mixins](#sass-mixins)
  - [动态主题切换](#动态主题切换)
  - [主题切换组件](#主题切换组件)
  - [品牌定制](#品牌定制)
  - [动态应用品牌主题](#动态应用品牌主题)
  - [预设主题](#预设主题)
  - [主题配置界面](#主题配置界面)
- [单元测试与集成测试](#单元测试与集成测试)
  - [单元测试策略](#单元测试策略)
  - [集成测试](#集成测试)
  - [测试渲染一致性](#测试渲染一致性)
  - [无障碍性测试](#无障碍性测试)
  - [测试自动化与CI/CD集成](#测试自动化与cicd集成)
  - [持续监控质量指标](#持续监控质量指标)
- [自动化测试](#自动化测试)
- [参考资源](#参考资源)

## 设计系统实现与集成

### 组件实现设计系统

在Angular组件库中实现设计系统需要一个系统性的方法：

```typescript
// button.component.ts
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';

  // 计算CSS类
  get classes(): string[] {
    return [
      `btn-${this.variant}`,
      `btn-${this.size}`,
      this.disabled ? 'btn-disabled' : '',
      this.fullWidth ? 'btn-full-width' : ''
    ].filter(c => c);
  }

  constructor() {}

  ngOnInit(): void {}
}
```

```html
<!-- button.component.html -->
<button 
  [ngClass]="classes" 
  [disabled]="disabled"
  type="button">
  <ng-container *ngIf="icon && iconPosition === 'left'">
    <i class="material-icons">{{icon}}</i>
  </ng-container>
  <span class="btn-content">
    <ng-content></ng-content>
  </span>
  <ng-container *ngIf="icon && iconPosition === 'right'">
    <i class="material-icons">{{icon}}</i>
  </ng-container>
</button>
```

```scss
// button.component.scss
@import '../styles/variables';
@import '../styles/mixins';

:host {
  display: inline-block;
}

.btn {
  font-family: $font-family-base;
  font-weight: $font-weight-medium;
  border-radius: $border-radius-md;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  i.material-icons {
    font-size: inherit;
    display: inline-flex;
    align-items: center;
    margin-right: $spacing-xs;
  }
}

// 变体样式
.btn-primary {
  background-color: $color-primary;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: darken($color-primary, 10%);
  }
}

.btn-secondary {
  background-color: $color-secondary;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: darken($color-secondary, 10%);
  }
}

.btn-tertiary {
  background-color: transparent;
  color: $color-primary;
  
  &:hover:not(:disabled) {
    background-color: rgba($color-primary, 0.1);
  }
}

// 尺寸变体
.btn-small {
  font-size: $font-size-sm;
  padding: $spacing-xs $spacing-sm;
  height: 32px;
}

.btn-medium {
  font-size: $font-size-md;
  padding: $spacing-sm $spacing-md;
  height: 40px;
}

.btn-large {
  font-size: $font-size-lg;
  padding: $spacing-md $spacing-lg;
  height: 48px;
}

// 全宽按钮
.btn-full-width {
  width: 100%;
}
```

### 设计系统与组件库架构

组件库架构应当反映设计系统的层次结构，通常可以分为以下几层：

```
组件库架构
+------------------------+
|        应用层          |   <- 页面、模板、页面级组件
+------------------------+
|        组合层          |   <- 复合组件、表单、卡片、数据网格
+------------------------+
|        基础层          |   <- 按钮、输入框、选择器、标签等基础组件
+------------------------+
|        基础设施层      |   <- 设计令牌、样式系统、主题系统
+------------------------+
``` 

从设计系统到组件库的实现流程可以用以下图表表示：

```
设计系统到组件库的实现流程
+---------------+     +-------------------+     +-------------------+
|               |     |                   |     |                   |
| 设计系统规范  | --> | 设计令牌与变量定义 | --> | Angular组件实现   |
|               |     |                   |     |                   |
+---------------+     +-------------------+     +-------------------+
      |                       |                         |
      v                       v                         v
+---------------+     +-------------------+     +-------------------+
|               |     |                   |     |                   |
| Figma设计文件 |     | SCSS/CSS变量系统  |     | 组件库打包与发布  |
|               |     |                   |     |                   |
+---------------+     +-------------------+     +-------------------+
```

以按钮组件为例，从设计规范到实现的映射关系：

```
按钮设计规范到实现映射
+--------------------------------------+     +-----------------------------------+
|                                      |     |                                   |
|   设计规范 (Figma)                   |     |  Angular组件实现                   |
|   - 尺寸: Small, Medium, Large       |     |  @Input() size: string            |
|   - 变体: Primary, Secondary, Text   |     |  @Input() variant: string         |
|   - 状态: Default, Hover, Disabled   |     |  @Input() disabled: boolean       |
|   - 颜色: Brand, Success, Warning    |     |  @Input() color: string           |
|                                      |     |                                   |
+--------------------------------------+     +-----------------------------------+
```

### 设计系统同步工具

设计系统与代码实现的同步是一个常见挑战。推荐使用以下工具保持同步：

1. **Storybook Figma插件**：将Storybook组件直接在Figma中预览
2. **Figma Tokens**：将设计令牌从Figma导出到代码
3. **Zeroheight**：创建统一的设计系统文档

### 响应式设计集成

组件库应支持响应式设计，以适应不同屏幕尺寸：

```typescript
// responsive.service.ts
import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface BreakpointState {
  isXSmall: boolean;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isXLarge: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  readonly breakpoints$ = this.breakpointObserver
    .observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ])
    .pipe(
      map(result => {
        const breakpoints: BreakpointState = {
          isXSmall: result.breakpoints[Breakpoints.XSmall],
          isSmall: result.breakpoints[Breakpoints.Small],
          isMedium: result.breakpoints[Breakpoints.Medium],
          isLarge: result.breakpoints[Breakpoints.Large],
          isXLarge: result.breakpoints[Breakpoints.XLarge],
          screenSize: 'md'
        };
        
        // 确定当前屏幕尺寸
        if (breakpoints.isXSmall) {
          breakpoints.screenSize = 'xs';
        } else if (breakpoints.isSmall) {
          breakpoints.screenSize = 'sm';
        } else if (breakpoints.isMedium) {
          breakpoints.screenSize = 'md';
        } else if (breakpoints.isLarge) {
          breakpoints.screenSize = 'lg';
        } else if (breakpoints.isXLarge) {
          breakpoints.screenSize = 'xl';
        }
        
        return breakpoints;
      }),
      shareReplay(1)
    );
  
  constructor(private breakpointObserver: BreakpointObserver) {}
  
  /**
   * 根据不同的屏幕尺寸返回不同的值
   */
  getResponsiveValue<T>(config: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }): Observable<T> {
    return this.breakpoints$.pipe(
      map(bp => {
        if (bp.isXSmall && config.xs !== undefined) return config.xs;
        if (bp.isSmall && config.sm !== undefined) return config.sm;
        if (bp.isMedium && config.md !== undefined) return config.md;
        if (bp.isLarge && config.lg !== undefined) return config.lg;
        if (bp.isXLarge && config.xl !== undefined) return config.xl;
        return config.default;
      })
    );
  }
}
``` 

## API设计原则

良好的API设计能够显著提高组件库的可用性和开发体验。以下是设计Angular组件库API的关键原则：

### 一致性原则

API设计的一致性是确保组件库易于学习和使用的关键：

```typescript
// 一致性示例 - 按钮和输入框组件
// 好的实践：使用一致的属性命名
@Component({ selector: 'lib-button' })
export class ButtonComponent {
  @Input() disabled = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}

@Component({ selector: 'lib-input' })
export class InputComponent {
  @Input() disabled = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}

// 坏的实践：不一致的属性命名
@Component({ selector: 'lib-button' })
export class ButtonComponent {
  @Input() disabled = false;
  @Input() btnSize: 'small' | 'medium' | 'large' = 'medium';
}

@Component({ selector: 'lib-input' })
export class InputComponent {
  @Input() isDisabled = false;
  @Input() inputSize: 'sm' | 'md' | 'lg' = 'md';
}
```

实现一致性的关键策略：

1. **创建API设计规范文档**：记录命名约定、输入/输出属性模式和事件处理。
2. **使用公共基类或接口**：为相似组件定义共享接口。
3. **建立组件审查流程**：确保新组件遵循已建立的模式。

### 最小API表面积

组件API应该遵循最小表面积原则，只暴露必要的属性和方法：

```typescript
// 好的实践：最小API表面积
@Component({
  selector: 'lib-dropdown',
  template: `...`
})
export class DropdownComponent {
  // 公开的核心API
  @Input() items: DropdownItem[] = [];
  @Input() selectedItem?: DropdownItem;
  @Output() selectionChange = new EventEmitter<DropdownItem>();
  
  // 私有实现细节
  private _isOpen = false;
  private _closeDropdown() { /* ... */ }
}

// 坏的实践：暴露过多内部实现细节
@Component({
  selector: 'lib-dropdown',
  template: `...`
})
export class DropdownComponent {
  // 过度暴露的API
  @Input() items: DropdownItem[] = [];
  @Input() selectedItem?: DropdownItem;
  @Input() dropdownWidth: string = '100%';
  @Input() maxHeight: string = '300px';
  @Input() scrollBehavior: 'smooth' | 'auto' = 'auto';
  @Input() renderMethod: 'virtual' | 'static' = 'static';
  @Input() animationDuration: number = 300;
  @Input() closeOnOutsideClick: boolean = true;
  @Input() itemHeight: number = 40;
  @Input() isOpenByDefault: boolean = false;
  
  @Output() selectionChange = new EventEmitter<DropdownItem>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() scrollEnd = new EventEmitter<void>();
  
  // 过多的公共方法
  isOpen = false;
  toggle() { /* ... */ }
  closeDropdown() { /* ... */ }
  openDropdown() { /* ... */ }
  scrollToItem(item: DropdownItem) { /* ... */ }
  reset() { /* ... */ }
}
```

保持最小API表面积的策略：

1. **从用户需求出发**：根据使用场景设计API，而不是暴露所有可能的选项
2. **使用合理的默认值**：为大多数用例提供合理的默认行为
3. **隐藏实现细节**：将内部实现封装，只暴露必要的交互点
4. **采用渐进式API**：基本功能简单直接，高级功能通过额外参数提供

### 类型安全

利用TypeScript的类型系统确保API的类型安全：

```typescript
// 好的实践：使用类型安全的API
// 明确定义类型
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'lib-button',
  template: `...`
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  
  @Output() click = new EventEmitter<MouseEvent>();
}

// 坏的实践：使用any或过于宽松的类型
@Component({
  selector: 'lib-button',
  template: `...`
})
export class ButtonComponent {
  @Input() variant: any = 'primary'; // 使用any丢失类型安全
  @Input() size: string = 'medium';  // 过于宽松，允许任何字符串
  @Input() config: any;              // 使用any作为配置对象
  
  @Output() click = new EventEmitter();  // 未指定事件类型
}
```

提高类型安全的策略：

1. **使用联合类型代替字符串枚举**：提供自动完成和类型检查
2. **为复杂数据结构定义接口**：使用接口而不是any类型
3. **限制属性值范围**：使用联合类型限制有效值
4. **为事件发射器指定泛型类型**：明确定义事件数据结构
5. **利用TypeScript的高级类型**：使用Partial、Required、Pick等工具类型

### 属性命名约定

一致的属性命名约定可以提高API的可预测性：

```
属性命名约定表格
+----------------------+-------------------+-------------------+
| 属性类型             | 推荐命名风格       | 示例              |
+----------------------+-------------------+-------------------+
| 布尔值属性           | is/has/can前缀或   | disabled, isOpen, |
|                      | 描述状态的形容词   | canSubmit         |
+----------------------+-------------------+-------------------+
| 事件处理程序         | on前缀 + 动词      | onClick,          |
|                      |                   | onSelectionChange |
+----------------------+-------------------+-------------------+
| 数量/数值            | 名词 + 数量单位    | itemCount,        |
|                      |                   | maxLength         |
+----------------------+-------------------+-------------------+
| 回调函数             | 动词 + Handler    | clickHandler,     |
|                      |                   | submitHandler     |
+----------------------+-------------------+-------------------+
| 集合/数组            | 复数名词          | items, options,   |
|                      |                   | users             |
+----------------------+-------------------+-------------------+
```

命名约定的一致性策略：

1. **创建命名规范文档**：建立明确的命名约定指南
2. **使用lint规则强制执行**：配置ESLint规则验证命名约定
3. **执行代码审查**：确保新代码遵循约定
4. **建立属性命名词典**：为常见概念建立一致的术语表

### 组件API设计图示

以下是组件API设计的可视化表示：

```
组件API设计层次结构
+-------------------------+
| @Component装饰器       |
+-------------------------+
| 选择器 (selector)       |
| 模板 (template/URL)     |
| 样式 (styles/URLs)      |
| 变更检测策略            |
| 封装模式               |
+-------------------------+
          |
          v
+-------------------------+
| 输入属性 (@Input)       |
+-------------------------+
| 必需属性                |
| 可选属性                |
| 配置对象                |
| 内容投影                |
+-------------------------+
          |
          v
+-------------------------+
| 输出事件 (@Output)      |
+-------------------------+
| 状态变化事件            |
| 用户交互事件            |
| 生命周期事件            |
+-------------------------+
          |
          v
+-------------------------+
| 公共API方法             |
+-------------------------+
| 命令方法                |
| 查询方法                |
| 表单集成方法            |
+-------------------------+
```

### 优雅降级

设计API时应考虑优雅降级，确保在属性缺失或无效时仍能提供合理的行为：

```typescript
// 优雅降级示例
@Component({
  selector: 'lib-data-grid',
  template: `...`
})
export class DataGridComponent implements OnInit {
  // 输入属性
  @Input() data: any[] = [];  // 默认为空数组而非undefined
  @Input() columns: Column[] = [];
  @Input() pageSize = 10;     // 合理的默认值
  @Input() sortable = true;   // 功能默认启用
  
  // 验证并修正输入属性
  ngOnInit() {
    // 确保pageSize是有效值
    this.pageSize = Math.max(1, this.pageSize);
    
    // 如果未提供列定义但有数据，自动生成列
    if (this.columns.length === 0 && this.data.length > 0) {
      this.columns = this.generateColumnsFromData(this.data[0]);
    }
  }
  
  private generateColumnsFromData(dataItem: any): Column[] {
    // 从数据自动生成列定义的逻辑
    return Object.keys(dataItem).map(key => ({
      field: key,
      header: this.formatHeader(key),
      sortable: this.sortable
    }));
  }
  
  private formatHeader(key: string): string {
    // 将camelCase转换为人类可读的标题
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
}
```

优雅降级策略：

1. **提供合理的默认值**：为所有可选属性设置合理的默认值
2. **验证并修正输入**：在生命周期钩子中验证并修正无效输入
3. **自动调整行为**：根据可用数据自动调整组件行为
4. **降级渲染**：当理想资源不可用时提供替代渲染
5. **明确的错误处理**：为预期的错误场景提供友好的错误消息

### 组件通信模式

组件库应提供一致的组件通信模式：

```typescript
// 父子通信
@Component({
  selector: 'lib-parent',
  template: `
    <lib-child 
      [value]="value"
      (valueChange)="onValueChange($event)">
    </lib-child>
  `
})
export class ParentComponent {
  value = 'Initial value';
  
  onValueChange(newValue: string) {
    this.value = newValue;
  }
}

// 基于服务的通信
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRef = new BehaviorSubject<any>(null);
  dialogRef$ = this.dialogRef.asObservable();
  
  open(config: DialogConfig) {
    // 打开对话框的逻辑
    this.dialogRef.next(/* dialog reference */);
    return this.dialogRef$;
  }
  
  close() {
    // 关闭对话框的逻辑
    this.dialogRef.next(null);
  }
}

// 使用ContentChildren进行容器通信
@Component({
  selector: 'lib-tabs',
  template: `
    <div class="tabs-header">
      <div *ngFor="let tab of tabs" (click)="selectTab(tab)" 
           [class.active]="tab.active">
        {{tab.title}}
      </div>
    </div>
    <div class="tabs-body">
      <ng-container *ngFor="let tab of tabs">
        <div [hidden]="!tab.active">
          <ng-container [ngTemplateOutlet]="tab.content"></ng-container>
        </div>
      </ng-container>
    </div>
  `
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  
  ngAfterContentInit() {
    // 如果没有活动标签，激活第一个
    if (this.tabs.length && !this.tabs.find(tab => tab.active)) {
      this.selectTab(this.tabs.first);
    }
  }
  
  selectTab(tab: TabComponent) {
    this.tabs.forEach(t => t.active = false);
    tab.active = true;
  }
}
```

有效的组件通信策略：

1. **@Input/@Output属性**：用于父子组件通信
2. **服务共享**：用于非层次组件通信
3. **ContentChildren/ViewChildren**：用于容器组件与子组件通信
4. **组件存储模式**：使用RxJS实现可观察的组件状态
5. **上下文提供器**：使用依赖注入提供上下文数据

### API版本演进

设计组件API时考虑未来的扩展和演进：

```typescript
// 第一个版本
@Component({ selector: 'lib-notification' })
export class NotificationComponent {
  @Input() message = '';
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() duration = 3000;
}

// 版本2：添加新功能，保持向后兼容
@Component({ selector: 'lib-notification' })
export class NotificationComponent {
  @Input() message = '';
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() duration = 3000;
  
  // 新属性
  @Input() closable = false;
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  @Output() close = new EventEmitter<void>();
}

// 版本3：使用配置对象重构，同时保持原有API向后兼容
export interface NotificationConfig {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  closable?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  actions?: NotificationAction[];
  icon?: string;
  customClass?: string;
}

@Component({ selector: 'lib-notification' })
export class NotificationComponent implements OnInit {
  // 原有属性，保持向后兼容
  @Input() message = '';
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() duration = 3000;
  @Input() closable = false;
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  
  // 新的配置对象API
  @Input() config?: NotificationConfig;
  
  @Output() close = new EventEmitter<void>();
  
  // 内部配置对象
  private _config: NotificationConfig = {
    message: '',
    type: 'info',
    duration: 3000,
    closable: false,
    position: 'top-right'
  };
  
  ngOnInit() {
    // 合并配置
    if (this.config) {
      // 如果提供了config，优先使用config
      this._config = { ...this._config, ...this.config };
    } else {
      // 否则使用单独的属性
      this._config = {
        message: this.message,
        type: this.type,
        duration: this.duration,
        closable: this.closable,
        position: this.position
      };
    }
  }
}
```

API演进策略：

1. **保留向后兼容性**：添加新功能但不破坏现有API
2. **使用废弃标记**：标记即将移除的API，提供迁移路径
3. **提供兼容层**：为重大变更提供兼容适配器
4. **使用配置对象模式**：使用配置对象代替多个分散参数
5. **版本管理**：遵循语义化版本控制原则

通过遵循这些原则，可以创建直观、一致、可扩展的组件API，提高开发者体验并降低维护成本。

## 版本控制

对组件库进行有效的版本控制对于项目的稳定性和可维护性至关重要。本节将介绍组件库版本控制的关键方面。

### 语义化版本控制

组件库应遵循语义化版本控制（SemVer）原则，使版本号具有明确的含义：

```
版本号格式：主版本号.次版本号.修订号（MAJOR.MINOR.PATCH）

1. 主版本号：当进行不兼容的API更改时递增
2. 次版本号：当以向后兼容的方式添加功能时递增
3. 修订号：当进行向后兼容的错误修复时递增
```

```typescript
// package.json
{
  "name": "my-component-library",
  "version": "1.2.3", // 主版本.次版本.修订号
  "peerDependencies": {
    "@angular/core": "^16.0.0",
    "@angular/common": "^16.0.0"
  }
}
```

语义化版本控制的关键实践：

1. **严格遵循规则**：确保版本号变更符合语义化版本规范
2. **明确的兼容性承诺**：清晰地传达版本之间的兼容性保证
3. **预发布版本标识**：使用alpha、beta、rc等标识预发布版本
4. **主版本零作为初始开发阶段**：0.y.z版本表示API尚未稳定

### 版本发布流程

建立结构化的版本发布流程，确保质量和一致性：

```
版本发布流程图

+-------------------+     +--------------------+     +-------------------+
| 开发阶段          |     | 预发布阶段         |     | 发布阶段          |
+-------------------+     +--------------------+     +-------------------+
| 1. 功能开发       |     | 1. Alpha版本       |     | 1. 版本标记       |
| 2. 代码审查       | --> | 2. Beta版本        | --> | 2. 生成更新日志   |
| 3. 单元测试       |     | 3. 发布候选(RC)    |     | 3. NPM发布        |
| 4. 集成测试       |     | 4. 性能/兼容性测试 |     | 4. 文档更新       |
+-------------------+     +--------------------+     +-------------------+
```

版本发布检查清单：

1. **版本号更新**：根据更改类型正确更新package.json中的版本号
2. **依赖项检查**：确认所有依赖项版本正确设置
3. **测试通过**：确保所有单元测试和集成测试通过
4. **文档更新**：更新文档以反映新功能或变更
5. **更新日志生成**：生成详细的更新日志
6. **标记发布**：在版本控制系统中标记发布
7. **构建验证**：验证构建产物没有问题
8. **NPM发布**：发布到NPM注册表

### 版本管理工具

利用自动化工具简化版本管理：

```typescript
// 使用standard-version自动化版本管理
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:alpha": "standard-version --prerelease alpha"
  }
}

// 或使用lerna管理多包库
// lerna.json
{
  "packages": ["packages/*"],
  "version": "independent",
  "command": {
    "version": {
      "conventionalCommits": true,
      "changelogPreset": "angular"
    },
    "publish": {
      "npmClient": "npm",
      "registry": "https://registry.npmjs.org/",
      "message": "chore(release): publish"
    }
  }
}
```

```bash
# 使用changesets管理版本和更新日志
# 安装
npm install @changesets/cli -D

# 初始化
npx changeset init

# 创建变更集
npx changeset

# 发布
npx changeset version
npm publish
```

各工具的比较：

1. **standard-version**：适合单包库，基于Conventional Commits自动版本管理
2. **lerna**：适合多包库管理，支持单一版本或独立版本策略
3. **changesets**：适合多包库，提供更好的更新日志生成和预发布工作流

### 废弃与迁移策略

谨慎管理API的废弃和迁移，确保用户能够平滑过渡：

```typescript
// 1. 使用@deprecated JSDoc标记
/**
 * @deprecated 从2.0.0版本开始废弃，请使用NewComponent代替
 * 将在3.0.0版本中移除
 */
@Component({
  selector: 'lib-old-component',
  template: `...`
})
export class OldComponent { }

// 2. 提供迁移适配器
@Component({
  selector: 'lib-adapter',
  template: `
    <lib-new-component 
      [newProp]="oldProp" 
      (newEvent)="oldEvent.emit($event)">
    </lib-new-component>
  `
})
export class AdapterComponent {
  @Input() oldProp: any;
  @Output() oldEvent = new EventEmitter<any>();
}

// 3. 运行时警告
ngOnInit() {
  if (this.deprecatedProp !== undefined) {
    console.warn(
      'Warning: deprecatedProp has been deprecated and will be removed in the next major version. ' +
      'Please use newProp instead.'
    );
    // 自动适配
    this.newProp = this.deprecatedProp;
  }
}
```

废弃策略最佳实践：

1. **提前通知**：至少提前一个主版本宣布废弃计划
2. **明确迁移路径**：提供详细的迁移指南和示例
3. **运行时警告**：对废弃API显示控制台警告
4. **兼容层**：提供临时的兼容适配器
5. **迁移工具**：为复杂更改提供自动化迁移工具（如ng update）

### 更新日志管理

保持详细的更新日志，帮助用户理解版本之间的变化：

```markdown
<!-- CHANGELOG.md -->
# 更新日志

## [2.0.0] - 2023-06-15

### 破坏性变更
- **Button**: 重命名`type`属性为`variant`以避免与HTML按钮类型冲突
- **Dialog**: 重构对话框API，使用配置对象代替多个属性

### 功能
- **Tooltip**: 添加新的工具提示组件
- **DataGrid**: 添加虚拟滚动支持大数据集

### 修复
- **Select**: 修复在某些边缘情况下选择框不关闭的问题
- **Form**: 解决表单验证在动态表单中不触发的问题

## [1.2.0] - 2023-04-10

### 功能
- **Button**: 添加新的`icon`和`iconPosition`属性
- **Input**: 添加前缀和后缀支持
```

自动化更新日志生成：

```javascript
// .versionrc.js
module.exports = {
  types: [
    { type: 'feat', section: '特性' },
    { type: 'fix', section: '修复' },
    { type: 'docs', section: '文档' },
    { type: 'style', section: '样式' },
    { type: 'refactor', section: '重构' },
    { type: 'perf', section: '性能优化' },
    { type: 'test', section: '测试' },
    { type: 'build', section: '构建系统' },
    { type: 'ci', section: '持续集成' },
    { type: 'chore', hidden: true }
  ],
  releaseCommitMessageFormat: 'chore(release): {{currentTag}} [skip ci]'
};
```

更新日志最佳实践：

1. **分类变更**：将变更按类型分组（特性、修复、破坏性变更等）
2. **提供上下文**：解释变更的原因和影响
3. **链接相关资源**：提供相关问题或PR的链接
4. **突出重要变更**：明确标识需要用户注意的重要变更
5. **保持一致的格式**：使用一致的格式和术语

### 多包管理

对于大型组件库，考虑采用多包架构以实现更精细的版本控制：

```
多包架构结构
packages/
├── core/                # 核心组件和工具
│   ├── package.json     # 版本: 2.3.0
│   └── ...
├── forms/               # 表单组件
│   ├── package.json     # 版本: 1.5.2
│   └── ...
├── data/                # 数据组件
│   ├── package.json     # 版本: 1.2.0
│   └── ...
└── charts/              # 图表组件
    ├── package.json     # 版本: 0.9.5
    └── ...
```

多包管理的关键考虑因素：

1. **包间依赖**：明确定义包之间的依赖关系和版本要求
2. **变更影响分析**：了解一个包的变更如何影响依赖它的其他包
3. **发布策略**：确定是使用独立版本还是锁定版本
4. **工作区工具**：使用Yarn工作区、Lerna或pnpm进行管理

```javascript
// package.json (根目录)
{
  "name": "component-library-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "lerna run build",
    "test": "lerna run test",
    "publish": "lerna publish"
  },
  "devDependencies": {
    "lerna": "^6.0.0"
  }
}
```

### 向后兼容性测试

实施严格的向后兼容性测试，确保版本更新不会意外破坏现有应用：

```typescript
// version-compatibility.spec.ts
describe('向后兼容性测试', () => {
  describe('Button API', () => {
    it('应该支持v1.x的属性', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const button = fixture.nativeElement.querySelector('lib-button');
      
      // 测试v1.x API
      button.setAttribute('type', 'primary');
      button.setAttribute('size', 'large');
      
      fixture.detectChanges();
      
      // 验证属性仍按预期工作
      expect(button.classList.contains('btn-primary')).toBe(true);
      expect(button.classList.contains('btn-large')).toBe(true);
    });
    
    it('应该支持v2.x的新属性', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const button = fixture.nativeElement.querySelector('lib-button');
      
      // 测试v2.x API
      button.setAttribute('variant', 'primary');
      button.setAttribute('size', 'large');
      
      fixture.detectChanges();
      
      // 验证新旧属性都能工作
      expect(button.classList.contains('btn-primary')).toBe(true);
      expect(button.classList.contains('btn-large')).toBe(true);
    });
  });
});
```

自动化兼容性测试流程：

```
+---------------------------+     +------------------------+     +---------------------------+
| 版本比较                  |     | API使用检测            |     | 集成测试                  |
+---------------------------+     +------------------------+     +---------------------------+
| 1. 对比公共API定义        |     | 1. 静态分析代码使用    |     | 1. 使用旧版本API运行测试  |
| 2. 识别破坏性变更         | --> | 2. 收集使用模式        | --> | 2. 使用新版本API运行测试  |
| 3. 生成兼容性报告         |     | 3. 评估影响范围        |     | 3. 验证行为一致性         |
+---------------------------+     +------------------------+     +---------------------------+
```

向后兼容性测试策略：

1. **API契约测试**：验证组件API契约保持不变
2. **快照测试**：使用Jest快照测试验证渲染输出一致性
3. **示例应用测试**：在示例应用中验证新版本的兼容性
4. **降级测试**：测试从新版本降级到旧版本的场景
5. **自动升级测试**：验证自动升级工具的有效性

通过实施这些版本控制最佳实践，组件库可以在不断发展的同时保持与现有项目的兼容性，提供平滑的升级路径，并清晰地传达对稳定性的承诺。

## 文档生成

高质量的文档对于组件库的成功至关重要，它能够帮助用户理解组件的用法、API和最佳实践。

### 文档工具选择

为Angular组件库生成文档的常用工具：

1. **Storybook**：交互式组件展示和文档平台
   ```bash
   # 安装Storybook
   npx storybook init
   
   # 启动Storybook
   npm run storybook
   ```

2. **Compodoc**：针对Angular项目的文档生成工具
   ```bash
   # 安装Compodoc
   npm install -D @compodoc/compodoc
   
   # 生成文档
   npx compodoc -p tsconfig.json
   ```

3. **Docusaurus/VitePress/VuePress**：通用文档站点生成器
   ```bash
   # 安装VitePress
   npm install -D vitepress
   
   # 初始化
   npx vitepress init
   ```

#### Storybook配置示例

```javascript
// .storybook/main.js
module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: '@storybook/angular',
  staticDirs: ['../public'],
};
```

```typescript
// .storybook/preview.ts
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';

setCompodocJson(docJson);

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    inlineStories: true,
  },
  options: {
    storySort: {
      order: ['介绍', '设计系统', '组件', ['基础', '表单', '导航', '反馈', '数据展示']],
    },
  },
};
```

#### 组件故事示例

```typescript
// button.stories.ts
import { Meta, Story } from '@storybook/angular';
import { ButtonComponent } from '../components/button/button.component';

export default {
  title: '组件/基础/按钮',
  component: ButtonComponent,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: '按钮变体',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '按钮尺寸',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    icon: {
      control: { type: 'text' },
      description: '图标名称',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: '图标位置',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'left' },
      },
    },
    onClick: { action: 'clicked' },
  },
} as Meta;

const Template: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <lib-button 
      [variant]="variant" 
      [size]="size" 
      [disabled]="disabled"
      [icon]="icon"
      [iconPosition]="iconPosition"
      (click)="onClick($event)">
      {{label}}
    </lib-button>
  `,
});

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  size: 'medium',
  label: '主要按钮',
  disabled: false,
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  size: 'medium',
  label: '次要按钮',
  disabled: false,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  variant: 'primary',
  size: 'medium',
  label: '带图标的按钮',
  icon: 'star',
  iconPosition: 'left',
};

export const Disabled = Template.bind({});
Disabled.args = {
  variant: 'primary',
  size: 'medium',
  label: '禁用按钮',
  disabled: true,
};
```

### MDX文档

使用MDX格式结合代码和文档：

```jsx
// Button.stories.mdx
import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs';
import { ButtonComponent } from '../components/button/button.component';

<Meta
  title="组件/基础/按钮/文档"
  component={ButtonComponent}
/>

# 按钮组件

按钮组件用于触发操作或事件，如提交表单、打开对话框、取消操作或执行删除操作。

## 特性

- 多种预定义样式变体
- 支持不同尺寸
- 可包含图标
- 支持禁用状态
- 全宽模式

## 用法

```tsx
import { ButtonModule } from 'component-lib';

@NgModule({
  imports: [ButtonModule]
})
export class AppModule {}
```

```html
<lib-button variant="primary" size="medium">按钮文本</lib-button>
```

## 示例

### 基本按钮

<Canvas>
  <Story id="组件-基础-按钮--primary" />
</Canvas>

### 次要按钮

<Canvas>
  <Story id="组件-基础-按钮--secondary" />
</Canvas>

### 带图标的按钮

<Canvas>
  <Story id="组件-基础-按钮--with-icon" />
</Canvas>

### 禁用状态

<Canvas>
  <Story id="组件-基础-按钮--disabled" />
</Canvas>

## 属性

<ArgsTable of={ButtonComponent} />

## 最佳实践

- 使用明确的动词或短语作为按钮文本
- 主要操作使用主要按钮，次要操作使用次要按钮
- 在表单中，主要提交按钮应放在右侧
- 危险操作应使用警告或危险变体
```

### 自动API文档生成

使用JSDoc注释增强生成的API文档：

```typescript
/**
 * 按钮组件用于触发操作或事件。
 * 
 * @example
 * ```html
 * <lib-button variant="primary">提交</lib-button>
 * ```
 */
@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  /**
   * 按钮变体，决定按钮的样式。
   * - `primary`：主要按钮，用于主要操作
   * - `secondary`：次要按钮，用于次要操作
   * - `tertiary`：文本按钮，用于低优先级操作
   */
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  
  /**
   * 按钮尺寸。
   * @default 'medium'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  /**
   * 是否禁用按钮。禁用状态下，按钮不响应交互。
   */
  @Input() disabled = false;
  
  /**
   * 图标名称。如果提供，按钮将显示指定的图标。
   */
  @Input() icon?: string;
  
  /**
   * 图标位置，决定图标在文本的左侧还是右侧。
   * 仅当提供了`icon`属性时有效。
   */
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  /**
   * 按钮点击事件。
   * @event
   */
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  
  /**
   * 处理按钮点击事件并发出`buttonClick`事件。
   * @param event - 鼠标事件对象
   */
  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}
```

Compodoc可以基于这些注释生成详细的API文档：

```bash
# 生成API文档
npx compodoc -p tsconfig.json -s -o

# 说明:
# -p: 指定TypeScript配置文件
# -s: 启动文档服务器
# -o: 自动在浏览器中打开文档
```

Compodoc生成的文档包括：

1. **组件树和模块关系图**：可视化展示组件和模块的层次结构
2. **详细的API文档**：包括组件、指令、服务和管道的文档
3. **源代码查看**：直接在文档中浏览源代码
4. **使用示例**：从JSDoc注释中提取的示例代码
5. **覆盖率报告**：显示文档注释的覆盖率

### 文档站点架构

组织文档站点的典型结构：

```
文档站点结构
/
├── 首页                          # 组件库介绍和快速入门
├── 安装与配置                    # 安装指南和配置选项
├── 设计系统                      # 设计原则和系统概述
│   ├── 颜色                     # 颜色系统和使用指南
│   ├── 排版                     # 字体和文本样式
│   ├── 布局                     # 间距和布局系统
│   └── 图标                     # 图标库和使用方法
├── 组件                         # 组件文档
│   ├── 基础组件                 # 按钮、图标等基础组件
│   ├── 表单组件                 # 输入框、选择器等
│   ├── 导航组件                 # 菜单、标签页等
│   ├── 反馈组件                 # 警告、对话框等
│   └── 数据展示组件             # 表格、列表等
├── 指南                         # 使用指南和最佳实践
│   ├── 主题定制                 # 主题系统和定制方法
│   ├── 国际化                   # 多语言支持
│   ├── 可访问性                 # 可访问性指南
│   └── 迁移指南                 # 版本迁移指南
├── API参考                      # 详细API文档
└── 示例                         # 示例和演示
```

### 交互式示例

在文档中嵌入交互式示例能够大幅提升用户体验，使用户可以直接与组件交互并查看实时效果。以下是实现交互式示例的关键组件：

```typescript
// interactive-example.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { StackBlitzService } from './stackblitz.service';

@Component({
  selector: 'app-interactive-example',
  template: `
    <div class="example-container">
      <div class="example-preview">
        <ng-content></ng-content>
      </div>
      <div class="example-actions">
        <button class="code-toggle" (click)="toggleCode()">
          {{ showCode ? '隐藏代码' : '查看代码' }}
        </button>
        <button class="stackblitz-button" (click)="openInStackBlitz()">
          在StackBlitz中编辑
        </button>
      </div>
      <div class="example-code" *ngIf="showCode">
        <pre><code [innerHTML]="highlightedCode"></code></pre>
      </div>
    </div>
  `,
  styleUrls: ['./interactive-example.component.scss']
})
export class InteractiveExampleComponent implements OnInit {
  @Input() code: string;
  @Input() title: string;
  @Input() files: {[key: string]: string} = {};
  
  showCode = false;
  highlightedCode = '';
  
  constructor(private stackBlitzService: StackBlitzService) {}
  
  ngOnInit() {
    // 使用语法高亮库处理代码
    this.highlightedCode = this.highlightCode(this.code);
  }
  
  toggleCode() {
    this.showCode = !this.showCode;
  }
  
  openInStackBlitz() {
    this.stackBlitzService.openProject({
      title: this.title,
      description: '组件示例',
      files: this.files
    });
  }
  
  private highlightCode(code: string): string {
    // 这里可以使用Prism.js或Highlight.js等库
    // 简单实现，实际项目中应使用成熟的高亮库
    return this.escapeHtml(code)
      .replace(/import\s/g, '<span class="keyword">import</span> ')
      .replace(/export\s/g, '<span class="keyword">export</span> ')
      .replace(/class\s/g, '<span class="keyword">class</span> ')
      .replace(/extends\s/g, '<span class="keyword">extends</span> ')
      .replace(/implements\s/g, '<span class="keyword">implements</span> ')
      .replace(/constructor/g, '<span class="keyword">constructor</span>')
      .replace(/@Component/g, '<span class="decorator">@Component</span>')
      .replace(/@Input/g, '<span class="decorator">@Input</span>')
      .replace(/@Output/g, '<span class="decorator">@Output</span>')
      .replace(/\/\/.+/g, '<span class="comment">$&</span>');
  }
  
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
```

```scss
// interactive-example.component.scss
.example-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.example-preview {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
}

.example-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  
  button {
    margin-left: 0.5rem;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    
    &:hover {
      background-color: #e0e0e0;
    }
  }
  
  .code-toggle {
    background-color: transparent;
    color: #555;
  }
  
  .stackblitz-button {
    background-color: #007acc;
    color: white;
    
    &:hover {
      background-color: #0062a3;
    }
  }
}

.example-code {
  max-height: 400px;
  overflow: auto;
  background-color: #1e1e1e;
  
  pre {
    margin: 0;
    padding: 1rem;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #d4d4d4;
    
    .keyword { color: #569cd6; }
    .decorator { color: #c586c0; }
    .comment { color: #6a9955; }
    .string { color: #ce9178; }
    .number { color: #b5cea8; }
  }
}
```

#### 交互式配置演示

交互式配置演示允许用户实时调整组件参数并查看结果：

```typescript
// button-configuration-demo.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-button-configuration-demo',
  template: `
    <div class="configuration-demo">
      <div class="configuration-panel">
        <h3>按钮配置</h3>
        <form [formGroup]="configForm">
          <div class="form-group">
            <label for="variant">变体</label>
            <select id="variant" formControlName="variant">
              <option value="primary">主要</option>
              <option value="secondary">次要</option>
              <option value="tertiary">文本</option>
              <option value="danger">危险</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>邮箱</label>
            <lib-input formControlName="email" type="email"></lib-input>
            <lib-form-error *ngIf="userForm.get('email')?.errors?.required && userForm.get('email')?.touched">
              邮箱为必填项
            </lib-form-error>
            <lib-form-error *ngIf="userForm.get('email')?.errors?.email && userForm.get('email')?.touched">
              请输入有效的邮箱地址
            </lib-form-error>
          </div>
          
          <div class="form-group">
            <label>角色</label>
            <lib-select formControlName="role">
              <lib-option value="admin">管理员</lib-option>
              <lib-option value="editor">编辑者</lib-option>
              <lib-option value="viewer">查看者</lib-option>
            </lib-select>
          </div>
          
          <div class="form-group">
            <label>状态</label>
            <lib-radio-group formControlName="status">
              <lib-radio value="active">活跃</lib-radio>
              <lib-radio value="inactive">停用</lib-radio>
            </lib-radio-group>
          </div>
          
          <div class="dialog-footer">
            <lib-button variant="tertiary" (click)="cancelUserForm()">取消</lib-button>
            <lib-button variant="primary" type="submit" [disabled]="userForm.invalid">保存</lib-button>
          </div>
        </form>
      </lib-dialog>
      
      <!-- 删除确认对话框 -->
      <lib-confirm-dialog
        [visible]="showDeleteConfirm"
        title="删除用户"
        message="确定要删除此用户吗？此操作无法撤销。"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()"
      ></lib-confirm-dialog>
    </div>
  `,
  styles: [`
    .user-management {
      padding: 1rem;
    }
    
    .search-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
  `]
})
export class UserManagementDemoComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loading = false;
  totalUsers = 0;
  pageSize = 10;
  currentPage = 1;
  
  showUserForm = false;
  showDeleteConfirm = false;
  isEdit = false;
  selectedUser: User | null = null;
  
  userForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer'],
      status: ['active']
    });
  }
  
  ngOnInit() {
    // 模拟加载用户数据
    this.loadUsers();
  }
  
  loadUsers() {
    this.loading = true;
    
    // 模拟API请求
    setTimeout(() => {
      this.users = Array(30).fill(0).map((_, i) => ({
        id: i + 1,
        name: `用户${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: ['admin', 'editor', 'viewer'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.2 ? 'active' : 'inactive'
      }));
      
      this.totalUsers = this.users.length;
      this.filterUsers();
      this.loading = false;
    }, 1000);
  }
  
  filterUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    const filtered = this.searchTerm 
      ? this.users.filter(user => 
          user.name.includes(this.searchTerm) || 
          user.email.includes(this.searchTerm)
        )
      : [...this.users];
      
    this.totalUsers = filtered.length;
    this.filteredUsers = filtered.slice(start, start + this.pageSize);
  }
  
  searchUsers() {
    this.currentPage = 1;
    this.filterUsers();
  }
  
  onPageChange(page: number) {
    this.currentPage = page;
    this.filterUsers();
  }
  
  showAddUserForm() {
    this.isEdit = false;
    this.userForm.reset({
      id: null,
      name: '',
      email: '',
      role: 'viewer',
      status: 'active'
    });
    this.showUserForm = true;
  }
  
  editUser(user: User) {
    this.isEdit = true;
    this.selectedUser = user;
    this.userForm.setValue({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    this.showUserForm = true;
  }
  
  deleteUser(user: User) {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }
  
  saveUser() {
    if (this.userForm.invalid) return;
    
    const userData = this.userForm.value;
    
    if (this.isEdit && this.selectedUser) {
      // 更新用户
      const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (index !== -1) {
        this.users[index] = { ...userData };
      }
    } else {
      // 添加新用户
      const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
      this.users.unshift({ ...userData, id: newId });
    }
    
    this.filterUsers();
    this.showUserForm = false;
    this.selectedUser = null;
  }
  
  cancelUserForm() {
    this.showUserForm = false;
    this.selectedUser = null;
  }
  
  confirmDelete() {
    if (this.selectedUser) {
      this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
      this.filterUsers();
      this.showDeleteConfirm = false;
      this.selectedUser = null;
    }
  }
  
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.selectedUser = null;
  }
}
```

## 参考资源
