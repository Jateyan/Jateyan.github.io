# Flex 布局完全指南

## 1. 基本概念

### 1.1 容器与项目
<details>
<summary>Flex容器与项目的关系</summary>

```html
<!-- 容器设置为flex布局，直接子元素自动成为flex项目 -->
<div class="container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>

<style>
.container {
  display: flex; /* 定义flex容器 */
}
.item {
  /* 自动成为flex项目 */
}
</style>
```
</details>

### 1.2 主轴与交叉轴
<details>
<summary>双轴系统示意图</summary>

```css
/* 主轴方向由flex-direction决定 */
.container {
  flex-direction: row; /* 主轴水平方向 */
  justify-content: center; /* 主轴对齐方式 */
  align-items: center;    /* 交叉轴对齐方式 */
}

/* 当flex-direction为column时 */
.vertical-container {
  flex-direction: column; /* 主轴变为垂直方向 */
  justify-content: space-between; /* 控制垂直方向排列 */
  align-items: flex-end;  /* 控制水平方向对齐 */
}
```
</details>

## 2. 容器属性详解

### 2.1 flex-direction
<details>
<summary>主轴方向控制</summary>

```css
.container {
  /* 可选值：row | row-reverse | column | column-reverse */
  flex-direction: row-reverse;
  
  /* 效果：
  1. 主轴方向从右到左
  2. 项目排列顺序反转
  3. 交叉轴方向不变 */
}
```
</details>

### 2.2 justify-content
<details>
<summary>主轴对齐方式</summary>

```css
.container {
  /* 可选值：flex-start | flex-end | center | space-between | space-around | space-evenly */
  justify-content: space-around;
  
  /* 空间分配规则：
  - space-between: 项目间等距，首尾贴边
  - space-around: 项目两侧等距
  - space-evenly: 所有间隔完全相等 */
}
```
</details>

### 2.3 align-items
<details>
<summary>交叉轴对齐方式</summary>

```css
.container {
  /* 可选值：stretch | flex-start | flex-end | center | baseline */
  align-items: stretch;
  
  /* 特殊值说明：
  - stretch: 默认值，项目撑满容器高度
  - baseline: 按项目第一行文字基线对齐 */
}
```
</details>

## 3. 项目属性详解

### 3.1 flex-grow
<details>
<summary>扩展比例计算</summary>

```css
.item {
  flex-grow: 1; /* 默认0不扩展 */
  
  /* 计算规则：
  剩余空间 = 容器大小 - 所有项目总大小
  分配比例 = 项目flex-grow值 / 所有项目flex-grow总和 */
}

/* 示例：三个项目flex-grow分别为1,2,3 
剩余空间将按1:2:3分配 */
```
</details>

### 3.2 flex-shrink
<details>
<summary>收缩比例计算</summary>

```css
.item {
  flex-shrink: 1; /* 默认1允许收缩 */
  
  /* 计算规则：
  总权重 = Σ(项目宽度 × flex-shrink)
  收缩量 = (超出的负空间 × 项目权重) / 总权重 */
}

/* 示例：容器宽度400px，三个项目各200px
总超出200px，若flex-shrink都为1
每个项目收缩66.66px */
```
</details>

## 4. 常见布局案例

### 4.1 圣杯布局
<details>
<summary>经典三栏布局实现</summary>

```html
<div class="holy-grail">
  <header>Header</header>
  <div class="content">
    <main>Main Content</main>
    <nav>Navigation</nav>
    <aside>Sidebar</aside>
  </div>
  <footer>Footer</footer>
</div>

<style>
.holy-grail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;  /* 填充剩余空间 */
  display: flex;
}

main {
  flex: 1;  /* 主内容区自适应 */
  order: 2; /* 控制显示顺序 */
}

nav {
  width: 200px;
  order: 1; /* 左侧导航 */
}

aside {
  width: 300px;
  order: 3; /* 右侧边栏 */
}
</style>
```
</details>

### 4.2 垂直居中
<details>
<summary>经典居中方案</summary>

```css
.container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  height: 100vh;          /* 需要明确容器高度 */
}

/* 多项目居中时 */
.multi-items {
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```
</details>

## 5. 高级技巧

### 5.1 响应式布局
<details>
<summary>自适应布局方案</summary>

```css
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 1 1 300px; /* 基础300px，可伸缩 */
  /* 计算公式：
  min-width: 300px;
  max-width: calc(100% - 20px); */
}

@media (max-width: 768px) {
  .grid {
    flex-direction: column;
  }
}
```
</details>

### 5.2 等高列
<details>
<summary>等高列实现原理</summary>

```css
.equal-height {
  display: flex;
}

/* 自动实现等高原理：
flex容器会默认将项目拉伸到容器高度 */
```
</details>

> **兼容性提示**：现代浏览器均支持Flex布局，IE10需要-ms-前缀。建议使用Autoprefixer自动处理兼容性问题。


