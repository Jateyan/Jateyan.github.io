---
title: Angular自定义指令与管道
description: Angular自定义指令与管道的开发指南，包括属性指令与结构指令开发、纯管道与非纯管道以及性能优化技巧
head:
  - - meta
    - name: keywords
      content: Angular, 自定义指令, 属性指令, 结构指令, 管道, 纯管道, 非纯管道, 性能优化
createTime: 2023/12/15 14:45:00
permalink: /article/angular-directives-pipes/
---

# Angular自定义指令与管道

在Angular开发中，指令和管道是两个强大的功能，它们可以扩展和增强HTML的能力，使开发人员能够创建更加丰富和交互式的Web应用程序。本文将详细介绍如何开发自定义指令和管道，以及如何优化它们的性能。

## 目录

- [属性指令开发](#属性指令开发)
- [结构指令高级开发](#结构指令高级开发)
- [纯管道与非纯管道](#纯管道与非纯管道)
- [管道性能优化](#管道性能优化)

## 属性指令开发

属性指令是用来改变元素外观或行为的指令。它们通常作为HTML元素的属性使用，不会改变DOM的结构，而是修改现有元素的特性或行为。

### 基本概念与创建流程

属性指令的创建流程包括：

```
创建指令类 ──> 添加@Directive装饰器 ──> 定义选择器 ──> 注入ElementRef等服务 ──> 实现指令逻辑 ──> 添加@Input定义参数 ──> 添加@HostListener监听事件 ──> 在模块中声明 ──> 在模板中使用
```

### 简单属性指令示例

下面是一个简单的高亮指令示例：

```typescript
// highlight.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]' // 选择器使用方括号表示属性选择器
})
export class HighlightDirective {
  @Input() appHighlight = ''; // 默认高亮颜色
  @Input() defaultColor = 'yellow'; // 默认颜色
  
  constructor(private el: ElementRef) {}
  
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight || this.defaultColor);
  }
  
  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }
  
  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

### 在模块中声明指令

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HighlightDirective } from './highlight.directive';

@NgModule({
  declarations: [
    AppComponent,
    HighlightDirective // 在模块中声明指令
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 在模板中使用指令

```html
<!-- app.component.html -->
<p appHighlight="lightblue">鼠标悬停时使用浅蓝色高亮</p>
<p [appHighlight]="'pink'" [defaultColor]="'lightyellow'">自定义高亮颜色</p>
```

### 高级属性指令功能

#### 1. 指令组合与依赖注入

指令可以使用Angular的依赖注入系统获取服务：

```typescript
// tooltip.directive.ts
@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() appTooltip = ''; // 提示文本
  
  private tooltipElement: HTMLElement;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private configService: TooltipConfigService // 注入自定义服务
  ) {}
  
  ngOnInit() {
    // 使用服务配置初始化
    const defaultConfig = this.configService.getDefaultConfig();
    // ...实现逻辑
  }
  
  ngOnDestroy() {
    // 清理工作
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
    }
  }
}
```

#### 2. 指令间通信

指令可以通过依赖注入与其他指令通信：

```typescript
// draggable.directive.ts
@Directive({
  selector: '[appDraggable]',
  exportAs: 'appDraggable' // 允许在模板中引用
})
export class DraggableDirective {
  isDragging = false;
  position = { x: 0, y: 0 };
  
  @Output() positionChange = new EventEmitter<{x: number, y: number}>();
  
  startDrag() { /* ... */ }
  endDrag() { /* ... */ }
}

// drag-handle.directive.ts
@Directive({
  selector: '[appDragHandle]'
})
export class DragHandleDirective {
  constructor(
    @Host() private draggable: DraggableDirective, // 注入宿主元素上的DraggableDirective
    private el: ElementRef
  ) {}
  
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // 调用宿主指令的方法
    this.draggable.startDrag();
  }
}
```

使用示例：

```html
<div appDraggable #drag="appDraggable" (positionChange)="onPositionChange($event)">
  <div appDragHandle>拖动我</div>
  <p>可拖动元素内容</p>
