import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  {
    text: "首页",
    link: "/",
  },
  {
    text: "指南",
    link: "/guide/",
  },
  {
    text: "前端技术",
    items: [
      {
        text: "基础",
        items: [
          { text: "HTML", link: "/frontend/basics/html/" },
          { text: "CSS", link: "/frontend/basics/css/" },
          { text: "JavaScript", link: "/frontend/basics/javascript/" },
          { text: "TypeScript", link: "/frontend/basics/typescript/" },
        ]
      },
      {
        text: "框架",
        items: [
          { text: "Vue全家桶", link: "/frontend/frameworks/vue/" },
          { text: "React生态", link: "/frontend/frameworks/react/" },
          { text: "Angular实战", link: "/frontend/frameworks/angular/" },
        ]
      },
      {
        text: "构建工具",
        items: [
          { text: "Webpack", link: "/frontend/build-tools/webpack/" },
          { text: "Vite", link: "/frontend/build-tools/vite/" },
          { text: "Rollup", link: "/frontend/build-tools/rollup/" },
        ]
      },
    ],
  },
  {
    text: "工程化",
    items: [
      { text: "项目架构", link: "/engineering/architecture/" },
      { text: "性能优化", link: "/engineering/performance/" },
      { text: "CI/CD", link: "/engineering/ci-cd/" },
      { text: "测试", link: "/engineering/testing/" },
      { text: "代码规范", link: "/engineering/code-standards/" },
    ],
  },
  {
    text: "后端技术",
    items: [
      { text: "Node.js", link: "/backend/nodejs/index" },
      { text: "数据库", link: "/backend/database/" },
      { text: "服务端架构", link: "/backend/architecture/" },
      { text: "API设计", link: "/backend/api-design/" },
    ],
  },
  {
    text: "DevOps",
    items: [
      { text: "Docker", link: "/devops/docker/" },
      { text: "Kubernetes", link: "/devops/kubernetes/" },
      { text: "云服务", link: "/devops/cloud-services/" },
      { text: "监控与日志", link: "/devops/monitoring/" },
    ],
  },
  {
    text: "高级主题",
    items: [
      { text: "设计模式", link: "/advanced/design-patterns/" },
      { text: "算法与数据结构", link: "/advanced/algorithms/" },
      { text: "浏览器原理", link: "/advanced/browser/" },
      { text: "网络协议", link: "/advanced/network/" },
      { text: "安全", link: "/advanced/security/" },
    ],
  },
  {
    text: "资源",
    items: [
      { text: "PDF文档", link: "/resources/pdfs/" },
      { text: "面试题库", link: "/resources/interview/" },
      { text: "工具推荐", link: "/resources/tools/" },
      { text: "学习路线", link: "/resources/learning-path/" },
    ],
  },
  {
    text: "前端面试",
    items: [
      { text: "路线", link: "/front-interview/index" },
      { text: "高频", link: "/front-interview/高频" },
      { text: "qiankun", link: "/front-interview/qiankun" },
      { text: "前端场景", link: "/front-interview/scene" },
      { text: "js", link: "/front-interview/js" },
      { text: "ts", link: "/front-interview/ts" },
      { text: "css", link: "/front-interview/css" },
      { text: "html", link: "/front-interview/html" },
      { text: "vue", link: "/front-interview/vue" },
      { text: "react", link: "/front-interview/react" },
      { text: "webpack", link: "/front-interview/webpack" },
      { text: "vite", link: "/front-interview/vite" },
      
    ],
  },
])
