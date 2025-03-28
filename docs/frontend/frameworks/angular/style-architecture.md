---
title: style-architecture
createTime: 2025/03/28 12:36:53
permalink: /article/cde4np8c/
---
## 响应式设计

Angular应用的响应式设计策略确保应用能在各种设备和屏幕尺寸上提供一致且优化的用户体验。良好的响应式设计是企业级应用的基本要求，可以提高用户满意度并扩大应用的可用性。

### 响应式布局基础

#### 视口配置

在`index.html`中正确配置视口：

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

#### 响应式单位使用

使用相对单位而非固定单位：

```scss
.container {
  // 避免使用固定像素
  // width: 600px; ❌
  
  // 使用相对单位
  max-width: 90%; // 或 36rem
  margin: 0 auto;
  
  // 在更大屏幕上限制最大宽度
  @media (min-width: 768px) {
    max-width: 720px;
  }
}
```

#### 布局类型

1. **流式布局(Fluid Layout)**：
   使用百分比宽度，内容自动调整填充可用空间

2. **响应式布局(Responsive Layout)**：
   基于屏幕尺寸断点进行调整

3. **自适应布局(Adaptive Layout)**：
   在特定断点改变内容布局

### 媒体查询策略

#### 断点系统

创建标准断点系统：

```scss
// _breakpoints.scss
$breakpoints: (
  'xs': 0,        // 超小屏幕 (手机垂直方向)
  'sm': 576px,    // 小屏幕 (手机横向)
  'md': 768px,    // 中等屏幕 (平板垂直方向)
  'lg': 992px,    // 大屏幕 (平板横向/小桌面)
  'xl': 1200px,   // 特大屏幕 (桌面)
  'xxl': 1400px   // 超大屏幕 (大桌面)
);

// 创建媒体查询混合器
@mixin media-up($breakpoint) {
  $size: map-get($breakpoints, $breakpoint);
  @if $size {
    @media (min-width: $size) {
      @content;
    }
  } @else {
    @error "Unknown breakpoint: #{$breakpoint}";
  }
}

@mixin media-down($breakpoint) {
  $size: map-get($breakpoints, $breakpoint);
  @if $size {
    @media (max-width: $size - 0.02) {
      @content;
    }
  } @else {
    @error "Unknown breakpoint: #{$breakpoint}";
  }
}

@mixin media-between($min, $max) {
  $min-size: map-get($breakpoints, $min);
  $max-size: map-get($breakpoints, $max);
  @if $min-size and $max-size {
    @media (min-width: $min-size) and (max-width: $max-size - 0.02) {
      @content;
    }
  } @else {
    @error "Unknown breakpoint: #{$min} or #{$max}";
  }
}
```

在组件中使用：

```scss
.dashboard-card {
  width: 100%;
  
  @include media-up('md') {
    width: 48%;
  }
  
  @include media-up('lg') {
    width: 32%;
  }
  
  // 特定屏幕区间的样式
  @include media-between('sm', 'md') {
    padding: 12px;
  }
}
```

#### 移动优先方法

采用移动优先的开发方法，默认样式为移动设备设计，随后使用媒体查询增强大屏幕体验：