</div>
```

### 属性指令性能优化

#### 1. 避免频繁DOM操作

使用`Renderer2`代替直接操作DOM，提高性能和安全性：

```typescript
// 不推荐
this.el.nativeElement.style.backgroundColor = color;

// 推荐
this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
```

#### 2. 使用变更检测策略

在指令中实现`OnPush`策略相关的优化：

```typescript
@Directive({
  selector: '[appOptimized]'
})
export class OptimizedDirective implements OnInit {
  @Input() config: any;
  
  constructor(private cdRef: ChangeDetectorRef) {}
  
  // 当输入属性变化时手动处理更新
  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.updateWithoutDetection();
    }
  }
  
  private updateWithoutDetection() {
    this.cdRef.detach(); // 分离变更检测
    // 进行更新操作
    this.cdRef.reattach(); // 重新连接变更检测
  }
}
```

## 结构指令高级开发

结构指令通过添加、移除或操作DOM元素来修改页面布局。它们更强大，也更复杂，因为它们直接影响DOM结构。

### 结构指令基础

结构指令的基本原理：

```
*指令名称="表达式" ──> Angular解析微语法 ──> 转换为ng-template ──> [指令名称]="表达式" ──> 指令setter方法评估条件 ──> 创建或移除视图
```

### 自定义结构指令示例

以下是一个基本的`*appUnless`结构指令，其行为与`*ngIf`相反：

```typescript
// unless.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appUnless]'
})
export class UnlessDirective {
  private hasView = false;

  // 设置appUnless属性时会调用此setter
  @Input() set appUnless(condition: boolean) {
    if (!condition && !this.hasView) {
      // 条件为false且视图未创建时，创建视图
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (condition && this.hasView) {
      // 条件为true且视图已创建时，清除视图
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
  
  constructor(
    private templateRef: TemplateRef<any>, // 引用宿主元素内的模板
    private viewContainer: ViewContainerRef // 视图容器，模板将被插入到这里
  ) {}
}
```

### 结构指令与微语法

结构指令使用Angular的微语法（microsyntax），它是一种简洁的表达式语言，转换为更复杂的模板形式：

```html
<!-- 原始写法 -->
<div *appUnless="!isLoggedIn">欢迎回来!</div>

<!-- 转换后的等效形式 -->
<ng-template [appUnless]="!isLoggedIn">
  <div>欢迎回来!</div>
</ng-template>
```

### 高级结构指令开发

#### 1. 添加上下文变量

自定义结构指令可以提供与`ngFor`类似的上下文变量：

```typescript
// repeat.directive.ts
@Directive({
  selector: '[appRepeat]'
})
export class RepeatDirective {
  @Input() set appRepeat(count: number) {
    this.viewContainer.clear();
    
    for (let i = 0; i < count; i++) {
      // 创建嵌入式视图并传递上下文
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: `Item ${i + 1}`, // 隐式值
        index: i,                   // 显式命名值
        isFirst: i === 0,
        isLast: i === count - 1,
        isEven: i % 2 === 0,
        isOdd: i % 2 === 1
      });
    }
  }
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}
}
```

使用方式：

```html
<div *appRepeat="5; let item; let idx = index; let isFirst = isFirst">
  {{idx}}: {{item}} <span *ngIf="isFirst">(First Item!)</span>
</div>
```

#### 2. 复杂结构指令案例：延迟加载

创建一个延迟加载内容的结构指令：

```typescript
// delay-render.directive.ts
@Directive({
  selector: '[appDelayRender]'
})
export class DelayRenderDirective implements OnInit {
  @Input() appDelayRender: number = 0; // 延迟毫秒数
  @Input() appDelayRenderPlaceholder: TemplateRef<any>; // 占位符模板
  
  private hasRendered = false;
  private placeholderViewRef: EmbeddedViewRef<any> = null;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}
  
  ngOnInit() {
    // 先显示占位符
    if (this.appDelayRenderPlaceholder) {
      this.placeholderViewRef = this.viewContainer.createEmbeddedView(
        this.appDelayRenderPlaceholder
      );
    }
    
    // 延迟后渲染实际内容
    setTimeout(() => {
      this.viewContainer.clear(); // 清除占位符
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasRendered = true;
    }, this.appDelayRender);
  }
}
```

使用示例：

```html
<ng-template #loadingTpl>
  <div class="loading">正在加载...</div>
