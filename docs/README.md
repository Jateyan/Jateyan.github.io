---
pageLayout: home
externalLinkIcon: false
config:
  -
    type: hero
    full: true
    background: gradient
    hero:
      name: 柠檬小站22
      tagline: 前端全栈修炼手册
      text: 以组件构建界面，用算法驱动交互，以工程化提升效能
      image: /images/hero-image.svg
      actions:
        -
          theme: brand
          text: 开始探索
          link: /guide/
        -
          theme: alt
          text: 技术博客
          link: /blog/
        -
          theme: alt
          text: Github →
          link: https://github.com/Jateyan
  -
    type: features
    features:
      -
        title: 前端工程化
        details: 从项目搭建到自动化部署，掌握现代前端开发全流程
        icon: 🛠️
      -
        title: 框架精通
        details: Vue、React、Angular深度剖析与最佳实践
        icon: ⚛️
      -
        title: 性能优化
        details: 渲染性能、首屏加载、资源优化的专业解决方案
        icon: ⚡
      -
        title: 全栈开发
        details: Node.js后端开发与数据库设计，打造完整技术栈
        icon: 📚
  -
    type: mdContent
    content: |
      ## 最新文章
      
      <PostList 
        :count="3" 
        :excerptLength="200"
        :categoryFilter="['前端', '工程化', '性能优化']"
      />
      
      ## 技术栈
      
      ```mermaid
      graph TD
        A[前端开发] --> B[框架]
        A --> C[工程化]
        A --> D[性能优化]
        B --> E[Vue]
        B --> F[React]
        B --> G[Angular]
        C --> H[Webpack/Vite]
        C --> I[CI/CD]
        C --> J[代码规范]
        D --> K[渲染优化]
        D --> L[网络优化]
        D --> M[资源优化]
      ```
---