```scss
.product-grid {
  // 移动设备默认一列
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  // 平板设备两列
  @include media-up('md') {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // 桌面设备四列
  @include media-up('lg') {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 弹性布局技术

#### Flexbox布局

Flexbox是创建响应式组件的强大工具：

```scss
.feature-card {
  display: flex;
  flex-direction: column; // 移动设备垂直排列
  
  &__content {
    flex: 1; // 自动填充可用空间
  }
  
  @include media-up('md') {
    flex-direction: row; // 大屏幕水平排列
    
    &__image {
      width: 30%;
    }
    
    &__content {
      width: 70%;
    }
  }
}
```

#### CSS Grid布局

CSS Grid适合二维布局系统：

```scss
.dashboard {
  display: grid;
  gap: 16px;
  
  // 移动设备单列
  grid-template-columns: 1fr;
  
  // 平板设备两列
  @include media-up('md') {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // 桌面自适应列
  @include media-up('lg') {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  // 区域模板 - 大屏幕
  @include media-up('xl') {
    grid-template-areas:
      "header header header"
      "sidebar main main"
      "sidebar stats activity";
    grid-template-columns: 250px 1fr 1fr;
  }
  
  &__header {
    grid-area: header;
  }
  
  &__sidebar {
    grid-area: sidebar;
  }
  
  &__main {
    grid-area: main;
  }
}
```

### 响应式内容策略

#### 图像和媒体处理

使用响应式图片技术：

```html
<!-- 使用srcset和sizes属性 -->
<img 
  src="image-fallback.jpg" 
  srcset="image-small.jpg 400w,
          image-medium.jpg 800w,
          image-large.jpg 1200w" 
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  alt="响应式图像示例">

<!-- 或使用picture元素提供更多控制 -->
<picture>
  <source media="(min-width: 992px)" srcset="image-desktop.webp" type="image/webp">
  <source media="(min-width: 768px)" srcset="image-tablet.webp" type="image/webp">
  <source srcset="image-mobile.webp" type="image/webp">
  <img src="image-fallback.jpg" alt="响应式图像示例">
</picture>
```

在Angular组件中使用：

```typescript
@Component({
  selector: 'app-responsive-image',
  template: `
    <picture>
      <source media="(min-width: 992px)" [srcset]="desktopSrc">
      <source media="(min-width: 768px)" [srcset]="tabletSrc">
      <img [src]="mobileSrc" [alt]="alt">
    </picture>
  `
})
export class ResponsiveImageComponent {
  @Input() desktopSrc = '';
  @Input() tabletSrc = '';
  @Input() mobileSrc = '';
  @Input() alt = '';
}
```

#### 响应式排版

创建响应式排版系统：

```scss
:root {
  // 基本字体大小 - 移动设备
  font-size: 16px;
  
  // 平板设备调整
  @include media-up('md') {
    font-size: 17px;
  }
  
  // 桌面设备调整
  @include media-up('lg') {
    font-size: 18px;
  }
}

// 响应式标题大小
h1 {
  font-size: 1.75rem; // 28px 在移动设备
  
  @include media-up('md') {
    font-size: 2rem; // 34px 在平板设备
  }
  
  @include media-up('lg') {
    font-size: 2.5rem; // 45px 在桌面设备
  }
}
```

#### 内容优先级与隐藏

根据屏幕空间调整内容显示：

```scss
// 优先级内容类
.priority-content {
  // 总是显示
}

// 次要内容 - 在小屏幕上隐藏
.secondary-content {
  display: none;
  
  @include media-up('md') {
    display: block;
  }
}

// 移动设备特定内容
.mobile-only {
  display: block;
  
  @include media-up('md') {
    display: none;
  }
}

// 桌面设备特定内容
.desktop-only {
  display: none;
  
  @include media-up('lg') {
    display: block;
  }
}
```

### Angular中的响应式技术

#### 使用BreakpointObserver

Angular CDK提供了`BreakpointObserver`服务，用于响应式检测：

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-responsive-layout',
  template: `
    <div class="layout" [class.is-mobile]="isMobile" [class.is-tablet]="isTablet" [class.is-desktop]="isDesktop">
      <div class="sidebar" *ngIf="!isMobile">
        <!-- 侧边栏内容 -->
      </div>
      <div class="main">
        <!-- 主要内容 -->
      </div>
      <div class="drawer" *ngIf="isMobile">
        <!-- 移动设备抽屉菜单 -->
      </div>
    </div>
  `
})
export class ResponsiveLayoutComponent implements OnInit, OnDestroy {
  isMobile = false;
  isTablet = false;
  isDesktop = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(private breakpointObserver: BreakpointObserver) {}
  
  ngOnInit() {
    // 监听断点变化
    this.breakpointObserver.observe([
      Breakpoints.XSmall,       // (max-width: 599.98px)
      Breakpoints.Small,        // (min-width: 600px) and (max-width: 959.98px)
      Breakpoints.Medium,       // (min-width: 960px) and (max-width: 1279.98px)
      Breakpoints.Large,        // (min-width: 1280px) and (max-width: 1919.98px)
      Breakpoints.XLarge        // (min-width: 1920px)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.isMobile = result.breakpoints[Breakpoints.XSmall];
      this.isTablet = result.breakpoints[Breakpoints.Small];
      this.isDesktop = result.breakpoints[Breakpoints.Medium] || 
                      result.breakpoints[Breakpoints.Large] ||
                      result.breakpoints[Breakpoints.XLarge];
      
      // 根据屏幕尺寸调整布局
      this.updateLayout();
    });
  }
  
  private updateLayout() {
    // 实现基于断点的布局逻辑
    if (this.isMobile) {
      // 应用移动布局
    } else if (this.isTablet) {
      // 应用平板布局
    } else {
      // 应用桌面布局
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### 创建响应式服务

封装响应式逻辑到可复用服务：

```typescript
// responsive.service.ts
import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export enum DeviceType {
  Mobile,
  Tablet,
  Desktop
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private currentDeviceSubject = new BehaviorSubject<DeviceType>(DeviceType.Desktop);
  
  // 可观察的设备类型
  currentDevice$ = this.currentDeviceSubject.asObservable();
  
  // 各种屏幕尺寸的可观察对象
  isMobile$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  
  constructor(private breakpointObserver: BreakpointObserver) {
    // 监听断点变化
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(
      map(result => {
        // 确定当前设备类型
        if (result.breakpoints[Breakpoints.XSmall]) {
          return DeviceType.Mobile;
        }
        
        if (result.breakpoints[Breakpoints.Small]) {
          return DeviceType.Tablet;
        }
        
        return DeviceType.Desktop;
      }),
      distinctUntilChanged()
    ).subscribe(deviceType => {
      this.currentDeviceSubject.next(deviceType);
    });
    
    // 创建各种屏幕尺寸的Observable
    this.isMobile$ = this.currentDevice$.pipe(
      map(device => device === DeviceType.Mobile)
    );
    
    this.isTablet$ = this.currentDevice$.pipe(
      map(device => device === DeviceType.Tablet)
    );
    
    this.isDesktop$ = this.currentDevice$.pipe(
      map(device => device === DeviceType.Desktop)
    );
  }
  
  // 实用方法判断当前设备类型
  isMobile(): boolean {
    return this.currentDeviceSubject.value === DeviceType.Mobile;
  }
  
  isTablet(): boolean {
    return this.currentDeviceSubject.value === DeviceType.Tablet;
  }
  
  isDesktop(): boolean {
    return this.currentDeviceSubject.value === DeviceType.Desktop;
  }
}
```

在组件中使用：

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- 响应式导航 -->
      <app-navbar [compact]="(responsiveService.isMobile$ | async) === true"></app-navbar>
      
      <!-- 响应式布局 -->
      <div class="dashboard-content" [ngClass]="{
        'single-column': responsiveService.isMobile$ | async,
        'two-columns': responsiveService.isTablet$ | async,
        'three-columns': responsiveService.isDesktop$ | async
      }">
        <!-- 内容 -->
      </div>
    </div>
  `
})
export class DashboardComponent {
  constructor(public responsiveService: ResponsiveService) {}
}
```

### 响应式组件设计

#### 自适应组件模式

设计能够自适应父容器的组件：

```scss
.adaptive-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  &__header {
    display: flex;
    flex-wrap: wrap;
    
    &-title {
      flex: 1;
      min-width: 200px;
    }
    
    &-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    
    @include media-up('md') {
      flex-direction: row;
    }
  }
}
```

#### 功能检测与渐进增强

根据可用空间提供渐进增强功能：

```typescript
@Component({
  selector: 'app-data-table',
  template: `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <!-- 中等屏幕显示这些列 -->
          <th *ngIf="(responsiveService.isTablet$ | async) || (responsiveService.isDesktop$ | async)">描述</th>
          <!-- 仅桌面显示这些列 -->
          <th *ngIf="responsiveService.isDesktop$ | async">创建日期</th>
          <th *ngIf="responsiveService.isDesktop$ | async">状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of items">
          <td>{{item.id}}</td>
          <td>{{item.name}}</td>
          <td *ngIf="(responsiveService.isTablet$ | async) || (responsiveService.isDesktop$ | async)">
            {{item.description}}
          </td>
          <td *ngIf="responsiveService.isDesktop$ | async">{{item.created | date}}</td>
          <td *ngIf="responsiveService.isDesktop$ | async">{{item.status}}</td>
          <td>
            <!-- 移动视图简化的操作 -->
            <button *ngIf="responsiveService.isMobile$ | async" mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item>编辑</button>
              <button mat-menu-item>删除</button>
              <button mat-menu-item>查看详情</button>
            </mat-menu>
            
            <!-- 桌面视图完整的操作 -->
            <div *ngIf="!responsiveService.isMobile$ | async" class="action-buttons">
              <button mat-button>编辑</button>
              <button mat-button>删除</button>
              <button mat-button>查看详情</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class DataTableComponent {
  @Input() items: any[] = [];
  
  constructor(public responsiveService: ResponsiveService) {}
}
```

### 响应式设计最佳实践

1. **移动优先设计**：
   - 首先为移动设备设计
   - 随后逐步增强桌面体验
   - 确保核心功能在所有设备上可用

2. **性能优化**：
   - 针对移动设备优化图像(WebP格式、srcset属性)
   - 异步加载非关键资源
   - 减少不必要的大型依赖

3. **测试策略**：
   - 使用真实设备测试
   - 使用浏览器开发工具的设备模拟功能
   - 测试常见断点和边缘情况

4. **渐进增强**：
   - 确保基本功能对所有设备可用
   - 根据屏幕尺寸增加增强功能
   - 优雅降级复杂交互

5. **组件适应性设计**：
   - 设计能适应不同宽度的组件
   - 使用弹性布局技术(Flex/Grid)
   - 避免硬编码尺寸

### 响应式框架集成

将Bootstrap或Tailwind CSS等响应式框架与Angular集成：

```bash
# 安装Bootstrap
npm install bootstrap

# 在angular.json中添加
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]
```

使用Bootstrap栅格系统：

```html
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">
      <!-- 在手机上100%宽度，平板50%，桌面33% -->
      <app-feature-card></app-feature-card>
    </div>
  </div>
</div>
```

## 可访问性实践

在Angular应用中实现Web可访问性标准(WCAG)的最佳实践，确保应用对所有用户包括残障人士都可用。可访问性不仅是法律和道德要求，也能提升所有用户的用户体验，扩大应用受众。

### 可访问性基础

#### WCAG标准

Web内容可访问性指南(WCAG)是最广泛采用的可访问性标准，基于四个原则：

1. **可感知性(Perceivable)**：信息和用户界面组件必须以用户可以感知的方式呈现
2. **可操作性(Operable)**：用户界面组件和导航必须可操作
3. **可理解性(Understandable)**：信息和用户界面操作必须可理解
4. **健壮性(Robust)**：内容必须足够健壮，能被各种用户代理可靠解释

WCAG定义了三个符合级别：A(最低)、AA(标准)和AAA(最高)。企业应用通常应该至少达到AA级别。

### Angular无障碍支持

#### 语义HTML与ARIA

使用语义化HTML元素并结合ARIA属性：

```html
<!-- 不推荐 -->
<div (click)="navigate()">主页</div>

<!-- 推荐 -->
<a [routerLink]="['/home']" aria-current="page">主页</a>

<!-- 或带有ARIA角色的元素 -->
<div role="button" tabindex="0" 
     (click)="openDialog()" 
     (keydown.enter)="openDialog()"
     (keydown.space)="openDialog()"
     aria-label="打开设置">
  <mat-icon>settings</mat-icon>
</div>
```

#### 键盘可访问性

确保功能可通过键盘访问：

```typescript
@Component({
  selector: 'app-accessibility-demo',
  template: `
    <div class="card" 
         tabindex="0" 
         role="button"
         [attr.aria-pressed]="isSelected"
         (click)="toggleSelection()"
         (keydown.enter)="toggleSelection()"
         (keydown.space)="toggleSelection(); $event.preventDefault()">
      <span class="card-title">{{ title }}</span>
      <span class="card-description">{{ description }}</span>
    </div>
  `
})
export class AccessibilityDemoComponent {
  @Input() title = '';
  @Input() description = '';
  isSelected = false;
  
  toggleSelection() {
    this.isSelected = !this.isSelected;
  }
}
```

### 可访问性指令与组件

#### 焦点管理

创建焦点管理指令：

```typescript
@Directive({
  selector: '[appFocusTrap]'
})
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  
  @Input() autoFocus = true;
  
  constructor(private elementRef: ElementRef) {}
  
  ngAfterViewInit() {
    // 延迟执行以确保DOM已完全渲染
    setTimeout(() => {
      this.trapFocus();
    });
  }
  
  private trapFocus() {
    const focusableElements = this.elementRef.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (this.autoFocus) {
        this.firstFocusableElement.focus();
      }
      
      // 添加键盘事件处理器
      this.elementRef.nativeElement.addEventListener('keydown', this.handleKeydown);
    }
  }
  
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    
    if (event.shiftKey) { // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement?.focus();
        event.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement?.focus();
        event.preventDefault();
      }
    }
  }
  
  ngOnDestroy() {
    this.elementRef.nativeElement.removeEventListener('keydown', this.handleKeydown);
  }
}
```

使用该指令：

```html
<div class="modal" appFocusTrap>
  <h2 id="dialog-title">设置</h2>
  <button>保存</button>
  <button>取消</button>
</div>
```

#### 跳过导航

为键盘用户添加跳过导航链接：

```html
<a class="skip-link" href="#main-content">
  跳到主要内容
</a>

<header><!-- 头部导航 --></header>

<main id="main-content" tabindex="-1">
  <!-- 主要内容 -->
</main>
```

```scss
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: white;
  padding: 8px;
  z-index: 100;
  
  &:focus {
    top: 0;
  }
}
```

### 色彩与对比度

#### 对比度检查

确保文本和背景之间有足够对比度：

```scss
// 不良对比: 浅灰色文本在白色背景上
.low-contrast {
  color: #aaaaaa; // 灰色
  background-color: #ffffff; // 白色
  // 对比度约为2.3:1 (不符合WCAG AA级别)
}

// 良好对比: 深灰色文本在白色背景上
.good-contrast {
  color: #595959; // 深灰色
  background-color: #ffffff; // 白色
  // 对比度约为7:1 (符合WCAG AAA级别)
}
```

#### 不依赖颜色的信息传达

除了颜色外，添加其他视觉提示：

```html
<div class="status-indicator" 
     [class.status-error]="hasError"
     [attr.aria-label]="hasError ? '错误状态' : '正常状态'">
  
  <!-- 使用图标和文本，而不仅仅是颜色 -->
  <mat-icon>{{ hasError ? 'error' : 'check_circle' }}</mat-icon>
  <span>{{ hasError ? '出错了' : '成功' }}</span>
</div>
```

```scss
.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  
  &.status-error {
    background-color: #ffebee; // 浅红色背景
    color: #d32f2f; // 深红色文本
    border-left: 4px solid #d32f2f; // 边框视觉提示
  }
}
```

### 表单可访问性

#### 标签和控件关联

确保每个表单控件都有关联的标签：

```html
<!-- 不推荐 -->
<div>
  用户名
  <input type="text" [(ngModel)]="username">
</div>

<!-- 推荐 -->
<div>
  <label for="username">用户名</label>
  <input id="username" type="text" [(ngModel)]="username">
</div>

<!-- 或使用aria-labelledby -->
<div>
  <span id="username-label">用户名</span>
  <input type="text" aria-labelledby="username-label" [(ngModel)]="username">
</div>
```

#### 错误提示

提供清晰的错误提示：

```html
<form [formGroup]="userForm">
  <div class="form-group">
    <label for="email">电子邮件</label>
    <input id="email" type="email" formControlName="email"
           [attr.aria-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
           [attr.aria-describedby]="userForm.get('email')?.invalid && userForm.get('email')?.touched ? 'email-error' : null">
    
    <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched"
         id="email-error"
         class="error-message"
         role="alert">
      <ng-container [ngSwitch]="true">
        <ng-container *ngSwitchCase="userForm.get('email')?.hasError('required')">
          请输入电子邮件地址
        </ng-container>
        <ng-container *ngSwitchCase="userForm.get('email')?.hasError('email')">
          请输入有效的电子邮件地址
        </ng-container>
      </ng-container>
    </div>
  </div>
</form>
```

#### 自动完成属性

使用`autocomplete`属性帮助表单填充：

```html
<form>
  <input type="text" name="name" autocomplete="name" placeholder="姓名">
  <input type="email" name="email" autocomplete="email" placeholder="电子邮件">
  <input type="tel" name="phone" autocomplete="tel" placeholder="电话号码">
  <input type="text" name="address" autocomplete="street-address" placeholder="地址">
</form>
```

### 媒体可访问性

#### 图像替代文本

为所有非装饰性图像提供替代文本：

```html
<!-- 有意义的图像需要alt文本 -->
<img [src]="product.imageUrl" [alt]="product.name + '产品图片'">

<!-- 装饰性图像使用空alt -->
<img src="decorative-divider.png" alt="" role="presentation">
```

#### 视频字幕与音频转写

为视频提供字幕：

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="subtitles" src="captions.vtt" srclang="zh" label="中文" default>
</video>
```

### 常见UI组件的可访问性

#### 对话框可访问性

实现可访问的对话框：

```typescript
@Component({
  selector: 'app-accessible-dialog',
  template: `
    <div *ngIf="isOpen" class="dialog-backdrop" (click)="closeOnBackdrop && close()">
      <div class="dialog"
           role="dialog"
           aria-modal="true"
           [attr.aria-labelledby]="titleId"
           [attr.aria-describedby]="descriptionId"
           (click)="$event.stopPropagation()"
           appFocusTrap>
        
        <div class="dialog-header">
          <h2 [id]="titleId">{{title}}</h2>
          <button class="close-button"
                  aria-label="关闭对话框"
                  (click)="close()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div [id]="descriptionId" class="dialog-content">
          <ng-content></ng-content>
        </div>
        
        <div class="dialog-actions">
          <ng-content select="[dialog-actions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class AccessibleDialogComponent {
  @Input() title = '对话框';
  @Input() closeOnBackdrop = true;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  
  titleId = `dialog-title-${uniqueId()}`;
  descriptionId = `dialog-desc-${uniqueId()}`;
  
  private previouslyFocusedElement: HTMLElement | null = null;
  
  ngOnInit() {
    if (this.isOpen) {
      this.onOpen();
    }
  }
  
  onOpen() {
    // 保存当前焦点元素
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // 阻止背景滚动
    document.body.style.overflow = 'hidden';
    
    // 监听Escape键
    document.addEventListener('keydown', this.handleKeydown);
  }
  
  close() {
    this.isOpen = false;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeydown);
    
    // 恢复焦点
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
    
    this.closed.emit();
  }
  
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.close();
    }
  }
  
  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.body.style.overflow = '';
  }
}

// 生成唯一ID的辅助函数
function uniqueId(): string {
  return Math.random().toString(36).substring(2, 11);
}
```

### 可访问性审查清单

Angular项目可访问性审查清单：

1. **语义HTML**
   - 使用适当的HTML5语义元素
   - 标题层次合理(h1-h6)
   - 表单元素有关联标签
   - 列表使用ul/ol/li
   
2. **键盘可访问性**
   - 所有交互元素可通过键盘访问和操作
   - 焦点顺序合理
   - 焦点状态可见 
   - 模态对话框正确捕获焦点
   
3. **替代文本**
   - 图像有意义的alt属性
   - SVG和Canvas有替代描述
   
4. **颜色和对比度**
   - 文本对比度符合WCAG AA标准(4.5:1)
   - 不单独依赖颜色传递信息
   - 高对比度焦点状态
   
5. **ARIA属性和角色**
   - 正确使用ARIA角色和属性
   - 自定义控件有适当的ARIA标签
   - 动态内容更新使用aria-live
   
6. **表单**
   - 表单控件有关联标签
   - 错误提示明确且与表单字段关联
   - 必填字段有明确标识
   - 提交按钮有明确标签
   
7. **多媒体**
   - 视频有字幕
   - 音频有文本转录
   
8. **响应式和移动可访问性**
   - 在小屏幕上内容可访问
   - 触摸目标尺寸足够(至少44x44px)
   - 支持放大到200%不丢失功能

### 可访问性测试方法

1. **键盘测试**
   - 确认所有功能可通过键盘访问
   - 检查Tab顺序逻辑性
   - 验证焦点指示器是否清晰可见

2. **屏幕阅读器测试**
   - 使用主流屏幕阅读器(如NVDA、VoiceOver)
   - 确认页面结构能被正确理解
   - 验证动态内容变化能被正确通知

3. **自动化测试**
   - 使用Axe、WAVE等工具进行初步检测
   - 自动化测试集成到CI/CD流程
   - 修复自动测试发现的问题

4. **手动检查清单**
   - 对比度和颜色使用
   - 文本替代和辅助文本
   - 标题层次结构
   - 表单标签和说明

5. **用户测试**
   - 邀请有残障的用户参与测试
   - 收集实际使用场景中的反馈
   - 根据真实用户体验进行改进

### 可访问性的重要性可视化

```
┌───────────────────────────────────────────┐
│       可访问性受益群体 (主要类别)          │
├───────────────┬───────────────┬───────────┤
│ 视觉障碍      │ 听觉障碍      │ 运动障碍  │
├───────────────┼───────────────┼───────────┤
│ • 盲人        │ • 耳聋        │ • 肢体    │
│ • 色盲        │ • 听力障碍    │   障碍    │
│ • 弱视        │               │ • 精细    │
│               │               │   运动    │
│               │               │   控制    │
│               │               │   困难    │
└───────────────┴───────────────┴───────────┘
        │               │             │
        ▼               ▼             ▼
┌───────────────┬───────────────┬───────────┐
│ 解决方案      │ 解决方案      │ 解决方案  │
├───────────────┼───────────────┼───────────┤
│ • 屏幕阅读器  │ • 视频字幕    │ • 键盘    │
│ • 高对比度    │ • 音频转录    │   导航    │
│ • 文本替代    │ • 视觉提示    │ • 大点击  │
│               │               │   目标    │
└───────────────┴───────────────┴───────────┘
```

### 可访问性资源与工具

- [Angular可访问性指南](https://angular.io/guide/accessibility)
- [WCAG快速参考](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe开发者工具](https://www.deque.com/axe/)
- [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA屏幕阅读器](https://www.nvaccess.org/)
- [色彩对比度检查工具](https://webaim.org/resources/contrastchecker/) 