</ng-template>

<div *appDelayRender="2000; appDelayRenderPlaceholder: loadingTpl">
  这个内容将在2秒后显示
</div>
```

#### 3. 结构指令与动态视图操作

动态管理多个视图：

```typescript
// virtual-for.directive.ts
@Directive({
  selector: '[appVirtualFor]'
})
export class VirtualForDirective implements OnChanges {
  @Input() appVirtualForOf: any[] = [];
  @Input() appVirtualForTrackBy: TrackByFunction<any>;
  
  private viewReferences: Map<any, EmbeddedViewRef<any>> = new Map();
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['appVirtualForOf']) {
      this.updateViews();
    }
  }
  
  private updateViews() {
    if (!this.appVirtualForOf) return;
    
    // 创建新的Map存储视图
    const newViewRefs = new Map<any, EmbeddedViewRef<any>>();
    
    // 更新或创建视图
    this.appVirtualForOf.forEach((item, i) => {
      const key = this.appVirtualForTrackBy ? 
        this.appVirtualForTrackBy(i, item) : item;
      
      if (this.viewReferences.has(key)) {
        // 重用现有视图
        const viewRef = this.viewReferences.get(key);
        viewRef.context.item = item;
        viewRef.context.index = i;
        newViewRefs.set(key, viewRef);
        this.viewReferences.delete(key);
      } else {
        // 创建新视图
        const viewRef = this.viewContainer.createEmbeddedView(
          this.templateRef,
          { item, index: i }
        );
        newViewRefs.set(key, viewRef);
      }
    });
    
    // 移除不再使用的视图
    this.viewReferences.forEach(viewRef => {
      const index = this.viewContainer.indexOf(viewRef);
      if (index !== -1) {
        this.viewContainer.remove(index);
      }
    });
    
    // 存储新的视图引用
    this.viewReferences = newViewRefs;
    
    // 重新排序视图
    newViewRefs.forEach((viewRef, key) => {
      const index = this.appVirtualForOf.findIndex((item, i) => {
        return this.appVirtualForTrackBy ? 
          this.appVirtualForTrackBy(i, item) === key : item === key;
      });
      
      // 移动视图到正确位置
      const currentIndex = this.viewContainer.indexOf(viewRef);
      if (currentIndex !== -1 && currentIndex !== index) {
        this.viewContainer.move(viewRef, index);
      }
    });
  }
}
```

### 结构指令性能优化

结构指令性能优化的关键点：

1. **懒加载与视图复用**：复用现有视图而非重新创建，减少DOM操作

2. **TrackBy使用**：通过唯一标识符追踪项目，最小化DOM更新

3. **优化视图创建与销毁**：仅在必要时创建和销毁视图

4. **分离与重连变更检测**：在大量DOM操作过程中分离变更检测

## 纯管道与非纯管道

管道是Angular中用于转换数据显示的工具，允许在模板中声明性地转换值。Angular区分纯管道和非纯管道，它们有不同的变更检测行为和性能特性。

### 管道基础

管道的基本语法：

```html
{{ value | pipeName:arg1:arg2:... }}
```

### 创建自定义管道

创建管道的基本流程：

```
创建管道类 ──> 添加@Pipe装饰器 ──> 实现PipeTransform接口 ──> 在模块中声明 ──> 在模板中使用
```

#### 纯管道示例

纯管道只在输入值变化时执行，是默认行为：

```typescript
// capitalize.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  pure: true // 默认为true，可省略
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
```

使用示例：

```html
<p>{{ 'hello world' | capitalize }}</p> <!-- 输出: "Hello world" -->
```

#### 非纯管道示例

非纯管道在每个变更检测周期都会执行，适用于需要检测对象内部变化或异步操作的场景：

```typescript
// filter-list.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterList',
  pure: false // 设为非纯管道
})
export class FilterListPipe implements PipeTransform {
  transform(items: any[], searchTerm: string): any[] {
    if (!items || !searchTerm) {
      return items;
    }
    
    searchTerm = searchTerm.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm)
    );
  }
}
```

使用示例：

```html
<input type="text" [(ngModel)]="searchTerm">

<ul>
  <li *ngFor="let item of items | filterList:searchTerm">
    {{ item.name }}
  </li>
</ul>
```

### 纯管道与非纯管道的区别

纯管道和非纯管道的主要区别：

```
特性          | 纯管道                            | 非纯管道
-------------|----------------------------------|----------------------------------
变更检测触发   | 仅当输入值引用变化时             | 每个变更检测周期
性能          | 高（结果被缓存）                  | 较低（频繁执行）
使用场景       | 简单数据转换                      | 观察对象内部变化、异步操作
默认设置       | pure: true (默认)               | pure: false
内存占用       | 低                              | 可能较高
示例          | DatePipe, UpperCasePipe          | AsyncPipe, JsonPipe
```

### 纯管道的使用场景

纯管道适合以下场景：

1. **文本格式化**：大小写转换、截断、格式化
2. **数值格式化**：货币、百分比、小数点处理
3. **日期格式化**：各种日期显示格式
4. **简单的数据转换**：计算、转换单位等

### 非纯管道的使用场景

非纯管道适合以下场景：

1. **异步数据处理**：订阅Observable或Promise
2. **复杂对象的内部变化**：检测对象属性或数组元素的变化
3. **动态过滤或排序**：根据用户输入筛选列表
4. **实时更新**：需要频繁更新的数据

### 自定义异步管道示例

模拟AsyncPipe的实现：

```typescript
// custom-async.pipe.ts
@Pipe({
  name: 'customAsync',
  pure: false
})
export class CustomAsyncPipe implements PipeTransform, OnDestroy {
  private value: any = null;
  private subscription: Subscription = null;
  
  constructor(private ref: ChangeDetectorRef) {}
  
  transform(obj: Observable<any> | Promise<any> | null): any {
    if (!obj) {
      this.cleanup();
      return null;
    }
    
    if (obj !== this.obj) {
      this.cleanup();
      return this.subscribe(obj);
    }
    
    return this.value;
  }
  
  private subscribe(obj: Observable<any> | Promise<any>): any {
    this.obj = obj;
    
    if (obj instanceof Promise) {
      obj.then(value => {
        this.value = value;
        this.ref.markForCheck();
      });
      return this.value;
    }
    
    if (obj instanceof Observable) {
      this.subscription = obj.subscribe(
        value => {
          this.value = value;
          this.ref.markForCheck();
        },
        error => { throw error; }
      );
      return this.value;
    }
    
    return null;
  }
  
  private cleanup(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.obj = null;
    this.value = null;
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
}
```

## 管道性能优化

管道的性能对应用响应速度有重要影响，特别是在大型数据集或频繁更新的情况下。

### 管道性能优化技巧

#### 1. 优先使用纯管道

尽可能使用纯管道代替非纯管道，利用Angular的缓存机制：

```typescript
// 不推荐（对于简单转换）
@Pipe({
  name: 'simpleFormat',
  pure: false // 每次变更检测都会执行
})

// 推荐
@Pipe({
  name: 'simpleFormat',
  pure: true // 只在输入值变化时执行
})
```

#### 2. 对于集合处理，在组件中预处理

对于过滤和排序操作，考虑在组件中预处理数据：

```typescript
// 组件中
@Component({...})
export class ListComponent implements OnInit {
  rawItems: Item[];
  filteredItems: Item[];
  sortKey: string;
  filterText: string;
  
  ngOnInit() {
    this.updateFilteredList();
  }
  
  updateFilteredList() {
    // 先过滤
    let result = this.filterText ?
      this.rawItems.filter(item => item.name.includes(this.filterText)) :
      this.rawItems.slice();
      
    // 再排序
    if (this.sortKey) {
      result.sort((a, b) => a[this.sortKey] > b[this.sortKey] ? 1 : -1);
    }
    
    this.filteredItems = result;
  }
  
  onFilterChange(newFilter: string) {
    this.filterText = newFilter;
    this.updateFilteredList();
  }
}
```

模板中使用预处理的数据：

```html
<input (input)="onFilterChange($event.target.value)">
<ul>
  <li *ngFor="let item of filteredItems">{{item.name}}</li>
</ul>
```

#### 3. 使用记忆化技术

对于复杂计算，可以实现记忆化（memoization）：

```typescript
// memoize.pipe.ts
@Pipe({
  name: 'memoize'
})
export class MemoizePipe implements PipeTransform {
  private lastValue: any;
  private lastResult: any;
  
  transform(value: any, callback: (val: any) => any): any {
    if (value !== this.lastValue) {
      this.lastValue = value;
      this.lastResult = callback(value);
    }
    return this.lastResult;
  }
}
```

使用示例：

```html
<div>{{ complexValue | memoize:calculateResult }}</div>
```

#### 4. 优化非纯管道的订阅管理

确保非纯管道正确管理其订阅以避免内存泄漏：

```typescript
@Pipe({
  name: 'optimizedAsync',
  pure: false
})
export class OptimizedAsyncPipe implements PipeTransform, OnDestroy {
  private value: any = null;
  private subscription: Subscription = null;
  private hasSubscription = false;
  
  constructor(private ref: ChangeDetectorRef) {}
  
  transform(obj: Observable<any>): any {
    // 只有当输入引用变化时才更新订阅
    if (!this.hasSubscription && obj) {
      this.subscribe(obj);
      this.hasSubscription = true;
    }
    
    return this.value;
  }
  
  private subscribe(obj: Observable<any>): void {
    this.subscription = obj.pipe(
      // 使用适当的RxJS操作符提高性能
      distinctUntilChanged(),
      // 考虑添加debounceTime或throttleTime
    ).subscribe(
      value => {
        this.value = value;
        this.ref.markForCheck();
      }
    );
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

#### 5. 使用OnPush变更检测与管道结合

结合OnPush变更检测策略和纯管道可以极大提高性能：

```typescript
@Component({
  selector: 'app-optimized-list',
  template: `
    <div *ngFor="let item of items | optimizedFilter:filter">
      {{ item | formatItem }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedListComponent {
  @Input() items: any[];
  @Input() filter: string;
}
```

### 管道与指令的协同优化

将管道与指令结合使用可以提供更强大的功能和更好的性能：

```typescript
// highlight-search.pipe.ts
@Pipe({
  name: 'highlightSearch'
})
export class HighlightSearchPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search || !text) {
      return text;
    }
    
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}

// safe-html.directive.ts
@Directive({
  selector: '[appSafeHtml]'
})
export class SafeHtmlDirective {
  @Input() set appSafeHtml(html: string) {
    this.updateHTML(html);
  }
  
  constructor(
    private el: ElementRef,
    private sanitizer: DomSanitizer
  ) {}
  
  private updateHTML(html: string): void {
    // 先净化HTML防止XSS攻击
    const safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    // 使用renderer更新内容
    this.el.nativeElement.innerHTML = safeHtml;
  }
}
```

组合使用：

```html
<p [appSafeHtml]="content | highlightSearch:searchTerm"></p>
```

## 最佳实践总结

### 指令最佳实践

1. **单一职责原则**：每个指令应该只做一件事并做好
2. **明确的命名约定**：使用前缀防止名称冲突
3. **处理销毁**：实现OnDestroy接口清理资源
4. **组件交互**：使用@Input/@Output进行明确的数据流
5. **使用Renderer2**：避免直接操作DOM
6. **指令选择器**：为属性指令使用方括号，如`[appHighlight]`

### 管道最佳实践

1. **优先使用纯管道**：非纯管道会导致性能下降
2. **保持管道轻量**：管道应该执行简单、快速的转换
3. **不要在管道中有副作用**：管道应该是纯函数
4. **为复杂管道添加参数**：提高管道的可重用性
5. **组合使用多个管道**：`{{ value | pipe1 | pipe2:arg }}`
6. **在组件中处理大量数据**：避免在模板中使用非纯管道处理大数据集

## 参考资源

- [Angular官方文档 - 指令](https://angular.io/guide/attribute-directives)
- [Angular官方文档 - 管道](https://angular.io/guide/pipes)
- [Angular变更检测详解](./change-detection.md)
- [Angular性能优化指南](./performance-optimization.md) 